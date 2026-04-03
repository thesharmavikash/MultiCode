/**
 * @license
 * Copyright 2025 param Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared utility functions for tool call components
 * Now re-exports from @agent-param/webui for backward compatibility
 */

export {
  extractCommandOutput,
  formatValue,
  safeTitle,
  shouldShowToolCall,
  groupContent,
  hasToolCallOutput,
  mapToolStatusToContainerStatus,
} from '@agent-param/webui';

// Re-export types for backward compatibility
export type {
  ToolCallContent,
  GroupedContent,
  ToolCallData,
  ToolCallStatus,
} from '@agent-param/webui';

