'use server';

/**
 * @fileOverview An AI-powered search suggestion flow.
 *
 * - generateSearchSuggestions - A function that generates search suggestions based on user input.
 * - SearchSuggestionsInput - The input type for the generateSearchSuggestions function.
 * - SearchSuggestionsOutput - The return type for the generateSearchSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchSuggestionsInputSchema = z.object({
  query: z.string().describe('The user input query string.'),
});

export type SearchSuggestionsInput = z.infer<typeof SearchSuggestionsInputSchema>;

const SearchSuggestionsOutputSchema = z.array(z.string()).describe('An array of search suggestions.');

export type SearchSuggestionsOutput = z.infer<typeof SearchSuggestionsOutputSchema>;

export async function generateSearchSuggestions(input: SearchSuggestionsInput): Promise<SearchSuggestionsOutput> {
  return searchSuggestionsFlow(input);
}

const searchSuggestionsPrompt = ai.definePrompt({
  name: 'searchSuggestionsPrompt',
  input: {schema: SearchSuggestionsInputSchema},
  output: {schema: SearchSuggestionsOutputSchema},
  prompt: `You are an AI assistant that provides search suggestions for a video platform.

  Based on the user's current query, provide a list of relevant and helpful search suggestions.
  Include typo corrections and related search terms to help the user find what they're looking for.
  Return the suggestions as a JSON array of strings.

  Current query: {{{query}}}`,
});

const searchSuggestionsFlow = ai.defineFlow(
  {
    name: 'searchSuggestionsFlow',
    inputSchema: SearchSuggestionsInputSchema,
    outputSchema: SearchSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await searchSuggestionsPrompt(input);
    return output!;
  }
);
