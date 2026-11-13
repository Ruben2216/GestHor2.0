
# GestHor
Para clonar el repositorio hacer lo siguiente:
git clone https://github.com/FernandoVargas15/GestHor.git

# Instalar dependencias del frontend
cd frontend/frontweb && npm install

# Instalar dependencias del backend
cd ../../backend/backapi && npm install

# Probar que el backend funciona
1. Ir dentro de la carpeta backend/backapi
2. Iniciar con el comando npm run dev
3. GestHor backend funcionando ✅
3. CTRL + C para finalizar

# Probar que el frontend funciona
1. Ir dentro de la carpeta frontend/frontweb
2. Iniciar con el comando npm run dev
3. Muesta la pagina con vite + react ✅
4. CTRL + C para finalizar

# Notas
Recuerda correr npm install después de clonar.
El backend debe estar en ejecución para que el frontend pueda comunicarse con él.


# EJECUTAR
sudo apt install postgresql postgresql-contrib
sudo apt install apache2 -y

INICIAR SERVICIOS
sudo systemctl start apache2      # Inicia pgAdmin4 (interfaz web)
sudo systemctl start postgresql   # Inicia PostgreSQL (base de datos)

ABRIR EN http://localhost/pgadmin4/

FINALIZAR SERVICIOS
sudo systemctl stop apache2       # Detiene pgAdmin4 (interfaz web)
sudo systemctl stop postgresql    # Detiene PostgreSQL (base de datos)

# BASE DE DATOS
ejecutar el .sql dentro de 'Query tool' de pgAdmin4 web con el nombre de GesThor la BDTS 

# Copia local de la BD de práctica
Cada integrante puede crear su propia copia limpia de la BD de práctica en su
instalación local de PostgreSQL 18. El repositorio incluye únicamente el
esquema sin registros en `backend/src/database/practice_schema.sql`; el script
agrega los roles, permisos y usuarios ficticios mínimos. No se necesita la BD
fuente `GestHor` ni se debe importar `ejecutarFinal.sql`.

1. Instalar PostgreSQL y las dependencias del backend (`cd backend` y
   `npm install`).
2. Crear `backend/.env` a partir de `backend/.env.example`. Configurar las
   credenciales locales de PostgreSQL y establecer:

   ```env
   DB_NAME=GestHor_Practica_Compartida
   SHARED_DB_NAME=GestHor_Practica_Compartida
   PRACTICE_TEST_PASSWORD=una_contrasena_local_de_al_menos_16_caracteres
   ```

   El usuario configurado en `DB_USER` debe poder crear bases de datos.
   `PRACTICE_TEST_PASSWORD` se usa para los dos usuarios ficticios locales;
   no usar una contraseña real.
3. Desde `backend`, ejecutar:

   ```powershell
   node scripts/prepare_shared_practice_db.js
   ```

El ejecutable `psql` de PostgreSQL 18 debe estar disponible en `PATH`; si no,
configurar `PSQL_BIN` con su ruta completa en el entorno local.
El script se niega a reemplazar una base que ya exista. Después de crearla,
`DB_NAME` debe seguir apuntando a `GestHor_Practica_Compartida` para que la
aplicación use esa copia. Cada dispositivo tendrá una base independiente:
los cambios de datos no se sincronizan entre compañeros.

# env
debe estar en la carpeta backend (ver backend/.env.example)

DB_USER=tu_usuario
DB_PASSWORD=tu_contrasena_segura
DB_HOST=localhost
DB_PORT=5432
DB_NAME=GestHor

