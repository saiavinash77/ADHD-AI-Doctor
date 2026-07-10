export interface ActionTip {
  title: string;
  category: string;
  description: string;
  relevance: string;
}

// Get severity-based medical guidance
export function getMedicalGuidance(totalScore: number, probability: 'Low' | 'Moderate' | 'High'): {
  urgency: 'low' | 'moderate' | 'high';
  message: string;
  action: string;
} {
  if (probability === 'High' || totalScore >= 26) {
    return {
      urgency: 'high',
      message: 'Your results indicate significant ADHD symptoms that warrant professional evaluation.',
      action: '🏥 **Strongly Recommended:** Schedule an appointment with a psychiatrist or ADHD specialist within the next 2-4 weeks. Bring this report to your consultation. Professional diagnosis and treatment can significantly improve your quality of life.'
    };
  } else if (probability === 'Moderate' || totalScore >= 16) {
    return {
      urgency: 'moderate',
      message: 'Your results show moderate ADHD indicators that may benefit from professional guidance.',
      action: '👨‍⚕️ **Recommended:** Consider consulting with a healthcare provider or mental health professional to discuss your symptoms. They can provide strategies, coping mechanisms, or treatment options if needed.'
    };
  } else {
    return {
      urgency: 'low',
      message: 'Your results fall within typical ranges, but self-awareness is important.',
      action: '💡 **Optional:** If symptoms worsen or interfere with daily life, consider speaking with a healthcare provider. Continue practicing good focus habits and stress management techniques.'
    };
  }
}

