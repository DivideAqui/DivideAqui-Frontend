import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { SearchInput } from "../components/SearchInput";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import "../css/divisoes.css";
import "../css/SearchInput.css";
import moeda from "../assets/Imgs/moeda.png";
import { useSearchParams, useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Swal from "sweetalert2";
import { useAuth } from "../hooks/useAuth";

import {
  FaArrowCircleLeft,
  FaArrowCircleRight,
  FaCar,
  FaEllipsisH,
  FaHouseUser,
  FaLock,
  FaPlay,
  FaStar,
  FaTv,
} from "react-icons/fa";

type CategoryKey = "streaming" | "viagens" | "despesas" | "outros";

type ViagemDetalhes = {
  via_partida?: string | null;
  via_destino?: string | null;
};

type StreamingDetalhes = {
  str_valor?: string | number | null;
  str_plano?: string | null;
  str_telas?: number | null;
};

type StreamingData = StreamingDetalhes | StreamingDetalhes[] | null | undefined;

const getStream = (stream: StreamingData): StreamingDetalhes | null => {
  if (!stream) return null;
  if (Array.isArray(stream)) return stream[0] || null;
  return stream;
};

type ItemDetalhe = {
  ite_valor: string | number;
};

type BackendGroup = {
  gru_id: number;
  gru_num_part: number;
  cat_id: number;
  gru_nome?: string | null;
  gru_descricao?: string | null;
  gru_visibilidade?: boolean | null;
  gru_cor?: string | null;
  gru_icone?: string | null;
  gru_num_vagas?: number | null;
  gru_criador_id?: number | null;
  gru_criador_nome?: string | null;
  criador?: {
    usu_id: number;
    usu_nome: string;
    usu_foto?: string | null;
  } | null;
  categoria?: {
    cat_id: number;
    cat_nome: string;
  };
  mensalidade?: {
    men_valor?: string | number | null;
  };
  stream?: StreamingDetalhes | null;
  item?: ItemDetalhe[];
  viagem?: ViagemDetalhes | null;
  detalhes?: ViagemDetalhes | null;
  participacoes?: Array<{
    par_id: number;
    usu_id: number | string;
    gru_id: number;
    usuario?: {
      usu_id: number | string;
      usu_nome: string;
      usu_foto?: string | null;
    };
  }>;
  _count?: {
    participacoes: number;
  };
};

type CardItem = {
  id: string;
  name: string;
  price: string;
  totalPlanPrice: string | null;
  planName: string | null;
  memberCount: number;
  divisionCount: number;
  maxParticipants: number;
  slots: number;
  color: string;
  icon: ReactNode;
  leaderName: string;
  leaderAvatar: string;
  leaderFoto?: string | null;
  leaderRating: number | null;
  description: string;
  category: CategoryKey;
  partida?: string;
  destino?: string;
  privado: boolean;
  participantes: Array<{
    id: string;
    nome: string;
    avatar: string;
    foto?: string | null;
  }>;
  userParticipates: boolean;
};

const API_BASE_URL = import.meta.env.VITE_API_URL;
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const formatarBRL = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

// Componente para exibir avatar com foto de perfil
const AvatarComFoto = ({
  fotoBase64,
  seed,
  className,
  alt,
}: {
  fotoBase64?: string | null;
  seed: string;
  className: string;
  alt: string;
}) => {
  // Se tem foto base64/data URL, usa direto; caso contrário usa DiceBear (png para preencher a bolinha)
  const avatarUrl = fotoBase64 && !fotoBase64.startsWith("http")
    ? fotoBase64
    : `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return <img src={avatarUrl} alt={alt} className={className} />;
};

const getCategoryKey = (value?: string | null, icon?: string | null): CategoryKey => {
  const iconKey = (icon ?? "").trim().toLowerCase();
  if (iconKey === "streaming" || iconKey === "viagens" || iconKey === "despesas" || iconKey === "outros") {
    return iconKey;
  }

  const normalized = (value ?? "").trim().toLowerCase();

  if (normalized.includes("stream")) return "streaming";
  if (normalized.includes("viag")) return "viagens";
  if (normalized.includes("domest") || normalized.includes("desp") || normalized.includes("custo")) return "despesas";

  return "outros";
};

const getCategoryTitle = (value?: string | null) => {
  switch (getCategoryKey(value)) {
    case "streaming":
      return "Streaming";
    case "viagens":
      return "Viagens";
    case "despesas":
      return "Despesas Domésticas";
    default:
      return "Outros";
  }
};

const getCategoryIcon = (category: CategoryKey) => {
  switch (category) {
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

const getGroupDescription = (leaderName: string, category: CategoryKey) => {
  const categoryLabel = getCategoryTitle(category === "streaming" ? "streaming" : category === "viagens" ? "viagem" : category === "despesas" ? "despesa" : "outros");

  if (category === "streaming") {
    return `Grupo de ${categoryLabel.toLowerCase()} organizado por ${leaderName}, com divisão de custos e acesso compartilhado entre os participantes.`;
  }

  if (category === "viagens") {
    return `Grupo de ${categoryLabel.toLowerCase()} organizado por ${leaderName}, com o custo compartilhado e a organização da viagem mais acessível para todos.`;
  }

  if (category === "despesas") {
    return `Grupo de ${categoryLabel.toLowerCase()} organizado por ${leaderName}, com as despesas da casa distribuídas de forma clara e equilibrada.`;
  }

  return `Grupo organizado por ${leaderName}, com divisão de custos e organização compartilhada entre os participantes.`;
};

const buildCardItemFromGroup = (group: BackendGroup, currentUserId?: string | null): CardItem => {
  const category = getCategoryKey(group.categoria?.cat_nome, group.gru_icone);
  const streamData = getStream(group.stream);
  const viagem = group.viagem ?? (category === "viagens" ? group.detalhes : null);
  const leaderName = group.criador?.usu_nome?.trim() || group.gru_criador_nome?.trim() || "Criador da divisão";
  const participationCount = group._count?.participacoes ?? 0;
  const creatorIsParticipant = group.gru_criador_id != null;
  const memberCount = Math.max(1, participationCount + (creatorIsParticipant ? 0 : 1));
  const configuredCapacity = Math.max(memberCount, group.gru_num_part ?? group.gru_num_vagas ?? memberCount);
  const maxParticipants = streamData?.str_telas == null
    ? configuredCapacity
    : Math.min(configuredCapacity, streamData.str_telas);
  const slots = Math.max(0, maxParticipants - memberCount);
  const divisionCount = Math.min(maxParticipants, memberCount + (slots > 0 ? 1 : 0));
  const streamTotal = streamData?.str_valor == null ? null : Number(streamData.str_valor);
  const totalPlanPrice = streamTotal === null || !Number.isFinite(streamTotal)
    ? null
    : formatarBRL(streamTotal);
  const totalItens = group.item?.reduce((total, item) => total + Number(item.ite_valor), 0);
  const valorAtualItens = group.item && group.item.length > 0 ? formatarBRL(totalItens ?? 0) : null;
  const perParticipantTotal = streamTotal === null || !Number.isFinite(streamTotal)
    ? null
    : Math.round(Math.round(streamTotal * 100) / divisionCount) / 100;
  const perParticipantPrice = streamTotal !== null && Number.isFinite(streamTotal)
    ? formatarBRL(perParticipantTotal ?? streamTotal)
    : valorAtualItens ?? (group.mensalidade?.men_valor != null
      ? `R$ ${group.mensalidade.men_valor}`
      : "R$ —");

  // Construir lista de participantes
  const participantes = (group.participacoes ?? []).map((participacao) => ({
    id: String(participacao.usuario?.usu_id ?? participacao.usu_id),
    nome: participacao.usuario?.usu_nome || `Usuário ${participacao.usu_id}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(participacao.usuario?.usu_id ?? participacao.usu_id))}`,
    foto: participacao.usuario?.usu_foto,
  }));

  // Verificar se o usuário atual já participa do grupo
  const userParticipates = currentUserId
    ? participantes.some((p) => p.id === currentUserId)
    : false;

  return {
    id: String(group.gru_id),
    name: group.gru_nome?.trim() || `${getCategoryTitle(category)} ${group.gru_id}`,
    price: perParticipantPrice,
    totalPlanPrice,
    planName: streamData?.str_plano ?? null,
    memberCount,
    divisionCount,
    maxParticipants,
    slots,
    color: group.gru_cor || (category === "streaming" ? "#00A8E1" : "var(--verde-escuro)"),
    icon: getCategoryIcon(category),
    leaderName,
    leaderAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(group.criador?.usu_id ?? group.gru_criador_id ?? leaderName))}`,
    leaderFoto: group.criador?.usu_foto,
    leaderRating: null,
    description: group.gru_descricao?.trim() || getGroupDescription(leaderName, category),
    category,
    partida: viagem?.via_partida?.trim() || undefined,
    destino: viagem?.via_destino?.trim() || undefined,
    privado: group.gru_visibilidade === false,
    participantes,
    userParticipates,
  };
};

