import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import {
  FiDivideCircle,
  FiAlertTriangle,
  FiUpload,
  FiMoreHorizontal,
  FiLock,
  FiArrowDown,
} from "react-icons/fi";
import BolinhasBr from "../assets/Imgs/bolinhasBrancas.png";
import "../css/historico.css";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { FaTv, FaHouseUser, FaEllipsisH, FaCar, FaHome } from "react-icons/fa";
import { LoadingScreen } from "../components/LoadingScreen";

type CategoryKey = "streaming" | "viagens" | "despesas" | "outros";

const categoryButtons: Array<{ key: CategoryKey | "all"; label: string; icon: ReactNode }> = [
  { key: "all", label: "Todos", icon: <FaEllipsisH /> },
  { key: "viagens", label: "Viagens", icon: <FaCar /> },
  { key: "streaming", label: "Streamer", icon: <FaTv /> },
  { key: "despesas", label: "Custos Domésticos", icon: <FaHouseUser /> },
  { key: "outros", label: "Outros", icon: <FaEllipsisH /> },
];

type BackendGroup = {
  gru_id: number;
  gru_nome?: string | null;
  gru_descricao?: string | null;
  gru_num_part?: number | null;
  gru_num_vagas?: number | null;
  gru_icone?: string | null;
  gru_cor?: string | null;
  gru_visibilidade?: boolean | null;
  gru_criador_id?: number | null;
  gru_criador_nome?: string | null;

  criador?: {
    usu_id: number;
    usu_nome: string;
    usu_foto?: string | null;
  } | null;

  categoria?: {
    cat_id?: number;
    cat_nome: string;
  } | null;

  mensalidade?: {
    men_valor?: string | number | null;
  } | null;

  stream?: {
    str_valor?: string | number | null;
    str_plano?: string | null;
    str_telas?: number | null;
  } | null;

  viagem?: {
    via_partida?: string | null;
    via_destino?: string | null;
  } | null;

  item?: Array<{
    ite_valor: string | number;
  }>;

  participacoes?: Array<{
    par_id?: number;
    usu_id: number | string;
    usuario?: {
      usu_id: number | string;
      usu_nome: string;
      usu_foto?: string | null;
    } | null;
  }>;

  _count?: {
    participacoes: number;
  };
};

type RegistroHistorico = {
  grupo: string;
  pagamento: string;
  dataPagamento: string;
  vencimento: string;
  status: "Pago" | "Atrasado" | "Pendente" | string;
};

type RespostaHistorico = {
  mensagem: string;
  historico: RegistroHistorico[];
};

const getCategoryKey = (nome?: string | null, icone?: string | null): CategoryKey => {
  const valor = `${icone ?? ""} ${nome ?? ""}`.toLowerCase();

  if (valor.includes("stream")) return "streaming";
  if (valor.includes("viag")) return "viagens";
  if (valor.includes("desp") || valor.includes("domest") || valor.includes("custo")) {
    return "despesas";
  }

  return "outros";
};

