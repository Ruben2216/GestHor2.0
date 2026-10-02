import { useState, useEffect } from "react";
import { useToast } from "../components/ui/NotificacionFlotante";
import { 
    obtenerCarreras, 
    crearCarrera, 
    eliminarCarrera,
    obtenerCarreraPorId 
} from "../services/carreraService";

export function useCarreras() {
    const [carreras, setCarreras] = useState([]);
    const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
    const [cargando, setCargando] = useState(false);
    const { notify } = useToast();

    const cargarCarreras = async () => {
        try {
            setCargando(true);
            const data = await obtenerCarreras();
            setCarreras(data.carreras || []);
        } catch (error) {
            console.error("Error al cargar carreras:", error);
            notify({ type: 'error', message: 'Error al cargar carreras' });
        } finally {
            setCargando(false);
        }
    };

    const agregarCarrera = async (datosCarrera) => {
        try {
            setCargando(true);
            const respuesta = await crearCarrera(datosCarrera);
            notify({ type: 'success', message: 'Carrera creada exitosamente. Ahora asigna las materias.' });
            
            const nuevaCarrera = respuesta.carrera;
            if (nuevaCarrera) {
                setCarreraSeleccionada({
                    carrera_id: nuevaCarrera.carrera_id,
                    nombre_carrera: nuevaCarrera.nombre_carrera,
                    total_semestres: nuevaCarrera.total_semestres,
                    materias: {}
                });
            }
            
            await cargarCarreras();
            return nuevaCarrera;
        } catch (error) {
            console.error("Error al crear carrera:", error);
            notify({ type: 'error', message: error.response?.data?.mensaje || 'Error al crear la carrera' });
            throw error;
        } finally {
            setCargando(false);
        }
    };

    const eliminarCarreraById = async (id) => {
        if (!confirm("¿Eliminar esta carrera? También se eliminarán sus asignaciones de materias.")) return;

        try {
            setCargando(true);
            await eliminarCarrera(id);
            notify({ type: 'success', message: 'Carrera eliminada exitosamente' });
            await cargarCarreras();

            if (carreraSeleccionada?.carrera_id === id) {
                setCarreraSeleccionada(null);
            }
        } catch (error) {
            console.error("Error al eliminar carrera:", error);
            notify({ type: 'error', message: 'Error al eliminar la carrera' });
        } finally {
            setCargando(false);
        }
    };

    const seleccionarCarrera = async (carrera) => {
        try {
            setCargando(true);
            const detalle = await obtenerCarreraPorId(carrera.carrera_id);
            setCarreraSeleccionada(detalle.carrera);
        } catch (error) {
            console.error("Error al cargar detalle de carrera:", error);
            notify({ type: 'error', message: 'Error al cargar la carrera' });
        } finally {
            setCargando(false);
        }
    };

    const recargarCarreraSeleccionada = async () => {
        if (!carreraSeleccionada) return;
        
        try {
            const detalle = await obtenerCarreraPorId(carreraSeleccionada.carrera_id);
            setCarreraSeleccionada(detalle.carrera);
        } catch (error) {
            console.error("Error al recargar carrera:", error);
        }
    };

    useEffect(() => {
        cargarCarreras();
    }, []);

    return {
        carreras,
        carreraSeleccionada,
        cargando,
        cargarCarreras,
        agregarCarrera,
        eliminarCarreraById,
        seleccionarCarrera,
        setCarreraSeleccionada,
        recargarCarreraSeleccionada
    };
}
