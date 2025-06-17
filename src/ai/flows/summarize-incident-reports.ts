// SummarizeIncidentReports story implementation
'use server';

/**
 * @fileOverview A flow to summarize incident reports using AI.
 *
 * - summarizeIncidentReports - A function that handles the summarization of incident reports.
 * - SummarizeIncidentReportsInput - The input type for the summarizeIncidentReports function.
 * - SummarizeIncidentReportsOutput - The return type for the summarizeIncidentReports function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeIncidentReportsInputSchema = z.object({
  reports: z
    .string()
    .describe('A list of incident reports, separated by newlines.'),
});
export type SummarizeIncidentReportsInput = z.infer<typeof SummarizeIncidentReportsInputSchema>;

const SummarizeIncidentReportsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the incident reports.'),
});
export type SummarizeIncidentReportsOutput = z.infer<typeof SummarizeIncidentReportsOutputSchema>;

export async function summarizeIncidentReports(input: SummarizeIncidentReportsInput): Promise<SummarizeIncidentReportsOutput> {
  return summarizeIncidentReportsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeIncidentReportsPrompt',
  input: {schema: SummarizeIncidentReportsInputSchema},
  output: {schema: SummarizeIncidentReportsOutputSchema},
  prompt: `You are a school administrator. Summarize the following incident reports to identify key issues and trends in student behavior and convivencia.\n\nIncident Reports:\n{{{reports}}}`,
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
