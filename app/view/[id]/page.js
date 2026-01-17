'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ComicDisplay from '../../components/ComicDisplay';
import Link from 'next/link';

export default function View() {
    const params = useParams();
    const router = useRouter();
    const [comic, setComic] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem(`comic_${params.id}`);
        if (stored) {
            setComic(JSON.parse(stored));
        } else {
            // Optional: Fetch from server if persistence was implemented
            // fetch(`/api...`)
        }
    }, [params.id]);

    if (!comic) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-neon-primary text-xl">Creating magic... or maybe it's lost in the ether.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 relative overflow-hidden">
            {/* Background */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 bg-[url('/bg-stars.png')] opacity-20" />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-accent rounded-full filter blur-[150px] opacity-10" />

            {/* Content */}
            <div className="relative z-10">
                <div className="mb-8 flex justify-center">
                    <Link href="/create">
                        <button className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition text-sm text-gray-400 hover:text-white">
                            ← Make Another Comic
                        </button>
                    </Link>
                </div>

                <ComicDisplay comic={comic} />
            </div>
        </div>
    );
}
