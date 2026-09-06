(function () {
  const student = initLayout({ activeId: "attendance", pageTitle: "Attendance", pageIcon: "&#128197;" });
  if (!student) return;

  document.getElementById("headAvatar").textContent = initials(student.name);
  document.getElementById("headName").textContent = student.name;
  document.getElementById("headId").textContent = `Student ID: ${studentDisplayId(student)}`;

  const now = new Date();
  let viewYear = now.getFullYear();
  let viewMonth = now.getMonth();

  // If there's no attendance data at all for the current month, jump to the
  // most recent month that actually has records, so the page isn't empty.
  const recordedKeys = Object.keys(student.attendance || {});
  if (recordedKeys.length && !student.attendance[monthKey(viewYear, viewMonth)]) {
    const parsed = recordedKeys.map(parseMonthKey).sort((a, b) => b.year - a.year || b.monthIndex - a.monthIndex);
    viewYear = parsed[0].year;
    viewMonth = parsed[0].monthIndex;
  }

  // Today's attendance (always the real, actual today â€” independent of the calendar view)
  const realMonthKey = monthKey(now.getFullYear(), now.getMonth());
  const realDayCode = (student.attendance[realMonthKey] || {})[String(now.getDate()).padStart(2, "0")];
  const realDow = now.getDay(); // 0 = Sun, 6 = Sat
  const isWeekend = realDow === 0 || realDow === 6;
  const todayLabel = realDayCode ? statusLabel(realDayCode) : (isWeekend ? "Holiday" : "No Record");
  const todayCodeForPill = realDayCode || (isWeekend ? "H" : "");
  document.getElementById("headStatus").innerHTML =
    `<span class="pill ${statusPillClass(todayCodeForPill)}">${todayLabel.toUpperCase()}</span>`;

  document.getElementById("prevMonth").addEventListener("click", () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  document.getElementById("nextMonth").addEventListener("click", () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  renderCalendar();

  function renderCalendar() {
    const key = monthKey(viewYear, viewMonth);
    const monthData = student.attendance[key] || {};
    document.getElementById("monthLabel").textContent = `${MONTH_NAMES[viewMonth].toUpperCase()} ${viewYear}`;

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // 0 = Monday

    const grid = document.getElementById("calGrid");
    const dowLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    let html = dowLabels.map((d) => `<div class="cal-dow">${d}</div>`).join("");

    for (let i = 0; i < firstDow; i++) {
      html += `<div class="cal-day blank"></div>`;
    }

    let present = 0, absent = 0, leave = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = String(day).padStart(2, "0");
      const dow = (firstDow + (day - 1)) % 7; // 5 = Sat, 6 = Sun
      const code = monthData[dayKey];
      let cls, label;

      if (code) {
        cls = { P: "present", A: "absent", L: "leave", H: "holiday" }[code] || "none";
        label = code;
        if (code === "P") present++;
        if (code === "A") absent++;
        if (code === "L") leave++;
      } else if (dow === 5 || dow === 6) {
        cls = "holiday";
        label = day;
      } else {
        cls = "none";
        label = day;
      }

      html += `<div class="cal-day ${cls}" title="${statusLabel(code)}">${day}</div>`;
    }

    grid.innerHTML = html;
    document.getElementById("countPresent").textContent = present;
    document.getElementById("countAbsent").textContent = absent;
    document.getElementById("countLeave").textContent = leave;
  }
})();
