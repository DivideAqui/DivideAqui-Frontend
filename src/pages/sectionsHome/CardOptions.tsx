import "./../../css/homesStyles/CardOptions.css"
import {FaCar} from "react-icons/fa"
import { TbDeviceTvFilled } from "react-icons/tb"
import { FaHome } from "react-icons/fa"
import { TbCirclePlusFilled } from "react-icons/tb"

export function CardOptions(){
    return(
        <>
        <section className="CardOptions" id="homeCardOptions">
            <h1><FaCar/> Viagens <TbDeviceTvFilled /> Streamer <FaHome /> Custos Domésticos <TbCirclePlusFilled /></h1>
        </section>
        </>
    )
}