import { useState } from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import { Link } from "react-router-dom"; // removido "data,"
import { useAuth } from "../hooks/useAuth";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import "../css/Cadastro.css";
import GoogleIcon from "../assets/Icons/google-icon.svg";
import logoCadastro from "../assets/Icons/íconeBranco.png";
import { HiEye, HiMiniEyeSlash } from "react-icons/hi2";
import { IoCloseSharp } from "react-icons/io5";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://divide-aqui-backend.vercel.app"
).replace(/\/$/, "");

export function Cadastro() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState<string>("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const { loginWithGoogle, loginWithToken } = useAuth();

  const shaderProps = {
    animate: "on",
    brightness: 1.2,
    cAzimuthAngle: 180,
    cDistance: 3.6,
    cPolarAngle: 90,
    cameraZoom: 1,
    color1: "#188a0d",
    color2: "#1BBB0E",
    color3: "#48CD1A",
    embedMode: "off",
    envPreset: "city",
    format: "gif",
    fov: 45,
    frameRate: 10,
    gizmoHelper: "hide",
    grain: "off",
    lightType: "3d",
    pixelDensity: 1,
    positionX: -1.4,
    positionY: 0,
    positionZ: 0,
    range: "disabled",
    rangeEnd: 40,
    rangeStart: 0,
    reflection: 0.1,
    rotationX: 0,
    rotationY: 10,
    rotationZ: 50,
    shader: "defaults",
    type: "waterPlane",
    uAmplitude: 1,
    uDensity: 1.3,
    uFrequency: 5.5,
    uSpeed: 0.4,
    uStrength: 4,
    uTime: 0,
    wireframe: false,
  } as any;

  const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
  const regexCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  const regexTelefone = /^\(\d{2}\)\s\d{5}-\d{4}$/;
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexSenha = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/;

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatTelefone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  };

  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    console.log("Login bem-sucedido:", credentialResponse);
    try {
      await loginWithGoogle(credentialResponse);
      navigate("/home", { replace: true });
    } catch (e) {
      console.error("Erro no login:", e);
    }
  };

  const handleGoogleError = () => {
    console.log("Login falhou");
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    scope: "openid profile email",
  });

  const handleCadastro = async () => {
  setErro(null);

  if (!nome || !dataNascimento || !cpf || !telefone || !email || !senha) {
      Swal.fire({
        icon: "warning",
        title: "Atenção!",
        text: "Você precisa preencher todos os campos.",
        confirmButtonText: "OK"
    });
    return;
  }
  if (!regexNome.test(nome)) {
       Swal.fire({
        icon: "error",
        title: "Nome inválido",
        text: "Digite um nome válido.",
        confirmButtonText: "OK"
    });
    return;
  }
  if (!regexCPF.test(cpf)) {
    Swal.fire({
      icon: "error",
      title: "CPF inválido",
      text: "Digite um CPF válido.",
      confirmButtonText: "OK"
    });
    return;
  }
  if (telefone && !regexTelefone.test(telefone)) {
    Swal.fire({
      icon: "error",
      title: "Telefone inválido",
      text: "Digite um telefone válido.",
      confirmButtonText: "OK"
    });
    return;
  }
  if (!regexEmail.test(email)) {
    Swal.fire({
      icon: "error",
      title: "E-mail inválido",
      text: "Digite um e-mail válido.",
      confirmButtonText: "OK"
    });
    return;
  }
  if (!regexSenha.test(senha)) {
    Swal.fire({
      icon: "error",
      title: "Senha inválida",
      text: "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, um número e um caractere especial.",
      confirmButtonText: "OK"
    });
    return;
  }

  setCarregando(true);
    try {
      const [ano, mes, dia] = dataNascimento.split("-");
      const dataFormatada = `${dia}/${mes}/${ano}`;

      const response = await fetch(`${API_BASE_URL}/Cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nome,
          email,
          cpf,
          password: senha,
          telefone,
          data_nasc: dataFormatada,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.erro === "Email já cadastrado!") {
          navigate("/login", { replace: true });
          return;
        }

        Swal.fire({
          icon: "error",
          title: "Ops!",
          text: data.erro || "Houve um erro no seu cadastro.",
          confirmButtonText: "Tentar novamente"
        });

        return;
      }

      localStorage.setItem("token", data.token);
      await loginWithToken(data.token);

      await Swal.fire({
        icon: "success",
        title: "Cadastro realizado!",
        text: "Agora vamos dividir!",
        confirmButtonText: "Continuar"
      });
      navigate("/home", { replace: true });
      

      } catch (e) {
        console.error("Erro no cadastro:", e);

        Swal.fire({
          icon: "error",
          title: "Ops!",
          text: e instanceof Error ? e.message : "Erro desconhecido.",
          confirmButtonText: "Tentar novamente"
        });
        
      } finally {
        setCarregando(false);
      }
      
  };

  return (
    <main className="cadastro-page">
      <section className="cadastro-side cadastro-side-left">
        <ShaderGradientCanvas
          className="cadastro-shader"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
          pixelDensity={1}
          fov={45}
        >
          <ShaderGradient {...shaderProps} />
        </ShaderGradientCanvas>

        <div className="cadastro-hero">
          <img src={logoCadastro} alt="Logo" className="logoCadastro" />
        </div>
        <div className="DivSideTexte-cadastro">
          <h1>Pronto para Dividir sem Discussão? Então crie sua Conta aqui</h1>
        </div>
      </section>

      <section className="cadastro-side cadastro-side-right">
        
        <button
          type="button"
          className="IconCancelar"
          onClick={() => navigate(-1)}>
          <IoCloseSharp size={25} />
        </button>

        <div className="conteudo-cadastro">

        <div className="nome-card">
          <label>Nome Completo: *</label>
          <input
            type="text"
            className="InpCadastro"
            placeholder="Ex.: João da Silva"  
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="data-card">
          <label>Data de Nascimento: *</label>
          <input
            type="date"
            className="InpCadastro"
            min="1950-01-01"
            max="2008-12-31"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
          />
        </div>

        <div className="cpf-card">
          <label>CPF: *</label>
          <input
            type="text"
            className="InpCadastro"
            placeholder="000.000.000-00"
            value={cpf}
            maxLength={14}
            onChange={(e) => setCpf(formatCPF(e.target.value))}
          />
        </div>

        <div className="telefone-card">
          <label>Número de Telefone: *</label>
          <input
            type="tel"
            className="InpCadastro"
            placeholder="(00) 00000-0000"
            pattern="^\(\d{2}\)\s\d{5}-\d{4}$"
            value={telefone}
            onChange={(e) => setTelefone(formatTelefone(e.target.value))}
            maxLength={15}
          />
        </div>

        <div className="email-card">
          <label>Seu Email: *</label>
          <input
            type="email"
            className="InpCadastro"
            placeholder="joaodasilva@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="senha-container-cadastro">
          <label>Crie uma Senha Segura: *</label>
          <div className="senha-input-wrapper-cadastro">
          <input
            type={mostrarSenha ? "text" : "password"}
            className="InpCadastro"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <span
            className="eye-icon-cadastro"
            onClick={() => setMostrarSenha(!mostrarSenha)}
          >
            {mostrarSenha ? <HiMiniEyeSlash /> : <HiEye />}
          </span>
          </div>
        </div>

        {erro && <p className="erro-cadastro">{erro}</p>}

        <button
          className="Btn-Cadastrar"
          onClick={handleCadastro}
          disabled={carregando}
        >
          <span>{carregando ? "Cadastrando..." : "Cadastrar"}</span>
        </button>

        <p className="Logar">
          Já tem uma conta?{" "}
          <Link to="/login" className="btn-logar">
            Faça seu Login.
          </Link>
        </p>

        <span className="SpanLinha">
          <hr className="linha" /> <h3>Ou</h3> <hr className="linha" />
        </span>

        <div className="google-cadastro-button">
          <button className="Btn-Google" type="button" onClick={() => login()}>
            <img src={GoogleIcon} alt="Google" className="Btn-Google-Icon" />
            <span>Continuar com Google</span>
          </button>
        </div>
        </div>

      </section>
    </main>
  );
}
