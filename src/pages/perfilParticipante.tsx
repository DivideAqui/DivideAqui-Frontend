import "../css/perfilParticipante.css";
import "../css/MinCss/perfilParticipanteMin.css"
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle } from "../components/ui/dialog";
import { useNavigate } from "react-router-dom";
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

// Interface: "templates" criados para organizar os dados que vem do backend, verifica se estão corretos.
// ex.: name é uma string, se colocar número, código trava e aparece erro (não é uma validação)

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
  const displayName = user?.name || "Usuário";
  // se houver valor em nome, use, se não, use "Usuário" (|| = "ou")

  const navigate = useNavigate();

  // CARROSSEL DE AVALIAÇÕES
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState(33.333);

  // CARROSSEL DE DIVISÕES
  const [currentDivisaoIndex, setCurrentDivisaoIndex] = useState(0);
  const [divisaoSlideWidth, setDivisaoSlideWidth] = useState(33.333);

  // DIVISÃO SELECIONADA
  const [divisaoSelecionada, setDivisaoSelecionada] = useState<Divisao | null>(null);

  // CONTROLE DO ZOOM DA FOTO
  const [fotoZoom, setFotoZoom] = useState(false);

  // DIVISÕES VINDAS DO BACKEND
  const [divisoesUsuarioState, setDivisoesUsuarioState] = useState<Divisao[]>([]);

  // DESCRIÇÃO REAL DO USUÁRIO
  const [descricaoUsuario, setDescricaoUsuario] = useState("");

  // AVALIAÇÕES
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [carregandoAvaliacoes, setCarregandoAvaliacoes] = useState(true);

  // AVALIAÇÃO
  const [avaliacao, setAvaliacao] = useState(0);
  const [mostrarComentario, setMostrarComentario] = useState(false);
  const [comentario, setComentario] = useState("");
  const [avaliacaoEnviada, setAvaliacaoEnviada] = useState(false);

  // useState é um hook que armazena dados que podem MUDAR, cria um estado
  // primeiro valor (ex: avaliacao) é o dado que muda, e segundo (ex: setAvaliacao) é a função para atualizar o dado
  // o que está entre parênteses é o valor inicial

  // MÉDIA AVALIAÇÃO
  const mediaAvaliacoes =
  feedbacks.length > 0
    ? feedbacks.reduce(
        (soma, feedback) => soma + Number(feedback.rating),
        0
      ) / feedbacks.length
    : 0;
  // se tem feedback ( >0 ), soma todos e divide pela quantidad, se não houver feedback, é 0

  // RESPONSIVIDADE DOS CARROSSÉIS
  useEffect(() => {

    const handleResize = () => {
      setSlideWidth(
        window.innerWidth <= 768 ? 100 : 50
      );

      if (window.innerWidth <= 480) {
        setDivisaoSlideWidth(100);
      } else if (window.innerWidth <= 980) {
        setDivisaoSlideWidth(50);
      } else {
        setDivisaoSlideWidth(33.333);
      }
    };

    handleResize();
    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);
  // slidewidth é a largura de cada slide do carrossel em porcentagem
  //setSlideWidth(100)   // Ocupa 100% da tela (mobile) --> setSlideWidth(50)    // Ocupa 50% da tela (tablet) --> setSlideWidth(33.333) // Ocupa 33% da tela (desktop)
  // window.addEventListener("resize", handleResize); "ouve" as mudanças de tamanho
  // handleResize(); significa "execute função agora"


  // BUSCA OS DADOS DO PERFIL

  useEffect(() => {

    const buscarDadosPerfil = async () => {

      if (!user?.id) return;
      try {

        // DADOS DO USUÁRIO (fetch é uma api usada para fazer requisição HTTP)
        const usuarioResponse = await fetch(`http://localhost:3344/usuario/${user.id}`);
        // nessa linha, pega os dados do usuário, que estão na URL acima
        
        if (!usuarioResponse.ok) {
          throw new Error(
            "Erro ao buscar dados do usuário."
          );
        }

        const usuarioData = await usuarioResponse.json();
        // converte a resposta de usuarioResponse em um objeto JSON para utilizarmos

        setDescricaoUsuario(usuarioData.usu_descricao || "" );
        // armazena os dados do usuário em DescricaoUsuario

        // GRUPOS

        const gruposResponse = await fetch(
          "http://localhost:3344/grupos"
        );

        if (!gruposResponse.ok) {
          throw new Error(
            "Erro ao buscar grupos."
          );
        }

        const gruposData =
          await gruposResponse.json();
        // pega os valores da tabela grupos (em json)

        const gruposDoUsuario =
          gruposData.filter(
            (grupo: any) =>
              grupo.participacoes?.some(
                (participacao: any) =>
                  Number(
                    participacao.usu_id
                  ) === Number(user.id)
              )
          );
        // filtra apenas os grupos em que o usuário participa ( Se o ID da participação == ID do usuário logado )

        const gruposFormatados: Divisao[] =
          gruposDoUsuario.map(
            (grupo: any) => {
              const categoria = grupo.categoria?.cat_nome || "Outros";
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
                valor:
                  grupo.stream?.str_valor
                    ? `R$ ${Number(
                        grupo.stream.str_valor
                      )
                        .toFixed(2)
                        .replace(".", ",")}`
                    : "Valor não informado",
                vagas: grupo.gru_num_vagas || 0,
                descricao: grupo.gru_descricao || "Nenhuma descrição informada.",
                lider: "Líder",
                liderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lider", icone,
              };
            }
          );

        setDivisoesUsuarioState(
          gruposFormatados
        );

        // Volta o carrossel para o primeiro item
        setCurrentDivisaoIndex(0);

      } catch (error) {

        console.error(
          "Erro ao carregar dados do perfil:",
          error
        );
      }
    };

    buscarDadosPerfil();
  }, [user?.id]);

  // BUSCAR AS AVALIAÇÕES
  useEffect(() => {

    const buscarAvaliacoes = async () => {

      if (!user?.id) return;
      try { setCarregandoAvaliacoes(true);

        // ROTA QUE SERÁ CRIADA NO BACKEND: GET /avaliacoes/avaliado/:id

        const response = await fetch(
          `http://localhost:3344/avaliacoes/avaliado/${user.id}`
        );

        if (!response.ok) {
          throw new Error(
            "Erro ao buscar avaliações."
          );
        }

        const data =
          await response.json();

        const avaliacoesFormatadas: Feedback[] =
          data.map(
            (avaliacao: any) => ({
              id: Number(avaliacao.ava_id),
              name: avaliacao.avaliador?.usu_nome || "Usuário",
              rating: Number(avaliacao.ava_nota),
              text: avaliacao.ava_descricao || "Nenhum comentário informado.",
              avatar: avaliacao.avaliador?.usu_foto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                      avaliacao.avaliador?.usu_nome || "Usuario"
                }`,
            })
          );

        setFeedbacks(
          avaliacoesFormatadas
        );

      } catch (error) {
        console.error(
          "Erro ao carregar avaliações:",
          error
        );

      } finally {
        setCarregandoAvaliacoes(false);
      }
    };

    buscarAvaliacoes();
  }, [user?.id]);

  // CARROSSEL DE AVALIAÇÕES
  useEffect(() => {

    if (feedbacks.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(
        (prevIndex) =>
          (prevIndex + 1) %
          feedbacks.length
      );
    }, 5000);

    return () =>
      clearInterval(interval);
  }, [feedbacks.length]);

  // CARROSSEL DE DIVISÕES
  useEffect(() => {

    if (
      divisoesUsuarioState.length === 0
    ) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentDivisaoIndex(
        (prevIndex) =>
          (prevIndex + 1) %
          divisoesUsuarioState.length
      );
    }, 5000);

    return () =>
      clearInterval(interval);
  }, [divisoesUsuarioState.length]);

  // NAVEGAÇÃO DAS AVALIAÇÕES
  const goToPrevious = () => {
    if (feedbacks.length === 0) return;

    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + feedbacks.length) %
        feedbacks.length
    );
  };

  const goToNext = () => {
    if (feedbacks.length === 0) return;
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex + 1) %
        feedbacks.length
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // NAVEGAÇÃO DAS DIVISÕES
  const goToPreviousDivisao = () => {

    if (
      divisoesUsuarioState.length === 0
    ) {
      return;
    }

    setCurrentDivisaoIndex(
      (prevIndex) =>
        (
          prevIndex -
          1 +
          divisoesUsuarioState.length
        ) %
        divisoesUsuarioState.length
    );
  };

  const goToNextDivisao = () => {
    if (
      divisoesUsuarioState.length === 0
    ) {
      return;
    }

    setCurrentDivisaoIndex(
      (prevIndex) =>
        (
          prevIndex + 1
        ) %
        divisoesUsuarioState.length
    );

  };

  const goToDivisaoSlide = (
    index: number
  ) => {
    setCurrentDivisaoIndex(index);
  };

  // ESTRELAS DOS FEEDBACKS
  const renderStars = (
    rating: number
  ) => {

    return Array.from({
      length: 5,
    }).map(
      (_, i) => (

        <span
          key={i}
          className={
            i < rating
              ? "participante-feedback-star participante-feedback-star-filled"
              : "participante-feedback-star"
          }
        >
          <IoMdStar/>
        </span>
      )
    );
  };

  // ENVIAR AVALIAÇÃO
  const enviarAvaliacao = async () => {

    if (avaliacaoEnviada) {
      return;
    }

    // VERIFICA ESTRELAS
    if (avaliacao === 0) {

      Swal.fire({
        icon: "warning",
        title: "Atenção!",
        text: "Selecione pelo menos 1 estrela.",
        confirmButtonText: "OK",
      });
      return;
    }

    // VERIFICA COMENTÁRIO
    if (!comentario.trim()) {

      Swal.fire({
        icon: "warning",
        title: "Atenção!",
        text: "Escreva uma avaliação.",
        confirmButtonText: "OK",
      });
      return;
    }

    // IMPOSSIBILITA AUTOAVALIAÇÃO
    //if (Number(avaliadorId) === Number(avaliadoId)) {
    //Swal.fire({
        //icon: "warning",
        //title: "Atenção!",
        //text: "Você não pode avaliar a si mesmo.",
        //confirmButtonText: "Entendi",
    //});

    //return;
//}

    // VERIFICA GRUPO
    const grupo = divisoesUsuarioState[0];

    if (!grupo) {
      Swal.fire({
        icon: "warning",
        title: "Atenção!",
        text: displayName + " e você não tem nenhuma divisão em comum.",
        confirmButtonText: "OK",
      });
      return;
    } try {

      // DADOS DA AVALIAÇÃO 
      const dadosAvaliacao = {
        ava_nota: avaliacao,
        ava_descricao: comentario.trim(),
        ava_avaliado: Number(user?.id),
        ava_avaliador: Number(user?.id),
        ava_grupo: Number(grupo.id),
      };

      const response = await fetch(
        "http://localhost:3344/avaliacoes",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body:
            JSON.stringify(
              dadosAvaliacao
            ),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Erro ao enviar avaliação."
        );
      }

      // MARCA COMO ENVIADA
      setAvaliacaoEnviada(true);

      // FECHA O MODAL
      setMostrarComentario(false);

      // LIMPA O COMENTÁRIO
      setComentario("");

      // ADICIONA A NOVA AVALIAÇÃO NA TELA
      const novaAvaliacao: Feedback = {
        id: Date.now(),
        name: displayName,
        rating: avaliacao,
        text: comentario.trim(),
        avatar: user?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`,
       };

      setFeedbacks(
        (prev) => [
          novaAvaliacao,
          ...prev,
        ]
      );

      // Volta para o primeiro card
      setCurrentIndex(0);

      // MENSAGENS APÓS ENVIAR AVALIAÇÃO
      Swal.fire({
        icon: "success",
        title: "Avaliação enviada!",
        text: "Sua avaliação foi registrada.",
        confirmButtonText: "OK",
      });} catch (error) {
            console.error(
              "Erro ao enviar avaliação:",
              error
            );

      Swal.fire({
        icon: "error",
        title: "Erro!",
        text: "Não foi possível enviar sua avaliação.",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <>
      <section className="perfil-participante-container">

        <section className="perfil-participante-fundo">
          <button
            type="button"
            className="IconCancelar-perfilParticipante"
            onClick={() =>
              navigate("/home")
            }
          > <IoCloseSharp size={25} />
          </button>
        </section>

        <div className="cabecalho-participante">

          <div className="foto-participante">
            {user?.picture ? (
              <button
                type="button"
                className="foto-participante-button"
                onClick={() =>
                  setFotoZoom(true)
                } aria-label="Ampliar foto do usuário"
              >
                <img
                  src={user.picture}
                  alt={
                    user.name ||
                    "Usuário"
                  }
                  className="participante-user-avatar"
                  referrerPolicy="no-referrer"
                />
              </button>
            ) : (
              <span className="participante-user-avatar-fallback">
                {user?.name
                  ?.trim()
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  "U"}
              </span>
            )}
          </div>

          <div className="dados-usuario">
            <div className="estrelas">
              {[1, 2, 3, 4, 5].map((estrela) => (
                <span key={estrela} className="estrela" title="Média das avaliações recebidas.">
                  <IoMdStar
                    className={
                      estrela <= Math.round(mediaAvaliacoes)
                        ? "estrela-preenchida"
                        : "estrela-vazia"
                    }
                  />
                </span>
              ))}
            </div>
            <h1 className="nome-usuario">{displayName}</h1>
          </div>

        </div>

      {/** DIALOG DA FOTO*/}
        {fotoZoom &&
          user?.picture && (
            <div
              className="foto-dialog-overlay"
              onClick={() =>
                setFotoZoom(false)
              }
            >
              <div
                className="foto-dialog"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >
                <button
                  type="button"
                  className="foto-dialog-fechar"
                  onClick={() =>
                    setFotoZoom(false)
                  }aria-label="Fechar foto"
                ><IoCloseSharp size={28}/>
                </button>
                <img
                  src={user.picture}
                  alt={
                    user.name ||
                    "Usuário"
                  }
                  className="foto-dialog-imagem"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

        {/* DESCRIÇÃO DO USUÁRIO */}

        <div className="descricao-usuario">
          <h3> {descricaoUsuario || "Este usuário ainda não adicionou uma descrição."} </h3>
        </div>

        {/* AVALIAR USUÁRIO */}

        <div className="avaliar-usuario">
          <span className="estrela2">★</span>

          <div className="textos-avaliacao">
            <h1>Já dividiu algo com esse usuário?</h1>
            <h2>Deixe sua avaliação e ajude outros usuários.</h2>
          </div>

          <div className="estrelas-avaliar">
            <div className="estrela-button">
              {[1, 2, 3, 4, 5].map((estrela) => (
                  <IoMdStar
                    key={estrela}
                    className={
                      estrela <= avaliacao
                        ? "estrela-preenchida"
                        : "estrela-vazia"
                    } onClick={() => {
                      if (
                        !avaliacaoEnviada
                      ) {
                        setAvaliacao(
                          estrela
                        );
                      }
                    }}
                  />
                )
              )}
            </div>
            <h3>Clique nas estrelas para avaliar</h3>
          </div>

          <button
            type="button"
            className="check-avaliacao-button"
            onClick={() => {
              if (
                avaliacaoEnviada
              ) {
                return;
              }
              if (
                avaliacao === 0
              ) {
                Swal.fire({
                  icon: "warning",
                  title: "Atenção!",
                  text: "Selecione pelo menos 1 estrela.",
                  confirmButtonText: "OK",
                });
                return;
              }

              setMostrarComentario(
                true
              );
            }}
          >
            <FaCircleCheck
              className={
                avaliacaoEnviada
                  ? "check-avaliacao enviado"
                  : "check-avaliacao"
              }
            />
          </button>
        </div>

        {/* MODAL DA AVALIAÇÃO */}
        <Dialog
          open={mostrarComentario}
          onOpenChange={
            setMostrarComentario
          }
        >
          {mostrarComentario ? (

            <DialogContent>
              <button
                type="button"
                className="IconCancelar-avaliacao"
                onClick={() =>
                  setMostrarComentario(
                    false
                  )
                }
              >
                <IoCloseSharp
                  size={25}
                />
              </button>

              <DialogHeader>
                <DialogTitle> Como foi essa parceria?</DialogTitle>
                <DialogDescription><p>Diga o que achou de dividir com esse usuário.</p></DialogDescription>
              </DialogHeader>

              <textarea
                className="avaliacao-dialog__textarea"
                value={comentario}
                onChange={(e) =>
                  setComentario(
                    e.target.value
                  )
                }
                placeholder="Escreva seu feedback..."
                maxLength={200}
              />

              <div className="avaliacao-dialog__estrelas">
                {[1, 2, 3, 4, 5].map((estrela) => (
                    <IoMdStar
                      key={estrela}
                      className={
                        estrela <= avaliacao
                          ? "estrela-preenchida"
                          : "estrela-vazia"
                      }
                    />
                  )
                )}
                
              </div>

              <button
                type="button"
                className="avaliacao-dialog__enviar"
                onClick={
                  enviarAvaliacao
                }
              >
                Enviar feedback
              </button>

            </DialogContent>
          ) : null}

        </Dialog>


        {/* DIVISÕES */}
        <div className="participante-divisoes">

          <h1 className="titulo-participante">Divisões de {displayName}:</h1>
          {divisoesUsuarioState.length > 0 ? (
            <>

              <div className="participante-divisoes-carousel-wrapper">
                <button
                  type="button"
                  className="participante-divisoes-carousel-arrow participante-divisoes-carousel-arrow-left"
                  onClick={
                    goToPreviousDivisao
                  }
                  aria-label="Divisão anterior"
                >
                  <FaChevronLeft />
                </button>

                <div className="participante-divisoes-carousel">

                  <div className="participante-divisoes-carousel-track" style={{
                      transform: `translateX(-${
                        currentDivisaoIndex *
                        divisaoSlideWidth
                      }%)`,
                    }}
                  >
                    {divisoesUsuarioState.map(
                      (divisao) => (

                        <div key={ divisao.id}className="participante-divisao-slide">
                          <article
                            className="participante-divisao-card"
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              setDivisaoSelecionada(
                                divisao
                              )
                            }
                            onKeyDown={
                              (event) => {

                                if (
                                  event.key ===
                                    "Enter" ||
                                  event.key ===
                                    " "
                                ) {
                                  event.preventDefault();
                                  setDivisaoSelecionada(
                                    divisao
                                  );
                                }
                              }
                            }
                          >

                            <div className="participante-divisao-card-top">

                              <div className="participante-divisao-card-icone" style={{
                                  backgroundColor:
                                    getDivisaoColor(
                                      divisao.icone
                                    ),
                                }}
                              >

                                <span className="participante-divisao-card-lock"><FaLock /></span>
                                {getDivisaoIcon(
                                  divisao.icone
                                )}
                              </div>


                              <div className="participante-divisao-card-lider">
                                <img
                                  src={
                                    divisao.liderAvatar
                                  }
                                  alt={
                                    divisao.lider
                                  }
                                  className="participante-divisao-card-avatar"
                                />

                                <span>
                                  {divisao.lider}
                                </span>
                              </div>

                            </div>

                            <div className="participante-divisao-card-conteudo">
                              <span className="participante-divisao-card-categoria">{divisao.categoria}</span>
                              <h2>{divisao.nome}</h2>
                              <p>{divisao.valor} •{" "}
                                 {divisao.vagas}{" "} vagas disponíveis
                              </p>
                            </div>

                            <span className="participante-divisao-card-abrir">Ver divisão →</span>

                          </article>

                        </div>
                      )
                    )}

                  </div>

                </div>

                <button
                  type="button"
                  className="participante-divisoes-carousel-arrow participante-divisoes-carousel-arrow-right"
                  onClick={
                    goToNextDivisao
                  }
                  aria-label="Próxima divisão"
                >
                  <FaChevronRight />
                </button>

              </div>


              <div className="participante-divisoes-carousel-dots">
                {divisoesUsuarioState.map(
                  (_, index) => (
                    <button
                      type="button"
                      key={index}
                      className={`participante-divisao-dot ${
                        index ===
                        currentDivisaoIndex
                          ? "participante-divisao-dot-active"
                          : ""
                      }`}
                      onClick={() =>
                        goToDivisaoSlide(
                          index
                        )
                      }
                      aria-label={`Ir para divisão ${
                        index + 1
                      }`}
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
        <Dialog
          open={Boolean(
            divisaoSelecionada
          )}
          onOpenChange={(open) =>
            !open &&
            setDivisaoSelecionada(null)
          }
        >
          {divisaoSelecionada ? (
            <DialogContent className="participante-divisao-dialog">
              <DialogHeader>
                <div className="participante-divisao-dialog-header">
                  <div className="participante-divisao-dialog-icone" style={{
                      backgroundColor:
                        getDivisaoColor(
                          divisaoSelecionada.icone
                        ),
                    }}
                  >
                    {getDivisaoIcon(
                      divisaoSelecionada.icone
                    )}
                  </div>

                  <div>
                    <span className="participante-divisao-dialog-categoria">{divisaoSelecionada.categoria}</span>
                    <DialogTitle>{divisaoSelecionada.nome}</DialogTitle>
                  </div>
                </div>
              </DialogHeader>


              <div className="participante-divisao-dialog-body">
                <div className="participante-divisao-dialog-lider">
                  <img
                    src={
                      divisaoSelecionada.liderAvatar
                    }
                    alt={
                      divisaoSelecionada.lider
                    }
                  />
                  <div>
                    <span>Líder da divisão</span>
                    <strong>{divisaoSelecionada.lider}</strong>
                  </div>
                </div>

                <div className="participante-divisao-dialog-info">
                  <div>
                    <span>Valor</span>
                    <strong>{divisaoSelecionada.valor}</strong>
                  </div>

                  <div>
                    <span>Vagas disponíveis</span>
                    <strong>{divisaoSelecionada.vagas}</strong>
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
                <button
                  type="button" className="participante-feedback-carousel-arrow participante-feedback-carousel-arrow-left"
                  onClick={
                    goToPrevious
                  }
                  aria-label="Anterior"
                >
                  <FaChevronLeft />
                </button>

                <div className="participante-feedback-carousel">
                  <div className="participante-feedback-carousel-track" style={{
                      transform: `translateX(-${
                        currentIndex *
                        slideWidth
                      }%)`,
                    }}
                  >
                    {feedbacks.map(
                      (feedback) => (
                        <div key={ feedback.id } className="participante-feedback-slide">
                          <div className="participante-feedback-card">
                            <div className="participante-feedback-header">
                              <div className="participante-feedback-user-info">
                                <img
                                  src={
                                    feedback.avatar
                                  }
                                  alt={
                                    feedback.name
                                  }
                                  className="participante-feedback-avatar"
                                />
                                <div>
                                  <h3 className="participante-feedback-name">{feedback.name}</h3>
                                </div>
                              </div>

                              <div className="participante-feedback-rating">
                                {renderStars(
                                  feedback.rating
                                )}
                              </div>
                            </div>
                            <p className="participante-feedback-text">{feedback.text}</p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="participante-feedback-carousel-arrow participante-feedback-carousel-arrow-right"
                  onClick={
                    goToNext
                  }
                  aria-label="Próximo"
                >
                  <FaChevronRight />
                </button>
              </div>

              <div className="participante-feedback-carousel-dots">
                {feedbacks.map(
                  (_, index) => (
                    <button
                      type="button"
                      key={index}
                      className={`participante-feedback-dot ${
                        index ===
                        currentIndex
                          ? "participante-feedback-dot-active"
                          : ""
                      }`}
                      onClick={() =>
                        goToSlide(
                          index
                        )
                      }
                      aria-label={`Ir para avaliação ${
                        index + 1
                      }`}
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

// Precisa adicionar: Direcionar foto ou nome de usuário para a página de perfil do usuário. (perfilParticipante.tsx)
// Impossibilitar avaliação de si mesmo. (perfilParticipante.tsx)
// Impossibilitar avaliar mais de uma vez o mesmo usuário. (perfilParticipante.tsx)