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
function MagneticBtn({ children, className, href, tel, download }) {
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

  const finalHref = href || (tel ? `tel:${tel}` : undefined);

  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <a
        href={finalHref}
        target={href && !download ? "_blank" : undefined}
        rel={href ? "noreferrer" : undefined}
        download={download || undefined}
        className={className}
      >
        {children}
      </a>
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

/* ─── Subtle Cursor Glow ──────────────────────────────────── */
function CursorGlow() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 60, damping: 25 });
  const sy = useSpring(y, { stiffness: 60, damping: 25 });

  useEffect(() => {
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      style={{ left: sx, top: sy }}
      className="pointer-events-none fixed z-[200] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full"
    >
      <div className="h-full w-full rounded-full bg-[#5F7764] opacity-[0.05] blur-[80px]" />
    </motion.div>
  );
}

/* ─── Geometric Background ────────────────────────────────── */
function GeometricBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle, #3B5240 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#DCE8D7] opacity-30 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#C7DAC0] opacity-25 blur-[100px]" />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const typed = useTypewriter([
    "I build Shopify Stores",
    "I develop Full-Stack Web Apps",
    "I create WordPress Solutions",
    "I automate Workflows with AI",
    "I craft Scalable Backends",
    "I turn Ideas into Products",
  ], 80, 5000);

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
        alert("Something went wrong.");
      }
    } catch {
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
      role: "Backend Developer",
      company: "Intesols – Intelligent Solutions, Ahmedabad",
      time: "Aug 2024 – Present · 1 yr 10 mos",
      points: [
        "Working on back-end web development — server-side logic, API integration, and database management using PHP.",
        "Building and maintaining WordPress & WooCommerce solutions with custom plugins and extensions.",
        "Creating custom Shopify storefronts using Liquid templating and metafields.",
        "Awarded Rising Star Award 2025 for dedication and continuous growth.",
      ],
    },
    {
      role: "Prompt Engineer & AI Intern",
      company: "SoftAge Information Technology Limited, Ahmedabad",
      time: "Jun 2023 – Apr 2024 · 11 mos",
      points: [
        "Crafted and refined IT prompts to optimize AI outputs on the Perspective AI project.",
        "Built AI workflow tools and web applications using Python, PHP, JavaScript, HTML, CSS, and Excel.",
        "Focused on creating scalable, efficient web solutions tailored to project requirements.",
      ],
    },
    {
      role: "Full-Stack Developer Intern",
      company: "Grras Solutions (P) Ltd, Ahmedabad",
      time: "Jun 2023 – Feb 2024 · 9 mos",
      points: [
        "Worked on front-end development and software infrastructure in a hybrid setting.",
        "Gained hands-on experience with full-stack development workflows and best practices.",
      ],
    },
  ];

  const projects = [
    {
      title: "React Course Platform",
      desc: "A fully responsive course landing page with smooth animations, enrollment flow, and curriculum sections. Built to convert visitors into students.",
      link: "#",
      tags: ["React", "Framer Motion", "UI/UX"],
      num: "01"
    },
    {
      title: "Real-Time Meeting App",
      desc: "Full-stack web application with user authentication, meeting scheduling, and real-time updates. Built with Node.js backend, MongoDB database, and React frontend.",
      link: "#",
      tags: ["Node.js", "MongoDB", "React", "JWT"],
      num: "02"
    },
    {
      title: "Custom Shopify Store",
      desc: "Performance-optimized Shopify storefront with custom Liquid theme, metafields, dynamic product pages, and seamless checkout experience.",
      link: "#",
      tags: ["Shopify", "Liquid", "Responsive"],
      num: "03"
    },
    {
      title: "WooCommerce Store",
      desc: "Feature-rich WordPress e-commerce site with custom plugins, payment gateway integration, inventory management, and automated order emails.",
      link: "#",
      tags: ["WordPress", "WooCommerce", "PHP"],
      num: "04"
    },
  ];

  const services = [
    {
      icon: "🛍️",
      title: "Shopify Development",
      desc: "Custom themes, Liquid templating, app integrations, metafields, and performance optimization for high-converting stores.",
    },
    {
      icon: "⚡",
      title: "WordPress & WooCommerce",
      desc: "Custom plugins, theme development, WooCommerce setup, payment gateways, and ongoing site maintenance.",
    },
    {
      icon: "💻",
      title: "Full-Stack Web Apps",
      desc: "End-to-end web applications using React, Node.js, MongoDB, and REST APIs — from idea to deployed product.",
    },
    {
      icon: "🤖",
      title: "AI & Automation",
      desc: "Workflow automation with Zapier, Claude AI integrations, smart chatbots, and AI-powered features for your business.",
    },
  ];

  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const wordVariant = {
    hidden: { opacity: 0, y: 50, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 120, damping: 14 } },
  };

  return (
    <div className="bg-[#F5F8F2] text-[#2D4731] overflow-hidden relative">

      <CursorGlow />
      <GeometricBg />

      {/* SCROLL PROGRESS BAR */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#5F7764] origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* NAVBAR */}
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 hidden md:flex gap-8 px-10 py-4 rounded-full bg-white/80 backdrop-blur-2xl border border-white/50 shadow-lg"
      >
        {["skills", "ai-tools", "services", "projects", "contact"].map((s) => (
          <motion.a
            key={s}
            href={`#${s}`}
            whileHover={{ color: "#5F7764" }}
            whileTap={{ scale: 0.95 }}
            className="capitalize transition-colors font-medium text-sm tracking-wide text-[#4A6050]"
          >
            {s === "ai-tools" ? "AI Tools" : s.charAt(0).toUpperCase() + s.slice(1)}
          </motion.a>
        ))}
      </motion.div>

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
              className="uppercase tracking-[0.3em] text-xs text-[#8AA38C] font-semibold mb-5 flex items-center gap-3"
            >
              <span className="inline-block w-8 h-[1px] bg-[#8AA38C]" />
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

            {/* Underline SVG */}
            <motion.svg
              width="180" height="10" viewBox="0 0 180 10" fill="none"
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.path
                d="M4 6 Q90 1 176 6"
                stroke="#5F7764" strokeWidth="2.5" strokeLinecap="round" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.9, duration: 0.9, ease: "easeOut" }}
              />
            </motion.svg>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-[#556B5A] mb-5 min-h-[2rem] font-semibold"
            >
              <span className="text-[#5F7764]">
                {typed}
                <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-base leading-8 text-[#6B8070] max-w-xl"
            >
              I build aesthetic, scalable, and user-friendly digital experiences
              using MERN, Shopify, and WordPress — supercharged with AI.
            </motion.p>

            {/* Status tags */}
            <motion.div
              variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.7 } } }}
              initial="hidden"
              animate="show"
              className="flex flex-wrap gap-2 mt-8"
            >
              {[
                { label: "Building Cool Stuff", dot: "bg-blue-400" },
                { label: "Debugging Daily", dot: "bg-amber-400" },
                { label: "Open To Work", dot: "bg-green-400" },
                { label: "AI-Powered", dot: "bg-purple-400" },
              ].map(({ label, dot }) => (
                <motion.span
                  key={label}
                  variants={{ hidden: { opacity: 0, scale: 0.8, y: 15 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200 } } }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-white/50 shadow-sm text-xs font-medium flex items-center gap-2 cursor-default text-[#4A6050]"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                  {label}
                </motion.span>
              ))}
            </motion.div>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-4 mt-10">
              <MagneticBtn
                href="https://www.linkedin.com/in/pooja-sahdev-ram-b7a649239/"
                className="px-7 py-3.5 rounded-full bg-[#2D4731] text-white shadow-lg hover:bg-[#3d5e41] transition-colors font-semibold text-sm tracking-wide"
              >
                LinkedIn ↗
              </MagneticBtn>
              <MagneticBtn
                href="/Pooja_Sahdev_Ram_Resume.pdf"
                download="Pooja_Sahdev_Ram_Resume"
                className="px-7 py-3.5 rounded-full bg-[#5F7764] text-white shadow-lg hover:bg-[#4a6350] transition-colors font-semibold text-sm tracking-wide"
              >
                Download CV ↓
              </MagneticBtn>
              <MagneticBtn
                tel="+919887629382"
                className="px-7 py-3.5 rounded-full border-2 border-[#2D4731] text-[#2D4731] hover:bg-[#2D4731] hover:text-white transition-all font-semibold text-sm tracking-wide"
              >
                Call Me
              </MagneticBtn>
            </div>

            {/* CONTACT INFO — all clickable */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-10 text-[#7A9480] space-y-1.5 text-sm"
            >
              <p className="flex items-center gap-2">
                <span className="w-4 text-center">📍</span> Ahmedabad, Gujarat, India
              </p>
              <a
                href="tel:+919887629382"
                className="flex items-center gap-2 hover:text-[#5F7764] transition-colors group"
              >
                <span className="w-4 text-center">📞</span>
                <span className="group-hover:underline underline-offset-2">+91 9887629382</span>
              </a>
              <a
                href="mailto:poojasahdevram@gmail.com"
                className="flex items-center gap-2 hover:text-[#5F7764] transition-colors group"
              >
                <span className="w-4 text-center">✉️</span>
                <span className="group-hover:underline underline-offset-2">poojasahdevram@gmail.com</span>
              </a>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#DCE8D7]">
                <motion.span
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-green-500 inline-block"
                />
                {/* <p className="font-medium text-[#5F7764]">Available for freelance</p> */}
              </div>
            </motion.div>
          </div>

          {/* RIGHT CARD */}
          <TiltCard className="perspective-[1000px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, type: "spring" }}
              className="relative z-10 bg-white/75 backdrop-blur-2xl border border-white/50 rounded-[40px] p-8 lg:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.07)] overflow-hidden"
            >
              <div className="relative z-10 space-y-8">
                <div className="flex items-end gap-3">
                  <div>
                    <p className="text-xs text-[#8AA38C] uppercase tracking-widest mb-1">Experience</p>
                    <h3 className="text-5xl font-black text-[#2D4731]">
                      <Counter target={2} suffix="+" />
                      <span className="text-2xl font-semibold text-[#5F7764] ml-1">Years</span>
                    </h3>
                  </div>
                  <div className="flex-1 border-b border-dashed border-[#C5D8C0] mb-2" />
                </div>

                <div>
                  <p className="text-xs text-[#8AA38C] uppercase tracking-widest mb-2">Specialization</p>
                  <h3 className="text-xl font-bold text-[#3B5240] tracking-wide">MERN · Shopify · WordPress</h3>
                </div>

                <div>
                  <p className="text-xs text-[#8AA38C] uppercase tracking-widest mb-4">Core Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {["WordPress", "Shopify", "React", "Node.js", "Claude AI"].map((item, i) => (
                      <motion.span
                        key={item}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                        whileHover={{ scale: 1.06, backgroundColor: "#2D4731", color: "#fff" }}
                        className="px-4 py-2 rounded-full bg-[#EEF4EC] border border-[#D5E5D0] cursor-default transition-all text-sm font-medium text-[#3B5240]"
                      >
                        {item}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  {[["40+", "Projects"], ["2", "Companies"], ["AI", "Powered"]].map(([num, label]) => (
                    <div key={label} className="rounded-2xl bg-[#EEF4EC] border border-[#D5E5D0] p-4 text-center">
                      <p className="text-2xl font-black text-[#2D4731]">{num}</p>
                      <p className="text-[10px] text-[#7B9275] mt-1 uppercase tracking-wider">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </TiltCard>
        </motion.div>
      </section>

      {/* ── SKILLS ───────────────────────────────────────────── */}
      <section id="skills" className="px-6 md:px-20 py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C5D8C0] to-transparent" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#8AA38C] mb-3 font-semibold">What I work with</p>
            <h2 className="text-4xl font-bold">Technical Skills</h2>
            <div className="flex justify-center mt-4">
              <div className="w-12 h-[2px] bg-[#5F7764] rounded-full" />
            </div>
          </motion.div>

          <motion.div
            variants={{ show: { transition: { staggerChildren: 0.04 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3"
          >
            {skills.map((skill) => (
              <motion.div
                key={skill}
                variants={{
                  hidden: { opacity: 0, scale: 0.7, y: 20 },
                  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 18 } },
                }}
                whileHover={{ y: -6, scale: 1.06, backgroundColor: "#2D4731", color: "#fff", borderColor: "#2D4731" }}
                className="px-5 py-2.5 bg-[#F5F8F2] rounded-full border border-[#DDE7D9] shadow-sm cursor-default transition-all text-sm font-medium text-[#3B5240]"
              >
                {skill}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── AI & AUTOMATION TOOLS ────────────────────────────── */}
      <section id="ai-tools" className="px-6 md:px-20 py-24 bg-[#F5F8F2] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C5D8C0] to-transparent" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#2D4731] text-white text-xs font-bold mb-4 tracking-wider uppercase">
              AI & Automation
            </span>
            <h2 className="text-4xl font-bold">Powered by AI</h2>
            <p className="text-[#7A9480] mt-3 text-sm">I use AI tools to work smarter & build faster</p>
            <div className="flex justify-center mt-4">
              <div className="w-12 h-[2px] bg-[#5F7764] rounded-full" />
            </div>
          </motion.div>

          <motion.div
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-5"
          >
            {aiTools.map((tool) => (
              <motion.div
                key={tool.name}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
                }}
                whileHover={{ y: -6, borderColor: "#2D4731", backgroundColor: "#EEF4EC" }}
                className="bg-white border border-[#E2EADF] rounded-3xl p-6 text-center cursor-default transition-all group"
              >
                <div className="text-3xl font-black text-[#5F7764] mb-4 font-mono group-hover:text-[#2D4731] transition-colors">
                  {tool.icon}
                </div>
                <h3 className="font-black text-base mb-2 text-[#2D4731]">{tool.name}</h3>
                <p className="text-[#8AA38C] text-xs leading-relaxed mb-4">{tool.desc}</p>
                <span className="inline-block px-3 py-1 rounded-full bg-[#EEF4EC] text-[#3B6D11] text-[10px] font-bold uppercase tracking-wider border border-[#D5E5D0]">
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
            className="mt-8 rounded-3xl bg-white border border-[#C7DAC0] p-7 flex flex-col md:flex-row md:items-center gap-4"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#2D4731] flex items-center justify-center text-white font-bold text-sm">AI</div>
            <div>
              <p className="font-bold text-[#2D4731] mb-1">What I build with AI</p>
              <p className="text-[#6B8070] text-sm leading-7">
                Portfolios · Contact forms with Resend/Zapier · AI chatbots · Automated workflows · Smart dashboards · Claude-powered apps
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── EXPERIENCE ───────────────────────────────────────── */}
      <section className="px-6 md:px-20 py-24 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C5D8C0] to-transparent" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#8AA38C] mb-3 font-semibold">Career</p>
            <h2 className="text-4xl font-bold">Work Experience</h2>
            <div className="flex justify-center mt-4">
              <div className="w-12 h-[2px] bg-[#5F7764] rounded-full" />
            </div>
          </motion.div>

          <div className="relative">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute left-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#5F7764] via-[#C5D8C0] to-transparent origin-top hidden md:block"
            />
            <div className="space-y-8">
              {experiences.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, type: "spring", stiffness: 80 }}
                  whileHover={{ x: 4 }}
                  className="md:ml-16 bg-[#F7FAF5] border border-[#E2EADF] rounded-3xl p-8 shadow-sm relative overflow-hidden"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
                    className="absolute -left-[2.55rem] top-10 h-3 w-3 rounded-full border-2 border-[#5F7764] bg-white hidden md:block"
                  />
                  <div className="absolute top-6 right-8 text-6xl font-black text-[#E8F0E5] select-none">
                    0{index + 1}
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6 relative z-10">
                    <div>
                      <h3 className="text-xl font-bold text-[#2D4731]">{item.role}</h3>
                      <p className="text-[#7A9480] mt-1 text-sm font-medium">{item.company}</p>
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-white border border-[#D5E5D0] text-[#7A9480] text-xs h-fit whitespace-nowrap font-medium">
                      {item.time}
                    </span>
                  </div>
                  <ul className="space-y-2.5 relative z-10">
                    {item.points.map((point, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 + i * 0.08 + 0.4 }}
                        className="flex gap-3 text-[#5C7060] text-sm leading-7"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#5F7764] mt-3 shrink-0" />
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

      {/* ── SERVICES ─────────────────────────────────────────── */}
      <section id="services" className="px-6 md:px-20 py-24 bg-[#F5F8F2] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C5D8C0] to-transparent" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#8AA38C] mb-3 font-semibold">What I offer</p>
            <h2 className="text-4xl font-bold">Services</h2>
            <div className="flex justify-center mt-4">
              <div className="w-12 h-[2px] bg-[#5F7764] rounded-full" />
            </div>
          </motion.div>

          <motion.div
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90 } } }}
                whileHover={{ y: -6, borderColor: "#5F7764" }}
                className="bg-white border border-[#E2EADF] rounded-3xl p-8 flex gap-5 transition-all group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#EEF4EC] flex items-center justify-center text-2xl group-hover:bg-[#2D4731] transition-colors">
                  {s.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#2D4731] mb-2">{s.title}</h3>
                  <p className="text-[#7A9480] text-sm leading-7">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PROJECTS ─────────────────────────────────────────── */}
      <section id="projects" className="px-6 md:px-20 py-24 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C5D8C0] to-transparent" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#8AA38C] mb-3 font-semibold">Portfolio</p>
            <h2 className="text-4xl font-bold">Featured Projects</h2>
            <div className="flex justify-center mt-4">
              <div className="w-12 h-[2px] bg-[#5F7764] rounded-full" />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 80 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="group bg-white border border-[#E1EADF] rounded-3xl p-8 shadow-sm relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-5 right-7 text-6xl font-black text-[#E8F0E5] group-hover:text-[#DDE8DA] transition-colors select-none">
                  {project.num}
                </div>
                <motion.div
                  className="absolute top-0 left-0 h-[3px] bg-[#5F7764] rounded-t-3xl"
                  initial={{ width: 0 }}
                  whileInView={{ width: "40%" }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.3, duration: 0.5 }}
                />
                <div className="relative z-10 pt-2">
                  <div className="flex flex-wrap gap-2 mb-5">
                    {project.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        whileHover={{ scale: 1.08, backgroundColor: "#2D4731", color: "#fff", borderColor: "#2D4731" }}
                        className="px-3 py-1 rounded-full bg-[#F0F6EE] text-xs border border-[#D5E5D0] transition-all font-medium text-[#4A6050] cursor-default"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#2D4731]">{project.title}</h3>
                  <p className="text-[#7A9480] text-sm leading-7 mb-8">{project.desc}</p>
                  <motion.a
                    whileHover={{ scale: 1.04, x: 3 }}
                    whileTap={{ scale: 0.96 }}
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2D4731] text-white text-sm shadow hover:bg-[#3d5e41] transition-colors font-medium"
                  >
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────── */}
      <section id="contact" className="px-6 md:px-20 py-24 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C5D8C0] to-transparent" />
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#8AA38C] mb-3 font-semibold">Let's connect</p>
            <h2 className="text-4xl font-bold">Get In Touch</h2>
            <p className="text-[#8AA38C] mt-3 text-sm">Open for freelance & collaborations</p>
            <div className="flex justify-center mt-4">
              <div className="w-12 h-[2px] bg-[#5F7764] rounded-full" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#F7FAF5] border border-[#E2EADF] rounded-[32px] p-8 shadow-sm"
          >
            {sent ? (
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-14 gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-[#EEF4EC] border-2 border-[#5F7764] flex items-center justify-center text-2xl">✓</div>
                <p className="text-[#2D4731] font-bold text-xl">Message Sent!</p>
                <p className="text-[#8AA38C] text-sm">I'll get back to you soon.</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Name", key: "name", type: "text", placeholder: "Your name" },
                  { label: "Email", key: "email", type: "email", placeholder: "you@email.com" },
                ].map(({ label, key, type, placeholder }) => (
                  <div
                    key={key}
                    className={`rounded-2xl border bg-white px-5 py-3.5 transition-all ${focused === key ? "border-[#5F7764] shadow-[0_0_0_3px_rgba(95,119,100,0.1)]" : "border-[#E2EADF]"}`}
                  >
                    <p className="text-[10px] uppercase tracking-widest text-[#8AA38C] font-semibold mb-1">{label}</p>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      onFocus={() => setFocused(key)}
                      onBlur={() => setFocused(null)}
                      className="w-full bg-transparent text-sm font-medium outline-none text-[#2D4731] placeholder:text-[#C5D8C0]"
                    />
                  </div>
                ))}

                <div
                  className={`rounded-2xl border bg-white px-5 py-3.5 transition-all ${focused === "message" ? "border-[#5F7764] shadow-[0_0_0_3px_rgba(95,119,100,0.1)]" : "border-[#E2EADF]"}`}
                >
                  <p className="text-[10px] uppercase tracking-widest text-[#8AA38C] font-semibold mb-1">Message</p>
                  <textarea
                    placeholder="Say hello..."
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    onFocus={() => setFocused("message")}
                    onBlur={() => setFocused(null)}
                    className="w-full bg-transparent text-sm font-medium outline-none resize-none text-[#2D4731] placeholder:text-[#C5D8C0]"
                  />
                </div>

                <motion.button
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={sending}
                  className="w-full py-4 rounded-2xl bg-[#2D4731] text-white text-sm font-bold shadow flex items-center justify-center gap-2 disabled:opacity-60 tracking-wide"
                >
                  {sending ? (
                    <>
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      Sending…
                    </>
                  ) : "Send Message →"}
                </motion.button>

                {/* Contact links — all clickable */}
                <div className="flex justify-between pt-2">
                  <a
                    href="tel:+919887629382"
                    className="flex items-center gap-1 text-xs text-[#5F7764] font-semibold hover:underline underline-offset-2"
                  >
                    📞 +91 9887629382
                  </a>
                  <a
                    href="mailto:poojasahdevram@gmail.com"
                    className="flex items-center gap-1 text-xs text-[#5F7764] font-semibold hover:underline underline-offset-2"
                  >
                    ✉️ Email
                  </a>
                  <a
                    href="https://www.linkedin.com/in/pooja-sahdev-ram-b7a649239/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-[#5F7764] font-semibold hover:underline underline-offset-2"
                  >
                    💼 LinkedIn
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── STATS BANNER ─────────────────────────────────────── */}
      <section className="px-6 md:px-20 py-16 bg-[#2D4731] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`, backgroundSize: "30px 30px" }}
        />
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10"
        >
          {[
            { num: 2, suffix: "+", label: "Years Experience" },
            { num: 40, suffix: "+", label: "Projects Delivered" },
            { num: 3, suffix: "", label: "Companies Worked" },
            { num: 14, suffix: "+", label: "Tech Skills" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } }}
              className="text-center"
            >
              <p className="text-4xl font-black text-white">
                <Counter target={stat.num} suffix={stat.suffix} />
              </p>
              <p className="text-[#8DAF92] text-sm mt-2 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── EDUCATION ────────────────────────────────────────── */}
      <section className="px-6 md:px-20 py-24 bg-[#F5F8F2] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C5D8C0] to-transparent" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#8AA38C] mb-3 font-semibold">Academic</p>
            <h2 className="text-4xl font-bold">Education</h2>
            <div className="flex justify-center mt-4">
              <div className="w-12 h-[2px] bg-[#5F7764] rounded-full" />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                degree: "B.Tech — Computer Science Engineering",
                short: "B.Tech",
                school: "Chartered Institute of Technology",
                location: "India",
                year: "Dec 2020 – Jul 2024",
                grade: "8.66 CGPA",
                desc: "Studied Computer Science Engineering — Node.js, JavaScript, databases, software infrastructure, operating systems, and web development fundamentals.",
              },
              {
                degree: "Higher Secondary — PCM",
                short: "12th",
                school: "Mahatma Gandhi Public School",
                location: "India",
                year: "Completed",
                grade: "75%",
                desc: "Physics, Chemistry & Mathematics stream with strong analytical and problem-solving foundations.",
              },
            ].map((edu, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 80 }}
                whileHover={{ y: -5, borderColor: "#5F7764" }}
                className="bg-white border border-[#E2EADF] rounded-3xl p-8 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-5 right-7 text-5xl font-black text-[#EEF4EC] select-none group-hover:text-[#E5EFE3] transition-colors">
                  {edu.short}
                </div>
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#EEF4EC] text-[#5F7764] text-xs font-bold mb-4 border border-[#D5E5D0]">
                    {edu.year}
                  </span>
                  <h3 className="text-xl font-bold text-[#2D4731] mb-1">{edu.degree}</h3>
                  <p className="text-[#5F7764] font-semibold text-sm mb-1">{edu.school}</p>
                  <p className="text-[#8AA38C] text-xs mb-1 flex items-center gap-1">
                    <span>📍</span> {edu.location}
                  </p>
                  <p className="text-[#5F7764] text-xs font-bold mb-4">🎓 {edu.grade}</p>
                  <p className="text-[#6B8070] text-sm leading-7">{edu.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CERTIFICATIONS ───────────────────────────────────── */}
      <section className="px-6 md:px-20 py-24 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C5D8C0] to-transparent" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#8AA38C] mb-3 font-semibold">Credentials</p>
            <h2 className="text-4xl font-bold">Licenses & Certifications</h2>
            <div className="flex justify-center mt-4">
              <div className="w-12 h-[2px] bg-[#5F7764] rounded-full" />
            </div>
          </motion.div>

          <motion.div
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
          >
            {[
              { name: "Cloud Computing", issuer: "NPTEL", date: "Nov 2023", link: "https://drive.google.com/file/d/1Mpz6bbTHqVpwHn8hy0-Zduf01MN-8oi_/view?usp=sharing" },
              { name: "React.js", issuer: "Internshala", date: "2023", link: "https://drive.google.com/file/d/1tl5HCbZf_rIIh5Z2UTYqIv5TJoqKDqhA/view?usp=drivesdk" },
              { name: "Operating System", issuer: "NPTEL", date: "Oct 2022", link: "https://drive.google.com/file/d/1kP7hU9eDD0SpI189mLT52wX_M1tCze_z/view?usp=drivesdk" },
              { name: "C++", issuer: "NPTEL", date: "Apr 2022", link: "https://drive.google.com/file/d/1urgr7YcrPnf8Ynp1yYKDFO265xV6xXzt/view?usp=sharing" },
              { name: "Java", issuer: "NPTEL", date: "Apr 2022", link: "#" },
            ].map((cert, i) => (
              <motion.a
                key={i}
                href={cert.link}
                target="_blank"
                rel="noreferrer"
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } }}
                whileHover={{ y: -5, borderColor: "#5F7764" }}
                className="bg-[#F7FAF5] border border-[#E2EADF] rounded-2xl p-5 flex items-center gap-4 transition-all group cursor-pointer"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#EEF4EC] border border-[#D5E5D0] flex items-center justify-center text-lg group-hover:bg-[#2D4731] transition-colors">
                  📜
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#2D4731] truncate">{cert.name}</p>
                  <p className="text-[#8AA38C] text-xs mt-0.5">{cert.issuer} · {cert.date}</p>
                </div>
                <span className="text-[#5F7764] text-xs font-semibold group-hover:underline flex-shrink-0">View ↗</span>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-[#2D4731] text-white px-6 md:px-20 py-14 text-center relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-wide">Pooja Sahdev Ram</h2>
          <p className="mt-3 text-[#A8C5AD] text-sm tracking-wide">Shopify · WordPress · Full-Stack Developer · AI & Automation</p>

          <div className="flex justify-center gap-2 mt-4">
            <div className="w-6 h-[1px] bg-white/20" />
            <div className="w-12 h-[1px] bg-[#5F7764]" />
            <div className="w-6 h-[1px] bg-white/20" />
          </div>

          <div className="flex justify-center gap-8 mt-7 flex-wrap">
            <a
              href="tel:+919887629382"
              className="text-[#A8C5AD] hover:text-white text-xs font-medium transition-colors tracking-wide hover:underline underline-offset-2"
            >
              +91 9887629382
            </a>
            <a
              href="mailto:poojasahdevram@gmail.com"
              className="text-[#A8C5AD] hover:text-white text-xs font-medium transition-colors tracking-wide hover:underline underline-offset-2"
            >
              poojasahdevram@gmail.com
            </a>
            <a
              href="https://www.linkedin.com/in/pooja-sahdev-ram-b7a649239/"
              target="_blank"
              rel="noreferrer"
              className="text-[#A8C5AD] hover:text-white text-xs font-medium transition-colors tracking-wide hover:underline underline-offset-2"
            >
              LinkedIn
            </a>
          </div>
          <p className="mt-8 text-[#6B8C6E] text-xs tracking-widest uppercase">Designed with AI + creativity by Pooja</p>
        </div>
      </motion.footer>

    </div>
  );
}
