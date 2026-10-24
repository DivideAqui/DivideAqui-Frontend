import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import iconeBranco from "../assets/Imgs/iconeBranco.png";
import "../css/LoadingScreen.css";

const ROTAS_COM_LOADING = [
  "/CriarDivisao",
  "/meuperfil",
  "/meusgrupos",
  "/historico",
  "/detalhedivisao",
  "/criarDivisao",
  "/meuperfil",
  "/perfilparticipante",
];

type LoadingScreenProps = {
  forcar?: boolean;
};

export function LoadingScreen({ forcar = false }: LoadingScreenProps) {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const deveMostrar = ROTAS_COM_LOADING.some(
    (rota) =>
      location.pathname === rota || location.pathname.startsWith(rota + "/"),
  );

  useEffect(() => {
    // Modo forçado: o controle é de quem usa o componente
    if (forcar) {
      setVisible(true);
      setMinimized(false);
      return;
    }

    if (!deveMostrar) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setMinimized(false);

    const showTimer = window.setTimeout(() => setMinimized(true), 1400);
    const hideTimer = window.setTimeout(() => setVisible(false), 2000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [location.pathname, deveMostrar, forcar]);

  if (!visible && !forcar) return null;

  return (
    <div
      className={`loading-screen ${minimized && !forcar ? "loading-screen--minimized" : ""}`}
    >
      <div className="loading-screen__inner">
        <div className="loading-screen__circle">
          <img
            src={iconeBranco}
            alt="DivideAqui"
            className="loading-screen__logo"
          />
        </div>
      </div>
    </div>
  );
}