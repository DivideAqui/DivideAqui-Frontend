

import "../css/Footer.css"

import { RiInstagramFill } from "react-icons/ri";
import { FaGithub } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import imgLogo1 from "../assets/Imgs/logo1Branca.png"

export function Footer() {
    return (
        <>
        <footer>

            <section id="sctFooter1" >
                <div id="divFooter1">
                    <article id="art1">
                        <img src={ imgLogo1 } alt="Logo - DivideAqui" />
                        <p>Sistema de Gerenciamento 
                        <br /> de Contas Compartilhadas</p>
                    </article>
                    <article id="art2" className="artLinks">
                        <h1>Acesso rápido:</h1>
                        <br></br>
                        <a href="#homeInicio" className="linkFooter">Inicio</a>
                        <a href="#homeSobre" className="linkFooter">Sobre</a>
                        <a href="#homeFeedbacks" className="linkFooter">Feedbacks</a>
                        <a href="#homeFAQS" className="linkFooter">FAQS</a>
                    </article>
                    
                    <article id="art3" className="artLinks">
                        <h1>Redes Sociais:</h1>
                        <br></br>
                        <div id="artIcon">
                            <RiInstagramFill className="iconFooter" />
                            <a href="https://github.com/DivideAqui" target="_blank">
                                <FaGithub className="iconFooter" />
                            </a>
                            <MdEmail className="iconFooter" />
                        </div>
                    </article>
                    </div>
            </section>

            <section id="sctFooter2">
                <hr />
                <h1>© 2026 <i>DivideAqui</i> - Todos os direitos reservados</h1>
            </section>
            
        </footer>
        </>
    )
}