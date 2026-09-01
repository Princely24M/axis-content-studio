import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Type, Image, Code2, Sparkles, Wand2, Save, FolderOpen,
  ArrowRight, Layers, Zap, Shield, Check,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 bg-mesh-light dark:bg-mesh-dark">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-ink-200/30 dark:border-ink-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-ink-600 dark:text-ink-300 hover:text-brand-500 transition-colors">Features</a>
            <a href="#how" className="text-sm text-ink-600 dark:text-ink-300 hover:text-brand-500 transition-colors">How It Works</a>
            <a href="#prompts" className="text-sm text-ink-600 dark:text-ink-300 hover:text-brand-500 transition-colors">Prompt Lab</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link to="/signup"><Button size="sm">Sign up</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-6"
              >
                <Sparkles className="w-4 h-4 text-accent-500" />
                <span className="text-sm text-ink-600 dark:text-ink-300">AI-powered content creation</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink-900 dark:text-white leading-tight"
              >
                Create Anything<br />
                with <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">AI</span>.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-lg text-ink-600 dark:text-ink-300 max-w-lg"
              >
                Generate powerful text, stunning images, and production-ready code from a single intelligent workspace.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Creating <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Explore Features
                  </Button>
                </a>
              </motion.div>
            </div>

            {/* Animated visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative grid grid-cols-2 gap-4">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="card flex flex-col items-center justify-center gap-3 aspect-square"
                >
                  <Type className="w-10 h-10 text-brand-500" />
                  <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Text</span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="card flex flex-col items-center justify-center gap-3 aspect-square"
                >
                  <Image className="w-10 h-10 text-accent-500" />
                  <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Image</span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="card flex flex-col items-center justify-center gap-3 aspect-square"
                >
                  <Code2 className="w-10 h-10 text-brand-500" />
                  <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Code</span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                  className="card flex flex-col items-center justify-center gap-3 aspect-square"
                >
                  <Sparkles className="w-10 h-10 text-accent-500" />
                  <span className="text-sm font-medium text-ink-700 dark:text-ink-200">AI</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Capabilities */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 dark:text-white mb-4">Three AI Capabilities, One Platform</h2>
            <p className="text-ink-600 dark:text-ink-300 max-w-2xl mx-auto">Everything you need to create content, visuals, and code — all powered by AI.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Type, title: 'Text Generation', desc: 'Generate blogs, emails, social posts, reports and other written content.', color: 'text-brand-500', bg: 'bg-brand-500/10' },
              { icon: Image, title: 'Image Generation', desc: 'Turn natural-language descriptions into creative visuals.', color: 'text-accent-500', bg: 'bg-accent-500/10' },
              { icon: Code2, title: 'Code Generation', desc: 'Generate, explain, debug and improve code in multiple languages.', color: 'text-brand-500', bg: 'bg-brand-500/10' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-ink-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-ink-600 dark:text-ink-300">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 bg-white/50 dark:bg-ink-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-ink-600 dark:text-ink-300">From idea to output in four simple steps.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Describe your idea', desc: 'Tell the AI what you want to create.', icon: Wand2 },
              { step: 2, title: 'Customize generation', desc: 'Choose tone, style, language, and more.', icon: Layers },
              { step: 3, title: 'Generate with AI', desc: 'Let the AI produce your content instantly.', icon: Zap },
              { step: 4, title: 'Refine and save', desc: 'Edit, improve, and save your results.', icon: Save },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                      <s.icon className="w-5 h-5 text-brand-500" />
                    </div>
                    <span className="text-2xl font-bold text-ink-200 dark:text-ink-700">0{s.step}</span>
                  </div>
                  <h3 className="font-semibold text-ink-900 dark:text-white mb-1">{s.title}</h3>
                  <p className="text-sm text-ink-600 dark:text-ink-300">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prompt Engineering */}
      <section id="prompts" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-500/10 mb-4">
                <Wand2 className="w-4 h-4 text-accent-500" />
                <span className="text-sm text-accent-600 dark:text-accent-400">Prompt Engineering</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 dark:text-white mb-4">
                Structured prompts for better AI output
              </h2>
              <p className="text-ink-600 dark:text-ink-300 mb-6">
                AXIS uses structured prompt engineering principles — role, context, task, requirements, constraints, tone, and output format — to produce significantly better results than simple prompts.
              </p>
              <ul className="space-y-3">
                {[
                  'Define the AI role and context',
                  'Specify clear requirements and constraints',
                  'Set the desired tone and output format',
                  'Compare original vs optimized prompts',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-ink-700 dark:text-ink-200">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-ink-400 mb-2">Original Prompt</p>
                  <div className="p-3 rounded-lg bg-ink-100 dark:bg-ink-800 text-sm text-ink-600 dark:text-ink-300">
                    "Create a website for a gym."
                  </div>
                </div>
                <div className="text-center text-ink-400">↓</div>
                <div>
                  <p className="text-xs text-brand-500 mb-2">Optimized Prompt</p>
                  <div className="p-3 rounded-lg bg-brand-500/10 border border-brand-500/20 text-sm text-ink-700 dark:text-ink-200">
                    <p className="font-medium mb-1">Role: Expert web designer</p>
                    <p className="font-medium mb-1">Context: Gym business needing a modern website</p>
                    <p className="font-medium mb-1">Task: Create a complete gym website</p>
                    <p className="font-medium mb-1">Requirements: Responsive, modern, conversion-focused</p>
                    <p className="font-medium">Output: HTML/CSS with sections for classes, trainers, pricing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Productivity */}
      <section className="py-20 bg-white/50 dark:bg-ink-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 dark:text-white mb-4">Built for Productivity</h2>
            <p className="text-ink-600 dark:text-ink-300">Generate, refine, save, reuse, and organize your AI creations.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: Zap, label: 'Generate' },
              { icon: Wand2, label: 'Refine' },
              { icon: Save, label: 'Save' },
              { icon: FolderOpen, label: 'Reuse' },
              { icon: Layers, label: 'Organize' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card flex flex-col items-center gap-3 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-brand-500" />
                </div>
                <span className="font-medium text-ink-700 dark:text-ink-200">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card text-center bg-gradient-to-br from-brand-500/10 to-accent-500/10 border-brand-500/20"
          >
            <Shield className="w-12 h-12 text-brand-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-ink-900 dark:text-white mb-4">Start creating with AI today</h2>
            <p className="text-ink-600 dark:text-ink-300 mb-8 max-w-xl mx-auto">
              Join AXIS Content Studio and generate text, images, and code from a single powerful workspace.
            </p>
            <Link to="/signup">
              <Button size="lg">
                Create your account <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-200/30 dark:border-ink-800/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <Logo />
              <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">AI-powered content creation studio.</p>
            </div>
            <div>
              <h4 className="font-semibold text-ink-900 dark:text-white mb-3 text-sm">Features</h4>
              <ul className="space-y-2 text-sm text-ink-500 dark:text-ink-400">
                <li>Text Generation</li>
                <li>Image Generation</li>
                <li>Code Generation</li>
                <li>Prompt Lab</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-ink-900 dark:text-white mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-ink-500 dark:text-ink-400">
                <li>About</li>
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-ink-900 dark:text-white mb-3 text-sm">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="text-ink-500 dark:text-ink-400 hover:text-brand-500">Log in</Link></li>
                <li><Link to="/signup" className="text-ink-500 dark:text-ink-400 hover:text-brand-500">Sign up</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-ink-200/30 dark:border-ink-800/30 text-center text-sm text-ink-400">
            © 2026 AXIS Content Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
