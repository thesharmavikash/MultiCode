/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { type ColorsTheme, Theme } from './theme.js';
import { darkSemanticColors } from './semantic-tokens.js';

const paramDarkColors: ColorsTheme = {
  type: 'dark',
  Background: '#0b0e14',
  Foreground: '#bfbdb6',
  LightBlue: '#59C2FF',
  AccentBlue: '#39BAE6',
  AccentPurple: '#D2A6FF',
  AccentCyan: '#95E6CB',
  AccentGreen: '#AAD94C',
  AccentYellow: '#FFD700',
  AccentRed: '#F26D78',
  AccentYellowDim: '#8B7530',
  AccentRedDim: '#8B3A4A',
  DiffAdded: '#AAD94C',
  DiffRemoved: '#F26D78',
  Comment: '#646A71',
  Gray: '#3D4149',
  GradientColors: ['#FFD700', '#da7959'],
};

export const paramDark: Theme = new Theme(
  'param Dark',
  'dark',
  {
    hljs: {
      display: 'block',
      overflowX: 'auto',
      padding: '0.5em',
      background: paramDarkColors.Background,
      color: paramDarkColors.Foreground,
    },
    'hljs-keyword': {
      color: paramDarkColors.AccentYellow,
    },
    'hljs-literal': {
      color: paramDarkColors.AccentPurple,
    },
    'hljs-symbol': {
      color: paramDarkColors.AccentCyan,
    },
    'hljs-name': {
      color: paramDarkColors.LightBlue,
    },
    'hljs-link': {
      color: paramDarkColors.AccentBlue,
    },
    'hljs-function .hljs-keyword': {
      color: paramDarkColors.AccentYellow,
    },
    'hljs-subst': {
      color: paramDarkColors.Foreground,
    },
    'hljs-string': {
      color: paramDarkColors.AccentGreen,
    },
    'hljs-title': {
      color: paramDarkColors.AccentYellow,
    },
    'hljs-type': {
      color: paramDarkColors.AccentBlue,
    },
    'hljs-attribute': {
      color: paramDarkColors.AccentYellow,
    },
    'hljs-bullet': {
      color: paramDarkColors.AccentYellow,
    },
    'hljs-addition': {
      color: paramDarkColors.AccentGreen,
    },
    'hljs-variable': {
      color: paramDarkColors.Foreground,
    },
    'hljs-template-tag': {
      color: paramDarkColors.AccentYellow,
    },
    'hljs-template-variable': {
      color: paramDarkColors.AccentYellow,
    },
    'hljs-comment': {
      color: paramDarkColors.Comment,
      fontStyle: 'italic',
    },
    'hljs-quote': {
      color: paramDarkColors.AccentCyan,
      fontStyle: 'italic',
    },
    'hljs-deletion': {
      color: paramDarkColors.AccentRed,
    },
    'hljs-meta': {
      color: paramDarkColors.AccentYellow,
    },
    'hljs-doctag': {
      fontWeight: 'bold',
    },
    'hljs-strong': {
      fontWeight: 'bold',
    },
    'hljs-emphasis': {
      fontStyle: 'italic',
    },
  },
  paramDarkColors,
  darkSemanticColors,
);
