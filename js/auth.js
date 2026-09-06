/* ===========================================================
   AcademyPro — login flow
   =========================================================== */

const MAX_ATTEMPTS = 5;
const LOCK_MS = 30000;

let roster = [];
let matchedStudent = null;

const step1Form = document.getElementById("step1");
const step2Form = document.getElementById("step2");
const classSelect = document.getElementById("classSelect");
const groupSelect = document.getElementById("groupSelect");
const rollInput = document.getElementById("rollInput");
const step1Error = document.getElementById("step1Error");
const studentIdDisplay = document.getElementById("studentIdDisplay");
const passwordInput = document.getElementById("passwordInput");
const step2Error = document.getElementById("step2Error");

(async function init() {
  // If a session is already open, skip straight to the dashboard.
  if (getSession()) {
    window.location.href = "dashboard.html";
    return;
  }
  try {
    roster = await loadRoster();
    populateDropdown(classSelect, uniqueSorted(roster.map((s) => s.class)), "Select your class year");
    populateDropdown(groupSelect, uniqueSorted(roster.map((s) => s.group)), "Select your study group");
  } catch (e) {
    step1Error.textContent = "Could not load student records. Please try again later.";
    step1Error.classList.add("show");
  }
})();

function uniqueSorted(arr) {
  return [...new Set(arr)].sort();
}

function populateDropdown(select, values, placeholder) {
  select.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
  for (const v of values) {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  }
}

step1Form.addEventListener("submit", (e) => {
  e.preventDefault();
  step1Error.classList.remove("show");

  const cls = classSelect.value;
  const grp = groupSelect.value;
  const roll = rollInput.value.trim();

  if (!cls || !grp || !roll) {
    step1Error.textContent = "Please fill in every field.";
    step1Error.classList.add("show");
    return;
  }

  const found = roster.find(
    (s) =>
      s.class === cls &&
      s.group === grp &&
      Number(s.rollNo) === Number(roll)
  );

  if (!found) {
    step1Error.textContent = "We couldn't find a student matching those details.";
    step1Error.classList.add("show");
    return;
  }

  matchedStudent = found;
  studentIdDisplay.value = studentDisplayId(found);
  step1Form.style.display = "none";
  step2Form.style.display = "block";
  passwordInput.value = "";
  passwordInput.focus();
});

document.getElementById("backToStep1").addEventListener("click", (e) => {
  e.preventDefault();
  matchedStudent = null;
  step2Form.style.display = "none";
  step1Form.style.display = "block";
  step2Error.classList.remove("show");
});

document.getElementById("toggleVisibility").addEventListener("click", () => {
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
});

document.getElementById("forgotLink").addEventListener("click", (e) => {
  e.preventDefault();
  alert("Please contact the academy office to reset your password.");
});

step2Form.addEventListener("submit", (e) => {
  e.preventDefault();
  step2Error.classList.remove("show");
  if (!matchedStudent) return;

  const lockKey = `lock_${matchedStudent.id}`;
  const lockUntil = Number(sessionStorage.getItem(lockKey) || 0);
  if (Date.now() < lockUntil) {
    const secs = Math.ceil((lockUntil - Date.now()) / 1000);
    step2Error.textContent = `Too many attempts. Try again in ${secs}s.`;
    step2Error.classList.add("show");
    return;
  }

  if (passwordInput.value === matchedStudent.password) {
    sessionStorage.removeItem(`attempts_${matchedStudent.id}`);
    startSession(matchedStudent);
    window.location.href = "dashboard.html";
    return;
  }

  const attemptsKey = `attempts_${matchedStudent.id}`;
  const attempts = Number(sessionStorage.getItem(attemptsKey) || 0) + 1;
  sessionStorage.setItem(attemptsKey, String(attempts));

  if (attempts >= MAX_ATTEMPTS) {
    sessionStorage.setItem(lockKey, String(Date.now() + LOCK_MS));
    sessionStorage.removeItem(attemptsKey);
    step2Error.textContent = `Too many attempts. Try again in ${LOCK_MS / 1000}s.`;
  } else {
    step2Error.textContent = `That password doesn't match this Student ID. (${MAX_ATTEMPTS - attempts} attempts left)`;
  }
  step2Error.classList.add("show");
  passwordInput.value = "";
  passwordInput.focus();
});
