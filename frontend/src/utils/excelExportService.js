import ExcelJS from 'exceljs';

const COLORS = {
    primary: 'FF2980B9',
    secondary: 'FF3498DB',
    lightBg: 'FFF8F9FA',
    border: 'FFE9ECEF',
    text: 'FF212529',
    white: 'FFFFFFFF',
    muted: 'FF6C757D',
};

function autoFitColumns(ws, { min = 12, max = 44 } = {}) {
    ws.columns.forEach((col) => {
        let maxLen = 0;
        col.eachCell({ includeEmpty: true }, (cell) => {
            const v = (cell.value?.richText)
                ? cell.value.richText.map(t => t.text).join('')
                : (cell.value ?? '');
            const len = String(v).split('\n').reduce((m, line) => Math.max(m, line.length), 0);
            if (len > maxLen) maxLen = len;
        });
        col.width = Math.min(Math.max(Math.ceil(maxLen * 0.9) + 2, min), max);
    });
}

export class HorarioExcelExporter {
    static async exportSchedule(scheduleData, tipo, profesorNombre = 'Profesor') {
        const { slots, classes } = scheduleData;
        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
        const daysKeys = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
        const cols = days.length + 1;

        const wb = new ExcelJS.Workbook();
        wb.created = new Date();
        wb.creator = profesorNombre;

        const ws = wb.addWorksheet(
            tipo === 'matutino' ? 'Horario Matutino' : 'Horario Vespertino',
            { views: [{ state: 'frozen', xSplit: 1, ySplit: 3 }] }
        );

        // columnas base 
        ws.columns = [{ header: 'HORA', key: 'hora', width: 14 },
        ...days.map(d => ({ header: d, key: d.toLowerCase(), width: 36 }))];

        // Banner
        ws.mergeCells(1, 1, 1, cols);
        ws.mergeCells(2, 1, 2, Math.ceil(cols / 2));
        ws.mergeCells(2, Math.ceil(cols / 2) + 1, 2, cols);

        for (let c = 1; c <= cols; c++) {
            ws.getCell(1, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } };
            ws.getCell(2, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } };
        }

        const title = ws.getCell(1, 1);
        title.value = `HORARIO ${tipo.toUpperCase()}`;
        title.font = { bold: true, size: 18, color: { argb: COLORS.white } };
        title.alignment = { horizontal: 'left', vertical: 'middle' };
        ws.getRow(1).height = 28;

        const prof = ws.getCell(2, 1);
        prof.value = `Profesor: ${profesorNombre}`;
        prof.font = { size: 12, color: { argb: COLORS.white } };
        prof.alignment = { horizontal: 'left', vertical: 'middle' };

        const date = ws.getCell(2, Math.ceil(cols / 2) + 1);
        date.value = `Generado: ${new Date().toLocaleDateString()}`;
        date.font = { size: 11, color: { argb: COLORS.white } };
        date.alignment = { horizontal: 'right', vertical: 'middle' };
        ws.getRow(2).height = 20;

        // Encabezados de tabla
        const head = ws.addRow(['HORA', ...days]);
        head.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: COLORS.white }, size: 11 };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.secondary } };
            cell.border = {
                top: { style: 'thin', color: { argb: COLORS.border } },
                left: { style: 'thin', color: { argb: COLORS.border } },
                bottom: { style: 'thin', color: { argb: COLORS.border } },
                right: { style: 'thin', color: { argb: COLORS.border } },
            };
        });
        ws.getRow(3).height = 22;

        // Cuerpo
        slots.forEach((slot, i) => {
            const rowVals = [slot];
            daysKeys.forEach((dk) => {
                const info = classes[slot]?.[dk];
                if (info && !info.skip && info.s) {
                    const subject = info.s || '';
                    const room = info.r ? `Aula: ${info.r}` : '';
                    rowVals.push(room ? `${subject}\n${room}` : subject);
                } else {
                    rowVals.push('—');
                }
            });
            const row = ws.addRow(rowVals);

            row.eachCell((cell, col) => {
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.font = { size: 10, color: { argb: COLORS.text } };
                cell.border = {
                    top: { style: 'thin', color: { argb: COLORS.border } },
                    left: { style: 'thin', color: { argb: COLORS.border } },
                    bottom: { style: 'thin', color: { argb: COLORS.border } },
                    right: { style: 'thin', color: { argb: COLORS.border } },
                };
                if (i % 2 === 0) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.lightBg } };
                }
            });
            row.height = 42; 
        });

        // Footer
        ws.addRow([]);
        const footer = ws.addRow(['Sistema de Gestión Académica - GestHor']);
        ws.mergeCells(footer.number, 1, footer.number, cols);
        footer.getCell(1).alignment = { horizontal: 'center' };
        footer.getCell(1).font = { size: 9, color: { argb: COLORS.muted } };

        // Auto-ajuste
        autoFitColumns(ws, { min: 14, max: 44 });

        // Guardar
        const buf = await wb.xlsx.writeBuffer();
        const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const safe = profesorNombre.replace(/[^\w\s]/g, '').replace(/\s+/g, '_');
        const name = `Horario_${tipo}_${safe}.xlsx`;

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    }
}

export default HorarioExcelExporter;
