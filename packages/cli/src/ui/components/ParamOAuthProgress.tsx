/**
 * @license
 * Copyright 2025 param
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import Link from 'ink-link';
import { theme } from '../semantic-colors.js';
import { useKeypress } from '../hooks/useKeypress.js';
import type { DeviceAuthorizationData } from '@agent-param/param-core';
import { t } from '../../i18n/index.js';

export interface ParamOAuthProgressProps {
  deviceAuth?: DeviceAuthorizationData;
  authStatus: 'idle' | 'polling' | 'success' | 'error' | 'timeout' | 'rate_limit';
  authMessage: string | null;
  onTimeout: () => void;
  onCancel: () => void;
}

/**
 * Component to display the progress of param OAuth device flow
 */
export function ParamOAuthProgress({
  deviceAuth,
  authStatus,
  authMessage,
  onTimeout,
  onCancel,
}: ParamOAuthProgressProps): React.JSX.Element {
  const [dots, setDots] = useState('');

  useKeypress(
    (key) => {
      if (key.name === 'escape' || (key.ctrl && key.name === 'c')) {
        onCancel();
      }
    },
    { isActive: true },
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (authStatus === 'timeout') {
      onTimeout();
    }
  }, [authStatus, onTimeout]);

  const renderStatus = () => {
    switch (authStatus) {
      case 'idle':
        return <Text>{t('Starting authentication...')}</Text>;
      case 'polling':
        return (
          <Box flexDirection="column">
            <Text color={theme.text.primary}>
              {t('Please authorize Param in your browser.')}
            </Text>
            <Box marginTop={1} paddingX={2} borderStyle="round" borderColor={theme.border.default}>
              <Text bold color={theme.text.accent}>
                {t('User Code')}: {deviceAuth?.user_code}
              </Text>
            </Box>
            <Box marginTop={1}>
              <Text>{t('Visit')}: </Text>
              <Link url={deviceAuth?.verification_uri_complete || ''}>
                <Text color={theme.text.link} underline>
                  {deviceAuth?.verification_uri_complete}
                </Text>
              </Link>
            </Box>
            <Box marginTop={1}>
              <Text>
                <Spinner type="dots" /> {t('Waiting for authorization')}{dots}
              </Text>
            </Box>
          </Box>
        );
      case 'success':
        return <Text color={theme.status.success}>✅ {t('Successfully authenticated!')}</Text>;
      case 'error':
      case 'rate_limit':
        return <Text color={theme.status.error}>❌ {authMessage || t('Authentication failed.')}</Text>;
      case 'timeout':
        return <Text color={theme.status.error}>⏳ {t('Authentication timed out.')}</Text>;
      default:
        return null;
    }
  };

  return (
    <Box
      borderStyle="single"
      borderColor={theme.border.default}
      flexDirection="column"
      padding={1}
      width="100%"
    >
      <Box marginBottom={1}>
        <Text bold color={theme.text.primary}>
          {t('Provider Authentication')}
        </Text>
      </Box>
      {renderStatus()}
      <Box marginTop={1}>
        <Text color={theme.text.secondary}>
          {t('Press ESC or CTRL+C to cancel')}
        </Text>
      </Box>
    </Box>
  );
}
