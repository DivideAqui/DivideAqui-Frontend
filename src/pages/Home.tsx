import { useEffect } from "react";
import Lenis from "lenis";

import { Nav } from "../components/Nav";
import { Inicio } from "./sectionsHome/Inicio";
import { Sobre } from "./sectionsHome/Sobre";
import { Feedbacks } from "./sectionsHome/Feedbacks";
import { ComoFunciona } from "./sectionsHome/ComoFunciona";
import { CardOptions } from "./sectionsHome/CardOptions";
import { Footer } from "./../components/Footer";
import { CardCTA } from "./sectionsHome/CardCTA";


export function Home() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="home-page">
      <Nav />
      <Inicio />
      <CardOptions />
      <Sobre />
      <CardCTA />
      <Feedbacks />
      <ComoFunciona />
      <Footer />
    </div>
  );
}
