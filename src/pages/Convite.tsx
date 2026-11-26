import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { FaTv, FaCar, FaHome, FaEllipsisH } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { useCpfUsuario } from "../hooks/useCpfUsuario";
import { LoadingScreen } from "../components/LoadingScreen";
import { validarSenhaGrupo } from "../utils/senhaConvite";
import "../css/sweetAlert/sweetAlert.css";
import "../css/convite.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://divide-aqui-backend.vercel.app"
).replace(/\/$/, "");

const CHAVE_CONVITE_PENDENTE = "convite-pendente";

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

export function Convite() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { garantirCpf } = useCpfUsuario(user);

  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [params] = useSearchParams();
  const [senha, setSenha] = useState(params.get("senha") ?? "");
  const [erroSenha, setErroSenha] = useState(false);
  const [statusSolicitacao, setStatusSolicitacao] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setErro("Convite inválido ou incompleto.");
      setCarregando(false);
      return;
    }

    let ativo = true;

    async function buscarGrupo() {
      setCarregando(true);
      setErro("");

      try {
        const token = user?.token || localStorage.getItem("token");
        const resposta = await fetch(`${API_BASE_URL}/grupos/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!ativo) return;

        if (!resposta.ok) {
          throw new Error("Divisão não encontrada.");
        }

        const dados: Grupo = await resposta.json();
        if (ativo) setGrupo(dados);

        // Logado: verifica se já existe solicitação para este grupo privado.
        if (ativo && token && user?.token) {
          const respostaSolicitacao = await fetch(
            `${API_BASE_URL}/grupos/${id}/solicitacoes/minha`,
            { headers: { Authorization: `Bearer ${user.token}` } },
          );
          if (respostaSolicitacao.ok) {
            const dadosSolicitacao = await respostaSolicitacao.json();
            if (ativo && dadosSolicitacao?.status) {
              setStatusSolicitacao(dadosSolicitacao.status);
            }
          }
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar o convite.",
          );
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

  if (carregando) {
    return <LoadingScreen forcar />;
  }

  if (erro || !grupo) {
    return (
      <main className="convite-page">
        <div className="convite-card convite-card-erro">
          <div className="convite-badge convite-badge-erro">Convite</div>
          <h1 className="convite-erro-titulo">Ops! Convite indisponível</h1>
          <p className="convite-erro-texto">
            {erro || "Este convite aponta para uma divisão que não existe mais."}
          </p>
          <button
            type="button"
            className="convite-botao"
            onClick={() => navigate("/divisoes")}
          >
            Ver outras divisões
          </button>
        </div>
      </main>
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

  const nomeLider =
    grupo.criador?.usu_nome || grupo.gru_criador_nome || "o líder";

  const meuId = user?.dbId ?? user?.id;
  const jaParticipa = participantes.some(
    (p) => meuId != null && String(p.id) === String(meuId),
  );

  const irParaLogin = () => {
    sessionStorage.setItem(CHAVE_CONVITE_PENDENTE, String(grupo.gru_id));
    navigate("/login");
  };

  const participar = async () => {
    if (entrando) return;

    if (!isAuthenticated) {
      irParaLogin();
      return;
    }

    // Grupo privado exige a senha de convite que só o líder compartilha.
    const grupoPrivado = grupo.gru_visibilidade === false;
    if (grupoPrivado && !validarSenhaGrupo(senha, grupo.gru_id)) {
      setErroSenha(true);
      return;
    }

    setEntrando(true);
    setErroSenha(false);

    try {
      const cpfOk = await garantirCpf();
      if (!cpfOk) return;

      const token = user?.token || localStorage.getItem("token");
      const resposta = await fetch(
        `${API_BASE_URL}/grupos/${grupo.gru_id}/participar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          // Em grupos privados o backend valida a senha de convite.
          body: JSON.stringify({ senha }),
        },
      );

      const data = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(
          data.erro || data.message || "Não foi possível entrar na divisão.",
        );
      }

      await Swal.fire({
        title: "Parabéns!",
        text: data.mensagem || "Você entrou na divisão com sucesso!",
        icon: "success",
        confirmButtonText: "Ver divisão",
        customClass: {
          icon: "meu-icone-verde",
          confirmButton: "meu-botao-verde",
        },
      });

      navigate(`/detalhedivisao/${grupo.gru_id}`);
    } catch (error) {
      Swal.fire({
        title: "Erro",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível entrar na divisão. Tente novamente.",
        icon: "error",
        confirmButtonText: "Entendi",
        customClass: {
          icon: "meu-icone-verde",
          confirmButton: "meu-botao-verde",
        },
      });
    } finally {
      setEntrando(false);
    }
  };

  const solicitarParticipacao = async () => {
    if (entrando || statusSolicitacao === "PENDENTE") return;

    if (!isAuthenticated) {
      irParaLogin();
      return;
    }

    setEntrando(true);

    try {
      const cpfOk = await garantirCpf();
      if (!cpfOk) return;

      const token = user?.token || localStorage.getItem("token");
      const resposta = await fetch(
        `${API_BASE_URL}/grupos/${grupo.gru_id}/solicitacoes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      const data = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(
          data.erro || data.message || "Não foi possível enviar a solicitação.",
        );
      }

      setStatusSolicitacao(data.status || "PENDENTE");

      await Swal.fire({
        title: "Solicitação enviada!",
        text:
          data.mensagem ||
          "O líder vai analisar seu pedido e você receberá uma notificação quando ele responder.",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          icon: "meu-icone-verde",
          confirmButton: "meu-botao-verde",
        },
      });
    } catch (error) {
      Swal.fire({
        title: "Erro",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar a solicitação. Tente novamente.",
        icon: "error",
        confirmButtonText: "Entendi",
        customClass: {
          icon: "meu-icone-verde",
          confirmButton: "meu-botao-verde",
        },
      });
    } finally {
      setEntrando(false);
    }
  };

  return (
    <main className="convite-page">
      <div className="convite-card">
        {jaParticipa ? (
          <div className="convite-badge convite-badge-verde">
            Você já está aqui
          </div>
        ) : (
          <div className="convite-badge">Convite de divisão</div>
        )}

        <div className="convite-topo">
          <div
            className="convite-icone"
            style={{ backgroundColor: grupo.gru_cor || "#1861ff" }}
          >
            {obterIcone(grupo.categoria?.cat_nome, grupo.gru_icone)}
          </div>

          <div className="convite-info">
            <h1>{nomeGrupo}</h1>
            <p>
              Divisão criada por <strong>{nomeLider}</strong>
            </p>
          </div>
        </div>

        <p className="convite-descricao">
          {grupo.gru_descricao?.trim() ||
            "O líder assina o plano e o valor é dividido igualmente entre os participantes."}
        </p>

        <div className="convite-participantes">
          <div className="convite-participantes-avatars">
            {participantes.slice(0, 5).map((p, indice) => (
              <div className="convite-avatar" key={p.id}>
                {p.foto ? (
                  <img src={p.foto} alt={p.nome} />
                ) : (
                  <span>{p.nome.charAt(0).toUpperCase()}</span>
                )}
                <i
                  className="convite-avatar-moldura"
                  style={{ zIndex: participantes.length - indice }}
                />
              </div>
            ))}
          </div>
          <div className="convite-participantes-texto">
            {participantes.length === 1
              ? "1 participante"
              : `${participantes.length} participantes`}
          </div>
        </div>

        <div className="convite-valor">
          <strong>{formatarBRL(valorPorPessoa)}</strong>
          <span>por pessoa {ehStreaming ? "· valor mensal" : ""}</span>
        </div>

        {grupo.gru_visibilidade === false && !jaParticipa && (
          <div className="convite-senha">
            <label htmlFor="convite-senha-input">
              Já tem a senha do líder? Entre na hora
            </label>
            <input
              id="convite-senha-input"
              type="text"
              className={`convite-senha-input ${erroSenha ? "convite-senha-erro" : ""}`}
              placeholder="Ex.: K2FP-7D3A"
              value={senha}
              maxLength={12}
              onChange={(evento) => {
                setSenha(evento.target.value.toUpperCase());
                setErroSenha(false);
              }}
            />
            <button
              type="button"
              className="convite-botao convite-botao-secundario"
              onClick={participar}
              disabled={entrando}
            >
              {entrando ? "Entrando..." : "Participar com a senha"}
            </button>
            {erroSenha && (
              <p className="convite-senha-aviso">
                Senha incorreta. Peça a senha de convite ao líder da divisão.
              </p>
            )}
            {!erroSenha && (
              <p className="convite-senha-ajuda">
                Sem a senha? Use "Solicitar participação" e aguarde a aprovação
                do líder.
              </p>
            )}
          </div>
        )}

        {jaParticipa ? (
          <button
            type="button"
            className="convite-botao convite-botao-azul"
            onClick={() => navigate(`/detalhedivisao/${grupo.gru_id}`)}
          >
            Ver divisão
          </button>
        ) : grupo.gru_visibilidade === false ? (
          <button
            type="button"
            className={
              statusSolicitacao === "PENDENTE"
                ? "convite-botao convite-botao-aguardando"
                : "convite-botao"
            }
            onClick={solicitarParticipacao}
            disabled={entrando || statusSolicitacao === "PENDENTE"}
          >
            {statusSolicitacao === "PENDENTE"
              ? "Solicitação enviada — aguardando o líder"
              : entrando
                ? "Enviando solicitação..."
                : isAuthenticated
                  ? "Solicitar participação"
                  : "Entrar e solicitar"}
          </button>
        ) : (
          <button
            type="button"
            className="convite-botao"
            onClick={participar}
            disabled={entrando}
          >
            {entrando
              ? "Entrando..."
              : isAuthenticated
                ? "Participar"
                : "Entrar e participar"}
          </button>
        )}
      </div>
    </main>
  );
}

export default Convite;
