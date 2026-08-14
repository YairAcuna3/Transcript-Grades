"use client";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import { Grade } from "@/types/grade";

export type ExportFormat = "xlsx" | "csv" | "ods" | "pdf";

export const EXPORT_FORMATS: { value: ExportFormat; label: string; icon: string }[] = [
    { value: "xlsx", label: "Excel (.xlsx)", icon: "📊" },
    { value: "csv", label: "CSV (.csv)", icon: "📄" },
    { value: "ods", label: "ODS (.ods)", icon: "📋" },
    { value: "pdf", label: "PDF (.pdf)", icon: "📕" },
];

function exportAsSpreadsheet(data: Grade[], format: "xlsx" | "csv" | "ods") {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Notas");

    const mimeMap = {
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        csv: "text/csv;charset=utf-8;",
        ods: "application/vnd.oasis.opendocument.spreadsheet",
    };

    const buffer = XLSX.write(wb, { bookType: format, type: "array" });
    const blob = new Blob([buffer], { type: mimeMap[format] });
    saveAs(blob, `notas.${format}`);
}

function exportAsPdf(data: Grade[]) {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text("Registro de Notas", 105, 20, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(120, 120, 120);
    doc.text("3° de Secundaria", 105, 28, { align: "center" });

    // Cabecera de tabla
    const startY = 40;
    const colName = 20;
    const colGrade = 150;
    const rowH = 10;

    doc.setFillColor(237, 233, 254); // purple-100
    doc.rect(15, startY - 7, 180, rowH, "F");
    doc.setFontSize(11);
    doc.setTextColor(109, 40, 217); // purple-700
    doc.setFont("helvetica", "bold");
    doc.text("Alumno", colName, startY);
    doc.text("Nota", colGrade, startY);

    // Filas
    data.forEach((g, i) => {
        const y = startY + rowH * (i + 1) + 2;

        // Fondo alternado
        if (i % 2 === 0) {
            doc.setFillColor(249, 250, 251); // gray-50
            doc.rect(15, y - 7, 180, rowH, "F");
        }

        // Color de nota
        if (g.grade >= 17) doc.setTextColor(21, 128, 61);   // green-700
        else if (g.grade >= 11) doc.setTextColor(161, 98, 7);    // yellow-700
        else doc.setTextColor(185, 28, 28);   // red-700

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(g.student, colName, y);
        doc.setFont("helvetica", "bold");
        doc.text(String(g.grade), colGrade, y);
    });

    // Línea de cierre
    const tableBottom = startY + rowH * (data.length + 1) + 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, tableBottom, 195, tableBottom);

    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.setFont("helvetica", "normal");
    doc.text(`Total: ${data.length} alumno(s)`, 15, tableBottom + 6);

    doc.save("notas.pdf");
}

export function exportGrades(data: Grade[], format: ExportFormat) {
    if (format === "pdf") {
        exportAsPdf(data);
    } else {
        exportAsSpreadsheet(data, format);
    }
}
