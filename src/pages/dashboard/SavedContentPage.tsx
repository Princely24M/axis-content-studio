import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bookmark, Search, Trash2, Eye, Copy, Check, Download,
  Type, Image, Code2, FileText, AlertCircle,
} from 'lucide-react';
import { Card, Badge, Skeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase, type SavedContent } from '@/lib/supabase';
import { copyToClipboard, downloadFile, formatDate } from '@/lib/utils';

export function SavedContentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'text' | 'image' | 'code' | 'prompt'>('all');
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<SavedContent | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('saved_content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setItems(data || []);
      setLoading(false);
    })();
  }, [user]);

  const filtered = items.filter((item) => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    await supabase.from('saved_content').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast('Item deleted.');
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (item: SavedContent) => {
    downloadFile(`${item.title.replace(/\s+/g, '-') || 'content'}.txt`, item.content);
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="w-4 h-4 text-brand-500" />;
      case 'image': return <Image className="w-4 h-4 text-accent-500" />;
      case 'code': return <Code2 className="w-4 h-4 text-brand-500" />;
      case 'prompt': return <FileText className="w-4 h-4 text-amber-500" />;
      default: return <Bookmark className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-brand-500" /> Saved Content
        </h1>
        <p className="mt-1 text-ink-600 dark:text-ink-300">Your saved text, images, code, and prompts in one place.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved content..."
            className="input pl-10"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-ink-100 dark:bg-ink-800 overflow-x-auto">
          {(['all', 'text', 'image', 'code', 'prompt'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${filter === f ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm' : 'text-ink-500'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-16">
          <Bookmark className="w-12 h-12 text-ink-200 dark:text-ink-700 mx-auto mb-3" />
          <p className="text-ink-500 dark:text-ink-400">
            {search ? 'No items match your search.' : 'No saved content yet. Save items from your generators!'}
          </p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card hover className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center">
                      {typeIcon(item.type)}
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
                  <p className="text-xs text-ink-500 dark:text-ink-400 line-clamp-3 mb-3 flex-1">{item.content}</p>
                )}

                <div className="flex gap-2 mt-auto">
                  <Button variant="outline" size="sm" onClick={() => setViewing(item)} className="flex-1">
                    <Eye className="w-3.5 h-3.5" /> Open
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(item.content)}>
                    <Copy className="w-3.5 h-3.5" />
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
                <div className="flex justify-end mb-2 gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(viewing.content)}>
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(viewing)}>
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                </div>
                <pre className="p-4 rounded-xl bg-ink-950 text-ink-100 text-sm whitespace-pre-wrap overflow-x-auto max-h-[400px] overflow-y-auto">
                  {viewing.content}
                </pre>
              </div>
            )}

            <div className="flex justify-end">
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
