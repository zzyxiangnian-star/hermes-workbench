import { compile } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'
import { build } from 'esbuild'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pluginRoot = __dirname
const srcDir = resolve(pluginRoot, 'src')
const distDir = resolve(pluginRoot, 'dist/hermes-workbench')
const outFile = resolve(distDir, 'plugin.js')

// Hermes 源码：HERMES_SRC，否则默认 F:\Hermes改造\hermes-agent。找不到就退出。
const hermesRoot = process.env.HERMES_SRC || 'F:\\Hermes改造\\hermes-agent'
const desktopDir = resolve(hermesRoot, 'apps/desktop')
const stylesCss = resolve(desktopDir, 'src/styles.css')

console.log(`[build] Hermes 源码路径: ${hermesRoot}`)

if (!existsSync(stylesCss)) {
  console.error(`[build] 找不到 Hermes 样式：${stylesCss}`)
  console.error('[build] 请设置 HERMES_SRC 指向 hermes-agent，或把源码放在 F:\\Hermes改造\\hermes-agent')
  process.exit(1)
}

console.log(`[build] Hermes styles.css: ${stylesCss}`)

async function buildPluginCss() {

  const styles = stylesCss.replaceAll('\\', '/')
  const input = `@reference "${styles}";\n@import "tailwindcss/utilities.css" layer(utilities);\n`
  const compiler = await compile(input, { base: resolve(desktopDir, 'src'), onDependency() {} })
  const scanner = new Scanner({ sources: [{ base: srcDir, pattern: '**/*.{ts,tsx}', negated: false }] })

  const candidates = scanner.scan()
  console.log(`[build] 扫描到 ${candidates.length} 个 Tailwind 类名候选`)
  return compiler.build(candidates)
}

const pluginCss = await buildPluginCss()

const virtualCssPlugin = {
  name: 'hermes-workbench-css',
  setup(b) {
    b.onResolve({ filter: /^virtual:hermes-workbench-css$/ }, () => ({
      path: 'hermes-workbench-css',
      namespace: 'virtual'
    }))
    b.onLoad({ filter: /.*/, namespace: 'virtual' }, () => ({
      contents: `export default ${JSON.stringify(pluginCss)}`,
      loader: 'js'
    }))
  }
}

mkdirSync(distDir, { recursive: true })

await build({
  entryPoints: [resolve(srcDir, 'plugin.tsx')],
  outfile: outFile,
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  target: 'es2022',
  external: [
    '@hermes/plugin-sdk',
    'react',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'react-dom'
  ],
  plugins: [virtualCssPlugin],
  logLevel: 'info'
})

console.log(`[build] 构建完成: ${outFile}`)
