import axiosInstancia from "./axiosInstance";

export const obtenerVentas = async (params = {}) => {
    let queryParams = '';
    if (typeof params === 'string') {
        queryParams = params ? `?buscar=${encodeURIComponent(params)}` : '';
    } else if (params && typeof params === 'object') {
        const query = new URLSearchParams();
        if (params.buscar) query.append('buscar', params.buscar);
        if (params.dni) query.append('dni', params.dni);
        if (params.nombre) query.append('nombre', params.nombre);
        if (params.apellido) query.append('apellido', params.apellido);
        if (params.cliente_id) query.append('cliente_id', params.cliente_id);
        if (params.fechaDesde) query.append('fechaDesde', params.fechaDesde);
        if (params.fechaHasta) query.append('fechaHasta', params.fechaHasta);
        const qs = query.toString();
        queryParams = qs ? `?${qs}` : '';
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
