import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FileText, 
  AlertCircle, 
  Check, 
  RotateCcw, 
  ChevronDown, 
  Award, 
  Trash2, 
  Save, 
  BookOpen, 
  ArrowRight,
  Bookmark,
  CheckCircle2,
  BookmarkCheck
} from 'lucide-react';
import { UserProfile } from '../types';

interface EssayCoachProps {
  user: UserProfile | null;
  setActiveTab: (tab: string) => void;
}

interface EssayFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  rewrittenOpening: string;
  suggestedWordCount: number;
}

interface SavedEssay {
  essayType: string;
  universityName: string;
  wordLimit: number;
  draft: string;
  feedback: EssayFeedback | null;
  savedAt: string;
}

export default function EssayCoach({ user, setActiveTab }: EssayCoachProps) {
  // Form State
  const [essayType, setEssayType] = useState<string>('Personal Statement');
  const [universityName, setUniversityName] = useState<string>('');
  const [wordLimit, setWordLimit] = useState<number>(650);
  const [draft, setDraft] = useState<string>('');

  // Results & API State
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Saved Drafts State
  const [savedEssays, setSavedEssays] = useState<Record<string, SavedEssay>>({});
  const [selectedSavedKey, setSelectedSavedKey] = useState<string>('');

  // Load Saved Drafts from localStorage
  useEffect(() => {
    const rawSaved = localStorage.getItem('get_essays');
    if (rawSaved) {
      try {
        setSavedEssays(JSON.parse(rawSaved));
      } catch (e) {
        console.error('Failed to parse get_essays from localStorage', e);
      }
    }
  }, []);

  // Update current word count
  const getWordCount = (text: string) => {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const currentWordCount = getWordCount(draft);

  // Handle saving to localStorage
  const saveEssay = (updatedFeedback: EssayFeedback | null = feedback, currentDraftValue = draft) => {
    const key = `${essayType}_${universityName.trim() || 'General'}`;
    const newSavedEssay: SavedEssay = {
      essayType,
      universityName: universityName.trim(),
      wordLimit,
      draft: currentDraftValue,
      feedback: updatedFeedback,
      savedAt: new Date().toISOString()
    };

    const updatedEssays = {
      ...savedEssays,
      [key]: newSavedEssay
    };

    setSavedEssays(updatedEssays);
    localStorage.setItem('get_essays', JSON.stringify(updatedEssays));
    setSelectedSavedKey(key);
  };

  // Handle deleting a saved draft
  const deleteSavedEssay = (keyToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this saved draft?')) {
      const updated = { ...savedEssays };
      delete updated[keyToDelete];
      setSavedEssays(updated);
      localStorage.setItem('get_essays', JSON.stringify(updated));
      if (selectedSavedKey === keyToDelete) {
        setSelectedSavedKey('');
      }
    }
  };

  // Select a saved draft and load it
  const handleSelectSavedDraft = (key: string) => {
    if (!key) {
      setSelectedSavedKey('');
      return;
    }
    const essay = savedEssays[key];
    if (essay) {
      setEssayType(essay.essayType);
      setUniversityName(essay.universityName);
      setWordLimit(essay.wordLimit || 650);
      setDraft(essay.draft || '');
      setFeedback(essay.feedback || null);
      setApiError(null);
      setSelectedSavedKey(key);
    }
  };

  // Reset/Clear Form fields
  const handleResetForm = () => {
    if (window.confirm('Clear all fields and start a new draft?')) {
      setEssayType('Personal Statement');
      setUniversityName('');
      setWordLimit(650);
      setDraft('');
      setFeedback(null);
      setApiError(null);
      setSelectedSavedKey('');
    }
  };

  // Perform Gemini API Call
  const handleApiCall = async (isStarter: boolean) => {
    setLoading(true);
    setApiError(null);

    // Context from user profile if available, otherwise read from localStorage directly
    let board = 'CBSE';
    let gpa = '90%';
    let degree = 'Undergraduate';
    let major = 'STEM';

    if (user) {
      board = user.board;
      gpa = `${user.gpa} (${user.gradingSystem === 'cgpa' ? 'CGPA' : 'Percentage'})`;
      degree = user.targetDegree;
      major = user.preferredMajors ? user.preferredMajors.join(', ') : 'STEM';
    } else {
      const savedUser = localStorage.getItem('get_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          board = parsed.board;
          gpa = `${parsed.gpa} (${parsed.gradingSystem === 'cgpa' ? 'CGPA' : 'Percentage'})`;
          degree = parsed.targetDegree;
          major = parsed.preferredMajors ? parsed.preferredMajors.join(', ') : 'STEM';
        } catch (e) {
          console.error(e);
        }
      }
    }

    try {
      const response = await fetch('/api/essay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          essayType,
          universityName: universityName.trim(),
          wordLimit,
          draft: isStarter ? '' : draft,
          board,
          gpa,
          degree,
          major
        })
      });

      if (!response.ok) {
        throw new Error('Server returned error status');
      }

      const data = await response.json();
      
      // Basic type validation of returned object
      if (typeof data !== 'object' || data === null || typeof data.score !== 'number' || !Array.isArray(data.strengths)) {
        throw new Error('AI response format error');
      }

      setFeedback(data);

      // If generating a starter, we can update the draft textarea with the rewritten opening so they can work on it
      let updatedDraft = draft;
      if (isStarter && data.rewrittenOpening) {
        updatedDraft = data.rewrittenOpening;
        setDraft(updatedDraft);
      }

      // Save to localStorage
      const key = `${essayType}_${universityName.trim() || 'General'}`;
      const newSavedEssay: SavedEssay = {
        essayType,
        universityName: universityName.trim(),
        wordLimit,
        draft: updatedDraft,
        feedback: data,
        savedAt: new Date().toISOString()
      };

      const updatedEssays = {
        ...savedEssays,
        [key]: newSavedEssay
      };

      setSavedEssays(updatedEssays);
      localStorage.setItem('get_essays', JSON.stringify(updatedEssays));
      setSelectedSavedKey(key);

    } catch (e) {
      console.error('Failed to analyze essay', e);
      setApiError('AI response error — please try again');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic SVG circle progress ring values
  const score = feedback?.score || 0;
  const radius = 38;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 10) * circumference;

  return (
    <div className="w-full max-w-6xl" id="essay-coach-container">
      {/* Title Header bar */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm" id="essay-coach-header">
        <div>
          <h1 className="text-xl font-bold text-[#0A0F2C] tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Essay Coach &amp; Reviewer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Get personalized reviews, opening hooks rewriting, and structured guidelines matching your profile.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleResetForm}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#0A0F2C] hover:bg-slate-50 border border-slate-200 rounded-lg transition-all cursor-pointer"
            id="btn-reset-form"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Start New
          </button>
        </div>
      </div>

      {/* Main Grid: Left inputs panel, Right feedback panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="essay-coach-grid">
        {/* LEFT PANEL */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-5" id="essay-left-panel">
          
          {/* Saved Drafts selector dropdown */}
          <div className="flex flex-col gap-1.5" id="saved-drafts-section">
            <label className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Saved drafts &amp; outlines</span>
              {selectedSavedKey && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Check className="w-2.5 h-2.5" /> Autosaved
                </span>
              )}
            </label>
            <div className="relative">
              <select
                value={selectedSavedKey}
                onChange={(e) => handleSelectSavedDraft(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg text-slate-700 font-medium transition-all focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">-- Select a saved draft to load --</option>
                {(Object.entries(savedEssays) as [string, SavedEssay][]).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.essayType} - {item.universityName || 'General Feedback'} ({getWordCount(item.draft)} words)
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            {Object.keys(savedEssays).length > 0 && selectedSavedKey && (
              <div className="flex justify-end mt-1">
                <button
                  onClick={(e) => deleteSavedEssay(selectedSavedKey, e)}
                  className="text-[10px] font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  id="btn-delete-saved"
                >
                  <Trash2 className="w-3 h-3" /> Delete this saved draft
                </button>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Essay Type selector */}
          <div className="flex flex-col gap-2" id="essay-type-section">
            <label className="text-xs font-semibold text-slate-500">Essay Type</label>
            <div className="grid grid-cols-2 gap-2" id="essay-type-pills">
              {['Personal Statement', 'Why This University', 'Extracurricular', 'Diversity Essay'].map((type) => {
                const isActive = essayType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setEssayType(type)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all duration-150 cursor-pointer ${
                      isActive 
                        ? 'bg-[#0A0F2C] text-white border-[#0A0F2C] shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inputs Row: University name and Word limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="essay-meta-inputs">
            {/* University Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Target University</label>
              <input
                type="text"
                placeholder="Leave blank for general feedback"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#0A0F2C] focus:ring-2 focus:ring-[#0A0F2C]/10 transition-all"
              />
            </div>

            {/* Word Limit */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Word Limit ({wordLimit} words)</label>
              <input
                type="number"
                min={100}
                max={1000}
                step={50}
                value={wordLimit}
                onChange={(e) => setWordLimit(parseInt(e.target.value) || 650)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#0A0F2C] focus:ring-2 focus:ring-[#0A0F2C]/10 transition-all"
              />
            </div>
          </div>

          {/* Draft text-area */}
          <div className="flex flex-col gap-1.5 grow" id="draft-textarea-section">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-500">Essay Draft Content</label>
              <span className={`text-xs font-bold ${currentWordCount > wordLimit ? 'text-rose-500' : 'text-slate-400'}`}>
                {currentWordCount} / {wordLimit} words
              </span>
            </div>
            <textarea
              placeholder="Paste your draft here, or leave empty to generate a starter outline"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setFeedback(null); // Clear previous results on draft edit to avoid mismatch
              }}
              style={{ minHeight: '220px' }}
              className="w-full p-4 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#0A0F2C] focus:ring-2 focus:ring-[#0A0F2C]/10 font-sans leading-relaxed transition-all grow resize-y"
            />
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3" id="essay-actions">
            <button
              onClick={() => handleApiCall(false)}
              disabled={loading || currentWordCount === 0}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                currentWordCount === 0 || loading
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-[#0A0F2C] text-white hover:bg-[#1C254C] active:bg-[#0A0F2C] shadow-sm'
              }`}
              id="btn-review-draft"
            >
              Review My Draft
            </button>
            <button
              onClick={() => handleApiCall(true)}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-all"
              id="btn-generate-starter"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Generate Starter
            </button>
          </div>

          {/* Red inline error message */}
          {apiError && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center gap-2 text-xs font-semibold animate-pulse" id="essay-api-error">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

        </div>

        {/* RIGHT PANEL: FEEDBACK OUTPUT */}
        <div className="lg:col-span-5 bg-[#F8FAFC] rounded-2xl border border-slate-200/80 p-6 flex flex-col h-full min-h-[400px]" id="essay-right-panel">
          
          {/* 1. LOADING STATE */}
          {loading && (
            <div className="flex flex-col gap-6 items-stretch justify-center h-full grow my-auto py-10" id="essay-loading-state">
              <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm animate-pulse">
                <div className="w-8 h-8 bg-slate-200 rounded-full shrink-0" />
                <div className="grow space-y-1.5">
                  <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-200 rounded w-2/3" />
                </div>
              </div>

              {/* Pulsing Skeleton (3 lines) */}
              <div className="space-y-4 pt-4" id="essay-pulsing-skeleton">
                <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-4/5 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-11/12 animate-pulse" />
              </div>
              <div className="text-center text-xs text-slate-400 font-semibold animate-bounce mt-4">
                Analyzing language registers &amp; structures...
              </div>
            </div>
          )}

          {/* 2. EMPTY STATE (Not loading, and no feedback object) */}
          {!loading && !feedback && (
            <div className="flex flex-col items-center justify-center h-full grow text-center py-16 px-4" id="essay-empty-state">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <BookOpen className="w-8 h-8 stroke-[1.5]" />
              </div>
              <p className="text-xs font-semibold text-slate-400" id="empty-state-text">
                Your AI feedback will appear here
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                Select your essay parameters, paste your draft, and click review to receive comprehensive metrics and opening paragraph improvement ideas.
              </p>
            </div>
          )}

          {/* 3. RESULTS STATE */}
          {!loading && feedback && (
            <div className="flex flex-col gap-6" id="essay-results-state">
              
              {/* Score and Word Comparison section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Admissions Readiness</h3>
                  <div className="text-sm font-semibold text-slate-700 mt-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#0A0F2C]" /> Score Analysis
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Based on typical global evaluation parameters.
                  </p>
                </div>

                {/* Score Badge: Circular Proportional Ring */}
                <div className="relative flex items-center justify-center shrink-0" id="score-badge">
                  <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                    <circle
                      stroke="#F1F5F9" // slate-100
                      fill="transparent"
                      strokeWidth={stroke}
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                    />
                    <circle
                      stroke={score >= 8 ? '#10B981' : score >= 6 ? '#F59E0B' : '#EF4444'} // dynamic color
                      fill="transparent"
                      strokeWidth={stroke}
                      strokeDasharray={circumference + ' ' + circumference}
                      style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease' }}
                      strokeLinecap="round"
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                    />
                  </svg>
                  <span className="absolute text-sm font-bold text-slate-800">{score}/10</span>
                </div>
              </div>

              {/* Three Strengths (Green prefix) */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Strengths
                </h4>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-3">
                  {feedback.strengths.slice(0, 3).map((strength, index) => (
                    <div key={index} className="flex gap-2 items-start text-xs text-slate-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Three Improvements (Amber prefix) */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Suggested Improvements
                </h4>
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 space-y-3">
                  {feedback.improvements.slice(0, 3).map((imp, index) => (
                    <div key={index} className="flex gap-2 items-start text-xs text-slate-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                      <span>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rewritten Opening paragraph block */}
              {feedback.rewrittenOpening && (
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                    Rewritten Hook / Opening Paragraph
                  </h4>
                  <div className="bg-amber-50/40 border border-amber-200/60 p-4 rounded-xl text-xs text-amber-900 leading-relaxed italic blockquote relative overflow-hidden">
                    <span className="absolute -top-2 -left-1 text-4xl text-amber-200 font-serif pointer-events-none select-none">“</span>
                    <p className="relative pl-3">{feedback.rewrittenOpening}</p>
                  </div>
                </div>
              )}

              {/* Word Count Comparison footer */}
              <div className="mt-2 bg-slate-100 rounded-lg py-2 px-3 flex items-center justify-between text-[11px] font-semibold text-slate-500" id="word-count-comparison">
                <span>Your draft: {currentWordCount} words</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span>Suggested: {feedback.suggestedWordCount} words</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
