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

# env
debe estar en la carpeta backend

DB_USER=postgres
DB_PASSWORD=1234
DB_HOST=localhost
DB_PORT=5432
DB_NAME=GesThor


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


# Prueba para la base de datos (admin y profesor) / Insertar en pgweb
-- ADMIN (email: admin@unach.mx / pass: 123456)
INSERT INTO usuarios (email, password, rol_id)
VALUES ('admin@unach.mx', '123456', 1);

-- PROFESOR (email: profe@unach.mx / pass: 123456)
WITH u AS (
  INSERT INTO usuarios (email, password, rol_id)
  VALUES ('profe@unach.mx', '123456', 2)
  RETURNING usuario_id
)
INSERT INTO profesores (profesor_id, nombres, apellidos, matricula)
SELECT usuario_id, 'Juan', 'Pérez', 'MAT-0001' FROM u;

# Instalar lo siguiente en el la carpeta del backend
npm install pg-promise cors dotenv

# Correos y contraseñas de los usuarios para el login (prueba)
Administrador
Correo: admin@unach.mx
Contraseña: 123456

Profesor
Correo: profe@unach.mx
Contraseña: 123456

# Recuerden levantar el backend primero y despues el frontend para probar el inicio de sesion

12/10/2025
# instalar
npm install bcrypt jsonwebtoken axios

**Ejecutar**
INSERT INTO usuarios (email, password, rol_id) 
VALUES ('admin@unach.mx', '$2b$10$FCAhKuP1XlzHSgWDcKMwj.uQS2A2WhSTuLobPbdldayZsh14Y2I.G', 1)
ON CONFLICT (email) DO UPDATE SET password = '$2b$10$FCAhKuP1XlzHSgWDcKMwj.uQS2A2WhSTuLobPbdldayZsh14Y2I.G';

INSERT INTO usuarios (email, password, rol_id) 
VALUES ('profe@unach.mx', '$2b$10$FCAhKuP1XlzHSgWDcKMwj.uQS2A2WhSTuLobPbdldayZsh14Y2I.G', 2)
ON CONFLICT (email) DO UPDATE SET password = '$2b$10$FCAhKuP1XlzHSgWDcKMwj.uQS2A2WhSTuLobPbdldayZsh14Y2I.G';



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
JWT_SECRET= *coloca el siguiente comando y te generara el codigo / openssl rand -base64 32 / copialo y pagalo ahi*



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