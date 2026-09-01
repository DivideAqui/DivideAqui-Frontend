import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { SearchInput } from "../components/SearchInput";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import "../css/divisoes.css";
import "../css/SearchInput.css";
import moeda from "../assets/Imgs/moeda.png";
import { useSearchParams } from "react-router-dom";

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

type BackendGroup = {
  gru_id: number;
  gru_num_part: number;
  lid_id: number;
  cat_id: number;
  categoria?: {
    cat_id: number;
    cat_nome: string;
  };
  lider?: {
    lid_id: number;
    usuario?: {
      usu_id: number;
      usu_nome: string;
      usu_avaliacao?: string | null;
    };
  };
  _count?: {
    participantes: number;
  };
};

type CardItem = {
  id: string;
  name: string;
  price: string;
  slots: number;
  color: string;
  icon: ReactNode;
  leaderName: string;
  leaderAvatar: string;
  leaderRating: number;
  description: string;
  category: CategoryKey;
};

const API_BASE_URL = "https://divide-aqui-backend.vercel.app";

const getCategoryKey = (value?: string | null): CategoryKey => {
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

const buildCardItemFromGroup = (group: BackendGroup): CardItem => {
  const category = getCategoryKey(group.categoria?.cat_nome);
  const leaderName = group.lider?.usuario?.usu_nome ?? "Líder do grupo";
  const participantTotal = Math.max(1, group.gru_num_part || 1);
  const currentParticipants = Math.max(0, group._count?.participantes ?? 0);
  const slots = Math.max(0, participantTotal - currentParticipants);

  return {
    id: String(group.gru_id),
    name: `${getCategoryTitle(group.categoria?.cat_nome)} ${group.gru_id}`,
    price: "R$ —",
    slots,
    color: category === "streaming" ? "#00A8E1" : category === "viagens" ? "var(--verde-escuro)" : "var(--verde-escuro)",
    icon: getCategoryIcon(category),
    leaderName,
    leaderAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(leaderName)}`,
    leaderRating: Math.min(5, Math.max(3, participantTotal)),
    description: getGroupDescription(leaderName, category),
    category,
  };
};

const buildRowsFromGroups = (groups: BackendGroup[]) => {
  const groupedByCategory = groups.reduce<Record<CategoryKey, BackendGroup[]>>(
    (accumulator, group) => {
      const categoryKey = getCategoryKey(group.categoria?.cat_nome);
      accumulator[categoryKey] = accumulator[categoryKey] ?? [];
      accumulator[categoryKey].push(group);
      return accumulator;
    },
    { streaming: [], viagens: [], despesas: [], outros: [] },
  );

  return [
    { title: "Streaming", items: (groupedByCategory.streaming ?? []).map(buildCardItemFromGroup) },
    { title: "Viagens", items: (groupedByCategory.viagens ?? []).map(buildCardItemFromGroup) },
    { title: "Despesas Domésticas", items: (groupedByCategory.despesas ?? []).map(buildCardItemFromGroup) },
    { title: "Outros", items: (groupedByCategory.outros ?? []).map(buildCardItemFromGroup) },
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
  const leaderName = group.lider?.usuario?.usu_nome ?? "";
  const groupLabel = `${getCategoryTitle(categoryName)} ${group.gru_id}`;
  const haystack = [categoryName, leaderName, getCategoryTitle(categoryName), groupLabel].join(" ").toLowerCase();

  return haystack.includes(query);
};

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
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

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
    <div className={`vagas-row vagas-row--${variant}`}>
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
                  <span className="vagas-card__lock"><FaLock /></span>
                  {item.icon}
                </div>

                <div className="vagas-card__avatars" aria-label="Participantes">
                  {Array.from({ length: Math.min(Math.max(1, item.slots + 1), 4) }).map((_, index) => (
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
                        alt={`Participante ${index + 1}`}
                        className="vagas-card__avatar-image"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="vagas-card__topline">
                <span className="vagas-card__price">{item.price}</span>
              </div>

              <div className="vagas-card__body">
                <h4>{item.name}</h4>
                <p>Vagas disponíveis: {item.slots}</p>
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
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = (searchParams.get("categoria") as CategoryKey | "all") ?? "all";
  const searchTerm = searchParams.get("q") ?? "";
  const normalizedSearch = normalizeString(searchTerm);

  const searchResults = useMemo(() => {
    if (!normalizedSearch) {
      return [];
    }

    return allGroups
      .filter((group) => matchesSearchGroup(group, normalizedSearch))
      .slice(0, 5)
      .map((group) => {
        const category = getCategoryKey(group.categoria?.cat_nome);
        const leaderName = group.lider?.usuario?.usu_nome ?? "Líder do grupo";
        const slots = Math.max(0, (group.gru_num_part || 1) - (group._count?.participantes ?? 0));

        return {
          id: String(group.gru_id),
          label: `${getCategoryTitle(group.categoria?.cat_nome)} ${group.gru_id}`,
          subtitle: `Líder: ${leaderName}`,
          meta: `${slots} vagas`,
          category,
        };
      });
  }, [allGroups, normalizedSearch]);

  const filteredGroups = useMemo(() => {
    return allGroups.filter((group) => {
      const categoryKey = getCategoryKey(group.categoria?.cat_nome);
      const categoryMatches = activeCategory === "all" || categoryKey === activeCategory;
      const searchMatches = !normalizedSearch || matchesSearchGroup(group, normalizedSearch);
      return categoryMatches && searchMatches;
    });
  }, [activeCategory, allGroups, normalizedSearch]);

  const rows = useMemo(() => buildRowsFromGroups(filteredGroups), [filteredGroups]);

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

  return (
    <>
      <Nav />
      <main className="divisoes-page">
        <section className="SctHero">
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
                      <img src={selectedItem.leaderAvatar} alt={selectedItem.leaderName} className="division-dialog__leader-avatar-image" />
                    </div>
                    <div className="division-dialog__leader-info">
                      <strong>Líder: {selectedItem.leaderName}</strong>
                      <div className="division-dialog__stars" aria-label={`Avaliação de ${selectedItem.leaderRating} estrelas`}>
                        {Array.from({ length: selectedItem.leaderRating }).map((_, index) => (
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
                  <span className="division-dialog__price">{selectedItem.price}</span>
                </div>
                <p className="division-dialog__slots">Vagas disponíveis: {selectedItem.slots}</p>

                <DialogDescription>
                  {selectedItem.description}
                </DialogDescription>

                <button type="button" className="division-dialog__action">
                  Participar da Divisão
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
