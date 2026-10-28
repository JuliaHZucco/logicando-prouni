interface PropsAlerta {
  mensagem: string;
  variante?: "danger" | "warning" | "success" | "info";
}

export default function Alerta({ mensagem, variante = "danger" }: PropsAlerta) {
  return (
    <div className={`alert alert-${variante} mb-0`} role="alert">
      {mensagem}
    </div>
  );
}
