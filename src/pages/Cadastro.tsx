import { useState } from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link } from "react-router-dom";

import "../css/Cadastro.css";
import logoCadastro from "../assets/Icons/íconeBranco.png";

export function Cadastro() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState<string>("");
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
          <img src={logoCadastro} alt="Logo" className="logoCadastro"/>
        </div>
        <div className="DivSideTexte-cadastro">
          <h1>Pronto para Dividir sem Discussão? Então crie sua Conta aqui</h1>
        </div>
      </section>

      <section className="cadastro-side cadastro-side-right">
        <div className="nome-card">
          <input
            type="text"
            className="InpCadastro"
            placeholder="Nome Completo"     
          />

        <div className="data-card">
          <input
            type="date"
            className="InpCadastro"
            placeholder="Data de Nascimento"
            min="1950-01-01" max="2008-12-31"
          />

        <div className="cpf-card">
          <input
            type="text"
            className="InpCadastro"
            placeholder="CPF"
            value={cpf}
            maxLength={14}
            onChange={(e) => setCpf(formatCPF(e.target.value))}
          />

        <div className="telefone-card">
          <input
            type="tel"
            className="InpCadastro"
            placeholder="Número de Telefone"
            pattern="^\(\d{2}\)\s\d{5}-\d{4}$"
            value={telefone}
            onChange={(e) => setTelefone(formatTelefone(e.target.value))}
            maxLength={15}
          />

        <div className="email-card">
          <input
            type="email"
            className="InpCadastro"
            placeholder="Email"
          />

        <div className="senha-container">
            <input
              type={mostrarSenha ? "text" : "password"}
              className="InpCadastro"
              placeholder="Senha"
            />
        
        <span
              className="eye-icon-cadastro"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? <FiEyeOff/> : <FiEye />}
        </span>     

          </div>
        </div>
        </div>
        </div>
        </div>
        </div>

        <button className="Btn-Cadastrar">
          <span>Cadastrar</span>
        </button>

        <a href="#" className="Logar">
          Já tem uma conta? <Link to="/login" className="btn-logar">Faça seu Login.</Link>
        </a>

        <span className="SpanLinha"><hr className="linha"/> <h3>Ou</h3> <hr className="linha"/></span>
      </section>
    </main>
  );
}