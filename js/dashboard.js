/* ===========================================================
   AcademyPro — Dashboard page
   Pulls together a quick summary from the JSON: this month's fee
   status, today's attendance, and the most recent class test /
   test session. Every value is either straight from the JSON or
   an honest "no data yet" state — nothing is guessed.
   =========================================================== */

(function () {
  const student = initLayout({ activeId: "dashboard", pageTitle: "Dashboard", pageIcon: "dashboard" });
  if (!student) return;

  document.getElementById("welcomeName").textContent = `Welcome, ${student.name}`;
  document.getElementById("statMonthlyFee").textContent = `Rs. ${Number(student.fee.monthlyFee).toFixed(2)}`;

  const now = new Date();
  const thisMonthKey = monthKey(now.getFullYear(), now.getMonth());
  const feeThisMonth = student.fee[thisMonthKey];
  // Straight from the JSON — no assumptions. If this month has no fee entry
  // at all, we say so ("No Record") rather than guessing "Unpaid".
  const feeStatus = feeThisMonth ? feeThisMonth.status : "No Record";
  const fc = statusColors(feeStatus);
  document.getElementById("statFeeStatus").innerHTML =
    `<span class="pill pill-block" style="background:${fc.bg};color:${fc.fg};">${feeStatus}</span>`;

  // Today's attendance — only ever what the JSON actually says.
  const attThisMonth = student.attendance[thisMonthKey] || {};
  const todayCode = attThisMonth[todayKey()];
  document.getElementById("statAttendance").textContent = todayCode ? statusLabel(todayCode) : "No Record";

  // Recent class test
  const allTests = flattenClassTests(student.classTests).sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentTest = allTests[0];
  const ctActionBtn = `<button class="btn btn-soft" onclick="window.location.href='classtest.html'">View Detailed Results</button>`;
  if (recentTest) {
    document.getElementById("ctLabel").textContent = recentTest.subject.toUpperCase();
    document.getElementById("ctScore").textContent = recentTest.absent ? "Absent" : `${recentTest.obtained}/${recentTest.total}`;
    const gc = gradeColors(recentTest.grade);
    document.getElementById("ctActions").innerHTML = `
      ${ctActionBtn}
      ${recentTest.grade ? `<span class="pill pill-sm" style="background:${gc.bg};color:${gc.fg};">Grade ${recentTest.grade}</span>` : ""}
    `;
  } else {
    document.getElementById("ctLabel").textContent = "NO TESTS YET";
    document.getElementById("ctScore").textContent = "\u2014";
    document.getElementById("ctActions").innerHTML = ctActionBtn;
  }

  // Recent test session
  const sessionNames = testSessionNames(student.testSessions).sort(
    (a, b) => new Date(student.testSessions[b].date) - new Date(student.testSessions[a].date)
  );
  const recentSessionName = sessionNames[0];
  const tsActionBtn = `<button class="btn btn-soft" onclick="window.location.href='testsession.html'">View Detailed Results</button>`;
  if (recentSessionName) {
    const session = student.testSessions[recentSessionName];
    const totals = session.subjects.reduce(
      (acc, row) => {
        acc.obtained += Number(row[1]) || 0;
        acc.total += Number(row[2]) || 0;
        return acc;
      },
      { obtained: 0, total: 0 }
    );
    const topSubject = session.subjects[0];
    document.getElementById("tsLabel").textContent = `${recentSessionName.toUpperCase()} \u2022 ${topSubject[0].toUpperCase()}`;
    document.getElementById("tsScore").textContent = `${totals.obtained}/${totals.total}`;
    const overallGrade = percentToGrade((totals.obtained / totals.total) * 100);
    const gc = gradeColors(overallGrade);
    document.getElementById("tsActions").innerHTML = `
      ${tsActionBtn}
      <span class="pill pill-sm" style="background:${gc.bg};color:${gc.fg};">Grade ${overallGrade}</span>
    `;
  } else {
    document.getElementById("tsLabel").textContent = "NO SESSIONS YET";
    document.getElementById("tsScore").textContent = "\u2014";
    document.getElementById("tsActions").innerHTML = tsActionBtn;
  }
})();
