const errorHandler = (err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error capturado:`, err.message);

    let status = err.status || err.statusCode;
    if (!status) {
        if (/no existe/i.test(err.message)) {
            status = 404;
        } else if (/obligatorio|debe|inválido|invalido|no ambos ni ninguno/i.test(err.message)) {
            status = 400;
        } else {
            status = 500;
        }
    }
    const response = {
        error: status === 500 && process.env.NODE_ENV === 'production' 
            ? 'Error interno del servidor' 
            : (err.message || 'Ocurrió un error inesperado')
    };

    if (process.env.NODE_ENV !== 'production' && err.stack) {
        response.stack = err.stack;
    }

    res.status(status).json(response);
};

export default errorHandler;
