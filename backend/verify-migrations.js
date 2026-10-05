import { dbConnection } from './src/config/database.js';

async function check() {
  const roles = await dbConnection.any('SELECT * FROM roles');
  console.log('Roles:', JSON.stringify(roles, null, 2));
  
  const rp = await dbConnection.any('SELECT r.nombre_rol, p.clave FROM rol_permisos rp JOIN roles r ON r.rol_id = rp.rol_id JOIN permisos p ON p.permiso_id = rp.permiso_id ORDER BY r.nombre_rol, p.clave');
  console.log('\nRol-Permisos:');
  rp.forEach(r => console.log('  ' + r.nombre_rol + ': ' + r.clave));
  
  try {
    const aud = await dbConnection.one('SELECT COUNT(*) as count FROM auditoria');
    console.log('\nAuditoria table:', aud.count + ' rows');
  } catch (e) {
    console.log('\nAuditoria table: MISSING');
  }
  
  const newPerms = await dbConnection.any("SELECT clave FROM permisos WHERE clave LIKE 'lugares:%' OR clave LIKE 'periodos:%' OR clave IN ('roles:gestionar','permisos:gestionar','auditoria:leer')");
  console.log('\nNew permisos:', newPerms.map(p => p.clave).join(', '));
  
  process.exit(0);
}

check().catch(err => { console.error(err); process.exit(1); });