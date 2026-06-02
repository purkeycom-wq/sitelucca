/* ============================================================
   CLIENTES
   Para adicionar um cliente: copie um objeto abaixo.
   - name:  nome que aparece no card
   - logo:  caminho da imagem (coloque o arquivo em assets/clients/)
   - color: cor da marca (usada no selo enquanto não há imagem)
   Enquanto a imagem não existir, aparece um selo com a inicial.
   ============================================================ */

window.CLIENTS = [
  { name: "Mama Café",        logo: "assets/clients/mama-cafe.png",      color: "#e9a0b0" },
  { name: "Delícias da Mama", logo: "assets/clients/delicias-da-mama.png", color: "#1c1c1c" },
  { name: "Na Brasa Prime",   logo: "assets/clients/na-brasa-prime.png", color: "#e11b1b" },
  { name: "Frangal",          logo: "assets/clients/frangal.png",        color: "#f0a500" },
  { name: "Planeta Pizza",    logo: "assets/clients/planeta-pizza.png",  color: "#0f7a2e" },
  { name: "Êxito 1000",       logo: "assets/clients/exito-1000.png",     color: "#0b66c2" },
  { name: "Oral Faccia",      logo: "assets/clients/oral-faccia.png",    color: "#16a39a" },
  // { name: "Novo Cliente",  logo: "assets/clients/novo-cliente.png",   color: "#888888" },
];

(function renderClients() {
  var grid = document.getElementById("clientsGrid");
  if (!grid) return;

  window.CLIENTS.forEach(function (c) {
    var card = document.createElement("div");
    card.className = "client";

    var initial = (c.name || "?").trim().charAt(0).toUpperCase();

    // imagem (com fallback para selo se não carregar)
    var img = document.createElement("img");
    img.alt = c.name;
    img.loading = "lazy";
    img.src = c.logo;

    var fallback = document.createElement("div");
    fallback.className = "client__fallback";
    fallback.style.background = c.color || "#ff5a2c";
    fallback.textContent = initial;
    fallback.style.display = "none";

    img.onerror = function () {
      img.style.display = "none";
      fallback.style.display = "grid";
    };

    var name = document.createElement("span");
    name.className = "client__name";
    name.textContent = c.name;

    card.appendChild(img);
    card.appendChild(fallback);
    card.appendChild(name);
    grid.appendChild(card);
  });
})();
