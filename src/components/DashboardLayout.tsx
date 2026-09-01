import { useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Type, Image, Code2, Library, FlaskConical,
  History, Bookmark, User, Settings, LogOut, Menu, X, Sun, Moon, Monitor,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/text', label: 'Text Generator', icon: Type },
  { path: '/app/image', label: 'Image Generator', icon: Image },
  { path: '/app/code', label: 'Code Generator', icon: Code2 },
  { path: '/app/prompts', label: 'Prompt Library', icon: Library },
  { path: '/app/prompt-lab', label: 'Prompt Lab', icon: FlaskConical },
  { path: '/app/history', label: 'Generation History', icon: History },
  { path: '/app/saved', label: 'Saved Content', icon: Bookmark },
  { path: '/app/profile', label: 'Profile', icon: User },
  { path: '/app/settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeMenu, setThemeMenu] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50 dark:bg-ink-950">
        <div className="animate-pulse">
          <Logo size={48} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const initials = (user.user_metadata?.full_name || user.email || 'U')
    .split(' ')
    .map((s: string) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const SidebarContent = () => (
    <>
      <div className="px-4 py-5">
        <Link to="/" className="inline-block">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-ink-200/30 dark:border-ink-800/30">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink-900 dark:text-ink-100 truncate">
              {user.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-ink-400 truncate">{user.email}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setThemeMenu(!themeMenu)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
          >
            {theme === 'light' && <Sun className="w-4 h-4" />}
            {theme === 'dark' && <Moon className="w-4 h-4" />}
            {theme === 'system' && <Monitor className="w-4 h-4" />}
            <span className="capitalize">{theme}</span>
          </button>
          <AnimatePresence>
            {themeMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute bottom-full left-0 right-0 mb-1 glass-strong rounded-xl p-1 shadow-lg"
              >
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTheme(t); setThemeMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-ink-100 dark:hover:bg-ink-800 capitalize text-ink-700 dark:text-ink-200"
                  >
                    {t === 'light' && <Sun className="w-4 h-4" />}
                    {t === 'dark' && <Moon className="w-4 h-4" />}
                    {t === 'system' && <Monitor className="w-4 h-4" />}
                    {t}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 bg-mesh-light dark:bg-mesh-dark">
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 glass-strong border-r border-ink-200/30 dark:border-ink-800/30 flex-col z-40">
        <SidebarContent />
      </aside>

      <header className="lg:hidden sticky top-0 z-40 glass-strong border-b border-ink-200/30 dark:border-ink-800/30 h-16 flex items-center justify-between px-4">
        <Link to="/">
          <Logo size={28} />
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800"
        >
          <Menu className="w-5 h-5 text-ink-700 dark:text-ink-200" />
        </button>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 glass-strong border-r border-ink-200/30 dark:border-ink-800/30 flex flex-col z-50 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800"
              >
                <X className="w-5 h-5 text-ink-500" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="lg:ml-64 min-h-screen overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

export async function saveGeneration(
  userId: string,
  type: 'text' | 'image' | 'code',
  title: string,
  input: Record<string, unknown>,
  output: string,
  imageUrls: string[] = [],
  language?: string,
  framework?: string,
  imageMetadata?: {
    optimizedPrompt?: string;
    generationSpec?: Record<string, unknown>;
    modelUsed?: string;
    generationStatus?: 'success' | 'failed' | 'partial';
    errorMessage?: string;
  }
) {
  const { data, error } = await supabase
    .from('generations')
    .insert({
      user_id: userId,
      type,
      title,
      input,
      output,
      image_urls: imageUrls,
      language,
      framework,
      optimized_prompt: imageMetadata?.optimizedPrompt,
      generation_spec: imageMetadata?.generationSpec,
      model_used: imageMetadata?.modelUsed,
      generation_status: imageMetadata?.generationStatus,
      error_message: imageMetadata?.errorMessage,
    })
    .select()
    .single();

  return { data, error };
}

export async function saveToSavedContent(
  userId: string,
  type: 'text' | 'image' | 'code' | 'prompt',
  title: string,
  content: string,
  imageUrls: string[] = [],
  metadata: Record<string, unknown> = {}
) {
  const { data, error } = await supabase
    .from('saved_content')
    .insert({ user_id: userId, type, title, content, image_urls: imageUrls, metadata })
    .select()
    .single();

  return { data, error };
}
