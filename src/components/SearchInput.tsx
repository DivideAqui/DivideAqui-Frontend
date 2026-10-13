import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import "../css/SearchInput.css";

type SearchResult = {
  id: string;
  label: string;
  subtitle: string;
  meta: string;
  category?: string;
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
            results.slice(0, 5).map((result) => (
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
                <div className="SearchInputResults__text">
                  <strong>{result.label}</strong>
                  <span>{result.subtitle}</span>
                </div>
                <span className="SearchInputResults__meta">{result.meta}</span>
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
