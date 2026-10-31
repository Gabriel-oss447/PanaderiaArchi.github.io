// ============================================================
// index.js → catálogo, filtros y canasta de la página principal
// ============================================================
const catalogo = document.getElementById("catalogo");          // getElementById: busca un elemento por su id
const listaCanasta = document.getElementById("lista-canasta");
let filtroActual = "todos";

// ---------- CATÁLOGO ----------
function pintarCatalogo() {
  // .filter() se queda solo con los panes que cumplen la condición (como tu frutas.filter)
  const panes = getPanes().filter((p) => filtroActual === "todos" || p.categoria === filtroActual);
  // .map() convierte cada pan en un bloque de HTML; .join("") junta todos en un solo texto
  // Las comillas invertidas `...` permiten escribir HTML en varias líneas y meter variables con ${...}
  catalogo.innerHTML = panes.map((p) => `
    <div class="tarjeta">
      ${imgPan(p)}
      <h5>${esc(p.nombre)}</h5>
      <p>${esc(p.ingredientes)}</p>
      <h6>Precio Unidad</h6>
      <h3>${soles(p.precio)}</h3>
      <button type="button" data-add="${p.id}">Añadir</button>
    </div>`).join("") || `<p class="vacio">Aún no hay productos en esta categoría.</p>`;
}

// ---------- CANASTA ----------
function pintarCanasta() {
  const canasta = getCanasta();
  const panes = getPanes();
  let total = 0, html = "";
  for (const id in canasta) {                                   // for...in recorre las "llaves" del objeto
    const pan = panes.find((p) => p.id == id);                  // .find() devuelve el primer pan con ese id
    if (!pan) continue;                                         // si el pan ya no existe, lo salta
    const sub = pan.precio * canasta[id];
    total += sub;
    html += `<li><span>${canasta[id]} × ${esc(pan.nombre)}</span><span>${soles(sub)}</span>
             <button class="quitar" data-quitar="${id}" title="Quitar">✕</button></li>`;
  }
  listaCanasta.innerHTML = html || `<li class="vacio">Tu canasta está lista para llenarse. Pulsa "Añadir" en cualquiera de nuestros productos.</li>`;
  document.getElementById("subtotal").textContent = soles(total);
  document.getElementById("total").textContent = soles(total);
}

// ---------- EVENTOS ----------
// "Delegación de eventos": en vez de poner un listener a cada botón (que se crean dinámicamente),
// escuchamos clics en el contenedor y vemos cuál botón fue con e.target.closest(...)
catalogo.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-add]");
  if (!boton) return;
  const canasta = getCanasta();
  const id = boton.dataset.add;                                 // dataset lee el atributo data-add="..."
  canasta[id] = (canasta[id] || 0) + 1;                         // si no existía, empieza en 0 y suma 1
  setCanasta(canasta);
  pintarCanasta();
});

listaCanasta.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-quitar]");
  if (!boton) return;
  const canasta = getCanasta();
  delete canasta[boton.dataset.quitar];                         // delete elimina una llave del objeto
  setCanasta(canasta);
  pintarCanasta();
});

document.querySelectorAll(".filtro").forEach((b) => {          // querySelectorAll: todos los elementos con esa clase
  b.addEventListener("click", () => {
    filtroActual = b.dataset.cat;
    document.querySelectorAll(".filtro").forEach((x) => x.classList.remove("activo"));
    b.classList.add("activo");                                  // classList.add/remove cambia clases CSS
    pintarCatalogo();
  });
});

document.getElementById("btn-vaciar").addEventListener("click", () => { setCanasta({}); pintarCanasta(); });
document.getElementById("btn-pedido").addEventListener("click", () => {
  if (Object.keys(getCanasta()).length === 0) { alert("Tu canasta está vacía. Añade algún pan primero."); return; }
  window.location.href = "pedido.html";                         // cambia de página; pedido.js leerá la canasta
});

pintarCatalogo();
pintarCanasta();