const formatarBRL = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export function Historico() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [grupos, setGrupos] = useState<BackendGroup[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [historico, setHistorico] = useState<RegistroHistorico[]>([]);
  const [historicoCarregando, setHistoricoCarregando] = useState(true);
  const [historicoErro, setHistoricoErro] = useState("");

  const navigate = useNavigate();

const [grupoSelecionado, setGrupoSelecionado] =
  useState<BackendGroup | null>(null);

const usuarioAtualId = String(
  (user as unknown as {
    usu_id?: number | string;
    id?: number | string;
  })?.usu_id ??
  (user as unknown as {
    id?: number | string;
  })?.id ??
  ""
);

const obterFoto = (id: number | string, foto?: string | null) =>
  foto ||
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(id))}`;

const obterNomeGrupo = (grupo: BackendGroup) =>
  grupo.gru_nome?.trim() ||
  `${grupo.categoria?.cat_nome || "Divisão"} ${grupo.gru_id}`;

const obterNomeLider = (grupo: BackendGroup) =>
  grupo.criador?.usu_nome ||
  grupo.gru_criador_nome ||
  "Criador da divisão";

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3344";

  useEffect(() => {
    let ativo = true;

    async function buscarMinhasDivisoes() {
      if (!user?.token) {
        setErro("Você precisa estar autenticado para ver suas divisões.");
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro("");

      try {
        const resposta = await fetch(`${API_URL}/grupos/minhas-divisoes`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!resposta.ok) {
  const detalhes = await resposta.text();

  console.error("Erro ao buscar divisões:", {
    status: resposta.status,
    detalhes,
  });

  throw new Error(
    `Erro ${resposta.status}: ${detalhes}`
  );
}

        const dados: BackendGroup[] = await resposta.json();

        if (ativo) {
          setGrupos(Array.isArray(dados) ? dados : []);
        }
      } catch (error) {
        if (ativo) {
          setErro(error instanceof Error ? error.message : "Erro ao carregar suas divisões.");
          setGrupos([]);
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void buscarMinhasDivisoes();

    return () => {
      ativo = false;
    };
  }, [API_URL, user?.token]);

  useEffect(() => {
  let ativo = true;

  async function buscarHistorico() {
    if (!user?.token) {
      setHistoricoErro("Você precisa estar autenticado para ver o histórico.");
      setHistoricoCarregando(false);
      return;
    }

    setHistoricoCarregando(true);
    setHistoricoErro("");

    try {
      const resposta = await fetch(`${API_URL}/historico`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!resposta.ok) {
        const detalhes = await resposta.text();
        throw new Error(`Erro ${resposta.status}: ${detalhes}`);
      }

      const dados: RespostaHistorico = await resposta.json();

      if (ativo) {
        setHistorico(
          Array.isArray(dados.historico) ? dados.historico : []
        );
      }
    } catch (error) {
      if (ativo) {
        setHistoricoErro(
          error instanceof Error
            ? error.message
            : "Erro ao carregar o histórico financeiro."
        );
        setHistorico([]);
      }
    } finally {
      if (ativo) {
        setHistoricoCarregando(false);
      }
    }
  }

  void buscarHistorico();

  return () => {
    ativo = false;
  };
}, [API_URL, user?.token]);

  const handleCategoryChange = (category: CategoryKey | "all") => {
    const nextParams = new URLSearchParams(searchParams);

    if (category === "all") {
      nextParams.delete("categoria");
    } else {
      nextParams.set("categoria", category);
    }

    setSearchParams(nextParams);
  };

  const categoriaSelecionada = searchParams.get("categoria");
  const activeCategory: CategoryKey | "all" =
    categoriaSelecionada &&
    ["streaming", "viagens", "despesas", "outros"].includes(categoriaSelecionada)
      ? (categoriaSelecionada as CategoryKey)
      : "all";

  const gruposFiltrados = grupos.filter((grupo) => {
    const categoria = getCategoryKey(grupo.categoria?.cat_nome, grupo.gru_icone);
    return activeCategory === "all" || categoria === activeCategory;
  });

   if (carregando) {
    return <LoadingScreen forcar />;
  }

  return (
    <>
      <Nav />
      <main className="historico-main">
        <div className="historico-topo">
          <div className="container-graficos">
            <img src={BolinhasBr} alt="" className="gra-bolinhasbr" />
            <img src={BolinhasBr} alt="" className="gra-bolinhasbr2" />

            <div className="container-infograf">
              <p className="p-infograf">
                <span className="txt-infograf">Você economizou</span>
                <br />
                <span className="txt-verde">R$10.000</span>
                <br />
                <span className="txt-infograf3">
                  Comparando com o valor<br />
                  que você pagaria <i>sozinho.</i>
                </span>
              </p>
            </div>

            <div className="grafico-comparativo" aria-label="Comparação entre pagar sozinho e dividir: 20 mil contra 10 mil reais">
              <div className="grafico-area">
                <div className="grafico-item">
                  <span className="grafico-valor">20.000</span>
                  <div className="grafico-barra barra-azul" />
                </div>
                <div className="grafico-item">
                  <span className="grafico-valor">10.000</span>
                  <div className="grafico-barra barra-verde" />
                </div>
              </div>
              <div className="grafico-legendas">
                <span>Pagando sozinho</span>
                <span>Com o <i>DivideAqui</i></span>
              </div>
            </div>

            <button type="button" className="btn-upload" aria-label="Compartilhar resultado">
              <FiUpload className="icon-upload" />
            </button>
          </div>

          <div className="container-status">
            <div className="container-totaldiv">
              <div className="icon-dividediv"><FiDivideCircle className="icon-divide" /></div>
              <p className="p-totaldiv">Total de Divisões</p>
              <p className="num-totaldiv">{grupos.length}</p>
            </div>
            <div className="container-atrasados">
              <div className="icon-alertdiv"><FiAlertTriangle className="icon-alert" /></div>
              <p className="p-atrasados">Atrasados</p>
              <p className="num-atrasados">0</p>
            </div>
          </div>
        </div>

        <div className="div-suasdivisoes">
          <h1 className="h1-suasdivisoes">Suas Divisões</h1>
          <div className="DivServicos">
            {categoryButtons.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleCategoryChange(key)}
                aria-pressed={activeCategory === key}
                className={activeCategory === key ? "is-active" : ""}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        <section className=
        {`Sct-suasdivisoes ${gruposFiltrados.length === 0 ? 
        "sem-grupos" : ""}`}aria-label="Cartões das suas divisões">
          {carregando ? (
            <p>Carregando suas divisões...</p>
          ) : erro ? (
            <p role="alert">{erro}</p>
          ) : gruposFiltrados.length === 0 ? (
            <p>
              {grupos.length === 0
                ? "Você ainda não participa de nenhuma divisão."
                : "Nenhuma divisão encontrada nesta categoria."}
            </p>
          ) : (
            gruposFiltrados.map((grupo) => {
              const categoria = getCategoryKey(grupo.categoria?.cat_nome, grupo.gru_icone);
              const participantes = grupo.participacoes ?? [];
              const quantidadeParticipantes = grupo._count?.participacoes ?? participantes.length;

              const capacidade = grupo.stream?.str_telas ?? grupo.gru_num_vagas ?? grupo.gru_num_part ?? quantidadeParticipantes;
              const vagasDisponiveis = Math.max(0, capacidade - quantidadeParticipantes);

              const valorItens = (grupo.item ?? []).reduce(
                (total, item) => total + Number(item.ite_valor || 0),
                0
              );

              const valorStreaming = grupo.stream?.str_valor != null
                ? Number(grupo.stream.str_valor)
                : null;

              const valorMensalidade = grupo.mensalidade?.men_valor != null
                ? Number(grupo.mensalidade.men_valor)
                : null;

              const valorTotal = valorStreaming ?? valorMensalidade ?? valorItens;
              const valorPorPessoa = categoria === "streaming" && quantidadeParticipantes > 0
                ? valorTotal / quantidadeParticipantes
                : valorTotal;

              const corAzul = categoria === "streaming";

              const icone = categoria === "streaming" ? (
                <FaTv />
              ) : categoria === "viagens" ? (
                <FaCar />
              ) : categoria === "despesas" ? (
                <FaHome />
              ) : (
                <FaEllipsisH />
              );

              return (
  <article
    className="card-divisao"
    key={grupo.gru_id}
    role="button"
    tabIndex={0}
    onClick={() => setGrupoSelecionado(grupo)}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setGrupoSelecionado(grupo);
      }
    }}
  >
    <div
      className={`card-icone ${corAzul ? "icone-prime" : "icone-verde"}`}
      style={{
        backgroundColor: grupo.gru_cor || undefined,
      }}
    >
      {icone}
    </div>

    {grupo.gru_visibilidade === false && (
      <FiLock
        className="card-cadeado"
        aria-label="Divisão privada"
      />
    )}

    <div
      className="card-participantes"
      aria-label={`${quantidadeParticipantes} participantes`}
    >
      {participantes.slice(0, 4).map((participacao, index) => {
        const idParticipante = String(
          participacao.usuario?.usu_id ?? participacao.usu_id
        );

        const nomeParticipante =
          participacao.usuario?.usu_nome || `Usuário ${idParticipante}`;

        const fotoParticipante = obterFoto(
          idParticipante,
          participacao.usuario?.usu_foto
        );

        const ehUsuarioAtual = idParticipante === usuarioAtualId;

        return (
          <button
            key={`${grupo.gru_id}-${idParticipante}-${index}`}
            type="button"
            className="historico-participante-avatar"
            title={ehUsuarioAtual ? nomeParticipante : `Ver perfil de ${nomeParticipante}`}
            aria-label={
              ehUsuarioAtual
                ? `Você: ${nomeParticipante}`
                : `Ver perfil de ${nomeParticipante}`
            }
            onClick={(event) => {
              event.stopPropagation();

              if (!ehUsuarioAtual) {
                navigate(`/perfilparticipante/${idParticipante}`);
              }
            }}
            disabled={ehUsuarioAtual}
          >
            <img
              src={fotoParticipante}
              alt={nomeParticipante}
            />
          </button>
        );
      })}
    </div>

    <div className="card-conteudo">
      <div className="card-informacoes">
        <h3>
          {obterNomeGrupo(grupo)}
        </h3>

        <strong className={corAzul ? "preco-azul" : "preco-verde"}>
          {formatarBRL(valorPorPessoa)}
        </strong>
      </div>

      <p>Vagas disponíveis: {vagasDisponiveis}</p>
    </div>

    <button
      type="button"
      className={`card-opcoes ${corAzul ? "opcoes-azul" : "opcoes-verde"}`}
      aria-label={`Ver detalhes de ${obterNomeGrupo(grupo)}`}
      onClick={(event) => {
        event.stopPropagation();
        setGrupoSelecionado(grupo);
      }}
    >
      <FiMoreHorizontal />
    </button>
  </article>
);
            })
          )}
        </section>

        <Dialog
  open={Boolean(grupoSelecionado)}
  onOpenChange={(open) => {
    if (!open) setGrupoSelecionado(null);
  }}
>
  {grupoSelecionado && (() => {
    const grupo = grupoSelecionado;
    const categoria = getCategoryKey(
      grupo.categoria?.cat_nome,
      grupo.gru_icone
    );

    const participantes = grupo.participacoes ?? [];
    const quantidade = grupo._count?.participacoes ?? participantes.length;

    const valorStreaming =
      grupo.stream?.str_valor != null
        ? Number(grupo.stream.str_valor)
        : null;

    const valorMensalidade =
      grupo.mensalidade?.men_valor != null
        ? Number(grupo.mensalidade.men_valor)
        : null;

    const valorItens = (grupo.item ?? []).reduce(
      (total, item) => total + Number(item.ite_valor || 0),
      0
    );

    const valorTotal =
      valorStreaming ?? valorMensalidade ?? valorItens;

    const valorPorPessoa =
      categoria === "streaming" && quantidade > 0
        ? valorTotal / quantidade
        : valorTotal;

    const capacidade =
      grupo.stream?.str_telas ??
      grupo.gru_num_vagas ??
      grupo.gru_num_part ??
      quantidade;

    const vagas = Math.max(0, capacidade - quantidade);

    return (
      <DialogContent className="historico-grupo-dialog">
        <DialogHeader>
          <DialogTitle>
            {obterNomeGrupo(grupo)}
          </DialogTitle>

          <DialogDescription>
            {grupo.gru_descricao?.trim() ||
              "Confira as informações desta divisão."}
          </DialogDescription>
        </DialogHeader>

        <div className="historico-grupo-detalhes">
          <p>
            <strong>Categoria:</strong>{" "}
            {grupo.categoria?.cat_nome || "Outros"}
          </p>

          <p>
            <strong>Líder:</strong> {obterNomeLider(grupo)}
          </p>

          <p>
            <strong>Valor:</strong>{" "}
            {formatarBRL(valorPorPessoa)}
            {categoria === "streaming" ? " por pessoa" : ""}
          </p>

          {categoria === "streaming" && (
            <>
              <p>
                <strong>Plano:</strong>{" "}
                {grupo.stream?.str_plano || "Não informado"}
              </p>

              <p>
                <strong>Valor total do plano:</strong>{" "}
                {valorStreaming != null
                  ? formatarBRL(valorStreaming)
                  : "Não informado"}
              </p>
            </>
          )}

          {categoria === "viagens" && (
            <>
              <p>
                <strong>Partida:</strong>{" "}
                {grupo.viagem?.via_partida || "Não informada"}
              </p>

              <p>
                <strong>Destino:</strong>{" "}
                {grupo.viagem?.via_destino || "Não informado"}
              </p>
            </>
          )}

          <p>
            <strong>Participantes:</strong> {quantidade}
          </p>

          <p>
            <strong>Vagas disponíveis:</strong> {vagas}
          </p>

          <p>
            <strong>Visibilidade:</strong>{" "}
            {grupo.gru_visibilidade === false ? "Privado" : "Público"}
          </p>

          <div className="historico-grupo-membros">
            <strong>Participantes do grupo</strong>

            <div className="historico-grupo-membros-lista">
              {participantes.map((participacao, index) => {
                const id = String(
                  participacao.usuario?.usu_id ?? participacao.usu_id
                );

                const nome =
                  participacao.usuario?.usu_nome || `Usuário ${id}`;

                const ehUsuarioAtual = id === usuarioAtualId;

                return (
                  <button
                    key={`${grupo.gru_id}-${id}-${index}`}
                    type="button"
                    className="historico-grupo-membro"
                    disabled={ehUsuarioAtual}
                    onClick={() => {
                      if (!ehUsuarioAtual) {
                        setGrupoSelecionado(null);
                        navigate(`/perfilparticipante/${id}`);
                      }
                    }}
                  >
                    <img
                      src={obterFoto(
                        id,
                        participacao.usuario?.usu_foto
                      )}
                      alt={nome}
                    />

                    <span>
                      {nome}
                      {ehUsuarioAtual ? " (você)" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
             <button
            type="button"
            className="historico-grupo-btn-detalhe"
            onClick={() => {
              setGrupoSelecionado(null);
              navigate(`/detalhedivisao/${grupo.gru_id}`);
            }}
          >Detalhe da Divisão</button>
        </div>
      </DialogContent>
    );
  })()}
</Dialog>

        <section className="section-tabela-historico" aria-labelledby="titulo-resumo-financeiro">
          <h2 className="resumo-financeiro" id="titulo-resumo-financeiro">Resumo Financeiro</h2>
          <div className="container-tabela-historico" role="region" aria-label="Tabela de resumo financeiro" tabIndex={0}>
            <table className="tabela-historico">
  <thead>
    <tr>
      <th scope="col">Grupo</th>
      <th scope="col">Pagamento</th>
      <th scope="col">Data do pagamento</th>
      <th scope="col">Vencimento</th>
      <th scope="col">Status</th>
    </tr>
  </thead>

  <tbody>
    {historicoCarregando ? (
      <tr>
        <td colSpan={5}>Carregando histórico financeiro...</td>
      </tr>
    ) : historicoErro ? (
      <tr>
        <td colSpan={5}>{historicoErro}</td>
      </tr>
    ) : historico.length === 0 ? (
      <tr>
        <td colSpan={5} className="sem-movimentacoes">
          Você ainda não possui movimentações financeiras.
        </td>
      </tr>
    ) : (
      historico.map((registro, index) => (
        <tr key={`${registro.grupo}-${index}`}>
          <td>{registro.grupo}</td>

          <td>
            <span className="valor-destaque">
              {registro.pagamento}
            </span>
          </td>

          <td>{registro.dataPagamento}</td>

          <td>{registro.vencimento}</td>

          <td
            className={
              registro.status === "Atrasado"
                ? "status-atrasado"
                : registro.status === "Pago"
                  ? "status-pago"
                  : "status-pendente"
            }
          >
            {registro.status}
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>
            {!historicoCarregando && !historicoErro && historico.length > 0 && (
            <div className="container-seta-tabela">
              <button
                type="button"
                className="btn-seta-tabela"
                aria-label="Mostrar mais registros"
              >
                <FiArrowDown />
              </button>
            </div>
          )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}