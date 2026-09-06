/* ===========================================================
   AcademyPro — shared helpers used across every page
   =========================================================== */

const SESSION_KEY = "academypro_student";
const DATA_PATH = "data/students.json";

/** Fetch the full student roster (only needed on the login page). */
async function loadRoster() {
  const res = await fetch(DATA_PATH);
  if (!res.ok) throw new Error("Could not load student data.");
  return res.json();
}

/** Save the logged-in student for this browser tab only. */
function startSession(student) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(student));
}

/** Read the logged-in student, or null if nobody is logged in. */
function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function endSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Every portal page (not the login page) calls this first. */
function requireSession() {
  const student = getSession();
  if (!student) {
    window.location.href = "index.html";
    return null;
  }
  return student;
}

/** Short code used inside the Student ID, e.g. "Fsc (Pre Med)" -> "MED". */
function groupCode(group) {
  const known = {
    "Fsc (Pre Engg)": "ENGG",
    "Fsc (Pre Med)": "MED",
    "Computer": "COMP",
    "Biology": "BIO",
    "ICS": "ICS",
  };
  if (known[group]) return known[group];
  const letters = group.replace(/[^A-Za-z]/g, "");
  return (letters.slice(0, 4) || "STU").toUpperCase();
}

/** Builds the "GROUP-CLASS-ROLL" student ID shown across the portal. */
function studentDisplayId(student) {
  const classCode = student.class.split(" ")[0]; // "10th" | "1st" | "2nd"
  const roll = String(student.rollNo).padStart(3, "0");
  return `${groupCode(student.group)}-${classCode}-${roll}`;
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthKey(year, monthIndex) {
  return `${MONTH_NAMES[monthIndex]}-${year}`;
}

/** Parses a "Month-YYYY" key back into {year, monthIndex}. */
function parseMonthKey(key) {
  const [name, year] = key.split("-");
  return { year: Number(year), monthIndex: MONTH_NAMES.indexOf(name) };
}

function todayKey() {
  const d = new Date();
  return String(d.getDate()).padStart(2, "0");
}

/** Grade -> pill color class, used for class tests / test sessions / dashboard. */
function gradeToPillClass(grade) {
  if (!grade) return "pill-grey";
  const g = grade.toUpperCase();
  if (g.startsWith("A")) return "pill-green";
  if (g.startsWith("B")) return "pill-amber";
  return "pill-red";
}

/** Percentage -> letter grade, used where the data doesn't already give one. */
function percentToGrade(pct) {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 40) return "D";
  return "F";
}

function statusPillClass(status) {
  const map = {
    Paid: "pill-green",
    Present: "pill-green",
    P: "pill-green",
    Unpaid: "pill-red",
    Absent: "pill-red",
    A: "pill-red",
    Leave: "pill-amber",
    L: "pill-amber",
    Holiday: "pill-blue",
    H: "pill-blue",
    Pending: "pill-red",
  };
  return map[status] || "pill-grey";
}

function statusLabel(code) {
  const map = { P: "Present", A: "Absent", L: "Leave", H: "Holiday" };
  return map[code] || "No Record";
}

function formatDMY(isoOrDmy) {
  // Accepts either "YYYY-MM-DD" or already "DD-MM-YYYY".
  if (!isoOrDmy) return "-";
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDmy)) {
    const [y, m, d] = isoOrDmy.split("-");
    return `${d}-${m}-${y}`;
  }
  return isoOrDmy;
}

/** Turns classTests (object-of-arrays OR []) into a flat list with subject names attached. */
function flattenClassTests(classTests) {
  if (!classTests || Array.isArray(classTests)) return [];
  const rows = [];
  for (const subject of Object.keys(classTests)) {
    for (const t of classTests[subject]) {
      rows.push({ subject, ...t });
    }
  }
  return rows;
}

/** Turns testSessions (object-of-sessions OR []) into a flat, sorted list of session names. */
function testSessionNames(testSessions) {
  if (!testSessions || Array.isArray(testSessions)) return [];
  return Object.keys(testSessions);
}
