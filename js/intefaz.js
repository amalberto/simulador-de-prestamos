import { cargarTiposPrestamo, inicializarTiposDePrestamo, actualizarFormularioPorTipo } from './tiposPrestamo.js';
import {
    solicitudes,
    registrarSolicitud,
    editarSolicitud,
    actualizarSolicitud,
    eliminarTodasLasSolicitudes,
    confirmarEliminarIndividual,
    eliminarSolicitud
} from './solicitudes.js';

window.editarSolicitud = (indice) => editarSolicitud(indice, indiceEnEdicionRef, renderizarSolicitudes);
window.confirmarEliminarIndividual = (indice) => confirmarEliminarIndividual(indice, (i) => eliminarSolicitud(i, renderizarSolicitudes));
window.actualizarSolicitud = (indice) => actualizarSolicitud(indice, tiposPrestamo, validarFormulario, renderizarSolicitudes, indiceEnEdicionRef);
window.eliminarTodasLasSolicitudes = () => eliminarTodasLasSolicitudes(renderizarSolicitudes);
window.imprimirSolicitud = function (indice) {
    const solicitud = solicitudes[indice];

    const contenido = `
    <html>
    <head>
        <title>Imprimir Solicitud</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 40px;
                background: #f8f9fa;
            }
            .recuadro {
                border: 1px solid #333;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 20px;
                background: white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                max-width: 500px;
                margin-left: auto;
                margin-right: auto;
            }
            h2 {
                text-align: center;
                margin-bottom: 20px;
            }
            .dato {
                margin: 8px 0;
            }
        </style>
    </head>
    <body>
        <div class="recuadro">
            <h2>Solicitud de Préstamo</h2>
            <div class="dato"><strong>Cliente:</strong> ${solicitud.nombre}</div>
            <div class="dato"><strong>Tipo de Préstamo:</strong> ${solicitud.tipo}</div>
            <div class="dato"><strong>Monto Solicitado:</strong> $${solicitud.monto.toLocaleString()}</div>
            <div class="dato"><strong>Tasa de Interés:</strong> ${solicitud.tasa}%</div>
            <div class="dato"><strong>Cuotas:</strong> ${solicitud.cuotas} cuotas de $${solicitud.cuota.toFixed(2)}</div>
            <div class="dato"><strong>Total a Pagar:</strong> $${solicitud.total.toLocaleString()}</div>
        </div>
    </body>
    </html>
    `;

    const ventana = window.open('', '', 'width=700,height=700');
    ventana.document.write(contenido);
    ventana.document.close();
    ventana.focus();
    ventana.print();
    ventana.close();
};

let tiposPrestamo = [];
const indiceEnEdicionRef = { value: null };

export async function inicializarApp() {
    tiposPrestamo = await cargarTiposPrestamo();
    inicializarTiposDePrestamo(tiposPrestamo, actualizarFormularioPorTipo);
    renderizarSolicitudes();
    document.getElementById("btnRegistrar").addEventListener("click", manejarRegistro);
    document.getElementById("btnTotalSolicitudes").addEventListener("click", calcularTotalSolicitudes);
    document.getElementById("btnFiltrarCuotas").addEventListener("click", manejarFiltro);
    document.getElementById("btnMostrarTodas").addEventListener("click", manejarMostrarTodas);
    document.getElementById("btnEliminarTodas").addEventListener("click", () => {
    const tipoFiltrado = document.getElementById('filtroTipo').value;

    if (tipoFiltrado !== '') {
        Swal.fire({
            title: 'Filtro activo',
            text: 'Se están mostrando solo solicitudes filtradas. Se mostrarán todas antes de continuar.',
            icon: 'info',
            confirmButtonText: 'Entendido'
        }).then(() => {
            document.getElementById('filtroTipo').value = '';
            document.getElementById('mensajeFiltro').classList.add('d-none');
            renderizarSolicitudes();

            // Segunda confirmación
            setTimeout(() => {
                Swal.fire({
                    title: '¿Eliminar todas las solicitudes?',
                    text: 'Esta acción no se puede deshacer.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#6b46c1',
                    cancelButtonColor: '#555',
                    confirmButtonText: 'Sí, eliminar todo',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        eliminarTodasLasSolicitudes(renderizarSolicitudes);
                    }
                });
            }, 200);
        });
    } else {
        // Sin filtro: confirmación directa
        Swal.fire({
            title: '¿Eliminar todas las solicitudes?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#6b46c1',
            cancelButtonColor: '#555',
            confirmButtonText: 'Sí, eliminar todo',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarTodasLasSolicitudes(renderizarSolicitudes);
            }
        });
    }
});

}

