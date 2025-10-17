// senda.js
// CRUD loại sen đá dùng localStorage. Renders vào table tbody được dò tự động.
// Hỗ trợ: table tbody id có thể là 'senTable' / 'senTableBody' / 'plantTable' / 'plantTableBody'

document.addEventListener("DOMContentLoaded", () => {
  ensureAuth();

  // tìm tbody table sen đá (nhiều tên id có thể có trong các HTML khác nhau)
  const tbodyCandidates = [
    "senTable",
    "senTableBody",
    "plantTable",
    "plantTableBody",
  ];
  let tbody = null;
  for (const id of tbodyCandidates) {
    const el = document.getElementById(id);
    if (el && el.tagName.toLowerCase() === "tbody") {
      tbody = el;
      break;
    }
    // nếu người dùng đặt id trên table, lấy tbody bên trong
    if (el && el.tagName.toLowerCase() === "table") {
      tbody = el.querySelector("tbody");
      if (tbody) break;
    }
  }

  // form elements (dò nhiều id/selector)
  const formSelectors = [
    {
      name: "sendaForm",
      fields: { name: "tenSenda", desc: "moTa", img: "anhSenda" },
    },
    {
      name: "plantForm",
      fields: { name: "plantName", desc: "plantDesc", img: "plantImg" },
    },
  ];

  // chọn form có tồn tại
  let form = null,
    fields = null;
  for (const s of formSelectors) {
    const f = document.getElementById(s.name);
    if (f) {
      form = f;
      fields = s.fields;
      break;
    }
  }
  // nếu không có form id, dò các input theo id fields có thể tồn tại
  if (!form) {
    const nameExists =
      document.getElementById("tenSenda") ||
      document.getElementById("plantName");
    if (nameExists) {
      // fake form wrapper
      form = {
        addEventListener: (ev, fn) => {
          /* no-op if not actual form */
        },
      };
      fields = {
        name: "tenSenda" in document ? "tenSenda" : "plantName",
        desc: "moTa" in document ? "moTa" : "plantDesc",
        img: "anhSenda" in document ? "anhSenda" : "plantImg",
      };
    }
  }

  // data key variants
  const storageKeys = ["succulife_sen", "sendaList", "succulife_senda"];
  const storageKey =
    storageKeys.find((k) => localStorage.getItem(k) !== null) ||
    "succulife_sen";

  let data = JSON.parse(localStorage.getItem(storageKey) || "[]");

  // render function
  function render() {
    if (!tbody) return;
    data = JSON.parse(localStorage.getItem(storageKey) || "[]");
    tbody.innerHTML = data
      .map((item) => {
        // image rendering: stored as dataUrl or relative path
        const img = item.img
          ? `<img src="${item.img}" alt="${escapeHtml(
              item.name
            )}" style="height:48px;border-radius:6px">`
          : "";
        return `<tr data-id="${item.id}">
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.desc || item.description || "")}</td>
        <td>${img}</td>
        <td>
          <button class="btn edit" data-id="${item.id}">Sửa</button>
          <button class="btn delete" data-id="${item.id}">Xóa</button>
        </td>
      </tr>`;
      })
      .join("");
  }

  // initial render
  render();

  // delegate clicks on tbody for edit/delete
  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.classList.contains("delete")) {
        if (!confirm("Xóa mục này?")) return;
        data = data.filter((d) => String(d.id) !== String(id));
        localStorage.setItem(storageKey, JSON.stringify(data));
        render();
      } else if (btn.classList.contains("edit")) {
        // find item and prefill form if any form inputs available
        const item = data.find((d) => String(d.id) === String(id));
        if (!item) return;
        const nameEl = document.getElementById(fields?.name);
        const descEl = document.getElementById(fields?.desc);
        const idHolder =
          document.getElementById("senEditId") ||
          document.getElementById("plantEditId");
        if (nameEl) nameEl.value = item.name || item.ten || "";
        if (descEl) descEl.value = item.desc || item.description || "";
        if (idHolder) idHolder.value = item.id;
        // show form panel if exists
        const panel =
          document.getElementById("sendaForm") ||
          document.getElementById("plantForm");
        if (panel) panel.classList.remove("hidden");
      }
    });
  }

  // handle form submit if real form present
  if (form && typeof form.addEventListener === "function") {
    form.addEventListener("submit", (e) => {
      e.preventDefault && e.preventDefault();
      // collect values from fields
      const nameEl = document.getElementById(fields.name);
      const descEl = document.getElementById(fields.desc);
      const imgEl = document.getElementById(fields.img);
      const editIdEl =
        document.getElementById("senEditId") ||
        document.getElementById("plantEditId");

      const name = nameEl ? nameEl.value.trim() : "";
      const desc = descEl ? descEl.value.trim() : "";
      if (!name) {
        alert("Vui lòng nhập tên");
        return;
      }

      const doSave = (imgData) => {
        const editId = editIdEl ? editIdEl.value : "";
        if (editId) {
          const idx = data.findIndex((d) => String(d.id) === String(editId));
          if (idx !== -1) {
            data[idx].name = name;
            data[idx].desc = desc;
            if (imgData) data[idx].img = imgData;
          }
        } else {
          const id = Date.now();
          data.push({ id, name, desc, img: imgData || "" });
        }
        localStorage.setItem(storageKey, JSON.stringify(data));
        // reset form if exist
        if (nameEl) nameEl.value = "";
        if (descEl) descEl.value = "";
        if (imgEl) imgEl.value = "";
        if (editIdEl) editIdEl.value = "";
        const panel =
          document.getElementById("sendaForm") ||
          document.getElementById("plantForm");
        if (panel) panel.classList.add("hidden");
        render();
      };

      // handle optional image upload: read as dataURL
      if (imgEl && imgEl.files && imgEl.files[0]) {
        const reader = new FileReader();
        reader.onload = () => doSave(reader.result);
        reader.readAsDataURL(imgEl.files[0]);
      } else {
        doSave(null);
      }
    });
  }

  // expose render to window for manual call if needed
  window.renderSenda = render;
});

// helper
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(
    /[&<>"']/g,
    (s) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        s
      ])
  );
}

function ensureAuth() {
  if (sessionStorage.getItem("succulife_admin") !== "true") {
    window.location.href = "index.html";
  }
}
