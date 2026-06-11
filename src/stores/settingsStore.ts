import { create } from 'zustand';

import { initDatabase } from '@/db/client';
import { getSetting, setSetting } from '@/db/queries';

export type Plan = 'free' | 'lifetime';

type SettingsState = {
  onboardingCompleted: boolean;
  plan: Plan;
  freeQuotaUsed: number;
  selectedAlbumIds: string[] | null; // null = all photos
  loaded: boolean;
};

type SettingsActions = {
  load: () => Promise<void>;
  setOnboardingCompleted: (v: boolean) => Promise<void>;
  setPlan: (plan: Plan) => Promise<void>;
  incrementFreeQuota: () => Promise<number>;
  setSelectedAlbumIds: (ids: string[] | null) => Promise<void>;
};

const FREE_QUOTA_LIMIT = 5;

export const FREE_QUOTA = FREE_QUOTA_LIMIT;

export const useSettingsStore = create<SettingsState & SettingsActions>((set, get) => ({
  onboardingCompleted: false,
  plan: 'free',
  freeQuotaUsed: 0,
  selectedAlbumIds: null,
  loaded: false,

  load: async () => {
    await initDatabase();
    const [onb, plan, used, albums] = await Promise.all([
      getSetting('onboarding_completed'),
      getSetting('plan'),
      getSetting('free_quota_used'),
      getSetting('selected_album_ids'),
    ]);
    let albumIds: string[] | null = null;
    if (albums) {
      try {
        const parsed = JSON.parse(albums) as unknown;
        if (Array.isArray(parsed) && parsed.every((v) => typeof v === 'string')) {
          albumIds = parsed as string[];
        }
      } catch {
        albumIds = null;
      }
    }
    set({
      onboardingCompleted: onb === 'true',
      plan: (plan as Plan) ?? 'free',
      freeQuotaUsed: used ? parseInt(used, 10) : 0,
      selectedAlbumIds: albumIds,
      loaded: true,
    });
  },

  setOnboardingCompleted: async (v) => {
    await initDatabase();
    await setSetting('onboarding_completed', v ? 'true' : 'false');
    set({ onboardingCompleted: v });
  },

  setPlan: async (plan) => {
    await initDatabase();
    await setSetting('plan', plan);
    set({ plan });
  },

  incrementFreeQuota: async () => {
    await initDatabase();
    const next = get().freeQuotaUsed + 1;
    await setSetting('free_quota_used', String(next));
    set({ freeQuotaUsed: next });
    return next;
  },

  setSelectedAlbumIds: async (ids) => {
    await initDatabase();
    await setSetting('selected_album_ids', ids ? JSON.stringify(ids) : '');
    set({ selectedAlbumIds: ids });
  },
}));

export function isPaid(plan: Plan): boolean {
  return plan === 'lifetime';
}

export function isOverFreeQuota(used: number): boolean {
  return used >= FREE_QUOTA_LIMIT;
}
