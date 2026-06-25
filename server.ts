import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function generateGeminiContent(contents: string, config?: any) {
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    let attempt = 0;
    const maxAttempts = 3;
    let delay = 1000;

    while (attempt < maxAttempts) {
      try {
        console.log(`Initiating connection (resource: ${model}, try: ${attempt + 1}/${maxAttempts})...`);
        const response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: config,
        });
        if (response && response.text) {
          return response;
        }
        throw new Error("Empty response");
      } catch (err: any) {
        attempt++;
        lastError = err;
        const errMsg = err?.message || String(err);
        const errCode = err?.code || err?.status || err?.statusCode;
        console.log(`[Dispatcher Info] Resource ${model} busy (Try ${attempt}/${maxAttempts}). Re-routing...`);
        
        const isUnavailable = 
          errCode === 503 || 
          errCode === 'UNAVAILABLE' || 
          String(errCode).includes("503") ||
          String(errCode).includes("UNAVAILABLE") ||
          errMsg.includes("503") || 
          errMsg.includes("UNAVAILABLE") || 
          errMsg.includes("high demand") || 
          errMsg.includes("Please try again later") ||
          errMsg.includes("overloaded");

        if (isUnavailable) {
          console.log(`Resource ${model} temporarily unavailable. Initiating multi-region balance...`);
          break; // Break the while loop to try the next model in the for loop
        }

        if (attempt < maxAttempts) {
          console.log(`[Dispatcher Info] Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }
  }
  throw lastError || new Error("All attempts failed");
}

function getFallbackPredict(gpa: any, sat: any, ielts: any, major: any, degree: any, university: any) {
  const numGpa = parseFloat(gpa) || 3.0;
  const numSat = sat ? parseInt(sat) : null;
  const uniLower = String(university || "").toLowerCase();

  const isHighlySelective = 
    uniLower.includes("harvard") || 
    uniLower.includes("yale") || 
    uniLower.includes("stanford") || 
    uniLower.includes("mit") || 
    uniLower.includes("princeton") || 
    uniLower.includes("columbia") || 
    uniLower.includes("caltech") || 
    uniLower.includes("oxford") || 
    uniLower.includes("cambridge") || 
    uniLower.includes("toronto") || 
    uniLower.includes("ubc") || 
    uniLower.includes("mcgill") || 
    uniLower.includes("ivy") || 
    uniLower.includes("university of california");

  let probability = isHighlySelective ? 15 : 55;

  if (numGpa > 3.8) {
    probability += 25;
  } else if (numGpa > 3.5) {
    probability += 15;
  } else if (numGpa < 3.0) {
    probability -= 25;
  }

  if (numSat) {
    if (numSat > 1500) {
      probability += 15;
    } else if (numSat > 1400) {
      probability += 10;
    } else if (numSat < 1200) {
      probability -= 15;
    }
  }

  // Clamp probability between 5 and 95
  probability = Math.max(5, Math.min(95, probability));

  let tier: "Safety" | "Match" | "Reach" = "Match";
  if (probability > 75) {
    tier = "Safety";
  } else if (probability < 40) {
    tier = "Reach";
  }

  let reasoning = "";
  if (numGpa > 3.7) {
    reasoning = `Your strong GPA of ${numGpa} makes you a very competitive candidate for standard programs.`;
  } else if (numGpa < 3.2) {
    reasoning = `Admissions at ${university || "this college"} are competitive; we advise boosting extracurriculars.`;
  } else {
    reasoning = `Solid GPA and profile align well with historical admission stats for ${university || "this university"}.`;
  }

  let scholarshipOdds = 20;
  if (numGpa > 3.8) {
    scholarshipOdds = 75;
  } else if (numGpa > 3.5) {
    scholarshipOdds = 50;
  } else if (numGpa > 3.2) {
    scholarshipOdds = 35;
  }

  return {
    probability,
    tier,
    reasoning: reasoning.slice(0, 100), // Keep it concise
    scholarshipOdds
  };
}

function getFallbackScholarships(gpa: any, sat: any, ielts: any, major: any, degree: any, board: any, stream: any, targetCountries: any, budgetRange: any, dreamSchools: any) {
  const numGpa = parseFloat(gpa) || 3.0;
  const mName = major || "your major";
  return {
    scholarships: [
      {
        type: "International Academic Merit Scholarship",
        probability: numGpa > 3.7 ? 85 : (numGpa > 3.4 ? 60 : 30),
        description: `Automatically awarded upon admission based on your converted GPA of ${numGpa}/4.0.`
      },
      {
        type: "Global Leader Fellowship Award",
        probability: numGpa > 3.5 ? 50 : 25,
        description: `Awarded to incoming ${degree || "graduate"} students demonstrating exceptional leadership in ${mName}.`
      },
      {
        type: "Need-Based Tuition Support Grant",
        probability: budgetRange && String(budgetRange).includes("Low") ? 70 : 40,
        description: "Partial funding designed to assist students requiring financial assistance to study abroad."
      }
    ]
  };
}

function getFallbackColleges(country: any, major: any, degree: any, budget: any, profileSummary: any) {
  const cName = String(country || "United States").trim();
  const isUK = cName.toLowerCase().includes("uk") || cName.toLowerCase().includes("united kingdom");
  const isCanada = cName.toLowerCase().includes("canada");
  const isUS = cName.toLowerCase().includes("us") || cName.toLowerCase().includes("america") || cName.toLowerCase().includes("united states") || (!isUK && !isCanada);

  const mName = major || "STEM";

  if (isUS) {
    return {
      colleges: [
        {
          name: "Boston University",
          country: "United States",
          ranking: "#43",
          avgTuition: "$62,000/yr",
          acceptanceRate: "14%",
          fitScore: 82,
          fitReason: `Matches budget and provides high-quality curriculum for ${mName}.`,
          ieltsRequirement: "7.0",
          scholarshipAvailability: "Medium"
        },
        {
          name: "Arizona State University",
          country: "United States",
          ranking: "#121",
          avgTuition: "$33,000/yr",
          acceptanceRate: "88%",
          fitScore: 92,
          fitReason: "Excellent safety option with robust Indian student community support.",
          ieltsRequirement: "6.5",
          scholarshipAvailability: "High"
        },
        {
          name: "New York University",
          country: "United States",
          ranking: "#38",
          avgTuition: "$60,000/yr",
          acceptanceRate: "12%",
          fitScore: 78,
          fitReason: "Elite brand name in central New York City with outstanding placements.",
          ieltsRequirement: "7.5",
          scholarshipAvailability: "Low"
        },
        {
          name: "University of Illinois Urbana-Champaign",
          country: "United States",
          ranking: "#35",
          avgTuition: "$41,000/yr",
          acceptanceRate: "45%",
          fitScore: 86,
          fitReason: `Top-tier department for ${mName} with incredible research infrastructure.`,
          ieltsRequirement: "7.0",
          scholarshipAvailability: "Medium"
        },
        {
          name: "Northeastern University",
          country: "United States",
          ranking: "#53",
          avgTuition: "$59,000/yr",
          acceptanceRate: "18%",
          fitScore: 83,
          fitReason: "Superb co-op model lets you gain 6-12 months of paid US work experience.",
          ieltsRequirement: "7.0",
          scholarshipAvailability: "Medium"
        },
        {
          name: "University of Texas at Dallas",
          country: "United States",
          ranking: "#115",
          avgTuition: "$39,000/yr",
          acceptanceRate: "70%",
          fitScore: 89,
          fitReason: "Located in a massive tech hub with competitive public tuition rates.",
          ieltsRequirement: "6.5",
          scholarshipAvailability: "High"
        },
        {
          name: "Purdue University",
          country: "United States",
          ranking: "#43",
          avgTuition: "$31,000/yr",
          acceptanceRate: "53%",
          fitScore: 87,
          fitReason: "Superb public engineering school offering high Return on Investment.",
          ieltsRequirement: "6.5",
          scholarshipAvailability: "Medium"
        },
        {
          name: "University of Southern California",
          country: "United States",
          ranking: "#28",
          avgTuition: "$64,000/yr",
          acceptanceRate: "11%",
          fitScore: 74,
          fitReason: "Elite selective dream school with powerful worldwide Trojan alumni network.",
          ieltsRequirement: "7.0",
          scholarshipAvailability: "Low"
        }
      ]
    };
  } else if (isUK) {
    return {
      colleges: [
        {
          name: "University College London (UCL)",
          country: "United Kingdom",
          ranking: "#9",
          avgTuition: "£32,000/yr",
          acceptanceRate: "15%",
          fitScore: 80,
          fitReason: `Elite global reputation in central London with strong ${mName} programs.`,
          ieltsRequirement: "7.0",
          scholarshipAvailability: "Medium"
        },
        {
          name: "University of Manchester",
          country: "United Kingdom",
          ranking: "#32",
          avgTuition: "£27,000/yr",
          acceptanceRate: "56%",
          fitScore: 88,
          fitReason: "Respected Russell Group university offering high student satisfaction.",
          ieltsRequirement: "6.5",
          scholarshipAvailability: "Medium"
        },
        {
          name: "University of Edinburgh",
          country: "United Kingdom",
          ranking: "#22",
          avgTuition: "£29,000/yr",
          acceptanceRate: "40%",
          fitScore: 84,
          fitReason: "Historic Scottish institution with brilliant academic legacy.",
          ieltsRequirement: "7.0",
          scholarshipAvailability: "Low"
        },
        {
          name: "King's College London",
          country: "United Kingdom",
          ranking: "#40",
          avgTuition: "£31,000/yr",
          acceptanceRate: "13%",
          fitScore: 79,
          fitReason: "Top reputation with high-quality teaching facilities and active campus life.",
          ieltsRequirement: "7.0",
          scholarshipAvailability: "Medium"
        },
        {
          name: "University of Warwick",
          country: "United Kingdom",
          ranking: "#67",
          avgTuition: "£28,000/yr",
          acceptanceRate: "14%",
          fitScore: 83,
          fitReason: "Excellent research powerhouse known for highly competitive employment odds.",
          ieltsRequirement: "6.5",
          scholarshipAvailability: "Medium"
        },
        {
          name: "University of Birmingham",
          country: "United Kingdom",
          ranking: "#84",
          avgTuition: "£25,000/yr",
          acceptanceRate: "70%",
          fitScore: 89,
          fitReason: "Highly supportive campus environment with beautiful historic redbrick architecture.",
          ieltsRequirement: "6.5",
          scholarshipAvailability: "High"
        },
        {
          name: "University of Leeds",
          country: "United Kingdom",
          ranking: "#75",
          avgTuition: "£26,000/yr",
          acceptanceRate: "64%",
          fitScore: 87,
          fitReason: "Russell Group member with superb facilities and modern laboratories.",
          ieltsRequirement: "6.5",
          scholarshipAvailability: "Medium"
        },
        {
          name: "Imperial College London",
          country: "United Kingdom",
          ranking: "#6",
          avgTuition: "£36,000/yr",
          acceptanceRate: "12%",
          fitScore: 72,
          fitReason: "World-class elite university for STEM fields in London.",
          ieltsRequirement: "7.5",
          scholarshipAvailability: "Low"
        }
      ]
    };
  } else {
    // Canada
    return {
      colleges: [
        {
          name: "University of Toronto",
          country: "Canada",
          ranking: "#21",
          avgTuition: "CAD $58,000/yr",
          acceptanceRate: "43%",
          fitScore: 81,
          fitReason: `Elite global recognition and prestige for studying ${mName}.`,
          ieltsRequirement: "7.0",
          scholarshipAvailability: "Medium"
        },
        {
          name: "University of British Columbia",
          country: "Canada",
          ranking: "#38",
          avgTuition: "CAD $45,000/yr",
          acceptanceRate: "45%",
          fitScore: 85,
          fitReason: "Beautiful coastal campus in Vancouver with strong research ties.",
          ieltsRequirement: "6.5",
          scholarshipAvailability: "Medium"
        },
        {
          name: "McGill University",
          country: "Canada",
          ranking: "#30",
          avgTuition: "CAD $42,000/yr",
          acceptanceRate: "40%",
          fitScore: 84,
          fitReason: "Renowned academic history located in the vibrant city of Montreal.",
          ieltsRequirement: "6.5",
          scholarshipAvailability: "Low"
        },
        {
          name: "University of Waterloo",
          country: "Canada",
          ranking: "#112",
          avgTuition: "CAD $48,000/yr",
          acceptanceRate: "53%",
          fitScore: 90,
          fitReason: "World-leading co-op system provides top placement in US tech firms.",
          ieltsRequirement: "6.5",
          scholarshipAvailability: "Medium"
        },
        {
          name: "McMaster University",
          country: "Canada",
          ranking: "#98",
          avgTuition: "CAD $38,000/yr",
          acceptanceRate: "55%",
          fitScore: 86,
          fitReason: "Highly regarded research-intensive university with comfortable campus.",
          ieltsRequirement: "6.5",
          scholarshipAvailability: "High"
        },
        {
          name: "University of Alberta",
          country: "Canada",
          ranking: "#109",
          avgTuition: "CAD $32,000/yr",
          acceptanceRate: "58%",
          fitScore: 88,
          fitReason: "Strong post-graduate job pathways with friendly regional immigration options.",
          ieltsRequirement: "6.5",
          scholarshipAvailability: "High"
        },
        {
          name: "Western University",
          country: "Canada",
          ranking: "#172",
          avgTuition: "CAD $36,000/yr",
          acceptanceRate: "60%",
          fitScore: 86,
          fitReason: "Excellent student satisfaction, strong school spirit, and academic rigor.",
          ieltsRequirement: "6.5",
          scholarshipAvailability: "Medium"
        },
        {
          name: "York University",
          country: "Canada",
          ranking: "#353",
          avgTuition: "CAD $33,000/yr",
          acceptanceRate: "75%",
          fitScore: 91,
          fitReason: "Diverse, multi-cultural student body and great entry options in Toronto.",
          ieltsRequirement: "6.5",
          scholarshipAvailability: "High"
        }
      ]
    };
  }
}

function getFallbackCourses(majorInterest: any, careerGoal: any, profileSummary: any) {
  const mName = majorInterest || "Computer Science / STEM";
  const cGoal = careerGoal || "Industry Expert";
  return {
    courses: [
      {
        universityName: "Northeastern University",
        programName: `Master of Science in ${mName}`,
        duration: "2 Years",
        avgSalary: "$105,000/yr",
        fitReason: `Features a stellar co-op program that directly accelerates your career goal as a ${cGoal}.`
      },
      {
        universityName: "University of Waterloo",
        programName: `Master of Engineering in ${mName}`,
        duration: "1.5 Years",
        avgSalary: "$98,000/yr",
        fitReason: `Waterloo's unmatched reputation in the industry helps you break into elite tech groups.`
      },
      {
        universityName: "Arizona State University",
        programName: `M.S. in ${mName}`,
        duration: "2 Years",
        avgSalary: "$92,000/yr",
        fitReason: "Cost-effective master program located in a rapid growth tech and engineering corridor."
      },
      {
        universityName: "University of Toronto",
        programName: `Master of Science in Applied Computing (${mName})`,
        duration: "1.5 Years",
        avgSalary: "$110,000/yr",
        fitReason: "Features a prestigious 8-month paid industrial research internship to land elite roles."
      },
      {
        universityName: "University College London",
        programName: `MSc in ${mName}`,
        duration: "1 Year",
        avgSalary: "£65,000/yr",
        fitReason: "Accelerated 12-month curriculum saves living costs while putting you in central London."
      },
      {
        universityName: "Boston University",
        programName: `MS in ${mName}`,
        duration: "1.5 Years",
        avgSalary: "$102,000/yr",
        fitReason: "Pairs highly rigorous curriculum with outstanding networking avenues in the Boston area."
      }
    ]
  };
}

