import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  FileText, 
  Edit3,
  BookmarkCheck,
  PartyPopper
} from 'lucide-react';

interface DocumentItem {
  id: number;
  name: string;
  status: 'not_started' | 'in_progress' | 'ready';
  notes: string;
  updatedAt: string;
}

const DOCUMENT_NAMES = [
  "Passport",
  "Class 10 marksheet",
  "Class 12 marksheet",
  "Degree / provisional certificate",
  "Official transcripts",
  "Letter of recommendation 1",
  "Letter of recommendation 2",
  "Letter of recommendation 3",
  "Statement of purpose (SOP)",
  "Resume / CV",
  "Standardised test score report (SAT / IELTS / GRE etc.)",
  "Bank statement / financial documents"
];

const getTipForDoc = (name: string): string => {
  if (name.toLowerCase().includes('passport')) {
    return "Ensure validity is at least 6 months beyond your intended course end date.";
  }
  if (name.toLowerCase().includes('transcript')) {
    return "Request official sealed copies from your institution's exam controller.";
  }
  if (name.toLowerCase().includes('recommendation') || name.toLowerCase().includes('lor')) {
    return "Give your recommender at least 4 weeks notice and a copy of your SOP.";
  }
  if (name.toLowerCase().includes('statement of purpose') || name.toLowerCase().includes('sop')) {
    return "Tailor one version per university — avoid generic statements.";
  }
  return "Keep a digital scan and a physical copy in separate locations.";
};

