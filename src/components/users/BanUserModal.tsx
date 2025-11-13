'use client';

import React, { useState, useEffect } from 'react';
import type { User } from '@/types/domains/users';
import { Button } from '@/components/ui/Button';

interface BanUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: { userId: string; reason: string }) => Promise<void>;
}

export function BanUserModal({ user, isOpen, onClose, onSubmit }: BanUserModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !user) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!reason.trim()) {
      setError('Please provide a reason for banning this user.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        userId: user.userId,
        reason: reason.trim()
      });
      onClose();
    } catch (submitError: any) {
      setError(submitError?.message || 'Failed to ban user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-background shadow-2xl ring-1 ring-border">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Ban User</h2>
            <p className="text-sm text-muted-foreground">User: {user.fullName || user.username}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            type="button"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="text-sm font-medium text-foreground">Reason for Ban</label>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                disabled={submitting}
                placeholder="Describe the violation or reason"
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
              />
            </div>
            <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Banning a user prevents them from logging in or interacting with the platform until they are unbanned.
            </div>
            {error && (
              <div className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={submitting}>
              {submitting ? 'Banning...' : 'Ban User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}



