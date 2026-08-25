import axiosInstancia from "./axiosInstance";

export const obtenerVentas = async () => {
    const respuesta = await axiosInstancia.get('/ventas');
    return respuesta.data;
};


export const crearVenta = async (datosVenta) => {
    const respuesta = await axiosInstancia.post('/ventas', datosVenta);
    return respuesta.data;
};


