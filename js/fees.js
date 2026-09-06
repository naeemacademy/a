(function () {
  const student = initLayout({ activeId: "fees", pageTitle: "Fees", pageIcon: "&#128179;" });
  if (!student) return;

  document.getElementById("headAvatar").textContent = initials(student.name);
  document.getElementById("headName").textContent = student.name;
  document.getElementById("headId").textContent = `Student ID: ${studentDisplayId(student)}`;

  const now = new Date();
  const thisMonthKey = monthKey(now.getFullYear(), now.getMonth());
  const feeThisMonth = student.fee[thisMonthKey];
  const status = feeThisMonth ? feeThisMonth.status : "Unpaid";

  document.getElementById("headStatus").innerHTML = `<span class="pill ${statusPillClass(status)}">${status.toUpperCase()}</span>`;
  document.getElementById("monthlyFee").textContent = `Rs. ${Number(student.fee.monthlyFee).toFixed(2)}`;
  document.getElementById("feeStatus").innerHTML = `<span class="pill ${statusPillClass(status)}">${status}</span>`;
  document.getElementById("remainingFee").textContent =
    status === "Paid" ? "Rs. 0.00" : `Rs. ${Number(student.fee.monthlyFee).toFixed(2)}`;
  document.getElementById("currentMonth").textContent = thisMonthKey.replace("-", " ");
  document.getElementById("paidDate").textContent = feeThisMonth && feeThisMonth.paidDate
    ? feeThisMonth.paidDate
    : "Not paid yet";

  const historyKeys = Object.keys(student.fee).filter((k) => k !== "monthlyFee");
  historyKeys.sort((a, b) => {
    const pa = parseMonthKey(a), pb = parseMonthKey(b);
    return pb.year - pa.year || pb.monthIndex - pa.monthIndex;
  });

  const tbody = document.getElementById("feeHistoryBody");
  if (historyKeys.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3"><div class="empty-state">No fee history recorded yet.</div></td></tr>`;
  } else {
    tbody.innerHTML = historyKeys
      .map((key) => {
        const entry = student.fee[key];
        return `
          <tr>
            <td>${key.replace("-", " ")}</td>
            <td><span class="pill pill-sm ${statusPillClass(entry.status)}">${entry.status.toUpperCase()}</span></td>
            <td>${entry.paidDate || "-"}</td>
          </tr>`;
      })
      .join("");
  }
})();
