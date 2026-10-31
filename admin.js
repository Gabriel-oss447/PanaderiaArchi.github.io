// ============================================================
// admin.js → panel: pedidos, catálogo, stock y alta de panes
// ============================================================

// Protección: si no inició sesión, lo mandamos al login
if (!sessionStorage.getItem("archi_sesion")) window.location.href = "ingreso.html";

const $ = (id) => document.getElementById(id);                   // atajo: $("x") = document.getElementById("x")

// ---------- 1. RESUMEN (pedidos, atendidos, ingresos) ----------
function pintarResumen() {
  const pedidos = getPedidos();
  const atendidos = pedidos.filter((p) => p.estado === "Atendido");
  $("n-pedidos").textContent = pedidos.length;
  $("n-atendidos").textContent = atendidos.length;
  // Los ingresos cuentan solo los pedidos ya atendidos (los pendientes aún no se cobran)
  $("n-ingresos").textContent = soles(atendidos.reduce((s, p) => s + p.total, 0));
}

// ---------- 2. TABLA DE PEDIDOS ----------
function pintarPedidos() {
  const pedidos = getPedidos();
  $("tabla-pedidos").innerHTML = pedidos.map((p) => `
    <tr>
      <td>${p.numero}</td>
      <td>${esc(p.cliente)}<small>${esc(p.telefono)} · ${esc(p.fecha)}</small></td>
      <td>${p.items.map((i) => `${i.cantidad} × ${esc(i.nombre)}`).join("<br>")}</td>
      <td>${p.envio === "domicilio" ? "A domicilio" : "Recojo en tienda"}<small>${esc(p.detalle)}</small></td>
      <td>${soles(p.total)}</td>
      <td><span class="estado ${p.estado.toLowerCase()}">${p.estado}</span>
          ${p.estado === "Pendiente" ? `<br><button type="button" data-atender="${p.numero}">Marcar atendido</button>` : ""}</td>
    </tr>`).reverse().join("")                                    // .reverse(): el pedido más nuevo arriba
    || `<tr><td colspan="6" class="vacio">Todavía no hay pedidos.</td></tr>`;
}

// Al atender un pedido: descuenta del stock cada pan pedido
$("tabla-pedidos").addEventListener("click", (e) => {
  const boton = e.target.closest("[data-atender]");
  if (!boton) return;
  const pedidos = getPedidos();
  const panes = getPanes();
  const pedido = pedidos.find((p) => p.numero == boton.dataset.atender);

  // Revisamos primero que alcance el stock de todos los panes del pedido
  const faltan = pedido.items.filter((i) => {
    const pan = panes.find((p) => p.id === i.id);
    return !pan || pan.stock < i.cantidad;
  });
  if (faltan.length) { alert("Stock insuficiente de: " + faltan.map((f) => f.nombre).join(", ") + ". Añade stock primero."); return; }

  pedido.items.forEach((i) => { panes.find((p) => p.id === i.id).stock -= i.cantidad; });   // -= resta y guarda
  pedido.estado = "Atendido";
  setPanes(panes);
  setPedidos(pedidos);
  pintarTodo();
});

// ---------- 3. CATÁLOGO ----------
function pintarCatalogo() {
  $("tabla-catalogo").innerHTML = getPanes().map((p) =>
    `<tr><td><b>${esc(p.nombre)}</b></td><td>${esc(p.ingredientes)}</td><td>${soles(p.precio)}</td></tr>`).join("");
}

// ---------- 4. STOCK ----------
function pintarStock() {
  const panes = getPanes();
  $("tabla-stock").innerHTML = panes.map((p) =>
    `<tr><td>${esc(p.nombre)}</td><td class="${p.stock < 5 ? "bajo" : ""}">${p.stock}${p.stock < 5 ? " · stock bajo" : ""}</td></tr>`).join("");
  // Llena el <select> del formulario con los panes; conserva el pan elegido si ya había uno
  const elegido = $("stock-pan").value;
  $("stock-pan").innerHTML = panes.map((p) => `<option value="${p.id}">${esc(p.nombre)}</option>`).join("");
  if (elegido) $("stock-pan").value = elegido;
}

$("form-stock").addEventListener("submit", (e) => {
  e.preventDefault();
  const panes = getPanes();
  const pan = panes.find((p) => p.id == $("stock-pan").value);
  pan.stock += parseInt($("stock-cant").value);                   // += suma la cantidad al stock
  setPanes(panes);
  $("form-stock").reset();
  pintarTodo();
});

// ---------- 5. AÑADIR PAN AL CATÁLOGO (aparece en el index) ----------
$("form-pan").addEventListener("submit", (e) => {
  e.preventDefault();
  const panes = getPanes();
  panes.push({
    id: Math.max(0, ...panes.map((p) => p.id)) + 1,               // id nuevo = el mayor + 1
    nombre: $("p-nombre").value.trim(),
    ingredientes: $("p-ingredientes").value.trim(),
    precio: parseFloat($("p-precio").value),                      // parseFloat conserva decimales (18.50)
    categoria: $("p-categoria").value,
    imagen: $("p-imagen").value.trim(),                           // se busca en assets/panes/<imagen>
    stock: parseInt($("p-stock").value)
  });
  setPanes(panes);
  e.target.reset();
  $("p-stock").value = 10;
  pintarTodo();
  alert("¡Pan añadido! Ya aparece en el catálogo de la página principal.");
});

// ---------- Salir y refrescar ----------
$("btn-salir").addEventListener("click", () => {
  sessionStorage.removeItem("archi_sesion");
  window.location.href = "ingreso.html";
});

function pintarTodo() { pintarResumen(); pintarPedidos(); pintarCatalogo(); pintarStock(); }
// El evento "storage" avisa cuando OTRA pestaña cambia el localStorage: así los pedidos nuevos
// aparecen solos si tienes el panel abierto mientras un cliente pide en otra pestaña.
window.addEventListener("storage", pintarTodo);
pintarTodo();
