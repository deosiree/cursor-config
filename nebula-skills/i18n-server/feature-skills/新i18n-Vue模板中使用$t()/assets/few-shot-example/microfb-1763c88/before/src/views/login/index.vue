<template>
  <div class="login-page">
    <!-- 左侧插画区 -->
    <div class="login-left">
      <div class="login-left__bg" />
      <div class="login-left__logo">
        <span class="login-left__logo-text">{{ projectName }}</span>
      </div>

      <div class="login-photo">
        <div class="mid-container">
          <div class="mid mid-0"></div>
          <div class="mid mid-1"></div>
          <div class="mid mid-6"></div>
          <div class="mid mid-4"></div>
          <div class="mid mid-2"></div>
          <div class="mid mid-3"></div>
        </div>
        <div class="phone phone-1"></div>
        <div class="phone phone-2"></div>
        <div class="phone phone-3"></div>
        <div class="phone phone-4"></div>
        <div class="phone phone-5"></div>
        <div class="phone phone-6"></div>
        <div class="arrow arrow-1"></div>
        <div class="arrow arrow-2"></div>
        <div class="arrow arrow-3"></div>
        <div class="arrow arrow-4"></div>
        <div class="arrow arrow-5"></div>
        <div class="arrow arrow-6"></div>
        <div class="light light-1"></div>
        <div class="light light-2"></div>
        <div class="light light-3"></div>
        <div class="light light-4"></div>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="login-right">
      <div
        class="login-card"
        :class="`login-card--${cardMode}`"
      >
        <h1 class="login-card__brand">Sieyuan</h1>
        <component
          :is="currentComponent"
          @layout-change="handleLayoutChange"
        />
      </div>
    </div>

    <!-- 右上角操作栏 -->
    <div class="action-bar">
      <el-tooltip
        content="语言切换"
        placement="bottom"
      >
        <LangSelect size="text-20px" />
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import VerifyTwoFactor from "@/views/login/components/VerifyTwoFactor.vue";
import LangSelect from "@/components/LangSelect/index.vue";
import pkg from "../../../package.json";
import Login from "./components/Login.vue";
const projectName = pkg?.name ?? "Sieyuan";
const route = useRoute();
const cardMode = ref<"login" | "forgot" | "verify">("login");
const currentComponent = computed(() => {
  return route.path.includes("/verify") ? VerifyTwoFactor : Login;
});

watch(
  () => route.path,
  (path) => {
    cardMode.value = path.includes("/verify") ? "verify" : "login";
  },
  { immediate: true }
);

function handleLayoutChange(mode: "login" | "forgot") {
  cardMode.value = mode;
}
</script>

<style lang="scss" scoped>
.login-page {
  position: relative;
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: url("@/assets/images/sieyuan.png") center center / cover no-repeat;
}

