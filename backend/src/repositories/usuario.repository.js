import { dbQuery, dbRun } from '../config/db.js';

const UsuarioRepository = {
  async buscarPorUsername(username) {
    const rows = await dbQuery(
      'SELECT id, username, password, rol, nombre, activo, creado_en FROM usuarios WHERE username = ?',
      [username]
    );
    return rows[0] || null;
  },

  async buscarPorId(id) {
    const rows = await dbQuery(
      'SELECT id, username, rol, nombre, activo, creado_en FROM usuarios WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async crear({ username, password, rol = 'vendedor', nombre }) {
    const sql = `
      INSERT INTO usuarios (username, password, rol, nombre, activo)
      VALUES (?, ?, ?, ?, 1)
    `;
    const resultado = await dbRun(sql, [username, password, rol, nombre]);
    return resultado.id;
  },

  async listar() {
    return await dbQuery(
      'SELECT id, username, rol, nombre, activo, creado_en FROM usuarios ORDER BY id ASC'
    );
  },

  async actualizar(id, { nombre, rol, activo }) {
    const sql = `
      UPDATE usuarios
      SET nombre = ?, rol = ?, activo = ?
      WHERE id = ?
    `;
    const resultado = await dbRun(sql, [nombre, rol, activo, id]);
    return resultado.changes > 0;
  },

  async actualizarPassword(id, hashedPassword) {
    const sql = 'UPDATE usuarios SET password = ? WHERE id = ?';
    const resultado = await dbRun(sql, [hashedPassword, id]);
    return resultado.changes > 0;
  },

  async eliminar(id) {
    const sql = 'DELETE FROM usuarios WHERE id = ?';
    const resultado = await dbRun(sql, [id]);
    return resultado.changes > 0;
  }
};

export default UsuarioRepository;
