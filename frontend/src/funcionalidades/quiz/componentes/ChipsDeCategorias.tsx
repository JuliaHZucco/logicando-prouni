import type { Categoria } from "../../duvidas/tipos";

interface PropsChipsDeCategorias {
  categorias: Categoria[];
  selecionadas: string[];
  aoAlternar: (categoriaId: string) => void;
}

export default function ChipsDeCategorias({ categorias, selecionadas, aoAlternar }: PropsChipsDeCategorias) {
  return (
    <div className="quiz-misto-lista">
      {categorias.map((categoria) => {
        const selecionada = selecionadas.includes(categoria.categoriaId);
        return (
          <button
            type="button"
            key={categoria.categoriaId}
            className={`quiz-misto-chip ${selecionada ? "selecionada" : ""}`}
            onClick={() => aoAlternar(categoria.categoriaId)}
            aria-pressed={selecionada}
          >
            {selecionada && <i className="bi bi-check2 me-1" aria-hidden="true" />}
            {categoria.categoriaNome}
          </button>
        );
      })}
    </div>
  );
}
