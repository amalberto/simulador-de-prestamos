let solicitudes = [];

function calcularInteres(monto, tasa) {
    return (monto * tasa) / 100;
} // Devuelve el interés según el monto y la tasa de interés

function calcularCuota(monto, interes, cuotas) {
    return (monto + interes) / cuotas;
} // Devuelve el valor de cada cuota sumando monto e interés, dividido por la cantidad de cuotas

function registrarSolicitud(nombre, monto, cuotas, tasa) {
    let interes = calcularInteres(monto, tasa);
    let cuota = calcularCuota(monto, interes, cuotas);
    let total = monto + interes;

    let resumen = "Cliente: " + nombre + "\n" +
        "Monto solicitado: $" + monto + "\n" +
        "Interés (" + tasa + "%): $" + interes + "\n" +
        "Total a pagar: $" + total + "\n" +
        "Cuotas: " + cuotas + " de $" + cuota;

    alert(resumen);

    solicitudes.push({
        nombre, monto, interes, total, cuotas, cuota, tasa
    });

    console.log("NUEVA SOLICITUD:");
    console.log("Nombre:", nombre);
    console.log("Monto: $" + monto);
    console.log("Tasa: " + tasa + "%");
    console.log("Interés: $" + interes);
    console.log("Total a pagar: $" + total);
    console.log("Cuotas: " + cuotas + " de $" + cuota);
    console.log("\n");
    
} // Calcula el préstamo, muestra un resumen y almacena la solicitud en un array

function mostrarSolicitudes() {
    if (solicitudes.length === 0) {
        alert("No hay solicitudes registradas.");
        console.log("El usuario no ingresó ninguna solicitud.");
    } else {
        let mensaje = "Solicitudes registradas:\n\n";
        console.log("LISTA DE SOLICITUDES:");

        for (const solicitud of solicitudes) {
            let texto = solicitud.nombre +
                " - $" + solicitud.monto +
                " en " + solicitud.cuotas +
                " cuotas de $" + solicitud.cuota +
                " (interés: $" + solicitud.interes +
                ", tasa: " + solicitud.tasa + "%, total: $" + solicitud.total + ")";
            mensaje += texto + "\n\n";
            console.log(texto);
        }

        alert(mensaje);
        console.log("FIN DE LAS SOLICITUDES");
    }
} // Muestra las solicitudes guardadas en un alert y en la consola

function solicitarPrestamo() {
    let nombre = prompt("Ingresá tu nombre:");
    let monto = parseFloat(prompt("Ingresá el monto que querés solicitar:"));
    let cuotas = parseInt(prompt("Ingresá la cantidad de cuotas (3, 6, 9 o 12):"));
    let tasa = parseFloat(prompt("Ingresá la tasa de interés (por ejemplo: 50 para 50%):"));

    if (
        isNaN(monto) || monto <= 0 ||
        isNaN(cuotas) || ![3, 6, 9, 12].includes(cuotas) ||
        isNaN(tasa) || tasa < 0
    ) {
        alert("Datos incorrectos. Por favor intentá de nuevo.");
        console.log("El usuario ingresó datos incorrectos.");
    } else {
        registrarSolicitud(nombre, monto, cuotas, tasa);
    }
} // Solicita los datos para un nuevo préstamo y los valida

function salirSimulador() {
    alert("Gracias por usar el simulador");
    console.log("El usuario salió del simulador.");
} // Muestra un mensaje de despedida

function manejarOpcion(opcion) {
    switch (opcion) {
        case "1":
            solicitarPrestamo();
            break;
        case "2":
            mostrarSolicitudes();
            break;
        case "3":
            salirSimulador();
            break;
        default:
            alert("Opción inválida. Tenés que elegir: 1, 2 o 3.");
            console.log("El usuario seleccionó la opción:  " + opcion + " que es incorrecta");
    }
} // Maneja la opción seleccionada por el usuario

function simuladorPrestamos() {
    let opcion;

    while (opcion !== "3") {
        opcion = prompt(
            "Bienvenido al simulador de préstamos\n" +
            "1. Solicitar préstamo\n" +
            "2. Ver solicitudes\n" +
            "3. Salir"
        );

        manejarOpcion(opcion);
    }
} // Función principal que inicia el simulador

simuladorPrestamos(); // Llamada al simulador para comenzar

