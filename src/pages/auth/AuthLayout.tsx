import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-ink-50 dark:bg-ink-950 bg-mesh-light dark:bg-mesh-dark">
      <div className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300 hover:text-brand-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <Logo size={40} />
            </Link>
            <h1 className="mt-6 text-2xl font-bold text-ink-900 dark:text-white">{title}</h1>
            <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{subtitle}</p>
          </div>

          <div className="card">
            {children}
          </div>

          {footer && (
            <div className="mt-6 text-center text-sm text-ink-600 dark:text-ink-300">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
