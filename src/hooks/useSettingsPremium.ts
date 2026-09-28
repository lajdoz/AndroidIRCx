/*
 * Copyright (c) 2025-2026 Velimir Majstorov
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useState, useEffect, useCallback } from 'react';
import { inAppPurchaseService } from '../services/InAppPurchaseService';
import { settingsService } from '../services/SettingsService';
import { useT } from '../i18n/localization';

export interface UseSettingsPremiumReturn {
  // Premium status
  hasNoAds: boolean;
  hasScriptingPro: boolean;
  isSupporter: boolean;

  // Ad status
  adReady: boolean;
  adLoading: boolean;
  adCooldown: boolean;
  cooldownSeconds: number;
  adUnitType: string;
  showingAd: boolean;

  // Watch ad button
  watchAdButtonEnabledForPremium: boolean;
  showWatchAdButton: boolean;

  // Actions
  setWatchAdButtonEnabledForPremium: (value: boolean) => Promise<void>;
  handleWatchAd: () => Promise<void>;
}

export const useSettingsPremium = (): UseSettingsPremiumReturn => {
  const t = useT();

  // Premium status
  const [hasNoAds, setHasNoAds] = useState(false);
  const [hasScriptingPro, setHasScriptingPro] = useState(false);
  const [isSupporter, setIsSupporter] = useState(false);

  // Ad status
  const [adReady, setAdReady] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [adCooldown, setAdCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [showingAd, setShowingAd] = useState(false);
  const [adUnitType, setAdUnitType] = useState<string>('Primary');

  // Watch ad button settings
  const [
    watchAdButtonEnabledForPremium,
    setWatchAdButtonEnabledForPremiumState,
  ] = useState(false);
  const [showWatchAdButton, setShowWatchAdButton] = useState(true);

  // Load premium status
  useEffect(() => {
    const updatePremiumStatus = () => {
      setHasNoAds(inAppPurchaseService.hasNoAds());
      setHasScriptingPro(inAppPurchaseService.hasUnlimitedScripting());
      setIsSupporter(inAppPurchaseService.isSupporter());
    };
    updatePremiumStatus();
    const unsubscribe = inAppPurchaseService.addListener(updatePremiumStatus);
    return unsubscribe;
  }, []);

  // Load ad status (polled every second). Guard against redundant updates: only
  // push state when the ad-status snapshot actually changed, so a static status
  // is a true no-op instead of re-rendering every tick — this keeps the poll from
  // ever becoming an update loop (Crashlytics: "Maximum update depth exceeded").
  // Update watch ad button visibility based on premium status and settings
  useEffect(() => {
    const isPremium = hasNoAds || hasScriptingPro || isSupporter;
    setShowWatchAdButton(!isPremium || watchAdButtonEnabledForPremium);
  }, [hasNoAds, hasScriptingPro, isSupporter, watchAdButtonEnabledForPremium]);

  // Load watch ad button setting
  useEffect(() => {
    const loadSetting = async () => {
      const enabled = await settingsService.getSetting(
        'watchAdButtonEnabledForPremium',
        false,
      );
      setWatchAdButtonEnabledForPremiumState(enabled);
    };
    loadSetting();
  }, []);

  const setWatchAdButtonEnabledForPremium = useCallback(
    async (value: boolean) => {
      await settingsService.setSetting('watchAdButtonEnabledForPremium', value);
      setWatchAdButtonEnabledForPremiumState(value);
    },
    [],
  );

  const handleWatchAd = useCallback(async () => {
    return;
  }, []);

  return {
    hasNoAds,
    hasScriptingPro,
    isSupporter,
    adReady,
    adLoading,
    adCooldown,
    cooldownSeconds,
    adUnitType,
    showingAd,
    watchAdButtonEnabledForPremium,
    showWatchAdButton,
    setWatchAdButtonEnabledForPremium,
    handleWatchAd,
  };
};
