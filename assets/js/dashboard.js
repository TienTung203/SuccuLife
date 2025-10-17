// dashboard.js
// Hiển thị thống kê (tìm id theo nhiều biến thể để tương thích)

document.addEventListener("DOMContentLoaded", () => {
  ensureAuth();

  // Lấy dữ liệu từ localStorage (dùng các key đã dùng trong project)
  const sendaList = JSON.parse(
    localStorage.getItem("succulife_sen") ||
      localStorage.getItem("sendaList") ||
      "[]"
  );
  const baiVietList = JSON.parse(
    localStorage.getItem("succulife_posts") ||
      localStorage.getItem("baiVietList") ||
      "[]"
  );
  const lienHeList = JSON.parse(
    localStorage.getItem("succulife_contacts") ||
      localStorage.getItem("lienHeList") ||
      "[]"
  );

  // Nhiều id khác nhau từng phiên bản: cập nhật tất cả id phù hợp
  const mappings = [
    {
      ids: ["stat-sen", "sendaCount", "plantCount", "count-sen"],
      value: sendaList.length,
    },
    {
      ids: ["stat-post", "baiVietCount", "postCount", "count-posts"],
      value: baiVietList.length,
    },
    {
      ids: ["stat-contact", "contactCount", "contactCount", "count-contacts"],
      value: lienHeList.length,
    },
  ];

  mappings.forEach((map) => {
    map.ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = map.value;
    });
  });
});

function ensureAuth() {
  if (sessionStorage.getItem("succulife_admin") !== "true") {
    // giả sử login nằm ở cùng thư mục: index.html hoặc login.html
    const fallback = [
      "index.html",
      "login.html",
      "admin/login.html",
      "/admin/index.html",
    ];
    window.location.href = fallback[0];
  }
}
