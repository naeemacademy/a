/* ===========================================================
   AcademyPro — shared helpers used across every page
   =========================================================== */

const SESSION_KEY = "academypro_student";
const DATA_PATH = "data/students.json";

/** Fetches the full student list — only used on the login page. */
async function loadRoster() {
  const res = await fetch(DATA_PATH);
  if (!res.ok) throw new Error("Could not load student data.");
  return res.json();
}

/** Saves the logged-in student for this tab only (cleared on close/logout). */
function startSession(student) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(student));
}

/** Reads the logged-in student, or null if nobody is logged in. */
function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/** Logs out: clears the session so the next page load redirects to login. */
function endSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Every page except the login page calls this first — redirects if not logged in. */
function requireSession() {
  const student = getSession();
  if (!student) {
    window.location.href = "student-login.html";
    return null;
  }
  return student;
}

/** Short code used in the Student ID, e.g. "Fsc (Pre Med)" -> "MED". */
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

/** Builds the "GROUP-CLASS-ROLL" Student ID shown across the portal. */
function studentDisplayId(student) {
  const classCode = student.class.split(" ")[0];
  const roll = String(student.rollNo).padStart(3, "0");
  return `${groupCode(student.group)}-${classCode}-${roll}`;
}

/** Up to two initials for the avatar chip, e.g. "Ali Khan" -> "AK". */
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

/** Builds the "Month-YYYY" key format used throughout the JSON (attendance, fees). */
function monthKey(year, monthIndex) {
  return `${MONTH_NAMES[monthIndex]}-${year}`;
}

/** Reverses monthKey(): "September-2026" -> {year: 2026, monthIndex: 8}. */
function parseMonthKey(key) {
  const [name, year] = key.split("-");
  return { year: Number(year), monthIndex: MONTH_NAMES.indexOf(name) };
}

/** Today's day-of-month as a zero-padded string, e.g. "06" — matches JSON's day keys. */
function todayKey() {
  const d = new Date();
  return String(d.getDate()).padStart(2, "0");
}

/** Grade -> {bg, fg} colors for inline-styled pills, matching the site's grade palette. */
function gradeColors(grade) {
  if (!grade) return { bg: "var(--status-grey-bg)", fg: "var(--status-grey-fg)" };
  const g = grade.toUpperCase();
  if (g.startsWith("A")) return { bg: "var(--grade-a-bg)", fg: "var(--grade-a-fg)" };
  if (g.startsWith("B")) return { bg: "var(--grade-b-bg)", fg: "var(--grade-b-fg)" };
  return { bg: "var(--grade-c-bg)", fg: "var(--grade-c-fg)" };
}

/** Percentage -> letter grade, used only where the JSON doesn't already give one. */
function percentToGrade(pct) {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 40) return "D";
  return "F";
}

/** Status -> {bg, fg} inline colors, matching the Stitch mockups exactly. */
function statusColors(status) {
  const map = {
    Paid: { bg: "rgb(220,252,231)", fg: "rgb(21,128,61)" },
    Present: { bg: "rgb(187,247,208)", fg: "rgb(21,128,61)" },
    Unpaid: { bg: "rgb(255,218,214)", fg: "rgb(147,0,10)" },
    Pending: { bg: "rgb(255,218,214)", fg: "rgb(147,0,10)" },
    Absent: { bg: "rgb(254,226,226)", fg: "rgb(220,38,38)" },
    Leave: { bg: "rgb(254,243,199)", fg: "rgb(217,119,6)" },
    Holiday: { bg: "rgb(219,234,254)", fg: "rgb(29,78,216)" },
  };
  return map[status] || { bg: "#eceef0", fg: "#434654" };
}

/** Status -> Material Symbols icon name shown next to the status pill. */
function statusIcon(status) {
  const map = {
    Paid: "check_circle", Present: "check_circle",
    Unpaid: "cancel", Pending: "cancel", Absent: "cancel",
    Leave: "warning", Holiday: "event",
  };
  return map[status] || "help";
}

/** Attendance code -> readable label, e.g. "P" -> "Present". Unknown/missing -> "No Record". */
function statusLabel(code) {
  const map = { P: "Present", A: "Absent", L: "Leave", H: "Holiday" };
  return map[code] || "No Record";
}

/** Normalizes a date to DD-MM-YYYY for display; JSON dates come in as either format. */
function formatDMY(isoOrDmy) {
  if (!isoOrDmy) return "-";
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDmy)) {
    const [y, m, d] = isoOrDmy.split("-");
    return `${d}-${m}-${y}`;
  }
  return isoOrDmy;
}

/** Turns classTests (object keyed by subject, or [] when empty) into one flat, sortable list. */
function flattenClassTests(classTests) {
  if (!classTests || Array.isArray(classTests)) return [];
  const rows = [];
  for (const subject of Object.keys(classTests)) {
    for (const t of classTests[subject]) rows.push({ subject, ...t });
  }
  return rows;
}

/** Session names from testSessions (object keyed by session, or [] when empty). */
function testSessionNames(testSessions) {
  if (!testSessions || Array.isArray(testSessions)) return [];
  return Object.keys(testSessions);
}
