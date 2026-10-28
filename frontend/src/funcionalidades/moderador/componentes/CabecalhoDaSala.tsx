interface PropsCabecalhoDaSala {
  codigo: string;
  rodada: number;
  nome?: string;
  etapa?: string;
  className?: string;
}

export default function CabecalhoDaSala({ codigo, rodada, nome, etapa, className = "" }: PropsCabecalhoDaSala) {
  return (
    <div className={`cabecalho-sala ${className}`}>
      {nome && <span className="cabecalho-sala-nome">{nome}</span>}
      <span className="cabecalho-sala-item">
        <small>SALA</small>
        <strong className="cabecalho-sala-codigo">{codigo}</strong>
      </span>
      <span className="cabecalho-sala-item">
        <small>RODADA</small>
        <strong>{rodada}</strong>
      </span>
      {etapa && <span className="cabecalho-sala-etapa">{etapa}</span>}
    </div>
  );
}
