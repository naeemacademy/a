(function () {
  const student = initLayout({ activeId: "dashboard", pageTitle: "Dashboard", pageIcon: "&#9635;" });
  if (!student) return;

  document.getElementById("welcomeName").textContent = `Welcome, ${student.name}`;

  // Monthly fee + this month's status
  document.getElementById("statMonthlyFee").textContent = `Rs. ${Number(student.fee.monthlyFee).toFixed(2)}`;

  const now = new Date();
  const thisMonthKey = monthKey(now.getFullYear(), now.getMonth());
  const feeThisMonth = student.fee[thisMonthKey];
  const feeStatus = feeThisMonth ? feeThisMonth.status : "Unpaid";
  document.getElementById("statFeeStatus").innerHTML =
    `<span class="pill ${statusPillClass(feeStatus)}">${feeStatus}</span>`;

  // Today's attendance
  const attThisMonth = student.attendance[thisMonthKey] || {};
  const todayCode = attThisMonth[todayKey()];
  const isWeekendToday = now.getDay() === 0 || now.getDay() === 6;
  document.getElementById("statAttendance").textContent = todayCode
    ? statusLabel(todayCode)
    : (isWeekendToday ? "Holiday" : "No Record");

  // Recent class test (most recent by date, across all subjects)
  const allTests = flattenClassTests(student.classTests).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const recentTest = allTests[0];
  if (recentTest) {
    document.getElementById("ctSubject").textContent = "RECENT CLASS TEST";
    document.getElementById("ctLabel").textContent = recentTest.subject.toUpperCase();
    document.getElementById("ctScore").textContent = recentTest.absent
      ? "Absent"
      : `${recentTest.obtained}/${recentTest.total}`;
    document.getElementById("ctActions").innerHTML = `
      <a class="action-pill" href="classtest.html">View Detailed Results</a>
      ${
        recentTest.grade
          ? `<span class="pill pill-sm ${gradeToPillClass(recentTest.grade)}">Grade ${recentTest.grade}</span>`
          : ""
      }
    `;
  } else {
    document.getElementById("ctLabel").textContent = "NO TESTS YET";
    document.getElementById("ctScore").textContent = "&mdash;";
    document.getElementById("ctActions").innerHTML = `<a class="action-pill" href="classtest.html">View Class Tests</a>`;
  }

  // Recent test session (most recent by date)
  const sessionNames = testSessionNames(student.testSessions).sort(
    (a, b) => new Date(student.testSessions[b].date) - new Date(student.testSessions[a].date)
  );
  const recentSessionName = sessionNames[0];
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
    document.getElementById("tsActions").innerHTML = `
      <a class="action-pill" href="testsession.html">View Detailed Results</a>
      <span class="pill pill-sm ${gradeToPillClass(overallGrade)}">Grade ${overallGrade}</span>
    `;
  } else {
    document.getElementById("tsLabel").textContent = "NO SESSIONS YET";
    document.getElementById("tsScore").textContent = "&mdash;";
    document.getElementById("tsActions").innerHTML = `<a class="action-pill" href="testsession.html">View Test Sessions</a>`;
  }
})();
