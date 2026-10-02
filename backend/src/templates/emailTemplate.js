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
