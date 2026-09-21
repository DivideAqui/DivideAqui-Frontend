import axios from "axios";

const API_BASE_URL = (
   import.meta.env.VITE_API_URL || "https://divide-aqui-backend.vercel.app"
).replace(/\/$/, "");

export async function carregarPerfil() {
   const token = localStorage.getItem("token");
   if (!token) {
      console.log("Perfil não encontrado");
      return;
   }

   const resposta = await axios.get(`${API_BASE_URL}/perfil`, {
      headers: {
         "Authorization": `Bearer ${token}`
      }
   });

   const Dataperfil = resposta.data;
   console.log("Perfil logado com sucesso", Dataperfil);
}
