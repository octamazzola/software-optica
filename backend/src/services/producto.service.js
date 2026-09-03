import ProductoRepository from '../repositories/producto.repository.js';

const ProductoService = {
    async obtenerProducto(buscar = '', categoria = '') {
        return await ProductoRepository.obtenerTodos(buscar, categoria);
    },

    async obtenerMasVendidos() {
        return await ProductoRepository.obtenerMasVendidos();
    },

    async obtenerPorId(id) {
        const producto = await ProductoRepository.obtenerPorId(id);

        if (!producto) {
            throw Error(`El producto con el id ${id} no existe.`);
        }
        return producto;
    },

    async crearProducto({ codigo, nombre, precio, descripcion, categoria }) {
        if (!codigo || codigo.trim() === '') {
            throw Error('El codigo es obligatorio para crear un producto.');
        }
        if (!nombre || nombre.trim() === '') {
            throw Error('El nombre del producto es obligatorio.');
        }
        if (precio === undefined || precio < 0) {
            throw Error('El precio debe ser un número mayor o igual a 0.');
        }

        return await ProductoRepository.crear({ codigo, nombre, precio, descripcion, categoria });
    },

    async eliminarProducto(id) {
        await this.obtenerPorId(id);
        return await ProductoRepository.eliminar(id);
    },

    async actualizarProducto(id, { codigo, nombre, precio, descripcion, categoria }) {
        await this.obtenerPorId(id);
        
        if (!codigo || codigo.trim() === '') {
            throw Error('El codigo es obligatorio para crear un producto.');
        }
        
        if (!nombre || nombre.trim() === '') {
            throw Error('El nombre del producto es obligatorio para actualizarlo.');
        }
        if (precio === undefined || precio < 0) {
            throw Error('El precio debe ser un número mayor o igual a 0.');
        }

        return await ProductoRepository.actualizar(id, { codigo, nombre, precio, descripcion, categoria });
    }

};

export default ProductoService;
