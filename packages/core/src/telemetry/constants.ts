/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export const SERVICE_NAME = 'param-code';

export const EVENT_USER_PROMPT = 'param-code.user_prompt';
export const EVENT_USER_RETRY = 'param-code.user_retry';
export const EVENT_TOOL_CALL = 'param-code.tool_call';
export const EVENT_API_REQUEST = 'param-code.api_request';
export const EVENT_API_ERROR = 'param-code.api_error';
export const EVENT_API_CANCEL = 'param-code.api_cancel';
export const EVENT_API_RESPONSE = 'param-code.api_response';
export const EVENT_CLI_CONFIG = 'param-code.config';
export const EVENT_EXTENSION_DISABLE = 'param-code.extension_disable';
export const EVENT_EXTENSION_ENABLE = 'param-code.extension_enable';
export const EVENT_EXTENSION_INSTALL = 'param-code.extension_install';
export const EVENT_EXTENSION_UNINSTALL = 'param-code.extension_uninstall';
export const EVENT_EXTENSION_UPDATE = 'param-code.extension_update';
export const EVENT_FLASH_FALLBACK = 'param-code.flash_fallback';
export const EVENT_RIPGREP_FALLBACK = 'param-code.ripgrep_fallback';
export const EVENT_NEXT_SPEAKER_CHECK = 'param-code.next_speaker_check';
export const EVENT_SLASH_COMMAND = 'param-code.slash_command';
export const EVENT_IDE_CONNECTION = 'param-code.ide_connection';
export const EVENT_CHAT_COMPRESSION = 'param-code.chat_compression';
export const EVENT_INVALID_CHUNK = 'param-code.chat.invalid_chunk';
export const EVENT_CONTENT_RETRY = 'param-code.chat.content_retry';
export const EVENT_CONTENT_RETRY_FAILURE =
  'param-code.chat.content_retry_failure';
export const EVENT_CONVERSATION_FINISHED = 'param-code.conversation_finished';
export const EVENT_MALFORMED_JSON_RESPONSE =
  'param-code.malformed_json_response';
export const EVENT_FILE_OPERATION = 'param-code.file_operation';
export const EVENT_MODEL_SLASH_COMMAND = 'param-code.slash_command.model';
export const EVENT_SUBAGENT_EXECUTION = 'param-code.subagent_execution';
export const EVENT_SKILL_LAUNCH = 'param-code.skill_launch';
export const EVENT_AUTH = 'param-code.auth';
export const EVENT_USER_FEEDBACK = 'param-code.user_feedback';

// Arena Events
export const EVENT_ARENA_SESSION_STARTED = 'param-code.arena_session_started';
export const EVENT_ARENA_AGENT_COMPLETED = 'param-code.arena_agent_completed';
export const EVENT_ARENA_SESSION_ENDED = 'param-code.arena_session_ended';

// Performance Events
export const EVENT_STARTUP_PERFORMANCE = 'param-code.startup.performance';
export const EVENT_MEMORY_USAGE = 'param-code.memory.usage';
export const EVENT_PERFORMANCE_BASELINE = 'param-code.performance.baseline';
export const EVENT_PERFORMANCE_REGRESSION = 'param-code.performance.regression';
