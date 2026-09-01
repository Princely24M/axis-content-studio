import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Lock, LogOut, Trash2, Save, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('created_at').eq('id', user.id).maybeSingle();
      if (data?.created_at) setCreatedAt(data.created_at);
      else setCreatedAt(user.created_at || '');
    })();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user || !fullName.trim()) {
      toast('Please enter your name.', 'error');
      return;
    }
    setSavingProfile(true);
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: fullName, avatar_url: avatarUrl },
    });

    if (authError) {
      toast('Failed to update profile.', 'error');
      setSavingProfile(false);
      return;
    }

    const { error: dbError } = await supabase
      .from('profiles')
      .update({ full_name: fullName, avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (dbError) {
      toast('Profile updated in auth, but database sync failed.', 'error');
    } else {
      toast('Profile updated successfully.');
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast('Password must be at least 8 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('Passwords do not match.', 'error');
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast('Failed to update password.', 'error');
    } else {
      toast('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    }
    setSavingPassword(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      toast('Account deletion requires admin access. Signing you out instead.', 'info');
      await signOut();
      navigate('/');
    } else {
      toast('Account deleted.');
      navigate('/');
    }
    setDeleting(false);
    setDeleteConfirm(false);
  };

  const initials = (fullName || user?.email || 'U')
    .split(' ')
    .map((s: string) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-brand-500" /> Profile
        </h1>
        <p className="mt-1 text-ink-600 dark:text-ink-300">Manage your account information.</p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-ink-900 dark:text-white mb-4">Profile Information</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-medium text-ink-900 dark:text-white">{fullName || 'User'}</p>
            <p className="text-sm text-ink-500 dark:text-ink-400">{user?.email}</p>
            {createdAt && (
              <p className="text-xs text-ink-400 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Joined {formatDate(createdAt)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            icon={<User className="w-4 h-4" />}
          />
          <Input
            label="Email"
            value={user?.email || ''}
            disabled
            icon={<Mail className="w-4 h-4" />}
            hint="Email cannot be changed"
          />
          <Input
            label="Avatar URL"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
          />
          <Button onClick={handleUpdateProfile} loading={savingProfile}>
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-ink-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-brand-500" /> Change Password
        </h2>
        <div className="space-y-4">
          <PasswordInput
            label="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
          <PasswordInput
            label="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
          />
          <Button onClick={handleChangePassword} loading={savingPassword}>
            Update Password
          </Button>
        </div>
      </Card>

      <Card className="border-rose-200/30 dark:border-rose-900/20">
        <h2 className="text-lg font-semibold text-ink-900 dark:text-white mb-4">Account Actions</h2>
        <div className="space-y-3">
          <Button variant="outline" onClick={handleSignOut} className="w-full sm:w-auto">
            <LogOut className="w-4 h-4" /> Log out
          </Button>
          <div>
            <Button variant="outline" onClick={() => setDeleteConfirm(true)} className="w-full sm:w-auto border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/20">
              <Trash2 className="w-4 h-4" /> Delete Account
            </Button>
            <p className="text-xs text-ink-400 mt-1.5">This action is permanent and cannot be undone.</p>
          </div>
        </div>
      </Card>

      <Modal open={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Delete Account" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-500/10">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <p className="text-sm text-rose-600 dark:text-rose-400">
              Are you sure? This will permanently delete your account and all your data.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
            <Button onClick={handleDeleteAccount} loading={deleting} className="bg-rose-500 hover:bg-rose-600">
              Yes, delete my account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
