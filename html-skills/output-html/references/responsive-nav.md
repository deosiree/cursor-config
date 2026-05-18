# 响应式导航

多章节页面的章节导航模式——桌面端固定侧边栏目录，移动端水平滚动条。

## 何时使用

包含 4 个以上章节的页面：diff-review、plan-review、project-recap、功能方案、仪表盘。

## 结构

```html
<div class="page-layout">
  <nav class="toc" id="toc">
    <div class="toc__header">目录</div>
    <ul class="toc__list">
      <li><a href="#section-1" class="toc__link">章节 1</a></li>
      <li><a href="#section-2" class="toc__link">章节 2</a></li>
      <!-- ... -->
    </ul>
  </nav>
  <main class="content">
    <section id="section-1">...</section>
    <section id="section-2">...</section>
    <!-- ... -->
  </main>
</div>
```

## CSS

```css
/* 桌面端：并排布局 */
.page-layout {
  display: flex;
  gap: 32px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 固定侧边栏 TOC */
.toc {
  width: 220px;
  flex-shrink: 0;
  position: sticky;
  top: 24px;
  align-self: flex-start;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  padding-right: 16px;
  border-right: 1px solid var(--border);
}

.toc__header {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-dim);
  margin-bottom: 16px;
}

.toc__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toc__link {
  display: block;
  padding: 6px 12px;
  font-size: 13px;
  color: var(--text-dim);
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.15s ease;
  line-height: 1.4;
}

.toc__link:hover,
.toc__link--active {
  background: var(--accent-dim);
  color: var(--text);
}

/* 内容区 */
.content {
  flex: 1;
  min-width: 0;
}

/* 移动端：水平滚动条 */
@media (max-width: 768px) {
  .page-layout {
    flex-direction: column;
    gap: 0;
  }

  .toc {
    width: 100%;
    position: static;
    max-height: none;
    border-right: none;
    border-bottom: 1px solid var(--border);
    padding: 12px 0;
    margin-bottom: 16px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .toc__list {
    flex-direction: row;
    gap: 0;
    white-space: nowrap;
    padding: 0 16px;
  }

  .toc__link {
    padding: 8px 16px;
    border-radius: 20px;
    margin-right: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    font-size: 12px;
  }

  .toc__header {
    display: none;
  }
}
```

## 交互（滚动跟踪）

```javascript
const links = document.querySelectorAll('.toc__link');
const sections = document.querySelectorAll('section[id]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(l => l.classList.remove('toc__link--active'));
      const active = document.querySelector(`.toc__link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('toc__link--active');
    }
  });
}, { rootMargin: '-80px 0px -80% 0px' });

sections.forEach(section => observer.observe(section));
```

## 设计注意事项

- 侧边栏 TOC 应是"扁平"的——只显示顶级章节，不嵌套
- TOC 链接使用小号等宽字体，表示其辅助导航角色
- 活跃章节指示器应明显（彩色背景或左边框）
- 内容区的章节应有可点击的 `id` 属性
- 移动端 TOC 应像 app 标签栏一样水平滚动
