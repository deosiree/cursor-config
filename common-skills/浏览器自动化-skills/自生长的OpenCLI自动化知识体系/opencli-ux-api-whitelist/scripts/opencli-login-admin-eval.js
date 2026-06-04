(async () => {
  const account = "admin@system.local";
  const password = "123456";
  const tab = [...document.querySelectorAll('[role="tab"]')].find((el) =>
    (el.textContent || "").includes("密码")
  );
  tab?.click();
  await new Promise((r) => setTimeout(r, 300));
  const inputs = [...document.querySelectorAll("input")];
  const userInput = inputs.find(
    (el) =>
      (el.getAttribute("placeholder") || "").includes("手机") ||
      (el.getAttribute("placeholder") || "").includes("邮箱")
  );
  const pwdInput = inputs.find((el) => el.type === "password");
  const setVal = (el, val) => {
    if (!el) return false;
    el.focus();
    el.value = val;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  };
  setVal(userInput, account);
  setVal(pwdInput, password);
  document.querySelector("button.login-submit-btn")?.click();
  return {
    filledUser: !!userInput,
    filledPwd: !!pwdInput,
    clicked: !!document.querySelector("button.login-submit-btn"),
  };
})();
