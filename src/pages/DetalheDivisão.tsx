import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../css/DetalheDivisão.css";
import "../css/Global.css";
import { LoadingScreen } from "../components/LoadingScreen";
import BtnClose from "../components/btnClose";
import { gerarSenhaGrupo } from "../utils/senhaConvite";
import Swal from "sweetalert2";
import "../css/sweetAlert/sweetAlert.css";
import {
  FaTv,
  FaCar,
  FaHome,
  FaEllipsisH,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import QRCode from "react-qr-code";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://divide-aqui-backend.vercel.app"
).replace(/\/$/, "");

type Usuario = {
  usu_id: number | string;
  usu_nome: string;
  usu_foto?: string | null;
};

type Grupo = {
  gru_id: number;
  gru_nome?: string | null;
  gru_descricao?: string | null;
  gru_icone?: string | null;
  gru_cor?: string | null;
  gru_visibilidade?: boolean | null;
  gru_criador_id?: number | null;
  gru_criador_nome?: string | null;
  criador?: Usuario | null;
  categoria?: { cat_nome: string } | null;
  mensalidade?: { men_valor?: string | number | null } | null;
  stream?: { str_valor?: string | number | null } | null;
  item?: Array<{ ite_valor: string | number }>;
  participacoes?: Array<{
    usu_id: number | string;
    usuario?: Usuario | null;
  }>;
};

type SolicitacaoParticipacao = {
  sol_id: number;
  status: string;
  usuario: {
    usu_id: string;
    usu_nome: string;
    usu_foto?: string | null;
  };
};

const formatarBRL = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

const obterIcone = (nomeCategoria?: string | null, icone?: string | null) => {
  const valor = `${icone ?? ""} ${nomeCategoria ?? ""}`.toLowerCase();

  if (valor.includes("stream")) return <FaTv />;
  if (valor.includes("viag")) return <FaCar />;
  if (
    valor.includes("desp") ||
    valor.includes("domest") ||
    valor.includes("custo")
  ) {
    return <FaHome />;
  }
  return <FaEllipsisH />;
};

