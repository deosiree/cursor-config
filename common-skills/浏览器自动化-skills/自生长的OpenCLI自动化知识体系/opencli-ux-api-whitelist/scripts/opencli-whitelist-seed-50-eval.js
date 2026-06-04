/**
 * 在已登录页面内真实调用 SecCenter apiWhitelist/create，插入 50 条（非 mock）。
 * 需在 http://localhost:8080 基座会话下执行，且 Cookie 已携带。
 */
(async () => {
  const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
  const prefix = "/Apex/opencli/whitelist-e2e";
  const apiBase = "/dev-api/direct/seccenter/v2/apiWhitelist";
  const headers = { "Content-Type": "application/json" };
  const results = [];

  for (let i = 1; i <= 50; i += 1) {
    const body = {
      apiUrl: `${prefix}-${Date.now()}-${i}`,
      apiMethod: methods[i % methods.length],
      description: `OpenCLI E2E 真实插入第 ${i} 条`,
    };
    try {
      const res = await fetch(`${apiBase}/create`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      const code = json?.code ?? json?.data?.code;
      const ok = code === 0 || code === "0";
      results.push({ i, ok, code, msg: json?.message || json?.msg });
    } catch (err) {
      results.push({ i, ok: false, error: String(err) });
    }
  }

  const okCount = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok).slice(0, 5);
  return { ok: okCount >= 50, inserted: okCount, total: 50, sampleFailures: fail };
})();
