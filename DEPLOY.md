# 🚀 Deploy e como continuar evoluindo o app

Este guia coloca o **Método Bispo Analytics** no ar e — o mais importante —
explica como você vai **continuar mudando o app sempre que quiser**, mesmo
depois de publicado.

---

## Parte 1 — Colocar no ar (uma vez só, ~20 min)

Você vai usar dois serviços gratuitos: **Neon** (banco de dados) e **Vercel**
(hospedagem). Ambos conectam direto ao seu GitHub.

### 1. Banco de dados (Neon)
1. Crie conta em https://neon.tech e um projeto novo.
2. Copie a **connection string** (algo como `postgresql://...neon.tech/...?sslmode=require`).

### 2. Hospedagem (Vercel)
1. Crie conta em https://vercel.com com o seu GitHub.
2. **Add New → Project** e selecione o repositório `sitelucca`.
3. Em **Environment Variables**, adicione:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | a string do Neon |
| `AUTH_SECRET` | rode `openssl rand -hex 32` e cole o resultado |
| `ADMIN_EMAIL` | seu e-mail de login |
| `ADMIN_PASSWORD` | uma senha forte |
| `ANTHROPIC_API_KEY` | (opcional) ativa a Bispo IA generativa |
| `WINDSOR_API_KEY` | (opcional) ativa dados ao vivo do Windsor |

4. Clique em **Deploy**. As tabelas são criadas automaticamente no build
   (`prisma migrate deploy`).

### 3. Popular os dados iniciais (uma vez)
No seu computador, com o `DATABASE_URL` do Neon no `.env`:
```bash
npm install
npm run db:seed     # cria seu usuário admin + clientes de exemplo
```
Pronto: acesse a URL da Vercel e faça login com o `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

---

## Parte 2 — Como mudar o app sempre que quiser (o ponto principal)

O app está ligado ao GitHub. **Toda mudança enviada ao GitHub vira deploy
automático na Vercel** — normalmente no ar em ~1 minuto. Você nunca mais precisa
"reinstalar" nada.

### Jeito 1 — me pedir (mais simples)
É só me dizer o que quer mudar ("muda a cor pra X", "adiciona um KPI de
frequência", "cria a tela de concorrentes"). Eu edito o código, valido e
faço o push. A Vercel publica sozinha. Você só atualiza a página.

> Fluxo: **você pede → eu altero e dou push → CI valida → Vercel publica.**

### Jeito 2 — Pull Requests com pré-visualização
Para mudanças maiores, eu abro um **Pull Request**. A Vercel cria uma
**URL de preview** (um link separado) só daquela mudança, para você ver antes
de ir pro ar. Aprovou? A gente faz o merge e vai pra produção.

### Jeito 3 — você mesmo (quando quiser)
- Mexer em **textos e cores** é seguro: cores ficam em `tailwind.config.ts`
  (`bispo.green`, `bispo.blue`...). Textos ficam nas páginas em `src/app/`.
- Editou um arquivo no próprio GitHub (botão ✏️) e salvou? Já dispara o deploy.

### Rede de segurança
- **CI** (GitHub Actions) roda `typecheck` + `build` em toda mudança. Se algo
  quebrar, ela avisa **antes** de publicar.
- Deu ruim em produção? A Vercel guarda todos os deploys — dá pra voltar pro
  anterior em 1 clique (**Instant Rollback**).

---

## Parte 3 — Operação contínua

- **Dados atualizados:** rode `npm run db:sync` (ou agende um cron) para puxar o
  Windsor e atualizar o banco. Próximo passo do roadmap: deixar isso 100%
  automático com um worker agendado.
- **Adicionar clientes/contas:** hoje pelo seed; a tela self-service de conexão
  do Windsor está no roadmap (`README.md`).
- **Backups:** o Neon tem backup automático; nada a fazer.

Qualquer dúvida, é só me chamar dizendo o que quer mudar. 🟢
