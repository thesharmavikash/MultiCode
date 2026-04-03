/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { AsyncLocalStorage } from 'node:async_hooks';
import { getProjectHash, sanitizeCwd } from '../utils/paths.js';

export const PARAM_DIR = '.param';
export const GOOGLE_ACCOUNTS_FILENAME = 'google_accounts.json';
export const OAUTH_FILE = 'oauth_creds.json';
export const SKILL_PROVIDER_CONFIG_DIRS = ['.param', '.qwen', '.gemini', '.claude', '.openai', '.agents'];
const TMP_DIR_NAME = 'tmp';
const BIN_DIR_NAME = 'bin';
const PROJECT_DIR_NAME = 'projects';
const IDE_DIR_NAME = 'ide';
const DEBUG_DIR_NAME = 'debug';
const ARENA_DIR_NAME = 'arena';

export class Storage {
  private readonly targetDir: string;

  /**
   * Custom runtime output base directory set via settings.
   * When null, falls back to getGlobalParamDir().
   */
  private static runtimeBaseDir: string | null = null;
  private static readonly runtimeBaseDirContext = new AsyncLocalStorage<
    string | null
  >();

  constructor(targetDir: string) {
    this.targetDir = targetDir;
  }

  private static resolveRuntimeBaseDir(
    dir: string | null | undefined,
    cwd?: string,
  ): string | null {
    if (!dir) {
      return null;
    }

    let resolved = dir;
    if (
      resolved === '~' ||
      resolved.startsWith('~/') ||
      resolved.startsWith('~\\')
    ) {
      const relativeSegments =
        resolved === '~'
          ? []
          : resolved
              .slice(2)
              .split(/[/\\]+/)
              .filter(Boolean);
      resolved = path.join(os.homedir(), ...relativeSegments);
    }
    if (!path.isAbsolute(resolved)) {
      resolved = cwd ? path.resolve(cwd, resolved) : path.resolve(resolved);
    }
    return resolved;
  }

  /**
   * Sets the custom runtime output base directory.
   * Handles tilde (~) expansion and resolves relative paths to absolute.
   * Pass null/undefined/empty string to reset to default (getGlobalParamDir()).
   * @param dir - The directory path, or null/undefined to reset
   * @param cwd - Base directory for resolving relative paths (defaults to process.cwd()).
   *              Pass the project root so that relative values like ".param" resolve
   *              per-project, enabling a single global config to work across all projects.
   */
  static setRuntimeBaseDir(dir: string | null | undefined, cwd?: string): void {
    Storage.runtimeBaseDir = Storage.resolveRuntimeBaseDir(dir, cwd);
  }

  /**
   * Runs function execution in an async context with a specific runtime output dir.
   * This is used to isolate runtime output paths between concurrent sessions.
   */
  static runWithRuntimeBaseDir<T>(
    dir: string | null | undefined,
    cwd: string | undefined,
    fn: () => T,
  ): T {
    const resolved = Storage.resolveRuntimeBaseDir(dir, cwd);
    return Storage.runtimeBaseDirContext.run(resolved, fn);
  }

  /**
   * Returns the base directory for all runtime output (temp files, debug logs,
   * session data, todos, insights, etc.).
   *
   * Priority: PARAM_RUNTIME_DIR env var > setRuntimeBaseDir() value > getGlobalParamDir()
   * @returns Absolute path to the runtime output base directory
   */
  static getRuntimeBaseDir(): string {
    const envDir = process.env['PARAM_RUNTIME_DIR'];
    if (envDir) {
      return (
        Storage.resolveRuntimeBaseDir(envDir) ?? Storage.getGlobalParamDir()
      );
    }

    const contextualDir = Storage.runtimeBaseDirContext.getStore();
    if (contextualDir !== undefined) {
      return contextualDir ?? Storage.getGlobalParamDir();
    }
    if (Storage.runtimeBaseDir) {
      return Storage.runtimeBaseDir;
    }
    return Storage.getGlobalParamDir();
  }

  static getGlobalParamDir(): string {
    const homeDir = os.homedir();
    if (!homeDir) {
      return path.join(os.tmpdir(), '.param');
    }
    const paramDir = path.join(homeDir, PARAM_DIR);
    if (fs.existsSync(paramDir)) {
      return paramDir;
    }

    // Fallback to legacy directories for automatic credential reuse
    const legacyDirs = ['.qwen', '.gemini', '.claude', '.openai'];
    for (const dir of legacyDirs) {
      const legacyPath = path.join(homeDir, dir);
      if (fs.existsSync(legacyPath)) {
        return legacyPath;
      }
    }

    return paramDir;
  }

  static getMcpOAuthTokensPath(): string {
    return path.join(Storage.getGlobalParamDir(), 'mcp-oauth-tokens.json');
  }

  static getGlobalSettingsPath(): string {
    return path.join(Storage.getGlobalParamDir(), 'settings.json');
  }

