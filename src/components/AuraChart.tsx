import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Sparkles, 
  Sliders, 
  RotateCcw, 
  Info, 
  Baby, 
  GraduationCap, 
  User, 
  Brain, 
  Flame, 
  Zap, 
  TrendingUp, 
  Heart, 
  ListTodo,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { QUESTIONS, CHOICES } from '../data';
import { ScreenResponse } from '../types';

interface AuraChartProps {
  inattentionScore: number;
  hyperactivityScore: number;
  actualResponses?: ScreenResponse[];
}

type AgeGroup = 'child' | 'teen' | 'adult';

interface ClinicalScale {
  id: string;
  name: string;
  scaleNum: number;
  maxScore: number;
  gaugeLabel: string;
  evaluates: string;
  checkpoints: {
    id: number;
    label: string;
    description: string;
    weight: number; // multiplier or baseline weight
  }[];
  severityRanges: {
    minPercent: number;
    status: string;
    dotColor: string;
    textColor: string;
  }[];
}

const AGE_CONFIGS: Record<AgeGroup, {
  label: string;
  sub: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
  scales: ClinicalScale[];
}> = {
  adult: {
    label: 'Adult (Ages 18+)',
    sub: 'Workplace flow, executive dysfunction, & relationship tracking',
    icon: User,
    color: 'text-lime-700',
    bg: 'bg-lime-50/40',
    border: 'border-lime-150',
    scales: [
      {
        id: 'attention',
        name: 'Attention Focus',
        scaleNum: 1,
        maxScore: 36,
        gaugeLabel: 'DEVIATION',
        evaluates: 'Evaluates task continuity, mental fatigue threshold, recall, and detail organization indexes.',
        checkpoints: [
          { id: 101, label: 'Wrapping up project details', description: 'Difficulty finishing final details of work/chores.', weight: 3 },
          { id: 102, label: 'Organization & structuring', description: 'Difficulty getting things organized or structured.', weight: 3 },
          { id: 103, label: 'Remembering appointments', description: 'Forgetting dates, obligations, or scheduled events.', weight: 3 },
          { id: 104, label: 'Thought-heavy initiation', description: 'Avoiding or delaying tasks requiring sustained focus.', weight: 3 },
        ],
        severityRanges: [
          { minPercent: 70, status: 'Significant drift pattern', dotColor: 'bg-[#f97316]', textColor: 'text-orange-700' },
          { minPercent: 40, status: 'Moderate drift pattern', dotColor: 'bg-[#eab308]', textColor: 'text-yellow-700' },
          { minPercent: 0, status: 'Stable focus pattern', dotColor: 'bg-[#22c55e]', textColor: 'text-green-700' }
        ]
      },
      {
        id: 'restlessness',
        name: 'Restlessness Index',
        scaleNum: 2,
        maxScore: 8,
        gaugeLabel: 'HYPER-DRIVE',
        evaluates: 'Evaluates tactile movement cues, physical shifting under seat, and internal constant motor drive.',
        checkpoints: [
          { id: 201, label: 'Nervous fidgeting', description: 'Fidgeting or squirming with hands, feet, or accessories.', weight: 2 },
          { id: 202, label: 'Constant motor-drive', description: 'Feeling compelled to move or act as if driven by a motor.', weight: 2 },
        ],
        severityRanges: [
          { minPercent: 70, status: 'Elevated motor level', dotColor: 'bg-[#f97316]', textColor: 'text-orange-700' },
          { minPercent: 40, status: 'Moderate motor level', dotColor: 'bg-[#eab308]', textColor: 'text-yellow-700' },
          { minPercent: 0, status: 'Stable motor level', dotColor: 'bg-[#22c55e]', textColor: 'text-green-700' }
        ]
      },
      {
        id: 'executive',
        name: 'Executive Regulation',
        scaleNum: 3,
        maxScore: 24,
        gaugeLabel: 'PARALYSIS',
        evaluates: 'Tracks time blindness, task prioritization locks, mental fatigue recovery, and working memory retention.',
        checkpoints: [
          { id: 301, label: 'Time estimation blind spots', description: 'Chronically underestimating task durations.', weight: 3 },
          { id: 302, label: 'Working memory slips', description: 'Forgetting why you walked into a room or losing track mid-task.', weight: 3 },
          { id: 303, label: 'Prioritisation paralysis', description: 'Feeling overwhelmed when staring at multi-stage task lists.', weight: 2 },
        ],
        severityRanges: [
          { minPercent: 70, status: 'Significant lock pattern', dotColor: 'bg-[#f97316]', textColor: 'text-orange-700' },
          { minPercent: 40, status: 'Moderate priority blocks', dotColor: 'bg-[#eab308]', textColor: 'text-yellow-700' },
          { minPercent: 0, status: 'Optimal executive flow', dotColor: 'bg-[#22c55e]', textColor: 'text-green-700' }
        ]
      },
      {
        id: 'emotional',
        name: 'Emotional Coherence',
        scaleNum: 4,
        maxScore: 16,
        gaugeLabel: 'TURBULENCE',
        evaluates: 'Monitors frustration tolerance thresholds, rapid dopamine crashes, and high sensitivity levels.',
        checkpoints: [
          { id: 401, label: 'Interruptive irritability', description: 'Heightened irritation when deep-focus is unexpectedly broken.', weight: 2 },
          { id: 402, label: 'Rejection sensitivity', description: 'Intense emotional reaction to perceived criticism or feedback.', weight: 2 },
        ],
        severityRanges: [
          { minPercent: 70, status: 'High turbulence score', dotColor: 'bg-[#f97316]', textColor: 'text-orange-700' },
          { minPercent: 40, status: 'Moderate resonance drift', dotColor: 'bg-[#eab308]', textColor: 'text-yellow-700' },
          { minPercent: 0, status: 'Stable emotional anchor', dotColor: 'bg-[#22c55e]', textColor: 'text-green-700' }
        ]
      }
    ]
  },
  teen: {
    label: 'Teen (Ages 13-17)',
    sub: 'Academic procrastination, screen-time habits, & peer group dynamics',
    icon: GraduationCap,
    color: 'text-blue-700',
    bg: 'bg-blue-50/40',
    border: 'border-blue-150',
    scales: [
      {
        id: 'attention',
        name: 'Academic Focus',
        scaleNum: 1,
        maxScore: 36,
        gaugeLabel: 'DRIFT RATE',
        evaluates: 'Sustained lecture attention, organization of homework materials, and study procrastination.',
        checkpoints: [
          { id: 111, label: 'Lecture focus endurance', description: 'Staying locked in during dry, long high school classes.', weight: 3 },
          { id: 112, label: 'Dynamic homework systems', description: 'Keeping track of assignments across multiple subjects.', weight: 3 },
          { id: 113, label: 'Digital study loops', description: 'Sidetracking into social media or secondary browser tabs.', weight: 3 },
          { id: 114, label: 'Deadline hyperfocus', description: 'Procrastinating on projects until the absolute final hour.', weight: 3 },
        ],
        severityRanges: [
          { minPercent: 70, status: 'Significant focus drift', dotColor: 'bg-[#f97316]', textColor: 'text-orange-700' },
          { minPercent: 40, status: 'Moderate academic drift', dotColor: 'bg-[#eab308]', textColor: 'text-yellow-700' },
          { minPercent: 0, status: 'Consistent study focus', dotColor: 'bg-[#22c55e]', textColor: 'text-green-700' }
        ]
      },
      {
        id: 'restlessness',
        name: 'Hyper-Impulsivity',
        scaleNum: 2,
        maxScore: 12,
        gaugeLabel: 'IMPULSE',
        evaluates: 'Measures verbal pacing, sudden screen-switching, and motor drive during structured tests.',
        checkpoints: [
          { id: 211, label: 'Interruption drive', description: 'Blurting out answers or talking over peers during class.', weight: 2 },
          { id: 212, label: 'Exam seat squirming', description: 'Difficulty sitting calmly during 1-hour exams.', weight: 2 },
          { id: 213, label: 'Device micro-switching', description: 'Rapidly clicking through apps to seek novel inputs.', weight: 2 },
        ],
        severityRanges: [
          { minPercent: 70, status: 'Elevated impulse activity', dotColor: 'bg-[#f97316]', textColor: 'text-orange-700' },
          { minPercent: 40, status: 'Moderate kinetic pacing', dotColor: 'bg-[#eab308]', textColor: 'text-yellow-700' },
          { minPercent: 0, status: 'Balanced energy regulation', dotColor: 'bg-[#22c55e]', textColor: 'text-green-700' }
        ]
      },
      {
        id: 'executive',
        name: 'Physical Clutter',
        scaleNum: 3,
        maxScore: 24,
        gaugeLabel: 'CLUTTER RATE',
        evaluates: 'Tracks physical pack-organization, misplaced items, and digital workspace entropy.',
        checkpoints: [
          { id: 311, label: 'Backpack & desk clutter', description: 'Physical piles of school sheets, wrappers, and clutter.', weight: 3 },
          { id: 312, label: 'Losing vital equipment', description: 'Forgetting phone, keys, student ID, or sports gear.', weight: 3 },
          { id: 313, label: 'Late-night screen cycles', description: 'Endless scrolling defeating sleep schedule structures.', weight: 2 },
        ],
        severityRanges: [
          { minPercent: 70, status: 'High organization block', dotColor: 'bg-[#f97316]', textColor: 'text-orange-700' },
          { minPercent: 40, status: 'Moderate structural entropy', dotColor: 'bg-[#eab308]', textColor: 'text-yellow-700' },
          { minPercent: 0, status: 'Systematic daily routines', dotColor: 'bg-[#22c55e]', textColor: 'text-green-700' }
        ]
      },
      {
        id: 'emotional',
        name: 'Social Resonance',
        scaleNum: 4,
        maxScore: 16,
        gaugeLabel: 'REACTIVITY',
        evaluates: 'Measures sensitivity to feedback, peer validation dynamics, and interest fixation cycles.',
        checkpoints: [
          { id: 411, label: 'Constructive feed fatigue', description: 'Intense defensive reactions to parental or teacher critiques.', weight: 2 },
          { id: 412, label: 'Specialist hyperfixations', description: 'Absolute isolation with specialized gaming/hobbies.', weight: 2 },
        ],
        severityRanges: [
          { minPercent: 70, status: 'Deep social turbulence', dotColor: 'bg-[#f97316]', textColor: 'text-orange-700' },
          { minPercent: 40, status: 'Moderate feedback defense', dotColor: 'bg-[#eab308]', textColor: 'text-yellow-700' },
          { minPercent: 0, status: 'Grounded peer boundary', dotColor: 'bg-[#22c55e]', textColor: 'text-green-700' }
        ]
      }
    ]
  },
  child: {
    label: 'Child (Ages 4-12)',
    sub: 'Classroom compliance, sensory energy levels, & instruction tracking',
    icon: Baby,
    color: 'text-orange-700',
    bg: 'bg-orange-50/40',
    border: 'border-orange-150',
    scales: [
      {
        id: 'attention',
        name: 'Task Engagement',
        scaleNum: 1,
        maxScore: 24,
        gaugeLabel: 'DRIFT RATE',
        evaluates: 'Classroom task compliance, keeping track of coats/jackets, and multi-step play sustain.',
        checkpoints: [
          { id: 121, label: 'Classwork follow-through', description: 'Trouble completing drawings, worksheets, or chores.', weight: 2 },
          { id: 122, label: 'Coat & lunchbox tracker', description: 'Losing or leaving clothing, lunches, or toys behind.', weight: 2 },
          { id: 123, label: 'Complex chore compliance', description: 'Forgetting multi-step instructions (e.g. shoes first, then teeth).', weight: 4 },
          { id: 124, label: 'Boring game endurance', description: 'Quickly losing interest in games with strict wait limits.', weight: 4 },
        ],
        severityRanges: [
          { minPercent: 70, status: 'Elevated engagement drift', dotColor: 'bg-[#f97316]', textColor: 'text-orange-700' },
          { minPercent: 40, status: 'Moderate focus slippage', dotColor: 'bg-[#eab308]', textColor: 'text-yellow-700' },
          { minPercent: 0, status: 'Strong active participation', dotColor: 'bg-[#22c55e]', textColor: 'text-green-700' }
        ]
      },
      {
        id: 'restlessness',
        name: 'Kinetic Energy',
        scaleNum: 2,
        maxScore: 16,
        gaugeLabel: 'CHARGE RATE',
        evaluates: 'Gross motor climbing actions, seat departure in class, and loud play tendencies.',
        checkpoints: [
          { id: 221, label: 'Unscheduled seat departures', description: 'Standing up mid-class or during family meals.', weight: 2 },
          { id: 222, label: 'Inappropriate climbing', description: 'Climbing onto tables, counters, or structures under stress.', weight: 2 },
          { id: 223, label: 'Volatile talking levels', description: 'Talking extremely loudly even during quiet time limits.', weight: 2 },
          { id: 224, label: 'Constant moving', description: 'Wriggling and squirming continuously when seated.', weight: 2 },
        ],
        severityRanges: [
          { minPercent: 70, status: 'Extreme kinetic overflow', dotColor: 'bg-[#f97316]', textColor: 'text-orange-700' },
          { minPercent: 40, status: 'Active bounce patterns', dotColor: 'bg-[#eab308]', textColor: 'text-yellow-700' },
          { minPercent: 0, status: 'Restful physical baseline', dotColor: 'bg-[#22c55e]', textColor: 'text-green-700' }
        ]
      },
      {
        id: 'executive',
        name: 'Distractibility',
        scaleNum: 3,
        maxScore: 16,
        gaugeLabel: 'DISPERSION',
        evaluates: 'Vulnerability to peripheral sounds, toy interest drop-offs, and attention detail slips.',
        checkpoints: [
          { id: 321, label: 'Sound focus hijack', description: 'Immediately dropping a task to watch background activities.', weight: 2 },
          { id: 322, label: 'Classwork detail slip', description: 'Failing to notice simple homework outlines or questions.', weight: 2 },
        ],
        severityRanges: [
          { minPercent: 70, status: 'High distraction triggers', dotColor: 'bg-[#f97316]', textColor: 'text-orange-700' },
          { minPercent: 40, status: 'Moderate drift patterns', dotColor: 'bg-[#eab308]', textColor: 'text-yellow-700' },
          { minPercent: 0, status: 'Calm sensory compliance', dotColor: 'bg-[#22c55e]', textColor: 'text-green-700' }
        ]
      },
      {
        id: 'emotional',
        name: 'Interpersonal Ease',
        scaleNum: 4,
        maxScore: 12,
        gaugeLabel: 'REACTIVITY',
        evaluates: 'Turn-taking patience in peer games, tantrum frequency, and waiting in lines.',
        checkpoints: [
          { id: 421, label: 'Patience in peer circles', description: 'High difficulty waiting for turns in playground games.', weight: 2 },
          { id: 422, label: 'Volatile melt-down spikes', description: 'Intense short-lived emotional crises under frustration.', weight: 2 },
          { id: 423, label: 'Interrupting games', description: 'Intruding upon others\' activities or conversation bounds.', weight: 2 },
        ],
        severityRanges: [
          { minPercent: 70, status: 'High social friction', dotColor: 'bg-[#f97316]', textColor: 'text-orange-700' },
          { minPercent: 40, status: 'Moderate patience blocks', dotColor: 'bg-[#eab308]', textColor: 'text-yellow-700' },
          { minPercent: 0, status: 'Gentle cooperative balance', dotColor: 'bg-[#22c55e]', textColor: 'text-green-700' }
        ]
      }
    ]
  }
};

