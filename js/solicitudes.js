export let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];

export function guardarSolicitudes() {
    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
}

export function registrarSolicitud(nombre, monto, cuotas, tasa, tipo, indiceEnEdicionRef, mostrarToast, renderizarSolicitudesFn) {
    const interes = isNaN(tasa) ? 0 : calcularInteres(monto, tasa);
    const cuota = calcularCuota(monto, interes, cuotas);
    const total = monto + interes;

    const solicitud = {
        nombre,
        monto,
        interes,
        total,
        cuotas,
        cuota,
        tasa,
        tipo: tipo.tipo
    };

    if (indiceEnEdicionRef.value !== null) {
        solicitudes[indiceEnEdicionRef.value] = solicitud;
        indiceEnEdicionRef.value = null;

        if (typeof mostrarToast === 'function') {
            mostrarToast('Solicitud actualizada correctamente.');
        }
    } else {
        solicitudes.push(solicitud);

        if (typeof mostrarToast === 'function') {
            mostrarToast('Solicitud registrada correctamente.');
        }
    }

    guardarSolicitudes();
    renderizarSolicitudesFn();
}


export function editarSolicitud(indice, indiceEnEdicionRef, renderizarSolicitudesFn) {
    indiceEnEdicionRef.value = indice;
    document.getElementById('totalSolicitudes').innerHTML = '';
    renderizarSolicitudesFn();
}

export function actualizarSolicitud(indice, tiposPrestamo, validarFormulario, renderizarSolicitudesFn, indiceEnEdicionRef) {
    const nombre = document.getElementById('editNombre').value.trim();
    const monto = parseFloat(document.getElementById('editMonto').value);
    const tasaRaw = document.getElementById('editTasa').value.trim();
    const tasa = tasaRaw.toUpperCase() === 'UVA' ? 0 : parseFloat(tasaRaw);
    const cuotas = parseInt(document.getElementById('editCuotas').value);
    const tipoOriginal = solicitudes[indiceEnEdicionRef.value].tipo;
    const tipoDetectado = tiposPrestamo.find(tp => tp.tipo === tipoOriginal) || {
        tipo: "Desconocido",
        montoMin: 0,
        montoMax: Infinity,
        cuotasMin: 1,
        cuotasMax: 360,
        editableTasa: true
    };

    if (!validarFormulario(nombre, monto, cuotas, tasa, tipoDetectado)) return;
    const interes = calcularInteres(monto, tasa);
    const cuota = calcularCuota(monto, interes, cuotas);
    const total = monto + interes;

    solicitudes[indice] = {
        nombre,
        monto,
        tasa,
        cuotas,
        interes,
        total,
        cuota,
        tipo: tipoOriginal
    };

    indiceEnEdicionRef.value = null;
    guardarSolicitudes();
    renderizarSolicitudesFn();
    Swal.fire('Actualizado', 'La solicitud fue actualizada correctamente.', 'success');
}



export function confirmarEliminarIndividual(indice, eliminarSolicitudFn) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará la solicitud.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarSolicitudFn(indice);
            Swal.fire('Eliminado', 'La solicitud fue eliminada.', 'success');
        }
    });
}

export function eliminarSolicitud(indice, renderizarSolicitudesFn) {
    solicitudes.splice(indice, 1);
    guardarSolicitudes();
    renderizarSolicitudesFn();
    document.getElementById('totalSolicitudes').innerHTML = '';
    document.getElementById('btnEliminarTodas').disabled = solicitudes.length === 0;
    const btnTotal = document.getElementById('btnTotalSolicitudes');
    if (solicitudes.length === 0 || indiceEnEdicionRef.value !== null) {
        btnTotal.disabled = true;
        btnTotal.classList.remove('btn-success');
        btnTotal.classList.add('btn-secondary');
    }

}

export function eliminarTodasLasSolicitudes(renderizarSolicitudesFn) {
    Swal.fire({
        title: '¿Eliminar todas las solicitudes?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar todo',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            solicitudes.length = 0;
            guardarSolicitudes();
            renderizarSolicitudesFn();
            const btnTotal = document.getElementById('btnTotalSolicitudes');
            if (btnTotal) {
                btnTotal.disabled = true;
                btnTotal.classList.remove('btn-success');
                btnTotal.classList.add('btn-secondary');
            }

            Swal.fire('Hecho', 'Todas las solicitudes han sido eliminadas.', 'success');
        }
    });
}

export function calcularInteres(monto, tasa) {
    return tasa === 0 ? 0 : (monto * tasa) / 100;
}

export function calcularCuota(monto, interes, cuotas) {
    return (monto + interes) / cuotas;
}
