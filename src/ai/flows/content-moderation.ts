'use server';

/**
 * @fileOverview An AI agent for moderating video content based on predefined policies.
 *
 * - moderateContent - A function that moderates video content.
 * - ModerateContentInput - The input type for the moderateContent function.
 * - ModerateContentOutput - The return type for the moderateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateContentInputSchema = z.object({
  videoTitle: z.string().describe('The title of the video.'),
  videoDescription: z.string().describe('The description of the video.'),
  videoTags: z.string().describe('The tags associated with the video.'),
  contentPolicy: z
    .string()
    .describe(
      'The content policy that the video should be checked against. Should include categories such as hate speech, violence, sexually explicit content, and dangerous activities.'
    ),
});
export type ModerateContentInput = z.infer<typeof ModerateContentInputSchema>;

const ModerateContentOutputSchema = z.object({
  isCompliant: z
    .boolean()
    .describe(
      'Whether the video complies with the content policy. True if the video is compliant, false otherwise.'
    ),
  reason: z
    .string()
    .optional()
    .describe(
      'The reason why the video is not compliant with the content policy. Required only if isCompliant is false.'
    ),
});
export type ModerateContentOutput = z.infer<typeof ModerateContentOutputSchema>;

export async function moderateContent(
  input: ModerateContentInput
): Promise<ModerateContentOutput> {
  return moderateContentFlow(input);
}

const shouldRemoveVideo = ai.defineTool({
  name: 'shouldRemoveVideo',
  description:
    'This tool is used to determine whether a video should be removed based on content policy violations.',
  inputSchema: z.object({
    reason: z.string().describe('The reason for removing the video.'),
  }),
  outputSchema: z.boolean(),
}, async (input) => {
  // Placeholder implementation for removing the video.
  // In a real application, this would perform the actual removal.
  console.log(`Video removal requested because: ${input.reason}`);
  return true; // Indicate that the video should be removed.
});

const prompt = ai.definePrompt({
  name: 'moderateContentPrompt',
  input: {schema: ModerateContentInputSchema},
  output: {schema: ModerateContentOutputSchema},
  tools: [shouldRemoveVideo],
  system:
    `You are an AI content moderator. You will evaluate videos based on the provided content policy.  If the video violates the policy, you MUST use the shouldRemoveVideo tool to mark it for removal and explain why. If the video complies with the policy, you MUST respond that it is compliant. Content Policy: {{{contentPolicy}}}`,
  prompt: `Video Title: {{{videoTitle}}}\nVideo Description: {{{videoDescription}}}\nVideo Tags: {{{videoTags}}}`, // Added videoTags to the prompt
});

const moderateContentFlow = ai.defineFlow(
  {
    name: 'moderateContentFlow',
    inputSchema: ModerateContentInputSchema,
    outputSchema: ModerateContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
