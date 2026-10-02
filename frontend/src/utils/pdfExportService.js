import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export class HorarioPDFExporter {
  static exportSchedule(scheduleData, tipo, profesorNombre = "Profesor", outputType = 'save') {
    const { slots, classes } = scheduleData;
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    const daysKeys = ["lunes", "martes", "miercoles", "jueves", "viernes"];

    // Crear documento PDF
    const doc = new jsPDF("landscape", "pt", "A4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const colors = {
      primary: [41, 128, 185],
      secondary: [52, 152, 219],
      lightBg: [248, 249, 250],
      border: [233, 236, 239],
      text: [33, 37, 41],
      muted: [108, 117, 125]
    };

    // Header simple 
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, pageWidth, 80, 'F');

    // Títulos principales 
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`HORARIO ${tipo.toUpperCase()}`, 40, 35);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Profesor: ${profesorNombre}`, 40, 55);

    // Fecha 
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, pageWidth - 140, 55);

    // Construir datos para la tabla
    const tableData = [];

    slots.forEach((slot) => {
      const row = [slot];
      daysKeys.forEach((day) => {
        const info = classes[slot]?.[day];
        if (info && !info.skip && info.s) {
          // Formato para las celdas
          const subject = info.s || "";
          const room = info.r ? `Aula: ${info.r}` : "";
          const cellContent = room ? `${subject}\n${room}` : subject;
          row.push(cellContent);
        } else {
          row.push("—"); // Guión para celdas vacías
        }
      });
      tableData.push(row);
    });

    const tableConfig = {
      startY: 90,
      head: [["HORA", ...days]],
      body: tableData,
      styles: {
        fontSize: 9,
        cellPadding: 6,
        valign: "middle",
        halign: "center",
        lineColor: colors.border,
        lineWidth: 0.3,
        font: "helvetica",
        textColor: colors.text,
      },
      headStyles: {
        fillColor: colors.secondary,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 10,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: colors.lightBg,
      },
      margin: { left: 30, right: 30 },
      tableWidth: "auto",
      theme: "grid"
    };

    autoTable(doc, tableConfig);

    // Footer  
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : pageHeight - 40;

    if (finalY < pageHeight - 50) {
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      doc.setLineWidth(0.5);
      doc.line(30, finalY, pageWidth - 30, finalY);

      // Información del footer
      doc.setFontSize(8);
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
      doc.text("Sistema de Gestión Académica - GestHor", pageWidth / 2, finalY + 12, { align: "center" });
    }

    if (outputType === 'blob') {
      return doc.output('blob');
    } else {
      // Guardar el archivo con nombre 
      const safeName = profesorNombre.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
      const fileName = `Horario_${tipo}_${safeName}.pdf`;
      doc.save(fileName);
    }
  }

  static exportEmptySchedule(tipo, profesorNombre = "Plantilla") {
    const slots = this.getTimeSlots(tipo);
    const emptyClasses = {};

    slots.forEach((slot) => {
      emptyClasses[slot] = {};
    });

    this.exportSchedule({
      slots,
      classes: emptyClasses
    }, tipo, profesorNombre);
  }

  static getTimeSlots(tipo) {
    if (tipo === "matutino") {
      return [
        "07:00 - 08:00",
        "08:00 - 09:00",
        "09:00 - 10:00",
        "10:00 - 11:00",
        "11:00 - 12:00",
        "12:00 - 13:00",
        "13:00 - 14:00"
      ];
    } else {
      return [
        "15:00 - 16:00",
        "16:00 - 17:00",
        "17:00 - 18:00",
        "18:00 - 19:00",
        "19:00 - 20:00",
        "20:00 - 21:00",
        "21:00 - 22:00"
      ];
    }
  }

  static exportScheduleSafe(scheduleData, tipo, profesorNombre = "Profesor") {
    try {
      if (!scheduleData || !scheduleData.slots || !scheduleData.classes) {
        console.error("Datos de horario inválidos");
        this.exportEmptySchedule(tipo, profesorNombre);
        return;
      }

      this.exportSchedule(scheduleData, tipo, profesorNombre);
    } catch (error) {
      console.error("Error generando PDF:", error);
      this.exportEmptySchedule(tipo, profesorNombre);
    }
  }
}

export default HorarioPDFExporter;