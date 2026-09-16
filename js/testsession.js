/* ===========================================================
   AcademyPro — Test Sessions page
   Reads student.testSessions from the JSON (an object keyed by
   session name, or an empty array when there are none). Overall
   totals/percentage/grade are computed from the session's own
   subject rows — the per-row grade is whatever the JSON provides.
   =========================================================== */

(function () {
  const student = initLayout({ activeId: "testsession", pageTitle: "Test Sessions", pageIcon: "description" });
  if (!student) return;

  const names = testSessionNames(student.testSessions);
  const filter = document.getElementById("sessionFilter");

  if (names.length === 0) {
    document.getElementById("statGrid").style.display = "none";
    document.getElementById("tableSection").style.display = "none";
    document.getElementById("emptyState").style.display = "block";
    return;
  }

  filter.innerHTML = names.map((n) => `<option value="${n}">${n}</option>`).join("");
  filter.addEventListener("change", () => renderSession(filter.value));
  renderSession(names[0]);

  function renderSession(name) {
    const session = student.testSessions[name];
    const rows = session.subjects;

    const totals = rows.reduce(
      (acc, r) => {
        acc.obtained += Number(r[1]) || 0;
        acc.total += Number(r[2]) || 0;
        return acc;
      },
      { obtained: 0, total: 0 }
    );
    const pct = totals.total ? Math.round((totals.obtained / totals.total) * 100) : 0;
    const overallGrade = percentToGrade(pct);

    document.getElementById("statObtained").textContent = totals.obtained;
    document.getElementById("statTotal").textContent = totals.total;
    document.getElementById("statGrade").textContent = overallGrade;
    document.getElementById("statPercentage").textContent = `${pct}%`;
    document.getElementById("statDate").textContent = formatDMY(session.date);

    document.getElementById("sessionBody").innerHTML = rows
      .map((r) => {
        const [subject, obtained, total, grade] = r;
        const rowPct = total ? Math.round((obtained / total) * 100) : 0;
        const g = grade || percentToGrade(rowPct);
        const gc = gradeColors(g);
        return `
          <tr>
            <td>${subject}</td>
            <td>${obtained}</td>
            <td>${total}</td>
            <td>${rowPct}%</td>
            <td><span class="pill pill-sm" style="background:${gc.bg};color:${gc.fg};">${g}</span></td>
          </tr>`;
      })
      .join("");
  }
})();
