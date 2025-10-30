'use server';

/**
 * @fileOverview Provides AI keyword analytics for trending topics.
 *
 * - getTrendingKeywords - A function that returns a list of trending keywords.
 * - TrendingKeywordsOutput - The return type for the getTrendingKeywords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrendingKeywordsOutputSchema = z.object({
  keywords: z.array(z.string()).describe('List of trending keywords.'),
  summary: z.string().describe('Summary of the current trending topics.'),
});
export type TrendingKeywordsOutput = z.infer<typeof TrendingKeywordsOutputSchema>;

export async function getTrendingKeywords(): Promise<TrendingKeywordsOutput> {
  return trendingKeywordsFlow();
}

const trendingKeywordsPrompt = ai.definePrompt({
  name: 'trendingKeywordsPrompt',
  output: {schema: TrendingKeywordsOutputSchema},
  prompt: `You are an expert in analyzing video content trends.
  Identify the top 10 trending keywords from video content and provide a short summary of these trends.
  Return the keywords and the summary in the following JSON format:
  {keywords: string[], summary: string}
  `,
});

const trendingKeywordsFlow = ai.defineFlow(
  {
    name: 'trendingKeywordsFlow',
    outputSchema: TrendingKeywordsOutputSchema,
  },
  async () => {
    const {output} = await trendingKeywordsPrompt({});
    return output!;
  }
);
