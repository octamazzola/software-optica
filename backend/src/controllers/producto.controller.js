import ProductoService from "../services/producto.service.js"

const ProductoController = {

    async obtenerProductos(req, res) {
        const { buscar } = req.query;
        const productos = await ProductoService.obtenerProducto(buscar);
        res.json(productos);
    },

    async obtenerPorCodigo(req, res) {
        const { codigo } = req.params;
        const producto = await ProductoService.obtenerPorCodigo(codigo);
        res.json(producto);
    },

    async crearProducto(req, res) {
        const { codigo, nombre, precio, descripcion } = req.body;
        const nuevoId = await ProductoService.crearProducto({ codigo, nombre, precio, descripcion });
        res.status(201).json({ message: "Producto agregado correctamente.", id: nuevoId });
    },

    async actualizarProducto(req, res) {
        const { codigo } = req.params;
        const { nombre, precio, descripcion } = req.body;
        await ProductoService.actualizarProducto(codigo, { nombre, precio, descripcion });
        res.status(200).json({ message: "Producto actualizado correctamente." });
    },

    async eliminarProducto(req, res) {
        const { codigo } = req.params;
        await ProductoService.eliminarProducto(codigo);
        res.status(200).json({ message: "Producto eliminado correctamente." });
    }

};

export default ProductoController;