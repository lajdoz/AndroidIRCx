/**
 * Copyright (c) 2025-2026 Velimir Majstorov
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AppLayout } from '../../src/components/AppLayout';

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
    },
  }),
}));

jest.mock('../../src/i18n/localization', () => ({
  useT: () => (key: string) => key,
}));

jest.mock('../../src/components/HeaderBar', () => ({
  HeaderBar: ({ onConnectPress }: any) => {
    const { Text, TouchableOpacity } = require('react-native');
    return (
      <TouchableOpacity testID="header-connect" onPress={onConnectPress}>
        <Text>Header</Text>
      </TouchableOpacity>
    );
  },
}));

jest.mock('../../src/components/MessageList', () => ({
  MessageList: () => {
    const { Text } = require('react-native');
    return <Text>MessageList</Text>;
  },
}));

jest.mock('../../src/components/MessageInput', () => ({
  MessageInput: () => {
    const { Text } = require('react-native');
    return <Text>MessageInput</Text>;
  },
}));

jest.mock('../../src/components/UserList', () => ({
  UserList: () => {
    const { Text } = require('react-native');
    return <Text>UserList</Text>;
  },
}));

jest.mock('../../src/components/ChannelTabs', () => ({
  ChannelTabs: () => {
    const { Text } = require('react-native');
    return <Text>ChannelTabs</Text>;
  },
}));

describe('AppLayout', () => {
  const baseProps: any = {
    currentNetwork: null,
    currentChannel: '#test',
    messages: [],
    users: [],
    channels: [],
    onConnect: jest.fn(),
    onDisconnect: jest.fn(),
    onSendMessage: jest.fn(),
    onJoinChannel: jest.fn(),
    onPartChannel: jest.fn(),
    onSelectChannel: jest.fn(),
    onNickPress: jest.fn(),
    onUserListPress: jest.fn(),
    onHeaderAction: jest.fn(),
    onToggleSearch: jest.fn(),
    onToggleEncryption: jest.fn(),
    onClearSearch: jest.fn(),
    onPrefillMessage: jest.fn(),
    onQueryEncryptionToggle: jest.fn(),
    searchQuery: '',
    showSearch: false,
    encryptionEnabled: false,
    typingUsers: [],
    layoutConfig: {},
    visible: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the core IRC layout', async () => {
    const { findByText } = await render(<AppLayout {...baseProps} />);
    expect(await findByText('Header')).toBeTruthy();
    expect(await findByText('MessageList')).toBeTruthy();
    expect(await findByText('MessageInput')).toBeTruthy();
  });

  it('renders the channel and user panels', async () => {
    const { findByText } = await render(<AppLayout {...baseProps} />);
    expect(await findByText('ChannelTabs')).toBeTruthy();
    expect(await findByText('UserList')).toBeTruthy();
  });

  it('forwards the header connect action', async () => {
    const onConnect = jest.fn();
    const { getByTestId } = await render(
      <AppLayout {...baseProps} onConnect={onConnect} />,
    );
    await fireEvent.press(getByTestId('header-connect'));
    expect(onConnect).toHaveBeenCalled();
  });

  it('accepts a selected network without crashing', async () => {
    const { findByText } = await render(
      <AppLayout
        {...baseProps}
        currentNetwork={{ id: 'net-1', name: 'Test Network' }}
      />,
    );
    expect(await findByText('MessageList')).toBeTruthy();
  });

  it('respects hidden layout visibility', async () => {
    const { queryByText } = await render(
      <AppLayout {...baseProps} visible={false} />,
    );
    expect(queryByText('MessageList')).toBeNull();
  });
});
