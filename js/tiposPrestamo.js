export let tiposPrestamo = [];

export async function cargarTiposPrestamo() {
    try {
        const res = await fetch('./data/tiposPrestamo.json');
        if (!res.ok) throw new Error("Error al cargar tipos de préstamo");
        tiposPrestamo = await res.json();
        tiposPrestamo.forEach(tp => {
            if (tp.montoMax === "infinito") tp.montoMax = Infinity;
        });

        return tiposPrestamo;
    } catch (e) {
        console.error("Fallo al cargar JSON:", e);
        return [];
    }
}

export function actualizarFormularioPorTipo(tiposPrestamo) {
    const index = parseInt(document.getElementById("tipoPrestamo").value);
    const tipo = tiposPrestamo[index];

    const inputTasa = document.getElementById("tasa");
    const inputMonto = document.getElementById("monto");
    const selectCuotas = document.getElementById("cuotas");

    // Tasa: valor y edición
    if (tipo.tipo === "Hipotecario") {
        inputTasa.value = "UVA";
        inputTasa.readOnly = true;
        inputTasa.classList.add("bg-light", "text-muted");
    } else {
        inputTasa.value = tipo.tasa !== null ? tipo.tasa : "";
        inputTasa.readOnly = !tipo.editableTasa;
        inputTasa.classList.toggle("bg-light", !tipo.editableTasa);
        inputTasa.classList.toggle("text-muted", !tipo.editableTasa);
    }
    inputMonto.value = tipo.montoMin;
    document.getElementById("ayudaTasa").innerHTML = tipo.nombreTasa || (
        tipo.editableTasa
            ? "Podés ingresar la tasa manualmente."
            : `Tasa fija de ${tipo.tasa}%`
    );
    let opciones = "";
    for (let i = tipo.cuotasMin; i <= tipo.cuotasMax; i++) {
        opciones += `<option value="${i}">${i}</option>`;
    }
    selectCuotas.innerHTML = opciones;
    const montoMaxTexto = tipo.montoMax === Infinity ? "sin límite" : `$${tipo.montoMax.toLocaleString()}`;
    document.getElementById("ayudaMonto").innerHTML = `Monto permitido: $${tipo.montoMin.toLocaleString()} a ${montoMaxTexto}`;
    document.getElementById("ayudaCuotas").innerHTML = `Cuotas permitidas: ${tipo.cuotasMin} a ${tipo.cuotasMax}`;
    document.getElementById("descripcionTipoPrestamo").innerHTML = tipo.descripcion;
}


export function inicializarTiposDePrestamo(tiposPrestamo, actualizarFormularioCallback) {
    const select = document.getElementById("tipoPrestamo");
    select.innerHTML = tiposPrestamo.map((tp, i) =>
        `<option value="${i}" ${tp.tipo === "Simulación" ? "selected" : ""}>${tp.tipo}</option>`
    ).join("");

    select.addEventListener("change", () => actualizarFormularioCallback(tiposPrestamo));
    actualizarFormularioCallback(tiposPrestamo);
}
