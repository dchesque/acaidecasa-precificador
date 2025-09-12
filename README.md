# 🫐 AçaíDeCasa - Precificador Inteligente

Sistema avançado de precificação e gestão de produtos para negócios de açaí, desenvolvido com Next.js 15 e tecnologias modernas.

![Next.js](https://img.shields.io/badge/Next.js-15.1.2-black)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.17-cyan)

## ✨ Características Principais

### 🎯 Sistema Completo de Precificação
- **Cálculo automático** de custos e preços
- **Margem de lucro dinâmica** com ajustes em tempo real
- **Análise de rentabilidade** por produto
- **Alertas inteligentes** para produtos com baixa margem

### 🏪 Gestão de Produtos
- **Cardápio digital** com controle de ativação/desativação
- **Receitas customizáveis** com ingredientes e quantidades
- **Copos base** com diferentes tamanhos e preços
- **Combinados especiais** com desconto automático
- **Controle de estoque** integrado

### 📊 Dashboard Analítico
- **Métricas em tempo real** (margem média, custo médio, preço médio)
- **Resumo do sistema** com contadores por categoria
- **Itens recentes** adicionados ao cardápio
- **Sistema de alertas** para itens que requerem atenção

### 🎨 Interface Moderna
- **Design system** baseado em Radix UI + Tailwind CSS
- **Sidebar fixa** com navegação intuitiva
- **Tema escuro/claro** alternável
- **Layout responsivo** para desktop e mobile
- **Animações suaves** e transições

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 15.1.2** - Framework React com App Router
- **React 18.3.1** - Biblioteca para interfaces de usuário
- **TypeScript 5.8.3** - Tipagem estática
- **Tailwind CSS 3.4.17** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis e customizáveis

### Bibliotecas Principais
- **Lucide React** - Ícones modernos e consistentes
- **React Hook Form + Zod** - Formulários e validação
- **Sonner** - Sistema de notificações toast
- **Recharts** - Gráficos e visualizações
- **Date-fns** - Manipulação de datas
- **Class Variance Authority** - Variantes de componentes

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **PostCSS + Autoprefixer** - Processamento CSS
- **TypeScript** - Verificação de tipos

## 📁 Estrutura do Projeto

```
acaidecasa-precificador/
├── app/                          # App Router (Next.js 15)
│   ├── cardapio/                # Página do cardápio
│   ├── combinados/              # Página de combinados
│   ├── configuracoes/           # Página de configurações
│   ├── copos-base/              # Página de copos base
│   ├── embalagens/              # Página de embalagens
│   ├── fornecedores/            # Página de fornecedores
│   ├── insumos/                 # Página de insumos
│   ├── minha-conta/             # Página da conta do usuário
│   ├── receitas/                # Página de receitas
│   ├── layout.tsx               # Layout raiz
│   ├── globals.css              # Estilos globais
│   ├── page.tsx                 # Página inicial (Dashboard)
│   └── providers.tsx            # Provedores globais
├── src/
│   ├── components/              # Componentes reutilizáveis
│   │   ├── alerts/              # Componentes de alertas
│   │   ├── forms/               # Formulários específicos
│   │   ├── layout/              # Componentes de layout
│   │   │   ├── Header.tsx       # Cabeçalho com informações do usuário
│   │   │   ├── Navigation.tsx   # Sidebar de navegação
│   │   │   ├── NavItem.tsx      # Item de navegação
│   │   │   └── Layout.tsx       # Layout base
│   │   ├── modals/              # Componentes de modal
│   │   ├── pages/               # Componentes de páginas específicas
│   │   └── ui/                  # Componentes base (Radix UI)
│   ├── contexts/                # Context API
│   ├── data/                    # Dados mockados e tipos
│   ├── hooks/                   # Custom hooks
│   ├── lib/                     # Utilitários e configurações
│   ├── pages/                   # Componentes de página
│   ├── types/                   # Definições de tipos TypeScript\n  └── utils/                   # Funções utilitárias
├── public/                      # Arquivos estáticos\n└── ...arquivos de configuração\n```\n\n## 🚀 Funcionalidades Implementadas\n\n### 🏠 Dashboard\n- Visão geral com métricas principais\n- Cards de estatísticas (Total de itens, Margem média, Custo médio, Preço médio)\n- Sistema de alertas integrado\n- Lista de itens recentes do cardápio\n- Resumo do sistema por categoria\n\n### 🍹 Gestão de Cardápio\n- Listagem completa de produtos\n- Controle de ativação/desativação\n- Cálculo automático de preços\n- Visualização de margem de lucro\n- Sistema de busca e filtros\n\n### 📝 Receitas\n- Criação de receitas personalizadas\n- Gestão de ingredientes e quantidades\n- Cálculo de custo por receita\n- Controle de rendimento\n\n### 🥤 Copos Base\n- Diferentes tamanhos (300ml, 400ml, 500ml, etc.)\n- Preços individuais por tamanho\n- Gestão de custos de embalagem\n\n### 🎨 Combinados\n- Criação de combos especiais\n- Desconto automático por volume\n- Gestão de produtos incluídos\n- Margem diferenciada para combos\n\n### 📦 Insumos\n- Cadastro de ingredientes\n- Controle de fornecedores\n- Gestão de preços e quantidades\n- Cálculo de custo por unidade\n\n### 📋 Embalagens\n- Diferentes tipos de embalagem\n- Custos individuais\n- Impacto no preço final\n\n### 🏢 Fornecedores\n- Cadastro de fornecedores\n- Informações de contato\n- Histórico de compras\n\n### ⚙️ Configurações\n- Configurações gerais do sistema\n- Parâmetros de precificação\n- Margem de lucro padrão\n- Impostos e taxas\n\n### 👤 Minha Conta\n- **Informações Pessoais**: Dados do usuário, contato, endereço\n- **Segurança**: Alteração de senha\n- Interface de perfil com avatar\n- Edição inline de informações\n\n### 🎨 Interface e UX\n- **Sidebar moderna** com logo AçaíDeCasa\n- **Menu dropdown** no perfil do usuário (Configurações, Minha Conta, Sair)\n- **Topbar** com boas-vindas e informações do usuário logado\n- **Cores diferenciadas** para cada seção do menu\n- **Layout fixo** da sidebar para melhor navegação\n- **Transições suaves** e hover effects\n- **Responsividade completa**\n\n## 🚀 Como Executar\n\n### Pré-requisitos\n- Node.js 18+ \n- NPM ou Yarn\n\n### Instalação\n\n1. **Clone o repositório**\n```bash\ngit clone https://github.com/dchesque/acaidecasa-precificador.git\ncd acaidecasa-precificador\n```\n\n2. **Instale as dependências**\n```bash\nnpm install\n# ou\nyarn install\n```\n\n3. **Execute em desenvolvimento**\n```bash\nnpm run dev\n# ou\nyarn dev\n```\n\n4. **Acesse a aplicação**\n```\nhttp://localhost:3000\n```\n\n### Scripts Disponíveis\n\n```bash\nnpm run dev      # Executa em modo desenvolvimento\nnpm run build    # Gera build de produção\nnpm run start    # Executa build de produção\nnpm run lint     # Executa linting do código\n```\n\n## 🔧 Configuração\n\n### Variáveis de Ambiente\nCrie um arquivo `.env.local` na raiz do projeto:\n\n```env\n# Configurações da aplicação\nNEXT_PUBLIC_APP_NAME=\"AçaíDeCasa\"\nNEXT_PUBLIC_APP_VERSION=\"1.0.0\"\n\n# Configurações de tema\nNEXT_PUBLIC_DEFAULT_THEME=\"light\"\n```\n\n### Customização de Temas\nO sistema suporta temas personalizados através do arquivo `globals.css`:\n\n```css\n:root {\n  --acai-purple: #8B5CF6;\n  --acai-purple-light: #A78BFA;\n  --acai-green: #10B981;\n  --acai-pink: #EC4899;\n}\n```\n\n## 📊 Arquitetura\n\n### Padrões Utilizados\n- **App Router** (Next.js 15) para roteamento moderno\n- **Server Components** para performance otimizada\n- **Context API** para gerenciamento de estado global\n- **Custom Hooks** para lógica reutilizável\n- **Compound Components** para componentes complexos\n- **Render Props** e **Children as Function** patterns\n\n### Estrutura de Componentes\n```\nComponente Base (Radix UI)\n├── Estilização (Tailwind + CVA)\n├── Variantes (Class Variance Authority)\n├── Estados (useState/useContext)\n└── Lógica de Negócio (Custom Hooks)\n```\n\n### Sistema de Precificação\n```\nInsumo → Receita → Copo Base → Produto Final\n   ↓        ↓         ↓           ↓\nCusto → Custo da → Custo + → Preço com\n     Receita    Embalagem    Margem\n```\n\n## 🎯 Próximas Funcionalidades\n\n### Em Desenvolvimento\n- [ ] Sistema de autenticação completo\n- [ ] Integração com APIs de pagamento\n- [ ] Relatórios avançados com gráficos\n- [ ] Sistema de backup automático\n- [ ] Modo offline com sincronização\n\n### Planejadas\n- [ ] App mobile (React Native)\n- [ ] Sistema de pedidos online\n- [ ] Integração com delivery\n- [ ] Analytics avançados\n- [ ] Multi-tenancy (múltiplas lojas)\n\n## 🤝 Contribuição\n\n### Como Contribuir\n1. Faça um fork do projeto\n2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)\n3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)\n4. Push para a branch (`git push origin feature/nova-feature`)\n5. Abra um Pull Request\n\n### Padrões de Commit\n- `feat:` Nova funcionalidade\n- `fix:` Correção de bug\n- `docs:` Documentação\n- `style:` Formatação de código\n- `refactor:` Refatoração\n- `test:` Testes\n- `chore:` Tarefas de manutenção\n\n## 📝 Licença\n\nEste projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.\n\n## 👨‍💻 Desenvolvedor\n\n**Diego Chesque**\n- GitHub: [@dchesque](https://github.com/dchesque)\n- Email: contato@diegochesque.com\n\n---\n\n<div align=\"center\">\n  <p><strong>Desenvolvido com ❤️ para o sucesso do seu negócio de açaí</strong></p>\n  <p><em>AçaíDeCasa - Precificador Inteligente © 2024</em></p>\n</div>"