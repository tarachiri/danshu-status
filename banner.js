(function () {
  const NOTICE_URL =
    "https://tarachiri.github.io/danshu-status/notice.json";
  const STORAGE_KEY = "danshu_dismissed_notices";

  function getDismissed() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function dismiss(id) {
    const list = getDismissed();
    if (!list.includes(id)) list.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function createBanner(notice) {
    const colors = {
      info:     { bg: "#1a73e8", text: "#fff" },
      warning:  { bg: "#f59e0b", text: "#000" },
      critical: { bg: "#dc2626", text: "#fff" },
    };
    const c = colors[notice.level] || colors.info;

    const bar = document.createElement("div");
    bar.id = "danshu-banner-" + notice.id;
    bar.style.cssText = [
      "position:fixed",
      "bottom:56px",
      "left:0",
      "right:0",
      "z-index:9999",
      "display:flex",
      "align-items:center",
      "justify-content:space-between",
      "padding:8px 16px",
      "font-size:13px",
      "font-family:sans-serif",
      "background:" + c.bg,
      "color:" + c.text,
    ].join(";");

    const msg = document.createElement("span");
    msg.textContent = notice.message;

    const btn = document.createElement("button");
    btn.textContent = "×";
    btn.style.cssText = [
      "background:none",
      "border:none",
      "color:" + c.text,
      "font-size:18px",
      "cursor:pointer",
      "padding:0 4px",
      "line-height:1",
    ].join(";");
    btn.onclick = function () {
      if (notice.level !== "critical") dismiss(notice.id);
      bar.remove();
    };

    bar.appendChild(msg);
    bar.appendChild(btn);
    document.body.appendChild(bar);
  }

  fetch(NOTICE_URL + "?t=" + Date.now())
    .then(function (r) { return r.json(); })
    .then(function (data) {
      const dismissed = getDismissed();
      const now = new Date();
      (data.notices || []).forEach(function (n) {
        if (!n.active) return;
        if (n.expires && new Date(n.expires) < now) return;
        if (n.level !== "critical" && dismissed.includes(n.id)) return;
        createBanner(n);
      });
    })
    .catch(function () {});
})();
