export function respostaJson(corpo: unknown, status = 200): Response {
  if (status === 204) return new Response(null, { status });
  return new Response(JSON.stringify(corpo), { status });
}
