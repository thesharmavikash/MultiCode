/**
 * @license
 * Copyright 2025 param Team
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo } from 'react';
import type { VSCodeAPI } from '../../hooks/useVSCode.js';

/**
 * Session management Hook
 * Manages session list, current session, session switching, and search
 */
export const useSessionManagement = (vscode: VSCodeAPI) => {
  const [ParamSessions, setParamSessions] = useState<
    Array<Record<string, unknown>>
  >([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentSessionTitle, setCurrentSessionTitle] =
    useState<string>('Past Conversations');
  const [showSessionSelector, setShowSessionSelector] = useState(false);
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');
  const [nextCursor, setNextCursor] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const PAGE_SIZE = 20;

  /**
   * Filter session list
   */
  const filteredSessions = useMemo(() => {
    if (!sessionSearchQuery.trim()) {
      return ParamSessions;
    }
    const query = sessionSearchQuery.toLowerCase();
    return ParamSessions.filter((session) => {
      const title = (
        (session.title as string) ||
        (session.name as string) ||
        ''
      ).toLowerCase();
      return title.includes(query);
    });
  }, [ParamSessions, sessionSearchQuery]);

  /**
   * Load session list
   */
  const handleLoadParamSessions = useCallback(() => {
    // Reset pagination state and load first page
    setParamSessions([]);
    setNextCursor(undefined);
    setHasMore(true);
    setIsLoading(true);
    vscode.postMessage({ type: 'getParamSessions', data: { size: PAGE_SIZE } });
    setShowSessionSelector(true);
  }, [vscode]);

  const handleLoadMoreSessions = useCallback(() => {
    if (!hasMore || isLoading || nextCursor === undefined) {
      return;
    }
    setIsLoading(true);
    vscode.postMessage({
      type: 'getParamSessions',
      data: { cursor: nextCursor, size: PAGE_SIZE },
    });
  }, [hasMore, isLoading, nextCursor, vscode]);

  /**
   * Create new session
   */
  const handleNewParamSession = useCallback(() => {
    vscode.postMessage({ type: 'openNewChatTab', data: {} });
    setShowSessionSelector(false);
  }, [vscode]);

  /**
   * Switch session
   */
  const handleSwitchSession = useCallback(
    (sessionId: string) => {
      if (sessionId === currentSessionId) {
        console.log('[useSessionManagement] Already on this session, ignoring');
        setShowSessionSelector(false);
        return;
      }

      console.log('[useSessionManagement] Switching to session:', sessionId);
      vscode.postMessage({
        type: 'switchParamSession',
        data: { sessionId },
      });
    },
    [currentSessionId, vscode],
  );

  return {
    // State
    ParamSessions,
    currentSessionId,
    currentSessionTitle,
    showSessionSelector,
    sessionSearchQuery,
    filteredSessions,
    nextCursor,
    hasMore,
    isLoading,

    // State setters
    setParamSessions,
    setCurrentSessionId,
    setCurrentSessionTitle,
    setShowSessionSelector,
    setSessionSearchQuery,
    setNextCursor,
    setHasMore,
    setIsLoading,

    // Operations
    handleLoadParamSessions,
    handleNewParamSession,
    handleSwitchSession,
    handleLoadMoreSessions,
  };
};
