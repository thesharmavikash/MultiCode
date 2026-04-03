/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it, vi } from 'vitest';
import {
  convertClaudeAgentConfig,
  mergeClaudeConfigs,
  type ClaudeAgentConfig,
  type ClaudePluginConfig,
  type ClaudeMarketplacePluginConfig,
} from './claude-converter.js';

vi.mock('node:fs');
vi.mock('node:path');

describe('convertClaudeAgentConfig', () => {
  it('should convert Claude config to Param format', () => {
    const claudeConfig: ClaudeAgentConfig = {
      name: 'test-agent',
      description: 'test',
      tools: ['test_tool'],
    };

    const result = convertClaudeAgentConfig(claudeConfig);
    expect(result['name']).toBe('test-agent');
    expect(result['systemPrompt']).toBeDefined();
  });

  it('should handle complex Claude agent config', () => {
    const claudeConfig: ClaudeAgentConfig = {
      name: 'complex-agent',
      description: 'test',
      model: 'sonnet',
      permissionMode: 'acceptEdits',
    };

    const result = convertClaudeAgentConfig(claudeConfig);
    expect(result['name']).toBe('complex-agent');
  });

  it('should throw error for missing name', () => {
    const invalidConfig = {
      description: 'test',
    } as any;
    expect(() => convertClaudeAgentConfig(invalidConfig)).toThrow();
  });
});

describe('mergeClaudeConfigs', () => {
  it('should merge marketplace and plugin configs', () => {
    const marketplacePlugin: ClaudeMarketplacePluginConfig = {
      name: 'marketplace-name',
      version: '2.0.0',
      source: 'github:org/repo',
      description: 'From marketplace',
    };

    const pluginConfig: ClaudePluginConfig = {
      name: 'plugin-name',
      version: '1.0.0',
      description: 'test',
      commands: 'commands',
    };

    const result = mergeClaudeConfigs(marketplacePlugin, pluginConfig);
    expect(result.name).toBe('plugin-name');
    expect(result.version).toBe('1.0.0');
    expect(result.description).toBe('test');
  });
});
