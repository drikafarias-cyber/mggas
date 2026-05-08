# GasFlow — Next.js + Neon + Auth.js + Vercel

## 1. Instalar dependências
```bash
npm install
```

## 2. Configurar variáveis de ambiente
```bash
cp .env.local.example .env.local
```
Edite `.env.local` com:
- `DATABASE_URL` → sua connection string do Neon
- `AUTH_SECRET` → gere com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `NEXTAUTH_URL` → `http://localhost:3000` (em dev)

## 3. Rodar a migration (cria todas as tabelas)
```bash
node scripts/migrate.js
```

## 4. Criar seu usuário de acesso
```bash
# Edite o arquivo scripts/criar-usuario.js com seu email e senha
node scripts/criar-usuario.js
```

## 5. Rodar em desenvolvimento
```bash
npm run dev
# Abra http://localhost:3000
```

---

## Deploy no Vercel

1. Push para o GitHub
2. Importe no vercel.com
3. Adicione as variáveis de ambiente:
   - `DATABASE_URL` (connection string do Neon)
   - `AUTH_SECRET` (mesmo segredo gerado)
   - `NEXTAUTH_URL` (URL do seu app no Vercel, ex: `https://gasflow.vercel.app`)
4. Deploy!

---

## Integração Focus NF-e (opcional)

Quando quiser ativar emissão de NF:
1. Crie conta em focusnfe.com.br
2. Adicione `FOCUS_NFE_TOKEN=seu_token` nas variáveis do Vercel
3. Descomente o bloco TODO em `app/api/nf/route.ts`
