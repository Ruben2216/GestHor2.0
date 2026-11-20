import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer el archivo CSS
const emailStyles = fs.readFileSync(
    path.join(__dirname, 'emailStyles.css'),
    'utf-8'
);

export const plantillaBienvenida = ({ nombreCompleto, token, adminEmail }) => {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a GestHor</title>
    <style>
        ${emailStyles}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Sistema GestHor</h1>
            <p>Gestión de Horarios</p>
        </div>
        
        <div class="content">
            <p>Hola <strong>${nombreCompleto}</strong>,</p>
            
            <p>Has sido dado de alta en el <strong>Sistema GestHor</strong>, la plataforma de gestión de horarios académicos de la institución.</p>
            
            <p>Este sistema te permitirá administrar tu disponibilidad, consultar tus horarios asignados y coordinar tus actividades académicas.</p>
            
            <p><strong>Cuenta creada por:</strong> ${adminEmail}</p>
            
            <div class="token-box">
                <div class="token-label">Tu llave de acceso permanente:</div>
                <div class="token-value">${token}</div>
            </div>
            
            <p>Esta llave de acceso es <strong>permanente</strong> y será necesaria cada vez que ingreses al sistema. Te recomendamos guardarla en un lugar seguro.</p>
            
            <div class="alert-box">
                <p><strong> Importante:</strong> Tienes un máximo de <strong>72 horas</strong> para completar tu horario personal en el sistema.</p>
            </div>
            
            <p>Si tienes alguna duda o problema, contacta al administrador del sistema.</p>
        </div>
        
        <div class="footer">
            <p><strong>Sistema GestHor</strong></p>
            <p>Gestión de Horarios Académicos</p>
            <p>© ${new Date().getFullYear()} - Este es un correo automático</p>
        </div>
    </div>
</body>
</html>
    `.trim();
};

export const plantillaRecuperacion = ({ nombreCompleto, nuevoToken }) => {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de Contraseña - GestHor</title>
    <style>
        ${emailStyles}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Sistema GestHor</h1>
            <p>Recuperación de Contraseña</p>
        </div>
        
        <div class="content">
            <p>Hola <strong>${nombreCompleto}</strong>,</p>
            
            <p>Tu solicitud de recuperación de contraseña ha sido procesada exitosamente por el administrador del sistema.</p>
            
            <div class="token-box">
                <div class="token-label">Tu nueva llave de acceso:</div>
                <div class="token-value">${nuevoToken}</div>
            </div>
            
            <p>Esta nueva llave de acceso reemplaza la anterior. Úsala para iniciar sesión en el sistema.</p>
            
            <div class="alert-box">
                <p><strong> Importante:</strong> Guarda esta llave en un lugar seguro. Será necesaria cada vez que ingreses al sistema.</p>
            </div>
            
            <p>Si no solicitaste este cambio, contacta inmediatamente al administrador del sistema.</p>
        </div>
        
        <div class="footer">
            <p><strong>Sistema GestHor</strong></p>
            <p>Gestión de Horarios Académicos</p>
            <p>© ${new Date().getFullYear()} - Este es un correo automático</p>
        </div>
    </div>
</body>
</html>
    `.trim();
};

export const plantillaCodigoRecuperacion = ({ nombreCompleto, codigo, expiresInHours }) => {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de recuperación - GestHor</title>
    <style>
        ${emailStyles}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Sistema GestHor</h1>
            <p>Recuperación de contraseña</p>
        </div>
        <div class="content">
            <p>Hola <strong>${nombreCompleto}</strong>,</p>
            <p>Usa este código de 6 dígitos para restablecer tu contraseña:</p>
            <div class="token-box">
                <div class="token-label">Código de recuperación</div>
                <div class="token-value">${codigo}</div>
            </div>
            <p>El código vence en <strong>${expiresInHours} horas</strong> y solo puede utilizarse una vez.</p>
            <p>Si no solicitaste recuperar tu contraseña, puedes ignorar este correo.</p>
        </div>
        <div class="footer">
            <p><strong>Sistema GestHor</strong></p>
            <p>© ${new Date().getFullYear()} - Este es un correo automático</p>
        </div>
    </div>
</body>
</html>
    `.trim();
};

export const plantillaEnvioHorario = ({ nombreCompleto }) => {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tu Horario Asignado - GestHor</title>
    <style>
        ${emailStyles}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Sistema GestHor</h1>
            <p>Notificación de Horario</p>
        </div>
        
        <div class="content">
            <p>Hola <strong>${nombreCompleto}</strong>,</p>
            
            <p>Te informamos que tu horario de clases ha sido actualizado por un administrador.</p>
            
            <p>Puedes encontrar el documento PDF con tu horario semanal adjunto en este correo.</p>
            
            <div class="alert-box">
                <p><strong>Importante:</strong> Revisa el documento adjunto para conocer tus clases y salones asignados. También puedes consultar tu horario en cualquier momento iniciando sesión en el sistema.</p>
            </div>
            
            <p>Si tienes alguna duda, contacta al administrador del sistema.</p>
        </div>
        
        <div class="footer">
            <p><strong>Sistema GestHor</strong></p>
            <p>Gestión de Horarios Académicos</p>
            <p>© ${new Date().getFullYear()} - Este es un correo automático</p>
        </div>
    </div>
</body>
</html>
    `.trim();
};


export const plantillaCodigo2FA = ({ nombreCompleto, codigo }) => {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificación de acceso - GestHor</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(26,95,180,0.10); }
        .header { background: linear-gradient(135deg, #1a5fb4 0%, #298ce7 100%); padding: 32px 24px 24px; text-align: center; }
        .header h1 { color: #fff; margin: 0 0 4px; font-size: 1.7rem; letter-spacing: 1px; }
        .header p { color: #bfdbfe; margin: 0; font-size: 0.95rem; }
        .content { padding: 32px 32px 24px; }
        .content p { color: #333; line-height: 1.6; margin: 0 0 16px; }
        .code-box { background: #eff6ff; border: 2px solid #bfdbfe; border-radius: 12px; text-align: center; padding: 24px 16px; margin: 24px 0; }
        .code-label { color: #1a5fb4; font-size: 0.85rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
        .code-value { font-size: 2.8rem; font-weight: 800; letter-spacing: 10px; color: #1a5fb4; font-family: 'Courier New', monospace; }
        .warning { background: #fff7ed; border-left: 4px solid #f97316; border-radius: 6px; padding: 12px 16px; color: #9a3412; font-size: 0.9rem; margin: 16px 0; }
        .footer { background: #f8fafc; padding: 16px 32px; text-align: center; color: #94a3b8; font-size: 0.82rem; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>GestHor</h1>
            <p>Verificación de acceso en dos pasos</p>
        </div>
        <div class="content">
            <p>Hola <strong>${nombreCompleto}</strong>,</p>
            <p>Alguien (esperamos que seas tú) está intentando iniciar sesión en tu cuenta. Usa el siguiente código de verificación:</p>
            <div class="code-box">
                <div class="code-label">Código de acceso</div>
                <div class="code-value">${codigo}</div>
            </div>
            <div class="warning">
                ⏱ Este código expira en <strong>10 minutos</strong> y solo puede usarse una vez.
            </div>
            <p>Si no estás intentando iniciar sesión, alguien podría tener tus credenciales. Te recomendamos cambiar tu contraseña inmediatamente.</p>
        </div>
        <div class="footer">
            <p><strong>Sistema GestHor — UNACH</strong></p>
            <p>© ${new Date().getFullYear()} — Este es un correo automático, por favor no respondas.</p>
        </div>
    </div>
</body>
</html>`;
};
