/**
 * Copyright (c) 2025-2026 Velimir Majstorov
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Alert } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { FirstRunSetupScreen } from '../../src/screens/FirstRunSetupScreen';

jest.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      background: '#000',
      surface: '#111',
      border: '#333',
      text: '#fff',
      textSecondary: '#bbb',
      primary: '#4caf50',
      buttonPrimary: '#4caf50',
      buttonPrimaryText: '#fff',
      buttonSecondary: '#222',
      buttonSecondaryText: '#fff',
      success: '#4caf50',
      warning: '#ff9800',
      inputBackground: '#222',
    },
  }),
}));

jest.mock('react-native-vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return ({ name }: any) => <Text>{name}</Text>;
});

jest.mock('../../src/i18n/localization', () => ({
  useT: () => (key: string, params?: Record<string, unknown>) => {
    if (!params) {
      return key;
    }
    return Object.entries(params).reduce(
      (result, [paramKey, value]) =>
        result.replace(`{${paramKey}}`, String(value)),
      key,
    );
  },
}));

jest.mock('../../src/services/SettingsService', () => ({
  settingsService: {
    getNetwork: jest.fn(),
    updateNetwork: jest.fn(),
    createDefaultNetwork: jest.fn(),
    addNetwork: jest.fn(),
    setFirstRunCompleted: jest.fn(),
  },
}));

jest.mock('../../src/services/IdentityProfilesService', () => ({
  identityProfilesService: {
    add: jest.fn(),
  },
}));

const { settingsService } = require('../../src/services/SettingsService');
const {
  identityProfilesService,
} = require('../../src/services/IdentityProfilesService');

describe('FirstRunSetupScreen', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    identityProfilesService.add.mockResolvedValue({ id: 'profile-1' });
    settingsService.getNetwork.mockResolvedValue({
      id: 'DBase',
      name: 'DBase',
      servers: [
        { id: 'srv1', hostname: 'irc.dbase.in.rs', port: 6697, ssl: true },
      ],
      nick: 'OldNick',
      ident: 'oldident',
      realname: 'Old Realname',
      altNick: 'OldAlt',
    });
    settingsService.updateNetwork.mockResolvedValue(undefined);
    settingsService.createDefaultNetwork.mockResolvedValue(undefined);
    settingsService.addNetwork.mockResolvedValue(undefined);
    settingsService.setFirstRunCompleted.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    consoleErrorSpy.mockRestore();
  });

  it('renders welcome step and advances to identity', async () => {
    const { findByText } = await render(
      <FirstRunSetupScreen onComplete={jest.fn()} onSkip={jest.fn()} />,
    );

    expect(await findByText('Welcome to AndroidIRCX')).toBeTruthy();
    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('Accept Privacy Terms & Continue'));

    await waitFor(async () => {
      expect(consentService.showConsentFormIfRequired).toHaveBeenCalled();
    });

    await fireEvent.press(await findByText('Next'));
    expect(await findByText('Set Up Your Identity')).toBeTruthy();
  });

  it('shows validation when required identity fields are missing', async () => {
    const { findByDisplayValue, findByText } = await render(
      <FirstRunSetupScreen onComplete={jest.fn()} onSkip={jest.fn()} />,
    );

    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('Accept Privacy Terms & Continue'));
    await fireEvent.press(await findByText('Next'));

    await fireEvent.changeText(await findByDisplayValue('AndroidIRCX'), '');
    await fireEvent.press(await findByText('Next'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Required',
      'Please enter a nickname',
    );
  });

  it('shows validation when real name is missing', async () => {
    const { findByDisplayValue, findByText } = await render(
      <FirstRunSetupScreen onComplete={jest.fn()} onSkip={jest.fn()} />,
    );

    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('Accept Privacy Terms & Continue'));
    await fireEvent.press(await findByText('Next'));

    await fireEvent.changeText(
      await findByDisplayValue('AndroidIRCX User'),
      '   ',
    );
    await fireEvent.press(await findByText('Next'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Required',
      'Please enter your real name',
    );
  });

  it('completes recommended setup and connects now', async () => {
    const onComplete = jest.fn();
    const { findByDisplayValue, findByText } = await render(
      <FirstRunSetupScreen onComplete={onComplete} onSkip={jest.fn()} />,
    );

    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('Accept Privacy Terms & Continue'));
    await fireEvent.press(await findByText('Next'));

    await fireEvent.changeText(
      await findByDisplayValue('AndroidIRCX'),
      'Majstor',
    );
    await fireEvent.changeText(
      await findByDisplayValue('AndroidIRCX User'),
      'Velimir',
    );
    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('DBase (Optional Default)'));
    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('Complete Setup'));

    await waitFor(async () => {
      expect(identityProfilesService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Majstor Profile',
          nick: 'Majstor',
          realname: 'Velimir',
        }),
      );
      expect(settingsService.updateNetwork).toHaveBeenCalledWith(
        'DBase',
        expect.objectContaining({
          nick: 'Majstor',
          realname: 'Velimir',
          identityProfileId: 'profile-1',
        }),
      );
    });

    expect(await findByText("You're all set!")).toBeTruthy();
    await fireEvent.press(await findByText('Connect Now'));

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'DBase',
      }),
    );
  });

  it('completes custom network setup and supports connect later', async () => {
    const onSkip = jest.fn();
    const { findByDisplayValue, findByPlaceholderText, findByText } =
      await render(
        <FirstRunSetupScreen onComplete={jest.fn()} onSkip={onSkip} />,
      );

    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('Accept Privacy Terms & Continue'));
    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('Next'));

    await fireEvent.press(await findByText('Custom Server'));
    await fireEvent.changeText(await findByDisplayValue('6697'), '7000');
    await fireEvent.changeText(await findByPlaceholderText('libera'), 'libera');
    await fireEvent.changeText(
      await findByPlaceholderText('irc.libera.chat'),
      'irc.libera.chat',
    );
    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('#DBase'));
    await fireEvent.press(await findByText('Complete Setup'));

    await waitFor(async () => {
      expect(settingsService.addNetwork).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'libera',
          servers: [
            expect.objectContaining({
              hostname: 'irc.libera.chat',
              port: 7000,
            }),
          ],
          autoJoinChannels: ['#DBase'],
        }),
      );
    });

    await fireEvent.press(await findByText('Connect Later'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('shows validation when custom network fields are missing', async () => {
    const { findByText } = await render(
      <FirstRunSetupScreen onComplete={jest.fn()} onSkip={jest.fn()} />,
    );

    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('Accept Privacy Terms & Continue'));
    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('Custom Server'));
    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('Complete Setup'));

    await waitFor(async () => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Required',
        'Please enter network name and server',
      );
    });
  });

  it('allows finishing setup without selecting DBase or a custom server', async () => {
    const onComplete = jest.fn();
    const { findByText } = await render(
      <FirstRunSetupScreen onComplete={onComplete} onSkip={jest.fn()} />,
    );

    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('Accept Privacy Terms & Continue'));
    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('Next'));

    await fireEvent.press(await findByText('Choose Another Server Later'));
    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('Complete Setup'));

    await waitFor(async () => {
      expect(settingsService.setFirstRunCompleted).toHaveBeenCalledWith(true);
    });

    expect(await findByText('Open Choose Network')).toBeTruthy();
    await fireEvent.press(await findByText('Open Choose Network'));
    expect(onComplete).toHaveBeenCalledWith(null);
  });

  it('falls back to default channels and creates DBase when missing', async () => {
    settingsService.getNetwork
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'DBase',
        name: 'DBase',
        servers: [
          { id: 'srv1', hostname: 'irc.dbase.in.rs', port: 6697, ssl: true },
        ],
      });

    const onComplete = jest.fn();
    const { findByDisplayValue, findByText } = await render(
      <FirstRunSetupScreen onComplete={onComplete} onSkip={jest.fn()} />,
    );

    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('Accept Privacy Terms & Continue'));
    await fireEvent.press(await findByText('Next'));
    await fireEvent.changeText(
      await findByDisplayValue('AndroidIRCX'),
      'FallbackNick',
    );
    await fireEvent.press(await findByText('Next'));
    await fireEvent.press(await findByText('DBase (Optional Default)'));
    await fireEvent.press(await findByText('Next'));
    await fireEvent.changeText(
      await findByDisplayValue('#DBase, #AndroidIRCX'),
      'not-a-channel, also-bad',
    );
    await fireEvent.press(await findByText('Complete Setup'));

    await waitFor(async () => {
      expect(settingsService.createDefaultNetwork).toHaveBeenCalled();
      expect(settingsService.updateNetwork).toHaveBeenCalledWith(
        'DBase',
        expect.objectContaining({
          autoJoinChannels: ['#DBase', '#AndroidIRCX'],
        }),
      );
    });

    await fireEvent.press(await findByText('Connect Now'));
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'DBase' }),
    );
  });

  it('allows navigating back and skipping from welcome', async () => {
    const onSkip = jest.fn();
    const { findByText } = await render(
      <FirstRunSetupScreen onComplete={jest.fn()} onSkip={onSkip} />,
    );

    await fireEvent.press(await findByText('Skip'));
    expect(onSkip).toHaveBeenCalledTimes(1);

    await fireEvent.press(await findByText('Next'));
    expect(await findByText('Privacy & Ads')).toBeTruthy();
    await fireEvent.press(await findByText('Back'));
    expect(await findByText('Welcome to AndroidIRCX')).toBeTruthy();
  });
