import { findCandidatosDocentes } from '../models/docenteModel.js';
import { contarHorasAsignadasSemana } from '../models/horarioModel.js';

/**
 * Servicio responsable de la búsqueda inicial de candidatos y desempate por carga horaria semanal.
 * Recibe los mismos parámetros que el modelo y retorna la lista de candidatos con el campo
 * `horas_asignadas` agregado. Orden global: nivel_prioridad ASC NULLS LAST, luego horas_asignadas ASC.
 */
export const sugerirDocentes = async (materiaId, diaSemana, horaInicio, horaFin) => {
    // 1) Obtener candidatos iniciales (ordenados por prioridad y nombre)
    const candidatos = await findCandidatosDocentes(materiaId, diaSemana, horaInicio, horaFin);

    if (!candidatos || candidatos.length === 0) return [];

    // 2) Agrupar por nivel_prioridad (incluye null)
    const groups = new Map();
    for (const c of candidatos) {
        const key = c.nivel_prioridad === null || c.nivel_prioridad === undefined ? '__NULL__' : String(c.nivel_prioridad);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(c);
    }

    const orderedKeys = Array.from(groups.keys()).sort((a, b) => {
        if (a === '__NULL__' && b === '__NULL__') return 0;
        if (a === '__NULL__') return 1; // nulls last
        if (b === '__NULL__') return -1;
        return Number(a) - Number(b);
    });

    const finalList = [];

    // 3) Para cada grupo con mismo nivel, obtener horas asignadas y reordenar por horas asc
    for (const key of orderedKeys) {
        const group = groups.get(key);
        if (group.length === 1) {
            // calular y anexar horas_asignadas
            const horas = await contarHorasAsignadasSemana(group[0].profesor_id);
            group[0].horas_asignadas = horas.horas_totales || 0;
            finalList.push(group[0]);
            continue;
        }

        // for performance, fetch all counts in parallel
        const promises = group.map(g => contarHorasAsignadasSemana(g.profesor_id).then(r => ({ profesor_id: g.profesor_id, horas: r.horas_totales || 0 })).catch(err => ({ profesor_id: g.profesor_id, horas: 0 })));
        const resultados = await Promise.all(promises);
        const horasMap = new Map(resultados.map(r => [String(r.profesor_id), r.horas]));

        for (const g of group) {
            g.horas_asignadas = horasMap.get(String(g.profesor_id)) || 0;
        }

        // Reordenar por horas_asignadas asc; si empate, conservar orden por apellidos/nombres
        group.sort((x, y) => {
            if (x.horas_asignadas !== y.horas_asignadas) return x.horas_asignadas - y.horas_asignadas;
            if (x.apellidos !== y.apellidos) return x.apellidos.localeCompare(y.apellidos);
            return x.nombres.localeCompare(y.nombres);
        });

        finalList.push(...group);
    }

    return finalList;
};

export default sugerirDocentes;
