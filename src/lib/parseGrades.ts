import { Grade } from "@/types/grade";

// Palabras que no forman parte de un nombre de alumno
const STOPWORDS = new Set([
  "y",
  "e",
  "o",
  "u",
  "de",
  "del",
  "el",
  "la",
  "los",
  "las",
  "un",
  "una",
  "con",
  "nota",
  "alumno",
  "alumnos",
  "también",
  "luego",
  "después",
  "siguiente",
  "otro",
  "otra",
]);

/**
 * Limpia el texto candidato a nombre:
 * - Elimina stopwords al inicio y al final
 * - Elimina la palabra "nota" si quedó pegada
 * - Capitaliza cada palabra
 */
function cleanName(raw: string): string {
  const words = raw
    .trim()
    .split(/\s+/)
    .filter((w) => !STOPWORDS.has(w.toLowerCase()));

  if (words.length === 0) return "";

  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Estrategia: dividir el texto en segmentos usando los números como separadores.
 * Cada número es la nota; todo lo que viene ANTES (desde el número anterior) es el nombre.
 *
 * Ejemplo: "angel rodrigo acuña mendoza 15 carlos perez 18"
 *   → segmento 1: nombre="angel rodrigo acuña mendoza", nota=15
 *   → segmento 2: nombre="carlos perez", nota=18
 */
export const parseGrades = (text: string): Grade[] => {
  // Encontrar todas las posiciones de números en el texto
  const numberRegex = /\b(\d{1,2})\b/g;
  const hits: { index: number; end: number; grade: number }[] = [];
  let m: RegExpExecArray | null;

  while ((m = numberRegex.exec(text)) !== null) {
    const grade = parseInt(m[1], 10);
    hits.push({ index: m.index, end: m.index + m[0].length, grade });
  }

  if (hits.length === 0) return [];

  const matches: Grade[] = [];

  for (let i = 0; i < hits.length; i++) {
    const hit = hits[i];

    // El nombre empieza donde terminó la nota anterior (o al inicio del texto)
    const prevEnd = i === 0 ? 0 : hits[i - 1].end;
    const rawName = text.slice(prevEnd, hit.index);

    const name = cleanName(rawName);
    if (!name) continue;

    matches.push({ student: name, grade: hit.grade });
  }

  return matches;
};
