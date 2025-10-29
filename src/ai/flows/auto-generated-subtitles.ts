'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating subtitles for videos using AI.
 *
 * The flow takes video content (ideally in a data URI format, though a direct URL could also work) and
 * generates subtitles, returning them as a string (likely in a format like SRT or VTT).
 *
 * @exports generateSubtitles - The main function to trigger subtitle generation.
 * @exports GenerateSubtitlesInput - The input type for the generateSubtitles function.
 * @exports GenerateSubtitlesOutput - The output type for the generateSubtitles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSubtitlesInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "The video content to generate subtitles for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>' or a publicly accessible URL."
    ),
});
export type GenerateSubtitlesInput = z.infer<typeof GenerateSubtitlesInputSchema>;

const GenerateSubtitlesOutputSchema = z.object({
  subtitles: z.string().describe('The generated subtitles for the video.'),
});
export type GenerateSubtitlesOutput = z.infer<typeof GenerateSubtitlesOutputSchema>;

export async function generateSubtitles(input: GenerateSubtitlesInput): Promise<GenerateSubtitlesOutput> {
  return generateSubtitlesFlow(input);
}

const generateSubtitlesPrompt = ai.definePrompt({
  name: 'generateSubtitlesPrompt',
  input: {schema: GenerateSubtitlesInputSchema},
  output: {schema: GenerateSubtitlesOutputSchema},
  prompt: `You are an AI that generates subtitles for videos.

  Given the following video content, generate accurate and well-formatted subtitles.
  The subtitles should be in plain text format and be as accurate as possible.

  Video Content: {{media url=videoDataUri}}
  Subtitles:`, // Assuming videoDataUri can handle direct URLs or data URIs.
});

const generateSubtitlesFlow = ai.defineFlow(
  {
    name: 'generateSubtitlesFlow',
    inputSchema: GenerateSubtitlesInputSchema,
    outputSchema: GenerateSubtitlesOutputSchema,
  },
  async input => {
    const {output} = await generateSubtitlesPrompt(input);
    return output!;
  }
);
