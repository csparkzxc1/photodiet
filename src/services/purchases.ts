import { Platform } from 'react-native';
import Purchases, {
  type PurchasesPackage,
  type CustomerInfo,
} from 'react-native-purchases';

import { useSettingsStore, type Plan } from '@/stores/settingsStore';
import { createLogger } from '@/utils/log';

const log = createLogger('purchases');

const ENTITLEMENT_ID = 'pro';
const OFFERING_ID = 'default';

export const PRODUCTS = {
  lifetime: 'photodiet_lifetime',
  monthly: 'photodiet_monthly',
} as const;

let configured = false;

function apiKey(): string | null {
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? null;
  }
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? null;
  }
  return null;
}

export function configurePurchases(): boolean {
  if (configured) return true;
  const key = apiKey();
  if (!key) {
    log.info('no API key — skipping purchases configuration');
    return false;
  }
  try {
    Purchases.configure({ apiKey: key });
    configured = true;
    log.info('configured');
    return true;
  } catch (err) {
    log.error('configure failed', err);
    return false;
  }
}

function planFromCustomerInfo(info: CustomerInfo): Plan {
  const ent = info.entitlements.active[ENTITLEMENT_ID];
  if (!ent) return 'free';
  const product = ent.productIdentifier;
  if (product === PRODUCTS.lifetime) return 'lifetime';
  if (product === PRODUCTS.monthly) return 'monthly';
  return 'free';
}

export async function refreshPlanFromStore(): Promise<Plan> {
  if (!configurePurchases()) return 'free';
  try {
    const info = await Purchases.getCustomerInfo();
    const plan = planFromCustomerInfo(info);
    await useSettingsStore.getState().setPlan(plan);
    return plan;
  } catch (err) {
    log.warn('refreshPlan failed', err);
    return 'free';
  }
}

export type Offering = {
  lifetime: PurchasesPackage | null;
  monthly: PurchasesPackage | null;
};

export async function getOffering(): Promise<Offering | null> {
  if (!configurePurchases()) return null;
  try {
    const offerings = await Purchases.getOfferings();
    const offering = offerings.all[OFFERING_ID] ?? offerings.current;
    if (!offering) return null;
    const packages = offering.availablePackages;
    return {
      lifetime: packages.find((p) => p.product.identifier === PRODUCTS.lifetime) ?? null,
      monthly: packages.find((p) => p.product.identifier === PRODUCTS.monthly) ?? null,
    };
  } catch (err) {
    log.warn('getOfferings failed', err);
    return null;
  }
}

export async function purchase(pkg: PurchasesPackage): Promise<Plan> {
  if (!configurePurchases()) throw new Error('결제 시스템을 사용할 수 없어요.');
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  const plan = planFromCustomerInfo(customerInfo);
  await useSettingsStore.getState().setPlan(plan);
  return plan;
}

export async function restorePurchases(): Promise<Plan> {
  if (!configurePurchases()) return 'free';
  const info = await Purchases.restorePurchases();
  const plan = planFromCustomerInfo(info);
  await useSettingsStore.getState().setPlan(plan);
  return plan;
}
