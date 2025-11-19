import { Venta } from "./types";
import { registrarVenta, API_URL, fetchJson } from "./api";
import { cargarGraficoCategorias, cargarGraficoCorrelacion } from "./charts";

const form = document.getElementById("ventaForm") as HTMLFormElement;

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const venta: Venta = {
        id_cliente: Number((document.getElementById("cliente") as HTMLInputElement).value),
        id_producto: Number((document.getElementById("producto") as HTMLInputElement).value),
        cantidad: Number((document.getElementById("cantidad") as HTMLInputElement).value),
        precio_unitario: Number((document.getElementById("precio") as HTMLInputElement).value),
        metodo_pago: (document.getElementById("metodo") as HTMLInputElement).value
    };

    await registrarVenta(venta);
    alert("Venta registrada con éxito");
});

// Estadísticas
async function cargarStats() {
    const promedio = await fetchJson(`${API_URL}/estadisticas/promedio`);
    (document.getElementById("promedio") as HTMLElement).textContent =
        promedio.PromedioVentas;

    const desvio = await fetchJson(`${API_URL}/estadisticas/desvio`);
    (document.getElementById("desvio") as HTMLElement).textContent =
        desvio.DesvioVentas;
}

cargarStats();
cargarGraficoCategorias();
cargarGraficoCorrelacion();
