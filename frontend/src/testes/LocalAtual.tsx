import { useLocation } from "react-router-dom";

export default function LocalAtual() {
  const local = useLocation();
  return <div data-testid="local">{local.pathname + local.search}</div>;
}
