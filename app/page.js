import Link from 'next/link';

export default function Home() {
  // Generate random hearts for background
  const hearts = Array.from({ length: 20 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    duration: `${10 + Math.random() * 20}s`,
    size: `${1 + Math.random() * 2}rem`,
    delay: `-${Math.random() * 20}s`
  }));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden px-4">
      {/* Floating Hearts Background */}
      <div className="bg-hearts">
        {hearts.map((h, i) => (
          <div
            key={i}
            className="heart-particle text-love-200"
            style={{
              left: h.left,
              fontSize: h.size,
              '--duration': h.duration,
              animationDelay: h.delay
            }}
          >
            ❤
          </div>
        ))}
      </div>

      <div className="text-center space-y-8 max-w-4xl z-10">
        <div className="inline-block p-2 px-4 rounded-full bg-love-100 text-love-600 font-semibold tracking-wider text-sm mb-4 animate-fade-in shadow-sm border border-love-200">
          ✨ The Most Romantic Gift for 2026
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-gray-900 drop-shadow-sm font-serif leading-tight">
          Capture Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-love-500 to-rose-600 animate-pulse">True Love</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
          Transform your special moments into a masterpiece. <br />
          Starring <strong>You & Your Partner</strong> in a customized AI love story.
        </p>

        <div className="pt-8">
          <Link href="/create">
            <button className="group relative px-12 py-6 bg-love-600 hover:bg-love-700 text-white rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
              <span className="relative z-10 text-2xl font-bold flex items-center gap-3">
                Create Your Story <span className="group-hover:animate-bounce">❤️</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-love-500 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </Link>
          <p className="mt-4 text-sm text-gray-400">Perfect for Anniversaries, Proposals, or Just Because.</p>
        </div>
      </div>

      {/* Footer Features */}
      <div className="absolute bottom-8 w-full flex justify-center gap-8 text-gray-500 text-sm font-medium">
        <span className="flex items-center gap-1">🌸 Beautiful Styles</span>
        <span className="flex items-center gap-1">💑 Face Consistency</span>
        <span className="flex items-center gap-1">⚡ Instant Magic</span>
      </div>
    </div>
  );
}
