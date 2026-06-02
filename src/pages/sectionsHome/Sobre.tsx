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
}