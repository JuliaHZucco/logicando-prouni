interface Fatia {
  valor: number;
  correta: boolean;
  classe: string;
  rotulo: string;
}

interface PropsGraficoDeFatias {
  fatias: Fatia[];
}

const centro = 50;
const raio = 46;

function pontoNoCirculo(fracao: number) {
  const angulo = fracao * 2 * Math.PI - Math.PI / 2;
  return { x: centro + raio * Math.cos(angulo), y: centro + raio * Math.sin(angulo) };
}

export default function GraficoDeFatias({ fatias }: PropsGraficoDeFatias) {
  const total = fatias.reduce((soma, fatia) => soma + fatia.valor, 0);
  const fatiasComValor = fatias.filter((fatia) => fatia.valor > 0);
  let acumulado = 0;

  return (
    <svg viewBox="0 0 100 100" className="grafico-fatias" role="img" aria-label="Respostas da sala por alternativa">
      {total === 0 && <circle cx={centro} cy={centro} r={raio} fill="#eef1ee" />}

      {fatiasComValor.length === 1 && (
        <circle
          cx={centro}
          cy={centro}
          r={raio}
          className={`fatia ${fatiasComValor[0].classe}`}
          stroke={fatiasComValor[0].correta ? "#00783c" : "#ffffff"}
          strokeWidth={fatiasComValor[0].correta ? 3 : 1}
        />
      )}

      {fatiasComValor.length > 1 &&
        fatiasComValor.map((fatia) => {
          const inicio = pontoNoCirculo(acumulado / total);
          acumulado += fatia.valor;
          const fim = pontoNoCirculo(acumulado / total);
          const arcoGrande = fatia.valor / total > 0.5 ? 1 : 0;
          const caminho = `M ${centro} ${centro} L ${inicio.x} ${inicio.y} A ${raio} ${raio} 0 ${arcoGrande} 1 ${fim.x} ${fim.y} Z`;
          return (
            <path
              key={fatia.rotulo}
              d={caminho}
              className={`fatia ${fatia.classe}`}
              stroke={fatia.correta ? "#00783c" : "#ffffff"}
              strokeWidth={fatia.correta ? 3 : 1}
              strokeLinejoin="round"
            />
          );
        })}
    </svg>
  );
}
