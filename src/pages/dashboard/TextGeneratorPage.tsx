import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type, Copy, RefreshCw, Sparkles, Minimize2, Maximize2, Wand2,
  Save, Download, Check, Loader2, AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, Textarea } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { generateText, refineText, type TextGenInput } from '@/lib/ai';
import { saveGeneration, saveToSavedContent } from '@/components/DashboardLayout';
import { copyToClipboard, downloadFile } from '@/lib/utils';

const contentTypes = ['Blog post', 'Email', 'Social media post', 'Marketing copy', 'Product description', 'Report', 'Summary', 'Study content'];
const tones = ['Professional', 'Casual', 'Friendly', 'Formal', 'Persuasive', 'Informative', 'Creative', 'Humorous'];
const lengths = ['short', 'medium', 'long'];
const languages = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian'];

export function TextGeneratorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState<TextGenInput>({
    contentType: 'Blog post',
    topic: '',
    audience: 'general audience',
    tone: 'Professional',
    length: 'medium',
    language: 'English',
    additional: '',
  });
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!input.topic.trim()) {
      setError('Please enter a topic or instruction.');
      return;
    }
    setError('');
    setLoading(true);
    setOutput('');
    setSaved(false);

    try {
      const result = await generateText(input);
      setOutput(result);
      if (user) {
        await saveGeneration(user.id, 'text', `${input.contentType}: ${input.topic}`, input as unknown as Record<string, unknown>, result);
      }
    } catch {
      setError('Failed to generate text. Please try again.');
    }
    setLoading(false);
  };

  const handleRefine = async (action: 'improve' | 'shorten' | 'expand' | 'changeTone') => {
    if (!output) return;
    setRefining(true);
    try {
      const refined = await refineText(output, action, input.tone);
      setOutput(refined);
      toast('Text refined successfully.');
    } catch {
      toast('Failed to refine text.', 'error');
    }
    setRefining(false);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(output);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    if (!user || !output) return;
    const { error } = await saveToSavedContent(user.id, 'text', `${input.contentType}: ${input.topic}`, output);
    if (error) {
      toast('Failed to save content.', 'error');
    } else {
      setSaved(true);
      toast('Content saved to your library.');
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadFile(`${input.topic.replace(/\s+/g, '-') || 'text'}.txt`, output);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <Type className="w-6 h-6 text-brand-500" /> Text Generator
        </h1>
        <p className="mt-1 text-ink-600 dark:text-ink-300">Generate blogs, emails, social posts, reports, and more.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Card>
          <h2 className="text-lg font-semibold text-ink-900 dark:text-white mb-4">Configuration</h2>
          <div className="space-y-4">
            <Select
              label="Content type"
              value={input.contentType}
              onChange={(v) => setInput({ ...input, contentType: v })}
              options={contentTypes.map((t) => ({ value: t, label: t }))}
            />

            <Textarea
              label="Topic / Instruction"
              value={input.topic}
              onChange={(v) => setInput({ ...input, topic: v })}
              rows={3}
              placeholder="e.g. The benefits of remote work for small businesses"
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Target audience"
                value={input.audience}
                onChange={(v) => setInput({ ...input, audience: v })}
                options={[
                  { value: 'general audience', label: 'General audience' },
                  { value: 'business professionals', label: 'Business professionals' },
                  { value: 'students', label: 'Students' },
                  { value: 'developers', label: 'Developers' },
                  { value: 'marketers', label: 'Marketers' },
                  { value: 'entrepreneurs', label: 'Entrepreneurs' },
                ]}
              />
              <Select
                label="Tone"
                value={input.tone}
                onChange={(v) => setInput({ ...input, tone: v })}
                options={tones.map((t) => ({ value: t, label: t }))}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Length"
                value={input.length}
                onChange={(v) => setInput({ ...input, length: v })}
                options={lengths.map((l) => ({ value: l, label: l.charAt(0).toUpperCase() + l.slice(1) }))}
              />
              <Select
                label="Language"
                value={input.language}
                onChange={(v) => setInput({ ...input, language: v })}
                options={languages.map((l) => ({ value: l, label: l }))}
              />
            </div>

            <Textarea
              label="Additional instructions"
              value={input.additional}
              onChange={(v) => setInput({ ...input, additional: v })}
              rows={2}
              placeholder="Any specific requirements or details to include..."
            />

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button onClick={handleGenerate} loading={loading} className="w-full" size="lg">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate</>}
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Output</h2>
            {output && !loading && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownload}>
                  <Download className="w-3.5 h-3.5" /> Download
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSave}>
                  {saved ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Save className="w-3.5 h-3.5" />}
                  {saved ? 'Saved' : 'Save'}
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-[300px]">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-5/6 rounded" />
                  <div className="skeleton h-4 w-4/5 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-4 w-5/6 rounded" />
                </motion.div>
              ) : output ? (
                <motion.div key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap text-ink-700 dark:text-ink-200 leading-relaxed max-h-[400px] overflow-y-auto pr-2">
                    {output}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-ink-200/30 dark:border-ink-700/30">
                    <Button variant="outline" size="sm" onClick={() => handleRefine('improve')} disabled={refining}>
                      <Wand2 className="w-3.5 h-3.5" /> Improve
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRefine('shorten')} disabled={refining}>
                      <Minimize2 className="w-3.5 h-3.5" /> Shorten
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRefine('expand')} disabled={refining}>
                      <Maximize2 className="w-3.5 h-3.5" /> Expand
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRefine('changeTone')} disabled={refining}>
                      <RefreshCw className="w-3.5 h-3.5" /> Change Tone
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleGenerate} disabled={refining}>
                      <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Type className="w-12 h-12 text-ink-200 dark:text-ink-700 mb-3" />
                  <p className="text-ink-500 dark:text-ink-400">Configure your settings and click Generate to create content.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </div>
  );
}
