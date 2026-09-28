/*
 * Copyright (c) 2025-2026 Velimir Majstorov
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './Logger';

const STORAGE_KEY = '@AndroidIRCX:consentShown';
const CONSENT_STATUS_KEY = '@AndroidIRCX:consentStatus';
const MANUAL_CONSENT_KEY = '@AndroidIRCX:manualConsent';
const PRIVACY_POLICY_URL = 'https://androidircx.com/privacy';

type ConsentStatus = 'UNKNOWN' | 'NOT_REQUIRED' | 'OBTAINED';
type ConsentStatusListener = (status: ConsentStatus) => void;

class ConsentService {
  private consentStatus: ConsentStatus = 'UNKNOWN';
  private listeners = new Set<ConsentStatusListener>();
  private initialized = false;
  private manuallyAccepted = false;

  async initialize(_debugMode = false): Promise<void> {
    if (this.initialized) return;
    await this.loadSavedConsentStatus();
    this.initialized = true;
    this.notifyListeners();
  }

  private async loadSavedConsentStatus(): Promise<void> {
    try {
      const [savedStatus, manualConsent] = await Promise.all([
        AsyncStorage.getItem(CONSENT_STATUS_KEY),
        AsyncStorage.getItem(MANUAL_CONSENT_KEY),
      ]);
      if (manualConsent === 'true') {
        this.manuallyAccepted = true;
        this.consentStatus = 'NOT_REQUIRED';
      } else if (savedStatus === 'NOT_REQUIRED' || savedStatus === 'OBTAINED') {
        this.consentStatus = savedStatus;
      }
    } catch (error) {
      logger.error('consent', `Failed to load saved consent: ${String(error)}`);
    }
  }

  private async saveConsentStatus(): Promise<void> {
    await AsyncStorage.setItem(CONSENT_STATUS_KEY, this.consentStatus);
    if (this.manuallyAccepted) await AsyncStorage.setItem(MANUAL_CONSENT_KEY, 'true');
  }

  async acceptConsentManually(): Promise<void> {
    this.manuallyAccepted = true;
    this.consentStatus = 'NOT_REQUIRED';
    await AsyncStorage.setItem(MANUAL_CONSENT_KEY, 'true');
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    await this.saveConsentStatus();
    this.notifyListeners();
  }

  async showConsentFormIfRequired(): Promise<boolean> { return false; }
  async showConsentForm(): Promise<void> { throw new Error('MANUAL_CONSENT_ONLY'); }
  async showPrivacyOptionsForm(): Promise<void> { throw new Error('MANUAL_CONSENT_ONLY'); }
  isPrivacyOptionsRequired(): boolean { return false; }

  async resetConsent(): Promise<void> {
    this.consentStatus = 'UNKNOWN';
    this.manuallyAccepted = false;
    await AsyncStorage.multiRemove([STORAGE_KEY, CONSENT_STATUS_KEY, MANUAL_CONSENT_KEY]);
    this.notifyListeners();
  }

  getConsentStatus(): ConsentStatus { return this.consentStatus; }
  canShowPersonalizedAds(): boolean { return false; }
  isConsentRequired(): boolean { return false; }
  getPrivacyPolicyUrl(): string { return PRIVACY_POLICY_URL; }
  getConsentStatusText(): string {
    if (this.consentStatus === 'OBTAINED' || this.consentStatus === 'NOT_REQUIRED') return 'Accepted';
    return 'Not required';
  }
  isManuallyAccepted(): boolean { return this.manuallyAccepted; }

  addListener(listener: ConsentStatusListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try { listener(this.consentStatus); } catch (error) { logger.error('consent', `Listener error: ${String(error)}`); }
    });
  }

  async getConsentInfo() {
    return { status: this.consentStatus, isConsentFormAvailable: false, privacyOptionsRequirementStatus: 'NOT_REQUIRED' as const };
  }
}

export const consentService = new ConsentService();
export type { ConsentStatus };
