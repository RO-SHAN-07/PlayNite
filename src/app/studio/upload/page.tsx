'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { UploadCloud, Loader2, CheckCircle } from 'lucide-react';
import { automatedVideoTagging } from '@/ai/flows/automated-video-tagging';
import { Badge } from '@/components/ui/badge';
import { summarizeVideo } from '@/ai/flows/video-summarization';

const uploadFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().optional(),
  tags: z.string().optional(),
  videoFile: z.instanceof(File).refine(file => file.size > 0, 'Please upload a video file.'),
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
    },
  });

  const handleGenerateTags = async () => {
    const title = form.getValues('title');
    const description = form.getValues('description');
    if (!title) {
      form.setError('title', { message: 'Please enter a title first.'});
      return;
    }
    setIsGeneratingTags(true);
    try {
      const result = await automatedVideoTagging({
        videoTitle: title,
        videoDescription: description || '',
        videoTranscript: '', // Transcript not available in this simple form
      });
      form.setValue('tags', result.tags.join(', '));
      toast({ title: 'AI tags generated!', description: 'Review the generated tags below.'});
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate tags.' });
    } finally {
      setIsGeneratingTags(false);
    }
  };
  
  const handleGenerateSummary = async () => {
    const title = form.getValues('title');
    const tags = form.getValues('tags');
    if (!title) {
      form.setError('title', { message: 'Please enter a title first.'});
      return;
    }
    setIsGeneratingSummary(true);
    try {
      const result = await summarizeVideo({
        videoTitle: title,
        videoDescription: '',
        videoTags: tags || '',
      });
      form.setValue('description', result.summary);
      toast({ title: 'AI summary generated!', description: 'Review the generated summary below.'});
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate summary.' });
    } finally {
      setIsGeneratingSummary(false);
    }
  }


  async function onSubmit(data: UploadFormValues) {
    setIsUploading(true);
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsUploading(false);
    setIsUploaded(true);
    toast({
      title: 'Upload Complete!',
      description: `Your video "${data.title}" has been uploaded successfully.`,
    });
  }

  if (isUploaded) {
    return (
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center text-center h-[60vh]">
            <CheckCircle className="w-24 h-24 text-green-500 mb-4" />
            <h1 className="text-3xl font-bold font-headline mb-2">Upload Successful!</h1>
            <p className="text-muted-foreground mb-6">Your video is now processing and will be available shortly.</p>
            <div className='flex gap-4'>
                <Button onClick={() => {
                    setIsUploaded(false);
                    form.reset();
                }}>Upload Another Video</Button>
                <Button variant="outline" asChild>
                    <a href="/studio">Go to Studio</a>
                </Button>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-bold font-headline">Upload Video</h1>
        <p className="text-muted-foreground">Add a new video to your channel.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="videoFile"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                <FormLabel>Video File</FormLabel>
                <FormControl>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">MP4, WEBM, or OGG (MAX. 500MB)</p>
                      </div>
                      <Input 
                        id="dropzone-file" 
                        type="file" 
                        className="hidden" 
                        accept="video/mp4,video/webm,video/ogg"
                        onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
                        {...rest}
                       />
                    </label>
                  </div>
                </FormControl>
                {value?.name && <p className='text-sm text-muted-foreground pt-2'>Selected file: {value.name}</p>}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="My Awesome Video" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Description</FormLabel>
                   <Button type="button" variant="link" size="sm" onClick={handleGenerateSummary} disabled={isGeneratingSummary}>
                    {isGeneratingSummary ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Generate with AI
                  </Button>
                </div>
                <FormControl>
                  <Textarea placeholder="Tell viewers about your video" className="resize-y" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                 <div className="flex items-center justify-between">
                    <FormLabel>Tags</FormLabel>
                    <Button type="button" variant="link" size="sm" onClick={handleGenerateTags} disabled={isGeneratingTags}>
                        {isGeneratingTags ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Generate with AI
                    </Button>
                 </div>
                <FormControl>
                  <Input placeholder="gaming, tutorial, funny" {...field} />
                </FormControl>
                <FormDescription>
                  Comma-separated tags. AI-generated tags can help improve discovery.
                </FormDescription>
                <div className='flex flex-wrap gap-2 pt-2'>
                    {field.value?.split(',').filter(tag => tag.trim() !== '').map((tag, i) => (
                        <Badge key={i} variant="secondary">{tag.trim()}</Badge>
                    ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? 'Uploading...' : 'Upload Video'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
