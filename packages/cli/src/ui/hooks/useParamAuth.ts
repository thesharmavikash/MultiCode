/**
 * @license
 * Copyright 2025 param
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import {
  AuthType,
  paramOAuth2Events,
  ParamOAuth2Event,
  type DeviceAuthorizationData,
} from '@agent-param/param-core';

export interface paramAuthState {
  deviceAuth: DeviceAuthorizationData | null;
  authStatus:
    | 'idle'
    | 'polling'
    | 'success'
    | 'error'
    | 'timeout'
    | 'rate_limit';
  authMessage: string | null;
}

export const useParamAuth = (
  pendingAuthType: AuthType | undefined,
  isAuthenticating: boolean,
) => {
  const [paramAuthState, setparamAuthState] = useState<paramAuthState>({
    deviceAuth: null,
    authStatus: 'idle',
    authMessage: null,
  });

  const isParamAuth =
    pendingAuthType === AuthType.PARAM_OAUTH ||
    pendingAuthType === AuthType.ANTHROPIC_OAUTH ||
    pendingAuthType === AuthType.OPENAI_OAUTH;

  // Set up event listeners when authentication starts
  useEffect(() => {
    if (!isParamAuth || !isAuthenticating) {
      // Reset state when not authenticating or not param auth
      setparamAuthState({
        deviceAuth: null,
        authStatus: 'idle',
        authMessage: null,
      });
      return;
    }

    setparamAuthState((prev) => ({
      ...prev,
      authStatus: 'idle',
    }));

    // Set up event listeners
    const handleDeviceAuth = (deviceAuth: DeviceAuthorizationData) => {
      setparamAuthState((prev) => ({
        ...prev,
        deviceAuth: {
          verification_uri: deviceAuth.verification_uri,
          verification_uri_complete: deviceAuth.verification_uri_complete,
          user_code: deviceAuth.user_code,
          expires_in: deviceAuth.expires_in,
          device_code: deviceAuth.device_code,
        },
        authStatus: 'polling',
      }));
    };

    const handleAuthProgress = (
      status: 'success' | 'error' | 'polling' | 'timeout' | 'rate_limit',
      message?: string,
    ) => {
      setparamAuthState((prev) => ({
        ...prev,
        authStatus: status,
        authMessage: message || null,
      }));
    };

    // Add event listeners
    paramOAuth2Events.on(ParamOAuth2Event.AuthUri, handleDeviceAuth);
    paramOAuth2Events.on(ParamOAuth2Event.AuthProgress, handleAuthProgress);

    // Cleanup event listeners when component unmounts or auth finishes
    return () => {
      paramOAuth2Events.off(ParamOAuth2Event.AuthUri, handleDeviceAuth);
      paramOAuth2Events.off(ParamOAuth2Event.AuthProgress, handleAuthProgress);
    };
  }, [isParamAuth, isAuthenticating]);

  const cancelparamAuth = useCallback(() => {
    // Emit cancel event to stop polling
    paramOAuth2Events.emit(ParamOAuth2Event.AuthCancel);

    setparamAuthState({
      deviceAuth: null,
      authStatus: 'idle',
      authMessage: null,
    });
  }, []);

  return {
    paramAuthState,
    cancelparamAuth,
  };
};
