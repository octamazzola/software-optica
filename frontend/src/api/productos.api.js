import axiosInstancia from "./axiosInstance";

export const obtenerProductos = async (buscar = '') => {
    const respuesta = await axiosInstancia.get(`/productos?buscar=${buscar}`);
    return respuesta.data;
};

export const crearProducto = async (datosProductos) => {
    const respuesta = await axiosInstancia.post('/productos', datosProductos);
    return respuesta.data;
};

export const actualizarProducto = async (codigo, datosProducto) => {
    const respuesta = await axiosInstancia.put(`/productos/${codigo}`, datosProducto);
    return respuesta.data;
};

export const eliminarProducto = async (codigo) => {
    const respuesta = await axiosInstancia.delete(`/productos/${codigo}`);
    return respuesta.data;
};