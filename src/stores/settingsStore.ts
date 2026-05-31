import { create } from 'zustand';

import { getSetting, setSetting } from '@/db/queries';

export type Plan = 'free' | 'lifetime';

type SettingsState = {
  onboardingCompleted: boolean;
  plan: Plan;
  freeQuotaUsed: number;
  loaded: boolean;
};

type SettingsActions = {
  load: () => Promise<void>;
  setOnboardingCompleted: (v: boolean) => Promise<void>;
  setPlan: (plan: Plan) => Promise<void>;
  incrementFreeQuota: () => Promise<number>;
};

const FREE_QUOTA_LIMIT = 5;

export const FREE_QUOTA = FREE_QUOTA_LIMIT;

export const useSettingsStore = create<SettingsState & SettingsActions>((set, get) => ({
  onboardingCompleted: false,
  plan: 'free',
  freeQuotaUsed: 0,
  loaded: false,

  load: async () => {
    const [onb, plan, used] = await Promise.all([
      getSetting('onboarding_completed'),
      getSetting('plan'),
      getSetting('free_quota_used'),
    ]);
    set({
      onboardingCompleted: onb === 'true',
      plan: (plan as Plan) ?? 'free',
      freeQuotaUsed: used ? parseInt(used, 10) : 0,
      loaded: true,
    });
  },

  setOnboardingCompleted: async (v) => {
    await setSetting('onboarding_completed', v ? 'true' : 'false');
    set({ onboardingCompleted: v });
  },

  setPlan: async (plan) => {
    await setSetting('plan', plan);
    set({ plan });
  },

  incrementFreeQuota: async () => {
    const next = get().freeQuotaUsed + 1;
    await setSetting('free_quota_used', String(next));
    set({ freeQuotaUsed: next });
    return next;
  },
}));

export function isPaid(plan: Plan): boolean {
  return plan === 'lifetime';
}

export function isOverFreeQuota(used: number): boolean {
  return used >= FREE_QUOTA_LIMIT;
}