export function esPreaprobado(solicitud, tipo) {
    if (
        !tipo ||
        typeof tipo.montoMax !== 'number' ||
        typeof tipo.cuotasMax !== 'number' ||
        typeof solicitud.monto !== 'number' ||
        typeof solicitud.cuotas !== 'number'
    ) {
        return {
            aprobado: true,
            razon: 'Datos suficientes para aplicar criterio. Aprobado por defecto.'
        };
    }

    const porcentajeDelMontoSolicitado = solicitud.monto / tipo.montoMax;
    let porcentajeCuotasRequerido = 0;
    let motivo = '';
    if (porcentajeDelMontoSolicitado >= 0.8) {
        porcentajeCuotasRequerido = 0.7;
        motivo = 'El monto solicitado equivale o supera el <strong>80%</strong> del máximo permitido.';
    } else if (porcentajeDelMontoSolicitado >= 0.5) {
        porcentajeCuotasRequerido = 0.6;
        motivo = 'El monto solicitado equivale o supera el <strong>50%</strong> del máximo permitido.';
    } else if (porcentajeDelMontoSolicitado >= 0.4) {
        porcentajeCuotasRequerido = 0.4;
        motivo = 'El monto solicitado equivale o supera el <strong>40%</strong> del máximo permitido.';
    } else {
        return {
            aprobado: true,
            razon: 'Monto solicitado correcto. No se requiere un mínimo adicional de cuotas.'
        };
    }
    const cuotasMinimasRequeridas = Math.ceil(tipo.cuotasMax * porcentajeCuotasRequerido);
    if (solicitud.cuotas >= cuotasMinimasRequeridas) {
        return {
            aprobado: true,
            razon: `Monto dentro del rango y se cumplen las cuotas mínimas requeridas.`
        };
    } else {
        return {
            aprobado: false,
            razon: `${motivo} Se requieren al menos <strong>${cuotasMinimasRequeridas}</strong>.`
        };
    }
}

function generarTasaHTML(tipo, tasa) {
    const ayudaTasa = tipo.nombreTasa || (
        tipo.editableTasa
            ? "Podés ingresar la tasa manualmente."
            : `Tasa fija de ${tipo.tasa}%`
    );

    if (tipo.tipo === "Hipotecario") {
        return `
            <input type="text" class="form-control bg-light text-muted mb-2" value="UVA" readonly>
            <input type="hidden" id="editTasa" value="0">
            <div class="form-text text-muted">Tasa UVA (consultar en BCRA).</div>
        `;
    }

    if (tipo.editableTasa) {
        return `
            <input type="number" class="form-control mb-2" id="editTasa" value="${tasa}">
            <div class="form-text text-muted">${ayudaTasa}</div>
        `;
    }

    return `
        <input type="text" class="form-control bg-light text-muted mb-2" value="${tipo.tasa}%" readonly>
        <input type="hidden" id="editTasa" value="${tipo.tasa}">
        <div class="form-text text-muted">${ayudaTasa}</div>
    `;
}

function generarBotonesAcciones(indice) {
    return `
        <div class="btn-group">
            <button class="btn btn-sm btn-warning" onclick="editarSolicitud(${indice})">Editar</button>
            <button class="btn btn-sm btn-info" onclick="imprimirSolicitud(${indice})">Imprimir</button>
            <button class="btn btn-sm btn-danger" onclick="confirmarEliminarIndividual(${indice})">Eliminar</button>
        </div>
    `;
}


function generarAyudasYCuotasHTML(tipo, valorSeleccionado) {
    const montoMaxTexto = tipo.montoMax === Infinity ? "sin límite" : `$${tipo.montoMax.toLocaleString()}`;
    const ayudaMonto = `Monto permitido: $${tipo.montoMin.toLocaleString()} a ${montoMaxTexto}`;
    const ayudaCuotas = `Cuotas permitidas: ${tipo.cuotasMin} a ${tipo.cuotasMax}`;

    let opcionesCuotas = '';
    for (let c = tipo.cuotasMin; c <= tipo.cuotasMax; c++) {
        opcionesCuotas += `<option value="${c}" ${valorSeleccionado === c ? 'selected' : ''}>${c}</option>`;
    }

    return {
        ayudaMonto,
        ayudaCuotas,
        opcionesCuotas
    };
}


