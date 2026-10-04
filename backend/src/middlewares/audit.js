import * as auditService from '../services/auditService.js';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function getResource(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const apiIndex = segments.indexOf('api');
  const resourceSegments = apiIndex >= 0 ? segments.slice(apiIndex + 1) : segments;

  if (resourceSegments[0] === 'auth') return 'autenticacion';
  if (resourceSegments[0] === 'admin' && resourceSegments[1]) {
    if (resourceSegments[3] === 'permisos') return 'permisos';
    return resourceSegments[1];
  }

  return resourceSegments[0] || 'sistema';
}

function getAction(method, pathname, succeeded, resource) {
  const normalizedPath = pathname.replace(/\/+$/, '');
  const result = succeeded ? 'exitoso' : 'fallido';

  if (normalizedPath === '/api/auth/login') return `login_${result}`;
  if (normalizedPath === '/api/auth/google/callback') return `google_login_${result}`;
  if (normalizedPath === '/api/auth/google/failure') return 'google_login_fallido';
  if (normalizedPath === '/api/auth/logout') return `logout_${result}`;
  if (normalizedPath === '/api/auth/change-password') return `cambio_contrasena_${result}`;
  if (normalizedPath === '/api/auth/forgot-password') return `recuperacion_solicitada_${result}`;
  if (normalizedPath === '/api/auth/reset-password') return `contrasena_restablecida_${result}`;

  return `${resource}_${method.toLowerCase()}_${result}`;
}

export function auditRequest(req, res, next) {
  const pathname = req.originalUrl.split('?')[0];
  const normalizedPath = pathname.replace(/\/+$/, '');
  const isLogin = normalizedPath === '/api/auth/login'
    || normalizedPath === '/api/auth/google/callback'
    || normalizedPath === '/api/auth/google/failure';
  const isLogout = normalizedPath === '/api/auth/logout';
  const isMutation = MUTATING_METHODS.has(req.method);

  if (!isLogin && !isLogout && !isMutation) return next();

  const resource = getResource(pathname);
  res.once('finish', () => {
    const googleAuthenticationRedirectedToFailure = normalizedPath === '/api/auth/google/callback'
      && String(res.getHeader('Location') || '').includes('/api/auth/google/failure');
    const succeeded = !req.auditFailed
      && normalizedPath !== '/api/auth/google/failure'
      && !googleAuthenticationRedirectedToFailure
      && res.statusCode >= 200 && res.statusCode < 400;
    const event = {
      usuarioId: req.user?.id || null,
      email: req.user?.email || req.body?.email || req.body?.correo || null,
      rol: req.user?.rol || null,
      direccionIp: req.ip || req.socket?.remoteAddress || null,
      accion: getAction(req.method, normalizedPath, succeeded, resource),
      resultado: succeeded ? 'exitoso' : 'fallido',
      recurso: resource,
      metodoHttp: req.method,
      ruta: normalizedPath,
    };

    auditService.registrarAuditoria(event).catch((error) => {
      console.error('Error al registrar auditoría:', error);
    });
  });

  next();
}
