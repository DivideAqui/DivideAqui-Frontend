<<<<<<< HEAD
import { useEffect } from "react";
import Lenis from "lenis";

import { Nav } from "../components/Nav";
import { Inicio } from "./sectionsHome/Inicio";
import { Sobre } from "./sectionsHome/Sobre";
import { Feedbacks } from "./sectionsHome/Feedbacks";
import { FAQS } from "./sectionsHome/FAQS";
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
    <>
      <Nav />
      <Inicio />
      <CardOptions />
      <Sobre />
      <CardCTA />
      <Feedbacks />
      <FAQS />
      <Footer />
    </>
  );
}
=======
import { Nav } from "../components/Nav"
import { Inicio } from "./sectionsHome/Inicio"
import { Sobre } from "./sectionsHome/Sobre"
import { Feedbacks } from "./sectionsHome/Feedbacks"
import { FAQS } from "./sectionsHome/FAQS"
import { CardOptions } from "./sectionsHome/CardOptions"
import { Footer } from "./../components/Footer"
import { CardCTA } from "./sectionsHome/CardCTA"

export function Home(){
  return (
    <>
      <Nav />
      <Inicio />
      <CardOptions />
      <Sobre />
      <CardCTA />
      <Feedbacks />
      <FAQS />
      <Footer />
    </>
  )
}


>>>>>>> f516fa4b3ea1a1f3366fd7b423d9869b8d24b1c5