const buildRowsFromGroups = (groups: BackendGroup[], currentUserId?: string | null) => {
  const groupedByCategory = groups.reduce<Record<CategoryKey, BackendGroup[]>>(
    (accumulator, group) => {
      const categoryKey = getCategoryKey(group.categoria?.cat_nome, group.gru_icone);
      accumulator[categoryKey] = accumulator[categoryKey] ?? [];
      accumulator[categoryKey].push(group);
      return accumulator;
    },
    { streaming: [], viagens: [], despesas: [], outros: [] },
  );

  return [
    { title: "Streaming", items: (groupedByCategory.streaming ?? []).map((g) => buildCardItemFromGroup(g, currentUserId)) },
    { title: "Viagens", items: (groupedByCategory.viagens ?? []).map((g) => buildCardItemFromGroup(g, currentUserId)) },
    { title: "Despesas Domésticas", items: (groupedByCategory.despesas ?? []).map((g) => buildCardItemFromGroup(g, currentUserId)) },
    { title: "Outros", items: (groupedByCategory.outros ?? []).map((g) => buildCardItemFromGroup(g, currentUserId)) },
  ].filter((row) => row.items.length > 0);
};

const categoryButtons: Array<{ key: CategoryKey | "all"; label: string; icon: ReactNode }> = [
  { key: "all", label: "Todos", icon: <FaEllipsisH /> },
  { key: "viagens", label: "Viagens", icon: <FaCar /> },
  { key: "streaming", label: "Streamer", icon: <FaTv /> },
  { key: "despesas", label: "Custos Domésticos", icon: <FaHouseUser /> },
  { key: "outros", label: "Outros", icon: <FaEllipsisH /> },
];

