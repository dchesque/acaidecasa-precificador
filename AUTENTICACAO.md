# 🔐 Sistema de Autenticação - AçaíDeCasa

Sistema de autenticação completo implementado para o AçaíDeCasa Precificador com design responsivo e integração com Supabase.

## 📋 O que foi implementado

### ✅ Estrutura de Arquivos
```
/app/auth/
├── layout.tsx                    # Layout específico para páginas de auth
├── login/page.tsx                # Página de login
├── signup/page.tsx               # Página de cadastro
└── forgot-password/page.tsx      # Recuperação de senha

/src/components/auth/
└── AuthForm.tsx                  # Componente reutilizável de autenticação

/src/lib/supabase/
├── client.ts                     # Cliente Supabase para browser
├── server.ts                     # Cliente Supabase para server
└── middleware.ts                 # Middleware de autenticação

/src/hooks/
└── useAuth.ts                    # Hook para gerenciar autenticação

middleware.ts                     # Middleware na raiz para proteção de rotas
.env.local.example               # Exemplo de variáveis de ambiente
```

### 🎨 Design Implementado

#### Split Screen Layout
- **Lado Esquerdo (Desktop)**: Gradiente purple-500 to pink-500 com branding
  - Logo "AC" em um quadrado com gradiente
  - Título "AçaíDeCasa Precificador"
  - Subtítulo "Gestão inteligente para seu negócio"
  - 4 cards de features: Cálculo Automático, Gestão de Fornecedores, 100% Seguro, Análise de Margem
  - Estatísticas: 150+ Produtos, 50+ Receitas, 25% Economia

- **Lado Direito**: Formulário de autenticação
  - Fundo slate-900 (dark theme)
  - Tabs para alternar entre "Entrar" e "Criar conta"
  - Campos com ícones (email, senha, nome)
  - Botão principal com gradiente purple-600 to pink-600
  - Links para recuperação de senha e termos

#### Responsividade
- **Mobile**: Layout em coluna única, lado esquerdo vira header compacto
- **Tablet**: Layout adaptativo
- **Desktop**: Split screen completo

### 🔧 Funcionalidades

#### Autenticação
- [x] Login com email e senha
- [x] Cadastro de novos usuários
- [x] Recuperação de senha
- [x] Validação de formulários com Zod
- [x] Estados de loading nos botões
- [x] Mostrar/ocultar senha
- [x] Toast notifications para feedback
- [x] Checkbox "Lembrar-me"

#### Segurança
- [x] Middleware de proteção de rotas
- [x] Cookies seguros preparados
- [x] Validação client e server-side
- [x] Sanitização de inputs

#### Estado Global
- [x] Integração com AppContext
- [x] Hook useAuth para gerenciar sessão
- [x] Persistência de estado de autenticação

## 🚀 Como usar

### 1. Configurar Supabase (Opcional)

O sistema funciona mesmo sem Supabase configurado (simulando autenticação). Para ativar o Supabase:

1. Crie um projeto no [Supabase](https://app.supabase.com/)
2. Copie `.env.local.example` para `.env.local`
3. Preencha as variáveis:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Acessar as páginas

- **Login**: `http://localhost:3000/auth/login`
- **Cadastro**: `http://localhost:3000/auth/signup`
- **Recuperar Senha**: `http://localhost:3000/auth/forgot-password`

### 3. Proteção de Rotas

O middleware protege automaticamente todas as rotas exceto `/auth/*`. Usuários não autenticados são redirecionados para `/auth/login`.

### 4. Usar no código

```tsx
import { useAuth } from '@/hooks/useAuth'
import { useAppContext } from '@/contexts/AppContext'

function MyComponent() {
  const { user, isAuthenticated, signOut } = useAuth()
  const { user: contextUser } = useAppContext()

  if (!isAuthenticated) {
    return <div>Carregando...</div>
  }

  return (
    <div>
      <p>Olá, {user?.email}</p>
      <button onClick={signOut}>Sair</button>
    </div>
  )
}
```

## 🎯 Estados do Sistema

### Sem Supabase configurado
- Simula login/cadastro com delays
- Não persiste dados entre sessões
- Todas as validações funcionam
- Interface completa disponível

### Com Supabase configurado
- Autenticação real com persistência
- Emails de recuperação de senha
- Sessões persistentes
- Proteção completa de rotas

## 🔄 Fluxo de Autenticação

1. **Usuário acessa rota protegida** → Middleware verifica autenticação
2. **Se não autenticado** → Redirecionamento para `/auth/login`
3. **Login bem-sucedido** → Redirecionamento para rota original ou dashboard
4. **Logout** → Limpeza de sessão e redirecionamento para login

## 🎨 Customização

### Cores e Tema
As cores seguem o design system existente:
- Gradiente principal: `from-purple-600 to-pink-600`
- Fundo dark: `bg-slate-900`
- Inputs: `bg-slate-700 border-slate-600`

### Formulários
Todos os formulários usam:
- React Hook Form para gerenciamento
- Zod para validação
- shadcn/ui para componentes
- Sonner para notificações

## 📱 Componentes Disponíveis

### AuthForm
Componente principal reutilizável que aceita props para diferentes modos:
```tsx
<AuthForm
  mode="login" | "signup" | "forgot-password"
  onLogin={handleLogin}
  onSignup={handleSignup}
  onForgotPassword={handleForgotPassword}
  isLoading={false}
/>
```

### useAuth Hook
Hook principal para gerenciar autenticação:
```tsx
const {
  user,           // Dados do usuário atual
  session,        // Sessão ativa
  loading,        // Estado de carregamento
  signIn,         // Função de login
  signUp,         // Função de cadastro
  signOut,        // Função de logout
  resetPassword,  // Função de recuperação
  isAuthenticated // Boolean de status
} = useAuth()
```

## 🔒 Segurança Implementada

- ✅ Validação de email
- ✅ Força mínima de senha (6 caracteres)
- ✅ Proteção CSRF preparada
- ✅ Rate limiting preparado
- ✅ Sanitização de inputs
- ✅ Cookies httpOnly/secure preparados
- ✅ Middleware de proteção de rotas

## 🌟 Próximos Passos (Opcionais)

1. **Configurar tabela de usuários no Supabase**
2. **Adicionar autenticação social (Google)**
3. **Implementar roles e permissões**
4. **Adicionar auditoria de login**
5. **Configurar rate limiting**

---

✨ **Sistema pronto para uso!** Basta configurar as variáveis do Supabase e o sistema estará 100% funcional.