import { useState, useEffect } from 'react';
import { Settings, Sun, Moon, Monitor, Bell, Save, Type, Image, Code2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();

  const [prefs, setPrefs] = useState({
    defaultTextTone: 'Professional',
    defaultImageStyle: 'Photorealistic',
    defaultCodeLanguage: 'TypeScript',
    notifications: true,
    emailUpdates: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      const stored = localStorage.getItem('axis-prefs');
      if (stored) {
        try { setPrefs(JSON.parse(stored)); } catch { /* ignore */ }
      }
      void data;
    })();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    localStorage.setItem('axis-prefs', JSON.stringify(prefs));
    if (user) {
      await supabase.auth.updateUser({ data: { preferences: prefs } });
    }
    setTimeout(() => {
      setSaving(false);
      toast('Settings saved.');
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-500" /> Settings
        </h1>
        <p className="mt-1 text-ink-600 dark:text-ink-300">Customize your AXIS Content Studio experience.</p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-ink-900 dark:text-white mb-4">Appearance</h2>
        <div>
          <label className="label">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Monitor },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === opt.value ? 'border-brand-500 bg-brand-500/5' : 'border-ink-200 dark:border-ink-700 hover:border-ink-300 dark:hover:border-ink-600'}`}
              >
                <opt.icon className={`w-6 h-6 ${theme === opt.value ? 'text-brand-500' : 'text-ink-400'}`} />
                <span className={`text-sm font-medium ${theme === opt.value ? 'text-brand-500' : 'text-ink-600 dark:text-ink-300'}`}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-ink-900 dark:text-white mb-4">Default Generation Settings</h2>
        <div className="space-y-4">
          <Select
            label="Default text tone"
            value={prefs.defaultTextTone}
            onChange={(v) => setPrefs({ ...prefs, defaultTextTone: v })}
            options={['Professional', 'Casual', 'Friendly', 'Formal', 'Persuasive', 'Creative'].map((t) => ({ value: t, label: t }))}
          />
          <Select
            label="Default image style"
            value={prefs.defaultImageStyle}
            onChange={(v) => setPrefs({ ...prefs, defaultImageStyle: v })}
            options={['Photorealistic', 'Cinematic', '3D', 'Illustration', 'Digital art', 'Minimalist', 'Anime'].map((s) => ({ value: s, label: s }))}
          />
          <Select
            label="Default code language"
            value={prefs.defaultCodeLanguage}
            onChange={(v) => setPrefs({ ...prefs, defaultCodeLanguage: v })}
            options={['TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'SQL', 'HTML', 'CSS'].map((l) => ({ value: l, label: l }))}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-ink-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-500" /> Notifications
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-ink-900 dark:text-white">In-app notifications</p>
              <p className="text-xs text-ink-500 dark:text-ink-400">Show toast notifications for actions</p>
            </div>
            <button
              onClick={() => setPrefs({ ...prefs, notifications: !prefs.notifications })}
              className={`relative w-11 h-6 rounded-full transition-colors ${prefs.notifications ? 'bg-brand-500' : 'bg-ink-300 dark:bg-ink-700'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${prefs.notifications ? 'translate-x-5' : ''}`} />
            </button>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-ink-900 dark:text-white">Email updates</p>
              <p className="text-xs text-ink-500 dark:text-ink-400">Receive product updates by email</p>
            </div>
            <button
              onClick={() => setPrefs({ ...prefs, emailUpdates: !prefs.emailUpdates })}
              className={`relative w-11 h-6 rounded-full transition-colors ${prefs.emailUpdates ? 'bg-brand-500' : 'bg-ink-300 dark:bg-ink-700'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${prefs.emailUpdates ? 'translate-x-5' : ''}`} />
            </button>
          </label>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">
          <Save className="w-4 h-4" /> Save Settings
        </Button>
      </div>
    </div>
  );
}
