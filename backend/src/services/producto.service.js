import ProductoRepository from '../repositories/producto.repository.js';

const ProductoService = {
    async obtenerProducto(buscar = '') {
        return await ProductoRepository.obtenerTodos(buscar);
    },

    async obtenerPorCodigo(codigo) {
        const producto = await ProductoRepository.obtenerPorCodigo(codigo);

        if (!producto) {
            throw Error(`El producto con el codigo ${codigo} no existe.`)
        }
        return producto;

    },

    async crearProducto({ codigo, nombre, precio, descripcion }) {
        if (!codigo || codigo.trim() === '') {
            throw Error('El codigo es obligatorio para crear un producto.');
        }
        if (!nombre || nombre.trim() === '') {
            throw Error('El nombre del producto es obligatorio.');
        }
        if (precio === undefined || precio < 0) {
            throw Error('El precio debe ser un número mayor o igual a 0.');
        }

        // Regla de negocio: No permitir códigos duplicados
        const existe = await ProductoRepository.obtenerPorCodigo(codigo);
        if (existe) {
            throw Error(`El producto con el codigo ${codigo} ya está registrado.`);
        }

        return await ProductoRepository.crear({ codigo, nombre, precio, descripcion });
    },

    async eliminarProducto(codigo) {
        await this.obtenerPorCodigo(codigo);
        return await ProductoRepository.eliminar(codigo);
    },

    async actualizarProducto(codigo, { nombre, precio, descripcion }) {
        await this.obtenerPorCodigo(codigo);
        
        if (!nombre || nombre.trim() === '') {
            throw Error('El nombre del producto es obligatorio para actualizarlo.');
        }
        if (precio === undefined || precio < 0) {
            throw Error('El precio debe ser un número mayor o igual a 0.');
        }

        return await ProductoRepository.actualizar(codigo, { nombre, precio, descripcion });
    }

};

export default ProductoService;
