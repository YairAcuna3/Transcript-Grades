import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Grade } from "@/types/grade";

export function exportGradesToExcel(data: Grade[]) {
    // 1. Convertir array a hoja de Excel
    const ws = XLSX.utils.json_to_sheet(data);

    // 2. Crear libro de Excel
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Notas");

    // 3. Escribir archivo en memoria
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // 4. Descargar con file-saver
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "notas.xlsx");
}