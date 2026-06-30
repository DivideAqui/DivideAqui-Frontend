<<<<<<< HEAD
import "./../../css/homesStyles/Sobre.css";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
    <section className="sct2" id="homeSobre" ref={sectionRef}>
      <img src={BolinhasAzul} alt="" className="BolinhaSuperior" />
      <img src={BolinhasAzul} alt="" className="BolinhaInferior" />

      <div ref={celularRef}>
        <img src={Celular} alt="Celular" className="ImgCelular" />
      </div>

      <div className="DivTexto" ref={textoRef}>
        <h1 className="H1Titulo-Sobre">
          Qual a proposta <br />
          do <b className="BDestaque-Azul">DivideAqui</b>?
        </h1>

        <p className="PTexto">
          Conectar pessoas para dividir
          <br />
          custos de forma prática, com
          <br />
          divisão automática de gastos
          <br />
          e lembretes de pagamento.
        </p>

        <div className="DivBeneficios">
          <p>+ Economia | - Estresse</p>
        </div>
      </div>
    </section>
  );
=======
import "./../../css/homesStyles/Sobre.css"
import Celular from "../../assets/Imgs/imgCelular.png"
import BolinhasAzul from "../../assets/Imgs/bolinhasAzuis.png"

export function Sobre(){
    return(
        <>
        <section className="sct2" id="homeSobre">
            <img src={BolinhasAzul} alt="Bolinha Azul" className="BolinhaSuperior"/>
            <img src={BolinhasAzul} alt="Bolinha Azul" className="BolinhaInferior"/>
            <div>
            <img src={Celular} alt="Celular" className="ImgCelular"/>
            </div>
            <div className="DivTexto">
                <h1 className="H1Titulo-Sobre">Qual a proposta <br></br> do <b className="BDestaque-Azul">DivideAqui</b>?</h1>
                <p className="PTexto">Conectar pessoas para dividir <br></br> custos de forma prática, com <br></br> divisão automática de gastos <br></br>e lembretes de pagamento.</p>
                <div className="DivBeneficios">
                    <p>+ Economia   |   - Estresse</p>
                </div>
            </div>
        </section>
        </>
    )
>>>>>>> f516fa4b3ea1a1f3366fd7b423d9869b8d24b1c5
}