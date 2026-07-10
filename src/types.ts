/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: number;
  text: string;
  category: 'inattention' | 'hyperactivity' | 'pricing';
  part: 'A' | 'B';
  // Threshold index for clinical scoring (e.g., 2 means 'Sometimes' or higher, 3 means 'Often' or higher)
  thresholdIndex: number;
}

export type ScoreChoice = 0 | 1 | 2 | 3 | 4;

export interface ScreenResponse {
  questionId: number;
  score: ScoreChoice;
}

export type ScreenState = 'WELCOME' | 'PROFILE' | 'QUESTIONS' | 'ANALYZING' | 'RESULTS';

export interface ScoreBreakdown {
  totalScore: number;
  probability: 'Low' | 'Moderate' | 'High';
  partAScore: number; // Positive screener count in Part A (Questions 1-6)
  isPartAPositive: boolean; // meets official WHO clinical threshold (>= 4 out of 6 positive indicators)
  inattentionScore: number;
  hyperactivityScore: number;
}
