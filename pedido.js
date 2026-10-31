// ============================================================
// pedido.js → formulario de pedido: calcula total, muestra/oculta
// la dirección y guarda el pedido para que lo vea el admin
// ============================================================
const form = document.getElementById("form-pedido");
const listaPanes = document.getElementById("lista-panes");
const resumen = document.getElementById("resumen");
const totalTxt = document.getElementById("total-pedido");
const bDom = document.getElementById("bloque-domicilio");
const bTie = document.getElementById("bloque-tienda");
const campoOtra = document.getElementById("campo-otra");
const dir = document.getElementById("direccion");
const sede = document.getElementById("sede");
const otra = document.getElementById("otra");

// ---------- Lista de panes (con lo que ya había en la canasta del index) ----------
function pintarPanes() {
  const canasta = getCanasta();
  listaPanes.innerHTML = getPanes().map((p) => `
    <div class="fila-pan">
      ${imgPan(p)}
      <div><h5>${esc(p.nombre)}</h5><small>${soles(p.precio)} · Disponibles: ${p.stock}</small></div>
      <input type="number" min="0" max="${p.stock}" value="${Math.min(canasta[p.id] || 0, p.stock)}"
             data-id="${p.id}" aria-label="Cantidad de ${esc(p.nombre)}">
    </div>`).join("");
  calcular();
}

// Lee los inputs y devuelve solo los panes con cantidad mayor a 0
function leerItems() {
  const panes = getPanes();
  const items = [];
  listaPanes.querySelectorAll("input").forEach((inp) => {
    const cantidad = parseInt(inp.value) || 0;                  // parseInt convierte "3" en 3 (si está vacío → 0)
    if (cantidad > 0) {
      const pan = panes.find((p) => p.id == inp.dataset.id);
      items.push({ id: pan.id, nombre: pan.nombre, precio: pan.precio, cantidad });
    }
  });
  return items;
}

function calcular() {
  const items = leerItems();
  resumen.innerHTML = items.map((i) =>
    `<li><span>${i.cantidad} × ${esc(i.nombre)}</span><span>${soles(i.precio * i.cantidad)}</span></li>`
  ).join("") || `<li class="vacio">Aún no eliges panes</li>`;
  // .reduce() va sumando: empieza en 0 y a cada paso añade precio × cantidad
  const total = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0);
  totalTxt.textContent = soles(total);
  return total;
}
listaPanes.addEventListener("input", calcular);                 // "input" se dispara cada vez que cambias el número

// ---------- Mostrar dirección SOLO según el tipo de envío ----------
function mostrarEnvio() {
  const tipo = form.envio.value;                                // form.envio = grupo de radios; .value = el marcado
  bDom.hidden = tipo !== "domicilio";                           // hidden = true oculta el bloque
  bTie.hidden = tipo !== "tienda";
  // "required" solo cuando el campo es visible; si no, el navegador bloquearía el envío por un campo oculto
  dir.required = tipo === "domicilio";
  const usaOtra = tipo === "tienda" && sede.value === "otra";
  campoOtra.hidden = !usaOtra;
  otra.required = usaOtra;
}
form.addEventListener("change", mostrarEnvio);                  // "change" = cambió un radio o un select

// ---------- Enviar pedido ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();                                           // evita que la página se recargue sola
  const items = leerItems();
  if (items.length === 0) { alert("Elige al menos un pan (cantidad mayor a 0)."); return; }

  const tipo = form.envio.value;
  let detalle;
  if (tipo === "domicilio") detalle = dir.value.trim() + " · " + document.getElementById("ventana").value;
  else detalle = sede.value === "otra" ? otra.value.trim() : sede.value;

  const pedidos = getPedidos();
  // Número automático: el mayor número existente + 1. (...array "abre" el array para Math.max)
  const numero = pedidos.length ? Math.max(...pedidos.map((p) => p.numero)) + 1 : 1;

  pedidos.push({
    numero,
    cliente: form.nombre.value.trim(),
    telefono: form.telefono.value,
    envio: tipo,                                                // "domicilio" o "tienda"
    detalle,
    items,                                                      // [{nombre, cantidad, precio}, ...]
    total: calcular(),
    estado: "Pendiente",                                        // el admin lo cambia a "Atendido"
    fecha: new Date().toLocaleString("es-PE")
  });
  setPedidos(pedidos);
  setCanasta({});                                               // vaciamos la canasta del index

  form.reset();
  pintarPanes();
  mostrarEnvio();
  const conf = document.getElementById("confirmacion");
  conf.hidden = false;
  conf.innerHTML = `<h1>¡Pedido N° ${numero} registrado!</h1><p>Gracias, ya estamos preparando tus panes.</p>`;
  conf.scrollIntoView({ behavior: "smooth" });                  // baja suavemente hasta el mensaje
});

pintarPanes();
mostrarEnvio();
