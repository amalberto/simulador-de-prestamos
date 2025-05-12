let solicitudes = [];
let indiceEnEdicion = null;

// Cargar solicitudes desde localStorage si existen
if (localStorage.getItem('solicitudes')) {
    solicitudes = JSON.parse(localStorage.getItem('solicitudes'));
    renderizarSolicitudes();
}

// Calcula el interés total
function calcularInteres(monto, tasa) {
    return (monto * tasa) / 100;
}

// Calcula el valor de cada cuota
function calcularCuota(monto, interes, cuotas) {
    return (monto + interes) / cuotas;
}

// Registra una nueva solicitud o actualiza una existente
function registrarSolicitud(nombre, monto, cuotas, tasa) {
    const interes = calcularInteres(monto, tasa);
    const cuota = calcularCuota(monto, interes, cuotas);
    const total = monto + interes;

    const solicitud = { nombre, monto, interes, total, cuotas, cuota, tasa };

    if (indiceEnEdicion !== null) {
        solicitudes[indiceEnEdicion] = solicitud;
        indiceEnEdicion = null;
        mostrarToast('Solicitud actualizada correctamente.');
    } else {
        solicitudes.push(solicitud);
        mostrarToast('Solicitud registrada correctamente.');
    }

    guardarSolicitudes();
    renderizarSolicitudes();
}

// Guarda las solicitudes en localStorage
function guardarSolicitudes() {
    localStorage.setItem('solicitudes', JSON.stringify(solicitudes));
}

