import { dbQuery, dbRun } from '../config/db.js';

// Creamos un objeto con todas las funciones de acceso a datos para clientes
const ClienteRepository = {

  // Obtiene todos los clientes. Si se pasa un texto de búsqueda, filtra por nombre o email.
  async obtenerTodos(buscar = '') {
    if (buscar) {
      // Usamos el operador LIKE de SQL para buscar coincidencias parciales (ej: 'juan' encontrará 'Juan Pérez')
      const sql = `
        SELECT * FROM clientes 
        WHERE nombre LIKE ? OR email LIKE ?
        ORDER BY nombre ASC
      `;
      const termino = `%${buscar}%`;
      return await dbQuery(sql, [termino, termino]);
    }

    // Si no hay búsqueda, traemos todos ordenados por nombre
    return await dbQuery('SELECT * FROM clientes ORDER BY nombre ASC');
  },

  // Busca un cliente por su ID único
  async obtenerPorId(id) {
    const rows = await dbQuery('SELECT * FROM clientes WHERE id = ?', [id]);
    return rows[0] || null; // Si no lo encuentra, devuelve null
  },

  // Inserta un nuevo cliente y devuelve su ID asignado
  async crear({ nombre, telefono, email }) {
    const sql = `
      INSERT INTO clientes (nombre, telefono, email) 
      VALUES (?, ?, ?)
    `;
    const resultado = await dbRun(sql, [nombre, telefono, email]);
    return resultado.id; // Retorna el ID asignado por el AUTOINCREMENT de SQLite
  },

  // Actualiza los datos de un cliente existente
  async actualizar(id, { nombre, telefono, email }) {
    const sql = `
      UPDATE clientes 
      SET nombre = ?, telefono = ?, email = ?
      WHERE id = ?
    `;
    const resultado = await dbRun(sql, [nombre, telefono, email, id]);
    return resultado.changes > 0; // Retorna true si se modificó algún registro
  },
  // Elimina un cliente por su ID
  async eliminar(id) {
    const resultado = await dbRun('DELETE FROM clientes WHERE id = ?', [id]);
    return resultado.changes > 0; // Retorna true si se eliminó algún registro
  }
};

export default ClienteRepository;
