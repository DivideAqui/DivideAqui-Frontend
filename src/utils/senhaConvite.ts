/**
 * Senha de convite para grupos privados.
 *
 * Como o backend não possui campo dedicado, a senha é gerada de forma
 * determinística a partir do id do grupo: a mesma função é usada na
 * página de detalhe (para o líder ver/copiar) e na página de convite
 * (para validar o que o convidado digitou).
 */

const normalizar = (valor: string) =>
  valor.toUpperCase().trim().replace(/[\s-]/g, "");

/** Gera a senha do convite a partir do id do grupo (ex.: "K2FP-7D3A"). */
export function gerarSenhaGrupo(gruId: number | string): string {
  const id = String(gruId);
  let primeiro = 5381;
  let segundo = 52711;

  for (let i = 0; i < id.length; i++) {
    const caractere = id.charCodeAt(i);
    primeiro = (primeiro * 33) ^ caractere;
    primeiro = (primeiro >>> 0) ^ (primeiro >>> 16);
    segundo = (segundo * 31 + caractere * (i + 3)) >>> 0;
  }

  const parteA = (primeiro >>> 0).toString(36).toUpperCase().padStart(4, "0").slice(0, 4);
  const parteB = segundo.toString(36).toUpperCase().padStart(4, "0").slice(0, 4);

  return `${parteA}-${parteB}`;
}

/** Compara o que o usuário digitou com a senha real do grupo. */
export function validarSenhaGrupo(
  digitada: string | null | undefined,
  gruId: number | string,
): boolean {
  if (!digitada) return false;
  return normalizar(digitada) === normalizar(gerarSenhaGrupo(gruId));
}
