import axiosInstancia from "./axiosInstance";

export const obtenerCristales = async (filtros = {}) => {
    const query = new URLSearchParams();
    if (filtros.material) query.append('material', filtros.material);
    if (filtros.tipo_lente) query.append('tipo_lente', filtros.tipo_lente);
    if (filtros.tratamiento) query.append('tratamiento', filtros.tratamiento);
    
    const respuesta = await axiosInstancia.get(`/cristales?${query.toString()}`);
    return respuesta.data;
};

export const crearCristal = async (datos) => {
    const respuesta = await axiosInstancia.post('/cristales', datos);
    return respuesta.data;
};

export const actualizarCristal = async (id, datos) => {
    const respuesta = await axiosInstancia.put(`/cristales/${id}`, datos);
    return respuesta.data;
};

export const eliminarCristal = async (id) => {
    const respuesta = await axiosInstancia.delete(`/cristales/${id}`);
    return respuesta.data;
};
