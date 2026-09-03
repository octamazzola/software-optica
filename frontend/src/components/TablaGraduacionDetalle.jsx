import React from 'react';

export default function TablaGraduacionDetalle({ graduacion }) {
  if (!graduacion) return null;

  const val = (v) => (v !== null && v !== undefined && v !== '' ? v : '—');

  return (
    <div className="card border-primary border-opacity-25 bg-light bg-opacity-50 mt-3">
      <div className="card-header bg-primary bg-opacity-10 fw-500 text-primary d-flex align-items-center justify-content-between py-2" style={{ fontSize: '0.875rem' }}>
        <span><i className="bi bi-file-earmark-medical me-2"></i>Graduación / Receta Óptica</span>
        <div className="d-flex gap-2">
          {graduacion.material && <span className="badge bg-primary">{graduacion.material}</span>}
          {graduacion.con_antirreflejo === 1 && <span className="badge bg-success">Antirreflejo</span>}
        </div>
      </div>
      <div className="card-body p-3" style={{ fontSize: '0.85rem' }}>
        {/* Atributos extra */}
        <div className="row g-2 mb-3 text-secondary">
          {graduacion.color && <div className="col-auto"><strong>Color:</strong> {graduacion.color}</div>}
          {graduacion.laca && <div className="col-auto ms-3"><strong>Laca:</strong> {graduacion.laca}</div>}
          {graduacion.calibrado && <div className="col-auto ms-3"><strong>Calibrado:</strong> {graduacion.calibrado}</div>}
          {(graduacion.dp_derecho || graduacion.dp_izquierdo) && (
            <div className="col-auto ms-3">
              <strong>DP:</strong> OD {val(graduacion.dp_derecho)} / OI {val(graduacion.dp_izquierdo)} mm
            </div>
          )}
          {(graduacion.altura_derecho || graduacion.altura_izquierdo) && (
            <div className="col-auto ms-3">
              <strong>Alt:</strong> OD {val(graduacion.altura_derecho)} / OI {val(graduacion.altura_izquierdo)} mm
            </div>
          )}
        </div>

        {/* Tabla de Graduación 2x4 */}
        <div className="table-responsive">
          <table className="table table-sm table-bordered text-center mb-0 bg-white" style={{ fontSize: '0.825rem' }}>
            <thead className="table-light">
              <tr>
                <th className="text-start ps-2">Ojo</th>
                <th>Enfoque</th>
                <th>ESF</th>
                <th>CIL</th>
                <th>EJE</th>
                <th>Ø</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan={2} className="align-middle text-start ps-2 fw-bold text-primary">OD (Derecho)</td>
                <td className="bg-light text-secondary">Lejos</td>
                <td>{val(graduacion.esf_od_lejos)}</td>
                <td>{val(graduacion.cil_od_lejos)}</td>
                <td>{val(graduacion.eje_od_lejos)}</td>
                <td>{val(graduacion.diametro_od_lejos)}</td>
              </tr>
              <tr>
                <td className="bg-light text-secondary">Cerca</td>
                <td>{val(graduacion.esf_od_cerca)}</td>
                <td>{val(graduacion.cil_od_cerca)}</td>
                <td>{val(graduacion.eje_od_cerca)}</td>
                <td>{val(graduacion.diametro_od_cerca)}</td>
              </tr>
              <tr>
                <td rowSpan={2} className="align-middle text-start ps-2 fw-bold text-primary">OI (Izquierdo)</td>
                <td className="bg-light text-secondary">Lejos</td>
                <td>{val(graduacion.esf_oi_lejos)}</td>
                <td>{val(graduacion.cil_oi_lejos)}</td>
                <td>{val(graduacion.eje_oi_lejos)}</td>
                <td>{val(graduacion.diametro_oi_lejos)}</td>
              </tr>
              <tr>
                <td className="bg-light text-secondary">Cerca</td>
                <td>{val(graduacion.esf_oi_cerca)}</td>
                <td>{val(graduacion.cil_oi_cerca)}</td>
                <td>{val(graduacion.eje_oi_cerca)}</td>
                <td>{val(graduacion.diametro_oi_cerca)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
