import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh_-_8rem)] text-center px-4">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-foreground pr-4 border-r border-border">
          404
        </h1>
        <p className="text-lg text-muted-foreground">This page could not be found.</p>
      </div>
      <Button asChild className="mt-8">
        <Link href="/">Go back to Home</Link>
      </Button>
    </div>
  );
}