/* ── 左侧插画区 ── */
.login-left {
  position: relative;
  flex: 0 0 62%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-left__bg {
  position: absolute;
  inset: 0;
}

.login-left__logo {
  position: absolute;
  top: 24px;
  left: 40px;
  display: flex;
  gap: 12px;
  align-items: center;
  z-index: 1;
}

.login-left__logo-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.login-left__logo-text {
  font-size: 40px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

/* ── 右侧表单区 ── */
/* 背景图曲线约在 60% 处，卡片始终在右侧 40% 区域内水平居中 */
.login-right {
  position: absolute;
  right: 0;
  top: 0;
  width: 38%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  display: flex;
  justify-content: flex-start;
}

.login-card {
  box-sizing: border-box;
  width: 468px;
  min-width: 468px;
  max-width: 468px;
  height: 582px;
  min-height: 582px;
  max-height: 582px;
  padding: 64px 64px 96px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 8px 0 rgba(76, 162, 206, 0.29);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
}

.login-card--forgot {
  height: 654px;
  min-height: 654px;
  max-height: 654px;
}

.login-card__brand {
  margin: 0;
  font-family: Tahoma, sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: #124198;
  letter-spacing: 1px;
}

/* ══════════════════════════════════════
   登录插画动画
   ══════════════════════════════════════ */

/* 整体插画容器 */
.login-photo {
  width: calc(var(--vw-1) * 910);
  height: calc(var(--vw-1) * 642);
  position: relative;
}

/* ── 公共卡片样式 ── */
.phone,
.mid-container {
  position: absolute;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

/* ── 中心平台 ── */
.mid-container {
  position: absolute;
  left: 45%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: calc(var(--vw-1) * 250);
  height: calc(var(--vw-1) * 320);
  animation: midShake 4s ease-in-out infinite;
}

/* 中心各层叠加 */
.mid {
  position: absolute;
  left: 50%;
  transform: translate(-50%);
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}
.mid-0 {
  bottom: -31px;
  width: calc(var(--vw-1) * 232);
  height: calc(var(--vw-1) * 156);
  background: url("@/assets/images/login/mid-0.png") center center / contain no-repeat;
}
/* 底座大平台 */
.mid-1 {
  bottom: 0;
  width: calc(var(--vw-1) * 223);
  height: calc(var(--vw-1) * 158);
  background: url("@/assets/images/login/mid-1.png") center center / contain no-repeat;
}

/* 中层平台 */
.mid-2 {
  bottom: calc(var(--vw-1) * 115);
  width: calc(var(--vw-1) * 75);
  height: calc(var(--vw-1) * 87);
  animation: bounce 2s ease-in-out infinite;
  background: url("@/assets/images/login/mid-2.png") center center / contain no-repeat;
}

/* 上层平台 */
.mid-3 {
  bottom: calc(var(--vw-1) * 185);
  width: calc(var(--vw-1) * 40);
  height: calc(var(--vw-1) * 66);
  transform-style: preserve-3d;
  animation: swing3d 3s ease-in-out infinite;
  background: url("@/assets/images/login/mid-3.png") center center / contain no-repeat;
}

/* 立方体 */
.mid-4 {
  bottom: calc(var(--vw-1) * 60);
  width: calc(var(--vw-1) * 210);
  height: calc(var(--vw-1) * 148);
  background: url("@/assets/images/login/mid-4.png") center center / contain no-repeat;
}

/* 闪电图标 */
.mid-6 {
  bottom: calc(var(--vw-1) * 30);
  width: calc(var(--vw-1) * 200);
  height: calc(var(--vw-1) * 132);
  background: url("@/assets/images/login/mid-6.png") center center / contain no-repeat;
}

/* ── 6个节点卡片 ── */
.phone {
  position: absolute;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  animation: shake 3s ease-in-out infinite;
}

.phone-1 {
  left: calc(var(--vw-1) * 100);
  top: calc(var(--vw-1) * 50);
  width: calc(var(--vw-1) * 160);
  height: calc(var(--vw-1) * 183);
  background: url("@/assets/images/login/光伏板.png") center center / contain no-repeat;
  animation-delay: 0s;
}

/* 市电塔 - 左中 */
.phone-2 {
  left: calc(var(--vw-1) * -40);
  top: calc(var(--vw-1) * 260);
  width: calc(var(--vw-1) * 197);
  height: calc(var(--vw-1) * 157);
  background: url("@/assets/images/login/电塔.png") center center / contain no-repeat;
  animation-delay: 0.5s;
}

/* 储能 - 左下 */
.phone-3 {
  left: calc(var(--vw-1) * 40);
  top: calc(var(--vw-1) * 470);
  width: calc(var(--vw-1) * 161);
  height: calc(var(--vw-1) * 183);
  background: url("@/assets/images/login/储能.png") center center / contain no-repeat;
  animation-delay: 1s;
}

//充电桩
.phone-4 {
  right: calc(var(--vw-1) * 110);
  top: calc(var(--vw-1) * 500);
  width: calc(var(--vw-1) * 238);
  height: calc(var(--vw-1) * 139);
  background: url("@/assets/images/login/充电桩.png") center center / contain no-repeat;
  animation-delay: 1.5s;
}

//光伏
.phone-5 {
  right: calc(var(--vw-1) * 80);
  top: calc(var(--vw-1) * 260);
  width: calc(var(--vw-1) * 161);
  height: calc(var(--vw-1) * 183);
  background: url("@/assets/images/login/光伏.png") center center / contain no-repeat;
  animation-delay: 2s;
}
//负荷
.phone-6 {
  animation: shake 3s ease-in-out infinite;
  right: calc(var(--vw-1) * 150);
  top: calc(var(--vw-1) * 110);
  width: calc(var(--vw-1) * 238);
  height: calc(var(--vw-1) * 139);
  background: url("@/assets/images/login/负荷.png") center center / contain no-repeat;
  animation-delay: 2.5s;
}

.arrow {
  position: absolute;
}

.arrow::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--img) center center / contain no-repeat;
  animation: var(--flow, arrow-flow) var(--dur, 1.8s) linear infinite var(--delay, 0s);
}

.arrow-1 {
  left: calc(var(--vw-1) * 230);
  top: calc(var(--vw-1) * 210);
  width: calc(var(--vw-1) * 80);
  height: calc(var(--vw-1) * 60);
  background: url("@/assets/images/login/箭头-光伏.svg") center center / contain no-repeat;
  animation: arrowFlow1 1.5s ease-in-out infinite alternate;
}

/* 箭头2: 市电→中心 (右方向) */
.arrow-2 {
  left: calc(var(--vw-1) * 180);
  top: calc(var(--vw-1) * 340);
  width: calc(var(--vw-1) * 80);
  height: calc(var(--vw-1) * 60);
  background: url("@/assets/images/login/箭头-市电.svg") center center / contain no-repeat;
  animation: arrowFlow2 1.5s ease-in-out infinite alternate 0.25s;
}

/* 箭头3: 储能→中心 (右上方向) */
.arrow-3 {
  left: calc(var(--vw-1) * 190);
  top: calc(var(--vw-1) * 480);
  width: calc(var(--vw-1) * 80);
  height: calc(var(--vw-1) * 60);
  background: url("@/assets/images/login/箭头-储能.svg") center center / contain no-repeat;
  animation: arrowFlow3 1.5s ease-in-out infinite alternate 0.5s;
}

/* 箭头4: 中心→建筑 (右上方向) */
.arrow-4 {
  right: calc(var(--vw-1) * 320);
  top: calc(var(--vw-1) * 460);
  width: calc(var(--vw-1) * 80);
  height: calc(var(--vw-1) * 60);
  background: url("@/assets/images/login/箭头-充电桩.svg") center center / contain no-repeat;
  animation: arrow-flow 1.5s ease-in-out infinite alternate 0.75s;
}

/* 箭头5: 风电→中心 (左方向) */
.arrow-5 {
  right: calc(var(--vw-1) * 255);
  top: calc(var(--vw-1) * 370);
  width: calc(var(--vw-1) * 100);
  height: calc(var(--vw-1) * 80);
  background: url("@/assets/images/login/箭头-风电.svg") center center / contain no-repeat;
  animation: arrowFlow5 1.5s ease-in-out infinite alternate 1s;
}
/* 箭头6: 中心→充电桩 (右下方向) */
.arrow-6 {
  right: calc(var(--vw-1) * 350);
  top: calc(var(--vw-1) * 235);
  width: calc(var(--vw-1) * 80);
  height: calc(var(--vw-1) * 60);
  background: url("@/assets/images/login/箭头-负荷.svg") center center / contain no-repeat;
  animation: arrowFlow6 1.5s ease-in-out infinite alternate 1.25s;
}

/* ── 装饰光点 ── */
.light {
  position: absolute;
  border-radius: 50%;
  z-index: 6;
  animation: light-blink 2.5s ease-in-out infinite;
}

.light-1 {
  left: calc(var(--vw-1) * 80);
  top: calc(var(--vw-1) * 220);
  width: calc(var(--vw-1) * 28);
  height: calc(var(--vw-1) * 28);
  background: url("@/assets/images/login/light-1.png") center center / contain no-repeat;
  animation-delay: 0s;
}

.light-2 {
  left: calc(var(--vw-1) * 100);
  top: calc(var(--vw-1) * 230);
  width: calc(var(--vw-1) * 28);
  height: calc(var(--vw-1) * 28);
  background: url("@/assets/images/login/light-2.png") center center / contain no-repeat;
  animation-delay: 0.3s;
}

.light-3 {
  left: calc(var(--vw-1) * 380);
  top: calc(var(--vw-1) * 580);
  width: calc(var(--vw-1) * 58);
  height: calc(var(--vw-1) * 58);
  background: url("@/assets/images/login/light-3.png") center center / contain no-repeat;
  animation-delay: 0.6s;
}

.light-4 {
  left: calc(var(--vw-1) * 380);
  top: calc(var(--vw-1) * 133);
  width: calc(var(--vw-1) * 38);
  height: calc(var(--vw-1) * 38);
  background: url("@/assets/images/login/light-4.png") center center / contain no-repeat;
  animation-delay: 0.9s;
}

/* ══════════════════════════════════════
   关键帧动画
   ══════════════════════════════════════ */

/* 中心平台浮动 */
@keyframes float-center {
  0%,
  100% {
    transform: translate(-50%, -50%) translateY(0);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-12px);
  }
}

