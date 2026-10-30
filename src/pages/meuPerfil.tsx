import { FaPen } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import LogoBranco from "../assets/Icons/logo1Branca.png";
import "../css/meuPerfil.css";
import "../css/sweetAlert/sweetAlert.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import BtnClose from "../components/btnClose";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3344"
).replace(/\/$/, "");

const obterToken = (userToken?: string | null) =>
  userToken || localStorage.getItem("token") || "";

const CAMPOS_API: Record<string, string> = {
  usu_nome: "name",
  usu_email: "email",
  usu_senha: "password",
  usu_telefone: "telefone",
  usu_data_nasc: "data_nasc",
  usu_descricao: "descri",
};

export function MeuPerfil() {
  const navigate = useNavigate();

  const { user, updateUserPicture } = useAuth();

  const authHeaders = () => {
    const token = obterToken((user as any)?.token);
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const [perfilusu, setPerfilusu] = useState<any>([]);
  const [senhaDefinida, setSenhaDefinida] = useState(false);
  const regexSenha =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/;
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
  const ediatarCampo = async (
    campo: string,
    label: string,
    tipo: "text" | "email" | "tel" | "date" = "text",
  ) => {
    if (!user?.id) return;

    const valorAtual = perfilusu?.[campo] ?? "";
    const valorInicial =
      tipo === "date" ? String(valorAtual).slice(0, 10) : valorAtual;

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
      inputValidator: (valor) => {
        const v = valor.trim();
        if (!v) return "Você precisa preencher todos os campos.";

        if (campo === "usu_nome" && !regexNome.test(v)) {
          return "Digite um nome válido.";
        }
        if (campo === "usu_telefone" && !regexTelefone.test(v)) {
          return "Digite um telefone válido.";
        }
        return null;
      },
      preConfirm: async (valor) => {
        try {
          const resposta = await fetch(
            `${API_BASE_URL}/usuarioatualizar/${user.id}`,
            {
              method: "PATCH",
              headers: authHeaders(),
              body: JSON.stringify({ [CAMPOS_API[campo]]: valor.trim() }),
            },
          );
          if (!resposta.ok) {
            Swal.showValidationMessage(`Erro ${resposta.status} ao salvar.`);
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
      Swal.fire({
        icon: "success",
        title: "Atualizado!",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };
  const criarPrimeiraSenha = async () => {
    if (!user?.id) return;

    const result = await Swal.fire({
      title: "Criar sua senha",
      text: "Sua conta entrou pelo Google e ainda não tem uma senha.",
      html: `
      <input id="novaSenha" type="password" class="swal2-input" placeholder="Nova senha">
      <input id="confirmaSenha" type="password" class="swal2-input" placeholder="Confirmar a nova senha">
    `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Criar senha",
      cancelButtonText: "Cancelar",
      customClass: {
        confirmButton: "btn-salvar",
        cancelButton: "btn-cancelar",
      },
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        const novaSenha = (
          document.getElementById("novaSenha") as HTMLInputElement
        ).value;
        const confirmaSenha = (
          document.getElementById("confirmaSenha") as HTMLInputElement
        ).value;

        if (!novaSenha || !confirmaSenha) {
          Swal.showValidationMessage("Você precisa preencher todos os campos.");
          return;
        }
        if (!regexSenha.test(novaSenha)) {
          Swal.showValidationMessage(
            "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, um número e um caractere especial.",
          );
          return;
        }
        if (novaSenha !== confirmaSenha) {
          Swal.showValidationMessage("As senhas não são iguais.");
          return;
        }

        try {
          const resposta = await fetch(
            `${API_BASE_URL}/usuarioatualizar/${user.id}`,
            {
              method: "PATCH",
              headers: authHeaders(),
              body: JSON.stringify({ password: novaSenha }),
            },
          );
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
      setSenhaDefinida(true);
      Swal.fire({
        icon: "success",
        title: "Senha criada!",
        text: "Agora você pode usar e-mail ou CPF com senha para entrar.",
        timer: 2500,
        showConfirmButton: false,
      });
    }
  };

  const editarSenha = async () => {
    if (!user?.id) return;

    // Contas criadas via Google não têm senha: abre o fluxo de "primeira senha",
    // que não pede a senha atual (ela não existe ainda).
    const temSenhaAtual = Boolean(perfilusu?.usu_senha) || senhaDefinida;

    if (!temSenhaAtual) {
      await criarPrimeiraSenha();
      return;
    }

    const result = await Swal.fire({
      title: "Trocar senha",
      html: `
      <input id="senhaAtual" type="password" class="swal2-input" placeholder="Senha atual">
      <input id="novaSenha" type="password" class="swal2-input" placeholder="Nova senha">
      <input id="confirmaSenha" type="password" class="swal2-input" placeholder="Confirmar a nova senha">
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
        const senhaAtual = (
          document.getElementById("senhaAtual") as HTMLInputElement
        ).value;
        const novaSenha = (
          document.getElementById("novaSenha") as HTMLInputElement
        ).value;
        const confirmaSenha = (
          document.getElementById("confirmaSenha") as HTMLInputElement
        ).value;

        if (!senhaAtual || !novaSenha || !confirmaSenha) {
          Swal.showValidationMessage("Você precisa preencher todos os campos.");
          return;
        }
        if (!regexSenha.test(novaSenha)) {
          Swal.showValidationMessage(
            "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, um número e um caractere especial.",
          );
          return;
        }
        if (novaSenha !== confirmaSenha) {
          Swal.showValidationMessage("As senhas não são iguais.");
          return;
        }

        try {
          // 1) confere a senha atual
          const comparar = await fetch(
            `${API_BASE_URL}/senhaCompare/${user.id}`,
            {
              method: "POST",
              headers: authHeaders(),
              body: JSON.stringify({ password: senhaAtual }),
            },
          );
          if (!comparar.ok) {
            Swal.showValidationMessage("Senha atual incorreta");
            return;
          }

          // 2) troca pela nova
          const resposta = await fetch(
            `${API_BASE_URL}/usuarioatualizar/${user.id}`,
            {
              method: "PATCH",
              headers: authHeaders(),
              body: JSON.stringify({ [CAMPOS_API["usu_senha"]]: novaSenha }),
            },
          );
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
      Swal.fire({
        icon: "success",
        title: "Senha alterada!",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    try {
      if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
        await Swal.fire({
          icon: "warning",
          title: "Formato inválido!",
          text: "Selecione uma imagem JPEG, PNG ou WebP.",
        });
        return;
      }

      if (arquivo.size > 2 * 1024 * 1024) {
        await Swal.fire({
          icon: "warning",
          title: "Imagem muito grande!",
          text: "A imagem deve ter no máximo 2 MB.",
        });
        return;
      }

      if (!user?.id) {
        throw new Error("Usuário não identificado.");
      }

      const foto = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Não foi possível ler a imagem."));
          }
        };

        reader.onerror = () => reject(new Error("Falha ao ler a imagem."));
        reader.readAsDataURL(arquivo);
      });

      // Exibe o carregamento sem bloquear a execução
      void Swal.fire({
        title: "Salvando foto...",
        text: "Aguarde um instante.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

  

      const resposta = await fetch(
        `${API_BASE_URL}/usuarioatualizar/${user.id}`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ foto }),
        },
      );

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          resultado.error || resultado.erro || `Erro HTTP ${resposta.status}`,
        );
      }

      // Atualiza a foto globalmente somente após o sucesso
      updateUserPicture(foto);

      const fotoSalva =
        resultado.usu_foto ?? resultado.usuario?.usu_foto ?? foto;

      setFotoPreview(fotoSalva);
      setPerfilusu((prev: any) => ({
        ...prev,
        usu_foto: fotoSalva,
      }));

      await Swal.fire({
        icon: "success",
        title: "Foto atualizada!",
        text: "Sua foto de perfil foi salva com sucesso.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (erro) {
      console.error("Erro ao atualizar foto:", erro);

      await Swal.fire({
        icon: "error",
        title: "Não foi possível salvar!",
        text:
          erro instanceof Error ? erro.message : "Ocorreu um erro inesperado.",
        confirmButtonText: "Fechar",
      });
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="perfil-page">
      <header className="perfil-header">
        <div className="perfil-header-top">
          <img src={LogoBranco} className="logobranco" alt="Logo DivideAqui" />
          <BtnClose onClick={() => navigate("/home")} />
        </div>

        <p className="ola-usuario">
          Olá,{" "}
          <span className="nome-usuario-color">
            {formatDisplayName(user?.name) ?? "Nome Usuario"}
          </span>
          !
        </p>

        <div className="avatar-wrapper">
          <input
            type="file"
            id="upload-foto"
            accept="image/*"
            hidden
            onChange={handleFotoChange}
          />

          {fotoPreview || perfilusu?.usu_foto || user?.picture ? (
            <img
              src={fotoPreview || perfilusu?.usu_foto || user?.picture}
              className="avatar-img"
              alt={user?.name || "Foto do usuário"}
            />
          ) : (
            <div className="avatar-fallback">
              {user?.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}

          <label htmlFor="upload-foto" className="avatar-editar">
            <FaPen />
          </label>
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
                placeholder="Nome completo"
                value={perfilusu?.usu_nome ?? ""}
                readOnly
              />
              <FaPen
                className="icone-caneta"
                style={{ cursor: "pointer" }}
                onClick={() => ediatarCampo("usu_nome", "nome")}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descrição:</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="descricao"
                placeholder="Escreva uma breve descrição sobre você."
                value={perfilusu?.usu_descricao ?? ""}
                readOnly
              />
              <FaPen
                className="icone-caneta"
                style={{ cursor: "pointer" }}
                onClick={() => ediatarCampo("usu_descricao", "descricao")}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Data de Nascimento:</label>
            <div className="input-wrapper">
              <input
                id="dataNascimento-meuperfil"
                type="date"
                name="dataNascimento"
                value={perfilusu?.usu_data_nasc?.slice(0, 10) ?? ""}
                readOnly
              />
              <FaPen
                className="icone-caneta"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  ediatarCampo("usu_data_nasc", "dataNascimento", "date")
                }
              />
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
                onClick={() => ediatarCampo("usu_telefone", "telefone")}
              />
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
