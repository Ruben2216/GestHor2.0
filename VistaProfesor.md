16/10/2025
# CRUDs EN PROFESORES
## 1. MiHorario.jsx
Se puede cambiar:

Los horarios y materias están dentro del objeto DATA.

const DATA = {
  matutino: {
    slots: ["07:00 - 08:00", "08:00 - 09:00", ...],
    classes: {
      "07:00 - 08:00": {
        lunes: { s: "Matemáticas I", r: "Aula 101", c: "pf-c-blue" },
        miercoles: { s: "Álgebra", r: "Aula 203", c: "pf-c-green" },
      },
    },
  },
};

s = nombre de la materia
r = aula o laboratorio
c = color del bloque (ej. pf-c-blue, pf-c-red, pf-c-green, etc.)

Reemplaza el objeto DATA por un fetch() que obtenga los horarios del profesor.
Los botones “PDF” y “Excel” están simulados, ahí se conectará la función de exportar.

## 2. MisMaterias.jsx
Se puede cambiar:

La lista completa de materias disponibles está en:

const TODAS_LAS_MATERIAS = ["Matemáticas I", "Álgebra", "Cálculo Integral", ...];

Puedes agregar, editar o eliminar nombres desde aquí.

Los botones ya hacen:
Agregar materia: función agregar()
Eliminar materia: función eliminar(id)

Para conectar con base de datos (backend):

Cargar las materias del profesor:
fetch("http://localhost:3000/api/profesor/mis-materias")

Agregar una nueva:
fetch("http://localhost:3000/api/profesor/mis-materias", {
  method: "POST",
  body: JSON.stringify({ nombre: seleccion }),
});

Eliminar una:
fetch(`http://localhost:3000/api/profesor/mis-materias/${id}`, { method: "DELETE" });

## 3. Disponibilidad.jsx
Se puede cambiar:

Días de la semana:

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

Horarios:

const SLOTS = {
  matutino: ["07:00 - 08:00", "08:00 - 09:00", ...],
  vespertino: ["15:00 - 16:00", "16:00 - 17:00", ...],
};

Preferencias (al final del archivo):
Máx. horas por día, preferencia de turno, comentarios.

Para conectar con base de datos:

El botón “Guardar Disponibilidad” debe enviar los horarios seleccionados al backend.
Ejemplo del formato:

{
  "tipo": "matutino",
  "availability": {
    "07:00 - 08:00": [true, false, true, false, false],
    "08:00 - 09:00": [false, true, false, false, false]
  }
}

El botón “Guardar Preferencias” puede mandar:
{ "maxHorasDia": "4", "preferencia": "mixto", "comentarios": "Disponible martes y jueves" }