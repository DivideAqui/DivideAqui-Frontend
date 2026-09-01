import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./../css/Nav.css";
import { useAuth } from "../hooks/useAuth";
import Logo from "../assets/Icons/logo1Branca.png";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineBell } from "react-icons/hi";
import { MdOutlineExitToApp } from "react-icons/md";

const navItems = [
  { to: "/home", label: "Home" },
  { to: "/divisoes", label: "Divisões" },
  { to: "/historico", label: "Histórico" },
];

const homeSections = [
  { id: "homeInicio", label: "Início" },
  { id: "homeSobre", label: "Sobre" },
  { id: "homeFeedbacks", label: "Feedbacks" },
  { id: "homeComoFunciona", label: "Como Funciona" },
];

const formatDisplayName = (name?: string) => {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (!parts.length) {
    return "Usuário";
  }

  if (parts.length <= 3) {
    return parts.join(" ");
  }

  return `${parts.slice(0, 3).join(" ")}...`;
};

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(homeSections[0].id);
  const { user, logout } = useAuth();
  const displayName = formatDisplayName(user?.name);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      let current = homeSections[0].id;
      for (const section of homeSections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            current = section.id;
          }
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuClick = () => setMenuOpen((open) => !open);
  const closeMenu = () => setMenuOpen(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 80,
        behavior: "smooth",
      });
    }
  };

  const handleSectionClick = (id: string) => {
    scrollToSection(id);
    setActiveSection(id);
    closeMenu();
  };

  const renderNavLinks = () =>
    navItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) => (isActive ? "ativo nav-ativo" : "")}
        onClick={closeMenu}
      >
        {item.label}
      </NavLink>
    ));

  const renderUserDropdown = () => {
    if (!user || !userMenuOpen) {
      return null;
    }

    return (
      <div className="user-dropdown">
        <div className="user-dropdown-header">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="nav-user-avatar"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="nav-user-avatar-fallback">{user.name?.trim()?.charAt(0)?.toUpperCase() || "U"}</span>
          )}
          <h3>{displayName}</h3>
        </div>
        <Link to="/perfil" onClick={() => setUserMenuOpen(false)}>
          Meu Perfil
        </Link>
        <Link to="/configuracoes" onClick={() => setUserMenuOpen(false)}>
          Configurações
        </Link>
        <button
          type="button"
          className="user-dropdown-logout"
          onClick={() => {
            logout();
            setUserMenuOpen(false);
          }}
        >
          Sair
          <MdOutlineExitToApp className="ExitIcon" />
        </button>
      </div>
    );
  };

  if (!user) {
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
            {homeSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={activeSection === section.id ? "ativo nav-ativo" : ""}
                onClick={(event) => {
                  event.preventDefault();
                  handleSectionClick(section.id);
                }}
              >
                {section.label}
              </a>
            ))}
            <Link to="/login" className="btn-login" onClick={closeMenu}>
              Entrar
            </Link>
            <Link to="/Cadastro" className="btn-cadastro" onClick={closeMenu}>
              Cadastrar
            </Link>
          </nav>

          <div className="NavActions">
            <Link to="/login" className="btn-login">
              Entrar
            </Link>
            <Link to="/Cadastro" className="btn-cadastro">
              Cadastrar
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="NavHeader">
      <div className="NavActions nav-actions-left">
        <div className="nav-notification">
          <HiOutlineBell className="nav-bell" />
          <span className="nav-bell-dot" aria-hidden="true" />
        </div>
      </div>

      <div className="Navegacao">
        <div className="NavLogo">
          <img src={Logo} alt="Logo DivideAqui" />
        </div>

        <div className="nav-hamburger" onClick={handleMenuClick} aria-label="Abrir menu" tabIndex={0}>
          <span style={{ transform: menuOpen ? "translateY(12px) rotate(45deg)" : undefined }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? "translateY(-12px) rotate(-45deg)" : undefined }} />
        </div>

        <nav className={menuOpen ? "open" : ""}>{renderNavLinks()}</nav>

        <div className="NavActions">
          <Link to="/divisoes" className="btn-cadastro btn-criar-divisao">
            Criar Divisão
          </Link>
        </div>
      </div>

      <div className="NavActions nav-actions-right">
        <div className="nav-user-fs">
          <button
            type="button"
            className="nav-user"
            onClick={() => setUserMenuOpen((open) => !open)}
          >
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="nav-user-avatar"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="nav-user-avatar-fallback">
                {user.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}

            <IoIosArrowDown
              style={{
                transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "0.3s",
              }}
            />
          </button>
          {renderUserDropdown()}
        </div>
      </div>
    </header>
  );
}
