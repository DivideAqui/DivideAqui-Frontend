import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SearchInput } from '../../components/SearchInput';
import Amazon from "../../assets/Icons/imgAmazon.png";
import apple from "../../assets/Icons/imgApple.png";
import canva from "../../assets/Icons/imgCanva.png";
import deezer from "../../assets/Icons/imgDeezer.png";
import prime from "../../assets/Icons/imgPrime.png";
import spotify from "../../assets/Icons/imgSpotify.png";
import Linha from "../../assets/Imgs/linha.png";

import "./../../css/MinCss/HomeInicioMin.css"

type BackendGroup = {
  gru_id: number;
  gru_num_part: number;
  categoria?: {
    cat_nome?: string | null;
  };
  lider?: {
    usuario?: {
      usu_nome?: string | null;
    };
  };
  _count?: {
    participantes: number;
  };
};

const API_BASE_URL = "https://divide-aqui-backend.vercel.app";

const getCategoryKey = (value?: string | null) => {
  const normalized = (value ?? "").trim().toLowerCase();

  if (normalized.includes("stream")) return "streaming";
  if (normalized.includes("viag")) return "viagens";
  if (normalized.includes("domest") || normalized.includes("desp") || normalized.includes("custo")) return "despesas";

  return "outros";
};

const getCategoryTitle = (value?: string | null) => {
  switch (getCategoryKey(value)) {
    case "streaming":
      return "Streaming";
    case "viagens":
      return "Viagens";
    case "despesas":
      return "Despesas Domésticas";
    default:
      return "Outros";
  }
};

export function Inicio(){
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState<BackendGroup[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasUserName = Boolean(user?.name);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/grupos`);
        if (!response.ok) return;
        const data: BackendGroup[] = await response.json();
        setGroups(data);
      } catch (error) {
        console.error('Erro ao buscar grupos da home:', error);
      }
    };

    loadGroups();
  }, []);

  const searchResults = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    if (!normalized) {
      return [];
    }

    return groups
      .filter((group) => {
        const categoryName = group.categoria?.cat_nome ?? '';
        const leaderName = group.lider?.usuario?.usu_nome ?? '';
        const haystack = [
          categoryName,
          leaderName,
          getCategoryTitle(categoryName),
          String(group.gru_id),
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(normalized);
      })
      .slice(0, 5)
      .map((group) => {
        const category = getCategoryKey(group.categoria?.cat_nome);
        const leaderName = group.lider?.usuario?.usu_nome ?? 'Líder do grupo';
        const slots = Math.max(0, (group.gru_num_part || 1) - (group._count?.participantes ?? 0));

        return {
          id: String(group.gru_id),
          label: `${getCategoryTitle(group.categoria?.cat_nome)} ${group.gru_id}`,
          subtitle: `Líder: ${leaderName}`,
          meta: `${slots} vagas`,
          category,
        };
      });
  }, [groups, searchTerm]);

  const handleSelectResult = (result: { label: string; category?: string }) => {
    const params = new URLSearchParams();
    const queryValue = result.label.trim();

    if (queryValue) {
      params.set('q', queryValue);
    }

    if (result.category && result.category !== 'outros') {
      params.set('categoria', result.category);
    }

    navigate(`/divisoes?${params.toString()}`);
  };

  return (
    <>
      <section className="sectionInicio" id="homeInicio">
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
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onFocusChange={setIsFocused}
          results={searchResults}
          onSelectResult={handleSelectResult}
        />
        <div
          className="DivBtns"
          style={{
            opacity: 1,
            pointerEvents: "auto",
            transition: "opacity 0.25s ease",
          }}
        >
          {hasUserName ? (
            <>
              <Link to="/divisoes" className="BtnLogin">Criar divisão</Link>
              <Link to="/divisoes" className="BtnCadastrar">Participar de divisão</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="BtnLogin">Entrar</Link>
              <Link to="/Cadastro" className="BtnCadastrar">Cadastrar</Link>
            </>
          )}
        </div>
             <img src={Linha} alt="Linha" className="ImgLinha"/> 
      </section>

    </>
  );
}