#!/usr/bin/env node
/**
 * Create Sample O*NET Data for Development
 *
 * This script creates sample O*NET-style data for the existing 50 BLS occupations
 * to enable development and testing of the integration and matching features.
 *
 * Once real O*NET data is downloaded, use process-onet-data.js instead.
 *
 * Usage: node scripts/create-sample-onet-data.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const BLS_DATA_PATH = path.join(__dirname, "..", "public", "data", "bls-data.json");
const PROCESSED_DIR = path.join(__dirname, "..", "src", "data", "onet", "processed");
const OCCUPATIONS_OUTPUT = path.join(PROCESSED_DIR, "occupations.json");
const TITLES_INDEX_OUTPUT = path.join(PROCESSED_DIR, "titles-index.json");

// Sample skills, knowledge, and abilities (realistic O*NET-style data)
const SAMPLE_SKILLS = {
  management: [
    { name: "Management of Personnel Resources", importance: 85, level: 75 },
    { name: "Time Management", importance: 80, level: 70 },
    { name: "Critical Thinking", importance: 85, level: 75 },
    { name: "Complex Problem Solving", importance: 85, level: 75 },
    { name: "Judgment and Decision Making", importance: 85, level: 75 },
  ],
  technical: [
    { name: "Programming", importance: 95, level: 85 },
    { name: "Systems Analysis", importance: 85, level: 75 },
    { name: "Quality Control Analysis", importance: 80, level: 70 },
    { name: "Technology Design", importance: 80, level: 75 },
    { name: "Troubleshooting", importance: 85, level: 75 },
  ],
  analytical: [
    { name: "Critical Thinking", importance: 85, level: 75 },
    { name: "Mathematics", importance: 80, level: 70 },
    { name: "Reading Comprehension", importance: 75, level: 70 },
    { name: "Active Learning", importance: 75, level: 65 },
    { name: "Complex Problem Solving", importance: 80, level: 75 },
  ],
  communication: [
    { name: "Active Listening", importance: 80, level: 70 },
    { name: "Speaking", importance: 80, level: 70 },
    { name: "Writing", importance: 75, level: 65 },
    { name: "Persuasion", importance: 75, level: 65 },
    { name: "Negotiation", importance: 70, level: 60 },
  ],
  service: [
    { name: "Service Orientation", importance: 85, level: 70 },
    { name: "Active Listening", importance: 85, level: 75 },
    { name: "Speaking", importance: 80, level: 70 },
    { name: "Social Perceptiveness", importance: 75, level: 65 },
    { name: "Persuasion", importance: 70, level: 60 },
  ],
};

const SAMPLE_KNOWLEDGE = {
  management: [
    { name: "Administration and Management", importance: 90, level: 80 },
    { name: "Personnel and Human Resources", importance: 85, level: 75 },
    { name: "Economics and Accounting", importance: 80, level: 70 },
    { name: "English Language", importance: 75, level: 70 },
    { name: "Customer and Personal Service", importance: 70, level: 65 },
  ],
  technical: [
    { name: "Computers and Electronics", importance: 95, level: 85 },
    { name: "Engineering and Technology", importance: 85, level: 75 },
    { name: "Mathematics", importance: 80, level: 75 },
    { name: "Design", importance: 75, level: 70 },
    { name: "English Language", importance: 70, level: 65 },
  ],
  business: [
    { name: "Economics and Accounting", importance: 90, level: 80 },
    { name: "Mathematics", importance: 85, level: 75 },
    { name: "Administration and Management", importance: 80, level: 70 },
    { name: "English Language", importance: 75, level: 70 },
    { name: "Customer and Personal Service", importance: 70, level: 65 },
  ],
  healthcare: [
    { name: "Medicine and Dentistry", importance: 95, level: 85 },
    { name: "Biology", importance: 85, level: 75 },
    { name: "Psychology", importance: 80, level: 70 },
    { name: "Customer and Personal Service", importance: 80, level: 75 },
    { name: "English Language", importance: 75, level: 70 },
  ],
  creative: [
    { name: "Design", importance: 90, level: 80 },
    { name: "Communications and Media", importance: 85, level: 75 },
    { name: "Computers and Electronics", importance: 80, level: 70 },
    { name: "Fine Arts", importance: 85, level: 75 },
    { name: "English Language", importance: 75, level: 70 },
  ],
};

// Alternate titles mapping (real-world variations)
const ALTERNATE_TITLES = {
  "General and Operations Managers": [
    "Operations Manager",
    "General Manager",
    "Business Operations Manager",
    "Operations Director",
    "GM",
  ],
  "Management Analysts": [
    "Business Analyst",
    "Management Consultant",
    "Business Consultant",
    "Strategy Consultant",
    "Process Improvement Analyst",
  ],
  "Marketing Managers": [
    "Marketing Director",
    "Head of Marketing",
    "Marketing Lead",
    "Chief Marketing Officer",
    "CMO",
  ],
  "Sales Managers": [
    "Sales Director",
    "Head of Sales",
    "Sales Lead",
    "VP of Sales",
    "Chief Sales Officer",
  ],
  "Software Developers": [
    "Software Engineer",
    "Developer",
    "Programmer",
    "Software Developer",
    "Application Developer",
    "Full Stack Developer",
    "Backend Developer",
    "Frontend Developer",
  ],
  "Network and Computer Systems Administrators": [
    "System Administrator",
    "Systems Admin",
    "Sysadmin",
    "Network Administrator",
    "IT Administrator",
  ],
  "Accountants and Auditors": [
    "Accountant",
    "Auditor",
    "CPA",
    "Certified Public Accountant",
    "Staff Accountant",
  ],
  "Public Relations Specialists": [
    "PR Specialist",
    "Public Relations Manager",
    "Communications Specialist",
    "Media Relations Specialist",
    "PR Manager",
  ],
  "Secretaries and Administrative Assistants": [
    "Administrative Assistant",
    "Secretary",
    "Executive Assistant",
    "Office Administrator",
    "Admin Assistant",
  ],
  "Sales Representatives, Services": [
    "Sales Representative",
    "Sales Rep",
    "Account Executive",
    "Sales Associate",
    "Business Development Representative",
  ],
  "Human Resources Managers": [
    "HR Manager",
    "Human Resources Director",
    "Head of HR",
    "People Manager",
    "Talent Manager",
  ],
  "Human Resources Specialists": [
    "HR Specialist",
    "HR Generalist",
    "Recruiter",
    "Talent Acquisition Specialist",
    "HR Coordinator",
  ],
  "Career/Technical Education Teachers, Postsecondary": [
    "Technical Instructor",
    "Vocational Teacher",
    "Career Counselor",
    "Training Specialist",
  ],
  "Registered Nurses": [
    "RN",
    "Nurse",
    "Staff Nurse",
    "Clinical Nurse",
    "Registered Nurse",
  ],
  "Customer Service Representatives": [
    "Customer Service Rep",
    "Customer Support Representative",
    "Support Specialist",
    "Client Services Representative",
    "CSR",
  ],
  "Civil Engineers": [
    "Civil Engineer",
    "Structural Engineer",
    "Project Engineer",
    "Site Engineer",
  ],
  "Industrial Engineers": [
    "Industrial Engineer",
    "Process Engineer",
    "Manufacturing Engineer",
    "Production Engineer",
  ],
  "Graphic Designers": [
    "Graphic Designer",
    "Visual Designer",
    "UI Designer",
    "Creative Designer",
    "Brand Designer",
  ],
  "Software Quality Assurance Analysts and Testers": [
    "QA Analyst",
    "Quality Assurance Engineer",
    "Test Engineer",
    "QA Tester",
    "Software Tester",
  ],
  "Market Research Analysts and Marketing Specialists": [
    "Market Research Analyst",
    "Marketing Analyst",
    "Market Researcher",
    "Business Intelligence Analyst",
    "Marketing Specialist",
  ],
};

// Category-to-skill mapping
const CATEGORY_SKILLS = {
  Management: "management",
  "Computer and Mathematical": "technical",
  "Business and Financial Operations": "analytical",
  "Healthcare Practitioners and Technical": "healthcare",
  "Architecture and Engineering": "technical",
  "Arts, Design, Entertainment, Sports, and Media": "creative",
  "Media and Communication": "communication",
  "Educational Instruction and Library": "communication",
  "Office and Administrative Support": "service",
  "Sales and Related": "communication",
};

const CATEGORY_KNOWLEDGE = {
  Management: "management",
  "Computer and Mathematical": "technical",
  "Business and Financial Operations": "business",
  "Healthcare Practitioners and Technical": "healthcare",
  "Architecture and Engineering": "technical",
  "Arts, Design, Entertainment, Sports, and Media": "creative",
  "Media and Communication": "creative",
  "Educational Instruction and Library": "management",
  "Office and Administrative Support": "business",
  "Sales and Related": "business",
};

/**
 * Generate sample occupation description
 */
