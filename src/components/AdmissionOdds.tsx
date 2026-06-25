import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Award, 
  Loader2, 
  School, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '../types';

interface AdmissionOddsProps {
  user: UserProfile;
  setActiveTab: (tab: string) => void;
}

interface PredictionResult {
  probability: number;
  tier: 'Safety' | 'Match' | 'Reach';
  reasoning: string;
  scholarshipOdds: number;
}

interface ScholarshipType {
  type: string;
  probability: number;
  description: string;
}

export default function AdmissionOdds({ user, setActiveTab }: AdmissionOddsProps) {
  // 1. GPA Converter State
  const [boardSystem, setBoardSystem] = useState<'percentage' | 'cgpa'>(
    user.gradingSystem === 'cgpa' ? 'cgpa' : 'percentage'
  );
  const [rawScore, setRawScore] = useState<number>(user.gpa);
  const [convertedGpa, setConvertedGpa] = useState<number>(4.0);

  // Calculate live GPA on raw score or board system change
  useEffect(() => {
    let result = 4.0;
    if (boardSystem === 'percentage') {
      result = rawScore / 25;
    } else {
      result = rawScore * 0.4;
    }
    // Cap at 4.0, minimum 0
    result = Math.max(0, Math.min(4.0, parseFloat(result.toFixed(2))));
    setConvertedGpa(result);
  }, [rawScore, boardSystem]);

  // 2. Predictor Inputs State
  const [predictorGpa, setPredictorGpa] = useState<string>('');
  
  // Update predictor GPA when convertedGpa changes
  useEffect(() => {
    setPredictorGpa(convertedGpa.toString());
  }, [convertedGpa]);

  const [satScore, setSatScore] = useState<string>(
    user.testsTaken?.SAT ? user.testsTaken.SAT.toString() : ''
  );
  const [actScore, setActScore] = useState<string>(
    user.testsTaken?.ACT ? user.testsTaken.ACT.toString() : ''
  );
  const [ieltsScore, setIeltsScore] = useState<string>(
    user.testsTaken?.IELTS ? user.testsTaken.IELTS.toString() : ''
  );
  const [toeflScore, setToeflScore] = useState<string>(
    user.testsTaken?.TOEFL ? user.testsTaken.TOEFL.toString() : ''
  );
  const [targetDegree, setTargetDegree] = useState<string>(user.targetDegree || 'UG');
  const [preferredMajor, setPreferredMajor] = useState<string>(
    user.preferredMajors && user.preferredMajors.length > 0 ? user.preferredMajors[0] : ''
  );

  // University List States
  const [universityInput, setUniversityInput] = useState<string>('');
  const [universities, setUniversities] = useState<string[]>([]);
  const [predictions, setPredictions] = useState<Record<string, PredictionResult>>({});
  const [loadingPredict, setLoadingPredict] = useState<Record<string, boolean>>({});
  const [globalPredictLoading, setGlobalPredictLoading] = useState<boolean>(false);
  const [predictError, setPredictError] = useState<string>('');

  // 3. Scholarship Engine States
  const [scholarships, setScholarships] = useState<ScholarshipType[]>([]);
  const [loadingScholarships, setLoadingScholarships] = useState<boolean>(false);
  const [scholarshipError, setScholarshipError] = useState<string>('');
  const [scholarshipMessageIdx, setScholarshipMessageIdx] = useState<number>(0);

  const loadingMessages = [
    "Analyzing academic transcripts & grading systems...",
    "Correlating standardized scores with institutional standards...",
    "Evaluating major-specific matching coefficients...",
    "Querying global endowment and financial aid databases...",
    "Synthesizing personalized merit award probability indexes..."
  ];

  // Load universities from dream schools and predictions from localStorage
  useEffect(() => {
    // Start with dream schools as the default list
    if (user.dreamSchools && user.dreamSchools.length > 0) {
      setUniversities(user.dreamSchools);
    } else {
      setUniversities(['Stanford University', 'University of Toronto', 'University of Oxford']);
    }

    // Load saved predictions
    const savedPredictions = localStorage.getItem('get_predictions');
    if (savedPredictions) {
      try {
        setPredictions(JSON.parse(savedPredictions));
      } catch (e) {
        console.error('Failed to parse saved predictions', e);
      }
    }

    // Load saved scholarships
    const savedScholarships = localStorage.getItem('get_scholarships');
    if (savedScholarships) {
      try {
        setScholarships(JSON.parse(savedScholarships));
      } catch (e) {
        console.error('Failed to parse saved scholarships', e);
      }
    }
  }, [user]);

  // Handle rotate messages during scholarship analysis
  useEffect(() => {
    let interval: any;
    if (loadingScholarships) {
      interval = setInterval(() => {
        setScholarshipMessageIdx(prev => (prev + 1) % loadingMessages.length);
      }, 3000);
    } else {
      setScholarshipMessageIdx(0);
    }
    return () => clearInterval(interval);
  }, [loadingScholarships]);

  // Save predictions to localStorage helper
  const savePredictions = (updated: Record<string, PredictionResult>) => {
    localStorage.setItem('get_predictions', JSON.stringify(updated));
    setPredictions(updated);
  };

  // Add university
  const handleAddUniversity = () => {
    const cleaned = universityInput.trim();
    if (!cleaned) return;
    if (universities.length >= 10) {
      setPredictError('Maximum 10 universities allowed in the evaluation list.');
      return;
    }
    if (universities.map(u => u.toLowerCase()).includes(cleaned.toLowerCase())) {
      setPredictError('University is already in your evaluation list.');
      return;
    }
    setUniversities([...universities, cleaned]);
    setUniversityInput('');
    setPredictError('');
  };

  // Remove university
  const handleRemoveUniversity = (name: string) => {
    setUniversities(universities.filter(u => u !== name));
    // Also clean up predictions
    const copy = { ...predictions };
    delete copy[name];
    savePredictions(copy);
  };

  // Call Gemini for a single university
  const runPredictionForUniversity = async (uniName: string) => {
    setLoadingPredict(prev => ({ ...prev, [uniName]: true }));
    setPredictError('');

    // Prepare scores string
    const satStr = satScore ? `SAT ${satScore}` : (actScore ? `ACT ${actScore}` : 'Not Taken');
    const ieltsStr = ieltsScore ? `IELTS ${ieltsScore}` : (toeflScore ? `TOEFL ${toeflScore}` : 'Not Taken');

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gpa: predictorGpa,
          sat: satStr,
          ielts: ieltsStr,
          major: preferredMajor || 'Any Major',
          degree: targetDegree,
          university: uniName
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Admissions model request failed');
      }

      const result = await response.json();
      const updated = { ...predictions, [uniName]: result };
      savePredictions(updated);
    } catch (err: any) {
      console.error(err);
      setPredictError(`Failed to predict chances for ${uniName}: ${err.message}`);
    } finally {
      setLoadingPredict(prev => ({ ...prev, [uniName]: false }));
    }
  };

  // Run predictions for all universities in the list
  const runPredictionForAll = async () => {
    if (universities.length === 0) {
      setPredictError('Please add at least one university first.');
      return;
    }
    setGlobalPredictLoading(true);
    setPredictError('');

    for (const uni of universities) {
      await runPredictionForUniversity(uni);
    }

    setGlobalPredictLoading(false);
  };

  // Call Gemini to analyze scholarships
  const handleAnalyzeScholarships = async () => {
    setLoadingScholarships(true);
    setScholarshipError('');

    const scores = {
      SAT: satScore || undefined,
      ACT: actScore || undefined,
      IELTS: ieltsScore || undefined,
      TOEFL: toeflScore || undefined,
    };

    try {
      const response = await fetch('/api/scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gpa: predictorGpa,
          sat: satScore || actScore || '',
          ielts: scores,
          major: preferredMajor || 'Any Major',
          degree: targetDegree,
          board: user.board,
          stream: user.stream,
          targetCountries: user.targetCountries,
          budgetRange: user.budgetRange,
          dreamSchools: user.dreamSchools,
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Scholarship model request failed');
      }

      const data = await response.json();
      if (data && data.scholarships) {
        setScholarships(data.scholarships);
        localStorage.setItem('get_scholarships', JSON.stringify(data.scholarships));
      } else {
        throw new Error('Invalid response structure from server');
      }
    } catch (err: any) {
      console.error(err);
      setScholarshipError(err.message || 'Failed to analyze scholarship opportunities.');
    } finally {
      setLoadingScholarships(false);
    }
  };

  // Render SVG circular progress
  const CircularProgress = ({ value, tier }: { value: number; tier: 'Safety' | 'Match' | 'Reach' }) => {
    const radius = 28;
    const strokeWidth = 5;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    const getColorClass = () => {
      if (tier === 'Safety') return 'text-emerald-500';
      if (tier === 'Match') return 'text-amber-500';
      return 'text-rose-500';
    };

    return (
      <div className="relative flex items-center justify-center w-16 h-16">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r={radius}
            className="text-slate-100"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            className={`${getColorClass()} transition-all duration-700 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>
        <span className="absolute text-xs font-extrabold text-slate-800">{Math.round(value)}%</span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl space-y-8 pb-12" id="admission-odds-tab">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-[#0A0F2C] to-[#1E2E6B] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden" id="odds-header">
        <div className="absolute right-0 bottom-0 opacity-10 select-none pointer-events-none transform translate-y-6 translate-x-6">
          <Sparkles className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI Predictive Analytics</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Admissions &amp; Scholarship Odds Estimator
          </h1>
          <p className="text-sm text-slate-200/90 leading-relaxed font-light">
            Assess your profile against global standards. Covert your Indian grades to the standard US 4.0 GPA scale, run what-if simulations with test scores, and model scholarship probability in real time.
          </p>
        </div>
      </div>

      {/* Grid Layout: Top GPA Card & Main Predictor, and Bottom Scholarship Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: GPA Converter (Span 1) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden" id="gpa-converter-card">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-[#0A0F2C] text-sm leading-tight">US 4.0 GPA Converter</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Live conversion of Indian academic grades</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Board System Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Board Grading System</label>
                <select
                  value={boardSystem}
                  onChange={(e) => setBoardSystem(e.target.value as 'percentage' | 'cgpa')}
                  className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0A0F2C] focus:ring-2 focus:ring-[#0A0F2C]/10 transition-all"
                >
                  <option value="percentage">CBSE / ICSE (Percentage %)</option>
                  <option value="cgpa">CGPA on 10 Scale</option>
                </select>
              </div>

              {/* Raw Score Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                  <span>Raw Score / Grade</span>
                  <span className="text-[10px] text-[#0A0F2C]/60 italic">Profile default: {user.gpa}</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={boardSystem === 'percentage' ? '0.1' : '0.01'}
                    min="0"
                    max={boardSystem === 'percentage' ? '100' : '10'}
                    value={rawScore}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setRawScore(isNaN(val) ? 0 : val);
                    }}
                    className="w-full pl-3.5 pr-10 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0A0F2C]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                    {boardSystem === 'percentage' ? '%' : '/10'}
                  </span>
                </div>
              </div>

              {/* Conversion Output Display */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 flex flex-col items-center justify-center text-center space-y-1 mt-6">
                <span className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase">US Equivalent GPA</span>
                <div className="text-3xl font-extrabold text-[#0A0F2C] tracking-tight animate-fade-in">
                  {convertedGpa.toFixed(2)}
                </div>
                <span className="text-[10px] text-indigo-600 font-semibold px-2 py-0.5 bg-white/60 rounded-full border border-indigo-100">
                  On a 4.0 Scale
                </span>
              </div>

              {/* Conversion Rule Helper Text */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-500 space-y-1.5">
                <div className="font-bold text-slate-600 uppercase tracking-wider">Formula Used:</div>
                {boardSystem === 'percentage' ? (
                  <p>Percentage is divided by 25 and capped at 4.0 (e.g. 95% &rarr; 3.80 / 4.0 GPA).</p>
                ) : (
                  <p>CGPA out of 10 is multiplied by 0.4 (e.g. 9.5 &rarr; 3.80 / 4.0 GPA).</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Admissions Probability Predictor (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden" id="admission-predictor-card">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-[#0A0F2C] text-sm leading-tight">Admission Probability Predictor</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">Evaluate matching, tier safety, and admission likelihood</p>
                </div>
              </div>
              <button
                type="button"
                onClick={runPredictionForAll}
                disabled={globalPredictLoading || universities.length === 0}
                className="px-3.5 py-1.5 bg-[#0A0F2C] hover:bg-[#1A254C] disabled:bg-slate-200 text-white text-[10px] font-bold rounded-lg transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
              >
                {globalPredictLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-amber-400" />
                )}
                <span>Analyse All</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Profile Config Grid (Auto-filled but Editable for Simulation) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                  <span>Simulation Profile Inputs</span>
                  <span className="text-emerald-600 font-semibold text-[10px] flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Auto-filled from profile</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Converted GPA */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Converted GPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={predictorGpa}
                      onChange={(e) => setPredictorGpa(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  {/* SAT / ACT Score */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">SAT / ACT</label>
                    <input
                      type="text"
                      placeholder="e.g. SAT 1520"
                      value={satScore || actScore ? `${satScore ? 'SAT ' + satScore : 'ACT ' + actScore}` : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.toLowerCase().includes('act')) {
                          setActScore(val.replace(/act/gi, '').trim());
                          setSatScore('');
                        } else {
                          setSatScore(val.replace(/sat/gi, '').trim());
                          setActScore('');
                        }
                      }}
                      className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  {/* IELTS / TOEFL */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">IELTS / TOEFL</label>
                    <input
                      type="text"
                      placeholder="e.g. IELTS 8.0"
                      value={ieltsScore || toeflScore ? `${ieltsScore ? 'IELTS ' + ieltsScore : 'TOEFL ' + toeflScore}` : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.toLowerCase().includes('toefl')) {
                          setToeflScore(val.replace(/toefl/gi, '').trim());
                          setIeltsScore('');
                        } else {
                          setIeltsScore(val.replace(/ielts/gi, '').trim());
                          setToeflScore('');
                        }
                      }}
                      className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  {/* Target Degree */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Degree</label>
                    <select
                      value={targetDegree}
                      onChange={(e) => setTargetDegree(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="UG">Undergraduate (UG)</option>
                      <option value="PG">Postgraduate (PG)</option>
                      <option value="PhD">Doctoral (PhD)</option>
                    </select>
                  </div>

                  {/* Preferred Major */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Preferred Major</label>
                    <input
                      type="text"
                      value={preferredMajor}
                      onChange={(e) => setPreferredMajor(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Add University Field */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                  <span>Add Evaluation Targets</span>
                  <span className="text-[10px] text-slate-400 font-medium">{universities.length}/10 universities</span>
                </label>
                <div className="flex space-x-2">
                  <div className="relative grow">
                    <School className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter university name (e.g. UCLA, University of Oxford)..."
                      value={universityInput}
                      onChange={(e) => setUniversityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUniversity();
                        }
                      }}
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0A0F2C]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUniversity}
                    className="px-4 bg-[#0A0F2C] hover:bg-[#1A254C] text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
                {predictError && (
                  <p className="text-xs text-rose-500 flex items-center space-x-1.5 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{predictError}</span>
                  </p>
                )}
              </div>

              {/* Target Universities List & Outputs */}
              <div className="space-y-3">
                {universities.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {universities.map((uni) => {
                      const result = predictions[uni];
                      const isLoading = loadingPredict[uni];

                      return (
                        <div 
                          key={uni} 
                          className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-indigo-150 hover:shadow-sm"
                        >
                          <div className="grow space-y-1.5">
                            <div className="flex items-center flex-wrap gap-2">
                              <h3 className="font-bold text-slate-800 text-sm leading-tight">{uni}</h3>
                              {result && (
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  result.tier === 'Safety' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : result.tier === 'Match' 
                                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                      : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {result.tier}
                                </span>
                              )}
                            </div>

                            {result ? (
                              <div className="space-y-2">
                                <p className="text-xs text-slate-600 font-light italic">
                                  "{result.reasoning}"
                                </p>
                                <div className="flex items-center space-x-4 text-[10px] text-slate-400 font-semibold">
                                  <span className="flex items-center space-x-1">
                                    <Award className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>Scholarship Odds: {result.scholarshipOdds}%</span>
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 leading-relaxed font-light">
                                Assessment pending. Click "Analyse" to generate probability index.
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                            {result && <CircularProgress value={result.probability} tier={result.tier} />}

                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => runPredictionForUniversity(uni)}
                                disabled={isLoading || globalPredictLoading}
                                className="px-3.5 py-1.5 bg-slate-100 hover:bg-indigo-50 text-[#0A0F2C] hover:text-indigo-700 disabled:bg-slate-50 disabled:text-slate-300 text-[10px] font-bold rounded-lg transition-all border border-slate-200/60 hover:border-indigo-200 flex items-center space-x-1 cursor-pointer"
                              >
                                {isLoading ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3 h-3 text-indigo-500" />
                                )}
                                <span>{result ? 'Recalculate' : 'Analyse'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveUniversity(uni)}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-all border border-transparent hover:border-rose-100 cursor-pointer"
                                title="Remove University"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-1">
                    <p className="text-xs text-slate-400 font-semibold">Your evaluation list is empty.</p>
                    <p className="text-[10px] text-slate-400">Add universities using the input above to begin simulation analysis.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Bottom Card: Scholarship Probability Engine */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden" id="scholarship-probability-card">
        <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#0A0F2C] text-sm leading-tight">Scholarship Probability Engine</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Determine eligibility and success rates for top international scholarship tiers</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAnalyzeScholarships}
            disabled={loadingScholarships}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-center"
          >
            {loadingScholarships ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>Analyse Scholarship Odds</span>
          </button>
        </div>

        <div className="p-8">
          {loadingScholarships ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <div className="text-center space-y-1 animate-pulse">
                <p className="text-xs font-bold text-[#0A0F2C]">{loadingMessages[scholarshipMessageIdx]}</p>
                <p className="text-[10px] text-slate-400">Please wait while Gemini analyzes financial databases...</p>
              </div>
            </div>
          ) : scholarshipError ? (
            <p className="text-xs text-rose-500 flex items-center space-x-1.5 bg-rose-50 p-4 rounded-lg border border-rose-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{scholarshipError}</span>
            </p>
          ) : scholarships.length > 0 ? (
            <div className="space-y-6">
              <div className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 p-3.5 rounded-xl flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>AI recommendation based on your academic caliber, test standing, and preferred majors.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {scholarships.map((s, idx) => {
                  const getBarColor = (prob: number) => {
                    if (prob >= 75) return 'bg-emerald-500';
                    if (prob >= 45) return 'bg-indigo-500';
                    return 'bg-amber-500';
                  };

                  return (
                    <div 
                      key={idx}
                      className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-purple-200 hover:shadow-sm transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rank #{idx+1}</span>
                          <span className="text-xs font-extrabold text-slate-800">{s.probability}% probability</span>
                        </div>
                        <h3 className="font-extrabold text-[#0A0F2C] text-sm leading-snug">{s.type}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-light">
                          {s.description}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-3 border-t border-slate-200/40">
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`${getBarColor(s.probability)} h-full rounded-full transition-all duration-750 ease-out`} 
                            style={{ width: `${s.probability}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Qualification index</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl max-w-xl mx-auto">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-[#0A0F2C] text-xs">Unlock Merit &amp; Need-Based Scholarship Projections</h3>
                <p className="text-[10px] text-slate-400 max-w-sm mx-auto font-light">
                  Our scholarship logic maps institutional funding opportunities, national fellowships, and private grants. Click the analyze button to begin.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
