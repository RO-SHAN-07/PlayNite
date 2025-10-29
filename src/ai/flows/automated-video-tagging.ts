'use server';

/**
 * @fileOverview Automatically tags videos based on their content using AI.
 *
 * - automatedVideoTagging - A function that handles the video tagging process.
 * - AutomatedVideoTaggingInput - The input type for the automatedVideoTagging function.
 * - AutomatedVideoTaggingOutput - The return type for the automatedVideoTagging function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedVideoTaggingInputSchema = z.object({
  videoTitle: z.string().describe('The title of the video.'),
  videoDescription: z.string().describe('The description of the video.'),
  videoTranscript: z.string().describe('The transcript of the video content.'),
});
export type AutomatedVideoTaggingInput = z.infer<typeof AutomatedVideoTaggingInputSchema>;

const AutomatedVideoTaggingOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of relevant tags for the video.'),
});
export type AutomatedVideoTaggingOutput = z.infer<typeof AutomatedVideoTaggingOutputSchema>;

export async function automatedVideoTagging(input: AutomatedVideoTaggingInput): Promise<AutomatedVideoTaggingOutput> {
  return automatedVideoTaggingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedVideoTaggingPrompt',
  input: {schema: AutomatedVideoTaggingInputSchema},
  output: {schema: AutomatedVideoTaggingOutputSchema},
  prompt: `You are an expert in video content analysis and tagging.

  Based on the video title, description, and transcript, generate a list of relevant tags that can be used to improve the video's searchability and organization.

  Title: {{{videoTitle}}}
  Description: {{{videoDescription}}}
  Transcript: {{{videoTranscript}}}

  Return ONLY an array of relevant tags. No other explanation is necessary.
  `, 
});

const automatedVideoTaggingFlow = ai.defineFlow(
  {
    name: 'automatedVideoTaggingFlow',
    inputSchema: AutomatedVideoTaggingInputSchema,
    outputSchema: AutomatedVideoTaggingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
