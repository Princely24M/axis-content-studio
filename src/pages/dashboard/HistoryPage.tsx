import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Trash2, Save, Eye, Type, Image, Code2, AlertCircle } from 'lucide-react';
import { Card, Badge, Skeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase, type Generation } from '@/lib/supabase';
import { saveToSavedContent } from '@/components/DashboardLayout';
import { formatDate, copyToClipboard } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';

export function HistoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'text' | 'image' | 'code'>('all');
  const [viewing, setViewing] = useState<Generation | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setItems(data || []);
      setLoading(false);
    })();
  }, [user]);

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter);

  const handleDelete = async (id: string) => {
    await supabase.from('generations').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast('Generation deleted.');
  };

  const handleSave = async (item: Generation) => {
    if (!user) return;
    const { error } = await saveToSavedContent(
      user.id,
      item.type,
      item.title,
      item.output || item.image_urls.join('\n'),
      item.image_urls
    );
    if (error) {
      toast('Failed to save.', 'error');
    } else {
      toast('Saved to your library.');
    }
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <History className="w-6 h-6 text-brand-500" /> Generation History
        </h1>
        <p className="mt-1 text-ink-600 dark:text-ink-300">View and manage your past AI generations.</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-ink-100 dark:bg-ink-800 w-fit">
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

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-16">
          <History className="w-12 h-12 text-ink-200 dark:text-ink-700 mx-auto mb-3" />
          <p className="text-ink-500 dark:text-ink-400">No generations yet. Create your first piece of content!</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card hover className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center">
                      {item.type === 'text' && <Type className="w-4 h-4 text-brand-500" />}
                      {item.type === 'image' && <Image className="w-4 h-4 text-accent-500" />}
                      {item.type === 'code' && <Code2 className="w-4 h-4 text-brand-500" />}
                    </div>
                    <Badge variant={item.type === 'text' ? 'brand' : item.type === 'image' ? 'accent' : 'default'}>
                      {item.type}
                    </Badge>
                  </div>
                </div>

                <h3 className="font-medium text-ink-900 dark:text-white text-sm mb-1 line-clamp-2">{item.title}</h3>
                <p className="text-xs text-ink-400 mb-3">{formatDate(item.created_at)}</p>

                {item.type === 'image' && item.image_urls.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1 mb-3">
                    {item.image_urls.slice(0, 2).map((url, idx) => (
                      <img key={idx} src={url} alt="" className="w-full h-20 object-cover rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink-500 dark:text-ink-400 line-clamp-3 mb-3 flex-1">
                    {item.output || 'No output text'}
                  </p>
                )}

                <div className="flex gap-2 mt-auto">
                  <Button variant="outline" size="sm" onClick={() => setViewing(item)} className="flex-1">
                    <Eye className="w-3.5 h-3.5" /> Open
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleSave(item)}>
                    <Save className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.title} size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={viewing.type === 'text' ? 'brand' : viewing.type === 'image' ? 'accent' : 'default'}>
                {viewing.type}
              </Badge>
              {viewing.language && <Badge variant="default">{viewing.language}</Badge>}
              {viewing.framework && <Badge variant="default">{viewing.framework}</Badge>}
              <span className="text-xs text-ink-400">{formatDate(viewing.created_at)}</span>
            </div>

            {viewing.type === 'image' && viewing.image_urls.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {viewing.image_urls.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div>
                <div className="flex justify-end mb-2">
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(viewing.output)}>
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <pre className="p-4 rounded-xl bg-ink-950 text-ink-100 text-sm whitespace-pre-wrap overflow-x-auto max-h-[400px] overflow-y-auto">
                  {viewing.output}
                </pre>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => handleSave(viewing)}>
                <Save className="w-4 h-4" /> Save
              </Button>
              <Button variant="outline" onClick={() => handleDelete(viewing.id)}>
                <Trash2 className="w-4 h-4 text-rose-500" /> Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
