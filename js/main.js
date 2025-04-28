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
} // Devuelve el interés según el monto y la tasa de interés

// Función para calcular la cuota
function calcularCuota(monto, interes, cuotas) {
    return (monto + interes) / cuotas;
} // Devuelve el valor de cada cuota sumando monto e interés, dividido por la cantidad de cuotas

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
} // Calcula el préstamo, guarda la solicitud y actualiza

// Función para guardar solicitudes en el localstorage
function guardarSolicitudes() {
    localStorage.setItem('solicitudes', JSON.stringify(solicitudes));
}

// Función que crea un elemento nuevo que muestra una solicitud 
function crearItemSolicitud(solicitud, index) {
    const item = document.createElement('div');
    item.className = 'list-group-item';

    item.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h5>${solicitud.nombre}</h5>
                <p>Monto solicitado: $${solicitud.monto}</p>
                <p>Interés (${solicitud.tasa}%): $${solicitud.interes}</p>
                <p>Total a pagar: $${solicitud.total}</p>
                <p>Cuotas: ${solicitud.cuotas} cuotas de $${parseInt(solicitud.cuota * 100) / 100}</p>
            </div>
            <button class="btn btn-sm btn-danger" onclick="eliminarSolicitud(${index})">Eliminar</button>
        </div> 
    `; // se agrega un botón que dispara a través de un evento la función 'eliminarSolicitud' que elimina dicha solicitud de forma individual
    return item;
}

// Función que renderiza las solicitudes en el DOM
function renderizarSolicitudes() {
    const contenedor = document.getElementById('solicitudesContainer');
    contenedor.innerHTML = '';

    solicitudes.forEach((solicitud, index) => {
        contenedor.appendChild(crearItemSolicitud(solicitud, index));
    });
}

// Función que elimina una solicitud de préstamo en particular 
function eliminarSolicitud(indice) {
    solicitudes.splice(indice, 1); // Elimina 1 elemento en la posición 'indice'
    guardarSolicitudes();          // Actualiza el localstorage
    renderizarSolicitudes();       // Actualiza el DOM
    document.getElementById('totalSolicitudes').innerText = ''; // Limpia el total mostrado
}

// Función que maneja la lógica del registro de una solicitud
function manejarRegistro() {
    const nombre = document.getElementById('nombre').value.trim();
    const monto = parseFloat(document.getElementById('monto').value);
    const cuotas = parseInt(document.getElementById('cuotas').value);
    const tasa = parseFloat(document.getElementById('tasa').value);

    const mensajeError = document.getElementById('mensajeError');
    const mensajeExito = document.getElementById('mensajeExito');
    const mensajeFiltro = document.getElementById('mensajeFiltro');

    if (validarFormulario(nombre, monto, cuotas, tasa)) {
        registrarSolicitud(nombre, monto, cuotas, tasa);
        document.getElementById('formSolicitud').reset();
        mensajeError.classList.add('d-none'); // 
        mensajeExito.classList.remove('d-none'); 
        mensajeExito.innerText = 'Tu solicitud fue registrada correctamente';
        mensajeFiltro.classList.add('d-none'); 
    } else {
        mensajeError.innerText = 'No has ingresado correctamente todos los campos del fomulario. Intentá de nuevo, por favor';
        mensajeError.classList.remove('d-none'); 
        mensajeExito.classList.add('d-none'); 
    } // También maneja la aparición o desaparación de mensajes que le indican al usuario si la solicitud fue registrada éxitosamente o si hubo un error
}

// Función que valida el formulario
function validarFormulario(nombre, monto, cuotas, tasa) {
    return (
        nombre !== '' &&
        !isNaN(monto) && monto > 0 &&
        !isNaN(cuotas) && [3, 6, 9, 12].includes(cuotas) &&
        !isNaN(tasa) && tasa >= 0
    );
} // Valida los datos ingresados en el formulario

// Función que usa reduce para calcular el total solicitado
function calcularTotalSolicitudes() {
    const contenedor = document.getElementById('solicitudesContainer');
    const mensajeFiltro = document.getElementById('mensajeFiltro');

    mensajeFiltro.classList.add('d-none'); // Oculta mensaje del filtro si está activado

    if (solicitudes.length === 0) {
        contenedor.innerHTML = `
            <div class="alert alert-warning text-center" role="alert">
                No se encontró ninguna solicitud registrada.
            </div>
        `;
        document.getElementById('totalSolicitudes').innerText = '';
    } else {
        const total = solicitudes.reduce((acumulador, solicitud) => acumulador + solicitud.monto, 0);
        mostrarTotalSolicitudes(total);
    }
}

// Función para mostrar el total de solicitudes en el DOM
function mostrarTotalSolicitudes(total) {
    const contenedor = document.getElementById('totalSolicitudes');

    if (solicitudes.length === 0) {
        contenedor.innerText = 'No hay solicitudes registradas.';
    } else {
        contenedor.innerText = `Total de dinero solicitado: $${total}`;
    }
}

// Función que maneja el calculo del total
function manejarCalculoTotal() {
    manejarMostrarTodas();  
    calcularTotalSolicitudes();
}

// Función que maneja el filtrado de cuotas
function manejarFiltro() {
    const cuotasSeleccionadas = parseInt(document.getElementById('filtroCuotas').value);
    const mensajeFiltro = document.getElementById('mensajeFiltro');

    if (!isNaN(cuotasSeleccionadas)) {
        const filtradas = solicitudes.filter((solicitud) => solicitud.cuotas === cuotasSeleccionadas);

        if (filtradas.length === 0) {
            // En caso de no encontrar resultados para esa cantidad de cuotas
            mensajeFiltro.className = 'alert alert-warning text-center';
            mensajeFiltro.innerText = `No se encontraron solicitudes realizadas en ${cuotasSeleccionadas} cuotas.`;
            mensajeFiltro.classList.remove('d-none');
            document.getElementById('solicitudesContainer').innerHTML = '';
        } else {
            // En caso de encontrar solicitudes
            mensajeFiltro.className = 'alert alert-info text-center';
            mensajeFiltro.innerText = `Mostrando solicitudes con ${cuotasSeleccionadas} cuotas.`;
            mensajeFiltro.classList.remove('d-none');
            renderizarSolicitudesFiltradas(filtradas);
        }
    }
}

// Función que maneja la aparición de todas las solicitudes
function manejarMostrarTodas() {
    const mensajeFiltro = document.getElementById('mensajeFiltro');

    mensajeFiltro.classList.add('d-none'); // Oculta el mensaje del filtro si se encontraba aplicado

    if (solicitudes.length === 0) {
        const contenedor = document.getElementById('solicitudesContainer');
        contenedor.innerHTML = `
            <div class="alert alert-warning text-center" role="alert">
                No se encontraron solicitudes registradas.
            </div>
        `;
    } else {
        renderizarSolicitudes();
    }
}

// Función que hace render de aquellas solicitudes que fueron filtradas por el usuario
function renderizarSolicitudesFiltradas(arraySolicitudes) {
    const contenedor = document.getElementById('solicitudesContainer');
    contenedor.innerHTML = '';

    arraySolicitudes.forEach((solicitud, index) => {
        contenedor.appendChild(crearItemSolicitud(solicitud, index));
    });
}

// Eventos que manejan la lógica general y disparan la ejecución de las funciones
const botonRegistrar = document.getElementById('btnRegistrar');
botonRegistrar.addEventListener('click', manejarRegistro);

const botonTotal = document.getElementById('btnTotalSolicitudes');
if (botonTotal) {
    botonTotal.addEventListener('click', manejarCalculoTotal);
}

const btnFiltrar = document.getElementById('btnFiltrarCuotas');
btnFiltrar.addEventListener('click', manejarFiltro);

const btnMostrarTodas = document.getElementById('btnMostrarTodas');
btnMostrarTodas.addEventListener('click', manejarMostrarTodas);
