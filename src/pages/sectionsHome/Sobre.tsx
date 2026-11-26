import "./../../css/homesStyles/Sobre.css";
import "../../css/MinCss/SobreMin.css"
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaSmileWink } from "react-icons/fa";

import Celular from "../../assets/Imgs/imgCelular.png";
import BolinhasAzul from "../../assets/Imgs/bolinhasAzuis.png";

gsap.registerPlugin(ScrollTrigger);

export function Sobre() {
  const sectionRef = useRef(null);
  const celularRef = useRef(null);
  const textoRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "top 20%",
        scrub: 1,
        // markers: true, // ative para testar
      },
    });

    tl.fromTo(
      celularRef.current,
      {
        opacity: 0,
        x: -150,
      },
      {
        opacity: 1,
        x: 0,
        ease: "none",
      }
    ).fromTo(
      textoRef.current,
      {
        opacity: 0,
        x: 150,
      },
      {
        opacity: 1,
        x: 0,
        ease: "none",
      },
      0
    );

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
  <section
    className="sctSobre"
    id="homeSobre"
    ref={sectionRef}
    aria-labelledby="titulo-sobre"
  >
    <img
      src={BolinhasAzul}
      alt=""
      aria-hidden="true"
      className="BolinhaSuperior"
    />

    <img
      src={BolinhasAzul}
      alt=""
      aria-hidden="true"
      className="BolinhaInferior"
    />

    <div className="SobreConteudo">
      <div className="DivTexto" ref={textoRef}>
        <h2 className="H1Titulo-Sobre" id="titulo-sobre">
          Qual é a proposta do{" "}
          <strong className="BDestaque-Azul">DivideAqui</strong>
          ?
        </h2>

        <p className="PTexto">
          Conectar pessoas para dividir custos de forma prática,
          com divisão automática de gastos e lembretes de pagamento.
        </p>

        <div className="DivBeneficios">
          <FaSmileWink
            className="iconAlert"
            size={30}
            aria-hidden="true"
            />
          <p>+ Economia | - Estresse</p>
        </div>
      </div>

      <div className="SobreImagem" ref={celularRef}>
        <img
          src={Celular}
          alt="Celular"
          className="ImgCelular"
        />
      </div>
    </div>
  </section>
);
}