function generateDescription(title, group) {
  const descriptions = {
    Management: `${title} plan, direct, or coordinate activities in companies or organizations.`,
    "Computer and Mathematical": `${title} design, develop, test, and maintain computer systems and applications.`,
    "Business and Financial Operations": `${title} conduct analyses and provide insights to improve business operations.`,
    "Healthcare Practitioners and Technical": `${title} provide medical care and support to patients.`,
    "Architecture and Engineering": `${title} design, develop, and oversee construction and engineering projects.`,
    "Arts, Design, Entertainment, Sports, and Media": `${title} create visual concepts and designs for various media.`,
    "Media and Communication": `${title} create and distribute information to the public through various media channels.`,
    "Educational Instruction and Library": `${title} teach and train students in academic and vocational subjects.`,
    "Office and Administrative Support": `${title} perform routine clerical and administrative functions.`,
    "Sales and Related": `${title} sell goods and services to customers and clients.`,
  };

  return descriptions[group] || `${title} perform professional duties in their field.`;
}

/**
 * Process BLS data and create O*NET-style occupation data
 */
function createOccupationData() {
  console.log("Creating sample O*NET data from BLS occupations...\n");

  // Read BLS data
  const blsData = JSON.parse(fs.readFileSync(BLS_DATA_PATH, "utf8"));
  const occupations = {};
  const titlesIndex = {};

  blsData.occupations.forEach((occ) => {
    const skillCategory = CATEGORY_SKILLS[occ.group] || "analytical";
    const knowledgeCategory = CATEGORY_KNOWLEDGE[occ.group] || "business";

    // Create occupation object
    const occupation = {
      code: occ.code,
      title: occ.title,
      description: generateDescription(occ.title, occ.group),
      group: occ.group,
      alternateTitles: ALTERNATE_TITLES[occ.title] || [occ.title],
      skills: SAMPLE_SKILLS[skillCategory] || SAMPLE_SKILLS.analytical,
      knowledge: SAMPLE_KNOWLEDGE[knowledgeCategory] || SAMPLE_KNOWLEDGE.business,
      // Education/experience levels (1-5, where 5 is most advanced)
      jobZone: occ.group === "Management" ? 4 : occ.group.includes("Computer") ? 4 : 3,
      educationLevel:
        occ.group === "Healthcare Practitioners and Technical"
          ? "Bachelor's degree or higher"
          : occ.group === "Management"
            ? "Bachelor's degree"
            : occ.group.includes("Computer")
              ? "Bachelor's degree"
              : "Some college, no degree",
    };

    occupations[occ.code] = occupation;

    // Build titles index for fast lookup
    // Add primary title
    const normalizedTitle = occ.title.toLowerCase();
    if (!titlesIndex[normalizedTitle]) {
      titlesIndex[normalizedTitle] = [];
    }
    titlesIndex[normalizedTitle].push({
      code: occ.code,
      title: occ.title,
      matchType: "primary",
    });

    // Add alternate titles
    (ALTERNATE_TITLES[occ.title] || []).forEach((altTitle) => {
      const normalizedAlt = altTitle.toLowerCase();
      if (!titlesIndex[normalizedAlt]) {
        titlesIndex[normalizedAlt] = [];
      }
      titlesIndex[normalizedAlt].push({
        code: occ.code,
        title: occ.title,
        matchType: "alternate",
      });
    });

    // Add individual words for partial matching
    const words = normalizedTitle.split(/\s+/).filter((w) => w.length > 3);
    words.forEach((word) => {
      if (!titlesIndex[word]) {
        titlesIndex[word] = [];
      }
      // Avoid duplicates
      if (!titlesIndex[word].some((item) => item.code === occ.code)) {
        titlesIndex[word].push({
          code: occ.code,
          title: occ.title,
          matchType: "partial",
        });
      }
    });
  });

  return { occupations, titlesIndex };
}