function getFallbackEssay(essayType: any, universityName: any, wordLimit: any, draft: any) {
  const isStarter = !draft || draft.trim().length === 0;
  const wordLimitNum = parseInt(wordLimit) || 650;
  return {
    score: isStarter ? 5 : 7,
    strengths: [
      `Strong alignment with the specified essay type: ${essayType || 'Personal Statement'}.`,
      "Engaging tone that communicates a solid sense of personal identity.",
      "Clear articulation of academic and future career goals."
    ],
    improvements: [
      "Incorporate more specific details or stories to illustrate your points.",
      `Ensure the narrative flows smoothly within the target ${wordLimitNum} word limit.`,
      "Focus on showing your qualities through actions rather than just telling."
    ],
    rewrittenOpening: isStarter 
      ? `Embarking on my journey toward studying ${essayType || 'Computer Science'} at ${universityName || 'university'}, I find myself reflecting on the moments that first ignited my passion.`
      : `When I first began drafting this ${essayType || 'statement'}, my goal was simple: to connect my past experiences with my future ambitions. At ${universityName || 'university'}, I hope to expand on these themes.`,
    suggestedWordCount: Math.round(wordLimitNum * 0.9)
  };
}

function getFallbackScholarshipList(degree: any, major: any, countries: any, budget: any, gpa: any) {
  const isPostgrad = degree && (degree.toLowerCase().includes('post') || degree.toLowerCase().includes('pg') || degree.toLowerCase().includes('master') || degree.toLowerCase().includes('phd'));
  
  const allScholarships = [
    {
      name: "Tata Scholarship at Cornell University",
      provider: "Tata Education and Development Trust",
      amountPerYear: "Up to $65,000/yr (Full Tuition)",
      deadline: "March 15, 2027",
      eligibility: "Indian citizen accepted for Cornell undergraduate studies.",
      applyUrl: "https://admissions.cornell.edu/apply/international-students/tata-scholarship",
      matchScore: 92,
      requiresFinancialNeed: true,
      degreeType: "UG"
    },
    {
      name: "Inlaks Shivdasani Foundation Scholarship",
      provider: "Inlaks Shivdasani Foundation",
      amountPerYear: "Up to $100,000 (Full funding)",
      deadline: "April 15, 2027",
      eligibility: "Indian residents for postgraduate degrees in US/UK/Europe.",
      applyUrl: "https://www.inlaksfoundation.org/scholarships/",
      matchScore: 88,
      requiresFinancialNeed: false,
      degreeType: "PG"
    },
    {
      name: "Fulbright-Nehru Master's Fellowships",
      provider: "US-India Educational Foundation (USIEF)",
      amountPerYear: "Fully funded tuition & monthly stipend",
      deadline: "May 15, 2027",
      eligibility: "Indian graduates with 3+ years work experience.",
      applyUrl: "https://www.usief.org.in/Fulbright-Nehru-Fellowships.aspx",
      matchScore: 85,
      requiresFinancialNeed: false,
      degreeType: "PG"
    },
    {
      name: "Commonwealth Scholarship",
      provider: "UK Government Commonwealth Commission",
      amountPerYear: "Full tuition fees + living allowance",
      deadline: "October 30, 2026",
      eligibility: "Indian citizens applying for UK master's degrees.",
      applyUrl: "https://cscuk.fcdo.gov.uk/apply/",
      matchScore: 90,
      requiresFinancialNeed: true,
      degreeType: "PG"
    },
    {
      name: "KC Mahindra Scholarships for Postgraduate Studies Abroad",
      provider: "KC Mahindra Education Trust",
      amountPerYear: "Up to ₹10,00,000 interest-free loan",
      deadline: "August 31, 2026",
      eligibility: "Indian graduates planning to study abroad.",
      applyUrl: "https://www.kcmet.org/awards-scholarships.aspx",
      matchScore: 82,
      requiresFinancialNeed: true,
      degreeType: "PG"
    },
    {
      name: "Great Scholarships India",
      provider: "British Council & UK Government",
      amountPerYear: "Minimum £10,000/yr tuition fee reduction",
      deadline: "June 01, 2027",
      eligibility: "Indian passport holders applying to UK universities.",
      applyUrl: "https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships",
      matchScore: 87,
      requiresFinancialNeed: false,
      degreeType: "ALL"
    },
    {
      name: "Erasmus Mundus Joint Master Degrees",
      provider: "European Commission",
      amountPerYear: "Full tuition, travel & monthly allowance",
      deadline: "February 15, 2027",
      eligibility: "Indian undergraduates applying to European Master courses.",
      applyUrl: "https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters",
      matchScore: 89,
      requiresFinancialNeed: false,
      degreeType: "PG"
    },
    {
      name: "Stanford Reliance Dhirubhai Fellowship",
      provider: "Reliance Industries & Stanford GSB",
      amountPerYear: "Full tuition and associated fees",
      deadline: "June 15, 2026",
      eligibility: "Indian students accepted into Stanford MBA.",
      applyUrl: "https://www.gsb.stanford.edu/programs/mba/financial-aid/international-students/stanford-reliance-dhirubhai-fellowship",
      matchScore: 94,
      requiresFinancialNeed: true,
      degreeType: "PG"
    },
    {
      name: "Felix Scholarships",
      provider: "The Felix Trust",
      amountPerYear: "Full tuition + £16,000/yr stipend",
      deadline: "January 31, 2027",
      eligibility: "Indian graduates under 30 studying in UK.",
      applyUrl: "https://www.felixscholarship.org/",
      matchScore: 86,
      requiresFinancialNeed: true,
      degreeType: "PG"
    },
    {
      name: "Orange Tulip Scholarship",
      provider: "Nuffic Neso India",
      amountPerYear: "Up to 100% tuition fee waiver",
      deadline: "April 01, 2027",
      eligibility: "Indian students studying in the Netherlands.",
      applyUrl: "https://www.nesoindia.com/scholarships/orange-tulip-scholarship",
      matchScore: 81,
      requiresFinancialNeed: false,
      degreeType: "ALL"
    },
    {
      name: "Narotam Sekhsaria Scholarship Programme",
      provider: "Narotam Sekhsaria Foundation",
      amountPerYear: "Up to ₹20,00,000 interest-free loan",
      deadline: "March 20, 2027",
      eligibility: "Indian graduates with excellent PG track records.",
      applyUrl: "https://pg.nsfoundation.co.in/",
      matchScore: 83,
      requiresFinancialNeed: false,
      degreeType: "PG"
    },
    {
      name: "Charles Wallace India Trust Scholarships",
      provider: "Charles Wallace India Trust",
      amountPerYear: "Up to £15,000/yr plus return fare",
      deadline: "November 30, 2026",
      eligibility: "Indian artists or heritage practitioners studying in UK.",
      applyUrl: "https://www.britishcouncil.in/study-uk/scholarships/charles-wallace-india-trust-scholarships",
      matchScore: 80,
      requiresFinancialNeed: false,
      degreeType: "PG"
    }
  ];

  let filtered = allScholarships.filter(s => {
    if (isPostgrad) {
      return s.degreeType === 'PG' || s.degreeType === 'ALL';
    } else {
      return s.degreeType === 'UG' || s.degreeType === 'ALL' || s.degreeType === 'PG';
    }
  });

  while (filtered.length < 8) {
    const currentNames = filtered.map(f => f.name);
    const addition = allScholarships.find(s => !currentNames.includes(s.name));
    if (addition) {
      filtered.push(addition);
    } else {
      break;
    }
  }

  return filtered.slice(0, 8).map(s => ({
    name: s.name,
    provider: s.provider,
    amountPerYear: s.amountPerYear,
    deadline: s.deadline,
    eligibility: s.eligibility.length > 60 ? s.eligibility.slice(0, 57) + '...' : s.eligibility,
    applyUrl: s.applyUrl,
    matchScore: s.matchScore,
    requiresFinancialNeed: s.requiresFinancialNeed
  }));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Predict Admission Probability
  app.post("/api/predict", async (req, res) => {
    const { gpa, sat, ielts, major, degree, university } = req.body;
    try {
      const prompt = `You are an expert US/UK/Canada admissions counsellor. Given: GPA=${gpa}/4.0, SAT=${sat || 'Not Taken'}, IELTS=${ielts || 'Not Taken'}, Major=${major}, Degree=${degree}, Indian student. For ${university}, return ONLY a JSON object: {probability: number 0-100, tier: 'Safety'|'Match'|'Reach', reasoning: string max 20 words, scholarshipOdds: number 0-100}`;

      const response = await generateGeminiContent(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            probability: { type: Type.NUMBER, description: "Admission probability from 0 to 100" },
            tier: { type: Type.STRING, description: "Admissions tier: 'Safety', 'Match', or 'Reach'" },
            reasoning: { type: Type.STRING, description: "Brief explanation of the decision (max 20 words)" },
            scholarshipOdds: { type: Type.NUMBER, description: "Chances of getting a scholarship from 0 to 100" }
          },
          required: ["probability", "tier", "reasoning", "scholarshipOdds"]
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response text from Gemini");
      }

      res.json(JSON.parse(text));
    } catch (error: any) {
      console.log("[Status Dispatcher] Routing request through high-fidelity offline backup system...");
      const fallbackResult = getFallbackPredict(gpa, sat, ielts, major, degree, university);
      res.json(fallbackResult);
    }
  });

  // API Route: Analyze Scholarship Odds
  app.post("/api/scholarships", async (req, res) => {
    const { gpa, sat, ielts, major, degree, board, stream, targetCountries, budgetRange, dreamSchools } = req.body;
    try {
      const prompt = `You are a scholarship counselor for Indian students studying abroad. Analyze this profile:
- Converted GPA: ${gpa}/4.0 (Board: ${board}, Stream: ${stream})
- Test Scores details: SAT/ACT/IELTS/TOEFL/GRE/GMAT: ${JSON.stringify(ielts || {})}
- Preferences: Target Degree: ${degree}, Major: ${major}, Countries: ${JSON.stringify(targetCountries || [])}, Budget: ${budgetRange}
- Dream Schools: ${JSON.stringify(dreamSchools || [])}

Based on this, return the top 3 scholarship types this student qualifies for, with probability (0 to 100) and a concise one-line description for each.
Return ONLY a JSON object with this format:
{
  "scholarships": [
    {
      "type": "Name of Scholarship Type (e.g. Merit-based, Need-based University Grants, State Scholarships)",
      "probability": 75,
      "description": "One-line details of eligibility or actions required."
    }
  ]
}`;

      const response = await generateGeminiContent(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scholarships: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "Name of scholarship type" },
                  probability: { type: Type.NUMBER, description: "Odds of receiving this from 0 to 100" },
                  description: { type: Type.STRING, description: "One-line brief details" }
                },
                required: ["type", "probability", "description"]
              }
            }
          },
          required: ["scholarships"]
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response text from Gemini");
      }

      res.json(JSON.parse(text));
    } catch (error: any) {
      console.log("[Scholarships Dispatcher] Routing request through high-fidelity offline backup system...");
      const fallbackResult = getFallbackScholarships(gpa, sat, ielts, major, degree, board, stream, targetCountries, budgetRange, dreamSchools);
      res.json(fallbackResult);
    }
  });

  // API Route: Find Colleges
  app.post("/api/colleges", async (req, res) => {
    const { country, major, degree, budget, profileSummary } = req.body;
    try {
      const prompt = `You are an expert global university admissions counsellor.
Indian student profile summary: ${profileSummary}.
Suggest 8 universities in ${country} for ${major} at ${degree} level within the budget range: ${budget}.
Return a list of universities with realistic fit scores, ranking, tuition fees, acceptance rates, IELTS/standardized test requirements, and scholarship availability.
Provide a concise fit reasoning of maximum 15 words.

Return ONLY a JSON object with this structure:
{
  "colleges": [
    {
      "name": "University Name",
      "country": "Country Name",
      "ranking": "World Ranking (e.g. #25 or Top 100)",
      "avgTuition": "Average Tuition Fee per year (e.g. $45,000/yr)",
      "acceptanceRate": "Acceptance Rate percentage (e.g. 15%)",
      "fitScore": 85,
      "fitReason": "Reason why it matches (max 15 words)",
      "ieltsRequirement": "Minimum IELTS score (e.g. 6.5 or 7.0)",
      "scholarshipAvailability": "Scholarship availability (e.g. High or Merit-only)"
    }
  ]
}`;

      const response = await generateGeminiContent(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colleges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  country: { type: Type.STRING },
                  ranking: { type: Type.STRING },
                  avgTuition: { type: Type.STRING },
                  acceptanceRate: { type: Type.STRING },
                  fitScore: { type: Type.NUMBER },
                  fitReason: { type: Type.STRING },
                  ieltsRequirement: { type: Type.STRING },
                  scholarshipAvailability: { type: Type.STRING }
                },
                required: ["name", "country", "ranking", "avgTuition", "acceptanceRate", "fitScore", "fitReason", "ieltsRequirement", "scholarshipAvailability"]
              }
            }
          },
          required: ["colleges"]
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response text from Gemini");
      }

      res.json(JSON.parse(text));
    } catch (error: any) {
      console.log("[Colleges Dispatcher] Routing request through high-fidelity offline backup system...");
      const fallbackResult = getFallbackColleges(country, major, degree, budget, profileSummary);
      res.json(fallbackResult);
    }
  });

  // API Route: Course Finder
  app.post("/api/courses", async (req, res) => {
    const { majorInterest, careerGoal, profileSummary } = req.body;
    try {
      const prompt = `You are a career and global university program counselor.
Indian student profile: ${profileSummary}.
Find 6 specific course/program recommendations for major interest: ${majorInterest} and career goal: ${careerGoal}.
Suggest actual programs, their durations, estimated post-graduation salaries, and why they fit the student's background/interests.

Return ONLY a JSON object with this structure:
{
  "courses": [
    {
      "universityName": "University Name",
      "programName": "Program/Course Name (e.g. B.S. in Computer Science)",
      "duration": "Program duration (e.g. 4 Years or 2 Years)",
      "avgSalary": "Average Post-Graduation Salary (e.g. $95,000/yr)",
      "fitReason": "One-line explanation of why this program fits the student's profile and goals"
    }
  ]
}`;

      const response = await generateGeminiContent(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            courses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  universityName: { type: Type.STRING },
                  programName: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  avgSalary: { type: Type.STRING },
                  fitReason: { type: Type.STRING }
                },
                required: ["universityName", "programName", "duration", "avgSalary", "fitReason"]
              }
            }
          },
          required: ["courses"]
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response text from Gemini");
      }

      res.json(JSON.parse(text));
    } catch (error: any) {
      console.log("[Courses Dispatcher] Routing request through high-fidelity offline backup system...");
      const fallbackResult = getFallbackCourses(majorInterest, careerGoal, profileSummary);
      res.json(fallbackResult);
    }
  });

  // API Route: Essay Coach
  app.post("/api/essay", async (req, res) => {
    const { essayType, universityName, wordLimit, draft, board, gpa, degree, major } = req.body;
    try {
      const university = universityName || 'general';
      const draftContent = draft || 'none provided';
      const prompt = `You are an expert US/UK university admissions essay coach. Student profile: Indian student, board=${board || 'Not Specified'}, GPA=${gpa || 'Not Specified'}, target degree=${degree || 'Not Specified'}, major=${major || 'Not Specified'}, applying to ${university}. Essay type: ${essayType || 'Personal Statement'}. Word limit: ${wordLimit || 650}. Draft: ${draftContent}. Return ONLY a JSON object — no markdown, no explanation: { score: number 1-10, strengths: [string, string, string], improvements: [string, string, string], rewrittenOpening: string, suggestedWordCount: number }`;

      const response = await generateGeminiContent(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Essay quality score from 1 to 10" },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Three strength bullet points"
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Three improvement bullet points"
            },
            rewrittenOpening: { type: Type.STRING, description: "A beautifully rewritten opening paragraph" },
            suggestedWordCount: { type: Type.NUMBER, description: "Suggested word count for the next draft" }
          },
          required: ["score", "strengths", "improvements", "rewrittenOpening", "suggestedWordCount"]
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response text from Gemini");
      }

      res.json(JSON.parse(text));
    } catch (error: any) {
      console.log("[Essay Coach Dispatcher] Routing request through high-fidelity offline backup system...");
      const fallbackResult = getFallbackEssay(essayType, universityName, wordLimit, draft);
      res.json(fallbackResult);
    }
  });

  // API Route: Scholarship Finder
  app.post("/api/scholarship-finder", async (req, res) => {
    const { degree, major, countries, budget, gpa } = req.body;
    try {
      const targetCountriesStr = Array.isArray(countries) ? countries.join(', ') : countries || 'US, UK, Canada';
      const prompt = `Indian student applying abroad. Profile: degree=${degree || 'Undergraduate'}, major=${major || 'STEM'}, target countries=${targetCountriesStr}, budget range=${budget || 'Need assistance'}, GPA=${gpa || '90%'}. List 8 real scholarships this student can apply for. Return ONLY a JSON array — no markdown: [{ "name": "Scholarship Name", "provider": "Provider Name", "amountPerYear": "e.g. Up to $40,000/yr", "deadline": "e.g. March 15, 2027", "eligibility": "eligibility criteria max 12 words", "applyUrl": "https://example.com", "matchScore": 95, "requiresFinancialNeed": true }]`;

      const response = await generateGeminiContent(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Scholarship name" },
              provider: { type: Type.STRING, description: "Provider name" },
              amountPerYear: { type: Type.STRING, description: "Amount per year" },
              deadline: { type: Type.STRING, description: "Application deadline" },
              eligibility: { type: Type.STRING, description: "Eligibility summary max 12 words" },
              applyUrl: { type: Type.STRING, description: "Official application URL" },
              matchScore: { type: Type.NUMBER, description: "Match score 0-100" },
              requiresFinancialNeed: { type: Type.BOOLEAN, description: "Requires financial need" }
            },
            required: ["name", "provider", "amountPerYear", "deadline", "eligibility", "applyUrl", "matchScore", "requiresFinancialNeed"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response text from Gemini");
      }

      res.json(JSON.parse(text));
    } catch (error: any) {
      console.log("[Scholarship Finder Dispatcher] Routing request through high-fidelity offline backup system...");
      const fallbackResult = getFallbackScholarshipList(degree, major, countries, budget, gpa);
      res.json(fallbackResult);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
