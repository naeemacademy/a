(function () {
  const student = initLayout({ activeId: "profile", pageTitle: "Profile", pageIcon: "&#128100;" });
  if (!student) return;

  document.getElementById("pAvatar").textContent = initials(student.name);
  document.getElementById("pName").textContent = student.name;
  document.getElementById("pStudentId").textContent = studentDisplayId(student);
  document.getElementById("pClass").textContent = student.class;
  document.getElementById("pGroup").textContent = student.group;
  document.getElementById("pFee").textContent = `Rs. ${Number(student.fee.monthlyFee).toFixed(2)}`;
})();
