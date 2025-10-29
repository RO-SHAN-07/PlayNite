'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart } from 'lucide-react';

const developers = [
  { name: 'Roshan Sahu', initials: 'RS' },
  { name: 'Papun Sahu', initials: 'PS' },
  { name: 'Rohan Sahu', initials: 'RS' },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-2 mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline">About PlayNite</h1>
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
                  <AvatarImage src={`https://picsum.photos/seed/${dev.name.replace(' ', '')}/100/100`} data-ai-hint="person portrait" />
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
    </div>
  );
}
