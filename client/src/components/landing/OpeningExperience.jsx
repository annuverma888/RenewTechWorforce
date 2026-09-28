import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, ArrowRight, ShieldCheck, Sun, Wind, CheckCircle2, Building2, Wrench, Award } from 'lucide-react';

// 3 Core Quotes tailored for clean energy workforce (~4.2s target duration)
const QUOTES = [
  {
    id: 1,
    content: (
      <>
        The future of <span className="text-emerald-600 font-black">energy</span> begins with{' '}
        <span className="text-emerald-600 font-black">skilled people</span>.
      </>
    ),
    tag: 'Energy & Talent',
  },
  {
    id: 2,
    content: (
      <>
        Powering clean energy with{' '}
        <span className="text-emerald-600 font-black">verified skills</span>.
      </>
    ),
    tag: 'Verified Skills',
  },
  {
    id: 3,
    content: (
      <>
        Connecting <span className="text-emerald-600 font-black">talent</span> to the{' '}
        <span className="text-emerald-600 font-black">energy transition</span>.
      </>
    ),
    tag: 'Energy Transition',
  },
];

// Interactive network node labels (Desktop/Laptop only >= 1024px)
const NETWORK_LABELS = [
  { text: 'Solar PV Systems', icon: Sun, xRatio: 0.13, yRatio: 0.28 },
  { text: 'Certified Technicians', icon: Wrench, xRatio: 0.50, yRatio: 0.13 },
  { text: 'Wind Farm Utility', icon: Wind, xRatio: 0.87, yRatio: 0.26 },
  { text: 'Verified Skills', icon: ShieldCheck, xRatio: 0.14, yRatio: 0.74 },
  { text: 'Skill Passport', icon: Award, xRatio: 0.50, yRatio: 0.87 },
  { text: 'EPC Contractors', icon: Building2, xRatio: 0.86, yRatio: 0.74 },
];

