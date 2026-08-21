"use client";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    WidthType,
    AlignmentType,
    ShadingType,
    BorderStyle,
    HeadingLevel,
} from "docx";
import { Grade } from "@/types/grade";

export type ExportFormat = "xlsx" | "csv" | "ods" | "pdf" | "docx";

export const EXPORT_FORMATS: { value: ExportFormat; label: string; icon: string }[] = [
    { value: "xlsx", label: "Excel (.xlsx)", icon: "📊" },
    { value: "csv", label: "CSV (.csv)", icon: "📄" },
    { value: "ods", label: "ODS (.ods)", icon: "📋" },
    { value: "pdf", label: "PDF (.pdf)", icon: "📕" },
    { value: "docx", label: "Word (.docx)", icon: "📝" },
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

async function exportAsDocx(data: Grade[]) {
    // Colores en formato hex (sin #)
    const headerBg = "EDE9FE";   // purple-100
    const evenRowBg = "F9FAFB";  // gray-50
    const titleColor = "4F46E5"; // indigo-600
    const headerColor = "6D28D9"; // purple-700

    const cellBorder = {
        top: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
    };

    const gradeColor = (grade: number) => {
        if (grade >= 17) return "15803D"; // green-700
        if (grade >= 11) return "A16207"; // yellow-700
        return "B91C1C";                  // red-700
    };

    const headerRow = new TableRow({
        tableHeader: true,
        children: [
            new TableCell({
                shading: { type: ShadingType.SOLID, color: headerBg },
                borders: cellBorder,
                width: { size: 75, type: WidthType.PERCENTAGE },
                children: [
                    new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                            new TextRun({
                                text: "Alumno",
                                bold: true,
                                color: headerColor,
                                size: 24,
                            }),
                        ],
                    }),
                ],
            }),
            new TableCell({
                shading: { type: ShadingType.SOLID, color: headerBg },
                borders: cellBorder,
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "Nota",
                                bold: true,
                                color: headerColor,
                                size: 24,
                            }),
                        ],
                    }),
                ],
            }),
        ],
    });

    const dataRows = data.map((g, i) =>
        new TableRow({
            children: [
                new TableCell({
                    shading: i % 2 === 0
                        ? { type: ShadingType.SOLID, color: evenRowBg }
                        : undefined,
                    borders: cellBorder,
                    children: [
                        new Paragraph({
                            children: [new TextRun({ text: g.student, size: 22 })],
                        }),
                    ],
                }),
                new TableCell({
                    shading: i % 2 === 0
                        ? { type: ShadingType.SOLID, color: evenRowBg }
                        : undefined,
                    borders: cellBorder,
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: String(g.grade),
                                    bold: true,
                                    color: gradeColor(g.grade),
                                    size: 22,
                                }),
                            ],
                        }),
                    ],
                }),
            ],
        })
    );

    const doc = new Document({
        sections: [
            {
                children: [
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "Registro de Notas",
                                bold: true,
                                color: titleColor,
                                size: 40,
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 300 },
                        children: [
                            new TextRun({
                                text: "3° de Secundaria",
                                color: "9CA3AF",
                                size: 22,
                            }),
                        ],
                    }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [headerRow, ...dataRows],
                    }),
                    new Paragraph({
                        spacing: { before: 200 },
                        children: [
                            new TextRun({
                                text: `Total: ${data.length} alumno(s)`,
                                color: "9CA3AF",
                                size: 18,
                            }),
                        ],
                    }),
                ],
            },
        ],
    });

    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, "notas.docx");
}

export function exportGrades(data: Grade[], format: ExportFormat) {
    if (format === "pdf") {
        exportAsPdf(data);
    } else if (format === "docx") {
        exportAsDocx(data);
    } else {
        exportAsSpreadsheet(data, format);
    }
}
