import "../css/perfilParticipante.css";
import "../css/MinCss/perfilParticipanteMin.css";
import "../css/divisoes.css";

import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle } from "../components/ui/dialog";
import { useNavigate, useParams } from "react-router-dom";

import { IoMdStar } from "react-icons/io";
import { FaCircleCheck,FaChevronLeft,FaChevronRight,FaPlay,FaCar,FaHouseUser,FaLock } from "react-icons/fa6";
import { FaEllipsisH } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import BtnClose from "../components/btnClose";

interface Feedback {
  id: number;
  name: string;
  rating: number;
  text: string;
  avatar: string;
}

interface Divisao {
  id: number;
  nome: string;
  categoria: string;
  valor: string;
  price: string;
  totalPlanPrice: string | null;
  planName: string | null;
  vagas: number;
  memberCount: number;
  slots: number;
  description: string;
  lider: string;
  liderAvatar: string;
  liderId?: string;
  icone: "streaming" | "viagens" | "despesas" | "outros";
  privado: boolean;
  partida?: string;
  destino?: string;
  participantes?: Array<{
    id: string;
    nome: string;
    avatar: string;
  }>;
}

const getDivisaoIcon = (icone: Divisao["icone"]) => {
  switch (icone) {
  case "streaming":
  return <FaPlay />;
  case "viagens":
    return <FaCar />;
  case "despesas":
    return <FaHouseUser />;
  default:
    return <FaEllipsisH />;
  }
};

const getDivisaoColor = (icone: Divisao["icone"]) => {
  switch (icone) {
  case "streaming":
  return "#00A8E1";
  case "viagens":
    return "var(--verde-escuro)";
  case "despesas":
    return "var(--verde-escuro)";
  default:
    return "var(--azul-claro)";
  }
};