function renderizarSolicitudes() {
    const contenedor = document.getElementById('solicitudesContainer');
    let html = '';

    const btnTotal = document.getElementById('btnTotalSolicitudes');
    const btnEliminarTodas = document.getElementById('btnEliminarTodas');
    const estaEditando = indiceEnEdicionRef.value !== null;
    const haySolicitudes = solicitudes.length > 0;

    if (!haySolicitudes) {
        contenedor.innerHTML = `
            <div class="alert alert-warning text-center" role="alert">
                No hay solicitudes registradas.
            </div>
        `;
        btnTotal.disabled = true;
        btnTotal.classList.remove('btn-success');
        btnTotal.classList.add('btn-secondary');
        btnEliminarTodas.disabled = true;
        btnEliminarTodas.classList.remove('btn-danger');
        btnEliminarTodas.classList.add('btn-secondary');
        return;
    }

    for (let i = 0; i < solicitudes.length; i++) {
        const s = solicitudes[i];
        const tipoDetectado = tiposPrestamo.find(tp => tp.tipo === s.tipo) || {
            tipo: "Desconocido",
            cuotasMin: 1,
            cuotasMax: 12,
            editableTasa: true,
            nombreTasa: `${s.tasa}%`,
            tasa: s.tasa,
            montoMin: 0,
            montoMax: Infinity
        };

        if (indiceEnEdicionRef.value === i) {
            const { ayudaMonto, ayudaCuotas, opcionesCuotas } = generarAyudasYCuotasHTML(tipoDetectado, s.cuotas);
            const tasaHTML = generarTasaHTML(tipoDetectado, s.tasa);

            html += `
                <div class="list-group-item fade-in">
                    <div class="d-flex justify-content-between align-items-start flex-wrap">
                        <div class="w-100">
                            <label class="form-label mt-2">Tipo de Préstamo</label>
                            <input type="text" class="form-control bg-light text-muted mb-2" value="${tipoDetectado.tipo}" readonly>

                            <label class="form-label">Nombre del Cliente</label>
                            <input class="form-control mb-2" id="editNombre" value="${s.nombre}">

                            <label class="form-label">Monto Solicitado ($)</label>
                            <input type="number" class="form-control mb-2" id="editMonto" value="${s.monto}">
                            <div class="form-text text-muted">${ayudaMonto}</div>

                            <label class="form-label">Tasa de Interés (%)</label>
                            ${tasaHTML}

                            <label class="form-label">Cantidad de Cuotas</label>
                            <select id="editCuotas" class="form-select mb-2">
                                ${opcionesCuotas}
                            </select>
                            <div class="form-text text-muted">${ayudaCuotas}</div>
                        </div>
                        <button class="btn btn-success w-100" onclick="actualizarSolicitud(${i})">Actualizar</button>
                    </div>
                </div>
            `;
        } else {
            const resultado = esPreaprobado(s, tipoDetectado);

            html += `
                <div class="list-group-item fade-in">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5>${s.nombre}</h5>
                            <p>Monto solicitado: $${s.monto}</p>
                            ${s.tipo === "Hipotecario" ? `
                                <p>Interés (UVA): <a href="https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables_datos.asp?serie=7913" target="_blank">Consultar en BCRA</a></p>
                                <p>Total a pagar: $${s.total} + tasa UVA</p>` : `
                                <p>Interés (${s.tasa}%): $${s.interes}</p>
                                <p>Total a pagar: $${s.total}</p>`}
                            <p>Cuotas: ${s.cuotas} cuotas de $${s.cuota.toFixed(2)}</p>
                            <button class="btn btn-sm ${resultado.aprobado ? 'btn-outline-success' : 'btn-outline-danger'} mt-2"
                                onclick="Swal.fire({
                                    title: '${resultado.aprobado ? 'Preaprobado' : 'No aprobado'}',
                                    html: '${resultado.razon.replace(/'/g, "\\'")}',
                                    icon: '${resultado.aprobado ? 'success' : 'info'}',
                                    confirmButtonText: 'Entendido'
                                })">
                                ${resultado.aprobado ? 'Preaprobado' : 'No aprobado'}
                            </button>
                        </div>
                        ${generarBotonesAcciones(i)}
                    </div>
                </div>
            `;
        }
    }

    contenedor.innerHTML = html;

    btnTotal.disabled = estaEditando || !haySolicitudes;
    btnTotal.classList.toggle('btn-success', !btnTotal.disabled);
    btnTotal.classList.toggle('btn-secondary', btnTotal.disabled);

    btnEliminarTodas.disabled = estaEditando || !haySolicitudes;
    btnEliminarTodas.classList.toggle('btn-danger', !btnEliminarTodas.disabled);
    btnEliminarTodas.classList.toggle('btn-secondary', btnEliminarTodas.disabled);
}




