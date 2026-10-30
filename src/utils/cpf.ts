export const regexCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

export function formatCPF(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}


export function validarCPF(cpf: string): boolean {
  const numeros = cpf.replace(/\D/g, "");

  if (numeros.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(numeros)) return false;

  const calcularDigito = (base: string, pesoInicial: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const digito1 = calcularDigito(numeros.slice(0, 9), 10);
  if (digito1 !== Number(numeros[9])) return false;

  const digito2 = calcularDigito(numeros.slice(0, 10), 11);
  return digito2 === Number(numeros[10]);
}

export function cpfPreenchido(valor?: string | null): boolean {
  return Boolean(String(valor ?? "").replace(/\D/g, "").length);
}
