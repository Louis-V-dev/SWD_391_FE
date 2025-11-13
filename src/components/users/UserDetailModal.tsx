'use client';

import React, { useMemo, useState } from 'react';
import { Mail, Phone, Calendar, ShieldCheck, AlertTriangle, CheckCircle2, TrendingUp, Activity, UserPlus, UserMinus, ArrowUpRight, X } from 'lucide-react';
import type { User } from '@/types/domains/users';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface UserDetailModalProps {
  user: User;
  onClose: () => void;
  onVerify?: (userId: string) => Promise<void>;
  onBanClick?: (user: User) => void;
  onUnban?: (userId: string) => Promise<void>;
  onAdjustPointsClick?: (user: User) => void;
  onActivate?: (userId: string) => Promise<void>;
  onDeactivate?: (userId: string) => Promise<void>;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = ({
  label,
  value,
  icon
}) => (
  <div className="flex items-start gap-3 py-2">
    <div className="mt-0.5 text-muted-foreground">{icon}</div>
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || '—'}</p>
    </div>
  </div>
);

export function UserDetailModal({
  user,
  onClose,
  onVerify,
  onBanClick,
  onUnban,
  onAdjustPointsClick,
  onActivate,
  onDeactivate
}: UserDetailModalProps) {
  const [actionLoading, setActionLoading] = useState(false);

  const fullName = user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username;

  const statusBadges = useMemo(
    () =>
      [
        user.isVerified && { label: 'Verified', variant: 'success' as const },
        user.isActive && { label: 'Active', variant: 'success' as const },
        user.isBanned && { label: 'Banned', variant: 'error' as const },
        !user.isActive && !user.isBanned && { label: 'Inactive', variant: 'warning' as const }
      ].filter(Boolean),
    [user.isVerified, user.isActive, user.isBanned]
  );

  const handleAction = async (action: () => Promise<void> | void) => {
    try {
      setActionLoading(true);
      await action();
    } finally {
      setActionLoading(false);
    }
  };

  const handleBan = async () => {
    if (!onBanClick) return;
    onBanClick(user);
  };

  const handleAdjustPoints = async () => {
    if (!onAdjustPointsClick) return;
    onAdjustPointsClick(user);
  };

  const formattedCreatedAt = user.createdAt ? new Date(user.createdAt).toLocaleString() : '—';
  const formattedUpdatedAt = user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '—';
  const formattedLastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
      <div className="w-full max-w-4xl rounded-2xl bg-background shadow-2xl ring-1 ring-border">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-500 text-2xl font-semibold text-white">
              {(user.username || '?')[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-foreground">{fullName}</h2>
                <Badge variant="outline">{user.role}</Badge>
                {statusBadges.map((badge) =>
                  badge ? (
                    <Badge key={badge.label} variant={badge.variant}>
                      {badge.label}
                    </Badge>
                  ) : null
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">@{user.username}</p>
              {user.bio && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{user.bio}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="grid gap-8 px-6 py-6 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-xl border border-border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contact</h3>
              <div className="mt-3 divide-y divide-border">
                <DetailRow label="Email" value={user.email} icon={<Mail className="h-4 w-4" />} />
                <DetailRow label="Phone" value={user.phone || 'Not provided'} icon={<Phone className="h-4 w-4" />} />
                <DetailRow
                  label="Date of Birth"
                  value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  icon={<Calendar className="h-4 w-4" />}
                />
              </div>
            </section>

            <section className="rounded-xl border border-border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Account Activity
              </h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-background/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    Sustainability Score
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {user.sustainabilityScore?.toFixed(1) ?? '0.0'}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    Sustainability Points
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {user.sustainabilityPoints?.toLocaleString() ?? '0'}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Activity className="h-4 w-4 text-purple-500" />
                    Trust Score
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {user.trustScore?.toFixed(1) ?? '0.0'}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <UserPlus className="h-4 w-4 text-amber-500" />
                    Followers
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {user.followersCount?.toLocaleString() ?? '0'}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <UserMinus className="h-4 w-4 text-rose-500" />
                    Following
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {user.followingCount?.toLocaleString() ?? '0'}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <ArrowUpRight className="h-4 w-4 text-sky-500" />
                    Items Listed
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {user.itemsCount?.toLocaleString() ?? '0'}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Account Timeline
              </h3>
              <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="text-xs uppercase tracking-wide">Joined</p>
                  <p className="font-medium text-foreground">{formattedCreatedAt}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide">Last Updated</p>
                  <p className="font-medium text-foreground">{formattedUpdatedAt}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide">Last Login</p>
                  <p className="font-medium text-foreground">{formattedLastLogin}</p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Admin Actions</h3>
              <div className="mt-4 space-y-3">
                {onAdjustPointsClick && (
                  <Button
                    onClick={handleAdjustPoints}
                    disabled={actionLoading}
                    className="w-full justify-start gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Adjust Points
                  </Button>
                )}

                {onVerify && !user.isVerified && (
                  <Button
                    onClick={() => handleAction(() => onVerify(user.userId))}
                    disabled={actionLoading}
                    className="w-full justify-start gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Verify User
                  </Button>
                )}

                {onBanClick && !user.isBanned && (
                  <Button
                    onClick={handleBan}
                    disabled={actionLoading}
                    variant="destructive"
                    className="w-full justify-start gap-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Ban User
                  </Button>
                )}

                {onUnban && user.isBanned && (
                  <Button
                    onClick={() => handleAction(() => onUnban(user.userId))}
                    disabled={actionLoading}
                    className="w-full justify-start gap-2"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Unban User
                  </Button>
                )}

                {onDeactivate && user.isActive && (
                  <Button
                    onClick={() => handleAction(() => onDeactivate(user.userId))}
                    disabled={actionLoading}
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <UserMinus className="h-4 w-4" />
                    Deactivate User
                  </Button>
                )}

                {onActivate && !user.isActive && !user.isBanned && (
                  <Button
                    onClick={() => handleAction(() => onActivate(user.userId))}
                    disabled={actionLoading}
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Activate User
                  </Button>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}