/**
 * Main execution
 */
function main() {
  console.log("O*NET Sample Data Generator");
  console.log("=" .repeat(50));

  // Ensure output directory exists
  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }

  // Create occupation data
  const { occupations, titlesIndex } = createOccupationData();

  // Write occupations file
  fs.writeFileSync(OCCUPATIONS_OUTPUT, JSON.stringify(occupations, null, 2));
  console.log(`✓ Created: ${OCCUPATIONS_OUTPUT}`);
  console.log(`  ${Object.keys(occupations).length} occupations processed`);

  // Write titles index
  fs.writeFileSync(TITLES_INDEX_OUTPUT, JSON.stringify(titlesIndex, null, 2));
  console.log(`✓ Created: ${TITLES_INDEX_OUTPUT}`);
  console.log(`  ${Object.keys(titlesIndex).length} title variants indexed`);

  // Statistics
  console.log("\nStatistics:");
  console.log(`  Total occupations: ${Object.keys(occupations).length}`);
  console.log(`  Total searchable titles: ${Object.keys(titlesIndex).length}`);

  const totalAlternateTitles = Object.values(occupations).reduce(
    (sum, occ) => sum + occ.alternateTitles.length,
    0,
  );
  console.log(`  Average alternate titles per occupation: ${(totalAlternateTitles / Object.keys(occupations).length).toFixed(1)}`);

  console.log("\n✓ Sample O*NET data created successfully!");
  console.log(
    "\nNote: This is sample data for development. Run the download-onet-data.js",
  );
  console.log("      script followed by process-onet-data.js for the full dataset.");
}

// Run
main();
