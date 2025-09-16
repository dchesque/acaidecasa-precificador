# **Documento de Requisitos de Produto (PRD): Açaí De Casa Precificador**

# Versão: 1.3

Data: 22/08/2025

Autor: Driano Chesque

## **1. Visão Geral e Objetivo**

O objetivo deste projeto é desenvolver uma aplicação web simples, intuitiva e funcional que permita a proprietários de açaí delivery calcular de forma precisa o custo de seus produtos, gerenciar insumos e fornecedores, e definir o preço de venda final com base em um markup configurável. A aplicação deve simplificar a gestão financeira do cardápio, fornecendo uma visão clara da margem de lucro e comparativos de preços.

**Nosso foco é a simplicidade e a objetividade.** A ferramenta deve ser um auxílio rápido e direto para o empreendedor, sem validações complexas ou fluxos desnecessários.

## **2. Público-Alvo**

O usuário principal da aplicação é o **proprietário ou gerente de um açaí delivery de pequeno a médio porte**, que necessita de uma ferramenta para:

- Organizar a compra de insumos.
- Calcular o custo exato de cada item vendido.
- Criar e precificar um cardápio de forma estratégica.
- Manter um histórico de preços para melhores negociações com fornecedores.

## **3. Identidade Visual e UI/UX**

Esta seção define as diretrizes visuais e de experiência do usuário para a aplicação.

- **Nome da Aplicação:** Açaí De Casa Precificador
- **Paleta de Cores:** A identidade visual será moderna e vibrante, com o roxo como cor principal, transmitindo a essência do açaí.
    - **Roxo Principal (Ações e Destaques):** `#6D28D9` (Um roxo vibrante para botões principais, links e ícones importantes).
    - **Roxo Escuro (Títulos e Fundo):** `#4C1D95` (Para títulos principais e seções de destaque).
    - **Fundo Principal:** `#F3F4F6` (Um cinza bem claro para não cansar a vista e dar destaque aos elementos).
    - **Cor do Texto:** `#1F2937` (Cinza escuro para corpo de texto, garantindo ótima legibilidade).
    - **Cor de Sucesso:** `#10B981` (Verde para mensagens de sucesso e indicadores positivos).
    - **Cor de Erro/Alerta:** `#EF4444` (Vermelho para alertas e mensagens de erro).
    - **Cor de Aviso:** `#F59E0B` (Amarelo/Laranja para avisos e alertas de atenção).
    - **Cor Neutra (Bordas e Divisórias):** `#D1D5DB` (Cinza claro para bordas de inputs e cartões).
- **Tipografia:** Utilizaremos fontes do Google Fonts, conhecidas pela legibilidade e apelo moderno.
    - **Títulos (H1, H2, H3):** **"Poppins"**, com peso *SemiBold*. É uma fonte geométrica e amigável, ótima para títulos de impacto.
    - **Corpo de Texto (Parágrafos, labels):** **"Inter"**, com peso *Regular*. É uma fonte extremamente legível em qualquer tamanho, ideal para interfaces.
- **Elementos de UI (Formatação):**
    - **Botões:** Cantos arredondados (border-radius: 8px), com efeito de sombra suave ao passar o mouse (hover). O botão principal usará a cor **Roxo Principal**.
    - **Inputs e Formulários:** Campos com bordas sutis (**Cor Neutra**), que ganham destaque com a cor **Roxo Principal** quando focados.
    - **Modais:** Fundo semi-transparente (overlay) para focar a atenção do usuário. O modal terá cantos arredondados e uma sombra projetada para dar a sensação de elevação.
    - **Tabelas:** Design limpo e compacto com linhas alternadas em cores sutis, headers destacados e ações por linha através de ícones (visualizar, editar, excluir).
    - **Cards:** Usados sparingly quando necessário. Terão cantos arredondados, uma borda sutil e uma leve sombra para se destacarem do fundo.
- **Diretrizes de Design:**
    - **Simplicidade:** Interface minimalista, direta e sem efeitos desnecessários.
    - **Visualização em Tabelas:** Todos os módulos devem apresentar dados em formato de tabela compacta.
    - **Ações via Ícones:** Botões de ação representados por ícones intuitivos (olho para visualizar, lápis para editar, lixeira para excluir).
    - **Cadastro Rápido:** Botões de "+" ao lado de campos de seleção para cadastro rápido inline.

## **4. Requisitos Funcionais e Páginas**

A aplicação será composta pelos seguintes módulos (páginas), com funcionalidades específicas. A criação e edição de itens deve, preferencialmente, ocorrer através de **modais** para agilizar o fluxo do usuário.

### **4.1. Módulo: Configurações**

Página para gerenciar as configurações globais da aplicação.

