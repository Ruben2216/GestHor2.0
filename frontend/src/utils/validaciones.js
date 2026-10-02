export function validarPlanEstudioCompleto(carrera) {
    if (!carrera) return { valido: false, mensaje: "No hay carrera seleccionada" };
    
    const semestresVacios = [];
    for (let i = 1; i <= carrera.total_semestres; i++) {
        const materias = carrera.materias?.[i] || [];
        if (materias.length === 0) {
            semestresVacios.push(i);
        }
    }
    
    if (semestresVacios.length > 0) {
        return {
            valido: false,
            mensaje: `Los siguientes semestres no tienen materias asignadas: ${semestresVacios.join(', ')}\n\nCada semestre debe tener al menos 1 materia.`
        };
    }
    
    return { valido: true, mensaje: "Plan de estudio completo" };
}
