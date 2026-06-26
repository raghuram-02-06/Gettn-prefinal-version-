import { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  Trash2, 
  Check, 
  Compass, 
  HelpCircle,
  AlertCircle,
  Plus,
  Sparkles,
  Sliders,
  Download,
  Award,
  BookmarkCheck,
  RefreshCw,
  Flame,
  Info,
  Layers,
  BookOpen,
  Share2,
  CheckCircle,
  TrendingUp,
  User,
  Scale,
  MessageSquare,
  FileText,
  Star,
  Coins
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
  pros?: string[];
  cons?: string[];
}

interface CompareProps {
  setActiveTab: (tab: string) => void;
}

// Preset Colleges Pool for direct adding
const PRESET_COLLEGES: College[] = [
  {
    name: "Massachusetts Institute of Technology (MIT)",
    country: "United States",
    ranking: "#1 QS World Ranking",
    avgTuition: "₹48.5 Lakhs/yr ($58,000 USD)",
    acceptanceRate: "4.8%",
    fitScore: 94,
    fitReason: "World-leader in STEM. High prestige but extremely selective. Excellent funding but high living expenses.",
    ieltsRequirement: "7.5",
    scholarshipAvailability: "High (Need-Blind Admission & Full-Need Aid)",
    pros: ["Global #1 STEM Reputation", "Unbeatable research grants", "Alumni network in tech/finance"],
    cons: ["Extremely expensive", "Lowest acceptance rate globally", "Intense, high-stress environment"]
  },
  {
    name: "Stanford University",
    country: "United States",
    ranking: "#5 QS World Ranking",
    avgTuition: "₹50.1 Lakhs/yr ($60,000 USD)",
    acceptanceRate: "3.9%",
    fitScore: 92,
    fitReason: "Silicon Valley proximity. Unparalleled entrepreneurial ecosystem. High living expenses.",
    ieltsRequirement: "7.0",
    scholarshipAvailability: "High (Need-Based and Athletic Scholarships)",
    pros: ["Heart of Silicon Valley", "Unmatched startup/VC access", "Incredible weather & campus"],
    cons: ["High living costs in CA", "Highly competitive admission", "Expensive tuition"]
  },
  {
    name: "Harvard University",
    country: "United States",
    ranking: "#4 QS World Ranking",
    avgTuition: "₹47.0 Lakhs/yr ($56,000 USD)",
    acceptanceRate: "3.4%",
    fitScore: 90,
    fitReason: "Unmatched prestige. Ivy League networks. Strong need-blind financial aid for international students.",
    ieltsRequirement: "7.5",
    scholarshipAvailability: "High (100% Demonstrated Financial Need Met)",
    pros: ["Supreme global prestige", "Immense endowment & aid", "Elite global leaders network"],
    cons: ["Very cold winters", "Slightly less engineering-focused than MIT", "Intensely competitive"]
  },
  {
    name: "University of Oxford",
    country: "United Kingdom",
    ranking: "#3 QS World Ranking",
    avgTuition: "₹38.5 Lakhs/yr (£37,000 GBP)",
    acceptanceRate: "14.3%",
    fitScore: 88,
    fitReason: "Historic prestige. Intensive tutorial model. Relatively high IELTS but shorter degree length (3 years).",
    ieltsRequirement: "7.5",
    scholarshipAvailability: "Medium (Rhodes & Clarendon Scholarships available)",
    pros: ["Historic prestige", "Oxford Union & Tutorial system", "3-year degree saves 1 year of cost"],
    cons: ["Strict academic grading", "Slightly less flexible major switching", "High cost of living"]
  },
  {
    name: "University of Cambridge",
    country: "United Kingdom",
    ranking: "#2 QS World Ranking",
    avgTuition: "₹40.1 Lakhs/yr (£38,500 GBP)",
    acceptanceRate: "15.8%",
    fitScore: 89,
    fitReason: "Top academic standing globally. Exceptional collegiate structure. Excellent research facilities.",
    ieltsRequirement: "7.5",
    scholarshipAvailability: "Medium (Gates Cambridge & Commonwealth Trust)",
    pros: ["Exceptional scientific lineage", "Charming college community structure", "Excellent research funding"],
    cons: ["High IELTS requirement", "Rigid course structure", "High international student fees"]
  },
  {
    name: "University of Toronto",
    country: "Canada",
    ranking: "#21 QS World Ranking",
    avgTuition: "₹34.0 Lakhs/yr ($55,000 CAD)",
    acceptanceRate: "43.0%",
    fitScore: 85,
    fitReason: "Canada's top institution. Highly accessible compared to Ivy Leagues. Great post-study work visa (PGWP) pathways.",
    ieltsRequirement: "6.5",
    scholarshipAvailability: "High (Lester B. Pearson International Scholarship)",
    pros: ["Highly respected worldwide", "Excellent PGWP (Post-Study Work) pathways", "Diverse metropolitan culture"],
    cons: ["Freezing cold winter weather", "Huge class sizes in early years", "High tuition for top business/CS degrees"]
  },
  {
    name: "University of Melbourne",
    country: "Australia",
    ranking: "#14 QS World Ranking",
    avgTuition: "₹28.5 Lakhs/yr ($52,000 AUD)",
    acceptanceRate: "35.0%",
    fitScore: 82,
    fitReason: "Top university in Australia. Very friendly climate, high quality of life. Flexible 'Melbourne Model' curriculum.",
    ieltsRequirement: "6.5",
    scholarshipAvailability: "Medium (Melbourne International Undergrad Scholarship)",
    pros: ["Exceptional quality of life", "Flexible Australian model", "Simplified visa process"],
    cons: ["Very far from India & Europe", "Fewer Fortune 500 tech headquarters", "High exchange rate fluctuation"]
  },
  {
    name: "National University of Singapore (NUS)",
    country: "Singapore",
    ranking: "#8 QS World Ranking",
    avgTuition: "₹22.0 Lakhs/yr ($36,000 SGD)",
    acceptanceRate: "12.0%",
    fitScore: 87,
    fitReason: "Best in Asia. Clean, safe, high tech. MoE tuition grant scheme provides deep discounts for service commitments.",
    ieltsRequirement: "6.5",
    scholarshipAvailability: "High (NUS Science & Tech Scholarship)",
    pros: ["Safe, clean, close to India", "World-class CS/Engineering focus", "Generous Tuition Grant options"],
    cons: ["Humid tropical climate", "Extremely dense academic stress", "Strict bond requirement for local work"]
  },
  {
    name: "Technical University of Munich (TUM)",
    country: "Germany",
    ranking: "#37 QS World Ranking",
    avgTuition: "₹0 - 3.5 Lakhs/yr (€0 - €4,000 EUR)",
    acceptanceRate: "18.0%",
    fitScore: 95,
    fitReason: "Virtually zero tuition fees! Premium German engineering hub. High living expenses but extreme value for money.",
    ieltsRequirement: "6.5",
    scholarshipAvailability: "Low (DAAD Grants & Deutschlandstipendium)",
    pros: ["Virtually zero tuition fees!", "German high-tech industrial hub", "Strong engineering & AI research"],
    cons: ["Required basic German for social life", "Slightly harder to find student housing", "Rigorous German exam system"]
  },
  {
    name: "Trinity College Dublin (TCD)",
    country: "Ireland",
    ranking: "#81 QS World Ranking",
    avgTuition: "₹21.5 Lakhs/yr (€24,000 EUR)",
    acceptanceRate: "33.5%",
    fitScore: 80,
    fitReason: "Ireland's historical premier institute. Gateway to European tech sector headquarters. 2-year post-study work visa.",
    ieltsRequirement: "6.5",
    scholarshipAvailability: "Medium (Global Excellence Postgraduate Scholarships)",
    pros: ["Historic university in EU tech hub", "Friendly, vibrant student city", "2-year post-grad work visa"],
    cons: ["High Dublin accommodation rent crisis", "Slightly lower global ranking than Oxbridge", "Unpredictable rainy weather"]
  }
];

