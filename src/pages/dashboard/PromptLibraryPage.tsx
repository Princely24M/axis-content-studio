import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Library, Search, Star, ArrowRight, Plus, Check, Trash2 } from 'lucide-react';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase, type Prompt } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { copyToClipboard } from '@/lib/utils';

interface PromptTemplate {
  name: string;
  category: string;
  type: 'text' | 'image' | 'code';
  description: string;
  content: string;
}

const builtinPrompts: PromptTemplate[] = [
  { name: 'Blog Writer', category: 'Text', type: 'text', description: 'Write engaging blog posts on any topic', content: 'Write a comprehensive blog post about [TOPIC]. Target audience: [AUDIENCE]. Tone: [TONE]. Include an introduction, 3-4 main sections with headings, and a conclusion. Aim for approximately [LENGTH] words.' },
  { name: 'Email Writer', category: 'Text', type: 'text', description: 'Craft professional emails for any purpose', content: 'Write a professional email about [PURPOSE]. Recipient: [RECIPIENT]. Tone: [TONE]. Include a clear subject line, greeting, body, and call to action. Keep it concise and actionable.' },
  { name: 'Social Media Writer', category: 'Text', type: 'text', description: 'Create engaging social media content', content: 'Create a social media post about [TOPIC] for [PLATFORM]. Tone: [TONE]. Include relevant hashtags, an attention-grabbing hook, and a call to action. Keep it under 280 characters.' },
  { name: 'Marketing Copy', category: 'Text', type: 'text', description: 'Write persuasive marketing copy', content: 'Write marketing copy for [PRODUCT/SERVICE]. Target audience: [AUDIENCE]. Include a headline, subheadline, key benefits (3 bullet points), and a strong call to action. Tone: persuasive and compelling.' },
  { name: 'Product Photography', category: 'Image', type: 'image', description: 'Generate product-style photos', content: 'A professional product photograph of [PRODUCT]. Style: clean studio lighting, white background, high detail. Angle: [ANGLE]. Mood: premium and elegant.' },
  { name: 'Digital Art', category: 'Image', type: 'image', description: 'Create artistic digital illustrations', content: 'Digital art of [SUBJECT]. Style: vibrant colors, dynamic composition, detailed textures. Mood: [MOOD]. Resolution: high quality.' },
  { name: 'Marketing Visual', category: 'Image', type: 'image', description: 'Generate marketing-ready visuals', content: 'A marketing visual for [BRAND/PRODUCT]. Style: modern, clean, professional. Color palette: [COLORS]. Include space for text overlay.' },
  { name: 'Character Design', category: 'Image', type: 'image', description: 'Design unique characters', content: 'Character design of [CHARACTER DESCRIPTION]. Style: [STYLE - anime/realistic/cartoon]. Full body, dynamic pose, detailed features. Background: simple.' },
  { name: 'React Component', category: 'Code', type: 'code', description: 'Generate React components', content: 'Create a React component for [COMPONENT NAME/PURPOSE]. Use TypeScript. Include props interface, proper state management, and Tailwind CSS styling. Make it responsive and accessible.' },
  { name: 'SQL Query', category: 'Code', type: 'code', description: 'Write SQL queries', content: 'Write a SQL query to [TASK]. Database: [DATABASE TYPE]. Include proper joins, filtering, and sorting. Optimize for performance.' },
  { name: 'Python Script', category: 'Code', type: 'code', description: 'Generate Python scripts', content: 'Write a Python script that [TASK]. Use clean, documented code with type hints. Include error handling and a main function. Follow PEP 8 style.' },
  { name: 'API Endpoint', category: 'Code', type: 'code', description: 'Create API endpoints', content: 'Create a REST API endpoint for [RESOURCE]. Framework: [FRAMEWORK]. Include CRUD operations, input validation, error handling, and proper HTTP status codes.' },
  { name: 'Debugging Assistant', category: 'Code', type: 'code', description: 'Debug and fix code issues', content: 'Debug the following code: [PASTE CODE]. Identify any bugs, explain the issues, and provide a corrected version with explanations of the changes made.' },
];

