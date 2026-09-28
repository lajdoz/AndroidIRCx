/*
 * Copyright (c) 2025-2026 Velimir Majstorov
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { useState, useEffect } from 'react';
import { inAppPurchaseService } from '../services/InAppPurchaseService';

export interface UseSettingsPremiumReturn {
  hasNoAds: boolean;
  hasScriptingPro: boolean;
  isSupporter: boolean;
}

export const useSettingsPremium = (): UseSettingsPremiumReturn => {
  const [hasNoAds, setHasNoAds] = useState(false);
  const [hasScriptingPro, setHasScriptingPro] = useState(false);
  const [isSupporter, setIsSupporter] = useState(false);

  useEffect(() => {
    const updatePremiumStatus = () => {
      setHasNoAds(inAppPurchaseService.hasNoAds());
      setHasScriptingPro(inAppPurchaseService.hasUnlimitedScripting());
      setIsSupporter(inAppPurchaseService.isSupporter());
    };
    updatePremiumStatus();
    return inAppPurchaseService.addListener(updatePremiumStatus);
  }, []);

  return { hasNoAds, hasScriptingPro, isSupporter };
};
