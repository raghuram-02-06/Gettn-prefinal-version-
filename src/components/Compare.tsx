import { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  Trash2, 
  Check, 
  Compass, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface College {
  name: string;
  country: string;
  ranking: string;
  avgTuition: string;
  acceptanceRate: string;
  fitScore: number;
  fitReason: string;
  ieltsRequirement?: string;
  scholarshipAvailability?: string;
}

interface CompareProps {
  setActiveTab: (tab: string) => void;
}

// Parsing helpers to compare rows
const parseNumber = (str: string): number => {
  if (!str) return 0;
  const num = str.replace(/[^0-9.]/g, '');
  return parseFloat(num) || 0;
};

const parseRanking = (str: string): number => {
  if (!str) return 9999;
  const matched = str.match(/\d+/);
  if (matched) {
    return parseInt(matched[0]);
  }
  return 9999;
};

export default function Compare({ setActiveTab }: CompareProps) {
  const [colleges, setColleges] = useState<College[]>([]);

  // Load get_colleges from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('get_colleges');
    if (saved) {
      try {
        setColleges(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse get_colleges from localStorage', e);
      }
    }
  }, []);

  // Sync state and localStorage on removal
  const handleRemove = (name: string) => {
    const updated = colleges.filter(c => c.name.toLowerCase() !== name.toLowerCase());
    setColleges(updated);
    localStorage.setItem('get_colleges', JSON.stringify(updated));
  };

  if (colleges.length === 0) {
    return (
      <div className="w-full max-w-4xl py-16 text-center space-y-6 bg-white rounded-2xl border border-slate-100 shadow-sm" id="empty-compare">
        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <ArrowLeftRight className="w-8 h-8 stroke-[1.5]" />
        </div>
        <div className="space-y-2 max-w-sm mx-auto">
          <h2 className="text-lg font-bold text-[#0A0F2C]">Your Comparison Deck is Empty</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-light">
            Before executing side-by-side comparisons, add universities to your shortlisted deck from the college recommendations tab.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('find-colleges')}
          className="px-5 py-2.5 bg-[#0A0F2C] hover:bg-[#1A254C] text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer inline-flex items-center space-x-1.5"
        >
          <Compass className="w-4 h-4" />
          <span>Explore Recommended Colleges</span>
        </button>
      </div>
    );
  }

  // Row comparisons & Best value identification
  // 1. Ranking (Lower is better)
  const bestRankingIdx = colleges.reduce((bestIdx, current, idx, arr) => {
    const bestVal = parseRanking(arr[bestIdx].ranking);
    const currVal = parseRanking(current.ranking);
    return currVal < bestVal ? idx : bestIdx;
  }, 0);

  // 2. Tuition (Lower cost is better)
  const bestTuitionIdx = colleges.reduce((bestIdx, current, idx, arr) => {
    const bestVal = parseNumber(arr[bestIdx].avgTuition);
    const currVal = parseNumber(current.avgTuition);
    return currVal > 0 && currVal < bestVal ? idx : bestIdx;
  }, 0);

  // 3. Acceptance Rate (Higher rate means more accessible/safety choice)
  const bestAcceptanceIdx = colleges.reduce((bestIdx, current, idx, arr) => {
    const bestVal = parseNumber(arr[bestIdx].acceptanceRate);
    const currVal = parseNumber(current.acceptanceRate);
    return currVal > bestVal ? idx : bestIdx;
  }, 0);

  // 4. Fit Score (Higher is better)
  const bestFitIdx = colleges.reduce((bestIdx, current, idx, arr) => {
    return current.fitScore > arr[bestIdx].fitScore ? idx : bestIdx;
  }, 0);

  // 5. IELTS Requirement (Lower score requirement is more accessible)
  const bestIeltsIdx = colleges.reduce((bestIdx, current, idx, arr) => {
    const bestVal = parseNumber(arr[bestIdx].ieltsRequirement || '9.0');
    const currVal = parseNumber(current.ieltsRequirement || '9.0');
    return currVal < bestVal ? idx : bestIdx;
  }, 0);

  // 6. Scholarship Availability (Check if "high" or has favorable terms)
  const getScholarshipScore = (availability?: string): number => {
    if (!availability) return 0;
    const lower = availability.toLowerCase();
    if (lower.includes('high') || lower.includes('full') || lower.includes('up to 100')) return 3;
    if (lower.includes('merit') || lower.includes('yes') || lower.includes('medium')) return 2;
    if (lower.includes('limited') || lower.includes('low')) return 1;
    return 0;
  };

  const bestScholarshipIdx = colleges.reduce((bestIdx, current, idx, arr) => {
    const bestVal = getScholarshipScore(arr[bestIdx].scholarshipAvailability);
    const currVal = getScholarshipScore(current.scholarshipAvailability);
    return currVal > bestVal ? idx : bestIdx;
  }, 0);

  return (
    <div className="w-full max-w-5xl space-y-8 pb-12" id="compare-colleges-tab">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-[#0C1424] to-[#17253D] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden" id="compare-header">
        <div className="absolute right-0 bottom-0 opacity-10 select-none pointer-events-none transform translate-y-4 translate-x-4">
          <ArrowLeftRight className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full tracking-wider uppercase">
            <ArrowLeftRight className="w-3.5 h-3.5 text-teal-400" />
            <span>Side-By-Side Comparison</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Criteria Alignment Matrix
          </h1>
          <p className="text-sm text-slate-200/90 leading-relaxed font-light">
            Evaluate your shortlisted universities side-by-side. The matrix highlights the best values in green to help you identify safety, reach, and affordability targets.
          </p>
        </div>
      </div>

      {/* Comparison Deck Section */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden" id="comparison-deck-table">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="font-bold text-[#0A0F2C] text-sm leading-tight">University Comparison Grid</h2>
            <p className="text-[10px] text-slate-400">Comparing {colleges.length} selected institutions (Max 4)</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('get_colleges');
              setColleges([]);
            }}
            className="px-3 py-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-[10px] font-bold rounded-lg border border-transparent hover:border-rose-100 transition-all cursor-pointer"
          >
            Clear All
          </button>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100">
                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/4">Comparison Criteria</th>
                {colleges.map((col, idx) => (
                  <th key={idx} className="p-5 w-1/4 border-l border-slate-100/80 relative group">
                    <div className="space-y-2 pr-6">
                      <div className="text-[10px] font-extrabold text-indigo-600 tracking-wider uppercase">
                        {col.country}
                      </div>
                      <div className="font-extrabold text-slate-800 text-sm leading-snug">
                        {col.name}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(col.name)}
                      className="absolute right-4 top-5 p-1 text-slate-300 hover:text-rose-500 rounded-md hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                      title="Remove from comparison"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </th>
                ))}
                {/* Pad table with empty headers if < 4 colleges */}
                {Array.from({ length: Math.max(0, 3 - colleges.length) }).map((_, idx) => (
                  <th key={`empty-h-${idx}`} className="p-5 w-1/4 border-l border-slate-100/50 bg-slate-50/20 text-center">
                    <span className="text-[10px] font-medium text-slate-300 italic">Empty Slot</span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              
              {/* Row 1: World Ranking */}
              <tr className="hover:bg-slate-50/30">
                <td className="p-5 font-bold text-slate-600">World Ranking</td>
                {colleges.map((col, idx) => {
                  const isBest = idx === bestRankingIdx;
                  return (
                    <td 
                      key={idx} 
                      className={`p-5 border-l border-slate-100/60 font-semibold text-slate-800 ${
                        isBest ? 'bg-emerald-50 text-emerald-700 font-extrabold' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        {isBest && <Check className="w-4 h-4 shrink-0 text-emerald-600" />}
                        <span>{col.ranking}</span>
                      </div>
                    </td>
                  );
                })}
                {Array.from({ length: Math.max(0, 3 - colleges.length) }).map((_, idx) => (
                  <td key={`empty-r1-${idx}`} className="p-5 border-l border-slate-100/40 bg-slate-50/10"></td>
                ))}
              </tr>

              {/* Row 2: Average Tuition Fee */}
              <tr className="hover:bg-slate-50/30">
                <td className="p-5 font-bold text-slate-600">Average Tuition Fee</td>
                {colleges.map((col, idx) => {
                  const isBest = idx === bestTuitionIdx;
                  return (
                    <td 
                      key={idx} 
                      className={`p-5 border-l border-slate-100/60 font-semibold text-slate-800 ${
                        isBest ? 'bg-emerald-50 text-emerald-700 font-extrabold' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        {isBest && <Check className="w-4 h-4 shrink-0 text-emerald-600" />}
                        <span>{col.avgTuition}</span>
                      </div>
                    </td>
                  );
                })}
                {Array.from({ length: Math.max(0, 3 - colleges.length) }).map((_, idx) => (
                  <td key={`empty-r2-${idx}`} className="p-5 border-l border-slate-100/40 bg-slate-50/10"></td>
                ))}
              </tr>

              {/* Row 3: Acceptance Rate */}
              <tr className="hover:bg-slate-50/30">
                <td className="p-5 font-bold text-slate-600">Acceptance Rate</td>
                {colleges.map((col, idx) => {
                  const isBest = idx === bestAcceptanceIdx;
                  return (
                    <td 
                      key={idx} 
                      className={`p-5 border-l border-slate-100/60 font-semibold text-slate-800 ${
                        isBest ? 'bg-emerald-50 text-emerald-700 font-extrabold' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        {isBest && <Check className="w-4 h-4 shrink-0 text-emerald-600" />}
                        <span>{col.acceptanceRate}</span>
                      </div>
                    </td>
                  );
                })}
                {Array.from({ length: Math.max(0, 3 - colleges.length) }).map((_, idx) => (
                  <td key={`empty-r3-${idx}`} className="p-5 border-l border-slate-100/40 bg-slate-50/10"></td>
                ))}
              </tr>

              {/* Row 4: Student Fit Match */}
              <tr className="hover:bg-slate-50/30">
                <td className="p-5 font-bold text-slate-600">Student Fit Match</td>
                {colleges.map((col, idx) => {
                  const isBest = idx === bestFitIdx;
                  return (
                    <td 
                      key={idx} 
                      className={`p-5 border-l border-slate-100/60 font-semibold text-slate-800 ${
                        isBest ? 'bg-emerald-50 text-emerald-700 font-extrabold' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        {isBest && <Check className="w-4 h-4 shrink-0 text-emerald-600" />}
                        <span>{col.fitScore}%</span>
                      </div>
                    </td>
                  );
                })}
                {Array.from({ length: Math.max(0, 3 - colleges.length) }).map((_, idx) => (
                  <td key={`empty-r4-${idx}`} className="p-5 border-l border-slate-100/40 bg-slate-50/10"></td>
                ))}
              </tr>

              {/* Row 5: IELTS Requirement */}
              <tr className="hover:bg-slate-50/30">
                <td className="p-5 font-bold text-slate-600">Min IELTS Requirement</td>
                {colleges.map((col, idx) => {
                  const isBest = idx === bestIeltsIdx && col.ieltsRequirement;
                  return (
                    <td 
                      key={idx} 
                      className={`p-5 border-l border-slate-100/60 font-semibold text-slate-800 ${
                        isBest ? 'bg-emerald-50 text-emerald-700 font-extrabold' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        {isBest && <Check className="w-4 h-4 shrink-0 text-emerald-600" />}
                        <span>{col.ieltsRequirement || '7.0 (Estimated)'}</span>
                      </div>
                    </td>
                  );
                })}
                {Array.from({ length: Math.max(0, 3 - colleges.length) }).map((_, idx) => (
                  <td key={`empty-r5-${idx}`} className="p-5 border-l border-slate-100/40 bg-slate-50/10"></td>
                ))}
              </tr>

              {/* Row 6: Scholarship Availability */}
              <tr className="hover:bg-slate-50/30">
                <td className="p-5 font-bold text-slate-600">Scholarships &amp; Funding</td>
                {colleges.map((col, idx) => {
                  const isBest = idx === bestScholarshipIdx && col.scholarshipAvailability;
                  return (
                    <td 
                      key={idx} 
                      className={`p-5 border-l border-slate-100/60 font-semibold text-slate-800 ${
                        isBest ? 'bg-emerald-50 text-emerald-700 font-extrabold' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        {isBest && <Check className="w-4 h-4 shrink-0 text-emerald-600" />}
                        <span>{col.scholarshipAvailability || 'Merit-Based Grants'}</span>
                      </div>
                    </td>
                  );
                })}
                {Array.from({ length: Math.max(0, 3 - colleges.length) }).map((_, idx) => (
                  <td key={`empty-r6-${idx}`} className="p-5 border-l border-slate-100/40 bg-slate-50/10"></td>
                ))}
              </tr>

              {/* Row 7: Fit Reason summary */}
              <tr className="hover:bg-slate-50/30">
                <td className="p-5 font-bold text-slate-600">Counselor Fit Verdict</td>
                {colleges.map((col, idx) => (
                  <td key={idx} className="p-5 border-l border-slate-100/60 font-light italic text-slate-500 text-[11px] leading-relaxed">
                    "{col.fitReason}"
                  </td>
                ))}
                {Array.from({ length: Math.max(0, 3 - colleges.length) }).map((_, idx) => (
                  <td key={`empty-r7-${idx}`} className="p-5 border-l border-slate-100/40 bg-slate-50/10"></td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          <div className="flex items-center space-x-1.5">
            <div className="w-3.5 h-3.5 bg-emerald-100 border border-emerald-300 rounded" />
            <span>Optimal Value Indicator</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <span>Value comparisons are normalized across matching profile variables</span>
          </div>
        </div>

      </div>

    </div>
  );
}
