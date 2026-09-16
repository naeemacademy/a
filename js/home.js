/* ===========================================================
   AcademyPro — Home (landing) page
   The class list is fixed here rather than pulled from a database,
   since this is a static site — these are simply the classes and
   groups AcademyPro currently offers.
   =========================================================== */

const OFFERED_CLASSES = [
  { name: "9th", group: "Computer", icon: "computer", color: "#2f6bff" },
  { name: "9th", group: "Biology", icon: "biotech", color: "#22c55e" },
  { name: "10th", group: "Computer", icon: "computer", color: "#2f6bff" },
  { name: "10th", group: "Biology", icon: "biotech", color: "#22c55e" },
  { name: "1st Year", group: "ICS", icon: "computer", color: "#8b5cf6" },
  { name: "1st Year", group: "Fsc", icon: "biotech", color: "#f59e0b" },
  { name: "2nd Year", group: "ICS", icon: "computer", color: "#8b5cf6" },
  { name: "2nd Year", group: "Fsc", icon: "biotech", color: "#f59e0b" },
];

(function renderClassGrid() {
  const grid = document.getElementById("classGrid");
  if (!grid) return;

  grid.innerHTML = OFFERED_CLASSES.map((c) => `
    <div class="class-card">
      <div class="class-card-icon" style="background:${c.color}1a; color:${c.color};">
        <span class="material-symbols-outlined">${c.icon}</span>
      </div>
      <h3>${c.name} ${c.group}</h3>
      <p>Comprehensive ${c.group.toLowerCase()} curriculum for ${c.name} students, taught by experienced faculty.</p>
      <a href="timetable.html" class="class-card-link">View Timetable &rarr;</a>
    </div>
  `).join("");
})();

/* ---- Mobile nav toggle (exact behavior as provided) ---- */
document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.getElementById('public-nav-toggle');
    var links = document.getElementById('public-nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
        var isOpen = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
            links.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
});