/* 各节点浮动（从外向内聚拢） */
@keyframes float-1 {
  0%,
  100% {
    transform: var(--orbit-t) translate(0, 0);
  }
  50% {
    transform: var(--orbit-t) translate(12px, 10px);
  }
}
@keyframes float-2 {
  0%,
  100% {
    transform: var(--orbit-t) translate(0, 0);
  }
  50% {
    transform: var(--orbit-t) translate(14px, 0);
  }
}
@keyframes float-3 {
  0%,
  100% {
    transform: var(--orbit-t) translate(0, 0);
  }
  50% {
    transform: var(--orbit-t) translate(12px, -10px);
  }
}
@keyframes float-4 {
  0%,
  100% {
    transform: var(--orbit-t) translate(0, 0);
  }
  50% {
    transform: var(--orbit-t) translate(-12px, 10px);
  }
}
@keyframes float-5 {
  0%,
  100% {
    transform: var(--orbit-t) translate(0, 0);
  }
  50% {
    transform: var(--orbit-t) translate(-14px, 0);
  }
}
@keyframes float-6 {
  0%,
  100% {
    transform: var(--orbit-t) translate(0, 0);
  }
  50% {
    transform: var(--orbit-t) translate(-12px, -10px);
  }
}

/* 箭头流动（向右） */
@keyframes arrow-flow {
  0% {
    opacity: 0.3;
    transform: translateX(-8px);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.3;
    transform: translateX(8px);
  }
}

