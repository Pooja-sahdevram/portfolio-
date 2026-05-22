import {
  motion,
  useScroll,
  useMotionValue,
  useTransform,
  useSpring,
  useInView,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ─── Typewriter Hook ─────────────────────────────────────── */
function useTypewriter(words, speed = 80, pause = 1800) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(current.slice(0, display.length + 1));
        if (display.length + 1 === current.length) {
          setTimeout(() => setDeleting(true), pause);
        }
      } else {
        setDisplay(current.slice(0, display.length - 1));
        if (display.length === 0) {
          setDeleting(false);
          setWordIdx((i) => (i + 1) % words.length);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [display, deleting, wordIdx, words, speed, pause]);

  return display;
}

/* ─── Animated Counter ────────────────────────────────────── */
function Counter({ target, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Magnetic Button ─────────────────────────────────────── */
function MagneticBtn({ children, className, href, tel }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.35);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  const Tag = href ? "a" : "button";
  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <Tag
        href={href || (tel ? `tel:${tel}` : undefined)}
        target={href ? "_blank" : undefined}
        rel={href ? "noreferrer" : undefined}
        className={className}
      >
        {children}
      </Tag>
    </motion.div>
  );
}

/* ─── Tilt Card ───────────────────────────────────────────── */
function TiltCard({ children, className }) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 20 });
  const sry = useSpring(ry, { stiffness: 150, damping: 20 });

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    ry.set(((e.clientX - rect.left) / rect.width - 0.5) * 18);
    rx.set(-((e.clientY - rect.top) / rect.height - 0.5) * 18);
  };
  const handleLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Cursor Glow ─────────────────────────────────────────── */
function CursorGlow() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 80, damping: 20 });
  const sy = useSpring(y, { stiffness: 80, damping: 20 });

  useEffect(() => {
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      style={{ left: sx, top: sy }}
      className="pointer-events-none fixed z-[200] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
    >
      <div className="h-full w-full rounded-full bg-[#5F7764] opacity-[0.07] blur-3xl" />
    </motion.div>
  );
}

