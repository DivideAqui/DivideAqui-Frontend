import { useState } from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import "../css/Login.css";
import Logo from "../assets/Icons/íconeBranco.png";
import GoogleIcon from "../assets/Icons/google-icon.svg";

export function Login() {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const { loginWithGoogle } = useAuth();
  const shaderProps = {
    animate: "on",
    brightness: 1.2,
    cAzimuthAngle: 180,
    cDistance: 3.6,
    cPolarAngle: 90,
    cameraZoom: 1,
    color1: "#03045e",
    color2: "#0000a3",
    color3: "#050cc8",
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

  return (
    <main className="login-page">
      <section className="login-side login-side-left">
        <ShaderGradientCanvas
          className="login-shader"
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

        <div className="login-hero">
          <img src={Logo} alt="Logo" className="ImgLogoLogin"/>
        </div>
        <div className="DivSideTexte">
          <h1>Bora Economizar sem <p></p>Perder o Streaming?</h1>
          <h3>Seu bolso agradece!</h3>
        </div>
      </section>

      <section className="login-side login-side-right">
        <div className="login-card">
          <input
            type="text"
            className="InpLogin"
            placeholder="Email"
          />

          <div className="senha-container">
            <input
              type={mostrarSenha ? "text" : "password"}
              className="InpLogin"
              placeholder="Senha"
            />

            <span
              className="eye-icon"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? <FiEyeOff/> : <FiEye />}
            </span>
          </div>
        </div>

        <a href="#" className="Asenha">
          Esqueceu a senha?
        </a>

        <button className="Btn-Logar">
          <span>Logar</span>
        </button>
        <span className="SpanLinha"><hr className="linha"/> <h3>Ou</h3> <hr className="linha"/></span>

        <div className="google-login-button">
          <button className="Btn-Google" onClick={() => login()}>
            <img src={GoogleIcon} alt="Google" className="Btn-Google-Icon" />
            <span>Continuar com Google</span>
          </button>
        </div>
      </section>
    </main>
  );
}