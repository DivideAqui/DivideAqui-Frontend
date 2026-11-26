# Guia do projeto DivideAqui

## Visão geral

Frontend web para organizar divisões de despesas entre pessoas. A aplicação permite consultar e criar grupos, gerir participantes e perfil, ver histórico e receber notificações. A interface pública também apresenta o produto e permite procurar divisões.

## Tecnologias e comandos

- React 19, TypeScript 6 e Vite 8; aplicação cliente com React Router.
- Estilos em CSS, animações com GSAP e Lenis, mapas com Mapbox e autenticação Google.
- `npm run dev`: servidor de desenvolvimento.
- `npm run build`: verificação TypeScript e compilação Vite.
- `npm run lint`: ESLint.
- `npm run preview`: serve a compilação localmente.

## Organização

- `src/App.tsx`: providers e rotas da aplicação.
- `src/pages/`: páginas de rota e secções da página inicial (`sectionsHome/`).
- `src/components/`: navegação, rodapé, diálogos e componentes reutilizáveis.
- `src/hooks/`: autenticação, CPF e notificações.
- `src/services/`: chamadas agrupadas à API (atualmente notificações).
- `src/types/` e `src/utils/`: tipos partilhados e funções utilitárias.
- `src/css/`: estilos globais, por página/componente e versões responsivas em `MinCss/`.
- `src/assets/` e `public/`: imagens, ícones e recursos estáticos.

## Convenções para alterações

- Preserve o idioma português da interface e os nomes/rotas existentes, inclusive acentos quando usados nos arquivos.
- Use TypeScript e React funcional. Mantenha componentes e hooks próximos à área a que pertencem; compartilhe código transversal por `components`, `hooks`, `services`, `types` ou `utils`.
- Proteja páginas autenticadas com `ProtectedRoute` e use `useAuth` para estado de sessão.
- A API usa `import.meta.env.VITE_API_URL` em vários pontos. Para integração nova, prefira concentrar a chamada em `src/services/` e enviar `Authorization: Bearer` quando o endpoint exigir autenticação.
- Variáveis Vite expostas ao cliente devem ter prefixo `VITE_`; nunca coloque segredos privados no bundle. Configure valores locais no `.env` (ignorado pelo Git) e no provedor de deploy.
- Estilos devem seguir os arquivos CSS existentes e preservar a adaptação a telas menores.
- Não adicione dependências quando a funcionalidade puder seguir os padrões e pacotes já existentes.

## Configuração e deploy

- Variáveis observadas no código: `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID` e `VITE_MAPBOX_TOKEN` (esta última é usada nas páginas de mapas). Não documente valores secretos.
- `vercel.json` configura o deploy SPA na Vercel; `vite.config.ts` ativa React e otimização de imagens.
- `package-lock.json` é o lockfile npm e deve ser mantido versionado.

## Escopo deste guia

Este documento descreve a estrutura observada no frontend. Contratos definitivos dos endpoints, regras de negócio do servidor e configuração completa do backend não estão definidos neste repositório.