const normalizeString = (value?: string | null) => (value ?? "").trim().toLowerCase();

const matchesSearchGroup = (group: BackendGroup, query: string) => {
  if (!query) return true;

  const categoryName = group.categoria?.cat_nome ?? "";
  const category = getCategoryKey(categoryName, group.gru_icone);
  const groupLabel = group.gru_nome?.trim() || `${getCategoryTitle(category)} ${group.gru_id}`;
  const haystack = [categoryName, group.gru_icone ?? "", group.gru_descricao ?? "", getCategoryTitle(category), groupLabel].join(" ").toLowerCase();

  return haystack.includes(query);
};

function MapaViagem({ partida, destino }: { partida: string; destino: string }) {
  const mapaRef = useRef<HTMLDivElement | null>(null);
  const [distanciaMetros, setDistanciaMetros] = useState<number | null>(null);
  const [calculandoDistancia, setCalculandoDistancia] = useState(true);
  const [erroDistancia, setErroDistancia] = useState(false);

  useEffect(() => {
    let ativo = true;
    let mapa: mapboxgl.Map | null = null;
    setDistanciaMetros(null);
    setCalculandoDistancia(true);
    setErroDistancia(false);

    const carregarMapa = async () => {
      const geocodificar = async (endereco: string) => {
        const resposta = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endereco)}.json?access_token=${MAPBOX_TOKEN}&country=br&language=pt&limit=1`);
        if (!resposta.ok) return null;
        const dados: { features?: Array<{ center: [number, number] }> } = await resposta.json();
        return dados.features?.[0]?.center ?? null;
      };

      try {
        const [coordenadasPartida, coordenadasDestino] = await Promise.all([
          geocodificar(partida),
          geocodificar(destino),
        ]);
        if (!ativo) return;
        if (!mapaRef.current || !coordenadasPartida || !coordenadasDestino) {
          setCalculandoDistancia(false);
          setErroDistancia(true);
          return;
        }

        mapboxgl.accessToken = MAPBOX_TOKEN;
        mapa = new mapboxgl.Map({
          container: mapaRef.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: coordenadasPartida,
          zoom: 6,
          attributionControl: true,
        });

        new mapboxgl.Marker({ color: "#053CC8" }).setLngLat(coordenadasPartida).addTo(mapa);
        new mapboxgl.Marker({ color: "#79C734" }).setLngLat(coordenadasDestino).addTo(mapa);

        mapa.once("load", async () => {
          const origem = coordenadasPartida.join(",");
          const chegada = coordenadasDestino.join(",");
          try {
            const resposta = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${origem};${chegada}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`);
            if (!resposta.ok) throw new Error("Não foi possível consultar a rota.");

            const dados: { routes?: Array<{ distance: number; geometry: { type: "LineString"; coordinates: [number, number][] } }> } = await resposta.json();
            const rota = dados.routes?.[0];
            if (!rota || !Number.isFinite(rota.distance)) throw new Error("A rota não possui distância disponível.");
            if (!ativo) return;

            setDistanciaMetros(rota.distance);
            setCalculandoDistancia(false);

            if (!mapa || mapa.getSource("rota-viagem")) return;
            mapa.addSource("rota-viagem", { type: "geojson", data: rota.geometry });
            mapa.addLayer({
              id: "rota-viagem-linha",
              type: "line",
              source: "rota-viagem",
              paint: { "line-color": "#053CC8", "line-width": 4, "line-opacity": 0.8 },
            });

            const limites = new mapboxgl.LngLatBounds();
            limites.extend(coordenadasPartida);
            limites.extend(coordenadasDestino);
            mapa.fitBounds(limites, { padding: 36, maxZoom: 12 });
          } catch {
            if (ativo) {
              setCalculandoDistancia(false);
              setErroDistancia(true);
            }
          }
        });
      } catch {
        if (ativo) {
          setCalculandoDistancia(false);
          setErroDistancia(true);
        }
      }
    };

    void carregarMapa();
    return () => {
      ativo = false;
      mapa?.remove();
    };
  }, [partida, destino]);

  const distanciaFormatada = distanciaMetros === null
    ? null
    : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(distanciaMetros / 1000);

  return (
    <>
      <p className="division-dialog__distance" aria-live="polite">
        Distância da viagem: <strong>{distanciaFormatada ? `${distanciaFormatada} km` : calculandoDistancia ? "Calculando..." : erroDistancia ? "Indisponível" : "—"}</strong>
      </p>
      <div className="division-dialog__map" ref={mapaRef} role="application" aria-label={`Mapa do trajeto entre ${partida} e ${destino}`} />
    </>
  );
}

