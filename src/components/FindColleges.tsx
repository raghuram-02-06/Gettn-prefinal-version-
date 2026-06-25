import { useState, useEffect } from 'react';
import { 
  Compass, 
  Search, 
  ArrowLeftRight, 
  CheckCircle, 
  Plus, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  DollarSign, 
  MapPin, 
  Award,
  BookOpen
} from 'lucide-react';
import { UserProfile } from '../types';

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

interface FindCollegesProps {
  user: UserProfile;
  setActiveTab: (tab: string) => void;
}

const getCountryFlag = (country: string) => {
  const normalized = country.toLowerCase();
  if (normalized.includes('united states') || normalized.includes('us')) return '🇺🇸';
  if (normalized.includes('united kingdom') || normalized.includes('uk')) return '🇬🇧';
  if (normalized.includes('canada')) return '🇨🇦';
  if (normalized.includes('australia')) return '🇦🇺';
  if (normalized.includes('germany')) return '🇩🇪';
  if (normalized.includes('singapore')) return '🇸🇬';
  if (normalized.includes('ireland')) return '🇮🇪';
  if (normalized.includes('netherlands')) return '🇳🇱';
  return '🌐';
};

export default function FindColleges({ user, setActiveTab }: FindCollegesProps) {
  // 1. Filter States
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedMajor, setSelectedMajor] = useState<string>('');
  const [selectedDegree, setSelectedDegree] = useState<string>('');
  const [selectedBudget, setSelectedBudget] = useState<string>('');

  // 2. Colleges state
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 3. Comparison Shortlist state (loaded from get_colleges)
  const [shortlist, setShortlist] = useState<College[]>([]);

  // Initialize filters from user profile
  useEffect(() => {
    if (user) {
      if (user.targetCountries && user.targetCountries.length > 0) {
        setSelectedCountry(user.targetCountries[0]);
      } else {
        setSelectedCountry('United States');
      }

      if (user.preferredMajors && user.preferredMajors.length > 0) {
        setSelectedMajor(user.preferredMajors[0]);
      } else {
        setSelectedMajor('Computer Science');
      }

      setSelectedDegree(user.targetDegree || 'UG');
      setSelectedBudget(user.budgetRange || '₹20-40 Lakhs/yr');
    }
  }, [user]);

  // Load shortlisted colleges and search results from localStorage on mount
  useEffect(() => {
    const savedShortlist = localStorage.getItem('get_colleges');
    if (savedShortlist) {
      try {
        setShortlist(JSON.parse(savedShortlist));
      } catch (e) {
        console.error('Failed to parse get_colleges from localStorage', e);
      }
    }

    const savedSearchResults = localStorage.getItem('get_find_colleges_results');
    if (savedSearchResults) {
      try {
        setColleges(JSON.parse(savedSearchResults));
      } catch (e) {
        console.error('Failed to parse saved find colleges search results', e);
      }
    }
  }, []);

  // Sync shortlist with localStorage
  const saveShortlist = (updatedList: College[]) => {
    setShortlist(updatedList);
    localStorage.setItem('get_colleges', JSON.stringify(updatedList));
  };

  // Perform search call to backend
  const handleSearch = async () => {
    setLoading(true);
    setError('');

    // Summarize profile for Gemini's contextual matching
    const testScores = user.testsTaken 
      ? Object.entries(user.testsTaken)
          .filter(([_, val]) => val !== undefined)
          .map(([name, val]) => `${name}: ${val}`)
          .join(', ')
      : 'None';

    const profileSummary = `GPA is ${user.gpa}/4.0 (Indian converted) in ${user.stream} stream under ${user.board} board system. Standardized tests taken: ${testScores}. Target countries of interest: ${user.targetCountries?.join(', ') || 'N/A'}. Budget range limits: ${user.budgetRange}.`;

    try {
      const response = await fetch('/api/colleges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: selectedCountry,
          major: selectedMajor,
          degree: selectedDegree,
          budget: selectedBudget,
          profileSummary
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Server error recommending universities');
      }

      const data = await response.json();
      if (data && data.colleges) {
        setColleges(data.colleges);
        localStorage.setItem('get_find_colleges_results', JSON.stringify(data.colleges));
      } else {
        throw new Error('Received empty or invalid college suggestion payload');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to search for colleges. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle shortlisting card for comparison
  const handleToggleShortlist = (college: College) => {
    const isAlreadyIn = shortlist.some(c => c.name.toLowerCase() === college.name.toLowerCase());
    if (isAlreadyIn) {
      const updated = shortlist.filter(c => c.name.toLowerCase() !== college.name.toLowerCase());
      saveShortlist(updated);
    } else {
      if (shortlist.length >= 4) {
        alert('You can compare a maximum of 4 universities at a time.');
        return;
      }
      saveShortlist([...shortlist, college]);
    }
  };

  // Helper to determine fit color
  const getFitColor = (score: number) => {
    if (score >= 70) return { bg: 'bg-emerald-500', text: 'text-emerald-700', bgLight: 'bg-emerald-50' };
    if (score >= 40) return { bg: 'bg-amber-500', text: 'text-amber-700', bgLight: 'bg-amber-50' };
    return { bg: 'bg-rose-500', text: 'text-rose-700', bgLight: 'bg-rose-50' };
  };

  return (
    <div className="w-full max-w-5xl space-y-8 pb-12" id="find-colleges-tab">
      
      {/* Header Panel */}
      <div className="bg-gradient-to-r from-[#0E1525] to-[#1E2E4B] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden" id="find-header">
        <div className="absolute right-0 bottom-0 opacity-10 select-none pointer-events-none transform translate-y-4 translate-x-4">
          <Compass className="w-60 h-60 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>AI University Curator</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Discover Global Universities
          </h1>
          <p className="text-sm text-slate-200/90 leading-relaxed font-light">
            Find recommended institutions tailored precisely to your profile, budget constraints, and academic aspirations. Shortlist the best ones to perform side-by-side criteria comparisons.
          </p>
        </div>
      </div>

      {/* Filter Dashboard */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6" id="filter-dashboard">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Refine College Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Target Country */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0A0F2C] focus:ring-1 focus:ring-[#0A0F2C]/10 transition-all"
            >
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="Singapore">Singapore</option>
              <option value="Ireland">Ireland</option>
              <option value="Netherlands">Netherlands</option>
            </select>
          </div>

          {/* Academic Major */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Preferred Major</label>
            <input
              type="text"
              placeholder="e.g. Computer Science"
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0A0F2C]"
            />
          </div>

          {/* Target Degree */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Degree Level</label>
            <select
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0A0F2C]"
            >
              <option value="UG">Undergraduate (UG)</option>
              <option value="PG">Postgraduate (PG)</option>
              <option value="PhD">Doctorate (PhD)</option>
            </select>
          </div>

          {/* Budget Range limits */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Budget Limit (Yr)</label>
            <input
              type="text"
              placeholder="e.g. ₹20-40 Lakhs/yr"
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0A0F2C]"
            />
          </div>

        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="px-5 py-2.5 bg-[#0A0F2C] hover:bg-[#1A254C] disabled:bg-slate-200 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Search &amp; Match Universities</span>
          </button>
        </div>
      </div>

      {/* Error Panel */}
      {error && (
        <div className="bg-rose-50 border border-rose-200/60 rounded-xl p-4 flex items-start space-x-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Suggested Colleges List (2-column grid) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-base">Recommended Institutions</h2>
          <span className="text-xs text-slate-400 font-medium">Found {colleges.length} matches</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-[#0A0F2C]">Querying Global Institutional Records...</p>
              <p className="text-[10px] text-slate-400">Gemini is running alignment matrices against tuition, requirements, and profiles.</p>
            </div>
          </div>
        ) : colleges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {colleges.map((college, idx) => {
              const colors = getFitColor(college.fitScore);
              const isShortlisted = shortlist.some(c => c.name.toLowerCase() === college.name.toLowerCase());

              return (
                <div 
                  key={idx}
                  className={`bg-white rounded-2xl p-6 border ${isShortlisted ? 'border-indigo-400 ring-2 ring-indigo-50 shadow-sm' : 'border-slate-100'} hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Name, Flag & World Rank badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl" title={college.country}>
                            {getCountryFlag(college.country)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {college.country}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-[#0A0F2C] text-sm leading-snug">
                          {college.name}
                        </h3>
                      </div>
                      <span className="shrink-0 bg-slate-100 text-[#0A0F2C] text-[10px] font-bold px-2 py-1 rounded">
                        Rank {college.ranking}
                      </span>
                    </div>

                    {/* Meta stats */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Avg Tuition</span>
                        <span className="text-xs font-extrabold text-slate-800">{college.avgTuition}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Acceptance</span>
                        <span className="text-xs font-extrabold text-slate-800">{college.acceptanceRate}</span>
                      </div>
                    </div>

                    {/* Fit Score Progress bar & reason */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-400 uppercase tracking-wider">Student Fit Match</span>
                        <span className={`${colors.text}`}>{college.fitScore}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${colors.bg}`} style={{ width: `${college.fitScore}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-500 font-light italic leading-relaxed">
                        "{college.fitReason}"
                      </p>
                    </div>
                  </div>

                  {/* Add / Remove from shortlist button */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleToggleShortlist(college)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                        isShortlisted 
                          ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100' 
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isShortlisted ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Shortlisted</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Shortlist for Compare</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-14 px-8 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 bg-indigo-50 text-[#0A0F2C]/60 rounded-full flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-xs">Begin Your Search</h3>
              <p className="text-[10px] text-slate-400 font-light max-w-sm mx-auto leading-relaxed">
                Tune the criteria constraints above to search recommended universities matching your board, GPA scale, tests, and target degree level.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Floating compare button */}
      {shortlist.length >= 2 && (
        <div className="fixed bottom-14 right-8 z-50 animate-bounce">
          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className="px-5 py-3 bg-indigo-600 text-white font-extrabold text-xs rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center space-x-2 cursor-pointer border border-indigo-500"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Compare Shortlist ({shortlist.length})</span>
          </button>
        </div>
      )}

    </div>
  );
}
