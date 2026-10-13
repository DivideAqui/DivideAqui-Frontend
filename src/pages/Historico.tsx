import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import {
  FiDivideCircle,
  FiAlertTriangle,
  FiUpload,
  FiMoreHorizontal,
  FiMonitor,
  FiLock,
  FiMapPin,
  FiWifi,
  FiArrowDown,
} from "react-icons/fi";
import { FaCar, FaHome } from "react-icons/fa";
import BolinhasBr from "../assets/Imgs/bolinhasBrancas.png";
import SpotifyIcon from "../assets/Icons/imgSpotify.png";
import PrimeVideoIcon from "../assets/Icons/imgPrime.png";
import "../css/historico.css";

export function Historico() {
  return (
    <>
      <Nav />
      <main className="historico-main">
        <div className="historico-topo">
          <div className="container-graficos">
            <img src={BolinhasBr} alt="" className="gra-bolinhasbr" />
            <img src={BolinhasBr} alt="" className="gra-bolinhasbr2" />

            <div className="container-infograf">
              <p className="p-infograf">
                <span className="txt-infograf">Você economizou</span>
                <br />
                <span className="txt-verde">R$10.000</span>
                <br />
                <span className="txt-infograf3">
                  Comparando com o valor<br />
                  que você pagaria <i>sozinho.</i>
                </span>
              </p>
            </div>

            <div className="grafico-comparativo" aria-label="Comparação entre pagar sozinho e dividir: 20 mil contra 10 mil reais">
              <div className="grafico-area">
                <div className="grafico-item">
                  <span className="grafico-valor">20.000</span>
                  <div className="grafico-barra barra-azul" />
                </div>
                <div className="grafico-item">
                  <span className="grafico-valor">10.000</span>
                  <div className="grafico-barra barra-verde" />
                </div>
              </div>
              <div className="grafico-legendas">
                <span>Pagando sozinho</span>
                <span>Com o <i>DivideAqui</i></span>
              </div>
            </div>

            <button type="button" className="btn-upload" aria-label="Compartilhar resultado">
              <FiUpload className="icon-upload" />
            </button>
          </div>

          <div className="container-status">
            <div className="container-totaldiv">
              <div className="icon-dividediv"><FiDivideCircle className="icon-divide" /></div>
              <p className="p-totaldiv">Total de Divisões</p>
              <p className="num-totaldiv">18</p>
            </div>
            <div className="container-atrasados">
              <div className="icon-alertdiv"><FiAlertTriangle className="icon-alert" /></div>
              <p className="p-atrasados">Atrasados</p>
              <p className="num-atrasados">0</p>
            </div>
          </div>
        </div>

        <div className="div-suasdivisoes">
          <h1 className="h1-suasdivisoes">Suas Divisões</h1>
          <div className="categorias-lista" role="group" aria-label="Categorias de divisões">
            <button type="button" className="btn-categoria ativo"><FiMoreHorizontal />Todos</button>
            <button type="button" className="btn-categoria"><FaCar />Viagens</button>
            <button type="button" className="btn-categoria"><FiMonitor />Streamer</button>
            <button type="button" className="btn-categoria"><FaHome />Custos Domésticos</button>
            <button type="button" className="btn-categoria"><FiMoreHorizontal />Outros</button>
          </div>
        </div>

        <section className="Sct-suasdivisoes" aria-label="Cartões das suas divisões">
          {/* PRIME VIDEO */}
          <div className="card-divisao">
            <div className="card-icone icone-prime">
              <img src={PrimeVideoIcon} alt="Prime Video" className="img-icone-servico" />
            </div>
            <FiLock className="card-cadeado" aria-label="Divisão privada" />
            <div className="card-participantes" aria-label="4 participantes">
              <span>👨🏻</span><span>👩🏽</span><span>👨🏽</span><span>👩🏻</span>
            </div>
            <div className="card-conteudo">
              <div className="card-informacoes"><h3>Prime Vídeo</h3><strong className="preco-azul">R$13,90</strong></div>
              <p>Vagas disponíveis: 1</p>
            </div>
            <span className="card-opcoes opcoes-azul" aria-hidden="true"><FiMoreHorizontal /></span>
          </div>

          {/* SPOTIFY */}
          <div className="card-divisao">
            <div className="card-icone icone-spotify">
              <img src={SpotifyIcon} alt="Spotify" className="img-icone-servico" />
            </div>
            <div className="card-participantes" aria-label="4 participantes">
              <span>👨🏻</span><span>👩🏽</span><span>👨🏽</span><span>👩🏻</span>
            </div>
            <div className="card-conteudo">
              <div className="card-informacoes"><h3>Spotify</h3><strong className="preco-azul">R$8,50</strong></div>
              <p>Vagas disponíveis: 1</p>
            </div>
            <span className="card-opcoes opcoes-azul" aria-hidden="true"><FiMoreHorizontal /></span>
          </div>

          {/* ALUGUEL */}
          <div className="card-divisao">
            <div className="card-icone icone-verde"><FaHome /></div>
            <FiLock className="card-cadeado" aria-label="Divisão privada" />
            <div className="card-participantes" aria-label="4 participantes">
              <span>👨🏻</span><span>👩🏽</span><span>👨🏽</span><span>👩🏻</span>
            </div>
            <div className="card-conteudo">
              <div className="card-informacoes"><h3>Aluguel</h3><strong className="preco-verde">R$13,90</strong></div>
              <p>Vagas disponíveis: 1</p>
            </div>
            <span className="card-opcoes opcoes-verde" aria-hidden="true"><FiMoreHorizontal /></span>
          </div>

          {/* BARRA MANSA RECIFE */}
          <div className="card-divisao card-alto">
            <div className="card-icone icone-verde"><FiMapPin /></div>
            <FiLock className="card-cadeado" aria-label="Divisão privada" />
            <div className="card-participantes" aria-label="4 participantes">
              <span>👨🏻</span><span>👩🏽</span><span>👨🏽</span><span>👩🏻</span>
            </div>
            <div className="card-conteudo">
              <div className="card-informacoes"><h3 className="titulo-local">Barra Mansa<br />Recife</h3><strong className="preco-verde">R$13,90</strong></div>
              <p>Vagas disponíveis: 1</p>
            </div>
            <span className="card-opcoes opcoes-verde" aria-hidden="true"><FiMoreHorizontal /></span>
          </div>

          {/* REPÚBLICA */}
          <div className="card-divisao card-alto">
            <div className="card-icone icone-verde"><FaHome /></div>
            <div className="card-participantes" aria-label="4 participantes">
              <span>👨🏻</span><span>👩🏽</span><span>👨🏽</span><span>👩🏻</span>
            </div>
            <div className="card-conteudo">
              <div className="card-informacoes"><h3>República</h3><strong className="preco-verde">R$8,50</strong></div>
              <p>Vagas disponíveis: 1</p>
            </div>
            <span className="card-opcoes opcoes-verde" aria-hidden="true"><FiMoreHorizontal /></span>
          </div>

          {/* INTERNET */}
          <div className="card-divisao card-alto">
            <div className="card-icone icone-verde"><FiWifi /></div>
            <FiLock className="card-cadeado" aria-label="Divisão privada" />
            <div className="card-participantes" aria-label="4 participantes">
              <span>👨🏻</span><span>👩🏽</span><span>👨🏽</span><span>👩🏻</span>
            </div>
            <div className="card-conteudo">
              <div className="card-informacoes"><h3>Internet</h3><strong className="preco-verde">R$13,90</strong></div>
              <p>Vagas disponíveis: 1</p>
            </div>
            <span className="card-opcoes opcoes-verde" aria-hidden="true"><FiMoreHorizontal /></span>
          </div>
        </section>

        <section className="section-tabela-historico" aria-labelledby="titulo-resumo-financeiro">
          <h2 className="resumo-financeiro" id="titulo-resumo-financeiro">Resumo Financeiro</h2>
          <div className="container-tabela-historico" role="region" aria-label="Tabela de resumo financeiro" tabIndex={0}>
            <table className="tabela-historico">
              <thead><tr>
                <th scope="col">Grupo</th><th scope="col">Total Gasto</th>
                <th scope="col">Total Economizado</th><th scope="col">Pagamento</th>
                <th scope="col">Vencimento</th><th scope="col">Status</th>
              </tr></thead>
              <tbody>
                <tr><td>NomeGrupo</td><td><span className="valor-destaque">R$20,00</span></td><td>R$20,00</td><td>00/00/0000</td><td>00/00/0000</td><td className="status-atrasado">Atrasado</td></tr>
                <tr><td>NomeGrupo</td><td>R$20,00</td><td>R$20,00</td><td>00/00/0000</td><td>00/00/0000</td><td className="status-pendente">Pendente</td></tr>
                <tr><td>NomeGrupo</td><td>R$20,00</td><td>R$20,00</td><td>00/00/0000</td><td>00/00/0000</td><td className="status-pendente">Pendente</td></tr>
                <tr><td>NomeGrupo</td><td>R$20,00</td><td>R$20,00</td><td>00/00/0000</td><td>00/00/0000</td><td className="status-pago">Pago</td></tr>
                <tr><td>NomeGrupo</td><td>R$20,00</td><td>R$20,00</td><td>00/00/0000</td><td>00/00/0000</td><td className="status-pago">Pago</td></tr>
              </tbody>
            </table>
            <div className="container-seta-tabela">
              <button type="button" className="btn-seta-tabela" aria-label="Mostrar mais registros"><FiArrowDown /></button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
