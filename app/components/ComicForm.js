"use client";
import { useState } from 'react';

export default function ComicForm({ onSubmit, isLoading }) {
    const [formData, setFormData] = useState({
        name1: '',
        name2: '',
        img1: null,
        img2: null,
        genre: 'romantic',
        style: 'comic',
        mode: 'couple',
        plot: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, [field]: file }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const isSolo = formData.mode === 'solo';
        if (!formData.name1 || !formData.img1 || (!isSolo && (!formData.name2 || !formData.img2))) {
            alert(isSolo ? "Please provide name and image!" : "Please provide both names and images!");
            return;
        }

        // Create FormData to send
        const data = new FormData();
        data.append('name1', formData.name1);
        data.append('name2', formData.name2);
        data.append('img1', formData.img1);
        data.append('img2', formData.img2);
        data.append('genre', formData.genre);
        data.append('style', formData.style);
        data.append('mode', formData.mode);
        data.append('plot', formData.plot);

        onSubmit(data);
    };

    return (
        <div className="bg-white/80 backdrop-blur-md p-8 max-w-2xl mx-auto rounded-3xl shadow-xl border border-white mt-10 animate-slide-up">
            <h2 className="text-3xl font-serif text-center text-love-600 mb-2">Create Your Love Story</h2>
            <p className="text-center text-gray-500 mb-8 text-sm">Upload photos to let AI weave your romance</p>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Mode Selection */}
                <div className="space-y-1 mb-6">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 pl-1">Story Mode</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['couple', 'solo', 'friends'].map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, mode: m }))}
                                className={`py-2 px-4 rounded-xl border-2 font-bold text-sm uppercase tracking-wider transition-all
                                    ${formData.mode === m
                                        ? 'border-love-500 bg-love-50 text-love-600'
                                        : 'border-gray-100 bg-white text-gray-400 hover:border-gray-300'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Names Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 pl-1">
                            {formData.mode === 'solo' ? 'Main Character' : 'Partner 1'}
                        </label>
                        <input
                            type="text"
                            name="name1"
                            placeholder="Name..."
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-love-300 focus:border-transparent transition text-gray-700 placeholder-gray-300"
                            value={formData.name1}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {formData.mode !== 'solo' && (
                        <div className="space-y-1 animate-fade-in">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 pl-1">Partner 2</label>
                            <input
                                type="text"
                                name="name2"
                                placeholder="Name..."
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-love-300 focus:border-transparent transition text-gray-700 placeholder-gray-300"
                                value={formData.name2}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}
                </div>

                {/* Uploads Row */}
                <div className={`grid grid-cols-1 ${formData.mode !== 'solo' ? 'md:grid-cols-2' : ''} gap-4`}>
                    <div className="relative group">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 pl-1 mb-1">
                            {formData.mode === 'solo' ? 'Character Photo' : 'Photo 1'}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-love-100 file:text-love-700 hover:file:bg-love-200 cursor-pointer"
                            onChange={(e) => handleFileChange(e, 'img1')}
                            required
                        />
                    </div>

                    {formData.mode !== 'solo' && (
                        <div className="relative group animate-fade-in">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 pl-1 mb-1">Photo 2</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-love-100 file:text-love-700 hover:file:bg-love-200 cursor-pointer"
                                onChange={(e) => handleFileChange(e, 'img2')}
                                required
                            />
                        </div>
                    )}
                </div>

                <div className="h-px bg-gray-100 my-6"></div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 pl-1">Vibe / Genre</label>
                        <select
                            name="genre"
                            value={formData.genre}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-love-300 transition text-gray-700 appearance-none"
                        >
                            <option value="romantic">🌹 Romantic Date</option>
                            <option value="funny">😂 Romantic Comedy</option>
                            <option value="wedding">💍 Wedding Day</option>
                            <option value="fantasy">🧚 Fantasy Romance</option>
                            <option value="scifi">🚀 Sci-Fi Adventure</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 pl-1">Art Style</label>
                        <select
                            name="style"
                            value={formData.style}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-love-300 transition text-gray-700 appearance-none"
                        >
                            <option value="comic">🎨 Modern Comic</option>
                            <option value="manga">🎌 Shojo Manga (Anime)</option>
                            <option value="watercolor">🖌️ Soft Watercolor</option>
                            <option value="pixar">🎬 3D Animation</option>
                            <option value="oil">🖼️ Oil Painting</option>
                        </select>
                    </div>
                    <div className="space-y-1 col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 pl-1">Story Plot / Additional Details (Optional)</label>
                        <textarea
                            name="plot"
                            placeholder="E.g. A surprise proposal in Paris during rain..."
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-love-300 focus:border-transparent transition text-gray-700 placeholder-gray-300 min-h-[80px]"
                            value={formData.plot}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300 shadow-lg ${isLoading
                            ? 'bg-gray-300 cursor-not-allowed opacity-70 text-gray-500'
                            : 'bg-gradient-to-r from-love-500 to-rose-600 text-white hover:shadow-love-500/30 hover:-translate-y-1 transform'
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2 animate-pulse">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Dreaming up your story...
                            </span>
                        ) : (
                            'Generate Comic ❤️'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
