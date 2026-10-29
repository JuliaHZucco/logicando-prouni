$ErrorActionPreference = 'Stop'

function Find-Psql {
    $fromPath = Get-Command 'psql' -ErrorAction SilentlyContinue
    if ($fromPath) {
        return $fromPath.Source
    }

    $standardPaths = @(
        'C:\Program Files\PostgreSQL\*\bin\psql.exe',
        'C:\Program Files (x86)\PostgreSQL\*\bin\psql.exe'
    )
    $found = @()
    foreach ($path in $standardPaths) {
        $found += Get-Item $path -ErrorAction SilentlyContinue
    }
    $found = $found | Sort-Object FullName -Descending | Select-Object -First 1

    if ($found) {
        return $found.FullName
    }

    throw "O psql.exe não foi encontrado. Instale o PostgreSQL."
}

function Test-CommandExists([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "O comando '$Name' não foi encontrado."
    }
}

function Invoke-Psql([string[]]$Arguments) {
    & $PsqlPath @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "O comando psql falhou."
    }
}

function Ensure-Database([string]$Name) {
    $exists = "$(& $PsqlPath -h $PgHost -p $PgPort -U $PgUser -d postgres -tAc `"SELECT 1 FROM pg_database WHERE datname = '$Name'`")".Trim()
    if ($LASTEXITCODE -ne 0) {
        throw "Não foi possível consultar os bancos do PostgreSQL."
    }

    if ($exists -ne '1') {
        Write-Host "Criando o banco '$Name'..."
        Invoke-Psql @('-h', $PgHost, '-p', $PgPort, '-U', $PgUser, '-d', 'postgres', '-c', "CREATE DATABASE `"$Name`";")
    }
    else {
        Write-Host "O banco '$Name' já existe."
    }
}

function Write-AppSettings([string]$ExamplePath, [string]$OutputPath, [string]$Database, [string]$JwtKey) {
    $settings = Get-Content $ExamplePath -Raw | ConvertFrom-Json
    $settings.ConnectionStrings.QuizProuni = "Host=$PgHost;Port=$PgPort;Database=$Database;Username=$PgUser;Password=$PgPassword"
    $settings.Jwt.Chave = $JwtKey
    $settings | ConvertTo-Json -Depth 10 | Set-Content $OutputPath -Encoding utf8
}

$PsqlPath = Find-Psql
Test-CommandExists 'dotnet'

$PgHost = Read-Host 'Host do PostgreSQL [localhost]'
if ([string]::IsNullOrWhiteSpace($PgHost)) { $PgHost = 'localhost' }

$PgPort = Read-Host 'Porta do PostgreSQL [5432]'
if ([string]::IsNullOrWhiteSpace($PgPort)) { $PgPort = '5432' }

$PgUser = Read-Host 'Usuário do PostgreSQL [postgres]'
if ([string]::IsNullOrWhiteSpace($PgUser)) { $PgUser = 'postgres' }

$PgPassword = Read-Host 'Senha do PostgreSQL'
if ([string]::IsNullOrWhiteSpace($PgPassword)) {
    throw 'A senha do PostgreSQL é obrigatória.'
}

$JwtKey = Read-Host 'Chave JWT [gerar automaticamente]'
if ([string]::IsNullOrWhiteSpace($JwtKey)) {
    $JwtKey = "chave-local-$([Guid]::NewGuid().ToString('N'))-$([Guid]::NewGuid().ToString('N'))"
}
if ($JwtKey.Length -lt 32) {
    throw 'A chave JWT precisa ter pelo menos 32 caracteres.'
}

$env:PGPASSWORD = $PgPassword
try {
    Ensure-Database 'quiz_prouni'
    Ensure-Database 'quiz_prouni_teste'

    Write-AppSettings `
        (Join-Path $PSScriptRoot 'backend\QuizProuni.Api\appsettings.Development.example.json') `
        (Join-Path $PSScriptRoot 'backend\QuizProuni.Api\appsettings.Development.json') `
        'quiz_prouni' `
        $JwtKey

    Write-AppSettings `
        (Join-Path $PSScriptRoot 'backend\QuizProuni.Testes\appsettings.Teste.example.json') `
        (Join-Path $PSScriptRoot 'backend\QuizProuni.Testes\appsettings.Teste.json') `
        'quiz_prouni_teste' `
        $JwtKey

    Write-Host 'Restaurando a ferramenta dotnet-ef...'
    & dotnet tool restore
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível restaurar a ferramenta dotnet-ef.' }

    Write-Host 'Criando as tabelas e carregando as perguntas...'
    & dotnet ef database update --project backend/QuizProuni.Api
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível aplicar as migrations.' }

    Write-Host ''
    Write-Host 'Configuração concluída. Agora cadastre um moderador com:'
    Write-Host 'dotnet run --project backend/QuizProuni.Api -- criar-moderador <email> <senha>'
}
finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
