import { useState, useEffect } from 'react';
import { 
  Compass, 
  Search, 
  Plus, 
  Check, 
  Trash2, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  DollarSign, 
  Clock, 
  GraduationCap, 
  Briefcase 
} from 'lucide-react';
import { UserProfile } from '../types';

interface RecommendedCourse {
  universityName: string;
  programName: string;
  duration: string;
  avgSalary: string;
  fitReason: string;
}

interface CourseFinderProps {
  user: UserProfile;
}

export default function CourseFinder({ user }: CourseFinderProps) {
  // 1. Input states
  const [majorInterest, setMajorInterest] = useState<string>('');
  const [careerGoal, setCareerGoal] = useState<string>('');

  // 2. Recommendations & Saved list states
  const [courses, setCourses] = useState<RecommendedCourse[]>([]);
  const [savedCourses, setSavedCourses] = useState<RecommendedCourse[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>( '');

  // Pre-fill inputs from user profile
  useEffect(() => {
    if (user) {
      if (user.preferredMajors && user.preferredMajors.length > 0) {
        setMajorInterest(user.preferredMajors[0]);
      } else {
        setMajorInterest('Computer Science');
      }
      
      // Default career goal
      setCareerGoal('Become a lead Software Engineer or ML Researcher at a global tech firm');
    }
  }, [user]);

  // Load saved courses and search results from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('get_courses');
    if (saved) {
      try {
        setSavedCourses(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse get_courses from localStorage', e);
      }
    }

    const savedSearchResults = localStorage.getItem('get_course_finder_results');
    if (savedSearchResults) {
      try {
        setCourses(JSON.parse(savedSearchResults));
      } catch (e) {
        console.error('Failed to parse saved course finder results', e);
      }
    }
  }, []);

  // Save changes to localStorage
  const saveSavedCourses = (updated: RecommendedCourse[]) => {
    setSavedCourses(updated);
    localStorage.setItem('get_courses', JSON.stringify(updated));
  };

  // Run Search
  const handleFindCourses = async () => {
    if (!majorInterest.trim() || !careerGoal.trim()) {
      setError('Please provide both major interest and career goal variables.');
      return;
    }

    setLoading(true);
    setError('');

    const testScores = user.testsTaken 
      ? Object.entries(user.testsTaken)
          .filter(([_, val]) => val !== undefined)
          .map(([name, val]) => `${name}: ${val}`)
          .join(', ')
      : 'None';

    const profileSummary = `GPA is ${user.gpa}/4.0 (Indian converted) in ${user.stream} stream under ${user.board} board system. Standardized tests taken: ${testScores}. Target degree level: ${user.targetDegree || 'UG'}. Target countries: ${user.targetCountries?.join(', ') || 'N/A'}. Budget limit per year: ${user.budgetRange}.`;

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          majorInterest,
          careerGoal,
          profileSummary
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Server failed to suggest courses');
      }

      const data = await response.json();
      if (data && data.courses) {
        setCourses(data.courses);
        localStorage.setItem('get_course_finder_results', JSON.stringify(data.courses));
      } else {
        throw new Error('Received invalid course finder payload format');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to find programs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle saving to list
  const handleToggleSaveCourse = (course: RecommendedCourse) => {
    const alreadySaved = savedCourses.some(
      c => c.programName.toLowerCase() === course.programName.toLowerCase() && 
           c.universityName.toLowerCase() === course.universityName.toLowerCase()
    );

    if (alreadySaved) {
      const updated = savedCourses.filter(
        c => !(c.programName.toLowerCase() === course.programName.toLowerCase() && 
               c.universityName.toLowerCase() === course.universityName.toLowerCase())
      );
      saveSavedCourses(updated);
    } else {
      saveSavedCourses([...savedCourses, course]);
    }
  };

  return (
    <div className="w-full max-w-5xl space-y-8 pb-12" id="course-finder-tab">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0C122B] to-[#1F1E5E] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden" id="course-header">
        <div className="absolute right-0 bottom-0 opacity-10 select-none pointer-events-none transform translate-y-4 translate-x-4">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full tracking-wider uppercase">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Curriculum Matcher</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Academic Course &amp; Program Finder
          </h1>
          <p className="text-sm text-slate-200/90 leading-relaxed font-light">
            Align specific syllabus paths and academic majors with your post-graduation career goals. Retrieve tailored course sheets with salary index projections and alignment reasons.
          </p>
        </div>
      </div>

      {/* Inputs Panel & Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Input form (1 column) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 space-y-5" id="course-input-form">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Career Alignment Inputs</h2>
            
            {/* Major Interest Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Major Interest Area</label>
              <input
                type="text"
                value={majorInterest}
                onChange={(e) => setMajorInterest(e.target.value)}
                placeholder="e.g. Artificial Intelligence, Data Science"
                className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0A0F2C] focus:ring-1 focus:ring-[#0A0F2C]/10 transition-all"
              />
            </div>

            {/* Career Goal Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Free-text Career Goal</label>
              <textarea
                rows={4}
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="Describe your career dream... (e.g. Become an investment banker on Wall Street or head research for quantum algorithms)"
                className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0A0F2C] focus:ring-1 focus:ring-[#0A0F2C]/10 transition-all resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleFindCourses}
              disabled={loading}
              className="w-full py-2.5 bg-[#0A0F2C] hover:bg-[#1A254C] disabled:bg-slate-200 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Find Best-Fit Courses</span>
            </button>
          </div>

          {/* Saved Courses summary Widget */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 space-y-4" id="saved-courses-widget">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Saved Courses ({savedCourses.length})</h3>
              {savedCourses.length > 0 && (
                <button
                  type="button"
                  onClick={() => saveSavedCourses([])}
                  className="text-[10px] text-rose-500 hover:text-rose-600 font-bold"
                >
                  Clear All
                </button>
              )}
            </div>

            {savedCourses.length > 0 ? (
              <div className="space-y-3 divide-y divide-slate-100/60 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                {savedCourses.map((c, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between gap-2 group">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800 text-[11px] leading-tight">
                        {c.programName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {c.universityName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleSaveCourse(c)}
                      className="text-slate-300 hover:text-rose-500 transition-all cursor-pointer p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 font-light italic leading-relaxed text-center py-4">
                No programs added to your list yet. Click "Add to My List" on course recommendations.
              </p>
            )}
          </div>
        </div>

        {/* Right Recommended Courses Results list (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-base">Syllabus Recommendations</h2>
            <span className="text-xs text-slate-400 font-medium">Matches: {courses.length}</span>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200/60 rounded-xl p-4 flex items-start space-x-3 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-[#0A0F2C]">Mapping Academic syllabus matrices...</p>
                <p className="text-[10px] text-slate-400 font-light">Synthesizing post-graduation salaries and curriculum alignments...</p>
              </div>
            </div>
          ) : courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map((course, idx) => {
                const isSaved = savedCourses.some(
                  c => c.programName.toLowerCase() === course.programName.toLowerCase() && 
                       c.universityName.toLowerCase() === course.universityName.toLowerCase()
                );

                return (
                  <div 
                    key={idx}
                    className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-indigo-150 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="space-y-3 grow">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Compass className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {course.universityName}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-[#0A0F2C] text-sm leading-tight">
                          {course.programName}
                        </h3>
                      </div>

                      {/* Course Meta stats */}
                      <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100 w-fit">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Duration: {course.duration}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span>Avg Salary: {course.avgSalary}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-light italic">
                        "{course.fitReason}"
                      </p>
                    </div>

                    <div className="shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleToggleSaveCourse(course)}
                        className={`px-3.5 py-1.5 text-[10px] font-bold rounded-lg shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer ${
                          isSaved 
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                            : 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Saved to List</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to My List</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-14 px-8 text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-xs">Run Your First Align Search</h3>
                <p className="text-[10px] text-slate-400 font-light max-w-sm mx-auto leading-relaxed">
                  Submit your major interests and career desires on the left, and we will formulate course recommendations.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
