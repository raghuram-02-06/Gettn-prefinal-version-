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

      if (!personalEmail.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(personalEmail)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!personalPhone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[+0-9\s()-]{10,18}$/.test(personalPhone.replace(/\s+/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
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
    if (validateStep(wizardStep)) {
      setWizardStep(prev => prev + 1);
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
    <div className="min-h-screen flex flex-col bg-[#F4F6FB] text-slate-800 antialiased font-sans select-none">
      {/* Top Navbar Section */}
      <header className="bg-[#0A0F2C] shrink-0 shadow-sm" id="header-nav">
        <nav className="h-14 flex items-center px-8 justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center space-x-3">
            <span 
              className="text-white text-[24px] font-medium tracking-tight select-none" 
              id="brand-wordmark"
            >
              Get
            </span>
          </div>
          <div className="text-xs text-white/40 font-medium tracking-wider hidden sm:block">
            Built for Indian students going abroad
          </div>
        </nav>

        {/* Horizontal Navigation Tabs */}
        <div className="bg-[#0A0F2C] border-t border-white/10 shrink-0">
          <div className="max-w-7xl mx-auto px-8 w-full">
            <nav className="h-12 flex space-x-8 overflow-x-auto no-scrollbar text-[14px] font-medium" aria-label="Tabs" id="main-tabs-nav">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-btn-${tab.id}`}
                    onClick={() => {
                      setActiveTab(tab.id);
                    }}
                    className={`tab-item relative h-full flex items-center transition-colors duration-200 cursor-pointer focus:outline-none whitespace-nowrap ${
                      isActive ? 'text-white' : 'text-white/60 hover:text-white/90'
                    }`}
                  >
                    <span>{tab.name}</span>
                    
                    {/* Active Underline Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[3px] bg-white"
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
      <main className="grow flex items-center justify-center p-6 md:p-12 bg-[#F4F6FB]" id="main-content">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            // Dashboard tab logic
            !user ? (
              // Onboarding Wizard Card (only shown if localStorage key "get_user" is missing)
              <motion.div
                key="wizard-view"
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-2xl bg-white rounded-[16px] shadow-[0_12px_40px_rgba(10,15,44,0.08)] border border-[#E0E4ED] overflow-hidden"
                id="wizard-card-wrapper"
              >
                {/* Header of the Onboarding Wizard */}
                <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex items-center justify-between">
                  <div>
                    <h1 className="text-lg font-bold text-[#0A0F2C] tracking-tight">Setup Your Profile</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Let's craft your custom global education road map</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#0A0F2C] px-2.5 py-1 bg-[#0A0F2C]/5 rounded-full">
                      Step {wizardStep} of 5
                    </span>
                  </div>
                </div>

                {/* Progress bar at top of wizard showing step X of 5 */}
                <div className="h-1.5 w-full bg-slate-100 relative" id="wizard-progress-track">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300 ease-out rounded-r-full" 
                    style={{ width: `${(wizardStep / 5) * 100}%` }}
                    id="wizard-progress-bar"
                  />
                </div>

                {/* Wizard Form Area */}
                <div className="p-8">
                  {wizardStep === 1 && (
                    <div className="space-y-5" id="wizard-step-1">
                      <div className="border-b border-slate-100 pb-3 mb-2">
                        <h2 className="font-semibold text-[#0A0F2C] text-base">Step 1: Personal Details</h2>
                        <p className="text-xs text-slate-400">Introduce yourself to start your journey.</p>
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
                            type="tel"
                            placeholder="e.g. +91 98765 43210"
                            value={personalPhone}
                            onChange={(e) => {
                              setPersonalPhone(e.target.value);
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
                            <div className="flex flex-wrap gap-1.5 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              {dreamSchools.map((school, idx) => (
                                <span key={idx} className="inline-flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-[#0A0F2C] to-[#1E2E6B] text-white text-xs rounded-full shadow-sm">
                                  <School className="w-3 h-3" />
                                  <span>{school}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => handleRemoveSchool(idx)}
                                    className="bg-white/20 hover:bg-white/45 rounded-full p-0.5 text-white cursor-pointer"
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

                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start space-x-3 mt-4">
                          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-bold text-emerald-800">You're almost there!</h4>
                            <p className="text-[11px] text-emerald-700 mt-0.5">
                              Once completed, we will customize the platform dashboard to highlight colleges, scholarships, and resources that best match your profile.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Wizard Navigation Footer */}
                <div className="bg-slate-50 border-t border-slate-100 px-8 py-5 flex items-center justify-between">
                  <div>
                    {wizardStep > 1 && (
                      <button
                        type="button"
                        onClick={handleBackStep}
                        className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-slate-600 hover:text-[#0A0F2C] hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
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
                        className="flex items-center space-x-1.5 px-5 py-2.5 text-xs font-bold bg-[#0A0F2C] hover:bg-[#1A254C] text-white rounded-lg transition-all shadow-sm cursor-pointer"
                      >
                        <span>Continue</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCompleteOnboarding}
                        className="flex items-center space-x-1.5 px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-md cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Complete Profile</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              // Dashboard View when User data is ready!
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-5xl"
                id="dashboard-container"
              >
                {/* Greeting Jumbotron Banner */}
                <div className="bg-gradient-to-r from-[#0A0F2C] to-[#1E2E6B] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden mb-8" id="dashboard-hero">
                  <div className="absolute right-0 bottom-0 opacity-15 select-none pointer-events-none transform translate-y-6 translate-x-6">
                    <GraduationCap className="w-64 h-64 text-white" />
                  </div>
                  <div className="relative z-10 max-w-xl space-y-4">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full tracking-wider uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Onboarding complete</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight" id="dashboard-welcome-heading">
                      Welcome, {user.name}. Let's get you admitted.
                    </h1>
                    <p className="text-sm text-slate-200/90 leading-relaxed font-light">
                      Your profile has been synchronized successfully. Below is your current standing and personalized target plan for studying abroad. Use the tabs above to explore specialized assistance.
                    </p>
                  </div>
                </div>

                {/* Dashboard Profile Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-bento-grid">
                  
                  {/* Grid 1: Academic Standing */}
                  <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 flex flex-col justify-between" id="bento-academics">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Academics</span>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><BookOpen className="w-4 h-4" /></div>
                      </div>
                      <h3 className="text-2xl font-bold text-[#0A0F2C]">{user.gpa}{user.gradingSystem === 'percentage' ? '%' : ' / 10'}</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-1">{user.board} Board • {user.stream} Stream</p>
                      
                      <div className="mt-4 pt-4 border-t border-slate-50">
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full" 
                            style={{ width: `${user.gradingSystem === 'percentage' ? user.gpa : (user.gpa * 10)}%` }} 
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5">Equivalent to high academic tier for international evaluation.</p>
                      </div>
                    </div>
                  </div>

                  {/* Grid 2: Test Scores */}
                  <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 flex flex-col justify-between" id="bento-scores">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Standardized Tests</span>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Activity className="w-4 h-4" /></div>
                      </div>
                      
                      {Object.keys(user.testsTaken).length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(user.testsTaken).map(([test, score]) => (
                            <div key={test} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                              <span className="text-xs font-bold text-[#0A0F2C]">{test}</span>
                              <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">{score}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-xs text-slate-400 italic">No scores registered yet.</p>
                          <p className="text-[10px] text-slate-400 mt-1">Standardized tests were skipped during onboarding.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grid 3: Preferences */}
                  <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 flex flex-col justify-between" id="bento-preferences">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Study Preferences</span>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Globe className="w-4 h-4" /></div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Target Degree:</span>
                          <span className="font-bold text-[#0A0F2C]">{user.targetDegree}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Est. Budget:</span>
                          <span className="font-bold text-indigo-650 text-indigo-600">{user.budgetRange} / yr</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs font-medium">Countries:</span>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {user.targetCountries.map((c) => (
                              <span key={c} className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">{c}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid 4: Dream Schools & Preferred Majors */}
                  <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 md:col-span-2 flex flex-col justify-between" id="bento-dream-schools">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-[#0A0F2C] uppercase tracking-wider flex items-center space-x-1.5">
                          <School className="w-4 h-4 text-slate-400" />
                          <span>Dream Universities</span>
                        </h4>
                        <div className="space-y-2">
                          {user.dreamSchools.map((school, i) => (
                            <div key={i} className="flex items-center space-x-2 text-xs font-medium text-slate-600">
                              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#0A0F2C]/5 text-[#0A0F2C] text-[10px] font-bold">{i + 1}</span>
                              <span>{school}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6">
                        <h4 className="text-xs font-bold text-[#0A0F2C] uppercase tracking-wider flex items-center space-x-1.5">
                          <Compass className="w-4 h-4 text-slate-400" />
                          <span>Preferred Majors</span>
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {user.preferredMajors.map((m, i) => (
                            <span key={i} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-lg font-medium">{m}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid 5: Action Controls */}
                  <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 flex flex-col justify-between" id="bento-actions">
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">System Management</span>
                      <p className="text-xs text-slate-400">Need to update your details or re-take the onboarding steps?</p>
                      
                      <button
                        type="button"
                        onClick={handleResetProfile}
                        className="w-full flex items-center justify-center space-x-2 py-2.5 text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-all border border-rose-100 cursor-pointer"
                        id="reset-profile-btn"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset Onboarding Profile</span>
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
                <div className="w-full max-w-xl text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Compass className="w-8 h-8 text-[#0A0F2C]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#0A0F2C] mb-2">Set Up Your Profile First</h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Discovering the best matching universities requires your academic grades, standardized test scores, and study preferences. Please complete your onboarding profile first!
                  </p>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-6 py-2.5 bg-[#0A0F2C] text-white font-bold rounded-lg hover:bg-[#1A254C] transition-all cursor-pointer shadow-sm text-xs"
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
                <div className="w-full max-w-xl text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <ArrowLeftRight className="w-8 h-8 text-[#0A0F2C]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#0A0F2C] mb-2">Set Up Your Profile First</h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Comparing global university options side-by-side requires completing your onboarding profile first.
                  </p>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-6 py-2.5 bg-[#0A0F2C] text-white font-bold rounded-lg hover:bg-[#1A254C] transition-all cursor-pointer shadow-sm text-xs"
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
                <div className="w-full max-w-xl text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-[#0A0F2C]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#0A0F2C] mb-2">Set Up Your Profile First</h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Finding optimal degree courses matching your background requires completing your onboarding profile first.
                  </p>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-6 py-2.5 bg-[#0A0F2C] text-white font-bold rounded-lg hover:bg-[#1A254C] transition-all cursor-pointer shadow-sm text-xs"
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
                <div className="w-full max-w-xl text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-[#0A0F2C]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#0A0F2C] mb-2">Set Up Your Profile First</h2>
                  <p className="text-sm text-slate-500 mb-6">
                    The Admission Odds engine requires your academic grades, standardized test scores, and study preferences. Please complete your onboarding profile first!
                  </p>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-6 py-2.5 bg-[#0A0F2C] text-white font-bold rounded-lg hover:bg-[#1A254C] transition-all cursor-pointer shadow-sm text-xs"
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
                className="bg-white rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] w-[520px] max-w-full h-[340px] flex flex-col items-center justify-center border border-[#E0E4ED] p-8 text-center"
                id="placeholder-card"
              >
                <div className="w-20 h-20 bg-[#F4F6FB] rounded-full flex items-center justify-center mb-6" id="icon-container">
                  <currentTab.icon className="w-10 h-10 text-[#0A0F2C]/20 stroke-[1.5]" />
                </div>

                <h2 className="text-[#8A94A6] text-2xl font-light tracking-wide" id="tab-text">
                  {currentTab.name} coming soon
                </h2>
                <p className="text-[#B0B8C8] text-sm mt-2" id="placeholder-tagline">
                  We're building the future of global education.
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
