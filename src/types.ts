export interface UserProfile {
  // Step 1: Personal
  name: string;
  email: string;
  phone: string;
  city: string;
  graduationYear: string;

  // Step 2: Academics
  board: string;
  gradingSystem: 'percentage' | 'cgpa';
  gpa: number;
  stream: string;

  // Step 3: Test Scores
  testsTaken: {
    SAT?: number;
    ACT?: number;
    IELTS?: number;
    TOEFL?: number;
    GRE?: number;
    GMAT?: number;
  };

  // Step 4: Preferences
  targetDegree: string;
  targetCountries: string[];
  budgetRange: string;
  preferredMajors: string[];

  // Step 5: Dream Schools
  dreamSchools: string[];
}
