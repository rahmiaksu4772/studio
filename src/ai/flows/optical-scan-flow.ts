'use server';

/**
 * @fileOverview An AI agent that performs optical scanning on exam papers.
 *
 * - opticalScan - A function that handles the optical scan process.
 */

import {ai} from '@/ai/genkit';
import {
    OpticalScanInputSchema,
    OpticalScanOutputSchema,
    type OpticalScanInput,
    type OpticalScanOutput
} from '@/ai/schemas/optical-scan-schemas';


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
