import { Grade } from "@/types/grade";

export const parseGrades = (text: string): Grade[] => {
  const regex = /alumnos?\s+(.+?)\s+nota\s+(\d+)/g;
  const matches: Grade[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    matches.push({
      student: match[1].trim(),
      grade: parseInt(match[2], 10),
    });
  }
  return matches;
};