export function getPersonalizedTips(responses: { questionId: number; score: number }[]): ActionTip[] {
  const getScore = (id: number) => responses.find(r => r.questionId === id)?.score ?? 0;

  const tips: ActionTip[] = [];

  // 1. Task Procrastination (Q4)
  if (getScore(4) >= 3) {
    tips.push({
      title: 'Break the "Activation Lock" with the 5-Minute Prompt',
      category: 'Initiative & Procrastination',
      description: 'When starting a heavy task feels physically impossible, set a timer for exactly 5 minutes. Give yourself permission to stop when the alarm rings. Usually, crossing that initial stimulation barrier is enough to sustain momentum.',
      relevance: 'Triggered by high avoidance scores on beginning intensive mental efforts (Q4).'
    });
  }

  // 2. Wrap-up Hurdles (Q1)
  if (getScore(1) >= 3) {
    tips.push({
      title: 'The "Done Is Better Than Perfect" Framework',
      category: 'Project Completion',
      description: 'The final 10% of tasks (documentation, formatting, double-checking) lacks the novelty and dopamine of the initial challenge. Define a "good enough" standard in advance and ask a colleague or partner to act as an external accountability check for the finish line.',
      relevance: 'Triggered by trouble wrapping up final project details (Q1).'
    });
  }

  // 3. Organization & Memory (Q2, Q10)
  if (getScore(2) >= 3 || getScore(10) >= 3) {
    tips.push({
      title: 'Establish a Physical "Launchpad"',
      category: 'Organization & Spatial Memory',
      description: 'Designate a single bowl or tray by your front door for absolute essentials (keys, wallet, badge, glasses). Never place them anywhere else. Minimize digital clutter by choosing ONE calendar app; if it isn\'t on that database, it doesn\'t exist.',
      relevance: 'Triggered by organizational obstacles (Q2) or frequently misplacing focus tools (Q10).'
    });
  }

  // 4. Overactive Motor & Restlessness (Q5, Q6)
  if (getScore(5) >= 3 || getScore(6) >= 3) {
    tips.push({
      title: 'Harness Movement to Feed Focus',
      category: 'Physical Energy Regulation',
      description: 'ADHD brains often require a baseline of physical stimulation to engage cognitive focus. Use discrete fidgets, an under-desk foot rocker, or a standing desk with a balance board. Allow yourself pacing breaks during intense virtual meetings.',
      relevance: 'Triggered by fidgeting indices (Q5) or feeling driven by an energetic motor (Q6).'
    });
  }

  // 5. Environmental Sensory Distractions (Q11)
  if (getScore(11) >= 3) {
    tips.push({
      title: 'Create an Active Auditory Shield',
      category: 'Distraction Management',
      description: 'Invest in high-quality active noise-canceling (ANC) headphones. Experiment with "colored" noises (brown noise has deeper, ocean-like frequencies that soothe ADHD brains better than white noise) or lyric-free synthwave music.',
      relevance: 'Triggered by high distraction levels from surrounding sounds and activities (Q11).'
    });
  }

  // 6. Forgetfulness & Scheduled Duties (Q3)
  if (getScore(3) >= 3) {
    tips.push({
      title: 'Outsource Your Working Memory Immediately',
      category: 'Forgetfulness & Reminders',
      description: 'Never rely on "remembering later." Use a single voice recorder widget on your phone home screen or an executive pocket notepad to capture tasks immediately. Set multiple overlapping alerts (e.g., 1 day before, 2 hours before, 10 minutes before) for meetings.',
      relevance: 'Triggered by frequent difficulties remembering appointments or daily obligations (Q3).'
    });
  }

  // 7. Conversational Listening Attention (Q9)
  if (getScore(9) >= 3) {
    tips.push({
      title: 'Active Visual Listening Check-ins',
      category: 'Focusing in Interactions',
      description: 'When people speak directly, your mind might wander. Keep interactive focus by taking live physical notes during conversations, repeating key instructions back to confirm understanding ("So to be clear, you\'d like me to..."), or sketching visual maps of topics.',
      relevance: 'Triggered by challenges focusing when spoken to directly (Q9).'
    });
  }

  // 8. Time Management & Deadlines (Q7)
  if (getScore(7) >= 3) {
    tips.push({
      title: 'The "Time Boxing" Protection Strategy',
      category: 'Time Management',
      description: 'ADHD time blindness makes deadlines feel distant until they\'re urgent. Use visual timers (analog clocks, countdown apps) and break projects into "micro-deadlines" with immediate rewards. Schedule time-sensitive tasks during your peak focus hours.',
      relevance: 'Triggered by difficulty with time-sensitive tasks and deadlines (Q7).'
    });
  }

  // 9. Detail-Oriented Work (Q8)
  if (getScore(8) >= 3) {
    tips.push({
      title: 'The "Fresh Eyes" Double-Check System',
      category: 'Attention to Detail',
      description: 'Your brain skims over details it expects to see. When reviewing detailed work, change the format (print it out, use text-to-speech, change font size) or wait 24 hours before final review. Partner with a detail-oriented colleague for critical checks.',
      relevance: 'Triggered by difficulty with detail-oriented tasks (Q8).'
    });
  }

  // Fallback / General ADHD tips if few specific items are highlighted
  if (tips.length < 3) {
    tips.push({
      title: 'Gamify Boring or Habitual Tasks',
      category: 'Dopamine Hacks',
      description: 'Boring tasks lack dopamine triggers. Inject artificial novelty: race a timer, bundle a chore with your favorite podcast, or reward yourself with a favorite beverage strictly after completion.',
      relevance: 'Standard dopamine management guideline for ADHD focus profiles.'
    });
    tips.push({
      title: 'Leverage the Power of Body Doubling',
      category: 'Social Accountability',
      description: 'Working alongside someone else (even in silence, or virtually via focus co-working platforms) provides an unspoken anchor that keeps ADHD executive brains on task and reduces the friction of starting.',
      relevance: 'General executive task-completion strategy.'
    });
    tips.push({
      title: 'Create Environmental "Friction" for Distractions',
      category: 'Focus Enhancement',
      description: 'Make distractions harder to access: put your phone in another room, use website blockers during work hours, keep your workspace clear of visual clutter. Make focus the path of least resistance.',
      relevance: 'General ADHD environmental management strategy.'
    });
  }

  // Limit to top 6 most relevant tips
  return tips.slice(0, 6);
}
