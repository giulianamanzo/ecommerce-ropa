export interface Venta {
    id_cliente: number;
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
    metodo_pago: string;
}

export interface CategoriaData {
    Nombre_Categoria: string;
    TotalVentas: number;
}

export interface CorrelacionData {
    Precio_Unitario: number;
    Cantidad: number;
}
