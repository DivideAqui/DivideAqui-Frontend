import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaComments, FaTimes, FaPaperPlane, FaUser } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import "../css/DivideAI.css";
import DivIconBranco from "../assets/Icons/íconeBranco.png";

interface Mensagem {
  id: string;
  role: "user" | "model";
  content: string;
}

interface NavigateAction {
  path: string;
  label: string;
}

interface RespostaIA {
  reply: string;
  navigate?: NavigateAction | null;
  erro?: string;
}

const SUGESTOES_INICIAIS = [
  "Onde eu crio uma divisão?",
  "Quantas divisões tenho ativas agora?",
  "Como funciona o DivideAqui?",
];

const API_URL = import.meta.env.VITE_API_URL || "https://divide-aqui-backend.vercel.app";

export function DivideAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem("divideai_messages");
    if (saved) {
      try {
        setMensagens(JSON.parse(saved));
      } catch {
        localStorage.removeItem("divideai_messages");
      }
    }
  }, []);

  useEffect(() => {
    if (mensagens.length > 0) {
      localStorage.setItem("divideai_messages", JSON.stringify(mensagens));
    }
  }, [mensagens]);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, mensagens]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const salvarMensagem = (role: "user" | "model", content: string) => {
    setMensagens((prev) => [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, role, content }]);
    setTimeout(scrollToBottom, 100);
  };

  const enviarMensagem = async (texto: string) => {
    if (!texto.trim() || isLoading) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Faça login para usar o Divide A.i");
      return;
    }

    setIsLoading(true);
    setError(null);

    salvarMensagem("user", texto);
    setInputValue("");

    try {
      const historico = mensagens.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mensagem: texto, historico }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.erro || "Erro ao enviar mensagem");
      }

      const data: RespostaIA = await response.json();

      salvarMensagem("model", data.reply);

      if (data.navigate) {
        setTimeout(() => {
          const navMensagemId = `nav-${Date.now()}`;
          setMensagens((prev) => [
            ...prev,
            {
              id: navMensagemId,
              role: "model",
              content: `__NAVIGATE__${JSON.stringify(data.navigate)}`,
            },
          ]);
        }, 300);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao conectar com o servidor";
      setError(errorMessage);
      salvarMensagem("model", `⚠️ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enviarMensagem(inputValue);
  };

  const handleSugestaoClick = (sugestao: string) => {
    enviarMensagem(sugestao);
  };

  const novaConversa = () => {
    setMensagens([]);
    localStorage.removeItem("divideai_messages");
    setError(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const formatarMensagem = (texto: string) => {
    if (texto.startsWith("__NAVIGATE__")) {
      try {
        const nav = JSON.parse(texto.replace("__NAVIGATE__", ""));
        return (
          <button
            type="button"
            className="divideai-navigate-btn"
            onClick={() => handleNavigate(nav.path)}
          >
            → {nav.label}
          </button>
        );
      } catch {
        return texto;
      }
    }

    const partes = texto.split(/(\{[^}]*"navigate"[^}]*\})/g);
    return partes.map((parte, index) => {
      if (parte.match(/^\{[^}]*"navigate"/)) {
        try {
          const nav = JSON.parse(parte);
          if (nav.navigate) {
            return (
              <button
                key={index}
                type="button"
                className="divideai-navigate-btn"
                onClick={() => handleNavigate(nav.navigate.path)}
              >
                → {nav.navigate.label}
              </button>
            );
          }
        } catch {
          return parte;
        }
      }
      return parte;
    });
  };

  if (!user) return null;

  return (
    <>
      <button
        type="button"
        className="divideai-fab"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Fechar chat" : "Abrir Divide A.i"}
      >
        {isOpen ? <FaTimes /> : <FaComments />}
      </button>

      {isOpen && (
        <div className="divideai-window">
          <div className="divideai-header">
            <div className="divideai-header-info">
              <img src={DivIconBranco} alt="Divide A.i" className="divideai-header-icon" />
              <span className="divideai-header-title">Divide A.i</span>
            </div>
            <div className="divideai-header-actions">
              <button
                type="button"
                className="divideai-new-chat"
                onClick={novaConversa}
                title="Nova conversa"
              >
                Novo
              </button>
              <button
                type="button"
                className="divideai-close"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="divideai-messages">
            {mensagens.length === 0 && (
              <div className="divideai-empty">
                <p className="divideai-empty-title">
                  Olá! Sou o Divide A.i 
                </p>
                <p className="divideai-empty-subtitle">Como posso ajudar você hoje?</p>
                <div className="divideai-suggestions">
                  {SUGESTOES_INICIAIS.map((sugestao, index) => (
                    <button
                      key={index}
                      type="button"
                      className="divideai-suggestion-btn"
                      onClick={() => handleSugestaoClick(sugestao)}
                    >
                      {sugestao}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mensagens.map((msg) => (
              <div
                key={msg.id}
                className={`divideai-message divideai-message-${msg.role}`}
              >
                <div className="divideai-message-icon">
                  {msg.role === "model" ? (
                    <img src={DivIconBranco} alt="Divide A.i" className="divideai-message-icon-img" />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <div className="divideai-message-content">
                  {msg.role === "model" ? (
                    formatarMensagem(msg.content)
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="divideai-message divideai-message-model divideai-loading">
                <div className="divideai-message-icon">
                  <img src={DivIconBranco} alt="Divide A.i" className="divideai-message-icon-img" />
                </div>
                <div className="divideai-message-content">
                  <span className="divideai-typing-dot"></span>
                  <span className="divideai-typing-dot"></span>
                  <span className="divideai-typing-dot"></span>
                </div>
              </div>
            )}

            {error && mensagens.length === 0 && (
              <div className="divideai-error">{error}</div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="divideai-input-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="divideai-input"
              placeholder="Digite sua mensagem..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="divideai-send"
              disabled={isLoading || !inputValue.trim()}
              aria-label="Enviar"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
