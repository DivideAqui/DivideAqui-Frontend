import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import iconeBranco from "../assets/Imgs/iconeBranco.png";
import "../css/LoadingScreen.css";

const ROTAS_COM_LOADING = [
  "/CriarDivisao",
  "/meuperfil",
  "/meusgrupos",
  "/historico",
  "/detalhedivisão",
  "/criarDivisao",
  "/meuperfil",
  "/perfilparticipante",
];

export function LoadingScreen() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const deveMostrar = ROTAS_COM_LOADING.some(
    (rota) => location.pathname === rota || location.pathname.startsWith(rota + "/")
  );

  useEffect(() => {
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
  }, [location.pathname, deveMostrar]);

  if (!visible) return null;

  return (
    <div className={`loading-screen ${minimized ? "loading-screen--minimized" : ""}`}>
      <div className="loading-screen__inner">
        <div className="loading-screen__circle">
          <img src={iconeBranco} alt="DivideAqui" className="loading-screen__logo" />
        </div>
      </div>
    </div>
  );
}
