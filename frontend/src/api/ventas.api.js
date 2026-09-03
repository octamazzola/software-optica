import axiosInstancia from "./axiosInstance";

export const obtenerVentas = async (params = {}) => {
    // Para mantener retrocompatibilidad si le pasan un string (dni)
    let queryParams = '';
    if (typeof params === 'string') {
        queryParams = `?dni=${params}`;
    } else {
        const query = new URLSearchParams();
        if (params.dni) query.append('dni', params.dni);
        if (params.cliente_id) query.append('cliente_id', params.cliente_id);
        queryParams = `?${query.toString()}`;
    }
    const respuesta = await axiosInstancia.get(`/ventas${queryParams}`);
    return respuesta.data;
};

export const crearVenta = async (datosVenta) => {
    const respuesta = await axiosInstancia.post('/ventas', datosVenta);
    return respuesta.data;
};

export const obtenerVentaPorId = async (id) => {
    const respuesta = await axiosInstancia.get(`/ventas/${id}`);
    return respuesta.data;
};
