import { motion } from 'framer-motion';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <motion.div
        initial={{ rotate: 0 }}
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="axis-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3478f6" />
              <stop offset="1" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill="url(#axis-grad)" />
          <path d="M9 22L16 10L23 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12.5 18H19.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </motion.div>
      <span className="text-lg font-bold tracking-tight text-ink-900 dark:text-white">
        AXIS
      </span>
    </div>
  );
}
