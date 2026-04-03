/**
 * @license
 * Copyright 2025 param Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared utility functions for tool call components
 * Now re-exports from @param-code/webui for backward compatibility
 */

export {
  extractCommandOutput,
  formatValue,
  safeTitle,
  shouldShowToolCall,
  groupContent,
  hasToolCallOutput,
  mapToolStatusToContainerStatus,
} from '@param-code/webui';

// Re-export types for backward compatibility
export type {
  ToolCallContent,
  GroupedContent,
  ToolCallData,
  ToolCallStatus,
} from '@param-code/webui';
