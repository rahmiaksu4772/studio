
'use server';

/**
 * @fileOverview An AI agent that parses a student list file (PDF, Excel) and extracts class and student information.
 * - parseStudentList - A function that handles the student list parsing process.
 * - StudentListParserOutput - The return type for the parseStudentList function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

type StudentListParserInput = {
    fileDataUri: string;
};

const StudentSchema = z.object({
    studentNumber: z.number().describe("Öğrencinin okul numarası"),
    firstName: z.string().describe("Öğrencinin adı"),
    lastName: z.string().describe("Öğrencinin soyadı"),
});

const ClassSchema = z.object({
    className: z.string().describe("Sınıfın adı (örn: 5/D)"),
    students: z.array(StudentSchema).describe("Sınıftaki öğrencilerin listesi"),
});

export type StudentListParserOutput = z.infer<typeof StudentListParserOutputSchema>;
const StudentListParserOutputSchema = z.object({
  classes: z.array(ClassSchema).describe("Dosyadan ayrıştırılan sınıfların listesi"),
});


export async function parseStudentList(input: StudentListParserInput): Promise<StudentListParserOutput> {
  const StudentListParserInputSchema = z.object({
    fileDataUri: z
      .string()
      .describe(
        "A student list file (PDF or Excel), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
      ),
  });
  
  const prompt = ai.definePrompt({
      name: 'studentListParserPrompt',
      input: { schema: StudentListParserInputSchema },
      output: { schema: StudentListParserOutputSchema },
      prompt: `You are an expert document parser specializing in Turkish school (e-Okul) student lists. Your task is to analyze the provided file (PDF or Excel) and extract class and student information.

The user has provided a file that contains a list of students.

Your tasks are:
1.  **Identify Class Name:** Find the class name, which is usually in the header like "5. Sınıf / D Şubesi Sınıf Listesi". Extract and normalize it to "5/D".
2.  **Scan for Student Table:** Locate the table containing the student list. The columns might be labeled "No", "Okul No", "Adı Soyadı", "Adı", "Soyadı", etc.
3.  **Extract Student Data:** For each student row, extract:
    -   **Student Number:** From the "No" or "Okul No" column. This must be a number.
    -   **Full Name:** From the "Adı Soyadı" or "Adı" and "Soyadı" columns.
4.  **Parse Full Names:** The full name is often in a single column.
    -   The **last word** of the full name is ALWAYS the "Soyadı" (last name).
    -   All preceding words make up the "Adı" (first name).
    -   Example 1: 'AHMET KEREM ONUS' -> firstName: 'AHMET KEREM', lastName: 'ONUS'.
    -   Example 2: 'AYŞE YILMAZ' -> firstName: 'AYŞE', lastName: 'YILMAZ'.
5.  **Compile and Format:** Group all extracted students under the correct class. If the document has multiple classes, create a separate class object for each. Return the data in the specified JSON format. Ensure all student numbers are parsed as numbers, not strings.

File to analyze: {{media url=fileDataUri}}`,
  });

  const studentListParserFlow = ai.defineFlow(
    {
      name: 'studentListParserFlow',
      inputSchema: StudentListParserInputSchema,
      outputSchema: StudentListParserOutputSchema,
    },
    async (input) => {
      const { output } = await prompt(input);
      return output!;
    }
  );

  return studentListParserFlow(input);
}

