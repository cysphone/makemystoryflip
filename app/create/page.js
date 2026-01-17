'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ComicForm from '../components/ComicForm';

export default function Create() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleComicSubmit(formData) {
        setLoading(true);

        try {
            const res = await fetch('/api/create-comic', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || data.error || "Server failed");
            }

            // Save data to localStorage to pass to view page
            localStorage.setItem(`comic_${data.comicId}`, JSON.stringify(data));
            router.push(`/view/${data.comicId}`);

        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen py-20 px-4">
            {/* Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-primary rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse-glow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-secondary rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse-glow" style={{ animationDelay: '1s' }} />
            </div>

            <ComicForm onSubmit={handleComicSubmit} isLoading={loading} />
        </div>
    );
}
