import "../css/divisoes.css";

export function DivisionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="vagas-skeleton" role="status" aria-label="Carregando divisões">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div className="vagas-skeleton__row" key={rowIndex}>
          <span className="vagas-skeleton__heading" />
          <div className="vagas-skeleton__cards">
            {Array.from({ length: 3 }).map((__, cardIndex) => (
              <div className="vagas-skeleton__card" key={cardIndex}>
                <div className="vagas-skeleton__top">
                  <span className="vagas-skeleton__icon" />
                  <span className="vagas-skeleton__avatars" />
                </div>
                <span className="vagas-skeleton__line vagas-skeleton__line--title" />
                <span className="vagas-skeleton__line" />
                <span className="vagas-skeleton__line vagas-skeleton__line--short" />
                <span className="vagas-skeleton__price" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
