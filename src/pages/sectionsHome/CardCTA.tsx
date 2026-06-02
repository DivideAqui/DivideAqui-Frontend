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
}