- **Markup Padrão:** Campo para definir o percentual de markup padrão a ser sugerido no cardápio (ex: 100%, 150%).
- **Unidades de Medida:** Definir formatos e unidades padrão (padrão: grama (g), moeda (R$)).
- **Categorias por Módulo:** Sistema de categorias independentes para cada módulo:
    - **Categorias de Fornecedores:** (ex: "Distribuidor", "Atacadista", "Produtor Local")
    - **Categorias de Insumos:** (ex: "Frutas", "Chocolates", "Laticínios", "Granolas")
    - **Categorias de Embalagens:** (ex: "Copos", "Tampas", "Talheres", "Sacolas")
    - **Categorias de Receitas:** (ex: "Cremes", "Mousses", "Caldas")
    - **Categorias de Copos Base:** (ex: "Tradicional", "Zero Açúcar", "Premium")
    - **Categorias de Combinados:** (ex: "Clássicos", "Especiais", "Fitness")
    - Cada conjunto de categorias deve ter seu próprio CRUD independente.

### **4.2. Módulo: Fornecedores**

Página para cadastrar e gerenciar todos os fornecedores de insumos e embalagens.

- **Funcionalidades:**
    - CRUD (Criar, Ler, Atualizar, Deletar) de Fornecedores via modal.
    - Campos:
        - Nome do Fornecedor
        - Contato (telefone/email)
        - Categoria
        - **Prazo de Entrega** (em dias)
        - **Pedido Mínimo** (valor em R$)
    - **Visualização:** Tabela compacta com colunas: Nome, Contato, Categoria, Prazo Entrega, Pedido Mínimo, Ações (ícones).
- **Histórico de Preços:** Ao visualizar um fornecedor, deve haver uma seção que lista todos os insumos vinculados a ele e um histórico de alterações de preço para cada insumo (data da alteração, preço bruto antigo, preço bruto novo, preço com desconto antigo, preço com desconto novo).

### **4.3. Módulo: Embalagens**

Página para cadastrar todas as embalagens utilizadas.

- **Funcionalidades:**
    - CRUD de Embalagens via modal.
    - Campos: Nome da Embalagem (ex: "Copo Isopor 500ml"), Categoria.
    - **Integração:**
        - Cada embalagem deve ser vinculada a um **Fornecedor Principal** (com botão "+" para cadastro rápido).
        - **Fornecedor Alternativo** (opcional): Campo para vincular um segundo fornecedor com seus próprios preços.
    - **Precificação Dupla (para cada fornecedor):**
        - **Preço Bruto por Unidade:** (ex: R$ 0,50)
        - **Preço com Desconto por Unidade:** (ex: R$ 0,45)
        - **Quantidade da Compra:** Campo numérico para quantidade de unidades compradas.
    - **Cálculo Automático:** Sistema calcula e exibe o custo unitário baseado no preço bruto do fornecedor principal.
    - **Visualização:** Tabela com colunas: Nome, Categoria, Fornecedor Principal, Fornecedor Alt., Preço Bruto/Un, Preço c/ Desc/Un, Qtd Compra, Ações.

### **4.4. Módulo: Insumos**

Página para cadastrar todos os ingredientes e produtos comprados.

- **Funcionalidades:**
    - CRUD de Insumos via modal.
    - Campos: Nome do Insumo (ex: "Leite em Pó Ninho"), Categoria.
    - **Integração:**
        - Cada insumo deve ser vinculado a um **Fornecedor Principal** (com botão "+" para cadastro rápido).
        - **Fornecedor Alternativo** (opcional): Campo para vincular um segundo fornecedor com seus próprios preços.
    - **Tipo de Medida:** Campo de seleção: "Peso (gramas)" ou "Quantidade (unidades)".
    - **Precificação Dupla (para cada fornecedor):**
        - **Preço Bruto:** (ex: R$ 200,00)
        - **Preço com Desconto:** (ex: R$ 180,00)
        - **Quantidade/Peso da Compra:**
            - Se tipo = "Peso": quantidade em gramas (ex: 10000g)
            - Se tipo = "Quantidade": quantidade em unidades (ex: 12 unidades)
    - **Cálculo Automático:**
        - Se medido por peso: Sistema calcula e exibe o **custo por grama (R$/g)** baseado no preço bruto do fornecedor principal.
        - Se medido por quantidade: Sistema calcula e exibe o **custo por unidade (R$/un)** baseado no preço bruto do fornecedor principal.
    - **Visualização:** Tabela com colunas: Nome, Categoria, Fornecedor Principal, Forn. Alt., Tipo Medida, Preço Bruto, Preço c/ Desc, Quantidade, Custo/g ou Custo/un, Ações.

### **4.5. Módulo: Copos Base**

Página para criar os copos "base" que o cliente montará.

- **Funcionalidades:**
    - CRUD de Copos Base via modal.
    - Campos: Nome do Copo (ex: "Copo Açaí Tradicional 500ml"), Categoria.
    - **Composição:** O usuário deve poder adicionar:
        - O **insumo principal** (ex: Açaí Tradicional) e a quantidade em gramas (ex: 450g).
        - As **embalagens** associadas (ex: 1x Copo Isopor 500ml, 1x Tampa Bolha 500ml, 1x Colher).
    - **Cálculo de Custo:** O sistema deve calcular e exibir o **custo total do copo base** somando o custo dos insumos (baseado no preço bruto) e das embalagens (baseado no preço bruto).
    - **Visualização:** Tabela com colunas: Nome, Categoria, Custo Total, Margem Estimada, Ações.

