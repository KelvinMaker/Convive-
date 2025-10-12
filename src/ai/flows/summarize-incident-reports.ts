// SummarizeIncidentReports story implementation
'use server';

/**
 * @fileOverview A flow to summarize trivia game results using AI.
 *
 * - summarizeIncidentReports - A function that handles the summarization of trivia game results.
 * - SummarizeIncidentReportsInput - The input type for the summarizeIncidentReports function.
 * - SummarizeIncidentReportsOutput - The return type for the summarizeIncidentReports function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeIncidentReportsInputSchema = z.object({
  reports: z
    .string()
    .describe('A list of trivia game results, separated by newlines.'),
});
export type SummarizeIncidentReportsInput = z.infer<typeof SummarizeIncidentReportsInputSchema>;

const SummarizeIncidentReportsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the trivia game results.'),
});
export type SummarizeIncidentReportsOutput = z.infer<typeof SummarizeIncidentReportsOutputSchema>;

export async function summarizeIncidentReports(input: SummarizeIncidentReportsInput): Promise<SummarizeIncidentReportsOutput> {
  return summarizeIncidentReportsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeIncidentReportsPrompt',
  input: {schema: SummarizeIncidentReportsInputSchema},
  output: {schema: SummarizeIncidentReportsOutputSchema},
  prompt: `You are a school administrator analyzing student performance on a school conduct trivia game. Summarize the following game results to identify key trends in student knowledge and areas where they might be struggling.\n\nGame Results:\n{{{reports}}}`,
});

const summarizeIncidentReportsFlow = ai.defineFlow(
  {
    name: 'summarizeIncidentReportsFlow',
    inputSchema: SummarizeIncidentReportsInputSchema,
    outputSchema: SummarizeIncidentReportsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