export default function AuraChart({ inattentionScore, hyperactivityScore, actualResponses }: AuraChartProps) {
  const [selectedAge, setSelectedAge] = useState<AgeGroup>('adult');
  const [isSimulatorEnabled, setIsSimulatorEnabled] = useState<boolean>(false);
  const [simulatedResponses, setSimulatedResponses] = useState<Record<number, number>>({});
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Load initial simulated values
  useEffect(() => {
    const initialMap: Record<number, number> = {};
    
    // Fill all age configuration checkpoints with reasonable baseline defaults
    Object.keys(AGE_CONFIGS).forEach((ageKey) => {
      const config = AGE_CONFIGS[ageKey as AgeGroup];
      config.scales.forEach((scale) => {
        scale.checkpoints.forEach((checkpoint) => {
          // If adult and actual responses exist, link scale 1 (attention) and scale 2 (restlessness) to actual results!
          if (ageKey === 'adult' && actualResponses && actualResponses.length > 0) {
            // map actual questions (1-11) to checkpoints (101-104, 201-202)
            if (checkpoint.id === 101) initialMap[checkpoint.id] = actualResponses.find(r => r.questionId === 1)?.score ?? 3;
            else if (checkpoint.id === 102) initialMap[checkpoint.id] = actualResponses.find(r => r.questionId === 2)?.score ?? 2;
            else if (checkpoint.id === 103) initialMap[checkpoint.id] = actualResponses.find(r => r.questionId === 3)?.score ?? 3;
            else if (checkpoint.id === 104) initialMap[checkpoint.id] = actualResponses.find(r => r.questionId === 4)?.score ?? 2;
            else if (checkpoint.id === 201) initialMap[checkpoint.id] = actualResponses.find(r => r.questionId === 5)?.score ?? 2;
            else if (checkpoint.id === 202) initialMap[checkpoint.id] = actualResponses.find(r => r.questionId === 6)?.score ?? 2;
            else {
              initialMap[checkpoint.id] = Math.floor(Math.random() * 3) + 1; // reasonable default
            }
          } else {
            // Provide normal intermediate values
            initialMap[checkpoint.id] = 2; // general mid-tier default
          }
        });
      });
    });

    // Override with direct props for Adult Scale 1 and 2 if simulator is off
    if (inattentionScore > 0) {
      // average distribute
      initialMap[101] = Math.round(inattentionScore / 12);
      initialMap[102] = Math.round(inattentionScore / 12);
      initialMap[103] = Math.round(inattentionScore / 12);
      initialMap[104] = Math.max(0, inattentionScore - (initialMap[101] + initialMap[102] + initialMap[103]));
    }
    if (hyperactivityScore > 0) {
      initialMap[201] = Math.round(hyperactivityScore / 4);
      initialMap[202] = Math.max(0, hyperactivityScore - initialMap[201]);
    }

    setSimulatedResponses(initialMap);
  }, [actualResponses, inattentionScore, hyperactivityScore]);

  // Calculate live score for a specific scale
  const getScaleScore = (scale: ClinicalScale) => {
    let rawScore = 0;
    scale.checkpoints.forEach((cp) => {
      rawScore += simulatedResponses[cp.id] ?? 2;
    });
    // scale 1 is max 36 (requires multiplier if checkpoints sum to smaller)
    // total checkpoints * max slider value (4) = theoretical max
    const maxTheoretical = scale.checkpoints.length * 4;
    if (maxTheoretical === scale.maxScore) {
      return rawScore;
    } else {
      // cross multiply to scale to custom maxScore
      return Math.min(scale.maxScore, Math.round((rawScore / maxTheoretical) * scale.maxScore));
    }
  };

  // Reset to static clinical defaults
  const handleReset = () => {
    const freshMap = { ...simulatedResponses };
    // Set typical clinical intermediate values for the selected age
    AGE_CONFIGS[selectedAge].scales.forEach((scale) => {
      scale.checkpoints.forEach((cp) => {
        freshMap[cp.id] = cp.id % 2 === 0 ? 3 : 1; // varying clinical presets
      });
    });
    setSimulatedResponses(freshMap);
  };

  // Get severity feedback
  const getScaleFeedback = (scale: ClinicalScale, score: number) => {
    const percent = Math.min(100, Math.round((score / scale.maxScore) * 100));
    const matchedRange = scale.severityRanges.find(r => percent >= r.minPercent) 
      || scale.severityRanges[scale.severityRanges.length - 1];
    return {
      percent,
      status: matchedRange.status,
      dotColor: matchedRange.dotColor,
      textColor: matchedRange.textColor
    };
  };

  const activeAgeConfig = AGE_CONFIGS[selectedAge];

  return (
    <div className="space-y-6">
      
      {/* SIMULATOR & LIFESPAN AGE SELECTION HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 bg-lime-50 rounded-2xl flex items-center justify-center border border-lime-150 shrink-0 mt-1 sm:mt-0">
            <Activity className="w-5 h-5 text-lime-650 animate-pulse" />
          </div>
          <div className="text-left">
            <h4 id="lifespan-scale-title" className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              Lifespan ADHD Subscale Diagnostics
              <span className="bg-lime-500 text-slate-950 font-black text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">
                Interactive Multi-Age
              </span>
            </h4>
            <p className="text-[10.5px] text-slate-400 font-medium">
              Understand clinical presentation shifts across different ages and symptom dimensions
            </p>
          </div>
        </div>

        {/* AGE GROUP TABS */}
        <div className="flex items-center flex-wrap gap-1.5 bg-slate-100/70 p-1 rounded-2xl border border-slate-200/40">
          {(Object.keys(AGE_CONFIGS) as AgeGroup[]).map((ageKey) => {
            const cfg = AGE_CONFIGS[ageKey];
            const Icon = cfg.icon;
            const isActive = selectedAge === ageKey;
            return (
              <button
                key={ageKey}
                onClick={() => {
                  setSelectedAge(ageKey);
                  // Ensure simulator highlights when user explores other ages
                  if (!isSimulatorEnabled) {
                    setIsSimulatorEnabled(true);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-lime-650' : 'text-slate-400'}`} />
                {cfg.label.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* HIGHLIGHTED SUB-TITLE CARD FOR THE SELECTED AGE */}
      <div className={`p-4 rounded-3xl border ${activeAgeConfig.border} ${activeAgeConfig.bg} text-left space-y-1`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-lime-650 animate-pulse" />
            <p className="text-xs font-black uppercase tracking-wider text-slate-850">
              {activeAgeConfig.label} Presentation Model
            </p>
          </div>
          <button
            onClick={() => setIsSimulatorEnabled(!isSimulatorEnabled)}
            className={`text-[9.5px] font-black uppercase tracking-wider px-3 py-1 rounded-xl border transition-all cursor-pointer ${
              isSimulatorEnabled
                ? 'bg-lime-500 border-lime-500 text-slate-950 font-black shadow-xs'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-650'
            }`}
          >
            {isSimulatorEnabled ? 'Close Sandbox' : 'Open Diagnostic Sandbox'}
          </button>
        </div>
        <p className="text-[11px] text-slate-500 leading-normal font-medium">
          {activeAgeConfig.sub}. {isSimulatorEnabled 
            ? "Tweak checkpoints below to simulate a wide array of neurodivergent profiles and notice instant dial feedback."
            : "Click 'Open Diagnostic Sandbox' or adjust the sliders to dynamically customize the 4 clinical metrics below!"}
        </p>
      </div>

      {/* THE 4 CUSTOM CLINICAL SCALE CARDS (Bento Grid layout matching high-fidelity UI design) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {activeAgeConfig.scales.map((scale) => {
          const score = getScaleScore(scale);
          const feedback = getScaleFeedback(scale, score);
          const isHovered = hoveredCard === scale.id;

          return (
            <motion.div
              key={scale.id}
              onMouseEnter={() => setHoveredCard(scale.id)}
              onMouseLeave={() => setHoveredCard(null)}
              animate={{
                y: isHovered ? -5 : 0,
                boxShadow: isHovered 
                  ? '0 16px 36px rgba(132, 204, 22, 0.08)' 
                  : '0 4px 14px rgba(0, 0, 0, 0.01)'
              }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`bg-white border border-[#edf7f2] rounded-[32px] p-6 flex flex-col justify-between transition-colors relative overflow-hidden text-left ${
                isSimulatorEnabled ? 'ring-1 ring-lime-150/30' : ''
              }`}
              style={{ contentVisibility: 'auto' }}
            >
              {isSimulatorEnabled && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-lime-400" />
              )}

              <div className="space-y-5">
                {/* Badge and Max Score */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1 text-left">
                    <div className="inline-flex bg-[#f7fee7] border border-lime-200 rounded-full px-2.5 py-0.5 text-lime-700 font-extrabold text-[9px] uppercase tracking-wider">
                      Scale {scale.scaleNum}
                    </div>
                    <h5 className="font-sans font-black text-[15px] sm:text-[16px] text-slate-900 tracking-tight leading-tight pt-1">
                      {scale.name}
                    </h5>
                  </div>

                  <div className="text-right">
                    <span className="text-[28px] font-black text-[#1e293b] font-display leading-none tracking-tight block">
                      {score}
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-widest block mt-0.5">
                      of {scale.maxScore} limit
                    </span>
                  </div>
                </div>

                {/* Circular Indicator Dial */}
                <div className="flex justify-center py-3 relative">
                  <div className="relative w-[108px] h-[108px] flex items-center justify-center">
                    <svg viewBox="0 0 112 112" className="w-full h-full transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        className="stroke-[#f1f5f9] fill-none"
                        strokeWidth="9"
                      />
                      <motion.circle
                        cx="56"
                        cy="56"
                        r="46"
                        className="stroke-[#84cc16] fill-none"
                        strokeWidth="9"
                        strokeDasharray={2 * Math.PI * 46}
                        initial={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - feedback.percent / 100) }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - feedback.percent / 100) }}
                        transition={{ type: "spring", stiffness: 60, damping: 15 }}
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Dial Overlay values */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                      <motion.span 
                        key={feedback.percent}
                        initial={{ scale: 0.9, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-[21px] font-black text-slate-900 font-sans tracking-tight leading-none"
                      >
                        {feedback.percent}%
                      </motion.span>
                      <span className="text-[8px] text-slate-800 font-black uppercase tracking-wider mt-1.5 text-center px-1">
                        {scale.gaugeLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Severity Rating dot & Evaluates parameter */}
                <div className="space-y-2 pt-2 border-t border-slate-50 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${feedback.dotColor}`} />
                    <span className={`text-[11.5px] font-black leading-none ${feedback.textColor}`}>
                      {feedback.status}
                    </span>
                  </div>
                  
                  <p className="text-[10.5px] text-slate-400 font-medium leading-relaxed">
                    {scale.evaluates}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* DYNAMIC DIAGNOSTIC SANDBOX WORKSPACE (Shown when sandbox mode is activated) */}
      <AnimatePresence>
        {isSimulatorEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-slate-50 border border-slate-200/50 rounded-[28px] p-5 sm:p-7 space-y-6 text-left mt-2">
              <div className="flex items-center justify-between border-b pb-3.5 border-slate-200/50 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-lime-650" />
                  <h5 className="text-[10.5px] font-black uppercase tracking-wider text-slate-750">
                    Symptom Rating Playground &mdash; {activeAgeConfig.label} Mode
                  </h5>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="text-[9px] font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                    title="Load dynamic clinical baseline variations"
                  >
                    <RotateCcw className="w-2.5 h-2.5 text-slate-400" />
                    Simulate Variations
                  </button>
                  <span className="text-[8px] font-black uppercase tracking-widest bg-lime-100 text-lime-800 border border-lime-200 px-2 py-0.5 rounded-md">
                    Real-Time Calculated
                  </span>
                </div>
              </div>

              {/* Grid of Sliders for the active age profile */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Split the scales 2 and 2 */}
                {[0, 1].map((colIdx) => {
                  const scalesToRender = colIdx === 0 
                    ? activeAgeConfig.scales.slice(0, 2) 
                    : activeAgeConfig.scales.slice(2, 4);

                  return (
                    <div key={colIdx} className="space-y-6">
                      {scalesToRender.map((scale) => (
                        <div key={scale.id} className="space-y-3">
                          <div className="flex items-center gap-1.5 border-b pb-1 border-slate-200/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-lime-600" />
                            <h6 className="text-[10px] font-black uppercase tracking-wider text-slate-450">
                              {scale.name} checkpoints
                            </h6>
                          </div>

                          <div className="space-y-3.5">
                            {scale.checkpoints.map((cp) => {
                              const value = simulatedResponses[cp.id] ?? 2;
                              const choice = CHOICES.find(c => c.value === value) || CHOICES[2];

                              return (
                                <div key={cp.id} className="bg-white p-3 border border-slate-150/40 rounded-2xl">
                                  <div className="flex justify-between items-start gap-3">
                                    <div className="text-left">
                                      <span className="text-[11px] font-bold text-slate-800 leading-tight block">
                                        {cp.label}
                                      </span>
                                      <span className="text-[9.5px] text-slate-450 font-medium block mt-0.5 leading-snug">
                                        {cp.description}
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-extrabold uppercase tracking-wide text-lime-700 bg-lime-50 border border-lime-150 px-2 py-0.5 rounded-lg shrink-0">
                                      {choice.label}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3 pt-2">
                                    <span className="text-[9px] font-bold text-slate-400 font-mono">Never</span>
                                    <input
                                      type="range"
                                      min="0"
                                      max="4"
                                      step="1"
                                      value={value}
                                      onChange={(e) => {
                                        const newVal = parseInt(e.target.value);
                                        setSimulatedResponses(prev => ({
                                          ...prev,
                                          [cp.id]: newVal
                                        }));
                                      }}
                                      className="w-full accent-lime-500 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-[9px] font-bold text-slate-400 font-mono">Very Often</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Educational info block */}
              <div className="bg-lime-50/15 border border-lime-150 p-4 rounded-2xl text-left space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-lime-650" />
                  <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">Clinical Insight Tracker</span>
                </div>
                <p className="text-[10.5px] text-slate-500 leading-relaxed font-medium">
                  {selectedAge === 'child' && "Child presentation is heavily physical and motor-driven. Inattentive markers appear primarily as homework follow-through and instruction slips."}
                  {selectedAge === 'teen' && "Teenager symptoms shift into social friction, digital screen micro-switching distraction loop, late-night sleep disruptions, and severe academic procrastination."}
                  {selectedAge === 'adult' && "Adult ADHD is largely cognitive. Rather than physical bouncing, adults experience prioritization paralysis, time blindness, inner restlessness, and rejection sensitivity."}
                </p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lifespan Comparative Progress Rails */}
      <div className="p-5 rounded-[24px] border border-[#edf7f2] bg-slate-50/40 space-y-4 text-left">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h5 className="text-[10.5px] font-black text-slate-700 uppercase tracking-wider">
            Dimension Profile Overview &mdash; {activeAgeConfig.label}
          </h5>
          <span className="text-[9px] text-slate-450 font-bold uppercase tracking-widest">
            Cross-Scale Weighting
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {activeAgeConfig.scales.map((scale) => {
            const score = getScaleScore(scale);
            const { percent, textColor } = getScaleFeedback(scale, score);

            return (
              <div key={scale.id} className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>{scale.name}</span>
                  <span className={`font-mono font-black ${textColor}`}>{percent}% ({score}/{scale.maxScore})</span>
                </div>
                <div className="bg-slate-200/60 h-2.5 rounded-full overflow-hidden">
                  <motion.div 
                    className="bg-lime-500 h-full rounded-full" 
                    initial={{ width: `${percent}%` }}
                    animate={{ width: `${percent}%` }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
