/**
 * Copyright (c) 2025-2026 Velimir Majstorov
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { useAppInitialization } from '../../src/hooks/useAppInitialization';

jest.mock('../../src/services/AdRewardService', () => ({
  adRewardService: { initialize: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('../../src/services/PrivacyRelayService', () => ({
  privacyRelayService: { initialize: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('../../src/services/ErrorReportingService', () => ({
  errorReportingService: {
    initialize: jest.fn().mockResolvedValue(undefined),
    reportError: jest.fn(),
  },
}));

jest.mock('../../src/services/SettingsService', () => ({
  settingsService: {
    getFirstRunCompleted: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn().mockResolvedValue(undefined),
}));

describe('useAppInitialization', () => {
  beforeEach(() => jest.clearAllMocks());

  it('initializes without throwing', async () => {
    const { result } = renderHook(() => useAppInitialization());
    await waitFor(() => expect(result.current).toBeDefined());
  });

  it('initializes scripting time and privacy relay services', async () => {
    renderHook(() => useAppInitialization());
    const { adRewardService } = require('../../src/services/AdRewardService');
    const { privacyRelayService } = require('../../src/services/PrivacyRelayService');

    await waitFor(() => {
      expect(adRewardService.initialize).toHaveBeenCalled();
      expect(privacyRelayService.initialize).toHaveBeenCalled();
    });
  });

  it('installs the global error handler', async () => {
    const original = (global as any).ErrorUtils;
    const handler = jest.fn();
    (global as any).ErrorUtils = {
      getGlobalHandler: jest.fn(() => jest.fn()),
      setGlobalHandler: jest.fn((fn: any) => handler.mockImplementation(fn)),
    };

    renderHook(() => useAppInitialization());
    await waitFor(() =>
      expect((global as any).ErrorUtils.setGlobalHandler).toHaveBeenCalled(),
    );

    (global as any).ErrorUtils = original;
  });

  it('reports initialization failures without throwing', async () => {
    const { privacyRelayService } = require('../../src/services/PrivacyRelayService');
    privacyRelayService.initialize.mockRejectedValueOnce(new Error('init failed'));
    renderHook(() => useAppInitialization());
    await waitFor(() => expect(privacyRelayService.initialize).toHaveBeenCalled());
  });

  it('restores the global error handler on unmount', async () => {
    const original = (global as any).ErrorUtils;
    const originalHandler = jest.fn();
    const setGlobalHandler = jest.fn();
    (global as any).ErrorUtils = {
      getGlobalHandler: jest.fn(() => originalHandler),
      setGlobalHandler,
    };

    const { unmount } = renderHook(() => useAppInitialization());
    await waitFor(() => expect(setGlobalHandler).toHaveBeenCalled());
    unmount();

    expect(setGlobalHandler).toHaveBeenCalledWith(originalHandler);
    (global as any).ErrorUtils = original;
  });
});
