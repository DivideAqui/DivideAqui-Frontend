<<<<<<< HEAD
import "./../../css/homesStyles/FAQS.css"
import BolinhasAzuis from "../../assets/Imgs/bolinhasAzuis.png";
import ImgPessoa from "../../assets/Imgs/imgPessoa.png";

import { GiPadlock } from "react-icons/gi";

export function FAQS(){
    return(
        <>
        <section className="sct4" id="homeFAQS">
            <img src={BolinhasAzuis} alt="BolinhasAzuis" className="ImgBolinhasAzuis1"/>
            <img src={ImgPessoa} alt="ImgPessoa" className="ImgPessoa"/>
            <div className="DivFAQS">
                <h1>Veja como é <b className="BDestaque-azul">fácil</b>:</h1>
                <section className="DivFAQS-Texto">
                    <h3>Crie ou entre em um grupo</h3>
                    <p>Comece do zero ou participe de uma divisão que já existe.</p>
                    <h3>Adicione as pessoas</h3>
                    <p>Convide amigos ou entre com quem também está interessado.</p>
                    <h3>Relaxe!</h3>
                    <p>O sistema cuida das contas pra você, sem cobranças manuais.</p>
                </section>
                
                <div className="LinhaFAQS">
                    <div className="LinhaParagrafo">
                        <div className="CircleFAQS" id="Circle1">1</div>
                        <div className="Linha"></div>
                    </div>
                    <div className="LinhaParagrafo">
                        <div className="CircleFAQS" id="Circle2">2</div>
                        <div className="Linha"></div>
                    </div>
                    <div className="LinhaParagrafo">
                        <div className="CircleFAQS" id="Circle3">3</div>
                        <div className="Linha"></div>
                    </div>
                </div>

                <section className="CardFAQS">
                    <GiPadlock className="IconCadeado"  size={40}/>
                    <h3>Suas divisões protegidas do início ao fim.</h3>
                </section>
            </div>
            <img src={BolinhasAzuis} alt="BolinhasAzuis" className="ImgBolinhasAzuis2"/>
        </section>
        </>
    )
=======
import "./../../css/homesStyles/FAQS.css"

export function FAQS(){
    return(
        <>
        <section className="sct4" id="homeFAQS">
            <h1>FAQS</h1>
        </section>
        </>
    )
>>>>>>> f516fa4b3ea1a1f3366fd7b423d9869b8d24b1c5
}