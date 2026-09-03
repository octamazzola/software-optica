import { dbQuery, dbRun } from '../config/db.js';

const GraduacionRepository = {
    async crear(datos) {
        const {
            venta_id,
            material = null,
            con_antirreflejo = 0,
            color = null,
            laca = null,
            calibrado = null,
            dp_derecho = null,
            dp_izquierdo = null,
            altura_derecho = null,
            altura_izquierdo = null,
            esf_od_lejos = null,
            cil_od_lejos = null,
            eje_od_lejos = null,
            diametro_od_lejos = null,
            esf_od_cerca = null,
            cil_od_cerca = null,
            eje_od_cerca = null,
            diametro_od_cerca = null,
            esf_oi_lejos = null,
            cil_oi_lejos = null,
            eje_oi_lejos = null,
            diametro_oi_lejos = null,
            esf_oi_cerca = null,
            cil_oi_cerca = null,
            eje_oi_cerca = null,
            diametro_oi_cerca = null
        } = datos;

        const sql = `
            INSERT INTO graduaciones (
                venta_id, material, con_antirreflejo, color, laca, calibrado,
                dp_derecho, dp_izquierdo, altura_derecho, altura_izquierdo,
                esf_od_lejos, cil_od_lejos, eje_od_lejos, diametro_od_lejos,
                esf_od_cerca, cil_od_cerca, eje_od_cerca, diametro_od_cerca,
                esf_oi_lejos, cil_oi_lejos, eje_oi_lejos, diametro_oi_lejos,
                esf_oi_cerca, cil_oi_cerca, eje_oi_cerca, diametro_oi_cerca
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?
            )
        `;

        const params = [
            venta_id, material, con_antirreflejo ? 1 : 0, color, laca, calibrado,
            dp_derecho, dp_izquierdo, altura_derecho, altura_izquierdo,
            esf_od_lejos, cil_od_lejos, eje_od_lejos, diametro_od_lejos,
            esf_od_cerca, cil_od_cerca, eje_od_cerca, diametro_od_cerca,
            esf_oi_lejos, cil_oi_lejos, eje_oi_lejos, diametro_oi_lejos,
            esf_oi_cerca, cil_oi_cerca, eje_oi_cerca, diametro_oi_cerca
        ];

        const resultado = await dbRun(sql, params);
        return resultado.id;
    },

    async obtenerPorVentaId(ventaId) {
        const sql = `SELECT * FROM graduaciones WHERE venta_id = ?`;
        const rows = await dbQuery(sql, [ventaId]);
        return rows[0] || null;
    },

    async obtenerPorVentaIds(ventaIds) {
        if (!ventaIds || ventaIds.length === 0) return [];
        const placeholders = ventaIds.map(() => '?').join(',');
        const sql = `SELECT * FROM graduaciones WHERE venta_id IN (${placeholders})`;
        return await dbQuery(sql, ventaIds);
    },

    async eliminarPorVentaId(ventaId) {
        const sql = `DELETE FROM graduaciones WHERE venta_id = ?`;
        return await dbRun(sql, [ventaId]);
    }
};

export default GraduacionRepository;
