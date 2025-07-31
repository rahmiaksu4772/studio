'use server';

/**
 * @fileOverview An AI agent that performs optical scanning on exam papers.
 *
 * - opticalScan - A function that handles the optical scan process.
 * - OpticalScanInput - The input type for the opticalScan function.
 * - OpticalScanOutput - The return type for the opticalScan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const OpticalScanInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of the optical form, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  answerKey: z.array(z.string()).describe('The correct answers for the exam.'),
});
export type OpticalScanInput = z.infer<typeof OpticalScanInputSchema>;

export const ScannedStudentSchema = z.object({
    studentNumber: z.string().describe("The student's number, read from the form."),
    answers: z.array(z.string()).describe("The student's marked answers for each question."),
    correctCount: z.number().describe('The number of correct answers for the student.'),
    incorrectCount: z.number().describe('The number of incorrect answers for the student.'),
    emptyCount: z.number().describe('The number of empty (unanswered) questions for the student.'),
});

export const OpticalScanOutputSchema = z.object({
  results: z.array(ScannedStudentSchema).describe('The scanned results for each student on the form.'),
});
export type OpticalScanOutput = z.infer<typeof OpticalScanOutputSchema>;

export async function opticalScan(input: OpticalScanInput): Promise<OpticalScanOutput> {
  return opticalScanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'opticalScanPrompt',
  input: {schema: OpticalScanInputSchema},
  output: {schema: OpticalScanOutputSchema},
  prompt: `You are an expert optical form reader AI. Your task is to analyze the provided image of an optical exam form, identify each student's answers, and compare them against the provided answer key.

  The user will provide an image of the form and an answer key.
  
  Image of the form: {{media url=imageDataUri}}
  Answer Key: {{answerKey}}

  For each student on the form:
  1. Read the student's number from the designated area.
  2. For each question, determine which option (A, B, C, D, E) the student has marked. If no option is marked, consider it empty.
  3. Compare the student's answers to the answer key.
  4. Calculate the total number of correct, incorrect, and empty answers.
  5. Format the output as a JSON object according to the output schema. Ensure the 'answers' array has the same length as the 'answerKey' array. Use an empty string "" for unanswered questions.

  Please be precise. Double-check the student numbers and each marked answer.
  `,
});

const opticalScanFlow = ai.defineFlow(
  {
    name: 'opticalScanFlow',
    inputSchema: OpticalScanInputSchema,
    outputSchema: OpticalScanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