/* ─── Floating Particle ───────────────────────────────────── */
function Particle({ delay, x, size, emoji }) {
  return (
    <motion.div
      className="pointer-events-none fixed z-0 select-none"
      style={{ left: `${x}%`, bottom: "-10%" }}
      animate={{ y: [0, -window.innerHeight - 200], opacity: [0, 0.6, 0.6, 0] }}
      transition={{ duration: 12 + Math.random() * 8, delay, repeat: Infinity, ease: "linear" }}
    >
      <span style={{ fontSize: size }}>{emoji}</span>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const typed = useTypewriter([
    "Full-Stack Developer",
    "Shopify Expert",
    "WordPress Dev",
    "MERN Specialist",
    "AI-Powered Dev 🤖",
    "Creative Coder ✨",
  ]);

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSent(true);
        setForm({ name: "", email: "", message: "" });
        setTimeout(() => setSent(false), 3000);
      } else {
        alert("Something Went wrong😔");
      }
    } catch (err) {
      alert("Network error! Check your connection.");
    } finally {
      setSending(false);
    }
  };

  const skills = [
    "PHP", "MongoDB", "WordPress", "WooCommerce",
    "Shopify Liquid", "React", "JavaScript", "Node.js",
    "Express.js", "REST APIs", "MySQL", "GitHub", "Python", "AJAX",
  ];

  const aiTools = [
    {
      icon: "🤖",
      name: "Claude AI",
      desc: "Prompting · Code gen · Automation · Portfolio building",
      level: "Expert",
    },
    {
      icon: "⚡",
      name: "Zapier",
      desc: "Workflow automation · App integrations · No-code flows",
      level: "Proficient",
    },
    {
      icon: "📊",
      name: "Excel",
      desc: "Data analysis · Formulas · Dashboards · Reporting",
      level: "Proficient",
    },
    {
      icon: "✨",
      name: "AI Tools",
      desc: "ChatGPT · Cursor · v0 · Prompt engineering",
      level: "Learning",
    },
  ];

  const experiences = [
    {
      role: "Junior Developer / Trainee",
      company: "Intesols – Intelligent Solutions",
      time: "Aug 2024 – Present",
      points: [
        "Built full-stack web applications using PHP, Node.js, JavaScript, HTML, and CSS.",
        "Developed custom WordPress plugins and WooCommerce extensions.",
        "Created Shopify storefronts with Liquid templating and metafields.",
        "Integrated third-party APIs and managed databases.",
      ],
    },
    {
      role: "Prompt Engineer",
      company: "SoftAge Information Technology Limited",
      time: "Aug 2023 – Apr 2024",
      points: [
        "Worked on Perspective AI project.",
        "Built AI workflow tools using Python and JavaScript.",
        "Collaborated with teams for UX and AI improvements.",
      ],
    },
  ];

  const projects = [
    { title: "React Course Website", desc: "Modern responsive React course landing page.", link: "#", tags: ["React", "Framer Motion", "UI/UX"], icon: "💻" },
    { title: "API MERN Meeting Project", desc: "Full-stack MERN meeting application.", link: "#", tags: ["MERN", "JWT", "MongoDB"], icon: "🚀" },
    { title: "Shopify Website", desc: "Custom Shopify storefront using Liquid.", link: "#", tags: ["Shopify", "Liquid", "Responsive"], icon: "🛍️" },
    { title: "WordPress WooCommerce Website", desc: "WooCommerce websites with custom plugins.", link: "#", tags: ["WordPress", "WooCommerce", "PHP"], icon: "⚡" },
  ];

  const particles = [
    { delay: 0, x: 10, size: "1.2rem", emoji: "✨" },
    { delay: 3, x: 25, size: "1rem", emoji: "💻" },
    { delay: 6, x: 50, size: "1.4rem", emoji: "🚀" },
    { delay: 1, x: 70, size: "1rem", emoji: "☕" },
    { delay: 8, x: 85, size: "1.2rem", emoji: "⚡" },
    { delay: 4, x: 40, size: "0.9rem", emoji: "🤖" },
  ];

  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const wordVariant = {
    hidden: { opacity: 0, y: 60, filter: "blur(8px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 120, damping: 14 } },
  };

  return (
    <div className="bg-[#F5F8F2] text-[#2D4731] overflow-hidden relative">

      <CursorGlow />
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* SCROLL PROGRESS BAR */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#5F7764] via-[#8DAF92] to-[#5F7764] origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* NAVBAR */}
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 hidden md:flex gap-6 px-8 py-4 rounded-full bg-white/70 backdrop-blur-2xl border border-white/40 shadow-xl"
      >
        {["skills", "ai-tools", "projects", "contact"].map((s) => (
          <motion.a
            key={s}
            href={`#${s}`}
            whileHover={{ scale: 1.1, color: "#5F7764" }}
            whileTap={{ scale: 0.95 }}
            className="capitalize transition-colors font-medium text-sm"
          >
            {s === "ai-tools" ? "AI Tools" : s}
          </motion.a>
        ))}
      </motion.div>

      {/* BG BLOBS */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {[
          { cls: "top-0 left-0", color: "#DCE8D7", dx: [0, 80, 0], dy: [0, 50, 0], dur: 14 },
          { cls: "bottom-0 right-0", color: "#C7DAC0", dx: [0, -80, 0], dy: [0, -40, 0], dur: 16 },
          { cls: "top-1/2 left-1/2", color: "#E8F0E5", dx: [0, 30, -30, 0], dy: [0, -30, 30, 0], dur: 18 },
        ].map((b, i) => (
          <motion.div
            key={i}
            animate={{ x: b.dx, y: b.dy }}
            transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute ${b.cls} h-[500px] w-[500px] rounded-full blur-3xl opacity-40`}
            style={{ background: b.color }}
          />
        ))}
      </div>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center px-6 md:px-12 lg:px-20 py-28 overflow-hidden">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 xl:gap-20 items-center w-full"
        >
          {/* LEFT */}
          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="uppercase tracking-[0.3em] text-sm text-[#6A816C] font-semibold mb-5"
            >
              Junior Full-Stack Developer
            </motion.p>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="text-5xl md:text-6xl xl:text-7xl font-black leading-[1.1] mb-4 flex flex-wrap gap-x-4"
            >
              {["Pooja", "Sahdev", "Ram"].map((w) => (
                <motion.span key={w} variants={wordVariant}>{w}</motion.span>
              ))}
            </motion.div>

            <motion.svg
              width="160" height="10" viewBox="0 0 160 10" fill="none"
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.path
                d="M4 6 Q80 2 156 6"
                stroke="#5F7764" strokeWidth="3" strokeLinecap="round" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
              />
            </motion.svg>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-[#556B5A] mb-4 min-h-[2rem] font-semibold"
            >
              I am a{" "}
              <span className="text-[#5F7764]">
                {typed}
                <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg leading-9 text-[#556B5A] max-w-xl"
            >
              I build aesthetic, scalable, and user-friendly digital experiences
              using MERN, Shopify, and WordPress — supercharged with AI.
            </motion.p>

            <motion.div
              variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.7 } } }}
              initial="hidden"
              animate="show"
              className="flex flex-wrap gap-3 mt-10"
            >
              {["✨ Building Cool Stuff", "☕ Debugging Daily", "🚀 Open To Work", "🤖 AI-Powered"].map((tag) => (
                <motion.span
                  key={tag}
                  variants={{ hidden: { opacity: 0, scale: 0.7, y: 20 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200 } } }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  className="px-5 py-3 rounded-full bg-white/70 backdrop-blur-xl border border-white/40 shadow-md text-sm cursor-default"
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-5 mt-12">
              <MagneticBtn
                href="https://www.linkedin.com/in/pooja-sahdev-ram-b7a649239/"
                className="px-8 py-4 rounded-full bg-[#5F7764] text-white shadow-xl hover:bg-[#4a6350] transition-colors font-semibold"
              >
                LinkedIn ↗
              </MagneticBtn>
              <MagneticBtn
                tel="+919887629382"
                className="px-8 py-4 rounded-full border-2 border-[#5F7764] text-[#5F7764] hover:bg-[#5F7764] hover:text-white transition-all font-semibold"
              >
                Call Me 📞
              </MagneticBtn>
              <MagneticBtn
                href="mailto:poojasahdevram@gmail.com"
                className="px-8 py-4 rounded-full border-2 border-[#5F7764] text-[#5F7764] hover:bg-[#5F7764] hover:text-white transition-all font-semibold"
              >
                Email ✉️
              </MagneticBtn>
            </div>

            {/* CONTACT INFO */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 text-[#5D705F] space-y-2"
            >
              <p>📍 Ahmedabad, Gujarat, India</p>
              <p>📞 +91 9887629382</p>
              <p>✉️ poojasahdevram@gmail.com</p>
              <div className="flex items-center gap-2 mt-5">
                <motion.span
                  animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-3 w-3 rounded-full bg-green-500 inline-block"
                />
                <p>Available for freelance</p>
              </div>
            </motion.div>
          </div>

          {/* RIGHT CARD */}
          <TiltCard className="perspective-[1000px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, type: "spring" }}
              className="relative z-10 bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[40px] p-8 lg:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.08)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#DCE8D7] blur-3xl opacity-60" />

              <motion.div
                animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="absolute right-6 top-6 h-14 w-14 rounded-2xl bg-[#EDF5EA] flex items-center justify-center shadow-md text-2xl"
              >🤖</motion.div>

              <div className="relative z-10 space-y-8">
                <div>
                  <p className="text-sm text-[#728375]">Experience</p>
                  <h3 className="text-5xl font-black mt-2 text-[#5F7764]">
                    <Counter target={2} suffix="+ Years" />
                  </h3>
                </div>
                <div>
                  <p className="text-sm text-[#728375]">Specialization</p>
                  <h3 className="text-2xl font-semibold mt-2">MERN · Shopify · WordPress</h3>
                </div>
                <div>
                  <p className="text-sm text-[#728375] mb-5">Core Stack</p>
                  <div className="flex flex-wrap gap-3">
                    {["WordPress", "Shopify", "React", "Node.js", "Claude AI"].map((item, i) => (
                      <motion.span
                        key={item}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                        whileHover={{ scale: 1.08, backgroundColor: "#5F7764", color: "#fff" }}
                        className="px-5 py-3 rounded-full bg-[#EEF4EC] border border-[#E1EADF] cursor-default transition-colors"
                      >
                        {item}
                      </motion.span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[["4+", "Projects"], ["2", "Companies"], ["🤖", "AI-Powered"]].map(([num, label]) => (
                    <div key={label} className="rounded-2xl bg-[#EEF4EC] p-4 text-center">
                      <p className="text-2xl font-black text-[#5F7764]">{num}</p>
                      <p className="text-xs text-[#7B9275] mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </TiltCard>
        </motion.div>
      </section>

      {/* ── SKILLS ───────────────────────────────────────────── */}
      <section id="skills" className="px-6 md:px-20 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16"
          >
            💻 Technical Skills
          </motion.h2>
          <motion.div
            variants={{ show: { transition: { staggerChildren: 0.04 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4"
          >
            {skills.map((skill) => (
              <motion.div
                key={skill}
                variants={{
                  hidden: { opacity: 0, scale: 0.5, rotate: -10 },
                  show: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 260, damping: 18 } },
                }}
                whileHover={{ y: -8, scale: 1.1, backgroundColor: "#5F7764", color: "#fff", borderColor: "#5F7764" }}
                className="px-6 py-3 bg-[#EEF4EC] rounded-full border border-[#DDE7D9] shadow-sm cursor-default transition-colors"
              >
                {skill}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── AI & AUTOMATION TOOLS ────────────────────────────── */}
      <section id="ai-tools" className="px-6 md:px-20 py-24 bg-[#F5F8F2]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-5 py-2 rounded-full bg-[#5F7764] text-white text-sm font-bold mb-4">
              🤖 AI & Automation Skills
            </span>
            <h2 className="text-4xl font-bold">Powered by AI</h2>
            <p className="text-[#6A816C] mt-3">I use AI tools to work smarter & build faster</p>
          </motion.div>

          <motion.div
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {aiTools.map((tool, i) => (
              <motion.div
                key={tool.name}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
                }}
                whileHover={{ y: -8, borderColor: "#5F7764", backgroundColor: "#EEF4EC" }}
                className="bg-white border-2 border-[#E2EADF] rounded-3xl p-6 text-center cursor-default transition-all"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-4xl mb-4"
                >
                  {tool.icon}
                </motion.div>
                <h3 className="font-black text-lg mb-2">{tool.name}</h3>
                <p className="text-[#7B9275] text-xs leading-relaxed mb-4">{tool.desc}</p>
                <span className="inline-block px-3 py-1 rounded-full bg-[#EEF4EC] text-[#3B6D11] text-xs font-bold">
                  {tool.level}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* AI highlight banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-10 rounded-3xl bg-gradient-to-r from-[#EEF4EC] to-[#DCE8D7] border border-[#C7DAC0] p-7"
          >
            <p className="font-bold text-[#2D4731] mb-2">🚀 What I build with AI</p>
            <p className="text-[#556B5A] text-sm leading-8">
              Portfolios · Contact forms with Resend/Zapier · AI chatbots · Automated workflows · Smart dashboards · Claude-powered apps
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── EXPERIENCE ───────────────────────────────────────── */}
      <section className="px-6 md:px-20 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16"
          >
            ✨ Work Experience
          </motion.h2>
          <div className="relative">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#5F7764] to-transparent origin-top hidden md:block"
            />
            <div className="space-y-10">
              {experiences.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, type: "spring", stiffness: 80 }}
                  whileHover={{ x: 6 }}
                  className="md:ml-16 bg-[#F7FAF5] border border-[#E2EADF] rounded-3xl p-8 shadow-sm relative overflow-hidden group"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
                    className="absolute -left-[2.6rem] top-10 h-4 w-4 rounded-full border-2 border-[#5F7764] bg-white hidden md:block"
                  />
                  <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-5">
                    <div>
                      <h3 className="text-2xl font-bold">{item.role}</h3>
                      <p className="text-[#607364] mt-1">{item.company}</p>
                    </div>
                    <span className="px-4 py-2 rounded-full bg-[#EEF4EC] text-[#708273] text-sm h-fit whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {item.points.map((point, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 + i * 0.1 + 0.4 }}
                        className="flex gap-3 text-[#556B5A]"
                      >
                        <motion.span
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                          className="h-2 w-2 rounded-full bg-[#5F7764] mt-3 shrink-0"
                        />
                        {point}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJECTS ─────────────────────────────────────────── */}
      <section id="projects" className="px-6 md:px-20 py-24 bg-[#F5F8F2]">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16"
          >
            🚀 Featured Projects
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60, rotate: index % 2 === 0 ? -3 : 3 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 80 }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group bg-white border border-[#E1EADF] rounded-3xl p-8 shadow-sm relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-5 left-5 text-3xl">
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                  >
                    {project.icon}
                  </motion.span>
                </div>
                <div className="absolute top-5 right-5 text-5xl font-bold text-[#D8E5D5] group-hover:text-[#C5D8C0] transition-colors">
                  0{index + 1}
                </div>
                <div className="relative z-10 pt-10">
                  <div className="flex flex-wrap gap-2 mb-5">
                    {project.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        whileHover={{ scale: 1.1, backgroundColor: "#5F7764", color: "#fff" }}
                        className="px-3 py-1 rounded-full bg-[#EEF4EC] text-sm border border-[#DDE7D9] transition-colors cursor-default"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{project.title}</h3>
                  <p className="text-[#5C6F60] leading-8 mb-8">{project.desc}</p>
                  <motion.a
                    whileHover={{ scale: 1.05, x: 4 }}
                    whileTap={{ scale: 0.95 }}
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#5F7764] text-white shadow-lg hover:bg-[#4a6350] transition-colors"
                  >
                    View Project →
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────── */}
      <section id="contact" className="px-6 md:px-20 py-24 bg-white">
        <div className="max-w-2xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-4"
          >
            📬 Get In Touch
          </motion.h2>
          <p className="text-center text-[#6A816C] mb-12">Open for freelance & collaborations</p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#F7FAF5] border border-[#E2EADF] rounded-[32px] p-8 shadow-sm"
          >
            {sent ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 gap-4"
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="text-5xl"
                >✅</motion.div>
                <p className="text-[#5F7764] font-bold text-xl">Message Sent!</p>
                <p className="text-[#7B9275]">I'll get back to you soon 🌱</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Name", key: "name", type: "text", placeholder: "Your name" },
                  { label: "Email", key: "email", type: "email", placeholder: "you@email.com" },
                ].map(({ label, key, type, placeholder }) => (
                  <div
                    key={key}
                    className={`rounded-2xl border bg-white px-5 py-3 transition-all ${focused === key ? "border-[#5F7764] shadow-[0_0_0_3px_rgba(95,119,100,0.12)]" : "border-white/60"}`}
                  >
                    <p className="text-[10px] uppercase tracking-widest text-[#7B9275] font-semibold mb-1">{label}</p>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      onFocus={() => setFocused(key)}
                      onBlur={() => setFocused(null)}
                      className="w-full bg-transparent text-sm font-medium outline-none text-[#2D4731] placeholder:text-[#AABDAD]"
                    />
                  </div>
                ))}

                <div
                  className={`rounded-2xl border bg-white px-5 py-3 transition-all ${focused === "message" ? "border-[#5F7764] shadow-[0_0_0_3px_rgba(95,119,100,0.12)]" : "border-white/60"}`}
                >
                  <p className="text-[10px] uppercase tracking-widest text-[#7B9275] font-semibold mb-1">Message</p>
                  <textarea
                    placeholder="Say hello..."
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    onFocus={() => setFocused("message")}
                    onBlur={() => setFocused(null)}
                    className="w-full bg-transparent text-sm font-medium outline-none resize-none text-[#2D4731] placeholder:text-[#AABDAD]"
                  />
                </div>

                <motion.button
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={sending}
                  className="w-full py-4 rounded-2xl bg-[#5F7764] text-white text-sm font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {sending ? (
                    <>
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="inline-block">⏳</motion.span>
                      Sending…
                    </>
                  ) : "Send Message 🚀"}
                </motion.button>

                <div className="flex justify-between pt-2">
                  <a href="tel:+919887629382" className="flex items-center gap-1 text-xs text-[#5F7764] font-semibold hover:underline">📞 +91 9887629382</a>
                  <a href="mailto:poojasahdevram@gmail.com" className="flex items-center gap-1 text-xs text-[#5F7764] font-semibold hover:underline">✉️ Email</a>
                  <a href="https://www.linkedin.com/in/pooja-sahdev-ram-b7a649239/" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-[#5F7764] font-semibold hover:underline">💼 LinkedIn</a>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <motion.footer
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-[#5F7764] text-white px-6 md:px-20 py-14 text-center relative overflow-hidden"
      >
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-white/10 blur-3xl m-auto h-64 w-64"
        />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold">Pooja Sahdev Ram</h2>
          <p className="mt-4 text-[#E7EFE4]">Shopify · WordPress · Full-Stack Developer · AI & Automation</p>
          <div className="flex justify-center gap-8 mt-6 flex-wrap">
            <a href="tel:+919887629382" className="text-[#E7EFE4] hover:text-white text-sm font-semibold transition-colors">📞 +91 9887629382</a>
            <a href="mailto:poojasahdevram@gmail.com" className="text-[#E7EFE4] hover:text-white text-sm font-semibold transition-colors">✉️ poojasahdevram@gmail.com</a>
            <a href="https://www.linkedin.com/in/pooja-sahdev-ram-b7a649239/" target="_blank" rel="noreferrer" className="text-[#E7EFE4] hover:text-white text-sm font-semibold transition-colors">💼 LinkedIn</a>
          </div>
          <p className="mt-6 text-[#E7EFE4] text-sm">Designed & developed with 🎧 + AI + creativity by Pooja</p>
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }} className="mt-6 text-3xl">🌱</motion.div>
        </div>
      </motion.footer>

    </div>
  );
}