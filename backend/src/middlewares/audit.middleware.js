import { dbRun } from '../config/db.js';

export const auditMiddleware = async (req, res, next) => {
    // Interceptar el end de la respuesta para asegurarnos de que la acción fue exitosa
    const originalSend = res.send;
    
    res.send = function (data) {
        res.send = originalSend;
        
        // Ejecutar el envío normal
        res.send(data);
        
        // Loguear solo si la petición fue exitosa (200-299)
        // y si el método es modificador (POST, PUT, DELETE)
        if (res.statusCode >= 200 && res.statusCode < 300 && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
            const usuario_id = req.user?.id || null;
            const accion = req.method;
            const tabla = req.baseUrl.split('/').pop() || 'desconocido';
            
            // Intentar inferir el ID del registro afectado
            let registro_id = null;
            if (req.params.id) {
                registro_id = req.params.id;
            } else if (data && typeof data === 'string') {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.id) registro_id = parsed.id;
                    if (parsed.ventaId) registro_id = parsed.ventaId;
                } catch (e) {
                    // Ignorar si no se puede parsear
                }
            }

            const detalle = `Endpoint: ${req.originalUrl}`;
            // Obtener IP (considerar que puede estar tras un proxy)
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

            dbRun(
                'INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, detalle, ip) VALUES (?, ?, ?, ?, ?, ?)',
                [usuario_id, accion, tabla, registro_id, detalle, ip]
            ).catch(err => console.error('Error al guardar log de auditoría:', err.message));
        }
    };
    
    next();
};

export default auditMiddleware;
