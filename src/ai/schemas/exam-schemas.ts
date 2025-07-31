/**
 * @fileOverview Zod schemas and TypeScript types for the exam generation AI flow.
 */
import {z} from 'genkit';

export const GenerateExamInputSchema = z.object({
  topic: z.string().describe('The topic of the exam.'),
  gradeLevel: z.string().describe('The grade level for the exam (e.g., "8. Sınıf").'),
  questionCount: z.number().describe('The number of questions to generate.'),
});
export type GenerateExamInput = z.infer<typeof GenerateExamInputSchema>;

export const QuestionSchema = z.object({
  question: z.string().describe('The text of the question.'),
  options: z.object({
    a: z.string().describe('Option A.'),
    b: z.string().describe('Option B.'),
    c: z.string().describe('Option C.'),
    d: z.string().describe('Option D.'),
  }),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']).describe('The correct option.'),
});

export const ExamSchema = z.object({
    questions: z.array(QuestionSchema).describe('The list of generated questions.'),
});

export const GenerateExamOutputSchema = z.object({
  exam: ExamSchema,
});
export type GenerateExamOutput = z.infer<typeof GenerateExamOutputSchema>;