function mostrarToast(mensaje) {
    const toastBody = document.getElementById('toastBody');
    toastBody.innerHTML = mensaje;
    const toast = new bootstrap.Toast(document.getElementById('liveToast'));
    toast.show();
}

function manejarRegistro() {
    const nombre = document.getElementById('nombre').value.trim();
    const monto = parseFloat(document.getElementById('monto').value);
    const cuotas = parseInt(document.getElementById('cuotas').value);
    const tasaRaw = document.getElementById('tasa').value.trim();
    const tipoIndex = parseInt(document.getElementById("tipoPrestamo").value);
    const tipo = tiposPrestamo[tipoIndex];
    let tasa;
    if (tipo.tipo === "Hipotecario") {
        tasa = 0;
    } else if (tasaRaw.toUpperCase() === 'UVA' && tipo.tipo === "Hipotecario") {
        tasa = 0;
    } else {
        tasa = parseFloat(tasaRaw);
    }
    const mensajeFiltro = document.getElementById('mensajeFiltro');
    const mensajeError = document.getElementById('mensajeError');

    mensajeFiltro.classList.add('d-none');

    if (validarFormulario(nombre, monto, cuotas, tasa, tipo)) {
        registrarSolicitud(nombre, monto, cuotas, tasa, tipo, indiceEnEdicionRef, mostrarToast, renderizarSolicitudes);
        document.getElementById('formSolicitud').reset();
        mensajeError.classList.add('d-none');
        mensajeError.innerHTML = '';
        actualizarFormularioPorTipo(tiposPrestamo);
    } else {
        mensajeError.innerHTML = 'Completá correctamente todos los campos del formulario.';
        mensajeError.classList.remove('d-none');
    }
}

function validarFormulario(nombre, monto, cuotas, tasa, tipo) {
    const nombreRegex = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}( [A-ZÁÉÍÓÚÑ][a-záéíóúñ]{1,})+$/;
    if (!nombreRegex.test(nombre)) {
        Swal.fire({
            title: 'Nombre inválido',
            html: `
                    Ingresá un <strong>nombre</strong> y <strong>apellido</strong> que solo tenga letras.<br>
                    El nombre debe tener al menos tres letras, y el apellido al menos dos.<br>
                    Ambos deben comenzar con letra mayúscula.<br>
                    <strong>Ejemplo válido:</strong> 'Alberto Pérez' o 'María Da Fiorenza'.
                `,
            icon: 'error'
        });
        return false;
    }
    if (isNaN(monto) || monto < 1) {
        Swal.fire('Monto inválido', 'Ingresá un monto válido mayor o igual a $1.', 'error');
        return false;
    }

    if (monto < tipo.montoMin || monto > tipo.montoMax) {
        const mensajeMonto = tipo.montoMax === Infinity
            ? `Debe ser mayor o igual a $${tipo.montoMin}.`
            : `Debe estar entre $${tipo.montoMin} y $${tipo.montoMax}.`;

        Swal.fire('Monto fuera de rango', mensajeMonto, 'error');
        return false;
    }
    if (isNaN(cuotas) || cuotas < tipo.cuotasMin || cuotas > tipo.cuotasMax) {
        Swal.fire('Cuotas inválidas', `Debe estar entre ${tipo.cuotasMin} y ${tipo.cuotasMax}.`, 'error');
        return false;
    }
    if (!tipo.editableTasa && tasa !== tipo.tasa) {
        Swal.fire('Tasa fija', `La tasa debe ser ${tipo.tasa}%`, 'info');
        return false;
    }
    if (isNaN(tasa) || tasa < 0) {
        Swal.fire('Tasa inválida', 'Ingresá una tasa válida.', 'error');
        return false;
    }
    return true;
}

function calcularTotalSolicitudes() {
    const total = solicitudes.reduce((acc, s) => acc + s.monto, 0);
    document.getElementById('totalSolicitudes').innerHTML = `
            <div class="text-success text-center fw-bold">
                Total de dinero solicitado: $${total.toLocaleString()}
            </div>
        `;
    document.getElementById('filtroTipo').value = '';
    document.getElementById('mensajeFiltro').classList.add('d-none');
    document.getElementById('mensajeFiltro').innerHTML = '';
    renderizarSolicitudes();
}