# Auditoría, administración de roles y permisos
Al actualizar una base de datos existente, ejecutar la migración una sola vez desde PowerShell en la raíz del repositorio:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5432 -U postgres -d GestHor -W -v ON_ERROR_STOP=1 -f "backend\src\database\migrations\003_auditoria_administracion.sql"
```

La API de auditoría permite consultar registros y no expone endpoints de edición o eliminación. El backend registra accesos y operaciones de escritura, incluyendo usuario autenticado, correo, rol, fecha del servidor, IP, acción, resultado, recurso, método HTTP y ruta. Las pantallas de **Roles y permisos**, **Asignar roles** y **Auditoría** se encuentran en el menú administrativo y están restringidas en el backend al rol administrador. Al asignar un rol se revocan las sesiones existentes del usuario para que vuelva a iniciar sesión con los nuevos permisos; no es posible cambiar el propio rol ni quitar el rol al último administrador activo.


# Ejecutar para actualizar la tabla profesores en postgresql web
CREATE SEQUENCE IF NOT EXISTS public.profesores_profesor_id_seq 
    AS integer 
    START WITH 1 
    INCREMENT BY 1 
    NO MINVALUE 
    NO MAXVALUE 
    CACHE 1;

ALTER SEQUENCE public.profesores_profesor_id_seq 
    OWNED BY public.profesores.profesor_id;

ALTER TABLE public.profesores 
    ALTER COLUMN profesor_id SET DEFAULT nextval('public.profesores_profesor_id_seq'::regclass);

SELECT setval('public.profesores_profesor_id_seq', 
    COALESCE((SELECT MAX(profesor_id) FROM public.profesores), 0) + 1, 
    false);

SELECT 
    column_name, 
    column_default 
    FROM information_schema.columns 
WHERE table_name = 'profesores' 
  AND column_name = 'profesor_id';


# Creación de usuarios administradores y profesores
> **Seguridad**: Nunca inserte contraseñas en texto plano. Utilice contraseñas con hash bcrypt generadas a través del script de inicialización o mediante la funcionalidad de usuarios.

Ejemplo con hash bcrypt:
```sql
-- Usuario de ejemplo con hash seguro (Reemplazar <PASSWORD_HASH> por el hash generado)
INSERT INTO usuarios (email, password, password_hash, rol_id)
VALUES ('admin@unach.mx', '<HASH_BCRYPT>', 1);
```

# Instalar lo siguiente en la carpeta del backend
npm install pg-promise cors dotenv

# Usuarios y roles del sistema
- Administrador: Gestiona configuraciones, horarios, usuarios y roles.
- Profesor: Consulta y gestiona su horario y disponibilidad.
- Estudiante: Consulta horarios y ofertas de materias.
*(Las credenciales iniciales de cada entorno deben ser configuradas en las variables de entorno o mediante el seeder)*

# Recuerden levantar el backend primero y después el frontend para probar el inicio de sesión



13/10/2025
# Actualizar BD
**De momento y provicionalmente**
CREATE TABLE IF NOT EXISTS public.materias_catalogo (
    materia_id SERIAL PRIMARY KEY,
    nombre_materia VARCHAR(255) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear tabla de relación N:N entre carreras y materias
CREATE TABLE IF NOT EXISTS public.carrera_materias (
    carrera_id INTEGER NOT NULL REFERENCES public.carreras(carrera_id) ON DELETE CASCADE,
    materia_id INTEGER NOT NULL REFERENCES public.materias_catalogo(materia_id) ON DELETE CASCADE,
    numero_semestre INTEGER NOT NULL,
    PRIMARY KEY (carrera_id, materia_id, numero_semestre),
    CONSTRAINT check_semestre_positivo CHECK (numero_semestre > 0)
);

-- 3. Migrar datos existentes de tabla materias (si los hay)
INSERT INTO public.materias_catalogo (nombre_materia)
SELECT DISTINCT nombre_materia
FROM public.materias
WHERE NOT EXISTS (
    SELECT 1 FROM public.materias_catalogo mc 
    WHERE mc.nombre_materia = materias.nombre_materia
)
ON CONFLICT (nombre_materia) DO NOTHING;

-- 4. Migrar relaciones carrera-materia
INSERT INTO public.carrera_materias (carrera_id, materia_id, numero_semestre)
SELECT 
    m.carrera_id,
    mc.materia_id,
    m.numero_semestre
FROM public.materias m
JOIN public.materias_catalogo mc ON m.nombre_materia = mc.nombre_materia
ON CONFLICT (carrera_id, materia_id, numero_semestre) DO NOTHING;

13/10/2025
# Para cada cambio colocar npm install, puede que se hayan agregado nuevas dependencias (en el caso de que falle) - EN ESTE CASO EN BACKEND
**Agregar lo siguiente en el .env para que jale (del backend)**
JWT_EXPIRES_IN=15m
Los access tokens usan `JWT_ACCESS_PRIVATE_KEY_B64` y `JWT_ACCESS_PUBLIC_KEY_B64` (par RSA PEM en Base64); el refresh token usa `JWT_REFRESH_SECRET`. `JWT_SECRET` ya no se utiliza.

## Prueba de autenticación real en GestHor

Desde `backend`, configura `AUTH_TEST_USER_PASSWORD` y `AUTH_TEST_ADMIN_PASSWORD` solo en la sesión de terminal y ejecuta `npm run test:auth-real`. El script comprueba que la cuenta de prueba inicia como profesor, prueba login, errores, Google simulado, refresh y los cambios profesor → editor → estudiante → profesor. Restaura profesor y revoca las sesiones de prueba al terminar. Si el proceso se interrumpe, ejecuta `AUTH_TEST_RECOVER=1 node scripts/recover_auth_real.js` (en PowerShell, define la variable de entorno antes del comando). No pongas las contraseñas de prueba en el repositorio.



16/10-2025
# instalar en frontend
npm install xlsx
# instalar en backend 
npm install passport passport-google-oauth20 express-session

26/10/2025
# Intalar esto en Backend
npm install multer

# Despues de ejecutar la bd (ejecutar6.sql) y da error, ejecutar lo sig en pgweb
ALTER TABLE profesores
ADD COLUMN tipo_contrato_id INTEGER;

ALTER TABLE profesores
ADD CONSTRAINT fk_profesor_tipo_contrato
FOREIGN KEY (tipo_contrato_id)
REFERENCES tipos_contrato(tipo_contrato_id);

01/11/2025
# Se cambio en formato de excel, instalar esto en frontend
npm i exceljs@4.4.0

# Instalar lo siguiente en frontend para iconos
npm i react-icons
