import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Type, Image, Code2, History, Bookmark, Library, ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { timeAgo } from '@/lib/utils';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ text: 0, image: 0, code: 0, saved: 0 });
  const [recent, setRecent] = useState<Array<{ id: string; type: string; title: string; created_at: string }>>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { count: textCount } = await supabase.from('generations').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('type', 'text');
      const { count: imageCount } = await supabase.from('generations').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('type', 'image');
      const { count: codeCount } = await supabase.from('generations').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('type', 'code');
      const { count: savedCount } = await supabase.from('saved_content').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

      setStats({
        text: textCount || 0,
        image: imageCount || 0,
        code: codeCount || 0,
        saved: savedCount || 0,
      });

      const { data: recentGens } = await supabase
        .from('generations')
        .select('id, type, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecent(recentGens || []);
    })();
  }, [user]);

  const tools = [
    { path: '/app/text', label: 'Text Generator', icon: Type, desc: 'Generate written content', color: 'from-brand-500 to-brand-600' },
    { path: '/app/image', label: 'Image Generator', icon: Image, desc: 'Create visuals from text', color: 'from-accent-500 to-accent-600' },
    { path: '/app/code', label: 'Code Generator', icon: Code2, desc: 'Generate code snippets', color: 'from-brand-600 to-accent-500' },
    { path: '/app/prompts', label: 'Prompt Library', icon: Library, desc: 'Browse prompt templates', color: 'from-accent-500 to-brand-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white">
          Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}
        </h1>
        <p className="mt-1 text-ink-600 dark:text-ink-300">What would you like to create today?</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={tool.path}>
              <Card hover className="h-full cursor-pointer group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4`}>
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-ink-900 dark:text-white mb-1">{tool.label}</h3>
                <p className="text-sm text-ink-500 dark:text-ink-400">{tool.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm text-brand-500 group-hover:gap-2 transition-all">
                  Open <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Text Generations', value: stats.text, icon: Type },
          { label: 'Image Generations', value: stats.image, icon: Image },
          { label: 'Code Generations', value: stats.code, icon: Code2 },
          { label: 'Saved Items', value: stats.saved, icon: Bookmark },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          >
            <Card className="text-center">
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-5 h-5 text-brand-500" />
              </div>
              <p className="text-2xl font-bold text-ink-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-brand-500" /> Recent Generations
          </h2>
          <Link to="/app/history" className="text-sm text-brand-500 hover:text-brand-600 flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-10 h-10 text-ink-300 dark:text-ink-700 mx-auto mb-3" />
            <p className="text-ink-500 dark:text-ink-400">No generations yet. Create your first piece of content!</p>
            <Link to="/app/text">
              <button className="mt-4 text-sm text-brand-500 hover:text-brand-600 font-medium">
                Start generating →
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                  {item.type === 'text' && <Type className="w-4 h-4 text-brand-500" />}
                  {item.type === 'image' && <Image className="w-4 h-4 text-accent-500" />}
                  {item.type === 'code' && <Code2 className="w-4 h-4 text-brand-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900 dark:text-ink-100 truncate">{item.title || 'Untitled'}</p>
                  <p className="text-xs text-ink-400">{timeAgo(item.created_at)}</p>
                </div>
                <Badge variant={item.type === 'text' ? 'brand' : item.type === 'image' ? 'accent' : 'default'}>
                  {item.type}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
