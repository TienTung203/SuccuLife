// contact.js
// Render và xóa các phản hồi lưu trong localStorage

document.addEventListener("DOMContentLoaded", () => {
  ensureAuth();

  const tbodyCandidates = [
    "contactTable",
    "contactTableBody",
    "contactTable tbody",
    "contactTableBody",
  ];
  let tbody = null;
  for (const id of [
    "contactTableBody",
    "contactTable",
    "contactTableBody",
    "contactsTable",
  ]) {
    const el = document.getElementById(id);
    if (el && el.tagName && el.tagName.toLowerCase() === "tbody") {
      tbody = el;
      break;
    }
    if (el && el.tagName && el.tagName.toLowerCase() === "table") {
      tbody = el.querySelector("tbody");
      if (tbody) break;
    }
  }

  const storageKeys = ["succulife_contacts", "lienHeList", "contactList"];
  const storageKey =
    storageKeys.find((k) => localStorage.getItem(k) !== null) ||
    "succulife_contacts";
  let data = JSON.parse(localStorage.getItem(storageKey) || "[]");

  function render() {
    if (!tbody) return;
    data = JSON.parse(localStorage.getItem(storageKey) || "[]");
    tbody.innerHTML = data
      .map(
        (item) => `
      <tr data-id="${item.id}">
        <td>${escapeHtml(item.name || "")}</td>
        <td>${escapeHtml(item.email || "")}</td>
        <td>${escapeHtml(item.message || item.msg || "")}</td>
        <td>
          <button class="btn delete" data-id="${item.id}">Xóa</button>
        </td>
      </tr>
    `
      )
      .join("");
  }

  render();

  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      if (btn.classList.contains("delete")) {
        const id = btn.dataset.id;
        if (!confirm("Xóa phản hồi này?")) return;
        data = data.filter((d) => String(d.id) !== String(id));
        localStorage.setItem(storageKey, JSON.stringify(data));
        render();
      }
    });
  }
});

function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}

function ensureAuth() {
  if (sessionStorage.getItem("succulife_admin") !== "true") {
    window.location.href = "index.html";
  }
}