### **4.6. Módulo: Receitas**

Página para cadastrar produções internas, como cremes e mousses.

- **Funcionalidades:**
    - CRUD de Receitas via modal.
    - Campos:
        - Nome da Receita (ex: "Creme de Ninho")
        - Categoria
        - Modo de Preparo (opcional)
        - **Tempo de Preparo** (em minutos)
        - **Validade** (em dias após produzido)
    - **Composição:** O usuário deve poder adicionar múltiplos **insumos** e suas respectivas quantidades em gramas (ex: Leite Condensado - 800g, Creme de Leite - 400g, Leite em Pó - 200g).
    - **Rendimento:** O usuário deve informar o **rendimento total da receita em gramas**.
    - **Cálculo de Custo:** O sistema deve somar o custo de todos os ingredientes (baseado no preço bruto), dividir pelo rendimento e exibir o **custo final por grama (R$/g)** da receita pronta.
    - **Visualização:** Tabela com colunas: Nome, Categoria, Tempo Preparo, Validade, Rendimento (g), Custo/g, Custo Total Receita, Ações.

### **4.7. Módulo: Combinados**

Página para cadastrar copos pré-montados com complementos.

- **Funcionalidades:**
    - CRUD de Combinados via modal.
    - Campos: Nome do Combinado (ex: "Ninho com Morango 500ml"), Categoria.
    - **Composição:** O usuário deve selecionar:
        - Um **Copo Base** já cadastrado.
        - Múltiplos **complementos** (Insumos ou Receitas) e suas respectivas quantidades em gramas (ex: Leite em Pó - 30g, Morango - 50g, Creme de Ninho - 40g).
    - **Cálculo de Custo:** O sistema deve somar o custo do Copo Base com o custo de todos os complementos adicionados (baseado no preço bruto) para exibir o **custo total do combinado**.
    - **Preço de Venda do Cardápio:** Se já existir um cardápio configurado, o sistema deve mostrar também o preço de venda atual do combinado baseado nos preços do cardápio vigente.
    - **Visualização:** Tabela com colunas: Nome, Categoria, Custo Total, Preço Venda Atual (se houver), Margem, Ações.

### **4.8. Módulo: Cardápio**

A página principal onde o empresário montará o cardápio final para venda.

- **Funcionalidades:**
    - Permitir a criação de categorias de cardápio (ex: "Monte seu Açaí", "Complementos", "Nossos Combinados", "Bebidas").
    - Dentro de cada categoria, o usuário poderá **"puxar" itens** já cadastrados nos outros módulos:
        - **Copos Base:** Para o cliente montar.
        - **Insumos:** Como complementos avulsos (ex: Leite em pó, Frutas).
        - **Receitas:** Como complementos (ex: Creme de Ninho).
        - **Combinados:** Produtos prontos.
- **Para cada item adicionado ao cardápio, o sistema exibirá:**
    - **Código do Produto (SKU/ERP):** Campo opcional para o usuário inserir o código usado em seu sistema ERP/PDV existente, facilitando integração e controle.
    - **Nome do Item**.
    - **Custo Calculado** (baseado no preço bruto, por unidade ou por grama).
    - **Quantidade para o Cliente** (em gramas, para complementos).
    - **Preço de Venda Sugerido:** Calculado automaticamente com base no custo + markup padrão das configurações.
    - **Meu Preço de Venda Atual (R$):** Campo manual para o usuário digitar o preço que ele cobra hoje.
    - **Novo Preço de Venda (R$):** Campo manual para o usuário definir o novo preço.
    - **Análise Comparativa:** O sistema deve exibir visualmente a margem de lucro (em R$ e %) para o "Preço Atual" e para o "Novo Preço", permitindo uma análise clara da rentabilidade.
- **Sistema de Alertas:**
    - **Alerta de Margem Baixa:** Se o preço praticado estiver abaixo do que seria o custo calculado com o preço COM DESCONTO dos insumos, mostrar um alerta visual (ícone de aviso em amarelo/laranja) indicando: "⚠️ Atenção: Preço abaixo do custo com desconto negociado".
    - **Alerta de Prejuízo:** Se o preço praticado estiver abaixo do custo bruto, mostrar alerta em vermelho: "🚫 Prejuízo: Preço abaixo do custo bruto".
- **Visualização:** Tabela organizada por categoria com colunas: Código (SKU), Item, Custo (Bruto), Preço Sugerido, Preço Atual, Novo Preço, Margem Atual (%), Margem Nova (%), Alertas, Ações.

## **5. Recursos Adicionais de Interface**

### **5.1. Cadastro Rápido Inline**