export default function DocumentManager() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<number | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  // Format date helper: returns string in friendly readable format
  const getTodayDateString = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('get_docs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 12) {
          setDocuments(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse get_docs from localStorage', e);
      }
    }

    // Default initialization
    const initialDocs: DocumentItem[] = DOCUMENT_NAMES.map((name, index) => ({
      id: index + 1,
      name,
      status: 'not_started',
      notes: '',
      updatedAt: '-'
    }));
    setDocuments(initialDocs);
    localStorage.setItem('get_docs', JSON.stringify(initialDocs));
  }, []);

  // Update a single document state
  const handleUpdateDoc = (updatedDoc: DocumentItem) => {
    const updatedList = documents.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc);
    setDocuments(updatedList);
    localStorage.setItem('get_docs', JSON.stringify(updatedList));
  };

  // Cycle through status Not Started -> In Progress -> Ready
  const cycleStatus = (id: number) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;

    let nextStatus: 'not_started' | 'in_progress' | 'ready' = 'not_started';
    if (doc.status === 'not_started') nextStatus = 'in_progress';
    else if (doc.status === 'in_progress') nextStatus = 'ready';

    const updatedDoc: DocumentItem = {
      ...doc,
      status: nextStatus,
      updatedAt: getTodayDateString()
    };
    handleUpdateDoc(updatedDoc);
  };

  // Notes Inline Edit Actions
  const startEditingNotes = (id: number, currentNotes: string) => {
    setEditingNotesId(id);
    setTempNotes(currentNotes);
  };

  const saveNotes = (id: number) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;

    const updatedDoc: DocumentItem = {
      ...doc,
      notes: tempNotes.trim()
    };
    handleUpdateDoc(updatedDoc);
    setEditingNotesId(null);
  };

  // Calculations for progress summary
  const totalCount = documents.length;
  const readyCount = documents.filter(d => d.status === 'ready').length;
  const inProgressCount = documents.filter(d => d.status === 'in_progress').length;
  const notStartedCount = documents.filter(d => d.status === 'not_started').length;
  const readyPercentage = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

  // Circular progress ring values
  const radius = 64;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (readyPercentage / 100) * circumference;

  return (
    <div className="w-full max-w-5xl" id="document-manager-container">
      
      {/* HEADER SECTION */}
      <div className="mb-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm" id="docs-header">
        <h1 className="text-xl font-bold text-[#0A0F2C] tracking-tight flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-indigo-600" /> Application Document Checklist
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Keep track of your academic sheets, scores, financial papers, and identity credentials in one consolidated checklist.
        </p>
      </div>

      {/* TOP SECTION — PROGRESS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm mb-6" id="docs-progress-summary">
        
        {/* Large Circular Progress Ring */}
        <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-5 md:pb-0 md:pr-4" id="circular-progress-panel">
          <div className="relative flex items-center justify-center">
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
                stroke="#10B981" // emerald-500
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
            <div className="absolute flex flex-col items-center text-center">
              <span className="text-2xl font-extrabold text-[#0A0F2C]">{readyCount} <span className="text-slate-400 text-sm font-medium">/ 12</span></span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full mt-1">Ready</span>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 font-medium text-center mt-4">
            {readyPercentage === 100 ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1 justify-center">
                <PartyPopper className="w-3.5 h-3.5" /> Excellent! All papers ready.
              </span>
            ) : (
              `You're ${readyPercentage}% document-ready for applications`
            )}
          </p>
        </div>

        {/* Stats and Motivations */}
        <div className="md:col-span-8 flex flex-col justify-center pl-0 md:pl-6" id="stats-summary-panel">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
            Application Readiness Metrics
          </h2>

          {/* Three Stat Pills in a row */}
          <div className="grid grid-cols-3 gap-3" id="stat-pills-row">
            
            {/* Ready */}
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex flex-col items-center sm:items-start">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> {readyCount} Ready
              </span>
              <span className="text-[10px] text-slate-400 mt-1 hidden sm:inline">Marked as finalized</span>
            </div>

            {/* In Progress */}
            <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 flex flex-col items-center sm:items-start">
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> {inProgressCount} In Progress
              </span>
              <span className="text-[10px] text-slate-400 mt-1 hidden sm:inline">Active requests &amp; drafts</span>
            </div>

            {/* Not Started */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col items-center sm:items-start">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400" /> {notStartedCount} Not Started
              </span>
              <span className="text-[10px] text-slate-400 mt-1 hidden sm:inline">Uninitiated requirements</span>
            </div>

          </div>

          <p className="text-xs text-slate-400 italic mt-4 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <span>Click on any <strong>Document Name</strong> below to view specialized guidance and checklist requirements for that document. Cycle the status pills directly to update your progress.</span>
          </p>
        </div>
      </div>

      {/* DOCUMENT CHECKLIST TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden" id="checklist-table-container">
        
        {/* Table Header block */}
        <div className="bg-slate-50/70 border-b border-slate-200 p-4 grid grid-cols-12 gap-3 text-xs font-bold text-[#0A0F2C] uppercase tracking-wider" id="checklist-table-header">
          <div className="col-span-5 md:col-span-4">Document Name</div>
          <div className="col-span-3 text-center">Status</div>
          <div className="col-span-4 md:col-span-3">Notes</div>
          <div className="col-span-2 text-right hidden md:block">Last Updated</div>
        </div>

        {/* Rows List */}
        <div className="divide-y divide-slate-100" id="checklist-table-rows">
          {documents.map((doc) => {
            const isExpanded = expandedRow === doc.id;
            const isReady = doc.status === 'ready';
            const isInProgress = doc.status === 'in_progress';

            // Left Border Accent Class
            const leftBorderAccent = isReady 
              ? 'border-l-[4px] border-l-emerald-400' 
              : isInProgress 
                ? 'border-l-[4px] border-l-amber-400' 
                : 'border-l-[4px] border-l-transparent';

            return (
              <div 
                key={doc.id} 
                className={`transition-all duration-150 bg-white hover:bg-slate-50/40 ${leftBorderAccent}`}
                id={`document-row-${doc.id}`}
              >
                {/* Main Row Content Grid */}
                <div className="p-4 grid grid-cols-12 gap-3 items-center">
                  
                  {/* Column 1: Document name (left-aligned, 14px, click expands tip accordion) */}
                  <div 
                    onClick={() => setExpandedRow(isExpanded ? null : doc.id)}
                    className="col-span-5 md:col-span-4 flex items-center gap-1.5 cursor-pointer group"
                    id={`doc-name-cell-${doc.id}`}
                  >
                    <span className="text-[14px] font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {doc.name}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
                    )}
                  </div>

                  {/* Column 2: Status selector: three-way toggle pill (Not Started -> In Progress -> Ready) */}
                  <div className="col-span-3 flex justify-center" id={`doc-status-cell-${doc.id}`}>
                    <button
                      onClick={() => cycleStatus(doc.id)}
                      className={`py-1.5 px-3 rounded-full text-[11px] font-extrabold tracking-wider uppercase transition-all duration-200 shadow-sm border cursor-pointer ${
                        doc.status === 'ready'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : doc.status === 'in_progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                      id={`btn-cycle-status-${doc.id}`}
                      title="Click to cycle status"
                    >
                      {doc.status === 'ready' ? (
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Ready</span>
                      ) : doc.status === 'in_progress' ? (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500 animate-pulse" /> In Progress</span>
                      ) : (
                        <span>Not Started</span>
                      )}
                    </button>
                  </div>

                  {/* Column 3: Notes field (inline editable text, save on blur) */}
                  <div className="col-span-4 md:col-span-3 text-xs text-slate-600" id={`doc-notes-cell-${doc.id}`}>
                    {editingNotesId === doc.id ? (
                      <input
                        type="text"
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        onBlur={() => saveNotes(doc.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveNotes(doc.id);
                          if (e.key === 'Escape') setEditingNotesId(null);
                        }}
                        autoFocus
                        placeholder="Add note..."
                        className="w-full px-2 py-1 text-xs border border-indigo-400 rounded focus:outline-none focus:ring-1 focus:ring-indigo-300"
                      />
                    ) : (
                      <div 
                        onClick={() => startEditingNotes(doc.id, doc.notes)}
                        className="cursor-pointer hover:bg-slate-100/50 p-1.5 rounded transition-all min-h-[28px] flex items-center justify-between text-slate-600 hover:text-slate-900 group"
                      >
                        <span className={doc.notes ? "font-medium" : "text-slate-400 italic"}>
                          {doc.notes || 'Add note...'}
                        </span>
                        <Edit3 className="w-3 h-3 text-slate-300 group-hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100 shrink-0 ml-1" />
                      </div>
                    )}
                  </div>

                  {/* Column 4: Last updated (muted 12px, auto-set on status update) */}
                  <div className="col-span-12 md:col-span-2 text-right text-[12px] text-slate-400 font-medium flex md:block items-center gap-1.5 md:gap-0 mt-1 md:mt-0" id={`doc-updated-cell-${doc.id}`}>
                    <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider">Last updated:</span>
                    <span className="flex items-center md:justify-end gap-1 text-[11px] font-semibold text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-300 shrink-0" />
                      {doc.updatedAt}
                    </span>
                  </div>

                </div>

                {/* Inline Detail Accordion Panel (Accordion-style suggested tips) */}
                {isExpanded && (
                  <div className="px-5 py-3.5 bg-slate-50 border-t border-b border-slate-100 text-xs text-slate-600 space-y-1.5" id={`doc-details-${doc.id}`}>
                    <div className="flex items-center gap-1.5 text-indigo-700 font-extrabold text-[11px] uppercase tracking-wider">
                      <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Suggested Guidelines &amp; Tips
                    </div>
                    <p className="pl-5 leading-relaxed font-medium text-slate-600">
                      {getTipForDoc(doc.name)}
                    </p>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
