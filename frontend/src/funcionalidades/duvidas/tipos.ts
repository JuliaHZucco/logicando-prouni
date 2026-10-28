export interface ItemDuvida {
  duvidaId: string;
  duvidaPergunta: string;
  duvidaResposta: string;
}

export interface Categoria {
  categoriaId: string;
  categoriaNome: string;
  categoriaDescricao: string;
  categoriaIcone: string;
  categoriaDuvidas: ItemDuvida[];
}
