/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { GitIgnoreFilter } from '../utils/gitIgnoreParser.js';
import type { ParamIgnoreFilter } from '../utils/paramIgnoreParser.js';
import { GitIgnoreParser } from '../utils/gitIgnoreParser.js';
import { ParamIgnoreParser } from '../utils/paramIgnoreParser.js';
import { isGitRepository } from '../utils/gitUtils.js';
import * as path from 'node:path';

export interface FilterFilesOptions {
  respectGitIgnore?: boolean;
  respectParamIgnore?: boolean;
}

export interface FilterReport {
  filteredPaths: string[];
  gitIgnoredCount: number;
  paramIgnoredCount: number;
}

export class FileDiscoveryService {
  private gitIgnoreFilter: GitIgnoreFilter | null = null;
  private paramIgnoreFilter: ParamIgnoreFilter | null = null;
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = path.resolve(projectRoot);
    if (isGitRepository(this.projectRoot)) {
      this.gitIgnoreFilter = new GitIgnoreParser(this.projectRoot);
    }
    this.paramIgnoreFilter = new ParamIgnoreParser(this.projectRoot);
  }

  /**
   * Filters a list of file paths based on git ignore rules
   */
  filterFiles(
    filePaths: string[],
    options: FilterFilesOptions = {
      respectGitIgnore: true,
      respectParamIgnore: true,
    },
  ): string[] {
    return filePaths.filter((filePath) => {
      if (options.respectGitIgnore && this.shouldGitIgnoreFile(filePath)) {
        return false;
      }
      if (options.respectParamIgnore && this.shouldParamIgnoreFile(filePath)) {
        return false;
      }
      return true;
    });
  }

  /**
   * Filters a list of file paths based on git ignore rules and returns a report
   * with counts of ignored files.
   */
  filterFilesWithReport(
    filePaths: string[],
    opts: FilterFilesOptions = {
      respectGitIgnore: true,
      respectParamIgnore: true,
    },
  ): FilterReport {
    const filteredPaths: string[] = [];
    let gitIgnoredCount = 0;
    let paramIgnoredCount = 0;

    for (const filePath of filePaths) {
      if (opts.respectGitIgnore && this.shouldGitIgnoreFile(filePath)) {
        gitIgnoredCount++;
        continue;
      }

      if (opts.respectParamIgnore && this.shouldParamIgnoreFile(filePath)) {
        paramIgnoredCount++;
        continue;
      }

      filteredPaths.push(filePath);
    }

    return {
      filteredPaths,
      gitIgnoredCount,
      paramIgnoredCount,
    };
  }

  /**
   * Checks if a single file should be git-ignored
   */
  shouldGitIgnoreFile(filePath: string): boolean {
    if (this.gitIgnoreFilter) {
      return this.gitIgnoreFilter.isIgnored(filePath);
    }
    return false;
  }

  /**
   * Checks if a single file should be param-ignored
   */
  shouldParamIgnoreFile(filePath: string): boolean {
    if (this.paramIgnoreFilter) {
      return this.paramIgnoreFilter.isIgnored(filePath);
    }
    return false;
  }

  /**
   * Unified method to check if a file should be ignored based on filtering options
   */
  shouldIgnoreFile(
    filePath: string,
    options: FilterFilesOptions = {},
  ): boolean {
    const {
      respectGitIgnore = true,
      respectParamIgnore: respectParamIgnore = true,
    } = options;

    if (respectGitIgnore && this.shouldGitIgnoreFile(filePath)) {
      return true;
    }
    if (respectParamIgnore && this.shouldParamIgnoreFile(filePath)) {
      return true;
    }
    return false;
  }

  /**
   * Returns loaded patterns from .paramignore
   */
  getParamIgnorePatterns(): string[] {
    return this.paramIgnoreFilter?.getPatterns() ?? [];
  }
}
