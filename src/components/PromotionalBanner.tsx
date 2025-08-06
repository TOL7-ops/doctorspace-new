import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface PromotionalBannerProps {
  title: string;
  discount: string;
  imageUrl?: string;
}

export function PromotionalBanner({ title, discount, imageUrl }: PromotionalBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="w-full bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl overflow-hidden shadow flex items-stretch"
    >
      <div className="flex-1 flex flex-col justify-center px-6 py-8 space-y-3">
        <h2 className="text-2xl font-bold mb-1 text-blue-900">{title}</h2>
        <p className="text-blue-700 mb-3 text-lg">{discount} off</p>
        <motion.button
          whileHover={{ scale: 1.07 }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow hover:bg-blue-700 transition w-max"
        >
          Buy now
        </motion.button>
      </div>
      <div className="hidden sm:flex items-center justify-center w-1/3 bg-blue-200 relative min-h-[120px]">
        <Image
          src={imageUrl || '/promo-banner.jpg'}
          alt={title}
          fill
          className="object-contain"
        />
      </div>
    </motion.div>
  );
} 