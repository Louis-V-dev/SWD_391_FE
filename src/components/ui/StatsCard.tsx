'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  index?: number;
  variant?: 'default' | 'transparent';
}

export default function StatsCard({ 
  icon: Icon, 
  label, 
  value, 
  index = 0,
  variant = 'default'
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`text-center rounded-lg p-3 ${
        variant === 'transparent' 
          ? 'bg-white/10 backdrop-blur-sm' 
          : 'bg-card border'
      }`}
    >
      <Icon className={`w-5 h-5 mx-auto mb-1 ${
        variant === 'transparent' ? 'text-white' : 'text-primary'
      }`} />
      <div className={`text-2xl font-bold ${
        variant === 'transparent' ? 'text-white' : 'text-foreground'
      }`}>
        {value}
      </div>
      <div className={`text-xs ${
        variant === 'transparent' ? 'text-white/80' : 'text-muted-foreground'
      }`}>
        {label}
      </div>
    </motion.div>
  );
}
