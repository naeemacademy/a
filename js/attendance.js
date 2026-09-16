/* ===========================================================
   AcademyPro — Attendance page
   Every status shown here comes directly from student.attendance
   in the JSON. We never invent a status (e.g. auto-marking
   weekends as "Holiday") — a day with no entry is "No Record",
   full stop. Month navigation is also limited to months that
   actually exist in the JSON, so you can never browse into an
   empty month that was never recorded.
   =========================================================== */

(function () {
  const student = initLayout({ activeId: "attendance", pageTitle: "Attendance", pageIcon: "fact_check" });
  if (!student) return;

  document.getElementById("headName").textContent = student.name;
  document.getElementById("headId").textContent = `Student ID: ${studentDisplayId(student)}`;

  // Sorted list of {year, monthIndex} for every month this student actually
  // has an attendance record for. Navigation never goes beyond this list.
  const recordedMonths = Object.keys(student.attendance || {})
    .map(parseMonthKey)
    .sort((a, b) => a.year - b.year || a.monthIndex - b.monthIndex);

  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");

  const now = new Date();
  let currentIndex = recordedMonths.findIndex(
    (m) => m.year === now.getFullYear() && m.monthIndex === now.getMonth()
  );
  if (currentIndex === -1) currentIndex = recordedMonths.length - 1;

  renderTodayStatus();
  renderCalendar();

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderCalendar();
    }
  });
  nextBtn.addEventListener("click", () => {
    if (currentIndex < recordedMonths.length - 1) {
      currentIndex++;
      renderCalendar();
    }
  });

  /** Today's attendance pill in the header — strictly from the JSON, no guessing. */
  function renderTodayStatus() {
    const realMonthKey = monthKey(now.getFullYear(), now.getMonth());
    const realDayCode = (student.attendance[realMonthKey] || {})[String(now.getDate()).padStart(2, "0")];
    const label = realDayCode ? statusLabel(realDayCode) : "No Record";
    const c = realDayCode ? statusColors(label) : { bg: "var(--status-grey-bg)", fg: "var(--status-grey-fg)" };
    const icon = realDayCode ? statusIcon(label) : "help";

    document.getElementById("headStatus").innerHTML = `
      <span class="pill" style="background:${c.bg};color:${c.fg};">
        <span class="material-symbols-outlined" style="font-size:16px;">${icon}</span>
        ${label}
      </span>`;
  }

  function renderCalendar() {
    const grid = document.getElementById("calGrid");
    const dowLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const dowHtml = dowLabels.map((d) => `<div class="cal-dow">${d}</div>`).join("");

    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= recordedMonths.length - 1;

    if (currentIndex === -1) {
      document.getElementById("monthLabel").textContent = "NO DATA";
      grid.innerHTML = dowHtml + `<div class="cal-empty-row">No attendance records yet.</div>`;
      document.getElementById("countPresent").textContent = 0;
      document.getElementById("countAbsent").textContent = 0;
      document.getElementById("countLeave").textContent = 0;
      return;
    }

    const { year, monthIndex } = recordedMonths[currentIndex];
    const monthData = student.attendance[monthKey(year, monthIndex)] || {};
    document.getElementById("monthLabel").textContent = `${MONTH_NAMES[monthIndex].toUpperCase()} ${year}`;

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDow = (new Date(year, monthIndex, 1).getDay() + 6) % 7;

    let html = dowHtml;
    for (let i = 0; i < firstDow; i++) html += `<div class="cal-day blank"></div>`;

    let present = 0, absent = 0, leave = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = String(day).padStart(2, "0");
      const code = monthData[dayKey];
      const cls = code ? ({ P: "present", A: "absent", L: "leave", H: "holiday" }[code] || "none") : "none";

      if (code === "P") present++;
      if (code === "A") absent++;
      if (code === "L") leave++;

      html += `<div class="cal-day ${cls}" title="${statusLabel(code)}">${day}</div>`;
    }

    grid.innerHTML = html;
    document.getElementById("countPresent").textContent = present;
    document.getElementById("countAbsent").textContent = absent;
    document.getElementById("countLeave").textContent = leave;
  }
})();
