import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Copy, Download, Check, Loader2, AlertCircle,
  Sparkles, RefreshCw, BookOpen, Wrench, Zap, MessageSquare,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, Textarea } from '@/components/ui/Input';
import { CodeBlock } from '@/components/CodeBlock';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { generateCode, codeAction, type CodeGenInput } from '@/lib/ai';
import { saveGeneration, saveToSavedContent } from '@/components/DashboardLayout';
import { copyToClipboard, downloadFile } from '@/lib/utils';

const languages = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'SQL', 'Kotlin'];
const frameworks: Record<string, string[]> = {
  HTML: ['None'],
  CSS: ['None', 'Tailwind', 'Bootstrap'],
  JavaScript: ['None', 'React', 'Next.js', 'Node.js', 'Vue'],
  TypeScript: ['None', 'React', 'Next.js', 'Node.js'],
  Python: ['None', 'Django', 'Flask'],
  Java: ['None', 'Spring'],
  'C#': ['None', 'ASP.NET'],
  SQL: ['None', 'PostgreSQL', 'MySQL'],
  Kotlin: ['None', 'Android'],
};
const complexities = ['Simple', 'Intermediate', 'Advanced'];

export function CodeGeneratorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState<CodeGenInput>({
    language: 'TypeScript',
    framework: 'React',
    task: '',
    requirements: '',
    complexity: 'Intermediate',
  });
  const [code, setCode] = useState('');
  const [actionOutput, setActionOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'code' | 'action'>('code');

  const handleGenerate = async () => {
    if (!input.task.trim()) {
      setError('Please enter a task description.');
      return;
    }
    setError('');
    setLoading(true);
    setCode('');
    setActionOutput('');
    setActiveTab('code');

    try {
      const result = await generateCode(input);
      setCode(result);
      if (user) {
        await saveGeneration(
          user.id,
          'code',
          `${input.language} ${input.framework}: ${input.task}`,
          input as unknown as Record<string, unknown>,
          result,
          [],
          input.language,
          input.framework
        );
      }
    } catch {
      setError('Failed to generate code. Please try again.');
    }
    setLoading(false);
  };

  const handleAction = async (action: 'explain' | 'fix' | 'optimize' | 'comment') => {
    if (!code) return;
    setActionLoading(true);
    setActiveTab('action');
    try {
      const result = await codeAction(code, action);
      setActionOutput(result);
    } catch {
      toast('Failed to process code action.', 'error');
    }
    setActionLoading(false);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    if (!user || !code) return;
    const { error } = await saveToSavedContent(user.id, 'code', `${input.language} ${input.framework}: ${input.task}`, code, [], { language: input.language, framework: input.framework });
    if (error) {
      toast('Failed to save code.', 'error');
    } else {
      setSaved(true);
      toast('Code saved to your library.');
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleDownload = () => {
    const ext = getExtension(input.language);
    downloadFile(`${input.task.replace(/\s+/g, '-') || 'code'}.${ext}`, code);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <Code2 className="w-6 h-6 text-brand-500" /> Code Generator
        </h1>
        <p className="mt-1 text-ink-600 dark:text-ink-300">Generate, explain, debug, and optimize code in multiple languages.</p>
      </div>

      <div className="grid lg:grid-cols-[minmax(320px,400px)_1fr] gap-6 items-start">
        <Card>
          <h2 className="text-lg font-semibold text-ink-900 dark:text-white mb-4">Configuration</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Language"
                value={input.language}
                onChange={(v) => setInput({ ...input, language: v, framework: frameworks[v][0] })}
                options={languages.map((l) => ({ value: l, label: l }))}
              />
              <Select
                label="Framework"
                value={input.framework}
                onChange={(v) => setInput({ ...input, framework: v })}
                options={(frameworks[input.language] || ['None']).map((f) => ({ value: f, label: f }))}
              />
            </div>

            <Textarea
              label="Task description"
              value={input.task}
              onChange={(v) => setInput({ ...input, task: v })}
              rows={3}
              placeholder="e.g. Create a todo list component with add and delete functionality"
            />

            <Textarea
              label="Requirements"
              value={input.requirements}
              onChange={(v) => setInput({ ...input, requirements: v })}
              rows={2}
              placeholder="Specific requirements, constraints, or features..."
            />

            <Select
              label="Complexity"
              value={input.complexity}
              onChange={(v) => setInput({ ...input, complexity: v })}
              options={complexities.map((c) => ({ value: c, label: c }))}
            />

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button onClick={handleGenerate} loading={loading} className="w-full" size="lg">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Code</>}
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex gap-1 p-1 rounded-lg bg-ink-100 dark:bg-ink-800">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'code' ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm' : 'text-ink-500'}`}
              >
                Code
              </button>
              {actionOutput && (
                <button
                  onClick={() => setActiveTab('action')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'action' ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm' : 'text-ink-500'}`}
                >
                  Result
                </button>
              )}
            </div>

            {code && !loading && activeTab === 'code' && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownload}>
                  <Download className="w-3.5 h-3.5" /> Download
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSave}>
                  {saved ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Check className="w-3.5 h-3.5" />}
                  {saved ? 'Saved' : 'Save'}
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-[400px]">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  <div className="skeleton h-4 w-1/2 rounded" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-4 w-2/3 rounded" />
                  <div className="skeleton h-4 w-5/6 rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-4 w-2/3 rounded" />
                </motion.div>
              ) : activeTab === 'action' && actionOutput ? (
                <motion.div key="action" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-pre-wrap text-sm text-ink-700 dark:text-ink-200 leading-relaxed max-h-[500px] overflow-y-auto pr-2">
                  {actionOutput}
                </motion.div>
              ) : code ? (
                <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="max-h-[400px] overflow-auto">
                    <CodeBlock code={code} language={input.language} />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-ink-200/30 dark:border-ink-700/30">
                    <Button variant="outline" size="sm" onClick={() => handleAction('explain')} disabled={actionLoading}>
                      <BookOpen className="w-3.5 h-3.5" /> Explain
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAction('fix')} disabled={actionLoading}>
                      <Wrench className="w-3.5 h-3.5" /> Fix
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAction('optimize')} disabled={actionLoading}>
                      <Zap className="w-3.5 h-3.5" /> Optimize
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAction('comment')} disabled={actionLoading}>
                      <MessageSquare className="w-3.5 h-3.5" /> Add Comments
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleGenerate}>
                      <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Code2 className="w-12 h-12 text-ink-200 dark:text-ink-700 mb-3" />
                  <p className="text-ink-500 dark:text-ink-400">Describe a task and click Generate to create code.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </div>
  );
}

function getExtension(lang: string): string {
  const exts: Record<string, string> = {
    HTML: 'html', CSS: 'css', JavaScript: 'js', TypeScript: 'ts',
    Python: 'py', Java: 'java', 'C#': 'cs', SQL: 'sql', Kotlin: 'kt',
  };
  return exts[lang] || 'txt';
}
