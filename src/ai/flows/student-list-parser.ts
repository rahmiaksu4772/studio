
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
      prompt: `You are an expert document parser. Your task is to analyze the provided file and extract student list information for one or more classes.

    The user has provided a file that contains a list of students. This file could be a PDF or an Excel sheet generated from a system like e-Okul.

    Your tasks are:
    1.  Identify the main class name from the document title or header. For example, "5. Sınıf / D Şubesi Sınıf Listesi" should result in a class name of "5/D".
    2.  Scan the document for a table of students.
    3.  For each row in the table, extract the student's number ("Öğrenci No"), first name ("Adı"), and last name ("Soyadı").
    4.  The "Adı" (first name) column might contain multiple words (e.g., 'AHMET KEREM'). The last word in the full name is the "Soyadı" (last name). All preceding words constitute the "Adı" (first name). For example, if the name is 'AHMET KEREM ONUS', the first name is 'AHMET KEREM' and the last name is 'ONUS'.
    5.  Compile all the extracted students under the identified class name.
    6.  If the document contains lists for multiple classes, create a separate class object for each.
    7.  Return the data in the specified JSON format. Ensure all student numbers are parsed as numbers, not strings.

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
