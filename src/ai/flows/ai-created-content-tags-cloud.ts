'use server';

/**
 * @fileOverview Generates a dynamic content tags cloud for the Explore page using AI.
 *
 * - generateContentTagsCloud - A function that generates a cloud of content tags.
 * - ContentTagsCloudInput - The input type for the generateContentTagsCloud function (empty).
 * - ContentTagsCloudOutput - The return type for the generateContentTagsCloud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentTagsCloudInputSchema = z.object({});
export type ContentTagsCloudInput = z.infer<typeof ContentTagsCloudInputSchema>;

const ContentTagsCloudOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of content tags for the tag cloud.'),
});
export type ContentTagsCloudOutput = z.infer<typeof ContentTagsCloudOutputSchema>;

export async function generateContentTagsCloud(input: ContentTagsCloudInput): Promise<ContentTagsCloudOutput> {
  return generateContentTagsCloudFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentTagsCloudPrompt',
  input: {schema: ContentTagsCloudInputSchema},
  output: {schema: ContentTagsCloudOutputSchema},
  prompt: `You are an AI content curator. Generate a list of diverse and engaging content tags suitable for a video streaming platform's "Explore" page. These tags should represent a wide range of video categories, themes, and interests. Ensure that the tags are relevant, trending, and appealing to a broad audience. The tags should not include any personally identifying information or violate any privacy standards. Return an array of strings. The output must be in JSON format.`,
});

const generateContentTagsCloudFlow = ai.defineFlow(
  {
    name: 'generateContentTagsCloudFlow',
    inputSchema: ContentTagsCloudInputSchema,
    outputSchema: ContentTagsCloudOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
