import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { formatCPF, regexCPF, validarCPF } from "../utils/cpf";
import "../css/sweetAlert/sweetAlert.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3344"
).replace(/\/$/, "");

type UsuarioCpf = {
  id?: string | number | null;
  dbId?: string | null;
  token?: string | null;
} | null | undefined;

export function useCpfUsuario(user: UsuarioCpf) {
  const [cpfCadastrado, setCpfCadastrado] = useState<boolean | null>(null);
  const usuarioId = String(user?.dbId ?? user?.id ?? "");

  const buscarStatusCpf = useCallback(async (): Promise<boolean> => {
    if (!usuarioId || usuarioId === "google-profile") return false;

    const token = user?.token || localStorage.getItem("token");

    try {
      const resposta = await fetch(`${API_BASE_URL}/usuario/${usuarioId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!resposta.ok) return false;

      const dados = await resposta.json();
      const cpf = String(dados?.usu_cpf ?? "").trim();
      const possui = regexCPF.test(cpf) && validarCPF(cpf);
      setCpfCadastrado(possui);
      return possui;
    } catch (erro) {
      console.error("Erro ao verificar CPF do usuário:", erro);
      return false;
    }
  }, [usuarioId, user?.token]);

  useEffect(() => {
    if (!usuarioId || usuarioId === "google-profile") {
      setCpfCadastrado(null);
      return;
    }

    buscarStatusCpf();
  }, [usuarioId, buscarStatusCpf]);

  const salvarCpf = useCallback(
    async (cpfFormatado: string): Promise<boolean> => {
      const token = user?.token || localStorage.getItem("token");

      try {
        const resposta = await fetch(
          `${API_BASE_URL}/usuarioatualizar/${usuarioId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ cpf: cpfFormatado }),
          },
        );

        if (!resposta.ok) {
          let mensagem = `Erro ${resposta.status} ao salvar o CPF.`;

          try {
            const corpo = await resposta.json();
            mensagem = corpo?.error || corpo?.erro || mensagem;
          } catch {
            // resposta sem corpo JSON: mantém a mensagem padrão
          }

          Swal.showValidationMessage(mensagem);
          return false;
        }

        return true;
      } catch (erro) {
        console.error("Erro ao salvar CPF:", erro);
        Swal.showValidationMessage("Erro ao salvar o CPF. Tente novamente.");
        return false;
      }
    },
    [usuarioId, user?.token],
  );

  const pedirCpf = useCallback(async (): Promise<boolean> => {
    const resultado = await Swal.fire({
      title: "Complete seu cadastro",
      text: "Para participar de uma divisão é necessário ter o CPF cadastrado.",
      input: "text",
      inputLabel: "CPF",
      inputPlaceholder: "000.000.000-00",
      inputAttributes: { maxLength: "14" },
      showCancelButton: true,
      confirmButtonText: "Salvar e continuar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      customClass: {
        icon: "meu-icone-verde",
        confirmButton: "meu-botao-verde",
        cancelButton: "btn-cancelar",
      },
      didOpen: (popup) => {
        const input = popup.querySelector<HTMLInputElement>(".swal2-input");
        if (!input) return;
        input.value = formatCPF(input.value);
        input.addEventListener("input", () => {
          input.value = formatCPF(input.value);
        });
      },
      inputValidator: (valor) => {
        const formatado = formatCPF(valor ?? "");
        if (!formatado) return "Digite o seu CPF.";
        if (!regexCPF.test(formatado) || !validarCPF(formatado)) {
          return "Digite um CPF válido.";
        }
        return null;
      },
      preConfirm: async (valor) => {
        const formatado = formatCPF(valor ?? "");
        const salvou = await salvarCpf(formatado);
        if (!salvou) return undefined;
        return formatado;
      },
    });

    if (resultado.isConfirmed && resultado.value) {
      setCpfCadastrado(true);
      await Swal.fire({
        icon: "success",
        title: "CPF salvo!",
        text: "Agora você pode participar das divisões.",
        confirmButtonText: "Continuar",
        customClass: {
          icon: "meu-icone-verde",
          confirmButton: "meu-botao-verde",
        },
      });
      return true;
    }

    return false;
  }, [salvarCpf]);

  // Garante que o usuário tem CPF antes de participar/criar divisões.
  // Retorna true quando o CPF está (ou acaba de ser) cadastrado.
  const garantirCpf = useCallback(async (): Promise<boolean> => {
    if (!usuarioId || usuarioId === "google-profile") {
      await Swal.fire({
        icon: "warning",
        title: "Atenção",
        text: "Você precisa estar logado para continuar.",
        confirmButtonText: "Entendi",
        customClass: {
          icon: "meu-icone-verde",
          confirmButton: "meu-botao-verde",
        },
      });
      return false;
    }

    let possui = cpfCadastrado;

    if (possui === null) {
      possui = await buscarStatusCpf();
    }

    if (possui) return true;

    return pedirCpf();
  }, [buscarStatusCpf, cpfCadastrado, pedirCpf, usuarioId]);

  return { cpfCadastrado, garantirCpf, revalidarCpf: buscarStatusCpf };
}
