# Açaí De Casa Precificador

![Badge](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

## 📖 Sobre o Projeto

O **Açaí De Casa Precificador** é uma aplicação web projetada para simplificar a gestão financeira e a precificação de produtos para deliverys de açaí. A ferramenta permite que proprietários de negócios calculem com precisão os custos de seus produtos, gerenciem insumos, fornecedores e receitas, e definam preços de venda estratégicos com base em um markup configurável.

O foco principal é a simplicidade e a objetividade, fornecendo uma visão clara da margem de lucro e auxiliando em negociações com fornecedores.

## ✨ Funcionalidades Principais

O sistema é organizado nos seguintes módulos:

- **Dashboard:** Visão geral com os principais indicadores de desempenho, alertas e atalhos para as funcionalidades mais usadas.
- **Gestão de Cardápio:** Crie e gerencie o cardápio final, simule preços, analise margens de lucro e exporte o cardápio em PDF.
- **Receitas:** Cadastre produções internas (cremes, mousses, etc.), adicione ingredientes, e o sistema calculará o custo por grama automaticamente.
- **Copos Base:** Defina os tamanhos e tipos de copos que servem como base para a montagem dos produtos.
- **Combinados:** Crie produtos pré-montados (copo base + complementos) e calcule o custo total do combo.
- **Insumos:** Gerencie todos os ingredientes e embalagens, com múltiplos fornecedores e preços para cada item.
- **Fornecedores:** Mantenha um cadastro completo dos seus fornecedores, com informações de contato, prazos e pedidos mínimos.
- **Análise de Vendas:** Importe planilhas de vendas (CSV/Excel), visualize KPIs de faturamento e lucro real, e identifique divergências de preço e produtos não cadastrados.
- **Configurações:** Personalize o sistema definindo o markup padrão, gerenciando categorias e outras configurações globais.
- **Autenticação:** Sistema completo de login, cadastro e recuperação de senha.

## 🚀 Tecnologias Utilizadas

O projeto foi construído com uma stack moderna e robusta, focada em performance e escalabilidade:

- **Framework:** [Next.js](https://nextjs.org/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com [shadcn/ui](https://ui.shadcn.com/)
- **Banco de Dados:** [Supabase](https://supabase.io/) (PostgreSQL)
- **Autenticação:** [Supabase Auth](https://supabase.io/docs/guides/auth)
- **Gerenciamento de Estado:** React Context API com `useReducer`
- **Formulários:** [React Hook Form](https://react-hook-form.com/) com [Zod](https://zod.dev/) para validação
- **Visualização de Dados:** [Recharts](https://recharts.org/)
- **Utilitários:** `jspdf`, `jspdf-autotable` para exportação de PDFs, `date-fns` para manipulação de datas, e `lucide-react` para ícones.

## 🏁 Começando

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos

- [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
- [Bun](https://bun.sh/) (ou `npm`/`yarn`)

### Instalação

1. Clone o repositório:
   ```sh
   git clone https://github.com/seu-usuario/acaidecasa-precificador.git
   ```
2. Navegue até o diretório do projeto:
   ```sh
   cd acaidecasa-precificador
   ```
3. Instale as dependências:
   ```sh
   bun install
   # ou
   npm install
   ```

### Variáveis de Ambiente

1. Crie uma cópia do arquivo de exemplo `.env.local.example`:
   ```sh
   cp .env.local.example .env.local
   ```
2. Abra o arquivo `.env.local` e adicione as credenciais do seu projeto Supabase. Você pode obtê-las no painel do seu projeto em `Settings` > `API`.
   ```env
   NEXT_PUBLIC_SUPABASE_URL=URL_DO_SEU_PROJETO_SUPABASE
   NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA_SUPABASE
   ```

> Sem essas variáveis o app inicia em **modo de demonstração** — todos os dados ficam em memória, são pré-populados com mocks e nada é persistido. Um banner amarelo no topo deixa esse estado claro.

### Configurando o banco no Supabase

1. Crie um projeto novo em [supabase.com](https://supabase.com) e copie a URL + a chave anon para o `.env.local`.
2. Aplique as migrations em `supabase/migrations/` na ordem numérica:

   **Pelo dashboard:**
   `Database → SQL Editor → New query`, cole o conteúdo de cada arquivo e execute.

   **Pelo CLI** ([instalação](https://supabase.com/docs/guides/cli)):
   ```sh
   supabase login
   supabase link --project-ref <seu-project-ref>
   supabase db push
   ```

3. **`0001_initial_schema.sql`** cria todas as tabelas (insumos, fornecedores, receitas, copos_base, combinados, cardapio, custos_operacionais, vendas_*) com `user_id` em cada linha e RLS já ativada.
4. **`0002_seed_defaults.sql`** instala um trigger em `auth.users` que popula categorias e unidades-padrão para todo novo usuário no signup.
5. (Opcional) Em `Authentication → URL Configuration`, configure o `Site URL` e o `Redirect URL` para `https://seu-dominio/auth/reset-password`, ou `http://localhost:3000/auth/reset-password` em dev.

### Executando a Aplicação

Com as dependências instaladas e as variáveis de ambiente configuradas, inicie o servidor de desenvolvimento:

```bash
npm run dev
# ou
bun dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação em funcionamento.

## 📂 Estrutura do Projeto

A estrutura de pastas do projeto está organizada da seguinte forma:

```
. C:\Workspace\acaidecasa-precificador\
├── app/                  # Rotas principais da aplicação (App Router)
├── src/
│   ├── components/       # Componentes React reutilizáveis
│   │   ├── forms/        # Formulários específicos de cada módulo
│   │   ├── layout/       # Componentes de layout (Header, Navigation)
│   │   ├── modals/       # Modais para CRUD e outras interações
│   │   ├── pages/        # Componentes que representam as páginas principais
│   │   └── ui/           # Componentes de UI base (shadcn/ui)
│   ├── contexts/         # Contexto global da aplicação (AppContext)
│   ├── data/             # Dados mockados para desenvolvimento
│   ├── hooks/            # Hooks customizados
│   ├── lib/              # Funções utilitárias e configuração do Supabase
│   ├── services/         # Lógica de negócio e comunicação com APIs
│   ├── types/            # Definições de tipos TypeScript
│   └── utils/            # Funções de cálculo e validação
├── public/               # Arquivos estáticos
└── ...                   # Arquivos de configuração (Next.js, Tailwind, etc.)
```

## 🔮 Futuras Melhorias

Com base no estado atual do protótipo, as próximas prioridades de desenvolvimento são:

- **Finalizar a Integração com o Backend:** Substituir todos os dados mockados pela persistência real no Supabase.
- **Conectar Módulos ao `AppContext`:** Garantir que os módulos de `Cardápio` e `Análise de Vendas` utilizem os dados dinâmicos do `AppContext`.
- **Aprimorar a Análise de Vendas:** Implementar a funcionalidade de vincular produtos não encontrados e adicionar gráficos de análise.
- **Adicionar Testes:** Implementar testes unitários e de integração para garantir a estabilidade do código.