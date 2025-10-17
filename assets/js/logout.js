/**
 * logout.js
 * - Bắt tất cả nút đăng xuất trên trang admin
 * - Xóa các khóa sessionStorage/localStorage liên quan
 * - Redirect về trang đăng nhập (index.html / login.html / admin/index.html)
 *
 * Cách dùng:
 * <script src="assets/js/logout.js"></script>
 * đặt file này ở cuối body trong mọi trang admin
 */

(function () {
  // Khoá liên quan đến admin bạn có thể mở rộng nếu cần
  const ADMIN_SESSION_KEYS = [
    "succulife_admin",
    "succulife_admin_user",
    // nếu bạn dùng các khóa khác để lưu trạng thái admin, thêm vào đây
    // 'auth_token', 'admin_session_id', ...
  ];

  // Các localStorage keys demo (xóa nếu bạn muốn khi logout)
  const OPTIONAL_LOCAL_KEYS = [
    // 'succulife_sen', 'succulife_posts', 'succulife_contacts'
    // Lưu ý: thường không xóa dữ liệu app trên localStorage khi logout,
    // nhưng để an toàn nếu bạn muốn xóa theo yêu cầu, thêm keys vào đây.
  ];

  // Tên file login mặc định (thử hàng loạt đường dẫn thông dụng)
  const LOGIN_PAGES = [
    "index.html",
    "login.html",
    "admin/index.html",
    "admin/login.html",
    "/admin/index.html",
    "/index.html",
  ];

  // Xử lý logout: clear storage keys + redirect
  function doLogout(redirectToLogin = true) {
    // Xóa sessionStorage keys
    ADMIN_SESSION_KEYS.forEach((k) => sessionStorage.removeItem(k));

    // Xóa optional localStorage keys (không bật theo mặc định)
    OPTIONAL_LOCAL_KEYS.forEach((k) => localStorage.removeItem(k));

    // Optionally clear all sessionStorage (uncomment nếu muốn)
    // sessionStorage.clear();

    if (redirectToLogin) {
      // chọn login page hợp lý: nếu đang ở folder admin, ưu tiên admin/index.html
      const currentPath = location.pathname.split("/").pop();
      // Nếu current is one of login pages, stay; else try to redirect
      // First prefer admin/index.html if exists on server
      const preferred =
        LOGIN_PAGES.find((p) => {
          // avoid redirecting to same page which may cause loop
          return p !== currentPath && p !== "";
        }) || "index.html";

      // redirect - use relative path (this works in most static setups)
      location.href = preferred;
    }
  }

  // Gắn listener cho các selector phổ biến
  function attachLogoutHandlers() {
    const selectors = [
      "#logoutBtn", // id used in some templates
      "#sidebar-logout",
      "#top-logout",
      "[data-logout]", // any element with data-logout attribute
      ".btn.logout", // any element with .logout button class
      ".nav-logout", // flexible selector
    ];

    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        // avoid binding twice
        if (el.__logoutBound) return;
        el.addEventListener("click", (e) => {
          e.preventDefault();
          // Optional: confirm
          const doConfirm = el.getAttribute("data-logout-confirm") !== "false";
          if (doConfirm) {
            const ok = confirm("Bạn có chắc muốn đăng xuất?");
            if (!ok) return;
          }
          doLogout(true);
        });
        el.__logoutBound = true;
      });
    });

    // Fallback: nếu không tìm thấy nút logout, nhưng muốn expose API:
    // window.logoutSuccuLife() sẽ gọi logout.
    window.logoutSuccuLife = () => doLogout(true);
  }

  // Khi DOM sẵn sàng, attach handlers
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachLogoutHandlers);
  } else {
    attachLogoutHandlers();
  }

  // Extra safeguard: nếu session hết hạn hay không có succulife_admin, redirect về login
  // (kích hoạt nếu bạn muốn tự động quay về login khi truy cập trang admin mà chưa đăng nhập)
  (function guardAuth() {
    const onAdminPage = () => {
      // check path contains admin or known admin html
      const path = location.pathname.toLowerCase();
      return (
        path.includes("/admin") ||
        /dashboard|senda|baiviet|lienhe|index\.html$/.test(path)
      );
    };

    if (onAdminPage()) {
      // nếu đang ở trang admin và không có session -> redirect
      if (sessionStorage.getItem("succulife_admin") !== "true") {
        // do not redirect if already on login page
        const current = location.pathname.split("/").pop().toLowerCase();
        if (
          ![
            "index.html",
            "login.html",
            "admin/index.html",
            "admin/login.html",
          ].includes(current)
        ) {
          // short delay to allow script includes to load
          setTimeout(() => doLogout(true), 200);
        }
      }
    }
  })();
})();
logoutBtn.addEventListener("click", () => {
  logoutPopup.style.display = "flex";
});
