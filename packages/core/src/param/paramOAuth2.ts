/**
 * @license
 * Copyright 2025 param
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import * as os from 'os';

import open from 'open';
import { EventEmitter } from 'events';
import type { Config } from '../config/config.js';
import { randomUUID } from 'node:crypto';
import { createDebugLogger } from '../utils/debugLogger.js';
import {
  SharedTokenManager,
} from './sharedTokenManager.js';

const debugLogger = createDebugLogger('PARAM_OAUTH');

// File System Configuration
const PARAM_DIR = '.param';

/**
 * PKCE (Proof Key for Code Exchange) utilities
 */
export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function generateCodeChallenge(codeVerifier: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(codeVerifier);
  return hash.digest('base64url');
}

export function generatePKCEPair(): {
  code_verifier: string;
  code_challenge: string;
} {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  return { code_verifier: codeVerifier, code_challenge: codeChallenge };
}

function objectToUrlEncoded(data: Record<string, string>): string {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');
}

export interface ErrorData {
  error: string;
  error_description: string;
}

export class CredentialsClearRequiredError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'CredentialsClearRequiredError';
  }
}

export interface paramCredentials {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expiry_date?: number;
  token_type?: string;
  resource_url?: string;
}

export interface DeviceAuthorizationData {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
}

export type DeviceAuthorizationResponse = DeviceAuthorizationData | ErrorData;

export function isDeviceAuthorizationSuccess(
  response: DeviceAuthorizationResponse,
): response is DeviceAuthorizationData {
  return 'device_code' in response;
}

export interface DeviceTokenData {
  access_token: string | null;
  refresh_token?: string | null;
  token_type: string;
  expires_in: number | null;
  scope?: string | null;
  endpoint?: string;
  resource_url?: string;
}

export interface DeviceTokenPendingData {
  status: 'pending';
  slowDown?: boolean;
}

export type DeviceTokenResponse =
  | DeviceTokenData
  | DeviceTokenPendingData
  | ErrorData;

export function isDeviceTokenSuccess(
  response: DeviceTokenResponse,
): response is DeviceTokenData {
  return (
    'access_token' in response &&
    response.access_token !== null &&
    typeof response.access_token === 'string'
  );
}

export function isDeviceTokenPending(
  response: DeviceTokenResponse,
): response is DeviceTokenPendingData {
  return (
    'status' in response &&
    (response as DeviceTokenPendingData).status === 'pending'
  );
}

export function isErrorResponse(
  response: unknown,
): response is ErrorData {
  return typeof response === 'object' && response !== null && 'error' in response;
}

export interface TokenRefreshData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  resource_url?: string;
}

export type TokenRefreshResponse = TokenRefreshData | ErrorData;

export interface IParamOAuth2Client {
  setCredentials(credentials: paramCredentials): void;
  getCredentials(): paramCredentials;
  getAccessToken(): Promise<{ token?: string }>;
  requestDeviceAuthorization(options: {
    scope: string;
    code_challenge: string;
    code_challenge_method: string;
  }): Promise<DeviceAuthorizationResponse>;
  pollDeviceToken(options: {
    device_code: string;
    code_verifier: string;
  }): Promise<DeviceTokenResponse>;
  refreshAccessToken(): Promise<TokenRefreshResponse>;
  getProviderConfig(): OAuthProviderConfig;
}

export interface OAuthProviderConfig {
  baseUrl: string;
  deviceCodeEndpoint: string;
  tokenEndpoint: string;
  clientId: string;
  scope: string;
  credentialFilename: string;
}

export const PARAM_OAUTH_CONFIG: OAuthProviderConfig = {
  baseUrl: 'https://chat.param.ai',
  deviceCodeEndpoint: 'https://chat.param.ai/api/v1/oauth2/device/code',
  tokenEndpoint: 'https://chat.param.ai/api/v1/oauth2/token',
  clientId: 'f0304373b74a44d2b584a3fb70ca9e56',
  scope: 'openid profile email model.completion',
  credentialFilename: 'oauth_creds.json',
};

