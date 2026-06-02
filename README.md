# Site — Estúdio (marketing para restaurantes)

Site de uma página (landing) com:

- **Logo 3D animada** que gira no centro e, ao rolar a página, encolhe e vai
  para o canto direito — inspirado em [air.inc](https://air.inc).
- **Seção "Método"** em etapas numeradas — inspirado em
  [momple.com.br](https://www.momple.com.br).
- **Seção de Clientes** que mostra as logos das marcas atendidas.
- Seções de serviços, prova social (marquee) e CTA de WhatsApp.

## Como ver o site

É um site estático (HTML/CSS/JS). Basta abrir o `index.html` no navegador,
ou rodar um servidor local:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

> A logo 3D usa o Three.js carregado via CDN (precisa de internet no navegador).

## Como adicionar / trocar clientes

1. Coloque a imagem da logo em `assets/clients/` (PNG com fundo transparente
   fica melhor).
2. Abra `js/clients.js` e adicione/edite um item na lista `CLIENTS`:

```js
{ name: "Nome do Cliente", logo: "assets/clients/arquivo.png", color: "#ff5a2c" },
```

Enquanto a imagem não existir, o card mostra um selo colorido com a inicial do
nome (o `color`). É só soltar o arquivo certo que a logo aparece sozinha.

### Clientes já cadastrados (faltam os arquivos de imagem)

Coloque estes arquivos em `assets/clients/`:

| Cliente            | Arquivo esperado                 |
|--------------------|----------------------------------|
| Mama Café          | `mama-cafe.png`                  |
| Delícias da Mama   | `delicias-da-mama.png`           |
| Na Brasa Prime     | `na-brasa-prime.png`             |
| Frangal            | `frangal.png`                    |
| Planeta Pizza      | `planeta-pizza.png`              |

## Como personalizar a marca

- **Nome / textos:** edite direto no `index.html` (nome "Estúdio" no `<header>`
  e no `<footer>`, títulos das seções, etc.).
- **Cores:** no topo de `css/style.css` há variáveis (`--accent`, `--grad`...).
- **WhatsApp / Instagram:** troque os links na seção `#contato` do `index.html`
  (o número fica em `https://wa.me/5500000000000`).

## Estrutura

```
index.html          # estrutura da página
css/style.css       # estilo (tema escuro + acento quente)
js/main.js          # logo 3D (Three.js) + animações de scroll
js/clients.js       # lista de clientes (edite aqui p/ adicionar)
assets/clients/     # imagens das logos dos clientes
```
