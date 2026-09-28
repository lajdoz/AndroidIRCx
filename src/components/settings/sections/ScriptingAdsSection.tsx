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

interface ScriptingAdsSectionProps {
  colors: {
    text: string;
    textSecondary: string;
    primary: string;
    onPrimary?: string;
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
  onShowScripting: () => void;
  onShowScriptingHelp: () => void;
}

export const ScriptingAdsSection: React.FC<ScriptingAdsSectionProps> = ({
  colors,
  styles,
  settingIcons,
  onShowScripting,
  onShowScriptingHelp,
}) => {
  const t = useT();
  const tags = 'screen:settings,file:ScriptingAdsSection.tsx,feature:settings';

  const sectionData: SettingItemType[] = [
    {
      id: 'advanced-scripts',
      title: t('Scripts (Scripting Time & No-Ads)', { _tags: tags }),
      description: t(
        'Manage IRC scripts and automation. Scripting time is also ad-free time.',
        { _tags: tags },
      ),
      type: 'button',
      searchKeywords: [
        'scripts',
        'scripting',
        'automation',
        'time',
        'no-ads',
        'ad-free',
        'premium',
        'manage',
      ],
      onPress: onShowScripting,
    },
    {
      id: 'advanced-scripts-help',
      title: t('Scripting Help', { _tags: tags }),
      description: t('Learn how to write and use scripts', { _tags: tags }),
      type: 'button',
      searchKeywords: [
        'scripting',
        'help',
        'learn',
        'write',
        'use',
        'scripts',
        'guide',
        'tutorial',
      ],
      onPress: onShowScriptingHelp,
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
