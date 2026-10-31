// ============================================================
// datos.js → "cerebro compartido" de las 4 páginas.
// Cada HTML lo carga PRIMERO para usar las mismas funciones.
// ============================================================

// Empleado de prueba. (En una web real esto va en un servidor, nunca en el navegador.)
const EMPLEADO = { correo: "empleado@archipanaderia.com", clave: "archi2026" };

// Panes que existen la primera vez que abres la web.
// imagen   = nombre del archivo dentro de assets/panes/
// respaldo = foto de internet que se usa mientras no pongas tu imagen en la carpeta
const PANES_INICIALES = [
  { id: 1, nombre: "Hogaza Campesina", categoria: "rustica", precio: 18, stock: 20,
    ingredientes: "Harina de trigo blanco andino molido a piedra, centeno integral orgánico y sal.",
    imagen: "imagenPan1.jpg", respaldo: "https://i.pinimg.com/originals/55/df/05/55df053a9e51201efe88fac543fd7fbe.jpg" },
  { id: 2, nombre: "Croissant de Mantequilla", categoria: "pasteles", precio: 8, stock: 20,
    ingredientes: "Mantequilla de pastura artesanal, laminado en frío, interior alveolado tipo panal de abeja.",
    imagen: "imagenPan2.jpg", respaldo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFsD0xOPqM_qaJFAqrVrUAUOxqeTYlq6z8jg0ACvXkEQbiMcgKTikrCHc&s=10" },
  { id: 3, nombre: "Torta tres Leches", categoria: "pasteles", precio: 50, stock: 10,
    ingredientes: "Harina fina, manjar dulce remojado en leche, cubierta de chantilly y fresa.",
    imagen: "imagenPan3.jpg", respaldo: "https://2.bp.blogspot.com/-WjEefGaNrYo/UZMjEY2WiVI/AAAAAAAAAvA/3TpUKq3gJVk/s1600/Tres+Leches+SyS3.jpg" }
];

// ---------- localStorage ----------
// localStorage es un "cajoncito" del navegador donde se guardan datos aunque cierres la página.
// Solo guarda TEXTO, por eso usamos:
//   JSON.stringify(objeto) → convierte un objeto/array en texto
//   JSON.parse(texto)      → convierte ese texto otra vez en objeto/array
function leer(clave, porDefecto) {
  const texto = localStorage.getItem(clave);
  return texto ? JSON.parse(texto) : porDefecto;
}
function guardar(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

// Funciones cortas para cada "cajón" (las usan todas las páginas)
function getPanes() {
  let panes = leer("archi_panes", null);
  if (!panes) { panes = PANES_INICIALES; guardar("archi_panes", panes); } // primera vez
  return panes;
}
const setPanes = (p) => guardar("archi_panes", p);
const getPedidos = () => leer("archi_pedidos", []);
const setPedidos = (p) => guardar("archi_pedidos", p);
const getCanasta = () => leer("archi_canasta", {});   // formato: { idPan: cantidad }
const setCanasta = (c) => guardar("archi_canasta", c);

// ---------- Ayudas de texto ----------
// Función flecha (como la que ya viste): recibe un número y devuelve "S/. 18.00"
const soles = (n) => "S/. " + Number(n).toFixed(2);

// Evita que un texto escrito por el usuario "rompa" el HTML (por ejemplo si escribe < o >)
const esc = (t) => String(t).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Dibujo de pan que sale cuando no se encuentra ninguna imagen
const IMG_VACIA = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='100%' height='100%' fill='%23efdcb8'/><text x='50%' y='62%' font-size='70' text-anchor='middle'>🥖</text></svg>";

// Devuelve la etiqueta <img> de un pan. Busca en assets/panes/<imagen>.
// onerror = "si la imagen no existe, usa el respaldo, y si tampoco, el dibujo vacío"
function imgPan(p) {
  return `<img src="assets/panes/${esc(p.imagen)}" alt="${esc(p.nombre)}" data-r="${esc(p.respaldo || "")}"
          onerror="this.onerror=null;this.src=this.dataset.r||IMG_VACIA">`;
}
