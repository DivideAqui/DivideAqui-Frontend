<<<<<<< HEAD
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { Home } from "./pages/Home";
import { Login } from "./pages/login";
import { Cadastro } from "./pages/Cadastro";
import { Divisoes } from "./pages/Divisoes";
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
              <Route path="/divisoes" element={<ProtectedRoute><Divisoes /></ProtectedRoute>} />
              <Route path="/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/Cadastro" element={<Cadastro />} />
            </Routes>
          </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
    </>
  );
=======
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Home } from "./pages/Home";

export function App(){
  return(
    <>
      <Router>
      <Routes>
        <Route path="/" element={<Home />}/>
      </Routes>
    </Router>
    </>
  )
>>>>>>> f516fa4b3ea1a1f3366fd7b423d9869b8d24b1c5
}