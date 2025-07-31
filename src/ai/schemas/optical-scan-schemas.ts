/**
 * @fileOverview Zod schemas and TypeScript types for the optical scan AI flow.
 */
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