- Em todos os campos de seleção (dropdowns) de relacionamento (Fornecedor, Categoria, etc.), adicionar um botão "+" ao lado.
- Ao clicar no "+", abre o modal padrão de cadastro do respectivo módulo.
- Após salvar, o novo item é automaticamente selecionado no campo.

### **5.2. Visualização em Tabelas**

- Todas as listagens devem ser em formato de tabela compacta.
- Colunas ajustáveis e ordenáveis.
- Paginação quando necessário (mais de 20 itens).
- Busca/filtro rápido no topo da tabela.
- Ações por linha através de ícones:
    - 👁️ Visualizar (abre modal com detalhes completos)
    - ✏️ Editar (abre modal de edição)
    - 🗑️ Excluir (com confirmação)

### **5.3. Modais Padronizados**

- Todos os modais devem seguir o mesmo padrão visual.
- Título claro da ação (Novo/Editar/Visualizar).
- Botões de ação no rodapé (Cancelar à esquerda, Salvar à direita).
- Fechamento por ESC ou clique fora do modal.

## **6. Pilha Tecnológica (Stack)**

- **Framework:** Next.js 15.
- **Banco de Dados:** Supabase.
- **Autenticação:** Supabase Auth (autenticação simples, via email e senha).
- **Gestão de Usuários:** Não haverá sistema de múltiplos usuários ou papéis (Admin/Usuário). A aplicação será acessada por um único usuário global.
- **Segurança:** As regras de segurança do banco de dados serão simplificadas, focadas em proteger os dados do único usuário da aplicação.
- **UI Components:** Biblioteca de componentes minimalista (shadcn/ui ou similar) para manter consistência e simplicidade.

## **7. Critérios de Sucesso**

- A aplicação é adotada por pelo menos um proprietário de açaí delivery que a utiliza para gerenciar 100% do seu cardápio.
- O tempo para cadastrar um novo insumo e refletir seu custo atualizado em todo o cardápio é inferior a 2 minutos.
- O usuário consegue visualizar claramente a margem de lucro de cada produto vendido.
- O sistema de alertas ajuda a prevenir vendas com prejuízo ou margem muito baixa.
- A interface simples e direta permite uso sem treinamento prévio.


# Schema Prisma

// This is your Prisma schema file
// Configured for Supabase (PostgreSQL)

generator client {
provider = "prisma-client-js"
}

datasource db {
provider  = "postgresql"
url       = env("DATABASE_URL")
directUrl = env("DIRECT_URL")
}

// ============================================
// CONFIGURAÇÕES E CATEGORIAS
// ============================================

model Config {
id               String   @id @default(uuid())
markupPadrao     Float    @default(100) // Percentual padrão de markup
unidadePeso      String   @default("g") // Unidade padrão para peso
unidadeMoeda     String   @default("R$") // Unidade padrão para moeda
createdAt        DateTime @default(now())
updatedAt        DateTime @updatedAt
}

// Categorias independentes para cada módulo
model CategoriaFornecedor {
id           String        @id @default(uuid())
nome         String        @unique
descricao    String?
ativo        Boolean       @default(true)
ordem        Int           @default(0)
createdAt    DateTime      @default(now())
updatedAt    DateTime      @updatedAt

fornecedores Fornecedor[]
}

model CategoriaInsumo {
id        String    @id @default(uuid())
nome      String    @unique
descricao String?
ativo     Boolean   @default(true)
ordem     Int       @default(0)
createdAt DateTime  @default(now())
updatedAt DateTime  @updatedAt

insumos   Insumo[]
}

model CategoriaEmbalagem {
id         String      @id @default(uuid())
nome       String      @unique
descricao  String?
ativo      Boolean     @default(true)
ordem      Int         @default(0)
createdAt  DateTime    @default(now())
updatedAt  DateTime    @updatedAt

embalagens Embalagem[]
}

model CategoriaReceita {
id        String    @id @default(uuid())
nome      String    @unique
descricao String?
ativo     Boolean   @default(true)
ordem     Int       @default(0)
createdAt DateTime  @default(now())
updatedAt DateTime  @updatedAt

receitas  Receita[]
}

model CategoriaCopoBase {
id         String      @id @default(uuid())
nome       String      @unique
descricao  String?
ativo      Boolean     @default(true)
ordem      Int         @default(0)
createdAt  DateTime    @default(now())
updatedAt  DateTime    @updatedAt

coposBase  CopoBase[]
}

model CategoriaCombinado {
id         String       @id @default(uuid())
nome       String       @unique
descricao  String?
ativo      Boolean      @default(true)
ordem      Int          @default(0)
createdAt  DateTime     @default(now())
updatedAt  DateTime     @updatedAt

combinados Combinado[]
}

model CategoriaCardapio {
id              String           @id @default(uuid())
nome            String           @unique
descricao       String?
ativo           Boolean          @default(true)
ordem           Int              @default(0)
createdAt       DateTime         @default(now())
updatedAt       DateTime         @updatedAt

itensCardapio   ItemCardapio[]
}

