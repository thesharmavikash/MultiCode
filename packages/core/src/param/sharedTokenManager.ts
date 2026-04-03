/**
 * @license
 * Copyright 2025 param
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'node:path';
import { promises as fs } from 'node:fs';
import * as os from 'os';
import { randomUUID } from 'node:crypto';

import type { IParamOAuth2Client, OAuthProviderConfig } from './paramOAuth2.js';
import {
  type paramCredentials,
  type TokenRefreshData,
  isErrorResponse,
  PARAM_OAUTH_CONFIG,
} from './paramOAuth2.js';

// Token and Cache Configuration
const TOKEN_REFRESH_BUFFER_MS = 30 * 1000; // 30 seconds
const CACHE_CHECK_INTERVAL_MS = 5000; // 5 seconds cache check interval

// Lock acquisition configuration
interface LockConfig {
  maxAttempts: number;
  attemptInterval: number;
  maxInterval: number;
}

const DEFAULT_LOCK_CONFIG: LockConfig = {
  maxAttempts: 20,
  attemptInterval: 100,
  maxInterval: 2000,
};

/**
 * Token manager error types
 */
export enum TokenError {
  REFRESH_FAILED = 'REFRESH_FAILED',
  NO_REFRESH_TOKEN = 'NO_REFRESH_TOKEN',
  LOCK_TIMEOUT = 'LOCK_TIMEOUT',
  FILE_ACCESS_ERROR = 'FILE_ACCESS_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export class TokenManagerError extends Error {
  constructor(
    public type: TokenError,
    message: string,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = 'TokenManagerError';
  }
}

interface MemoryCache {
  credentials: paramCredentials | null;
  fileModTime: number;
  lastCheck: number;
}

function validateCredentials(data: unknown): paramCredentials {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid credentials format');
  }
  const creds = data as Partial<paramCredentials>;
  if (!creds.access_token || !creds.refresh_token || !creds.token_type || typeof creds.expiry_date !== 'number') {
    throw new Error('Invalid credentials: missing required fields');
  }
  return creds as paramCredentials;
}

/**
 * Manages OAuth tokens across multiple processes with multi-provider support.
 */
export class SharedTokenManager {
  private static instance: SharedTokenManager | null = null;
  private providerCaches: Map<string, MemoryCache> = new Map();
  private refreshPromises: Map<string, Promise<paramCredentials>> = new Map();
  private checkPromises: Map<string, Promise<void>> = new Map();
  private cleanupHandlersRegistered = false;
  private cleanupFunction: (() => void) | null = null;
  private lockConfig: LockConfig = DEFAULT_LOCK_CONFIG;

  private constructor() {
    this.registerCleanupHandlers();
  }

  static getInstance(): SharedTokenManager {
    if (!SharedTokenManager.instance) {
      SharedTokenManager.instance = new SharedTokenManager();
    }
    return SharedTokenManager.instance;
  }

  private registerCleanupHandlers(): void {
    if (this.cleanupHandlersRegistered) return;
    this.cleanupFunction = () => {
      // In multi-provider mode, we would need to track all active locks.
      // For simplicity, we assume process exit cleans up.
    };
    process.on('exit', this.cleanupFunction);
    this.cleanupHandlersRegistered = true;
  }

  private getCache(providerKey: string): MemoryCache {
    if (!this.providerCaches.has(providerKey)) {
      this.providerCaches.set(providerKey, {
        credentials: null,
        fileModTime: 0,
        lastCheck: 0,
      });
    }
    return this.providerCaches.get(providerKey)!;
  }

  async getValidCredentials(
    paramClient: IParamOAuth2Client,
    forceRefresh = false,
  ): Promise<paramCredentials> {
    const providerConfig = (paramClient as any).getProviderConfig?.() || PARAM_OAUTH_CONFIG;
    const providerKey = providerConfig.credentialFilename;
    const cache = this.getCache(providerKey);

    try {
      await this.checkAndReloadIfNeeded(paramClient, providerConfig);

      if (!forceRefresh && cache.credentials && this.isTokenValid(cache.credentials)) {
        return cache.credentials;
      }

      let currentRefreshPromise = this.refreshPromises.get(providerKey);
      if (!currentRefreshPromise) {
        currentRefreshPromise = this.performTokenRefresh(paramClient, providerConfig, forceRefresh);
        this.refreshPromises.set(providerKey, currentRefreshPromise);
      }

      try {
        return await currentRefreshPromise;
      } finally {
        if (this.refreshPromises.get(providerKey) === currentRefreshPromise) {
          this.refreshPromises.delete(providerKey);
        }
      }
    } catch (error) {
      if (error instanceof TokenManagerError) throw error;
      throw new TokenManagerError(TokenError.REFRESH_FAILED, `Failed to get credentials: ${error}`, error);
    }
  }

