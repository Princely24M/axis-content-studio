import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Wand2, Copy, Check, ArrowRight, Loader2,
  Sparkles, ArrowLeftRight, Lightbulb, Play,
} from 'lucide-react';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { optimizePrompt, generateFromPrompt, type OptimizedPrompt } from '@/lib/ai';
import { copyToClipboard } from '@/lib/utils';

export function PromptLabPage() {
  const { toast } = useToast();
  const [original, setOriginal] = useState('');
  const [optimized, setOptimized] = useState<OptimizedPrompt | null>(null);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copiedOrig, setCopiedOrig] = useState(false);
  const [copiedOpt, setCopiedOpt] = useState(false);

  const handleOptimize = async () => {
    if (!original.trim()) {
      toast('Please enter a prompt to optimize.', 'error');
      return;
    }
    setLoading(true);
    setOptimized(null);
    setOutput('');
    try {
      const result = await optimizePrompt(original);
      setOptimized(result);
    } catch {
      toast('Failed to optimize prompt.', 'error');
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    const prompt = optimized?.full || original;
    if (!prompt.trim()) return;
    setGenerating(true);
    setOutput('');
    try {
      const result = await generateFromPrompt(prompt);
      setOutput(result);
    } catch {
      toast('Failed to generate output.', 'error');
    }
    setGenerating(false);
  };

  const handleCopy = async (text: string, which: 'orig' | 'opt') => {
    await copyToClipboard(text);
    if (which === 'orig') {
      setCopiedOrig(true);
      setTimeout(() => setCopiedOrig(false), 2000);
    } else {
      setCopiedOpt(true);
      setTimeout(() => setCopiedOpt(false), 2000);
    }
    toast('Copied to clipboard.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-accent-500" /> Prompt Lab
        </h1>
        <p className="mt-1 text-ink-600 dark:text-ink-300">Transform simple prompts into structured, optimized prompts for better AI output.</p>
      </div>

      <Card>
        <label className="label">Enter your initial prompt</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            rows={3}
            placeholder="e.g. Create a website for a gym."
            className="input resize-y flex-1"
          />
          <Button onClick={handleOptimize} loading={loading} className="sm:self-end" size="lg">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Optimizing...</> : <><Wand2 className="w-4 h-4" /> Optimize</>}
          </Button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink-900 dark:text-white flex items-center gap-2">
              <Badge variant="default">Original</Badge>
            </h2>
            {original && (
              <Button variant="ghost" size="sm" onClick={() => handleCopy(original, 'orig')}>
                {copiedOrig ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedOrig ? 'Copied' : 'Copy'}
              </Button>
            )}
          </div>
          <div className="flex-1 p-4 rounded-xl bg-ink-50 dark:bg-ink-800/50 text-sm text-ink-600 dark:text-ink-300 min-h-[150px]">
            {original || <span className="text-ink-400">Your original prompt will appear here.</span>}
          </div>
        </Card>

        <Card className="flex flex-col border-brand-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink-900 dark:text-white flex items-center gap-2">
              <Badge variant="brand">Optimized</Badge>
            </h2>
            {optimized && (
              <Button variant="ghost" size="sm" onClick={() => handleCopy(optimized.full, 'opt')}>
                {copiedOpt ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedOpt ? 'Copied' : 'Copy'}
              </Button>
            )}
          </div>
          <div className="flex-1 min-h-[150px]">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  <div className="skeleton h-4 w-1/3 rounded" />
                  <div className="skeleton h-4 w-2/3 rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                </motion.div>
              ) : optimized ? (
                <motion.div key="opt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {[
                    { label: 'Role', value: optimized.role },
                    { label: 'Context', value: optimized.context },
                    { label: 'Task', value: optimized.task },
                    { label: 'Requirements', value: optimized.requirements.map((r) => `- ${r}`).join('\n') },
                    { label: 'Constraints', value: optimized.constraints.map((c) => `- ${c}`).join('\n') },
                    { label: 'Tone', value: optimized.tone },
                    { label: 'Output Format', value: optimized.outputFormat },
                  ].map((section) => (
                    <div key={section.label} className="p-3 rounded-lg bg-brand-500/5 border border-brand-500/10">
                      <p className="text-xs font-semibold text-brand-500 mb-1">{section.label}</p>
                      <p className="text-sm text-ink-700 dark:text-ink-200 whitespace-pre-wrap">{section.value}</p>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Wand2 className="w-8 h-8 text-ink-200 dark:text-ink-700 mb-2" />
                  <p className="text-sm text-ink-400">Click Optimize to generate a structured version.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      {optimized && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <h2 className="font-semibold text-ink-900 dark:text-white flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" /> Why the optimized prompt is better
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Clear Role', desc: 'Defines the AI persona, ensuring expert-level output.' },
                { title: 'Full Context', desc: 'Provides background so the AI understands the goal.' },
                { title: 'Specific Requirements', desc: 'Lists exact deliverables, reducing ambiguity.' },
                { title: 'Defined Constraints', desc: 'Sets boundaries to keep output focused.' },
                { title: 'Tone Guidance', desc: 'Ensures the output matches the desired voice.' },
                { title: 'Output Format', desc: 'Specifies structure for consistent, usable results.' },
              ].map((item) => (
                <div key={item.title} className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50">
                  <p className="text-sm font-medium text-ink-900 dark:text-white mb-1">{item.title}</p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {optimized && (
        <Card>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-semibold text-ink-900 dark:text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-brand-500" /> Generate Output
            </h2>
            <Button onClick={handleGenerate} loading={generating} size="sm">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate</>}
            </Button>
          </div>
          <div className="min-h-[100px]">
            <AnimatePresence mode="wait">
              {generating ? (
                <motion.div key="gen-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-5/6 rounded" />
                </motion.div>
              ) : output ? (
                <motion.div key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-pre-wrap text-sm text-ink-700 dark:text-ink-200 leading-relaxed">
                  {output}
                </motion.div>
              ) : (
                <p className="text-sm text-ink-400 text-center py-4">Click Generate to see the AI output from the optimized prompt.</p>
              )}
            </AnimatePresence>
          </div>
        </Card>
      )}
    </div>
  );
}
