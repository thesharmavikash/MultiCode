/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { type ColorsTheme, Theme } from './theme.js';
import { lightSemanticColors } from './semantic-tokens.js';

const paramLightColors: ColorsTheme = {
  type: 'light',
  Background: '#f8f9fa',
  Foreground: '#5c6166',
  LightBlue: '#55b4d4',
  AccentBlue: '#399ee6',
  AccentPurple: '#a37acc',
  AccentCyan: '#4cbf99',
  AccentGreen: '#86b300',
  AccentYellow: '#f2ae49',
  AccentRed: '#f07171',
  AccentYellowDim: '#8B7000',
  AccentRedDim: '#993333',
  DiffAdded: '#86b300',
  DiffRemoved: '#f07171',
  Comment: '#ABADB1',
  Gray: '#CCCFD3',
  GradientColors: ['#399ee6', '#86b300'],
};

export const paramLight: Theme = new Theme(
  'param Light',
  'light',
  {
    hljs: {
      display: 'block',
      overflowX: 'auto',
      padding: '0.5em',
      background: paramLightColors.Background,
      color: paramLightColors.Foreground,
    },
    'hljs-comment': {
      color: paramLightColors.Comment,
      fontStyle: 'italic',
    },
    'hljs-quote': {
      color: paramLightColors.AccentCyan,
      fontStyle: 'italic',
    },
    'hljs-string': {
      color: paramLightColors.AccentGreen,
    },
    'hljs-constant': {
      color: paramLightColors.AccentCyan,
    },
    'hljs-number': {
      color: paramLightColors.AccentPurple,
    },
    'hljs-keyword': {
      color: paramLightColors.AccentYellow,
    },
    'hljs-selector-tag': {
      color: paramLightColors.AccentYellow,
    },
    'hljs-attribute': {
      color: paramLightColors.AccentYellow,
    },
    'hljs-variable': {
      color: paramLightColors.Foreground,
    },
    'hljs-variable.language': {
      color: paramLightColors.LightBlue,
      fontStyle: 'italic',
    },
    'hljs-title': {
      color: paramLightColors.AccentBlue,
    },
    'hljs-section': {
      color: paramLightColors.AccentGreen,
      fontWeight: 'bold',
    },
    'hljs-type': {
      color: paramLightColors.LightBlue,
    },
    'hljs-class .hljs-title': {
      color: paramLightColors.AccentBlue,
    },
    'hljs-tag': {
      color: paramLightColors.LightBlue,
    },
    'hljs-name': {
      color: paramLightColors.AccentBlue,
    },
    'hljs-builtin-name': {
      color: paramLightColors.AccentYellow,
    },
    'hljs-meta': {
      color: paramLightColors.AccentYellow,
    },
    'hljs-symbol': {
      color: paramLightColors.AccentRed,
    },
    'hljs-bullet': {
      color: paramLightColors.AccentYellow,
    },
    'hljs-regexp': {
      color: paramLightColors.AccentCyan,
    },
    'hljs-link': {
      color: paramLightColors.LightBlue,
    },
    'hljs-deletion': {
      color: paramLightColors.AccentRed,
    },
    'hljs-addition': {
      color: paramLightColors.AccentGreen,
    },
    'hljs-emphasis': {
      fontStyle: 'italic',
    },
    'hljs-strong': {
      fontWeight: 'bold',
    },
    'hljs-literal': {
      color: paramLightColors.AccentCyan,
    },
    'hljs-built_in': {
      color: paramLightColors.AccentRed,
    },
    'hljs-doctag': {
      color: paramLightColors.AccentRed,
    },
    'hljs-template-variable': {
      color: paramLightColors.AccentCyan,
    },
    'hljs-selector-id': {
      color: paramLightColors.AccentRed,
    },
  },
  paramLightColors,
  lightSemanticColors,
);
