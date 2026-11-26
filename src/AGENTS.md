# Guia de `src/`

Este diretório contém a aplicação React/TypeScript. Consulte também o [`AGENTS.md`](../AGENTS.md) da raiz para comandos, visão geral e convenções comuns.

## Onde alterar

- Uma tela completa ou rota: `pages/`; se for uma seção da home, `pages/sectionsHome/`.
- Elemento usado em várias telas: `components/`.
- Estado e comportamento reutilizável ligado ao React: `hooks/`.
- Acesso HTTP reutilizado: `services/`; mantenha parsing e tratamento de erros junto ao serviço quando apropriado.
- Tipos partilhados: `types/`; funções sem estado React: `utils/`.
- Apresentação: CSS correspondente em `css/`; estilos base estão em `css/Global.css`.
- Rotas e providers: `App.tsx`; montagem da raiz: `main.tsx`.

## Cuidados

- Rotas autenticadas são envolvidas por `ProtectedRoute`; não assuma que existir uma tela significa que ela é pública.
- O usuário autenticado é fornecido por `useAuth`. Não duplique estado de sessão em uma tela.
- A base da API vem de `VITE_API_URL`, com alguns fallbacks locais/de produção em arquivos atuais. Prefira o valor de ambiente em código novo.
- Evite incluir tokens, credenciais, dados pessoais reais ou conteúdo de `.env` no código, nos logs ou nos documentos.
- Preserve os comportamentos responsivos e a identidade visual existente ao mexer nos CSS.
