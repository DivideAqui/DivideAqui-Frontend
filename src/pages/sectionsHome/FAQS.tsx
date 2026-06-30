import "./../../css/homesStyles/FAQS.css";
import BolinhasAzuis from "../../assets/Imgs/bolinhasAzuis.png";
import ImgPessoa from "../../assets/Imgs/imgPessoa.png";

import { GiPadlock } from "react-icons/gi";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function FAQS() {
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
          ".DivFAQS h1",
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
          ".DivFAQS-Texto h3, .DivFAQS-Texto p",
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
          ".LinhaFAQS",
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
          ".CardFAQS",
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
    <section ref={sectionRef} className="sct4" id="homeFAQS">
      <img
        src={BolinhasAzuis}
        alt="BolinhasAzuis"
        className="ImgBolinhasAzuis1"
      />

      <img
        src={ImgPessoa}
        alt="ImgPessoa"
        className="ImgPessoa"
      />

      <div className="DivFAQS">
        <h1>
          Veja como é <b className="BDestaque-azul">fácil</b>:
        </h1>

        <section className="DivFAQS-Texto">
          <h3>Crie ou entre em um grupo</h3>
          <p>
            Comece do zero ou participe de uma divisão que já existe.
          </p>

          <h3>Adicione as pessoas</h3>
          <p>
            Convide amigos ou entre com quem também está interessado.
          </p>

          <h3>Relaxe!</h3>
          <p>
            O sistema cuida das contas pra você, sem cobranças
            manuais.
          </p>
        </section>

        <div className="LinhaFAQS">
          <div className="LinhaParagrafo">
            <div className="CircleFAQS" id="Circle1">
              1
            </div>
            <div className="Linha"></div>
          </div>

          <div className="LinhaParagrafo">
            <div className="CircleFAQS" id="Circle2">
              2
            </div>
            <div className="Linha"></div>
          </div>

          <div className="LinhaParagrafo">
            <div className="CircleFAQS" id="Circle3">
              3
            </div>
            <div className="Linha"></div>
          </div>
        </div>

        <section className="CardFAQS">
          <GiPadlock className="IconCadeado" size={40} />
          <h3>Suas divisões protegidas do início ao fim.</h3>
        </section>
      </div>

      <img
        src={BolinhasAzuis}
        alt="BolinhasAzuis"
        className="ImgBolinhasAzuis2"
      />
    </section>
  );
}
