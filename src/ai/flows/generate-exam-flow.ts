'use server';

/**
 * @fileOverview An AI agent that generates exams.
 *
 * - generateExam - A function that handles the exam generation process.
 */

import {ai} from '@/ai/genkit';
import {
    GenerateExamInputSchema,
    GenerateExamOutputSchema,
    type GenerateExamInput,
    type GenerateExamOutput,
} from '@/ai/schemas/exam-schemas';

export async function generateExam(input: GenerateExamInput): Promise<GenerateExamOutput> {
  return generateExamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExamPrompt',
  input: {schema: GenerateExamInputSchema},
  output: {schema: GenerateExamOutputSchema},
  prompt: `You are an expert exam creator for Turkish schools. Your task is to generate a multiple-choice exam based on the provided topic, grade level, and number of questions.

  Topic: {{{topic}}}
  Grade Level: {{{gradeLevel}}}
  Number of Questions: {{{questionCount}}}

  Please generate {{{questionCount}}} unique questions. Each question must have four options (A, B, C, D) and you must clearly indicate the correct answer. The questions should be appropriate for the specified grade level and curriculum in Turkey.

  Format the output as a JSON object according to the provided output schema.
  `,
});

const generateExamFlow = ai.defineFlow(
  {
    name: 'generateExamFlow',
    inputSchema: GenerateExamInputSchema,
    outputSchema: GenerateExamOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