const OpeningExperience = ({ onTransitionStart, onComplete }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [quotePhase, setQuotePhase] = useState('entering'); // 'entering' | 'visible' | 'exiting'
  const [stage, setStage] = useState('particles'); // 'particles' | 'quotes' | 'logo'
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const transitionStartedRef = useRef(false);
  const completedRef = useRef(false);

  // Smooth homepage cross-fade transition coordinator (800ms duration)
  const startTransition = useCallback(() => {
    if (transitionStartedRef.current) return;
    transitionStartedRef.current = true;
    setIsExiting(true);
    onTransitionStart?.();

    setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete?.();
    }, 800);
  }, [onTransitionStart, onComplete]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onTransitionStart?.();
      onComplete?.();
    }
  }, [onTransitionStart, onComplete]);

  // Master Timeline Coordinator (~4.25s total runtime):
  // - Particles initial start: 0 - 300ms
  // - Quotes 1 to 3: 300ms - 3150ms (950ms per quote: fade in -> stay visible -> soft fade out)
  // - Logo + Brand + Subtitle + Tagline: 3150ms - 4250ms (visible for ~1.1s)
  // - Smooth cross-fade transition: 4250ms - 5050ms (0.8s)
  useEffect(() => {
    const QUOTE_START = 300;
    const QUOTE_DURATION = 950;
    const QUOTE_COUNT = QUOTES.length;
    const QUOTES_TOTAL_TIME = QUOTE_DURATION * QUOTE_COUNT; // 2850ms
    const LOGO_START = QUOTE_START + QUOTES_TOTAL_TIME; // 3150ms
    const LOGO_DURATION = 1100; // 1.1s logo/brand display
    const TRANSITION_START_TIME = LOGO_START + LOGO_DURATION; // 4250ms
    const TOTAL_TIME = TRANSITION_START_TIME + 800; // 5050ms

    let activeQuoteIndex = 0;
    let activeQuotePhase = 'entering';

    const interval = 30;

    const timer = setInterval(() => {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min(100, Math.round((elapsed / TOTAL_TIME) * 100)));

      // Step 1: Initial energy particle network (0 - 300ms)
      if (elapsed < QUOTE_START) {
        setStage('particles');
      }
      // Step 2: Smooth Quote Sequence with entering / visible / exiting phases (300ms - 3150ms)
      else if (elapsed >= QUOTE_START && elapsed < LOGO_START) {
        setStage('quotes');
        const quoteElapsed = elapsed - QUOTE_START;
        const calculatedIndex = Math.min(
          QUOTE_COUNT - 1,
          Math.floor(quoteElapsed / QUOTE_DURATION)
        );
        const timeInQuote = quoteElapsed % QUOTE_DURATION;

        // Quote transitions: Fade in & glide up (0-200ms), stay visible (200-750ms), soft fade out (750-950ms)
        let newPhase = 'visible';
        if (timeInQuote < 200) {
          newPhase = 'entering';
        } else if (timeInQuote >= 750) {
          newPhase = 'exiting';
        } else {
          newPhase = 'visible';
        }

        if (calculatedIndex !== activeQuoteIndex) {
          activeQuoteIndex = calculatedIndex;
          setCurrentQuoteIndex(calculatedIndex);
        }
        if (newPhase !== activeQuotePhase) {
          activeQuotePhase = newPhase;
          setQuotePhase(newPhase);
        }
      }
      // Step 3: Logo, Brand Name & Tagline reveal (3150ms - 4250ms)
      else if (elapsed >= LOGO_START && elapsed < TRANSITION_START_TIME) {
        setStage('logo');
      }
      // Step 4: Complete intro and trigger smooth cross-fade into homepage (4250ms)
      else if (elapsed >= TRANSITION_START_TIME) {
        clearInterval(timer);
        startTransition();
      }
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [startTransition]);

  // Canvas Particle System, Renewable Visuals (Wind, Solar, Waves) & Connected Skill Network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes for Skills, Technicians, Projects & Energy
    const PARTICLE_COUNT = Math.min(65, Math.floor((width * height) / 18000));
    const particles = [];
    const colors = ['#059669', '#10b981', '#0d9488', '#0284c7', '#34d399'];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.65,
        vy: (Math.random() - 0.5) * 0.65,
        radius: Math.random() * 2.2 + 1.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.025,
        originalRadius: Math.random() * 2.2 + 1.6,
      });
    }

    // Dynamic energy packets travelling along active lines
    const packets = [];
    const createPacket = (p1, p2) => {
      packets.push({
        x: p1.x,
        y: p1.y,
        targetX: p2.x,
        targetY: p2.y,
        progress: 0,
        speed: 0.016 + Math.random() * 0.018,
        color: '#059669',
      });
    };

    // Concentric Energy Waves radiating from project hubs
    const waves = [
      { x: width * 0.22, y: height * 0.74, radius: 20, maxRadius: 140, speed: 0.8 },
      { x: width * 0.80, y: height * 0.24, radius: 10, maxRadius: 160, speed: 0.7 },
      { x: width * 0.50, y: height * 0.82, radius: 30, maxRadius: 130, speed: 0.9 },
    ];

    let turbineAngle = 0;
    let animationTime = 0;

    const render = () => {
      animationTime++;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const isLogoStage = stage === 'logo';

      // 1. RENDER SUBTLE RENEWABLE VISUALS (WIND, SOLAR, ENERGY WAVES)
      if (!isLogoStage) {
        // A. Delicate Wind Turbine Silhouette (top-right background)
        const twX = width * 0.86;
        const twY = height * 0.42;
        const twHeight = Math.min(130, height * 0.18);
        turbineAngle += 0.009;

        ctx.save();
        ctx.strokeStyle = '#059669';
        ctx.fillStyle = '#059669';
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.13;

        // Mast
        ctx.beginPath();
        ctx.moveTo(twX - 2, twY + twHeight);
        ctx.lineTo(twX - 1, twY);
        ctx.lineTo(twX + 1, twY);
        ctx.lineTo(twX + 2, twY + twHeight);
        ctx.fill();

        // Nacelle
        ctx.beginPath();
        ctx.arc(twX, twY, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // 3 Aerodynamic Blades
        for (let b = 0; b < 3; b++) {
          const angle = turbineAngle + (b * Math.PI * 2) / 3;
          const bladeLength = Math.min(48, width * 0.04);
          ctx.beginPath();
          ctx.moveTo(twX, twY);
          ctx.lineTo(twX + Math.cos(angle) * bladeLength, twY + Math.sin(angle) * bladeLength);
          ctx.stroke();
        }
        ctx.restore();

        // B. Minimalist Solar PV Array (bottom-left background)
        const pvX = width * 0.14;
        const pvY = height * 0.62;
        ctx.save();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.11;

        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 4; col++) {
            const px = pvX + col * 26 - row * 10;
            const py = pvY + row * 16;
            ctx.strokeRect(px, py, 22, 12);
          }
        }
        ctx.restore();

        // C. Concentric Energy Waves (Skills → Projects propagation)
        ctx.save();
        waves.forEach((w) => {
          w.radius += w.speed;
          if (w.radius > w.maxRadius) w.radius = 10;
          const waveAlpha = (1 - w.radius / w.maxRadius) * 0.12;

          ctx.beginPath();
          ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 1;
          ctx.globalAlpha = waveAlpha;
          ctx.stroke();
        });
        ctx.restore();
      }

      // 2. RENDER PARTICLES & INTELLIGENT SKILL CONNECTIONS
      particles.forEach((p) => {
        p.pulse += p.pulseSpeed;
        p.radius = p.originalRadius + Math.sin(p.pulse) * 0.7;

        if (isLogoStage) {
          // Gently pull particles toward center logo location
          const dx = centerX - p.x;
          const dy = (centerY - 40) - p.y;
          p.x += dx * 0.05;
          p.y += dy * 0.05;
          p.radius = Math.max(0.7, p.radius * 0.98);
        } else {
          // Normal gentle wandering flow
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.85;
        ctx.fill();

        // Soft glow aura
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.11;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Connect near particles with delicate lines (Skills → Projects network)
      const maxDistance = width < 768 ? 95 : 135;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const alpha = (1 - distance / maxDistance) * (isLogoStage ? 0.09 : 0.20);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = '#059669';
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.globalAlpha = 1;

            if (animationTime % 85 === 0 && Math.random() < 0.07 && packets.length < 16) {
              createPacket(p1, p2);
            }
          }
        }
      }

      // Draw travelling data packets
      for (let k = packets.length - 1; k >= 0; k--) {
        const pkt = packets[k];
        pkt.progress += pkt.speed;

        if (pkt.progress >= 1) {
          packets.splice(k, 1);
          continue;
        }

        const currX = pkt.x + (pkt.targetX - pkt.x) * pkt.progress;
        const currY = pkt.y + (pkt.targetY - pkt.y) * pkt.progress;

        ctx.beginPath();
        ctx.arc(currX, currY, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#059669';
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stage]);

  const handleSkip = () => {
    startTransition();
  };

  return (
    <div
      ref={containerRef}
      id="intro"
      className={`fixed inset-0 w-screen h-screen z-[999999] flex flex-col justify-between overflow-hidden select-none bg-white transition-opacity duration-800 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#ffffff',
        background:
          'radial-gradient(ellipse 100% 90% at 50% -10%, #e0f2fe 0%, #ffffff 50%, #ecfdf5 100%)',
      }}
    >
      {/* Background HTML5 Canvas for energy particles, network & subtle renewable visuals */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Subtle Ambient Radial Glows matching website color harmony */}
      <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/5 w-[28rem] h-[28rem] bg-sky-200/25 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

      {/* Floating domain tags in background network - DESKTOP ONLY (>= 1024px). Completely hidden on Tablet (768px-1023px) and Mobile (< 768px) */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
        {NETWORK_LABELS.map((item, idx) => {
          const Icon = item.icon;
          const showItem = stage === 'quotes' || stage === 'particles';
          return (
            <div
              key={idx}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-emerald-100 text-slate-700 text-xs font-semibold tracking-wide shadow-2xs transition-all duration-700 ${
                showItem ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{
                left: `${item.xRatio * 100}%`,
                top: `${item.yRatio * 100}%`,
                transitionDelay: `${idx * 70}ms`,
              }}
            >
              <Icon size={13} className="text-emerald-600" />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>

      {/* TOP HEADER: Brand teaser & Skip Intro Button */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 opacity-90">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-xs">
            <Zap size={16} className="fill-white/20" />
          </div>
          <span className="text-sm font-black text-slate-900 tracking-tight">
            RenewTech <span className="text-emerald-600">Workforce</span>
          </span>
        </div>

        {/* Skip button with circular progress indicator */}
        <button
          onClick={handleSkip}
          type="button"
          aria-label="Skip opening animation"
          className="group flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
        >
          <span>Skip Intro</span>
          <div className="relative w-4 h-4 flex items-center justify-center">
            <svg className="w-4 h-4 transform -rotate-90">
              <circle cx="8" cy="8" r="6" stroke="#e2e8f0" strokeWidth="2" fill="none" />
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="#059669"
                strokeWidth="2"
                fill="none"
                strokeDasharray={37.7}
                strokeDashoffset={37.7 - (37.7 * progress) / 100}
                className="transition-all duration-75"
              />
            </svg>
          </div>
          <ArrowRight
            size={13}
            className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all"
          />
        </button>
      </header>

      {/* CENTER STAGE: Alternates smoothly between Quotes & Brand Reveal */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center w-full">
        {/* SECTION A: QUOTE SEQUENCE (Smooth Fade In -> Upward Motion -> Stay Visible -> Soft Fade Out) */}
        {(stage === 'particles' || stage === 'quotes') && (
          <div className="w-full flex flex-col items-center justify-center">
            {/* Category tag - VISIBLE ON ALL SCREEN SIZES */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-wider uppercase mb-5 transition-all duration-300 ${
                quotePhase === 'exiting' ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>{QUOTES[currentQuoteIndex]?.tag || 'Clean Energy Talent'}</span>
            </div>

            {/* Dynamic Typography: Fade in -> Slight Upward Motion -> Stay Visible (~1.5s) -> Soft Fade Out */}
            <div className="min-h-[140px] sm:min-h-[160px] flex items-center justify-center w-full">
              <h1
                className={`text-2xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 tracking-tight leading-[1.18] max-w-3xl mx-auto transform ${
                  quotePhase === 'entering'
                    ? 'opacity-100 translate-y-0 scale-100 transition-all duration-350 ease-out'
                    : quotePhase === 'visible'
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 -translate-y-2 scale-[0.99] transition-all duration-300 ease-in'
                }`}
              >
                "{QUOTES[currentQuoteIndex]?.content}"
              </h1>
            </div>

            {/* Progress dot indicators (6 quotes) */}
            <div className="flex items-center gap-1.5 mt-8">
              {QUOTES.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentQuoteIndex
                      ? 'w-7 bg-emerald-600'
                      : i < currentQuoteIndex
                      ? 'w-1.5 bg-emerald-300'
                      : 'w-1.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* SECTION B: LOGO REVEAL, BRANDING, SUBTITLE & TAGLINE (Visible for ~1.5s after final quote) */}
        {stage === 'logo' && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            {/* Brand Logo Container with soft radiant glow */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-emerald-400/35 rounded-3xl blur-2xl transform scale-150 animate-pulse pointer-events-none" />

              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-600/25 border border-emerald-300/40 transform transition-all duration-500 scale-100 opacity-100">
                <Zap size={46} className="fill-white/20 text-white drop-shadow-md" />
              </div>
            </div>

            {/* Brand Title: RenewTech Workforce */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-2 transition-all duration-500 opacity-100 translate-y-0">
              RenewTech <span className="text-emerald-600">Workforce</span>
            </h1>

            {/* Platform Subtitle: Renewable Energy Talent Platform */}
            <p className="text-xs sm:text-sm font-bold text-slate-500 tracking-widest uppercase mb-6 transition-all duration-500 delay-100 opacity-100 translate-y-0">
              Renewable Energy Talent Platform
            </p>

            {/* Tagline Badge with Green Highlighted Words: Powering Renewable Projects With Verified Skilled Talent */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-200 text-slate-800 text-xs sm:text-sm font-medium shadow-sm transition-all duration-500 opacity-100 translate-y-0 scale-100">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>
                Powering <span className="text-emerald-600 font-bold">Renewable Projects</span> With{' '}
                <span className="text-emerald-600 font-bold">Verified Skilled Talent</span>
              </span>
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM FOOTER: Status hint */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-slate-500 font-semibold">
            {stage === 'particles'
              ? 'Initializing talent network...'
              : stage === 'quotes'
              ? 'Connecting skills to projects...'
              : 'Powering verified talent...'}
          </span>
        </div>

        <div className="hidden sm:block text-slate-400 text-right">
          Solar • Wind • BESS • EPC Workforce
        </div>
      </footer>
    </div>
  );
};

export default OpeningExperience;
