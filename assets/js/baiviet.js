// baiviet.js
// CRUD bài viết (localStorage). Dò id tbody phổ biến trước khi render.

document.addEventListener("DOMContentLoaded", () => {
  ensureAuth();

  const tbodyCandidates = [
    "postTable",
    "postTableBody",
    "baiVietTable",
    "baiVietTableBody",
  ];
  let tbody = null;
  for (const id of tbodyCandidates) {
    const el = document.getElementById(id);
    if (el && el.tagName.toLowerCase() === "tbody") {
      tbody = el;
      break;
    }
    if (el && el.tagName.toLowerCase() === "table") {
      tbody = el.querySelector("tbody");
      if (tbody) break;
    }
  }

  const formCandidates = ["baiVietForm", "postForm"];
  let form = null;
  for (const id of formCandidates) {
    if (document.getElementById(id)) {
      form = document.getElementById(id);
      break;
    }
  }

  const storageKeys = ["succulife_posts", "baiVietList", "posts"];
  const storageKey =
    storageKeys.find((k) => localStorage.getItem(k) !== null) ||
    "succulife_posts";
  let data = JSON.parse(localStorage.getItem(storageKey) || "[]");

  function render() {
    if (!tbody) return;
    data = JSON.parse(localStorage.getItem(storageKey) || "[]");
    tbody.innerHTML = data
      .map(
        (item) => `
      <tr data-id="${item.id}">
        <td>${escapeHtml(item.title)}</td>
        <td>${escapeHtml((item.content || "").slice(0, 200))}</td>
        <td>
          <button class="btn edit" data-id="${item.id}">Sửa</button>
          <button class="btn delete" data-id="${item.id}">Xóa</button>
        </td>
      </tr>
    `
      )
      .join("");
  }

  // initial
  render();

  // delegate
  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.classList.contains("delete")) {
        if (!confirm("Xóa bài viết?")) return;
        data = data.filter((d) => String(d.id) !== String(id));
        localStorage.setItem(storageKey, JSON.stringify(data));
        render();
      } else if (btn.classList.contains("edit")) {
        const rec = data.find((d) => String(d.id) === String(id));
        if (!rec) return;
        // attempt to prefill form inputs if exist
        const titleEl =
          document.getElementById("postTitle") ||
          document.getElementById("tieuDe");
        const contentEl =
          document.getElementById("postContent") ||
          document.getElementById("noiDung");
        const editIdEl =
          document.getElementById("postEditId") ||
          document.getElementById("baiVietEditId");
        if (titleEl) titleEl.value = rec.title;
        if (contentEl) contentEl.value = rec.content;
        if (editIdEl) editIdEl.value = rec.id;
        const panel =
          document.getElementById("postForm") ||
          document.getElementById("baiVietForm");
        if (panel) panel.classList.remove("hidden");
      }
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const titleEl =
        document.getElementById("postTitle") ||
        document.getElementById("tieuDe");
      const contentEl =
        document.getElementById("postContent") ||
        document.getElementById("noiDung");
      const editIdEl =
        document.getElementById("postEditId") ||
        document.getElementById("baiVietEditId");
      const title = titleEl ? titleEl.value.trim() : "";
      const content = contentEl ? contentEl.value.trim() : "";
      if (!title) {
        alert("Nhập tiêu đề");
        return;
      }
      const editId = editIdEl ? editIdEl.value : "";
      if (editId) {
        const idx = data.findIndex((d) => String(d.id) === String(editId));
        if (idx !== -1) {
          data[idx].title = title;
          data[idx].content = content;
        }
      } else {
        const id = Date.now();
        data.push({ id, title, content });
      }
      localStorage.setItem(storageKey, JSON.stringify(data));
      render();
      // hide/reset
      if (form.reset) form.reset();
      if (editIdEl) editIdEl.value = "";
      const panel =
        document.getElementById("postForm") ||
        document.getElementById("baiVietForm");
      if (panel) panel.classList.add("hidden");
    });
  }

  window.renderPosts = render;
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
