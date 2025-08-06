import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function ServiceCard({ icon: Icon, name, href, onClick }: { icon: any; name: string; href: string; onClick?: () => void }) {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div className="relative group">
      <Link
        href={href}
        onClick={onClick}
        className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow hover:shadow-md transition group focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        tabIndex={0}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Icon className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
        </motion.div>
        <span className="text-sm font-medium text-gray-900">{name}</span>
      </Link>
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="absolute z-10 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow top-full left-1/2 -translate-x-1/2 mt-2"
        >
          {`Go to ${name}`}
        </motion.div>
      )}
    </div>
  );
} 