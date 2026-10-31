// ============================================================
// ingreso.js → valida el correo y la contraseña del empleado
// ============================================================
document.getElementById("form-login").addEventListener("submit", (e) => {
  e.preventDefault();
  const correo = document.getElementById("correo").value.trim().toLowerCase();
  const clave = document.getElementById("clave").value;

  if (correo === EMPLEADO.correo && clave === EMPLEADO.clave) {   // === compara valor Y tipo (como en tu ejemplo)
    // sessionStorage es como localStorage pero se borra al cerrar la pestaña: ideal para "sesión iniciada"
    sessionStorage.setItem("archi_sesion", correo);
    window.location.href = "admin.html";
  } else {
    document.getElementById("error").hidden = false;
  }
});
