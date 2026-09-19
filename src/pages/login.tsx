import { useState, type ChangeEvent, type FormEvent } from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import { HiEye, HiMiniEyeSlash } from "react-icons/hi2";
import { IoCloseSharp } from "react-icons/io5";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import { useAuth } from "../hooks/useAuth";
import "../css/Login.css";
import Logo from "../assets/Icons/íconeBranco.png";
import GoogleIcon from "../assets/Icons/google-icon.svg";

export function Login() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [formData, setFormData] = useState({
    indentificador: "",
    passorwd: "",
  });

  const { loginWithGoogle, loginWithToken } = useAuth();
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
    console.log("Ops! Algo deu errado no seu login com o Google.");
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    scope: "openid profile email",
  });
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.indentificador) {
    Swal.fire({
        icon: "warning",
        title: "Campo obrigatório",
        text: "Digite seu e-mail.",
        confirmButtonText: "OK"
    });
    return;
    }
    if (!formData.passorwd) {
        Swal.fire({
            icon: "warning",
            title: "Campo obrigatório",
            text: "Digite sua senha.",
            confirmButtonText: "OK"
        });
        return;
    }

    try {
        const eEmail = formData.indentificador.includes("@");

        const enviarBack = {
            cpf: !eEmail ? formData.indentificador : undefined,
            email: eEmail ? formData.indentificador : undefined,
            password: formData.passorwd,
        };

        const resposta = await axios.post(
            "http://localhost:3344/Login",
            enviarBack,
        );

        const token = resposta.data.token;

        localStorage.setItem("token", token);
        await loginWithToken(token);
        navigate("/home", { replace: true });

    } catch (error) {
        console.log(error);
    }
};

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
          <img src={Logo} alt="Logo" className="ImgLogoLogin" />
        </div>
        <div className="DivSideTexte">
          <h1>
            Bora Economizar sem <p></p>Perder o Streaming?
          </h1>
          <h3>Seu bolso agradece!</h3>
        </div>
      </section>

      <section className="login-side login-side-right">
  <form onSubmit={enviar}>

    <button
      type="button"
      className="IconCancelar-login"
      onClick={() => navigate(-1)}
    >
      <IoCloseSharp size={25} />
    </button>

    <div className="conteudo-login">

      <div className="login-card">
        
        <label>Digite seu Email: *</label>

        <input
          type="text"
          className="InpLogin"
          placeholder="joaodasilva@gmail.com"
          name="indentificador"
          value={formData.indentificador}
          onChange={handleChange}
        />

        <div className="senha-container-login">
          <label>Digite sua senha: *</label>

          <div className="senha-input-wrapper-login">
            <input
              type={mostrarSenha ? "text" : "password"}
              className="InpLogin"
              placeholder="Senha"
              name="passorwd"
              value={formData.passorwd}
              onChange={handleChange}
            />
            <span
              className="eye-button-login"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? <HiMiniEyeSlash /> : <HiEye />}
            </span>
          </div>

        </div>
      </div>

      <a href="#" className="Asenha">
        Esqueceu a senha?
      </a>

      <button className="Btn-Logar" type="submit">
        <span>Logar</span>
      </button>

      <span className="SpanLinha">
        <hr className="linha-login" />
        <h3>Ou</h3>
        <hr className="linha-login" />
      </span>

      <div className="google-login-button">
        <button
          className="Btn-Google"
          type="button"
          onClick={() => login()}
        >
          <img
            src={GoogleIcon}
            alt="Google"
            className="Btn-Google-Icon"
          />
          <span>Continuar com Google</span>
        </button>
      </div>

    </div>

  </form>
</section>
    </main>
  );
}
