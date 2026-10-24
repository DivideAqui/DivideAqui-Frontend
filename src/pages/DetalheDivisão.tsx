import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../css/DetalheDivisão.css";
import "../css/Global.css";
import { LoadingScreen } from "../components/LoadingScreen";
import { FaTv, FaCar, FaHome, FaEllipsisH } from "react-icons/fa";

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
  const { user } = useAuth();

  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState<"" | "pagamento" | "convite">("");

  useEffect(() => {
    let ativo = true;

    async function buscarGrupo() {
      setCarregando(true);
      setErro("");

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
        if (ativo) setGrupo(dados);
      } catch (error) {
        if (ativo) {
          setErro(error instanceof Error ? error.message : "Erro ao buscar.");
          setGrupo(null);
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void buscarGrupo();

    return () => {
      ativo = false;
    };
  }, [id, user?.token]);

  const copiar = async (texto: string, tipo: "pagamento" | "convite") => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(tipo);
      setTimeout(() => setCopiado(""), 2000);
    } catch (error) {
      console.error(error);
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

  const linkPagamento = "https://divideaqui.vercel.app";
  const linkConvite = `${window.location.origin}/divisoes`;

  return (
    <>
      <div className="detalheDivisao-bg">
        <div className="card">
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
                <div className="vencimento">Vence em: não informado</div>
              </div>
            </div>

            <div className="comoFunciona">
              <p>
                <strong>Como funciona:</strong>{" "}
                {grupo.gru_descricao?.trim() ||
                  "O líder assina o plano e o valor é dividido igualmente entre os participantes. Cada membro paga sua parte pelo link da plataforma."}
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
                <p className="pg-qrcode"></p>
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
              </div>
              <div className="lkc-right">
                <p className="lkc-text-rigth">
                  Percebeu alguma irregularidade? Relate o problema para a
                  análise.
                </p>
                <button type="button" className="lkc-rlt-problema">
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

            <article className="Historico"></article>
          </div>
        </div>

        <footer className="footer"></footer>
      </div>
    </>
  );
}
