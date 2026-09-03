import axiosInstancia from "./axiosInstance";

export const obtenerProductos = async (buscar = '', categoria = '') => {
    let url = `/productos?buscar=${buscar}`;
    if (categoria) {
        url += `&categoria=${encodeURIComponent(categoria)}`;
    }
    const respuesta = await axiosInstancia.get(url);
    return respuesta.data;
};

export const obtenerMasVendidos = async () => {
    const respuesta = await axiosInstancia.get('/productos/mas-vendidos');
    return respuesta.data;
};

export const crearProducto = async (datosProductos) => {
    const respuesta = await axiosInstancia.post('/productos', datosProductos);
    return respuesta.data;
};

export const actualizarProducto = async (id, datosProducto) => {
    const respuesta = await axiosInstancia.put(`/productos/${id}`, datosProducto);
    return respuesta.data;
};

export const eliminarProducto = async (id) => {
    const respuesta = await axiosInstancia.delete(`/productos/${id}`);
    return respuesta.data;
};