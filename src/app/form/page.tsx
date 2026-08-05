"use client";

import { useEffect, useState } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { exportGradesToExcel } from "@/components/ExportToExcel";
import { Grade } from "@/types/grade";
import { parseGrades } from "@/lib/parseGrades";

export default function Form() {
    const { transcript, listening, startListening, stopListening, resetTranscript } =
        useSpeechRecognition("es-ES");
    const [grades, setGrades] = useState<Grade[]>([]);

    // índice del alumno que se está editando, null = ninguno
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editGrade, setEditGrade] = useState("");

    useEffect(() => {
        if (!transcript) return;
        const parsedGrades = parseGrades(transcript);
        if (parsedGrades.length === 0) return;

        setGrades((prev) => {
            const updated = [...prev];
            for (const newGrade of parsedGrades) {
                const idx = updated.findIndex(
                    (g) => g.student.toLowerCase() === newGrade.student.toLowerCase()
                );
                if (idx >= 0) {
                    updated[idx] = newGrade;
                } else {
                    updated.push(newGrade);
                }
            }
            return updated;
        });
    }, [transcript]);

    const handleClearAll = () => {
        setGrades([]);
        resetTranscript();
        setEditingIndex(null);
    };

    const handleStartEdit = (index: number) => {
        setEditingIndex(index);
        setEditName(grades[index].student);
        setEditGrade(String(grades[index].grade));
    };

    const handleSaveEdit = (index: number) => {
        const trimmedName = editName.trim();
        const parsedGrade = parseInt(editGrade, 10);
        if (!trimmedName || isNaN(parsedGrade)) return;

        setGrades((prev) => {
            const updated = [...prev];
            updated[index] = { student: trimmedName, grade: parsedGrade };
            return updated;
        });
        setEditingIndex(null);
    };

    const handleDelete = (index: number) => {
        setGrades((prev) => prev.filter((_, i) => i !== index));
        if (editingIndex === index) setEditingIndex(null);
    };

    const getGradeColor = (grade: number) => {
        if (grade >= 17) return "bg-green-100 text-green-700 border-green-300";
        if (grade >= 11) return "bg-yellow-100 text-yellow-700 border-yellow-300";
        return "bg-red-100 text-red-700 border-red-300";
    };

    const getGradeEmoji = (grade: number) => {
        if (grade >= 17) return "🌟";
        if (grade >= 11) return "👍";
        return "💪";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6 font-sans">

            {/* Header */}
            <div className="max-w-2xl mx-auto text-center mb-8">
                <div className="text-5xl mb-2">🎓</div>
                <h1 className="text-4xl font-extrabold text-indigo-700 drop-shadow-sm tracking-tight">
                    Registro de Notas
                </h1>
                <p className="text-purple-500 font-medium mt-1 text-sm uppercase tracking-widest">
                    Feria de ciencias - Diego Andre Acuña Mendoza
                </p>
            </div>

            {/* Card principal */}
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-6 space-y-6 border border-purple-100">

                {/* Botón micrófono */}
                <div className="flex justify-center">
                    <button
                        onClick={listening ? stopListening : startListening}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-md transition-all duration-200 active:scale-95
                            ${listening
                                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                                : "bg-indigo-500 hover:bg-indigo-600"
                            }`}
                    >
                        <span className="text-2xl">{listening ? "🔴" : "🎙️"}</span>
                        {listening ? "Detener grabación" : "Iniciar grabación"}
                    </button>
                </div>

                {/* Transcripción */}
                <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1">
                        Lo que escuché:
                    </p>
                    <p className="text-gray-700 text-sm min-h-[2rem] italic">
                        {transcript || "Presiona el botón y empieza a hablar…"}
                    </p>
                </div>

                {/* Tabla de notas */}
                <div>
                    <h2 className="text-xl font-bold text-purple-700 mb-3 flex items-center gap-2">
                        📋 Notas registradas
                        {grades.length > 0 && (
                            <span className="bg-purple-100 text-purple-600 text-sm font-semibold px-2 py-0.5 rounded-full">
                                {grades.length}
                            </span>
                        )}
                    </h2>

                    {grades.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">📭</div>
                            <p className="text-sm">Aún no hay notas registradas</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {grades.map((g, index) => (
                                <div key={index}>
                                    {editingIndex === index ? (
                                        /* ── Fila en modo edición ── */
                                        <div className="flex flex-col gap-2 px-4 py-3 rounded-xl border border-indigo-300 bg-indigo-50">
                                            {/* Nombre — ocupa toda la línea */}
                                            <input
                                                className="w-full rounded-lg border border-indigo-200 px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                placeholder="Nombre completo"
                                            />
                                            {/* Nota + botones en la misma fila */}
                                            <div className="flex items-center gap-2">
                                                <input
                                                    className="w-20 shrink-0 rounded-lg border border-indigo-200 px-3 py-1.5 text-sm text-center font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                    value={editGrade}
                                                    onChange={(e) => setEditGrade(e.target.value)}
                                                    placeholder="Nota"
                                                    type="number"
                                                />
                                                <button
                                                    onClick={() => handleSaveEdit(index)}
                                                    className="shrink-0 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold px-4 py-1.5 rounded-lg transition-all active:scale-95"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => setEditingIndex(null)}
                                                    className="shrink-0 bg-gray-200 hover:bg-gray-300 text-gray-600 text-sm font-bold px-4 py-1.5 rounded-lg transition-all active:scale-95"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* ── Fila normal ── */
                                        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 rounded-xl border font-medium ${getGradeColor(g.grade)}`}>
                                            {/* Nombre */}
                                            <span className="flex items-center gap-2 min-w-0">
                                                <span className="text-lg shrink-0">👤</span>
                                                <span className="break-words">{g.student}</span>
                                            </span>
                                            {/* Nota + botones */}
                                            <span className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                                <span className="text-lg font-bold">
                                                    {getGradeEmoji(g.grade)} {g.grade}
                                                </span>
                                                <button
                                                    onClick={() => handleStartEdit(index)}
                                                    title="Editar"
                                                    className="text-sm bg-white/70 hover:bg-white border border-current px-2 py-1 rounded-lg transition-all active:scale-95"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(index)}
                                                    title="Eliminar"
                                                    className="text-sm bg-white/70 hover:bg-red-100 border border-red-300 text-red-500 px-2 py-1 rounded-lg transition-all active:scale-95"
                                                >
                                                    🗑️
                                                </button>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={() => exportGradesToExcel(grades)}
                        disabled={grades.length === 0}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-2xl transition-all shadow-sm active:scale-95"
                    >
                        📊 Exportar a Excel
                    </button>
                    <button
                        onClick={handleClearAll}
                        disabled={grades.length === 0 && !transcript}
                        className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 text-red-600 font-bold py-3 px-5 rounded-2xl transition-all active:scale-95"
                    >
                        🗑️ Limpiar
                    </button>
                </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 mt-6">
                Di el nombre seguido de la nota · Ej: <em>&quot;Carlos Mendoza 15, Rodrigo nota 18&quot;</em>
            </p>
        </div>
    );
}
