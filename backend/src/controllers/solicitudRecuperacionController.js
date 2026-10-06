import { 
    crearSolicitudRecuperacion,
    obtenerSolicitudesPendientes,
    obtenerTodasSolicitudes,
    resolverSolicitud,
    obtenerEstadisticasSolicitudes,
    obtenerUsuarioPorSolicitud,
    registrarActividad,
    obtenerActividadesRecientes
} from '../models/solicitudRecuperacionModel.js';
import { findUserByEmail, actualizarPassword, actualizarTokenAcceso } from '../models/userModel.js';
import { generarTokenAcceso } from '../utils/tokenGenerator.js';
import { enviarCorreoRecuperacion } from '../services/emailService.js';
import bcrypt from 'bcrypt';

const crearSolicitudController = async (req, res) => {
    try {
        const { email, motivo } = req.body;

        if (!email || !motivo) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Email y motivo son requeridos'
            });
        }

        const usuario = await findUserByEmail(email);
        
        if (!usuario) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No existe una cuenta registrada con ese correo electrónico'
            });
        }

        const solicitud = await crearSolicitudRecuperacion(usuario.usuario_id, motivo);
        
        await registrarActividad(
            solicitud.solicitud_id,
            'SOLICITUD_CREADA',
            `Solicitud creada por ${email}`
        );

        res.status(201).json({
            ok: true,
            mensaje: 'Solicitud de recuperación creada exitosamente',
            solicitud
        });
    } catch (error) {
        console.error('Error en crearSolicitudController:', error);
        res.status(500).json({
            ok: false,
            mensaje: 'Error al crear la solicitud de recuperación',
            error: error.message
        });
    }
};

const obtenerSolicitudesPendientesController = async (req, res) => {
    try {
        const solicitudes = await obtenerSolicitudesPendientes();
        
        res.json({
            ok: true,
            solicitudes
        });
    } catch (error) {
        console.error('Error en obtenerSolicitudesPendientesController:', error);
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener solicitudes pendientes',
            error: error.message
        });
    }
};

const obtenerTodasSolicitudesController = async (req, res) => {
    try {
        const solicitudes = await obtenerTodasSolicitudes();
        
        res.json({
            ok: true,
            solicitudes
        });
    } catch (error) {
        console.error('Error en obtenerTodasSolicitudesController:', error);
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener todas las solicitudes',
            error: error.message
        });
    }
};

const resolverSolicitudController = async (req, res) => {
    try {
        const { solicitudId } = req.params;

        const solicitud = await resolverSolicitud(solicitudId);

        res.json({
            ok: true,
            mensaje: 'Solicitud resuelta exitosamente',
            solicitud
        });
    } catch (error) {
        console.error('Error en resolverSolicitudController:', error);
        res.status(500).json({
            ok: false,
            mensaje: 'Error al resolver la solicitud',
            error: error.message
        });
    }
};

const obtenerEstadisticasController = async (req, res) => {
    try {
        const estadisticas = await obtenerEstadisticasSolicitudes();
        
        res.json({
            ok: true,
            estadisticas
        });
    } catch (error) {
        console.error('Error en obtenerEstadisticasController:', error);
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};

const regenerarPasswordController = async (req, res) => {
    try {
        const { solicitudId } = req.params;

        console.log('📝 Regenerando contraseña para solicitud:', solicitudId);

        console.log('🔍 Obteniendo usuario...');
        const usuario = await obtenerUsuarioPorSolicitud(solicitudId);
        
        if (!usuario) {
            console.error('❌ Usuario no encontrado para solicitud:', solicitudId);
            return res.status(404).json({
                ok: false,
                mensaje: 'Solicitud no encontrada o usuario no existe'
            });
        }

        console.log('✅ Usuario encontrado:', usuario.email);
        console.log('🔐 Generando nuevo token...');
        const nuevoToken = generarTokenAcceso();
        const hashedToken = await bcrypt.hash(nuevoToken, 10);

        console.log('💾 Actualizando password...');
        await actualizarPassword(usuario.usuario_id, hashedToken);
        
        console.log('💾 Actualizando token de acceso...');
        await actualizarTokenAcceso(usuario.usuario_id, nuevoToken);

        console.log('✅ Marcando solicitud como resuelta...');
        await resolverSolicitud(solicitudId);

        const nombreCompleto = usuario.nombre_completo || usuario.email.split('@')[0];

        console.log('� Registrando actividad...');
        await registrarActividad(
            solicitudId,
            'PASSWORD_GENERADO',
            `Nueva contraseña enviada a ${nombreCompleto}`
        );

        console.log('📧 Enviando correo...');
        enviarCorreoRecuperacion({
            email: usuario.email,
            nombreCompleto: nombreCompleto,
            token: nuevoToken
        }).then(resultado => {
            if (resultado.success) {
                console.log(`✅ Correo de recuperación enviado a ${usuario.email}`);
            } else {
                console.warn(`⚠️ No se pudo enviar correo a ${usuario.email}`);
            }
        }).catch(error => {
            console.error(`❌ Error al enviar correo:`, error);
        });

        console.log('✅ Proceso completado exitosamente');
        res.json({
            ok: true,
            mensaje: 'Contraseña regenerada y enviada al correo del usuario',
            nuevoToken
        });
    } catch (error) {
        console.error('❌ Error en regenerarPasswordController:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            ok: false,
            mensaje: 'Error al regenerar la contraseña',
            error: error.message
        });
    }
};

const obtenerActividadesRecientesController = async (req, res) => {
    try {
        const limite = parseInt(req.query.limite) || 10;
        const actividades = await obtenerActividadesRecientes(limite);
        
        res.json({
            ok: true,
            actividades
        });
    } catch (error) {
        console.error('Error en obtenerActividadesRecientesController:', error);
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener actividades recientes',
            error: error.message
        });
    }
};

export {
    crearSolicitudController,
    obtenerSolicitudesPendientesController,
    obtenerTodasSolicitudesController,
    resolverSolicitudController,
    obtenerEstadisticasController,
    regenerarPasswordController,
    obtenerActividadesRecientesController
};
