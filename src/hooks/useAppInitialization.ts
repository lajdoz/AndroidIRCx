/*
 * Copyright (c) 2025-2026 Velimir Majstorov
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useEffect } from 'react';
import { initializeAppCheck } from '@react-native-firebase/app-check';
import { getApp } from '@react-native-firebase/app';
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
 * Hook to handle app initialization including Firebase App Check,
 * privacy consent, application services, and error reporting
 */
export function useAppInitialization() {
  useEffect(() => {
    // Initialize Firebase App Check using modular API
    //
    // Play Integrity Requirements (for production):
    // 1. App must be uploaded/published to Google Play Console
    // 2. SHA-256 certificate fingerprint must be registered in Google Play Console
    //    (Go to: Play Console > Your App > Setup > App Integrity > App signing)
    // 3. Play Integrity API must be enabled in Google Play Console
    //    (Go to: Play Console > Your App > Setup > App Integrity)
    // 4. App must be signed with the correct signing key
    // 5. Package name must match: com.androidircx
    //
    // Debug mode uses debug provider (no Play Integrity required)
    const initAppCheck = async () => {
      try {
        debugLogger.debug(
          'appInitialization',
          'Initializing Firebase App Check',
        );
        const app = getApp();
        debugLogger.debug(
          'appInitialization',
          'Firebase app instance obtained',
        );

        const AppCheckModule = require('@react-native-firebase/app-check') as {
          ReactNativeFirebaseAppCheckProvider: new () => {
            configure: (config: unknown) => void;
            getToken: () => Promise<unknown>;
          };
        };
        const rnfbProvider =
          new AppCheckModule.ReactNativeFirebaseAppCheckProvider();
        debugLogger.debug(
          'appInitialization',
          'ReactNativeFirebaseAppCheckProvider created',
        );

        const providerConfig = {
          android: {
            provider: __DEV__ ? 'debug' : 'playIntegrity',
          },
          apple: {
            provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
          },
          web: {
            provider: 'reCaptchaV3',
            siteKey: 'none',
          },
        };

        debugLogger.debug(
          'appInitialization',
          'Configuring App Check provider',
          providerConfig,
        );
        rnfbProvider.configure(providerConfig);
        debugLogger.debug('appInitialization', 'App Check provider configured');

        debugLogger.debug('appInitialization', 'Initializing App Check');
        // v26 modular: initializeAppCheck returns synchronously (native provider
        // setup continues in the background), so it is not awaited.
        initializeAppCheck(app, {
          provider: rnfbProvider,
          isTokenAutoRefreshEnabled: true,
        } as any);
        debugLogger.debug(
          'appInitialization',
          'App Check initialized successfully',
        );
      } catch (error: any) {
        console.error('❌ App Check initialization failed:', error);
        console.error('Error details:', {
          message: error?.message,
          code: error?.code,
          stack: error?.stack,
        });
        // Don't throw - App Check is not critical for app functionality
        // Play Integrity might fail if:
        // 1. App not published/uploaded to Google Play Console
        // 2. SHA-256 certificate fingerprint not registered
        // 3. Play Integrity API not enabled in Google Play Console
        // 4. App not signed with the correct key
      }
    };
    initAppCheck();

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
