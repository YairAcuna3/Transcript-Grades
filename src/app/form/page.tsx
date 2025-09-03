"use client";

import { useEffect, useState } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { exportGradesToExcel } from "@/components/ExportToExcel";
import { Grade } from "@/types/grade";
import { parseGrades } from "@/lib/parseGrades";

export default function Form() {
    const { transcript, listening, startListening, stopListening } =
        useSpeechRecognition("es-ES");
    const [grades, setGrades] = useState<Grade[]>([]);

    useEffect(() => {
        const parsedGrades = parseGrades(transcript);
        setGrades(parsedGrades);
    }, [transcript]);

    return (
        <div className="p-6 space-y-4">
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded-xl"
                onClick={listening ? stopListening : startListening}
            >
                {listening ? "Detener" : "Iniciar"} reconocimiento
            </button>

            <p className="mt-4 text-lg">Última transcripción: {transcript}</p>

            <div>
                <h2>Notas de alumnos:</h2>
                <ul>
                    {grades.map((g, index) => (
                        <li key={index}>
                            <strong>{g.student}</strong>: {g.grade}
                        </li>
                    ))}
                </ul>
            </div>

            <button onClick={() => exportGradesToExcel(grades)} className="hover:text-cyan-400">Exportar a excel</button>
        </div>
    );
}