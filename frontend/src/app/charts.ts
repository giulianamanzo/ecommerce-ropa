import Chart from "chart.js/auto";
import { API_URL, fetchJson } from "./api";
import { CategoriaData, CorrelacionData } from "./types";

export async function cargarGraficoCategorias() {
    const data: CategoriaData[] = await fetchJson(`${API_URL}/estadisticas/por-categoria`);
    const ctx = document.getElementById("ventasCategoria") as HTMLCanvasElement;

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: data.map(x => x.Nombre_Categoria),
            datasets: [{
                label: "Total Vendido",
                data: data.map(x => x.TotalVentas),
                backgroundColor: "rgba(0,123,255,0.5)"
            }]
        }
    });
}

export async function cargarGraficoCorrelacion() {
    const data: CorrelacionData[] = await fetchJson(`${API_URL}/estadisticas/correlacion`);
    const ctx = document.getElementById("correlacion") as HTMLCanvasElement;

    new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [{
                label: "Precio vs Cantidad",
                data: data.map(x => ({
                    x: x.Precio_Unitario,
                    y: x.Cantidad
                })),
                backgroundColor: "rgba(255,0,0,0.5)"
            }]
        }
    });
}
