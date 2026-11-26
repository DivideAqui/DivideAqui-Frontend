import { FaStar } from "react-icons/fa";
import { DivisionSkeleton } from "./DivisionSkeleton";
import BtnClose from "./btnClose";

export function PerfilParticipanteSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <main className="perfil-participante-container perfil-participante-skeleton" aria-busy="true" aria-label="Carregando perfil">
      <section className="perfil-participante-fundo">
        <BtnClose onClick={onClose} />
      </section>

      <header className="cabecalho-participante">
        <div className="foto-participante">
          <span className="perfil-skeleton__avatar" />
        </div>
        <div className="dados-usuario">
          <div className="estrelas perfil-skeleton__stars">
            {Array.from({ length: 5 }).map((_, index) => <FaStar key={index} />)}
          </div>
          <span className="perfil-skeleton__name" />
        </div>
      </header>

      <section className="descricao-usuario perfil-skeleton__description">
        <span className="perfil-skeleton__line" />
        <span className="perfil-skeleton__line perfil-skeleton__line--short" />
      </section>

      <section className="avaliar-usuario perfil-skeleton__review-prompt">
        <span className="perfil-skeleton__review-icon" />
        <div className="perfil-skeleton__review-copy">
          <span className="perfil-skeleton__line perfil-skeleton__line--title" />
          <span className="perfil-skeleton__line" />
        </div>
        <span className="perfil-skeleton__review-stars" />
      </section>

      <section className="participante-divisoes">
        <span className="perfil-skeleton__section-title" />
        <DivisionSkeleton rows={1} />
      </section>

      <section className="participante-avaliacoes">
        <span className="perfil-skeleton__section-title perfil-skeleton__section-title--wide" />
        <div className="vagas-skeleton__cards perfil-feedback-skeleton">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="vagas-skeleton__card" key={index}>
              <div className="vagas-skeleton__top">
                <span className="vagas-skeleton__icon" />
                <span className="vagas-skeleton__avatars" />
              </div>
              <span className="vagas-skeleton__line vagas-skeleton__line--title" />
              <span className="vagas-skeleton__line" />
              <span className="vagas-skeleton__line" />
              <span className="vagas-skeleton__line vagas-skeleton__line--short" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
