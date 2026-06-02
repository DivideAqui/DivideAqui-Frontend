import { useState } from 'react';
import Amazon from "../../assets/Icons/imgAmazon.png";
import apple from "../../assets/Icons/imgApple.png";
import canva from "../../assets/Icons/imgCanva.png";
import deezer from "../../assets/Icons/imgDeezer.png";
import prime from "../../assets/Icons/imgPrime.png";
import spotify from "../../assets/Icons/imgSpotify.png";
import Linha from "../../assets/Imgs/linha.png";

import "./../../css/homesStyles/Inicio.css"

export function Inicio(){
  const [isFocused, setIsFocused] = useState(false);
  return (
    <>
      <section className="sct1" id="homeInicio">
        <div className={`DivIcones ${isFocused ? 'DivIcones-hidden' : ''}`}>
          <div className="DivLado-esquerdo">
            <img src={Amazon} alt="Amazon" id="ImgIconeFlutuante" className={isFocused ? 'ImgIconeFlutuante-animado-ECima' : ''}/>
            <img src={apple} alt="Apple" className={`ImgDivIcones-meio-esquerdo ${isFocused ? 'ImgIconeFlutuante-animado' : ''}`} id="ImgIconeFlutuante"/>
            <img src={canva} alt="Canva" id="ImgIconeFlutuante" className={isFocused ? 'ImgIconeFlutuante-animado-EBaixo' : ''} />
          </div>
          <div className="DivLado-direito">
            <img src={deezer} alt="Deezer" id="ImgIconeFlutuante" className={isFocused ? 'ImgIconeFlutuante-animado-DCima' : ''}/>
            <img src={prime} alt="Prime" className={`ImgDivIcones-meio-direita ${isFocused ? 'ImgIconeFlutuante-animado' : ''}`} id="ImgIconeFlutuante"/>
            <img src={spotify} alt="Spotify" id="ImgIconeFlutuante" className={isFocused ? 'ImgIconeFlutuante-animado-DBaixo' : ''}/>
          </div>
        </div>
        <h3 className="H3Subtitulo">Simples, Rápido e Justo.</h3>
        <h1 className="H1Titulo">O que você vai <b className="BDestaque-verde">dividir</b> hoje?</h1>
        <input
          type="text"
          className={`InpPesquisa ${isFocused ? 'InpPesquisa-focused' : ''}`}
          placeholder="Pesquise aqui..."
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <div className="DivBtns">
        <button className="BtnLogin">Entrar</button>
        <button className="BtnCadastrar">Cadastrar</button>
        </div>
             <img src={Linha} alt="Linha" className="ImgLinha"/> 
      </section>

    </>
  );
}