// ============================================
// FORNECEDORES
// ============================================

model Fornecedor {
id              String                @id @default(uuid())
nome            String
contato         String?               // Telefone/Email
prazoEntrega    Int?                  // Em dias
pedidoMinimo    Float?                // Valor mínimo do pedido em R$
categoriaId     String?
ativo           Boolean               @default(true)
observacoes     String?
createdAt       DateTime              @default(now())
updatedAt       DateTime              @updatedAt

categoria       CategoriaFornecedor?  @relation(fields: [categoriaId], references: [id])

// Relacionamentos como fornecedor principal
insumosPrincipal    Insumo[]         @relation("FornecedorPrincipal")
embalagensPrincipal Embalagem[]      @relation("FornecedorPrincipal")

// Relacionamentos como fornecedor alternativo
insumosAlternativo    Insumo[]       @relation("FornecedorAlternativo")
embalagensAlternativo Embalagem[]    @relation("FornecedorAlternativo")

// Histórico de preços
historicoPrecos HistoricoPreco[]

@@index([nome])
}

// ============================================
// INSUMOS
// ============================================

enum TipoMedida {
PESO       // Medido em gramas
QUANTIDADE // Medido em unidades
}

model Insumo {
id                      String           @id @default(uuid())
nome                    String
categoriaId             String?
tipoMedida              TipoMedida       @default(PESO)

// Fornecedor Principal
fornecedorPrincipalId   String?
precoBruto              Float            // Preço bruto do fornecedor principal
precoComDesconto        Float?           // Preço com desconto do fornecedor principal
quantidade              Float            // Quantidade comprada (em g ou unidades)

// Fornecedor Alternativo
fornecedorAlternativoId String?
precoBrutoAlt           Float?           // Preço bruto do fornecedor alternativo
precoComDescontoAlt     Float?           // Preço com desconto do fornecedor alternativo
quantidadeAlt           Float?           // Quantidade do fornecedor alternativo

// Custos calculados automaticamente (baseado no fornecedor principal)
custoPorGrama           Float?           // Calculado se tipoMedida = PESO
custoPorUnidade         Float?           // Calculado se tipoMedida = QUANTIDADE

ativo                   Boolean          @default(true)
observacoes             String?
createdAt               DateTime         @default(now())
updatedAt               DateTime         @updatedAt

categoria               CategoriaInsumo?     @relation(fields: [categoriaId], references: [id])
fornecedorPrincipal     Fornecedor?         @relation("FornecedorPrincipal", fields: [fornecedorPrincipalId], references: [id])
fornecedorAlternativo   Fornecedor?         @relation("FornecedorAlternativo", fields: [fornecedorAlternativoId], references: [id])

// Uso em receitas
ingredientesReceita     IngredienteReceita[]

// Uso em copos base
coposBase               CopoBase[]

// Uso em combinados
complementosCombinado   ComplementoCombinado[]

// Histórico de preços
historicoPrecos         HistoricoPreco[]

// Itens do cardápio
itensCardapio           ItemCardapio[]

@@index([nome])
}

// ============================================
// EMBALAGENS
// ============================================

model Embalagem {
id                      String              @id @default(uuid())
nome                    String
categoriaId             String?

// Fornecedor Principal
fornecedorPrincipalId   String?
precoBrutoPorUnidade    Float               // Preço bruto por unidade
precoComDescontoPorUn   Float?              // Preço com desconto por unidade
quantidadeCompra        Int                 // Quantidade de unidades compradas

// Fornecedor Alternativo
fornecedorAlternativoId String?
precoBrutoPorUnidadeAlt Float?              // Preço bruto alternativo
precoComDescontoPorUnAlt Float?             // Preço com desconto alternativo
quantidadeCompraAlt     Int?                // Quantidade alternativa

// Custo calculado (baseado no fornecedor principal)
custoPorUnidade         Float               // Calculado automaticamente

ativo                   Boolean             @default(true)
observacoes             String?
createdAt               DateTime            @default(now())
updatedAt               DateTime            @updatedAt

categoria               CategoriaEmbalagem?    @relation(fields: [categoriaId], references: [id])
fornecedorPrincipal     Fornecedor?           @relation("FornecedorPrincipal", fields: [fornecedorPrincipalId], references: [id])
fornecedorAlternativo   Fornecedor?           @relation("FornecedorAlternativo", fields: [fornecedorAlternativoId], references: [id])

// Uso em copos base
embalagensCopoBase      EmbalagemCopoBase[]

// Histórico de preços
historicoPrecos         HistoricoPreco[]

@@index([nome])
}

// ============================================
// RECEITAS
// ============================================