function manejarFiltro() {
    const tipoSeleccionado = document.getElementById('filtroTipo').value;
    const mensajeFiltro = document.getElementById('mensajeFiltro');
    const contenedor = document.getElementById('solicitudesContainer');
    const btnTotal = document.getElementById('btnTotalSolicitudes');

    if (tipoSeleccionado === '') {
        mensajeFiltro.classList.add('d-none');
        mensajeFiltro.innerHTML = '';
        renderizarSolicitudes();
        return;
    }

    const filtradas = solicitudes.filter(s => s.tipo === tipoSeleccionado);

    if (filtradas.length === 0) {
        mensajeFiltro.innerHTML = `
            <div class="alert alert-warning text-center" role="alert">
                No se encontraron solicitudes para el tipo <strong>${tipoSeleccionado}</strong>.
            </div>`;
        mensajeFiltro.classList.remove('d-none');
        contenedor.innerHTML = '';
        btnTotal.disabled = true;
        btnTotal.classList.remove('btn-success');
        btnTotal.classList.add('btn-secondary');
    } else {
        mensajeFiltro.innerHTML = `
            <div class="alert alert-info text-center" role="alert">
                Mostrando solo solicitudes de tipo <strong>${tipoSeleccionado}</strong>.
            </div>`;
        mensajeFiltro.classList.remove('d-none');
        renderizarSolicitudesFiltradas(filtradas);
    }
}

function manejarMostrarTodas() {
    document.getElementById('mensajeFiltro').classList.add('d-none');
    document.getElementById('totalSolicitudes').innerHTML = '';
    const btnTotal = document.getElementById('btnTotalSolicitudes');
    btnTotal.disabled = true;
    btnTotal.classList.remove('btn-success');
    btnTotal.classList.add('btn-secondary');

    renderizarSolicitudes();
}


function renderizarSolicitudesFiltradas(arraySolicitudes) {
    const contenedor = document.getElementById('solicitudesContainer');

    if (arraySolicitudes.length === 0) {
        contenedor.innerHTML = `
            <div class="alert alert-warning text-center" role="alert">
                No se encontraron solicitudes para este tipo. 
            </div>
        `;
        return;
    }

    let html = '';

    for (let i = 0; i < arraySolicitudes.length; i++) {
        const s = arraySolicitudes[i];

        const tipoDetectado = tiposPrestamo.find(tp => tp.tipo === s.tipo) || {
            tipo: "Desconocido", cuotasMin: 1, cuotasMax: 360, montoMin: 0, montoMax: Infinity, editableTasa: true
        };

        const resultado = esPreaprobado(s, tipoDetectado);

        html += `
            <div class="list-group-item fade-in">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5>${s.nombre}</h5>
                        <p>Monto solicitado: $${s.monto}</p>
                        ${s.tipo === "Hipotecario" ? `
                            <p>Interés (UVA): <a href="https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables_datos.asp?serie=7913" target="_blank">Consultar en BCRA</a></p>
                            <p>Total a pagar: $${s.total} + tasa UVA</p>` : `
                            <p>Interés (${s.tasa}%): $${s.interes}</p>
                            <p>Total a pagar: $${s.total}</p>`}
                        <p>Cuotas: ${s.cuotas} cuotas de $${s.cuota.toFixed(2)}</p>

                        <button class="btn btn-sm ${resultado.aprobado ? 'btn-outline-success' : 'btn-outline-danger'} mt-2"
                            onclick="Swal.fire({
                                title: '${resultado.aprobado ? 'Preaprobado' : 'No aprobado'}',
                                html: '${resultado.razon.replace(/'/g, "\\'")}',
                                icon: '${resultado.aprobado ? 'success' : 'info'}',
                                confirmButtonText: 'Entendido'
                            })">
                            ${resultado.aprobado ? 'Preaprobado' : 'No aprobado'}
                        </button>
                        ${generarBotonesAcciones(i)}
                    </div>
                </div>
            </div>
        `;
    }

    contenedor.innerHTML = html;

    const btnTotal = document.getElementById('btnTotalSolicitudes');
    if (indiceEnEdicionRef.value !== null || arraySolicitudes.length === 0) {
        btnTotal.disabled = true;
        btnTotal.classList.remove('btn-success');
        btnTotal.classList.add('btn-secondary');
    } else {
        btnTotal.disabled = false;
        btnTotal.classList.add('btn-success');
        btnTotal.classList.remove('btn-secondary');
    }
}




