import React from "react";

// --- ICONS ---
const IconVector = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    <circle cx="7" cy="19" r="2" />
    <circle cx="16.5" cy="6.5" r="2" />
  </svg>
);

const IconFace = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 8a5 5 0 0 1 0 10" />
    <path d="M7 8a5 5 0 0 0 0 10" />
    <path d="M12 2v20" />
    <circle cx="12" cy="11" r="2" />
    <path d="M10 16.5a2.5 2.5 0 0 0 4 0" />
  </svg>
);

const IconArrowRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const IconMic = () => (
  <svg
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="22"></line>
  </svg>
);

const IconCode = () => (
  <svg
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

const IconLayers = () => (
  <svg
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

const IconGithub = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

const IconLogo = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-blue-600"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

export default function Home() {
  return (
    <main className="flex-1 bg-slate-950 text-slate-200 font-sans relative overflow-x-hidden selection:bg-blue-500/30 overflow-hidden">
      {/* --- BACKGROUND GLOWS --- */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute top-[40%] right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-[150px] translate-y-1/2 pointer-events-none"></div>

      {/* --- NAVIGATION BAR --- */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-black tracking-tight text-white">
            AvatarSuite
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#showcase" className="hover:text-white transition-colors">
            Showcase
          </a>
          <a href="#studios" className="hover:text-white transition-colors">
            Studios
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <IconGithub />
          </a>
          <a
            href="#studios"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-bold text-white transition-all backdrop-blur-md"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-20 pb-32 px-6 flex flex-col items-center text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          V3 Engine Now Live
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Design, Rig, and Animate <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-emerald-300">
            Your Digital Identity.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          An open-source, mathematically-driven 2D pipeline. Trace raw geometry
          in the Blueprint Studio, then instantly bring it to life with live
          audio puppeteering.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <a
            href="#studios"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2"
          >
            Launch Studios <IconArrowRight />
          </a>
          <a
            href="#features"
            className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-md"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* --- SHOWCASE / EXAMPLE SECTION --- */}
      <section
        id="showcase"
        className="relative z-10 py-20 px-6 max-w-6xl mx-auto w-full border-t border-white/5"
      >
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Inspired by the Best.
            </h2>
            <p className="text-slate-400 leading-relaxed text-lg">
              Our vector engine is capable of reproducing high-quality 2D
              character designs. Draw inspiration from platforms like{" "}
              <a
                href="https://blush.design"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
              >
                Blush.design
              </a>
              , trace their proportions, and export them directly into
              interactive React components.
            </p>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-center gap-3">
                <span className="text-emerald-500">✓</span> Pixel-perfect bezier
                curves
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-500">✓</span> Modular wardrobe
                switching
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-500">✓</span> No massive image
                files—just code
              </li>
            </ul>
          </div>

          <div className="flex-1 w-full max-w-md relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-emerald-400 rounded-[2.5rem] blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl aspect-square flex items-center justify-center overflow-hidden">
              {/* Abstract Avatar Graphic representing the Blush/Vector aesthetic */}
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full drop-shadow-2xl"
              >
                <circle cx="200" cy="200" r="180" fill="#1e293b" />
                {/* Torso */}
                <path d="M100,400 Q200,250 300,400" fill="#3b82f6" />
                <path d="M150,400 L200,320 L250,400" fill="#1d4ed8" />
                {/* Head */}
                <path
                  d="M140,220 Q140,120 200,120 Q260,120 260,220 Q260,280 200,320 Q140,280 140,220"
                  fill="#fcd34d"
                />
                {/* Hair */}
                <path
                  d="M120,200 Q120,80 200,80 Q280,80 280,200 Q260,100 200,100 Q140,100 120,200"
                  fill="#1c1917"
                />
                <path
                  d="M200,80 Q150,150 120,180"
                  stroke="#1c1917"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                {/* Glasses */}
                <circle
                  cx="170"
                  cy="210"
                  r="25"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                <circle
                  cx="230"
                  cy="210"
                  r="25"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                <line
                  x1="195"
                  y1="210"
                  x2="205"
                  y2="210"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                {/* Mouth */}
                <path
                  d="M180,270 Q200,290 220,270"
                  fill="none"
                  stroke="#b45309"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* --- BENTO BOX FEATURES --- */}
      <section
        id="features"
        className="relative z-10 py-20 px-6 max-w-6xl mx-auto w-full"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
            Powerful Core Features
          </h2>
          <p className="text-slate-400">
            Everything you need to build interactive 2D characters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          {/* Big Box 1 */}
          <div className="md:col-span-2 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:bg-slate-800/50 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <IconVector />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Mathematical Precision
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                No raster images required. Trace over your reference art using
                Bezier and Quadratic curves. The engine calculates the exact
                HTML5 Canvas API commands needed to render your artwork cleanly
                at any resolution.
              </p>
            </div>
          </div>

          {/* Small Box 1 */}
          <div className="md:col-span-1 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:bg-slate-800/50 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <IconMic />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Live Lip Sync
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Real-time audio analysis converts microphone input into dynamic
                mouth openness and natural head-tilting physics.
              </p>
            </div>
          </div>

          {/* Small Box 2 */}
          <div className="md:col-span-1 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:bg-slate-800/50 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <IconLayers />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Smart Tagging
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Name your layers with tags like <code>--hair</code> or{" "}
                <code>--glasses</code> to automatically map them to the correct
                dynamic facial pivots.
              </p>
            </div>
          </div>

          {/* Big Box 2 */}
          <div className="md:col-span-2 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:bg-slate-800/50 transition-colors group relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
              <IconCode />
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <IconCode />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Export to Production
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                Once tuned, export a clean `avatar-config.json` and a set of
                `.env` variables. Drop them directly into your Next.js
                application's Player component for an instant, interactive 2D
                mascot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- STUDIOS CTA SECTION --- */}
      <section
        id="studios"
        className="relative z-10 py-24 px-6 w-full max-w-6xl mx-auto flex flex-col items-center"
      >
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-12 text-center">
          Select Your Workspace
        </h2>

        <div className="grid md:grid-cols-2 gap-8 w-full">
          {/* Blueprint Card */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-[2rem] p-2 hover:border-blue-500/50 transition-all duration-500 group shadow-2xl">
            <div className="bg-slate-950 rounded-[1.5rem] p-8 h-full flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <IconVector />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Blueprint Studio
              </h3>
              <p className="text-slate-400 mb-8 flex-1">
                The drawing board. Plot mathematical anchors, use freehand
                brushes, and export raw geometric state data.
              </p>
              <a
                href="/blueprint-studio"
                className="w-full py-4 bg-white/5 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors border border-white/10 hover:border-blue-500 block text-center"
              >
                Open Blueprint Studio
              </a>
            </div>
          </div>

          {/* Avatar Card */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-[2rem] p-2 hover:border-emerald-500/50 transition-all duration-500 group shadow-2xl">
            <div className="bg-slate-950 rounded-[1.5rem] p-8 h-full flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                <IconFace />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Avatar Studio
              </h3>
              <p className="text-slate-400 mb-8 flex-1">
                The rigging suite. Import blueprints, tune facial proportions,
                test the audio puppeteer, and export assets.
              </p>
              <a
                href="/avatar-studio"
                className="w-full py-4 bg-white/5 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors border border-white/10 hover:border-emerald-500 block text-center"
              >
                Open Avatar Studio
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER & CREDITS --- */}
      <footer className="relative z-10 w-full border-t border-slate-800 bg-slate-950 mt-12 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IconLogo />
              <span className="font-black tracking-tight text-white text-xl">
                AvatarSuite
              </span>
            </div>
            <p className="text-slate-500 max-w-sm">
              A completely client-side, open-source pipeline for creating
              interactive mathematical 2D avatars in React and Next.js.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-white font-bold mb-2">Resources</h4>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              GitHub Repository
            </a>
            <a
              href="https://blush.design"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Blush Design (Inspiration)
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} AvatarSuite Pipeline. Open Source MIT
            License.
          </p>

          {/* CREDITS SECTION */}
          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
            <span className="text-slate-400">Architected & Created by</span>
            <span className="font-bold text-white tracking-wide">
              The Creator
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
