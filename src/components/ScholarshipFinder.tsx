import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Calendar, 
  Bookmark, 
  ExternalLink, 
  SlidersHorizontal, 
  Sparkles, 
  Info, 
  Check, 
  AlertCircle,
  Clock,
  Briefcase,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../types';

interface Scholarship {
  name: string;
  provider: string;
  amountPerYear: string;
  deadline: string;
  eligibility: string;
  applyUrl: string;
  matchScore: number;
  requiresFinancialNeed: boolean;
}

interface ScholarshipFinderProps {
  user: UserProfile | null;
  setActiveTab: (tab: string) => void;
}

const AVAILABLE_COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'Singapore',
  'Netherlands'
];

export default function ScholarshipFinder({ user, setActiveTab }: ScholarshipFinderProps) {
  // Filters State
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [degreeLevel, setDegreeLevel] = useState<'UG' | 'PG' | 'PhD'>('UG');
  const [budgetNeed, setBudgetNeed] = useState<'Yes' | 'No' | 'Partial'>('Yes');

  // Results & API State
  const [loading, setLoading] = useState<boolean>(false);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Sorting
  const [sortBy, setSortBy] = useState<'match' | 'deadline' | 'amount'>('match');

  // Bookmarking / Saved
  const [savedScholarships, setSavedScholarships] = useState<Scholarship[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);

  // Auto-fill from user profile
  useEffect(() => {
    let profile: UserProfile | null = user;
    if (!profile) {
      const savedUser = localStorage.getItem('get_user');
      if (savedUser) {
        try {
          profile = JSON.parse(savedUser);
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (profile) {
      // Countries
      if (profile.targetCountries && profile.targetCountries.length > 0) {
        // Map targetCountries strings to match AVAILABLE_COUNTRIES if possible, otherwise keep them
        const matchedCountries = AVAILABLE_COUNTRIES.filter(c => 
          profile?.targetCountries.some(tc => tc.toLowerCase().includes(c.toLowerCase()))
        );
        setSelectedCountries(matchedCountries.length > 0 ? matchedCountries : [AVAILABLE_COUNTRIES[0]]);
      } else {
        setSelectedCountries([AVAILABLE_COUNTRIES[0]]);
      }

      // Degree
      const deg = (profile.targetDegree || '').toLowerCase();
      if (deg.includes('post') || deg.includes('pg') || deg.includes('master') || deg.includes('ms')) {
        setDegreeLevel('PG');
      } else if (deg.includes('phd') || deg.includes('doctor')) {
        setDegreeLevel('PhD');
      } else {
        setDegreeLevel('UG');
      }

      // Budget Need mapping
      const budget = (profile.budgetRange || '').toLowerCase();
      if (budget.includes('under_15') || budget.includes('15_30') || budget.includes('need') || budget.includes('low')) {
        setBudgetNeed('Yes');
      } else if (budget.includes('no_need') || budget.includes('high') || budget.includes('above_50')) {
        setBudgetNeed('No');
      } else {
        setBudgetNeed('Partial');
      }
    } else {
      // Defaults
      setSelectedCountries(['United States', 'United Kingdom']);
      setDegreeLevel('UG');
      setBudgetNeed('Yes');
    }
  }, [user]);

  // Load Saved Scholarships from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('get_scholarships');
    if (saved) {
      try {
        setSavedScholarships(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse get_scholarships from localStorage', e);
      }
    }
  }, []);

  // Toggle country selection
  const handleToggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      if (selectedCountries.length > 1) {
        setSelectedCountries(selectedCountries.filter(c => c !== country));
      }
    } else {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = (item: Scholarship) => {
    const isSaved = savedScholarships.some(s => s.name === item.name);
    let updated: Scholarship[];
    if (isSaved) {
      updated = savedScholarships.filter(s => s.name !== item.name);
    } else {
      updated = [...savedScholarships, item];
    }
    setSavedScholarships(updated);
    localStorage.setItem('get_scholarships', JSON.stringify(updated));
  };

  // Call Gemini API to search scholarships
  const handleFindScholarships = async () => {
    setLoading(true);
    setApiError(null);
    setHasSearched(true);

    // Profile details
    let board = 'CBSE';
    let gpa = '90%';
    let major = 'STEM';
    if (user) {
      board = user.board;
      gpa = `${user.gpa} (${user.gradingSystem === 'cgpa' ? 'CGPA' : 'Percentage'})`;
      major = user.preferredMajors ? user.preferredMajors.join(', ') : 'STEM';
    } else {
      const savedUser = localStorage.getItem('get_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          board = parsed.board;
          gpa = `${parsed.gpa} (${parsed.gradingSystem === 'cgpa' ? 'CGPA' : 'Percentage'})`;
          major = parsed.preferredMajors ? parsed.preferredMajors.join(', ') : 'STEM';
        } catch (e) {
          console.error(e);
        }
      }
    }

    try {
      const response = await fetch('/api/scholarship-finder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          degree: degreeLevel === 'UG' ? 'Undergraduate' : degreeLevel === 'PG' ? 'Postgraduate' : 'PhD',
          major,
          countries: selectedCountries,
          budget: budgetNeed === 'Yes' ? 'Full financial aid' : budgetNeed === 'Partial' ? 'Partial assistance' : 'No financial aid required',
          gpa
        })
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Response is not an array');
      }

      setScholarships(data);
    } catch (e) {
      console.error(e);
      setApiError('Could not load scholarships. Check your API key or try again.');
    } finally {
      setLoading(false);
    }
  };

  // Parse Amount for sorting
  const parseAmount = (amountStr: string): number => {
    const cleaned = amountStr.replace(/[^0-9]/g, '');
    const num = parseInt(cleaned, 10);
    if (isNaN(num)) return 0;
    // If it's something like ₹10,00,000, we can convert or keep as is. Let's return the plain number.
    return num;
  };

  // Sort and Filter Scholarships
  const getProcessedScholarships = () => {
    const listToProcess = showSavedOnly ? savedScholarships : scholarships;

    // Apply sorting
    return [...listToProcess].sort((a, b) => {
      if (sortBy === 'match') {
        return b.matchScore - a.matchScore;
      }
      if (sortBy === 'amount') {
        return parseAmount(b.amountPerYear) - parseAmount(a.amountPerYear);
      }
      if (sortBy === 'deadline') {
        // Simple date comparison or string fallback
        const dateA = new Date(a.deadline).getTime();
        const dateB = new Date(b.deadline).getTime();
        if (isNaN(dateA) && isNaN(dateB)) {
          return a.deadline.localeCompare(b.deadline);
        }
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateA - dateB; // earliest deadline first
      }
      return 0;
    });
  };

  const processedScholarships = getProcessedScholarships();

  return (
    <div className="w-full max-w-6xl" id="scholarships-container">
      {/* Title Header bar */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm" id="scholarships-header">
        <div>
          <h1 className="text-xl font-bold text-[#0A0F2C] tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" /> Scholarships &amp; Financial Aid Finder
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Discover verified international scholarships tailored to your Indian board achievements, GPA, and country choices.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
              showSavedOnly 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            id="btn-saved-filter"
          >
            <Bookmark className="w-3.5 h-3.5" /> Saved ({savedScholarships.length})
          </button>
        </div>
      </div>

      {/* TOP FILTER BAR */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm mb-6 flex flex-col gap-5" id="scholarships-filter-bar">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0A0F2C] uppercase tracking-wider pb-1 border-b border-slate-100">
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" /> Scholarship Matching Parameters
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          {/* Target Countries Multi-Select Chips */}
          <div className="md:col-span-6 flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500">Target Countries (Select multiple)</label>
            <div className="flex flex-wrap gap-1.5" id="country-chips">
              {AVAILABLE_COUNTRIES.map((country) => {
                const isSelected = selectedCountries.includes(country);
                return (
                  <button
                    key={country}
                    onClick={() => handleToggleCountry(country)}
                    className={`py-1.5 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {country} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Degree Level */}
          <div className="md:col-span-3 flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500">Degree Level</label>
            <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl" id="degree-toggles">
              {(['UG', 'PG', 'PhD'] as const).map((level) => {
                const isActive = degreeLevel === level;
                return (
                  <button
                    key={level}
                    onClick={() => setDegreeLevel(level)}
                    className={`py-1.5 text-xs font-bold rounded-lg text-center transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-white text-[#0A0F2C] shadow-sm font-extrabold' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Need */}
          <div className="md:col-span-3 flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500">Need Financial Aid / Support?</label>
            <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl" id="budget-toggles">
              {(['Yes', 'No', 'Partial'] as const).map((opt) => {
                const isActive = budgetNeed === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setBudgetNeed(opt)}
                    className={`py-1.5 text-xs font-bold rounded-lg text-center transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-white text-[#0A0F2C] shadow-sm font-extrabold' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Find Scholarships CTA */}
        <div className="flex justify-end pt-2 border-t border-slate-50">
          <button
            onClick={handleFindScholarships}
            disabled={loading}
            className={`px-6 py-2.5 text-xs font-extrabold rounded-xl text-white shadow-sm flex items-center gap-2 cursor-pointer transition-all ${
              loading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-[#0A0F2C] hover:bg-[#1C254C] active:scale-[0.98]'
            }`}
            id="btn-find-scholarships"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            {loading ? 'Searching opportunities...' : 'Find Match Scholarships'}
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {apiError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-xs font-semibold" id="scholarship-error-banner">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{apiError}</span>
        </div>
      )}

      {/* RESULTS HEADER & SORT CONTROLS */}
      {hasSearched && !loading && !apiError && (
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3" id="results-bar">
          <p className="text-xs font-bold text-slate-500">
            {showSavedOnly 
              ? `Showing ${processedScholarships.length} saved scholarship${processedScholarships.length === 1 ? '' : 's'}`
              : `Found ${processedScholarships.length} highly matched scholarship opportunities`
            }
          </p>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2" id="sort-controls">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-3 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-bold focus:outline-none appearance-none cursor-pointer"
              >
                <option value="match">Match Score</option>
                <option value="deadline">Application Deadline</option>
                <option value="amount">Scholarship Amount</option>
              </select>
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN RESULTS AREA */}

      {/* 1. LOADING SKELETON */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="scholarships-loading-grid">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="bg-white border border-slate-100 p-5 rounded-2xl space-y-4 animate-pulse shadow-sm">
              <div className="flex justify-between items-start">
                <div className="space-y-2 grow">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3.5 bg-slate-100 rounded w-1/2" />
                </div>
                <div className="w-16 h-5 bg-slate-200 rounded-full shrink-0" />
              </div>
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                </div>
                <div className="h-2.5 bg-slate-200 rounded w-full" />
              </div>
              <div className="flex gap-2 pt-2">
                <div className="h-8 bg-slate-200 rounded-lg grow" />
                <div className="h-8 bg-slate-200 rounded-lg w-10 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. BEFORE SEARCH / EMPTY STATE */}
      {!loading && !hasSearched && !showSavedOnly && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-sm flex flex-col items-center justify-center" id="scholarships-empty-state">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 text-indigo-500 rounded-full flex items-center justify-center mb-4">
            <Award className="w-8 h-8 stroke-[1.25]" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Adjust filters and search to find scholarships</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
            Specify your destination target countries, current degree plans, and financial assistance requirements, then click "Find Match Scholarships" to load tailored global opportunities.
          </p>
        </div>
      )}

      {/* 3. SAVED VIEW EMPTY STATE */}
      {!loading && showSavedOnly && processedScholarships.length === 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-sm flex flex-col items-center justify-center" id="saved-empty-state">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <Bookmark className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No saved scholarships yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Bookmarked opportunities will appear here. Click the bookmark icon on any scholarship card to save it.
          </p>
          <button 
            onClick={() => { setShowSavedOnly(false); if (!hasSearched) handleFindScholarships(); }}
            className="mt-4 px-4 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 cursor-pointer"
          >
            Go to Search Tab
          </button>
        </div>
      )}

      {/* 4. CARDS GRID */}
      {!loading && (hasSearched || showSavedOnly) && processedScholarships.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="scholarships-results-grid">
          {processedScholarships.map((item, index) => {
            const isBookmarked = savedScholarships.some(s => s.name === item.name);
            const scoreColorClass = item.matchScore >= 70 
              ? 'bg-emerald-500' 
              : item.matchScore >= 40 
                ? 'bg-amber-500' 
                : 'bg-rose-500';

            const scoreTextClass = item.matchScore >= 70 
              ? 'text-emerald-600' 
              : item.matchScore >= 40 
                ? 'text-amber-600' 
                : 'text-rose-600';

            return (
              <div 
                key={index} 
                className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md hover:border-slate-300/80 transition-all flex flex-col justify-between gap-4" 
                id={`scholarship-card-${index}`}
              >
                {/* Header row */}
                <div>
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="text-[15px] font-bold text-slate-800 leading-snug tracking-tight">
                      {item.name}
                    </h3>
                    <span className="text-[11px] font-extrabold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full shrink-0 border border-emerald-100">
                      {item.amountPerYear}
                    </span>
                  </div>

                  {/* Provider */}
                  <p className="text-[13px] text-slate-500 mt-1 font-medium">
                    {item.provider}
                  </p>
                </div>

                {/* Eligibility criteria summary */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[13px] text-slate-600 leading-relaxed font-sans flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="line-clamp-1 overflow-hidden text-ellipsis">
                    {item.eligibility}
                  </p>
                </div>

                {/* Deadline & Budget Requirement */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-b border-slate-50 py-2.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Deadline: <strong>{item.deadline}</strong></span>
                  </span>
                  
                  {item.requiresFinancialNeed && (
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded">
                      Needs Financial Aid
                    </span>
                  )}
                </div>

                {/* Match Score Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Profile Compatibility</span>
                    <span className={`font-bold ${scoreTextClass}`}>{item.matchScore}% Match</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${scoreColorClass}`} 
                      style={{ width: `${item.matchScore}%` }} 
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-1 mt-auto">
                  <a
                    href={item.applyUrl}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="flex-1 py-2 px-3 text-xs font-bold text-center bg-[#0A0F2C] text-white hover:bg-[#1C254C] rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Apply</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleToggleBookmark(item)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center w-10 shrink-0 ${
                      isBookmarked
                        ? 'bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100'
                        : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-600'
                    }`}
                    title={isBookmarked ? 'Remove Bookmark' : 'Save Scholarship'}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
