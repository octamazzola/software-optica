import axiosInstancia from './axiosInstance';


export const obtenerClientes = async (buscar = '') => {
    const respuesta = await axiosInstancia.get(`/clientes?buscar=${buscar}`);
    return respuesta.data;
};

export const crearCliente = async (datosCliente) => {
    const respuesta = await axiosInstancia.post('/clientes', datosCliente);
    return respuesta.data
};

export const eliminarCliente = async (id) => {
    const respuesta = await axiosInstancia.delete(`/clientes/${id}`)
    return respuesta.data;
};

