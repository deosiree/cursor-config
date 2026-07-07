// CSV 3545 — 用户列表失败（after 样本）
{
  url: "forward/seccenter/v2/user/list",
  method: ["POST"],
  body({ body }) {
    if (activeScenario() === "3545") {
      return { code: 40001, message: "加载用户列表失败（mock）", data: null };
    }
    // ...成功分支
  },
},