export function PerfilParticipante() {
const { user } = useAuth();
const { id } = useParams();

const [nomePerfil, setNomePerfil] = useState("Usuário");
const [fotoPerfil, setFotoPerfil] = useState("");

const navigate = useNavigate();

const displayName = nomePerfil;

const usuarioLogadoId = String(user?.id);
const perfilUsuarioId = String(id ?? user?.id);

const podeAvaliar = usuarioLogadoId !== perfilUsuarioId;

const [mediaAvaliacoes, setMediaAvaliacoes] = useState(0);

// CARROSSEL DE AVALIAÇÕES
const [currentIndex, setCurrentIndex] = useState(0);
const [slideWidth, setSlideWidth] = useState(33.333);

// CARROSSEL DE DIVISÕES
const [currentDivisaoIndex, setCurrentDivisaoIndex] = useState(0);
const [divisaoSlideWidth, setDivisaoSlideWidth] = useState(33.333);

// DIVISÃO SELECIONADA
const [divisaoSelecionada, setDivisaoSelecionada] =
useState<Divisao | null>(null);

// CONTROLE DO ZOOM DA FOTO
const [fotoZoom, setFotoZoom] = useState(false);

// Este estado é usado somente para EXIBIR as divisões.
const [divisoesUsuarioState, setDivisoesUsuarioState] =
useState<Divisao[]>([]);

// GRUPOS EM COMUM: usado para verificar se o usuário pode avaliar o perfil do outro usuário.
const [gruposEmComum, setGruposEmComum] = useState<Divisao[]>([]);

// DESCRIÇÃO DO USUÁRIO
const [descricaoUsuario, setDescricaoUsuario] = useState("");

// AVALIAÇÕES (carrossel)
const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
const [carregandoAvaliacoes, setCarregandoAvaliacoes] = useState(true);

// AVALIAÇÃO (estrelas e comentário)
const [avaliacao, setAvaliacao] = useState(0);
const [mostrarComentario, setMostrarComentario] = useState(false);
const [comentario, setComentario] = useState("");
const [avaliacaoEnviada, setAvaliacaoEnviada] = useState(false);

// RESETA OS ESTADOS AO TROCAR DE PERFIL
useEffect(() => {
  setAvaliacaoEnviada(false);
  setAvaliacao(0);
  setComentario("");
  setMostrarComentario(false);
  setCurrentIndex(0);
  setFeedbacks([]);
  setDivisoesUsuarioState([]);
  setGruposEmComum([]);
  setMediaAvaliacoes(0);
}, [perfilUsuarioId]);

// RESPONSIVIDADE DOS CARROSSÉIS
useEffect(() => {
const handleResize = () => {
setSlideWidth(window.innerWidth <= 768 ? 100 : 50);

  if (window.innerWidth <= 480) {
    setDivisaoSlideWidth(100);
  } else if (window.innerWidth <= 980) {
    setDivisaoSlideWidth(50);
  } else {
    setDivisaoSlideWidth(33.333);
  }
};

handleResize();

window.addEventListener("resize", handleResize);

return () => {
  window.removeEventListener("resize", handleResize);
};

}, []);

// BUSCA OS DADOS DO PERFIL
useEffect(() => {
let cancelado = false;

const buscarDadosPerfil = async () => {
if (!perfilUsuarioId) return;

  try {
    // DADOS DO USUÁRIO
    const usuarioResponse = await fetch(
      `https://divide-aqui-backend.vercel.app/usuario/${perfilUsuarioId}`
    );

    if (!usuarioResponse.ok) {
      throw new Error("Erro ao buscar dados do usuário.");
    }

    const usuarioData = await usuarioResponse.json();
    if (cancelado) return;
    setNomePerfil(usuarioData.usu_nome || "Usuário");
    setFotoPerfil(usuarioData.usu_foto || "");
    setDescricaoUsuario(usuarioData.usu_descricao || "");

    // GRUPOS
    const gruposResponse = await fetch(
      `https://divide-aqui-backend.vercel.app/grupos`
    );

    if (!gruposResponse.ok) {
      throw new Error("Erro ao buscar grupos.");
    }

    const gruposData = await gruposResponse.json();
    if (cancelado) return;

    /* Isso é usado para EXIBIR as divisões.*/

    const gruposDoUsuario = gruposData.filter(
      (grupo: any) =>
        grupo.participacoes?.some(
          (participacao: any) =>
            Number(participacao.usu_id) ===
            Number(perfilUsuarioId)
        )
    );

    /* Formata TODOS os grupos do avaliado. */

    const gruposFormatados: Divisao[] =
      gruposDoUsuario.map((grupo: any) => {
        const categoria =
          grupo.categoria?.cat_nome || "Outros";

        let icone: Divisao["icone"] = "outros";

        if (
          categoria
            .toLowerCase()
            .includes("stream")
        ) {
          icone = "streaming";
        } else if (
          categoria
            .toLowerCase()
            .includes("viag")
        ) {
          icone = "viagens";
        } else if (
          categoria
            .toLowerCase()
            .includes("domést") ||
          categoria
            .toLowerCase()
            .includes("domest")
        ) {
          icone = "despesas";
        }

        // Construir lista de participantes
        const participantes = (grupo.participacoes ?? []).map((participacao: any) => ({
          id: String(participacao.usuario?.usu_id ?? participacao.usu_id),
          nome: participacao.usuario?.usu_nome || `Usuário ${participacao.usu_id}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(participacao.usuario?.usu_id ?? participacao.usu_id))}`,
        }));

        // Identificar o líder (criador do grupo)
        const liderId = String(grupo.gru_criador_id ?? grupo.criador?.usu_id ?? "");
        const liderNome = grupo.gru_criador_nome || grupo.criador?.usu_nome || "Líder";
        const liderAvatar = grupo.criador?.usu_foto
          || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(liderNome)}`;

        // Calcular dados para o card
        const participationCount = grupo._count?.participacoes ?? 0;
        const creatorIsParticipant = grupo.gru_criador_id != null;
        const memberCount = Math.max(1, participationCount + (creatorIsParticipant ? 0 : 1));
        const maxParticipants = grupo.stream?.str_telas == null
          ? (grupo.gru_num_part ?? grupo.gru_num_vagas ?? memberCount)
          : Math.min(grupo.gru_num_part ?? grupo.gru_num_vagas ?? memberCount, grupo.stream.str_telas);
        const slots = Math.max(0, (grupo.gru_num_vagas || 0));

        const streamTotal = grupo.stream?.str_valor == null ? null : Number(grupo.stream.str_valor);
        const divisionCount = Math.min(maxParticipants, memberCount + (slots > 0 ? 1 : 0));
        const perParticipantTotal = streamTotal === null || !Number.isFinite(streamTotal)
          ? null
          : Math.round(Math.round(streamTotal * 100) / divisionCount) / 100;
        const perParticipantPrice = streamTotal !== null && Number.isFinite(streamTotal)
          ? `R$ ${perParticipantTotal?.toFixed(2).replace(".", ",")}`
          : "R$ —";

        // Dados da viagem
        const viagem = grupo.viagem ?? null;

        return {
          id: grupo.gru_id,
          nome: grupo.gru_nome || "Sem nome",
          categoria,
          valor: grupo.stream?.str_valor
            ? `R$ ${Number(grupo.stream.str_valor).toFixed(2).replace(".", ",")}` : "Valor não informado",
          price: perParticipantPrice,
          totalPlanPrice: streamTotal != null ? `R$ ${streamTotal.toFixed(2).replace(".", ",")}` : null,
          planName: grupo.stream?.str_plano ?? null,
          vagas: grupo.gru_num_vagas || 0,
          memberCount,
          slots,
          description: grupo.gru_descricao || "Nenhuma descrição informada.",
          lider: liderNome,
          liderAvatar: liderAvatar,
          liderId: liderId,
          icone,
          privado: grupo.gru_visibilidade === false,
          partida: viagem?.via_partida?.trim() || undefined,
          destino: viagem?.via_destino?.trim() || undefined,
          participantes,
        };
      });

    setDivisoesUsuarioState(gruposFormatados);

    /* Verificação dos grupos em comum entre avaliador e avaliado. */

    const gruposCompartilhados = gruposDoUsuario.filter(
      (grupo: any) =>
        grupo.participacoes?.some(
          (participacao: any) => Number(participacao.usu_id) === Number(usuarioLogadoId)
        )
    );

    const gruposEmComumFormatados =
      gruposFormatados.filter((divisao) =>
        gruposCompartilhados.some(
          (grupo: any) => Number(grupo.gru_id) === Number(divisao.id)
        )
      );

    setGruposEmComum(gruposEmComumFormatados);

    setCurrentDivisaoIndex(0);
  } catch (error) {
    console.error( "Erro ao carregar dados do perfil:",error );
  }
};

buscarDadosPerfil();

return () => {
  cancelado = true;
};
}, [perfilUsuarioId, usuarioLogadoId]);

// BUSCAR AS AVALIAÇÕES
useEffect(() => {
let cancelado = false;

const buscarAvaliacoes = async () => {
if (!perfilUsuarioId) return;

  try {
    setCarregandoAvaliacoes(true);

    const token = localStorage.getItem("token");

    const response = await fetch(
      `https://divide-aqui-backend.vercel.app/avaliacoes/${perfilUsuarioId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar avaliações.");
    }

    const data = await response.json();
    if (cancelado) return;

    const avaliacoesFormatadas: Feedback[] =
      (data.avaliacoes || []).map(
        (avaliacao: any) => ({
          id: Number(avaliacao.ava_id),
          name: avaliacao.usuario_avaliacao_ava_avaliadorTousuario?.usu_nome || "Usuário",
          rating: Number( avaliacao.ava_nota ),
          text: avaliacao.ava_descricao || "Nenhum comentário informado.",
          avatar: avaliacao.usuario_avaliacao_ava_avaliadorTousuario?.usu_foto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${
              avaliacao.usuario_avaliacao_ava_avaliadorTousuario?.usu_nome || "Usuario"
            }`,
        })
      );

    setFeedbacks(avaliacoesFormatadas);
  } catch (error) {
    console.error("Erro ao carregar avaliações:",error
    );
  } finally {
    if (!cancelado) setCarregandoAvaliacoes(false);
  }
};

buscarAvaliacoes();

return () => {
  cancelado = true;
};
}, [perfilUsuarioId]);

// BUSCAR MÉDIA DAS AVALIAÇÕES
useEffect(() => {
let cancelado = false;

const buscarMedia = async () => {
if (!perfilUsuarioId) return;

  try {
    const token =
      localStorage.getItem("token");

    const response = await fetch(
      `https://divide-aqui-backend.vercel.app/avaliacoes/${perfilUsuarioId}/media`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,"Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar média das avaliações."
      );
    }

    const data = await response.json();
    if (cancelado) return;

    setMediaAvaliacoes(
      Number(data.media) || 0
    );
  } catch (error) {
    console.error("Erro ao carregar média das avaliações:",
      error
    );
  }
};

buscarMedia();

return () => {
  cancelado = true;
};
}, [perfilUsuarioId]);

// CARROSSEL DE AVALIAÇÕES
useEffect(() => {
if (feedbacks.length === 0) return;
const interval = setInterval(() => {
  setCurrentIndex(
    (prevIndex) => (prevIndex + 1) % feedbacks.length
  );
}, 5000);

return () =>
  clearInterval(interval);
}, [feedbacks.length]);

// CARROSSEL DE DIVISÕES
useEffect(() => {
  if ( divisoesUsuarioState.length === 0 ) {
    return;
  }

const interval = setInterval(() => {
  setCurrentDivisaoIndex(
    (prevIndex) => (prevIndex + 1) % divisoesUsuarioState.length
  );
}, 5000);

return () => clearInterval(interval);

}, [divisoesUsuarioState.length]);

// NAVEGAÇÃO DAS AVALIAÇÕES
const goToPrevious = () => {
  if (feedbacks.length === 0) return;
  setCurrentIndex(
    (prevIndex) => (prevIndex - 1 + feedbacks.length) % feedbacks.length
  );
};

const goToNext = () => {
  if (feedbacks.length === 0) return;
  setCurrentIndex(
    (prevIndex) => (prevIndex + 1) % feedbacks.length
  );
};

const goToSlide = (index: number) => { setCurrentIndex(index); };

// NAVEGAÇÃO DAS DIVISÕES
const goToPreviousDivisao = () => {
  if ( divisoesUsuarioState.length === 0 ) {
   return;
  }

setCurrentDivisaoIndex(
  (prevIndex) => (prevIndex - 1 + divisoesUsuarioState.length) % divisoesUsuarioState.length
);
};

const goToNextDivisao = () => {
  if ( divisoesUsuarioState.length === 0 ) {
    return;
  }

setCurrentDivisaoIndex(
  (prevIndex) =>
    (prevIndex + 1) %
    divisoesUsuarioState.length
);

};

const goToDivisaoSlide = ( index: number ) => {
  setCurrentDivisaoIndex(index);
};

// ESTRELAS DOS FEEDBACKS
const renderStars = (rating: number) => {
  return Array.from({ length: 5,}).map((_, i) => (
  <span key={i} 
  className={ i < rating
  ? "participante-feedback-star participante-feedback-star-filled"
  : "participante-feedback-star"
  }
  >
  <IoMdStar />
  </span>
  ));
};

// ENVIAR AVALIAÇÃO
const enviarAvaliacao = async () => {
  if (avaliacaoEnviada || !podeAvaliar) {
    return;
  }

if (avaliacao === 0) {
  Swal.fire({
    icon: "warning",
    title: "Atenção!",
    text: "Selecione pelo menos 1 estrela.",
    confirmButtonText: "OK",
  });
  return;
}

if (!comentario.trim()) {
  Swal.fire({
    icon: "warning",
    title: "Atenção!",
    text: "Escreva uma avaliação.",
    confirmButtonText: "OK",
  });
  return;
}

if (gruposEmComum.length === 0) {
  Swal.fire({
    icon: "warning",
    title: "Atenção!",
    text: "Você não pode avaliar este usuário pois não há grupos em comum.",
    confirmButtonText: "OK",
  });
  return;
}

try {
  const token = localStorage.getItem("token");

  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "Atenção!",
      text: "Você precisa estar logado para avaliar.",
      confirmButtonText: "OK",
    });
    return;
  }

  const dadosAvaliacao = {
  ava_nota: avaliacao,
  ava_descricao: comentario.trim(),
  ava_avaliado: Number(perfilUsuarioId),
  };

  const response = await fetch("https://divide-aqui-backend.vercel.app/avaliacoes",{
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json",
      },
      body: JSON.stringify( dadosAvaliacao ),
    }
  );

  if (!response.ok) {
    const erro = await response.json().catch(() => ({}));

    if (response.status === 409) {
      Swal.fire({
        icon: "warning",
        title: "Avaliação Duplicada",
        text: "Você já avaliou este usuário.",
        confirmButtonText: "OK",
      });
      return;
    }

    if (response.status === 403) {
      Swal.fire({
        icon: "warning",
        title: "Acesso Negado",
        text: erro.erro || "Você não pode avaliar este usuário.",
        confirmButtonText: "OK",
      });
      return;
    }

    throw new Error(
      erro.erro || "Erro ao enviar avaliação."
    );
  }

  const avaliacaoCriada = await response.json().catch(() => null);

  setAvaliacaoEnviada(true);
  setMostrarComentario(false);
  setComentario("");
  setAvaliacao(0);

  const novaAvaliacao: Feedback = {
    id: Number(avaliacaoCriada?.ava_id) || Date.now(),
    name: user?.name || "Usuário",
    rating: avaliacao,
    text: comentario.trim(),
    avatar: user?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Usuario"}`,
  };

  setFeedbacks((prev) => [ novaAvaliacao,...prev,]);
  setCurrentIndex(0);

  // Atualiza a média
  const mediaResponse = await fetch( `https://divide-aqui-backend.vercel.app/avaliacoes/${perfilUsuarioId}/media`,{
      headers: { Authorization: `Bearer ${token}`,},
    }
  );

  if (mediaResponse.ok) {
    const data = await mediaResponse.json();
    setMediaAvaliacoes( Number(data.media) || 0 );
  }

  Swal.fire({
    icon: "success",
    title: "Avaliação enviada!",
    text: "Sua avaliação foi registrada.",
    confirmButtonText: "OK",
  });
} catch (error) {
  console.error( "Erro ao enviar avaliação:", error);

  Swal.fire({
    icon: "error",
    title: "Erro!",
    text: error instanceof Error? error.message: "Não foi possível enviar sua avaliação.",
    confirmButtonText: "OK",
  });
}
};

