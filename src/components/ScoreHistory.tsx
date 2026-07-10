import { useState, useEffect, MouseEvent } from 'react';
import { Trash2, Calendar, FileText, TrendingUp, Loader2 } from 'lucide-react';
import { ScoreBreakdown } from '../types';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface HistoryRecord extends ScoreBreakdown {
  id: string;
  createdAt: string; // ISO date string
  responses: { questionId: number; score: number }[];
  age?: number;
  country?: string;
  gender?: string;
}

interface ScoreHistoryProps {
  onSelectHistoricalReport: (record: HistoryRecord) => void;
  refreshTrigger: number;
  userId: string | null;
}

export default function ScoreHistory({ onSelectHistoricalReport, refreshTrigger, userId }: ScoreHistoryProps) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch history reactively from Firestore + Local Storage Fallback
  useEffect(() => {
    let active = true;
    
    async function loadHistory() {
      setLoading(true);
      try {
        // Use either user UID or a unique guest identifier
        const devId = localStorage.getItem('adhd_terminal_device_id') || 'g_guest';
        const currentUserId = userId || devId;

        const q = query(
          collection(db, 'scores'),
          where('userId', '==', currentUserId)
        );
        const querySnapshot = await getDocs(q);
        
        if (!active) return;

        const records: HistoryRecord[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          records.push({
            id: docSnap.id,
            createdAt: data.createdAt || new Date().toISOString(),
            totalScore: data.totalScore,
            probability: data.probability,
            partAScore: data.partAScore,
            isPartAPositive: data.isPartAPositive,
            inattentionScore: data.inattentionScore,
            hyperactivityScore: data.hyperactivityScore,
            responses: data.responses || [],
            age: data.age,
            country: data.country,
            gender: data.gender
          });
        });

        records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setHistory(records);
        
        // Sync to local storage for local offline caching
        localStorage.setItem('adhd_local_scores_log', JSON.stringify(records));
      } catch (err) {
        console.error("Error reading diagnostic archives from Firestore, falling back to local storage:", err);
        // Fallback to local storage
        if (!active) return;
        const storedStr = localStorage.getItem('adhd_local_scores_log');
        if (storedStr) {
          const records = JSON.parse(storedStr) as HistoryRecord[];
          records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setHistory(records);
        } else {
          setHistory([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHistory();
    
    return () => {
      active = false;
    };
  }, [userId, refreshTrigger]);

  const handleDelete = async (e: MouseEvent, recordId: string) => {
    e.stopPropagation();
    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, 'scores', recordId));

      // 2. Filter local state
      const filtered = history.filter(r => r.id !== recordId);
      setHistory(filtered);
      
      // 3. Sync local storage
      localStorage.setItem('adhd_local_scores_log', JSON.stringify(filtered));
    } catch (err) {
      console.error("Error deleting record from Firestore:", err);
    }
  };

  const handleClearAll = async () => {
    const confirmationText = "Wipe all persistent saved medical metrics on this device and cloud account?";
    if (window.confirm(confirmationText)) {
      try {
        setLoading(true);
        const devId = localStorage.getItem('adhd_terminal_device_id') || 'g_guest';
        const currentUserId = userId || devId;

        const q = query(
          collection(db, 'scores'),
          where('userId', '==', currentUserId)
        );
        const querySnapshot = await getDocs(q);
        
        const deletePromises = querySnapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
        await Promise.all(deletePromises);

        localStorage.removeItem('adhd_local_scores_log');
        setHistory([]);
      } catch (err) {
        console.error("Error clearing all records:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-3xl border border-dashed border-lime-200 text-center space-y-3 bg-[#f9fefb] flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 text-lime-500 animate-spin" />
        <p className="text-[10px] text-slate-500 font-bold">Synchronizing Cloud Diagnostics...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-6 rounded-3xl border border-dashed border-lime-200 text-center space-y-3 bg-[#f9fefb]">
        <FileText className="w-8 h-8 text-lime-400 mx-auto animate-pulse" />
        <h4 className="text-xs font-bold text-slate-800">No diagnostic logs found</h4>
        <p className="text-[11px] text-slate-500 max-w-sm mx-auto select-text">
          No saved sessions found. Sessions you complete will be automatically backed up to your secure cloud space.
        </p>
      </div>
    );
  }

  // Draw simple SVG line chart from history (oldest to newest)
  const chartRecords = [...history].reverse();
  const maxScore = 44;
  const padding = 15;
  const chartWidth = 320;
  const chartHeight = 110;
  const stepX = chartRecords.length > 1 ? (chartWidth - padding * 2) / (chartRecords.length - 1) : 0;

  const points = chartRecords.map((r, index) => {
    const x = padding + index * stepX;
    const y = chartHeight - padding - (r.totalScore / maxScore) * (chartHeight - padding * 2);
    return { x, y, score: r.totalScore, prob: r.probability };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div className="space-y-5">
      
      {/* Historical Trend Line Graph (Clinical Bento Grid Style) */}
      {history.length > 1 && (
        <div className="p-4 rounded-3xl border border-lime-100 bg-lime-50/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lime-800">
              <TrendingUp className="w-4 h-4 text-lime-600" />
              <h4 className="text-xs font-black uppercase tracking-wider">Historical Focus Trend</h4>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal select-text">
            Visualized progression map of focus limits and restless symptoms recorded on this device terminal.
          </p>

          <div className="flex justify-center py-1">
            <div className="relative w-full max-w-sm bg-white p-3 rounded-2xl border border-lime-100 shadow-xs">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                {/* Reference Baseline Gridlines */}
                <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#f1f5f9" strokeWidth="1" />
                <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <text x={padding} y={padding - 3} className="fill-slate-350 text-[8px] font-bold">44 Max Benchmark Index (High score is 26+)</text>
                
                {/* SVG Trend Path in Lime */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#84cc16"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Circles for Individual Dots */}
                {points.map((p, idx) => {
                  const isHigh = p.score >= 26;
                  const isMod = p.score >= 16 && p.score < 26;
                  const dotColor = isHigh ? '#84cc16' : isMod ? '#f59e0b' : '#94a3b8';
                  return (
                    <g key={idx}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill={dotColor}
                        className="stroke-white"
                        strokeWidth="1.5"
                      />
                      <text
                        x={p.x}
                        y={p.y - 8}
                        textAnchor="middle"
                        className="fill-slate-700 text-[8px] font-bold font-mono"
                      >
                        {p.score}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}



      {/* Accordion List of saved results */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Recorded Sessions ({history.length})
          </h4>
          <button 
            onClick={handleClearAll}
            className="text-[9px] text-red-500 hover:text-red-700 font-extrabold uppercase tracking-wider bg-red-50 px-2.2 py-1 rounded"
          >
            Wipe All
          </button>
        </div>

        <div className="space-y-2">
          {history.map((record) => {
            const dateStr = new Date(record.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            const isHigh = record.totalScore >= 26;
            const isMod = record.totalScore >= 16 && record.totalScore < 26;
            
            return (
              <div 
                key={record.id}
                className="rounded-2xl border border-lime-100 bg-white/70 overflow-hidden shadow-xs hover:shadow-sm hover:border-lime-250 transition-all duration-200"
              >
                {/* Header Summary */}
                <div className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-lime-50 rounded-xl border border-lime-100 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-lime-600" />
                    </div>
                    <div>
                      <div className="font-extrabold text-[11px] text-slate-800 leading-tight">
                        {dateStr}
                      </div>
                      <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider mt-0.5 select-text">
                        Focus Score: <b className="text-lime-700">{record.totalScore}/44</b>
                        {record.age && ` • ${record.age}yo`}
                        {record.country && ` • ${record.country}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className={`text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block ${
                        isHigh ? 'bg-lime-50 text-lime-800 border border-lime-200' : isMod ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-50 text-slate-500 border border-slate-150'
                      }`}>
                        {record.probability} Probability
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onSelectHistoricalReport(record)}
                        className="text-[9px] font-bold text-lime-800 bg-lime-50 hover:bg-lime-100 px-2 py-1 rounded-lg border border-lime-200 cursor-pointer"
                        title="Load Session"
                      >
                        Load
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, record.id)}
                        className="p-1 text-slate-350 hover:text-red-500 rounded"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
