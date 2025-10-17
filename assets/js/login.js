// admin-login.js
// Xử lý đăng nhập admin (demo) — lưu sessionStorage => dashboard

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMessage");

  // nếu đã đăng nhập rồi -> chuyển đến dashboard (cố gắng các đường dẫn hay dùng)
  if (sessionStorage.getItem("succulife_admin") === "true") {
    // thử các tên file dashboard phổ biến
    const tryPaths = [
      "dashboard.html",
      "admin/dashboard.html",
      "./dashboard.html",
    ];
    tryPaths.forEach((p) => {
      // nếu current not dashboard, navigate; but avoid reload loop if already on dashboard
      if (
        !location.href.endsWith("/" + p) &&
        document.location.pathname.indexOf(p) === -1
      ) {
        // do nothing here; only redirect explicitly from submit
      }
    });
  }

  if (!form) return; // nothing to do if no login form on page

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = (document.getElementById("username") || {}).value?.trim() || "";
    const p = (document.getElementById("password") || {}).value || "";

    // demo accounts (you can extend)
    const accounts = [{ username: "admin", password: "88886666" }];

    const found = accounts.find((a) => a.username === u && a.password === p);
    if (found) {
      sessionStorage.setItem("succulife_admin", "true");
      sessionStorage.setItem("succulife_admin_user", u);
      // redirect to dashboard (try common locations)
      const dashPaths = [
        "dashboard.html",
        "admin/dashboard.html",
        "./dashboard.html",
        "/admin/dashboard.html",
      ];
      // pick first that doesn't 404 in most setups — assume same folder: dashboard.html
      location.href = dashPaths[0];
    } else {
      if (msg) {
        msg.textContent = "Tài khoản hoặc mật khẩu không đúng.";
        msg.style.color = "#d64545";
      } else {
        alert("Tài khoản hoặc mật khẩu không đúng.");
      }
    }
  });
});
