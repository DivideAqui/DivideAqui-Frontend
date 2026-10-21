import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { Notificacao } from "../types/notificacao";
import { resolverVisual } from "./notificacoes.tipos";
import { FiAlertTriangle, FiBellOff, FiChevronDown, FiX } from "./notificacoes.icones";
import "./../css/NotificationsPanel.css";

type Props = {
  notificacoes: Notificacao[];
  naoLidas: number;
  carregando: boolean;
  carregandoMais: boolean;
  erro: string;
  temMais: boolean;
  onFechar: () => void;
  onCarregarMais: () => void;
  onClicarItem: (n: Notificacao) => void;
  onRecarregar: () => void;
};

function inicioDoDia(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function agruparPorData(notificacoes: Notificacao[]) {
  const hoje = inicioDoDia(new Date());
  const ontem = hoje - 86_400_000;
  const grupos = new Map<number, Notificacao[]>();

  for (const n of notificacoes) {
    const ts = inicioDoDia(new Date(n.not_notificacao_data));
    const lista = grupos.get(ts);
    if (lista) lista.push(n);
    else grupos.set(ts, [n]);
  }

  return [...grupos.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([ts, itens]) => {
      let rotulo: string;
      if (ts === hoje) rotulo = "Hoje";
      else if (ts === ontem) rotulo = "Ontem";
      else
        rotulo = new Date(ts).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        });
      return { ts, rotulo, itens };
    });
}

function MensagemComDestaques({ texto, destaques }: { texto: string; destaques: string[] | null }) {
  if (!destaques?.length) return <>{texto}</>;

  const partes: Array<{ texto: string; forte: boolean }> = [];
  let restante = texto;

  const ordenados = [...destaques]
    .filter((d) => d && restante.includes(d))
    .sort((a, b) => restante.indexOf(a) - restante.indexOf(b));

  for (const d of ordenados) {
    const i = restante.indexOf(d);
    if (i > 0) partes.push({ texto: restante.slice(0, i), forte: false });
    partes.push({ texto: d, forte: true });
    restante = restante.slice(i + d.length);
  }
  if (restante) partes.push({ texto: restante, forte: false });

  return (
    <>
      {partes.map((p, i) =>
        p.forte ? <strong key={i}>{p.texto}</strong> : <span key={i}>{p.texto}</span>,
      )}
    </>
  );
}

export function NotificationsPanel({
  notificacoes,
  naoLidas,
  carregando,
  carregandoMais,
  erro,
  temMais,
  onFechar,
  onCarregarMais,
  onClicarItem,
  onRecarregar,
}: Props) {
  const painelRef = useRef<HTMLDivElement | null>(null);
  const listaRef = useRef<HTMLDivElement | null>(null);

  const temItens = notificacoes.length > 0;
  const grupos = agruparPorData(notificacoes);
  const respeitarReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!painelRef.current) return;

    if (respeitarReducedMotion) {
      gsap.set(painelRef.current, { autoAlpha: 1, x: 0, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        painelRef.current,
        { autoAlpha: 0, y: -10, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: "power3.out" },
      );
      const itens = listaRef.current?.querySelectorAll(".notif-item");
      if (itens?.length) {
        gsap.fromTo(
          itens,
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.22, stagger: 0.04, ease: "power2.out" },
        );
      }
    }, painelRef);

    return () => ctx.revert();
  }, [respeitarReducedMotion, notificacoes.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFechar]);

  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, []);

  return (
    <>
      <div className="notif-overlay" onClick={onFechar} aria-hidden="true" />

      <div
        ref={painelRef}
        className="notif-painel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-titulo"
      >
        <button
          type="button"
          className="notif-fechar"
          onClick={onFechar}
          aria-label="Fechar notificações"
        >
          <FiX />
        </button>

        <header className="notif-header">
          <h2 id="notif-titulo">Notificações</h2>
          {naoLidas > 0 && (
            <span className="notif-badge" aria-live="polite">
              +{naoLidas}
            </span>
          )}
        </header>

        <div className="notif-card">
          <div className="notif-lista" ref={listaRef}>
            {carregando && !temItens && (
              <div className="notif-skeleton" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="notif-skeleton-row">
                    <div className="notif-skeleton-icone" />
                    <div className="notif-skeleton-texto">
                      <span />
                      <span />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!carregando && erro && (
              <div className="notif-vazio">
                <FiAlertTriangle className="notif-vazio-icone erro" />
                <p>{erro}</p>
                <button type="button" className="notif-tentar" onClick={onRecarregar}>
                  Tentar de novo
                </button>
              </div>
            )}

            {!carregando && !erro && !temItens && (
              <div className="notif-vazio">
                <FiBellOff className="notif-vazio-icone" />
                <p>Você está em dia! Nenhuma notificação por aqui.</p>
              </div>
            )}

            {temItens &&
              grupos.map((grupo) => (
                <section key={grupo.ts} className="notif-grupo">
                  <h3 className="notif-grupo-titulo">{grupo.rotulo}</h3>
                  <ul className="notif-grupo-lista">
                    {grupo.itens.map((n, idx) => {
                      const { Icone, cor, corIcone } = resolverVisual(
                        n.not_notificacao_icone ?? n.not_notificacao_tipo,
                      );
                      const hora = new Date(n.not_notificacao_data).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return (
                        <li key={`${n.not_notificacao_id}-${idx}`}>
                          <button
                            type="button"
                            className={`notif-item ${n.not_notificacao_lida ? "lida" : ""}`}
                            onClick={() => onClicarItem(n)}
                            aria-label={n.not_notificacao_mensagem}
                          >
                            <span
                              className="notif-icone"
                              style={{ background: cor, color: corIcone }}
                              aria-hidden="true"
                            >
                              <Icone />
                            </span>

                            <span className="notif-texto">
                              <span className="notif-mensagem">
                                <MensagemComDestaques
                                  texto={n.not_notificacao_mensagem}
                                  destaques={n.not_notificacao_destaques}
                                />
                              </span>
                            </span>

                            <time className="notif-hora" dateTime={n.not_notificacao_data}>
                              {hora}
                            </time>

                            {!n.not_notificacao_lida && <span className="notif-ponto" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}

            {temMais && (
              <button
                type="button"
                className={`notif-mais ${carregandoMais ? "carregando" : ""}`}
                onClick={onCarregarMais}
                disabled={carregandoMais}
                aria-label="Carregar mais notificações"
              >
                <FiChevronDown className="notif-mais-chevron" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}