# Bahia Brindes — Frontend

Este é o frontend do Bahia Brindes, um sistema feito para facilitar o dia a dia de pequenas empresas que trabalham com brindes e presentes personalizados. A ideia é simples: juntar catálogo, orçamentos, estoque, vendas e administração em um único lugar — sem planilhas, sem retrabalho.

## Quem usa e o que vê?

O sistema tem duas "caras" diferentes, dependendo de quem está acessando:

### Para o cliente

O cliente chega pela vitrine, navega pelos produtos, monta um carrinho e solicita um orçamento. Depois disso, ele pode:

- Acompanhar o andamento dos seus pedidos (arte pendente, em produção, concluído...)
- Ver o histórico e os detalhes de cada orçamento
- Editar seu perfil e dados de contato

Tudo de forma direta, sem precisar ligar ou mandar mensagem.

### Para a equipe interna

Funcionários e administradores acessam o portal interno, com menu lateral e módulos separados:

- **Estoque** — controle de matérias-primas, movimentações de entrada/saída, fornecedores, categorias e locais de armazenamento.
- **Produtos** — cadastro completo com ficha técnica, imagens, preço de custo e venda.
- **Vendas e Clientes** — gestão de clientes, orçamentos, acompanhamento de status.
- **Admin** — criação de funcionários e controle de permissões (apenas para administradores).

### Controle de acesso

| Perfil | Onde acessa |
|--------|------------|
| **Visitante** | Vitrine de produtos, detalhes, carrinho |
| **Cliente** | Meus orçamentos, meu perfil |
| **Funcionário** | Portal interno completo |
| **Admin** | Tudo + painel administrativo |

Rotas não autorizadas redirecionam automaticamente para o login.

---

## 🔧 Detalhes técnicos

### Stack

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| React | 19 | Biblioteca de UI |
| TypeScript | 5.9 | Tipagem estática |
| Vite | 7 | Build e dev server |
| Chakra UI | v3 | Componentes de interface |
| Tailwind CSS | v4 | Utilitários de estilo |
| React Router | v7 | Roteamento SPA |
| Framer Motion | 12 | Animações |

### Estrutura do projeto

```
src/
├── config/          # URL da API, endpoints centralizados, definição dos módulos do menu
├── context/         # AuthContext (login, token, usuário), CartContext (carrinho)
├── services/        # Chamadas HTTP organizadas por domínio
│   ├── authService.ts
│   ├── clienteService.ts
│   ├── estoqueService.ts
│   ├── orcamentoService.ts
│   ├── produtoService.ts
│   └── http.ts         # Helpers: authHeaders, parseError, getJsonOrThrow
├── components/      # Header, breadcrumbs, rota protegida, ícones, cards
├── pages/           # 20+ páginas organizadas por funcionalidade
│   ├── Login.tsx / Register.tsx          # Autenticação
│   ├── Home.tsx / ProdutoDetalhe.tsx     # Vitrine pública
│   ├── CarrinhoPage.tsx                  # Carrinho
│   ├── MeusOrcamentos.tsx               # Área do cliente
│   ├── OrcamentoDetalhe.tsx             # Detalhes do pedido
│   ├── VendasClientes.tsx               # Gestão de vendas (portal)
│   ├── Estoque.tsx                       # Gestão de estoque (portal)
│   └── Admin.tsx                         # Painel admin
├── types/           # Tipagens TypeScript
└── assets/          # Imagens e ícones
```

### Comunicação com o backend

As chamadas são feitas com **fetch nativo** (sem Axios). O token JWT fica no `localStorage` e é injetado automaticamente no header `Authorization: Bearer <token>`.

A URL base da API vem da variável de ambiente `VITE_API_BASE_URL`. Todos os endpoints ficam centralizados em `config/api.ts`, assim não tem URL espalhada pelo código.

### Como rodar localmente

**Pré-requisitos:** Node.js 18+.

1. Copie o `.env.example` para `.env` e ajuste a URL do backend:

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:8080
```

2. Instale as dependências e inicie:

```bash
npm install
npm run dev
```

O app sobe em `http://localhost:5173`.

### Build de produção

```bash
npm run build
```

Os arquivos ficam na pasta `dist/`, prontos para deploy em Vercel, Render ou qualquer servidor de arquivos estáticos.

---

Desenvolvido como projeto da disciplina de Projetão — UFAPE, 7º período.
