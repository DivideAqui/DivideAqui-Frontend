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
  gru_nome?: string | null;
  gru_criador_id?: number | null;
  gru_criador_nome?: string | null;
  gru_num_vagas?: number | null;
  categoria?: {
    cat_nome?: string | null;
  };
  criador?: {
    usu_id: number;
    usu_nome: string;
    usu_foto?: string | null;
  };
  lider?: {
    usuario?: {
      usu_nome?: string | null;
    };
  };
  stream?: {
    str_telas?: number | null;
  };
  participacoes?: Array<{
    usu_id: number;
    usuario?: {
      usu_id: number;
      usu_nome: string;
      usu_foto?: string | null;
    };
  }>;
  _count?: {
    participacoes: number;
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

type StreamData = {
  str_telas?: number | null;
} | Array<{ str_telas?: number | null }> | null | undefined;

const getStream = (stream: StreamData): { str_telas?: number | null } | null => {
  if (!stream) return null;
  if (Array.isArray(stream)) return stream[0] || null;
  return stream;
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
        const groupName = group.gru_nome ?? '';
        const leaderName = group.criador?.usu_nome ?? group.lider?.usuario?.usu_nome ?? '';
        const haystack = [
          categoryName,
          groupName,
          leaderName,
          getCategoryTitle(categoryName),
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(normalized);
      })
      .slice(0, 6)
      .map((group) => {
        const streamData = getStream(group.stream);
        const category = getCategoryKey(group.categoria?.cat_nome);
        const leaderName = group.criador?.usu_nome ?? group.lider?.usuario?.usu_nome ?? 'Líder do grupo';
        const participationCount = group._count?.participacoes ?? 0;
        const creatorIsParticipant = group.gru_criador_id != null;
        const memberCount = Math.max(1, participationCount + (creatorIsParticipant ? 0 : 1));
        const configuredCapacity = Math.max(memberCount, group.gru_num_part ?? group.gru_num_vagas ?? memberCount);
        const maxParticipants = streamData?.str_telas == null
          ? configuredCapacity
          : Math.min(configuredCapacity, streamData.str_telas);
        const slots = Math.max(0, maxParticipants - memberCount);

        const participantes = (group.participacoes ?? []).map((p) => ({
          id: String(p.usuario?.usu_id ?? p.usu_id),
          nome: p.usuario?.usu_nome || "Membro",
          foto: p.usuario?.usu_foto,
        }));

        return {
          id: String(group.gru_id),
          label: group.gru_nome?.trim() || getCategoryTitle(group.categoria?.cat_nome),
          subtitle: `Liderado por ${leaderName}`,
          meta: slots > 0 ? `${slots} vaga${slots > 1 ? 's' : ''}` : 'Lotado',
          category,
          participantes,
        };
      });
  }, [groups, searchTerm]);

  const handleSelectResult = (result: { id: string; category?: string }) => {
    navigate(`/divisoes?id=${result.id}`);
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
              <Link to="/criarDivisao" className="BtnLogin">Criar divisão</Link>
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