model Receita {
id                    String                 @id @default(uuid())
nome                  String
categoriaId           String?
modoPreparo           String?                // Instruções de preparo
tempoPreparo          Int?                   // Em minutos
validade              Int?                   // Em dias após produzido
rendimentoGramas      Float                  // Rendimento total em gramas
custoPorGrama         Float                  // Calculado automaticamente
custoTotal            Float                  // Calculado automaticamente
ativo                 Boolean                @default(true)
observacoes           String?
createdAt             DateTime               @default(now())
updatedAt             DateTime               @updatedAt

categoria             CategoriaReceita?      @relation(fields: [categoriaId], references: [id])

// Ingredientes da receita
ingredientes          IngredienteReceita[]

// Uso em combinados
complementosCombinado ComplementoCombinado[]

// Itens do cardápio
itensCardapio         ItemCardapio[]

@@index([nome])
}

model IngredienteReceita {
id              String    @id @default(uuid())
receitaId       String
insumoId        String
quantidadeGramas Float    // Quantidade em gramas do insumo
custoCalculado  Float     // Custo deste ingrediente na receita
createdAt       DateTime  @default(now())
updatedAt       DateTime  @updatedAt

receita         Receita   @relation(fields: [receitaId], references: [id], onDelete: Cascade)
insumo          Insumo    @relation(fields: [insumoId], references: [id])

@@unique([receitaId, insumoId])
}

// ============================================
// COPOS BASE
// ============================================

model CopoBase {
id                  String              @id @default(uuid())
nome                String
categoriaId         String?

// Insumo principal (açaí)
insumoPrincipalId   String
quantidadeInsumo    Float               // Quantidade em gramas

custoTotal          Float               // Calculado automaticamente
ativo               Boolean             @default(true)
observacoes         String?
createdAt           DateTime            @default(now())
updatedAt           DateTime            @updatedAt

categoria           CategoriaCopoBase?  @relation(fields: [categoriaId], references: [id])
insumoPrincipal     Insumo             @relation(fields: [insumoPrincipalId], references: [id])

// Embalagens associadas
embalagens          EmbalagemCopoBase[]

// Uso em combinados
combinados          Combinado[]

// Itens do cardápio
itensCardapio       ItemCardapio[]

@@index([nome])
}

model EmbalagemCopoBase {
id            String     @id @default(uuid())
copoBaseId    String
embalagemId   String
quantidade    Int        @default(1) // Quantidade de unidades desta embalagem
custoCalculado Float     // Custo desta embalagem no copo
createdAt     DateTime   @default(now())
updatedAt     DateTime   @updatedAt

copoBase      CopoBase   @relation(fields: [copoBaseId], references: [id], onDelete: Cascade)
embalagem     Embalagem  @relation(fields: [embalagemId], references: [id])

@@unique([copoBaseId, embalagemId])
}

// ============================================
// COMBINADOS
// ============================================

model Combinado {
id                  String                 @id @default(uuid())
nome                String
categoriaId         String?
copoBaseId          String
custoTotal          Float                  // Calculado automaticamente
precoVendaAtual     Float?                 // Preço atual no cardápio (se existir)
ativo               Boolean                @default(true)
observacoes         String?
createdAt           DateTime               @default(now())
updatedAt           DateTime               @updatedAt

categoria           CategoriaCombinado?    @relation(fields: [categoriaId], references: [id])
copoBase            CopoBase               @relation(fields: [copoBaseId], references: [id])

// Complementos do combinado
complementos        ComplementoCombinado[]

// Itens do cardápio
itensCardapio       ItemCardapio[]

@@index([nome])
}

enum TipoComplemento {
INSUMO
RECEITA
}

model ComplementoCombinado {
id              String           @id @default(uuid())
combinadoId     String
tipo            TipoComplemento
insumoId        String?
receitaId       String?
quantidadeGramas Float           // Quantidade em gramas
custoCalculado  Float            // Custo deste complemento
createdAt       DateTime         @default(now())
updatedAt       DateTime         @updatedAt

combinado       Combinado        @relation(fields: [combinadoId], references: [id], onDelete: Cascade)
insumo          Insumo?          @relation(fields: [insumoId], references: [id])
receita         Receita?         @relation(fields: [receitaId], references: [id])

@@unique([combinadoId, tipo, insumoId, receitaId])
}

// ============================================
// CARDÁPIO
// ============================================

enum TipoItemCardapio {
COPO_BASE
INSUMO
RECEITA
COMBINADO
}

model ItemCardapio {
id                  String              @id @default(uuid())
categoriaCardapioId String
tipo                TipoItemCardapio

// Referências para os diferentes tipos
copoBaseId          String?
insumoId            String?
receitaId           String?
combinadoId         String?

// Código para integração com ERP/PDV
codigoSKU           String?             @unique

// Quantidades e preços
quantidadeGramas    Float?              // Para complementos (insumos/receitas)
custoCalculado      Float               // Custo bruto calculado
precoVendaSugerido  Float               // Custo + markup padrão
precoVendaAtual     Float?              // Preço praticado atualmente
novoPrecoVenda      Float?              // Novo preço definido

// Margens calculadas
margemAtualReais    Float?
margemAtualPercent  Float?
margemNovaReais     Float?
margemNovaPercent   Float?

// Alertas
alertaPrejuizo      Boolean             @default(false) // Preço < custo bruto
alertaMargemBaixa   Boolean             @default(false) // Preço < custo com desconto

ativo               Boolean             @default(true)
ordem               Int                 @default(0)
observacoes         String?
createdAt           DateTime            @default(now())
updatedAt           DateTime            @updatedAt

categoriaCardapio   CategoriaCardapio   @relation(fields: [categoriaCardapioId], references: [id])
copoBase            CopoBase?           @relation(fields: [copoBaseId], references: [id])
insumo              Insumo?             @relation(fields: [insumoId], references: [id])
receita             Receita?            @relation(fields: [receitaId], references: [id])
combinado           Combinado?          @relation(fields: [combinadoId], references: [id])

@@index([codigoSKU])
@@index([tipo])
}

