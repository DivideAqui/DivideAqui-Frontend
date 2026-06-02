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


