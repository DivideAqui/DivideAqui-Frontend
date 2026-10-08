import "../css/perfilParticipante.css";
import "../css/MinCss/perfilParticipanteMin.css";

import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle } from "../components/ui/dialog";
import { useNavigate, useParams } from "react-router-dom";

import { IoMdStar } from "react-icons/io";
import { FaCircleCheck,FaChevronLeft,FaChevronRight,FaPlay,FaCar,FaHouseUser,FaLock } from "react-icons/fa6";
import { FaEllipsisH } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";

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
  vagas: number;
  descricao: string;
  lider: string;
  liderAvatar: string;
  icone: "streaming" | "viagens" | "despesas" | "outros";
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
const buscarDadosPerfil = async () => {
if (!perfilUsuarioId) return;

  try {
    // DADOS DO USUÁRIO
    const usuarioResponse = await fetch(
      `//divide-aqui-backend.vercel.app/usuario/${perfilUsuarioId}`
    );

    if (!usuarioResponse.ok) {
      throw new Error("Erro ao buscar dados do usuário.");
    }

    const usuarioData = await usuarioResponse.json();
    setNomePerfil(usuarioData.usu_nome || "Usuário");
    setFotoPerfil(usuarioData.usu_foto || "");
    setDescricaoUsuario(usuarioData.usu_descricao || "");

    // GRUPOS
    const gruposResponse = await fetch(
      `//divide-aqui-backend.vercel.app/grupos`
    );

    if (!gruposResponse.ok) {
      throw new Error("Erro ao buscar grupos.");
    }

    const gruposData = await gruposResponse.json();

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

        return {
          id: grupo.gru_id,
          nome: grupo.gru_nome || "Sem nome",
          categoria,
          valor: grupo.stream?.str_valor
            ? `R$ ${Number( grupo.stream.str_valor ).toFixed(2).replace(".", ",")}`: "Valor não informado",
          vagas: grupo.gru_num_vagas || 0,
          descricao: grupo.gru_descricao || "Nenhuma descrição informada.",
          lider: "Líder",
          liderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lider",
          icone,
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
}, [perfilUsuarioId, usuarioLogadoId]);

// BUSCAR AS AVALIAÇÕES
useEffect(() => {
const buscarAvaliacoes = async () => {
if (!perfilUsuarioId) return;

  try {
    setCarregandoAvaliacoes(true);

    const token = localStorage.getItem("token");

    const response = await fetch(
      `//divide-aqui-backend.vercel.app/avaliacoes/${perfilUsuarioId}`,
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

    const avaliacoesFormatadas: Feedback[] =
      data.avaliacoes.map(
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
    setCarregandoAvaliacoes(false);
  }
};

buscarAvaliacoes();
}, [perfilUsuarioId]);

// BUSCAR MÉDIA DAS AVALIAÇÕES
useEffect(() => {
const buscarMedia = async () => {
if (!perfilUsuarioId) return;

  try {
    const token =
      localStorage.getItem("token");

    const response = await fetch(
      `//divide-aqui-backend.vercel.app/avaliacoes/${perfilUsuarioId}/media`,
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
}, [perfilUsuarioId]);

// AVISO SE FOR SEU PRÓPRIO PERFIL
useEffect(() => {
  if (
  !podeAvaliar && usuarioLogadoId !== "0"
  ) {
  console.log("Você não pode avaliar a si mesmo");
  }
  }, [ podeAvaliar, usuarioLogadoId,]);

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
  if (avaliacaoEnviada) {
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
    text: "Você só pode avaliar este usuário se já tiver participado de algum grupo com ele.",
    confirmButtonText: "OK",
  });
  return;
}

try {
  const token = localStorage.getItem("token");

  const dadosAvaliacao = {
  ava_nota: avaliacao,
  ava_descricao: comentario.trim(),
  ava_avaliado: Number(perfilUsuarioId),
  };

  const response = await fetch("//divide-aqui-backend.vercel.app/avaliacoes",{
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json",
      },
      body: JSON.stringify( dadosAvaliacao ),
    }
  );

  if (!response.ok) {
    const erro = await response.json();

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

  setAvaliacaoEnviada(true);
  setMostrarComentario(false);
  setComentario("");
  setAvaliacao(0);

  const novaAvaliacao: Feedback = {
    id: Date.now(),
    name: user?.name || "Usuário",
    rating: avaliacao,
    text: comentario.trim(),
    avatar: user?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`,
  };

  setFeedbacks((prev) => [ novaAvaliacao,...prev,]);
  setCurrentIndex(0);

  // Atualiza a média
  const token2 = localStorage.getItem("token");
  const mediaResponse = await fetch( `//divide-aqui-backend.vercel.app/avaliacoes/${perfilUsuarioId}/media`,{
      headers: { Authorization: `Bearer ${token2}`,},
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
  <button type="button" className="IconCancelar-perfilParticipante" onClick={() => navigate("/home")}>
  <IoCloseSharp size={25} />
  </button>
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
        <h3> {descricaoUsuario || "Este usuário ainda não adicionou uma descrição."}</h3>
      </div>

      {/* AVALIAR USUÁRIO */}
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

        {podeAvaliar && (
          <button type="button" className="check-avaliacao-button" title="Clique para avaliar" onClick={() => {
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
                  text: "Você só pode avaliar este usuário se já tiver participado de algum grupo com ele.",
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
        )}
      </div>

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
                <p>Diga o que achou de dividir com esse usuário.</p>
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

                            <div className="participante-divisao-card-lider">
                              <img src={divisao.liderAvatar} alt={divisao.lider}
                                className="participante-divisao-card-avatar"
                              />
                              <span>{divisao.lider}</span>
                            </div>
                          </div>

                          <div className="participante-divisao-card-conteudo">
                            <span className="participante-divisao-card-categoria">{divisao.categoria}</span>
                            <h2>{divisao.nome}</h2>
                            <p>{divisao.valor} •{" "}{divisao.vagas}{" "}vagas disponíveis</p>
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
          <DialogContent className="participante-divisao-dialog">
            <DialogHeader>
              <div className="participante-divisao-dialog-header">
                <div className="participante-divisao-dialog-icone"
                  style={{ backgroundColor: getDivisaoColor(divisaoSelecionada.icone ),
                  }}
                >
                  {getDivisaoIcon( divisaoSelecionada.icone)}
                </div>

                <div>
                  <span className="participante-divisao-dialog-categoria">{divisaoSelecionada.categoria}</span>

                  <DialogTitle>{divisaoSelecionada.nome}</DialogTitle>
                </div>
              </div>
            </DialogHeader>

            <div className="participante-divisao-dialog-body">
              <div className="participante-divisao-dialog-lider">
                <img src={divisaoSelecionada.liderAvatar}
                  alt={divisaoSelecionada.lider}
                />

                <div>
                  <span>Líder da divisão</span>
                  <strong>{divisaoSelecionada.lider}</strong>
                </div>
              </div>

              <div className="participante-divisao-dialog-info">
                <div>
                  <span>Valor</span>
                  <strong>{divisaoSelecionada.valor}
                  </strong>
                </div>

                <div>
                  <span>Vagas disponíveis</span>

                  <strong>{divisaoSelecionada.vagas}
                  </strong>
                </div>
              </div>

              <DialogDescription>{divisaoSelecionada.descricao}</DialogDescription>
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