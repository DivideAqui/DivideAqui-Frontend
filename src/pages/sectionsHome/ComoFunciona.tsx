import "./../../css/homesStyles/ComoFunciona.tsx.css";
import "../../css/MinCss/ComoFuncionaMin.css";

import BolinhasAzuis from "../../assets/Imgs/bolinhasAzuis.png";
import ImgPessoa from "../../assets/Imgs/imgPessoa.png";

import { useEffect, useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TbAlertTriangleFilled } from "react-icons/tb";

gsap.registerPlugin(ScrollTrigger);

export function ComoFunciona() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "top 20%",
          scrub: 1,
          // markers: true,
        },
      });

      tl.fromTo(
        ".ImgPessoa",
        {
          opacity: 0,
          x: -150,
          scale: 0.9,
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          ease: "none",
        }
      )
        .fromTo(
          ".DivComoFunciona h1",
          {
            opacity: 0,
            y: 80,
          },
          {
            opacity: 1,
            y: 0,
            ease: "none",
          },
          0
        )
        .fromTo(
          ".DivComoFunciona-Texto h3, .DivComoFunciona-Texto p",
          {
            opacity: 0,
            y: 60,
          },
          {
            opacity: 1,
            y: 0,
            stagger: 0.08,
            ease: "none",
          },
          0.15
        )
        .fromTo(
          ".LinhaComoFunciona",
          {
            opacity: 0,
            y: 80,
          },
          {
            opacity: 1,
            y: 0,
            ease: "none",
          },
          0.2
        )
        .fromTo(
          ".CardComoFunciona",
          {
            opacity: 0,
            y: 100,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: "none",
          },
          0.35
        )
        .fromTo(
          ".ImgBolinhasAzuis1",
          {
            opacity: 0,
            x: -50,
          },
          {
            opacity: 1,
            x: 0,
            ease: "none",
          },
          0
        )
        .fromTo(
          ".ImgBolinhasAzuis2",
          {
            opacity: 0,
            x: 50,
          },
          {
            opacity: 1,
            x: 0,
            ease: "none",
          },
          0
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  
return (
  <section
    className="sctComoFunciona"
    id="homeComoFunciona"
    ref={sectionRef}
    aria-labelledby="tituloComoFunciona"
  >

    <img
      src={BolinhasAzuis}
      alt=""
      aria-hidden="true"
      className="BolinhaSuperior"
    />

    <img
      src={BolinhasAzuis}
      alt=""
      aria-hidden="true"
      className="BolinhaInferior"
    />

    <figure className="ComoFuncionaIlustracao">
      <img
        src={ImgPessoa}
        alt="Ilustração de uma pessoa utilizando o DivideAqui"
        className="ImgPessoa"
      />
    </figure>

    <div className="comoFuncionaConteudo">

      <header className="DivTexto">
        <h2 id="tituloComoFunciona">
          Veja como é{" "}<span className="BDestaque-azul">fácil</span>:
        </h2>
      </header>

      <div className="comoFunciona-Passos">

        <article className="Passo">

  <div className="IndicadorPasso">
    <div className="CircleComoFunciona">1</div>
    <div className="Linha"></div>
  </div>

  <div className="TextoPasso">
    <h3>Registre as despesas</h3>
    <p>O líder autoriza participantes a registrar despesas nos grupos.
    </p>
  </div>

</article>

<article className="Passo">

  <div className="IndicadorPasso">
    <div className="CircleComoFunciona">2</div>
    <div className="Linha"></div>
  </div>

  <div className="TextoPasso">
    <h3>Copie os links de pagamento</h3>
    <p>Cada despesa gera um link para realizar o pagamento pelo seu banco.
    </p>
  </div>

  </article>

  <article className="Passo">

    <div className="IndicadorPasso">
    <div className="CircleComoFunciona">3</div>
  </div>

  <div className="TextoPasso">
    <h3>Realize os pagamentos</h3>
    <p>Em grupos de streaming, envie o valor ao líder.
    </p>
  </div>

  </article>

      </div>

      <aside className="CardComoFunciona">
        <TbAlertTriangleFilled
          className="iconAlert"
          size={45}
          aria-hidden="true"
        />

        <h3>Encontrou alguma irregularidade? Relate para nossa equipe.</h3>
      </aside>

    </div>

  </section>
);
}