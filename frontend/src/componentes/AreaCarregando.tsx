interface PropsAreaCarregando {
  mensagem?: string;
}

export default function AreaCarregando({ mensagem = "Carregando..." }: PropsAreaCarregando) {
  return (
    <div className="area-carregando" role="status">
      <span className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{mensagem}</span>
    </div>
  );
}
