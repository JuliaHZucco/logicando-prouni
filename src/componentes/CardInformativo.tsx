import { useId } from "react";

interface PropsCardInformativo {
  cardTitulo: string;
  cardTexto: string;
  cardIcone: string;
}

export default function CardInformativo({
  cardTitulo,
  cardTexto,
  cardIcone,
}: PropsCardInformativo) {
  const cardTituloId = useId();

  return (
    <section className="card-base card-logicando" aria-labelledby={cardTituloId}>
      <div className="card-logicando-cabecalho">
        <span className="card-logicando-icone" aria-hidden="true">
            <i className={`bi ${cardIcone}`} />
        </span>
        <h2 id={cardTituloId} className="card-logicando-titulo mb-0">
          {cardTitulo}
        </h2>
      </div>
      <p className="card-logicando-texto mb-0">{cardTexto}</p>
    </section>
  );
}