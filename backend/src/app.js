import express from 'express';
import cors from 'cors';
import clientesRoutes from './routes/clientes.routes.js';
import productoRoutes from './routes/producto.routes.js';
import errorHandler from './moddlewares/errorHandler.js';
import ventaRoutes from './routes/venta.routes.js';

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/clientes', clientesRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'El servidor de la Óptica está funcionando correctamente.'
    })
});

app.use(errorHandler);


export default app;