function VagasLinha({
  title,
  items,
  variant,
  onSelectItem,
}: {
  title: string;
  items: CardItem[];
  variant: "top" | "bottom";
  onSelectItem: (item: CardItem) => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const titleEl = row.querySelector(".vagas-row__title h3");
    const cards = row.querySelectorAll(".vagas-card");

    gsap.fromTo(
      titleEl,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }
    );

    gsap.fromTo(
      cards,
      { opacity: 0, y: 22, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
      }
    );
  }, [items]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateControls = () => {
      const { scrollLeft, scrollWidth, clientWidth } = track;
      const hasOverflow = scrollWidth > clientWidth + 1;

      if (!hasOverflow) {
        setShowLeft(false);
        setShowRight(false);
        return;
      }

      setShowLeft(scrollLeft > 8);
      setShowRight(scrollLeft + clientWidth < scrollWidth - 8);
    };

    updateControls();
    track.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);

    return () => {
      track.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, [items.length]);

  const handleScroll = (direction: "left" | "right") => {
    if (!trackRef.current) return;

    const track = trackRef.current;
    const currentLeft = track.scrollLeft;
    const firstCard = track.querySelector(".vagas-card") as HTMLElement | null;
    const step = firstCard ? firstCard.getBoundingClientRect().width + 18 : track.clientWidth * 0.9;
    const nextLeft = direction === "right"
      ? Math.min(track.scrollWidth - track.clientWidth, currentLeft + step)
      : Math.max(0, currentLeft - step);

    const cards = Array.from(track.querySelectorAll(".vagas-card")) as HTMLElement[];

    gsap.fromTo(
      cards,
      { opacity: 0.72, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        stagger: 0.04,
        ease: "power2.out",
      }
    );

    gsap.to(track, {
      scrollLeft: nextLeft,
      duration: 0.7,
      ease: "power3.out",
    });
  };

  return (
    <div className={`vagas-row vagas-row--${variant}`} ref={rowRef}>
      <div className="vagas-row__title">
        <h3>{title}</h3>
      </div>

      <div className="vagas-row__stage">
        <button
          type="button"
          className={`vagas-row__arrow vagas-row__arrow--left ${showLeft ? "is-visible" : "is-hidden"}`}
          onClick={() => handleScroll("left")}
          aria-label="Anterior"
        >
          <FaArrowCircleLeft />
        </button>

        <div className="vagas-row__track" ref={trackRef}>
          {items.map((item) => (
            <article
              key={item.id}
              className="vagas-card"
              role="button"
              tabIndex={0}
              onClick={() => onSelectItem(item)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectItem(item);
                }
              }}
            >
              <div className="vagas-card__header">
                <div className="vagas-card__icon" style={{ backgroundColor: item.color }}>
                  {item.privado && <span className="vagas-card__lock"><FaLock /></span>}
                  {item.icon}
                </div>

                <div className="vagas-card__avatars" aria-label={`${item.memberCount} participantes`}>
                  {item.participantes.length > 0 ? (
                    item.participantes.map((participante) => (
                      <button
                        key={`${item.id}-avatar-${participante.id}`}
                        type="button"
                        className="vagas-card__avatar"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/perfilparticipante/${participante.id}`);
                        }}
                        aria-label={`Ver perfil de ${participante.nome}`}
                        title={`${participante.nome} - Clique para ver o perfil`}
                      >
                        <AvatarComFoto
                          fotoBase64={participante.foto}
                          seed={participante.id}
                          className="vagas-card__avatar-image"
                          alt={participante.nome}
                        />
                        <span className="vagas-card__avatar-tooltip">{participante.nome}</span>
                      </button>
                    ))
                  ) : (
                    Array.from({ length: item.memberCount }).map((_, index) => (
                      <button
                        key={`${item.id}-avatar-${index}`}
                        type="button"
                        className="vagas-card__avatar"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectItem(item);
                        }}
                        aria-label={`Abrir detalhes de ${item.name}`}
                      >
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(`${item.id}-${index}`)}`}
                          alt={`Participante ${index + 1} de ${item.memberCount}`}
                          className="vagas-card__avatar-image"
                        />
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="vagas-card__body">
                <div className="vagas-card__body-heading">
                  <h4>{item.name}</h4>
                  <span className="vagas-card__price">
                    {item.price}{item.category === "streaming" ? " / pessoa" : ""}
                  </span>
                </div>
                <p>Líder: {item.leaderName}</p>
                {item.planName && <p className="vagas-card__hide-mobile">Plano: {item.planName}</p>}
                <p className="vagas-card__hide-mobile">{item.memberCount} pessoa(s) no grupo</p>
                <p className="vagas-card__hide-mobile">Vagas disponíveis: {item.slots}</p>
              </div>

              <button type="button" className="vagas-card__more" aria-label="Mais opções">
                <FaEllipsisH />
              </button>
            </article>
          ))}
        </div>

        <button
          type="button"
          className={`vagas-row__arrow vagas-row__arrow--right ${showRight ? "is-visible" : "is-hidden"}`}
          onClick={() => handleScroll("right")}
          aria-label="Próximo"
        >
          <FaArrowCircleRight />
        </button>
      </div>
    </div>
  );
}