return (
  <>
  <section className="perfil-participante-container">

  <section className="perfil-participante-fundo">
    <BtnClose onClick={() => navigate(-1)} />
  </section>

      <div className="cabecalho-participante">

        <div className="foto-participante">
          {fotoPerfil ? (
            <button type="button" className="foto-participante-button" onClick={() => setFotoZoom(true)} aria-label="Ampliar foto do usuário">
              <img
                src={fotoPerfil}
                alt={ displayName }
                className="participante-user-avatar"
                referrerPolicy="no-referrer"
              />
            </button>
          ) : (
            <span className="participante-user-avatar-fallback">
              {displayName
                ?.trim()
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </span>
          )}
        </div>

        <div className="dados-usuario">

          <div className="estrelas">
            {[1, 2, 3, 4, 5].map(
              (estrela) => (
                <span key={estrela} className="estrela" title="Média das avaliações recebidas.">
                  <IoMdStar className={ estrela <= Math.round( mediaAvaliacoes )
                        ? "estrela-preenchida"
                        : "estrela-vazia"
                    }
                  />
                </span>
              )
            )}
          </div>

          <h1 className="nome-usuario">{displayName}</h1>
        </div>
      </div>

      {fotoZoom && fotoPerfil && (
      <div className="foto-dialog-overlay"onClick={() => setFotoZoom(false)}>
        <div className="foto-dialog" onClick={(e) => e.stopPropagation()}>
          <button type="button"className="foto-dialog-fechar"
            onClick={() => setFotoZoom(false)} aria-label="Fechar foto"
          >
            <IoCloseSharp size={28} />
          </button>
          <img src={fotoPerfil} alt={displayName || "Usuário"}
            className="foto-dialog-imagem" referrerPolicy="no-referrer"
          />
        </div>
      </div>
      )}

      {/* DESCRIÇÃO DO USUÁRIO */}
      <div className="descricao-usuario">
        <h3 className={descricaoUsuario ? "com-descricao" : "sem-descricao"}>
          {descricaoUsuario || "Este usuário ainda não adicionou uma descrição."}
        </h3>
      </div>

      {/* AVALIAR USUÁRIO (somente em perfis de outros usuários) */}
      {podeAvaliar && (
      <div className="avaliar-usuario">
        <span className="estrela2"><IoMdStar /></span>

        <div className="textos-avaliacao">
          <h1>Já dividiu algo com esse usuário?</h1>
          <h2>Deixe sua avaliação e ajude outros usuários.</h2>
        </div>

        <div className="estrelas-avaliar">
          <div className="estrela-button">
            {[1, 2, 3, 4, 5].map(
              (estrela) => (
                <IoMdStar key={estrela} className={estrela <= avaliacao
                      ? "estrela-preenchida"
                      : "estrela-vazia"
                  }
                  onClick={() => {
                    if (!avaliacaoEnviada) {
                      setAvaliacao(estrela);
                    }
                  }}
                />
              )
            )}
          </div>

          <h3>Clique nas estrelas para avaliar.</h3>
        </div>

        <button type="button" className="check-avaliacao-button" title="Clique para avaliar" onClick={() => {
            if (avaliacaoEnviada) {
              return;
            }

            if (avaliacao === 0) {
              Swal.fire({
                icon: "warning",
                title: "Atenção!",
                text: "Selecione pelo menos 1 estrela.",
                confirmButtonText:"OK",
              });
              return;
            }

            if ( gruposEmComum.length === 0 ) {
              Swal.fire({
                icon: "warning",
                title: "Atenção!",
                text: "Você não pode avaliar este usuário pois não há grupos em comum.",
                confirmButtonText: "OK",
              });
              return;
            }

            setMostrarComentario(true);
          }}
        >
          <FaCircleCheck className={ avaliacaoEnviada
                ? "check-avaliacao enviado"
                : "check-avaliacao"
            }
          />
        </button>
      </div>
      )}

      {/* MODAL DA AVALIAÇÃO */}
      <Dialog open={mostrarComentario} onOpenChange={ setMostrarComentario }>
        {mostrarComentario ? (
          <DialogContent>
            <button type="button" className="IconCancelar-avaliacao" onClick={() =>
                setMostrarComentario(false)
              }
            >
              <IoCloseSharp size={25} />
            </button>

            <DialogHeader>
              <DialogTitle>Como foi essa parceria?</DialogTitle>
              <DialogDescription>
                Diga o que achou de dividir com esse usuário.
              </DialogDescription>
            </DialogHeader>

            <textarea className="avaliacao-dialog__textarea" value={comentario} onChange={(e) =>
                setComentario( e.target.value )
              }
              placeholder="Escreva seu feedback..." maxLength={200}
            />

            <div className="avaliacao-dialog__estrelas">
              {[1, 2, 3, 4, 5].map(
                (estrela) => (
                  <IoMdStar key={estrela} className={
                      estrela <= avaliacao
                        ? "estrela-preenchida"
                        : "estrela-vazia"
                    }
                  />
                )
              )}
            </div>

            <button type="button" className="avaliacao-dialog__enviar" onClick={enviarAvaliacao}>
              Enviar feedback
            </button>
          </DialogContent>
        ) : null}
      </Dialog>

      {/* DIVISÕES */}
      <div className="participante-divisoes">
        <h1 className="titulo-participante">Divisões de {displayName}:</h1>

        {divisoesUsuarioState.length >
        0 ? (
          <>
            <div className="participante-divisoes-carousel-wrapper">
              <button type="button"
                className="participante-divisoes-carousel-arrow participante-divisoes-carousel-arrow-left"
                onClick={ goToPreviousDivisao} aria-label="Divisão anterior"
              >
                <FaChevronLeft />
              </button>

              <div className="participante-divisoes-carousel">
                <div
                  className="participante-divisoes-carousel-track"
                  style={{ transform: `translateX(-${ currentDivisaoIndex *divisaoSlideWidth }%)`,
                  }}
                >
                  {divisoesUsuarioState.map(
                    (divisao) => (
                      <div key={divisao.id} className="participante-divisao-slide">
                        <article className="participante-divisao-card" role="button"
                          tabIndex={0} onClick={() => setDivisaoSelecionada(divisao)}
                          onKeyDown={(event) => {
                            if ( event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setDivisaoSelecionada(divisao);
                            }
                          }}
                        >
                          <div className="participante-divisao-card-top">
                            <div className="participante-divisao-card-icone"
                              style={{backgroundColor:getDivisaoColor(divisao.icone),}}
                            >
                              <span className="participante-divisao-card-lock"><FaLock /></span>
                              {getDivisaoIcon(divisao.icone)}
                            </div>

                            <div className="participante-divisao-card-participantes">
                              {divisao.participantes && divisao.participantes.length > 0 ? (
                                divisao.participantes.slice(0, 4).map((participante) => (
                                  <button
                                    key={participante.id}
                                    type="button"
                                    className="participante-divisao-card-avatar-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/perfilparticipante/${participante.id}`);
                                    }}
                                    title={`${participante.nome} - Clique para ver o perfil`}
                                  >
                                    <img src={participante.avatar} alt={participante.nome}
                                      className="participante-divisao-card-avatar"
                                    />
                                    <span className="participante-divisao-card-avatar-tooltip">{participante.nome}</span>
                                  </button>
                                ))
                              ) : (
                                <div className="participante-divisao-card-lider">
                                  <img src={divisao.liderAvatar} alt={divisao.lider}
                                    className="participante-divisao-card-avatar"
                                  />
                                  <span>{divisao.lider}</span>
                                </div>
                              )}
                              {divisao.participantes && divisao.participantes.length > 4 && (
                                <span className="participante-divisao-card-mais">+{divisao.participantes.length - 4}</span>
                              )}
                            </div>
                          </div>

                          <div className="participante-divisao-card-conteudo">
                            <div className="participante-divisao-card-conteudo-heading">
                              <h2>{divisao.nome}</h2>
                              <span className="participante-divisao-card-conteudo-price">
                                {divisao.price}{divisao.icone === "streaming" ? " / pessoa" : ""}
                              </span>
                            </div>
                            <p>Líder: {divisao.lider}</p>
                            {divisao.planName && <p>Plano: {divisao.planName}</p>}
                            <p>{divisao.memberCount} pessoa(s) no grupo</p>
                            <p>{divisao.slots} vagas disponíveis</p>
                          </div>

                          <span className="participante-divisao-card-abrir">Ver divisão →</span>
                        </article>
                      </div>
                    )
                  )}
                </div>
              </div>

              <button type="button"
                className="participante-divisoes-carousel-arrow participante-divisoes-carousel-arrow-right"
                onClick={goToNextDivisao}
                aria-label="Próxima divisão"
              >
                <FaChevronRight />
              </button>
            </div>

            <div className="participante-divisoes-carousel-dots">
              {divisoesUsuarioState.map(
                (_, index) => (
                  <button type="button" key={index}
                    className={`participante-divisao-dot ${
                      index === currentDivisaoIndex
                        ? "participante-divisao-dot-active"
                        : ""
                    }`}
                    onClick={() => goToDivisaoSlide(index)}
                    aria-label={`Ir para divisão ${index + 1}`}
                  />
                )
              )}
            </div>
          </>
        ) : (
          <p className="participante-divisoes-vazio">Este usuário ainda não participa de nenhuma divisão.</p>
        )}
      </div>

      {/* MODAL DA DIVISÃO */}
      <Dialog open={Boolean(divisaoSelecionada)}
        onOpenChange={(open) => !open && setDivisaoSelecionada(null)}
      >
        {divisaoSelecionada ? (
          <DialogContent className="division-dialog">
            <DialogHeader>
              <div className="division-dialog__header">
                <div className="division-dialog__service-block">
                  <div className="division-dialog__icon" style={{ backgroundColor: getDivisaoColor(divisaoSelecionada.icone) }}>
                    {divisaoSelecionada.privado && <span className="vagas-card__lock"><FaLock /></span>}
                    {getDivisaoIcon(divisaoSelecionada.icone)}
                  </div>
                </div>

                <div className="division-dialog__leader-block">
                  <div className="division-dialog__leader-avatar">
                    <img src={divisaoSelecionada.liderAvatar} alt={divisaoSelecionada.lider} className="division-dialog__leader-avatar-image" />
                  </div>
                  <div className="division-dialog__leader-info">
                    <strong>Líder: {divisaoSelecionada.lider}</strong>
                    <div className="division-dialog__stars">Sem avaliações</div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="division-dialog__body">
              <div className="division-dialog__title-row">
                <DialogTitle>{divisaoSelecionada.nome}</DialogTitle>
                <span className="division-dialog__price">
                  {divisaoSelecionada.price}{divisaoSelecionada.icone === "streaming" ? " / pessoa" : ""}
                </span>
              </div>
              {divisaoSelecionada.icone === "streaming" && (
                <div className="division-dialog__stream-details">
                  <p>Plano: <strong>{divisaoSelecionada.planName || "Não informado"}</strong></p>
                  <p>Valor total atual: <strong>{divisaoSelecionada.totalPlanPrice || "R$ —"}</strong></p>
                  <p>Divisão entre {divisaoSelecionada.memberCount} {divisaoSelecionada.memberCount === 1 ? "pessoa" : "pessoas"}: <strong>{divisaoSelecionada.price}</strong></p>
                </div>
              )}
              <p className="division-dialog__slots">Vagas disponíveis: {divisaoSelecionada.slots}</p>

              {divisaoSelecionada.icone === "viagens" && (
                <div className="division-dialog__trip-details">
                  <div>
                    <strong>Partida</strong>
                    <span>{divisaoSelecionada.partida || "Não informado"}</span>
                  </div>
                  <div>
                    <strong>Destino</strong>
                    <span>{divisaoSelecionada.destino || "Não informado"}</span>
                  </div>
                </div>
              )}

              <DialogDescription>
                {divisaoSelecionada.description}
              </DialogDescription>

              <button type="button" className="division-dialog__action">
                Participar da Divisão
              </button>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>

      {/* AVALIAÇÕES */}
      <div className="participante-avaliacoes">
        <h1 className="titulo-participante">Como outros usuários avaliam{" "}{displayName}?</h1>

        {carregandoAvaliacoes ? (
          <p>Carregando avaliações...</p>
        ) : feedbacks.length > 0 ? (
          <>
            <div className="participante-feedback-carousel-wrapper">
              <button type="button"
                className="participante-feedback-carousel-arrow participante-feedback-carousel-arrow-left"
                onClick={goToPrevious} aria-label="Anterior"
              >
                <FaChevronLeft />
              </button>

              <div className="participante-feedback-carousel">
                <div className="participante-feedback-carousel-track"
                  style={{ transform: `translateX(-${
                      currentIndex *
                      slideWidth
                    }%)`,
                  }}
                >
                  {feedbacks.map(
                    (feedback) => (
                      <div key={feedback.id} className="participante-feedback-slide">
                        <div className="participante-feedback-card">
                          <div className="participante-feedback-header">
                            <div className="participante-feedback-user-info">
                              <img src={ feedback.avatar}
                                alt={ feedback.name }
                                className="participante-feedback-avatar"
                              />

                              <div>
                                <h3 className="participante-feedback-name">{feedback.name}</h3>
                              </div>
                            </div>

                            <div className="participante-feedback-rating">{renderStars(feedback.rating)}
                            </div>
                          </div>

                          <p className="participante-feedback-text">{feedback.text}</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <button type="button"
                className="participante-feedback-carousel-arrow participante-feedback-carousel-arrow-right"
                onClick={goToNext} aria-label="Próximo"
              >
                <FaChevronRight />
              </button>
            </div>

            <div className="participante-feedback-carousel-dots">
              {feedbacks.map(
                (_, index) => (
                  <button type="button" key={index}
                    className={`participante-feedback-dot ${
                      index === currentIndex
                        ? "participante-feedback-dot-active"
                        : ""
                    }`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Ir para avaliação ${index + 1}`}
                  />
                )
              )}
            </div>
          </>
        ) : (
          <p className="participante-feedbacks-vazio">Nenhuma avaliação recebida ainda.</p>
        )}
      </div>
    </section>
  </>

  );
}