// ============================================
// HISTÓRICO DE PREÇOS
// ============================================

enum TipoHistoricoPreco {
INSUMO
EMBALAGEM
}

model HistoricoPreco {
id                    String              @id @default(uuid())
tipo                  TipoHistoricoPreco
fornecedorId          String
insumoId              String?
embalagemId           String?

// Valores anteriores
precoBrutoAnterior    Float?
precoDescontoAnterior Float?
quantidadeAnterior    Float?

// Valores novos
precoBrutoNovo        Float
precoDescontoNovo     Float?
quantidadeNova        Float

motivoAlteracao       String?
dataAlteracao         DateTime            @default(now())
createdAt             DateTime            @default(now())

fornecedor            Fornecedor          @relation(fields: [fornecedorId], references: [id])
insumo                Insumo?             @relation(fields: [insumoId], references: [id])
embalagem             Embalagem?          @relation(fields: [embalagemId], references: [id])

@@index([fornecedorId, dataAlteracao])
@@index([insumoId, dataAlteracao])
@@index([embalagemId, dataAlteracao])
}

# Flowchart Marmaid

graph TD
    classDef page fill:#E6E6FA,stroke:#4C1D95,stroke-width:2px,color:#1F2937
    classDef modal fill:#F3F4F6,stroke:#6D28D9,stroke-width:1px,stroke-dasharray: 5 5,color:#1F2937
    classDef process fill:#D1FAE5,stroke:#10B981,stroke-width:1px,color:#1F2937
    classDef output fill:#FEF9C3,stroke:#F59E0B,stroke-width:1px,color:#1F2937
    classDef final_goal fill:#C7D2FE,stroke:#4C1D95,stroke-width:2px,color:#1F2937

    Start[Início da Jornada do Usuário] --> S0
    
    subgraph Setup[1. Setup Inicial]
        S0[Acessa a Página de Configurações] --> S1[Define Markup Padrão]
        S0 --> S2[Define Unidades de Medida Padrão]
        S0 --> S3[Gerencia Categorias para cada Módulo]
        S3 --> S3_1[CRUD Categorias de Fornecedores]
        S3 --> S3_2[CRUD Categorias de Insumos e Embalagens]
        S3 --> S3_3[CRUD Categorias de Receitas, Copos e Combinados]
    end
    
    S3 --> F1_Page

    subgraph Cadastro[2. Cadastro de Entidades Base]
        F1_Page[Acessa Página de Fornecedores] --> F1_Action{Ação: CRUD}
        F1_Action -->|Criar/Editar| F1_Modal[Modal: Cadastro de Fornecedor<br/>Nome, Contato, Categoria<br/>Prazo Entrega, Pedido Mín]
        F1_Modal --> F1_Save[Salva Fornecedor na Tabela]
        F1_Action -->|Visualizar| F1_View[Modal: Vê Histórico de Preços<br/>dos Insumos Vinculados]
        
        F1_Save --> I1_Page[Acessa Página de Insumos]
        I1_Page --> I1_Action{Ação: CRUD}
        I1_Action -->|Criar/Editar| I1_Modal[Modal: Cadastro de Insumo<br/>Nome, Categoria, Tipo Medida<br/>Fornecedor Principal e Alternativo<br/>Preços Bruto e com Desconto]
        I1_Modal --> I1_Calc[Sistema Calcula Custo/g ou Custo/un]
        I1_Calc --> I1_Save[Salva Insumo na Tabela com Custo Calculado]
        
        F1_Save --> E1_Page[Acessa Página de Embalagens]
        E1_Page --> E1_Action{Ação: CRUD}
        E1_Action -->|Criar/Editar| E1_Modal[Modal: Cadastro de Embalagem<br/>Nome, Categoria<br/>Fornecedor Principal e Alternativo<br/>Preços Bruto e com Desconto]
        E1_Modal --> E1_Calc[Sistema Calcula Custo por Unidade]
        E1_Calc --> E1_Save[Salva Embalagem na Tabela com Custo Calculado]
        
        I1_Modal -.->|Clica no + ao lado de Fornecedor| F1_Modal
        E1_Modal -.->|Clica no + ao lado de Fornecedor| F1_Modal
    end
    
    I1_Save --> R1_Page
    E1_Save --> CB1_Page

    subgraph Composicao[3. Composição de Produtos]
        R1_Page[Acessa Página de Receitas] --> R1_Action{Ação: CRUD}
        R1_Action -->|Criar/Editar| R1_Modal[Modal: Cadastro de Receita<br/>Nome, Categoria<br/>Tempo Preparo, Validade]
        R1_Modal --> R1_Comp{Adiciona Insumos<br/>e suas quantidades em g}
        R1_Comp --> R1_Rend[Informa Rendimento Total da Receita em g]
        R1_Rend --> R1_Calc[Sistema Soma Custos dos Insumos<br/>e Calcula o Custo final por grama]
        R1_Calc --> R1_Save[Salva Receita com Custo/g na Tabela]

        CB1_Page[Acessa Página de Copos Base] --> CB1_Action{Ação: CRUD}
        CB1_Action -->|Criar/Editar| CB1_Modal[Modal: Cadastro de Copo Base]
        CB1_Modal --> CB1_Comp_I{Adiciona Insumo Principal<br/>e sua quantidade em g}
        CB1_Comp_I --> CB1_Comp_E{Adiciona Embalagens associadas<br/>copo, tampa, talher}
        CB1_Comp_E --> CB1_Calc[Sistema Soma Custos Totais<br/>dos Insumos e Embalagens]
        CB1_Calc --> CB1_Save[Salva Copo Base com Custo Total na Tabela]

        CB1_Save --> C1_Page[Acessa Página de Combinados]
        R1_Save --> C1_Page
        C1_Page --> C1_Action{Ação: CRUD}
        C1_Action -->|Criar/Editar| C1_Modal[Modal: Cadastro de Combinado]
        C1_Modal --> C1_Comp_CB{Seleciona um Copo Base já cadastrado}
        C1_Comp_CB --> C1_Comp_Adc{Adiciona Complementos<br/>Insumos ou Receitas e suas quantidades}
        C1_Comp_Adc --> C1_Calc[Sistema Soma Custo do Copo Base<br/>com Custo dos Complementos]
        C1_Calc --> C1_PriceCheck{Verifica Preço de Venda<br/>do Cardápio Atual}
        C1_PriceCheck --> C1_Save[Salva Combinado com Custo Total<br/>e Preço Venda Atual se houver]
    end
    
    C1_Save --> M1_Page

    subgraph Cardapio[4. Gestão do Cardápio - Página Principal]
        M1_Page[Acessa a Página de Cardápio] --> M1_Cat[Gerencia Categorias do Cardápio]
        M1_Cat --> M2_Action{Adiciona Item ao Cardápio}
        M2_Action --> M2_ChooseType{Escolhe o tipo de item<br/>Copo Base<br/>Insumo<br/>Receita<br/>Combinado}
        M2_ChooseType --> M2_Select[Seleciona o item específico da lista]
        M2_Select --> M3_ItemAdded[Item é adicionado à Tabela do Cardápio]
        M3_ItemAdded --> M3_SKU[Adiciona Código SKU/ERP opcional]
        M3_SKU --> M4_Data[Sistema exibe:<br/>Custo Calculado Bruto<br/>Preço de Venda Sugerido]
        M4_Data --> M5_Input{Usuário insere:<br/>Meu Preço de Venda Atual<br/>Novo Preço de Venda}
        M5_Input --> M6_Analysis[Sistema calcula e exibe em tempo real:<br/>Margem Atual em R$ e %<br/>Margem Nova em R$ e %]
        M6_Analysis --> M7_Alerts{Sistema verifica preços e custos}
        M7_Alerts -->|Preço menor que Custo Bruto| M8_ShowAlert_Error[Exibe Alerta PREJUÍZO]
        M7_Alerts -->|Preço menor que Custo com Desconto| M8_ShowAlert_Warn[Exibe Alerta MARGEM BAIXA]
        M7_Alerts -->|Preço OK| M9_End[Análise de Preço Concluída]
        M8_ShowAlert_Error --> M9_End
        M8_ShowAlert_Warn --> M9_End
    end
    
    class S0,S1,S2,S3,S3_1,S3_2,S3_3 page
    class F1_Page,E1_Page,I1_Page page
    class R1_Page,CB1_Page,C1_Page page
    class F1_Modal,F1_View,E1_Modal,I1_Modal modal
    class R1_Modal,CB1_Modal,C1_Modal modal
    class E1_Calc,I1_Calc process
    class R1_Calc,CB1_Calc,C1_Calc,C1_PriceCheck process
    class M4_Data,M6_Analysis,M3_SKU process
    class F1_Save,E1_Save,I1_Save output
    class R1_Save,CB1_Save,C1_Save output
    class M8_ShowAlert_Error,M8_ShowAlert_Warn output
    class M1_Page,M1_Cat,M2_Action,M9_End final_goal
    class M2_ChooseType,M5_Input,M7_Alerts modal