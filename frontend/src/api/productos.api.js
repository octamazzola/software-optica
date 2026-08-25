import axiosInstancia from "./axiosInstance";

export const obtenerProducto = async (buscar = '') => {
    const respuesta = await axiosInstancia.get(`/productos?buscar=${buscar}`);
    return respuesta.data;
}

export const crearProducto = async (datosProductos) => {
    const respuesta = await axiosInstancia.post('/productos', datosProductos);
    return respuesta.data
}

export const eliminarProducto = async (codigo) => {
    const respuesta = await axiosInstancia.delete(`/productos/${codigo}`);
    return respuesta.data;
}