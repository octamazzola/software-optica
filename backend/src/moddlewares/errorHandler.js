const errorHandler = (err, req, res, next) => {
    console.error(" Error capturado en la red de seguridad", err.message);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({ error: err.message || 'Ocurrio un erro inesperado' });
};

export default errorHandler;