export type NotificacaoTipo =
  | "WELCOME"
  | "PROFILE_SUGGESTION"
  | "DIVISAO_CRIADA";

export type Notificacao = {
  not_notificacao_id: number;
  not_user_id: string;
  not_notificacao_tipo: NotificacaoTipo | string;
  not_notificacao_titulo: string;
  not_notificacao_mensagem: string;
  not_notificacao_destaques: string[] | null;
  not_notificacao_icone: string | null;
  not_notificacao_cor: string | null;
  not_gru_id: number | null;
  not_notificacao_lida: boolean;
  not_notificacao_data: string;
};

export type PaginacaoNotificacoes = {
  page: number;
  limit: number;
  total: number;
  totalPaginas: number;
  temMais: boolean;
};

export type PaginaNotificacoes = {
  notificacoes: Notificacao[];
  paginacao: PaginacaoNotificacoes;
};