/* ===========================================================
   AcademyPro — sidebar, topbar & mobile bottom nav
   Shared across every logged-in page. Rendered once via
   initLayout() so all six pages stay visually identical.
   Desktop uses the sidebar (aside#sidebar); mobile (<768px)
   swaps to the fixed bottom nav (nav#mobileNav) instead — see
   css/site.css's @media (max-width: 767px) block for the swap.
   =========================================================== */

const NAV_ITEMS = [
  { id: "dashboard", href: "dashboard.html", label: "Dashboard", icon: "dashboard" },
  { id: "fees", href: "fees.html", label: "Fees", icon: "payments" },
  { id: "attendance", href: "attendance.html", label: "Attendance", icon: "fact_check" },
];

const EXAM_ITEMS = [
  { id: "classtest", href: "classtest.html", label: "Class-test" },
  { id: "testsession", href: "testsession.html", label: "Test-session" },
];

const PROFILE_ITEM = { id: "profile", href: "profile.html", label: "Profile", icon: "person" };

// Mobile bottom nav collapses Class-test + Test-session into one "Exams" tab —
// matches the 5-item reference layout (Dashboard, Fees, Attendance, Exams, Profile).
const MOBILE_NAV_ITEMS = [
  { id: "dashboard", href: "dashboard.html", label: "Dashboard", icon: "dashboard" },
  { id: "fees", href: "fees.html", label: "Fees", icon: "payments" },
  { id: "attendance", href: "attendance.html", label: "Attendance", icon: "fact_check" },
  { id: "exams", href: "classtest.html", label: "Exams", icon: "description" },
  { id: "profile", href: "profile.html", label: "Profile", icon: "person" },
];

const NAV_A = (href, icon, label, active) => `
  <a class="nav-item${active ? " active" : ""}" href="${href}"${active ? ' aria-current="page"' : ""}>
    <span class="material-symbols-outlined">${icon}</span> ${label}
  </a>`;

const SUB_NAV_A = (href, label, active) => `
  <a class="nav-item${active ? " active" : ""}" href="${href}"${active ? ' aria-current="page"' : ""}>${label}</a>`;

function initLayout({ activeId, pageTitle, pageIcon }) {
  const student = requireSession();
  if (!student) return null;

  renderSidebar(activeId);
  renderTopbar(student, pageTitle, pageIcon);
  renderMobileNav(activeId);
  wireNotifications(student);
  wireLogout();

  return student;
}

/**
 * Renders the fixed mobile bottom nav. Every item is a plain link except
 * "Exams", which expands a small popover (Class-test / Test-session) above
 * itself — mirroring the desktop sidebar's expandable Examination section.
 */
function renderMobileNav(activeId) {
  const root = document.getElementById("mobileNav");
  if (!root) return; // page hasn't added the container — skip quietly

  const inExams = activeId === "classtest" || activeId === "testsession";
  const isActive = (id) => (id === "exams" ? inExams : activeId === id);

  root.innerHTML = MOBILE_NAV_ITEMS.map((item) => {
    const active = isActive(item.id);
    const activeCls = active ? " active" : "";
    const current = active ? ' aria-current="page"' : "";

    if (item.id === "exams") {
      // Wrapper needs position:relative so the popover can anchor to it.
      return `
        <div class="mobile-nav-item-wrap">
          <button type="button" id="examsNavToggle" class="mobile-nav-item${activeCls}" aria-haspopup="true" aria-expanded="false"${current}>
            <span class="material-symbols-outlined">${item.icon}</span>
            <span class="mn-label">${item.label}</span>
          </button>
          <div id="examsPopover" class="mobile-exams-popover" role="menu">
            <a href="classtest.html" role="menuitem" class="mobile-exams-popover-item${activeId === "classtest" ? " active" : ""}">
              <span class="material-symbols-outlined">quiz</span> Class-test
            </a>
            <a href="testsession.html" role="menuitem" class="mobile-exams-popover-item${activeId === "testsession" ? " active" : ""}">
              <span class="material-symbols-outlined">assignment</span> Test-session
            </a>
          </div>
        </div>`;
    }

    return `
      <a href="${item.href}" class="mobile-nav-item${activeCls}"${current}>
        <span class="material-symbols-outlined">${item.icon}</span>
        <span class="mn-label">${item.label}</span>
      </a>`;
  }).join("");

  wireExamsPopover();
}

