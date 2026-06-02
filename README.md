# 🚀 DivideAqui

> **Divida gastos de forma inteligente, segura e desconfortável nunca mais!**

DivideAqui é uma aplicação web moderna que facilita o compartilhamento de despesas entre amigos, familiares e colegas. Nosso objetivo é reduzir o impacto dos altos custos, oferecendo formas mais econômicas de acesso a serviços e entretenimento.

---

## ✨ Sobre o Projeto

O DivideAqui nasceu como um Trabalho de Conclusão de Curso (TCC) com uma missão clara: **eliminar o desconforto de cobrar conhecidos**.

Com nossa plataforma, você pode:
- ✅ Encontrar pessoas para dividir gastos
- ✅ Convidar amigos para compartilhar despesas
- ✅ Compartilhar custos de forma segura e organizada
- ✅ Gerar cobranças automaticamente, sem constrangimento
- ✅ Manter controle total de suas despesas compartilhadas

---

## 🎯 Funcionalidades Principais

- **Divisão Inteligente de Despesas**: Calcule automaticamente quanto cada pessoa deve pagar
- **Convite de Amigos**: Compartilhe links ou códigos para adicionar participantes
- **Gestão de Grupos**: Organize despesas por grupos de pessoas
- **Histórico Completo**: Acompanhe todas as transações
- **Interface Responsiva**: Funciona perfeitamente em desktop, tablet e celular
- **Design Moderno**: Interface intuitiva e agradável visualmente

---

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript para UI
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool rápido e moderno
- **CSS3** - Estilos responsivos e modernos
- **React Icons** - Ícones de qualidade
- **ESLint** - Análise estática de código

---

## 📦 Instalação

### Pré-requisitos
- Node.js (v16 ou superior)
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/divideaqui.git
cd divideaqui
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

4. **Acesse a aplicação**
Abra seu navegador e acesse `http://localhost:5173`

---

## 🚀 Como Usar

1. **Crie um Grupo**: Inicie um novo grupo de despesas
2. **Convide Participantes**: Adicione amigos através de links ou códigos
3. **Registre Despesas**: Adicione cada gasto compartilhado
4. **Gere Cobranças**: O sistema calcula automaticamente quem deve pagar para quem
5. **Acompanhe**: Visualize o histórico e status de todas as transações

---

## 📁 Estrutura do Projeto

```
DivideAqui/
├── src/
│   ├── components/        # Componentes reutilizáveis
│   ├── pages/            # Páginas principais
│   ├── css/              # Estilos globais e específicos
│   ├── assets/           # Imagens e ícones
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Ponto de entrada
├── public/               # Arquivos públicos estáticos
├── package.json          # Dependências do projeto
├── tsconfig.json         # Configuração TypeScript
└── vite.config.ts        # Configuração Vite
```

---

## 🔧 Scripts Disponíveis

```bash
# Inicia o servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Prévia do build em produção
npm run preview

# Executa o linter
npm run lint
```

---

## 💡 Como Funciona

### Fluxo de Uso

1. **Criação de Grupo**: O usuário cria um novo grupo com nome e descrição
2. **Adição de Membros**: Convida outros usuários para participar
3. **Registro de Despesa**: Qualquer membro pode adicionar uma despesa (ex: R$ 120 em pizza)
4. **Cálculo Automático**: O sistema divide o valor entre todos os participantes
5. **Geração de Débitos**: Cria automaticamente quem deve pagar para quem
6. **Resolução**: Membros recebem notificações sobre pagamentos pendentes

---

## 🌟 Diferenciais

- 🎨 **Design Responsivo**: Funciona em qualquer dispositivo
- ⚡ **Performance**: Carregamento rápido com Vite
- 🔒 **Segurança**: Dados tratados com cuidado
- 😊 **Experiência Agradável**: Interface intuitiva e moderna
- 🚀 **Moderno**: Desenvolvido com tecnologias atuais

---

## 📝 Licença

Este projeto é licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

---

## 👥 Contribuidores

Desenvolvido como TCC com ❤️

---

## 📧 Contato

Para dúvidas ou sugestões sobre o DivideAqui, entre em contato através das issues do repositório.

---

**Comece a dividir despesas de forma inteligente agora! 🎉**
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
