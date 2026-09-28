/*
 * Copyright (c) 2025-2026 Velimir Majstorov
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React from 'react';
import { SettingItem } from '../SettingItem';
import { useT } from '../../../i18n/localization';
import {
  SettingItem as SettingItemType,
  SettingIcon,
} from '../../../types/settings';

interface PrivacyLegalSectionProps {
  colors: {
    text: string;
    textSecondary: string;
    primary: string;
    surface: string;
    border: string;
    background: string;
  };
  styles: {
    settingItem: any;
    settingContent: any;
    settingTitleRow: any;
    settingTitle: any;
    settingDescription: any;
    disabledItem: any;
    disabledText: any;
    chevron: any;
  };
  settingIcons: Record<string, SettingIcon | undefined>;
  onShowDataPrivacy: () => void;
}

export const PrivacyLegalSection: React.FC<PrivacyLegalSectionProps> = ({
  colors,
  styles,
  settingIcons,
  onShowDataPrivacy,
}) => {
  const t = useT();
  const tags = 'screen:settings,file:PrivacyLegalSection.tsx,feature:settings';

  const sectionData: SettingItemType[] = [
    {
      id: 'my-data-privacy',
      title: t('My Data & Privacy', { _tags: tags }),
      description: t('Export or delete your data (GDPR/CCPA rights)', {
        _tags: tags,
      }),
      type: 'button',
      searchKeywords: [
        'data',
        'privacy',
        'export',
        'delete',
        'gdpr',
        'ccpa',
        'rights',
        'personal',
        'information',
      ],
      onPress: onShowDataPrivacy,
    },
  ];

  return (
    <>
      {sectionData.map(item => {
        const itemIcon =
          (typeof item.icon === 'object' ? item.icon : undefined) ||
          settingIcons[item.id];
        return (
          <SettingItem
            key={item.id}
            item={item}
            icon={itemIcon}
            colors={colors}
            styles={styles}
          />
        );
      })}
    </>
  );
};
