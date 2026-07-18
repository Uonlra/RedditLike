/**
 * Day 4 临时练习组件 —— 验证 mobile-first 响应式三档断点。
 * 验证完可删除本文件,并从 App.tsx 卸下挂载。
 */
const ResponsiveDemo = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <h2 className="text-center text-sm font-semibold text-text sm:text-left sm:text-base">
        Day 4 Responsive Demo
      </h2>

      {/* 移动端 1 栏 → md 2 栏 → lg 3 栏 */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="rounded-md border border-border bg-surface-2 p-4"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-center text-sm font-semibold text-text sm:text-left sm:text-base">
                Card {n}
              </h3>
              {/* 移动端隐藏,md 以上显示 */}
              <span className="hidden rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-hover md:inline-block">
                badge
              </span>
            </div>
            <p className="mb-3 text-sm text-text-subtle sm:text-text-muted">
              移动端单栏 · md 双栏 · lg 三栏。拖动窗口宽度看布局切换。
            </p>
            {/* 移动端全宽,sm 以上自适应 */}
            <button
              type="button"
              className="w-full rounded-md border border-border bg-surface-3 px-3 py-2 text-sm text-text hover:border-accent sm:w-auto"
            >
              Action
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponsiveDemo;