// Curated bundles to quickly populate the compare screen
const DEMO_BUNDLES = [
  {
    name: "Elite US Ivy & Peers",
    description: "Compare MIT, Stanford, and Harvard.",
    collegeNames: ["Massachusetts Institute of Technology (MIT)", "Stanford University", "Harvard University"],
    icon: Flame,
    color: "from-rose-500 to-red-600"
  },
  {
    name: "High Value / Low Tuition",
    description: "Compare low tuition gems like TUM, NUS, and Toronto.",
    collegeNames: ["Technical University of Munich (TUM)", "National University of Singapore (NUS)", "University of Toronto"],
    icon: Award,
    color: "from-emerald-500 to-teal-600"
  },
  {
    name: "Global Elite Giants",
    description: "Compare Oxford, Cambridge, and University of Melbourne.",
    collegeNames: ["University of Oxford", "University of Cambridge", "University of Melbourne"],
    icon: Sparkles,
    color: "from-indigo-500 to-purple-600"
  }
];

// Parsing helpers
const parseNumber = (str: string): number => {
  if (!str) return 0;
  const matched = str.replace(/[^0-9.]/g, '');
  return parseFloat(matched) || 0;
};

const parseRanking = (str: string): number => {
  if (!str) return 9999;
  const matched = str.match(/\d+/);
  if (matched) {
    return parseInt(matched[0]);
  }
  return 9999;
};

const parseTuitionLakhs = (str: string): number => {
  if (!str) return 0;
  const lower = str.toLowerCase();
  if (lower.includes('₹0') || lower.includes('zero') || lower.includes('free')) return 0;
  
  const lakhsMatch = lower.match(/₹\s*([0-9.]+)\s*lakh/);
  if (lakhsMatch) {
    return parseFloat(lakhsMatch[1]);
  }
  
  const anyNumMatch = lower.match(/[0-9.]+/);
  if (anyNumMatch) {
    return parseFloat(anyNumMatch[0]);
  }
  return 30; // standard average
};

const getScholarshipScore = (availability?: string): number => {
  if (!availability) return 0;
  const lower = availability.toLowerCase();
  if (lower.includes('high') || lower.includes('full') || lower.includes('up to 100')) return 3;
  if (lower.includes('merit') || lower.includes('yes') || lower.includes('medium')) return 2;
  if (lower.includes('limited') || lower.includes('low')) return 1;
  return 0;
};