/* 箭头流动（向左） */
@keyframes arrow-flow-reverse {
  0% {
    opacity: 0.3;
    transform: translateX(8px);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.3;
    transform: translateX(-8px);
  }
}

/* 闪电脉冲 */
@keyframes bolt-pulse {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
    filter: brightness(1);
  }
  50% {
    transform: translateX(-50%) scale(1.15);
    filter: brightness(1.4);
  }
}

/* 光点闪烁 */
@keyframes light-blink {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}
.action-bar {
  position: fixed;
  top: 16px;
  right: 20px;
  z-index: 10;
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 1.125rem;
}

@keyframes bounce {
  0%,
  100% {
    transform: translate(-50%) translateY(0);
  }
  50% {
    transform: translate(-50%) translateY(calc(var(--vw-1) * -15));
  }
}
@keyframes swing3d {
  0%,
  100% {
    transform: translate(-50%) perspective(500px) rotateY(-45deg);
  }

  50% {
    transform: translate(-50%) perspective(500px) rotateY(45deg);
  }
}

@keyframes arrow-flow {
  0% {
    opacity: 0.6;
    transform: translate(calc(var(--vw-1) * -12), calc(var(--vw-1) * -8));
  }
  100% {
    opacity: 1;
    transform: translate(calc(var(--vw-1) * 12), calc(var(--vw-1) * 8));
  }
}

@keyframes arrowFlow1 {
  0% {
    opacity: 0.6;
    transform: translate(calc(var(--vw-1) * -12), calc(var(--vw-1) * -8));
  }
  100% {
    opacity: 1;
    transform: translate(calc(var(--vw-1) * 12), calc(var(--vw-1) * 8));
  }
}
@keyframes arrowFlow2 {
  0% {
    opacity: 0.6;
    transform: translate(calc(var(--vw-1) * -15));
  }

  100% {
    opacity: 1;
    transform: translate(calc(var(--vw-1) * 15));
  }
}

@keyframes arrowFlow3 {
  0% {
    opacity: 0.6;
    transform: translate(calc(var(--vw-1) * -12), calc(var(--vw-1) * 8));
  }

  100% {
    opacity: 1;
    transform: translate(calc(var(--vw-1) * 12), calc(var(--vw-1) * -8));
  }
}

@keyframes arrowFlow5 {
  0% {
    opacity: 0.6;
    transform: translate(calc(var(--vw-1) * -15));
  }
  100% {
    opacity: 1;
    transform: translate(calc(var(--vw-1) * 15));
  }
}

@keyframes arrowFlow6 {
  0% {
    opacity: 0.6;
    transform: translate(calc(var(--vw-1) * -12), calc(var(--vw-1) * 8));
  }

  100% {
    opacity: 1;
    transform: translate(calc(var(--vw-1) * 12), calc(var(--vw-1) * -8));
  }
}
@keyframes shake {
  0%,
  100% {
    transform: translate(0);
  }
  10% {
    transform: translate(calc(var(--vw-1) * -1), calc(var(--vw-1) * 1));
  }
  20% {
    transform: translate(calc(var(--vw-1) * 1), calc(var(--vw-1) * -1));
  }
  30% {
    transform: translate(calc(var(--vw-1) * -1), calc(var(--vw-1) * -1));
  }
  40% {
    transform: translate(calc(var(--vw-1) * 1), calc(var(--vw-1) * 1));
  }
  50% {
    transform: translate(0);
  }
}

@keyframes midShake {
  0%,
  100% {
    transform: translate(-50%, -50%) translate(0);
  }
  15% {
    transform: translate(-50%, -50%) translate(calc(var(--vw-1) * 2), calc(var(--vw-1) * -1));
  }
  30% {
    transform: translate(-50%, -50%) translate(calc(var(--vw-1) * -1), calc(var(--vw-1) * 2));
  }
  45% {
    transform: translate(-50%, -50%) translate(calc(var(--vw-1) * 1), calc(var(--vw-1) * 1));
  }
  60% {
    transform: translate(-50%, -50%) translate(calc(var(--vw-1) * -2), calc(var(--vw-1) * -1));
  }
  75% {
    transform: translate(-50%, -50%) translate(calc(var(--vw-1) * 1), calc(var(--vw-1) * -2));
  }
}
</style>
