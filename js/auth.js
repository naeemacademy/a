/* ===========================================================
   AcademyPro — login flow
   =========================================================== */

const MAX_ATTEMPTS = 5;
const LOCK_MS = 30000;
const TRANSITION_MS = 220; // keep in sync with --duration-base in css/site.css

let roster = [];
let matchedStudent = null;

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step1Form = document.getElementById("step1Form");
const step2Form = document.getElementById("step2Form");
const classSelect = document.getElementById("class-select");
const groupSelect = document.getElementById("group-select");
const rollInput = document.getElementById("roll-number");
const step1Error = document.getElementById("step1Error");
const step1ErrorText = document.getElementById("step1ErrorText");
const studentIdDisplay = document.getElementById("student-id");
const passwordInput = document.getElementById("password");
const step2Error = document.getElementById("step2Error");
const step2ErrorText = document.getElementById("step2ErrorText");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

(async function init() {
  if (getSession()) {
    window.location.href = "dashboard.html";
    return;
  }
  try {
    roster = await loadRoster();
    populateDropdown(classSelect, uniqueSorted(roster.map((s) => s.class)), "Select your class year");
    populateDropdown(groupSelect, uniqueSorted(roster.map((s) => s.group)), "Select your study group");
    classSelect.disabled = false;
    groupSelect.disabled = false;
  } catch (e) {
    showError(step1Error, step1ErrorText, "Could not load student records. Please try again later.");
  }
})();

function uniqueSorted(arr) {
  return [...new Set(arr)].sort();
}

function populateDropdown(select, values, placeholder) {
  select.innerHTML = `<option disabled selected value="">${placeholder}</option>`;
  for (const v of values) {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  }
}

function showError(wrapper, textEl, message) {
  textEl.textContent = message;
  wrapper.style.display = "flex";
}
function hideError(wrapper) {
  wrapper.style.display = "none";
}

/** Crossfades between the two <main> step panels instead of an instant swap. */
function goToStep(fromEl, toEl) {
  const finish = () => {
    fromEl.classList.remove("step-leave");
    fromEl.classList.remove("active");

    toEl.classList.add("active", "step-enter");
    // force reflow so the browser registers the starting state before we animate it in
    void toEl.offsetWidth;
    toEl.classList.remove("step-enter");
  };

  if (prefersReducedMotion) {
    finish();
    return;
  }

  fromEl.classList.add("step-leave");
  window.setTimeout(finish, TRANSITION_MS);
}

step1Form.addEventListener("submit", (e) => {
  e.preventDefault();
  hideError(step1Error);

  const cls = classSelect.value;
  const grp = groupSelect.value;
  const roll = rollInput.value.trim();

  if (!cls || !grp || !roll) {
    showError(step1Error, step1ErrorText, "Please fill in every field.");
    return;
  }

  const found = roster.find(
    (s) => s.class === cls && s.group === grp && Number(s.rollNo) === Number(roll)
  );

  if (!found) {
    showError(step1Error, step1ErrorText, "We couldn't find a student matching those details.");
    return;
  }

  matchedStudent = found;
  studentIdDisplay.value = studentDisplayId(found);
  passwordInput.value = "";
  goToStep(step1, step2);
  window.setTimeout(() => passwordInput.focus(), TRANSITION_MS + 30);
});

document.getElementById("backToStep1").addEventListener("click", (e) => {
  e.preventDefault();
  matchedStudent = null;
  hideError(step2Error);
  goToStep(step2, step1);
});

document.getElementById("toggleVisibility").addEventListener("click", (e) => {
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
  e.currentTarget.setAttribute("aria-label", passwordInput.type === "password" ? "Show password" : "Hide password");
});

document.getElementById("forgotLink").addEventListener("click", (e) => {
  e.preventDefault();
  alert("Please contact the academy office to reset your password.");
});

step2Form.addEventListener("submit", (e) => {
  e.preventDefault();
  hideError(step2Error);
  if (!matchedStudent) return;

  const lockKey = `lock_${matchedStudent.id}`;
  const lockUntil = Number(sessionStorage.getItem(lockKey) || 0);
  if (Date.now() < lockUntil) {
    const secs = Math.ceil((lockUntil - Date.now()) / 1000);
    showError(step2Error, step2ErrorText, `Too many attempts. Try again in ${secs}s.`);
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
    showError(step2Error, step2ErrorText, `Too many attempts. Try again in ${LOCK_MS / 1000}s.`);
  } else {
    showError(step2Error, step2ErrorText, `That password doesn't match this Student ID. (${MAX_ATTEMPTS - attempts} attempts left)`);
  }
  passwordInput.value = "";
  passwordInput.focus();
});
