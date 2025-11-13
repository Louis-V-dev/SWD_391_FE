'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Sparkles, Leaf, RefreshCw } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { PostsFeed } from '@/components/posts/PostsFeed';
import { useAuth } from '@/contexts/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

export default function CommunityPage() {
  const { user } = useAuth();
  const viewerId = user?.userId;
  const isStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header showSearch />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-border/50 bg-background/80 p-8 shadow-lg backdrop-blur-sm"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  Community Stories
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                  Connect, inspire, and celebrate sustainable fashion
                </h1>
                <p className="text-muted-foreground text-base max-w-2xl">
                  Share your circular fashion journey, highlight upcycling wins, or ask the community for tips.
                  This is your space to build meaningful conversations around sustainable style.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
                <div className="rounded-2xl border border-border/50 bg-muted/40 p-4 text-center">
                  <Users className="mx-auto mb-2 h-6 w-6 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Community first</p>
                  <p className="text-xs text-muted-foreground">Support each other&apos;s impact journeys</p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-muted/40 p-4 text-center">
                  <Leaf className="mx-auto mb-2 h-6 w-6 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Share & learn</p>
                  <p className="text-xs text-muted-foreground">Practical tips for sustainable living</p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-muted/40 p-4 text-center">
                  <RefreshCw className="mx-auto mb-2 h-6 w-6 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Circular mindset</p>
                  <p className="text-xs text-muted-foreground">Celebrate reuse and mindful consumption</p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-muted/40 p-4 text-center">
                  <Sparkles className="mx-auto mb-2 h-6 w-6 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Spotlight stories</p>
                  <p className="text-xs text-muted-foreground">Highlight outstanding community impact</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.section variants={itemVariants}>
            <PostsFeed
              viewerId={viewerId}
              actorId={viewerId}
              allowCreate={!!viewerId}
              displayName={user?.firstName || user?.username || undefined}
              avatarUrl={user?.avatarUrl}
              isStaff={isStaff}
            />
          </motion.section>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}


