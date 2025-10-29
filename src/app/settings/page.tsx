'use client';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useUser, useAuth, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const settingsFormSchema = z.object({
  displayName: z.string().min(2, 'Username must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  language: z.string(),
  enableNotifications: z.boolean(),
  autoplayNext: z.boolean(),
  videoQuality: z.string(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            displayName: '',
            email: '',
            language: 'en',
            enableNotifications: true,
            autoplayNext: true,
            videoQuality: 'auto',
        },
    });

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/auth/login');
        }
        if (user) {
            form.reset({
                displayName: user.displayName || '',
                email: user.email || '',
                // These would typically be loaded from user preferences in Firestore
                language: 'en',
                enableNotifications: true,
                autoplayNext: true,
                videoQuality: 'auto',
            });
        }
    }, [user, isUserLoading, form, router]);

  async function onSubmit(data: SettingsFormValues) {
    if (!user || !auth?.currentUser || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Not authenticated.' });
        return;
    }
    
    try {
        if (data.displayName !== user.displayName) {
            await updateProfile(auth.currentUser, { displayName: data.displayName });
        }
        
        const userDocRef = doc(firestore, 'users', user.uid);
        updateDocumentNonBlocking(userDocRef, { displayName: data.displayName });

        // In a real app, you would also save other settings like language, notifications, etc.
        // updateDocumentNonBlocking(userDocRef, { preferences: { language: data.language, ... } });

        toast({
          title: 'Settings saved!',
          description: 'Your new settings have been successfully saved.',
        });

    } catch(error: any) {
         toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error.message || 'Could not save settings.',
        });
    }
  }

  if (isUserLoading || !user) {
      return (
        <div className="max-w-4xl mx-auto flex justify-center items-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account and site settings.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold font-headline">Account</h2>
            <Separator />
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Your username" {...field} />
                  </FormControl>
                  <FormDescription>This is your public display name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Your email" {...field} disabled />
                  </FormControl>
                  <FormDescription>
                    Your email address cannot be changed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>The language for the user interface.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold font-headline">Playback</h2>
            <Separator />
            <FormField
              control={form.control}
              name="autoplayNext"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Autoplay Next Video</FormLabel>
                    <FormDescription>
                      Automatically play the next video in a series or playlist.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="videoQuality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Video Quality</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select video quality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="1080p">1080p (HD)</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                       <SelectItem value="480p">480p</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Set the default quality for video playback.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
           <div className="space-y-6">
            <h2 className="text-2xl font-semibold font-headline">Notifications</h2>
            <Separator />
            <FormField
              control={form.control}
              name="enableNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Enable Notifications</FormLabel>
                    <FormDescription>
                      Receive notifications about new videos and comments.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  );
}
