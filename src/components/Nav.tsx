import { useEffect, useState } from "react";
import "./../css/Nav.css";
import Logo from "../assets/Icons/logo1Branca.png"


const sections = [
  { id: "homeInicio", label: "Início" },
  { id: "homeSobre", label: "Sobre" },
  { id: "homeFeedbacks", label: "Feedbacks" },
  { id: "homeFAQS", label: "FAQS" },
];

export function Nav() {
  const [active, setActive] = useState(sections[0].id);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      let current = sections[0].id;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            current = section.id;
          }
        }
      }
      setActive(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 80,
        behavior: "smooth",
      });
    }
  };

  const handleMenuClick = () => setMenuOpen((open) => !open);
  const handleLinkClick = (id: string) => {
    scrollToSection(id);
    setActive(id);
    setMenuOpen(false);
  };

  return (
    <header className="NavHeader">
      <div className="Navegacao">
         <div className="NavLogo">
        <img src={Logo} alt="Logo DivideAqui" />
      </div>
   
        <div className="nav-hamburger" onClick={handleMenuClick} aria-label="Abrir menu" tabIndex={0}>
            
          <span style={{ transform: menuOpen ? "translateY(12px) rotate(45deg)" : undefined }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? "translateY(-12px) rotate(-45deg)" : undefined }} />
        </div>
        <nav className={menuOpen ? "open" : ""}>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={active === section.id ? "ativo nav-ativo" : ""}
              onClick={e => {
                e.preventDefault();
                handleLinkClick(section.id);
              }}
            >
              {section.label}
            </a>
          ))}
        <button className="btn-login">Entrar</button>
        <button className="btn-cadastro">Cadastrar</button>
        </nav>
        
        
      </div>
      <div className="NavActions">
        
      </div>
    </header>
  );
}
