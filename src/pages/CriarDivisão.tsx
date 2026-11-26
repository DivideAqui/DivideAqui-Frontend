import "../css/CriarDivisão.css";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { MdAddCircleOutline } from "react-icons/md";
import { FaUnlock } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import BtnClose from "../components/btnClose";
import {
  FaArrowCircleLeft,
  FaArrowCircleRight,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaCar,
  FaHouseUser,
  FaTv,
  FaUsers,
} from "react-icons/fa";
import { FiArrowLeft, FiArrowRight, FiMinus, FiPlus } from "react-icons/fi";
import { MdOutlineAttachMoney } from "react-icons/md";
import { FaDivide } from "react-icons/fa6";
import { CiCircleInfo } from "react-icons/ci";
import { useAuth } from "../hooks/useAuth";
import { useCpfUsuario } from "../hooks/useCpfUsuario";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../css/sweetAlert/sweetAlert.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const categoriaPorDivisao: Record<string, number> = {
  viagens: 3,
  streaming: 1,
  despesas: 2,
  outros: 2,
};

type SugestaoEndereco = {
  id: string;
  place_name: string;
  center: [number, number];
};

type GeometriaRota = {
  type: "LineString";
  coordinates: [number, number][];
};

type PlanoCatalogoStreaming = {
  servico: string;
  plano: string;
  preco: number | null;
  telas: number | null;
};

const catalogoStreaming: PlanoCatalogoStreaming[] = [
  { servico: "Netflix", plano: "Padrão c/ anúncios", preco: 20.90, telas: 2 },
  { servico: "Netflix", plano: "Padrão", preco: 44.90, telas: 2 },
  { servico: "Netflix", plano: "Premium", preco: 59.90, telas: 4 },
  { servico: "Disney+", plano: "Padrão c/ anúncios", preco: 29.90, telas: 2 },
  { servico: "Disney+", plano: "Padrão", preco: 49.90, telas: 2 },
  { servico: "Disney+", plano: "Premium", preco: 69.90, telas: 4 },
  { servico: "Max", plano: "Básico c/ anúncios", preco: 29.90, telas: 2 },
  { servico: "Max", plano: "Standard", preco: 39.90, telas: 2 },
  { servico: "Max", plano: "Platinum", preco: 55.90, telas: 4 },
  { servico: "Prime Video", plano: "Prime", preco: 19.90, telas: 3 },
  { servico: "Apple TV+", plano: "Apple TV+", preco: 34.90, telas: null },
  { servico: "Spotify", plano: "Duo", preco: 31.90, telas: 2 },
  { servico: "Spotify", plano: "Família", preco: 40.90, telas: 6 },
  { servico: "Apple Music", plano: "Família", preco: 40.90, telas: 6 },
  { servico: "YouTube Premium", plano: "Família", preco: 49.90, telas: null },
  { servico: "Deezer", plano: "Família", preco: 39.90, telas: 6 },
  { servico: "TIDAL", plano: "Família", preco: null, telas: null },
  { servico: "Amazon Music Unlimited", plano: "Família", preco: null, telas: 6 },
  { servico: "Crunchyroll", plano: "Mega Fan", preco: 17.99, telas: 4 },
  { servico: "Crunchyroll", plano: "Ultimate Fan", preco: 23.99, telas: 6 },
  { servico: "MUBI", plano: "MUBI", preco: 34.90, telas: 2 },
  { servico: "Premiere", plano: "Plano anual", preco: 29.90, telas: 3 },
  { servico: "DAZN", plano: "Anual", preco: null, telas: 2 },
  { servico: "NBA League Pass", plano: "Normal", preco: null, telas: 1 },
  { servico: "NBA League Pass", plano: "Premium", preco: null, telas: 3 },
  { servico: "Audible", plano: "Audible", preco: 19.90, telas: null },
  { servico: "Ubook", plano: "Premium", preco: 18.90, telas: null },
  { servico: "Ubook", plano: "Premium+", preco: 26.90, telas: null },
  { servico: "Nintendo Switch Online", plano: "Família", preco: null, telas: null },
  { servico: "Apple One", plano: "Familiar", preco: null, telas: null },
  { servico: "Google One", plano: "Família", preco: null, telas: null },
  { servico: "Microsoft 365", plano: "Family", preco: null, telas: null },
];

const planosComPrecoAproximado = new Set([
  "YouTube Premium|Família",
  "Deezer|Família",
  "Crunchyroll|Mega Fan",
  "Crunchyroll|Ultimate Fan",
  "MUBI|MUBI",
  "Premiere|Plano anual",
]);