export default function Compare({ setActiveTab }: CompareProps) {
  const [colleges, setColleges] = useState<College[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  
  // Weights State for personalized prioritization
  const [weights, setWeights] = useState({
    ranking: 3,
    tuition: 3,
    acceptance: 3,
    scholarship: 3,
    base: 3
  });

  // Saved student notes state
  const [collegeNotes, setCollegeNotes] = useState<Record<string, string>>({});

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('get_colleges');
    if (saved) {
      try {
        setColleges(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse get_colleges from localStorage', e);
      }
    }

    const savedNotes = localStorage.getItem('get_college_notes');
    if (savedNotes) {
      try {
        setCollegeNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to parse get_college_notes', e);
      }
    }
  }, []);

  // Sync colleges to localStorage
  const saveColleges = (updated: College[]) => {
    setColleges(updated);
    localStorage.setItem('get_colleges', JSON.stringify(updated));
  };

  // Sync notes to localStorage
  const handleSaveNote = (collegeName: string, note: string) => {
    const updatedNotes = { ...collegeNotes, [collegeName]: note };
    setCollegeNotes(updatedNotes);
    localStorage.setItem('get_college_notes', JSON.stringify(updatedNotes));
  };

  // Remove single college
  const handleRemove = (name: string) => {
    const updated = colleges.filter(c => c.name.toLowerCase() !== name.toLowerCase());
    saveColleges(updated);
  };

  // Clear all colleges
  const handleClearAll = () => {
    saveColleges([]);
  };

  // Add a college directly
  const handleAddCollege = (college: College) => {
    const alreadyExists = colleges.some(c => c.name.toLowerCase() === college.name.toLowerCase());
    if (alreadyExists) {
      setSearchTerm('');
      setShowSearchDropdown(false);
      return;
    }
    if (colleges.length >= 4) {
      alert("You can compare up to 4 universities at once for optimal visibility.");
      setSearchTerm('');
      setShowSearchDropdown(false);
      return;
    }

    // Default pros and cons if not present
    const enhanced = {
      ...college,
      pros: college.pros || ["Strong global ranking prestige", "Excellent infrastructure", "Diverse international student crowd"],
      cons: college.cons || ["Highly competitive", "Selective admission rates", "Standard living costs"]
    };

    saveColleges([...colleges, enhanced]);
    setSearchTerm('');
    setShowSearchDropdown(false);
  };

  // Seed bundle
  const handleLoadBundle = (bundleNames: string[]) => {
    const selected = PRESET_COLLEGES.filter(c => bundleNames.includes(c.name));
    saveColleges(selected);
  };

  // Filter dropdown presets based on search
  const filteredPresets = PRESET_COLLEGES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Personalized Alignment score calculation
  const calculatePersonalizedScore = (college: College) => {
    // 1. Ranking score: 1 = high ranking (e.g. rank 1 is 100%, rank 100 is 60%)
    const rankNum = parseRanking(college.ranking);
    const rankScore = Math.max(10, 100 - (rankNum * 0.4));

    // 2. Tuition score: lower is better (0 Lakhs tuition is 100%, 50 Lakhs is 20%)
    const tuitionLakhs = parseTuitionLakhs(college.avgTuition);
    const tuitionScore = Math.max(15, 100 - (tuitionLakhs * 1.6));

    // 3. Acceptance rate score: higher is easier (safety choice)
    const accNum = parseNumber(college.acceptanceRate);
    const acceptanceScore = Math.min(100, Math.max(15, accNum * 2));

    // 4. Scholarship score
    const schScore = getScholarshipScore(college.scholarshipAvailability) * 33.3;

    // 5. Default base profile fit score
    const baseScore = college.fitScore || 80;

    const totalWeight = weights.ranking + weights.tuition + weights.acceptance + weights.scholarship + weights.base;
    if (totalWeight === 0) return college.fitScore;

    const weightedAverage = 
      (rankScore * weights.ranking) +
      (tuitionScore * weights.tuition) +
      (acceptanceScore * weights.acceptance) +
      (schScore * weights.scholarship) +
      (baseScore * weights.base);

    return Math.round(weightedAverage / totalWeight);
  };

  // Best Index identifiers
  const bestRankingIdx = colleges.reduce((bestIdx, current, idx, arr) => {
    const bestVal = parseRanking(arr[bestIdx].ranking);
    const currVal = parseRanking(current.ranking);
    return currVal < bestVal ? idx : bestIdx;
  }, 0);

  const bestTuitionIdx = colleges.reduce((bestIdx, current, idx, arr) => {
    const bestVal = parseTuitionLakhs(arr[bestIdx].avgTuition);
    const currVal = parseTuitionLakhs(current.avgTuition);
    return currVal < bestVal ? idx : bestIdx;
  }, 0);

  const bestAcceptanceIdx = colleges.reduce((bestIdx, current, idx, arr) => {
    const bestVal = parseNumber(arr[bestIdx].acceptanceRate);
    const currVal = parseNumber(current.acceptanceRate);
    return currVal > bestVal ? idx : bestIdx;
  }, 0);

  const bestIeltsIdx = colleges.reduce((bestIdx, current, idx, arr) => {
    const bestVal = parseNumber(arr[bestIdx].ieltsRequirement || '9.0');
    const currVal = parseNumber(current.ieltsRequirement || '9.0');
    return currVal < bestVal ? idx : bestIdx;
  }, 0);

  const bestScholarshipIdx = colleges.reduce((bestIdx, current, idx, arr) => {
    const bestVal = getScholarshipScore(arr[bestIdx].scholarshipAvailability);
    const currVal = getScholarshipScore(current.scholarshipAvailability);
    return currVal > bestVal ? idx : bestIdx;
  }, 0);

  const bestWeightedIdx = colleges.reduce((bestIdx, current, idx, arr) => {
    const bestScore = calculatePersonalizedScore(arr[bestIdx]);
    const currScore = calculatePersonalizedScore(current);
    return currScore > bestScore ? idx : bestIdx;
  }, 0);

  // Generate recommendation verdict text
  const getRecommendationVerdict = () => {
    if (colleges.length === 0) return "";
    const topColl = colleges[bestWeightedIdx];
    const cheapestColl = colleges[bestTuitionIdx];
    const prestigiousColl = colleges[bestRankingIdx];

    return {
      topName: topColl.name,
      topReason: topColl.fitReason,
      cheapName: cheapestColl.name,
      cheapTuition: cheapestColl.avgTuition,
      prestigeName: prestigiousColl.name,
      prestigeRank: prestigiousColl.ranking
    };
  };

  const verdict = getRecommendationVerdict();

  return (
    <div className="w-full max-w-5xl space-y-8 pb-12" id="compare-colleges-tab">
      
      {/* Intro Header */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 text-white relative overflow-hidden" id="compare-header">
        <div className="absolute right-0 bottom-0 opacity-5 select-none pointer-events-none transform translate-y-4 translate-x-4">
          <ArrowLeftRight className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/5 text-white text-[10px] font-bold rounded-full tracking-widest uppercase border border-white/5">
            <ArrowLeftRight className="w-3.5 h-3.5 text-white" />
            <span>Side-By-Side Comparison Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Criteria Alignment Matrix &amp; Dashboard
          </h1>
          <p className="text-sm text-white/60 leading-relaxed font-light">
            Compare universities side-by-side. Highlight the optimal choices in pure white, customize priority weights to recalculate alignment scores, visualize tuition side-by-side, and save custom notes for your application timeline!
          </p>
        </div>
      </div>

      {/* Direct Add & Bundles Tool Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Dynamic Selector Dropdown */}
        <div className="bg-[#111111] rounded-xl border border-white/5 p-5 space-y-3 relative md:col-span-2 shadow-2xl" id="quick-add-colleges-tool">
          <div className="flex items-center space-x-2 text-white">
            <Plus className="w-4 h-4 text-white" />
            <h3 className="font-bold text-xs uppercase tracking-widest text-white">Quick Add University</h3>
          </div>
          <p className="text-[11px] text-white/40">Search and add global institutions to start side-by-side analysis.</p>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Type university name (e.g. Stanford, Toronto, TUM)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full px-3.5 py-2 text-xs font-medium bg-black border border-white/10 text-white rounded-lg focus:outline-none focus:border-white focus:bg-black transition-all"
              id="compare-search-input"
            />
            {showSearchDropdown && (
              <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-black border border-white/15 rounded-lg shadow-2xl z-50 divide-y divide-white/5">
                {filteredPresets.length > 0 ? (
                  filteredPresets.map((preset) => {
                    const isAlreadyIn = colleges.some(c => c.name.toLowerCase() === preset.name.toLowerCase());
                    return (
                      <button
                        key={preset.name}
                        onClick={() => handleAddCollege(preset)}
                        disabled={isAlreadyIn}
                        className={`w-full text-left px-3.5 py-2 text-xs flex justify-between items-center transition-colors ${
                          isAlreadyIn 
                            ? 'text-white/30 bg-white/5 cursor-not-allowed' 
                            : 'hover:bg-white/5 text-white/95'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">🌐</span>
                          <div>
                            <span className="font-bold">{preset.name}</span>
                            <span className="block text-[9px] text-white/40 font-light">{preset.country} • Rank {preset.ranking}</span>
                          </div>
                        </div>
                        {isAlreadyIn ? (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                            <Check className="w-3 h-3" />
                            <span>Added</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-white font-bold hover:underline">+ Add</span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-2.5 text-xs text-white/40 text-center italic">No universities match your search</div>
                )}
                {searchTerm && (
                  <button
                    onClick={() => {
                      handleAddCollege({
                        name: searchTerm,
                        country: "Custom Entity",
                        ranking: "Unranked",
                        avgTuition: "₹30.0 Lakhs/yr (Est)",
                        acceptanceRate: "35.0%",
                        fitScore: 80,
                        fitReason: "Direct user added customized research institution."
                      });
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-white hover:bg-white/5 font-bold transition-colors block border-t border-white/10"
                  >
                    + Add Custom University "{searchTerm}"
                  </button>
                )}
              </div>
            )}
            {showSearchDropdown && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowSearchDropdown(false)} 
              />
            )}
          </div>
        </div>

        {/* Curator Sample Presets */}
        <div className="bg-[#111111] rounded-xl border border-white/5 p-5 space-y-3 shadow-2xl" id="sample-preset-bundles">
          <div className="flex items-center space-x-2 text-white">
            <Layers className="w-4 h-4 text-white" />
            <h3 className="font-bold text-xs uppercase tracking-widest text-white">Curator Decks</h3>
          </div>
          <p className="text-[11px] text-white/40">Load hand-picked decks instantly to test all features.</p>
          
          <div className="flex flex-col gap-2">
            {DEMO_BUNDLES.map((bundle) => (
              <button
                key={bundle.name}
                onClick={() => handleLoadBundle(bundle.collegeNames)}
                className="text-left w-full p-2 rounded-lg border border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10 transition-all text-xs flex justify-between items-center cursor-pointer"
              >
                <div>
                  <div className="font-bold text-white text-[11px]">{bundle.name}</div>
                  <div className="text-[9px] text-white/40 font-light truncate max-w-[200px]">{bundle.description}</div>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      {colleges.length === 0 ? (
        /* Expanded Empty State */
        <div className="w-full py-16 text-center space-y-6 bg-[#111111] border border-white/5 rounded-2xl shadow-2xl" id="empty-compare">
          <div className="w-20 h-20 bg-white/5 text-white rounded-full flex items-center justify-center mx-auto border border-white/5 animate-pulse">
            <ArrowLeftRight className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-extrabold text-white">Your Comparison Deck is Empty</h2>
            <p className="text-xs text-white/40 leading-relaxed font-light">
              You haven't added any universities to analyze. Get started instantly by clicking one of our curated bundles above, searching for a specific university, or exploring the Finder!
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleLoadBundle(DEMO_BUNDLES[0].collegeNames)}
              className="px-4 py-2 bg-white hover:bg-white/90 text-black text-xs font-bold rounded-lg transition-all shadow-lg cursor-pointer flex items-center space-x-1.5"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Load US Elite Demo Deck</span>
            </button>
            <button
              onClick={() => setActiveTab('find-colleges')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 border border-white/5"
            >
              <Compass className="w-3.5 h-3.5 text-white/60" />
              <span>Explore Recommended Colleges</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Comparison Table & Multi-factor Radar alignment matrix */}
          <div className="bg-[#111111] rounded-2xl shadow-2xl border border-white/5 overflow-hidden" id="comparison-deck-table">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h2 className="font-extrabold text-white text-sm leading-tight">University Criteria Matrix</h2>
                  <span className="bg-white/5 text-white/90 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-white/10">
                    Live Analysis ({colleges.length}/4 Selected)
                  </span>
                </div>
                <p className="text-[10px] text-white/40">Pure white highlights indicate optimal values across selected criteria columns.</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-3 py-1.5 bg-white/5 text-white hover:bg-white/10 text-[10px] font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer border border-white/5"
                >
                  <FileText className="w-3.5 h-3.5 text-white" />
                  <span>Generate Report</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 hover:bg-red-500/10 text-white/60 hover:text-red-400 text-[10px] font-bold rounded-lg border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Responsive Table Grid */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[700px]">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="p-5 text-xs font-bold text-white/40 uppercase tracking-widest w-1/4">Comparison Criteria</th>
                    {colleges.map((col, idx) => (
                      <th key={idx} className="p-5 w-1/4 border-l border-white/5 relative group bg-[#111111] text-white">
                        <div className="space-y-2 pr-6">
                          <div className="text-[10px] font-extrabold text-white/40 tracking-widest uppercase flex items-center space-x-1">
                            <span>🌐</span>
                            <span>{col.country}</span>
                          </div>
                          <div className="font-extrabold text-white text-xs leading-snug">
                            {col.name}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemove(col.name)}
                          className="absolute right-4 top-5 p-1 text-white/40 hover:text-red-400 rounded-md hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </th>
                    ))}
                    {/* Empty Slots Padding up to 4 */}
                    {Array.from({ length: Math.max(0, 4 - colleges.length) }).map((_, idx) => (
                      <th key={`empty-h-${idx}`} className="p-5 w-1/4 border-l border-white/5 bg-white/5 text-center">
                        <div className="border border-dashed border-white/5 rounded-lg py-4 px-2 text-center text-white/30 italic text-[10px] font-light">
                          Slot Available
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5 text-xs">
                  
                  {/* Dynamic Calculated Weighted Alignment Score Row */}
                  <tr className="bg-white/5">
                    <td className="p-5 font-extrabold text-white flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-white shrink-0 animate-pulse" />
                      <span>Customized Priority Match</span>
                    </td>
                    {colleges.map((col, idx) => {
                      const score = calculatePersonalizedScore(col);
                      const isBest = idx === bestWeightedIdx;
                      return (
                        <td 
                          key={idx} 
                          className={`p-5 border-l border-white/5 font-black text-white ${
                            isBest ? 'bg-white/10 font-extrabold border-r border-white/10' : ''
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5">
                              {isBest && <CheckCircle className="w-4 h-4 text-white shrink-0" />}
                              <span className="text-sm font-extrabold text-white">{score}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                              <div className="h-full bg-white" style={{ width: `${score}%` }} />
                            </div>
                            <span className="text-[8px] text-white/40 font-normal">Derived from weights below</span>
                          </div>
                        </td>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 4 - colleges.length) }).map((_, idx) => (
                      <td key={`empty-r0-${idx}`} className="p-5 border-l border-white/5 bg-white/5"></td>
                    ))}
                  </tr>

                  {/* World Ranking */}
                  <tr className="hover:bg-white/5">
                    <td className="p-5 font-bold text-white/60 flex items-center space-x-1.5">
                      <Award className="w-4 h-4 text-white/40 shrink-0" />
                      <span>World Ranking</span>
                    </td>
                    {colleges.map((col, idx) => {
                      const isBest = idx === bestRankingIdx;
                      return (
                        <td 
                          key={idx} 
                          className={`p-5 border-l border-white/5 font-semibold text-white ${
                            isBest ? 'bg-white/10 font-extrabold text-white' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-1.5">
                            {isBest && <Check className="w-4 h-4 shrink-0 text-white" />}
                            <span>{col.ranking}</span>
                          </div>
                        </td>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 4 - colleges.length) }).map((_, idx) => (
                      <td key={`empty-r1-${idx}`} className="p-5 border-l border-white/5 bg-white/5"></td>
                    ))}
                  </tr>

                  {/* Tuition Fee */}
                  <tr className="hover:bg-white/5">
                    <td className="p-5 font-bold text-white/60 flex items-center space-x-1.5">
                      <Coins className="w-4 h-4 text-white/40 shrink-0" />
                      <span>Average Tuition Fee</span>
                    </td>
                    {colleges.map((col, idx) => {
                      const isBest = idx === bestTuitionIdx;
                      return (
                        <td 
                          key={idx} 
                          className={`p-5 border-l border-white/5 font-semibold text-white ${
                            isBest ? 'bg-white/10 font-extrabold text-white' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-1.5">
                            {isBest && <Check className="w-4 h-4 shrink-0 text-white" />}
                            <span>{col.avgTuition}</span>
                          </div>
                        </td>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 4 - colleges.length) }).map((_, idx) => (
                      <td key={`empty-r2-${idx}`} className="p-5 border-l border-white/5 bg-white/5"></td>
                    ))}
                  </tr>

                  {/* Acceptance Rate */}
                  <tr className="hover:bg-white/5">
                    <td className="p-5 font-bold text-white/60 flex items-center space-x-1.5">
                      <TrendingUp className="w-4 h-4 text-white/40 shrink-0" />
                      <span>Acceptance Rate</span>
                    </td>
                    {colleges.map((col, idx) => {
                      const isBest = idx === bestAcceptanceIdx;
                      return (
                        <td 
                          key={idx} 
                          className={`p-5 border-l border-white/5 font-semibold text-white ${
                            isBest ? 'bg-white/10 font-extrabold text-white' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-1.5">
                            {isBest && <Check className="w-4 h-4 shrink-0 text-white" />}
                            <span>{col.acceptanceRate}</span>
                          </div>
                        </td>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 4 - colleges.length) }).map((_, idx) => (
                      <td key={`empty-r3-${idx}`} className="p-5 border-l border-white/5 bg-white/5"></td>
                    ))}
                  </tr>

                  {/* Minimum IELTS Score required */}
                  <tr className="hover:bg-white/5">
                    <td className="p-5 font-bold text-white/60 flex items-center space-x-1.5">
                      <BookOpen className="w-4 h-4 text-white/40 shrink-0" />
                      <span>Min IELTS Score</span>
                    </td>
                    {colleges.map((col, idx) => {
                      const isBest = idx === bestIeltsIdx && col.ieltsRequirement;
                      return (
                        <td 
                          key={idx} 
                          className={`p-5 border-l border-white/5 font-semibold text-white ${
                            isBest ? 'bg-white/10 font-extrabold text-white' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-1.5">
                            {isBest && <Check className="w-4 h-4 shrink-0 text-white" />}
                            <span>{col.ieltsRequirement || '6.5 (Typical)'}</span>
                          </div>
                        </td>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 4 - colleges.length) }).map((_, idx) => (
                      <td key={`empty-r4-${idx}`} className="p-5 border-l border-white/5 bg-white/5"></td>
                    ))}
                  </tr>

                  {/* Scholarships & funding options */}
                  <tr className="hover:bg-white/5">
                    <td className="p-5 font-bold text-white/60 flex items-center space-x-1.5">
                      <BookmarkCheck className="w-4 h-4 text-white/40 shrink-0" />
                      <span>Scholarships Availability</span>
                    </td>
                    {colleges.map((col, idx) => {
                      const isBest = idx === bestScholarshipIdx && col.scholarshipAvailability;
                      return (
                        <td 
                          key={idx} 
                          className={`p-5 border-l border-white/5 font-semibold text-white ${
                            isBest ? 'bg-white/10 font-extrabold text-white' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-1.5">
                            {isBest && <Check className="w-4 h-4 shrink-0 text-white" />}
                            <span>{col.scholarshipAvailability || 'Merit-Based Grants'}</span>
                          </div>
                        </td>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 4 - colleges.length) }).map((_, idx) => (
                      <td key={`empty-r5-${idx}`} className="p-5 border-l border-white/5 bg-white/5"></td>
                    ))}
                  </tr>

                  {/* Original Fit Score Match */}
                  <tr className="hover:bg-white/5">
                    <td className="p-5 font-bold text-white/60 flex items-center space-x-1.5">
                      <Info className="w-4 h-4 text-white/40 shrink-0" />
                      <span>Counselor Recommendation Match</span>
                    </td>
                    {colleges.map((col, idx) => (
                      <td key={idx} className="p-5 border-l border-white/5 font-semibold text-white">
                        <div className="flex items-center space-x-1.5">
                          <span>{col.fitScore || 85}%</span>
                        </div>
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - colleges.length) }).map((_, idx) => (
                      <td key={`empty-r6-${idx}`} className="p-5 border-l border-white/5 bg-white/5"></td>
                    ))}
                  </tr>

                  {/* Fit Verdict reason */}
                  <tr className="hover:bg-white/5">
                    <td className="p-5 font-bold text-white/60 flex items-center space-x-1.5">
                      <MessageSquare className="w-4 h-4 text-white/40 shrink-0" />
                      <span>Counselor Fit Verdict</span>
                    </td>
                    {colleges.map((col, idx) => (
                      <td key={idx} className="p-5 border-l border-white/5 font-light italic text-white/80 text-[11px] leading-relaxed">
                        "{col.fitReason}"
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - colleges.length) }).map((_, idx) => (
                      <td key={`empty-r7-${idx}`} className="p-5 border-l border-white/5 bg-white/5"></td>
                    ))}
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="p-4 bg-white/5 border-t border-white/5 flex flex-wrap items-center gap-4 text-[10px] text-white/40 font-semibold uppercase tracking-widest">
              <div className="flex items-center space-x-1.5">
                <div className="w-3.5 h-3.5 bg-white/10 border border-white/10 rounded" />
                <span>Optimal Metric Choice</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-white/40" />
                <span>Weighted averages adjust algorithmically using priorities below</span>
              </div>
            </div>
          </div>

          {/* Interactive Weights Customizer Widget */}
          <div className="bg-[#111111] rounded-2xl p-6 border border-white/5 shadow-2xl space-y-6" id="personalized-priority-sliders">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-white">
                  <Sliders className="w-5 h-5 text-white" />
                  <h2 className="font-extrabold text-sm uppercase tracking-widest">Configure Priority Weight Matrix</h2>
                </div>
                <p className="text-[11px] text-white/40">Drag sliders to adjust which metrics matter most to you. The customized fit match row will automatically compute scores in real-time!</p>
              </div>
              <button 
                onClick={() => setWeights({ ranking: 3, tuition: 3, acceptance: 3, scholarship: 3, base: 3 })}
                className="text-[10px] text-white hover:text-white/80 font-bold flex items-center space-x-1 p-1 rounded hover:bg-white/5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Weights</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Prestige Priority */}
              <div className="space-y-2 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-white/60 tracking-wider">Prestige / Rank</span>
                  <span className="text-xs font-bold text-white">{weights.ranking}/5</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={weights.ranking}
                  onChange={(e) => setWeights({ ...weights, ranking: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <p className="text-[9px] text-white/40 leading-normal">High weight favors low numbers on the QS World Ranking list.</p>
              </div>

              {/* Affordability Priority */}
              <div className="space-y-2 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-white/60 tracking-wider">Affordability</span>
                  <span className="text-xs font-bold text-white">{weights.tuition}/5</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={weights.tuition}
                  onChange={(e) => setWeights({ ...weights, tuition: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <p className="text-[9px] text-white/40 leading-normal">High weight heavily penalizes expensive annual tuition fees.</p>
              </div>

              {/* Acceptance Easy Priority */}
              <div className="space-y-2 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-white/60 tracking-wider">Admissibility / Safety</span>
                  <span className="text-xs font-bold text-white">{weights.acceptance}/5</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={weights.acceptance}
                  onChange={(e) => setWeights({ ...weights, acceptance: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <p className="text-[9px] text-white/40 leading-normal">High weight favors universities with higher overall acceptance rates (safety schools).</p>
              </div>

              {/* Scholarship Priority */}
              <div className="space-y-2 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-white/60 tracking-wider">Scholarships</span>
                  <span className="text-xs font-bold text-white">{weights.scholarship}/5</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={weights.scholarship}
                  onChange={(e) => setWeights({ ...weights, scholarship: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <p className="text-[9px] text-white/40 leading-normal">High weight matches generous scholarship availability and aid policies.</p>
              </div>

              {/* Base Recommendation Profile Fit Priority */}
              <div className="space-y-2 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-white/60 tracking-wider">Counselor Weight</span>
                  <span className="text-xs font-bold text-white">{weights.base}/5</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={weights.base}
                  onChange={(e) => setWeights({ ...weights, base: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <p className="text-[9px] text-white/40 leading-normal">High weight trusts the original algorithmic suitability score.</p>
              </div>

            </div>
          </div>

          {/* Interactive SVG Bar & Visual Comparison Charts */}
          <div className="bg-[#111111] rounded-2xl p-6 border border-white/5 shadow-2xl space-y-6" id="visual-tuition-comparison-chart">
            <div className="border-b border-white/5 pb-4">
              <div className="flex items-center space-x-2 text-white">
                <TrendingUp className="w-5 h-5 text-white" />
                <h2 className="font-extrabold text-sm uppercase tracking-widest">Side-By-Side Visual Analytics</h2>
              </div>
              <p className="text-[11px] text-white/40">Compare tuition costs and alignment scores visually. Lower bar is better for Tuition Fee; higher bar is better for Match Scores.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Tuition Lakhs Bar Chart */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-white/60 flex items-center space-x-1.5">
                  <Coins className="w-3.5 h-3.5 text-white" />
                  <span>Tuition Expense per Year (Rupee Lakhs)</span>
                </h4>
                
                <div className="space-y-4 pt-2">
                  {colleges.map((col, idx) => {
                    const tuitionLakhs = parseTuitionLakhs(col.avgTuition);
                    // Standard max range: 60 Lakhs for 100% bar width
                    const barWidth = Math.min(100, Math.max(5, (tuitionLakhs / 60) * 100));
                    const isCheapest = idx === bestTuitionIdx;

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-bold text-white truncate max-w-[200px]">{col.name}</span>
                          <span className={`font-mono font-bold ${isCheapest ? 'text-white' : 'text-white/40'}`}>
                            {tuitionLakhs === 0 ? 'Free (₹0)' : `₹${tuitionLakhs} Lakhs/yr`}
                          </span>
                        </div>
                        <div className="w-full bg-white/10 h-4 rounded-md overflow-hidden relative">
                          <div 
                            className={`h-full rounded-md transition-all duration-500 bg-white/90`}
                            style={{ width: `${barWidth}%` }}
                          />
                          {isCheapest && (
                            <span className="absolute left-2.5 top-0 text-[8px] font-black uppercase text-black mix-blend-difference tracking-widest leading-4">
                              Cheapest
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Fit Score Matching Scale */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-white/60 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Priority Match Index comparison</span>
                </h4>

                <div className="space-y-4 pt-2">
                  {colleges.map((col, idx) => {
                    const score = calculatePersonalizedScore(col);
                    const isBest = idx === bestWeightedIdx;

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-bold text-white truncate max-w-[200px]">{col.name}</span>
                          <span className={`font-bold ${isBest ? 'text-white font-extrabold' : 'text-white/40'}`}>
                            {score}% Match
                          </span>
                        </div>
                        <div className="w-full bg-white/10 h-4 rounded-md overflow-hidden relative">
                          <div 
                            className={`h-full rounded-md transition-all duration-500 bg-white`}
                            style={{ width: `${score}%` }}
                          />
                          {isBest && (
                            <span className="absolute left-2.5 top-0 text-[8px] font-black uppercase text-black mix-blend-difference tracking-widest leading-4">
                              Optimal Target
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Side-by-side Pros/Cons, Custom Notes, Timeline Checklists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="compare-pros-cons-notes">
            {colleges.map((col, idx) => {
              const personalNote = collegeNotes[col.name] || '';
              
              return (
                <div 
                  key={idx} 
                  className="bg-[#111111] rounded-2xl p-6 border border-white/5 shadow-2xl space-y-5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div>
                        <span className="text-[10px] font-extrabold text-white/40 uppercase tracking-widest">{col.country}</span>
                        <h3 className="font-black text-sm text-white leading-snug">{col.name}</h3>
                      </div>
                      <span className="bg-white/5 text-white/90 text-[10px] font-extrabold px-2 py-0.5 rounded border border-white/5">
                        Rank {col.ranking}
                      </span>
                    </div>

                    {/* Preloaded Pros & Cons bullet points */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Pros list */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white/80 flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Key Advantages</span>
                        </span>
                        <ul className="space-y-1.5">
                          {(col.pros || [
                            "Excellent infrastructure and research hub",
                            "Renowned high-caliber alumni networks",
                            "Promising post-study employment placement"
                          ]).map((pro, pIdx) => (
                            <li key={pIdx} className="text-[11px] text-white/60 font-light flex items-start space-x-1">
                              <span className="text-white font-bold shrink-0">•</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Cons list */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white/50 flex items-center space-x-1">
                          <span className="text-sm shrink-0 leading-3">-</span>
                          <span>Potential Drawbacks</span>
                        </span>
                        <ul className="space-y-1.5">
                          {(col.cons || [
                            "Substantial tuition cost barrier",
                            "Highly competitive GPA cutoffs",
                            "Extremely selective screening processes"
                          ]).map((con, cIdx) => (
                            <li key={cIdx} className="text-[11px] text-white/60 font-light flex items-start space-x-1">
                              <span className="text-white/40 font-bold shrink-0">•</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  </div>

                  {/* Persistent User Notes/Timeline Notepad */}
                  <div className="pt-4 border-t border-white/5 space-y-2 mt-4 bg-black/40 p-3.5 rounded-xl border border-dashed border-white/10">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center space-x-1">
                      <MessageSquare className="w-3.5 h-3.5 text-white/30" />
                      <span>My Personal Comparison Notes</span>
                    </label>
                    <textarea
                      placeholder="Add personal thoughts (e.g. 'Highly prefer weather here', 'Need to apply by Dec 1st', 'Cousin lives in this city')..."
                      value={personalNote}
                      onChange={(e) => handleSaveNote(col.name, e.target.value)}
                      className="w-full h-16 text-xs p-2.5 bg-black border border-white/10 text-white rounded-lg focus:outline-none focus:border-white resize-none font-light"
                    />
                    <div className="flex justify-between items-center text-[9px] text-white/30 font-semibold uppercase tracking-widest">
                      <span>Persistent Slate storage</span>
                      <span>Auto-saves</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Structured Comparison Report Modal */}
      {showReportModal && verdict && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" id="comparison-report-modal">
          <div className="bg-[#111111] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-white/10 relative">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2 text-white">
                <FileText className="w-5 h-5 text-white" />
                <h3 className="font-extrabold text-base">University Comparison Report</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-white/60 hover:text-white text-sm font-bold p-1 hover:bg-white/5 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-white max-h-[350px] overflow-y-auto pr-1">
              
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-black uppercase text-white/60 tracking-widest flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-white fill-white" />
                  <span>Personalized Weighted Best Match</span>
                </span>
                <p className="font-extrabold text-white text-sm">
                  {verdict.topName}
                </p>
                <p className="text-[11px] text-white/60 italic">
                  "{verdict.topReason}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                  <span className="block text-[9px] font-black uppercase tracking-widest text-white/40">Most Economical Choice</span>
                  <span className="block font-bold text-white">{verdict.cheapName}</span>
                  <span className="block text-[10px] text-white/60">{verdict.cheapTuition}</span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                  <span className="block text-[9px] font-black uppercase tracking-widest text-white/40">Most Prestigious ranking</span>
                  <span className="block font-bold text-white">{verdict.prestigeName}</span>
                  <span className="block text-[10px] text-white/60">{verdict.prestigeRank}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-white/5 pt-3">
                <h4 className="font-extrabold text-white text-[11px] uppercase tracking-widest">Shortlist comparison breakdown</h4>
                <div className="divide-y divide-white/5 font-light">
                  {colleges.map((col) => (
                    <div key={col.name} className="py-2 flex justify-between">
                      <span className="font-bold text-white">{col.name}</span>
                      <span className="font-mono text-white/60">{col.ranking} • {col.avgTuition.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-white/40 leading-relaxed font-light">
                * This evaluation has been generated based on current profile metrics, selected global indices, and customized priority weights.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  const summaryText = colleges.map(c => 
                    `University: ${c.name}\nCountry: ${c.country}\nRanking: ${c.ranking}\nTuition: ${c.avgTuition}\nAcceptance Rate: ${c.acceptanceRate}\nAlignment Score: ${calculatePersonalizedScore(c)}%\nNotes: ${collegeNotes[c.name] || 'N/A'}\n`
                  ).join('\n---\n\n');
                  navigator.clipboard.writeText(summaryText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-4 py-2 bg-white hover:bg-white/90 text-black text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
