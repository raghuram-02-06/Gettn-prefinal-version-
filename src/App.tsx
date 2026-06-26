/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Compass, 
  ArrowLeftRight, 
  Search, 
  Sparkles, 
  FileText, 
  Award, 
  FolderOpen,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  RotateCcw,
  BookOpen,
  Globe,
  DollarSign,
  School,
  Activity,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from './types';
import AdmissionOdds from './components/AdmissionOdds';
import FindColleges from './components/FindColleges';
import Compare from './components/Compare';
import CourseFinder from './components/CourseFinder';
import EssayCoach from './components/EssayCoach';
import ScholarshipFinder from './components/ScholarshipFinder';
import DocumentManager from './components/DocumentManager';

const TABS = [
  { id: 'dashboard', name: 'Dashboard', icon: GraduationCap },
  { id: 'find-colleges', name: 'Find Colleges', icon: Compass },
  { id: 'compare', name: 'Compare', icon: ArrowLeftRight },
  { id: 'course-finder', name: 'Course Finder', icon: Search },
  { id: 'admission-odds', name: 'Admission Odds', icon: Sparkles },
  { id: 'essay-coach', name: 'Essay Coach', icon: FileText },
  { id: 'scholarships', name: 'Scholarships', icon: Award },
  { id: 'documents', name: 'Documents', icon: FolderOpen }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<UserProfile | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('get_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse get_user from localStorage', e);
      }
    }
  }, []);

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sign In / Authentication states
  const [isSignIn, setIsSignIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleSignIn = (provider?: 'google' | 'apple') => {
    setIsLoggingIn(true);
    setLoginError('');

    // Simulate premium secure SSO/JWT authentication delay
    setTimeout(() => {
      let loggedInUser: UserProfile;

      // Try to retrieve user from localStorage if it exists
      const savedUser = localStorage.getItem('get_user');
      if (savedUser) {
        try {
          loggedInUser = JSON.parse(savedUser);
        } catch (e) {
          loggedInUser = getDemoProfile();
        }
      } else {
        loggedInUser = getDemoProfile();
      }

      // Customize name/email based on how they logged in
      if (provider === 'google') {
        loggedInUser.email = 'gettn.ai@gmail.com';
        loggedInUser.name = 'Aarav Sharma';
      } else if (provider === 'apple') {
        loggedInUser.email = 'apple.student@gettn.com';
        loggedInUser.name = 'Apple Scholar';
      } else if (loginEmail.trim()) {
        loggedInUser.email = loginEmail.trim();
        const parts = loginEmail.trim().split('@')[0];
        loggedInUser.name = parts.charAt(0).toUpperCase() + parts.slice(1);
      }

      localStorage.setItem('get_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setIsLoggingIn(false);
      setIsSignIn(false);
      setActiveTab('dashboard');
    }, 1200);
  };

  const getDemoProfile = (): UserProfile => {
    return {
      name: "Aarav Sharma",
      email: "gettn.ai@gmail.com",
      phone: "9876543210",
      city: "Mumbai",
      graduationYear: "2026",
      board: "CBSE",
      gradingSystem: "percentage",
      gpa: 94.5,
      stream: "Science",
      testsTaken: { SAT: 1520, IELTS: 8.0 },
      targetDegree: "UG",
      targetCountries: ["USA", "UK", "Canada"],
      budgetRange: "$40–60k",
      preferredMajors: ["Computer Science", "Data Science", "Artificial Intelligence"],
      dreamSchools: ["Stanford University", "MIT", "UC Berkeley", "Oxford University", "University of Toronto"],
    };
  };

  // Form states
  // Step 1 - Personal
  const [personalName, setPersonalName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [personalCity, setPersonalCity] = useState('');
  const [personalGradYear, setPersonalGradYear] = useState('');

  // Step 2 - Academics
  const [academicBoard, setAcademicBoard] = useState('');
  const [gradingSystem, setGradingSystem] = useState<'percentage' | 'cgpa'>('percentage');
  const [academicGpa, setAcademicGpa] = useState('');
  const [academicStream, setAcademicStream] = useState('');

  // Step 3 - Test Scores
  const [checkedTests, setCheckedTests] = useState<Record<string, boolean>>({
    SAT: false,
    ACT: false,
    IELTS: false,
    TOEFL: false,
    GRE: false,
    GMAT: false,
  });
  const [testScores, setTestScores] = useState<Record<string, string>>({
    SAT: '',
    ACT: '',
    IELTS: '',
    TOEFL: '',
    GRE: '',
    GMAT: '',
  });

  // Step 4 - Preferences
  const [targetDegree, setTargetDegree] = useState('');
  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState('');
  const [majorInput, setMajorInput] = useState('');
  const [preferredMajors, setPreferredMajors] = useState<string[]>([]);

  // Step 5 - Dream Schools
  const [schoolInput, setSchoolInput] = useState('');
  const [dreamSchools, setDreamSchools] = useState<string[]>([]);

  const currentTab = TABS.find(tab => tab.id === activeTab) || TABS[0];

  // Countries options
  const COUNTRIES = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Others'];

  // Handle adding major tag
  const handleAddMajor = () => {
    const cleaned = majorInput.trim();
    if (!cleaned) return;
    if (preferredMajors.length >= 3) {
      setErrors(prev => ({ ...prev, majors: 'Maximum 3 majors allowed' }));
      return;
    }
    if (preferredMajors.includes(cleaned)) {
      setErrors(prev => ({ ...prev, majors: 'Major already added' }));
      return;
    }
    setPreferredMajors([...preferredMajors, cleaned]);
    setMajorInput('');
    setErrors(prev => {
      const copy = { ...prev };
      delete copy.majors;
      return copy;
    });
  };

  const handleRemoveMajor = (indexToRemove: number) => {
    setPreferredMajors(preferredMajors.filter((_, i) => i !== indexToRemove));
    setErrors(prev => {
      const copy = { ...prev };
      delete copy.majors;
      return copy;
    });
  };

  // Handle adding school chip
  const handleAddSchool = () => {
    const cleaned = schoolInput.trim();
    if (!cleaned) return;
    if (dreamSchools.length >= 5) {
      setErrors(prev => ({ ...prev, schools: 'Maximum 5 dream schools allowed' }));
      return;
    }
    if (dreamSchools.includes(cleaned)) {
      setErrors(prev => ({ ...prev, schools: 'School already added' }));
      return;
    }
    setDreamSchools([...dreamSchools, cleaned]);
    setSchoolInput('');
    setErrors(prev => {
      const copy = { ...prev };
      delete copy.schools;
      return copy;
    });
  };

  const handleRemoveSchool = (indexToRemove: number) => {
    setDreamSchools(dreamSchools.filter((_, i) => i !== indexToRemove));
    setErrors(prev => {
      const copy = { ...prev };
      delete copy.schools;
      return copy;
    });
  };

  // Validate current step
  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!personalName.trim()) {
        newErrors.name = 'Name is required';
      } else if (personalName.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }

      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail.trim());
      if (!personalEmail.trim()) {
        newErrors.email = 'Email is required';
      } else if (!emailValid) {
        newErrors.email = 'Enter a valid email address';
      }

      if (!personalPhone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (personalPhone.trim().length < 10) {
        newErrors.phone = 'Enter a valid 10-digit mobile number';
      }

      if (!personalCity.trim()) {
        newErrors.city = 'City of residence is required';
      }

      if (!personalGradYear) {
        newErrors.graduationYear = 'Please select your graduation year';
      }
    }

    if (stepNum === 2) {
      if (!academicBoard) {
        newErrors.board = 'Please select an education board';
      }

      if (!academicGpa.trim()) {
        newErrors.gpa = 'Academics score/GPA is required';
      } else {
        const score = parseFloat(academicGpa);
        if (isNaN(score)) {
          newErrors.gpa = 'Score must be a valid number';
        } else if (gradingSystem === 'percentage') {
          if (score < 0 || score > 100) {
            newErrors.gpa = 'Percentage must be between 0 and 100';
          }
        } else if (gradingSystem === 'cgpa') {
          if (score < 0 || score > 10) {
            newErrors.gpa = 'CGPA must be between 0 and 10';
          }
        }
      }

      if (!academicStream) {
        newErrors.stream = 'Please select your academic stream';
      }
    }

    if (stepNum === 3) {
      // Step 3 scores validation for selected tests
      if (checkedTests.SAT) {
        const val = parseFloat(testScores.SAT);
        if (isNaN(val) || val < 400 || val > 1600) {
          newErrors.SAT = 'SAT score must be between 400 and 1600';
        }
      }
      if (checkedTests.ACT) {
        const val = parseFloat(testScores.ACT);
        if (isNaN(val) || val < 1 || val > 36) {
          newErrors.ACT = 'ACT score must be between 1 and 36';
        }
      }
      if (checkedTests.IELTS) {
        const val = parseFloat(testScores.IELTS);
        if (isNaN(val) || val < 0 || val > 9 || (val * 10) % 5 !== 0) {
          newErrors.IELTS = 'IELTS band score must be between 0 and 9 (step 0.5)';
        }
      }
      if (checkedTests.TOEFL) {
        const val = parseFloat(testScores.TOEFL);
        if (isNaN(val) || val < 0 || val > 120) {
          newErrors.TOEFL = 'TOEFL score must be between 0 and 120';
        }
      }
      if (checkedTests.GRE) {
        const val = parseFloat(testScores.GRE);
        if (isNaN(val) || val < 260 || val > 340) {
          newErrors.GRE = 'GRE score must be between 260 and 340';
        }
      }
      if (checkedTests.GMAT) {
        const val = parseFloat(testScores.GMAT);
        if (isNaN(val) || val < 200 || val > 800) {
          newErrors.GMAT = 'GMAT score must be between 200 and 800';
        }
      }
    }

    if (stepNum === 4) {
      if (!targetDegree) {
        newErrors.targetDegree = 'Please select your target degree level';
      }
      if (targetCountries.length === 0) {
        newErrors.targetCountries = 'Please select at least one target country';
      }
      if (!budgetRange) {
        newErrors.budgetRange = 'Please select your per-year budget range';
      }
      if (preferredMajors.length === 0) {
        newErrors.preferredMajors = 'Please add at least one preferred major tag';
      }
    }

    if (stepNum === 5) {
      if (dreamSchools.length === 0) {
        newErrors.dreamSchools = 'Please list at least one dream school/university';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (wizardStep === 1) {
      if (validateStep(1)) {
        setWizardStep(2);
      }
    } else {
      if (validateStep(wizardStep)) {
        setWizardStep(prev => prev + 1);
      }
    }
  };

  const handleBackStep = () => {
    setWizardStep(prev => Math.max(1, prev - 1));
  };

  // Skip step 3 (tests optional)
  const handleSkipTests = () => {
    // Reset test scores and uncheck all tests
    const resetChecked = { ...checkedTests };
    Object.keys(resetChecked).forEach(k => { resetChecked[k] = false; });
    setCheckedTests(resetChecked);

    const resetScores = { ...testScores };
    Object.keys(resetScores).forEach(k => { resetScores[k] = ''; });
    setTestScores(resetScores);

    setErrors(prev => {
      const copy = { ...prev };
      ['SAT', 'ACT', 'IELTS', 'TOEFL', 'GRE', 'GMAT'].forEach(k => delete copy[k]);
      return copy;
    });

    setWizardStep(4);
  };

  // Complete onboarding and save to localStorage
  const handleCompleteOnboarding = () => {
    if (!validateStep(5)) return;

    // Build the finalized testsTaken object
    const finalTestsTaken: Record<string, number> = {};
    Object.entries(checkedTests).forEach(([testKey, isChecked]) => {
      if (isChecked && testScores[testKey]) {
        finalTestsTaken[testKey] = parseFloat(testScores[testKey]);
      }
    });

    const completedProfile: UserProfile = {
      name: personalName.trim(),
      email: personalEmail.trim(),
      phone: personalPhone.trim(),
      city: personalCity.trim(),
      graduationYear: personalGradYear,
      board: academicBoard,
      gradingSystem: gradingSystem,
      gpa: parseFloat(academicGpa),
      stream: academicStream,
      testsTaken: finalTestsTaken,
      targetDegree: targetDegree,
      targetCountries: targetCountries,
      budgetRange: budgetRange,
      preferredMajors: preferredMajors,
      dreamSchools: dreamSchools,
    };

    localStorage.setItem('get_user', JSON.stringify(completedProfile));
    setUser(completedProfile);
    setActiveTab('dashboard');
  };

  // Clear data and restart wizard
  const handleResetProfile = () => {
    if (window.confirm('Are you sure you want to reset your profile and restart the onboarding process?')) {
      localStorage.removeItem('get_user');
      setUser(null);
      setWizardStep(1);
      // Reset form states
      setPersonalName('');
      setPersonalEmail('');
      setPersonalPhone('');
      setPersonalCity('');
      setPersonalGradYear('');
      setAcademicBoard('');
      setGradingSystem('percentage');
      setAcademicGpa('');
      setAcademicStream('');
      setCheckedTests({
        SAT: false,
        ACT: false,
        IELTS: false,
        TOEFL: false,
        GRE: false,
        GMAT: false,
      });
      setTestScores({
        SAT: '',
        ACT: '',
        IELTS: '',
        TOEFL: '',
        GRE: '',
        GMAT: '',
      });
      setTargetDegree('');
      setTargetCountries([]);
      setBudgetRange('');
      setPreferredMajors([]);
      setDreamSchools([]);
      setErrors({});
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-white antialiased font-sans select-none">
      {/* Top Navbar Section */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 shrink-0" id="header-nav">
        <nav className="h-14 flex items-center px-8 justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center space-x-3">
            {/* Minimalist Premium brand logo */}
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-black text-sm tracking-tight" id="brand-logo-badge">
              g
            </div>
            <span 
              className="text-white text-[20px] font-bold tracking-tight select-none lowercase" 
              id="brand-wordmark"
            >
              gettn
            </span>
          </div>
          <div className="flex items-center space-x-3 text-xs text-white/40 font-medium tracking-wider">
            <span className="hidden sm:inline uppercase text-[10px] tracking-widest">Premium Global Education</span>
            <span className="px-1.5 py-0.5 bg-white/5 text-white/60 text-[10px] font-semibold rounded tracking-wider border border-white/5 select-none" id="beta-version-tag">
              Edition 1.0
            </span>
          </div>
        </nav>

        {/* Horizontal Navigation Tabs */}
        <div className="border-t border-white/5 shrink-0">
          <div className="max-w-7xl mx-auto px-8 w-full">
            <nav className="h-12 flex space-x-8 overflow-x-auto no-scrollbar text-[12px] font-semibold uppercase tracking-wider" aria-label="Tabs" id="main-tabs-nav">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-btn-${tab.id}`}
                    onClick={() => {
                      setActiveTab(tab.id);
                    }}
                    className={`tab-item relative h-full flex items-center transition-all duration-200 cursor-pointer focus:outline-none whitespace-nowrap ${
                      isActive ? 'text-white' : 'text-white/40 hover:text-white/80'
                    }`}
                  >
                    <span>{tab.name}</span>
                    
                    {/* Active Underline Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        id="active-indicator-bar"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Body Area */}
      <main className="grow flex items-center justify-center p-6 md:p-12 bg-[#000000]" id="main-content">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            // Dashboard tab logic
            !user ? (
              isSignIn ? (
                // Premium Sign In Card
                <motion.div
                  key="signin-view"
                  initial={{ opacity: 0, scale: 0.98, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-md bg-[#111111] rounded-[24px] shadow-2xl border border-white/5 overflow-hidden p-8 relative"
                  id="signin-card-wrapper"
                >
                  {isLoggingIn && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-3">
                      <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                      <p className="text-xs font-bold tracking-widest uppercase text-white/80 animate-pulse">
                        Authenticating Securely...
                      </p>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-white text-black font-black flex items-center justify-center mx-auto text-lg">
                        g
                      </div>
                      <h2 className="text-2xl font-extrabold tracking-tight text-white">Welcome back</h2>
                      <p className="text-xs text-white/50">Access your secure premium college dashboard</p>
                    </div>

                    {/* SSO Providers */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleSignIn('google')}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                        <span>Google</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSignIn('apple')}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.5-.63.73-1.18 1.87-1.03 2.98 1.1.09 2.2-.55 2.96-1.42z"/>
                        </svg>
                        <span>Apple ID</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-white/20">
                      <div className="h-[1px] grow bg-white/5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">or sign in with email</span>
                      <div className="h-[1px] grow bg-white/5" />
                    </div>

                    {/* Email Sign In Form */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!loginEmail.trim()) {
                          setLoginError('Email address is required');
                          return;
                        }
                        handleSignIn();
                      }} 
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center space-x-1">
                          <Mail className="w-3 h-3" /> <span>Email Address</span>
                        </label>
                        <input
                          type="email"
                          placeholder="aarav@gmail.com"
                          value={loginEmail}
                          onChange={(e) => {
                            setLoginEmail(e.target.value);
                            if (loginError) setLoginError('');
                          }}
                          className="w-full px-3.5 py-2.5 text-sm bg-black border border-white/10 rounded-xl focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 transition-all text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center space-x-1">
                          <X className="w-3 h-3 rotate-45 shrink-0" /> <span>Password</span>
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-black border border-white/10 rounded-xl focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 transition-all text-white"
                        />
                      </div>

                      {loginError && (
                        <p className="text-xs text-rose-500 flex items-center space-x-1">
                          <AlertCircle className="w-3.5 h-3.5" /> <span>{loginError}</span>
                        </p>
                      )}

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md"
                        >
                          Sign In
                        </button>
                      </div>
                    </form>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setIsSignIn(false)}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        Don't have an account? Register / Onboard
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // Onboarding Wizard Card (only shown if localStorage key "get_user" is missing)
                <motion.div
                  key="wizard-view"
                  initial={{ opacity: 0, scale: 0.98, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-2xl bg-[#111111] rounded-[24px] shadow-2xl border border-white/5 overflow-hidden"
                  id="wizard-card-wrapper"
                >
                  {/* Header of the Onboarding Wizard */}
                  <div className="bg-[#171717]/40 border-b border-white/5 px-8 py-6 flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-bold text-white tracking-tight">Onboarding</h1>
                      <p className="text-xs text-white/50 mt-1">Configure your premium global profile</p>
                    </div>
                    <div className="flex items-center space-x-3.5">
                      <button
                        type="button"
                        onClick={() => setIsSignIn(true)}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer hidden sm:block"
                      >
                        Sign In instead
                      </button>
                      <span className="text-[10px] font-bold text-white tracking-wider uppercase px-2.5 py-1 bg-white/5 rounded-full border border-white/5">
                        Step {wizardStep} of 5
                      </span>
                    </div>
                  </div>

                  {/* Progress bar at top of wizard showing step X of 5 */}
                  <div className="h-[2px] w-full bg-white/5 relative" id="wizard-progress-track">
                    <div 
                      className="h-full bg-white transition-all duration-300 ease-out" 
                      style={{ width: `${(wizardStep / 5) * 100}%` }}
                      id="wizard-progress-bar"
                    />
                  </div>

                  {/* Wizard Form Area */}
                  <div className="p-8">
                    {wizardStep === 1 && (
                      <div className="space-y-6" id="wizard-step-1">
                        <div className="border-b border-white/5 pb-4 mb-2 flex items-center justify-between">
                          <div>
                            <h2 className="font-semibold text-white text-base">Step 1: Personal Details</h2>
                            <p className="text-xs text-slate-400">Introduce yourself to start your journey.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsSignIn(true)}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer sm:hidden"
                          >
                            Sign In
                          </button>
                        </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Name Input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                            <User className="w-3.5 h-3.5" /> <span>Full Name <span className="text-rose-500">*</span></span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Aarav Sharma"
                            value={personalName}
                            onChange={(e) => {
                              setPersonalName(e.target.value);
                              if (errors.name) setErrors(prev => { const c = { ...prev }; delete c.name; return c; });
                            }}
                            className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                              errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0A0F2C] focus:ring-[#0A0F2C]/10'
                            }`}
                          />
                          {errors.name && <p className="text-xs text-rose-500 flex items-center space-x-1 mt-1"><AlertCircle className="w-3 h-3 shrink-0" /> <span>{errors.name}</span></p>}
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                            <Mail className="w-3.5 h-3.5" /> <span>Email Address <span className="text-rose-500">*</span></span>
                          </label>
                          <input
                            type="email"
                            placeholder="e.g. aarav@gmail.com"
                            value={personalEmail}
                            onChange={(e) => {
                              setPersonalEmail(e.target.value);
                              if (errors.email) setErrors(prev => { const c = { ...prev }; delete c.email; return c; });
                            }}
                            className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                              errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0A0F2C] focus:ring-[#0A0F2C]/10'
                            }`}
                          />
                          {errors.email && <p className="text-xs text-rose-500 flex items-center space-x-1 mt-1"><AlertCircle className="w-3 h-3 shrink-0" /> <span>{errors.email}</span></p>}
                        </div>

                        {/* Phone Input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                            <Phone className="w-3.5 h-3.5" /> <span>Phone Number <span className="text-rose-500">*</span></span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 9876543210"
                            value={personalPhone}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 10) {
                                val = val.slice(0, 10);
                              }
                              setPersonalPhone(val);
                              if (errors.phone) setErrors(prev => { const c = { ...prev }; delete c.phone; return c; });
                            }}
                            className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                              errors.phone ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0A0F2C] focus:ring-[#0A0F2C]/10'
                            }`}
                          />
                          {errors.phone && <p className="text-xs text-rose-500 flex items-center space-x-1 mt-1"><AlertCircle className="w-3 h-3 shrink-0" /> <span>{errors.phone}</span></p>}
                        </div>

                        {/* City Input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5" /> <span>City of Residence <span className="text-rose-500">*</span></span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Mumbai"
                            value={personalCity}
                            onChange={(e) => {
                              setPersonalCity(e.target.value);
                              if (errors.city) setErrors(prev => { const c = { ...prev }; delete c.city; return c; });
                            }}
                            className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                              errors.city ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0A0F2C] focus:ring-[#0A0F2C]/10'
                            }`}
                          />
                          {errors.city && <p className="text-xs text-rose-500 flex items-center space-x-1 mt-1"><AlertCircle className="w-3 h-3 shrink-0" /> <span>{errors.city}</span></p>}
                        </div>

                        {/* Graduation Year Select (2024 - 2030) */}
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5" /> <span>Target Graduation Year <span className="text-rose-500">*</span></span>
                          </label>
                          <select
                            value={personalGradYear}
                            onChange={(e) => {
                              setPersonalGradYear(e.target.value);
                              if (errors.graduationYear) setErrors(prev => { const c = { ...prev }; delete c.graduationYear; return c; });
                            }}
                            className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                              errors.graduationYear ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0A0F2C] focus:ring-[#0A0F2C]/10'
                            }`}
                          >
                            <option value="">-- Choose Graduation Year --</option>
                            {Array.from({ length: 7 }, (_, i) => 2024 + i).map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                          {errors.graduationYear && <p className="text-xs text-rose-500 flex items-center space-x-1 mt-1"><AlertCircle className="w-3 h-3 shrink-0" /> <span>{errors.graduationYear}</span></p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-5" id="wizard-step-2">
                      <div className="border-b border-slate-100 pb-3 mb-2">
                        <h2 className="font-semibold text-[#0A0F2C] text-base">Step 2: Academics Details</h2>
                        <p className="text-xs text-slate-400">Share your latest secondary/high school academic profile.</p>
                      </div>

                      <div className="space-y-4">
                        {/* High School Board */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500">Education Board <span className="text-rose-500">*</span></label>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {['CBSE', 'ICSE', 'State', 'IB', 'IGCSE'].map((b) => (
                              <button
                                type="button"
                                key={b}
                                onClick={() => {
                                  setAcademicBoard(b);
                                  if (errors.board) setErrors(prev => { const c = { ...prev }; delete c.board; return c; });
                                }}
                                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-150 cursor-pointer ${
                                  academicBoard === b 
                                    ? 'bg-[#0A0F2C] text-white border-[#0A0F2C] shadow-sm' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {b}
                              </button>
                            ))}
                          </div>
                          {errors.board && <p className="text-xs text-rose-500 flex items-center space-x-1 mt-1"><AlertCircle className="w-3 h-3" /> <span>{errors.board}</span></p>}
                        </div>

                        {/* Stream selection */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500">Academic Stream / Background <span className="text-rose-500">*</span></label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {['Science', 'Commerce', 'Arts', 'Engineering'].map((st) => (
                              <button
                                type="button"
                                key={st}
                                onClick={() => {
                                  setAcademicStream(st);
                                  if (errors.stream) setErrors(prev => { const c = { ...prev }; delete c.stream; return c; });
                                }}
                                className={`px-3 py-2.5 text-xs font-medium rounded-lg border transition-all duration-150 cursor-pointer ${
                                  academicStream === st 
                                    ? 'bg-[#0A0F2C] text-white border-[#0A0F2C] shadow-sm' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                          {errors.stream && <p className="text-xs text-rose-500 flex items-center space-x-1 mt-1"><AlertCircle className="w-3 h-3" /> <span>{errors.stream}</span></p>}
                        </div>

                        {/* Grading system and Score/GPA */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500">Grading System</label>
                            <div className="flex bg-slate-200/60 p-1 rounded-lg">
                              <button
                                type="button"
                                onClick={() => {
                                  setGradingSystem('percentage');
                                  setAcademicGpa(''); // reset score to avoid conversion errors
                                }}
                                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                  gradingSystem === 'percentage' ? 'bg-white text-[#0A0F2C] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                Percentage (0-100)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setGradingSystem('cgpa');
                                  setAcademicGpa(''); // reset score to avoid conversion errors
                                }}
                                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                  gradingSystem === 'cgpa' ? 'bg-white text-[#0A0F2C] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                CGPA (0-10)
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500">
                              {gradingSystem === 'percentage' ? 'Overall Percentage (%)' : 'Overall CGPA'} <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder={gradingSystem === 'percentage' ? 'e.g. 92.5' : 'e.g. 9.4'}
                              value={academicGpa}
                              onChange={(e) => {
                                setAcademicGpa(e.target.value);
                                if (errors.gpa) setErrors(prev => { const c = { ...prev }; delete c.gpa; return c; });
                              }}
                              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                errors.gpa ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0A0F2C] focus:ring-[#0A0F2C]/10'
                              }`}
                            />
                            {errors.gpa && <p className="text-xs text-rose-500 flex items-center space-x-1 mt-1"><AlertCircle className="w-3 h-3 shrink-0" /> <span>{errors.gpa}</span></p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-5" id="wizard-step-3">
                      <div className="border-b border-slate-100 pb-3 mb-2 flex items-center justify-between">
                        <div>
                          <h2 className="font-semibold text-[#0A0F2C] text-base">Step 3: Standardized Test Scores</h2>
                          <p className="text-xs text-slate-400">Toggle the standardized/language tests you have taken.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleSkipTests}
                          className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-[#0A0F2C] bg-slate-100 hover:bg-slate-200/70 rounded-lg transition-all cursor-pointer"
                        >
                          Skip Tests
                        </button>
                      </div>

                      {/* Interactive Test Selector Grid */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {Object.keys(checkedTests).map((test) => {
                            const isChecked = checkedTests[test];
                            return (
                              <button
                                type="button"
                                key={test}
                                onClick={() => {
                                  setCheckedTests(prev => ({ ...prev, [test]: !prev[test] }));
                                }}
                                className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                  isChecked 
                                    ? 'bg-[#0A0F2C] text-white border-[#0A0F2C] shadow-sm' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {test}
                              </button>
                            );
                          })}
                        </div>

                        {/* Scoring Fields */}
                        <div className="space-y-3.5 pt-2">
                          {Object.keys(checkedTests).some(k => checkedTests[k]) ? (
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                              <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase">Enter Test Scores</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {checkedTests.SAT && (
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 flex justify-between">
                                      <span>SAT Score</span> <span className="text-slate-400 font-normal">Range: 400-1600</span>
                                    </label>
                                    <input
                                      type="number"
                                      placeholder="e.g. 1480"
                                      value={testScores.SAT}
                                      onChange={(e) => {
                                        setTestScores(prev => ({ ...prev, SAT: e.target.value }));
                                        if (errors.SAT) setErrors(prev => { const c = { ...prev }; delete c.SAT; return c; });
                                      }}
                                      className={`w-full px-3.5 py-1.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                        errors.SAT ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0A0F2C] focus:ring-[#0A0F2C]/10'
                                      }`}
                                    />
                                    {errors.SAT && <p className="text-xs text-rose-500 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /> <span>{errors.SAT}</span></p>}
                                  </div>
                                )}

                                {checkedTests.ACT && (
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 flex justify-between">
                                      <span>ACT Composite</span> <span className="text-slate-400 font-normal">Range: 1-36</span>
                                    </label>
                                    <input
                                      type="number"
                                      placeholder="e.g. 32"
                                      value={testScores.ACT}
                                      onChange={(e) => {
                                        setTestScores(prev => ({ ...prev, ACT: e.target.value }));
                                        if (errors.ACT) setErrors(prev => { const c = { ...prev }; delete c.ACT; return c; });
                                      }}
                                      className={`w-full px-3.5 py-1.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                        errors.ACT ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0A0F2C] focus:ring-[#0A0F2C]/10'
                                      }`}
                                    />
                                    {errors.ACT && <p className="text-xs text-rose-500 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /> <span>{errors.ACT}</span></p>}
                                  </div>
                                )}

                                {checkedTests.IELTS && (
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 flex justify-between">
                                      <span>IELTS Band Score</span> <span className="text-slate-400 font-normal">Range: 0-9 (step 0.5)</span>
                                    </label>
                                    <input
                                      type="number"
                                      step="0.5"
                                      placeholder="e.g. 7.5"
                                      value={testScores.IELTS}
                                      onChange={(e) => {
                                        setTestScores(prev => ({ ...prev, IELTS: e.target.value }));
                                        if (errors.IELTS) setErrors(prev => { const c = { ...prev }; delete c.IELTS; return c; });
                                      }}
                                      className={`w-full px-3.5 py-1.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                        errors.IELTS ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0A0F2C] focus:ring-[#0A0F2C]/10'
                                      }`}
                                    />
                                    {errors.IELTS && <p className="text-xs text-rose-500 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /> <span>{errors.IELTS}</span></p>}
                                  </div>
                                )}

                                {checkedTests.TOEFL && (
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 flex justify-between">
                                      <span>TOEFL Score</span> <span className="text-slate-400 font-normal">Range: 0-120</span>
                                    </label>
                                    <input
                                      type="number"
                                      placeholder="e.g. 110"
                                      value={testScores.TOEFL}
                                      onChange={(e) => {
                                        setTestScores(prev => ({ ...prev, TOEFL: e.target.value }));
                                        if (errors.TOEFL) setErrors(prev => { const c = { ...prev }; delete c.TOEFL; return c; });
                                      }}
                                      className={`w-full px-3.5 py-1.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                        errors.TOEFL ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0A0F2C] focus:ring-[#0A0F2C]/10'
                                      }`}
                                    />
                                    {errors.TOEFL && <p className="text-xs text-rose-500 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /> <span>{errors.TOEFL}</span></p>}
                                  </div>
                                )}

                                {checkedTests.GRE && (
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 flex justify-between">
                                      <span>GRE Total</span> <span className="text-slate-400 font-normal">Range: 260-340</span>
                                    </label>
                                    <input
                                      type="number"
                                      placeholder="e.g. 318"
                                      value={testScores.GRE}
                                      onChange={(e) => {
                                        setTestScores(prev => ({ ...prev, GRE: e.target.value }));
                                        if (errors.GRE) setErrors(prev => { const c = { ...prev }; delete c.GRE; return c; });
                                      }}
                                      className={`w-full px-3.5 py-1.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                        errors.GRE ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0A0F2C] focus:ring-[#0A0F2C]/10'
                                      }`}
                                    />
                                    {errors.GRE && <p className="text-xs text-rose-500 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /> <span>{errors.GRE}</span></p>}
                                  </div>
                                )}

                                {checkedTests.GMAT && (
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 flex justify-between">
                                      <span>GMAT Score</span> <span className="text-slate-400 font-normal">Range: 200-800</span>
                                    </label>
                                    <input
                                      type="number"
                                      placeholder="e.g. 680"
                                      value={testScores.GMAT}
                                      onChange={(e) => {
                                        setTestScores(prev => ({ ...prev, GMAT: e.target.value }));
                                        if (errors.GMAT) setErrors(prev => { const c = { ...prev }; delete c.GMAT; return c; });
                                      }}
                                      className={`w-full px-3.5 py-1.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                        errors.GMAT ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0A0F2C] focus:ring-[#0A0F2C]/10'
                                      }`}
                                    />
                                    {errors.GMAT && <p className="text-xs text-rose-500 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /> <span>{errors.GMAT}</span></p>}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                              <p className="text-xs text-slate-400">Select any tests above to input your current scores.</p>
                              <p className="text-[10px] text-slate-400 mt-1">If you haven't taken any, click next or skip to proceed.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {wizardStep === 4 && (
                    <div className="space-y-5" id="wizard-step-4">
                      <div className="border-b border-slate-100 pb-3 mb-2">
                        <h2 className="font-semibold text-[#0A0F2C] text-base">Step 4: Study Preferences</h2>
                        <p className="text-xs text-slate-400">Configure your target countries, budget constraints and academic majors.</p>
                      </div>

                      <div className="space-y-4">
                        {/* Target Degree Level */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500">Target Degree Level <span className="text-rose-500">*</span></label>
                          <div className="grid grid-cols-3 gap-3">
                            {['UG', 'PG', 'PhD'].map((deg) => (
                              <button
                                type="button"
                                key={deg}
                                onClick={() => {
                                  setTargetDegree(deg);
                                  if (errors.targetDegree) setErrors(prev => { const c = { ...prev }; delete c.targetDegree; return c; });
                                }}
                                className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                  targetDegree === deg 
                                    ? 'bg-[#0A0F2C] text-white border-[#0A0F2C] shadow-sm' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {deg === 'UG' ? 'Undergraduate (UG)' : deg === 'PG' ? 'Postgraduate (PG)' : 'Doctoral (PhD)'}
                              </button>
                            ))}
                          </div>
                          {errors.targetDegree && <p className="text-xs text-rose-500 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /> <span>{errors.targetDegree}</span></p>}
                        </div>

                        {/* Target Countries Chips (multi-select) */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500">Target Countries <span className="text-rose-500">*</span></label>
                          <div className="flex flex-wrap gap-2">
                            {COUNTRIES.map((country) => {
                              const isChecked = targetCountries.includes(country);
                              return (
                                <button
                                  type="button"
                                  key={country}
                                  onClick={() => {
                                    let nextCountries = [...targetCountries];
                                    if (isChecked) {
                                      nextCountries = nextCountries.filter(c => c !== country);
                                    } else {
                                      nextCountries.push(country);
                                    }
                                    setTargetCountries(nextCountries);
                                    if (errors.targetCountries) setErrors(prev => { const c = { ...prev }; delete c.targetCountries; return c; });
                                  }}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer flex items-center space-x-1.5 ${
                                    isChecked 
                                      ? 'bg-emerald-550 border-emerald-600 text-white bg-emerald-600 shadow-sm' 
                                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  {isChecked && <CheckCircle className="w-3 h-3 shrink-0" />}
                                  <span>{country}</span>
                                </button>
                              );
                            })}
                          </div>
                          {errors.targetCountries && <p className="text-xs text-rose-500 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /> <span>{errors.targetCountries}</span></p>}
                        </div>

                        {/* Budget Range per year */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500">Maximum Budget Range (Per Year) <span className="text-rose-500">*</span></label>
                          <select
                            value={budgetRange}
                            onChange={(e) => {
                              setBudgetRange(e.target.value);
                              if (errors.budgetRange) setErrors(prev => { const c = { ...prev }; delete c.budgetRange; return c; });
                            }}
                            className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                              errors.budgetRange ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0A0F2C] focus:ring-[#0A0F2C]/10'
                            }`}
                          >
                            <option value="">-- Choose Budget Range --</option>
                            <option value="<$20k">Less than $20k per year</option>
                            <option value="$20–40k">$20,000 – $40,000 per year</option>
                            <option value="$40–60k">$40,000 – $60,000 per year</option>
                            <option value=">$60k">More than $60,000 per year</option>
                          </select>
                          {errors.budgetRange && <p className="text-xs text-rose-500 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /> <span>{errors.budgetRange}</span></p>}
                        </div>

                        {/* Preferred Majors Input Tags */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 flex justify-between">
                            <span>Preferred Majors / Subjects <span className="text-rose-500">*</span></span>
                            <span className="text-[10px] text-slate-400">{preferredMajors.length}/3 Added</span>
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="e.g. Computer Science, Finance, psychology"
                              value={majorInput}
                              onChange={(e) => setMajorInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddMajor();
                                }
                              }}
                              className="grow px-3.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0A0F2C]"
                              disabled={preferredMajors.length >= 3}
                            />
                            <button
                              type="button"
                              onClick={handleAddMajor}
                              className="px-3 bg-[#0A0F2C] text-white rounded-lg hover:bg-[#1A254C] transition-all cursor-pointer flex items-center justify-center"
                              disabled={preferredMajors.length >= 3}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          {preferredMajors.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              {preferredMajors.map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#0A0F2C]/5 text-[#0A0F2C] font-semibold text-xs rounded-lg border border-[#0A0F2C]/10">
                                  <span>{tag}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => handleRemoveMajor(idx)}
                                    className="hover:bg-[#0A0F2C]/10 rounded-full p-0.5 text-slate-500 hover:text-rose-500 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          {errors.preferredMajors && <p className="text-xs text-rose-500 flex items-center space-x-1 mt-1"><AlertCircle className="w-3 h-3" /> <span>{errors.preferredMajors}</span></p>}
                          {errors.majors && <p className="text-xs text-rose-500 flex items-center space-x-1 mt-1"><AlertCircle className="w-3 h-3" /> <span>{errors.majors}</span></p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {wizardStep === 5 && (
                    <div className="space-y-5" id="wizard-step-5">
                      <div className="border-b border-slate-100 pb-3 mb-2">
                        <h2 className="font-semibold text-[#0A0F2C] text-base">Step 5: Dream Universities</h2>
                        <p className="text-xs text-slate-400">List up to 5 universities you dream of attending abroad.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 flex justify-between">
                            <span>Dream Schools <span className="text-rose-500">*</span></span>
                            <span className="text-[10px] text-slate-400">{dreamSchools.length}/5 Added</span>
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="e.g. Stanford University, University of Toronto, Oxford"
                              value={schoolInput}
                              onChange={(e) => setSchoolInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddSchool();
                                }
                              }}
                              className="grow px-3.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0A0F2C]"
                              disabled={dreamSchools.length >= 5}
                            />
                            <button
                              type="button"
                              onClick={handleAddSchool}
                              className="px-3 bg-[#0A0F2C] text-white rounded-lg hover:bg-[#1A254C] transition-all cursor-pointer flex items-center justify-center"
                              disabled={dreamSchools.length >= 5}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          {dreamSchools.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2 bg-white/5 p-2.5 rounded-lg border border-white/5">
                              {dreamSchools.map((school, idx) => (
                                <span key={idx} className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/10 text-white text-xs rounded-full shadow-sm border border-white/5">
                                  <School className="w-3 h-3" />
                                  <span>{school}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => handleRemoveSchool(idx)}
                                    className="bg-white/20 hover:bg-white/40 rounded-full p-0.5 text-white cursor-pointer"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          {errors.dreamSchools && <p className="text-xs text-rose-500 flex items-center space-x-1 mt-1"><AlertCircle className="w-3 h-3" /> <span>{errors.dreamSchools}</span></p>}
                          {errors.schools && <p className="text-xs text-rose-500 flex items-center space-x-1 mt-1"><AlertCircle className="w-3 h-3" /> <span>{errors.schools}</span></p>}
                        </div>

                        <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/10 flex items-start space-x-3 mt-4">
                          <CheckCircle className="w-5 h-5 text-[#00D26A] shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-bold text-[#00D26A]">You're almost there!</h4>
                            <p className="text-[11px] text-white/70 mt-0.5">
                              Once completed, we will customize the platform dashboard to highlight colleges, scholarships, and resources that best match your profile.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Wizard Navigation Footer */}
                {wizardStep >= 1 && (
                  <div className="bg-[#171717]/40 border-t border-white/5 px-8 py-6 flex items-center justify-between">
                    <div>
                      {wizardStep > 1 && (
                        <button
                          type="button"
                          onClick={handleBackStep}
                          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer border border-transparent"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                      )}
                    </div>

                    <div>
                      {wizardStep < 5 ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="flex items-center space-x-1.5 px-5 py-2.5 text-xs font-bold bg-white hover:bg-white/95 text-black rounded-lg transition-all shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <span>Continue</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleCompleteOnboarding}
                          className="flex items-center space-x-1.5 px-6 py-2.5 text-xs font-bold bg-[#00D26A] hover:bg-[#00D26A]/90 text-black rounded-lg transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Complete Profile</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
              )
            ) : (
              // Dashboard View when User data is ready!
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-5xl space-y-8"
                id="dashboard-container"
              >
                {/* Greeting Jumbotron Banner */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 text-white relative overflow-hidden" id="dashboard-hero">
                  <div className="absolute right-0 bottom-0 opacity-5 select-none pointer-events-none transform translate-y-6 translate-x-6">
                    <GraduationCap className="w-64 h-64 text-white" />
                  </div>
                  <div className="relative z-10 max-w-xl space-y-4">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/5 text-white/90 text-[10px] font-bold rounded-full tracking-widest uppercase border border-white/5">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span>Onboarding complete</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white" id="dashboard-welcome-heading">
                      Welcome, {user.name}.
                    </h1>
                    <p className="text-sm text-white/60 leading-relaxed font-light">
                      Your premium global education profile is configured. Use the specialized navigation above to explore target matches, draft polished admissions essays, track documents, and analyze entry odds.
                    </p>
                  </div>
                </div>

                {/* Dashboard Profile Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-bento-grid">
                  
                  {/* Grid 1: Academic Standing */}
                  <div className="bg-[#111111] rounded-2xl border border-white/5 p-6 flex flex-col justify-between" id="bento-academics">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Academics</span>
                        <div className="p-2 bg-white/5 text-white rounded-lg"><BookOpen className="w-4 h-4" /></div>
                      </div>
                      <h3 className="text-2xl font-bold text-white">{user.gpa}{user.gradingSystem === 'percentage' ? '%' : ' / 10'}</h3>
                      <p className="text-xs font-semibold text-white/70 mt-1">{user.board} Board • {user.stream} Stream</p>
                      
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-white h-full rounded-full" 
                            style={{ width: `${user.gradingSystem === 'percentage' ? user.gpa : (user.gpa * 10)}%` }} 
                          />
                        </div>
                        <p className="text-[10px] text-white/40 mt-1.5">Highest tier profile bracket for international review.</p>
                      </div>
                    </div>
                  </div>

                  {/* Grid 2: Test Scores */}
                  <div className="bg-[#111111] rounded-2xl border border-white/5 p-6 flex flex-col justify-between" id="bento-scores">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Standardized Tests</span>
                        <div className="p-2 bg-white/5 text-[#00D26A] rounded-lg"><Activity className="w-4 h-4" /></div>
                      </div>
                      
                      {Object.keys(user.testsTaken).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(user.testsTaken).map(([test, score]) => (
                            <div key={test} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                              <span className="text-xs font-bold text-white">{test}</span>
                              <span className="text-xs font-semibold px-2.5 py-0.5 bg-[#00D26A]/10 text-[#00D26A] border border-[#00D26A]/20 rounded-md">{score}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-xs text-white/40 italic">No scores registered yet.</p>
                          <p className="text-[10px] text-white/40 mt-1">Standardized tests were skipped during onboarding.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grid 3: Preferences */}
                  <div className="bg-[#111111] rounded-2xl border border-white/5 p-6 flex flex-col justify-between" id="bento-preferences">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Preferences</span>
                        <div className="p-2 bg-white/5 text-white rounded-lg"><Globe className="w-4 h-4" /></div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/50 font-medium">Target Degree:</span>
                          <span className="font-bold text-white">{user.targetDegree}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/50 font-medium">Est. Budget:</span>
                          <span className="font-bold text-white">{user.budgetRange} / yr</span>
                        </div>
                        <div>
                          <span className="text-white/50 text-xs font-medium">Countries:</span>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {user.targetCountries.map((c) => (
                              <span key={c} className="text-[10px] bg-white/10 text-white font-semibold px-2 py-0.5 rounded-full border border-white/5">{c}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid 4: Dream Schools & Preferred Majors */}
                  <div className="bg-[#111111] rounded-2xl border border-white/5 p-6 md:col-span-2 flex flex-col justify-between" id="bento-dream-schools">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                          <School className="w-4 h-4 text-white/40" />
                          <span>Dream Universities</span>
                        </h4>
                        <div className="space-y-2">
                          {user.dreamSchools.map((school, i) => (
                            <div key={i} className="flex items-center space-x-2 text-xs font-medium text-white/80">
                              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 text-white text-[10px] font-bold border border-white/5">{i + 1}</span>
                              <span>{school}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 sm:pl-6">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                          <Compass className="w-4 h-4 text-white/40" />
                          <span>Preferred Majors</span>
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {user.preferredMajors.map((m, i) => (
                            <span key={i} className="text-xs bg-white/5 text-white border border-white/5 px-3 py-1 rounded-lg font-medium">{m}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid 5: Action Controls */}
                  <div className="bg-[#111111] rounded-2xl border border-white/5 p-6 flex flex-col justify-between" id="bento-actions">
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">System Management</span>
                      <p className="text-xs text-white/50">Need to update your academic details or restart profile onboarding?</p>
                      
                      <button
                        type="button"
                        onClick={handleResetProfile}
                        className="w-full flex items-center justify-center space-x-2 py-2.5 text-xs font-bold bg-red-950/25 text-red-400 hover:bg-red-950/40 rounded-xl transition-all border border-red-500/10 cursor-pointer"
                        id="reset-profile-btn"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset Profile</span>
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            )
          ) : activeTab === 'find-colleges' ? (
            !user ? (
              <motion.div
                key="find-colleges-no-user"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full flex justify-center"
              >
                <div className="w-full max-w-xl text-center p-8 bg-[#111111] rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Compass className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Configure Your Profile First</h2>
                  <p className="text-sm text-white/60 mb-6">
                    Finding optimal matching schools requires academic results, standardized exam scores, and preferred majors. Please configure your profile first!
                  </p>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-6 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all cursor-pointer shadow-sm text-xs"
                  >
                    Go to Profile Setup
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="find-colleges-content"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full flex justify-center"
              >
                <FindColleges user={user} setActiveTab={setActiveTab} />
              </motion.div>
            )
          ) : activeTab === 'compare' ? (
            !user ? (
              <motion.div
                key="compare-no-user"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full flex justify-center"
              >
                <div className="w-full max-w-xl text-center p-8 bg-[#111111] rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <ArrowLeftRight className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Configure Your Profile First</h2>
                  <p className="text-sm text-white/60 mb-6">
                    Comparing global university options side-by-side requires completing your onboarding profile first.
                  </p>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-6 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all cursor-pointer shadow-sm text-xs"
                  >
                    Go to Profile Setup
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="compare-content"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full flex justify-center"
              >
                <Compare setActiveTab={setActiveTab} />
              </motion.div>
            )
          ) : activeTab === 'course-finder' ? (
            !user ? (
              <motion.div
                key="course-finder-no-user"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full flex justify-center"
              >
                <div className="w-full max-w-xl text-center p-8 bg-[#111111] rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Configure Your Profile First</h2>
                  <p className="text-sm text-white/60 mb-6">
                    Finding optimal degree courses matching your background requires completing your onboarding profile first.
                  </p>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-6 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all cursor-pointer shadow-sm text-xs"
                  >
                    Go to Profile Setup
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="course-finder-content"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full flex justify-center"
              >
                <CourseFinder user={user} />
              </motion.div>
            )
          ) : activeTab === 'admission-odds' ? (
            !user ? (
              <motion.div
                key="admission-odds-no-user"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full flex justify-center"
              >
                <div className="w-full max-w-xl text-center p-8 bg-[#111111] rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Configure Your Profile First</h2>
                  <p className="text-sm text-white/60 mb-6">
                    The Admission Odds engine requires your academic grades, standardized test scores, and study preferences. Please complete your onboarding profile first!
                  </p>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-6 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all cursor-pointer shadow-sm text-xs"
                  >
                    Go to Profile Setup
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="admission-odds-content"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full flex justify-center"
              >
                <AdmissionOdds user={user} setActiveTab={setActiveTab} />
              </motion.div>
            )
          ) : activeTab === 'essay-coach' ? (
            <motion.div
              key="essay-coach-content"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
            >
              <EssayCoach user={user} setActiveTab={setActiveTab} />
            </motion.div>
          ) : activeTab === 'scholarships' ? (
            <motion.div
              key="scholarships-content"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
            >
              <ScholarshipFinder user={user} setActiveTab={setActiveTab} />
            </motion.div>
          ) : activeTab === 'documents' ? (
            <motion.div
              key="documents-content"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
            >
              <DocumentManager />
            </motion.div>
          ) : (
            // Placeholder view for coming soon tabs
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="w-full flex justify-center"
              id="tab-content-container"
            >
              <div 
                className="bg-[#111111] rounded-2xl shadow-2xl w-[520px] max-w-full h-[340px] flex flex-col items-center justify-center border border-white/5 p-8 text-center"
                id="placeholder-card"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6" id="icon-container">
                  <currentTab.icon className="w-10 h-10 text-white/30 stroke-[1.5]" />
                </div>

                <h2 className="text-white text-2xl font-light tracking-wide" id="tab-text">
                  {currentTab.name} coming soon
                </h2>
                <p className="text-white/40 text-sm mt-2" id="placeholder-tagline">
                  We're building the future of premium global education.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Custom CSS */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Footer Strip */}
      <footer 
        className="h-10 bg-white border-t border-gray-200 flex items-center px-8 text-[11px] text-[#6B7280] font-medium shrink-0 tracking-wide"
        id="footer-strip"
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-start">
          <span>Get &middot; Built for Indian students going abroad</span>
        </div>
      </footer>
    </div>
  );
}
