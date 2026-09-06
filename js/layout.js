/* ===========================================================
   AcademyPro — sidebar, topbar & notifications modal
   Every portal page (not the login page) calls initLayout(...)
   =========================================================== */

const NAV_ITEMS = [
  { id: "dashboard", href: "dashboard.html", label: "Dashboard", icon: "&#9635;" },
  { id: "fees", href: "fees.html", label: "Fees", icon: "&#128179;" },
  { id: "attendance", href: "attendance.html", label: "Attendance", icon: "&#128197;" },
];

const EXAM_ITEMS = [
  { id: "classtest", href: "classtest.html", label: "Class-test" },
  { id: "testsession", href: "testsession.html", label: "Test-session" },
];

function initLayout({ activeId, pageTitle, pageIcon }) {
  const student = requireSession();
  if (!student) return null;

  renderSidebar(activeId);
  renderTopbar(student, pageTitle, pageIcon);
  wireNotifications(student);
  wireLogout();

  return student;
}

function renderSidebar(activeId) {
  const root = document.getElementById("sidebar");
  const inExam = activeId === "classtest" || activeId === "testsession";

  const topLinks = NAV_ITEMS.map(
    (item) => `
      <a class="nav-item ${activeId === item.id ? "active" : ""}" href="${item.href}">
        <span class="icon">${item.icon}</span>${item.label}
      </a>`
  ).join("");

  const examLinks = EXAM_ITEMS.map(
    (item) => `
      <a class="nav-item ${activeId === item.id ? "active" : ""}" href="${item.href}">
        ${item.label}
      </a>`
  ).join("");

  root.innerHTML = `
    <div class="brand">
      <img src="assets/logo.svg" alt="AcademyPro logo" />
      <span>AcademyPro</span>
    </div>
    <div class="nav-group">
      ${topLinks}
      <button class="nav-toggle ${inExam ? "open" : ""}" id="examToggle" type="button">
        <span class="icon">&#128220;</span>Examination
        <span class="chev">&#9660;</span>
      </button>
      <div class="nav-submenu ${inExam ? "open" : ""}" id="examSubmenu">
        ${examLinks}
      </div>
      <a class="nav-item ${activeId === "profile" ? "active" : ""}" href="profile.html">
        <span class="icon">&#128100;</span>Profile
      </a>
    </div>
  `;

  const toggle = document.getElementById("examToggle");
  const submenu = document.getElementById("examSubmenu");
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("open");
    submenu.classList.toggle("open");
  });
}

function renderTopbar(student, pageTitle, pageIcon) {
  const root = document.getElementById("topbar");
  root.innerHTML = `
    <h1><span>${pageIcon || ""}</span>${pageTitle}</h1>
    <div class="topbar-right">
      <button class="bell-btn" id="bellBtn" type="button" aria-label="Notifications">
        &#128276;
        <span class="bell-dot" id="bellDot"></span>
      </button>
      <div class="user-chip">
        <span class="avatar">${initials(student.name)}</span>
        <span class="who">
          <strong>${student.name}</strong>
          <small>${student.class} &bull; ${student.group}</small>
        </span>
      </div>
      <button class="logout-btn" id="logoutBtn" type="button">&#8618; Logout</button>
    </div>
  `;
}

function wireLogout() {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    endSession();
    window.location.href = "index.html";
  });
}

function wireNotifications(student) {
  const bellBtn = document.getElementById("bellBtn");
  const bellDot = document.getElementById("bellDot");
  const overlay = document.getElementById("notifModal");
  const notes = [...(student.notifications || [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (notes.length > 0) bellDot.classList.add("show");

  const listHtml = notes.length
    ? notes
        .map(
          (n, i) => `
        <div class="notif-item">
          <span class="n-icon">&#128276;</span>
          <div>
            <h4>${n.title}${i === 0 ? ' <span class="pill pill-sm pill-blue">New</span>' : ""}</h4>
            <p>${n.message}</p>
            <time>${formatDMY(n.date)}</time>
          </div>
        </div>`
        )
        .join("")
    : `<div class="empty-state">You're all caught up — no notifications yet.</div>`;

  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-head">
        <h3>Notifications</h3>
        ${notes.length ? `<span class="pill pill-sm pill-blue">${notes.length} total</span>` : ""}
        <button class="modal-close" id="modalClose" type="button" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">${listHtml}</div>
    </div>
  `;

  bellBtn.addEventListener("click", () => overlay.classList.add("show"));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.id === "modalClose") {
      overlay.classList.remove("show");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") overlay.classList.remove("show");
  });
}
