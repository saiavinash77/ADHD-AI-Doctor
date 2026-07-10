/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question } from './types';

export const CHOICES = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Rarely' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Often' },
  { value: 4, label: 'Very Often' },
] as const;

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?',
    category: 'inattention',
    part: 'A',
    thresholdIndex: 2, // 'Sometimes' or higher is positive
  },
  {
    id: 2,
    text: 'How often do you have difficulty getting things in order when you have to do a task that requires organization?',
    category: 'inattention',
    part: 'A',
    thresholdIndex: 2, // 'Sometimes' or higher is positive
  },
  {
    id: 3,
    text: 'How often do you have problems remembering appointments or obligations?',
    category: 'inattention',
    part: 'A',
    thresholdIndex: 2, // 'Sometimes' or higher is positive
  },
  {
    id: 4,
    text: 'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
    category: 'inattention',
    part: 'A',
    thresholdIndex: 3, // 'Often' or higher is positive
  },
  {
    id: 5,
    text: 'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
    category: 'hyperactivity',
    part: 'A',
    thresholdIndex: 3, // 'Often' or higher is positive
  },
  {
    id: 6,
    text: 'How often do you feel overly active and compelled to do things, as if you were driven by a motor?',
    category: 'hyperactivity',
    part: 'A',
    thresholdIndex: 3, // 'Often' or higher is positive
  },
  {
    id: 7,
    text: 'How often do you make careless mistakes when you have to work on a boring or difficult project?',
    category: 'inattention',
    part: 'B',
    thresholdIndex: 2, // 'Sometimes' or higher
  },
  {
    id: 8,
    text: 'How often do you have difficulty keeping your attention when you are doing boring or repetitive work?',
    category: 'inattention',
    part: 'B',
    thresholdIndex: 2, // 'Sometimes' or higher
  },
  {
    id: 9,
    text: 'How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?',
    category: 'inattention',
    part: 'B',
    thresholdIndex: 2, // 'Sometimes' or higher
  },
  {
    id: 10,
    text: 'How often do you misplace or have difficulty finding things at home or at work?',
    category: 'inattention',
    part: 'B',
    thresholdIndex: 2, // 'Sometimes' or higher
  },
  {
    id: 11,
    text: 'How often are you distracted by activity or noise around you?',
    category: 'inattention',
    part: 'B',
    thresholdIndex: 3, // 'Often' or higher
  }
];

export const PRICING_CHOICES = [
  { value: 0, label: '$1.99', numericValue: 1.99 },
  { value: 1, label: '$2.49', numericValue: 2.49 },
  { value: 2, label: '$3.99', numericValue: 3.99 },
  { value: 3, label: '$4.99', numericValue: 4.99 },
] as const;

