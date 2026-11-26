const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3344").replace(/\/$/, "");

type SolicitacaoPendente = {
  sol_id: number;
  status: string;
  usuario: {
    usu_id: string;
    usu_nome: string;
    usu_foto?: string | null;
  };
};

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Responde (aprova/rejeita) a solicitação de participação apontada por uma
 * notificação. A notificação não guarda o id da solicitação, então buscamos
 * as pendentes do grupo e casamos pelo nome do solicitante.
 */
export async function responderSolicitacao(
  token: string,
  gruId: number,
  nomeSolicitante: string | null | undefined,
  acao: "aprovar" | "rejeitar",
): Promise<{ ok: boolean; mensagem: string }> {
  const respostaPendentes = await fetch(`${API_URL}/grupos/${gruId}/solicitacoes`, {
    headers: authHeaders(token),
  });

  if (!respostaPendentes.ok) {
    const corpo = await respostaPendentes.json().catch(() => ({}));
    return {
      ok: false,
      mensagem:
        corpo.erro || `Não foi possível carregar as solicitações (erro ${respostaPendentes.status}).`,
    };
  }

  const dados = await respostaPendentes.json().catch(() => ({}));
  const pendentes: SolicitacaoPendente[] = dados.solicitacoes ?? [];

  const nome = nomeSolicitante?.trim();
  const alvo =
    (nome ? pendentes.find((s) => s.usuario?.usu_nome === nome) : undefined) ??
    (pendentes.length === 1 ? pendentes[0] : undefined);

  if (!alvo) {
    return { ok: false, mensagem: "Solicitação não encontrada ou já foi respondida." };
  }

  const resposta = await fetch(
    `${API_URL}/grupos/${gruId}/solicitacoes/${alvo.sol_id}/${acao}`,
    {
      method: "POST",
      headers: authHeaders(token),
    },
  );

  const corpo = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    return {
      ok: false,
      mensagem: corpo.erro || `Erro ao responder à solicitação (${resposta.status}).`,
    };
  }

  return {
    ok: true,
    mensagem:
      corpo.mensagem ||
      (acao === "aprovar" ? "Solicitação aprovada!" : "Solicitação recusada."),
  };
}
