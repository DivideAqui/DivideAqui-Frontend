import { FaPen } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import LogoBranco from "../assets/Icons/logo1Branca.png";
import "../css/meuPerfil.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";


const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://divide-aqui-backend.vercel.app"
).replace(/\/$/, "");

const CAMPOS_API: Record<string, string> = {
  usu_nome: "name",
  usu_email: "email",
  usu_senha: "password",
  usu_telefone: "telefone",
  usu_data_nasc: "data_nasc",
  usu_descricao: "descri",
};


export function MeuPerfil() {
  const { user } = useAuth();
  const [perfilusu, setPerfilusu] = useState<any>([]);
  const regexSenha = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/;
  const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
  const regexTelefone = /^\(\d{2}\)\s\d{5}-\d{4}$/;

useEffect(() => {
   console.log("user:", user);
  if (!user?.id) return;

  const buscarUsu = async () => {
    try {
      const resposta = await fetch(`${API_BASE_URL}/usuario/${user.id}`);
      console.log("status:", resposta.status);
      const usu_prf = await resposta.json();
      console.log("dados:", usu_prf);
      setPerfilusu(usu_prf);
    } catch (erro) {
      console.error("Erro ao buscar usuário:", erro);
    }
  };

  buscarUsu();
}, [user?.id]); 

const formatDisplayName = (name?: string) => {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (!parts.length) {
    return "Usuário";
  }

  return parts[0];
};
 const ediatarCampo = async(
  campo: string,
  label: string,
  tipo: "text" | "email" | "tel" | "date" = "text"
) => {
  if (!user?.id) return;

  const valorAtual = perfilusu?.[campo] ?? "";
  const valorInicial = tipo === "date" ? String(valorAtual).slice(0, 10) : valorAtual;

  const result = await Swal.fire({
    title: `Editar ${label}`,
    input: tipo,
    inputValue: valorInicial,
    showCancelButton: true,
    confirmButtonText: "Salvar",
    cancelButtonText: "Cancelar",
    customClass: {
      confirmButton: "btn-salvar",
      cancelButton: "btn-cancelar",
    },
    showLoaderOnConfirm: true,
    inputValidator: (valor) =>{
      const v = valor.trim();
      if(!v) return "O campo não pode ficar vazio";

      if(campo === "usu_nome"  && !regexNome.test(v)){
        return "O nome deve conter apenas letras"
      }
      if(campo === "usu_telefone"  && !regexTelefone.test(v)){
        return "Telefone inválido. Use o formato (xx) xxxxx-xxxx"
      }
      return null;
    },
    preConfirm: async (valor) => {
      try {
        const resposta = await fetch(`${API_BASE_URL}/usuarioatualizar/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [CAMPOS_API[campo]]: valor.trim() }),
        });
        if (!resposta.ok) {
          Swal.showValidationMessage(`Erro ${resposta.status} ao salvar`);
          return;
        }
        return valor.trim();
      } catch (erro) {
        Swal.showValidationMessage(`Erro ao salvar: ${erro}`);
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  });

  if (result.isConfirmed) {
    setPerfilusu((prev: any) => ({ ...prev, [campo]: result.value }));
    Swal.fire({ icon: "success", title: "Atualizado!", timer: 1500, showConfirmButton: false });
  }
};
const editarSenha = async () => {
  if (!user?.id) return;

  const result = await Swal.fire({
    title: "Trocar senha",
    html: `
      <input id="senhaAtual" type="password" class="swal2-input" placeholder="Senha atual">
      <input id="novaSenha" type="password" class="swal2-input" placeholder="Nova senha">
      <input id="confirmaSenha" type="password" class="swal2-input" placeholder="Confirmar nova senha">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Salvar",
    cancelButtonText: "Cancelar",
    customClass: {
      confirmButton: "btn-salvar",
      cancelButton: "btn-cancelar",
    },
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading(),
    preConfirm: async () => {
      const senhaAtual = (document.getElementById("senhaAtual") as HTMLInputElement).value;
      const novaSenha = (document.getElementById("novaSenha") as HTMLInputElement).value;
      const confirmaSenha = (document.getElementById("confirmaSenha") as HTMLInputElement).value;

      if (!senhaAtual || !novaSenha || !confirmaSenha) {
      Swal.showValidationMessage("Preencha todos os campos");
      return;
      }
      if (!regexSenha.test(novaSenha)) {
        Swal.showValidationMessage(
          "A senha deve ter no mínimo 8 caracteres, com 1 letra maiúscula, 1 número e 1 caractere especial (@$!%*?&_)"
        );
        return;
      }
      if (novaSenha !== confirmaSenha) {
        Swal.showValidationMessage("As senhas não conferem");
        return;
  }

      try {
        // 1) confere a senha atual
        const comparar = await fetch(`${API_BASE_URL}/senhaCompare/${user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: senhaAtual }),
        });
        if (!comparar.ok) {
          Swal.showValidationMessage("Senha atual incorreta");
          return;
        }

        // 2) troca pela nova
        const resposta = await fetch(`${API_BASE_URL}/usuarioatualizar/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [CAMPOS_API["usu_senha"]]: novaSenha }),
        });
        if (!resposta.ok) {
          Swal.showValidationMessage(`Erro ${resposta.status} ao salvar`);
          return;
        }
        return true;
      } catch (erro) {
        Swal.showValidationMessage(`Erro ao salvar: ${erro}`);
      }
    },
  });

  if (result.isConfirmed) {
    Swal.fire({ icon: "success", title: "Senha alterada!", timer: 1500, showConfirmButton: false });
  }
};
  return (
    <div className="perfil-page">
      <header className="perfil-header">
        <div className="perfil-header-top">
          <img src={LogoBranco} className="logobranco" alt="Logo DivideAqui" />
          <Link to="/home" className="perfil-close">x</Link>
        </div>

        <p className="ola-usuario">
          Olá,{" "}
          <span className="nome-usuario-color">{formatDisplayName(user?.name) ?? "Nome Usuario"}</span>
          !
        </p>

        <div className="avatar-wrapper">
          {user?.picture ? (
            <img src={user.picture} className="avatar-img" alt={user.name} />
          ) : (
            <div className="avatar-fallback">
              {user?.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
          <button type="button" className="avatar-editar">
            <FaPen />
          </button>
        </div>
      </header>
      <div className="context">
        <div className="perfil-card">
          <div className="form-group">
            <label>Nome do Usuário:</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="nome"
                placeholder="User000"
                value={perfilusu?.usu_nome ?? ""}
                readOnly
              />
              <FaPen 
              className="icone-caneta"
              style={{ cursor: "pointer" }}
              onClick={() => ediatarCampo("usu_nome", "nome") } />
            </div>
          </div>

          <div className="form-group">
            <label>Descrição:</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="descricao"
                placeholder="--------------------------------------"
                value={perfilusu?.usu_descricao ?? ""}
                readOnly
              />
              <FaPen 
              className="icone-caneta"
              style={{ cursor: "pointer" }}
              onClick={() => ediatarCampo("usu_descricao", "descricao")} />
            </div>
          </div>

          <div className="form-group">
            <label>Data de Nascimento:</label>
            <div className="input-wrapper">
              <input
                type="date"
                name="dataNascimento"
               value={perfilusu?.usu_data_nasc?.slice(0, 10) ?? ""}
                readOnly
              />
              <FaPen 
              className="icone-caneta"
              style={{ cursor: "pointer" }}
              onClick={() => ediatarCampo("usu_data_nasc", "dataNascimento", "date")} />
            </div>
          </div>

          <div className="form-group">
            <label>CPF:</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="cpf"
                placeholder="000.000.000-00"
                maxLength={14}
                pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
                value={perfilusu?.usu_cpf ?? ""}
                readOnly
              />
            </div>
          </div>

          <div className="form-group">
            <label>Número de Telefone:</label>
            <div className="input-wrapper">
              <input
                type="tel"
                name="telefone"
                placeholder="(00) 00000-0000"
                pattern="\([0-9]{2}\) [0-9]{5}-[0-9]{4}"
                value={perfilusu?.usu_telefone ?? ""}
                readOnly
              />
              <FaPen 
              className="icone-caneta"
              style={{ cursor: "pointer" }}
              onClick={() => ediatarCampo("usu_telefone", "telefone")} />
            </div>
          </div>

          <div className="form-group">
            <label>Email:</label>
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                placeholder="emaildousuario@gmail.com"
                value={perfilusu?.usu_email ?? ""}
                readOnly
              />
            </div>
          </div>

          <div className="form-group">
            <label>Senha:</label>
            <div className="input-wrapper">
              <input
                type="password"
                name="senha"
                placeholder="***********************"
                readOnly
              />
              <FaPen 
              className="icone-caneta"
              style={{ cursor: "pointer" }}
              onClick={editarSenha}
             />
            </div>
          </div>
        </div>
      </div>
      <footer></footer>
    </div>
  );
}
