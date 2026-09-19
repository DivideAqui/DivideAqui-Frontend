import axios from "axios";

export async function carregarPerfil() {
   const token = localStorage.getItem("token");
   if(!token){
      console.log("Perfil não encontrado");
      
   } 
   const resposta = await axios.get("http://localhost:3344/perfil", {
      headers: {
         "Authorization": `Bearer ${token}`
      }
   })
   const Dataperfil = resposta.data

   console.log("Perfil logado com sucesso", Dataperfil)
}
