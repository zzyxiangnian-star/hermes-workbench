export interface PluginCssContext {
  onDispose?: (fn: () => void) => void
}

// @ts-expect-error virtual module injected at build time
import css from 'virtual:hermes-workbench-css'

const STYLE_ID = 'hermes-workbench-css'

export function injectPluginCss(ctx: PluginCssContext): void {
  if (typeof document === 'undefined') return
  document.getElementById(STYLE_ID)?.remove()
  if (!css) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  document.head.appendChild(style)
  ctx.onDispose?.(() => {
    style.remove()
  })
}
