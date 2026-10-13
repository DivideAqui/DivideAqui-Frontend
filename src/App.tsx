import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { Home } from "./pages/Home";
import { Login } from "./pages/login";
import { Cadastro } from "./pages/Cadastro";
import { Divisoes } from "./pages/Divisoes";
import { CriarDivisão } from "./pages/CriarDivisão";
import { MeuPerfil } from "./pages/meuPerfil";
import { PerfilParticipante } from "./pages/perfilParticipante";
import { MeusGrupos } from "./pages/meusGrupos";
import { Historico } from "./pages/Historico";
import { DetalheDivisão } from "./pages/DetalheDivisão";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import { DivideAI } from "./components/DivideAI";
import { LoadingScreen } from "./components/LoadingScreen";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function App() {
  return (
    <>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <Router>
            <LoadingScreen />
            <DivideAI />
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />

              <Route path="/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
              <Route path="/CriarDivisao" element={<ProtectedRoute><CriarDivisão /></ProtectedRoute>} />
              <Route path="/meuperfil" element={<ProtectedRoute><MeuPerfil /></ProtectedRoute>} />
              <Route path="/perfilparticipante/:id" element={<ProtectedRoute><PerfilParticipante /></ProtectedRoute>} />
              <Route path="/meusgrupos" element={<ProtectedRoute><MeusGrupos /></ProtectedRoute>} />
              <Route path="/detalhedivisão" element={<DetalheDivisão/>} />
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
