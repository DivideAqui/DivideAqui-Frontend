import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { Home } from "./pages/Home";
import { Login } from "./pages/login";
import { Cadastro } from "./pages/Cadastro";
import { Divisoes } from "./pages/Divisoes";
import { PerfilParticipante } from "./pages/perfilParticipante";
import { MeuPerfil } from "./pages/meuPerfil";
import { MeusGrupos } from "./pages/meusGrupos";
import { Historico } from "./pages/Historico";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function App() {
  return (
    <>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              
              <Route path="/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
              <Route path="/perfilparticipante" element={<ProtectedRoute><PerfilParticipante /></ProtectedRoute>} />
              <Route path="/meuperfil" element={<ProtectedRoute><MeuPerfil /></ProtectedRoute>} />
              <Route path="/meusgrupos" element={<ProtectedRoute><MeusGrupos /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/divisoes" element={<Divisoes />} />
              <Route path="/Cadastro" element={<Cadastro />} />
            </Routes>
          </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
    </>
  );
}