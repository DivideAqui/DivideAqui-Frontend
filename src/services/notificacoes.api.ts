import type { PaginaNotificacoes } from "../types/notificacao";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3344").replace(/\/$/, "");

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function listarNotificacoes(
  token: string,
  page = 1,
  limit = 20,
): Promise<PaginaNotificacoes> {
  const resposta = await fetch(`${API_URL}/notificacoes?page=${page}&limit=${limit}`, {
    headers: authHeaders(token),
  });

  if (!resposta.ok) {
    const detalhes = await resposta.text();
    throw new Error(`Erro ${resposta.status}: ${detalhes}`);
  }

  return resposta.json();
}

export async function contarNaoLidas(token: string): Promise<number> {
  const resposta = await fetch(`${API_URL}/notificacoes/nao-lidas`, {
    headers: authHeaders(token),
  });

  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status} ao contar não lidas.`);
  }

  const dados = (await resposta.json()) as { count: number };
  return dados.count;
}

export async function marcarComoLida(token: string, id: number): Promise<void> {
  const resposta = await fetch(`${API_URL}/notificacoes/${id}/lida`, {
    method: "PATCH",
    headers: authHeaders(token),
  });

  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status} ao marcar como lida.`);
  }
}

export async function marcarTodasComoLidas(token: string): Promise<number> {
  const resposta = await fetch(`${API_URL}/notificacoes/marcar-todas`, {
    method: "PATCH",
    headers: authHeaders(token),
  });

  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status} ao marcar todas como lidas.`);
  }

  const dados = (await resposta.json()) as { atualizadas: number };
  return dados.atualizadas;
}