export const ANTHROPIC_OAUTH_CONFIG: OAuthProviderConfig = {
  baseUrl: 'https://auth.anthropic.com',
  deviceCodeEndpoint: 'https://auth.anthropic.com/device/code',
  tokenEndpoint: 'https://auth.anthropic.com/token',
  clientId: 'param-agio-cli',
  scope: 'openid profile email',
  credentialFilename: 'anthropic_oauth_creds.json',
};

export const OPENAI_OAUTH_CONFIG: OAuthProviderConfig = {
  baseUrl: 'https://auth.openai.com',
  deviceCodeEndpoint: 'https://auth.openai.com/device/code',
  tokenEndpoint: 'https://auth.openai.com/token',
  clientId: 'param-agio-cli',
  scope: 'openid profile email',
  credentialFilename: 'openai_oauth_creds.json',
};

export class ParamOAuth2Client implements IParamOAuth2Client {
  private credentials: paramCredentials = {};
  private sharedManager: SharedTokenManager;
  private providerConfig: OAuthProviderConfig;

  constructor(config: OAuthProviderConfig = PARAM_OAUTH_CONFIG) {
    this.sharedManager = SharedTokenManager.getInstance();
    this.providerConfig = config;
  }

  setCredentials(credentials: paramCredentials): void {
    this.credentials = credentials;
  }

  getCredentials(): paramCredentials {
    return this.credentials;
  }

  getProviderConfig(): OAuthProviderConfig {
    return this.providerConfig;
  }

  async getAccessToken(): Promise<{ token?: string }> {
    try {
      const credentials = await this.sharedManager.getValidCredentials(this);
      return { token: credentials.access_token };
    } catch (error) {
      debugLogger.warn('Failed to get access token:', error);
      return { token: undefined };
    }
  }

  async requestDeviceAuthorization(options: {
    scope: string;
    code_challenge: string;
    code_challenge_method: string;
  }): Promise<DeviceAuthorizationResponse> {
    const bodyData = {
      client_id: this.providerConfig.clientId,
      scope: options.scope,
      code_challenge: options.code_challenge,
      code_challenge_method: options.code_challenge_method,
    };

    const response = await fetch(this.providerConfig.deviceCodeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        'x-request-id': randomUUID(),
      },
      body: objectToUrlEncoded(bodyData),
    });

    if (!response.ok) {
      throw new Error(`Device authorization failed: ${response.status}`);
    }

    return (await response.json()) as DeviceAuthorizationResponse;
  }

  async pollDeviceToken(options: {
    device_code: string;
    code_verifier: string;
  }): Promise<DeviceTokenResponse> {
    const bodyData = {
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      client_id: this.providerConfig.clientId,
      device_code: options.device_code,
      code_verifier: options.code_verifier,
    };

    const response = await fetch(this.providerConfig.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: objectToUrlEncoded(bodyData),
    });

    if (!response.ok) {
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (_e) {
        /* ignore parse error */
      }

      if (response.status === 400 && data?.error === 'authorization_pending') {
        return { status: 'pending' };
      }
      if (response.status === 429 && data?.error === 'slow_down') {
        return { status: 'pending', slowDown: true };
      }
      throw new Error(`Token poll failed: ${text}`);
    }

    return (await response.json()) as DeviceTokenResponse;
  }

  async refreshAccessToken(): Promise<TokenRefreshResponse> {
    if (!this.credentials.refresh_token) throw new Error('No refresh token');

    const bodyData = {
      grant_type: 'refresh_token',
      refresh_token: this.credentials.refresh_token,
      client_id: this.providerConfig.clientId,
    };

    const response = await fetch(this.providerConfig.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: objectToUrlEncoded(bodyData),
    });

    if (!response.ok) {
      if (response.status === 400) {
        await clearParamCredentials(this.providerConfig);
        throw new CredentialsClearRequiredError('Session expired');
      }
      throw new Error('Refresh failed');
    }

    return (await response.json()) as TokenRefreshResponse;
  }
}

