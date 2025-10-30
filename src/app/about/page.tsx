'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Mail } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const developers = [
  { name: 'Roshan Sahu', initials: 'RS', imageId: 'dev-roshan' },
  { name: 'Papun Sahu', initials: 'PS', imageId: 'dev-papun' },
  { name: 'Rohan Sahu', initials: 'RS', imageId: 'dev-rohan' },
];

export default function AboutPage() {

  const getImageUrl = (id: string) => {
    return placeholderImages.find(p => p.id === id)?.imageUrl || `https://picsum.photos/seed/${id}/100/100`;
  }
  const getImageHint = (id: string) => {
    return placeholderImages.find(p => p.id === id)?.imageHint || `person`;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
         <div className="flex items-center gap-3">
            <div className="bg-primary p-3 rounded-2xl">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary-foreground"
                >
                    <path d="M7 4v16l13-8L7 4z"></path>
                </svg>
            </div>
            <h1 className="text-5xl font-bold font-headline">PlayNite</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          A modern video streaming platform built with passion.
        </p>
      </div>

      <Card className="bg-card/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">Developed By</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-8">
            {developers.map((dev) => (
              <div key={dev.name} className="flex flex-col items-center gap-3">
                <Avatar className="w-24 h-24 text-3xl">
                  <Image 
                    src={getImageUrl(dev.imageId)} 
                    alt={dev.name} 
                    width={100} 
                    height={100} 
                    data-ai-hint={getImageHint(dev.imageId)} 
                  />
                  <AvatarFallback>{dev.initials}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-lg">{dev.name}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center mt-8 text-muted-foreground">
             <Heart className="w-5 h-5 mr-2 text-primary" />
             <span>Crafted with love and code</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">Support</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">For bug reports, support, or feedback, please contact us at:</p>
            <a href="mailto:roshan8800jp@gmail.com" className="flex items-center justify-center gap-2 text-primary hover:underline">
                <Mail className="w-5 h-5" />
                roshan8800jp@gmail.com
            </a>
        </CardContent>
      </Card>
    </div>
  );
}
