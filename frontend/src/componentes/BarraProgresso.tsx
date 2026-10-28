interface PropsBarraProgresso {
  progressoValorAtual: number;
  progressoValorTotal: number;
}

export default function BarraProgresso({
  progressoValorAtual,
  progressoValorTotal,
}: PropsBarraProgresso) {
  const progressoPercentual =
    progressoValorTotal > 0 ? Math.round((progressoValorAtual / progressoValorTotal) * 100) : 0;
  return (
    <div
      className="progress barra-progresso-logi"
      role="progressbar"
      aria-valuenow={progressoValorAtual}
      aria-valuemin={0}
      aria-valuemax={progressoValorTotal}
      aria-label={`${progressoValorAtual} de ${progressoValorTotal} vistas`}
    >
      <div
        className="progress-bar barra-progresso-logi-preenchimento"
        style={{ width: `${progressoPercentual}%` }}
      />
    </div>
  );
}
