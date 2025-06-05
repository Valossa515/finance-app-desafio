
# Sistema de Gestão de Investimentos

Este é um sistema fullstack containerizado com Docker, composto por:

- **Frontend**: Aplicação Next.js para gerenciamento de clientes e ativos.
- **Backend**: API Node.js (Fastify + Prisma) conectada ao MySQL.
- **Banco de Dados**: MySQL 8.

## 🐳 Iniciando com Docker Compose

Clone o repositório e execute:

```bash
docker compose up --build
```

Isso irá:

- Criar um container MySQL com volume persistente.
- Executar o backend com deploy automático de migrações Prisma.
- Subir o frontend em modo desenvolvimento.

## 📁 Estrutura dos serviços

### `db`

- Imagem: `mysql:8.0`
- Porta: `3306`
- Volume: `mysql_data:/var/lib/mysql`
- Healthcheck configurado para garantir que o backend só suba após o banco estar pronto.

### `backend`

- Build via Dockerfile localizado em `./backend`
- Porta: `3001`
- Variáveis de ambiente:
  - `DATABASE_URL`: conexão com o banco via Prisma.
  - `PORT`: porta de exposição da API.
- Comando de inicialização: aplica migrações (`npx prisma migrate deploy`) e inicia o servidor (`npm run start`).

### `frontend`

- Build via Dockerfile localizado em `./frontend`
- Porta: `3000`
- Volumes locais para hot reload.

## 🔧 Dockerfile do Backend

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json prisma/schema.prisma ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
```

## 🔧 Dockerfile do Frontend

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "dev"]
```

## 🔌 Rotas da API (Fastify)

### Clientes

- `GET /clients`: lista todos os clientes e seus ativos.
- `POST /clients`: cria um novo cliente.
- `GET /clients/:id`: busca um cliente por ID.
- `PUT /clients/:id`: atualiza um cliente.
- `DELETE /clients/:id`: remove um cliente.

### Ativos

- `GET /assets`: retorna lista mockada de ativos.
- `POST /assets`: vincula ativo a um cliente.

## 🧪 Validações com Zod

O backend utiliza `zod` para validar os seguintes campos:

- Cliente:
  - `name`: mínimo de 2 caracteres
  - `email`: válido
  - `status`: booleano
- Ativo:
  - `name`: string
  - `value`: número
  - `clientId`: número

## ⚙️ Tecnologias

- Frontend: Next.js + React Query + React Hook Form + Zod + Tailwind + ShadCN UI
- Backend: Node.js + Fastify + Prisma ORM
- Banco de dados: MySQL
- Containerização: Docker + Docker Compose

---

> Desenvolvido para gerenciamento de clientes e seus ativos financeiros em um ambiente moderno e escalável.
