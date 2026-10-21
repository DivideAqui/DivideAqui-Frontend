import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { FaPlay, FaCar, FaHouseUser, FaEllipsisH } from "react-icons/fa";
import "../css/SearchInput.css";

type SearchResult = {
  id: string;
  label: string;
  subtitle: string;
  meta: string;
  category?: string;
  participantes?: Array<{ id: string; nome: string; foto?: string | null }>;
  leaderFoto?: string | null;
};

type SearchInputProps = {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocusChange?: (isFocused: boolean) => void;
  results?: SearchResult[];
  onSelectResult?: (result: SearchResult) => void;
};

const getCategoryIcon = (category?: string) => {
  switch (category) {
    case "streaming": return <FaPlay />;
    case "viagens": return <FaCar />;
    case "despesas": return <FaHouseUser />;
    default: return <FaEllipsisH />;
  }
};

const getCategoryColor = (category?: string) => {
  switch (category) {
    case "streaming": return "#00A8E1";
    default: return "#79C734";
  }
};

export function SearchInput({
  className = "",
  placeholder = "O que vamos dividir?",
  value = "",
  onChange,
  onFocusChange,
  results = [],
  onSelectResult,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const normalizedValue = value.trim();

  const handleFocus = () => {
    setIsFocused(true);
    onFocusChange?.(true);
  };

  const handleBlur = () => {
    window.setTimeout(() => {
      setIsFocused(false);
      onFocusChange?.(false);
    }, 120);
  };

  const handleResultClick = (result: SearchResult) => {
    onSelectResult?.(result);
    setIsFocused(false);
    onFocusChange?.(false);
  };

  const shouldShowResults = isFocused && (normalizedValue.length > 0 || results.length > 0);

  return (
    <div className={`SearchInputWrapper ${isFocused ? "SearchInputWrapper-focused" : ""} ${className}`.trim()}>
      <input
        type="text"
        value={value}
        className={`InpPesquisa ${isFocused ? "InpPesquisa-focused" : ""}`.trim()}
        placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(event) => onChange?.(event.target.value)}
      />
      <IoSearch className="SearchInputIcon" />

      {shouldShowResults ? (
        <div className="SearchInputResults" role="listbox" aria-label="Resultados da busca">
          {results.length > 0 ? (
            results.map((result) => (
              <button
                key={result.id}
                type="button"
                className="SearchInputResults__item"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleResultClick(result);
                }}
                onClick={() => handleResultClick(result)}
              >
                <div className="SearchInputResults__left">
                  <span
                    className="SearchInputResults__icon"
                    style={{ backgroundColor: getCategoryColor(result.category) }}
                  >
                    {getCategoryIcon(result.category)}
                  </span>
                  <div className="SearchInputResults__text">
                    <strong>{result.label}</strong>
                    <span>{result.subtitle}</span>
                    {result.participantes && result.participantes.length > 0 && (
                      <span className="SearchInputResults__participantes">
                        com {result.participantes.slice(0, 3).map(p => p.nome).join(", ")}
                        {result.participantes.length > 3 && ` e mais ${result.participantes.length - 3}`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="SearchInputResults__right">
                  <span className="SearchInputResults__meta">{result.meta}</span>
                  {result.participantes && result.participantes.length > 0 && (
                    <div className="SearchInputResults__avatars">
                      {result.participantes.slice(0, 3).map((p, i) => (
                        <div
                          key={p.id}
                          className="SearchInputResults__avatar"
                          style={{ zIndex: 3 - i }}
                          title={p.nome}
                        >
                          {p.foto ? (
                            <img src={p.foto} alt={p.nome} />
                          ) : (
                            <span>{p.nome.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                      ))}
                      {result.participantes.length > 3 && (
                        <div className="SearchInputResults__avatar SearchInputResults__avatar--more">
                          +{result.participantes.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="SearchInputResults__empty">Nenhuma divisão encontrada.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