export function Divisoes() {
  const [selectedItem, setSelectedItem] = useState<CardItem | null>(null);
  const [allGroups, setAllGroups] = useState<BackendGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroPointer, setHeroPointer] = useState({ x: 0, y: 0 });
  const [isParticipating, setIsParticipating] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const activeCategory = (searchParams.get("categoria") as CategoryKey | "all") ?? "all";
  const searchTerm = searchParams.get("q") ?? "";
  const normalizedSearch = normalizeString(searchTerm);

  const searchResults = useMemo(() => {
    if (!normalizedSearch) {
      return [];
    }

    return allGroups
      .filter((group) => matchesSearchGroup(group, normalizedSearch))
      .slice(0, 6)
      .map((group) => {
        const streamDataSearch = getStream(group.stream);
        const category = getCategoryKey(group.categoria?.cat_nome, group.gru_icone);
        const leaderName = group.criador?.usu_nome?.trim() || group.gru_criador_nome?.trim() || "Criador da divisão";
        const participationCount = group._count?.participacoes ?? 0;
        const creatorIsParticipant = group.gru_criador_id != null;
        const memberCount = Math.max(1, participationCount + (creatorIsParticipant ? 0 : 1));
        const configuredCapacity = Math.max(memberCount, group.gru_num_part ?? group.gru_num_vagas ?? memberCount);
        const maxParticipants = streamDataSearch?.str_telas == null
          ? configuredCapacity
          : Math.min(configuredCapacity, streamDataSearch.str_telas);
        const slots = Math.max(0, maxParticipants - memberCount);

        const participantes = (group.participacoes ?? []).map((p) => ({
          id: String(p.usuario?.usu_id ?? p.usu_id),
          nome: p.usuario?.usu_nome || "Membro",
          foto: p.usuario?.usu_foto,
        }));

        return {
          id: String(group.gru_id),
          label: group.gru_nome?.trim() || `${getCategoryTitle(category)}`,
          subtitle: `Liderado por ${leaderName}`,
          meta: slots > 0 ? `${slots} vaga${slots > 1 ? 's' : ''}` : 'Lotado',
          category,
          participantes,
        };
      });
  }, [allGroups, normalizedSearch]);

  const filteredGroups = useMemo(() => {
    return allGroups.filter((group) => {
      const categoryKey = getCategoryKey(group.categoria?.cat_nome, group.gru_icone);
      const categoryMatches = activeCategory === "all" || categoryKey === activeCategory;
      const searchMatches = !normalizedSearch || matchesSearchGroup(group, normalizedSearch);
      return categoryMatches && searchMatches;
    });
  }, [activeCategory, allGroups, normalizedSearch]);

  const rows = useMemo(() => buildRowsFromGroups(filteredGroups, user?.id), [filteredGroups, user?.id]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width;
      const relativeY = (event.clientY - rect.top) / rect.height;

      setHeroPointer({
        x: (relativeX - 0.5) * 36,
        y: (relativeY - 0.5) * 18,
      });
    };

    const handlePointerLeave = () => setHeroPointer({ x: 0, y: 0 });

    hero.addEventListener("pointermove", handlePointerMove);
    hero.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      hero.removeEventListener("pointermove", handlePointerMove);
      hero.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadGroups = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/grupos`);
        if (!response.ok) {
          throw new Error("Falha ao carregar grupos");
        }

        const data: BackendGroup[] = await response.json();
        if (!isMounted) return;

        setAllGroups(data);
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setAllGroups([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadGroups();

    return () => {
      isMounted = false;
    };
  }, []);

  // Abre o diálogo quando há um ID na URL (vindo da pesquisa da Home)
  useEffect(() => {
    const groupId = searchParams.get("id");
    if (groupId && allGroups.length > 0) {
      const group = allGroups.find((g) => String(g.gru_id) === groupId);
      if (group) {
        const cardItem = buildCardItemFromGroup(group, user?.id);
        setSelectedItem(cardItem);
        // Limpa o parâmetro da URL sem recarregar
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("id");
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [searchParams, allGroups, user?.id]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });

    let rafId = 0;
    const frame = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const handleCategoryChange = (category: CategoryKey | "all") => {
    const nextParams = new URLSearchParams(searchParams);

    if (category === "all") {
      nextParams.delete("categoria");
    } else {
      nextParams.set("categoria", category);
    }

    setSearchParams(nextParams);
  };

  const handleSearchChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      nextParams.delete("q");
    } else {
      nextParams.set("q", trimmedValue);
    }

    setSearchParams(nextParams);
  };

  const handleSelectResult = (result: { label: string; category?: string }) => {
    const nextParams = new URLSearchParams(searchParams);
    const categoryValue = result.category || "all";

    if (categoryValue === "all") {
      nextParams.delete("categoria");
    } else {
      nextParams.set("categoria", categoryValue);
    }

    const queryValue = result.label.trim();
    if (queryValue) {
      nextParams.set("q", queryValue);
    } else {
      nextParams.delete("q");
    }

    setSearchParams(nextParams);
  };

  const handleParticipate = async (item: CardItem) => {
    if (!isAuthenticated) {
      Swal.fire({
        title: "Atenção",
        text: "Você precisa estar logado para participar de uma divisão.",
        icon: "warning",
        confirmButtonText: "Entendi",
      });
      return;
    }

    if (item.userParticipates) {
      Swal.fire({
        title: "Você já participa",
        text: "Você já é membro deste grupo.",
        icon: "info",
        confirmButtonText: "Entendi",
      });
      return;
    }

    if (item.privado) {
      Swal.fire({
        title: "Grupo privado",
        text: "Este grupo é privado. Solicite participação ao líder.",
        icon: "info",
        confirmButtonText: "Entendi",
      });
      return;
    }

    if (item.slots <= 0) {
      Swal.fire({
        title: "Grupo cheio",
        text: "Este grupo não possui mais vagas disponíveis.",
        icon: "info",
        confirmButtonText: "Entendi",
      });
      return;
    }

    setIsParticipating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/grupos/${item.id}/participar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || data.message || "Erro ao participar do grupo");
      }

      await Swal.fire({
        title: "Parabéns!",
        text: data.mensagem || "Você entrou no grupo com sucesso!",
        icon: "success",
        confirmButtonText: "Ótimo",
      });

      // Recarregar os grupos para atualizar a UI
      const groupsResponse = await fetch(`${API_BASE_URL}/grupos`);
      if (groupsResponse.ok) {
        const groupsData: BackendGroup[] = await groupsResponse.json();
        setAllGroups(groupsData);
      }

      // Atualizar o item selecionado
      if (selectedItem) {
        const updatedGroups = allGroups.length > 0 ? allGroups : [];
        const updatedGroup = updatedGroups.find((g) => String(g.gru_id) === item.id);
        if (updatedGroup) {
          const updatedCard = buildCardItemFromGroup(updatedGroup, user?.id);
          setSelectedItem(updatedCard);
        }
      }
    } catch (error) {
      console.error("Erro ao participar:", error);
      Swal.fire({
        title: "Erro",
        text: error instanceof Error ? error.message : "Não foi possível participar do grupo. Tente novamente.",
        icon: "error",
        confirmButtonText: "Entendi",
      });
    } finally {
      setIsParticipating(false);
    }
  };

  const heroStyle = {
    ["--hero-x" as string]: `${heroPointer.x}px`,
    ["--hero-y" as string]: `${heroPointer.y}px`,
  } as CSSProperties;

  return (
    <>
      <Nav />
      <main className="divisoes-page">
        <section ref={heroRef} className="SctHero" style={heroStyle}>
          <img src={moeda} alt="" className="hero-image hero-image--left" aria-hidden="true" />
          <img src={moeda} alt="" className="hero-image hero-image--right" aria-hidden="true" />
          <SearchInput
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
            results={searchResults}
            onSelectResult={handleSelectResult}
          />
        </section>

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

        <section className="SctDivision">
          <div className="vagas-section">
            {loading ? (
              <div className="vagas-row__title">
                <h3>Carregando divisões...</h3>
              </div>
            ) : rows.length > 0 ? (
              rows.map((row, index) => (
                <VagasLinha
                  key={row.title + row.items[0]?.id}
                  title={row.title}
                  items={row.items}
                  variant={index < 2 ? "top" : "bottom"}
                  onSelectItem={setSelectedItem}
                />
              ))
            ) : (
              <div className="vagas-row__title">
                <h3>Nenhuma divisão encontrada no momento.</h3>
              </div>
            )}
          </div>
        </section>

        <Dialog open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)}>
          {selectedItem ? (
            <DialogContent className="division-dialog">
              <DialogHeader>
                <div className="division-dialog__header">
                  <div className="division-dialog__service-block">
                    <div className="division-dialog__icon" style={{ backgroundColor: selectedItem.color }}>
                      {selectedItem.icon}
                    </div>
                  </div>

                  <div className="division-dialog__leader-block">
                    <div className="division-dialog__leader-avatar">
                      <AvatarComFoto
                        fotoBase64={selectedItem.leaderFoto}
                        seed={selectedItem.id}
                        className="division-dialog__leader-avatar-image"
                        alt={selectedItem.leaderName}
                      />
                    </div>
                    <div className="division-dialog__leader-info">
                      <strong>Líder: {selectedItem.leaderName}</strong>
                      <div className="division-dialog__stars" aria-label={selectedItem.leaderRating === null ? "Sem avaliações" : `Avaliação de ${selectedItem.leaderRating} estrelas`}>
                        {selectedItem.leaderRating === null
                          ? "Sem avaliações"
                          : Array.from({ length: selectedItem.leaderRating }).map((_, index) => (
                              <FaStar key={index} className="division-dialog__star-icon" />
                            ))}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="division-dialog__body">
                <div className="division-dialog__title-row">
                  <DialogTitle>{selectedItem.name}</DialogTitle>
                  <span className="division-dialog__price">
                    {selectedItem.price}{selectedItem.category === "streaming" ? " / pessoa" : ""}
                  </span>
                </div>
                {selectedItem.category === "streaming" && (
                  <div className="division-dialog__stream-details">
                    <p>Plano: <strong>{selectedItem.planName || "Não informado"}</strong></p>
                    <p>Valor total atual: <strong>{selectedItem.totalPlanPrice || "R$ —"}</strong></p>
                    <p>Divisão entre {selectedItem.divisionCount} {selectedItem.divisionCount === 1 ? "pessoa" : "pessoas"}: <strong>{selectedItem.price}</strong></p>
                  </div>
                )}
                <p className="division-dialog__slots">Vagas disponíveis: {selectedItem.slots}</p>

                {selectedItem.category === "viagens" && (
                  <div className="division-dialog__trip-details">
                    <div>
                      <strong>Partida</strong>
                      <span>{selectedItem.partida || "Não informado"}</span>
                    </div>
                    <div>
                      <strong>Destino</strong>
                      <span>{selectedItem.destino || "Não informado"}</span>
                    </div>
                    {selectedItem.partida && selectedItem.destino && (
                      <MapaViagem partida={selectedItem.partida} destino={selectedItem.destino} />
                    )}
                  </div>
                )}

                <DialogDescription>
                  {selectedItem.description}
                </DialogDescription>

                <button
                  type="button"
                  className="division-dialog__action"
                  onClick={() => handleParticipate(selectedItem)}
                  disabled={
                    isParticipating ||
                    selectedItem.userParticipates ||
                    selectedItem.slots <= 0 ||
                    selectedItem.privado
                  }
                >
                  {isParticipating
                    ? "Participando..."
                    : selectedItem.userParticipates
                      ? "Você já participa"
                      : selectedItem.privado
                        ? "Solicitar participação"
                        : selectedItem.slots <= 0
                          ? "Grupo cheio"
                          : "Participar da Divisão"}
                </button>
              </div>
            </DialogContent>
          ) : null}
        </Dialog>
      </main>
      <Footer />
    </>
  );
}
