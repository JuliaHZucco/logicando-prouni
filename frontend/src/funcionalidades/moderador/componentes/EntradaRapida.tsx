import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface PropsEntradaRapida {
  codigo: string;
}

type SituacaoDaCopia = "parado" | "copiado" | "falhou";

const TEMPO_DO_AVISO_EM_MS = 2500;

export default function EntradaRapida({ codigo }: PropsEntradaRapida) {
  const endereco = `${window.location.origin}/sala/${codigo}`;
  const enderecoCurto = `${window.location.host}/sala/${codigo}`;
  const [situacao, setSituacao] = useState<SituacaoDaCopia>("parado");
  const temporizador = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(endereco);
      setSituacao("copiado");
    } catch {
      setSituacao("falhou");
    }
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => setSituacao("parado"), TEMPO_DO_AVISO_EM_MS);
  };

  return (
    <div className="entrada-rapida">
      <div className="sala-rotulo mb-0">ENTRAR PELO CELULAR</div>

      <div className="entrada-rapida-qr">
        <QRCodeSVG
          value={endereco}
          size={320}
          level="M"
          marginSize={0}
          fgColor="#123524"
          bgColor="#ffffff"
          title={`QR code para entrar na sala ${codigo}`}
        />
      </div>

      <p className="sala-texto mb-0">Aponte a câmera para o QR code ou abra o endereço abaixo.</p>
      <div className="entrada-rapida-endereco">{enderecoCurto}</div>
      <button type="button" className="quiz-botao-secundario botao-compacto" onClick={copiar}>
        <i className={`bi ${situacao === "copiado" ? "bi-check2" : "bi-clipboard"} me-1`} aria-hidden="true" />
        Copiar link
      </button>
      <small className="entrada-rapida-aviso" role="status">
        {situacao === "copiado" && "Link copiado!"}
        {situacao === "falhou" && "Não foi possível copiar. Selecione o endereço e copie à mão."}
      </small>
    </div>
  );
}