export function DetalheDivisão() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState<
    "" | "pagamento" | "convite" | "senha"
  >("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoParticipacao[]>(
    [],
  );
  const [, setSolicitacoesCarregando] = useState(false);

  const buscarGrupo = useCallback(
    async (silencioso = false) => {
      if (!silencioso) {
        setCarregando(true);
        setErro("");
      }

      try {
        const resposta = await fetch(`${API_BASE_URL}/grupos/${id}`, {
          headers: user?.token
            ? { Authorization: `Bearer ${user.token}` }
            : undefined,
        });

        if (!resposta.ok) {
          throw new Error(`Erro ${resposta.status} ao buscar a divisão.`);
        }

        const dados: Grupo = await resposta.json();
        setGrupo(dados);
      } catch (error) {
        if (!silencioso) {
          setErro(error instanceof Error ? error.message : "Erro ao buscar.");
          setGrupo(null);
        }
      } finally {
        if (!silencioso) setCarregando(false);
      }
    },
    [id, user?.token],
  );

  useEffect(() => {
    void buscarGrupo();
  }, [buscarGrupo]);

  const souLider =
    grupo != null &&
    String(grupo.criador?.usu_id ?? grupo.gru_criador_id ?? "") ===
      String(user?.dbId ?? user?.id ?? "");

  useEffect(() => {
    if (!grupo || !id || !souLider || grupo.gru_visibilidade !== false) {
      setSolicitacoes([]);
      return;
    }

    let ativo = true;
    setSolicitacoesCarregando(true);

    async function carregarSolicitacoes() {
      try {
        const resposta = await fetch(
          `${API_BASE_URL}/grupos/${id}/solicitacoes`,
          {
            headers: user?.token
              ? { Authorization: `Bearer ${user.token}` }
              : undefined,
          },
        );

        if (!resposta.ok) return;

        const dados = await resposta.json();
        if (ativo) setSolicitacoes(dados.solicitacoes ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        if (ativo) setSolicitacoesCarregando(false);
      }
    }

    void carregarSolicitacoes();

    return () => {
      ativo = false;
    };
  }, [grupo?.gru_id, grupo?.gru_visibilidade, souLider, id, user?.token]);

  const responderSolicitacao = async (
    solId: number,
    acao: "aprovar" | "rejeitar",
  ) => {
    try {
      const resposta = await fetch(
        `${API_BASE_URL}/grupos/${id}/solicitacoes/${solId}/${acao}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
          },
        },
      );

      const data = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(data.erro || "Erro ao responder a solicitação.");
      }

      Swal.fire({
        title:
          acao === "aprovar"
            ? "Participante adicionado!"
            : "Solicitação recusada",
        text: data.mensagem || "",
        icon: acao === "aprovar" ? "success" : "info",
        confirmButtonText: "OK",
        customClass: {
          icon: "meu-icone-verde",
          confirmButton: "meu-botao-verde",
        },
      });

      setSolicitacoes((lista) => lista.filter((s) => s.sol_id !== solId));
      void buscarGrupo(true);
    } catch (error) {
      Swal.fire({
        title: "Erro",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível responder a solicitação.",
        icon: "error",
        confirmButtonText: "Entendi",
        customClass: {
          icon: "meu-icone-verde",
          confirmButton: "meu-botao-verde",
        },
      });
    }
  };

  const copiar = async (
    texto: string,
    tipo: "pagamento" | "convite" | "senha",
  ) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(tipo);
      setTimeout(() => setCopiado(""), 2000);
    } catch (error) {
      console.error(error);
    }
  };

  const relatarProblema = async () => {
    const result = await Swal.fire({
      title: "Relatar problema",
      input: "textarea",
      inputLabel: "Descreva a irregularidade encontrada",
      inputPlaceholder: "Conte o que aconteceu...",
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
      customClass: {
        confirmButton: "btn-salvar",
        cancelButton: "btn-cancelar",
      },
      showLoaderOnConfirm: true,
      inputValidator: (valor) => {
        const v = valor?.trim() ?? "";
        if (!v) return "Você precisa descrever o problema.";
        if (v.length < 10)
          return "Descreva o problema com pelo menos 10 caracteres.";
        return null;
      },
      preConfirm: async (valor) => {
        // Sem endpoint no backend por enquanto: apenas confirma o relato.
        console.log("Relato de problema:", valor.trim());
        return valor.trim();
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result.isConfirmed) {
      Swal.fire({
        icon: "success",
        title: "Problema relatado!",
        text: "Recebemos o seu relato e ele será analisado pela nossa equipe.",
        timer: 1800,
        showConfirmButton: false,
      });
    }
  };

  if (carregando) {
    return <LoadingScreen forcar />;
  }

  if (erro || !grupo) {
    return (
      <div className="detalheDivisao-bg">
        <p role="alert">{erro || "Divisão não encontrada."}</p>
      </div>
    );
  }

  const participantes = (grupo.participacoes ?? []).map((p) => ({
    id: p.usuario?.usu_id ?? p.usu_id,
    nome: p.usuario?.usu_nome || `Usuário ${p.usu_id}`,
    foto: p.usuario?.usu_foto,
  }));

  const valorItens = (grupo.item ?? []).reduce(
    (total, item) => total + Number(item.ite_valor || 0),
    0,
  );

  const valorTotal =
    grupo.stream?.str_valor != null
      ? Number(grupo.stream.str_valor)
      : grupo.mensalidade?.men_valor != null
        ? Number(grupo.mensalidade.men_valor)
        : valorItens;

  const ehStreaming = (grupo.categoria?.cat_nome ?? "")
    .toLowerCase()
    .includes("stream");

  const valorPorPessoa =
    ehStreaming && participantes.length > 0
      ? valorTotal / participantes.length
      : valorTotal;

  const nomeGrupo =
    grupo.gru_nome?.trim() ||
    `${grupo.categoria?.cat_nome || "Divisão"} ${grupo.gru_id}`;

  const idLider = grupo.criador?.usu_id ?? grupo.gru_criador_id;

  const nomeLider =
    grupo.criador?.usu_nome || grupo.gru_criador_nome || "Criador da divisão";

  const SITE_URL = "https://divide-aqui.vercel.app";
  const linkPagamento = SITE_URL;
  const linkConvite = `${SITE_URL}/convite/${grupo.gru_id}`;

  const textoComoFunciona = ehStreaming
    ? "Grupo criado para dividir os gastos de uma assinatura de streaming. Vamos compartilhar o valor da mensalidade entre os participantes, e cada um ficará responsável por pagar sua parte dentro do prazo combinado. O objetivo é manter os pagamentos organizados para que todos possam aproveitar o serviço sem que o custo fique pesado para uma única pessoa. Caso haja alteração no valor da assinatura, vamos combinar como ficará a divisão para que tudo seja justo para todos!"
    : "Grupo criado para dividir os gastos de uma assinatura. Vamos compartilhar o valor da mensalidade entre os participantes, e cada um ficará responsável por pagar sua parte dentro do prazo combinado. O objetivo é manter os pagamentos organizados para que todos possam aproveitar o serviço sem que o custo fique pesado para uma única pessoa. Caso haja alteração no valor da assinatura, vamos combinar como ficará a divisão para que tudo seja justo para todos!";

  return (
    <>
      <div className="detalheDivisao-bg">
        <div className="card">
          <BtnClose onClick={() => navigate("/historico")} />
          <div className="header"></div>

          <div className="content">
            <div className="topoCard">
              <div
                className="iconApp"
                style={{ backgroundColor: grupo.gru_cor || undefined }}
              >
                {obterIcone(grupo.categoria?.cat_nome, grupo.gru_icone)}
              </div>

              <div className="tituloBloco">
                <h1 className="titulo">{nomeGrupo}</h1>
                <p className="subtitulo">
                  Divisão criada por{" "}
                  {idLider != null ? (
                    <Link
                      to={`/perfilparticipante/${idLider}`}
                      title={`${nomeLider} - Clique para ver o perfil`}
                    >
                      {nomeLider}
                    </Link>
                  ) : (
                    <span>{nomeLider}</span>
                  )}
                </p>
              </div>

              <div className="infoValor">
                <div className="valor">{formatarBRL(valorPorPessoa)}</div>
                <div className="vencimento">Vencimento não informado</div>
              </div>
            </div>

            <div className="comoFunciona">
              <p>
                <strong>Como funciona:</strong> {textoComoFunciona}
              </p>
            </div>

            {/* pagamento */}
            <div className="pagamento">
              <div className="pagamento-left">
                <div className="pagamento-heard">
                  <div className="pagamento-titulo-box">
                    <h3 className="pagamento-titulo">Link do pagamento</h3>
                    <span className="pagamento-status">Disponível</span>
                  </div>
                  <p className="pagamento-subtitulo">
                    Ao efetuar o pagamento, o líder será notificado.
                  </p>
                </div>
                <div className="pg-input-copiar">
                  <div className="pg-input-incon">
                    <span className="pg-icon">🔗</span>
                    <input
                      type="text"
                      value={linkPagamento}
                      readOnly
                      className="input-link"
                    />
                  </div>
                  <button
                    type="button"
                    className="pg-btn-copiar"
                    onClick={() => copiar(linkPagamento, "pagamento")}
                  >
                    {copiado === "pagamento" ? "Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>
              <div className="pagamento-right">
                <span className="texto-qr-code">Escaneie o QR Code</span>
                <div className="pg-qrcode">
                  <QRCode
                    value={linkPagamento}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              </div>
            </div>

            {/* link convidado */}
            <div className="lk-convidado">
              <div className="lkc-left">
                <div className="lkc-heard">
                  <div className="lkc-titulo-box">
                    <h3 className="lkc-titulo">Compartilhar grupo</h3>
                  </div>
                  <p className="lkc-subtitulo">
                    Convide pessoas para participar da divisão através do link.
                  </p>
                </div>
                <div className="lkc-input-copiar">
                  <div className="lkc-input-incon">
                    <span className="lkc-icon">🔗</span>
                    <input
                      type="text"
                      value={linkConvite}
                      readOnly
                      className="input-link"
                    />
                  </div>
                  <button
                    type="button"
                    className="lkc-btn-copiar"
                    onClick={() => copiar(linkConvite, "convite")}
                  >
                    {copiado === "convite" ? "Copiado!" : "Copiar"}
                  </button>
                </div>
                {grupo.gru_visibilidade === false && (
                  <div className="lkc-senha">
                    <p className="lkc-senha-titulo">
                      🔒 Grupo privado — senha de convite
                    </p>
                    <div className="lkc-senha-linha">
                      <code className="lkc-senha-codigo">
                        {mostrarSenha
                          ? gerarSenhaGrupo(grupo.gru_id)
                          : "••••-••••"}
                      </code>
                      <div className="lkc-senha-acoes">
                        <button
                          type="button"
                          className="lkc-senha-olho"
                          title={
                            mostrarSenha ? "Esconder senha" : "Mostrar senha"
                          }
                          aria-label={
                            mostrarSenha
                              ? "Esconder senha de convite"
                              : "Mostrar senha de convite"
                          }
                          aria-pressed={mostrarSenha}
                          onClick={() => setMostrarSenha((mostra) => !mostra)}
                        >
                          {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        <button
                          type="button"
                          className="lkc-btn-copiar lkc-btn-copiar-senha"
                          onClick={() =>
                            copiar(gerarSenhaGrupo(grupo.gru_id), "senha")
                          }
                        >
                          {copiado === "senha" ? "Copiado!" : "Copiar"}
                        </button>
                      </div>
                    </div>
                    <p className="lkc-senha-ajuda">
                      Quem abrir o link do convite precisa digitar esta senha
                      para entrar. Compartilhe apenas com quem vai participar.
                    </p>
                  </div>
                )}
              </div>
              <div className="lkc-right">
                <p className="lkc-text-rigth">
                  Percebeu alguma irregularidade? Relate o problema para a
                  análise.
                </p>
                <button
                  type="button"
                  className="lkc-rlt-problema"
                  onClick={relatarProblema}
                >
                  Relatar Problema
                </button>
              </div>
            </div>

            <div className="Participantes">
              <div className="Part-cabecalho">
                <h3>Participantes</h3>
                <h3>Pagamento</h3>
                <h3>Status</h3>
              </div>

              {participantes.map((p) => (
                <div key={p.id} className="Part-linha">
                  <div className="Part-user">
                    <div className="Part-avatar">
                      {p.foto && (
                        <img
                          src={p.foto}
                          alt={p.nome}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </div>
                    <div className="Part-user-info">
                      <strong>{p.nome}</strong>
                      <small>
                        {String(p.id) === String(grupo.criador?.usu_id ?? "")
                          ? "Líder"
                          : "Participante"}
                      </small>
                    </div>
                  </div>

                  <span className="Part-valor">
                    {formatarBRL(valorPorPessoa)}
                  </span>

                  <span className="Part-status pendente">Pendente</span>
                </div>
              ))}
            </div>

            {souLider &&
              grupo.gru_visibilidade === false &&
              solicitacoes.length > 0 && (
                <div className="Participantes Part-solicitacoes">
                  <div className="Part-cabecalho">
                    <h3>
                      Solicitações de participação ({solicitacoes.length})
                    </h3>
                  </div>

                  {solicitacoes.map((s) => (
                    <div key={s.sol_id} className="Part-linha Part-solicitacao">
                      <div className="Part-user">
                        <div className="Part-avatar">
                          {s.usuario.usu_foto && (
                            <img
                              src={s.usuario.usu_foto}
                              alt={s.usuario.usu_nome}
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </div>
                        <div className="Part-user-info">
                          <strong>{s.usuario.usu_nome}</strong>
                          <small>Quer participar da divisão</small>
                        </div>
                      </div>

                      <div className="Part-solicitacao-acoes">
                        <button
                          type="button"
                          className="Part-btn-aceitar"
                          onClick={() =>
                            responderSolicitacao(s.sol_id, "aprovar")
                          }
                        >
                          Aceitar
                        </button>
                        <button
                          type="button"
                          className="Part-btn-recusar"
                          onClick={() =>
                            responderSolicitacao(s.sol_id, "rejeitar")
                          }
                        >
                          Recusar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            <article className="Historico"></article>
          </div>
        </div>

        <footer className="footer"></footer>
      </div>
    </>
  );
}
