import { obtenerDisponibilidadProfesor, obtenerPreferenciasProfesor } from '../models/disponibilidadModel.js';
import { obtenerMateriasPorProfesor } from '../models/profesorMateriaModel.js';

const obtenerInfoHorariosProfesor = async (req, res) => {
    try {
        const { profesorId } = req.params;

        if (!profesorId || profesorId === 'undefined') {
            return res.status(400).json({ 
                ok: false, 
                mensaje: 'ID de profesor inválido' 
            });
        }

        // Obtener datos en paralelo (optimización)
        const [disponibilidad, preferencias, materias] = await Promise.all([
            obtenerDisponibilidadProfesor(profesorId),
            obtenerPreferenciasProfesor(profesorId),
            obtenerMateriasPorProfesor(profesorId)
        ]);

        res.json({
            ok: true,
            data: {
                disponibilidad: disponibilidad || [],
                preferencias: preferencias || null,
                materias: materias || []
            }
        });
    } catch (error) {
        console.error('Error en obtenerInfoHorariosProfesor:', error);
        res.status(500).json({ 
            ok: false, 
            mensaje: 'Error al obtener información del profesor',
            error: error.message 
        });
    }
};

const validarProfesorMateria = async (req, res) => {
    try {
        const { profesorId, materiaId } = req.body;

        if (!profesorId || !materiaId) {
            return res.status(400).json({ 
                ok: false, 
                mensaje: 'ID de profesor y materia son requeridos' 
            });
        }

        const materias = await obtenerMateriasPorProfesor(profesorId);
        
        const puedeImpartir = materias.some(
            materia => materia.materia_id === parseInt(materiaId)
        );

        res.json({
            ok: true,
            puedeImpartir,
            mensaje: puedeImpartir 
                ? 'La materia está registrada en el perfil del profesor'
                : '⚠️ Advertencia: Esta materia NO está en el perfil del profesor',
            requiereConfirmacion: !puedeImpartir
        });
    } catch (error) {
        console.error('Error en validarProfesorMateria:', error);
        res.status(500).json({ 
            ok: false, 
            mensaje: 'Error al validar profesor-materia',
            error: error.message 
        });
    }
};

export {
    obtenerInfoHorariosProfesor,
    validarProfesorMateria
};
