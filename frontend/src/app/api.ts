import { Venta } from "./types";

export const API_URL = "http://localhost:3000";

export async function registrarVenta(venta: Venta) {
    return fetch(`${API_URL}/ventas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(venta)
    });
}

export async function fetchJson(url: string) {
    const res = await fetch(url);
    return await res.json();
}
