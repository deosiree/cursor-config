/**
 * 在已登录 user0601v2 的浏览器会话中执行：创建 3 邮箱激活 + 3 密码直设用户。
 * 用法：opencli browser user0601 eval "$(Get-Content -Raw 'path/to/this/file')"
 */
(async function createSeedUsers() {
  const API = "/dev-api/forward/seccenter/v2";
  const AUTH_API = "/dev-api/direct/seccenter/v2";
  const PLAIN_PWD = "Test@123456";
  const runId = String(Date.now());
  function uniquePhone(seq) {
    var tail = String(Date.now() % 100000000) + String(seq);
    return ("139" + tail).slice(0, 11);
  }

  async function apiPost(path, body) {
    const res = await fetch(API + path, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error("HTTP " + res.status + " " + path + ": " + JSON.stringify(json));
    }
    if (json && typeof json === "object" && "code" in json && Number(json.code) !== 0) {
      throw new Error("BIZ " + json.code + " " + path + ": " + (json.message || ""));
    }
    return json.result !== undefined ? json.result : json.data !== undefined ? json.data : json;
  }

  async function authPost(path, body) {
    const res = await fetch(AUTH_API + path, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error("HTTP " + res.status + " " + path);
    if (json && typeof json === "object" && "code" in json && Number(json.code) !== 0) {
      throw new Error("BIZ " + json.code + " " + path);
    }
    return json.result !== undefined ? json.result : json.data !== undefined ? json.data : json;
  }

  function loadJSEncrypt() {
    return new Promise(function (resolve, reject) {
      if (typeof window.JSEncrypt === "function") {
        resolve();
        return;
      }
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/jsencrypt@3.3.2/bin/jsencrypt.min.js";
      s.onload = function () {
        resolve();
      };
      s.onerror = function () {
        reject(new Error("JSEncrypt CDN 加载失败"));
      };
      document.head.appendChild(s);
    });
  }

  async function resolvePassword(plain) {
    const setting = await authPost("/auth/loginSetting", {});
    if (!setting || !setting.encryptPasswordInTransit) return plain;
    const pub = String(setting.encryptPasswordPubKey || "").trim();
    if (!pub) throw new Error("需要传输加密但无公钥");
    await loadJSEncrypt();
    const enc = new window.JSEncrypt();
    enc.setPublicKey(pub);
    const out = enc.encrypt(plain);
    if (!out) throw new Error("JSEncrypt 加密失败");
    return out;
  }

  const roleList = await apiPost("/role/list", {
    pagination: { page: 1, pageSize: 50 },
  });
  const roles = roleList?.roles || roleList?.list || [];
  const adminRole =
    roles.find((r) => String(r.name || r.roleName || "").includes("管理员")) || roles[0];
  if (!adminRole?.id) throw new Error("未找到可用角色: " + JSON.stringify(roles).slice(0, 200));
  const roleId = String(adminRole.id);

  const created = [];

  for (let i = 1; i <= 3; i += 1) {
    const n = String(i).padStart(2, "0");
    const username = "u0601_mail_" + runId + "_" + n;
    const payload = {
      username: username,
      email: username + "@qq.com",
      phone: uniquePhone("e" + n),
      roleId,
      activationMethod: 2,
    };
    const res = await apiPost("/user/create", payload);
    created.push({
      type: "email",
      username,
      email: payload.email,
      phone: payload.phone,
      status: res?.user?.status,
      activationUrl: res?.activationUrl || null,
    });
  }

  const encryptedPwd = await resolvePassword(PLAIN_PWD);

  for (let i = 1; i <= 3; i += 1) {
    const n = String(i).padStart(2, "0");
    const username = "u0601_pwd_" + runId + "_" + n;
    const payload = {
      username: username,
      email: username + "@qq.com",
      phone: uniquePhone("p" + n),
      roleId,
      activationMethod: 1,
      password: encryptedPwd,
    };
    const res = await apiPost("/user/create", payload);
    created.push({
      type: "password",
      username,
      email: payload.email,
      phone: payload.phone,
      status: res?.user?.status,
    });
  }

  await new Promise((r) => setTimeout(r, 500));

  const rows = [...document.querySelectorAll(".el-table__body tbody tr")].map((tr) => ({
    userName: tr.cells[1]?.innerText?.trim(),
    role: tr.cells[2]?.innerText?.trim(),
    status: tr.cells[6]?.innerText?.trim(),
    ops: [...tr.querySelectorAll(".operation-column-op-item")]
      .filter((el) => !el.classList.contains("operation-column-op-item--hidden"))
      .map((el) => el.dataset.opLabel),
    hasMore: !!tr.querySelector(".operation-column-more-trigger"),
  }));

  return JSON.stringify({ roleId, roleName: adminRole.name || adminRole.roleName, created, rows }, null, 2);
})().catch((e) => JSON.stringify({ error: String(e.message || e) }));
