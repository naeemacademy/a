/* ===========================================================
   AcademyPro — Fees page
   Every figure here comes straight from student.fee in the JSON.
   If the current month has no entry at all, we show "No Record"
   rather than assuming "Unpaid" — we only ever display what the
   data actually says.
   =========================================================== */

(function () {
  const student = initLayout({ activeId: "fees", pageTitle: "Fees", pageIcon: "payments" });
  if (!student) return;

  document.getElementById("headName").textContent = student.name;
  document.getElementById("headId").textContent = `Student ID: ${studentDisplayId(student)}`;

  const now = new Date();
  const thisMonthKey = monthKey(now.getFullYear(), now.getMonth());
  const feeThisMonth = student.fee[thisMonthKey];
  const status = feeThisMonth ? feeThisMonth.status : "No Record";
  const c = statusColors(status);

  document.getElementById("headStatus").innerHTML = `
    <span class="pill" style="background:${c.bg};color:${c.fg};">
      <span class="material-symbols-outlined" style="font-size:16px;">${statusIcon(status)}</span>
      ${status}
    </span>`;

  document.getElementById("monthlyFee").textContent = `Rs. ${Number(student.fee.monthlyFee).toFixed(2)}`;
  document.getElementById("feeStatus").innerHTML =
    `<span class="pill pill-block" style="background:${c.bg};color:${c.fg};">${status}</span>`;

  // Remaining fee is only meaningful once we actually know the status —
  // with no record at all, we can't honestly say what's owed either way.
  document.getElementById("remainingFee").textContent =
    status === "Paid" ? "Rs. 0.00" : status === "No Record" ? "\u2014" : `Rs. ${Number(student.fee.monthlyFee).toFixed(2)}`;

  document.getElementById("currentMonth").textContent = thisMonthKey.replace("-", " ");
  document.getElementById("paidDate").textContent = feeThisMonth && feeThisMonth.paidDate ? feeThisMonth.paidDate : "Not paid yet";

  // Fee History only ever lists months that actually exist in the JSON.
  const historyKeys = Object.keys(student.fee).filter((k) => k !== "monthlyFee");
  historyKeys.sort((a, b) => {
    const pa = parseMonthKey(a), pb = parseMonthKey(b);
    return pb.year - pa.year || pb.monthIndex - pa.monthIndex;
  });

  const tbody = document.getElementById("feeHistoryBody");
  if (historyKeys.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="empty-state">No fee history recorded yet.</td></tr>`;
  } else {
    tbody.innerHTML = historyKeys
      .map((key) => {
        const entry = student.fee[key];
        const ec = statusColors(entry.status);
        return `
          <tr>
            <td>${key.replace("-", " ")}</td>
            <td><span class="pill pill-sm" style="background:${ec.bg};color:${ec.fg};">${entry.status}</span></td>
            <td>${entry.paidDate || "-"}</td>
          </tr>`;
      })
      .join("");
  }
})();
