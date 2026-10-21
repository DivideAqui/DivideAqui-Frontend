import type { ComponentType } from "react";
import { FaRegSmile, FaUserEdit, FaUserFriends } from "react-icons/fa";
import { FiDivideCircle } from "react-icons/fi";

type IconeNotificacaoProps = { className?: string };

type EntradaTipo = {
  Icone: ComponentType<IconeNotificacaoProps>;
  cor: string;
  corIcone: string;
};

const VISUAL_TIPO: Record<string, EntradaTipo> = {
  WELCOME: { Icone: FaRegSmile, cor: "#B8FB3C", corIcone: "#0C0C0C" },
  PROFILE_SUGGESTION: { Icone: FaUserEdit, cor: "#053CC8", corIcone: "#F5F5F0" },
  DIVISAO_CRIADA: { Icone: FiDivideCircle, cor: "#79C734", corIcone: "#0C0C0C" },
};

const VISUAL_ICONE: Record<string, EntradaTipo> = {
  welcome: VISUAL_TIPO.WELCOME,
  profile: VISUAL_TIPO.PROFILE_SUGGESTION,
  created: VISUAL_TIPO.DIVISAO_CRIADA,
};

const FALLBACK: EntradaTipo = {
  Icone: FaUserFriends,
  cor: "#053CC8",
  corIcone: "#F5F5F0",
};

export function resolverVisual(chave: string): EntradaTipo {
  if (!chave) return FALLBACK;
  return VISUAL_ICONE[chave] ?? VISUAL_TIPO[chave] ?? FALLBACK;
}