export enum ParamOAuth2Event {
  AuthUri = 'auth-uri',
  AuthProgress = 'auth-progress',
  AuthCancel = 'auth-cancel',
}

export type AuthResult =
  | { success: true }
  | { success: false; reason: string; message?: string };

export const paramOAuth2Events = new EventEmitter();

export function showFallbackMessage(verificationUriComplete: string): void {
  process.stderr.write(`\nAuthorize at: ${verificationUriComplete}\n`);
}

export async function getParamOAuthClient(
  config: Config,
  options?: { requireCachedCredentials?: boolean; provider?: 'param' | 'anthropic' | 'openai' }
): Promise<ParamOAuth2Client> {
  const provider = options?.provider ?? 'param';
  let providerConfig = PARAM_OAUTH_CONFIG;
  if (provider === 'anthropic') providerConfig = ANTHROPIC_OAUTH_CONFIG;
  if (provider === 'openai') providerConfig = OPENAI_OAUTH_CONFIG;

  const client = new ParamOAuth2Client(providerConfig);
  try {
    const credentials = await SharedTokenManager.getInstance().getValidCredentials(client);
    client.setCredentials(credentials);
    return client;
  } catch (error) {
    if (options?.requireCachedCredentials) throw error;
    const result = await authWithParamDeviceFlow(client, config);
    if (!result.success) throw new Error(result.message || 'Auth failed');
    return client;
  }
}

async function authWithParamDeviceFlow(client: ParamOAuth2Client, config: Config): Promise<AuthResult> {
  let isCancelled = false;
  const cancelHandler = () => { isCancelled = true; };
  paramOAuth2Events.once(ParamOAuth2Event.AuthCancel, cancelHandler);

  try {
    const { code_verifier, code_challenge } = generatePKCEPair();
    const deviceAuthResp = await client.requestDeviceAuthorization({
      scope: client.getProviderConfig().scope,
      code_challenge,
      code_challenge_method: 'S256',
    });

    if (!isDeviceAuthorizationSuccess(deviceAuthResp)) throw new Error('Auth initiation failed');
    const deviceAuth = deviceAuthResp as DeviceAuthorizationData;

    paramOAuth2Events.emit(ParamOAuth2Event.AuthUri, deviceAuth);
    if (config.isBrowserLaunchSuppressed() || !config.isInteractive()) {
      showFallbackMessage(deviceAuth.verification_uri_complete);
    }
    if (!config.isBrowserLaunchSuppressed()) await open(deviceAuth.verification_uri_complete);

    const maxAttempts = Math.ceil(deviceAuth.expires_in / 2);
    for (let i = 0; i < maxAttempts; i++) {
      if (isCancelled) return { success: false, reason: 'cancelled' };
      const tokenResp = await client.pollDeviceToken({ device_code: deviceAuth.device_code, code_verifier });
      
      if (isDeviceTokenSuccess(tokenResp)) {
        const data = tokenResp as DeviceTokenData;
        const creds: paramCredentials = {
          access_token: data.access_token!,
          refresh_token: data.refresh_token || undefined,
          token_type: data.token_type,
          expiry_date: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
        };
        client.setCredentials(creds);
        await cacheParamCredentials(creds, client.getProviderConfig());
        return { success: true };
      }
      await new Promise(r => setTimeout(r, 2000));
    }
    return { success: false, reason: 'timeout' };
  } finally {
    paramOAuth2Events.off(ParamOAuth2Event.AuthCancel, cancelHandler);
  }
}

async function cacheParamCredentials(credentials: paramCredentials, config: OAuthProviderConfig) {
  const filePath = getParamCachedCredentialPath(config);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(credentials, null, 2));
}

export async function clearParamCredentials(config: OAuthProviderConfig = PARAM_OAUTH_CONFIG): Promise<void> {
  try {
    await fs.unlink(getParamCachedCredentialPath(config));
  } catch (_e) {
    /* ignore error if file doesn't exist */
  }
}

function getParamCachedCredentialPath(config: OAuthProviderConfig): string {
  return path.join(os.homedir(), PARAM_DIR, config.credentialFilename);
}
