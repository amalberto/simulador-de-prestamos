// Array para almacenar las solicitudes
let solicitudes = [];

// Cargar solicitudes guardadas en el localstorage
if (localStorage.getItem('solicitudes')) {
    solicitudes = JSON.parse(localStorage.getItem('solicitudes'));
    renderizarSolicitudes();
}

// Función para calcular el interés
function calcularInteres(monto, tasa) {
    return (monto * tasa) / 100;
}

// Función para calcular la cuota
function calcularCuota(monto, interes, cuotas) {
    return (monto + interes) / cuotas;
}

// Función para registrar una nueva solicitud
function registrarSolicitud(nombre, monto, cuotas, tasa) {
    const interes = calcularInteres(monto, tasa);
    const cuota = calcularCuota(monto, interes, cuotas);
    const total = monto + interes;

    const nuevaSolicitud = {
        nombre,
        monto,
        interes,
        total,
        cuotas,
        cuota,
        tasa
    };

    solicitudes.push(nuevaSolicitud);
    guardarSolicitudes();
    renderizarSolicitudes();
}

// Guardar solicitudes en localStorage
function guardarSolicitudes() {
    localStorage.setItem('solicitudes', JSON.stringify(solicitudes));
}

// Función para renderizar todas las solicitudes
function renderizarSolicitudes() {
    const contenedor = document.getElementById('solicitudesContainer');
    let html = '';

    for (let i = 0; i < solicitudes.length; i++) {
        const s = solicitudes[i];
        html += `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5>${s.nombre}</h5>
                        <p>Monto solicitado: $${s.monto}</p>
                        <p>Interés (${s.tasa}%): $${s.interes}</p>
                        <p>Total a pagar: $${s.total}</p>
                        <p>Cuotas: ${s.cuotas} cuotas de $${s.cuota.toFixed(2)}</p>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="eliminarSolicitud(${i})">Eliminar</button>
                </div>
            </div>
        `;
    }

    contenedor.innerHTML = html;
}

// Función para eliminar una solicitud individual
function eliminarSolicitud(indice) {
    solicitudes.splice(indice, 1);
    guardarSolicitudes();
    renderizarSolicitudes();
    document.getElementById('totalSolicitudes').innerHTML = '';
}

// Función para mostrar mensajes
function mostrarMensaje(tipo, texto) {
    return `<div class="alert alert-${tipo} text-center" role="alert">${texto}</div>`;
}

// Función que maneja el registro de la solicitud
function manejarRegistro() {
    const nombre = document.getElementById('nombre').value.trim();
    const monto = parseFloat(document.getElementById('monto').value);
    const cuotas = parseInt(document.getElementById('cuotas').value);
    const tasa = parseFloat(document.getElementById('tasa').value);

    const mensajeFiltro = document.getElementById('mensajeFiltro');
    mensajeFiltro.classList.add('d-none');

    if (validarFormulario(nombre, monto, cuotas, tasa)) {
        registrarSolicitud(nombre, monto, cuotas, tasa);
        document.getElementById('formSolicitud').reset();

        const mensajeExito = document.getElementById('mensajeExito');
        const mensajeError = document.getElementById('mensajeError');

        mensajeExito.innerHTML = 'Tu solicitud fue registrada correctamente';
        mensajeExito.classList.remove('d-none');

        mensajeError.classList.add('d-none');
        mensajeError.innerHTML = '';
    } else {
        const mensajeExito = document.getElementById('mensajeExito');
        const mensajeError = document.getElementById('mensajeError');

        mensajeError.innerHTML = 'Completá correctamente todos los campos del formulario.';
        mensajeError.classList.remove('d-none');

        mensajeExito.classList.add('d-none');
        mensajeExito.innerHTML = '';
    }

}

// Validar datos del formulario
function validarFormulario(nombre, monto, cuotas, tasa) {
    return (
        nombre !== '' &&
        !isNaN(monto) && monto > 0 &&
        !isNaN(cuotas) && [3, 6, 9, 12].includes(cuotas) &&
        !isNaN(tasa) && tasa >= 0
    );
}

// Calcular y mostrar el total solicitado
function calcularTotalSolicitudes() {
    const contenedor = document.getElementById('solicitudesContainer');
    const mensajeFiltro = document.getElementById('mensajeFiltro');

    mensajeFiltro.classList.add('d-none');

    if (solicitudes.length === 0) {
        contenedor.innerHTML = mostrarMensaje('warning', 'No se encontró ninguna solicitud registrada.');
        document.getElementById('totalSolicitudes').innerHTML = '';
    } else {
        const total = solicitudes.reduce((acc, solicitud) => acc + solicitud.monto, 0);
        mostrarTotalSolicitudes(total);
    }
}

// Mostrar total solicitado
function mostrarTotalSolicitudes(total) {
    const contenedor = document.getElementById('totalSolicitudes');
    contenedor.innerHTML = `<div class="text-success text-center fw-bold">Total de dinero solicitado: $${total}</div>`;
}

// Manejar el botón "Calcular Total Solicitado"
function manejarCalculoTotal() {
    manejarMostrarTodas();
    calcularTotalSolicitudes();
}

// Filtrar por cuotas
function manejarFiltro() {
    const cuotasSeleccionadas = parseInt(document.getElementById('filtroCuotas').value);
    const mensajeFiltro = document.getElementById('mensajeFiltro');

    if (!isNaN(cuotasSeleccionadas)) {
        const filtradas = [];

        for (const solicitud of solicitudes) {
            if (solicitud.cuotas === cuotasSeleccionadas) {
                filtradas.push(solicitud);
            }
        }

        if (filtradas.length === 0) {
            mensajeFiltro.innerHTML = mostrarMensaje('warning', `No se encontraron solicitudes en ${cuotasSeleccionadas} cuotas.`);
        } else {
            mensajeFiltro.innerHTML = mostrarMensaje('info', `Mostrando solicitudes en ${cuotasSeleccionadas} cuotas.`);
            renderizarSolicitudesFiltradas(filtradas);
        }

        mensajeFiltro.classList.remove('d-none');
    }
}

// Mostrar todas las solicitudes
function manejarMostrarTodas() {
    const mensajeFiltro = document.getElementById('mensajeFiltro');
    mensajeFiltro.classList.add('d-none');

    if (solicitudes.length === 0) {
        document.getElementById('solicitudesContainer').innerHTML = mostrarMensaje('warning', 'No se encontraron solicitudes registradas.');
    } else {
        renderizarSolicitudes();
    }
}

// Renderizar solicitudes filtradas
function renderizarSolicitudesFiltradas(arraySolicitudes) {
    const contenedor = document.getElementById('solicitudesContainer');
    let html = '';

    for (let i = 0; i < arraySolicitudes.length; i++) {
        const s = arraySolicitudes[i];
        html += `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5>${s.nombre}</h5>
                        <p>Monto solicitado: $${s.monto}</p>
                        <p>Interés (${s.tasa}%): $${s.interes}</p>
                        <p>Total a pagar: $${s.total}</p>
                        <p>Cuotas: ${s.cuotas} cuotas de $${s.cuota.toFixed(2)}</p>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="eliminarSolicitud(${i})">Eliminar</button>
                </div>
            </div>
        `;
    }

    contenedor.innerHTML = html;
}

// Eventos principales
document.getElementById('btnRegistrar').addEventListener('click', manejarRegistro);
document.getElementById('btnTotalSolicitudes').addEventListener('click', manejarCalculoTotal);
document.getElementById('btnFiltrarCuotas').addEventListener('click', manejarFiltro);
document.getElementById('btnMostrarTodas').addEventListener('click', manejarMostrarTodas);
