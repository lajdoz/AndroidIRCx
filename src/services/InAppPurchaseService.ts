/*
 * Copyright (c) 2025-2026 Velimir Majstorov
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './Logger';

export const PRODUCT_PRO_UNLIMITED = 'pro_unlimited';
export const PRODUCT_SUPPORTER_PRO = 'supporter_pro';
const PURCHASES_STORAGE_KEY = '@AndroidIRCX:purchases';
const PURCHASE_TOKENS_KEY = '@AndroidIRCX:purchaseTokens';

export interface ProductDetails {
  id: string; title: string; description: string; price: string;
  priceAmountMicros: number; priceCurrencyCode: string; features: string[];
}
export const PRODUCT_CATALOG: Record<string, Omit<ProductDetails, 'price' | 'priceAmountMicros' | 'priceCurrencyCode'>> = {
  [PRODUCT_PRO_UNLIMITED]: { id: PRODUCT_PRO_UNLIMITED, title: 'Pro: Unlimited Scripting', description: 'Unlimited scripting time with no advertising', features: ['Unlimited scripting time','No advertising','One-time purchase','Lifetime access'] },
  [PRODUCT_SUPPORTER_PRO]: { id: PRODUCT_SUPPORTER_PRO, title: 'Supporter Pro', description: 'All Pro features plus support open-source development', features: ['Unlimited scripting time','No advertising','Supporter badge','Support open-source development ❤️','One-time purchase','Lifetime access'] },
};
interface PurchaseState { [PRODUCT_PRO_UNLIMITED]: boolean; [PRODUCT_SUPPORTER_PRO]: boolean; }
type PurchaseListener = (state: PurchaseState) => void;

class InAppPurchaseService {
  private purchases: PurchaseState = { [PRODUCT_PRO_UNLIMITED]: false, [PRODUCT_SUPPORTER_PRO]: false };
  private listeners = new Set<PurchaseListener>();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    await this.loadPurchases();
    this.notifyListeners();
    this.initialized = true;
    logger.info('iap', 'InAppPurchaseService initialized');
  }
  private async loadPurchases() {
    try {
      const raw = await AsyncStorage.getItem(PURCHASES_STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as Partial<PurchaseState>;
      this.purchases = { [PRODUCT_PRO_UNLIMITED]: stored[PRODUCT_PRO_UNLIMITED] || false, [PRODUCT_SUPPORTER_PRO]: stored[PRODUCT_SUPPORTER_PRO] || false };
    } catch (error) { logger.error('iap', `Failed to load purchases: ${String(error)}`); }
  }
  private async savePurchases() {
    try { await AsyncStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(this.purchases)); }
    catch (error) { logger.error('iap', `Failed to save purchases: ${String(error)}`); }
  }
  hasPurchased(productId: string): boolean { return this.purchases[productId as keyof PurchaseState] || false; }
  hasNoAds(): boolean { return true; }
  hasUnlimitedScripting(): boolean {
    if (__DEV__) return true;
    return this.purchases[PRODUCT_PRO_UNLIMITED] || this.purchases[PRODUCT_SUPPORTER_PRO];
  }
  isSupporter(): boolean { if (__DEV__) return true; return this.purchases[PRODUCT_SUPPORTER_PRO]; }
  getHighestTier(): 'free' | 'pro_unlimited' | 'supporter_pro' {
    if (__DEV__) return 'supporter_pro';
    if (this.purchases[PRODUCT_SUPPORTER_PRO]) return 'supporter_pro';
    if (this.purchases[PRODUCT_PRO_UNLIMITED]) return 'pro_unlimited';
    return 'free';
  }
  async grantPurchase(productId: string) {
    if (!(productId in this.purchases)) { logger.error('iap', `Invalid product ID: ${productId}`); return; }
    this.purchases[productId as keyof PurchaseState] = true; await this.savePurchases(); this.notifyListeners();
  }
  async revokePurchase(productId: string) {
    if (!(productId in this.purchases)) { logger.error('iap', `Invalid product ID: ${productId}`); return; }
    this.purchases[productId as keyof PurchaseState] = false; await this.savePurchases(); this.notifyListeners();
  }
  async resetPurchases() { this.purchases = { [PRODUCT_PRO_UNLIMITED]: false, [PRODUCT_SUPPORTER_PRO]: false }; await this.savePurchases(); this.notifyListeners(); }
  getPurchases(): PurchaseState { return { ...this.purchases }; }
  addListener(listener: PurchaseListener): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  async processPurchase(productId: string, purchaseToken: string): Promise<boolean> {
    try {
      if (!(productId in this.purchases)) { logger.error('iap', `Invalid product ID: ${productId}`); return false; }
      this.purchases[productId as keyof PurchaseState] = true; await this.savePurchases(); await this.storePurchaseToken(productId, purchaseToken); this.notifyListeners(); return true;
    } catch (error) { logger.error('iap', `Failed to process purchase: ${String(error)}`); return false; }
  }
  private async storePurchaseToken(productId: string, token: string) {
    try { const raw = await AsyncStorage.getItem(PURCHASE_TOKENS_KEY); const tokens = raw ? JSON.parse(raw) : {}; tokens[productId] = token; await AsyncStorage.setItem(PURCHASE_TOKENS_KEY, JSON.stringify(tokens)); }
    catch (error) { logger.error('iap', `Failed to store purchase token: ${String(error)}`); }
  }
  async getPurchaseToken(productId: string): Promise<string | null> {
    try { const raw = await AsyncStorage.getItem(PURCHASE_TOKENS_KEY); if (!raw) return null; const tokens = JSON.parse(raw); return tokens[productId] || null; }
    catch (error) { logger.error('iap', `Failed to get purchase token: ${String(error)}`); return null; }
  }
  private notifyListeners() { const state = this.getPurchases(); this.listeners.forEach(listener => { try { listener(state); } catch (error) { logger.error('iap', `Listener error: ${String(error)}`); } }); }
}
export const inAppPurchaseService = new InAppPurchaseService();
