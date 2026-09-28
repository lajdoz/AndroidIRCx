/*
 * Copyright (c) 2025-2026 Velimir Majstorov
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useEffect } from 'react';
import RNBootSplash from 'react-native-bootsplash';
import { consentService } from '../services/ConsentService';
import { adRewardService } from '../services/AdRewardService';
import { inAppPurchaseService } from '../services/InAppPurchaseService';
import { errorReportingService } from '../services/ErrorReportingService';
import { soundService } from '../services/SoundService';
import { privacyRelayService } from '../services/PrivacyRelayService';
import { debugLogger } from '../services/DebugLogger';

// ErrorUtils is available globally in React Native
declare const ErrorUtils: {
  getGlobalHandler: () => ((error: Error, isFatal?: boolean) => void) | null;
  setGlobalHandler: (
    handler: (error: Error, isFatal?: boolean) => void,
  ) => void;
};

/**
 * Hook to handle app initialization, privacy consent, application services, and error reporting
 */
export function useAppInitialization() {
  useEffect(() => {
    const initPrivacyRelay = async () => {
      try {
        await privacyRelayService.initialize();
        debugLogger.debug(
          'appInitialization',
          'PrivacyRelayService initialized successfully',
        );
      } catch (error) {
        console.error('❌ Failed to initialize PrivacyRelayService:', error);
      }
    };
    initPrivacyRelay();

    // Initialize local privacy consent and application services.
    const initServices = async () => {
      try {
        await consentService.initialize(__DEV__);
        await adRewardService.initialize();
        await inAppPurchaseService.initialize();
        await soundService.initialize();
      } catch (error) {
        console.error('❌ Failed to initialize application services:', error);
      }
    };
    initServices();

    errorReportingService.initialize();
    if (typeof ErrorUtils !== 'undefined') {
      const originalHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        console.error('Global error handler:', error, 'isFatal:', isFatal);
        console.error('Error stack:', error.stack);
        errorReportingService.report(error, {
          fatal: isFatal !== false,
          source: 'globalErrorHandler',
        });
        // Try to hide bootsplash even on fatal error
        if (isFatal) {
          RNBootSplash.hide({ fade: false }).catch(() => {});
        }
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });

      return () => {
        if (typeof ErrorUtils !== 'undefined' && originalHandler) {
          ErrorUtils.setGlobalHandler(originalHandler);
        }
      };
    }
  }, []);
}
