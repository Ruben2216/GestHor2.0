import sugerenciaService from '../services/sugerenciaService.js';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM

const getSugerenciasDocentes = async (req, res) => {
    try {
        const { materiaId, dia, inicio, fin } = req.query;

        // Validaciones básicas
        const matId = parseInt(materiaId, 10);
        if (!matId || isNaN(matId)) {
            return res.status(400).json({ ok: false, mensaje: 'materiaId es requerido y debe ser un número' });
        }
        if (!dia || typeof dia !== 'string') {
            return res.status(400).json({ ok: false, mensaje: 'dia es requerido y debe ser una cadena (ej: "Lunes")' });
        }
        if (!inicio || !TIME_REGEX.test(inicio) || !fin || !TIME_REGEX.test(fin)) {
            return res.status(400).json({ ok: false, mensaje: 'inicio y fin deben tener formato HH:MM' });
        }

        // Normalizar día para emparejar con los valores en la base de datos
        const canonicalDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
        const normalize = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
        const matched = canonicalDays.find(d => normalize(d) === normalize(dia));
        if (!matched) {
            return res.status(400).json({ ok: false, mensaje: 'dia inválido. Use uno de: Lunes, Martes, Miércoles, Jueves, Viernes' });
        }

        // Llamada al servicio con el día normalizado a la forma que está en la BD
        const candidatos = await sugerenciaService(matId, matched, inicio, fin);

        return res.json({ ok: true, candidatos });
    } catch (error) {
        console.error('Error en getSugerenciasDocentes:', error);
        return res.status(500).json({ ok: false, mensaje: 'Error al obtener sugerencias', error: error.message });
    }
};

export { getSugerenciasDocentes };
export default getSugerenciasDocentes;