/** Opens/closes the Exams popover on tap, and closes it on an outside tap. */
function wireExamsPopover() {
  const toggle = document.getElementById("examsNavToggle");
  const popover = document.getElementById("examsPopover");
  if (!toggle || !popover) return;

  const close = () => {
    popover.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };
  const open = () => {
    popover.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
  };

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    popover.classList.contains("open") ? close() : open();
  });
  document.addEventListener("click", (e) => {
    if (!popover.contains(e.target) && e.target !== toggle) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/** Builds the desktop sidebar (hidden below 768px — see css/site.css). */
function renderSidebar(activeId) {
  const root = document.getElementById("sidebar");

  const topLinks = NAV_ITEMS.map((item) => NAV_A(item.href, item.icon, item.label, activeId === item.id)).join("");
  const examLinks = EXAM_ITEMS.map((item) => SUB_NAV_A(item.href, item.label, activeId === item.id)).join("");
  const profileLink = NAV_A(PROFILE_ITEM.href, PROFILE_ITEM.icon, PROFILE_ITEM.label, activeId === PROFILE_ITEM.id);

  root.innerHTML = `
    <div class="sidebar-brand">
      <img alt="Academy Logo" src="assets/logo.jpg" />
      <span>AcademyPro</span>
    </div>
    <nav class="sidebar-nav">
      ${topLinks}
      <details open>
        <summary class="nav-toggle">
          <span class="stack-row"><span class="material-symbols-outlined">description</span> Examination</span>
          <span class="material-symbols-outlined chev">expand_more</span>
        </summary>
        <div class="nav-submenu">
          ${examLinks}
        </div>
      </details>
      ${profileLink}
    </nav>
  `;
}

/** Builds the top bar: page title, notification bell, student chip, logout. */
function renderTopbar(student, pageTitle, pageIcon) {
  const root = document.getElementById("topbar");
  root.innerHTML = `
    <div class="topbar-inner">
      <div class="topbar-brand-mobile">AcademyPro</div>
      <div class="topbar-title">
        <span class="material-symbols-outlined">${pageIcon}</span> ${pageTitle}
      </div>
      <div class="topbar-actions">
        <div style="position:relative;">
          <button aria-label="Notifications" id="bellBtn" type="button" class="btn-icon">
            <span class="material-symbols-outlined">notifications</span>
            <span id="bellDot" class="bell-dot" style="display:none;"></span>
          </button>
        </div>
        <div class="user-chip">
          <span class="material-symbols-outlined">account_circle</span>
          <div class="who">
            <strong>${student.name}</strong>
            <small>${student.class} &bull; ${student.group}</small>
          </div>
        </div>
        <button id="logoutBtn" type="button" aria-label="Logout" class="btn btn-outline-danger">
          <span class="material-symbols-outlined" style="font-size:16px;">logout</span>
          <span class="btn-label">Logout</span>
        </button>
      </div>
    </div>
  `;
}

/** Logout button: clears the session and sends the student back to login. */
function wireLogout() {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    endSession();
    window.location.href = "student-login.html";
  });
}

/** Renders the notification bell's unread dot + the notifications modal contents, and wires open/close. */
function wireNotifications(student) {
  const bellBtn = document.getElementById("bellBtn");
  const bellDot = document.getElementById("bellDot");
  const modal = document.getElementById("notifModal");

  const notes = [...(student.notifications || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (notes.length > 0) bellDot.style.display = "block";

  const itemsHtml = notes.length
    ? notes
        .map(
          (n, i) => `
        <div class="notif-item${i === 0 ? " unread" : ""}">
          <div class="notif-icon"><span class="material-symbols-outlined">notifications</span></div>
          <div style="flex:1; min-width:0;">
            <div class="notif-title-row">
              <h4>${n.title}</h4>
              ${i === 0 ? '<span class="unread-dot"></span>' : ""}
            </div>
            <p>${n.message}</p>
            <time>${formatDMY(n.date)}</time>
          </div>
        </div>`
        )
        .join("")
    : `<div class="empty-state">You're all caught up &mdash; no notifications yet.</div>`;

  modal.innerHTML = `
    <div class="modal-card" onclick="event.stopPropagation()">
      <div class="modal-header">
        <div class="stack-row">
          <h3>Notifications</h3>
          ${notes.length ? `<span class="pill pill-sm" style="background:var(--color-primary-soft); color:var(--color-primary);">${notes.length} total</span>` : ""}
        </div>
        <button id="modalClose" aria-label="Close" type="button" class="btn-icon" style="width:32px; height:32px;">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="modal-body">${itemsHtml}</div>
    </div>
  `;

  const open = () => modal.classList.add("open");
  const close = () => modal.classList.remove("open");

  bellBtn.addEventListener("click", open);
  modal.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
  document.getElementById("modalClose").addEventListener("click", close);
}
