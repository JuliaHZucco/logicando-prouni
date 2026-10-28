interface PropsBarraDaSala {
  codigo: string;
  apelido: string;
}

export default function BarraDaSala({ codigo, apelido }: PropsBarraDaSala) {
  return (
    <header className="sala-barra">
      <div className="sala-barra-esquerda">
        <img src="/logo-feevale.png" alt="Logo da Universidade Feevale" className="sala-barra-logo" />
        <div>
          <div className="sala-barra-rotulo">SALA</div>
          <div className="sala-barra-codigo">{codigo}</div>
        </div>
      </div>
      <div className="sala-barra-direita">
        <span className="sala-barra-inicial">{apelido.charAt(0).toUpperCase()}</span>
        <span className="sala-barra-apelido">{apelido}</span>
      </div>
    </header>
  );
}