  private async checkAndReloadIfNeeded(
    paramClient: IParamOAuth2Client | undefined,
    providerConfig: OAuthProviderConfig,
  ): Promise<void> {
    const providerKey = providerConfig.credentialFilename;
    const cache = this.getCache(providerKey);
    if (this.checkPromises.has(providerKey)) {
      await this.checkPromises.get(providerKey);
      return;
    }
    const now = Date.now();
    if (now - cache.lastCheck < CACHE_CHECK_INTERVAL_MS) return;

    const checkPromise = this.performFileCheck(paramClient, providerConfig, now);
    this.checkPromises.set(providerKey, checkPromise);
    try {
      await checkPromise;
    } finally {
      this.checkPromises.delete(providerKey);
    }
  }

  private async performFileCheck(
    paramClient: IParamOAuth2Client | undefined,
    providerConfig: OAuthProviderConfig,
    checkTime: number,
  ): Promise<void> {
    const providerKey = providerConfig.credentialFilename;
    const cache = this.getCache(providerKey);
    cache.lastCheck = checkTime;
    try {
      const filePath = this.getCredentialFilePath(providerConfig);
      const stats = await fs.stat(filePath);
      if (stats.mtimeMs > cache.fileModTime) {
        await this.reloadCredentialsFromFile(paramClient, providerConfig);
        cache.fileModTime = stats.mtimeMs;
      }
    } catch (e) {
      cache.fileModTime = 0;
    }
  }

  private async reloadCredentialsFromFile(
    paramClient: IParamOAuth2Client | undefined,
    providerConfig: OAuthProviderConfig,
  ): Promise<void> {
    const cache = this.getCache(providerConfig.credentialFilename);
    try {
      const filePath = this.getCredentialFilePath(providerConfig);
      const content = await fs.readFile(filePath, 'utf-8');
      const credentials = validateCredentials(JSON.parse(content));
      cache.credentials = credentials;
      if (paramClient) paramClient.setCredentials(credentials);
    } catch (e) {
      cache.credentials = null;
    }
  }

  private async performTokenRefresh(
    paramClient: IParamOAuth2Client,
    providerConfig: OAuthProviderConfig,
    forceRefresh = false,
  ): Promise<paramCredentials> {
    const providerKey = providerConfig.credentialFilename;
    const cache = this.getCache(providerKey);
    const lockPath = this.getLockFilePath(providerConfig);
    try {
      const currentCredentials = paramClient.getCredentials();
      if (!currentCredentials.refresh_token) {
        throw new TokenManagerError(TokenError.NO_REFRESH_TOKEN, 'No refresh token');
      }
      await this.acquireLock(lockPath);
      await this.forceFileCheck(paramClient, providerConfig);
      if (!forceRefresh && cache.credentials && this.isTokenValid(cache.credentials)) {
        return cache.credentials;
      }
      const response = await paramClient.refreshAccessToken();
      if (!response || isErrorResponse(response)) {
        throw new TokenManagerError(TokenError.REFRESH_FAILED, 'Refresh failed');
      }
      const tokenData = response as TokenRefreshData;
      const credentials: paramCredentials = {
        access_token: tokenData.access_token,
        token_type: tokenData.token_type,
        refresh_token: tokenData.refresh_token || currentCredentials.refresh_token,
        resource_url: tokenData.resource_url,
        expiry_date: Date.now() + tokenData.expires_in * 1000,
      };
      cache.credentials = credentials;
      paramClient.setCredentials(credentials);
      await this.saveCredentialsToFile(credentials, providerConfig);
      return credentials;
    } finally {
      await this.releaseLock(lockPath);
    }
  }