export function PromptLibraryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'text' | 'image' | 'code'>('all');
  const [search, setSearch] = useState('');
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newPrompt, setNewPrompt] = useState<Partial<PromptTemplate>>({ type: 'text', category: 'Text' });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('prompts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setUserPrompts(data || []);
      const favs = (data || []).filter((p) => p.is_favorite).map((p) => p.id);
      setSavedIds(new Set(favs));
    })();
  }, [user]);

  const filtered = builtinPrompts.filter((p) => {
    if (filter !== 'all' && p.type !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const userFiltered = userPrompts.filter((p) => {
    if (filter !== 'all' && p.type !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleUsePrompt = (prompt: PromptTemplate | Prompt) => {
    if (prompt.type === 'text') navigate('/app/text', { state: { prompt: prompt.content } });
    else if (prompt.type === 'image') navigate('/app/image', { state: { prompt: prompt.content } });
    else navigate('/app/code', { state: { prompt: prompt.content } });
  };

  const handleSavePrompt = async (template: PromptTemplate) => {
    if (!user) return;
    const { data, error } = await supabase.from('prompts').insert({
      user_id: user.id,
      name: template.name,
      category: template.category,
      type: template.type,
      description: template.description,
      content: template.content,
      is_favorite: true,
    }).select().single();

    if (error) {
      toast('Failed to save prompt.', 'error');
    } else {
      setUserPrompts((prev) => [data, ...prev]);
      setSavedIds((prev) => new Set(prev).add(data.id));
      toast('Prompt saved to your library.');
    }
  };

  const handleToggleFav = async (id: string) => {
    const current = userPrompts.find((p) => p.id === id);
    if (!current) return;
    const newVal = !current.is_favorite;
    await supabase.from('prompts').update({ is_favorite: newVal }).eq('id', id);
    setUserPrompts((prev) => prev.map((p) => p.id === id ? { ...p, is_favorite: newVal } : p));
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (newVal) next.add(id); else next.delete(id);
      return next;
    });
  };

  const handleDeletePrompt = async (id: string) => {
    await supabase.from('prompts').delete().eq('id', id);
    setUserPrompts((prev) => prev.filter((p) => p.id !== id));
    toast('Prompt deleted.');
  };

  const handleCreatePrompt = async () => {
    if (!user || !newPrompt.name || !newPrompt.content) {
      toast('Please fill in name and content.', 'error');
      return;
    }
    const { data, error } = await supabase.from('prompts').insert({
      user_id: user.id,
      name: newPrompt.name,
      category: newPrompt.category || 'Custom',
      type: newPrompt.type || 'text',
      description: newPrompt.description || '',
      content: newPrompt.content,
    }).select().single();

    if (error) {
      toast('Failed to create prompt.', 'error');
    } else {
      setUserPrompts((prev) => [data, ...prev]);
      setShowCreate(false);
      setNewPrompt({ type: 'text', category: 'Text' });
      toast('Prompt created successfully.');
    }
  };

  const handleCopy = async (content: string) => {
    await copyToClipboard(content);
    toast('Prompt copied to clipboard.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
            <Library className="w-6 h-6 text-brand-500" /> Prompt Library
          </h1>
          <p className="mt-1 text-ink-600 dark:text-ink-300">Browse, use, and save prompt templates.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Create Prompt
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="input pl-10"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-ink-100 dark:bg-ink-800">
          {(['all', 'text', 'image', 'code'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm' : 'text-ink-500'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {userFiltered.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-ink-500 dark:text-ink-400 mb-3">Your Prompts</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userFiltered.map((prompt, i) => (
              <motion.div key={prompt.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card hover className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-ink-900 dark:text-white">{prompt.name}</h3>
                      <Badge variant="brand" className="mt-1">{prompt.category}</Badge>
                    </div>
                    <button onClick={() => handleToggleFav(prompt.id)} className="text-ink-300 hover:text-amber-400 transition-colors">
                      <Star className={`w-4 h-4 ${prompt.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>
                  <p className="text-sm text-ink-600 dark:text-ink-300 mb-3 flex-1">{prompt.description}</p>
                  <div className="p-2.5 rounded-lg bg-ink-50 dark:bg-ink-800/50 text-xs text-ink-500 dark:text-ink-400 mb-3 line-clamp-2">
                    {prompt.content}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUsePrompt(prompt)} className="flex-1">
                      Use <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(prompt.content)}>
                      <Search className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeletePrompt(prompt.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-ink-500 dark:text-ink-400 mb-3">Template Library</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((prompt, i) => (
            <motion.div key={prompt.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card hover className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-ink-900 dark:text-white">{prompt.name}</h3>
                    <Badge variant={prompt.type === 'text' ? 'brand' : prompt.type === 'image' ? 'accent' : 'default'} className="mt-1">
                      {prompt.category}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-ink-600 dark:text-ink-300 mb-3 flex-1">{prompt.description}</p>
                <div className="p-2.5 rounded-lg bg-ink-50 dark:bg-ink-800/50 text-xs text-ink-500 dark:text-ink-400 mb-3 line-clamp-2">
                  {prompt.content}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleUsePrompt(prompt)} className="flex-1">
                    Use Prompt <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleSavePrompt(prompt)}>
                    <Star className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Custom Prompt">
        <div className="space-y-4">
          <Input
            label="Prompt name"
            value={newPrompt.name || ''}
            onChange={(e) => setNewPrompt({ ...newPrompt, name: e.target.value })}
            placeholder="e.g. My Custom Blog Writer"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select
                value={newPrompt.type || 'text'}
                onChange={(e) => setNewPrompt({ ...newPrompt, type: e.target.value as 'text' | 'image' | 'code' })}
                className="input"
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="code">Code</option>
              </select>
            </div>
            <Input
              label="Category"
              value={newPrompt.category || ''}
              onChange={(e) => setNewPrompt({ ...newPrompt, category: e.target.value })}
              placeholder="e.g. Custom"
            />
          </div>
          <Input
            label="Description"
            value={newPrompt.description || ''}
            onChange={(e) => setNewPrompt({ ...newPrompt, description: e.target.value })}
            placeholder="Brief description of what this prompt does"
          />
          <div>
            <label className="label">Prompt content</label>
            <textarea
              value={newPrompt.content || ''}
              onChange={(e) => setNewPrompt({ ...newPrompt, content: e.target.value })}
              rows={5}
              placeholder="Enter your prompt template here. Use [PLACEHOLDERS] for variables."
              className="input resize-y"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreatePrompt}>
              <Check className="w-4 h-4" /> Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
