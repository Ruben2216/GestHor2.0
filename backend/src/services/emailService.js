import { createTransport } from 'nodemailer';
import { env, getResetPasswordUrl } from '../config/env.js';
import { plantillaBienvenida, plantillaRecuperacion, plantillaEnvioHorario } from '../templates/emailTemplate.js';

const crearTransporter = () => {
    return createTransport({
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.secure,
        auth: {
            user: env.smtp.user,
            pass: env.smtp.password
        },
        tls: {
            rejectUnauthorized: env.smtp.tlsRejectUnauthorized
        }
    });
};

const getFromAddress = () => ({
    name: env.smtp.fromName,
    address: env.smtp.fromEmail
});

export const enviarCorreoBienvenida = async ({ email, nombreCompleto, token }) => {
    try {
        const transporter = crearTransporter();
        const adminEmail = 'admin@unach.mx';
        
        const html = plantillaBienvenida({
            nombreCompleto,
            token,
            adminEmail
        });
        
        const mailOptions = {
            from: getFromAddress(),
            to: email,
            subject: `Bienvenido a ${env.app.name} - Tu llave de acceso`,
            html
        };
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`✅ Correo de bienvenida enviado a ${email} - ID: ${info.messageId}`);
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Error al enviar correo de bienvenida a ${email}:`, error.message);
        return { success: false, error: error.message };
    }
};

export const enviarCorreoConAdjunto = async ({ email, nombreCompleto, pdfBuffer, nombreArchivo }) => {
    try {
        const transporter = crearTransporter();
        
        const html = plantillaEnvioHorario({ nombreCompleto });
        
        const mailOptions = {
            from: getFromAddress(),
            to: email,
            subject: `Tu Horario de Clases Asignado - ${env.app.name}`,
            html,
            attachments: [{
                filename: nombreArchivo,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        };
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`✅ Correo con horario enviado a ${email} - ID: ${info.messageId}`);
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Error al enviar correo con adjunto a ${email}:`, error.message);
        return { success: false, error: error.message };
    }
};

export const enviarCorreoRecuperacion = async ({ email, nombreCompleto, token }) => {
    try {
        const transporter = crearTransporter();
        
        const resetUrl = getResetPasswordUrl(token);
        
        const html = plantillaRecuperacion({
            nombreCompleto,
            nuevoToken: token,
            resetUrl,
            appName: env.app.name,
            frontendUrl: env.frontend.url
        });
        
        const mailOptions = {
            from: getFromAddress(),
            to: email,
            subject: `Recuperación de Contraseña - ${env.app.name}`,
            html
        };
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`✅ Correo de recuperación enviado a ${email} - ID: ${info.messageId}`);
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Error al enviar correo de recuperación a ${email}:`, error.message);
        return { success: false, error: error.message };
    }
};

export const enviarCorreoVerificacion = async ({ email, nombreCompleto, token }) => {
    try {
        const transporter = crearTransporter();
        
        const { getEmailVerificationUrl } = await import('../config/env.js');
        const verificationUrl = getEmailVerificationUrl(token);
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">${env.app.name}</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #eee;">
                    <h2 style="color: #333; margin-top: 0;">Verifica tu correo electrónico</h2>
                    <p>Hola <strong>${nombreCompleto}</strong>,</p>
                    <p>Gracias por registrarte en ${env.app.name}. Para completar tu registro, por favor verifica tu dirección de correo electrónico haciendo clic en el botón de abajo:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verificar mi correo</a>
                    </div>
                    <p>O copia y pega este enlace en tu navegador:</p>
                    <p style="word-break: break-all; color: #666; font-size: 14px;">${verificationUrl}</p>
                    <p>Este enlace expirará en 24 horas.</p>
                    <p>Si no creaste una cuenta en ${env.app.name}, puedes ignorar este correo.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">Este es un correo automático, por favor no respondas.</p>
                </div>
            </body>
            </html>
        `;
        
        const mailOptions = {
            from: getFromAddress(),
            to: email,
            subject: `Verifica tu correo electrónico - ${env.app.name}`,
            html
        };
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`✅ Correo de verificación enviado a ${email} - ID: ${info.messageId}`);
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Error al enviar correo de verificación a ${email}:`, error.message);
        return { success: false, error: error.message };
    }
};