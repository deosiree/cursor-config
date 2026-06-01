/**
 * 将租户用户清理到仅剩 KEEP_COUNT 个（保留当前用户、租户 owner，其余按创建时间保留最新的）。
 */
(async function cleanupUsersToTen() {
  const API = "/dev-api/forward/seccenter/v2";
  const KEEP_COUNT = 10;

  async function apiPost(path, body) {
    const res = await fetch(API + path, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
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

  const me = JSON.parse(sessionStorage.getItem("userInfo") || "{}");
  const myId = String(me.id || me.userId || "");
  const myName = String(me.userName || me.username || "");

  async function fetchAllUsers() {
    const all = [];
    let page = 1;
    const pageSize = 100;
    while (true) {
      const data = await apiPost("/user/list", {
        pagination: { page: page, pageSize: pageSize },
      });
      const users = data.users || [];
      all.push.apply(all, users);
      const total = data.pagination && data.pagination.totalCount;
      if (users.length < pageSize) break;
      if (total != null && all.length >= total) break;
      page += 1;
      if (page > 50) break;
    }
    return all;
  }

  const allUsers = await fetchAllUsers();
  const beforeCount = allUsers.length;

  if (beforeCount <= KEEP_COUNT) {
    return JSON.stringify({
      message: "用户数已不超过 " + KEEP_COUNT + "，无需删除",
      beforeCount: beforeCount,
      kept: allUsers.map(function (u) {
        return u.username;
      }),
    });
  }

  const mustKeep = new Set();
  allUsers.forEach(function (u) {
    if (String(u.id) === myId) mustKeep.add(String(u.id));
    if (u.isOwner === true) mustKeep.add(String(u.id));
  });

  const candidates = allUsers
    .filter(function (u) {
      return !mustKeep.has(String(u.id));
    })
    .sort(function (a, b) {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return tb - ta;
    });

  const slotsLeft = KEEP_COUNT - mustKeep.size;
  if (slotsLeft > 0) {
    candidates.slice(0, slotsLeft).forEach(function (u) {
      mustKeep.add(String(u.id));
    });
  }

  const toDelete = allUsers.filter(function (u) {
    return !mustKeep.has(String(u.id));
  });

  const deleted = [];
  const failed = [];

  for (let i = 0; i < toDelete.length; i += 1) {
    const u = toDelete[i];
    try {
      await apiPost("/user/delete", { id: String(u.id) });
      deleted.push(u.username || u.id);
    } catch (e) {
      failed.push({ user: u.username || u.id, error: String(e.message || e) });
    }
    if (i % 20 === 19) {
      await new Promise(function (r) {
        setTimeout(r, 200);
      });
    }
  }

  const afterList = await fetchAllUsers();

  return JSON.stringify(
    {
      operator: myName,
      beforeCount: beforeCount,
      afterCount: afterList.length,
      keepCount: mustKeep.size,
      deletedCount: deleted.length,
      failedCount: failed.length,
      keptUsers: afterList.map(function (u) {
        return {
          username: u.username,
          isOwner: u.isOwner,
          isSelf: String(u.id) === myId,
        };
      }),
      failedSample: failed.slice(0, 5),
    },
    null,
    2
  );
})().catch(function (e) {
  return JSON.stringify({ error: String(e.message || e) });
});
