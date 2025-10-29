'use client';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { generateSearchSuggestions } from '@/ai/flows/ai-search-suggestions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2 } from 'lucide-react';

export function SearchInput() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 3) {
                setSuggestions([]);
                return;
            }
            setLoading(true);
            try {
                const result = await generateSearchSuggestions({ query });
                setSuggestions(result);
            } catch (error) {
                console.error("Failed to fetch suggestions", error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);

    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            inputRef.current?.blur();
            setSuggestions([]);
        }
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        router.push(`/search?q=${encodeURIComponent(suggestion)}`);
        setSuggestions([]);
    };

    return (
        <div className="relative w-full max-w-md">
            <Popover open={isFocused && (suggestions.length > 0 || loading) && query.length > 2}>
                <PopoverTrigger asChild>
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            placeholder="Search for videos, creators..."
                            className="pl-10 bg-muted/50 border-none focus-visible:ring-primary focus-visible:ring-2"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                        />
                    </form>
                </PopoverTrigger>
                 <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    {loading && (
                        <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                           <Loader2 className="w-4 h-4 animate-spin"/> Searching...
                        </div>
                    )}
                    {!loading && suggestions.length > 0 && (
                        <ul className="space-y-1 p-2">
                           {suggestions.map((suggestion, index) => (
                                <li 
                                    key={index}
                                    className="p-2 rounded-md hover:bg-accent cursor-pointer text-sm"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion}
                                </li>
                           ))}
                        </ul>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
}
