/*
 * Copyright (c) 2025-2026 Velimir Majstorov
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './Logger';
import { inAppPurchaseService } from './InAppPurchaseService';
import { APP_VERSION } from '../config/appVersion';

const STORAGE_KEY = '@AndroidIRCX:scriptingTime';
const INITIAL_BONUS_KEY = '@AndroidIRCX:initialBonusGranted';
const VERSION_BONUS_KEY = '@AndroidIRCX:versionBonusApplied';
const VERSION_BONUS_MINUTES = 60;
const HOUR_IN_MS = 60 * 60 * 1000;
interface ScriptingTimeData { remainingMs: number; lastUpdated: number; }
type TimeChangeListener = (remainingMs: number) => void;

class AdRewardService {
  private remainingMs = 0;
  private lastUpdated = Date.now();
  private usageInterval: NodeJS.Timeout | null = null;
  private listeners = new Set<TimeChangeListener>();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    await this.load();
    await this.applyVersionBonus();
    if (this.remainingMs <= 0) { this.remainingMs = 30 * 60 * 1000; this.lastUpdated = Date.now(); await this.save(); }
    this.initialized = true;
    this.notifyListeners();
  }

  private async load() {
    try {
      const [raw, initialBonusGranted] = await Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(INITIAL_BONUS_KEY)]);
      if (raw) {
        const data: ScriptingTimeData = JSON.parse(raw);
        this.remainingMs = Math.max(0, data.remainingMs);
        this.lastUpdated = data.lastUpdated || Date.now();
      }
      if (!initialBonusGranted) {
        this.remainingMs += HOUR_IN_MS;
        this.lastUpdated = Date.now();
        await AsyncStorage.setItem(INITIAL_BONUS_KEY, 'true');
        await this.save();
      }
    } catch (error) {
      logger.error('scripting-time', `Failed to load scripting time: ${String(error)}`);
      this.remainingMs = HOUR_IN_MS;
      this.lastUpdated = Date.now();
    }
  }

  private async applyVersionBonus() {
    try {
      const lastVersion = await AsyncStorage.getItem(VERSION_BONUS_KEY);
      if (lastVersion !== APP_VERSION) {
        this.remainingMs += VERSION_BONUS_MINUTES * 60 * 1000;
        this.lastUpdated = Date.now();
        await AsyncStorage.setItem(VERSION_BONUS_KEY, APP_VERSION);
        await this.save();
      }
    } catch (error) { logger.error('scripting-time', `Failed to apply version bonus: ${String(error)}`); }
  }

  private async save() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ remainingMs: this.remainingMs, lastUpdated: this.lastUpdated } satisfies ScriptingTimeData));
    } catch (error) { logger.error('scripting-time', `Failed to save scripting time: ${String(error)}`); }
  }

  getRemainingTime(): number { return inAppPurchaseService.hasUnlimitedScripting() ? 999 * HOUR_IN_MS : this.remainingMs; }
  getRemainingTimeFormatted(): string { return inAppPurchaseService.hasUnlimitedScripting() ? '∞ Unlimited' : this.formatTime(this.remainingMs); }
  hasAvailableTime(): boolean { return inAppPurchaseService.hasUnlimitedScripting() || this.remainingMs > 0; }

  private formatTime(ms: number): string {
    const hours = Math.floor(ms / HOUR_IN_MS);
    const minutes = Math.floor((ms % HOUR_IN_MS) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  startUsageTracking() {
    if (this.usageInterval) return;
    if (inAppPurchaseService.hasUnlimitedScripting()) { this.usageInterval = setInterval(() => {}, 1000); this.notifyListeners(); return; }
    this.lastUpdated = Date.now();
    this.usageInterval = setInterval(() => {
      if (inAppPurchaseService.hasUnlimitedScripting()) { this.stopUsageTracking(); return; }
      if (this.remainingMs <= 0) { this.stopUsageTracking(); return; }
      const now = Date.now();
      this.remainingMs = Math.max(0, this.remainingMs - (now - this.lastUpdated));
      this.lastUpdated = now;
      if (Math.floor(this.remainingMs / 1000) % 10 === 0) this.save().catch(() => undefined);
      this.notifyListeners();
    }, 1000);
    this.notifyListeners();
  }

  stopUsageTracking() {
    if (!this.usageInterval) return;
    clearInterval(this.usageInterval);
    this.usageInterval = null;
    this.save().catch(() => undefined);
    this.notifyListeners();
  }

  isTracking(): boolean { return this.usageInterval !== null; }
  addListener(listener: TimeChangeListener): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  private notifyListeners() { this.listeners.forEach(listener => { try { listener(this.remainingMs); } catch (error) { logger.error('scripting-time', `Listener error: ${String(error)}`); } }); }
  async grantTime(hours: number) { this.remainingMs += hours * HOUR_IN_MS; this.lastUpdated = Date.now(); await this.save(); this.notifyListeners(); }
  async resetTime() { this.remainingMs = 0; this.lastUpdated = Date.now(); await this.save(); this.notifyListeners(); }
  async simulateFreshInstall() { await AsyncStorage.multiRemove([STORAGE_KEY, INITIAL_BONUS_KEY, VERSION_BONUS_KEY]); this.remainingMs = 0; this.lastUpdated = Date.now(); await this.load(); this.notifyListeners(); }

  isAdReady(): boolean { return false; }
  isAdLoading(): boolean { return false; }
  isInCooldown(): boolean { return false; }
  getCooldownRemaining(): number { return 0; }
  getAdStatus() { return { ready: false, loading: false, cooldown: false, cooldownSeconds: 0, retryCount: 0, currentAdUnit: '', adUnitType: 'Disabled' }; }
  async manualLoadAd() { return { success: false, messageKey: 'Ads are disabled', messageParams: {} }; }
  async showRewardedAd() { return false; }
}

export const adRewardService = new AdRewardService();