// Renderiza todas las solicitudes, mostrando inputs si se está editando una
function renderizarSolicitudes() {
    const contenedor = document.getElementById('solicitudesContainer');
    let html = '';

    for (let i = 0; i < solicitudes.length; i++) {
        const s = solicitudes[i];

        if (indiceEnEdicion === i) {
            // Renderizado en modo edición
            html += `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-start flex-wrap">
                        <div class="w-100">
                            <label class="form-label mt-2">Nombre del Cliente</label>
                            <input class="form-control mb-2" id="editNombre" value="${s.nombre}">
                            <label class="form-label">Monto Solicitado ($)</label>
                            <input type="number" class="form-control mb-2" id="editMonto" value="${s.monto}">
                            <label class="form-label">Tasa de Interés (%)</label>
                            <input type="number" class="form-control mb-2" id="editTasa" value="${s.tasa}">
                            <label class="form-label">Cantidad de Cuotas</label>
                            <select id="editCuotas" class="form-select mb-2">
                                <option ${s.cuotas === 3 ? 'selected' : ''}>3</option>
                                <option ${s.cuotas === 6 ? 'selected' : ''}>6</option>
                                <option ${s.cuotas === 9 ? 'selected' : ''}>9</option>
                                <option ${s.cuotas === 12 ? 'selected' : ''}>12</option>
                            </select>
                        </div>
                        <button class="btn btn-success w-100" onclick="actualizarSolicitud(${i})">Actualizar</button>
                    </div>
                </div>
            `;
        } else {
            // Renderizado normal
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
                        <div class="btn-group">
                            <button class="btn btn-sm btn-warning" onclick="editarSolicitud(${i})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="confirmarEliminarIndividual(${i})">Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    contenedor.innerHTML = html;

    // Desactiva botón "Eliminar todas" mientras se edita una solicitud
    document.getElementById('btnEliminarTodas').disabled = indiceEnEdicion !== null || solicitudes.length === 0;

}

// Muestra un toast de confirmación con Bootstrap
function mostrarToast(mensaje) {
    const toastBody = document.getElementById('toastBody');
    toastBody.innerText = mensaje;
    const toast = new bootstrap.Toast(document.getElementById('liveToast'));
    toast.show();
}

// Maneja el registro desde el formulario principal
function manejarRegistro() {
    const nombre = document.getElementById('nombre').value.trim();
    const monto = parseFloat(document.getElementById('monto').value);
    const cuotas = parseInt(document.getElementById('cuotas').value);
    const tasa = parseFloat(document.getElementById('tasa').value);

    const mensajeFiltro = document.getElementById('mensajeFiltro');
    const mensajeError = document.getElementById('mensajeError');

    mensajeFiltro.classList.add('d-none');

    if (validarFormulario(nombre, monto, cuotas, tasa)) {
        registrarSolicitud(nombre, monto, cuotas, tasa);
        document.getElementById('formSolicitud').reset();
        mensajeError.classList.add('d-none');
        mensajeError.innerHTML = '';
    } else {
        mensajeError.innerHTML = 'Completá correctamente todos los campos del formulario.';
        mensajeError.classList.remove('d-none');
    }
}

// Valida el formulario
function validarFormulario(nombre, monto, cuotas, tasa) {
    return (
        nombre !== '' &&
        !isNaN(monto) && monto > 0 &&
        !isNaN(cuotas) && [3, 6, 9, 12].includes(cuotas) &&
        !isNaN(tasa) && tasa >= 0
    );
}

// Calcula el total de dinero solicitado y lo muestra
function calcularTotalSolicitudes() {
    const contenedor = document.getElementById('solicitudesContainer');
    const mensajeFiltro = document.getElementById('mensajeFiltro');

    mensajeFiltro.classList.add('d-none');

    if (solicitudes.length === 0) {
        if (solicitudes.length === 0) {
            return; // No hace nada si no hay solicitudes
        }
        
    } else {
        const total = solicitudes.reduce((acc, solicitud) => acc + solicitud.monto, 0);
        mostrarTotalSolicitudes(total);
    }
}

// Muestra el total debajo del botón correspondiente
function mostrarTotalSolicitudes(total) {
    const contenedor = document.getElementById('totalSolicitudes');
    contenedor.innerHTML = `<div class="text-success text-center fw-bold">Total de dinero solicitado: $${total}</div>`;
}

// Filtra las solicitudes por cantidad de cuotas
function manejarFiltro() {
    const cuotasSeleccionadas = parseInt(document.getElementById('filtroCuotas').value);
    const mensajeFiltro = document.getElementById('mensajeFiltro');

    if (!isNaN(cuotasSeleccionadas)) {
        const filtradas = solicitudes.filter(s => s.cuotas === cuotasSeleccionadas);

        if (filtradas.length === 0) {
            mensajeFiltro.innerHTML = mostrarMensaje('warning', `No se encontraron solicitudes en ${cuotasSeleccionadas} cuotas.`);
        } else {
            mensajeFiltro.innerHTML = mostrarMensaje('info', `Mostrando solicitudes en ${cuotasSeleccionadas} cuotas.`);
            renderizarSolicitudesFiltradas(filtradas);
        }

        mensajeFiltro.classList.remove('d-none');
    }
}

// Muestra todas las solicitudes nuevamente
function manejarMostrarTodas() {
    const mensajeFiltro = document.getElementById('mensajeFiltro');
    mensajeFiltro.classList.add('d-none');

    if (solicitudes.length === 0) {
        document.getElementById('solicitudesContainer').innerHTML = mostrarMensaje('warning', 'No se encontraron solicitudes registradas.');
    } else {
        renderizarSolicitudes();
    }
}

// Devuelve un mensaje Bootstrap
function mostrarMensaje(tipo, texto) {
    return `<div class="alert alert-${tipo} text-center" role="alert">${texto}</div>`;
}

// Renderiza solicitudes filtradas
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
                    <div class="btn-group">
                        <button class="btn btn-sm btn-warning" onclick="editarSolicitud(${i})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="confirmarEliminarIndividual(${i})">Eliminar</button>
                    </div>
                </div>
            </div>
        `;
    }

    contenedor.innerHTML = html;
}

// Comienza la edición de una solicitud
function editarSolicitud(indice) {
    indiceEnEdicion = indice;
    renderizarSolicitudes();
}

// Aplica los cambios tras editar
function actualizarSolicitud(indice) {
    const nombre = document.getElementById('editNombre').value.trim();
    const monto = parseFloat(document.getElementById('editMonto').value);
    const tasa = parseFloat(document.getElementById('editTasa').value);
    const cuotas = parseInt(document.getElementById('editCuotas').value);

    if (!validarFormulario(nombre, monto, cuotas, tasa)) {
        alert('Por favor, completá correctamente los campos.');
        return;
    }

    const interes = calcularInteres(monto, tasa);
    const cuota = calcularCuota(monto, interes, cuotas);
    const total = monto + interes;

    solicitudes[indice] = { nombre, monto, tasa, cuotas, interes, total, cuota };
    indiceEnEdicion = null;
    guardarSolicitudes();
    renderizarSolicitudes();
    document.getElementById('btnEliminarTodas').disabled = false;
}

// Abre modal de confirmación para eliminar individual
function confirmarEliminarIndividual(indice) {
    const modal = new bootstrap.Modal(document.getElementById('modalEliminarIndividual'));
    modal.show();

    const btnConfirmar = document.getElementById('confirmarEliminarIndividual');
    btnConfirmar.replaceWith(btnConfirmar.cloneNode(true));

    document.getElementById('confirmarEliminarIndividual').addEventListener('click', () => {
        eliminarSolicitud(indice);
        modal.hide();
    });
}

// Elimina una solicitud específica
function eliminarSolicitud(indice) {
    solicitudes.splice(indice, 1);
    guardarSolicitudes();
    renderizarSolicitudes();
    document.getElementById('totalSolicitudes').innerHTML = '';
    document.getElementById('btnEliminarTodas').disabled = solicitudes.length === 0;

}

// Elimina todas las solicitudes confirmando por modal
function eliminarTodasLasSolicitudes() {
    const mensajeFiltro = document.getElementById('mensajeFiltro');
    const contenedor = document.getElementById('solicitudesContainer');
    const totalSolicitudes = document.getElementById('totalSolicitudes');

    if (solicitudes.length === 0) {
        mensajeFiltro.innerHTML = mostrarMensaje('warning', 'No hay solicitudes registradas para eliminar.');
        mensajeFiltro.classList.remove('d-none');
        return;
    }

    const modal = new bootstrap.Modal(document.getElementById('modalEliminarTodas'));
    modal.show();

    const btnConfirmar = document.getElementById('confirmarEliminarTodas');
    btnConfirmar.replaceWith(btnConfirmar.cloneNode(true));

    document.getElementById('confirmarEliminarTodas').addEventListener('click', () => {
        solicitudes = [];
        guardarSolicitudes();
        contenedor.innerHTML = mostrarMensaje('info', 'Todas las solicitudes han sido eliminadas.');
        totalSolicitudes.innerHTML = '';
        mensajeFiltro.classList.add('d-none');
        modal.hide();
        document.getElementById('btnEliminarTodas').disabled = true;

    });
}

// EVENTOS
document.getElementById('btnRegistrar').addEventListener('click', manejarRegistro);
document.getElementById('btnTotalSolicitudes').addEventListener('click', calcularTotalSolicitudes);
document.getElementById('btnFiltrarCuotas').addEventListener('click', manejarFiltro);
document.getElementById('btnMostrarTodas').addEventListener('click', manejarMostrarTodas);
document.getElementById('btnEliminarTodas').addEventListener('click', eliminarTodasLasSolicitudes);