const formatarBRL = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export function CriarDivisão() {
  const { user } = useAuth();
  const { garantirCpf } = useCpfUsuario(user);
  const navigate = useNavigate();
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [divisaoSelecionada, setDivisaoSelecionada] = useState<string | null>(null);
  const [nomeDoGrupo, setNomeDoGrupo] = useState("");
  const [descricaoDoGrupo, setDescricaoDoGrupo] = useState("");
  const [visibilidade, setVisibilidade] = useState("");
  const [numeroDeParticipantes, setNumeroDeParticipantes] = useState("");
  const [animacaoParticipantes, setAnimacaoParticipantes] = useState<{ anterior: string; atual: string } | null>(null);
  const timeoutAnimacaoParticipantes = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [streamingSelecionado, setStreamingSelecionado] = useState("");
  const [planoSelecionado, setPlanoSelecionado] = useState("");
  const [valorStreaming, setValorStreaming] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [endereco, setEndereco] = useState("");
  const [localPartida, setLocalPartida] = useState("");
  const [localDestino, setLocalDestino] = useState("");
  const [localizacaoPartida, setLocalizacaoPartida] = useState<SugestaoEndereco | null>(null);
  const [localizacaoDestino, setLocalizacaoDestino] = useState<SugestaoEndereco | null>(null);
  const [dataPartida, setDataPartida] = useState("");
  const [dataRetorno, setDataRetorno] = useState("");
  const [despesasAdicionais, setDespesasAdicionais] = useState<Array<{ id: string; nome: string; valor: string }>>([]);
  const [sugestoesEndereco, setSugestoesEndereco] = useState<SugestaoEndereco[]>([]);
  const [sugestoesPartida, setSugestoesPartida] = useState<SugestaoEndereco[]>([]);
  const [sugestoesDestino, setSugestoesDestino] = useState<SugestaoEndereco[]>([]);
  const [localizacaoEndereco, setLocalizacaoEndereco] = useState<SugestaoEndereco | null>(null);
  const mapaRef = useRef<HTMLDivElement | null>(null);
  const mapaViagemRef = useRef<HTMLDivElement | null>(null);
  const [erroValidacao, setErroValidacao] = useState("");
  const [criandoDivisao, setCriandoDivisao] = useState(false);

  const etapasLegado = [
    "Escolha o ícone e cor ideal para seu grupo!",
    "Confira os valores",
    "Revise sua divisão",
  ];
  const etapasStreaming = [
    "Informações do grupo",
    "Configuração do Streaming",
  ];
  const etapasViagem = [
    "Informações do grupo",
    "Como será o pagamento?",
    "Informações da viagem",
  ];
  const etapasDespesas = [
    "Informações do grupo",
    "Como será o pagamento?",
    "Endereço da residência",
  ];
  const etapasOutros = [
    "Informações do grupo",
    "Como será o pagamento?",
    "Adicionar despesas",
  ];
  const fluxoStreaming = divisaoSelecionada === "streaming";
  const fluxoViagem = divisaoSelecionada === "viagens";
  const fluxoDespesas = divisaoSelecionada === "despesas";
  const fluxoOutros = divisaoSelecionada === "outros";
  const etapas = fluxoViagem ? etapasViagem : fluxoStreaming ? etapasStreaming : fluxoDespesas ? etapasDespesas : fluxoOutros ? etapasOutros : etapasLegado;
  const tituloEtapa = !divisaoSelecionada ? "O que você quer dividir?" : etapas[etapaAtual];
  const servicosStreaming = [...new Set(catalogoStreaming.map(({ servico }) => servico))];
  const planosDoServico = catalogoStreaming.filter(({ servico }) => servico === streamingSelecionado);
  const planoStreamingAtual = catalogoStreaming.find(({ servico, plano }) => servico === streamingSelecionado && plano === planoSelecionado);
  const precoEditavel = planoStreamingAtual
    ? planoStreamingAtual.preco === null || planosComPrecoAproximado.has(`${planoStreamingAtual.servico}|${planoStreamingAtual.plano}`)
    : false;
  const totalStreaming = Number(valorStreaming);
  const quantidadeParticipantesStreaming = Number(numeroDeParticipantes);
  const participantesStreamingValidos = Number.isInteger(quantidadeParticipantesStreaming)
    && quantidadeParticipantesStreaming >= 2
    && (planoStreamingAtual?.telas === null || planoStreamingAtual?.telas === undefined || quantidadeParticipantesStreaming <= planoStreamingAtual.telas);
  const valorPorParticipante = Number.isFinite(totalStreaming) && totalStreaming > 0 && participantesStreamingValidos
    ? Math.round((Math.round(totalStreaming * 100) / quantidadeParticipantesStreaming) + Number.EPSILON) / 100
    : null;

  const selecionarDivisao = (divisao: string) => {
    setDivisaoSelecionada(divisao);
    setEtapaAtual(0);
    setErroValidacao("");
  };

  const atualizarNumeroParticipantes = (valor: string) => {
    const anterior = numeroDeParticipantes;
    if (valor === "") {
      if (timeoutAnimacaoParticipantes.current) clearTimeout(timeoutAnimacaoParticipantes.current);
      timeoutAnimacaoParticipantes.current = null;
      setAnimacaoParticipantes(null);
      setNumeroDeParticipantes("");
      return;
    }

    const numero = Number(valor);
    const atual = String(Math.max(0, numero));
    if (anterior && atual !== anterior) {
      setAnimacaoParticipantes({ anterior, atual });
      if (timeoutAnimacaoParticipantes.current) clearTimeout(timeoutAnimacaoParticipantes.current);
      timeoutAnimacaoParticipantes.current = setTimeout(() => {
        setAnimacaoParticipantes(null);
        timeoutAnimacaoParticipantes.current = null;
      }, 280);
    }
    setNumeroDeParticipantes(atual);
  };

  useEffect(() => () => {
    if (timeoutAnimacaoParticipantes.current) clearTimeout(timeoutAnimacaoParticipantes.current);
  }, []);

  const buscarEndereco = async (valor: string) => {
    setEndereco(valor);
    if (valor.trim().length < 3) {
      setLocalizacaoEndereco(null);
      setSugestoesEndereco([]);
      return;
    }

    try {
      const resposta = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(valor)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&country=br&language=pt&limit=5`);
      if (!resposta.ok) return;
      const dados: { features: SugestaoEndereco[] } = await resposta.json();
      setSugestoesEndereco(dados.features);
      setLocalizacaoEndereco(dados.features[0] ?? null);
    } catch {
      setSugestoesEndereco([]);
      setLocalizacaoEndereco(null);
    }
  };

  const buscarLocalViagem = async (
    valor: string,
    atualizarSugestoes: (sugestoes: SugestaoEndereco[]) => void,
    atualizarLocalizacao: (sugestao: SugestaoEndereco | null) => void,
  ) => {
    atualizarLocalizacao(null);
    if (valor.trim().length < 3) {
      atualizarSugestoes([]);
      return;
    }

    try {
      const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
      const resposta = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(valor)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&country=br&language=pt&limit=5`);
      if (!resposta.ok) return;
      const dados: { features: SugestaoEndereco[] } = await resposta.json();
      atualizarSugestoes(dados.features);
      atualizarLocalizacao(dados.features[0] ?? null);
    } catch {
      atualizarSugestoes([]);
    }
  };

  const selecionarEndereco = (valor: string) => {
    setEndereco(valor);
    const sugestao = sugestoesEndereco.find((item) => item.place_name === valor);
    setLocalizacaoEndereco(sugestao ?? null);
  };

  useEffect(() => {
    if (!mapaRef.current || !localizacaoEndereco) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const mapa = new mapboxgl.Map({
      container: mapaRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: localizacaoEndereco.center,
      zoom: 13,
      attributionControl: true,
    });

    new mapboxgl.Marker({ color: "#03045E" })
      .setLngLat(localizacaoEndereco.center)
      .addTo(mapa);

    return () => mapa.remove();
  }, [localizacaoEndereco]);

  useEffect(() => {
    if (!mapaViagemRef.current || (!localizacaoPartida && !localizacaoDestino)) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const pontoInicial = localizacaoPartida?.center ?? localizacaoDestino?.center ?? [0, 0];
    const mapa = new mapboxgl.Map({
      container: mapaViagemRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: pontoInicial,
      zoom: localizacaoPartida && localizacaoDestino ? 6 : 12,
      attributionControl: true,
    });
    const marcadores = [localizacaoPartida, localizacaoDestino]
      .filter((local): local is SugestaoEndereco => Boolean(local))
      .map((local) => new mapboxgl.Marker({ color: "#03045E" }).setLngLat(local.center).addTo(mapa));

    mapa.once("load", async () => {
      if (!localizacaoPartida || !localizacaoDestino) return;

      const origem = localizacaoPartida.center.join(",");
      const destino = localizacaoDestino.center.join(",");
      const resposta = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${origem};${destino}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`);
      if (!resposta.ok) return;

      const dados: { routes?: Array<{ geometry: GeometriaRota }> } = await resposta.json();
      const geometria = dados.routes?.[0]?.geometry;
      if (!geometria || mapa.getSource("trajeto-viagem")) return;

      mapa.addSource("trajeto-viagem", {
        type: "geojson",
        data: geometria,
      });
      mapa.addLayer({
        id: "trajeto-viagem-linha",
        type: "line",
        source: "trajeto-viagem",
        paint: {
          "line-color": "#03045E",
          "line-width": 4,
          "line-opacity": 0.85,
        },
      });

      const limites = new mapboxgl.LngLatBounds();
      limites.extend(localizacaoPartida.center);
      limites.extend(localizacaoDestino.center);
      mapa.fitBounds(limites, { padding: 40, maxZoom: 12 });
    });

    return () => {
      marcadores.forEach((marcador) => marcador.remove());
      mapa.remove();
    };
  }, [localizacaoPartida, localizacaoDestino]);

  const etapaValida = () => {
    if (!divisaoSelecionada) return false;
    if (etapaAtual === 0) {
      if (fluxoStreaming) {
        return Boolean(nomeDoGrupo && descricaoDoGrupo && visibilidade);
      }
      return Boolean(nomeDoGrupo && descricaoDoGrupo && visibilidade && numeroDeParticipantes);
    }
    if (fluxoViagem && etapaAtual === 1) return Boolean(formaPagamento);
    if (fluxoViagem && etapaAtual === 2) {
      return Boolean(localPartida && localDestino && dataPartida && dataRetorno) &&
        despesasAdicionais.every((despesa) => despesa.nome.trim() && despesa.valor !== "" && Number.isFinite(Number(despesa.valor)) && Number(despesa.valor) >= 0);
    }
    if (fluxoDespesas && etapaAtual === 2) {
      return despesasAdicionais.every((despesa) => despesa.nome.trim() && despesa.valor !== "" && Number.isFinite(Number(despesa.valor)) && Number(despesa.valor) >= 0);
    }
    if (fluxoStreaming) {
      return Boolean(
        planoStreamingAtual &&
        Number.isFinite(totalStreaming) &&
        totalStreaming > 0 &&
        participantesStreamingValidos &&
        dataVencimento,
      );
    }
    if ((fluxoDespesas || fluxoOutros) && etapaAtual === 1) return Boolean(formaPagamento);
    if (fluxoOutros && etapaAtual === 2) {
      return despesasAdicionais.every((despesa) => despesa.nome.trim() && despesa.valor !== "" && Number.isFinite(Number(despesa.valor)) && Number(despesa.valor) >= 0);
    }
    return true;
  };

  const avancar = () => {
    if (!etapaValida()) {
      setErroValidacao(fluxoStreaming && etapaAtual === 1 && !participantesStreamingValidos
        ? "Informe um número inteiro de participantes igual ou maior que 2 e dentro do limite de telas do plano."
        : "Preencha os campos obrigatórios para continuar.");
      return;
    }

    setErroValidacao("");
    setEtapaAtual((etapa) => Math.min(etapa + 1, etapas.length - 1));
  };

  const voltar = () => {
    setErroValidacao("");
    if (etapaAtual === 0 && divisaoSelecionada) {
      setDivisaoSelecionada(null);
      return;
    }
    setEtapaAtual((etapa) => Math.max(etapa - 1, 0));
  };

  const finalizar = async () => {
    if (!etapaValida()) {
      setErroValidacao(fluxoStreaming && !participantesStreamingValidos
        ? "Informe um número inteiro de participantes igual ou maior que 2 e dentro do limite de telas do plano."
        : "Preencha os campos obrigatórios para finalizar.");
      return;
    }

    if (!divisaoSelecionada) return;
    if (nomeDoGrupo.trim().length > 20) {
      setErroValidacao("O nome do grupo deve ter no máximo 20 caracteres.");
      return;
    }
    if (descricaoDoGrupo.trim().length > 150) {
      setErroValidacao("A descrição deve ter no máximo 150 caracteres.");
      return;
    }

    const cpfOk = await garantirCpf();
    if (!cpfOk) return;

    setErroValidacao("");
    setCriandoDivisao(true);

    const usuarioId = user && Number.isSafeInteger(Number(user.id)) && Number(user.id) > 0
      ? Number(user.id)
      : null;
    const participantesDespesa = usuarioId === null ? [] : [usuarioId];
    const itens = [
      ...((fluxoDespesas || fluxoViagem || fluxoOutros)
        ? despesasAdicionais.map((despesa) => ({
            ite_nome: despesa.nome.trim(),
            ite_valor: Number(despesa.valor),
            usu_ids: participantesDespesa,
          }))
        : []),
    ];

    const payload = {
      gru_num_part: Number(numeroDeParticipantes),
      cat_id: categoriaPorDivisao[divisaoSelecionada],
      gru_nome: nomeDoGrupo,
      gru_descricao: descricaoDoGrupo,
      gru_visibilidade: visibilidade === "publico",
      gru_cor: divisaoSelecionada === "streaming" ? "#00A8E1" : "#79C734",
      gru_icone: divisaoSelecionada,
      gru_num_vagas: Math.max(0, Number(numeroDeParticipantes) - 1),
      gru_criador_nome: user?.name ?? "Criador da divisão",
      ...(user && Number.isSafeInteger(Number(user.id)) && Number(user.id) > 0
        ? { gru_criador_id: usuarioId }
        : {}),
      itens,
      detalhes: fluxoStreaming
        ? {
            str_valor: Number(valorStreaming),
            str_plano: planoStreamingAtual?.plano ?? null,
            str_telas: planoStreamingAtual?.telas ?? null,
          }
        : fluxoViagem
          ? {
              via_partida: localPartida,
              via_destino: localDestino,
              via_data_inicio: dataPartida,
              via_data_fim: dataRetorno,
            }
              : {},
    };

    try {
      const resposta = await fetch(`${API_BASE_URL}/grupos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const dados: { erro?: string } = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível criar a divisão.");
      }

      await Swal.fire({
        icon: "success",
        title: "Divisão criada!",
        text: "Sua divisão foi criada com sucesso.",
        confirmButtonText: "Ver divisões",
        customClass: {
          icon: "meu-icone-verde",
          confirmButton: "meu-botao-verde",
        },
        allowOutsideClick: false,
      });
      navigate("/divisoes", { replace: true });
    } catch (error) {
      setErroValidacao(error instanceof Error ? error.message : "Não foi possível criar a divisão.");
    } finally {
      setCriandoDivisao(false);
    }
  };

  const adicionarDespesa = () => {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setDespesasAdicionais((despesas) => [...despesas, { id, nome: "", valor: "" }]);
  };

  const atualizarDespesa = (indice: number, campo: "nome" | "valor", valor: string) => {
    setDespesasAdicionais((despesas) =>
      despesas.map((despesa, posicao) =>
        posicao === indice ? { ...despesa, [campo]: valor } : despesa,
      ),
    );
  };

  const removerDespesa = (indice: number) => {
    setDespesasAdicionais((despesas) => despesas.filter((_, posicao) => posicao !== indice));
  };

  const renderListaDespesas = (prefixo: string) => despesasAdicionais.length > 0 && (
    <div className="ListaDespesas">
      <div className="ListaDespesasHeader">
        <div>
          <h3>Despesas adicionadas</h3>
          <p>Informe o nome e o valor de cada despesa.</p>
        </div>
        <span className="ContadorDespesas" aria-live="polite">
          <strong>{despesasAdicionais.length}</strong>
          {despesasAdicionais.length === 1 ? " despesa adicionada" : " despesas adicionadas"}
        </span>
      </div>
      {despesasAdicionais.map((despesa, indice) => (
        <div key={despesa.id} className="CampoDespesa">
          <div className="CampoDespesaHeader">
            <span className="DespesaNumero">Despesa {String(indice + 1).padStart(2, "0")}</span>
            <button type="button" className="BtnRemoverDespesa" onClick={() => removerDespesa(indice)} aria-label={`Remover despesa ${indice + 1}`}>
              <FiMinus aria-hidden="true" />
              <span>Remover</span>
            </button>
          </div>
          <div className="CampoDespesaCampos">
            <div className="CampoDespesaCampo">
              <label htmlFor={`${prefixo}-Nome-${indice}`}>Nome da despesa *</label>
              <input
                id={`${prefixo}-Nome-${indice}`}
                type="text"
                className="InputText"
                placeholder="Ex.: Pedágio, hospedagem, gás..."
                value={despesa.nome}
                onChange={(event) => atualizarDespesa(indice, "nome", event.target.value)}
              />
            </div>
            <div className="CampoDespesaCampo">
              <label htmlFor={`${prefixo}-Valor-${indice}`}>Valor da despesa *</label>
              <div className="CampoDespesaInputMoeda">
                <span aria-hidden="true">R$</span>
                <input
                  id={`${prefixo}-Valor-${indice}`}
                  type="number"
                  className="InputText"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={despesa.valor}
                  onChange={(event) => atualizarDespesa(indice, "valor", event.target.value)}
                />
              </div>
            </div>
          </div>
          <span className="DespesaResponsavel">Valor registrado por {user?.name || "criador do grupo"}</span>
        </div>
      ))}
    </div>
  );

  const renderCampoParticipantes = (
    id: string,
    minimo: number,
    maximo: number | undefined,
    ajuda: string,
    placeholder: string,
  ) => {
    const quantidade = Number(numeroDeParticipantes || 0);
    const ajustar = (delta: number) => {
      const proximo = Math.max(minimo, quantidade + delta);
      atualizarNumeroParticipantes(String(maximo === undefined ? proximo : Math.min(maximo, proximo)));
    };

    return (
      <div className="CampoParticipantes">
        <FaUsers className="IconeParticipantes" aria-hidden="true" />
        <div className="CampoParticipantesValor">
          {animacaoParticipantes && (
            <span className="AnimacaoNumero" key={animacaoParticipantes.atual} aria-hidden="true">
              <span className="NumeroAnterior">{animacaoParticipantes.anterior}</span>
              <span className="NumeroAtual">{animacaoParticipantes.atual}</span>
            </span>
          )}
          <input
            type="number"
            id={id}
            min={minimo}
            max={maximo}
            step="1"
            className={animacaoParticipantes ? "NumeroParticipantesAnimando" : undefined}
            value={numeroDeParticipantes}
            onChange={(event) => atualizarNumeroParticipantes(event.target.value)}
            aria-describedby={`${id}-ajuda`}
            required
            placeholder={placeholder}
          />
          <span id={`${id}-ajuda`}>{ajuda}</span>
        </div>
        <div className="ControlesParticipantes" aria-label="Ajustar número de participantes">
          <button type="button" aria-label="Diminuir participantes" disabled={quantidade <= minimo} onClick={() => ajustar(-1)}>
            <FiMinus aria-hidden="true" />
          </button>
          <button type="button" aria-label="Aumentar participantes" disabled={maximo !== undefined && quantidade >= maximo} onClick={() => ajustar(1)}>
            <FiPlus aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  };

  const renderBlocoPagamento = (nomeCampo: string) => (
    <div className="ConteudoEtapa">
      <label>Como será o pagamento? *</label>
      <p className="SubtituloPagamento">Selecione como os valores serão divididos</p>
      <div className="RadioGroup RadioGroupPagamento" role="radiogroup" aria-label="Forma de pagamento">
        <label className="RadioOption">
          <input
            type="radio"
            name={nomeCampo}
            value="igualitaria"
            checked={formaPagamento === "igualitaria"}
            onChange={(event) => setFormaPagamento(event.target.value)}
          />
          <MdOutlineAttachMoney className="iconPagamento" aria-hidden="true" />
          <span className="RadioOptionTexto"><strong>Divisão Igualitária</strong><small>Todos os participantes pagam o mesmo valor.</small></span>
        </label>
        <label className="RadioOption">
          <input
            type="radio"
            name={nomeCampo}
            value="personalizada"
            checked={formaPagamento === "personalizada"}
            onChange={(event) => setFormaPagamento(event.target.value)}
          />
          <FaDivide className="iconPagamento" aria-hidden="true" />
          <span className="RadioOptionTexto"><strong>Divisão Personalizada</strong><small>Defina valores diferentes para todos ou apenas selecionados.</small></span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      <section className="CriarDivisao">
        <BtnClose onClick={() => navigate("/divisoes")} />
        <section className="SctTop">
          <h2>Crie a sua <b className="Bdestaque">Divisão!</b></h2>
          <div className="IndicadorEtapas" aria-label={`Etapa ${etapaAtual + 1} de ${etapas.length}`}>
            {etapas.map((_, indice) => (
              <span
                className={`BolinhasEtapas ${indice === etapaAtual ? "BolinhasEtapasAtiva" : ""}`}
                key={indice}
                aria-current={indice === etapaAtual ? "step" : undefined}
              />
            ))}
          </div>
        </section>
        <main className="SctMain">
          <div className="SctMainContent">
            <div className="TransicaoEtapa" key={`${divisaoSelecionada ?? "inicio"}-${etapaAtual}`}>
            <h1>{tituloEtapa}</h1>
            {!divisaoSelecionada ? (
              <div className="DivCards">
                <button type="button" className="Card" onClick={() => selecionarDivisao("viagens")}>
                  <h2>Viagem</h2>
                  <h2>1</h2>
                  <FaCar className="icone" />
                </button>
                <button type="button" className="Card" onClick={() => selecionarDivisao("streaming")}>
                  <h2>Streaming</h2>
                  <h2>2</h2>
                  <FaTv className="icone" />
                </button>
                <button type="button" className="Card" onClick={() => selecionarDivisao("despesas")}>
                  <h2>Custo Doméstico</h2>
                  <h2>3</h2>
                  <FaHouseUser className="icone" />
                </button>
                <button type="button" className="Card" onClick={() => selecionarDivisao("outros")}>
                  <h2>Outros</h2>
                  <h2>4</h2>
                  <MdAddCircleOutline className="icone" />
                </button>
              </div>
            ) : etapaAtual === 0 ? (
              <div className="ConteudoEtapa">
               <label htmlFor="NomeDoGrupo">Nome do grupo *</label>
                <input
                  type="text"
                  id="NomeDoGrupo"
                  className="InputText"
                  placeholder="Ex.: Netflix, Hospedagem São Paulo"
                  maxLength={20}
                  value={nomeDoGrupo}
                  onChange={(event) => setNomeDoGrupo(event.target.value)}
                  required={fluxoStreaming}
                />
                <label htmlFor="DescricaoDoGrupo">Descrição curta *</label>
                <input
                  type="text"
                  id="DescricaoDoGrupo"
                  className="InputText"
                  placeholder="Conte mais sobre a sua divisão!"
                  maxLength={150}
                  value={descricaoDoGrupo}
                  onChange={(event) => setDescricaoDoGrupo(event.target.value)}
                  required={fluxoStreaming}
                />
                <label htmlFor="VisibilidadeDoGrupo">Visibilidade do grupo *</label>
                <div className="RadioGroup" role="radiogroup" aria-label="Visibilidade do grupo">
                  <label className="RadioOption">
                    <input type="radio" name="VisibilidadeDoGrupo" value="publico" checked={visibilidade === "publico"} onChange={(event) => setVisibilidade(event.target.value)} required={fluxoStreaming} />
                    <FaUnlock className="iconCadeado" aria-hidden="true" />
                    <span className="RadioOptionTexto"><strong>Grupo público</strong><small>Visível para todos</small></span>
                  </label>
                  <label className="RadioOption">
                    <input type="radio" name="VisibilidadeDoGrupo" value="privado" checked={visibilidade === "privado"} onChange={(event) => setVisibilidade(event.target.value)} />
                    <FaLock className="iconCadeado" aria-hidden="true" />
                    <span className="RadioOptionTexto"><strong>Grupo privado</strong><small>Acesso por convite</small></span>
                  </label>
                </div>
                {!fluxoStreaming && (
                  <>
                    <label htmlFor="NumeroDeParticipantes">Número de participantes *</label>
                    {renderCampoParticipantes("NumeroDeParticipantes", 0, undefined, "Pessoas que farão parte desta divisão", "1")}
                  </>
                )}
              </div>
            ) : fluxoViagem && etapaAtual === 1 ? (
              renderBlocoPagamento("FormaPagamentoViagem")
            ) : fluxoViagem && etapaAtual === 2 ? (
              <div className="ConteudoEtapa ConteudoViagem">
                <label htmlFor="LocalPartida">Local de Partida *</label>
                <div className="CampoLocalizacao">
                  <FaMapMarkerAlt aria-hidden="true" />
                  <input type="text" id="LocalPartida" className="InputText" placeholder="Busque pelo endereço" value={localPartida} onChange={(event) => { setLocalPartida(event.target.value); void buscarLocalViagem(event.target.value, setSugestoesPartida, setLocalizacaoPartida); }} list="SugestoesPartida" required />
                </div>
                <datalist id="SugestoesPartida">
                  {sugestoesPartida.map((sugestao) => <option key={sugestao.id} value={sugestao.place_name} />)}
                </datalist>
                <label htmlFor="LocalDestino">Local de Destino *</label>
                <div className="CampoLocalizacao">
                  <FaMapMarkerAlt aria-hidden="true" />
                  <input type="text" id="LocalDestino" className="InputText" placeholder="Busque pelo endereço" value={localDestino} onChange={(event) => { setLocalDestino(event.target.value); void buscarLocalViagem(event.target.value, setSugestoesDestino, setLocalizacaoDestino); }} list="SugestoesDestino" required />
                </div>
                <datalist id="SugestoesDestino">
                  {sugestoesDestino.map((sugestao) => <option key={sugestao.id} value={sugestao.place_name} />)}
                </datalist>
                {(localizacaoPartida || localizacaoDestino) && <div className="MapaEndereco MapaViagem" ref={mapaViagemRef} role="application" aria-label="Mapa do trajeto da viagem" />}
                <div className="DatasViagem">
                  <div>
                    <label htmlFor="DataPartida">Data de Partida *</label>
                    <input
                      type="date"
                      id="DataPartida"
                      className="InputDataViagem"
                      value={dataPartida}
                      onChange={(event) => setDataPartida(event.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="DataRetorno">Data de Retorno *</label>
                    <input
                      type="date"
                      id="DataRetorno"
                      className="InputDataViagem"
                      value={dataRetorno}
                      onChange={(event) => setDataRetorno(event.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="ControlesDespesas">
                  <button type="button" className="BtnAdicionarDespesa" onClick={adicionarDespesa}>
                    <FiPlus aria-hidden="true" /> Adicionar despesa
                  </button>
                </div>
                {renderListaDespesas("ViagemDespesa")}
                <p className="TextoAuxiliar">As despesas serão vinculadas ao grupo e ao participante informado em cada item.</p>
              </div>
            ) : fluxoStreaming && etapaAtual === 1 ? (
              <div className="ConteudoEtapa">
                <label htmlFor="StreamingSelecionado">Selecione o serviço *</label>
                <select id="StreamingSelecionado" className="InputText" value={streamingSelecionado} onChange={(event) => { setStreamingSelecionado(event.target.value); setPlanoSelecionado(""); setValorStreaming(""); setNumeroDeParticipantes(""); }} required>
                  <option value="">Selecione um serviço</option>
                  {servicosStreaming.map((servico) => <option key={servico} value={servico}>{servico}</option>)}
                </select>
                <label htmlFor="PlanoSelecionado">Selecione o Plano *</label>
                <select
                  id="PlanoSelecionado"
                  className="InputText"
                  value={planoSelecionado}
                  onChange={(event) => {
                    const plano = planosDoServico.find((item) => item.plano === event.target.value);
                    setPlanoSelecionado(plano?.plano ?? "");
                    setValorStreaming(plano?.preco === null || plano?.preco === undefined ? "" : plano.preco.toFixed(2));
                    setNumeroDeParticipantes("");
                  }}
                  required
                >
                  <option value="">Selecione um plano</option>
                  {planosDoServico.map(({ plano, preco, telas }) => {
                    const detalhes = [
                      preco !== null ? formatarBRL(preco) : null,
                      telas !== null ? `${telas} telas` : null,
                    ].filter(Boolean).join(" · ");
                    return <option key={plano} value={plano}>{detalhes ? `${plano} — ${detalhes}` : plano}</option>;
                  })}
                </select>
                <label htmlFor="ValorStreaming">Valor mensal total do plano *</label>
                <input
                  type={precoEditavel ? "number" : "text"}
                  id="ValorStreaming"
                  className="InputText"
                  min={precoEditavel ? "0.01" : undefined}
                  step={precoEditavel ? "0.01" : undefined}
                  placeholder={planoStreamingAtual?.preco === null ? "Informe o valor mensal" : "Selecione o plano"}
                  value={!precoEditavel && totalStreaming > 0 ? formatarBRL(totalStreaming) : valorStreaming}
                  onChange={(event) => setValorStreaming(event.target.value)}
                  readOnly={!precoEditavel}
                  required
                />
                <label htmlFor="DataVencimento">Data de Vencimento *</label>
                <input type="date" id="DataVencimento" className="InputText" value={dataVencimento} onChange={(event) => setDataVencimento(event.target.value)} required />
                <label htmlFor="NumeroParticipantesStreaming">Número de participantes *</label>
                {renderCampoParticipantes("NumeroParticipantesStreaming", 2, planoStreamingAtual?.telas ?? undefined, "Participantes que dividirão este plano", "Mínimo 2")}
                {planoStreamingAtual?.telas !== null && planoStreamingAtual?.telas !== undefined && (
                  <p className="TextoAuxiliar">Este plano permite até {planoStreamingAtual.telas} participantes simultâneos.</p>
                )}
                <div className="ResumoStreaming" aria-live="polite">
                  <div className="ResumoStreamingItem">
                    <span>Valor total do plano</span>
                    <strong>{Number.isFinite(totalStreaming) && totalStreaming > 0 ? formatarBRL(totalStreaming) : "Aguardando valor"}</strong>
                  </div>
                  <div className="ResumoStreamingItem">
                    <span>Valor por participante</span>
                    <strong>{valorPorParticipante !== null ? formatarBRL(valorPorParticipante) : "Aguardando dados válidos"}</strong>
                  </div>
                </div>
              </div>
            ) : (fluxoDespesas || fluxoOutros) && etapaAtual === 1 ? (
              renderBlocoPagamento("FormaPagamento")
            ) : fluxoDespesas && etapaAtual === 2 ? (
              <div className="ConteudoEtapa">
                <div className="InfoEndereco">
                  <CiCircleInfo className="IconeInfoEndereco" />
                  <p>Informe o endereço apenas se quiser encontrar pessoas para dividir a residência e os custos.</p>
                </div>
                <label htmlFor="EnderecoResidencia">Endereço da residência</label>
                <div className="CampoLocalizacao">
                  <FaMapMarkerAlt aria-hidden="true" />
                  <input
                    type="search"
                    id="EnderecoResidencia"
                    className="InputText"
                    list="SugestoesEndereco"
                    placeholder="Busque pelo endereço (apenas bairro e cidade)"
                    value={endereco}
                    onChange={(event) => buscarEndereco(event.target.value)}
                    onBlur={(event) => selecionarEndereco(event.target.value)}
                  />
                </div>
                <datalist id="SugestoesEndereco">
                  {sugestoesEndereco.map((sugestao) => <option key={sugestao.id} value={sugestao.place_name} />)}
                </datalist>
                {localizacaoEndereco && (
                  <div
                    className="MapaEndereco"
                    ref={mapaRef}
                    role="application"
                    aria-label={`Mapa de ${localizacaoEndereco.place_name}`}
                  />
                )}
                <div className="ControlesDespesas">
                  <button type="button" className="BtnAdicionarDespesa" onClick={adicionarDespesa}>
                    <FiPlus aria-hidden="true" /> Adicionar despesa
                  </button>
                </div>
                {renderListaDespesas("DomesticaDespesa")}
              </div>
            ) : fluxoOutros && etapaAtual === 2 ? (
              <div className="ConteudoEtapa">
                <h3 className="TituloDespesas">Despesas adicionais</h3>
                <div className="ControlesDespesas">
                  <button type="button" className="BtnAdicionarDespesa" onClick={adicionarDespesa}>
                    <FiPlus aria-hidden="true" /> Adicionar despesa
                  </button>
                </div>
                {renderListaDespesas("OutraDespesa")}
              </div>
            ) : null}
            </div>
            {erroValidacao && (
              <div className="ErroValidacao" role="alert" aria-live="assertive">
                <FaExclamationTriangle aria-hidden="true" />
                <span>{erroValidacao}</span>
              </div>
            )}
            <div className="DivBtns">
              <button className="BtnVoltar" onClick={voltar} disabled={!divisaoSelecionada}>
                {fluxoViagem ? <FiArrowLeft /> : <FaArrowCircleLeft />} {fluxoViagem ? "Sair" : "Voltar"}
              </button>
              {etapaAtual === etapas.length - 1 ? (
                <button className="BtnAvancar" onClick={() => void finalizar()} disabled={criandoDivisao}>
                  {criandoDivisao ? "Criando..." : fluxoViagem ? "Finalizar" : fluxoStreaming ? "Finalizar" : "Concluir"}
                </button>
              ) : (
                <button className="BtnAvancar" onClick={avancar}>
                  {fluxoViagem ? "Prosseguir" : "Avançar"} {fluxoViagem ? <FiArrowRight /> : <FaArrowCircleRight />}
                </button>
              )}
            </div>
          </div>
        </main>
      </section>
    </>
  );
}
