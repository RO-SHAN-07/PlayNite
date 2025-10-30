import { Suspense } from 'react';
import { SearchResults } from '@/components/search-results';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchIcon } from 'lucide-react';

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchSkeleton />}>
            <SearchResults />
        </Suspense>
    );
}

function SearchSkeleton() {
    return (
        <div className="space-y-8">
            <section>
                <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
                    <SearchIcon className="w-10 h-10 text-primary" />
                    Search Results
                </h1>
                <Skeleton className="h-7 w-64 mt-2" />
            </section>

            <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="aspect-video w-full rounded-lg" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