  private async forceFileCheck(
    paramClient: IParamOAuth2Client | undefined,
    providerConfig: OAuthProviderConfig,
  ): Promise<void> {
    const cache = this.getCache(providerConfig.credentialFilename);
    try {
      const filePath = this.getCredentialFilePath(providerConfig);
      const stats = await fs.stat(filePath);
      if (stats.mtimeMs > cache.fileModTime) {
        await this.reloadCredentialsFromFile(paramClient, providerConfig);
        cache.fileModTime = stats.mtimeMs;
      }
    } catch (e) {}
  }

  private async saveCredentialsToFile(
    credentials: paramCredentials,
    providerConfig: OAuthProviderConfig,
  ): Promise<void> {
    const filePath = this.getCredentialFilePath(providerConfig);
    const dirPath = path.dirname(filePath);
    const tempPath = `${filePath}.tmp.${randomUUID()}`;
    await fs.mkdir(dirPath, { recursive: true, mode: 0o700 });
    await fs.writeFile(tempPath, JSON.stringify(credentials, null, 2), { mode: 0o600 });
    await fs.rename(tempPath, filePath);
    const stats = await fs.stat(filePath);
    this.getCache(providerConfig.credentialFilename).fileModTime = stats.mtimeMs;
  }

  private isTokenValid(credentials: paramCredentials): boolean {
    if (!credentials.expiry_date || !credentials.access_token) return false;
    return Date.now() < credentials.expiry_date - TOKEN_REFRESH_BUFFER_MS;
  }

  private getCredentialFilePath(providerConfig: OAuthProviderConfig): string {
    return path.join(os.homedir(), '.param', providerConfig.credentialFilename);
  }

  private getLockFilePath(providerConfig: OAuthProviderConfig): string {
    return path.join(os.homedir(), '.param', providerConfig.credentialFilename + '.lock');
  }

  private async acquireLock(lockPath: string): Promise<void> {
    const { maxAttempts, attemptInterval, maxInterval } = this.lockConfig;
    let currentInterval = attemptInterval;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await fs.writeFile(lockPath, randomUUID(), { flag: 'wx' });
        return;
      } catch (e: any) {
        if (e.code === 'EEXIST') {
          await new Promise(r => setTimeout(r, currentInterval));
          currentInterval = Math.min(currentInterval * 1.5, maxInterval);
        } else throw e;
      }
    }
    throw new TokenManagerError(TokenError.LOCK_TIMEOUT, 'Lock timeout');
  }

  private async releaseLock(lockPath: string): Promise<void> {
    try { await fs.unlink(lockPath); } catch (e) {}
  }

  clearCache(): void {
    this.providerCaches.clear();
    this.refreshPromises.clear();
    this.checkPromises.clear();
  }

  getCurrentCredentials(providerConfig: OAuthProviderConfig = PARAM_OAUTH_CONFIG): paramCredentials | null {
    return this.getCache(providerConfig.credentialFilename).credentials;
  }

  /**
   * Cleans up resources and unregisters handlers.
   */
  cleanup(): void {
    if (this.cleanupFunction) {
      process.off('exit', this.cleanupFunction);
      this.cleanupFunction = null;
    }
    this.cleanupHandlersRegistered = false;
    this.clearCache();
  }

  /**
   * Checks if a refresh is currently in progress for a provider.
   */
  isRefreshInProgress(
    providerConfig: OAuthProviderConfig = PARAM_OAUTH_CONFIG,
  ): boolean {
    return this.refreshPromises.has(providerConfig.credentialFilename);
  }

  /**
   * Sets the lock configuration for token refresh.
   */
  setLockConfig(config: Partial<LockConfig>): void {
    this.lockConfig = { ...DEFAULT_LOCK_CONFIG, ...config };
  }

  /**
   * Returns debug information about the manager state.
   */
  getDebugInfo() {
    const cache = this.getCache(PARAM_OAUTH_CONFIG.credentialFilename);
    const now = Date.now();
    return {
      providerCachesSize: this.providerCaches.size,
      refreshPromisesSize: this.refreshPromises.size,
      checkPromisesSize: this.checkPromises.size,
      lockConfig: this.lockConfig,
      hasCredentials: !!cache.credentials,
      credentialsExpired: cache.credentials ? !this.isTokenValid(cache.credentials) : false,
      cacheAge: cache.lastCheck ? now - cache.lastCheck : 0,
    };
  }
}
