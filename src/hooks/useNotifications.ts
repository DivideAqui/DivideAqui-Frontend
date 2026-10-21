import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import {
  contarNaoLidas,
  listarNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas,
} from "../services/notificacoes.api";
import type { Notificacao, PaginacaoNotificacoes } from "../types/notificacao";

const PAGE_SIZE = 20;
const INTERVALO_POLLING_MS = 60_000;

export function useNotifications() {
  const { user } = useAuth();
  const token = user?.token;

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [paginacao, setPaginacao] = useState<PaginacaoNotificacoes | null>(null);
  const [naoLidas, setNaoLidas] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState("");
  const [painelAberto, setPainelAberto] = useState(false);

  // Evita setState após unmount (o Nav vive na raiz, mas o polling pode disparar tarde).
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const atualizarContagem = useCallback(async () => {
    if (!token) return;
    try {
      const count = await contarNaoLidas(token);
      if (montado.current) setNaoLidas(count);
    } catch {
      // Silencioso: a contagem é best-effort, não deve quebrar a navbar.
    }
  }, [token]);

  const carregarPagina = useCallback(
    async (pagina: number, append: boolean) => {
      if (!token) return;
      if (append) setCarregandoMais(true);
      else setCarregando(true);
      setErro("");

      try {
        const dados = await listarNotificacoes(token, pagina, PAGE_SIZE);
        if (!montado.current) return;

        setNotificacoes((atuais) =>
          append ? [...atuais, ...dados.notificacoes] : dados.notificacoes,
        );
        setPaginacao(dados.paginacao);
      } catch (e) {
        if (montado.current) {
          setErro(
            e instanceof Error
              ? e.message
              : "Não foi possível carregar suas notificações.",
          );
        }
      } finally {
        if (montado.current) {
          setCarregando(false);
          setCarregandoMais(false);
        }
      }
    },
    [token],
  );

  const carregarMais = useCallback(() => {
    if (!paginacao?.temMais || carregandoMais) return;
    void carregarPagina(paginacao.page + 1, true);
  }, [carregarPagina, paginacao, carregandoMais]);

  const abrirPainel = useCallback(() => {
    setPainelAberto(true);
    void carregarPagina(1, false);
    void atualizarContagem();
  }, [atualizarContagem, carregarPagina]);

  const fecharPainel = useCallback(() => setPainelAberto(false), []);

  const marcarLida = useCallback(
    async (id: number, destino?: string) => {
      if (!token) return;

      // Atualização otimista: a bolinha some na hora, sem esperar o round-trip.
      setNotificacoes((atuais) =>
        atuais.map((n) =>
          n.not_notificacao_id === id
            ? { ...n, not_notificacao_lida: true }
            : n,
        ),
      );
      setNaoLidas((c) => Math.max(0, c - 1));

      try {
        await marcarComoLida(token, id);
      } catch {
        // Reverte se o servidor recusou.
        setNotificacoes((atuais) =>
          atuais.map((n) =>
            n.not_notificacao_id === id
              ? { ...n, not_notificacao_lida: false }
              : n,
          ),
        );
        setNaoLidas((c) => c + 1);
        return;
      }

      if (destino) {
        // Navegação client-side: evita recarregar a SPA inteira.
        window.history.pushState({}, "", destino);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    },
    [token],
  );

  const marcarTodas = useCallback(async () => {
    if (!token || naoLidas === 0) return;
    try {
      await marcarTodasComoLidas(token);
      if (!montado.current) return;
      setNotificacoes((atuais) =>
        atuais.map((n) => ({ ...n, not_notificacao_lida: true })),
      );
      setNaoLidas(0);
    } catch {
      // best-effort
    }
  }, [token, naoLidas]);

  useEffect(() => {
    if (!token) {
      setNotificacoes([]); // eslint-disable-line react-hooks/set-state-in-effect -- reset ao deslogar
      setPaginacao(null);
      setNaoLidas(0);
      return;
    }
    void atualizarContagem();
  }, [token, atualizarContagem]);

  // Polling leve: só quando logado e com o painel fechado.
  useEffect(() => {
    if (!token || painelAberto) return;
    const intervalo = window.setInterval(() => {
      void atualizarContagem();
    }, INTERVALO_POLLING_MS);
    return () => window.clearInterval(intervalo);
  }, [token, painelAberto, atualizarContagem]);

  return {
    notificacoes,
    paginacao,
    naoLidas,
    carregando,
    carregandoMais,
    erro,
    painelAberto,
    abrirPainel,
    fecharPainel,
    carregarMais,
    marcarLida,
    marcarTodas,
    atualizarContagem,
    recarregar: () => void carregarPagina(1, false),
  };
}