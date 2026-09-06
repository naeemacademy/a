(function () {
  const student = initLayout({ activeId: "classtest", pageTitle: "Class Tests", pageIcon: "&#128196;" });
  if (!student) return;

  const isEmpty = !student.classTests || Array.isArray(student.classTests) || Object.keys(student.classTests).length === 0;
  const filter = document.getElementById("subjectFilter");
  const tbody = document.getElementById("testBody");
  const emptyState = document.getElementById("emptyState");

  if (isEmpty) {
    filter.style.display = "none";
    document.querySelector("table.data-table").style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  const subjects = Object.keys(student.classTests);
  filter.innerHTML = subjects.map((s) => `<option value="${s}">${s}</option>`).join("");
  filter.addEventListener("change", () => renderSubject(filter.value));
  renderSubject(subjects[0]);

  function renderSubject(subject) {
    const tests = [...student.classTests[subject]].sort((a, b) => new Date(b.date) - new Date(a.date));
    tbody.innerHTML = tests
      .map((t) => {
        if (t.absent) {
          return `
            <tr>
              <td>${t.test}</td>
              <td>${formatDMY(t.date)}</td>
              <td colspan="4"><span class="pill pill-sm pill-red">Absent</span></td>
            </tr>`;
        }
        const pct = t.total ? Math.round((t.obtained / t.total) * 100) : 0;
        return `
          <tr>
            <td>${t.test}</td>
            <td>${formatDMY(t.date)}</td>
            <td>${t.obtained}</td>
            <td>${t.total}</td>
            <td>${pct}%</td>
            <td><span class="pill pill-sm ${gradeToPillClass(t.grade)}">${t.grade || percentToGrade(pct)}</span></td>
          </tr>`;
      })
      .join("");
  }
})();