  static getInstallationIdPath(): string {
    return path.join(Storage.getGlobalParamDir(), 'installation_id');
  }

  static getGoogleAccountsPath(): string {
    return path.join(Storage.getGlobalParamDir(), GOOGLE_ACCOUNTS_FILENAME);
  }

  static getUserCommandsDir(): string {
    return path.join(Storage.getGlobalParamDir(), 'commands');
  }

  static getGlobalMemoryFilePath(): string {
    return path.join(Storage.getGlobalParamDir(), 'memory.md');
  }

  static getGlobalTempDir(): string {
    return path.join(Storage.getRuntimeBaseDir(), TMP_DIR_NAME);
  }

  static getGlobalDebugDir(): string {
    return path.join(Storage.getRuntimeBaseDir(), DEBUG_DIR_NAME);
  }

  static getDebugLogPath(sessionId: string): string {
    return path.join(Storage.getGlobalDebugDir(), `${sessionId}.txt`);
  }

  static getGlobalIdeDir(): string {
    return path.join(Storage.getRuntimeBaseDir(), IDE_DIR_NAME);
  }

  static getGlobalBinDir(): string {
    return path.join(Storage.getGlobalParamDir(), BIN_DIR_NAME);
  }

  static getGlobalArenaDir(): string {
    return path.join(Storage.getGlobalParamDir(), ARENA_DIR_NAME);
  }

  getParamDir(): string {
    return path.join(this.targetDir, PARAM_DIR);
  }

  getProjectDir(): string {
    const projectId = sanitizeCwd(this.getProjectRoot());
    const projectsDir = path.join(
      Storage.getRuntimeBaseDir(),
      PROJECT_DIR_NAME,
    );
    return path.join(projectsDir, projectId);
  }

  getProjectTempDir(): string {
    const hash = getProjectHash(this.getProjectRoot());
    const tempDir = Storage.getGlobalTempDir();
    const targetDir = path.join(tempDir, hash);
    return targetDir;
  }

  ensureProjectTempDirExists(): void {
    fs.mkdirSync(this.getProjectTempDir(), { recursive: true });
  }

  static getOAuthCredsPath(): string {
    return path.join(Storage.getGlobalParamDir(), OAUTH_FILE);
  }

  getProjectRoot(): string {
    return this.targetDir;
  }

  getHistoryDir(): string {
    const hash = getProjectHash(this.getProjectRoot());
    const historyDir = path.join(Storage.getRuntimeBaseDir(), 'history');
    const targetDir = path.join(historyDir, hash);
    return targetDir;
  }

  getWorkspaceSettingsPath(): string {
    return path.join(this.getParamDir(), 'settings.json');
  }

  getProjectCommandsDir(): string {
    return path.join(this.getParamDir(), 'commands');
  }

  getProjectTempCheckpointsDir(): string {
    return path.join(this.getProjectTempDir(), 'checkpoints');
  }

  getExtensionsDirs(): string[] {
    return [
      path.join(this.getParamDir(), 'extensions'),
      path.join(this.targetDir, '.qwen', 'extensions'),
      path.join(this.targetDir, '.gemini', 'extensions'),
      path.join(this.targetDir, '.claude', 'extensions'),
      path.join(this.targetDir, '.openai', 'extensions'),
    ];
  }

  getExtensionsConfigPath(): string {
    const param = path.join(this.getParamDir(), 'extensions', 'param-extension.json');
    if (fs.existsSync(param)) return param;
    
    const qwen = path.join(this.targetDir, '.qwen', 'extensions', 'param-extension.json');
    if (fs.existsSync(qwen)) return qwen;

    const gemini = path.join(this.targetDir, '.gemini', 'extensions', 'gemini-extension.json');
    if (fs.existsSync(gemini)) return gemini;

    const claude = path.join(this.targetDir, '.claude', 'extensions', 'claude-extension.json');
    if (fs.existsSync(claude)) return claude;

    return path.join(this.targetDir, '.openai', 'extensions', 'openai-extension.json');
  }

  getUserSkillsDirs(): string[] {
    const homeDir = os.homedir() || os.tmpdir();
    return SKILL_PROVIDER_CONFIG_DIRS.map((dir) =>
      path.join(homeDir, dir, 'skills'),
    );
  }

  /**
   * Returns the user-level extensions directories.
   * Extensions installed at user scope are searched here.
   */
  static getUserExtensionsDirs(): string[] {
    const homeDir = os.homedir() || os.tmpdir();
    return [
      path.join(Storage.getGlobalParamDir(), 'extensions'),
      path.join(homeDir, '.qwen', 'extensions'),
      path.join(homeDir, '.gemini', 'extensions'),
      path.join(homeDir, '.claude', 'extensions'),
      path.join(homeDir, '.openai', 'extensions'),
    ];
  }

  getHistoryFilePath(): string {
    return path.join(this.getProjectTempDir(), 'shell_history');
  }
}
