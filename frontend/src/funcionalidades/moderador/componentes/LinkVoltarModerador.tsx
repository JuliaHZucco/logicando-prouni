import { Link } from "react-router-dom";

interface PropsLinkVoltarModerador {
  para: string;
  texto: string;
}

export default function LinkVoltarModerador({ para, texto }: PropsLinkVoltarModerador) {
  return (
    <Link to={para} className="voltar-moderador">
      <i className="bi bi-arrow-left" aria-hidden="true" />
      {texto}
    </Link>
  );
}
