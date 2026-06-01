/**
 * user0601 登录态下，通过「新增」按钮 UI 创建 3 邮箱激活 + 3 密码直设用户。
 */
(async function createUsersViaUi() {
  const PLAIN_PWD = "Test@123456";
  const runId = String(Date.now());
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function setInput(el, value) {
    if (!el) return false;
    el.value = value;
    el.dispatchEvent(new InputEvent("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function subRoot() {
    return document.querySelector("#subapp-container") || document.body;
  }

  function visibleDialog() {
    return [...subRoot().querySelectorAll(".el-dialog")].find((d) => {
      const style = window.getComputedStyle(d);
      return style.display !== "none" && d.querySelector(".el-dialog__body");
    });
  }

  async function pickSelectInDialog(labelKeyword, optionText) {
    const dlg = visibleDialog();
    if (!dlg) throw new Error("未找到新增用户弹窗");
    const items = [...dlg.querySelectorAll(".el-form-item")];
    const item = items.find((it) => {
      const lb = it.querySelector(".el-form-item__label");
      return lb && lb.textContent.indexOf(labelKeyword) >= 0;
    });
    const select = item && item.querySelector(".el-select");
    if (!select) throw new Error("未找到下拉: " + labelKeyword);
    select.click();
    await sleep(400);
    const opts = [...document.querySelectorAll(".el-select-dropdown:not([style*='display: none']) .el-select-dropdown__item, .el-select-dropdown__item")];
    const opt = opts.find((o) => o.textContent.trim() === optionText);
    if (!opt) throw new Error("未找到选项: " + optionText + " for " + labelKeyword);
    opt.click();
    await sleep(300);
  }

  async function openAddDialog() {
    const btns = [...subRoot().querySelectorAll("button")];
    const addBtn = btns.find((b) => b.textContent.replace(/\s/g, "").indexOf("新增") >= 0);
    if (!addBtn) throw new Error("未找到「新增」按钮，请确认 sys:user:add 已生效");
    addBtn.click();
    await sleep(800);
    if (!visibleDialog()) throw new Error("点击新增后弹窗未打开");
  }

  async function submitDialog() {
    const dlg = visibleDialog();
    const ok = dlg && [...dlg.querySelectorAll("button")].find((b) => b.textContent.replace(/\s/g, "").indexOf("确定") >= 0);
    if (!ok) throw new Error("未找到确定按钮");
    ok.click();
    await sleep(1500);
  }

  async function fillUserForm(spec) {
    await openAddDialog();
    const dlg = visibleDialog();
    const inputs = [...dlg.querySelectorAll("input")];

    const userInput = inputs.find((i) => (i.placeholder || "").indexOf("用户名") >= 0);
    setInput(userInput, spec.username);

    await pickSelectInDialog("激活方式", spec.activationLabel);

    if (spec.activationLabel === "密码直设") {
      await sleep(300);
      const pwdInputs = [...dlg.querySelectorAll('input[type="password"]')];
      if (pwdInputs[0]) setInput(pwdInputs[0], PLAIN_PWD);
      if (pwdInputs[1]) setInput(pwdInputs[1], PLAIN_PWD);
    }

    await pickSelectInDialog("角色", "管理员");

    const phoneInput = inputs.find((i) => (i.placeholder || "").indexOf("手机") >= 0);
    const emailInput = inputs.find((i) => (i.placeholder || "").indexOf("邮箱") >= 0);
    setInput(phoneInput, spec.phone);
    setInput(emailInput, spec.email);

    await submitDialog();

    const msg = document.body.innerText;
    if (msg.indexOf("新增用户成功") < 0 && msg.indexOf("成功") < 0) {
      await sleep(500);
    }
  }

  function uniquePhone(tag) {
    return ("139" + String(Date.now() % 1000000000) + tag).slice(0, 11);
  }

  const created = [];

  for (let i = 1; i <= 3; i += 1) {
    const n = String(i).padStart(2, "0");
    const username = "u0601_mail_" + runId + "_" + n;
    await fillUserForm({
      username: username,
      activationLabel: "邮箱激活",
      phone: uniquePhone("e" + i),
      email: username + "@qq.com",
    });
    created.push({ type: "email", username: username });
    await sleep(800);
  }

  for (let i = 1; i <= 3; i += 1) {
    const n = String(i).padStart(2, "0");
    const username = "u0601_pwd_" + runId + "_" + n;
    await fillUserForm({
      username: username,
      activationLabel: "密码直设",
      phone: uniquePhone("p" + i),
      email: username + "@qq.com",
    });
    created.push({ type: "password", username: username });
    await sleep(800);
  }

  await sleep(1000);
  const rows = [...subRoot().querySelectorAll(".el-table__body tbody tr")].map((tr) => ({
    userName: (tr.cells[1] && tr.cells[1].innerText || "").trim(),
    status: (tr.cells[6] && tr.cells[6].innerText || "").trim(),
    inlineOps: [...tr.querySelectorAll(".operation-column-op-item")]
      .filter((el) => !el.classList.contains("operation-column-op-item--hidden"))
      .map((el) => el.dataset.opLabel),
    hasMore: !!tr.querySelector(".operation-column-more-trigger"),
    isSelf: (tr.cells[1] && tr.cells[1].innerText || "").trim() === "user0601",
  }));

  return JSON.stringify({ runId: runId, created: created, rows: rows.slice(0, 10) }, null, 2);
})().catch((e) => JSON.stringify({ error: String(e.message || e), stack: e.stack }));
