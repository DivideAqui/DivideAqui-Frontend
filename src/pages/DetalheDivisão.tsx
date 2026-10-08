import { useEffect, useState } from "react"
import "../css/DetalheDivisão.css"
import "../css/Global.css"

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://divide-aqui-backend.vercel.app"
).replace(/\/$/, "");

export function DetalheDivisão() {

const [ltParticipante, setLtparticipante] = useState<any[]>([]);
const id = 16;

useEffect(()=>{
const buscarPart = async() =>{
    try{
    const resposta = await fetch(`${API_BASE_URL}/grupos/${id}`);
    
    if(!resposta.ok){
      throw new Error("Erro ao buscar")
    }

    const grupo = await resposta.json()

    setLtparticipante(grupo.participacoes.map((p: any) => p.usuario));

}catch(error){
  console.error(error)
}
}
 buscarPart();

}, [id])

  return (
    <>
     <div className="detalheDivisao-bg">
      <div className="card">
        <div className="header"></div>

      <div className="content">
  <div className="topoCard">
    <div className="iconApp"></div>
    <div className="tituloBloco">
      <h1 className="titulo">Nome do grupo</h1>
      <p className="subtitulo">Divisão criada por <span>NomeLider</span></p>
    </div>
    <div className="infoValor">
      <div className="valor">R$Valor</div>
      <div className="vencimento">Vence em: prazo</div>
    </div>
  </div>

          <div className="comoFunciona">
            <span className="icone">!</span>
            <p><strong>Como funciona:</strong> O líder assina o plano e o valor é dividido igualmente entre os participantes. Cada membro paga sua parte pelo link da plataforma.</p>
          </div>
          {/*pagamento */}
           <div className="pagamento">
             <div className="pagamento-left">
               <div className="pagamento-heard">
                <div className="pagamento-titulo-box">
                  <h3 className="pagamento-titulo">Link do pagamento</h3>
                   <span className="pagamento-status">Disponível</span>
                 </div>
                   <p className="pagamento-subtitulo">
                     Ao efetuar o pagamento, o líder será notificado.
                    </p>
                </div>
                <div className="pg-input-copiar">
                  <div className="pg-input-incon">
                    <span className="pg-icon">🔗</span>
                    <input type="text" value="https://divideaqui.vercel.app" readOnly className="input-link" />
                  </div>
                  <button className="pg-btn-copiar">Copiar</button>
                </div>
             </div>
             <div className="pagamento-right">
              <span className="texto-qr-code">Escaneie o QR Code</span>
              <p className="pg-qrcode"></p>
             </div>
           </div>

          {/*Link convidado */}
                <div className="lk-convidado">
             <div className="lkc-left">
               <div className="lkc-heard">
                <div className="lkc-titulo-box">
                  <h3 className="lkc-titulo">Compartilhar grupo</h3>
                 </div>
                   <p className="lkc-subtitulo">
                     Convide pessoas para participar da divisão atraves do link.
                    </p>
                </div>
                <div className="lkc-input-copiar">
                  <div className="lkc-input-incon">
                    <span className="lkc-icon">🔗</span>
                    <input type="text" value="https://divideaqui.vercel.app" readOnly className="input-link" />
                  </div>
                  <button className="lkc-btn-copiar">Copiar</button>
                </div>
             </div>
             <div className="lkc-right">
              <p className="lkc-text-rigth">
                      Percebeu alguma irregularidade? Relate o problema para a análise. 
                    </p>
              <button className="lkc-rlt-problema">Relatar Problema</button>
             </div>
           </div>

           <div className="Participantes">
  <div className="Part-cabecalho">
    <h3>Participantes</h3>
    <h3>Pagamento</h3>
    <h3>Status</h3>
  </div>

  {ltParticipante.map((u) => (
    <div key={u.usu_id} className="Part-linha">
      <div className="Part-user">
        <div className="Part-avatar" />
        <div className="Part-user-info">
          <strong>{u.usu_nome}</strong>
          <small>Participante</small>
        </div>
      </div>

      <span className="Part-valor">R$valor</span>

      <span className="Part-status pendente">Pendente</span>
    </div>
  ))}
</div>


            <article className="Historico"></article>
          
        </div>
      </div>

      <footer className="footer">
      </footer>
      </div>
    </>
  )
}