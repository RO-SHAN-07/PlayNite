'use server';

/**
 * @fileOverview An AI agent to translate UI text into a user's preferred language.
 *
 * - translateUi: A function that translates UI text.
 * - TranslateUiInput: The input type for the translateUi function.
 * - TranslateUiOutput: The return type for the translateUi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateUiInputSchema = z.object({
  text: z.string().describe('The UI text to translate.'),
  language: z.string().describe('The target language for translation (e.g., es for Spanish).'),
});
export type TranslateUiInput = z.infer<typeof TranslateUiInputSchema>;

const TranslateUiOutputSchema = z.object({
  translatedText: z.string().describe('The translated UI text.'),
});
export type TranslateUiOutput = z.infer<typeof TranslateUiOutputSchema>;

export async function translateUi(input: TranslateUiInput): Promise<TranslateUiOutput> {
  return translateUiFlow(input);
}

const translateUiPrompt = ai.definePrompt({
  name: 'translateUiPrompt',
  input: {schema: TranslateUiInputSchema},
  output: {schema: TranslateUiOutputSchema},
  prompt: `Translate the following UI text into {{language}}:

Text: {{{text}}}

Translation:`, // The prompt leverages the output schema's descriptions.
});

const translateUiFlow = ai.defineFlow(
  {
    name: 'translateUiFlow',
    inputSchema: TranslateUiInputSchema,
    outputSchema: TranslateUiOutputSchema,
  },
  async input => {
    const {output} = await translateUiPrompt(input);
    return output!;
  }
);
