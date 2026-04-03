/**
 * @license
 * Copyright 2025 param Team
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthType } from '@agent-param/param-core';
import type { AuthMethod } from '@agentclientprotocol/sdk';

export function buildAuthMethods(): AuthMethod[] {
  return [
    {
      id: AuthType.USE_OPENAI,
      name: 'Use OpenAI API key',
      description: 'Requires setting the `OPENAI_API_KEY` environment variable',
      _meta: {
        type: 'terminal',
        args: ['--auth-type=openai'],
      },
    },
    {
      id: AuthType.PARAM_OAUTH,
      name: 'param OAuth',
      description:
        'OAuth authentication for param models with free daily requests',
      _meta: {
        type: 'terminal',
        args: ['--auth-type=param-oauth'],
      },
    },
  ];
}

export function filterAuthMethodsById(
  authMethods: AuthMethod[],
  authMethodId: string,
): AuthMethod[] {
  return authMethods.filter((method) => method.id === authMethodId);
}

export function pickAuthMethodsForDetails(details?: string): AuthMethod[] {
  const authMethods = buildAuthMethods();
  if (!details) {
    return authMethods;
  }
  if (details.includes('param-oauth') || details.includes('param OAuth')) {
    const narrowed = filterAuthMethodsById(authMethods, AuthType.PARAM_OAUTH);
    return narrowed.length ? narrowed : authMethods;
  }
  return authMethods;
}
