<<<<<<< HEAD
import "./../../css/homesStyles/CardCTA.css";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Logo from "../../assets/Icons/íconeBranco.png";

gsap.registerPlugin(ScrollTrigger);

export function CardCTA() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          end: "top 30%",
          scrub: 1,
          // markers: true,
        },
      });

      tl.fromTo(
        logoRef.current,
        {
          opacity: 0,
          x: -80,
          scale: 0.8,
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          ease: "none",
        }
      ).fromTo(
        textRef.current,
        {
          opacity: 0,
          x: 80,
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
    <section className="CardCTA" ref={sectionRef}>
      <div className="DivJustify">
        <img src={Logo} alt="Logo" className="ImgLogo" ref={logoRef} />

        <div ref={textRef}>
          <h1>Tem uma assinatura e quer rachar o valor?</h1>
          <h3>Não pague o pato (nem a conta) sozinho!</h3>
        </div>
      </div>
    </section>
  );
=======
import "./../../css/homesStyles/CardCTA.css"
import Logo from "../../assets/Icons/íconeBranco.png"

export function CardCTA(){
    return(
        <>
        <section className="CardCTA">
            <div className="DivJustify"> <img src={Logo} alt="Logo" className="ImgLogo" /> <div> <h1>Tem uma assinatura e quer rachar o valor?</h1> <h3>Não pague o pato (nem a conta) sozinho!</h3> </div></div>
        </section>
        </>
    )
>>>>>>> f516fa4b3ea1a1f3366fd7b423d9869b8d24b1c5
}