// src/plugin.tsx
import { host as host2, ROUTES_AREA } from "@hermes/plugin-sdk";

// src/api/backend-control.ts
var rest = null;
function setPluginRest(fn) {
  rest = fn ?? null;
}
async function getBackendStatus() {
  if (!rest) return null;
  try {
    return await rest("/backend", { timeoutMs: 5e3 });
  } catch {
    return null;
  }
}
async function startBackend(demo) {
  if (!rest) throw new Error("\u8FD9\u53F0\u7535\u8111\u7684 Hermes \u6CA1\u6709\u542F\u7528\u5DE5\u4F5C\u53F0\u63D2\u4EF6\u7684\u540E\u53F0\u90E8\u5206");
  return rest("/backend/start", { method: "POST", body: { demo }, timeoutMs: 3e4 });
}

// virtual:hermes-workbench-css
var hermes_workbench_css_default = '/*! tailwindcss v4.3.4 | MIT License | https://tailwindcss.com */\n@layer properties;\n@layer utilities {\n  .pointer-events-none {\n    pointer-events: none;\n  }\n  .visible {\n    visibility: visible;\n  }\n  .absolute {\n    position: absolute;\n  }\n  .fixed {\n    position: fixed;\n  }\n  .relative {\n    position: relative;\n  }\n  .static {\n    position: static;\n  }\n  .sticky {\n    position: sticky;\n  }\n  .inset-0 {\n    inset: 0px;\n  }\n  .inset-x-2 {\n    inset-inline: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .inset-y-0 {\n    inset-block: 0px;\n  }\n  .top-0 {\n    top: 0px;\n  }\n  .top-2 {\n    top: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .top-3 {\n    top: calc(var(--spacing, 0.25rem) * 3);\n  }\n  .top-6 {\n    top: calc(var(--spacing, 0.25rem) * 6);\n  }\n  .top-\\[calc\\(var\\(--titlebar-controls-top\\,5px\\)\\+var\\(--titlebar-control-height\\,24px\\)\\+0\\.25rem\\)\\] {\n    top: calc(var(--titlebar-controls-top,5px) + var(--titlebar-control-height,24px) + 0.25rem);\n  }\n  .right-0 {\n    right: 0px;\n  }\n  .right-2 {\n    right: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .right-3 {\n    right: calc(var(--spacing, 0.25rem) * 3);\n  }\n  .bottom-0 {\n    bottom: 0px;\n  }\n  .bottom-3 {\n    bottom: calc(var(--spacing, 0.25rem) * 3);\n  }\n  .left-0 {\n    left: 0px;\n  }\n  .left-1\\/2 {\n    left: calc(1 / 2 * 100%);\n  }\n  .z-10 {\n    z-index: 10;\n  }\n  .z-20 {\n    z-index: 20;\n  }\n  .z-50 {\n    z-index: 50;\n  }\n  .col-span-2 {\n    grid-column: span 2 / span 2;\n  }\n  .mx-0\\.5 {\n    margin-inline: calc(var(--spacing, 0.25rem) * 0.5);\n  }\n  .mx-2 {\n    margin-inline: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .mt-0\\.5 {\n    margin-top: calc(var(--spacing, 0.25rem) * 0.5);\n  }\n  .mt-1 {\n    margin-top: var(--spacing, 0.25rem);\n  }\n  .mt-2 {\n    margin-top: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .mt-3 {\n    margin-top: calc(var(--spacing, 0.25rem) * 3);\n  }\n  .mt-auto {\n    margin-top: auto;\n  }\n  .mr-auto {\n    margin-right: auto;\n  }\n  .mb-1 {\n    margin-bottom: var(--spacing, 0.25rem);\n  }\n  .ml-2 {\n    margin-left: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .ml-auto {\n    margin-left: auto;\n  }\n  .line-clamp-2 {\n    overflow: hidden;\n    display: -webkit-box;\n    -webkit-box-orient: vertical;\n    -webkit-line-clamp: 2;\n  }\n  .block {\n    display: block;\n  }\n  .contents {\n    display: contents;\n  }\n  .flex {\n    display: flex;\n  }\n  .grid {\n    display: grid;\n  }\n  .hidden {\n    display: none;\n  }\n  .inline-block {\n    display: inline-block;\n  }\n  .inline-flex {\n    display: inline-flex;\n  }\n  .aspect-\\[4\\/3\\] {\n    aspect-ratio: 4/3;\n  }\n  .aspect-square {\n    aspect-ratio: 1 / 1;\n  }\n  .size-1\\.5 {\n    width: calc(var(--spacing, 0.25rem) * 1.5);\n    height: calc(var(--spacing, 0.25rem) * 1.5);\n  }\n  .size-5 {\n    width: calc(var(--spacing, 0.25rem) * 5);\n    height: calc(var(--spacing, 0.25rem) * 5);\n  }\n  .h-1 {\n    height: var(--spacing, 0.25rem);\n  }\n  .h-3\\.5 {\n    height: calc(var(--spacing, 0.25rem) * 3.5);\n  }\n  .h-4 {\n    height: calc(var(--spacing, 0.25rem) * 4);\n  }\n  .h-5 {\n    height: calc(var(--spacing, 0.25rem) * 5);\n  }\n  .h-6 {\n    height: calc(var(--spacing, 0.25rem) * 6);\n  }\n  .h-7 {\n    height: calc(var(--spacing, 0.25rem) * 7);\n  }\n  .h-8 {\n    height: calc(var(--spacing, 0.25rem) * 8);\n  }\n  .h-10 {\n    height: calc(var(--spacing, 0.25rem) * 10);\n  }\n  .h-12 {\n    height: calc(var(--spacing, 0.25rem) * 12);\n  }\n  .h-14 {\n    height: calc(var(--spacing, 0.25rem) * 14);\n  }\n  .h-24 {\n    height: calc(var(--spacing, 0.25rem) * 24);\n  }\n  .h-28 {\n    height: calc(var(--spacing, 0.25rem) * 28);\n  }\n  .h-44 {\n    height: calc(var(--spacing, 0.25rem) * 44);\n  }\n  .h-52 {\n    height: calc(var(--spacing, 0.25rem) * 52);\n  }\n  .h-64 {\n    height: calc(var(--spacing, 0.25rem) * 64);\n  }\n  .h-full {\n    height: 100%;\n  }\n  .h-px {\n    height: 1px;\n  }\n  .max-h-8 {\n    max-height: calc(var(--spacing, 0.25rem) * 8);\n  }\n  .max-h-28 {\n    max-height: calc(var(--spacing, 0.25rem) * 28);\n  }\n  .max-h-32 {\n    max-height: calc(var(--spacing, 0.25rem) * 32);\n  }\n  .max-h-36 {\n    max-height: calc(var(--spacing, 0.25rem) * 36);\n  }\n  .max-h-48 {\n    max-height: calc(var(--spacing, 0.25rem) * 48);\n  }\n  .max-h-64 {\n    max-height: calc(var(--spacing, 0.25rem) * 64);\n  }\n  .max-h-72 {\n    max-height: calc(var(--spacing, 0.25rem) * 72);\n  }\n  .max-h-\\[60vh\\] {\n    max-height: 60vh;\n  }\n  .max-h-\\[70vh\\] {\n    max-height: 70vh;\n  }\n  .max-h-\\[85vh\\] {\n    max-height: 85vh;\n  }\n  .max-h-full {\n    max-height: 100%;\n  }\n  .min-h-0 {\n    min-height: 0px;\n  }\n  .min-h-48 {\n    min-height: calc(var(--spacing, 0.25rem) * 48);\n  }\n  .w-1 {\n    width: var(--spacing, 0.25rem);\n  }\n  .w-5 {\n    width: calc(var(--spacing, 0.25rem) * 5);\n  }\n  .w-6 {\n    width: calc(var(--spacing, 0.25rem) * 6);\n  }\n  .w-10 {\n    width: calc(var(--spacing, 0.25rem) * 10);\n  }\n  .w-12 {\n    width: calc(var(--spacing, 0.25rem) * 12);\n  }\n  .w-14 {\n    width: calc(var(--spacing, 0.25rem) * 14);\n  }\n  .w-20 {\n    width: calc(var(--spacing, 0.25rem) * 20);\n  }\n  .w-24 {\n    width: calc(var(--spacing, 0.25rem) * 24);\n  }\n  .w-28 {\n    width: calc(var(--spacing, 0.25rem) * 28);\n  }\n  .w-32 {\n    width: calc(var(--spacing, 0.25rem) * 32);\n  }\n  .w-36 {\n    width: calc(var(--spacing, 0.25rem) * 36);\n  }\n  .w-40 {\n    width: calc(var(--spacing, 0.25rem) * 40);\n  }\n  .w-44 {\n    width: calc(var(--spacing, 0.25rem) * 44);\n  }\n  .w-48 {\n    width: calc(var(--spacing, 0.25rem) * 48);\n  }\n  .w-\\[4\\.5rem\\] {\n    width: 4.5rem;\n  }\n  .w-full {\n    width: 100%;\n  }\n  .w-px {\n    width: 1px;\n  }\n  .max-w-24 {\n    max-width: calc(var(--spacing, 0.25rem) * 24);\n  }\n  .max-w-40 {\n    max-width: calc(var(--spacing, 0.25rem) * 40);\n  }\n  .max-w-48 {\n    max-width: calc(var(--spacing, 0.25rem) * 48);\n  }\n  .max-w-full {\n    max-width: 100%;\n  }\n  .max-w-lg {\n    max-width: var(--container-lg, 32rem);\n  }\n  .max-w-max {\n    max-width: max-content;\n  }\n  .max-w-md {\n    max-width: var(--container-md, 28rem);\n  }\n  .max-w-sm {\n    max-width: var(--container-sm, 24rem);\n  }\n  .max-w-xl {\n    max-width: var(--container-xl, 36rem);\n  }\n  .min-w-0 {\n    min-width: 0px;\n  }\n  .min-w-2 {\n    min-width: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .min-w-4 {\n    min-width: calc(var(--spacing, 0.25rem) * 4);\n  }\n  .min-w-5 {\n    min-width: calc(var(--spacing, 0.25rem) * 5);\n  }\n  .min-w-24 {\n    min-width: calc(var(--spacing, 0.25rem) * 24);\n  }\n  .min-w-\\[38rem\\] {\n    min-width: 38rem;\n  }\n  .min-w-\\[42rem\\] {\n    min-width: 42rem;\n  }\n  .flex-1 {\n    flex: 1;\n  }\n  .flex-shrink {\n    flex-shrink: 1;\n  }\n  .shrink-0 {\n    flex-shrink: 0;\n  }\n  .table-fixed {\n    table-layout: fixed;\n  }\n  .border-collapse {\n    border-collapse: collapse;\n  }\n  .-translate-x-1\\/2 {\n    --tw-translate-x: calc(calc(1 / 2 * 100%) * -1);\n    translate: var(--tw-translate-x) var(--tw-translate-y);\n  }\n  .-translate-y-1\\/2 {\n    --tw-translate-y: calc(calc(1 / 2 * 100%) * -1);\n    translate: var(--tw-translate-x) var(--tw-translate-y);\n  }\n  .-translate-y-full {\n    --tw-translate-y: -100%;\n    translate: var(--tw-translate-x) var(--tw-translate-y);\n  }\n  .transform {\n    transform: var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, );\n  }\n  .cursor-col-resize {\n    cursor: col-resize;\n  }\n  .cursor-crosshair {\n    cursor: crosshair;\n  }\n  .cursor-grab {\n    cursor: grab;\n  }\n  .cursor-pointer {\n    cursor: pointer;\n  }\n  .list-disc {\n    list-style-type: disc;\n  }\n  .grid-cols-2 {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n  .grid-cols-7 {\n    grid-template-columns: repeat(7, minmax(0, 1fr));\n  }\n  .grid-cols-\\[1\\.25rem_minmax\\(0\\,1fr\\)\\] {\n    grid-template-columns: 1.25rem minmax(0,1fr);\n  }\n  .grid-cols-\\[8rem_minmax\\(0\\,1fr\\)\\] {\n    grid-template-columns: 8rem minmax(0,1fr);\n  }\n  .grid-cols-\\[minmax\\(0\\,1\\.2fr\\)_4\\.5rem_3rem_4\\.5rem_3rem\\] {\n    grid-template-columns: minmax(0,1.2fr) 4.5rem 3rem 4.5rem 3rem;\n  }\n  .grid-cols-\\[minmax\\(0\\,1\\.4fr\\)_4\\.5rem_5\\.5rem_4\\.5rem\\] {\n    grid-template-columns: minmax(0,1.4fr) 4.5rem 5.5rem 4.5rem;\n  }\n  .grid-cols-\\[minmax\\(0\\,1\\.4fr\\)_4rem_3rem_minmax\\(0\\,1fr\\)\\] {\n    grid-template-columns: minmax(0,1.4fr) 4rem 3rem minmax(0,1fr);\n  }\n  .grid-cols-\\[minmax\\(0\\,1\\.4fr\\)_6rem_5rem_4\\.5rem_4rem\\] {\n    grid-template-columns: minmax(0,1.4fr) 6rem 5rem 4.5rem 4rem;\n  }\n  .grid-cols-\\[minmax\\(0\\,1\\.5fr\\)_minmax\\(16rem\\,0\\.8fr\\)\\] {\n    grid-template-columns: minmax(0,1.5fr) minmax(16rem,0.8fr);\n  }\n  .grid-cols-\\[minmax\\(0\\,1\\.8fr\\)_minmax\\(7rem\\,0\\.9fr\\)_7\\.5rem_3\\.5rem_5\\.5rem_auto\\] {\n    grid-template-columns: minmax(0,1.8fr) minmax(7rem,0.9fr) 7.5rem 3.5rem 5.5rem auto;\n  }\n  .grid-cols-\\[minmax\\(0\\,1fr\\)_5rem_6rem_minmax\\(0\\,1fr\\)_3\\.5rem_3rem\\] {\n    grid-template-columns: minmax(0,1fr) 5rem 6rem minmax(0,1fr) 3.5rem 3rem;\n  }\n  .grid-cols-\\[minmax\\(0\\,1fr\\)_6rem\\] {\n    grid-template-columns: minmax(0,1fr) 6rem;\n  }\n  .grid-cols-\\[minmax\\(0\\,1fr\\)_6rem_6rem_minmax\\(0\\,1fr\\)_auto\\] {\n    grid-template-columns: minmax(0,1fr) 6rem 6rem minmax(0,1fr) auto;\n  }\n  .grid-cols-\\[minmax\\(0\\,1fr\\)_minmax\\(0\\,1fr\\)_auto\\] {\n    grid-template-columns: minmax(0,1fr) minmax(0,1fr) auto;\n  }\n  .grid-cols-\\[minmax\\(8rem\\,1\\.2fr\\)_5\\.5rem_minmax\\(7rem\\,1\\.4fr\\)_5\\.5rem_5\\.5rem_4rem\\] {\n    grid-template-columns: minmax(8rem,1.2fr) 5.5rem minmax(7rem,1.4fr) 5.5rem 5.5rem 4rem;\n  }\n  .grid-cols-\\[repeat\\(auto-fill\\,minmax\\(5\\.5rem\\,1fr\\)\\)\\] {\n    grid-template-columns: repeat(auto-fill,minmax(5.5rem,1fr));\n  }\n  .grid-cols-\\[repeat\\(auto-fill\\,minmax\\(8\\.5rem\\,1fr\\)\\)\\] {\n    grid-template-columns: repeat(auto-fill,minmax(8.5rem,1fr));\n  }\n  .grid-cols-\\[repeat\\(auto-fill\\,minmax\\(11rem\\,1fr\\)\\)\\] {\n    grid-template-columns: repeat(auto-fill,minmax(11rem,1fr));\n  }\n  .grid-cols-\\[repeat\\(auto-fill\\,minmax\\(14rem\\,1fr\\)\\)\\] {\n    grid-template-columns: repeat(auto-fill,minmax(14rem,1fr));\n  }\n  .grid-cols-\\[repeat\\(auto-fill\\,minmax\\(min\\(100\\%\\,16rem\\)\\,1fr\\)\\)\\] {\n    grid-template-columns: repeat(auto-fill,minmax(min(100%, 16rem),1fr));\n  }\n  .grid-cols-\\[repeat\\(auto-fit\\,minmax\\(9rem\\,1fr\\)\\)\\] {\n    grid-template-columns: repeat(auto-fit,minmax(9rem,1fr));\n  }\n  .grid-cols-\\[repeat\\(auto-fit\\,minmax\\(12rem\\,1fr\\)\\)\\] {\n    grid-template-columns: repeat(auto-fit,minmax(12rem,1fr));\n  }\n  .flex-col {\n    flex-direction: column;\n  }\n  .flex-wrap {\n    flex-wrap: wrap;\n  }\n  .items-center {\n    align-items: center;\n  }\n  .items-end {\n    align-items: flex-end;\n  }\n  .items-start {\n    align-items: flex-start;\n  }\n  .justify-between {\n    justify-content: space-between;\n  }\n  .justify-center {\n    justify-content: center;\n  }\n  .justify-end {\n    justify-content: flex-end;\n  }\n  .gap-0 {\n    gap: 0px;\n  }\n  .gap-0\\.5 {\n    gap: calc(var(--spacing, 0.25rem) * 0.5);\n  }\n  .gap-1 {\n    gap: var(--spacing, 0.25rem);\n  }\n  .gap-1\\.5 {\n    gap: calc(var(--spacing, 0.25rem) * 1.5);\n  }\n  .gap-2 {\n    gap: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .gap-3 {\n    gap: calc(var(--spacing, 0.25rem) * 3);\n  }\n  .gap-4 {\n    gap: calc(var(--spacing, 0.25rem) * 4);\n  }\n  .gap-x-2 {\n    column-gap: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .gap-x-3 {\n    column-gap: calc(var(--spacing, 0.25rem) * 3);\n  }\n  .gap-y-0\\.5 {\n    row-gap: calc(var(--spacing, 0.25rem) * 0.5);\n  }\n  .gap-y-1 {\n    row-gap: var(--spacing, 0.25rem);\n  }\n  .self-start {\n    align-self: flex-start;\n  }\n  .self-stretch {\n    align-self: stretch;\n  }\n  .truncate {\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  }\n  .overflow-auto {\n    overflow: auto;\n  }\n  .overflow-hidden {\n    overflow: hidden;\n  }\n  .overflow-visible {\n    overflow: visible;\n  }\n  .overflow-x-auto {\n    overflow-x: auto;\n  }\n  .overflow-x-hidden {\n    overflow-x: hidden;\n  }\n  .overflow-y-auto {\n    overflow-y: auto;\n  }\n  .rounded {\n    border-radius: 0.25rem;\n  }\n  .rounded-full {\n    border-radius: calc(infinity * 1px);\n  }\n  .rounded-lg {\n    border-radius: calc(var(--radius-scalar) * 0.75rem);\n  }\n  .rounded-md {\n    border-radius: calc(var(--radius-scalar) * 0.625rem);\n  }\n  .rounded-sm {\n    border-radius: calc(var(--radius-scalar) * 0.5rem);\n  }\n  .border {\n    border-style: var(--tw-border-style);\n    border-width: 1px;\n  }\n  .border-2 {\n    border-style: var(--tw-border-style);\n    border-width: 2px;\n  }\n  .border-t {\n    border-top-style: var(--tw-border-style);\n    border-top-width: 1px;\n  }\n  .border-b {\n    border-bottom-style: var(--tw-border-style);\n    border-bottom-width: 1px;\n  }\n  .border-l {\n    border-left-style: var(--tw-border-style);\n    border-left-width: 1px;\n  }\n  .border-l-2 {\n    border-left-style: var(--tw-border-style);\n    border-left-width: 2px;\n  }\n  .border-dashed {\n    --tw-border-style: dashed;\n    border-style: dashed;\n  }\n  .border-\\(--ui-accent\\) {\n    border-color: var(--ui-accent);\n  }\n  .border-\\(--ui-stroke-secondary\\) {\n    border-color: var(--ui-stroke-secondary);\n  }\n  .border-destructive {\n    border-color: var(--dt-destructive);\n  }\n  .border-white {\n    border-color: var(--color-white, #fff);\n  }\n  .bg-\\(--ui-accent\\) {\n    background-color: var(--ui-accent);\n  }\n  .bg-\\(--ui-bg-editor\\) {\n    background-color: var(--ui-bg-editor);\n  }\n  .bg-\\(--ui-bg-editor\\)\\/80 {\n    background-color: var(--ui-bg-editor);\n    @supports (color: color-mix(in lab, red, red)) {\n      background-color: color-mix(in oklab, var(--ui-bg-editor) 80%, transparent);\n    }\n  }\n  .bg-\\(--ui-bg-elevated\\) {\n    background-color: var(--ui-bg-elevated);\n  }\n  .bg-\\(--ui-bg-quinary\\) {\n    background-color: var(--ui-bg-quinary);\n  }\n  .bg-\\(--ui-bg-secondary\\) {\n    background-color: var(--ui-bg-secondary);\n  }\n  .bg-\\(--ui-stroke-secondary\\) {\n    background-color: var(--ui-stroke-secondary);\n  }\n  .bg-amber-500 {\n    background-color: var(--color-amber-500, oklch(76.9% 0.188 70.08));\n  }\n  .bg-black\\/22 {\n    background-color: color-mix(in srgb, #000 22%, transparent);\n    @supports (color: color-mix(in lab, red, red)) {\n      background-color: color-mix(in oklab, var(--color-black, #000) 22%, transparent);\n    }\n  }\n  .bg-destructive\\/15 {\n    background-color: var(--dt-destructive);\n    @supports (color: color-mix(in lab, red, red)) {\n      background-color: color-mix(in oklab, var(--dt-destructive) 15%, transparent);\n    }\n  }\n  .object-contain {\n    object-fit: contain;\n  }\n  .object-cover {\n    object-fit: cover;\n  }\n  .p-1 {\n    padding: var(--spacing, 0.25rem);\n  }\n  .p-2 {\n    padding: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .p-3 {\n    padding: calc(var(--spacing, 0.25rem) * 3);\n  }\n  .p-4 {\n    padding: calc(var(--spacing, 0.25rem) * 4);\n  }\n  .px-0\\.5 {\n    padding-inline: calc(var(--spacing, 0.25rem) * 0.5);\n  }\n  .px-1 {\n    padding-inline: var(--spacing, 0.25rem);\n  }\n  .px-1\\.5 {\n    padding-inline: calc(var(--spacing, 0.25rem) * 1.5);\n  }\n  .px-2 {\n    padding-inline: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .px-3 {\n    padding-inline: calc(var(--spacing, 0.25rem) * 3);\n  }\n  .px-4 {\n    padding-inline: calc(var(--spacing, 0.25rem) * 4);\n  }\n  .px-\\[clamp\\(1\\.25rem\\,4vw\\,4rem\\)\\] {\n    padding-inline: clamp(1.25rem, 4vw, 4rem);\n  }\n  .py-0\\.5 {\n    padding-block: calc(var(--spacing, 0.25rem) * 0.5);\n  }\n  .py-1 {\n    padding-block: var(--spacing, 0.25rem);\n  }\n  .py-1\\.5 {\n    padding-block: calc(var(--spacing, 0.25rem) * 1.5);\n  }\n  .py-2 {\n    padding-block: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .py-2\\.5 {\n    padding-block: calc(var(--spacing, 0.25rem) * 2.5);\n  }\n  .py-3 {\n    padding-block: calc(var(--spacing, 0.25rem) * 3);\n  }\n  .py-6 {\n    padding-block: calc(var(--spacing, 0.25rem) * 6);\n  }\n  .py-8 {\n    padding-block: calc(var(--spacing, 0.25rem) * 8);\n  }\n  .py-10 {\n    padding-block: calc(var(--spacing, 0.25rem) * 10);\n  }\n  .pt-1 {\n    padding-top: var(--spacing, 0.25rem);\n  }\n  .pt-2 {\n    padding-top: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .pt-3 {\n    padding-top: calc(var(--spacing, 0.25rem) * 3);\n  }\n  .pr-1 {\n    padding-right: var(--spacing, 0.25rem);\n  }\n  .pr-2 {\n    padding-right: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .pr-10 {\n    padding-right: calc(var(--spacing, 0.25rem) * 10);\n  }\n  .pb-1 {\n    padding-bottom: var(--spacing, 0.25rem);\n  }\n  .pb-2 {\n    padding-bottom: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .pb-3 {\n    padding-bottom: calc(var(--spacing, 0.25rem) * 3);\n  }\n  .pl-2 {\n    padding-left: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .pl-4 {\n    padding-left: calc(var(--spacing, 0.25rem) * 4);\n  }\n  .pl-6 {\n    padding-left: calc(var(--spacing, 0.25rem) * 6);\n  }\n  .text-center {\n    text-align: center;\n  }\n  .text-left {\n    text-align: left;\n  }\n  .text-right {\n    text-align: right;\n  }\n  .align-top {\n    vertical-align: top;\n  }\n  .font-\\[inherit\\] {\n    font-family: inherit;\n  }\n  .text-lg {\n    font-size: var(--text-lg, 1.125rem);\n    line-height: var(--tw-leading, var(--text-lg--line-height, calc(1.75 / 1.125)));\n  }\n  .text-sm {\n    font-size: var(--text-sm, 0.875rem);\n    line-height: var(--tw-leading, var(--text-sm--line-height, calc(1.25 / 0.875)));\n  }\n  .text-xs {\n    font-size: var(--text-xs, 0.75rem);\n    line-height: var(--tw-leading, var(--text-xs--line-height, calc(1 / 0.75)));\n  }\n  .text-\\[0\\.625rem\\] {\n    font-size: 0.625rem;\n  }\n  .text-\\[0\\.6875rem\\] {\n    font-size: 0.6875rem;\n  }\n  .text-\\[0\\.9375rem\\] {\n    font-size: 0.9375rem;\n  }\n  .leading-5 {\n    --tw-leading: calc(var(--spacing, 0.25rem) * 5);\n    line-height: calc(var(--spacing, 0.25rem) * 5);\n  }\n  .leading-6 {\n    --tw-leading: calc(var(--spacing, 0.25rem) * 6);\n    line-height: calc(var(--spacing, 0.25rem) * 6);\n  }\n  .leading-relaxed {\n    --tw-leading: var(--leading-relaxed, 1.625);\n    line-height: var(--leading-relaxed, 1.625);\n  }\n  .leading-tight {\n    --tw-leading: var(--leading-tight, 1.25);\n    line-height: var(--leading-tight, 1.25);\n  }\n  .font-medium {\n    --tw-font-weight: var(--font-weight-medium, 500);\n    font-weight: var(--font-weight-medium, 500);\n  }\n  .font-normal {\n    --tw-font-weight: var(--font-weight-normal, 400);\n    font-weight: var(--font-weight-normal, 400);\n  }\n  .font-semibold {\n    --tw-font-weight: var(--font-weight-semibold, 600);\n    font-weight: var(--font-weight-semibold, 600);\n  }\n  .break-words {\n    overflow-wrap: break-word;\n  }\n  .break-all {\n    word-break: break-all;\n  }\n  .whitespace-normal {\n    white-space: normal;\n  }\n  .whitespace-nowrap {\n    white-space: nowrap;\n  }\n  .whitespace-pre-wrap {\n    white-space: pre-wrap;\n  }\n  .text-\\(--ui-accent\\) {\n    color: var(--ui-accent);\n  }\n  .text-\\(--ui-bg-editor\\) {\n    color: var(--ui-bg-editor);\n  }\n  .text-\\(--ui-text-primary\\) {\n    color: var(--ui-text-primary);\n  }\n  .text-\\(--ui-text-quaternary\\) {\n    color: var(--ui-text-quaternary);\n  }\n  .text-\\(--ui-text-secondary\\) {\n    color: var(--ui-text-secondary);\n  }\n  .text-\\(--ui-text-tertiary\\) {\n    color: var(--ui-text-tertiary);\n  }\n  .text-amber-600 {\n    color: var(--color-amber-600, oklch(66.6% 0.179 58.318));\n  }\n  .text-destructive {\n    color: var(--dt-destructive);\n  }\n  .text-white {\n    color: var(--color-white, #fff);\n  }\n  .tabular-nums {\n    --tw-numeric-spacing: tabular-nums;\n    font-variant-numeric: var(--tw-ordinal, ) var(--tw-slashed-zero, ) var(--tw-numeric-figure, ) var(--tw-numeric-spacing, ) var(--tw-numeric-fraction, );\n  }\n  .line-through {\n    text-decoration-line: line-through;\n  }\n  .underline {\n    text-decoration-line: underline;\n  }\n  .decoration-amber-600 {\n    text-decoration-color: var(--color-amber-600, oklch(66.6% 0.179 58.318));\n  }\n  .decoration-destructive {\n    text-decoration-color: var(--dt-destructive);\n  }\n  .decoration-2 {\n    text-decoration-thickness: 2px;\n  }\n  .underline-offset-2 {\n    text-underline-offset: 2px;\n  }\n  .opacity-0 {\n    opacity: 0%;\n  }\n  .opacity-45 {\n    opacity: 45%;\n  }\n  .opacity-60 {\n    opacity: 60%;\n  }\n  .shadow-md {\n    --tw-shadow: 0 0 0 0.0625rem var(--tw-shadow-color, var(--dt-foreground)), 0 0.25rem 1rem var(--tw-shadow-color, color-mix(in srgb, #000 8%, transparent)), 0 1rem 2rem -1.5rem var(--tw-shadow-color, color-mix(in srgb, #000 18%, transparent));\n    @supports (color: color-mix(in lab, red, red)) {\n      --tw-shadow: 0 0 0 0.0625rem var(--tw-shadow-color, color-mix(in srgb, var(--dt-foreground) 8%, transparent)), 0 0.25rem 1rem var(--tw-shadow-color, color-mix(in srgb, #000 8%, transparent)), 0 1rem 2rem -1.5rem var(--tw-shadow-color, color-mix(in srgb, #000 18%, transparent));\n    }\n    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);\n  }\n  .shadow-sm {\n    --tw-shadow: 0 0 0 0.0625rem var(--tw-shadow-color, var(--dt-foreground)), 0 0.125rem 0.5rem var(--tw-shadow-color, color-mix(in srgb, #000 4%, transparent));\n    @supports (color: color-mix(in lab, red, red)) {\n      --tw-shadow: 0 0 0 0.0625rem var(--tw-shadow-color, color-mix(in srgb, var(--dt-foreground) 6%, transparent)), 0 0.125rem 0.5rem var(--tw-shadow-color, color-mix(in srgb, #000 4%, transparent));\n    }\n    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);\n  }\n  .outline {\n    outline-style: var(--tw-outline-style);\n    outline-width: 1px;\n  }\n  .backdrop-blur-\\[0\\.125rem\\] {\n    --tw-backdrop-blur: blur(0.125rem);\n    -webkit-backdrop-filter: var(--tw-backdrop-blur, ) var(--tw-backdrop-brightness, ) var(--tw-backdrop-contrast, ) var(--tw-backdrop-grayscale, ) var(--tw-backdrop-hue-rotate, ) var(--tw-backdrop-invert, ) var(--tw-backdrop-opacity, ) var(--tw-backdrop-saturate, ) var(--tw-backdrop-sepia, );\n    backdrop-filter: var(--tw-backdrop-blur, ) var(--tw-backdrop-brightness, ) var(--tw-backdrop-contrast, ) var(--tw-backdrop-grayscale, ) var(--tw-backdrop-hue-rotate, ) var(--tw-backdrop-invert, ) var(--tw-backdrop-opacity, ) var(--tw-backdrop-saturate, ) var(--tw-backdrop-sepia, );\n  }\n  .transition {\n    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events;\n    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function, cubic-bezier(0.4, 0, 0.2, 1)));\n    transition-duration: var(--tw-duration, var(--default-transition-duration, 150ms));\n  }\n  .outline-none {\n    --tw-outline-style: none;\n    outline-style: none;\n  }\n  .select-none {\n    -webkit-user-select: none;\n    user-select: none;\n  }\n  :is(:where(.group):hover .group-hover\\:text-\\(--ui-text-primary\\)) {\n    color: var(--ui-text-primary);\n  }\n  :is(:where(.group):hover .group-hover\\:text-\\(--ui-text-secondary\\)) {\n    color: var(--ui-text-secondary);\n  }\n  .file\\:mr-2::file-selector-button {\n    margin-right: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .file\\:rounded-md::file-selector-button {\n    border-radius: calc(var(--radius-scalar) * 0.625rem);\n  }\n  .file\\:border::file-selector-button {\n    border-style: var(--tw-border-style);\n    border-width: 1px;\n  }\n  .file\\:border-\\(--ui-stroke-secondary\\)::file-selector-button {\n    border-color: var(--ui-stroke-secondary);\n  }\n  .file\\:bg-\\(--ui-bg-quinary\\)::file-selector-button {\n    background-color: var(--ui-bg-quinary);\n  }\n  .file\\:px-2::file-selector-button {\n    padding-inline: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .file\\:py-1::file-selector-button {\n    padding-block: var(--spacing, 0.25rem);\n  }\n  .file\\:text-xs::file-selector-button {\n    font-size: var(--text-xs, 0.75rem);\n    line-height: var(--tw-leading, var(--text-xs--line-height, calc(1 / 0.75)));\n  }\n  .file\\:text-\\(--ui-text-primary\\)::file-selector-button {\n    color: var(--ui-text-primary);\n  }\n  .hover\\:bg-\\(--ui-accent\\):hover {\n    background-color: var(--ui-accent);\n  }\n  .hover\\:bg-\\(--ui-bg-quinary\\):hover {\n    background-color: var(--ui-bg-quinary);\n  }\n  .focus-visible\\:outline-2:focus-visible {\n    outline-style: var(--tw-outline-style);\n    outline-width: 2px;\n  }\n  .focus-visible\\:-outline-offset-2:focus-visible {\n    outline-offset: calc(2px * -1);\n  }\n  .focus-visible\\:outline-\\(--ui-accent\\):focus-visible {\n    outline-color: var(--ui-accent);\n  }\n  .disabled\\:cursor-default:disabled {\n    cursor: default;\n  }\n  @media (width >= 48rem) {\n    .md\\:grid-cols-\\[10rem_minmax\\(0\\,1fr\\)\\] {\n      grid-template-columns: 10rem minmax(0,1fr);\n    }\n    .md\\:grid-cols-\\[minmax\\(0\\,1\\.4fr\\)_minmax\\(10rem\\,0\\.8fr\\)\\] {\n      grid-template-columns: minmax(0,1.4fr) minmax(10rem,0.8fr);\n    }\n  }\n  .dark\\:text-amber-300:is(.dark *) {\n    color: var(--color-amber-300, oklch(87.9% 0.169 91.605));\n  }\n  .dark\\:decoration-amber-300:is(.dark *) {\n    text-decoration-color: var(--color-amber-300, oklch(87.9% 0.169 91.605));\n  }\n  .\\[\\&_h1\\]\\:mb-2 h1 {\n    margin-bottom: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .\\[\\&_h1\\]\\:text-base h1 {\n    font-size: var(--text-base, 1rem);\n    line-height: var(--tw-leading, var(--text-base--line-height, calc(1.5 / 1)));\n  }\n  .\\[\\&_h1\\]\\:font-semibold h1 {\n    --tw-font-weight: var(--font-weight-semibold, 600);\n    font-weight: var(--font-weight-semibold, 600);\n  }\n  .\\[\\&_h2\\]\\:mt-3 h2 {\n    margin-top: calc(var(--spacing, 0.25rem) * 3);\n  }\n  .\\[\\&_h2\\]\\:mb-1 h2 {\n    margin-bottom: var(--spacing, 0.25rem);\n  }\n  .\\[\\&_h2\\]\\:text-sm h2 {\n    font-size: var(--text-sm, 0.875rem);\n    line-height: var(--tw-leading, var(--text-sm--line-height, calc(1.25 / 0.875)));\n  }\n  .\\[\\&_h2\\]\\:font-medium h2 {\n    --tw-font-weight: var(--font-weight-medium, 500);\n    font-weight: var(--font-weight-medium, 500);\n  }\n  .\\[\\&_li\\]\\:my-0\\.5 li {\n    margin-block: calc(var(--spacing, 0.25rem) * 0.5);\n  }\n  .\\[\\&_p\\]\\:my-1 p {\n    margin-block: var(--spacing, 0.25rem);\n  }\n  .\\[\\&_strong\\]\\:font-semibold strong {\n    --tw-font-weight: var(--font-weight-semibold, 600);\n    font-weight: var(--font-weight-semibold, 600);\n  }\n  .\\[\\&_table\\]\\:my-2 table {\n    margin-block: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .\\[\\&_table\\]\\:w-full table {\n    width: 100%;\n  }\n  .\\[\\&_table\\]\\:border-collapse table {\n    border-collapse: collapse;\n  }\n  .\\[\\&_td\\]\\:border td {\n    border-style: var(--tw-border-style);\n    border-width: 1px;\n  }\n  .\\[\\&_td\\]\\:border-\\(--ui-stroke-secondary\\) td {\n    border-color: var(--ui-stroke-secondary);\n  }\n  .\\[\\&_td\\]\\:px-2 td {\n    padding-inline: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .\\[\\&_td\\]\\:py-1 td {\n    padding-block: var(--spacing, 0.25rem);\n  }\n  .\\[\\&_th\\]\\:border th {\n    border-style: var(--tw-border-style);\n    border-width: 1px;\n  }\n  .\\[\\&_th\\]\\:border-\\(--ui-stroke-secondary\\) th {\n    border-color: var(--ui-stroke-secondary);\n  }\n  .\\[\\&_th\\]\\:px-2 th {\n    padding-inline: calc(var(--spacing, 0.25rem) * 2);\n  }\n  .\\[\\&_th\\]\\:py-1 th {\n    padding-block: var(--spacing, 0.25rem);\n  }\n  .\\[\\&_th\\]\\:text-left th {\n    text-align: left;\n  }\n  .\\[\\&_ul\\]\\:my-1 ul {\n    margin-block: var(--spacing, 0.25rem);\n  }\n  .\\[\\&_ul\\]\\:list-disc ul {\n    list-style-type: disc;\n  }\n  .\\[\\&_ul\\]\\:pl-4 ul {\n    padding-left: calc(var(--spacing, 0.25rem) * 4);\n  }\n}\n@property --tw-translate-x {\n  syntax: "*";\n  inherits: false;\n  initial-value: 0;\n}\n@property --tw-translate-y {\n  syntax: "*";\n  inherits: false;\n  initial-value: 0;\n}\n@property --tw-translate-z {\n  syntax: "*";\n  inherits: false;\n  initial-value: 0;\n}\n@property --tw-rotate-x {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-rotate-y {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-rotate-z {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-skew-x {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-skew-y {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-border-style {\n  syntax: "*";\n  inherits: false;\n  initial-value: solid;\n}\n@property --tw-leading {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-font-weight {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-ordinal {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-slashed-zero {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-numeric-figure {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-numeric-spacing {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-numeric-fraction {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-shadow {\n  syntax: "*";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-shadow-color {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-shadow-alpha {\n  syntax: "<percentage>";\n  inherits: false;\n  initial-value: 100%;\n}\n@property --tw-inset-shadow {\n  syntax: "*";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-inset-shadow-color {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-inset-shadow-alpha {\n  syntax: "<percentage>";\n  inherits: false;\n  initial-value: 100%;\n}\n@property --tw-ring-color {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-ring-shadow {\n  syntax: "*";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-inset-ring-color {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-inset-ring-shadow {\n  syntax: "*";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-ring-inset {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-ring-offset-width {\n  syntax: "<length>";\n  inherits: false;\n  initial-value: 0px;\n}\n@property --tw-ring-offset-color {\n  syntax: "*";\n  inherits: false;\n  initial-value: #fff;\n}\n@property --tw-ring-offset-shadow {\n  syntax: "*";\n  inherits: false;\n  initial-value: 0 0 #0000;\n}\n@property --tw-outline-style {\n  syntax: "*";\n  inherits: false;\n  initial-value: solid;\n}\n@property --tw-backdrop-blur {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-backdrop-brightness {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-backdrop-contrast {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-backdrop-grayscale {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-backdrop-hue-rotate {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-backdrop-invert {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-backdrop-opacity {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-backdrop-saturate {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-backdrop-sepia {\n  syntax: "*";\n  inherits: false;\n}\n@layer properties {\n  @supports ((-webkit-hyphens: none) and (not (margin-trim: block))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b)))) {\n    *, ::before, ::after, ::backdrop {\n      --tw-translate-x: 0;\n      --tw-translate-y: 0;\n      --tw-translate-z: 0;\n      --tw-rotate-x: initial;\n      --tw-rotate-y: initial;\n      --tw-rotate-z: initial;\n      --tw-skew-x: initial;\n      --tw-skew-y: initial;\n      --tw-border-style: solid;\n      --tw-leading: initial;\n      --tw-font-weight: initial;\n      --tw-ordinal: initial;\n      --tw-slashed-zero: initial;\n      --tw-numeric-figure: initial;\n      --tw-numeric-spacing: initial;\n      --tw-numeric-fraction: initial;\n      --tw-shadow: 0 0 #0000;\n      --tw-shadow-color: initial;\n      --tw-shadow-alpha: 100%;\n      --tw-inset-shadow: 0 0 #0000;\n      --tw-inset-shadow-color: initial;\n      --tw-inset-shadow-alpha: 100%;\n      --tw-ring-color: initial;\n      --tw-ring-shadow: 0 0 #0000;\n      --tw-inset-ring-color: initial;\n      --tw-inset-ring-shadow: 0 0 #0000;\n      --tw-ring-inset: initial;\n      --tw-ring-offset-width: 0px;\n      --tw-ring-offset-color: #fff;\n      --tw-ring-offset-shadow: 0 0 #0000;\n      --tw-outline-style: solid;\n      --tw-backdrop-blur: initial;\n      --tw-backdrop-brightness: initial;\n      --tw-backdrop-contrast: initial;\n      --tw-backdrop-grayscale: initial;\n      --tw-backdrop-hue-rotate: initial;\n      --tw-backdrop-invert: initial;\n      --tw-backdrop-opacity: initial;\n      --tw-backdrop-saturate: initial;\n      --tw-backdrop-sepia: initial;\n    }\n  }\n}\n';

// src/inject-css.ts
var STYLE_ID = "hermes-workbench-css";
function injectPluginCss(ctx) {
  if (typeof document === "undefined") return;
  document.getElementById(STYLE_ID)?.remove();
  if (!hermes_workbench_css_default) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = hermes_workbench_css_default;
  document.head.appendChild(style);
  ctx.onDispose?.(() => {
    style.remove();
  });
}

// src/api/campaign-count.ts
import { useSyncExternalStore as useSyncExternalStore2 } from "react";

// src/settings.ts
import { useSyncExternalStore } from "react";
var STORAGE_KEY = "hermes-workbench:api-base";
var DEFAULT_API_BASE = "http://127.0.0.1:8000";
function readStoredBase() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && raw.trim()) return raw.trim().replace(/\/$/, "");
  } catch {
  }
  return DEFAULT_API_BASE;
}
var currentBase = readStoredBase();
var listeners = /* @__PURE__ */ new Set();
function emit() {
  for (const listener of listeners) listener();
}
function getApiBase() {
  return currentBase;
}
function subscribeApiBase(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function useApiBase() {
  return useSyncExternalStore(subscribeApiBase, getApiBase, () => DEFAULT_API_BASE);
}
function setApiBase(next) {
  const trimmed = next.trim().replace(/\/$/, "");
  const value = trimmed || DEFAULT_API_BASE;
  if (!/^https?:\/\/.+/i.test(value)) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
  }
  if (value === currentBase) return true;
  currentBase = value;
  emit();
  return true;
}

// src/api/client.ts
var ApiError = class extends Error {
  kind;
  status;
  code;
  constructor(message, kind, status, code) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
  }
};
function isOfflineError(error) {
  return error instanceof ApiError && error.kind === "network";
}
var DEFAULT_TIMEOUT_MS = 2e4;
async function apiFetch(path, init = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers: initHeaders, ...rest2 } = init;
  const controller = new AbortController();
  const timer9 = setTimeout(() => controller.abort(), timeoutMs);
  const headers = new Headers(initHeaders);
  const isForm = typeof FormData !== "undefined" && rest2.body instanceof FormData;
  if (rest2.body != null && !isForm && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  try {
    const base = getApiBase().replace(/\/$/, "");
    const response = await fetch(`${base}${path}`, {
      ...rest2,
      headers,
      signal: controller.signal
    });
    const text = await response.text();
    const body = text ? parseJson(text) : null;
    if (!response.ok) {
      const record = asRecord(body);
      const errorRecord = asRecord(record?.error);
      const message = typeof errorRecord?.message === "string" ? errorRecord.message : `\u8BF7\u6C42\u5931\u8D25\uFF08${response.status}\uFF09`;
      const code = typeof errorRecord?.code === "string" ? errorRecord.code : void 0;
      throw new ApiError(message, "http", response.status, code);
    }
    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isAbort(error)) {
      throw new ApiError("\u8BF7\u6C42\u8D85\u65F6", "network");
    }
    throw new ApiError("\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1", "network");
  } finally {
    clearTimeout(timer9);
  }
}
function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
function asRecord(value) {
  if (value && typeof value === "object") return value;
  return null;
}
function isAbort(error) {
  return error instanceof DOMException && error.name === "AbortError";
}

// src/api/brand.ts
function queryString(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === void 0 || value === "") continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}
function listBrandGuides() {
  return apiFetch("/api/brand-guides");
}
function getBrandGuide(brand) {
  return apiFetch(`/api/brand-guides/${encodeURIComponent(brand)}`);
}
function saveBrandGuide(brand, body) {
  return apiFetch(`/api/brand-guides/${encodeURIComponent(brand)}`, {
    method: "PUT",
    body: JSON.stringify(body)
  });
}
function listBannedWords() {
  return apiFetch("/api/banned-words");
}
function createBannedWord(body) {
  return apiFetch("/api/banned-words", { method: "POST", body: JSON.stringify(body) });
}
function patchBannedWord(id, patch) {
  return apiFetch(`/api/banned-words/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}
function deleteBannedWord(id) {
  return apiFetch(`/api/banned-words/${id}`, { method: "DELETE" });
}
function checkCompliance(text) {
  return apiFetch("/api/compliance/check", {
    method: "POST",
    body: JSON.stringify({ text })
  });
}
function listProductCards(query = {}) {
  return apiFetch(`/api/product-cards${queryString(query)}`);
}
function createProductCard(body) {
  return apiFetch("/api/product-cards", { method: "POST", body: JSON.stringify(body) });
}
function patchProductCard(id, patch) {
  return apiFetch(`/api/product-cards/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}
function listCampaignTemplates() {
  return apiFetch("/api/campaign-templates");
}
function listCampaigns(query = {}) {
  return apiFetch(`/api/campaigns${queryString(query)}`);
}
function getCampaign(id) {
  return apiFetch(`/api/campaigns/${id}`);
}
function createCampaign(body) {
  return apiFetch("/api/campaigns", { method: "POST", body: JSON.stringify(body) });
}
function patchCampaign(id, patch) {
  return apiFetch(`/api/campaigns/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}
function createCampaignTask(campaignId, body) {
  return apiFetch(`/api/campaigns/${campaignId}/tasks`, {
    method: "POST",
    body: JSON.stringify(body)
  });
}
function patchCampaignTask(id, patch) {
  return apiFetch(`/api/campaign-tasks/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}
function deleteCampaignTask(id) {
  return apiFetch(`/api/campaign-tasks/${id}`, { method: "DELETE" });
}
function getCampaignReview(id) {
  return apiFetch(`/api/campaigns/${id}/review`);
}

// src/api/campaign-count.ts
var POLL_MS = 6e4;
var running;
var listeners2 = /* @__PURE__ */ new Set();
var timer;
var started = false;
function emit2() {
  for (const listener of listeners2) listener();
}
function setRunning(next) {
  if (next === running) return;
  running = next;
  emit2();
}
function getRunningCampaignCount() {
  return running;
}
function useRunningCampaignCount() {
  return useSyncExternalStore2(
    (listener) => {
      listeners2.add(listener);
      return () => listeners2.delete(listener);
    },
    getRunningCampaignCount,
    () => void 0
  );
}
async function refreshRunningCampaignCount() {
  try {
    const campaigns = await listCampaigns();
    setRunning(campaigns.filter((item) => item.phase === "running").length);
  } catch {
    setRunning(void 0);
  }
}
function ensureRunningCampaignPolling() {
  if (started || typeof window === "undefined") return;
  started = true;
  void refreshRunningCampaignCount();
  timer = window.setInterval(() => {
    void refreshRunningCampaignCount();
  }, POLL_MS);
  subscribeApiBase(() => {
    void refreshRunningCampaignCount();
  });
}

// src/api/content-count.ts
import { useSyncExternalStore as useSyncExternalStore3 } from "react";

// src/api/contents.ts
function queryString2(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === void 0 || value === "") continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}
function listContents(query = {}) {
  return apiFetch(`/api/contents${queryString2(query)}`);
}
function getContent(id) {
  return apiFetch(`/api/contents/${id}`);
}
function createContent(body) {
  return apiFetch("/api/contents", { method: "POST", body: JSON.stringify(body) });
}
function updateContent(id, patch) {
  return apiFetch(`/api/contents/${id}`, { method: "PUT", body: JSON.stringify(patch) });
}
function submitContent(id, body = {}) {
  return apiFetch(`/api/contents/${id}/submit`, { method: "POST", body: JSON.stringify(body) });
}
function withdrawContent(id, body = {}) {
  return apiFetch(`/api/contents/${id}/withdraw`, { method: "POST", body: JSON.stringify(body) });
}
function approveContent(id, body = {}) {
  return apiFetch(`/api/contents/${id}/approve`, { method: "POST", body: JSON.stringify(body) });
}
function rejectContent(id, body) {
  return apiFetch(`/api/contents/${id}/reject`, { method: "POST", body: JSON.stringify(body) });
}
function publishContent(id, body) {
  return apiFetch(`/api/contents/${id}/publish`, { method: "POST", body: JSON.stringify(body) });
}
function createComment(id, body) {
  return apiFetch(`/api/contents/${id}/comments`, { method: "POST", body: JSON.stringify(body) });
}
function patchComment(id, resolved) {
  return apiFetch(`/api/content-comments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ resolved })
  });
}
function diffContent(id, query) {
  return apiFetch(`/api/contents/${id}/diff${queryString2(query)}`);
}

// src/api/content-count.ts
var POLL_MS2 = 6e4;
var inReview;
var listeners3 = /* @__PURE__ */ new Set();
var timer2;
var started2 = false;
function emit3() {
  for (const listener of listeners3) listener();
}
function setInReview(next) {
  if (next === inReview) return;
  inReview = next;
  emit3();
}
function getInReviewCount() {
  return inReview;
}
function useInReviewCount() {
  return useSyncExternalStore3(
    (listener) => {
      listeners3.add(listener);
      return () => listeners3.delete(listener);
    },
    getInReviewCount,
    () => void 0
  );
}
async function refreshInReviewCount() {
  try {
    const items = await listContents({ status: "in_review" });
    setInReview(items.length);
  } catch {
    setInReview(void 0);
  }
}
function ensureInReviewPolling() {
  if (started2 || typeof window === "undefined") return;
  started2 = true;
  void refreshInReviewCount();
  timer2 = window.setInterval(() => {
    void refreshInReviewCount();
  }, POLL_MS2);
  subscribeApiBase(() => {
    void refreshInReviewCount();
  });
}

// src/api/design-count.ts
import { useSyncExternalStore as useSyncExternalStore4 } from "react";

// src/api/design.ts
function queryString3(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === void 0 || value === "") continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}
function assetSrc(url) {
  if (/^https?:\/\//i.test(url)) return url;
  return `${getApiBase()}${url.startsWith("/") ? url : `/${url}`}`;
}
function assetDownloadUrl(url) {
  const src = assetSrc(url);
  return `${src}${src.includes("?") ? "&" : "?"}download=true`;
}
function getDesignSummary(brand) {
  return apiFetch(`/api/design-requests/summary${queryString3({ brand })}`);
}
function listDesignRequests(query = {}) {
  return apiFetch(
    `/api/design-requests${queryString3({
      status: query.status,
      brand: query.brand,
      kind: query.kind,
      campaign_id: query.campaign_id,
      q: query.q
    })}`
  );
}
function getDesignRequest(id) {
  return apiFetch(`/api/design-requests/${id}`);
}
function createDesignRequest(body) {
  return apiFetch("/api/design-requests", {
    method: "POST",
    body: JSON.stringify(body)
  });
}
function patchDesignRequest(id, body) {
  return apiFetch(`/api/design-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}
function setDesignStatus(id, body) {
  return apiFetch(`/api/design-requests/${id}/status`, {
    method: "POST",
    body: JSON.stringify(body)
  });
}
function uploadRequestAsset(id, file, role, by) {
  const body = new FormData();
  body.set("file", file);
  body.set("role", role);
  if (by) body.set("by", by);
  return apiFetch(`/api/design-requests/${id}/assets`, {
    method: "POST",
    body,
    timeoutMs: 6e4
  });
}
function finalizeDesign(id, assetIds, by) {
  return apiFetch(`/api/design-requests/${id}/finalize`, {
    method: "POST",
    body: JSON.stringify({ asset_ids: assetIds, by: by ?? null })
  });
}
function addDesignComment(id, body) {
  return apiFetch(`/api/design-requests/${id}/comments`, {
    method: "POST",
    body: JSON.stringify(body)
  });
}
function resolveDesignComment(id, resolved) {
  return apiFetch(`/api/design-comments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ resolved })
  });
}
function listLibraryAssets(query = {}) {
  return apiFetch(
    `/api/assets${queryString3({
      brand: query.brand,
      product_code: query.product_code,
      campaign_id: query.campaign_id,
      kind: query.kind,
      q: query.q
    })}`
  );
}
function uploadLibraryAsset(file, fields) {
  const body = new FormData();
  body.set("file", file);
  if (fields.brand) body.set("brand", fields.brand);
  if (fields.product_code) body.set("product_code", fields.product_code);
  if (fields.tags) body.set("tags", fields.tags);
  if (fields.by) body.set("by", fields.by);
  return apiFetch("/api/assets", { method: "POST", body, timeoutMs: 6e4 });
}
function patchAsset(id, body) {
  return apiFetch(`/api/assets/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}
function deleteAsset(id) {
  return apiFetch(`/api/assets/${id}`, { method: "DELETE" });
}

// src/api/design-count.ts
var POLL_MS3 = 6e4;
var needsAction;
var listeners4 = /* @__PURE__ */ new Set();
var timer3;
var started3 = false;
function emit4() {
  for (const listener of listeners4) listener();
}
function setNeedsAction(next) {
  if (next === needsAction) return;
  needsAction = next;
  emit4();
}
function getDesignNeedsActionCount() {
  return needsAction;
}
function useDesignNeedsActionCount() {
  return useSyncExternalStore4(
    (listener) => {
      listeners4.add(listener);
      return () => listeners4.delete(listener);
    },
    getDesignNeedsActionCount,
    () => void 0
  );
}
async function refreshDesignNeedsActionCount() {
  try {
    const summary = await getDesignSummary();
    setNeedsAction(summary.needs_action);
  } catch {
    setNeedsAction(void 0);
  }
}
function ensureDesignNeedsActionPolling() {
  if (started3 || typeof window === "undefined") return;
  started3 = true;
  void refreshDesignNeedsActionCount();
  timer3 = window.setInterval(() => {
    void refreshDesignNeedsActionCount();
  }, POLL_MS3);
  subscribeApiBase(() => {
    void refreshDesignNeedsActionCount();
  });
}

// src/api/video-count.ts
import { useSyncExternalStore as useSyncExternalStore5 } from "react";

// src/api/video.ts
function queryString4(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === void 0 || value === "") continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}
function mediaSrc(url) {
  if (/^https?:\/\//i.test(url)) return url;
  return `${getApiBase()}${url.startsWith("/") ? url : `/${url}`}`;
}
function packageUrl(id) {
  return `${getApiBase().replace(/\/$/, "")}/api/video-projects/${id}/package`;
}
function subtitlesUrl(id) {
  return `${getApiBase().replace(/\/$/, "")}/api/video-projects/${id}/subtitles.srt`;
}
function getVideoSummary() {
  return apiFetch("/api/video-projects/summary");
}
function listVideoProjects(query = {}) {
  return apiFetch(
    `/api/video-projects${queryString4({
      status: query.status,
      brand: query.brand,
      campaign_id: query.campaign_id,
      q: query.q
    })}`
  );
}
function getVideoProject(id) {
  return apiFetch(`/api/video-projects/${id}`);
}
function createVideoProject(body) {
  return apiFetch("/api/video-projects", { method: "POST", body: JSON.stringify(body) });
}
function saveShots(id, shots) {
  return apiFetch(`/api/video-projects/${id}/shots`, {
    method: "PUT",
    body: JSON.stringify({ shots })
  });
}
function uploadShotMedia(id, seq, slot, file, by) {
  const form = new FormData();
  form.set("file", file);
  form.set("slot", slot);
  if (by) form.set("by", by);
  return apiFetch(`/api/video-projects/${id}/shots/${seq}/media`, { method: "POST", body: form });
}
function uploadBgm(id, file, by) {
  const form = new FormData();
  form.set("file", file);
  if (by) form.set("by", by);
  return apiFetch(`/api/video-projects/${id}/bgm`, { method: "POST", body: form });
}
function uploadFinal(id, file, by) {
  const form = new FormData();
  form.set("file", file);
  if (by) form.set("by", by);
  return apiFetch(`/api/video-projects/${id}/final`, { method: "POST", body: form });
}
function action(id, name, body) {
  return apiFetch(`/api/video-projects/${id}/${name}`, {
    method: "POST",
    body: JSON.stringify({ by: body.by ?? null, note: body.note ?? null })
  });
}
function submitVideo(id, by) {
  return action(id, "submit", { by });
}
function approveVideo(id, by) {
  return action(id, "approve", { by });
}
function rejectVideo(id, by, note) {
  return action(id, "reject", { by, note });
}
function withdrawVideo(id, by) {
  return action(id, "withdraw", { by });
}
function cancelVideo(id, by) {
  return action(id, "cancel", { by });
}
function getTimeline(id) {
  return apiFetch(`/api/video-projects/${id}/timeline`);
}

// src/api/video-count.ts
var POLL_MS4 = 6e4;
var needsAction2;
var listeners5 = /* @__PURE__ */ new Set();
var timer4;
var started4 = false;
function emit5() {
  for (const listener of listeners5) listener();
}
function setNeedsAction2(next) {
  if (next === needsAction2) return;
  needsAction2 = next;
  emit5();
}
function getVideoNeedsActionCount() {
  return needsAction2;
}
function useVideoNeedsActionCount() {
  return useSyncExternalStore5(
    (listener) => {
      listeners5.add(listener);
      return () => listeners5.delete(listener);
    },
    getVideoNeedsActionCount,
    () => void 0
  );
}
async function refreshVideoNeedsActionCount() {
  try {
    const summary = await getVideoSummary();
    setNeedsAction2(summary.needs_action);
  } catch {
    setNeedsAction2(void 0);
  }
}
function ensureVideoNeedsActionPolling() {
  if (started4 || typeof window === "undefined") return;
  started4 = true;
  void refreshVideoNeedsActionCount();
  timer4 = window.setInterval(() => {
    void refreshVideoNeedsActionCount();
  }, POLL_MS4);
  subscribeApiBase(() => {
    void refreshVideoNeedsActionCount();
  });
}

// src/pages/assets/AssetsPage.tsx
import { useEffect as useEffect6, useState as useState6 } from "react";
import {
  Badge,
  Button as Button6,
  ConfirmDialog,
  EmptyState as EmptyState2,
  ErrorState,
  Input as Input3,
  Loader as Loader2,
  SearchField,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch as Switch2,
  Textarea as Textarea3
} from "@hermes/plugin-sdk";

// src/api/products.ts
function queryString5(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === void 0 || value === "") continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}
function listShops() {
  return apiFetch("/api/shops");
}
function createShop(input) {
  return apiFetch("/api/shops", { method: "POST", body: JSON.stringify(input) });
}
function listProducts(query = {}) {
  return apiFetch(
    `/api/products${queryString5({
      shop_id: query.shop_id,
      brand: query.brand,
      q: query.q,
      has_issue: query.has_issue,
      issue_level: query.issue_level,
      page: query.page,
      page_size: query.pageSize
    })}`
  );
}
function listIssues(query = {}) {
  return apiFetch(
    `/api/issues${queryString5({
      status: query.status,
      level: query.level,
      shop_id: query.shop_id,
      product_id: query.product_id
    })}`
  );
}
function getIssueSummary(shopId) {
  return apiFetch(`/api/issues/summary${queryString5({ shop_id: shopId })}`);
}
function patchIssue(id, patch) {
  return apiFetch(`/api/issues/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
}
function listRules() {
  return apiFetch("/api/rules");
}
function patchRule(id, patch) {
  return apiFetch(`/api/rules/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
}
function runRules() {
  return apiFetch("/api/rules/run", { method: "POST" });
}
function getFolderImport() {
  return apiFetch("/api/import/folder");
}
function scanFolderImport() {
  return apiFetch("/api/import/folder/scan", { method: "POST", timeoutMs: 6e4 });
}
function importProducts(shopId, file) {
  const body = new FormData();
  body.set("shop_id", String(shopId));
  body.set("file", file);
  return apiFetch("/api/import/products", {
    method: "POST",
    body,
    timeoutMs: 6e4
  });
}
async function listProductsForView(args) {
  const level = args.segment === "must" || args.segment === "warn" ? args.segment : void 0;
  return listProducts({
    shop_id: args.shopId,
    q: args.q?.trim() || void 0,
    has_issue: args.segment === "issue" ? true : void 0,
    issue_level: level,
    page: args.page,
    pageSize: args.pageSize
  });
}

// src/api/useQuery.ts
import { useEffect, useRef, useState } from "react";
function useQuery(queryFn, deps) {
  const fnRef = useRef(queryFn);
  fnRef.current = queryFn;
  const depsKey = JSON.stringify(deps);
  const [data, setData] = useState(void 0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const depsKeyRef = useRef(depsKey);
  useEffect(() => {
    const depsChanged = depsKeyRef.current !== depsKey;
    depsKeyRef.current = depsKey;
    let cancelled = false;
    if (depsChanged) setData(void 0);
    setLoading(true);
    setError(null);
    fnRef.current().then(
      (value) => {
        if (cancelled) return;
        setData(value);
        setLoading(false);
      },
      (reason) => {
        if (cancelled) return;
        setError(reason);
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [depsKey, tick]);
  return {
    data,
    error,
    loading,
    reload: () => setTick((value) => value + 1)
  };
}

// src/pages/HeaderActions.tsx
import { useLayoutEffect, useRef as useRef2 } from "react";
import { jsx } from "react/jsx-runtime";
function HeaderActions({ children }) {
  const placeholder = useRef2(null);
  const holder = useRef2(null);
  useLayoutEffect(() => {
    const node = holder.current;
    const anchor = placeholder.current;
    const slot = document.querySelector('[data-slot="actions"]');
    if (!node || !anchor || !(slot instanceof HTMLElement)) return;
    slot.appendChild(node);
    return () => {
      if (anchor.isConnected) anchor.appendChild(node);
      else node.remove();
    };
  }, []);
  return /* @__PURE__ */ jsx("span", { ref: placeholder, className: "contents", children: /* @__PURE__ */ jsx("div", { ref: holder, className: "flex shrink-0 items-center gap-2", children }) });
}

// src/pages/OfflineNotice.tsx
import { useEffect as useEffect2, useState as useState3 } from "react";
import { Button as Button2, Loader } from "@hermes/plugin-sdk";

// src/pages/EmptyBlock.tsx
import { EmptyState } from "@hermes/plugin-sdk";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function EmptyBlock({
  title,
  description,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
    /* @__PURE__ */ jsx2(EmptyState, { title, description, className: "min-h-0" }),
    children ? /* @__PURE__ */ jsx2("div", { className: "flex flex-wrap items-center justify-center gap-2", children }) : null
  ] });
}

// src/api/alert-count.ts
import { useSyncExternalStore as useSyncExternalStore6 } from "react";

// src/api/overview.ts
function qs(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === void 0 || value === "") continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}
function getOverview(args) {
  return apiFetch(`/api/overview${qs({ date: args.date, shop_id: args.shopId })}`);
}
function getTrend(args) {
  return apiFetch(
    `/api/overview/trend${qs({ metric: args.metric, days: args.days, shop_id: args.shopId, date: args.date })}`
  );
}
function listAdSpend(args) {
  return apiFetch(
    `/api/ad-spend${qs({ date_from: args.dateFrom, date_to: args.dateTo, shop_id: args.shopId })}`
  );
}
function listAlerts(args = {}) {
  return apiFetch(`/api/alerts${qs({ status: args.status, shop_id: args.shopId })}`);
}
function getAlertSummary() {
  return apiFetch("/api/alerts/summary");
}
function patchAlert(id, patch) {
  return apiFetch(`/api/alerts/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}
function listAdRules() {
  return apiFetch("/api/ad-rules");
}
function patchAdRule(id, patch) {
  return apiFetch(`/api/ad-rules/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}
function runAdRules() {
  return apiFetch("/api/ad-rules/run", { method: "POST" });
}
function getDailyReport(date) {
  return apiFetch(`/api/reports/daily${qs({ date })}`);
}
function upload(path, shopId, file) {
  const body = new FormData();
  body.set("shop_id", String(shopId));
  body.set("file", file);
  return apiFetch(path, { method: "POST", body, timeoutMs: 6e4 });
}
function importMetrics(shopId, file) {
  return upload("/api/import/metrics", shopId, file);
}
function importAdSpend(shopId, file) {
  return upload("/api/import/ad-spend", shopId, file);
}

// src/api/alert-count.ts
var POLL_MS5 = 6e4;
var total;
var listeners6 = /* @__PURE__ */ new Set();
var timer5;
var started5 = false;
function emit6() {
  for (const listener of listeners6) listener();
}
function setTotal(next) {
  if (next === total) return;
  total = next;
  emit6();
}
function getOpenAlertCount() {
  return total;
}
function subscribeOpenAlertCount(listener) {
  listeners6.add(listener);
  return () => {
    listeners6.delete(listener);
  };
}
function useOpenAlertCount() {
  return useSyncExternalStore6(subscribeOpenAlertCount, getOpenAlertCount, () => void 0);
}
async function refreshOpenAlertCount() {
  try {
    const summary = await getAlertSummary();
    setTotal(summary.total_open);
  } catch {
    setTotal(void 0);
  }
}
function ensureOpenAlertPolling() {
  if (started5 || typeof window === "undefined") return;
  started5 = true;
  void refreshOpenAlertCount();
  timer5 = window.setInterval(() => {
    void refreshOpenAlertCount();
  }, POLL_MS5);
  subscribeApiBase(() => {
    void refreshOpenAlertCount();
  });
}

// src/api/inquiry-count.ts
import { useSyncExternalStore as useSyncExternalStore7 } from "react";

// src/api/customers.ts
function queryString6(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === void 0 || value === "") continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}
function getSegmentSummary() {
  return apiFetch("/api/customers/segments");
}
function listCustomers(query = {}) {
  return apiFetch(
    `/api/customers${queryString6({
      segment: query.segment,
      kind: query.kind,
      q: query.q,
      page: query.page,
      page_size: query.page_size
    })}`
  );
}
function getCustomer(id) {
  return apiFetch(`/api/customers/${id}`);
}
function createBusinessCustomer(body) {
  return apiFetch("/api/customers", {
    method: "POST",
    body: JSON.stringify({ kind: "business", ...body })
  });
}
function patchCustomer(id, body) {
  return apiFetch(`/api/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}
function listInquiries(query = {}) {
  return apiFetch(`/api/inquiries${queryString6({ status: query.status, q: query.q })}`);
}
function createInquiry(body) {
  return apiFetch("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(body)
  });
}
function getInquiry(id) {
  return apiFetch(`/api/inquiries/${id}`);
}
function setInquiryStatus(id, body) {
  return apiFetch(`/api/inquiries/${id}/status`, {
    method: "POST",
    body: JSON.stringify(body)
  });
}
function addInquiryNote(id, note, by) {
  return apiFetch(`/api/inquiries/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ note, by: by ?? null })
  });
}
function getInquiryProducts(id) {
  return apiFetch(`/api/inquiries/${id}/products`);
}
function createQuote(inquiryId, body) {
  return apiFetch(`/api/inquiries/${inquiryId}/quotes`, {
    method: "POST",
    body: JSON.stringify(body)
  });
}
function getQuoteDocument(id) {
  return apiFetch(`/api/quotes/${id}/document`);
}
function listFollowups() {
  return apiFetch("/api/followups");
}
function createFollowup(body) {
  return apiFetch("/api/followups", {
    method: "POST",
    body: JSON.stringify(body)
  });
}
function getFollowup(id) {
  return apiFetch(`/api/followups/${id}`);
}
function patchFollowup(id, body) {
  return apiFetch(`/api/followups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}
function approveFollowup(id, by) {
  return apiFetch(`/api/followups/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ by: by ?? null })
  });
}
function cancelFollowup(id) {
  return apiFetch(`/api/followups/${id}/cancel`, { method: "POST" });
}
function deleteFollowup(id) {
  return apiFetch(`/api/followups/${id}`, { method: "DELETE" });
}
function markFollowupTarget(id, body) {
  return apiFetch(`/api/followup-targets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}
async function exportFollowup(id) {
  const controller = new AbortController();
  const timer9 = setTimeout(() => controller.abort(), 6e4);
  try {
    const response = await fetch(`${getApiBase().replace(/\/$/, "")}/api/followups/${id}/export`, {
      signal: controller.signal
    });
    if (!response.ok) {
      const text = await response.text();
      let message = `\u8BF7\u6C42\u5931\u8D25\uFF08${response.status}\uFF09`;
      try {
        const parsed = JSON.parse(text);
        if (parsed.error?.message) message = parsed.error.message;
      } catch {
      }
      throw new ApiError(message, "http", response.status);
    }
    const blob = await response.blob();
    const header = response.headers.get("Content-Disposition") ?? "";
    const match = /filename\*=UTF-8''([^;]+)/i.exec(header);
    const name = match ? decodeURIComponent(match[1]) : "followup.csv";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1", "network");
  } finally {
    clearTimeout(timer9);
  }
}

// src/api/inquiry-count.ts
var POLL_MS6 = 6e4;
var openInquiries;
var listeners7 = /* @__PURE__ */ new Set();
var timer6;
var started6 = false;
function emit7() {
  for (const listener of listeners7) listener();
}
function setOpenInquiries(next) {
  if (next === openInquiries) return;
  openInquiries = next;
  emit7();
}
function getOpenInquiryCount() {
  return openInquiries;
}
function useOpenInquiryCount() {
  return useSyncExternalStore7(
    (listener) => {
      listeners7.add(listener);
      return () => listeners7.delete(listener);
    },
    getOpenInquiryCount,
    () => void 0
  );
}
async function refreshOpenInquiryCount() {
  try {
    const summary = await getSegmentSummary();
    setOpenInquiries(summary.open_inquiries);
  } catch {
    setOpenInquiries(void 0);
  }
}
function ensureOpenInquiryPolling() {
  if (started6 || typeof window === "undefined") return;
  started6 = true;
  void refreshOpenInquiryCount();
  timer6 = window.setInterval(() => {
    void refreshOpenInquiryCount();
  }, POLL_MS6);
  subscribeApiBase(() => {
    void refreshOpenInquiryCount();
  });
}

// src/api/install-count.ts
import { useSyncExternalStore as useSyncExternalStore8 } from "react";

// src/api/installs.ts
function queryString7(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === void 0 || value === "") continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}
function listInstalls(query = {}) {
  return apiFetch(
    `/api/installs${queryString7({
      status: query.status,
      shop_id: query.shop_id,
      q: query.q,
      overdue: query.overdue
    })}`
  );
}
function getInstallSummary(shopId) {
  return apiFetch(`/api/installs/summary${queryString7({ shop_id: shopId })}`);
}
function getInstall(id) {
  return apiFetch(`/api/installs/${id}`);
}
function setInstallStatus(id, body) {
  return apiFetch(`/api/installs/${id}/status`, {
    method: "POST",
    body: JSON.stringify(body)
  });
}
function addInstallNote(id, note, by) {
  return apiFetch(`/api/installs/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ note, by: by ?? null })
  });
}
function getInstallNotice(id) {
  return apiFetch(`/api/installs/${id}/notice`);
}
function importOrders(shopId, file) {
  const body = new FormData();
  body.set("shop_id", String(shopId));
  body.set("file", file);
  return apiFetch("/api/import/orders", {
    method: "POST",
    body,
    timeoutMs: 6e4
  });
}
async function exportInstalls(body) {
  const controller = new AbortController();
  const timer9 = setTimeout(() => controller.abort(), 6e4);
  try {
    const response = await fetch(`${getApiBase().replace(/\/$/, "")}/api/installs/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    if (!response.ok) {
      const text = await response.text();
      let message = `\u8BF7\u6C42\u5931\u8D25\uFF08${response.status}\uFF09`;
      try {
        const parsed = JSON.parse(text);
        if (parsed.error?.message) message = parsed.error.message;
      } catch {
      }
      throw new ApiError(message, "http", response.status);
    }
    const blob = await response.blob();
    const header = response.headers.get("Content-Disposition") ?? "";
    const match = /filename\*=UTF-8''([^;]+)/i.exec(header);
    const name = match ? decodeURIComponent(match[1]) : "install.csv";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1", "network");
  } finally {
    clearTimeout(timer9);
  }
}

// src/api/install-count.ts
var POLL_MS7 = 6e4;
var needsAction3;
var listeners8 = /* @__PURE__ */ new Set();
var timer7;
var started7 = false;
function emit8() {
  for (const listener of listeners8) listener();
}
function setNeedsAction3(next) {
  if (next === needsAction3) return;
  needsAction3 = next;
  emit8();
}
function getNeedsActionCount() {
  return needsAction3;
}
function useNeedsActionCount() {
  return useSyncExternalStore8(
    (listener) => {
      listeners8.add(listener);
      return () => listeners8.delete(listener);
    },
    getNeedsActionCount,
    () => void 0
  );
}
async function refreshNeedsActionCount() {
  try {
    const summary = await getInstallSummary();
    setNeedsAction3(summary.needs_action);
  } catch {
    setNeedsAction3(void 0);
  }
}
function ensureNeedsActionPolling() {
  if (started7 || typeof window === "undefined") return;
  started7 = true;
  void refreshNeedsActionCount();
  timer7 = window.setInterval(() => {
    void refreshNeedsActionCount();
  }, POLL_MS7);
  subscribeApiBase(() => {
    void refreshNeedsActionCount();
  });
}

// src/api/open-count.ts
import { useSyncExternalStore as useSyncExternalStore9 } from "react";
var POLL_MS8 = 6e4;
var total2;
var listeners9 = /* @__PURE__ */ new Set();
var timer8;
var started8 = false;
function emit9() {
  for (const listener of listeners9) listener();
}
function setTotal2(next) {
  if (next === total2) return;
  total2 = next;
  emit9();
}
function getOpenIssueCount() {
  return total2;
}
function subscribeOpenIssueCount(listener) {
  listeners9.add(listener);
  return () => {
    listeners9.delete(listener);
  };
}
function useOpenIssueCount() {
  return useSyncExternalStore9(subscribeOpenIssueCount, getOpenIssueCount, () => void 0);
}
async function refreshOpenIssueCount() {
  try {
    const summary = await getIssueSummary();
    setTotal2(summary.total_open);
  } catch {
    setTotal2(void 0);
  }
}
function ensureOpenIssuePolling() {
  if (started8 || typeof window === "undefined") return;
  started8 = true;
  void refreshOpenIssueCount();
  timer8 = window.setInterval(() => {
    void refreshOpenIssueCount();
  }, POLL_MS8);
  subscribeApiBase(() => {
    void refreshOpenIssueCount();
  });
}

// src/api/refresh-counts.ts
function refreshAllCounts() {
  void refreshOpenAlertCount();
  void refreshRunningCampaignCount();
  void refreshInReviewCount();
  void refreshDesignNeedsActionCount();
  void refreshOpenInquiryCount();
  void refreshNeedsActionCount();
  void refreshOpenIssueCount();
  void refreshVideoNeedsActionCount();
}

// src/pages/WorkbenchSettings.tsx
import { useState as useState2 } from "react";
import { Button, Input } from "@hermes/plugin-sdk";

// src/api/backup.ts
function getBackupList() {
  return apiFetch("/api/backup");
}
function runBackup() {
  return apiFetch("/api/backup", { method: "POST", timeoutMs: 12e4 });
}
function getHealth() {
  return apiFetch("/api/health");
}

// src/pages/design/labels.ts
var KIND_LABEL = {
  main_image: "\u4E3B\u56FE",
  detail_page: "\u8BE6\u60C5\u9875",
  poster: "\u6D77\u62A5",
  banner: "\u6A2A\u5E45",
  video_cover: "\u89C6\u9891\u5C01\u9762",
  other: "\u5176\u4ED6"
};
var STATUS_LABEL = {
  open: "\u5F85\u63A5\u5355",
  in_progress: "\u8BBE\u8BA1\u4E2D",
  reviewing: "\u5F85\u8BC4\u5BA1",
  done: "\u5DF2\u5B9A\u7A3F",
  cancelled: "\u5DF2\u53D6\u6D88"
};
var KINDS = [
  { id: "main_image", label: "\u4E3B\u56FE" },
  { id: "detail_page", label: "\u8BE6\u60C5\u9875" },
  { id: "poster", label: "\u6D77\u62A5" },
  { id: "banner", label: "\u6A2A\u5E45" },
  { id: "video_cover", label: "\u89C6\u9891\u5C01\u9762" },
  { id: "other", label: "\u5176\u4ED6" }
];
function kindLabel(kind) {
  return KIND_LABEL[kind] ?? kind;
}
function statusLabel(status) {
  return STATUS_LABEL[status] ?? status;
}
function statusVariant(status) {
  if (status === "done") return "success";
  if (status === "reviewing") return "warn";
  if (status === "in_progress") return "default";
  return "outline";
}
function isImage(mime) {
  return mime.startsWith("image/");
}
function formatDue(value) {
  if (!value) return "\u672A\u8BBE\u622A\u6B62\u65E5";
  return value;
}
var SIZE_PATTERN = /^\d+\s*[x×*]\s*\d+$/i;
function normalizeSize(value) {
  const text = value.trim().toLowerCase().replace("\xD7", "x").replace("*", "x").replace(/\s/g, "");
  if (!SIZE_PATTERN.test(value.trim())) return null;
  const [width, height] = text.split("x");
  const w = Number(width);
  const h = Number(height);
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || w > 2e4 || h > 2e4) return null;
  return `${w}x${h}`;
}
var ACTOR_KEY = "hermes-workbench:actor";
function loadActor() {
  try {
    return window.localStorage.getItem(ACTOR_KEY) ?? "";
  } catch {
    return "";
  }
}
function saveActor(value) {
  try {
    window.localStorage.setItem(ACTOR_KEY, value);
  } catch {
  }
}
function errorText(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}
function formatShanghai(iso) {
  if (!iso) return "\u2014";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("zh-CN", { hour12: false, timeZone: "Asia/Shanghai" });
}

// src/pages/video/labels.ts
var CHARS_PER_SECOND = 4.5;
var PLATFORMS = [
  { id: "douyin", label: "\u6296\u97F3" },
  { id: "xiaohongshu", label: "\u5C0F\u7EA2\u4E66" },
  { id: "wechat", label: "\u516C\u4F17\u53F7" },
  { id: "weibo", label: "\u5FAE\u535A" },
  { id: "tmall", label: "\u5929\u732B" },
  { id: "jd", label: "\u4EAC\u4E1C" },
  { id: "pdd", label: "\u62FC\u591A\u591A" },
  { id: "other", label: "\u5176\u4ED6" }
];
var ASPECTS = [
  { id: "9:16", label: "9:16 \u7AD6\u7248" },
  { id: "16:9", label: "16:9 \u6A2A\u7248" },
  { id: "1:1", label: "1:1 \u65B9\u5F62" },
  { id: "3:4", label: "3:4" }
];
var STATUS_LABEL2 = {
  draft: "\u5199\u811A\u672C\u4E2D",
  in_review: "\u5F85\u5BA1\u6838",
  approved: "\u5DF2\u901A\u8FC7",
  done: "\u5DF2\u5B8C\u6210",
  cancelled: "\u5DF2\u53D6\u6D88"
};
function platformLabel(platform) {
  if (!platform) return "\u672A\u9009\u5E73\u53F0";
  return PLATFORMS.find((item) => item.id === platform)?.label ?? platform;
}
function statusLabel2(status) {
  return STATUS_LABEL2[status] ?? status;
}
function statusVariant2(status) {
  if (status === "done") return "success";
  if (status === "in_review") return "warn";
  if (status === "approved") return "default";
  return "outline";
}
function formatSeconds(value) {
  if (!Number.isFinite(value)) return "\u2014";
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} \u79D2`;
}
function estimateSeconds(text) {
  return text.length / CHARS_PER_SECOND;
}
function aspectRatio(aspect) {
  const [width, height] = aspect.split(":");
  const w = Number(width);
  const h = Number(height);
  if (!w || !h) return "9 / 16";
  return `${w} / ${h}`;
}
function isImage2(mime) {
  return mime.startsWith("image/");
}
function isVideo(mime) {
  return mime.startsWith("video/");
}
function errorText2(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// src/pages/WorkbenchSettings.tsx
import { Fragment, jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function WorkbenchSettings({ onAddressSaved }) {
  const apiBase = useApiBase();
  const [draft, setDraft] = useState2(apiBase);
  const [addressError, setAddressError] = useState2(null);
  const [backupMessage, setBackupMessage] = useState2(null);
  const [backupError, setBackupError] = useState2(null);
  const [busy, setBusy] = useState2(false);
  const backups = useQuery(() => getBackupList(), [apiBase]);
  const health = useQuery(() => getHealth(), [apiBase]);
  return /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-3 text-xs", children: [
    /* @__PURE__ */ jsxs2("section", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx3("h3", { className: "font-medium", children: "\u540E\u7AEF\u5730\u5740" }),
      /* @__PURE__ */ jsxs2(
        "form",
        {
          className: "flex flex-col gap-1",
          onSubmit: (event) => {
            event.preventDefault();
            const ok = setApiBase(draft);
            if (!ok) {
              setAddressError("\u5730\u5740\u9700\u8981\u4EE5 http:// \u6216 https:// \u5F00\u5934");
              return;
            }
            setAddressError(null);
            onAddressSaved?.();
          },
          children: [
            /* @__PURE__ */ jsx3(Input, { "aria-label": "\u5DE5\u4F5C\u53F0\u670D\u52A1\u5730\u5740", value: draft, onChange: (event) => setDraft(event.target.value) }),
            /* @__PURE__ */ jsx3(Button, { size: "xs", type: "submit", variant: "outline", children: "\u4FDD\u5B58\u5730\u5740" })
          ]
        }
      ),
      addressError ? /* @__PURE__ */ jsx3("p", { className: "text-destructive", children: addressError }) : null,
      /* @__PURE__ */ jsxs2("p", { className: "text-(--ui-text-tertiary)", children: [
        "\u540E\u7AEF\u7248\u672C ",
        health.data?.version ?? (health.error ? "\u6CA1\u6709\u8BFB\u5230" : "\u2026")
      ] })
    ] }),
    /* @__PURE__ */ jsxs2("section", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx3("h3", { className: "font-medium", children: "\u6570\u636E\u5907\u4EFD" }),
      /* @__PURE__ */ jsx3("p", { className: "text-(--ui-text-tertiary)", children: "\u6BCF\u5929 12:30 \u81EA\u52A8\u5907\u4EFD\uFF0C\u4F4D\u7F6E\u53EF\u5728 env.bat \u91CC\u6539\u3002" }),
      backups.error ? /* @__PURE__ */ jsx3("p", { className: "text-destructive", children: errorText2(backups.error, "\u5907\u4EFD\u76EE\u5F55\u6CA1\u6709\u8BFB\u5230") }) : /* @__PURE__ */ jsxs2(Fragment, { children: [
        /* @__PURE__ */ jsx3("p", { className: "break-all text-(--ui-text-secondary)", children: backups.data?.dir ?? "\u2026" }),
        backups.data && backups.data.snapshots.length === 0 ? /* @__PURE__ */ jsx3("p", { className: "text-(--ui-text-tertiary)", children: "\u8FD8\u6CA1\u6709\u5FEB\u7167\u3002" }) : /* @__PURE__ */ jsx3("ul", { children: (backups.data?.snapshots ?? []).slice(0, 5).map((item) => /* @__PURE__ */ jsxs2("li", { className: "truncate text-(--ui-text-secondary)", children: [
          item.name,
          " \xB7 ",
          formatBytes(item.bytes)
        ] }, item.name)) })
      ] }),
      /* @__PURE__ */ jsx3(
        Button,
        {
          size: "xs",
          disabled: busy,
          onClick: () => {
            setBusy(true);
            setBackupError(null);
            setBackupMessage(null);
            void runBackup().then((result) => {
              setBackupMessage(`\u5DF2\u5907\u4EFD\uFF1A${result.database}\uFF0C\u65B0\u590D\u5236 ${result.assets_copied} \u4E2A\u7D20\u6750`);
              backups.reload();
            }).catch((reason) => setBackupError(errorText2(reason, "\u6CA1\u6709\u5907\u4EFD\u6210"))).finally(() => setBusy(false));
          },
          children: "\u7ACB\u5373\u5907\u4EFD"
        }
      ),
      backupMessage ? /* @__PURE__ */ jsx3("p", { children: backupMessage }) : null,
      backupError ? /* @__PURE__ */ jsx3("p", { className: "text-destructive", children: backupError }) : null
    ] })
  ] });
}

// src/pages/OfflineNotice.tsx
import { Fragment as Fragment2, jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var BUSY = /* @__PURE__ */ new Set(["installing", "starting"]);
function OfflineNotice({ detail, onRetry }) {
  const apiBase = useApiBase();
  const [editing, setEditing] = useState3(false);
  const [backend, setBackend] = useState3(null);
  const [startError, setStartError] = useState3(null);
  const busy = backend != null && BUSY.has(backend.phase);
  const retry = () => {
    onRetry();
    refreshAllCounts();
  };
  useEffect2(() => {
    let cancelled = false;
    void getBackendStatus().then((value) => {
      if (!cancelled) setBackend(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect2(() => {
    if (!busy) return;
    const timer9 = window.setInterval(() => {
      void getBackendStatus().then((value) => {
        if (!value) return;
        setBackend(value);
        if (value.running) retry();
      });
    }, 3e3);
    return () => window.clearInterval(timer9);
  }, [busy]);
  const start = async (demo) => {
    setStartError(null);
    try {
      const value = await startBackend(demo);
      setBackend(value);
      if (value.running) retry();
      else if (value.phase === "failed") setStartError(value.message || "\u542F\u52A8\u5931\u8D25");
    } catch (error) {
      setStartError(error instanceof Error ? error.message : "\u542F\u52A8\u5931\u8D25");
    }
  };
  const description = detail && detail !== "\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1" ? `${detail}\u3002\u5F53\u524D\u5730\u5740 ${apiBase}` : `\u5F53\u524D\u5730\u5740 ${apiBase}`;
  return /* @__PURE__ */ jsxs3("div", { className: "flex flex-1 flex-col items-center justify-center gap-3 py-10", children: [
    /* @__PURE__ */ jsxs3(
      EmptyBlock,
      {
        title: "\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1",
        description: backend ? description : `${description}\u3002\u53EF\u4EE5\u5728 Hermes \u5BF9\u8BDD\u91CC\u8BF4\u201C\u542F\u52A8\u5DE5\u4F5C\u53F0\u201D\uFF0C\u6216\u53CC\u51FB\u684C\u9762\u4E0A\u7684\u201C\u5DE5\u4F5C\u53F0\u540E\u7AEF\u201D\u3002`,
        children: [
          backend && !busy ? /* @__PURE__ */ jsxs3(Fragment2, { children: [
            /* @__PURE__ */ jsx4(Button2, { size: "sm", onClick: () => void start(false), children: "\u542F\u52A8\u5DE5\u4F5C\u53F0" }),
            /* @__PURE__ */ jsx4(Button2, { size: "sm", variant: "outline", onClick: () => void start(true), children: "\u7528\u6F14\u793A\u6570\u636E\u542F\u52A8" })
          ] }) : null,
          /* @__PURE__ */ jsx4(Button2, { size: "sm", variant: "outline", onClick: retry, children: "\u91CD\u8BD5" }),
          /* @__PURE__ */ jsx4(Button2, { size: "sm", variant: "outline", onClick: () => setEditing(true), children: "\u66F4\u6539\u5730\u5740" })
        ]
      }
    ),
    busy ? /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2 text-xs text-(--ui-text-secondary)", children: [
      /* @__PURE__ */ jsx4(Loader, {}),
      backend?.message || "\u6B63\u5728\u51C6\u5907",
      "\uFF08\u7B2C\u4E00\u6B21\u8981\u8054\u7F51\u88C5\u4F9D\u8D56\uFF0C\u51E0\u5206\u949F\uFF09"
    ] }) : null,
    startError || backend?.phase === "failed" ? /* @__PURE__ */ jsx4("p", { className: "max-w-md text-center text-xs text-destructive", children: startError || backend?.message }) : null,
    editing ? /* @__PURE__ */ jsx4("div", { className: "w-full max-w-sm", children: /* @__PURE__ */ jsx4(
      WorkbenchSettings,
      {
        onAddressSaved: () => {
          setEditing(false);
          onRetry();
        }
      }
    ) }) : null
  ] });
}

// src/pages/assets/CardDrawer.tsx
import { useEffect as useEffect4, useState as useState4 } from "react";
import { Button as Button4, Input as Input2, Switch, Textarea } from "@hermes/plugin-sdk";

// src/pages/products/labels.ts
var PLATFORM_NAME = {
  tmall: "\u5929\u732B",
  jd: "\u4EAC\u4E1C",
  pdd: "\u62FC\u591A\u591A",
  douyin: "\u6296\u97F3"
};
function platformName(platform) {
  return PLATFORM_NAME[platform] ?? platform;
}
function platformMark(platform) {
  const name = platformName(platform);
  return name.slice(0, 1);
}
function formatAmount(value) {
  if (!Number.isFinite(value)) return "\u2014";
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}
function formatTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("zh-CN", { hour12: false });
}
function levelLabel(level) {
  if (level === "must") return "\u5FC5\u987B\u5904\u7406";
  if (level === "warn") return "\u63D0\u9192";
  return level;
}
function statusLabel3(status) {
  if (status === "open") return "\u672A\u5904\u7406";
  if (status === "resolved") return "\u5DF2\u5904\u7406";
  if (status === "ignored") return "\u5DF2\u5FFD\u7565";
  return status;
}

// src/pages/products/Drawer.tsx
import { useEffect as useEffect3 } from "react";
import { Button as Button3, Codicon, cn } from "@hermes/plugin-sdk";
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
function SideDrawer({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  widthClass = "max-w-md"
}) {
  useEffect3(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  return /* @__PURE__ */ jsxs4("div", { className: "fixed inset-0 z-50", children: [
    /* @__PURE__ */ jsx5(
      "button",
      {
        type: "button",
        "aria-label": "\u5173\u95ED\u6D6E\u5C42",
        className: "absolute inset-0 bg-black/22 backdrop-blur-[0.125rem]",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxs4(
      "aside",
      {
        role: "dialog",
        "aria-modal": "true",
        "aria-label": title,
        className: cn(
          // 从右上角工具按钮下面开始：Hermes 的标题栏按钮浮在最上层（z-70），会盖住抽屉的关闭按钮。
          // 页面区域里 --titlebar-height 被设成 0，所以按按钮本身的位置和高度来算。
          "absolute top-[calc(var(--titlebar-controls-top,5px)+var(--titlebar-control-height,24px)+0.25rem)] right-0 bottom-0 flex w-full flex-col border-l border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) text-(--ui-text-primary) shadow-md",
          widthClass
        ),
        children: [
          /* @__PURE__ */ jsx5("header", { className: "flex items-start gap-3 border-b border-(--ui-stroke-secondary) p-3 pr-10", children: /* @__PURE__ */ jsxs4("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx5("h2", { className: "truncate text-[0.9375rem] font-semibold", children: title }),
            description ? /* @__PURE__ */ jsx5("p", { className: "mt-1 text-xs leading-relaxed text-(--ui-text-tertiary)", children: description }) : null
          ] }) }),
          /* @__PURE__ */ jsx5(
            Button3,
            {
              "aria-label": "\u5173\u95ED",
              variant: "ghost",
              size: "icon-xs",
              className: "absolute top-3 right-3",
              onClick: onClose,
              children: /* @__PURE__ */ jsx5(Codicon, { name: "close", size: "1rem" })
            }
          ),
          /* @__PURE__ */ jsx5("div", { className: "min-h-0 flex-1 overflow-y-auto p-3", children }),
          footer ? /* @__PURE__ */ jsx5("footer", { className: "flex flex-wrap items-center justify-end gap-2 border-t border-(--ui-stroke-secondary) p-3", children: footer }) : null
        ]
      }
    )
  ] });
}
function FieldText({
  label,
  children,
  className
}) {
  return /* @__PURE__ */ jsxs4("div", { className: cn("min-w-0", className), children: [
    /* @__PURE__ */ jsx5("div", { className: "text-[0.6875rem] text-(--ui-text-tertiary)", children: label }),
    /* @__PURE__ */ jsx5("div", { className: "mt-0.5 text-xs text-(--ui-text-primary)", children })
  ] });
}

// src/pages/assets/CardDrawer.tsx
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
function CardDrawer({
  open,
  card,
  creating,
  onClose,
  onSaved
}) {
  const [code, setCode] = useState4("");
  const [brand, setBrand] = useState4("");
  const [name, setName] = useState4("");
  const [points, setPoints] = useState4([""]);
  const [specs, setSpecs] = useState4("");
  const [faq, setFaq] = useState4([]);
  const [install, setInstall] = useState4(false);
  const [notes, setNotes] = useState4("");
  const [error, setError] = useState4(null);
  const [saving, setSaving] = useState4(false);
  useEffect4(() => {
    if (!open) return;
    setCode(card?.product_code ?? "");
    setBrand(card?.brand ?? "");
    setName(card?.name ?? "");
    setPoints(card?.selling_points.length ? card.selling_points : [""]);
    setSpecs(card?.specs ?? "");
    setFaq(card?.faq ?? []);
    setInstall(card?.install_required ?? false);
    setNotes(card?.notes ?? "");
    setError(null);
  }, [open, card]);
  const save = async () => {
    if (!name.trim() || !brand.trim() || creating && !code.trim()) {
      setError(creating ? "\u7F16\u7801\u3001\u540D\u79F0\u548C\u54C1\u724C\u90FD\u8981\u586B" : "\u540D\u79F0\u548C\u54C1\u724C\u90FD\u8981\u586B");
      return;
    }
    const body = {
      brand: brand.trim(),
      name: name.trim(),
      selling_points: points.map((item) => item.trim()).filter(Boolean),
      specs: specs.trim() || null,
      faq: faq.filter((item) => item.q.trim() || item.a.trim()).map((item) => ({ q: item.q.trim(), a: item.a.trim() })),
      install_required: install,
      notes: notes.trim() || null
    };
    setSaving(true);
    setError(null);
    try {
      if (creating) await createProductCard({ ...body, product_code: code.trim() });
      else if (card) await patchProductCard(card.id, body);
      onSaved();
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "\u4FDD\u5B58\u5931\u8D25");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsx6(
    SideDrawer,
    {
      open,
      title: creating ? "\u65B0\u5EFA\u8D44\u6599\u5361" : card?.name ?? "\u8D44\u6599\u5361",
      description: creating ? "\u7F16\u7801\u4FDD\u5B58\u540E\u4E0D\u80FD\u6539" : card?.product_code,
      onClose,
      widthClass: "max-w-lg",
      footer: /* @__PURE__ */ jsx6(Button4, { size: "sm", disabled: saving, onClick: () => void save(), children: "\u4FDD\u5B58" }),
      children: /* @__PURE__ */ jsxs5("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxs5("label", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
          "\u7F16\u7801",
          /* @__PURE__ */ jsx6(Input2, { "aria-label": "\u5546\u54C1\u7F16\u7801", value: code, disabled: !creating, onChange: (event) => setCode(event.target.value) })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsx6(Input2, { "aria-label": "\u8D44\u6599\u5361\u540D\u79F0", placeholder: "\u540D\u79F0", value: name, onChange: (event) => setName(event.target.value) }),
          /* @__PURE__ */ jsx6(Input2, { "aria-label": "\u8D44\u6599\u5361\u54C1\u724C", placeholder: "\u54C1\u724C", value: brand, onChange: (event) => setBrand(event.target.value) })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx6("div", { className: "text-xs text-(--ui-text-secondary)", children: "\u5356\u70B9" }),
          points.map((point, index) => /* @__PURE__ */ jsxs5("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx6(
              Input2,
              {
                "aria-label": `\u5356\u70B9 ${index + 1}`,
                value: point,
                onChange: (event) => setPoints((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))
              }
            ),
            /* @__PURE__ */ jsx6(Button4, { size: "xs", variant: "ghost", onClick: () => setPoints((current) => current.filter((_, itemIndex) => itemIndex !== index)), children: "\u5220\u9664" })
          ] }, index)),
          /* @__PURE__ */ jsx6(Button4, { size: "xs", variant: "outline", onClick: () => setPoints((current) => [...current, ""]), children: "\u52A0\u4E00\u6761\u5356\u70B9" })
        ] }),
        /* @__PURE__ */ jsx6(Textarea, { "aria-label": "\u53C2\u6570", placeholder: "\u53C2\u6570", value: specs, onChange: (event) => setSpecs(event.target.value) }),
        /* @__PURE__ */ jsxs5("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx6("div", { className: "text-xs text-(--ui-text-secondary)", children: "\u5E38\u89C1\u95EE\u9898" }),
          faq.map((item, index) => /* @__PURE__ */ jsxs5("div", { className: "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2", children: [
            /* @__PURE__ */ jsx6(
              Input2,
              {
                "aria-label": `\u95EE\u9898 ${index + 1}`,
                placeholder: "\u95EE",
                value: item.q,
                onChange: (event) => setFaq((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, q: event.target.value } : row))
              }
            ),
            /* @__PURE__ */ jsx6(
              Input2,
              {
                "aria-label": `\u56DE\u7B54 ${index + 1}`,
                placeholder: "\u7B54",
                value: item.a,
                onChange: (event) => setFaq((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, a: event.target.value } : row))
              }
            ),
            /* @__PURE__ */ jsx6(Button4, { size: "xs", variant: "ghost", onClick: () => setFaq((current) => current.filter((_, rowIndex) => rowIndex !== index)), children: "\u5220\u9664" })
          ] }, index)),
          /* @__PURE__ */ jsx6(Button4, { size: "xs", variant: "outline", onClick: () => setFaq((current) => [...current, { q: "", a: "" }]), children: "\u52A0\u4E00\u7EC4\u95EE\u7B54" })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsx6("span", { children: "\u9700\u8981\u5B89\u88C5" }),
          /* @__PURE__ */ jsx6(Switch, { checked: install, onCheckedChange: setInstall, "aria-label": "\u9700\u8981\u5B89\u88C5" })
        ] }),
        /* @__PURE__ */ jsx6(Textarea, { "aria-label": "\u5907\u6CE8", placeholder: "\u5907\u6CE8", value: notes, onChange: (event) => setNotes(event.target.value) }),
        card && !creating ? /* @__PURE__ */ jsxs5("div", { children: [
          /* @__PURE__ */ jsx6("div", { className: "mb-1 text-xs text-(--ui-text-secondary)", children: "\u5404\u5E97\u94FA\u5728\u552E" }),
          card.listings.length === 0 ? /* @__PURE__ */ jsx6("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD8\u6CA1\u6709\u5E97\u94FA\u5728\u5356\u8FD9\u4E2A\u7F16\u7801\u3002" }) : /* @__PURE__ */ jsx6("ul", { children: card.listings.map((listing) => /* @__PURE__ */ jsxs5("li", { className: "grid grid-cols-[minmax(0,1.4fr)_4rem_3rem_minmax(0,1fr)] gap-2 border-b border-(--ui-stroke-secondary) py-1.5 text-xs", children: [
            /* @__PURE__ */ jsxs5("span", { className: "flex min-w-0 items-center gap-1 truncate", children: [
              /* @__PURE__ */ jsx6("span", { className: "inline-flex h-4 min-w-4 items-center justify-center rounded-sm border border-(--ui-stroke-secondary) text-[0.625rem]", children: platformMark(listing.platform) }),
              platformName(listing.platform),
              " \xB7 ",
              listing.shop_name
            ] }),
            /* @__PURE__ */ jsx6("span", { className: "tabular-nums", children: formatAmount(listing.price) }),
            /* @__PURE__ */ jsx6("span", { className: "tabular-nums", children: listing.stock }),
            /* @__PURE__ */ jsx6("span", { className: "truncate text-(--ui-text-secondary)", children: listing.activity || "\u2014" })
          ] }, `${listing.shop_id}-${listing.sku}`)) })
        ] }) : null,
        error ? /* @__PURE__ */ jsx6("p", { className: "text-xs text-destructive", children: error }) : null
      ] })
    }
  );
}

// src/pages/assets/CompliancePanel.tsx
import { useEffect as useEffect5, useMemo, useState as useState5 } from "react";
import { Button as Button5, Textarea as Textarea2, Tip, cn as cn2 } from "@hermes/plugin-sdk";
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
function CompliancePanel({
  text: externalText,
  auto = false
} = {}) {
  const controlled = externalText !== void 0;
  const [draft, setDraft] = useState5("\u8FD9\u662F\u6700\u4F73\u9009\u62E9\uFF0C\u7B2C\u4E00\u6B21\u8D2D\u4E70\u9001\u793C");
  const text = controlled ? externalText : draft;
  const [result, setResult] = useState5(null);
  const [error, setError] = useState5(null);
  const [checking, setChecking] = useState5(false);
  useEffect5(() => {
    if (!auto) return;
    setResult(null);
    if (!text.trim()) {
      setError(null);
      setChecking(false);
      return;
    }
    let cancelled = false;
    const timer9 = window.setTimeout(() => {
      setChecking(true);
      checkCompliance(text).then(
        (value) => {
          if (cancelled) return;
          setResult(value);
          setError(null);
          setChecking(false);
        },
        (reason) => {
          if (cancelled) return;
          setResult(null);
          setError(reason instanceof Error ? reason.message : "\u68C0\u67E5\u5931\u8D25");
          setChecking(false);
        }
      );
    }, 600);
    return () => {
      cancelled = true;
      window.clearTimeout(timer9);
    };
  }, [auto, text]);
  const check = async () => {
    setChecking(true);
    setError(null);
    try {
      setResult(await checkCompliance(text));
    } catch (reason) {
      setResult(null);
      setError(reason instanceof Error ? reason.message : "\u68C0\u67E5\u5931\u8D25");
    } finally {
      setChecking(false);
    }
  };
  const marks = useMemo(() => result ? marksFor(text, result.hits) : [], [result, text]);
  return /* @__PURE__ */ jsxs6("div", { className: "flex flex-col gap-2 rounded-md border border-(--ui-stroke-secondary) p-3", children: [
    /* @__PURE__ */ jsx7("div", { className: "text-xs text-(--ui-text-secondary)", children: "\u6587\u6848\u68C0\u67E5" }),
    controlled ? null : /* @__PURE__ */ jsx7(Textarea2, { "aria-label": "\u5F85\u68C0\u67E5\u6587\u6848", value: text, onChange: (event) => setDraft(event.target.value) }),
    /* @__PURE__ */ jsxs6("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsx7("span", { className: "text-[0.6875rem] text-(--ui-text-tertiary)", children: checking ? "\u6B63\u5728\u68C0\u67E5" : result ? `\u5FC5\u987B\u5904\u7406 ${result.must_count}\uFF0C\u63D0\u9192 ${result.warn_count}` : auto ? "\u505C\u6B62\u8F93\u5165\u540E\u81EA\u52A8\u68C0\u67E5" : "\u68C0\u67E5\u542F\u7528\u4E2D\u7684\u8FDD\u7981\u8BCD" }),
      auto ? null : /* @__PURE__ */ jsx7(Button5, { size: "sm", disabled: checking || !text.trim(), onClick: () => void check(), children: "\u68C0\u67E5" })
    ] }),
    error ? /* @__PURE__ */ jsx7("p", { className: "text-xs text-destructive", children: error }) : null,
    result ? /* @__PURE__ */ jsxs6("div", { className: "grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(10rem,0.8fr)]", children: [
      /* @__PURE__ */ jsx7("p", { className: "whitespace-pre-wrap text-xs leading-6", children: renderMarked(text, marks) }),
      /* @__PURE__ */ jsxs6("ul", { className: "flex flex-col gap-1 text-xs", children: [
        result.hits.length === 0 ? /* @__PURE__ */ jsx7("li", { className: "text-(--ui-text-tertiary)", children: "\u6CA1\u6709\u547D\u4E2D\u3002" }) : null,
        result.hits.map((hit) => /* @__PURE__ */ jsxs6("li", { className: "border-b border-(--ui-stroke-secondary) py-1", children: [
          /* @__PURE__ */ jsx7("span", { className: hit.level === "must" ? "text-destructive" : "text-amber-600 dark:text-amber-300", children: hit.word }),
          /* @__PURE__ */ jsxs6("span", { className: "text-(--ui-text-tertiary)", children: [
            " \xB7 ",
            hit.category
          ] }),
          hit.suggestion ? /* @__PURE__ */ jsxs6("div", { className: "text-(--ui-text-secondary)", children: [
            "\u5EFA\u8BAE\uFF1A",
            hit.suggestion
          ] }) : null
        ] }, `${hit.word}-${hit.positions[0] ?? 0}`))
      ] })
    ] }) : null
  ] });
}
function marksFor(text, hits) {
  const owners = Array.from({ length: text.length }, () => null);
  for (const hit of hits) {
    for (const position of hit.positions) {
      const end = Math.min(text.length, position + hit.word.length);
      for (let index2 = position; index2 < end; index2 += 1) {
        const current = owners[index2];
        if (!current || hit.level === "must" && current.level !== "must") owners[index2] = hit;
      }
    }
  }
  const marks = [];
  let index = 0;
  while (index < owners.length) {
    const hit = owners[index];
    if (!hit) {
      index += 1;
      continue;
    }
    const start = index;
    while (index < owners.length && owners[index] === hit) index += 1;
    marks.push({ hit, start, end: index });
  }
  return marks;
}
function renderMarked(text, marks) {
  const nodes = [];
  let cursor = 0;
  marks.forEach((mark, index) => {
    if (mark.start > cursor) nodes.push(text.slice(cursor, mark.start));
    const must = mark.hit.level === "must";
    nodes.push(
      /* @__PURE__ */ jsx7(
        Tip,
        {
          label: `${mark.hit.category}${mark.hit.suggestion ? ` \xB7 \u5EFA\u8BAE\u6539\u4E3A${mark.hit.suggestion}` : ""}`,
          children: /* @__PURE__ */ jsx7(
            "span",
            {
              className: cn2(
                "underline decoration-2 underline-offset-2",
                must ? "text-destructive decoration-destructive" : "text-amber-600 decoration-amber-600 dark:text-amber-300 dark:decoration-amber-300"
              ),
              children: text.slice(mark.start, mark.end)
            }
          )
        },
        `${mark.start}-${index}`
      )
    );
    cursor = mark.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

// src/pages/assets/AssetsPage.tsx
import { Fragment as Fragment3, jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
function AssetsPage() {
  const apiBase = useApiBase();
  const [tab, setTab] = useState6("cards");
  const [brand, setBrand] = useState6("");
  const [qInput, setQInput] = useState6("");
  const [q, setQ] = useState6("");
  const [creating, setCreating] = useState6(false);
  const [active, setActive] = useState6(null);
  useEffect6(() => {
    const timer9 = window.setTimeout(() => setQ(qInput.trim()), 300);
    return () => window.clearTimeout(timer9);
  }, [qInput]);
  const shopsQuery = useQuery(() => listShops(), [apiBase]);
  const cardsQuery = useQuery(
    () => listProductCards({ brand: brand || void 0, q: q || void 0 }),
    [apiBase, brand, q]
  );
  const guidesQuery = useQuery(() => listBrandGuides(), [apiBase]);
  const wordsQuery = useQuery(() => listBannedWords(), [apiBase]);
  const error = tab === "cards" ? cardsQuery.error ?? shopsQuery.error : tab === "guides" ? guidesQuery.error ?? shopsQuery.error : wordsQuery.error;
  const offline = isOfflineError(error);
  const shopBrands = unique(shopsQuery.data?.map((shop) => shop.brand) ?? []);
  const guideBrands = unique([...guidesQuery.data?.map((item) => item.brand) ?? [], ...shopBrands]);
  const reload = () => {
    shopsQuery.reload();
    cardsQuery.reload();
    guidesQuery.reload();
    wordsQuery.reload();
  };
  return /* @__PURE__ */ jsxs7("div", { className: "flex min-h-0 flex-1 flex-col gap-3", children: [
    /* @__PURE__ */ jsx8(HeaderActions, { children: tab === "cards" ? /* @__PURE__ */ jsx8(Button6, { size: "sm", onClick: () => {
      setActive(null);
      setCreating(true);
    }, children: "\u65B0\u5EFA\u8D44\u6599\u5361" }) : null }),
    /* @__PURE__ */ jsx8(
      SegmentedControl,
      {
        sizing: "content",
        value: tab,
        onChange: setTab,
        options: [
          { id: "cards", label: "\u5546\u54C1\u8D44\u6599\u5361" },
          { id: "guides", label: "\u54C1\u724C\u89C4\u8303" },
          { id: "words", label: "\u8FDD\u7981\u8BCD" }
        ]
      }
    ),
    offline ? /* @__PURE__ */ jsx8(OfflineNotice, { detail: error instanceof Error ? error.message : void 0, onRetry: reload }) : null,
    !offline && error ? /* @__PURE__ */ jsx8("div", { className: "flex flex-1 items-center justify-center py-10", children: /* @__PURE__ */ jsx8(ErrorState, { title: "\u8D44\u6599\u52A0\u8F7D\u5931\u8D25", description: error instanceof Error ? error.message : "\u8BF7\u91CD\u8BD5", children: /* @__PURE__ */ jsx8(Button6, { size: "sm", variant: "outline", onClick: reload, children: "\u91CD\u8BD5" }) }) }) : null,
    !offline && !error && tab === "cards" ? /* @__PURE__ */ jsx8(
      CardsPane,
      {
        cards: cardsQuery.data,
        loading: cardsQuery.loading,
        brands: shopBrands,
        brand,
        qInput,
        onBrand: setBrand,
        onQuery: setQInput,
        onOpen: (card) => {
          setCreating(false);
          setActive(card);
        }
      }
    ) : null,
    !offline && !error && tab === "guides" ? /* @__PURE__ */ jsx8(GuidesPane, { brands: guideBrands, onSaved: () => guidesQuery.reload() }) : null,
    !offline && !error && tab === "words" ? /* @__PURE__ */ jsx8(WordsPane, { words: wordsQuery.data, loading: wordsQuery.loading, onChanged: () => wordsQuery.reload() }) : null,
    /* @__PURE__ */ jsx8(
      CardDrawer,
      {
        open: creating || active != null,
        creating,
        card: active,
        onClose: () => {
          setCreating(false);
          setActive(null);
        },
        onSaved: () => cardsQuery.reload()
      }
    )
  ] });
}
function CardsPane({
  cards,
  loading,
  brands,
  brand,
  qInput,
  onBrand,
  onQuery,
  onOpen
}) {
  return /* @__PURE__ */ jsxs7(Fragment3, { children: [
    /* @__PURE__ */ jsxs7("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxs7(Select, { value: brand || "all", onValueChange: (value) => onBrand(value === "all" ? "" : value), children: [
        /* @__PURE__ */ jsx8(SelectTrigger, { "aria-label": "\u54C1\u724C", className: "w-36", children: /* @__PURE__ */ jsx8(SelectValue, { placeholder: "\u5168\u90E8\u54C1\u724C" }) }),
        /* @__PURE__ */ jsxs7(SelectContent, { children: [
          /* @__PURE__ */ jsx8(SelectItem, { value: "all", children: "\u5168\u90E8\u54C1\u724C" }),
          brands.map((item) => /* @__PURE__ */ jsx8(SelectItem, { value: item, children: item }, item))
        ] })
      ] }),
      /* @__PURE__ */ jsx8(SearchField, { "aria-label": "\u641C\u7D22\u8D44\u6599\u5361", placeholder: "\u540D\u79F0\u3001\u7F16\u7801", value: qInput, onChange: onQuery }),
      loading && cards ? /* @__PURE__ */ jsx8(Loader2, {}) : null
    ] }),
    loading && !cards ? /* @__PURE__ */ jsx8(Loader2, {}) : null,
    cards && cards.length === 0 ? /* @__PURE__ */ jsx8(EmptyState2, { title: "\u6CA1\u6709\u8D44\u6599\u5361", description: "\u65B0\u5EFA\u4E00\u5F20\uFF0C\u6216\u6362\u4E2A\u7B5B\u9009\u3002" }) : null,
    cards && cards.length > 0 ? /* @__PURE__ */ jsxs7("div", { children: [
      /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-[minmax(0,1.4fr)_6rem_5rem_4.5rem_4rem] gap-2 border-b border-(--ui-stroke-secondary) px-2 py-1.5 text-[0.6875rem] text-(--ui-text-tertiary)", children: [
        /* @__PURE__ */ jsx8("span", { children: "\u540D\u79F0" }),
        /* @__PURE__ */ jsx8("span", { children: "\u7F16\u7801" }),
        /* @__PURE__ */ jsx8("span", { children: "\u54C1\u724C" }),
        /* @__PURE__ */ jsx8("span", { children: "\u5B89\u88C5" }),
        /* @__PURE__ */ jsx8("span", { children: "\u5728\u552E" })
      ] }),
      /* @__PURE__ */ jsx8("ul", { children: cards.map((card) => /* @__PURE__ */ jsx8("li", { children: /* @__PURE__ */ jsxs7(
        "button",
        {
          type: "button",
          onClick: () => onOpen(card),
          className: "grid w-full grid-cols-[minmax(0,1.4fr)_6rem_5rem_4.5rem_4rem] items-center gap-2 border-b border-(--ui-stroke-secondary) px-2 py-2 text-left text-xs hover:bg-(--ui-bg-quinary)",
          children: [
            /* @__PURE__ */ jsx8("span", { className: "truncate", children: card.name }),
            /* @__PURE__ */ jsx8("span", { className: "truncate text-(--ui-text-secondary)", children: card.product_code }),
            /* @__PURE__ */ jsx8("span", { className: "truncate", children: card.brand }),
            /* @__PURE__ */ jsx8("span", { children: card.install_required ? "\u9700\u8981" : "\u4E0D\u9700\u8981" }),
            /* @__PURE__ */ jsx8("span", { className: "tabular-nums", children: card.listings.length })
          ]
        }
      ) }, card.id)) })
    ] }) : null
  ] });
}
function GuidesPane({ brands, onSaved }) {
  const [brand, setBrand] = useState6(brands[0] ?? "");
  useEffect6(() => {
    if (!brand && brands[0]) setBrand(brands[0]);
  }, [brand, brands]);
  const [draftBrand, setDraftBrand] = useState6("");
  const [guide, setGuide] = useState6(null);
  const [tone, setTone] = useState6("");
  const [colors, setColors] = useState6([]);
  const [fonts, setFonts] = useState6([]);
  const [logo, setLogo] = useState6("");
  const [notes, setNotes] = useState6("");
  const [error, setError] = useState6(null);
  const [notice, setNotice] = useState6(null);
  const [loading, setLoading] = useState6(false);
  useEffect6(() => {
    if (!brand) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getBrandGuide(brand).then((value) => {
      if (cancelled) return;
      setGuide(value);
      setTone(value.tone ?? "");
      setColors(value.colors);
      setFonts(value.fonts);
      setLogo(value.logo_rules ?? "");
      setNotes(value.notes ?? "");
    }).catch((reason) => {
      if (cancelled) return;
      if (reason instanceof ApiError && reason.status === 404) {
        setGuide(null);
        setTone("");
        setColors([]);
        setFonts([]);
        setLogo("");
        setNotes("");
        return;
      }
      setError(reason instanceof Error ? reason.message : "\u52A0\u8F7D\u5931\u8D25");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [brand]);
  const save = async () => {
    if (!brand.trim()) return;
    setError(null);
    setNotice(null);
    try {
      const saved = await saveBrandGuide(brand.trim(), {
        tone: tone.trim() || null,
        colors: colors.map((item) => item.trim()).filter(Boolean),
        fonts: fonts.map((item) => item.trim()).filter(Boolean),
        logo_rules: logo.trim() || null,
        notes: notes.trim() || null
      });
      setGuide(saved);
      setNotice("\u5DF2\u4FDD\u5B58");
      onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "\u4FDD\u5B58\u5931\u8D25");
    }
  };
  return /* @__PURE__ */ jsxs7("div", { className: "grid gap-4 md:grid-cols-[10rem_minmax(0,1fr)]", children: [
    /* @__PURE__ */ jsxs7("div", { className: "flex flex-col gap-1", children: [
      brands.map((item) => /* @__PURE__ */ jsx8(
        "button",
        {
          type: "button",
          onClick: () => setBrand(item),
          className: item === brand ? "rounded-md bg-(--ui-bg-quinary) px-2 py-1.5 text-left text-xs" : "rounded-md px-2 py-1.5 text-left text-xs text-(--ui-text-secondary) hover:bg-(--ui-bg-quinary)",
          children: item
        },
        item
      )),
      /* @__PURE__ */ jsxs7(
        "form",
        {
          className: "mt-2 flex flex-col gap-1",
          onSubmit: (event) => {
            event.preventDefault();
            const next = draftBrand.trim();
            if (!next) return;
            setBrand(next);
            setDraftBrand("");
          },
          children: [
            /* @__PURE__ */ jsx8(Input3, { "aria-label": "\u65B0\u54C1\u724C", placeholder: "\u65B0\u54C1\u724C", value: draftBrand, onChange: (event) => setDraftBrand(event.target.value) }),
            /* @__PURE__ */ jsx8(Button6, { size: "xs", variant: "outline", type: "submit", children: "\u6253\u5F00" })
          ]
        }
      )
    ] }),
    brand ? /* @__PURE__ */ jsxs7("div", { className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxs7("div", { className: "text-sm", children: [
        brand,
        guide ? "" : " \xB7 \u8FD8\u6CA1\u6709\u89C4\u8303"
      ] }),
      loading ? /* @__PURE__ */ jsx8(Loader2, {}) : null,
      /* @__PURE__ */ jsx8(Textarea3, { "aria-label": "\u8BED\u6C14", placeholder: "\u8BED\u6C14", value: tone, onChange: (event) => setTone(event.target.value) }),
      /* @__PURE__ */ jsx8(ColorList, { colors, onChange: setColors }),
      /* @__PURE__ */ jsx8(StringRows, { label: "\u5B57\u4F53", values: fonts, onChange: setFonts }),
      /* @__PURE__ */ jsx8(Textarea3, { "aria-label": "Logo \u7528\u6CD5", placeholder: "Logo \u7528\u6CD5", value: logo, onChange: (event) => setLogo(event.target.value) }),
      /* @__PURE__ */ jsx8(Textarea3, { "aria-label": "\u5176\u4ED6\u6CE8\u610F", placeholder: "\u5176\u4ED6\u6CE8\u610F", value: notes, onChange: (event) => setNotes(event.target.value) }),
      error ? /* @__PURE__ */ jsx8("p", { className: "text-xs text-destructive", children: error }) : null,
      notice ? /* @__PURE__ */ jsx8("p", { className: "text-xs text-(--ui-text-secondary)", children: notice }) : null,
      /* @__PURE__ */ jsx8("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx8(Button6, { size: "sm", onClick: () => void save(), children: "\u4FDD\u5B58" }) })
    ] }) : /* @__PURE__ */ jsx8(EmptyState2, { title: "\u8FD8\u6CA1\u6709\u54C1\u724C", description: "\u4ECE\u5DE6\u8FB9\u8F93\u5165\u4E00\u4E2A\u54C1\u724C\u540D\u3002" })
  ] });
}
function WordsPane({
  words,
  loading,
  onChanged
}) {
  const [word, setWord] = useState6("");
  const [level, setLevel] = useState6("must");
  const [category, setCategory] = useState6("\u81EA\u5B9A\u4E49");
  const [suggestion, setSuggestion] = useState6("");
  const [error, setError] = useState6(null);
  const [removing, setRemoving] = useState6(null);
  const add = async () => {
    if (!word.trim()) return;
    setError(null);
    try {
      await createBannedWord({
        word: word.trim(),
        level,
        category: category.trim() || "\u81EA\u5B9A\u4E49",
        suggestion: suggestion.trim() || null
      });
      setWord("");
      setSuggestion("");
      onChanged();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "\u6DFB\u52A0\u5931\u8D25");
    }
  };
  return /* @__PURE__ */ jsxs7("div", { className: "flex flex-col gap-3", children: [
    /* @__PURE__ */ jsx8(CompliancePanel, {}),
    /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-[minmax(0,1fr)_6rem_6rem_minmax(0,1fr)_auto] gap-2", children: [
      /* @__PURE__ */ jsx8(Input3, { "aria-label": "\u8FDD\u7981\u8BCD", placeholder: "\u8BCD", value: word, onChange: (event) => setWord(event.target.value) }),
      /* @__PURE__ */ jsxs7(Select, { value: level, onValueChange: setLevel, children: [
        /* @__PURE__ */ jsx8(SelectTrigger, { "aria-label": "\u7EA7\u522B", children: /* @__PURE__ */ jsx8(SelectValue, {}) }),
        /* @__PURE__ */ jsxs7(SelectContent, { children: [
          /* @__PURE__ */ jsx8(SelectItem, { value: "must", children: "\u5FC5\u987B\u5904\u7406" }),
          /* @__PURE__ */ jsx8(SelectItem, { value: "warn", children: "\u63D0\u9192" })
        ] })
      ] }),
      /* @__PURE__ */ jsx8(Input3, { "aria-label": "\u5206\u7C7B", placeholder: "\u5206\u7C7B", value: category, onChange: (event) => setCategory(event.target.value) }),
      /* @__PURE__ */ jsx8(Input3, { "aria-label": "\u66FF\u6362\u5EFA\u8BAE", placeholder: "\u66FF\u6362\u5EFA\u8BAE", value: suggestion, onChange: (event) => setSuggestion(event.target.value) }),
      /* @__PURE__ */ jsx8(Button6, { size: "sm", variant: "outline", onClick: () => void add(), children: "\u52A0\u8BCD" })
    ] }),
    error ? /* @__PURE__ */ jsx8("p", { className: "text-xs text-destructive", children: error }) : null,
    loading && !words ? /* @__PURE__ */ jsx8(Loader2, {}) : null,
    /* @__PURE__ */ jsxs7("div", { children: [
      /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-[minmax(0,1fr)_5rem_6rem_minmax(0,1fr)_3.5rem_3rem] gap-2 border-b border-(--ui-stroke-secondary) px-2 py-1.5 text-[0.6875rem] text-(--ui-text-tertiary)", children: [
        /* @__PURE__ */ jsx8("span", { children: "\u8BCD" }),
        /* @__PURE__ */ jsx8("span", { children: "\u7EA7\u522B" }),
        /* @__PURE__ */ jsx8("span", { children: "\u5206\u7C7B" }),
        /* @__PURE__ */ jsx8("span", { children: "\u66FF\u6362\u5EFA\u8BAE" }),
        /* @__PURE__ */ jsx8("span", { children: "\u542F\u7528" }),
        /* @__PURE__ */ jsx8("span", {})
      ] }),
      /* @__PURE__ */ jsx8("ul", { children: (words ?? []).map((item) => /* @__PURE__ */ jsxs7("li", { className: "grid grid-cols-[minmax(0,1fr)_5rem_6rem_minmax(0,1fr)_3.5rem_3rem] items-center gap-2 border-b border-(--ui-stroke-secondary) px-2 py-1.5 text-xs", children: [
        /* @__PURE__ */ jsx8("span", { className: "truncate", children: item.word }),
        /* @__PURE__ */ jsx8(Badge, { variant: item.level === "must" ? "destructive" : "warn", children: item.level === "must" ? "\u5FC5\u987B\u5904\u7406" : "\u63D0\u9192" }),
        /* @__PURE__ */ jsx8("span", { className: "truncate text-(--ui-text-secondary)", children: item.category }),
        /* @__PURE__ */ jsx8("span", { className: "truncate", children: item.suggestion || "\u2014" }),
        /* @__PURE__ */ jsx8(
          Switch2,
          {
            checked: item.enabled,
            "aria-label": `${item.word}\u542F\u7528`,
            onCheckedChange: (checked) => {
              void patchBannedWord(item.id, { enabled: checked }).then(onChanged).catch((reason) => {
                setError(reason instanceof Error ? reason.message : "\u66F4\u65B0\u5931\u8D25");
              });
            }
          }
        ),
        /* @__PURE__ */ jsx8(Button6, { size: "xs", variant: "ghost", onClick: () => setRemoving(item), children: "\u5220\u9664" })
      ] }, item.id)) })
    ] }),
    /* @__PURE__ */ jsx8(
      ConfirmDialog,
      {
        open: removing != null,
        title: "\u5220\u9664\u8FD9\u4E2A\u8BCD",
        description: removing ? `\u5220\u9664\u300C${removing.word}\u300D\u540E\uFF0C\u68C0\u67E5\u4E0D\u518D\u7528\u5B83\u3002` : "",
        confirmLabel: "\u5220\u9664",
        onClose: () => setRemoving(null),
        onConfirm: async () => {
          if (!removing) return;
          await deleteBannedWord(removing.id);
          setRemoving(null);
          onChanged();
        }
      }
    )
  ] });
}
function ColorList({ colors, onChange }) {
  return /* @__PURE__ */ jsxs7("div", { className: "flex flex-col gap-1", children: [
    /* @__PURE__ */ jsx8("div", { className: "text-xs text-(--ui-text-secondary)", children: "\u54C1\u724C\u8272" }),
    colors.map((color, index) => /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx8("span", { className: "h-5 w-5 shrink-0 rounded-sm border border-(--ui-stroke-secondary)", style: { background: safeColor(color) } }),
      /* @__PURE__ */ jsx8(
        Input3,
        {
          "aria-label": `\u54C1\u724C\u8272 ${index + 1}`,
          value: color,
          onChange: (event) => onChange(colors.map((item, itemIndex) => itemIndex === index ? event.target.value : item))
        }
      ),
      /* @__PURE__ */ jsx8(Button6, { size: "xs", variant: "ghost", onClick: () => onChange(colors.filter((_, itemIndex) => itemIndex !== index)), children: "\u5220\u9664" })
    ] }, index)),
    /* @__PURE__ */ jsx8(Button6, { size: "xs", variant: "outline", onClick: () => onChange([...colors, "#000000"]), children: "\u52A0\u4E00\u4E2A\u989C\u8272" })
  ] });
}
function StringRows({ label, values, onChange }) {
  return /* @__PURE__ */ jsxs7("div", { className: "flex flex-col gap-1", children: [
    /* @__PURE__ */ jsx8("div", { className: "text-xs text-(--ui-text-secondary)", children: label }),
    values.map((value, index) => /* @__PURE__ */ jsxs7("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx8(
        Input3,
        {
          "aria-label": `${label} ${index + 1}`,
          value,
          onChange: (event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))
        }
      ),
      /* @__PURE__ */ jsx8(Button6, { size: "xs", variant: "ghost", onClick: () => onChange(values.filter((_, itemIndex) => itemIndex !== index)), children: "\u5220\u9664" })
    ] }, index)),
    /* @__PURE__ */ jsx8(Button6, { size: "xs", variant: "outline", onClick: () => onChange([...values, ""]), children: "\u52A0\u4E00\u9879" })
  ] });
}
function unique(values) {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "zh-CN"));
}
function safeColor(value) {
  return /^#[0-9a-fA-F]{3,8}$/.test(value.trim()) ? value.trim() : "transparent";
}

// src/pages/campaigns/CampaignsPage.tsx
import { useEffect as useEffect9, useRef as useRef3, useState as useState9 } from "react";
import {
  Badge as Badge2,
  Button as Button9,
  EmptyState as EmptyState3,
  ErrorState as ErrorState3,
  Loader as Loader4,
  Select as Select4,
  SelectContent as SelectContent4,
  SelectItem as SelectItem4,
  SelectTrigger as SelectTrigger4,
  SelectValue as SelectValue4,
  Skeleton,
  Tip as Tip2,
  cn as cn3
} from "@hermes/plugin-sdk";

// src/pages/brand-labels.ts
var KIND_LABEL2 = {
  holiday: "\u8282\u5047\u65E5\u4FC3\u9500",
  big_promo: "\u5927\u4FC3",
  new_launch: "\u65B0\u54C1\u4E0A\u5E02",
  offline: "\u7EBF\u4E0B\u5730\u63A8",
  other: "\u5176\u4ED6"
};
var STATUS_LABEL3 = {
  planning: "\u7B79\u5907",
  running: "\u8FDB\u884C\u4E2D",
  ended: "\u5DF2\u7ED3\u675F",
  cancelled: "\u5DF2\u53D6\u6D88"
};
var PHASE_LABEL = {
  upcoming: "\u5373\u5C06\u5F00\u59CB",
  running: "\u8FDB\u884C\u4E2D",
  ended: "\u5DF2\u7ED3\u675F",
  cancelled: "\u5DF2\u53D6\u6D88"
};
var TASK_KIND_LABEL = {
  copy: "\u6587\u6848",
  design: "\u8BBE\u8BA1",
  ads: "\u6295\u653E",
  member: "\u4F1A\u5458\u89E6\u8FBE",
  other: "\u5176\u4ED6"
};
var METRIC_LABEL = {
  visitors: "\u8BBF\u5BA2",
  orders: "\u8BA2\u5355",
  sales_amount: "\u9500\u552E\u989D",
  conversion_rate: "\u8F6C\u5316\u7387",
  ad_spend: "\u6295\u653E\u82B1\u8D39",
  ad_gmv: "\u6295\u653E\u6210\u4EA4",
  roi: "ROI"
};
var CAMPAIGN_KINDS = ["holiday", "big_promo", "new_launch", "offline", "other"];
var CAMPAIGN_STATUSES = ["planning", "running", "ended", "cancelled"];
var TASK_KINDS = ["copy", "design", "ads", "member", "other"];
function phaseClass(phase) {
  if (phase === "running") return "bg-(--ui-accent) text-(--ui-bg-editor)";
  if (phase === "upcoming") return "border border-(--ui-accent) bg-(--ui-bg-editor) text-(--ui-accent)";
  if (phase === "cancelled") return "border border-destructive bg-(--ui-bg-editor) text-destructive";
  return "bg-(--ui-bg-quinary) text-(--ui-text-secondary)";
}
function phaseBadge(phase) {
  if (phase === "running") return "default";
  if (phase === "cancelled") return "destructive";
  if (phase === "upcoming") return "outline";
  return "muted";
}

// src/pages/campaigns/calendar.ts
function isoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
function monthBounds(anchor) {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  return { from: isoDate(start), to: isoDate(end) };
}
function monthWeeks(anchor) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const cursor = new Date(first);
  const weekday = cursor.getDay();
  cursor.setDate(cursor.getDate() - (weekday === 0 ? 6 : weekday - 1));
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const weeks = [];
  while (cursor <= last || weeks.length === 0) {
    const week = [];
    for (let index = 0; index < 7; index += 1) {
      week.push({
        iso: isoDate(cursor),
        day: cursor.getDate(),
        inMonth: cursor.getMonth() === anchor.getMonth()
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    if (weeks.length > 6) break;
  }
  return weeks;
}
function placeWeekBars(week, campaigns) {
  const weekStart = week[0]?.iso ?? "";
  const weekEnd = week[6]?.iso ?? "";
  const segments = campaigns.filter((item) => item.end_date >= weekStart && item.start_date <= weekEnd).map((item) => {
    const startCol = item.start_date < weekStart ? 0 : week.findIndex((day) => day.iso === item.start_date);
    const endCol = item.end_date > weekEnd ? 6 : week.findIndex((day) => day.iso === item.end_date);
    return { id: item.id, startCol: Math.max(0, startCol), endCol: endCol < 0 ? 6 : endCol };
  }).sort((a, b) => a.startCol - b.startCol || b.endCol - b.startCol - (a.endCol - a.startCol) || a.id - b.id);
  const laneEnds = [];
  return segments.map((segment) => {
    let lane = laneEnds.findIndex((end) => end < segment.startCol);
    if (lane < 0) {
      lane = laneEnds.length;
      laneEnds.push(segment.endCol);
    } else {
      laneEnds[lane] = segment.endCol;
    }
    return { ...segment, lane };
  });
}

// src/pages/campaigns/CampaignDialog.tsx
import { useEffect as useEffect7, useState as useState7 } from "react";
import {
  Button as Button7,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input as Input4,
  Select as Select2,
  SelectContent as SelectContent2,
  SelectItem as SelectItem2,
  SelectTrigger as SelectTrigger2,
  SelectValue as SelectValue2,
  Switch as Switch3,
  Textarea as Textarea4
} from "@hermes/plugin-sdk";
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
function CampaignDialog({
  open,
  brands,
  onClose,
  onCreated
}) {
  const apiBase = useApiBase();
  const today = isoDate(/* @__PURE__ */ new Date());
  const [name, setName] = useState7("");
  const [brand, setBrand] = useState7("");
  const [kind, setKind] = useState7("big_promo");
  const [start, setStart] = useState7(today);
  const [end, setEnd] = useState7(today);
  const [targetSales, setTargetSales] = useState7("");
  const [budget, setBudget] = useState7("");
  const [goal, setGoal] = useState7("");
  const [useTemplate, setUseTemplate] = useState7(true);
  const [templates, setTemplates] = useState7([]);
  const [error, setError] = useState7(null);
  const [saving, setSaving] = useState7(false);
  useEffect7(() => {
    if (!open) return;
    setName("");
    setBrand(brands[0] ?? "");
    setKind("big_promo");
    setStart(today);
    setEnd(today);
    setTargetSales("");
    setBudget("");
    setGoal("");
    setUseTemplate(true);
    setError(null);
  }, [open]);
  useEffect7(() => {
    if (open && !brand && brands[0]) setBrand(brands[0]);
  }, [open, brand, brands]);
  useEffect7(() => {
    if (!open) return;
    let cancelled = false;
    listCampaignTemplates().then((rows) => {
      if (!cancelled) setTemplates(rows);
    }).catch(() => {
      if (!cancelled) setTemplates([]);
    });
    return () => {
      cancelled = true;
    };
  }, [open, apiBase]);
  const tasks = templates.find((item) => item.kind === kind)?.tasks ?? [];
  const submit = async () => {
    if (!name.trim() || !brand.trim()) {
      setError("\u540D\u79F0\u548C\u54C1\u724C\u90FD\u8981\u586B");
      return;
    }
    if (end < start) {
      setError("\u7ED3\u675F\u65E5\u671F\u4E0D\u80FD\u65E9\u4E8E\u5F00\u59CB\u65E5\u671F");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createCampaign({
        name: name.trim(),
        brand: brand.trim(),
        kind,
        start_date: start,
        end_date: end,
        goal: goal.trim() || null,
        target_sales: targetSales.trim() ? Number(targetSales) : null,
        budget: budget.trim() ? Number(budget) : null,
        use_template: useTemplate
      });
      onCreated(created.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "\u521B\u5EFA\u5931\u8D25");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsx9(Dialog, { open, onOpenChange: (next) => {
    if (!next) onClose();
  }, children: /* @__PURE__ */ jsxs8(DialogContent, { children: [
    /* @__PURE__ */ jsxs8(DialogHeader, { children: [
      /* @__PURE__ */ jsx9(DialogTitle, { children: "\u65B0\u5EFA\u6D3B\u52A8" }),
      /* @__PURE__ */ jsx9(DialogDescription, { children: "\u5957\u7528\u4EFB\u52A1\u6E05\u5355\u4F1A\u6309\u7C7B\u578B\u5E26\u4E0A\u9ED8\u8BA4\u4EFB\u52A1\uFF0C\u4E4B\u540E\u4ECD\u80FD\u589E\u5220\u3002" })
    ] }),
    /* @__PURE__ */ jsxs8("label", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
      "\u540D\u79F0",
      /* @__PURE__ */ jsx9(Input4, { "aria-label": "\u6D3B\u52A8\u540D\u79F0", value: name, onChange: (event) => setName(event.target.value) })
    ] }),
    /* @__PURE__ */ jsxs8("div", { className: "grid grid-cols-[8rem_minmax(0,1fr)] gap-2", children: [
      /* @__PURE__ */ jsxs8(Select2, { value: brands.includes(brand) ? brand : "custom", onValueChange: (value) => {
        if (value !== "custom") setBrand(value);
      }, children: [
        /* @__PURE__ */ jsx9(SelectTrigger2, { "aria-label": "\u5DF2\u6709\u54C1\u724C", children: /* @__PURE__ */ jsx9(SelectValue2, { placeholder: "\u54C1\u724C" }) }),
        /* @__PURE__ */ jsxs8(SelectContent2, { children: [
          /* @__PURE__ */ jsx9(SelectItem2, { value: "custom", children: "\u624B\u586B" }),
          brands.map((item) => /* @__PURE__ */ jsx9(SelectItem2, { value: item, children: item }, item))
        ] })
      ] }),
      /* @__PURE__ */ jsx9(Input4, { "aria-label": "\u54C1\u724C", value: brand, onChange: (event) => setBrand(event.target.value), placeholder: "\u54C1\u724C" })
    ] }),
    /* @__PURE__ */ jsxs8(Select2, { value: kind, onValueChange: (value) => setKind(value), children: [
      /* @__PURE__ */ jsx9(SelectTrigger2, { "aria-label": "\u6D3B\u52A8\u7C7B\u578B", children: /* @__PURE__ */ jsx9(SelectValue2, {}) }),
      /* @__PURE__ */ jsx9(SelectContent2, { children: CAMPAIGN_KINDS.map((item) => /* @__PURE__ */ jsx9(SelectItem2, { value: item, children: KIND_LABEL2[item] }, item)) })
    ] }),
    /* @__PURE__ */ jsxs8("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxs8("label", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
        "\u5F00\u59CB",
        /* @__PURE__ */ jsx9(Input4, { "aria-label": "\u5F00\u59CB\u65E5\u671F", type: "date", value: start, onChange: (event) => setStart(event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs8("label", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
        "\u7ED3\u675F",
        /* @__PURE__ */ jsx9(Input4, { "aria-label": "\u7ED3\u675F\u65E5\u671F", type: "date", value: end, onChange: (event) => setEnd(event.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs8("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsx9(Input4, { "aria-label": "\u76EE\u6807\u9500\u552E\u989D", inputMode: "decimal", placeholder: "\u76EE\u6807\u9500\u552E\u989D", value: targetSales, onChange: (event) => setTargetSales(event.target.value) }),
      /* @__PURE__ */ jsx9(Input4, { "aria-label": "\u9884\u7B97", inputMode: "decimal", placeholder: "\u9884\u7B97", value: budget, onChange: (event) => setBudget(event.target.value) })
    ] }),
    /* @__PURE__ */ jsx9(Textarea4, { "aria-label": "\u76EE\u6807\u8BF4\u660E", placeholder: "\u76EE\u6807\u8BF4\u660E", value: goal, onChange: (event) => setGoal(event.target.value) }),
    /* @__PURE__ */ jsxs8("div", { className: "flex items-center justify-between gap-3 text-xs", children: [
      /* @__PURE__ */ jsx9("span", { children: "\u6309\u7C7B\u578B\u5957\u7528\u4EFB\u52A1\u6E05\u5355" }),
      /* @__PURE__ */ jsx9(Switch3, { checked: useTemplate, onCheckedChange: setUseTemplate, "aria-label": "\u6309\u7C7B\u578B\u5957\u7528\u4EFB\u52A1\u6E05\u5355" })
    ] }),
    useTemplate ? /* @__PURE__ */ jsxs8("ul", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
      tasks.length === 0 ? /* @__PURE__ */ jsx9("li", { children: "\u8FD9\u4E2A\u7C7B\u578B\u6CA1\u6709\u9884\u8BBE\u4EFB\u52A1\u3002" }) : null,
      tasks.map((task) => /* @__PURE__ */ jsxs8("li", { children: [
        TASK_KIND_LABEL[task.kind] ?? task.kind,
        " \xB7 ",
        task.title
      ] }, task.title))
    ] }) : null,
    error ? /* @__PURE__ */ jsx9("p", { className: "text-xs text-destructive", children: error }) : null,
    /* @__PURE__ */ jsxs8(DialogFooter, { children: [
      /* @__PURE__ */ jsx9(Button7, { size: "sm", variant: "outline", onClick: onClose, children: "\u53D6\u6D88" }),
      /* @__PURE__ */ jsx9(Button7, { size: "sm", disabled: saving, onClick: () => void submit(), children: "\u521B\u5EFA" })
    ] })
  ] }) });
}

// src/pages/campaigns/CampaignDrawer.tsx
import { useEffect as useEffect8, useState as useState8 } from "react";
import {
  Button as Button8,
  ConfirmDialog as ConfirmDialog2,
  ErrorState as ErrorState2,
  Input as Input5,
  Loader as Loader3,
  SegmentedControl as SegmentedControl2,
  Select as Select3,
  SelectContent as SelectContent3,
  SelectItem as SelectItem3,
  SelectTrigger as SelectTrigger3,
  SelectValue as SelectValue3,
  Textarea as Textarea5
} from "@hermes/plugin-sdk";
import { jsx as jsx10, jsxs as jsxs9 } from "react/jsx-runtime";
var METRIC_ORDER = ["visitors", "orders", "sales_amount", "conversion_rate", "ad_spend", "ad_gmv", "roi"];
function CampaignDrawer({
  campaignId,
  onClose,
  onChanged
}) {
  const [tab, setTab] = useState8("info");
  const [detail, setDetail] = useState8(null);
  const [loadedFor, setLoadedFor] = useState8(null);
  const [error, setError] = useState8(null);
  const [revision, setRevision] = useState8(0);
  useEffect8(() => {
    setTab("info");
    setDetail(null);
    setLoadedFor(null);
  }, [campaignId]);
  useEffect8(() => {
    if (campaignId == null) return;
    let cancelled = false;
    setError(null);
    getCampaign(campaignId).then((value) => {
      if (cancelled) return;
      setDetail(value);
      setLoadedFor(campaignId);
    }).catch((reason) => {
      if (cancelled) return;
      setError(reason);
      setLoadedFor(campaignId);
    });
    return () => {
      cancelled = true;
    };
  }, [campaignId, revision]);
  const refresh = () => {
    setRevision((value) => value + 1);
    onChanged();
  };
  return /* @__PURE__ */ jsx10(
    SideDrawer,
    {
      open: campaignId != null,
      title: detail?.name ?? "\u6D3B\u52A8",
      description: detail ? `${detail.brand} \xB7 ${detail.start_date} \u81F3 ${detail.end_date}` : void 0,
      onClose,
      widthClass: "max-w-xl",
      children: loadedFor !== campaignId || !detail ? error ? /* @__PURE__ */ jsx10(ErrorState2, { title: "\u6D3B\u52A8\u5355\u52A0\u8F7D\u5931\u8D25", description: error instanceof Error ? error.message : "\u8BF7\u91CD\u8BD5", children: /* @__PURE__ */ jsx10(Button8, { size: "sm", variant: "outline", onClick: refresh, children: "\u91CD\u8BD5" }) }) : /* @__PURE__ */ jsx10("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsx10(Loader3, {}) }) : /* @__PURE__ */ jsxs9("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsx10(
          SegmentedControl2,
          {
            sizing: "content",
            value: tab,
            onChange: setTab,
            options: [
              { id: "info", label: "\u57FA\u672C\u4FE1\u606F" },
              { id: "tasks", label: "\u4EFB\u52A1" },
              { id: "review", label: "\u590D\u76D8" }
            ]
          }
        ),
        tab === "info" ? /* @__PURE__ */ jsx10(InfoForm, { detail, onSaved: refresh }) : null,
        tab === "tasks" ? /* @__PURE__ */ jsx10(TaskList, { detail, onChanged: refresh }) : null,
        tab === "review" ? /* @__PURE__ */ jsx10(ReviewPane, { campaignId: detail.id, name: detail.name }) : null
      ] })
    }
  );
}
function InfoForm({ detail, onSaved }) {
  const [name, setName] = useState8(detail.name);
  const [kind, setKind] = useState8(detail.kind);
  const [status, setStatus] = useState8(detail.status);
  const [start, setStart] = useState8(detail.start_date);
  const [end, setEnd] = useState8(detail.end_date);
  const [goal, setGoal] = useState8(detail.goal ?? "");
  const [targetSales, setTargetSales] = useState8(detail.target_sales == null ? "" : String(detail.target_sales));
  const [budget, setBudget] = useState8(detail.budget == null ? "" : String(detail.budget));
  const [error, setError] = useState8(null);
  const [saving, setSaving] = useState8(false);
  useEffect8(() => {
    setName(detail.name);
    setKind(detail.kind);
    setStatus(detail.status);
    setStart(detail.start_date);
    setEnd(detail.end_date);
    setGoal(detail.goal ?? "");
    setTargetSales(detail.target_sales == null ? "" : String(detail.target_sales));
    setBudget(detail.budget == null ? "" : String(detail.budget));
  }, [detail]);
  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await patchCampaign(detail.id, {
        name: name.trim(),
        kind,
        status,
        start_date: start,
        end_date: end,
        goal: goal.trim() || null,
        target_sales: targetSales.trim() ? Number(targetSales) : null,
        budget: budget.trim() ? Number(budget) : null
      });
      onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "\u4FDD\u5B58\u5931\u8D25");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxs9("div", { className: "flex flex-col gap-3", children: [
    /* @__PURE__ */ jsx10(FieldText, { label: "\u54C1\u724C", children: detail.brand }),
    /* @__PURE__ */ jsx10(Input5, { "aria-label": "\u6D3B\u52A8\u540D\u79F0", value: name, onChange: (event) => setName(event.target.value) }),
    /* @__PURE__ */ jsx10(
      SegmentedControl2,
      {
        sizing: "content",
        value: status,
        onChange: setStatus,
        options: CAMPAIGN_STATUSES.map((item) => ({ id: item, label: STATUS_LABEL3[item] ?? item }))
      }
    ),
    /* @__PURE__ */ jsxs9(Select3, { value: kind, onValueChange: setKind, children: [
      /* @__PURE__ */ jsx10(SelectTrigger3, { "aria-label": "\u6D3B\u52A8\u7C7B\u578B", children: /* @__PURE__ */ jsx10(SelectValue3, {}) }),
      /* @__PURE__ */ jsx10(SelectContent3, { children: CAMPAIGN_KINDS.map((item) => /* @__PURE__ */ jsx10(SelectItem3, { value: item, children: KIND_LABEL2[item] }, item)) })
    ] }),
    /* @__PURE__ */ jsxs9("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsx10(Input5, { "aria-label": "\u5F00\u59CB\u65E5\u671F", type: "date", value: start, onChange: (event) => setStart(event.target.value) }),
      /* @__PURE__ */ jsx10(Input5, { "aria-label": "\u7ED3\u675F\u65E5\u671F", type: "date", value: end, onChange: (event) => setEnd(event.target.value) })
    ] }),
    /* @__PURE__ */ jsxs9("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsx10(Input5, { "aria-label": "\u76EE\u6807\u9500\u552E\u989D", value: targetSales, onChange: (event) => setTargetSales(event.target.value), placeholder: "\u76EE\u6807\u9500\u552E\u989D" }),
      /* @__PURE__ */ jsx10(Input5, { "aria-label": "\u9884\u7B97", value: budget, onChange: (event) => setBudget(event.target.value), placeholder: "\u9884\u7B97" })
    ] }),
    /* @__PURE__ */ jsx10(Textarea5, { "aria-label": "\u76EE\u6807\u8BF4\u660E", value: goal, onChange: (event) => setGoal(event.target.value), placeholder: "\u76EE\u6807\u8BF4\u660E" }),
    error ? /* @__PURE__ */ jsx10("p", { className: "text-xs text-destructive", children: error }) : null,
    /* @__PURE__ */ jsx10("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx10(Button8, { size: "sm", disabled: saving, onClick: () => void save(), children: "\u4FDD\u5B58" }) })
  ] });
}
function TaskList({ detail, onChanged }) {
  const [title, setTitle] = useState8("");
  const [kind, setKind] = useState8("other");
  const [owner, setOwner] = useState8("");
  const [due, setDue] = useState8("");
  const [error, setError] = useState8(null);
  const [pending, setPending] = useState8(null);
  const add = async () => {
    if (!title.trim()) return;
    setError(null);
    try {
      await createCampaignTask(detail.id, {
        title: title.trim(),
        kind,
        owner: owner.trim() || null,
        due_date: due || null
      });
      setTitle("");
      setOwner("");
      setDue("");
      onChanged();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "\u6DFB\u52A0\u5931\u8D25");
    }
  };
  return /* @__PURE__ */ jsxs9("div", { className: "flex flex-col gap-3", children: [
    /* @__PURE__ */ jsxs9("ul", { className: "flex flex-col", children: [
      detail.tasks.length === 0 ? /* @__PURE__ */ jsx10("li", { className: "py-2 text-xs text-(--ui-text-tertiary)", children: "\u8FD8\u6CA1\u6709\u4EFB\u52A1\u3002" }) : null,
      detail.tasks.map((task) => /* @__PURE__ */ jsx10(TaskRow, { task, pending: pending === task.id, onChanged, onError: setError, setPending }, task.id))
    ] }),
    /* @__PURE__ */ jsxs9("div", { className: "grid grid-cols-[minmax(0,1fr)_6rem] gap-2", children: [
      /* @__PURE__ */ jsx10(Input5, { "aria-label": "\u65B0\u4EFB\u52A1", placeholder: "\u65B0\u4EFB\u52A1", value: title, onChange: (event) => setTitle(event.target.value) }),
      /* @__PURE__ */ jsxs9(Select3, { value: kind, onValueChange: setKind, children: [
        /* @__PURE__ */ jsx10(SelectTrigger3, { "aria-label": "\u4EFB\u52A1\u7C7B\u578B", children: /* @__PURE__ */ jsx10(SelectValue3, {}) }),
        /* @__PURE__ */ jsx10(SelectContent3, { children: TASK_KINDS.map((item) => /* @__PURE__ */ jsx10(SelectItem3, { value: item, children: TASK_KIND_LABEL[item] }, item)) })
      ] }),
      /* @__PURE__ */ jsx10(Input5, { "aria-label": "\u8D1F\u8D23\u4EBA", placeholder: "\u8D1F\u8D23\u4EBA", value: owner, onChange: (event) => setOwner(event.target.value) }),
      /* @__PURE__ */ jsx10(Input5, { "aria-label": "\u622A\u6B62\u65E5\u671F", type: "date", value: due, onChange: (event) => setDue(event.target.value) })
    ] }),
    error ? /* @__PURE__ */ jsx10("p", { className: "text-xs text-destructive", children: error }) : null,
    /* @__PURE__ */ jsx10("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx10(Button8, { size: "sm", variant: "outline", onClick: () => void add(), children: "\u52A0\u4EFB\u52A1" }) })
  ] });
}
function TaskRow({
  task,
  pending,
  onChanged,
  onError,
  setPending
}) {
  const [owner, setOwner] = useState8(task.owner ?? "");
  const [due, setDue] = useState8(task.due_date ?? "");
  const [confirming, setConfirming] = useState8(false);
  useEffect8(() => {
    setOwner(task.owner ?? "");
    setDue(task.due_date ?? "");
  }, [task]);
  const saveField = async (patch) => {
    setPending(task.id);
    onError(null);
    try {
      await patchCampaignTask(task.id, patch);
      onChanged();
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : "\u4FDD\u5B58\u5931\u8D25");
    } finally {
      setPending(null);
    }
  };
  return /* @__PURE__ */ jsxs9("li", { className: "grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2 border-b border-(--ui-stroke-secondary) py-2", children: [
    /* @__PURE__ */ jsx10(
      "input",
      {
        type: "checkbox",
        className: "mt-0.5",
        "aria-label": `${task.title}\u5DF2\u5B8C\u6210`,
        checked: task.done,
        disabled: pending,
        onChange: (event) => void saveField({ done: event.target.checked })
      }
    ),
    /* @__PURE__ */ jsxs9("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxs9("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsx10("span", { className: task.done ? "text-xs text-(--ui-text-tertiary) line-through" : "text-xs", children: task.title }),
        /* @__PURE__ */ jsx10(Button8, { size: "xs", variant: "ghost", onClick: () => setConfirming(true), children: "\u5220\u9664" })
      ] }),
      /* @__PURE__ */ jsx10("div", { className: "mt-1 text-[0.6875rem] text-(--ui-text-tertiary)", children: TASK_KIND_LABEL[task.kind] ?? task.kind }),
      /* @__PURE__ */ jsxs9("div", { className: "mt-1 grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsx10(
          Input5,
          {
            "aria-label": `${task.title}\u8D1F\u8D23\u4EBA`,
            value: owner,
            placeholder: "\u8D1F\u8D23\u4EBA",
            onChange: (event) => setOwner(event.target.value),
            onBlur: () => {
              if (owner.trim() !== (task.owner ?? "")) void saveField({ owner: owner.trim() || null });
            }
          }
        ),
        /* @__PURE__ */ jsx10(
          Input5,
          {
            "aria-label": `${task.title}\u622A\u6B62\u65E5\u671F`,
            type: "date",
            value: due,
            onChange: (event) => setDue(event.target.value),
            onBlur: () => {
              if (due !== (task.due_date ?? "")) void saveField({ due_date: due || null });
            }
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx10(
      ConfirmDialog2,
      {
        open: confirming,
        title: "\u5220\u9664\u8FD9\u4E2A\u4EFB\u52A1",
        description: `\u5220\u9664\u300C${task.title}\u300D\u540E\u4E0D\u80FD\u6062\u590D\u3002`,
        confirmLabel: "\u5220\u9664",
        onClose: () => setConfirming(false),
        onConfirm: async () => {
          await deleteCampaignTask(task.id);
          setConfirming(false);
          onChanged();
        }
      }
    )
  ] });
}
function ReviewPane({ campaignId, name }) {
  const [review, setReview] = useState8(null);
  const [error, setError] = useState8(null);
  const [loading, setLoading] = useState8(true);
  const [notice, setNotice] = useState8(null);
  useEffect8(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCampaignReview(campaignId).then((value) => {
      if (!cancelled) setReview(value);
    }).catch((reason) => {
      if (!cancelled) setError(reason);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [campaignId]);
  const copy = async (text, done) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(done);
      return;
    } catch {
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    setNotice(ok ? done : "\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u9009\u62E9\u6587\u5B57");
  };
  if (loading) {
    return /* @__PURE__ */ jsx10("div", { className: "flex justify-center py-6", children: /* @__PURE__ */ jsx10(Loader3, {}) });
  }
  if (error || !review) {
    return /* @__PURE__ */ jsx10(ErrorState2, { title: "\u590D\u76D8\u52A0\u8F7D\u5931\u8D25", description: error instanceof Error ? error.message : "\u8BF7\u91CD\u8BD5" });
  }
  return /* @__PURE__ */ jsxs9("div", { className: "flex flex-col gap-3", children: [
    review.days_with_data < review.days ? /* @__PURE__ */ jsxs9("p", { className: "text-xs text-(--ui-text-secondary)", children: [
      "\u8FD9 ",
      review.days,
      " \u5929\u91CC\u53EA\u6709 ",
      review.days_with_data,
      " \u5929\u6709\u7ECF\u8425\u6570\u636E\u3002\u5BF9\u6BD4\u533A\u95F4 ",
      review.compare_start,
      " \u81F3 ",
      review.compare_end,
      "\u3002"
    ] }) : /* @__PURE__ */ jsxs9("p", { className: "text-xs text-(--ui-text-tertiary)", children: [
      "\u5BF9\u6BD4 ",
      review.compare_start,
      " \u81F3 ",
      review.compare_end
    ] }),
    /* @__PURE__ */ jsx10("div", { className: "flex flex-col", children: METRIC_ORDER.map((key) => {
      const metric = review.metrics[key];
      if (!metric) return null;
      return /* @__PURE__ */ jsxs9("div", { className: "flex items-center justify-between gap-3 border-b border-(--ui-stroke-secondary) py-1.5 text-xs", children: [
        /* @__PURE__ */ jsx10("span", { className: "text-(--ui-text-secondary)", children: METRIC_LABEL[key] ?? key }),
        /* @__PURE__ */ jsxs9("span", { className: "flex items-center gap-2 tabular-nums", children: [
          /* @__PURE__ */ jsx10("span", { children: formatMetric(key, metric.value) }),
          /* @__PURE__ */ jsx10(Change, { value: metric.change })
        ] })
      ] }, key);
    }) }),
    /* @__PURE__ */ jsx10(RateRow, { label: "\u76EE\u6807\u5B8C\u6210\u7387", rate: review.target_rate }),
    /* @__PURE__ */ jsx10(RateRow, { label: "\u9884\u7B97\u4F7F\u7528\u7387", rate: review.budget_rate }),
    /* @__PURE__ */ jsxs9("div", { className: "text-[0.6875rem] text-(--ui-text-tertiary)", children: [
      "\u4EFB\u52A1 ",
      review.tasks_done,
      "/",
      review.tasks_total
    ] }),
    review.shops.length > 0 ? /* @__PURE__ */ jsxs9("div", { children: [
      /* @__PURE__ */ jsxs9("div", { className: "grid grid-cols-[minmax(0,1.2fr)_4.5rem_3rem_4.5rem_3rem] gap-2 border-b border-(--ui-stroke-secondary) py-1 text-[0.6875rem] text-(--ui-text-tertiary)", children: [
        /* @__PURE__ */ jsx10("span", { children: "\u5E97\u94FA" }),
        /* @__PURE__ */ jsx10("span", { children: "\u9500\u552E\u989D" }),
        /* @__PURE__ */ jsx10("span", { children: "\u8BA2\u5355" }),
        /* @__PURE__ */ jsx10("span", { children: "\u6295\u653E" }),
        /* @__PURE__ */ jsx10("span", { children: "ROI" })
      ] }),
      review.shops.map((shop) => /* @__PURE__ */ jsxs9("div", { className: "grid grid-cols-[minmax(0,1.2fr)_4.5rem_3rem_4.5rem_3rem] gap-2 border-b border-(--ui-stroke-secondary) py-1.5 text-xs", children: [
        /* @__PURE__ */ jsxs9("span", { className: "truncate", children: [
          platformName(shop.platform),
          " \xB7 ",
          shop.shop_name
        ] }),
        /* @__PURE__ */ jsx10("span", { className: "tabular-nums", children: formatMetric("sales_amount", shop.sales_amount) }),
        /* @__PURE__ */ jsx10("span", { className: "tabular-nums", children: shop.orders }),
        /* @__PURE__ */ jsx10("span", { className: "tabular-nums", children: formatMetric("ad_spend", shop.ad_spend) }),
        /* @__PURE__ */ jsx10("span", { className: "tabular-nums", children: shop.roi == null ? "\u2014" : shop.roi.toFixed(2) })
      ] }, shop.shop_id))
    ] }) : null,
    /* @__PURE__ */ jsxs9("div", { className: "flex flex-wrap justify-end gap-2", children: [
      /* @__PURE__ */ jsx10(Button8, { size: "sm", variant: "outline", onClick: () => void copy(review.markdown, "\u590D\u76D8\u6587\u5B57\u5DF2\u590D\u5236"), children: "\u590D\u5236\u590D\u76D8\u6587\u5B57" }),
      /* @__PURE__ */ jsx10(
        Button8,
        {
          size: "sm",
          onClick: () => void copy(
            `\u5E2E\u6211\u5199\u6D3B\u52A8\u300E${name}\u300F\u7684\u590D\u76D8\u7ED3\u8BBA\uFF0C\u6D3B\u52A8 id \u662F ${campaignId}`,
            "\u5DF2\u590D\u5236\u3002\u5230\u54C1\u724C\u52A9\u624B\u5BF9\u8BDD\u91CC\u7C98\u8D34\u3002"
          ),
          children: "\u4EA4\u7ED9\u54C1\u724C\u52A9\u624B"
        }
      )
    ] }),
    notice ? /* @__PURE__ */ jsx10("p", { className: "text-right text-xs text-(--ui-text-secondary)", children: notice }) : null
  ] });
}
function RateRow({ label, rate }) {
  const width = rate == null ? 0 : Math.max(0, Math.min(100, rate * 100));
  return /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-2 text-xs", children: [
    /* @__PURE__ */ jsx10("span", { className: "w-20 shrink-0 text-(--ui-text-secondary)", children: label }),
    /* @__PURE__ */ jsx10("span", { className: "h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-(--ui-bg-quinary)", children: /* @__PURE__ */ jsx10("span", { className: "block h-full bg-(--ui-accent)", style: { width: `${width}%` } }) }),
    /* @__PURE__ */ jsx10("span", { className: "w-12 text-right tabular-nums", children: rate == null ? "\u672A\u8BBE\u7F6E" : `${Math.round(rate * 100)}%` })
  ] });
}
function Change({ value }) {
  if (value == null) return /* @__PURE__ */ jsx10("span", { className: "text-(--ui-text-tertiary)", children: "\u2014" });
  const pct = Math.round(value * 1e3) / 10;
  if (pct === 0) return /* @__PURE__ */ jsx10("span", { className: "text-(--ui-text-tertiary)", children: "0%" });
  const up = pct > 0;
  return /* @__PURE__ */ jsxs9("span", { className: up ? "text-(--ui-accent)" : "text-destructive", children: [
    up ? "\u2191" : "\u2193",
    " ",
    Math.abs(pct),
    "%"
  ] });
}
function formatMetric(key, value) {
  if (value == null) return "\u2014";
  if (key === "conversion_rate") return `${Math.round(value * 1e3) / 10}%`;
  if (key === "roi") return value.toFixed(2);
  if (key === "sales_amount" || key === "ad_spend" || key === "ad_gmv") {
    return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
  }
  return String(Math.round(value));
}

// src/pages/campaigns/CampaignsPage.tsx
import { Fragment as Fragment4, jsx as jsx11, jsxs as jsxs10 } from "react/jsx-runtime";
var WEEKDAYS = ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u65E5"];
var NARROW_PX = 760;
function CampaignsPage() {
  const apiBase = useApiBase();
  const [anchor, setAnchor] = useState9(() => /* @__PURE__ */ new Date());
  const [brand, setBrand] = useState9("");
  const [creating, setCreating] = useState9(false);
  const [openId, setOpenId] = useState9(null);
  const [wide, setWide] = useState9(true);
  const frame = useRef3(null);
  const bounds = monthBounds(anchor);
  useEffect9(() => {
    const node = frame.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setWide(width >= NARROW_PX);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const shopsQuery = useQuery(() => listShops(), [apiBase]);
  const campaignsQuery = useQuery(
    () => listCampaigns({ date_from: bounds.from, date_to: bounds.to, brand: brand || void 0 }),
    [apiBase, bounds.from, bounds.to, brand]
  );
  const reload = () => {
    campaignsQuery.reload();
    shopsQuery.reload();
    void refreshRunningCampaignCount();
  };
  const error = campaignsQuery.error ?? shopsQuery.error;
  const offline = isOfflineError(error);
  const campaigns = campaignsQuery.data ?? [];
  const brands = uniqueBrands(shopsQuery.data?.map((shop) => shop.brand) ?? [], campaigns.map((item) => item.brand));
  const weeks = monthWeeks(anchor);
  const today = isoDate(/* @__PURE__ */ new Date());
  return /* @__PURE__ */ jsxs10("div", { ref: frame, className: "flex min-h-0 flex-1 flex-col gap-3", children: [
    /* @__PURE__ */ jsx11(HeaderActions, { children: /* @__PURE__ */ jsx11(Button9, { size: "sm", onClick: () => setCreating(true), children: "\u65B0\u5EFA\u6D3B\u52A8" }) }),
    offline ? /* @__PURE__ */ jsx11(OfflineNotice, { detail: error instanceof Error ? error.message : void 0, onRetry: reload }) : null,
    !offline && error ? /* @__PURE__ */ jsx11("div", { className: "flex flex-1 items-center justify-center py-10", children: /* @__PURE__ */ jsx11(ErrorState3, { title: "\u6D3B\u52A8\u52A0\u8F7D\u5931\u8D25", description: error instanceof Error ? error.message : "\u8BF7\u91CD\u8BD5", children: /* @__PURE__ */ jsx11(Button9, { size: "sm", variant: "outline", onClick: reload, children: "\u91CD\u8BD5" }) }) }) : null,
    !offline && !error ? /* @__PURE__ */ jsxs10(Fragment4, { children: [
      /* @__PURE__ */ jsxs10("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx11(Button9, { size: "xs", variant: "outline", "aria-label": "\u4E0A\u4E2A\u6708", onClick: () => setAnchor(shiftMonth(anchor, -1)), children: "\u4E0A\u4E2A\u6708" }),
        /* @__PURE__ */ jsxs10("div", { className: "min-w-24 text-center text-sm font-medium", children: [
          anchor.getFullYear(),
          "\u5E74",
          anchor.getMonth() + 1,
          "\u6708"
        ] }),
        /* @__PURE__ */ jsx11(Button9, { size: "xs", variant: "outline", "aria-label": "\u4E0B\u4E2A\u6708", onClick: () => setAnchor(shiftMonth(anchor, 1)), children: "\u4E0B\u4E2A\u6708" }),
        /* @__PURE__ */ jsx11(Button9, { size: "xs", variant: "outline", onClick: () => setAnchor(/* @__PURE__ */ new Date()), children: "\u4ECA\u5929" }),
        /* @__PURE__ */ jsxs10(
          Select4,
          {
            value: brand || "all",
            onValueChange: (value) => setBrand(value === "all" ? "" : value),
            children: [
              /* @__PURE__ */ jsx11(SelectTrigger4, { "aria-label": "\u54C1\u724C", className: "w-36", children: /* @__PURE__ */ jsx11(SelectValue4, { placeholder: "\u5168\u90E8\u54C1\u724C" }) }),
              /* @__PURE__ */ jsxs10(SelectContent4, { children: [
                /* @__PURE__ */ jsx11(SelectItem4, { value: "all", children: "\u5168\u90E8\u54C1\u724C" }),
                brands.map((item) => /* @__PURE__ */ jsx11(SelectItem4, { value: item, children: item }, item))
              ] })
            ]
          }
        ),
        campaignsQuery.loading && campaignsQuery.data ? /* @__PURE__ */ jsx11(Loader4, {}) : null
      ] }),
      campaignsQuery.loading && !campaignsQuery.data ? /* @__PURE__ */ jsx11(Skeleton, { className: "h-64 w-full" }) : /* @__PURE__ */ jsxs10("div", { className: cn3("grid gap-4", wide && "grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.8fr)]"), children: [
        wide ? /* @__PURE__ */ jsx11(
          MonthGrid,
          {
            weeks,
            campaigns,
            today,
            onOpen: setOpenId
          }
        ) : null,
        /* @__PURE__ */ jsx11(CampaignList, { campaigns, onOpen: setOpenId })
      ] })
    ] }) : null,
    /* @__PURE__ */ jsx11(
      CampaignDialog,
      {
        open: creating,
        brands,
        onClose: () => setCreating(false),
        onCreated: (id) => {
          setCreating(false);
          setOpenId(id);
          reload();
        }
      }
    ),
    /* @__PURE__ */ jsx11(
      CampaignDrawer,
      {
        campaignId: openId,
        onClose: () => setOpenId(null),
        onChanged: reload
      }
    )
  ] });
}
function MonthGrid({
  weeks,
  campaigns,
  today,
  onOpen
}) {
  const byId = new Map(campaigns.map((item) => [item.id, item]));
  return /* @__PURE__ */ jsxs10("div", { className: "min-w-0", children: [
    /* @__PURE__ */ jsx11("div", { className: "grid grid-cols-7 border-b border-(--ui-stroke-secondary) text-center text-[0.6875rem] text-(--ui-text-tertiary)", children: WEEKDAYS.map((label) => /* @__PURE__ */ jsx11("div", { className: "py-1", children: label }, label)) }),
    weeks.map((week) => {
      const bars = placeWeekBars(week, campaigns);
      const lanes = bars.reduce((max, bar) => Math.max(max, bar.lane + 1), 0);
      return /* @__PURE__ */ jsxs10("div", { className: "border-b border-(--ui-stroke-secondary)", children: [
        /* @__PURE__ */ jsx11("div", { className: "grid grid-cols-7", children: week.map((day) => /* @__PURE__ */ jsx11(
          "div",
          {
            className: cn3(
              "px-1 pt-1 text-[0.6875rem] tabular-nums",
              day.inMonth ? "text-(--ui-text-secondary)" : "text-(--ui-text-quaternary)"
            ),
            children: /* @__PURE__ */ jsx11(
              "span",
              {
                className: cn3(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1",
                  day.iso === today && "bg-(--ui-accent) text-(--ui-bg-editor)"
                ),
                children: day.day
              }
            )
          },
          day.iso
        )) }),
        /* @__PURE__ */ jsx11(
          "div",
          {
            className: "grid grid-cols-7 gap-y-0.5 px-0.5 pb-1",
            style: { gridTemplateRows: `repeat(${Math.max(lanes, 1)}, 1.25rem)` },
            children: bars.map((bar) => {
              const campaign = byId.get(bar.id);
              if (!campaign) return null;
              return /* @__PURE__ */ jsx11(
                "div",
                {
                  className: "flex min-w-0",
                  style: {
                    gridColumn: `${bar.startCol + 1} / ${bar.endCol + 2}`,
                    gridRow: bar.lane + 1
                  },
                  children: /* @__PURE__ */ jsx11(
                    Tip2,
                    {
                      label: `${campaign.brand} \xB7 ${campaign.start_date} \u81F3 ${campaign.end_date} \xB7 \u4EFB\u52A1 ${campaign.tasks_done}/${campaign.tasks_total}`,
                      children: /* @__PURE__ */ jsx11(
                        "button",
                        {
                          type: "button",
                          onClick: () => onOpen(campaign.id),
                          className: cn3(
                            "mx-0.5 min-w-0 flex-1 truncate rounded-sm px-1 text-left text-[0.6875rem] leading-5",
                            phaseClass(campaign.phase)
                          ),
                          children: campaign.name
                        }
                      )
                    }
                  )
                },
                campaign.id
              );
            })
          }
        )
      ] }, week[0]?.iso);
    })
  ] });
}
function CampaignList({ campaigns, onOpen }) {
  if (campaigns.length === 0) {
    return /* @__PURE__ */ jsx11("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx11(EmptyState3, { title: "\u8FD9\u4E2A\u6708\u6CA1\u6709\u6D3B\u52A8", description: "\u65B0\u5EFA\u4E00\u4E2A\u6D3B\u52A8\u540E\uFF0C\u5B83\u4F1A\u51FA\u73B0\u5728\u6708\u5386\u548C\u8FD9\u5F20\u8868\u91CC\u3002" }) });
  }
  return /* @__PURE__ */ jsxs10("div", { className: "min-w-0", children: [
    /* @__PURE__ */ jsxs10("div", { className: "grid grid-cols-[minmax(0,1.4fr)_4.5rem_5.5rem_4.5rem] gap-2 border-b border-(--ui-stroke-secondary) px-2 py-1.5 text-[0.6875rem] text-(--ui-text-tertiary)", children: [
      /* @__PURE__ */ jsx11("span", { children: "\u6D3B\u52A8" }),
      /* @__PURE__ */ jsx11("span", { children: "\u7C7B\u578B" }),
      /* @__PURE__ */ jsx11("span", { children: "\u4EFB\u52A1" }),
      /* @__PURE__ */ jsx11("span", { children: "\u9636\u6BB5" })
    ] }),
    /* @__PURE__ */ jsx11("ul", { children: campaigns.map((item) => {
      const rate = item.tasks_total === 0 ? 0 : item.tasks_done / item.tasks_total;
      return /* @__PURE__ */ jsx11("li", { children: /* @__PURE__ */ jsxs10(
        "button",
        {
          type: "button",
          onClick: () => onOpen(item.id),
          className: "grid w-full grid-cols-[minmax(0,1.4fr)_4.5rem_5.5rem_4.5rem] items-center gap-2 border-b border-(--ui-stroke-secondary) px-2 py-2 text-left text-xs hover:bg-(--ui-bg-quinary)",
          children: [
            /* @__PURE__ */ jsxs10("span", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx11("span", { className: "block truncate", children: item.name }),
              /* @__PURE__ */ jsxs10("span", { className: "block truncate text-[0.6875rem] text-(--ui-text-tertiary)", children: [
                item.brand,
                " \xB7 ",
                item.start_date.slice(5),
                " \u81F3 ",
                item.end_date.slice(5)
              ] })
            ] }),
            /* @__PURE__ */ jsx11("span", { className: "truncate text-(--ui-text-secondary)", children: KIND_LABEL2[item.kind] ?? item.kind }),
            /* @__PURE__ */ jsxs10("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx11("span", { className: "h-1 w-10 overflow-hidden rounded-full bg-(--ui-bg-quinary)", children: /* @__PURE__ */ jsx11("span", { className: "block h-full bg-(--ui-accent)", style: { width: `${Math.round(rate * 100)}%` } }) }),
              /* @__PURE__ */ jsxs10("span", { className: "tabular-nums text-(--ui-text-secondary)", children: [
                item.tasks_done,
                "/",
                item.tasks_total
              ] })
            ] }),
            /* @__PURE__ */ jsx11(Badge2, { variant: phaseBadge(item.phase), children: PHASE_LABEL[item.phase] ?? item.phase })
          ]
        }
      ) }, item.id);
    }) })
  ] });
}
function shiftMonth(anchor, delta) {
  return new Date(anchor.getFullYear(), anchor.getMonth() + delta, 1);
}
function uniqueBrands(fromShops, fromCampaigns) {
  return Array.from(new Set([...fromShops, ...fromCampaigns].map((item) => item.trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b, "zh-CN")
  );
}

// src/pages/contents/ContentsPage.tsx
import { useEffect as useEffect12, useState as useState13 } from "react";
import {
  Badge as Badge4,
  Button as Button12,
  Dialog as Dialog3,
  DialogContent as DialogContent3,
  DialogFooter as DialogFooter2,
  DialogHeader as DialogHeader3,
  DialogTitle as DialogTitle3,
  ErrorState as ErrorState5,
  Input as Input7,
  SearchField as SearchField2,
  SegmentedControl as SegmentedControl5,
  Select as Select7,
  SelectContent as SelectContent7,
  SelectItem as SelectItem7,
  SelectTrigger as SelectTrigger7,
  SelectValue as SelectValue7,
  Skeleton as Skeleton2,
  Tip as Tip4
} from "@hermes/plugin-sdk";

// src/pages/contents/ContentEditor.tsx
import { useEffect as useEffect11, useRef as useRef4, useState as useState12 } from "react";
import {
  Badge as Badge3,
  Button as Button11,
  ConfirmDialog as ConfirmDialog3,
  ErrorState as ErrorState4,
  Input as Input6,
  Loader as Loader5,
  SegmentedControl as SegmentedControl4,
  Select as Select6,
  SelectContent as SelectContent6,
  SelectItem as SelectItem6,
  SelectTrigger as SelectTrigger6,
  SelectValue as SelectValue6,
  Textarea as Textarea7,
  Tip as Tip3
} from "@hermes/plugin-sdk";

// src/pages/contents/CommentsPanel.tsx
import { useState as useState10 } from "react";
import { Button as Button10, SegmentedControl as SegmentedControl3, Textarea as Textarea6, cn as cn4 } from "@hermes/plugin-sdk";

// src/pages/contents/labels.ts
var CONTENT_PLATFORMS = [
  "wechat",
  "xiaohongshu",
  "douyin",
  "weibo",
  "tmall",
  "jd",
  "pdd",
  "other"
];
var PLATFORM_LABEL = {
  wechat: "\u516C\u4F17\u53F7",
  xiaohongshu: "\u5C0F\u7EA2\u4E66",
  douyin: "\u6296\u97F3",
  weibo: "\u5FAE\u535A",
  tmall: "\u5929\u732B",
  jd: "\u4EAC\u4E1C",
  pdd: "\u62FC\u591A\u591A",
  other: "\u5176\u4ED6"
};
var KIND_LABEL3 = {
  article: "\u957F\u6587",
  note: "\u77ED\u6587",
  video_script: "\u89C6\u9891\u811A\u672C",
  poster_copy: "\u6D77\u62A5\u6587\u6848",
  product_copy: "\u5546\u54C1\u6587\u6848"
};
var STATUS_LABEL4 = {
  draft: "\u8349\u7A3F",
  in_review: "\u9001\u5BA1\u4E2D",
  approved: "\u5DF2\u901A\u8FC7",
  rejected: "\u88AB\u9000\u56DE",
  published: "\u5DF2\u53D1\u5E03"
};
var BODY_LIMIT = {
  xiaohongshu: 1e3,
  weibo: 2e3
};
function platformLabel2(platform) {
  return PLATFORM_LABEL[platform] ?? platform;
}
function platformMark2(platform) {
  return platformLabel2(platform).slice(0, 1);
}
function kindLabel2(kind) {
  return KIND_LABEL3[kind] ?? kind;
}
function statusLabel4(status) {
  return STATUS_LABEL4[status] ?? status;
}
function statusVariant3(status) {
  if (status === "in_review") return "default";
  if (status === "rejected") return "destructive";
  return "outline";
}
function bodyLimit(platform) {
  if (!platform) return null;
  return BODY_LIMIT[platform] ?? null;
}
function isLockedStatus(status) {
  return status === "in_review" || status === "approved" || status === "published";
}

// src/pages/contents/CommentsPanel.tsx
import { jsx as jsx12, jsxs as jsxs11 } from "react/jsx-runtime";
function CommentsPanel({
  contentId,
  comments,
  platform,
  actor,
  pending,
  width,
  onWidthChange,
  onClearPending,
  onBeforeSend,
  onChanged,
  onClose,
  docked = true
}) {
  const [filter, setFilter] = useState10("current");
  const [draft, setDraft] = useState10("");
  const [busy, setBusy] = useState10(false);
  const [error, setError] = useState10(null);
  const visible = comments.filter((item) => filter === "all" ? true : item.platform === platform).slice().sort((a, b) => a.created_at.localeCompare(b.created_at));
  const openCount = comments.filter((item) => item.kind !== "review" && !item.resolved).length;
  const send = async () => {
    const body = draft.trim();
    if (!body) return;
    setBusy(true);
    setError(null);
    try {
      if (onBeforeSend) await onBeforeSend();
      await createComment(contentId, {
        body,
        platform,
        quote: pending?.quote ?? null,
        start: pending?.start ?? null,
        end: pending?.end ?? null,
        author: actor.trim() || null
      });
      setDraft("");
      onClearPending();
      await onChanged();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "\u6279\u6CE8\u5931\u8D25");
    } finally {
      setBusy(false);
    }
  };
  const resolve = async (id) => {
    setError(null);
    try {
      await patchComment(id, true);
      await onChanged();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "\u64CD\u4F5C\u5931\u8D25");
    }
  };
  return /* @__PURE__ */ jsxs11(
    "aside",
    {
      style: { width },
      className: cn4(
        "relative flex shrink-0 flex-col border-l border-(--ui-stroke-secondary) bg-(--ui-bg-editor)",
        docked ? "sticky top-0 self-start" : "h-full"
      ),
      children: [
        /* @__PURE__ */ jsx12(
          "div",
          {
            role: "separator",
            "aria-orientation": "vertical",
            "aria-label": "\u8C03\u6574\u6279\u6CE8\u680F\u5BBD\u5EA6",
            className: "absolute inset-y-0 left-0 z-10 w-1 cursor-col-resize hover:bg-(--ui-accent)",
            onPointerDown: (event) => {
              const startX = event.clientX;
              const startWidth = width;
              const move = (ev) => {
                onWidthChange(Math.min(480, Math.max(220, startWidth - (ev.clientX - startX))));
              };
              const up = () => {
                window.removeEventListener("pointermove", move);
                window.removeEventListener("pointerup", up);
              };
              window.addEventListener("pointermove", move);
              window.addEventListener("pointerup", up);
            }
          }
        ),
        /* @__PURE__ */ jsxs11("div", { className: "flex items-center justify-between gap-2 border-b border-(--ui-stroke-secondary) px-3 py-2", children: [
          /* @__PURE__ */ jsxs11("span", { className: "text-xs font-medium", children: [
            "\u6279\u6CE8",
            openCount ? ` ${openCount}` : ""
          ] }),
          /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx12(
              SegmentedControl3,
              {
                options: [
                  { id: "current", label: "\u5F53\u524D" },
                  { id: "all", label: "\u5168\u90E8" }
                ],
                value: filter,
                onChange: setFilter
              }
            ),
            onClose ? /* @__PURE__ */ jsx12(Button10, { size: "xs", variant: "ghost", onClick: onClose, children: "\u6536\u8D77" }) : null
          ] })
        ] }),
        /* @__PURE__ */ jsx12("div", { className: cn4("px-3 py-2", docked ? "max-h-72 overflow-y-auto" : "min-h-0 flex-1 overflow-y-auto"), children: visible.length === 0 ? /* @__PURE__ */ jsx12("p", { className: "text-xs text-(--ui-text-tertiary)", children: filter === "current" ? `${platform ? platformLabel2(platform) : "\u4E3B\u7A3F"}\u8FD8\u6CA1\u6709\u6279\u6CE8\u3002` : "\u8FD8\u6CA1\u6709\u6279\u6CE8\u3002" }) : /* @__PURE__ */ jsx12("ul", { className: "flex flex-col gap-2", children: visible.map(
          (item) => item.kind === "review" ? /* @__PURE__ */ jsxs11("li", { className: "text-[0.6875rem] leading-5 text-(--ui-text-tertiary)", children: [
            item.author || "\u6709\u4EBA",
            " \xB7 ",
            formatTime(item.created_at),
            " \xB7 ",
            item.body
          ] }, item.id) : /* @__PURE__ */ jsxs11("li", { className: item.resolved ? "opacity-60" : void 0, children: [
            item.quote ? /* @__PURE__ */ jsx12("blockquote", { className: "border-l-2 border-(--ui-stroke-secondary) pl-2 text-[0.6875rem] text-(--ui-text-tertiary)", children: item.quote }) : null,
            /* @__PURE__ */ jsx12("p", { className: "mt-1 text-xs leading-5", children: item.body }),
            /* @__PURE__ */ jsxs11("div", { className: "mt-1 flex items-center justify-between gap-2 text-[0.6875rem] text-(--ui-text-tertiary)", children: [
              /* @__PURE__ */ jsxs11("span", { children: [
                item.author || "\u672A\u7F72\u540D",
                " \xB7 ",
                formatTime(item.created_at),
                item.platform ? ` \xB7 ${platformLabel2(item.platform)}` : ""
              ] }),
              item.resolved ? /* @__PURE__ */ jsx12("span", { children: "\u5DF2\u89E3\u51B3" }) : /* @__PURE__ */ jsx12(Button10, { size: "xs", variant: "ghost", onClick: () => void resolve(item.id), children: "\u6807\u4E3A\u5DF2\u89E3\u51B3" })
            ] })
          ] }, item.id)
        ) }) }),
        /* @__PURE__ */ jsxs11("div", { className: "flex flex-col gap-2 border-t border-(--ui-stroke-secondary) p-3", children: [
          pending ? /* @__PURE__ */ jsxs11("div", { className: "flex items-start justify-between gap-2 text-[0.6875rem] text-(--ui-text-tertiary)", children: [
            /* @__PURE__ */ jsxs11("span", { className: "max-h-8 overflow-hidden", children: [
              "\u5F15\u7528\uFF1A",
              pending.quote
            ] }),
            /* @__PURE__ */ jsx12("button", { type: "button", className: "shrink-0 underline", onClick: onClearPending, children: "\u53D6\u6D88" })
          ] }) : null,
          /* @__PURE__ */ jsx12(
            Textarea6,
            {
              "aria-label": "\u6279\u6CE8\u5185\u5BB9",
              placeholder: actor.trim() ? `\u4EE5${actor.trim()}\u7684\u540D\u5B57\u5199\u6279\u6CE8` : "\u5199\u6279\u6CE8",
              value: draft,
              onChange: (event) => setDraft(event.target.value)
            }
          ),
          error ? /* @__PURE__ */ jsx12("p", { className: "text-xs text-destructive", children: error }) : null,
          /* @__PURE__ */ jsx12("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx12(Button10, { size: "xs", disabled: busy || !draft.trim(), onClick: () => void send(), children: "\u53D1\u9001" }) })
        ] })
      ]
    }
  );
}

// src/pages/contents/VersionsDialog.tsx
import { useEffect as useEffect10, useState as useState11 } from "react";
import {
  Dialog as Dialog2,
  DialogContent as DialogContent2,
  DialogHeader as DialogHeader2,
  DialogTitle as DialogTitle2,
  Select as Select5,
  SelectContent as SelectContent5,
  SelectItem as SelectItem5,
  SelectTrigger as SelectTrigger5,
  SelectValue as SelectValue5
} from "@hermes/plugin-sdk";
import { jsx as jsx13, jsxs as jsxs12 } from "react/jsx-runtime";
function VersionsDialog({
  open,
  contentId,
  versions,
  platforms,
  onClose
}) {
  const ordered = versions.slice().sort((a, b) => a.version - b.version);
  const oldest = ordered[0]?.version ?? 1;
  const latest = ordered[ordered.length - 1]?.version ?? 1;
  const [fromVersion, setFromVersion] = useState11(oldest);
  const [toVersion, setToVersion] = useState11(latest);
  const [platform, setPlatform] = useState11("");
  const [diff, setDiff] = useState11(null);
  const [error, setError] = useState11(null);
  const [loading, setLoading] = useState11(false);
  useEffect10(() => {
    if (!open) return;
    setFromVersion(oldest);
    setToVersion(latest);
    setPlatform("");
  }, [open, oldest, latest]);
  useEffect10(() => {
    if (!open) return;
    if (fromVersion === toVersion) {
      setDiff(null);
      setError(ordered.length < 2 ? "\u53EA\u6709\u4E00\u4E2A\u7248\u672C\uFF0C\u8FD8\u4E0D\u80FD\u5BF9\u6BD4\u3002" : "\u8BF7\u9009\u62E9\u4E24\u4E2A\u4E0D\u540C\u7684\u7248\u672C\u3002");
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    diffContent(contentId, {
      from_version: fromVersion,
      to_version: toVersion,
      platform: platform || void 0
    }).then(
      (value) => {
        if (cancelled) return;
        setDiff(value);
        setLoading(false);
      },
      (reason) => {
        if (cancelled) return;
        setDiff(null);
        setError(reason instanceof Error ? reason.message : "\u5BF9\u6BD4\u5931\u8D25");
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [open, contentId, fromVersion, toVersion, platform, ordered.length]);
  return /* @__PURE__ */ jsx13(Dialog2, { open, onOpenChange: (next) => {
    if (!next) onClose();
  }, children: /* @__PURE__ */ jsxs12(DialogContent2, { children: [
    /* @__PURE__ */ jsx13(DialogHeader2, { children: /* @__PURE__ */ jsx13(DialogTitle2, { children: "\u7248\u672C\u5386\u53F2" }) }),
    /* @__PURE__ */ jsxs12("ul", { className: "max-h-36 overflow-y-auto border border-(--ui-stroke-secondary) text-xs", children: [
      ordered.length === 0 ? /* @__PURE__ */ jsx13("li", { className: "px-2 py-1.5 text-(--ui-text-tertiary)", children: "\u8FD8\u6CA1\u6709\u7248\u672C\u3002" }) : null,
      ordered.slice().reverse().map((item) => /* @__PURE__ */ jsx13("li", { className: "border-b border-(--ui-stroke-secondary) px-2 py-1.5", children: /* @__PURE__ */ jsxs12(
        "button",
        {
          type: "button",
          className: "w-full text-left",
          onClick: () => setFromVersion(item.version),
          children: [
            /* @__PURE__ */ jsxs12("span", { className: "font-medium", children: [
              "v",
              item.version
            ] }),
            /* @__PURE__ */ jsxs12("span", { className: "text-(--ui-text-tertiary)", children: [
              " ",
              "\xB7 ",
              item.author || "\u672A\u7F72\u540D",
              " \xB7 ",
              formatTime(item.created_at),
              item.note ? ` \xB7 ${item.note}` : ""
            ] })
          ]
        }
      ) }, item.version))
    ] }),
    /* @__PURE__ */ jsxs12("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsx13(VersionSelect, { label: "\u4ECE", value: fromVersion, versions: ordered, onChange: setFromVersion }),
      /* @__PURE__ */ jsx13(VersionSelect, { label: "\u5230", value: toVersion, versions: ordered, onChange: setToVersion }),
      /* @__PURE__ */ jsxs12("label", { className: "flex flex-col gap-1 text-[0.6875rem] text-(--ui-text-tertiary)", children: [
        "\u5E73\u53F0",
        /* @__PURE__ */ jsxs12(Select5, { value: platform || "main", onValueChange: (value) => setPlatform(value === "main" ? "" : value), children: [
          /* @__PURE__ */ jsx13(SelectTrigger5, { "aria-label": "\u5BF9\u6BD4\u54EA\u4E2A\u7248\u672C", children: /* @__PURE__ */ jsx13(SelectValue5, {}) }),
          /* @__PURE__ */ jsxs12(SelectContent5, { children: [
            /* @__PURE__ */ jsx13(SelectItem5, { value: "main", children: "\u4E3B\u7A3F" }),
            platforms.map((item) => /* @__PURE__ */ jsx13(SelectItem5, { value: item, children: platformLabel2(item) }, item))
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx13("p", { className: "text-[0.6875rem] text-(--ui-text-tertiary)", children: "\u5212\u6389\u7684\u662F\u65E7\u7A3F\u91CC\u5220\u6389\u7684\uFF0C\u5E95\u8272\u662F\u65B0\u7A3F\u52A0\u4E0A\u7684\u3002" }),
    loading ? /* @__PURE__ */ jsx13("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u6B63\u5728\u5BF9\u6BD4\u2026" }) : null,
    error ? /* @__PURE__ */ jsx13("p", { className: "text-xs text-destructive", children: error }) : null,
    diff ? /* @__PURE__ */ jsxs12("div", { className: "flex flex-col gap-2 text-xs leading-6", children: [
      diff.title_from !== diff.title_to ? /* @__PURE__ */ jsxs12("p", { children: [
        "\u6807\u9898\uFF1A",
        /* @__PURE__ */ jsx13("span", { className: "line-through text-destructive", children: diff.title_from || "\uFF08\u7A7A\uFF09" }),
        " \u2192 ",
        diff.title_to || "\uFF08\u7A7A\uFF09"
      ] }) : null,
      /* @__PURE__ */ jsxs12("p", { className: "whitespace-pre-wrap", children: [
        diff.segments.length === 0 ? /* @__PURE__ */ jsx13("span", { className: "text-(--ui-text-tertiary)", children: "\u4E24\u7248\u6B63\u6587\u4E00\u6837\u3002" }) : null,
        diff.segments.map((segment, index) => {
          if (segment.op === "delete") {
            return /* @__PURE__ */ jsx13("span", { className: "bg-destructive/15 text-destructive line-through", children: segment.text }, index);
          }
          if (segment.op === "insert") {
            return /* @__PURE__ */ jsx13(
              "span",
              {
                style: { background: "color-mix(in srgb, var(--ui-accent) 24%, transparent)" },
                children: segment.text
              },
              index
            );
          }
          return /* @__PURE__ */ jsx13("span", { children: segment.text }, index);
        })
      ] })
    ] }) : null
  ] }) });
}
function VersionSelect({
  label,
  value,
  versions,
  onChange
}) {
  return /* @__PURE__ */ jsxs12("label", { className: "flex flex-col gap-1 text-[0.6875rem] text-(--ui-text-tertiary)", children: [
    label,
    /* @__PURE__ */ jsxs12(Select5, { value: String(value), onValueChange: (next) => onChange(Number(next)), children: [
      /* @__PURE__ */ jsx13(SelectTrigger5, { "aria-label": `${label}\u54EA\u4E00\u7248`, children: /* @__PURE__ */ jsx13(SelectValue5, {}) }),
      /* @__PURE__ */ jsx13(SelectContent5, { children: versions.map((item) => /* @__PURE__ */ jsxs12(SelectItem5, { value: String(item.version), children: [
        "v",
        item.version
      ] }, item.version)) })
    ] })
  ] });
}

// src/pages/contents/ContentEditor.tsx
import { Fragment as Fragment5, jsx as jsx14, jsxs as jsxs13 } from "react/jsx-runtime";
var ACTOR_KEY2 = "hermes-workbench:actor";
var NARROW_PX2 = 760;
function loadActor2() {
  try {
    return window.localStorage.getItem(ACTOR_KEY2) ?? "";
  } catch {
    return "";
  }
}
function toDraft(variants) {
  return variants.map((item) => ({
    platform: item.platform,
    title: item.title ?? "",
    body: item.body
  }));
}
function draftSignature(title, body, variants, note) {
  return JSON.stringify({
    title,
    body,
    note,
    variants: variants.map((item) => ({ platform: item.platform, title: item.title, body: item.body }))
  });
}
function messageOf(reason, fallback) {
  if (reason instanceof ApiError) return reason.message;
  if (reason instanceof Error) return reason.message;
  return fallback;
}
function ContentEditor({ id, onBack }) {
  const frame = useRef4(null);
  const bypassRef = useRef4(false);
  const saveRef = useRef4(async () => null);
  const [detail, setDetail] = useState12(null);
  const [title, setTitle] = useState12("");
  const [body, setBody] = useState12("");
  const [variants, setVariants] = useState12([]);
  const [note, setNote] = useState12("");
  const [baseline, setBaseline] = useState12("");
  const [ready, setReady] = useState12(false);
  const [loading, setLoading] = useState12(true);
  const [error, setError] = useState12(null);
  const [tab, setTab] = useState12("main");
  const [actor, setActor] = useState12(loadActor2);
  const [flowError, setFlowError] = useState12(null);
  const [busy, setBusy] = useState12(false);
  const [saving, setSaving] = useState12(false);
  const [wide, setWide] = useState12(true);
  const [railWidth, setRailWidth] = useState12(280);
  const [railOpen, setRailOpen] = useState12(false);
  const [selection, setSelection] = useState12(null);
  const [pending, setPending] = useState12(null);
  const [pendingLeave, setPendingLeave] = useState12(null);
  const [rejecting, setRejecting] = useState12(false);
  const [rejectNote, setRejectNote] = useState12("");
  const [publishing, setPublishing] = useState12(false);
  const [publishPlatform, setPublishPlatform] = useState12("");
  const [publishUrl, setPublishUrl] = useState12("");
  const [versionsOpen, setVersionsOpen] = useState12(false);
  const locked = detail ? isLockedStatus(detail.status) : true;
  const dirty = ready && draftSignature(title, body, variants, note) !== baseline;
  const current = tab === "main" ? null : variants.find((item) => item.platform === tab) ?? null;
  const currentBody = current ? current.body : body;
  const currentTitle = current ? current.title : title;
  const limit = bodyLimit(current ? current.platform : null);
  const adopt = (next) => {
    const draft = toDraft(next.variants);
    setDetail(next);
    setTitle(next.title);
    setBody(next.body);
    setVariants(draft);
    setNote("");
    setBaseline(draftSignature(next.title, next.body, draft, ""));
    setReady(true);
    setTab((value) => value !== "main" && !draft.some((item) => item.platform === value) ? "main" : value);
    setFlowError(null);
  };
  const adoptRef = useRef4(adopt);
  adoptRef.current = adopt;
  useEffect11(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setReady(false);
    getContent(id).then(
      (value) => {
        if (cancelled) return;
        adoptRef.current(value);
        setLoading(false);
      },
      (reason) => {
        if (cancelled) return;
        setError(reason);
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [id]);
  useEffect11(() => {
    try {
      window.localStorage.setItem(ACTOR_KEY2, actor);
    } catch {
    }
  }, [actor]);
  useEffect11(() => {
    setSelection(null);
    setPending(null);
  }, [tab]);
  useEffect11(() => {
    const node = frame.current;
    if (!node) return;
    const apply = (width) => setWide(width >= NARROW_PX2);
    apply(node.clientWidth);
    const observer = new ResizeObserver((entries) => {
      apply(entries[0]?.contentRect.width ?? node.clientWidth);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ready]);
  useEffect11(() => {
    const onKey = (event) => {
      if (event.key.toLowerCase() !== "s" || !(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      void saveRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect11(() => {
    if (!dirty) return;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const onClick = (event) => {
      if (bypassRef.current) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const row = target.closest(".wb-pane-row, [data-preview-nav]");
      if (!(row instanceof HTMLElement)) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingLeave(row);
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);
  const save = async () => {
    if (!detail || locked || !dirty) return detail;
    setSaving(true);
    setFlowError(null);
    try {
      const next = await updateContent(detail.id, {
        title: title.trim(),
        body,
        variants: variants.map((item) => ({
          platform: item.platform,
          title: item.title.trim() || null,
          body: item.body
        })),
        note: note.trim() || null
      });
      adopt(next);
      return next;
    } catch (reason) {
      setFlowError(messageOf(reason, "\u4FDD\u5B58\u5931\u8D25"));
      return null;
    } finally {
      setSaving(false);
    }
  };
  saveRef.current = save;
  const reload = async () => {
    const next = await getContent(id);
    if (draftSignature(title, body, variants, note) !== baseline) {
      setDetail(next);
      return;
    }
    adopt(next);
  };
  const run = async (action2, saveFirst = false) => {
    if (!detail) return;
    setBusy(true);
    setFlowError(null);
    try {
      let current2 = detail;
      if (saveFirst && dirty) {
        const saved = await save();
        if (!saved) return;
        current2 = saved;
      }
      const next = await action2(current2);
      adopt(next);
      void refreshInReviewCount();
    } catch (reason) {
      setFlowError(messageOf(reason, "\u64CD\u4F5C\u5931\u8D25"));
    } finally {
      setBusy(false);
    }
  };
  const setCurrentBody = (value) => {
    setSelection(null);
    if (!current) {
      setBody(value);
      return;
    }
    const platform = current.platform;
    setVariants((items) => items.map((item) => item.platform === platform ? { ...item, body: value } : item));
  };
  const setCurrentTitle = (value) => {
    if (!current) {
      setTitle(value);
      return;
    }
    const platform = current.platform;
    setVariants((items) => items.map((item) => item.platform === platform ? { ...item, title: value } : item));
  };
  const readSelection = (event) => {
    const el = event.currentTarget;
    if (el.selectionStart === el.selectionEnd) {
      setSelection(null);
      return;
    }
    setSelection({
      start: el.selectionStart,
      end: el.selectionEnd,
      quote: el.value.slice(el.selectionStart, el.selectionEnd)
    });
  };
  const addPlatform = (platform) => {
    if (variants.some((item) => item.platform === platform)) return;
    setVariants((items) => [...items, { platform, title: "", body: "" }]);
    setTab(platform);
  };
  const removePlatform = (platform) => {
    setVariants((items) => items.filter((item) => item.platform !== platform));
    setTab("main");
  };
  const leave = () => {
    const target = pendingLeave;
    bypassRef.current = true;
    setPendingLeave(null);
    window.setTimeout(() => {
      if (target === "back" || target === null) onBack();
      else target.click();
    }, 0);
  };
  const tabOptions = [
    { id: "main", label: "\u4E3B\u7A3F" },
    ...variants.map((item) => ({ id: item.platform, label: platformLabel2(item.platform) }))
  ];
  const remaining = CONTENT_PLATFORMS.filter((item) => !variants.some((variant) => variant.platform === item));
  const checkText = `${currentTitle}
${currentBody}`;
  const published = current?.platform ? detail?.variants.find((item) => item.platform === current.platform)?.published_url : null;
  const rail = detail ? /* @__PURE__ */ jsx14(
    CommentsPanel,
    {
      contentId: detail.id,
      comments: detail.comments,
      platform: current ? current.platform : null,
      actor,
      pending,
      width: railWidth,
      onWidthChange: setRailWidth,
      onClearPending: () => setPending(null),
      onBeforeSend: async () => {
        if (!dirty) return;
        const saved = await save();
        if (!saved) throw new Error("\u5148\u4FDD\u5B58\u518D\u6279\u6CE8");
      },
      onChanged: reload,
      onClose: wide ? void 0 : () => setRailOpen(false),
      docked: wide
    }
  ) : null;
  return /* @__PURE__ */ jsxs13("div", { ref: frame, className: "relative flex flex-col", children: [
    /* @__PURE__ */ jsx14(HeaderActions, { children: /* @__PURE__ */ jsx14(Button11, { size: "sm", variant: "outline", onClick: () => setVersionsOpen(true), disabled: !detail, children: "\u5386\u53F2\u7248\u672C" }) }),
    loading ? /* @__PURE__ */ jsx14("div", { className: "flex flex-1 items-center justify-center", children: /* @__PURE__ */ jsx14(Loader5, {}) }) : null,
    !loading && error ? /* @__PURE__ */ jsx14("div", { className: "flex flex-1 items-center justify-center", children: /* @__PURE__ */ jsx14(ErrorState4, { title: "\u7A3F\u4EF6\u52A0\u8F7D\u5931\u8D25", description: messageOf(error, "\u8BF7\u91CD\u8BD5"), children: /* @__PURE__ */ jsx14(Button11, { size: "sm", variant: "outline", onClick: onBack, children: "\u8FD4\u56DE\u5217\u8868" }) }) }) : null,
    detail && ready ? /* @__PURE__ */ jsxs13("div", { className: "flex min-h-0 items-start", children: [
      /* @__PURE__ */ jsxs13("div", { className: "flex min-w-0 flex-1 flex-col gap-3 overflow-auto pr-1", children: [
        /* @__PURE__ */ jsxs13("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx14(Button11, { size: "xs", variant: "ghost", onClick: () => dirty ? setPendingLeave("back") : onBack(), children: "\u8FD4\u56DE" }),
          /* @__PURE__ */ jsx14(
            Input6,
            {
              "aria-label": "\u6807\u9898",
              value: title,
              disabled: locked,
              onChange: (event) => setTitle(event.target.value),
              className: "max-w-md"
            }
          ),
          /* @__PURE__ */ jsx14(Badge3, { variant: statusVariant3(detail.status), children: statusLabel4(detail.status) }),
          /* @__PURE__ */ jsxs13("span", { className: "text-xs text-(--ui-text-tertiary)", children: [
            "v",
            detail.version
          ] }),
          !wide ? /* @__PURE__ */ jsxs13(Button11, { size: "xs", variant: "outline", onClick: () => setRailOpen(true), children: [
            "\u6279\u6CE8",
            detail.comments.filter((item) => item.kind !== "review" && !item.resolved).length ? ` ${detail.comments.filter((item) => item.kind !== "review" && !item.resolved).length}` : ""
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxs13("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx14("span", { className: "text-xs text-(--ui-text-secondary)", children: "\u7F72\u540D" }),
          /* @__PURE__ */ jsx14(
            Input6,
            {
              "aria-label": "\u7F72\u540D",
              value: actor,
              placeholder: "\u4F60\u7684\u540D\u5B57",
              onChange: (event) => setActor(event.target.value),
              style: { width: "7rem" }
            }
          ),
          detail.status === "draft" || detail.status === "rejected" ? /* @__PURE__ */ jsx14(Button11, { size: "xs", disabled: busy || saving, onClick: () => void run((current2) => submitContent(current2.id, { by: actor.trim() || null }), true), children: "\u9001\u5BA1" }) : null,
          detail.status === "in_review" || detail.status === "approved" ? /* @__PURE__ */ jsx14(
            Button11,
            {
              size: "xs",
              variant: "outline",
              disabled: busy,
              onClick: () => void run((current2) => withdrawContent(current2.id, { by: actor.trim() || null })),
              children: "\u64A4\u56DE"
            }
          ) : null,
          detail.status === "in_review" ? /* @__PURE__ */ jsxs13(Fragment5, { children: [
            /* @__PURE__ */ jsx14(
              Button11,
              {
                size: "xs",
                disabled: busy,
                onClick: () => void run((current2) => approveContent(current2.id, { by: actor.trim() || null })),
                children: "\u901A\u8FC7"
              }
            ),
            /* @__PURE__ */ jsx14(Button11, { size: "xs", variant: "outline", disabled: busy, onClick: () => setRejecting(true), children: "\u9000\u56DE" })
          ] }) : null,
          detail.status === "approved" || detail.status === "published" ? /* @__PURE__ */ jsx14(
            Button11,
            {
              size: "xs",
              disabled: busy,
              onClick: () => {
                setPublishPlatform(variants[0]?.platform ?? "");
                setPublishUrl("");
                setPublishing(true);
              },
              children: "\u6807\u8BB0\u5DF2\u53D1\u5E03"
            }
          ) : null,
          flowError ? /* @__PURE__ */ jsx14("span", { className: "text-xs text-destructive", children: flowError }) : null
        ] }),
        /* @__PURE__ */ jsxs13("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx14(SegmentedControl4, { options: tabOptions, value: tab, onChange: setTab }),
          !locked && remaining.length > 0 ? /* @__PURE__ */ jsxs13(Select6, { value: "add", onValueChange: (value) => {
            if (value !== "add") addPlatform(value);
          }, children: [
            /* @__PURE__ */ jsx14(SelectTrigger6, { "aria-label": "\u52A0\u5E73\u53F0", children: /* @__PURE__ */ jsx14(SelectValue6, {}) }),
            /* @__PURE__ */ jsxs13(SelectContent6, { children: [
              /* @__PURE__ */ jsx14(SelectItem6, { value: "add", children: "\u52A0\u5E73\u53F0" }),
              remaining.map((item) => /* @__PURE__ */ jsx14(SelectItem6, { value: item, children: platformLabel2(item) }, item))
            ] })
          ] }) : null,
          !locked && current ? /* @__PURE__ */ jsx14(Button11, { size: "xs", variant: "ghost", onClick: () => removePlatform(current.platform), children: "\u79FB\u51FA\u8FD9\u4E2A\u5E73\u53F0" }) : null
        ] }),
        locked ? /* @__PURE__ */ jsx14("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u5148\u64A4\u56DE\u624D\u80FD\u6539\u3002" }) : null,
        current ? /* @__PURE__ */ jsx14(
          Input6,
          {
            "aria-label": "\u5E73\u53F0\u6807\u9898",
            placeholder: `${platformLabel2(current.platform)}\u6807\u9898`,
            value: current.title,
            disabled: locked,
            onChange: (event) => setCurrentTitle(event.target.value)
          }
        ) : null,
        /* @__PURE__ */ jsxs13("div", { className: "relative", children: [
          selection ? /* @__PURE__ */ jsx14(
            Button11,
            {
              size: "xs",
              className: "absolute top-2 right-2 z-10",
              onMouseDown: (event) => event.preventDefault(),
              onClick: () => {
                setPending(selection);
                setSelection(null);
                setRailOpen(true);
              },
              children: "\u6279\u6CE8"
            }
          ) : null,
          /* @__PURE__ */ jsx14(
            Textarea7,
            {
              "aria-label": "\u6B63\u6587",
              readOnly: locked,
              value: currentBody,
              onChange: (event) => setCurrentBody(event.target.value),
              onSelect: readSelection,
              onKeyUp: readSelection,
              onMouseUp: readSelection,
              className: "min-h-48"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs13("div", { className: "flex flex-wrap items-center gap-2 text-[0.6875rem] text-(--ui-text-tertiary)", children: [
          current ? /* @__PURE__ */ jsx14(Tip3, { label: platformLabel2(current.platform), children: /* @__PURE__ */ jsx14("span", { className: "inline-flex h-4 min-w-4 items-center justify-center rounded-sm border border-(--ui-stroke-secondary) px-0.5", children: platformMark2(current.platform) }) }) : /* @__PURE__ */ jsx14("span", { children: "\u4E3B\u7A3F" }),
          /* @__PURE__ */ jsxs13("span", { className: limit !== null && currentBody.length > limit ? "text-destructive" : void 0, children: [
            currentBody.length,
            " \u5B57",
            limit !== null ? ` / ${limit}\uFF0C\u8D85\u51FA\u53EA\u662F\u63D0\u9192` : ""
          ] }),
          published ? /* @__PURE__ */ jsxs13("span", { children: [
            "\u5DF2\u53D1\u5E03\uFF1A",
            published
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxs13("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx14(
            Input6,
            {
              "aria-label": "\u6539\u52A8\u8BF4\u660E",
              placeholder: "\u6539\u52A8\u8BF4\u660E\uFF0C\u53EF\u4EE5\u4E0D\u586B",
              value: note,
              disabled: locked,
              onChange: (event) => setNote(event.target.value),
              className: "max-w-sm"
            }
          ),
          /* @__PURE__ */ jsx14(Button11, { size: "sm", disabled: locked || saving || !dirty, onClick: () => void save(), children: saving ? "\u6B63\u5728\u4FDD\u5B58" : "\u4FDD\u5B58" })
        ] }),
        /* @__PURE__ */ jsx14(CompliancePanel, { text: checkText, auto: true })
      ] }),
      wide ? rail : null
    ] }) : null,
    !wide && railOpen ? /* @__PURE__ */ jsxs13("div", { className: "absolute inset-0 z-20 flex justify-end bg-black/22", children: [
      /* @__PURE__ */ jsx14("button", { type: "button", "aria-label": "\u5173\u95ED\u6279\u6CE8", className: "absolute inset-0", onClick: () => setRailOpen(false) }),
      /* @__PURE__ */ jsx14("div", { className: "relative z-10 h-full", children: rail })
    ] }) : null,
    /* @__PURE__ */ jsx14(
      ConfirmDialog3,
      {
        open: pendingLeave !== null,
        title: "\u8FD8\u6709\u6CA1\u4FDD\u5B58\u7684\u4FEE\u6539",
        description: "\u79BB\u5F00\u540E\u8FD9\u6B21\u4FEE\u6539\u4E0D\u4F1A\u7559\u4E0B\u6765\u3002",
        confirmLabel: "\u79BB\u5F00",
        onClose: () => setPendingLeave(null),
        onConfirm: leave
      }
    ),
    /* @__PURE__ */ jsx14(
      ConfirmDialog3,
      {
        open: rejecting,
        title: "\u9000\u56DE\u8FD9\u7BC7\u7A3F\u4EF6",
        description: "\u9000\u56DE\u8981\u5199\u660E\u539F\u56E0\u3002",
        confirmLabel: "\u9000\u56DE",
        onClose: () => setRejecting(false),
        onConfirm: async () => {
          const reason = rejectNote.trim();
          if (!reason) throw new Error("\u9000\u56DE\u65F6\u8BF7\u5199\u660E\u539F\u56E0");
          if (!detail) throw new Error("\u7A3F\u4EF6\u8FD8\u6CA1\u52A0\u8F7D");
          const next = await rejectContent(detail.id, { by: actor.trim() || null, note: reason });
          adopt(next);
          setRejectNote("");
          void refreshInReviewCount();
        },
        children: /* @__PURE__ */ jsx14(Textarea7, { "aria-label": "\u9000\u56DE\u539F\u56E0", value: rejectNote, onChange: (event) => setRejectNote(event.target.value) })
      }
    ),
    /* @__PURE__ */ jsx14(
      ConfirmDialog3,
      {
        open: publishing,
        title: "\u6807\u8BB0\u5DF2\u53D1\u5E03",
        description: "\u5728\u5E73\u53F0\u4E0A\u53D1\u5B8C\u540E\uFF0C\u56DE\u6765\u8BB0\u4E0B\u94FE\u63A5\u3002",
        confirmLabel: "\u6807\u8BB0\u5DF2\u53D1\u5E03",
        onClose: () => setPublishing(false),
        onConfirm: async () => {
          if (!detail) throw new Error("\u7A3F\u4EF6\u8FD8\u6CA1\u52A0\u8F7D");
          const next = await publishContent(detail.id, {
            by: actor.trim() || null,
            platform: publishPlatform || null,
            url: publishUrl.trim() || null
          });
          adopt(next);
          void refreshInReviewCount();
        },
        children: /* @__PURE__ */ jsxs13("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxs13(Select6, { value: publishPlatform || "piece", onValueChange: (value) => setPublishPlatform(value === "piece" ? "" : value), children: [
            /* @__PURE__ */ jsx14(SelectTrigger6, { "aria-label": "\u53D1\u5E03\u5230\u54EA\u4E2A\u5E73\u53F0", children: /* @__PURE__ */ jsx14(SelectValue6, {}) }),
            /* @__PURE__ */ jsxs13(SelectContent6, { children: [
              /* @__PURE__ */ jsx14(SelectItem6, { value: "piece", children: "\u6574\u7BC7" }),
              variants.map((item) => /* @__PURE__ */ jsx14(SelectItem6, { value: item.platform, children: platformLabel2(item.platform) }, item.platform))
            ] })
          ] }),
          /* @__PURE__ */ jsx14(
            Input6,
            {
              "aria-label": "\u53D1\u5E03\u94FE\u63A5",
              placeholder: "\u53D1\u5E03\u94FE\u63A5\uFF0C\u53EF\u4EE5\u4E0D\u586B",
              value: publishUrl,
              onChange: (event) => setPublishUrl(event.target.value)
            }
          )
        ] })
      }
    ),
    detail ? /* @__PURE__ */ jsx14(
      VersionsDialog,
      {
        open: versionsOpen,
        contentId: detail.id,
        versions: detail.versions,
        platforms: detail.variants.map((item) => item.platform),
        onClose: () => setVersionsOpen(false)
      }
    ) : null
  ] });
}

// src/pages/contents/ContentsPage.tsx
import { Fragment as Fragment6, jsx as jsx15, jsxs as jsxs14 } from "react/jsx-runtime";
var STATUSES = [
  { id: "all", label: "\u5168\u90E8" },
  { id: "draft", label: "\u8349\u7A3F" },
  { id: "in_review", label: "\u9001\u5BA1\u4E2D" },
  { id: "approved", label: "\u5DF2\u901A\u8FC7" },
  { id: "rejected", label: "\u88AB\u9000\u56DE" },
  { id: "published", label: "\u5DF2\u53D1\u5E03" }
];
function ContentsPage() {
  const [editing, setEditing] = useState13(null);
  if (editing !== null) {
    return /* @__PURE__ */ jsx15(
      ContentEditor,
      {
        id: editing,
        onBack: () => {
          setEditing(null);
          void refreshInReviewCount();
        }
      }
    );
  }
  return /* @__PURE__ */ jsx15(ContentsList, { onOpen: setEditing });
}
function ContentsList({ onOpen }) {
  const apiBase = useApiBase();
  const [status, setStatus] = useState13("all");
  const [platform, setPlatform] = useState13("all");
  const [brand, setBrand] = useState13("all");
  const [campaign, setCampaign] = useState13("all");
  const [qInput, setQInput] = useState13("");
  const [q, setQ] = useState13("");
  const [creating, setCreating] = useState13(false);
  useEffect12(() => {
    const timer9 = window.setTimeout(() => setQ(qInput.trim()), 300);
    return () => window.clearTimeout(timer9);
  }, [qInput]);
  const query = useQuery(
    () => listContents({
      status: status === "all" ? void 0 : status,
      platform: platform === "all" ? void 0 : platform,
      brand: brand === "all" ? void 0 : brand,
      campaign_id: campaign === "all" ? void 0 : Number(campaign),
      q: q || void 0
    }),
    [apiBase, status, platform, brand, campaign, q]
  );
  const shops = useQuery(() => listShops(), [apiBase]);
  const campaigns = useQuery(() => listCampaigns(), [apiBase]);
  const offline = isOfflineError(query.error);
  const brands = Array.from(new Set((shops.data ?? []).map((item) => item.brand).filter(Boolean)));
  const filtered = status !== "all" || platform !== "all" || brand !== "all" || campaign !== "all" || q !== "";
  return /* @__PURE__ */ jsxs14("div", { className: "flex min-h-0 flex-1 flex-col gap-3", children: [
    /* @__PURE__ */ jsx15(HeaderActions, { children: /* @__PURE__ */ jsx15(Button12, { size: "sm", onClick: () => setCreating(true), children: "\u65B0\u5EFA\u7A3F\u4EF6" }) }),
    offline ? /* @__PURE__ */ jsx15(OfflineNotice, { detail: query.error instanceof Error ? query.error.message : void 0, onRetry: query.reload }) : null,
    !offline && query.error ? /* @__PURE__ */ jsx15("div", { className: "flex flex-1 items-center justify-center py-10", children: /* @__PURE__ */ jsx15(ErrorState5, { title: "\u7A3F\u4EF6\u52A0\u8F7D\u5931\u8D25", description: query.error instanceof Error ? query.error.message : "\u8BF7\u91CD\u8BD5", children: /* @__PURE__ */ jsx15(Button12, { size: "sm", variant: "outline", onClick: query.reload, children: "\u91CD\u8BD5" }) }) }) : null,
    !offline && !query.error ? /* @__PURE__ */ jsxs14(Fragment6, { children: [
      /* @__PURE__ */ jsxs14("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx15(SegmentedControl5, { options: STATUSES, value: status, onChange: setStatus }),
        /* @__PURE__ */ jsx15(FilterSelect, { label: "\u5E73\u53F0", value: platform, onChange: setPlatform, allLabel: "\u5168\u90E8\u5E73\u53F0", children: CONTENT_PLATFORMS.map((item) => /* @__PURE__ */ jsx15(SelectItem7, { value: item, children: platformLabel2(item) }, item)) }),
        /* @__PURE__ */ jsx15(FilterSelect, { label: "\u54C1\u724C", value: brand, onChange: setBrand, allLabel: "\u5168\u90E8\u54C1\u724C", children: brands.map((item) => /* @__PURE__ */ jsx15(SelectItem7, { value: item, children: item }, item)) }),
        /* @__PURE__ */ jsx15(FilterSelect, { label: "\u6D3B\u52A8", value: campaign, onChange: setCampaign, allLabel: "\u5168\u90E8\u6D3B\u52A8", children: (campaigns.data ?? []).map((item) => /* @__PURE__ */ jsx15(SelectItem7, { value: String(item.id), children: item.name }, item.id)) }),
        /* @__PURE__ */ jsx15(SearchField2, { "aria-label": "\u641C\u7D22\u7A3F\u4EF6", placeholder: "\u641C\u7D22\u6807\u9898", value: qInput, onChange: setQInput })
      ] }),
      query.loading && !query.data ? /* @__PURE__ */ jsxs14("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsx15(Skeleton2, { className: "h-12" }),
        /* @__PURE__ */ jsx15(Skeleton2, { className: "h-12" }),
        /* @__PURE__ */ jsx15(Skeleton2, { className: "h-12" })
      ] }) : null,
      query.data && query.data.length === 0 ? /* @__PURE__ */ jsx15("div", { className: "flex flex-1 items-center justify-center py-10", children: /* @__PURE__ */ jsx15(
        EmptyBlock,
        {
          title: filtered ? "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u7A3F\u4EF6" : "\u8FD8\u6CA1\u6709\u7A3F\u4EF6",
          description: filtered ? "\u6362\u4E2A\u7B5B\u9009\u6761\u4EF6\uFF0C\u6216\u8005\u6E05\u7A7A\u641C\u7D22\u3002" : "\u4ECE\u4E3B\u7A3F\u5199\u8D77\uFF0C\u518D\u62C6\u6210\u5404\u4E2A\u5E73\u53F0\u7684\u7248\u672C\u3002",
          children: filtered ? null : /* @__PURE__ */ jsx15(Button12, { size: "sm", onClick: () => setCreating(true), children: "\u65B0\u5EFA\u7A3F\u4EF6" })
        }
      ) }) : null,
      query.data && query.data.length > 0 ? /* @__PURE__ */ jsx15("ul", { className: "flex flex-col border-t border-(--ui-stroke-secondary)", children: query.data.map((item) => /* @__PURE__ */ jsx15("li", { className: "border-b border-(--ui-stroke-secondary)", children: /* @__PURE__ */ jsx15(ContentRow, { item, onOpen: () => onOpen(item.id) }) }, item.id)) }) : null
    ] }) : null,
    /* @__PURE__ */ jsx15(
      CreateDialog,
      {
        open: creating,
        brands,
        campaigns: (campaigns.data ?? []).map((item) => ({ id: item.id, name: item.name })),
        onClose: () => setCreating(false),
        onCreated: (id) => {
          setCreating(false);
          onOpen(id);
        }
      }
    )
  ] });
}
function ContentRow({ item, onOpen }) {
  return /* @__PURE__ */ jsxs14("button", { type: "button", onClick: onOpen, className: "flex w-full flex-col gap-1 px-1 py-2 text-left hover:bg-(--ui-bg-quinary)", children: [
    /* @__PURE__ */ jsxs14("span", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx15("span", { className: "truncate text-sm font-medium", children: item.title }),
      item.author === "\u54C1\u724C\u52A9\u624B" ? /* @__PURE__ */ jsx15(Badge4, { variant: "default", children: "\u54C1\u724C\u52A9\u624B" }) : null,
      /* @__PURE__ */ jsx15(Badge4, { variant: statusVariant3(item.status), children: statusLabel4(item.status) }),
      item.open_comments > 0 ? /* @__PURE__ */ jsxs14(Badge4, { variant: "outline", children: [
        item.open_comments,
        " \u6761\u672A\u89E3\u51B3"
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxs14("span", { className: "flex flex-wrap items-center gap-2 text-[0.6875rem] text-(--ui-text-tertiary)", children: [
      /* @__PURE__ */ jsx15("span", { children: kindLabel2(item.kind) }),
      /* @__PURE__ */ jsx15("span", { children: item.brand }),
      item.campaign_name ? /* @__PURE__ */ jsx15("span", { children: item.campaign_name }) : null,
      /* @__PURE__ */ jsx15("span", { className: "inline-flex items-center gap-1", children: item.platforms.map((platform) => /* @__PURE__ */ jsx15(Tip4, { label: platformLabel2(platform), children: /* @__PURE__ */ jsx15("span", { className: "inline-flex h-4 min-w-4 items-center justify-center rounded-sm border border-(--ui-stroke-secondary) px-0.5", children: platformMark2(platform) }) }, platform)) }),
      /* @__PURE__ */ jsxs14("span", { children: [
        "v",
        item.version
      ] }),
      /* @__PURE__ */ jsx15("span", { children: item.author || "\u672A\u7F72\u540D" }),
      /* @__PURE__ */ jsx15("span", { children: formatTime(item.updated_at) })
    ] })
  ] });
}
function FilterSelect({
  label,
  value,
  onChange,
  allLabel,
  children
}) {
  return /* @__PURE__ */ jsxs14(Select7, { value, onValueChange: onChange, children: [
    /* @__PURE__ */ jsx15(SelectTrigger7, { "aria-label": label, children: /* @__PURE__ */ jsx15(SelectValue7, {}) }),
    /* @__PURE__ */ jsxs14(SelectContent7, { children: [
      /* @__PURE__ */ jsx15(SelectItem7, { value: "all", children: allLabel }),
      children
    ] })
  ] });
}
function CreateDialog({
  open,
  brands,
  campaigns,
  onClose,
  onCreated
}) {
  const [title, setTitle] = useState13("");
  const [brand, setBrand] = useState13(brands[0] ?? "");
  const [kind, setKind] = useState13("article");
  const [campaignId, setCampaignId] = useState13("none");
  const [platforms, setPlatforms] = useState13(["xiaohongshu", "wechat"]);
  const [author, setAuthor] = useState13("");
  const [busy, setBusy] = useState13(false);
  const [error, setError] = useState13(null);
  useEffect12(() => {
    if (!open) return;
    setTitle("");
    setBrand(brands[0] ?? "");
    setKind("article");
    setCampaignId("none");
    setPlatforms(["xiaohongshu", "wechat"]);
    setAuthor("");
    setBusy(false);
    setError(null);
  }, [open]);
  const toggle = (platform) => {
    setPlatforms(
      (current) => current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]
    );
  };
  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const created = await createContent({
        title: title.trim(),
        brand: brand.trim(),
        kind,
        campaign_id: campaignId === "none" ? null : Number(campaignId),
        author: author.trim() || null,
        variants: platforms.map((platform) => ({ platform, title: null, body: "" }))
      });
      onCreated(created.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "\u65B0\u5EFA\u5931\u8D25");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsx15(Dialog3, { open, onOpenChange: (next) => {
    if (!next) onClose();
  }, children: /* @__PURE__ */ jsxs14(DialogContent3, { children: [
    /* @__PURE__ */ jsx15(DialogHeader3, { children: /* @__PURE__ */ jsx15(DialogTitle3, { children: "\u65B0\u5EFA\u7A3F\u4EF6" }) }),
    /* @__PURE__ */ jsxs14("div", { className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsx15(Input7, { "aria-label": "\u7A3F\u4EF6\u6807\u9898", placeholder: "\u6807\u9898", value: title, onChange: (event) => setTitle(event.target.value) }),
      /* @__PURE__ */ jsxs14("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxs14(Select7, { value: brand || "custom", onValueChange: (value) => {
          if (value !== "custom") setBrand(value);
        }, children: [
          /* @__PURE__ */ jsx15(SelectTrigger7, { "aria-label": "\u54C1\u724C", children: /* @__PURE__ */ jsx15(SelectValue7, {}) }),
          /* @__PURE__ */ jsxs14(SelectContent7, { children: [
            /* @__PURE__ */ jsx15(SelectItem7, { value: "custom", children: "\u624B\u586B\u54C1\u724C" }),
            brands.map((item) => /* @__PURE__ */ jsx15(SelectItem7, { value: item, children: item }, item))
          ] })
        ] }),
        /* @__PURE__ */ jsx15(Input7, { "aria-label": "\u54C1\u724C\u540D", placeholder: "\u54C1\u724C", value: brand, onChange: (event) => setBrand(event.target.value), className: "max-w-40" })
      ] }),
      /* @__PURE__ */ jsxs14(Select7, { value: kind, onValueChange: setKind, children: [
        /* @__PURE__ */ jsx15(SelectTrigger7, { "aria-label": "\u7A3F\u4EF6\u7C7B\u578B", children: /* @__PURE__ */ jsx15(SelectValue7, {}) }),
        /* @__PURE__ */ jsx15(SelectContent7, { children: Object.entries(KIND_LABEL3).map(([id, label]) => /* @__PURE__ */ jsx15(SelectItem7, { value: id, children: label }, id)) })
      ] }),
      /* @__PURE__ */ jsxs14(Select7, { value: campaignId, onValueChange: setCampaignId, children: [
        /* @__PURE__ */ jsx15(SelectTrigger7, { "aria-label": "\u5173\u8054\u6D3B\u52A8", children: /* @__PURE__ */ jsx15(SelectValue7, {}) }),
        /* @__PURE__ */ jsxs14(SelectContent7, { children: [
          /* @__PURE__ */ jsx15(SelectItem7, { value: "none", children: "\u4E0D\u5173\u8054\u6D3B\u52A8" }),
          campaigns.map((item) => /* @__PURE__ */ jsx15(SelectItem7, { value: String(item.id), children: item.name }, item.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs14("fieldset", { className: "flex flex-wrap gap-x-3 gap-y-1 text-xs", children: [
        /* @__PURE__ */ jsx15("legend", { className: "mb-1 text-(--ui-text-tertiary)", children: "\u8981\u505A\u7684\u5E73\u53F0" }),
        CONTENT_PLATFORMS.map((item) => /* @__PURE__ */ jsxs14("label", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsx15(
            "input",
            {
              type: "checkbox",
              checked: platforms.includes(item),
              onChange: () => toggle(item)
            }
          ),
          platformLabel2(item)
        ] }, item))
      ] }),
      /* @__PURE__ */ jsx15(
        Input7,
        {
          "aria-label": "\u4F5C\u8005",
          placeholder: "\u4F5C\u8005\uFF0C\u54C1\u724C\u52A9\u624B\u5199\u7684\u8BF7\u586B\u54C1\u724C\u52A9\u624B",
          value: author,
          onChange: (event) => setAuthor(event.target.value)
        }
      ),
      error ? /* @__PURE__ */ jsx15("p", { className: "text-xs text-destructive", children: error }) : null
    ] }),
    /* @__PURE__ */ jsxs14(DialogFooter2, { children: [
      /* @__PURE__ */ jsx15(Button12, { variant: "outline", onClick: onClose, children: "\u53D6\u6D88" }),
      /* @__PURE__ */ jsx15(Button12, { disabled: busy || !title.trim() || !brand.trim(), onClick: () => void create(), children: busy ? "\u6B63\u5728\u521B\u5EFA" : "\u521B\u5EFA" })
    ] })
  ] }) });
}

// src/pages/design/DesignPage.tsx
import { useEffect as useEffect15, useState as useState17 } from "react";
import {
  Badge as Badge6,
  Button as Button16,
  Codicon as Codicon3,
  ConfirmDialog as ConfirmDialog5,
  EmptyState as EmptyState4,
  ErrorState as ErrorState7,
  Input as Input11,
  Loader as Loader7,
  SegmentedControl as SegmentedControl6,
  Select as Select9,
  SelectContent as SelectContent9,
  SelectItem as SelectItem9,
  SelectTrigger as SelectTrigger9,
  SelectValue as SelectValue9,
  Textarea as Textarea10
} from "@hermes/plugin-sdk";

// src/pages/design/AssetGrid.tsx
import { Codicon as Codicon2 } from "@hermes/plugin-sdk";
import { jsx as jsx16, jsxs as jsxs15 } from "react/jsx-runtime";
function AssetGrid({
  assets,
  onOpen,
  empty = "\u8FD8\u6CA1\u6709\u7D20\u6750"
}) {
  if (assets.length === 0) {
    return /* @__PURE__ */ jsx16("p", { className: "text-xs text-(--ui-text-tertiary)", children: empty });
  }
  return /* @__PURE__ */ jsx16("ul", { className: "grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2", children: assets.map((asset) => {
    const size = asset.width && asset.height ? `${asset.width}\xD7${asset.height}` : asset.mime || "\u6587\u4EF6";
    return /* @__PURE__ */ jsx16("li", { className: "min-w-0", children: /* @__PURE__ */ jsxs15(
      "button",
      {
        type: "button",
        onClick: () => onOpen?.(asset),
        className: "flex w-full min-w-0 flex-col gap-1 rounded-md p-1 text-left hover:bg-(--ui-bg-quinary)",
        children: [
          /* @__PURE__ */ jsx16("span", { className: "flex aspect-square items-center justify-center overflow-hidden rounded-md bg-(--ui-bg-secondary)", children: isImage(asset.mime) ? /* @__PURE__ */ jsx16("img", { src: assetSrc(asset.url), alt: "", className: "max-h-full max-w-full object-contain" }) : /* @__PURE__ */ jsx16(Codicon2, { name: "library", size: "1.25rem" }) }),
          /* @__PURE__ */ jsx16("span", { className: "truncate text-xs", children: asset.file_name }),
          /* @__PURE__ */ jsx16("span", { className: "truncate text-[0.6875rem] text-(--ui-text-tertiary)", children: size }),
          asset.tags.length > 0 ? /* @__PURE__ */ jsx16("span", { className: "truncate text-[0.6875rem] text-(--ui-text-tertiary)", children: asset.tags.join("\u3001") }) : null
        ]
      }
    ) }, asset.id);
  }) });
}

// src/pages/design/RequestDialog.tsx
import { useEffect as useEffect13, useState as useState14 } from "react";
import {
  Button as Button13,
  Dialog as Dialog4,
  DialogContent as DialogContent4,
  DialogFooter as DialogFooter3,
  DialogHeader as DialogHeader4,
  DialogTitle as DialogTitle4,
  Input as Input8,
  Select as Select8,
  SelectContent as SelectContent8,
  SelectItem as SelectItem8,
  SelectTrigger as SelectTrigger8,
  SelectValue as SelectValue8,
  Textarea as Textarea8
} from "@hermes/plugin-sdk";
import { jsx as jsx17, jsxs as jsxs16 } from "react/jsx-runtime";
function RequestDialog({
  open,
  onOpenChange,
  brands,
  campaigns,
  initial,
  onSaved
}) {
  const editing = initial ?? null;
  const [title, setTitle] = useState14(editing?.title ?? "");
  const [kind, setKind] = useState14(editing?.kind || "main_image");
  const [brand, setBrand] = useState14(editing?.brand ?? brands[0] ?? "");
  const [campaignId, setCampaignId] = useState14(editing?.campaign_id ? String(editing.campaign_id) : "none");
  const [productCode, setProductCode] = useState14(editing?.product_code ?? "");
  const [codeQuery, setCodeQuery] = useState14(editing?.product_code ?? "");
  const [sizes, setSizes] = useState14(editing?.sizes ?? []);
  const [sizeInput, setSizeInput] = useState14("");
  const [sizeError, setSizeError] = useState14(null);
  const [copy, setCopy] = useState14(editing?.copy_text ?? "");
  const [brief, setBrief] = useState14(editing?.brief ?? "");
  const [due, setDue] = useState14(editing?.due_date ?? "");
  const [assignee, setAssignee] = useState14(editing?.assignee ?? "");
  const [actor, setActor] = useState14(loadActor);
  const [files, setFiles] = useState14([]);
  const [createdId, setCreatedId] = useState14(editing?.id ?? null);
  const [compliance, setCompliance] = useState14(null);
  const [busy, setBusy] = useState14(false);
  const [error, setError] = useState14(null);
  useEffect13(() => {
    const timer9 = window.setTimeout(() => setCodeQuery(productCode.trim()), 300);
    return () => window.clearTimeout(timer9);
  }, [productCode]);
  useEffect13(() => {
    const text = copy.trim();
    if (!text) {
      setCompliance(null);
      return;
    }
    const timer9 = window.setTimeout(() => {
      checkCompliance(text).then(setCompliance).catch(() => setCompliance(null));
    }, 500);
    return () => window.clearTimeout(timer9);
  }, [copy]);
  const cards = useQuery(
    () => codeQuery ? listProductCards({ q: codeQuery }) : Promise.resolve([]),
    [codeQuery]
  );
  const brandOptions = brand && !brands.includes(brand) ? [brand, ...brands] : brands;
  const addSize = () => {
    const next = normalizeSize(sizeInput);
    if (!next) {
      setSizeError("\u5C3A\u5BF8\u5199\u6210 800x800 \u8FD9\u6837");
      return;
    }
    setSizeError(null);
    setSizes((current) => current.includes(next) ? current : [...current, next]);
    setSizeInput("");
  };
  const submit = async () => {
    if (!title.trim() || !(editing ? editing.brand : brand).trim()) {
      setError("\u8BF7\u586B\u5199\u6807\u9898\u548C\u54C1\u724C");
      return;
    }
    saveActor(actor);
    setBusy(true);
    setError(null);
    const fields = {
      title: title.trim(),
      kind,
      campaign_id: campaignId === "none" ? null : Number(campaignId),
      product_code: productCode.trim() || null,
      sizes,
      copy_text: copy.trim() || null,
      brief: brief.trim() || null,
      due_date: due || null,
      assignee: assignee.trim() || null
    };
    let savedId = createdId;
    try {
      if (editing) {
        await patchDesignRequest(editing.id, fields);
        savedId = editing.id;
      } else if (savedId == null) {
        const created = await createDesignRequest({
          ...fields,
          brand: brand.trim(),
          requester: actor.trim() || null
        });
        savedId = created.id;
        setCreatedId(savedId);
      }
      for (const file of files) {
        await uploadRequestAsset(savedId, file, "reference", actor.trim() || null);
      }
      onSaved(savedId);
      onOpenChange(false);
    } catch (reason) {
      setError(errorText(reason, !editing && savedId != null ? "\u9700\u6C42\u5355\u5DF2\u521B\u5EFA\uFF0C\u53C2\u8003\u56FE\u6CA1\u6709\u4F20\u4E0A\u53BB" : "\u6CA1\u6709\u4FDD\u5B58"));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsx17(Dialog4, { open, onOpenChange, children: /* @__PURE__ */ jsxs16(DialogContent4, { className: "max-w-xl", children: [
    /* @__PURE__ */ jsx17(DialogHeader4, { children: /* @__PURE__ */ jsx17(DialogTitle4, { children: editing ? "\u7F16\u8F91\u9700\u6C42" : "\u63D0\u9700\u6C42" }) }),
    /* @__PURE__ */ jsxs16("label", { className: "flex flex-col gap-1 text-xs", children: [
      "\u6807\u9898",
      /* @__PURE__ */ jsx17(Input8, { "aria-label": "\u6807\u9898", value: title, onChange: (event) => setTitle(event.target.value) })
    ] }),
    /* @__PURE__ */ jsxs16("div", { className: "grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2", children: [
      /* @__PURE__ */ jsxs16("label", { className: "flex min-w-0 flex-col gap-1 text-xs", children: [
        "\u7C7B\u578B",
        /* @__PURE__ */ jsxs16(Select8, { value: kind, onValueChange: (value) => setKind(value), children: [
          /* @__PURE__ */ jsx17(SelectTrigger8, { "aria-label": "\u7C7B\u578B", children: /* @__PURE__ */ jsx17(SelectValue8, {}) }),
          /* @__PURE__ */ jsx17(SelectContent8, { children: KINDS.map((item) => /* @__PURE__ */ jsx17(SelectItem8, { value: item.id, children: item.label }, item.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs16("label", { className: "flex min-w-0 flex-col gap-1 text-xs", children: [
        "\u54C1\u724C",
        editing ? /* @__PURE__ */ jsx17(Input8, { "aria-label": "\u54C1\u724C", value: editing.brand, disabled: true }) : brandOptions.length > 0 ? /* @__PURE__ */ jsxs16(Select8, { value: brand, onValueChange: setBrand, children: [
          /* @__PURE__ */ jsx17(SelectTrigger8, { "aria-label": "\u54C1\u724C", children: /* @__PURE__ */ jsx17(SelectValue8, { placeholder: "\u9009\u62E9\u54C1\u724C" }) }),
          /* @__PURE__ */ jsx17(SelectContent8, { children: brandOptions.map((item) => /* @__PURE__ */ jsx17(SelectItem8, { value: item, children: item }, item)) })
        ] }) : /* @__PURE__ */ jsx17(Input8, { "aria-label": "\u54C1\u724C", value: brand, onChange: (event) => setBrand(event.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs16("label", { className: "flex flex-col gap-1 text-xs", children: [
      "\u6D3B\u52A8",
      /* @__PURE__ */ jsxs16(Select8, { value: campaignId, onValueChange: setCampaignId, children: [
        /* @__PURE__ */ jsx17(SelectTrigger8, { "aria-label": "\u6D3B\u52A8", children: /* @__PURE__ */ jsx17(SelectValue8, { placeholder: "\u4E0D\u5173\u8054\u6D3B\u52A8" }) }),
        /* @__PURE__ */ jsxs16(SelectContent8, { children: [
          /* @__PURE__ */ jsx17(SelectItem8, { value: "none", children: "\u4E0D\u5173\u8054\u6D3B\u52A8" }),
          campaigns.map((item) => /* @__PURE__ */ jsx17(SelectItem8, { value: String(item.id), children: item.name }, item.id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs16("label", { className: "flex flex-col gap-1 text-xs", children: [
      "\u5546\u54C1\u7F16\u7801",
      /* @__PURE__ */ jsx17(
        Input8,
        {
          "aria-label": "\u5546\u54C1\u7F16\u7801",
          value: productCode,
          placeholder: "\u4ECE\u5546\u54C1\u5361\u641C\u7D22",
          onChange: (event) => setProductCode(event.target.value)
        }
      )
    ] }),
    cards.data && cards.data.length > 0 ? /* @__PURE__ */ jsx17("ul", { className: "max-h-32 overflow-y-auto rounded-md border border-(--ui-stroke-secondary)", children: cards.data.slice(0, 6).map((card) => /* @__PURE__ */ jsx17("li", { children: /* @__PURE__ */ jsxs16(
      "button",
      {
        type: "button",
        className: "flex w-full gap-2 px-2 py-1 text-left text-xs hover:bg-(--ui-bg-quinary)",
        onClick: () => setProductCode(card.product_code),
        children: [
          /* @__PURE__ */ jsx17("span", { className: "text-(--ui-text-tertiary)", children: card.product_code }),
          /* @__PURE__ */ jsx17("span", { className: "min-w-0 truncate", children: card.name })
        ]
      }
    ) }, card.id)) }) : null,
    /* @__PURE__ */ jsxs16("div", { className: "flex flex-col gap-1 text-xs", children: [
      "\u5C3A\u5BF8",
      /* @__PURE__ */ jsxs16("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx17(
          Input8,
          {
            "aria-label": "\u5C3A\u5BF8",
            value: sizeInput,
            placeholder: "800x800",
            onChange: (event) => setSizeInput(event.target.value),
            onKeyDown: (event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addSize();
              }
            }
          }
        ),
        /* @__PURE__ */ jsx17(Button13, { type: "button", size: "sm", variant: "outline", onClick: addSize, children: "\u6DFB\u52A0" })
      ] }),
      sizeError ? /* @__PURE__ */ jsx17("p", { className: "text-destructive", children: sizeError }) : null,
      sizes.length > 0 ? /* @__PURE__ */ jsx17("ul", { className: "flex flex-wrap gap-1", children: sizes.map((size) => /* @__PURE__ */ jsx17("li", { children: /* @__PURE__ */ jsxs16(
        "button",
        {
          type: "button",
          className: "rounded-sm border border-(--ui-stroke-secondary) px-1.5 py-0.5",
          onClick: () => setSizes((current) => current.filter((item) => item !== size)),
          children: [
            size,
            " \xD7"
          ]
        }
      ) }, size)) }) : null
    ] }),
    /* @__PURE__ */ jsxs16("label", { className: "flex flex-col gap-1 text-xs", children: [
      "\u56FE\u4E0A\u6587\u6848",
      /* @__PURE__ */ jsx17(Textarea8, { "aria-label": "\u56FE\u4E0A\u6587\u6848", value: copy, rows: 3, onChange: (event) => setCopy(event.target.value) })
    ] }),
    /* @__PURE__ */ jsx17(ComplianceHint, { result: compliance }),
    /* @__PURE__ */ jsxs16("label", { className: "flex flex-col gap-1 text-xs", children: [
      "\u9700\u6C42\u8BF4\u660E",
      /* @__PURE__ */ jsx17(Textarea8, { "aria-label": "\u9700\u6C42\u8BF4\u660E", value: brief, rows: 3, onChange: (event) => setBrief(event.target.value) })
    ] }),
    /* @__PURE__ */ jsxs16("div", { className: "grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2", children: [
      /* @__PURE__ */ jsxs16("label", { className: "flex flex-col gap-1 text-xs", children: [
        "\u622A\u6B62\u65E5\u671F",
        /* @__PURE__ */ jsx17(Input8, { "aria-label": "\u622A\u6B62\u65E5\u671F", type: "date", value: due, onChange: (event) => setDue(event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs16("label", { className: "flex flex-col gap-1 text-xs", children: [
        "\u8BBE\u8BA1\u5E08",
        /* @__PURE__ */ jsx17(Input8, { "aria-label": "\u8BBE\u8BA1\u5E08", value: assignee, onChange: (event) => setAssignee(event.target.value) })
      ] }),
      editing ? null : /* @__PURE__ */ jsxs16("label", { className: "flex flex-col gap-1 text-xs", children: [
        "\u63D0\u51FA\u4EBA",
        /* @__PURE__ */ jsx17(Input8, { "aria-label": "\u63D0\u51FA\u4EBA", value: actor, onChange: (event) => setActor(event.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsx17(
      FileDrop,
      {
        label: editing ? "\u6DFB\u52A0\u53C2\u8003\u56FE" : "\u53C2\u8003\u56FE\uFF0C\u53EF\u4EE5\u62D6\u8FDB\u6765",
        files,
        onFiles: (next) => setFiles((current) => [...current, ...next])
      }
    ),
    files.length > 0 ? /* @__PURE__ */ jsx17("ul", { className: "text-xs text-(--ui-text-tertiary)", children: files.map((file) => /* @__PURE__ */ jsx17("li", { children: file.name }, `${file.name}-${file.size}`)) }) : null,
    error ? /* @__PURE__ */ jsx17("p", { className: "text-xs text-destructive", children: error }) : null,
    /* @__PURE__ */ jsxs16(DialogFooter3, { children: [
      /* @__PURE__ */ jsx17(Button13, { type: "button", variant: "outline", size: "sm", disabled: busy, onClick: () => onOpenChange(false), children: "\u53D6\u6D88" }),
      /* @__PURE__ */ jsx17(Button13, { type: "button", size: "sm", disabled: busy, onClick: () => void submit(), children: busy ? "\u6B63\u5728\u4FDD\u5B58" : editing ? "\u4FDD\u5B58" : createdId ? "\u91CD\u8BD5\u4E0A\u4F20" : "\u63D0\u4EA4" })
    ] })
  ] }) });
}
function ComplianceHint({ result }) {
  if (!result) return null;
  if (result.hits.length === 0) {
    return /* @__PURE__ */ jsx17("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u6CA1\u6709\u53D1\u73B0\u8FDD\u7981\u8BCD" });
  }
  return /* @__PURE__ */ jsx17("ul", { className: "flex flex-col gap-0.5", children: result.hits.map((hit) => /* @__PURE__ */ jsxs16(
    "li",
    {
      className: hit.level === "must" ? "text-xs text-destructive" : "text-xs text-(--ui-text-tertiary)",
      children: [
        hit.word,
        hit.level === "must" ? " \xB7 \u5FC5\u987B\u4FEE\u6539" : " \xB7 \u63D0\u9192",
        hit.suggestion ? `\uFF0C\u53EF\u6539\u6210\u300C${hit.suggestion}\u300D` : ""
      ]
    },
    `${hit.word}-${hit.level}`
  )) });
}
function FileDrop({
  label,
  files,
  onFiles
}) {
  return /* @__PURE__ */ jsxs16(
    "label",
    {
      className: "flex cursor-pointer flex-col gap-1 rounded-md border border-dashed border-(--ui-stroke-secondary) bg-(--ui-bg-secondary) p-3 text-xs text-(--ui-text-tertiary)",
      onDragOver: (event) => event.preventDefault(),
      onDrop: (event) => {
        event.preventDefault();
        const next = Array.from(event.dataTransfer.files);
        if (next.length > 0) onFiles(next);
      },
      children: [
        label,
        files && files.length > 0 ? /* @__PURE__ */ jsxs16("span", { children: [
          "\u5DF2\u9009 ",
          files.length,
          " \u4E2A\u6587\u4EF6"
        ] }) : /* @__PURE__ */ jsx17("span", { children: "\u6216\u70B9\u51FB\u9009\u62E9\u6587\u4EF6" }),
        /* @__PURE__ */ jsx17(
          "input",
          {
            type: "file",
            multiple: true,
            className: "hidden",
            "aria-label": label,
            onChange: (event) => {
              const next = Array.from(event.target.files ?? []);
              if (next.length > 0) onFiles(next);
              event.target.value = "";
            }
          }
        )
      ]
    }
  );
}

// src/pages/design/ReviewView.tsx
import { useEffect as useEffect14, useRef as useRef5, useState as useState16 } from "react";
import {
  Badge as Badge5,
  Button as Button15,
  Checkbox,
  ConfirmDialog as ConfirmDialog4,
  ErrorState as ErrorState6,
  Input as Input10,
  Loader as Loader6,
  Textarea as Textarea9
} from "@hermes/plugin-sdk";

// src/pages/design/PinLayer.tsx
import { useState as useState15 } from "react";
import { Button as Button14, Input as Input9, cn as cn5 } from "@hermes/plugin-sdk";
import { jsx as jsx18, jsxs as jsxs17 } from "react/jsx-runtime";
function PinLayer({
  asset,
  comments,
  disabled,
  onAdd,
  onResolve
}) {
  const [draft, setDraft] = useState15(null);
  const [hoverId, setHoverId] = useState15(null);
  const [saving, setSaving] = useState15(false);
  const [error, setError] = useState15(null);
  const pins = comments.filter((item) => item.asset_id === asset.id && item.x != null && item.y != null).slice().sort((a, b) => a.id - b.id);
  return /* @__PURE__ */ jsxs17("div", { className: "relative inline-block max-w-full bg-(--ui-bg-secondary)", children: [
    /* @__PURE__ */ jsx18(
      "img",
      {
        src: assetSrc(asset.url),
        alt: asset.file_name,
        draggable: false,
        className: "block max-h-[70vh] max-w-full",
        onClick: (event) => {
          if (disabled || saving) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;
          const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
          const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
          setDraft({ x, y, body: "" });
          setError(null);
        }
      }
    ),
    pins.map((pin, index) => /* @__PURE__ */ jsxs17(
      "button",
      {
        type: "button",
        "aria-label": `\u6279\u6CE8 ${index + 1}\uFF1A${pin.body}`,
        className: cn5(
          "absolute z-10 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-(--ui-accent) text-[0.625rem] font-medium text-white",
          pin.resolved && "opacity-45"
        ),
        style: { left: `${(pin.x ?? 0) * 100}%`, top: `${(pin.y ?? 0) * 100}%` },
        onMouseEnter: () => setHoverId(pin.id),
        onMouseLeave: () => setHoverId((current) => current === pin.id ? null : current),
        onClick: (event) => {
          event.stopPropagation();
          if (!pin.resolved) void onResolve(pin.id);
        },
        children: [
          index + 1,
          hoverId === pin.id ? /* @__PURE__ */ jsx18("span", { className: "pointer-events-none absolute top-6 left-1/2 z-20 w-40 -translate-x-1/2 rounded-md border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) px-2 py-1 text-left text-xs font-normal whitespace-normal text-(--ui-text-primary) shadow-sm", children: pin.body }) : null
        ]
      },
      pin.id
    )),
    draft ? /* @__PURE__ */ jsxs17(
      "form",
      {
        className: "absolute z-20 flex w-44 flex-col gap-1 rounded-md border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) p-2 shadow-md",
        style: {
          left: `${draft.x * 100}%`,
          top: `${draft.y * 100}%`,
          transform: draft.x > 0.65 ? "translate(-100%, 0.5rem)" : "translate(0.5rem, 0.5rem)"
        },
        onSubmit: (event) => {
          event.preventDefault();
          const body = draft.body.trim();
          if (!body || saving) return;
          setSaving(true);
          setError(null);
          void onAdd(draft.x, draft.y, body).then(() => setDraft(null)).catch((reason) => setError(errorText(reason, "\u6279\u6CE8\u6CA1\u6709\u4FDD\u5B58"))).finally(() => setSaving(false));
        },
        onClick: (event) => event.stopPropagation(),
        children: [
          /* @__PURE__ */ jsx18(
            Input9,
            {
              "aria-label": "\u6279\u6CE8",
              value: draft.body,
              placeholder: "\u5199\u5728\u8FD9\u5F20\u56FE\u4E0A",
              autoFocus: true,
              onChange: (event) => setDraft({ ...draft, body: event.target.value })
            }
          ),
          /* @__PURE__ */ jsxs17("div", { className: "flex justify-end gap-1", children: [
            /* @__PURE__ */ jsx18(Button14, { type: "button", size: "xs", variant: "ghost", onClick: () => setDraft(null), children: "\u53D6\u6D88" }),
            /* @__PURE__ */ jsx18(Button14, { type: "submit", size: "xs", disabled: saving || !draft.body.trim(), children: "\u4FDD\u5B58" })
          ] }),
          error ? /* @__PURE__ */ jsx18("p", { className: "text-xs text-destructive", children: error }) : null
        ]
      }
    ) : null
  ] });
}

// src/pages/design/ReviewView.tsx
import { Fragment as Fragment7, jsx as jsx19, jsxs as jsxs18 } from "react/jsx-runtime";
function ReviewView({ id, onBack }) {
  const root = useRef5(null);
  const candidateInput = useRef5(null);
  const referenceInput = useRef5(null);
  const [revision, setRevision] = useState16(0);
  const query = useQuery(() => getDesignRequest(id), [id, revision]);
  const detail = query.data ?? null;
  const guides = useQuery(() => listBrandGuides(), []);
  const campaigns = useQuery(() => listCampaigns(), []);
  const productCode = detail?.product_code ?? "";
  const cards = useQuery(
    () => productCode ? listProductCards({ q: productCode }) : Promise.resolve([]),
    [productCode]
  );
  const [narrow, setNarrow] = useState16(false);
  const [sideWidth, setSideWidth] = useState16(280);
  const [commentWidth, setCommentWidth] = useState16(260);
  const [actor, setActor] = useState16(loadActor);
  const [round, setRound] = useState16(null);
  const [selected, setSelected] = useState16([]);
  const [compare, setCompare] = useState16(false);
  const [focusId, setFocusId] = useState16(null);
  const [busy, setBusy] = useState16(false);
  const [actionError, setActionError] = useState16(null);
  const [finalizeHint, setFinalizeHint] = useState16(null);
  const [editing, setEditing] = useState16(false);
  const [returning, setReturning] = useState16(false);
  const [returnNote, setReturnNote] = useState16("");
  const [returnError, setReturnError] = useState16(null);
  const [canceling, setCanceling] = useState16(false);
  useEffect14(() => {
    const el = root.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setNarrow((entries[0]?.contentRect.width ?? 0) < 720);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [detail]);
  const seenRound = useRef5(null);
  useEffect14(() => {
    if (!detail) return;
    if (seenRound.current == null || detail.round !== seenRound.current) {
      setRound(detail.round);
      seenRound.current = detail.round;
    }
  }, [detail]);
  const reload = () => setRevision((value) => value + 1);
  const card = cards.data?.find((item) => item.product_code === productCode) ?? null;
  const currentRound = round ?? detail?.round ?? 1;
  const roundNumbers = detail ? [...new Set(detail.candidates.map((item) => item.round ?? 1))].sort((a, b) => a - b) : [];
  const roundAssets = detail?.candidates.filter((item) => (item.round ?? 1) === currentRound) ?? [];
  const focused = detail?.candidates.find((item) => item.id === focusId) ?? detail?.finals.find((item) => item.id === focusId) ?? null;
  const compared = detail?.candidates.filter((item) => selected.includes(item.id)) ?? [];
  const apply = async (task) => {
    setBusy(true);
    setActionError(null);
    try {
      await task();
      reload();
      await refreshDesignNeedsActionCount();
    } finally {
      setBusy(false);
    }
  };
  const toggle = (assetId, on) => {
    setFinalizeHint(null);
    setSelected((current) => {
      if (!on) return current.filter((item) => item !== assetId);
      if (current.includes(assetId) || current.length >= 4) return current;
      return [...current, assetId];
    });
    if (on && selected.length >= 4) setActionError("\u6700\u591A\u5E76\u6392\u5BF9\u6BD4 4 \u5F20");
  };
  const uploadFiles = async (files, role) => {
    if (files.length === 0) return;
    setBusy(true);
    setActionError(null);
    try {
      for (const file of files) {
        await uploadRequestAsset(id, file, role, actor.trim() || null);
      }
    } catch (reason) {
      setActionError(errorText(reason, role === "reference" ? "\u53C2\u8003\u56FE\u6CA1\u6709\u4F20\u4E0A\u53BB" : "\u5019\u9009\u7A3F\u6CA1\u6709\u4F20\u4E0A\u53BB"));
    } finally {
      setBusy(false);
      reload();
      await refreshDesignNeedsActionCount();
    }
  };
  const accept = () => apply(() => setDesignStatus(id, { status: "in_progress", by: actor.trim() || "\u8BBE\u8BA1\u5E08" }));
  const sendBack = async () => {
    if (!returnNote.trim()) {
      setReturnError("\u8BF7\u586B\u5199\u8981\u6539\u4EC0\u4E48");
      return;
    }
    setReturnError(null);
    try {
      await apply(
        () => setDesignStatus(id, { status: "in_progress", by: actor.trim() || null, note: returnNote.trim() })
      );
      setReturning(false);
      setReturnNote("");
      setSelected([]);
      setCompare(false);
    } catch (reason) {
      setReturnError(errorText(reason, "\u6CA1\u6709\u9000\u56DE"));
    }
  };
  const finalize = async () => {
    if (selected.length === 0) {
      setFinalizeHint("\u8BF7\u5148\u52FE\u9009\u5019\u9009\u7A3F");
      return;
    }
    setFinalizeHint(null);
    try {
      await apply(() => finalizeDesign(id, selected, actor.trim() || null));
      setCompare(false);
      setFocusId(null);
    } catch (reason) {
      if (reason instanceof ApiError && reason.code === "compliance_failed") setFinalizeHint(reason.message);
      else setActionError(errorText(reason, "\u5B9A\u7A3F\u5931\u8D25"));
    }
  };
  if (query.error && !detail) {
    return /* @__PURE__ */ jsx19("div", { className: "flex flex-1 items-center justify-center py-10", children: /* @__PURE__ */ jsxs18(
      ErrorState6,
      {
        title: isOfflineError(query.error) ? "\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1" : "\u9700\u6C42\u5355\u52A0\u8F7D\u5931\u8D25",
        description: errorText(query.error, "\u8BF7\u91CD\u8BD5"),
        children: [
          /* @__PURE__ */ jsx19(Button15, { size: "sm", variant: "outline", onClick: onBack, children: "\u8FD4\u56DE" }),
          /* @__PURE__ */ jsx19(Button15, { size: "sm", variant: "outline", onClick: reload, children: "\u91CD\u8BD5" })
        ]
      }
    ) });
  }
  if (!detail) {
    return /* @__PURE__ */ jsxs18("div", { className: "flex items-center gap-2 py-6 text-xs text-(--ui-text-tertiary)", children: [
      /* @__PURE__ */ jsx19(Loader6, {}),
      "\u6B63\u5728\u8BFB\u53D6\u9700\u6C42\u5355"
    ] });
  }
  const closed = detail.status === "done" || detail.status === "cancelled";
  const imageComments = focused ? detail.comments.filter((item) => item.asset_id === focused.id) : [];
  return /* @__PURE__ */ jsxs18("div", { ref: root, className: "flex min-w-0 flex-1 flex-col gap-3", children: [
    /* @__PURE__ */ jsxs18("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx19(Button15, { size: "sm", variant: "ghost", onClick: onBack, children: "\u8FD4\u56DE" }),
      /* @__PURE__ */ jsx19("h2", { className: "min-w-0 truncate text-sm font-medium", children: detail.title }),
      /* @__PURE__ */ jsx19(Badge5, { variant: statusVariant(detail.status), children: statusLabel(detail.status) }),
      /* @__PURE__ */ jsxs18("span", { className: "text-xs text-(--ui-text-tertiary)", children: [
        "\u7B2C ",
        detail.round,
        " \u8F6E"
      ] })
    ] }),
    /* @__PURE__ */ jsxs18("div", { className: narrow ? "flex min-w-0 flex-col gap-4" : "flex min-w-0 items-start", children: [
      /* @__PURE__ */ jsxs18("aside", { className: "flex min-w-0 flex-col gap-3", style: narrow ? void 0 : { width: sideWidth }, children: [
        /* @__PURE__ */ jsx19(InfoBlock, { detail, card }),
        /* @__PURE__ */ jsxs18("section", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxs18("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsx19("h3", { className: "text-xs font-medium", children: "\u53C2\u8003\u56FE" }),
            closed ? null : /* @__PURE__ */ jsx19(Button15, { size: "xs", variant: "outline", disabled: busy, onClick: () => referenceInput.current?.click(), children: "\u6DFB\u52A0\u53C2\u8003\u56FE" })
          ] }),
          /* @__PURE__ */ jsx19(AssetGrid, { assets: detail.references, empty: "\u8FD8\u6CA1\u6709\u53C2\u8003\u56FE" }),
          /* @__PURE__ */ jsx19(
            "input",
            {
              ref: referenceInput,
              type: "file",
              multiple: true,
              "aria-label": "\u6DFB\u52A0\u53C2\u8003\u56FE",
              className: "absolute h-px w-px opacity-0",
              onChange: (event) => {
                const files = Array.from(event.target.files ?? []);
                event.target.value = "";
                void uploadFiles(files, "reference");
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxs18("section", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx19("h3", { className: "text-xs font-medium", children: "\u8BB0\u5F55" }),
          detail.events.length === 0 ? /* @__PURE__ */ jsx19("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD8\u6CA1\u6709\u8BB0\u5F55\u3002" }) : /* @__PURE__ */ jsx19("ul", { children: detail.events.map((event, index) => /* @__PURE__ */ jsxs18(
            "li",
            {
              className: "border-b border-(--ui-stroke-secondary) py-1.5 text-xs text-(--ui-text-tertiary)",
              children: [
                formatShanghai(event.at),
                " \xB7 ",
                event.by || "\u6709\u4EBA",
                " \xB7 ",
                event.text
              ]
            },
            `${event.at}-${index}`
          )) })
        ] })
      ] }),
      narrow ? null : /* @__PURE__ */ jsx19(
        "div",
        {
          role: "separator",
          "aria-orientation": "vertical",
          "aria-label": "\u62D6\u52A8\u8C03\u6574\u8D44\u6599\u680F\u5BBD\u5EA6",
          className: "mx-2 w-1 shrink-0 cursor-col-resize self-stretch bg-(--ui-stroke-secondary)",
          onPointerDown: (event) => {
            const startX = event.clientX;
            const startW = sideWidth;
            const move = (ev) => {
              setSideWidth(Math.min(480, Math.max(220, startW + (ev.clientX - startX))));
            };
            const up = () => {
              window.removeEventListener("pointermove", move);
              window.removeEventListener("pointerup", up);
            };
            window.addEventListener("pointermove", move);
            window.addEventListener("pointerup", up);
          }
        }
      ),
      /* @__PURE__ */ jsx19("div", { className: "flex min-w-0 flex-1 flex-col gap-3", children: detail.status === "done" ? /* @__PURE__ */ jsx19(FinalStrip, { assets: detail.finals }) : /* @__PURE__ */ jsxs18(Fragment7, { children: [
        /* @__PURE__ */ jsxs18("div", { className: "flex flex-wrap items-center gap-2", children: [
          roundNumbers.map((item) => /* @__PURE__ */ jsxs18(
            Button15,
            {
              size: "xs",
              variant: item === currentRound ? "default" : "outline",
              onClick: () => {
                setRound(item);
                setCompare(false);
              },
              children: [
                "\u7B2C ",
                item,
                " \u8F6E"
              ]
            },
            item
          )),
          /* @__PURE__ */ jsx19(
            Button15,
            {
              size: "xs",
              variant: "outline",
              disabled: selected.length < 2 || selected.length > 4,
              onClick: () => setCompare(true),
              children: "\u5E76\u6392\u5BF9\u6BD4"
            }
          )
        ] }),
        roundAssets.length === 0 ? /* @__PURE__ */ jsx19("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD9\u4E00\u8F6E\u8FD8\u6CA1\u6709\u5019\u9009\u7A3F\u3002" }) : /* @__PURE__ */ jsx19("ul", { className: "flex gap-2 overflow-x-auto", children: roundAssets.map((asset) => /* @__PURE__ */ jsxs18("li", { className: "flex w-28 shrink-0 flex-col gap-1", children: [
          /* @__PURE__ */ jsx19(
            Checkbox,
            {
              checked: selected.includes(asset.id),
              "aria-label": `\u52FE\u9009 ${asset.label || asset.file_name}`,
              onCheckedChange: (on) => toggle(asset.id, on)
            }
          ),
          /* @__PURE__ */ jsxs18(
            "button",
            {
              type: "button",
              className: "flex flex-col gap-1 text-left",
              onClick: () => {
                setFocusId(asset.id);
                setCompare(false);
              },
              children: [
                /* @__PURE__ */ jsx19("span", { className: "flex h-24 items-center justify-center overflow-hidden rounded-md bg-(--ui-bg-secondary)", children: isImage(asset.mime) ? /* @__PURE__ */ jsx19("img", { src: assetSrc(asset.url), alt: "", className: "max-h-full max-w-full object-contain" }) : /* @__PURE__ */ jsx19("span", { className: "text-xs text-(--ui-text-tertiary)", children: asset.mime }) }),
                /* @__PURE__ */ jsxs18("span", { className: "truncate text-xs", children: [
                  asset.label || "\u672A\u7F16\u53F7",
                  " ",
                  asset.width && asset.height ? `${asset.width}\xD7${asset.height}` : ""
                ] })
              ]
            }
          )
        ] }, asset.id)) }),
        compare && compared.length >= 2 ? /* @__PURE__ */ jsx19(
          "div",
          {
            className: "grid gap-2",
            style: { gridTemplateColumns: `repeat(${compared.length}, minmax(0, 1fr))` },
            children: compared.map((asset) => /* @__PURE__ */ jsxs18(
              "button",
              {
                type: "button",
                className: "flex min-w-0 flex-col gap-1 text-left",
                onClick: () => {
                  setFocusId(asset.id);
                  setCompare(false);
                },
                children: [
                  /* @__PURE__ */ jsx19("span", { className: "flex h-64 items-center justify-center overflow-hidden rounded-md bg-(--ui-bg-secondary)", children: isImage(asset.mime) ? /* @__PURE__ */ jsx19("img", { src: assetSrc(asset.url), alt: "", className: "max-h-full max-w-full object-contain" }) : /* @__PURE__ */ jsx19("span", { className: "text-xs", children: asset.file_name }) }),
                  /* @__PURE__ */ jsxs18("span", { className: "text-xs", children: [
                    asset.label || "\u672A\u7F16\u53F7",
                    asset.source === "ai" ? " \xB7 AI \u751F\u6210" : "",
                    asset.width && asset.height ? ` \xB7 ${asset.width}\xD7${asset.height}` : ""
                  ] })
                ]
              },
              asset.id
            ))
          }
        ) : focused ? /* @__PURE__ */ jsxs18("div", { className: narrow ? "flex min-w-0 flex-col gap-3" : "flex w-full max-w-max items-start", children: [
          /* @__PURE__ */ jsxs18("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx19(
              PinLayer,
              {
                asset: focused,
                comments: detail.comments,
                disabled: detail.status === "cancelled",
                onAdd: async (x, y, body) => {
                  await addDesignComment(id, {
                    body,
                    asset_id: focused.id,
                    x,
                    y,
                    author: actor.trim() || null
                  });
                  reload();
                  await refreshDesignNeedsActionCount();
                },
                onResolve: async (commentId) => {
                  await resolveDesignComment(commentId, true);
                  reload();
                  await refreshDesignNeedsActionCount();
                }
              }
            ),
            focused.source === "ai" && focused.prompt ? /* @__PURE__ */ jsxs18("details", { className: "mt-2 text-xs", children: [
              /* @__PURE__ */ jsx19("summary", { children: "\u63D0\u793A\u8BCD" }),
              /* @__PURE__ */ jsx19("p", { className: "mt-1 whitespace-pre-wrap text-(--ui-text-tertiary)", children: focused.prompt })
            ] }) : null
          ] }),
          /* @__PURE__ */ jsxs18(
            "aside",
            {
              style: narrow ? void 0 : { width: commentWidth },
              className: "relative flex min-w-0 shrink-0 flex-col border-l border-(--ui-stroke-secondary)",
              children: [
                narrow ? null : /* @__PURE__ */ jsx19(
                  "div",
                  {
                    role: "separator",
                    "aria-orientation": "vertical",
                    "aria-label": "\u8C03\u6574\u6279\u6CE8\u680F\u5BBD\u5EA6",
                    className: "absolute inset-y-0 left-0 z-10 w-1 cursor-col-resize select-none hover:bg-(--ui-accent)",
                    onPointerDown: (event) => {
                      const startX = event.clientX;
                      const startWidth = commentWidth;
                      const move = (ev) => {
                        setCommentWidth(Math.min(480, Math.max(220, startWidth - (ev.clientX - startX))));
                      };
                      const up = () => {
                        window.removeEventListener("pointermove", move);
                        window.removeEventListener("pointerup", up);
                      };
                      window.addEventListener("pointermove", move);
                      window.addEventListener("pointerup", up);
                    }
                  }
                ),
                /* @__PURE__ */ jsxs18("div", { className: "max-h-[70vh] overflow-y-auto px-3", children: [
                  /* @__PURE__ */ jsx19("h3", { className: "mb-1 text-xs font-medium", children: "\u8FD9\u5F20\u56FE\u7684\u6279\u6CE8" }),
                  imageComments.length === 0 ? /* @__PURE__ */ jsx19("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u70B9\u5927\u56FE\u53EF\u4EE5\u5199\u6279\u6CE8\u3002" }) : /* @__PURE__ */ jsx19("ul", { className: "flex flex-col gap-2", children: imageComments.map((item) => /* @__PURE__ */ jsxs18("li", { className: "rounded-md border border-(--ui-stroke-secondary) p-2 text-xs", children: [
                    /* @__PURE__ */ jsx19("p", { className: "break-words whitespace-pre-wrap", children: item.body }),
                    /* @__PURE__ */ jsxs18("p", { className: "mt-1 text-(--ui-text-tertiary)", children: [
                      item.author || "\u6709\u4EBA",
                      item.resolved ? " \xB7 \u5DF2\u89E3\u51B3" : ""
                    ] }),
                    item.resolved ? null : /* @__PURE__ */ jsx19(
                      Button15,
                      {
                        size: "xs",
                        variant: "outline",
                        className: "mt-1",
                        onClick: () => void resolveDesignComment(item.id, true).then(() => {
                          reload();
                          void refreshDesignNeedsActionCount();
                        }),
                        children: "\u6807\u5DF2\u89E3\u51B3"
                      }
                    )
                  ] }, item.id)) })
                ] })
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsx19("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u70B9\u4E00\u5F20\u5019\u9009\u7A3F\u770B\u5927\u56FE\uFF0C\u52FE\u9009 2 \u5230 4 \u5F20\u53EF\u4EE5\u5E76\u6392\u5BF9\u6BD4\u3002" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs18("div", { className: "flex flex-col gap-2 border-t border-(--ui-stroke-secondary) pt-3", children: [
      /* @__PURE__ */ jsxs18("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx19("span", { className: "text-xs text-(--ui-text-secondary)", children: "\u7F72\u540D" }),
        /* @__PURE__ */ jsx19(
          Input10,
          {
            "aria-label": "\u7F72\u540D",
            value: actor,
            style: { width: "7rem" },
            onChange: (event) => {
              setActor(event.target.value);
              saveActor(event.target.value);
            }
          }
        ),
        closed ? null : /* @__PURE__ */ jsx19(Button15, { size: "sm", variant: "outline", onClick: () => setEditing(true), children: "\u7F16\u8F91" }),
        detail.status === "open" ? /* @__PURE__ */ jsx19(Button15, { size: "sm", disabled: busy, onClick: () => void accept().catch((reason) => setActionError(errorText(reason, "\u6CA1\u6709\u63A5\u5355"))), children: "\u63A5\u5355" }) : null,
        detail.status === "in_progress" || detail.status === "reviewing" ? /* @__PURE__ */ jsx19(Button15, { size: "sm", variant: "outline", disabled: busy, onClick: () => candidateInput.current?.click(), children: "\u4E0A\u4F20\u5019\u9009\u7A3F" }) : null,
        detail.status === "reviewing" ? /* @__PURE__ */ jsxs18(Fragment7, { children: [
          /* @__PURE__ */ jsx19(Button15, { size: "sm", disabled: busy, onClick: () => void finalize(), children: "\u5B9A\u7A3F" }),
          finalizeHint ? /* @__PURE__ */ jsx19("span", { className: "text-xs text-destructive", children: finalizeHint }) : null,
          /* @__PURE__ */ jsx19(Button15, { size: "sm", variant: "outline", disabled: busy, onClick: () => setReturning(true), children: "\u9000\u56DE\u4FEE\u6539" })
        ] }) : null,
        detail.status === "cancelled" || detail.status === "done" ? null : /* @__PURE__ */ jsx19(Button15, { size: "sm", variant: "outline", disabled: busy, onClick: () => setCanceling(true), children: "\u53D6\u6D88" })
      ] }),
      actionError ? /* @__PURE__ */ jsx19("p", { className: "text-xs text-destructive", children: actionError }) : null,
      /* @__PURE__ */ jsx19(
        "input",
        {
          ref: candidateInput,
          type: "file",
          multiple: true,
          "aria-label": "\u4E0A\u4F20\u5019\u9009\u7A3F",
          className: "absolute h-px w-px opacity-0",
          onChange: (event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            void uploadFiles(files, "candidate");
          }
        }
      )
    ] }),
    editing ? /* @__PURE__ */ jsx19(
      RequestDialog,
      {
        open: true,
        brands: (guides.data ?? []).map((item) => item.brand),
        campaigns: campaigns.data ?? [],
        initial: detail,
        onOpenChange: setEditing,
        onSaved: () => {
          setEditing(false);
          reload();
        }
      }
    ) : null,
    returning ? /* @__PURE__ */ jsxs18("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
      /* @__PURE__ */ jsx19("button", { type: "button", "aria-label": "\u5173\u95ED\u6D6E\u5C42", className: "absolute inset-0 bg-black/22", onClick: () => setReturning(false) }),
      /* @__PURE__ */ jsxs18("div", { role: "dialog", className: "relative z-10 flex w-full max-w-md flex-col gap-2 rounded-lg border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) p-4", children: [
        /* @__PURE__ */ jsx19("h2", { className: "text-sm font-medium", children: "\u9000\u56DE\u4FEE\u6539" }),
        /* @__PURE__ */ jsx19(
          Textarea9,
          {
            "aria-label": "\u8981\u6539\u4EC0\u4E48",
            rows: 3,
            value: returnNote,
            placeholder: "\u5199\u660E\u8981\u6539\u4EC0\u4E48",
            onChange: (event) => setReturnNote(event.target.value)
          }
        ),
        returnError ? /* @__PURE__ */ jsx19("p", { className: "text-xs text-destructive", children: returnError }) : null,
        /* @__PURE__ */ jsxs18("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx19(Button15, { size: "sm", variant: "outline", onClick: () => setReturning(false), children: "\u53D6\u6D88" }),
          /* @__PURE__ */ jsx19(Button15, { size: "sm", disabled: busy, onClick: () => void sendBack(), children: "\u9000\u56DE" })
        ] })
      ] })
    ] }) : null,
    /* @__PURE__ */ jsx19(
      ConfirmDialog4,
      {
        open: canceling,
        title: "\u53D6\u6D88\u8FD9\u6761\u9700\u6C42\uFF1F",
        description: "\u53D6\u6D88\u540E\u4E0D\u80FD\u518D\u4E0A\u4F20\u5019\u9009\u7A3F\u3002",
        confirmLabel: "\u53D6\u6D88\u9700\u6C42",
        onClose: () => setCanceling(false),
        onConfirm: () => apply(() => setDesignStatus(id, { status: "cancelled", by: actor.trim() || null })).then(
          () => setCanceling(false)
        )
      }
    )
  ] });
}
function InfoBlock({ detail, card }) {
  return /* @__PURE__ */ jsxs18("section", { className: "flex flex-col gap-2 text-xs", children: [
    /* @__PURE__ */ jsxs18("p", { children: [
      /* @__PURE__ */ jsx19("span", { className: "text-(--ui-text-tertiary)", children: "\u7C7B\u578B " }),
      kindLabel(detail.kind),
      detail.sizes.length > 0 ? ` \xB7 ${detail.sizes.join("\u3001")}` : ""
    ] }),
    /* @__PURE__ */ jsxs18("p", { children: [
      /* @__PURE__ */ jsx19("span", { className: "text-(--ui-text-tertiary)", children: "\u622A\u6B62 " }),
      /* @__PURE__ */ jsx19("span", { className: detail.overdue ? "text-destructive" : void 0, children: formatDue(detail.due_date) }),
      detail.overdue ? /* @__PURE__ */ jsx19("span", { className: "text-destructive", children: " \xB7 \u903E\u671F" }) : null
    ] }),
    /* @__PURE__ */ jsxs18("p", { children: [
      /* @__PURE__ */ jsx19("span", { className: "text-(--ui-text-tertiary)", children: "\u8BBE\u8BA1\u5E08 " }),
      detail.assignee || "\u672A\u6307\u5B9A"
    ] }),
    /* @__PURE__ */ jsxs18("div", { children: [
      /* @__PURE__ */ jsx19("p", { className: "text-(--ui-text-tertiary)", children: "\u56FE\u4E0A\u6587\u6848" }),
      /* @__PURE__ */ jsx19("p", { className: "whitespace-pre-wrap", children: detail.copy_text || "\u6CA1\u6709\u6587\u6848" }),
      /* @__PURE__ */ jsx19(ComplianceHint, { result: detail.compliance })
    ] }),
    /* @__PURE__ */ jsxs18("div", { children: [
      /* @__PURE__ */ jsx19("p", { className: "text-(--ui-text-tertiary)", children: "\u9700\u6C42\u8BF4\u660E" }),
      /* @__PURE__ */ jsx19("p", { className: "whitespace-pre-wrap", children: detail.brief || "\u6CA1\u6709\u8BF4\u660E" })
    ] }),
    /* @__PURE__ */ jsxs18("div", { children: [
      /* @__PURE__ */ jsx19("p", { className: "text-(--ui-text-tertiary)", children: "\u5546\u54C1\u5361" }),
      card ? /* @__PURE__ */ jsxs18("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsxs18("p", { children: [
          card.product_code,
          " ",
          card.name
        ] }),
        card.selling_points.length > 0 ? /* @__PURE__ */ jsx19("p", { children: card.selling_points.slice(0, 4).join(" \xB7 ") }) : null,
        card.specs ? /* @__PURE__ */ jsx19("p", { className: "whitespace-pre-wrap text-(--ui-text-tertiary)", children: card.specs }) : null
      ] }) : /* @__PURE__ */ jsx19("p", { children: detail.product_code ? "\u6CA1\u6709\u627E\u5230\u5BF9\u5E94\u7684\u5546\u54C1\u5361" : "\u672A\u5173\u8054\u5546\u54C1" })
    ] })
  ] });
}
function FinalStrip({ assets }) {
  if (assets.length === 0) return /* @__PURE__ */ jsx19("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD8\u6CA1\u6709\u5B9A\u7A3F\u56FE\u3002" });
  return /* @__PURE__ */ jsx19("ul", { className: "grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-3", children: assets.map((asset) => /* @__PURE__ */ jsxs18("li", { className: "flex min-w-0 flex-col gap-1", children: [
    /* @__PURE__ */ jsx19("span", { className: "flex h-64 items-center justify-center overflow-hidden rounded-md bg-(--ui-bg-secondary)", children: isImage(asset.mime) ? /* @__PURE__ */ jsx19("img", { src: assetSrc(asset.url), alt: asset.file_name, className: "max-h-full max-w-full object-contain" }) : /* @__PURE__ */ jsx19("span", { className: "text-xs", children: asset.file_name }) }),
    /* @__PURE__ */ jsxs18("span", { className: "truncate text-xs", children: [
      asset.label || asset.file_name,
      asset.width && asset.height ? ` \xB7 ${asset.width}\xD7${asset.height}` : ""
    ] }),
    /* @__PURE__ */ jsx19("a", { className: "text-xs text-(--ui-accent)", href: assetDownloadUrl(asset.url), children: "\u4E0B\u8F7D\u539F\u56FE" })
  ] }, asset.id)) });
}

// src/pages/design/DesignPage.tsx
import { Fragment as Fragment8, jsx as jsx20, jsxs as jsxs19 } from "react/jsx-runtime";
function DesignPage() {
  const [screen, setScreen] = useState17({ name: "list" });
  if (screen.name === "review") {
    return /* @__PURE__ */ jsx20(ReviewView, { id: screen.id, onBack: () => setScreen({ name: "list" }) });
  }
  return /* @__PURE__ */ jsx20(DesignHome, { onOpen: (id) => setScreen({ name: "review", id }) });
}
function DesignHome({ onOpen }) {
  const [tab, setTab] = useState17("requests");
  const guides = useQuery(() => listBrandGuides(), []);
  const campaigns = useQuery(() => listCampaigns(), []);
  const brands = (guides.data ?? []).map((item) => item.brand);
  return /* @__PURE__ */ jsxs19("div", { className: "flex min-w-0 flex-1 flex-col gap-4", children: [
    /* @__PURE__ */ jsx20("div", { className: "flex flex-wrap items-center justify-between gap-2", children: /* @__PURE__ */ jsx20(
      SegmentedControl6,
      {
        className: "max-w-full flex-wrap",
        options: [
          { id: "requests", label: "\u9700\u6C42" },
          { id: "library", label: "\u7D20\u6750\u5E93" }
        ],
        value: tab,
        onChange: setTab
      }
    ) }),
    tab === "requests" ? /* @__PURE__ */ jsx20(RequestTab, { brands, campaigns: campaigns.data ?? [], onOpen }) : /* @__PURE__ */ jsx20(LibraryTab, { brands, campaigns: campaigns.data ?? [] })
  ] });
}
function RequestTab({
  brands,
  campaigns,
  onOpen
}) {
  const [segment, setSegment] = useState17("active");
  const [brand, setBrand] = useState17("all");
  const [kind, setKind] = useState17("all");
  const [campaignId, setCampaignId] = useState17("all");
  const [qInput, setQInput] = useState17("");
  const [q, setQ] = useState17("");
  const [creating, setCreating] = useState17(false);
  useEffect15(() => {
    const timer9 = window.setTimeout(() => setQ(qInput.trim()), 300);
    return () => window.clearTimeout(timer9);
  }, [qInput]);
  const summary = useQuery(() => getDesignSummary(brand === "all" ? void 0 : brand), [brand]);
  const list = useQuery(
    () => listDesignRequests({
      status: segment === "all" ? void 0 : segment,
      brand: brand === "all" ? void 0 : brand,
      kind: kind === "all" ? void 0 : kind,
      campaign_id: campaignId === "all" ? void 0 : Number(campaignId),
      q: q || void 0
    }),
    [segment, brand, kind, campaignId, q]
  );
  return /* @__PURE__ */ jsxs19("div", { className: "flex min-w-0 flex-col gap-3", children: [
    /* @__PURE__ */ jsx20(HeaderActions, { children: /* @__PURE__ */ jsx20(Button16, { size: "sm", onClick: () => setCreating(true), children: "\u63D0\u9700\u6C42" }) }),
    /* @__PURE__ */ jsxs19("div", { className: "flex flex-wrap items-center gap-2 text-xs", children: [
      /* @__PURE__ */ jsx20("span", { children: "\u5F85\u63A5\u5355" }),
      /* @__PURE__ */ jsx20(Badge6, { variant: "outline", children: summary.data?.open ?? 0 }),
      /* @__PURE__ */ jsx20("span", { children: "\u8BBE\u8BA1\u4E2D" }),
      /* @__PURE__ */ jsx20(Badge6, { variant: "outline", children: summary.data?.in_progress ?? 0 }),
      /* @__PURE__ */ jsx20("span", { children: "\u5F85\u8BC4\u5BA1" }),
      /* @__PURE__ */ jsx20(Badge6, { variant: "warn", children: summary.data?.reviewing ?? 0 }),
      /* @__PURE__ */ jsx20("span", { children: "\u903E\u671F" }),
      /* @__PURE__ */ jsx20(Badge6, { variant: "warn", children: summary.data?.overdue ?? 0 })
    ] }),
    /* @__PURE__ */ jsxs19("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx20(
        SegmentedControl6,
        {
          className: "max-w-full flex-wrap",
          options: [
            { id: "active", label: "\u672A\u5B8C\u6210" },
            { id: "reviewing", label: "\u5F85\u8BC4\u5BA1" },
            { id: "done", label: "\u5DF2\u5B9A\u7A3F" },
            { id: "all", label: "\u5168\u90E8" }
          ],
          value: segment,
          onChange: setSegment
        }
      ),
      /* @__PURE__ */ jsx20(FilterSelect2, { label: "\u54C1\u724C", value: brand, onChange: setBrand, options: brands.map((item) => ({ id: item, label: item })) }),
      /* @__PURE__ */ jsx20(FilterSelect2, { label: "\u7C7B\u578B", value: kind, onChange: setKind, options: KINDS.map((item) => ({ id: item.id, label: item.label })) }),
      /* @__PURE__ */ jsx20(
        FilterSelect2,
        {
          label: "\u6D3B\u52A8",
          value: campaignId,
          onChange: setCampaignId,
          options: campaigns.map((item) => ({ id: String(item.id), label: item.name }))
        }
      ),
      /* @__PURE__ */ jsx20(
        Input11,
        {
          "aria-label": "\u641C\u7D22\u9700\u6C42",
          value: qInput,
          placeholder: "\u6807\u9898\u3001\u6587\u6848\u3001\u5546\u54C1\u7F16\u7801",
          className: "w-44 max-w-full",
          onChange: (event) => setQInput(event.target.value)
        }
      )
    ] }),
    list.error ? /* @__PURE__ */ jsx20(
      ErrorState7,
      {
        title: isOfflineError(list.error) ? "\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1" : "\u9700\u6C42\u52A0\u8F7D\u5931\u8D25",
        description: errorText(list.error, "\u8BF7\u91CD\u8BD5"),
        children: /* @__PURE__ */ jsx20(Button16, { size: "sm", variant: "outline", onClick: list.reload, children: "\u91CD\u8BD5" })
      }
    ) : list.loading && !list.data ? /* @__PURE__ */ jsxs19("div", { className: "flex items-center gap-2 text-xs text-(--ui-text-tertiary)", children: [
      /* @__PURE__ */ jsx20(Loader7, {}),
      "\u6B63\u5728\u8BFB\u53D6\u9700\u6C42"
    ] }) : list.data && list.data.length === 0 ? /* @__PURE__ */ jsx20(EmptyState4, { title: "\u6CA1\u6709\u9700\u6C42", description: "\u5F53\u524D\u7B5B\u9009\u4E0B\u6CA1\u6709\u8BBE\u8BA1\u9700\u6C42\u3002" }) : /* @__PURE__ */ jsx20("ul", { className: "grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3", children: (list.data ?? []).map((item) => /* @__PURE__ */ jsx20(RequestCard, { item, onOpen: () => onOpen(item.id) }, item.id)) }),
    creating ? /* @__PURE__ */ jsx20(
      RequestDialog,
      {
        open: true,
        brands,
        campaigns,
        onOpenChange: setCreating,
        onSaved: (id) => {
          setCreating(false);
          void refreshDesignNeedsActionCount();
          onOpen(id);
        }
      }
    ) : null
  ] });
}
function RequestCard({ item, onOpen }) {
  return /* @__PURE__ */ jsx20("li", { className: "min-w-0", children: /* @__PURE__ */ jsxs19(
    "button",
    {
      type: "button",
      onClick: onOpen,
      className: "flex h-full w-full min-w-0 flex-col gap-2 rounded-md border border-(--ui-stroke-secondary) p-2 text-left hover:bg-(--ui-bg-quinary)",
      children: [
        /* @__PURE__ */ jsx20("span", { className: "flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-(--ui-bg-secondary)", children: item.cover && isImage(item.cover.mime) ? /* @__PURE__ */ jsx20("img", { src: assetSrc(item.cover.url), alt: "", className: "max-h-full max-w-full object-contain" }) : /* @__PURE__ */ jsx20(Codicon3, { name: "symbol-color", size: "1.25rem" }) }),
        /* @__PURE__ */ jsx20("span", { className: "truncate text-sm font-medium", children: item.title }),
        /* @__PURE__ */ jsxs19("span", { className: "truncate text-xs text-(--ui-text-secondary)", children: [
          kindLabel(item.kind),
          item.sizes.length > 0 ? ` \xB7 ${item.sizes.join("\u3001")}` : ""
        ] }),
        /* @__PURE__ */ jsxs19("span", { className: "flex flex-wrap items-center gap-2 text-[0.6875rem]", children: [
          /* @__PURE__ */ jsxs19("span", { className: item.overdue ? "text-destructive" : "text-(--ui-text-tertiary)", children: [
            item.due_date || "\u672A\u8BBE\u622A\u6B62\u65E5",
            item.overdue ? " \xB7 \u903E\u671F" : ""
          ] }),
          /* @__PURE__ */ jsx20("span", { className: "text-(--ui-text-tertiary)", children: item.assignee || "\u672A\u6307\u5B9A" })
        ] }),
        /* @__PURE__ */ jsxs19("span", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx20(Badge6, { variant: statusVariant(item.status), children: statusLabel(item.status) }),
          /* @__PURE__ */ jsxs19("span", { className: "text-[0.6875rem] text-(--ui-text-tertiary)", children: [
            item.candidate_count,
            " \u5F20\u5019\u9009"
          ] }),
          /* @__PURE__ */ jsxs19("span", { className: "text-[0.6875rem] text-(--ui-text-tertiary)", children: [
            item.open_comments,
            " \u6761\u672A\u89E3\u51B3"
          ] })
        ] })
      ]
    }
  ) });
}
function LibraryTab({ brands, campaigns }) {
  const [brand, setBrand] = useState17("all");
  const [kind, setKind] = useState17("all");
  const [campaignId, setCampaignId] = useState17("all");
  const [codeInput, setCodeInput] = useState17("");
  const [code, setCode] = useState17("");
  const [qInput, setQInput] = useState17("");
  const [q, setQ] = useState17("");
  const [uploading, setUploading] = useState17(false);
  const [opened, setOpened] = useState17(null);
  useEffect15(() => {
    const timer9 = window.setTimeout(() => {
      setCode(codeInput.trim());
      setQ(qInput.trim());
    }, 300);
    return () => window.clearTimeout(timer9);
  }, [codeInput, qInput]);
  const list = useQuery(
    () => listLibraryAssets({
      brand: brand === "all" ? void 0 : brand,
      kind: kind === "all" ? void 0 : kind,
      campaign_id: campaignId === "all" ? void 0 : Number(campaignId),
      product_code: code || void 0,
      q: q || void 0
    }),
    [brand, kind, campaignId, code, q]
  );
  return /* @__PURE__ */ jsxs19("div", { className: "flex min-w-0 flex-col gap-3", children: [
    /* @__PURE__ */ jsx20(HeaderActions, { children: /* @__PURE__ */ jsx20(Button16, { size: "sm", onClick: () => setUploading(true), children: "\u4E0A\u4F20\u7D20\u6750" }) }),
    /* @__PURE__ */ jsxs19("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx20(FilterSelect2, { label: "\u54C1\u724C", value: brand, onChange: setBrand, options: brands.map((item) => ({ id: item, label: item })) }),
      /* @__PURE__ */ jsx20(FilterSelect2, { label: "\u7C7B\u578B", value: kind, onChange: setKind, options: KINDS.map((item) => ({ id: item.id, label: item.label })) }),
      /* @__PURE__ */ jsx20(
        FilterSelect2,
        {
          label: "\u6D3B\u52A8",
          value: campaignId,
          onChange: setCampaignId,
          options: campaigns.map((item) => ({ id: String(item.id), label: item.name }))
        }
      ),
      /* @__PURE__ */ jsx20(
        Input11,
        {
          "aria-label": "\u5546\u54C1\u7F16\u7801",
          value: codeInput,
          placeholder: "\u5546\u54C1\u7F16\u7801",
          className: "w-32 max-w-full",
          onChange: (event) => setCodeInput(event.target.value)
        }
      ),
      /* @__PURE__ */ jsx20(
        Input11,
        {
          "aria-label": "\u641C\u7D22\u7D20\u6750",
          value: qInput,
          placeholder: "\u6587\u4EF6\u540D\u3001\u6807\u7B7E\u3001\u5907\u6CE8",
          className: "w-44 max-w-full",
          onChange: (event) => setQInput(event.target.value)
        }
      )
    ] }),
    list.error ? /* @__PURE__ */ jsx20(
      ErrorState7,
      {
        title: isOfflineError(list.error) ? "\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1" : "\u7D20\u6750\u52A0\u8F7D\u5931\u8D25",
        description: errorText(list.error, "\u8BF7\u91CD\u8BD5"),
        children: /* @__PURE__ */ jsx20(Button16, { size: "sm", variant: "outline", onClick: list.reload, children: "\u91CD\u8BD5" })
      }
    ) : list.loading && !list.data ? /* @__PURE__ */ jsxs19("div", { className: "flex items-center gap-2 text-xs text-(--ui-text-tertiary)", children: [
      /* @__PURE__ */ jsx20(Loader7, {}),
      "\u6B63\u5728\u8BFB\u53D6\u7D20\u6750"
    ] }) : /* @__PURE__ */ jsx20(AssetGrid, { assets: list.data ?? [], onOpen: setOpened, empty: "\u7D20\u6750\u5E93\u8FD8\u6CA1\u6709\u56FE\u7247" }),
    uploading ? /* @__PURE__ */ jsx20(
      LibraryUpload,
      {
        brands,
        onClose: () => setUploading(false),
        onDone: () => {
          setUploading(false);
          list.reload();
        }
      }
    ) : null,
    /* @__PURE__ */ jsx20(
      AssetDrawer,
      {
        asset: opened,
        onClose: () => setOpened(null),
        onChanged: (next) => {
          setOpened(next);
          list.reload();
        },
        onDeleted: () => {
          setOpened(null);
          list.reload();
        }
      }
    )
  ] });
}
function LibraryUpload({
  brands,
  onClose,
  onDone
}) {
  const [files, setFiles] = useState17([]);
  const [brand, setBrand] = useState17(brands[0] ?? "");
  const [productCode, setProductCode] = useState17("");
  const [tags, setTags] = useState17("");
  const [busy, setBusy] = useState17(false);
  const [error, setError] = useState17(null);
  const submit = async () => {
    if (files.length === 0) {
      setError("\u8BF7\u5148\u9009\u62E9\u6587\u4EF6");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      for (const file of files) {
        await uploadLibraryAsset(file, {
          brand: brand.trim() || void 0,
          product_code: productCode.trim() || void 0,
          tags: tags.trim() || void 0,
          by: loadActor().trim() || null
        });
      }
      onDone();
    } catch (reason) {
      setError(errorText(reason, "\u6CA1\u6709\u4E0A\u4F20"));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxs19("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx20("button", { type: "button", "aria-label": "\u5173\u95ED\u6D6E\u5C42", className: "absolute inset-0 bg-black/22", onClick: onClose }),
    /* @__PURE__ */ jsxs19("div", { role: "dialog", className: "relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col gap-3 overflow-y-auto rounded-lg border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) p-4", children: [
      /* @__PURE__ */ jsx20("h2", { className: "text-sm font-medium", children: "\u4E0A\u4F20\u7D20\u6750" }),
      /* @__PURE__ */ jsx20(FileDrop, { label: "\u628A\u6587\u4EF6\u62D6\u8FDB\u6765\uFF0C\u53EF\u4EE5\u4E00\u6B21\u591A\u5F20", files, onFiles: (next) => setFiles((current) => [...current, ...next]) }),
      files.length > 0 ? /* @__PURE__ */ jsx20("ul", { className: "text-xs text-(--ui-text-tertiary)", children: files.map((file) => /* @__PURE__ */ jsx20("li", { children: file.name }, `${file.name}-${file.size}-${file.lastModified}`)) }) : null,
      /* @__PURE__ */ jsxs19("label", { className: "flex flex-col gap-1 text-xs", children: [
        "\u54C1\u724C",
        brands.length > 0 ? /* @__PURE__ */ jsxs19(Select9, { value: brand, onValueChange: setBrand, children: [
          /* @__PURE__ */ jsx20(SelectTrigger9, { "aria-label": "\u7D20\u6750\u54C1\u724C", children: /* @__PURE__ */ jsx20(SelectValue9, {}) }),
          /* @__PURE__ */ jsx20(SelectContent9, { children: brands.map((item) => /* @__PURE__ */ jsx20(SelectItem9, { value: item, children: item }, item)) })
        ] }) : /* @__PURE__ */ jsx20(Input11, { "aria-label": "\u7D20\u6750\u54C1\u724C", value: brand, onChange: (event) => setBrand(event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs19("label", { className: "flex flex-col gap-1 text-xs", children: [
        "\u5546\u54C1\u7F16\u7801",
        /* @__PURE__ */ jsx20(Input11, { "aria-label": "\u7D20\u6750\u5546\u54C1\u7F16\u7801", value: productCode, onChange: (event) => setProductCode(event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs19("label", { className: "flex flex-col gap-1 text-xs", children: [
        "\u6807\u7B7E",
        /* @__PURE__ */ jsx20(Input11, { "aria-label": "\u6807\u7B7E", value: tags, placeholder: "\u7528\u9017\u53F7\u5206\u9694", onChange: (event) => setTags(event.target.value) })
      ] }),
      error ? /* @__PURE__ */ jsx20("p", { className: "text-xs text-destructive", children: error }) : null,
      /* @__PURE__ */ jsxs19("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx20(Button16, { size: "sm", variant: "outline", disabled: busy, onClick: onClose, children: "\u53D6\u6D88" }),
        /* @__PURE__ */ jsx20(Button16, { size: "sm", disabled: busy, onClick: () => void submit(), children: busy ? "\u6B63\u5728\u4E0A\u4F20" : "\u4E0A\u4F20" })
      ] })
    ] })
  ] });
}
function AssetDrawer({
  asset,
  onClose,
  onChanged,
  onDeleted
}) {
  const [tags, setTags] = useState17("");
  const [note, setNote] = useState17("");
  const [busy, setBusy] = useState17(false);
  const [error, setError] = useState17(null);
  const [confirming, setConfirming] = useState17(false);
  useEffect15(() => {
    setTags(asset?.tags.join(", ") ?? "");
    setNote(asset?.note ?? "");
    setError(null);
  }, [asset]);
  const save = async () => {
    if (!asset) return;
    setBusy(true);
    setError(null);
    try {
      const next = await patchAsset(asset.id, {
        tags: tags.split(/[,，]/).map((item) => item.trim()).filter(Boolean),
        note: note.trim() || null
      });
      onChanged(next);
    } catch (reason) {
      setError(errorText(reason, "\u6CA1\u6709\u4FDD\u5B58"));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxs19(Fragment8, { children: [
    /* @__PURE__ */ jsx20(
      SideDrawer,
      {
        open: asset != null,
        title: asset?.file_name ?? "\u7D20\u6750",
        description: asset ? `${asset.width && asset.height ? `${asset.width}\xD7${asset.height} \xB7 ` : ""}${asset.role === "final" ? "\u5B9A\u7A3F" : "\u7D20\u6750\u5E93"}` : void 0,
        onClose,
        footer: asset ? /* @__PURE__ */ jsxs19(Fragment8, { children: [
          /* @__PURE__ */ jsx20(Button16, { size: "sm", variant: "outline", disabled: busy, onClick: () => void save(), children: "\u4FDD\u5B58" }),
          asset.role === "library" ? /* @__PURE__ */ jsx20(Button16, { size: "sm", variant: "outline", disabled: busy, onClick: () => setConfirming(true), children: "\u5220\u9664" }) : null
        ] }) : null,
        children: asset ? /* @__PURE__ */ jsxs19("div", { className: "flex flex-col gap-3 text-xs", children: [
          /* @__PURE__ */ jsx20("span", { className: "flex h-64 items-center justify-center overflow-hidden rounded-md bg-(--ui-bg-secondary)", children: isImage(asset.mime) ? /* @__PURE__ */ jsx20("img", { src: assetSrc(asset.url), alt: asset.file_name, className: "max-h-full max-w-full object-contain" }) : /* @__PURE__ */ jsx20(Codicon3, { name: "library", size: "1.5rem" }) }),
          /* @__PURE__ */ jsxs19("p", { className: "text-(--ui-text-tertiary)", children: [
            asset.brand || "\u672A\u586B\u54C1\u724C",
            asset.product_code ? ` \xB7 ${asset.product_code}` : ""
          ] }),
          /* @__PURE__ */ jsx20("a", { className: "text-(--ui-accent)", href: assetDownloadUrl(asset.url), children: "\u4E0B\u8F7D\u539F\u56FE" }),
          /* @__PURE__ */ jsxs19("label", { className: "flex flex-col gap-1", children: [
            "\u6807\u7B7E",
            /* @__PURE__ */ jsx20(Input11, { "aria-label": "\u7F16\u8F91\u6807\u7B7E", value: tags, placeholder: "\u7528\u9017\u53F7\u5206\u9694", onChange: (event) => setTags(event.target.value) })
          ] }),
          /* @__PURE__ */ jsxs19("label", { className: "flex flex-col gap-1", children: [
            "\u5907\u6CE8",
            /* @__PURE__ */ jsx20(Textarea10, { "aria-label": "\u5907\u6CE8", rows: 3, value: note, onChange: (event) => setNote(event.target.value) })
          ] }),
          error ? /* @__PURE__ */ jsx20("p", { className: "text-destructive", children: error }) : null
        ] }) : null
      }
    ),
    /* @__PURE__ */ jsx20(
      ConfirmDialog5,
      {
        open: confirming,
        title: "\u5220\u9664\u8FD9\u5F20\u7D20\u6750\uFF1F",
        confirmLabel: "\u5220\u9664",
        onClose: () => setConfirming(false),
        onConfirm: async () => {
          if (!asset) return;
          await deleteAsset(asset.id);
          setConfirming(false);
          onDeleted();
        }
      }
    )
  ] });
}
function FilterSelect2({
  label,
  value,
  onChange,
  options
}) {
  return /* @__PURE__ */ jsxs19(Select9, { value, onValueChange: onChange, children: [
    /* @__PURE__ */ jsx20(SelectTrigger9, { "aria-label": label, className: "w-36 max-w-full", children: /* @__PURE__ */ jsx20(SelectValue9, { placeholder: `\u5168\u90E8${label}` }) }),
    /* @__PURE__ */ jsxs19(SelectContent9, { children: [
      /* @__PURE__ */ jsxs19(SelectItem9, { value: "all", children: [
        "\u5168\u90E8",
        label
      ] }),
      options.map((item) => /* @__PURE__ */ jsx20(SelectItem9, { value: item.id, children: item.label }, item.id))
    ] })
  ] });
}

// src/pages/video/VideoPage.tsx
import { useEffect as useEffect18, useState as useState21 } from "react";
import {
  Badge as Badge8,
  Button as Button20,
  Dialog as Dialog6,
  DialogContent as DialogContent6,
  DialogFooter as DialogFooter4,
  DialogHeader as DialogHeader6,
  DialogTitle as DialogTitle6,
  EmptyState as EmptyState5,
  ErrorState as ErrorState10,
  Input as Input14,
  Loader as Loader10,
  SegmentedControl as SegmentedControl7,
  Select as Select10,
  SelectContent as SelectContent10,
  SelectItem as SelectItem10,
  SelectTrigger as SelectTrigger10,
  SelectValue as SelectValue10,
  Textarea as Textarea13
} from "@hermes/plugin-sdk";

// src/pages/video/ScriptEditor.tsx
import { useEffect as useEffect17, useRef as useRef8, useState as useState20 } from "react";
import {
  Badge as Badge7,
  Button as Button19,
  ConfirmDialog as ConfirmDialog6,
  Dialog as Dialog5,
  DialogContent as DialogContent5,
  DialogHeader as DialogHeader5,
  DialogTitle as DialogTitle5,
  ErrorState as ErrorState9,
  Input as Input13,
  Loader as Loader9,
  Textarea as Textarea12
} from "@hermes/plugin-sdk";

// src/pages/video/Preview.tsx
import { useEffect as useEffect16, useRef as useRef6, useState as useState18 } from "react";
import { Button as Button17, ErrorState as ErrorState8, Loader as Loader8 } from "@hermes/plugin-sdk";
import { jsx as jsx21, jsxs as jsxs20 } from "react/jsx-runtime";
function Preview({
  projectId,
  dirty,
  onBack
}) {
  const query = useQuery(() => getTimeline(projectId), [projectId]);
  if (query.error && !query.data) {
    return /* @__PURE__ */ jsxs20(ErrorState8, { title: "\u65F6\u95F4\u7EBF\u52A0\u8F7D\u5931\u8D25", description: errorText2(query.error, "\u8BF7\u91CD\u8BD5"), children: [
      /* @__PURE__ */ jsx21(Button17, { size: "sm", variant: "outline", onClick: onBack, children: "\u8FD4\u56DE" }),
      /* @__PURE__ */ jsx21(Button17, { size: "sm", variant: "outline", onClick: query.reload, children: "\u91CD\u8BD5" })
    ] });
  }
  if (!query.data) {
    return /* @__PURE__ */ jsxs20("div", { className: "flex items-center gap-2 py-6 text-xs text-(--ui-text-tertiary)", children: [
      /* @__PURE__ */ jsx21(Loader8, {}),
      "\u6B63\u5728\u8BFB\u53D6\u65F6\u95F4\u7EBF"
    ] });
  }
  return /* @__PURE__ */ jsxs20("div", { className: "flex flex-col gap-3", children: [
    /* @__PURE__ */ jsxs20("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx21(Button17, { size: "sm", variant: "ghost", onClick: onBack, children: "\u8FD4\u56DE" }),
      /* @__PURE__ */ jsx21("h2", { className: "text-sm font-medium", children: query.data.title }),
      /* @__PURE__ */ jsxs20("span", { className: "text-xs text-(--ui-text-tertiary)", children: [
        "\u603B\u957F ",
        formatSeconds(query.data.duration)
      ] })
    ] }),
    dirty ? /* @__PURE__ */ jsx21("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u6709\u672A\u4FDD\u5B58\u7684\u5206\u955C\uFF0C\u9884\u89C8\u7684\u662F\u5DF2\u4FDD\u5B58\u7684\u7248\u672C\u3002" }) : null,
    /* @__PURE__ */ jsx21(Player, { timeline: query.data })
  ] });
}
function Player({ timeline }) {
  const [playing, setPlaying] = useState18(false);
  const [time, setTime] = useState18(0);
  const timeRef = useRef6(0);
  const audioRef = useRef6(null);
  const videoRef = useRef6(null);
  const shot = shotAt(timeline.shots, time);
  const shotSeq = shot?.seq ?? 0;
  useEffect16(() => {
    if (!playing) {
      audioRef.current?.pause();
      videoRef.current?.pause();
      return;
    }
    const origin = timeRef.current;
    const started9 = performance.now();
    let frame = 0;
    const tick = (now) => {
      const next = origin + (now - started9) / 1e3;
      if (next >= timeline.duration) {
        timeRef.current = timeline.duration;
        setTime(timeline.duration);
        setPlaying(false);
        return;
      }
      timeRef.current = next;
      setTime(next);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const offset = Math.max(0, origin - (shot?.start ?? 0));
    if (audioRef.current) audioRef.current.currentTime = offset;
    if (videoRef.current) videoRef.current.currentTime = offset;
    void audioRef.current?.play();
    void videoRef.current?.play();
    return () => cancelAnimationFrame(frame);
  }, [playing, shotSeq, timeline.duration, shot?.start]);
  const seek = (next) => {
    const clamped = Math.min(timeline.duration, Math.max(0, next));
    timeRef.current = clamped;
    setTime(clamped);
    setPlaying(false);
  };
  return /* @__PURE__ */ jsxs20("div", { className: "flex flex-col items-center gap-3", children: [
    /* @__PURE__ */ jsxs20(
      "div",
      {
        className: "relative overflow-hidden bg-(--ui-bg-secondary)",
        style: { aspectRatio: aspectRatio(timeline.aspect), height: "min(68vh, 32rem)", maxWidth: "100%" },
        children: [
          shot?.media && isImage2(shot.media.mime) ? /* @__PURE__ */ jsx21("img", { src: mediaSrc(shot.media.url), alt: "", className: "h-full w-full object-cover" }) : shot?.media && isVideo(shot.media.mime) ? /* @__PURE__ */ jsx21("video", { ref: videoRef, src: mediaSrc(shot.media.url), muted: true, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx21("div", { className: "flex h-full w-full items-center justify-center px-4 text-center text-xs text-(--ui-text-tertiary)", children: shot ? `\u7B2C ${shot.seq} \u955C\u8FD8\u6CA1\u6709\u753B\u9762` : "\u6CA1\u6709\u955C\u5934" }),
          shot?.subtitle ? /* @__PURE__ */ jsx21("p", { className: "absolute inset-x-2 bottom-3 rounded-md bg-(--ui-bg-editor)/80 px-2 py-1 text-center text-sm text-(--ui-text-primary)", children: shot.subtitle }) : null,
          shot?.voice ? /* @__PURE__ */ jsx21("audio", { ref: audioRef, src: mediaSrc(shot.voice.url) }) : null
        ]
      }
    ),
    /* @__PURE__ */ jsxs20("div", { className: "flex w-full max-w-xl items-center gap-2", children: [
      /* @__PURE__ */ jsx21(
        Button17,
        {
          size: "sm",
          onClick: () => {
            const atEnd = timeRef.current >= timeline.duration;
            if (atEnd) {
              timeRef.current = 0;
              setTime(0);
            }
            if (playing) {
              audioRef.current?.pause();
              videoRef.current?.pause();
              setPlaying(false);
              return;
            }
            const offset = Math.max(0, (atEnd ? 0 : timeRef.current) - (shot?.start ?? 0));
            if (audioRef.current) {
              audioRef.current.currentTime = offset;
              void audioRef.current.play();
            }
            if (videoRef.current) {
              videoRef.current.currentTime = offset;
              void videoRef.current.play();
            }
            setPlaying(true);
          },
          children: playing ? "\u6682\u505C" : "\u64AD\u653E"
        }
      ),
      /* @__PURE__ */ jsxs20("span", { className: "text-xs tabular-nums text-(--ui-text-secondary)", children: [
        formatSeconds(time),
        " / ",
        formatSeconds(timeline.duration),
        shot ? ` \xB7 \u7B2C ${shot.seq} \u955C` : ""
      ] })
    ] }),
    /* @__PURE__ */ jsx21("div", { className: "flex h-6 w-full max-w-xl gap-0.5", children: timeline.shots.map((item) => /* @__PURE__ */ jsx21(
      "button",
      {
        type: "button",
        "aria-label": `\u7B2C ${item.seq} \u955C`,
        className: item.seq === shot?.seq ? "min-w-2 rounded-sm bg-(--ui-accent)" : "min-w-2 rounded-sm bg-(--ui-bg-quinary)",
        style: { flexGrow: Math.max(item.duration, 0.1) },
        onClick: () => seek(item.start)
      },
      item.seq
    )) })
  ] });
}
function shotAt(shots, time) {
  if (shots.length === 0) return null;
  return shots.find((item) => time >= item.start && time < item.end) ?? shots[shots.length - 1];
}

// src/pages/video/ShotRow.tsx
import { useRef as useRef7, useState as useState19 } from "react";
import { Button as Button18, Input as Input12, Textarea as Textarea11 } from "@hermes/plugin-sdk";
import { Fragment as Fragment9, jsx as jsx22, jsxs as jsxs21 } from "react/jsx-runtime";
function ShotRow({
  seq,
  shot,
  aspect,
  readOnly,
  onChange,
  onInsert,
  onDelete,
  onDragStart,
  onDrop,
  onChooseVisual,
  onUploadVoice
}) {
  const voiceInput = useRef7(null);
  const audio = useRef7(null);
  const [playing, setPlaying] = useState19(false);
  const actual = shot.voiceSeconds != null ? Math.max(shot.duration, shot.voiceSeconds) : shot.duration;
  const stretched = shot.voiceSeconds != null && shot.voiceSeconds > shot.duration + 0.05;
  const estimate = estimateSeconds(shot.voiceover);
  return /* @__PURE__ */ jsxs21(
    "tr",
    {
      className: "border-b border-(--ui-stroke-secondary) align-top",
      onDragOver: (event) => {
        if (!readOnly) event.preventDefault();
      },
      onDrop: (event) => {
        event.preventDefault();
        onDrop(event.dataTransfer.getData("text/plain"));
      },
      children: [
        /* @__PURE__ */ jsx22("td", { className: "px-1 py-1.5", children: /* @__PURE__ */ jsx22(
          "button",
          {
            type: "button",
            draggable: !readOnly,
            "aria-label": `\u62D6\u52A8\u7B2C ${seq} \u955C`,
            className: "cursor-grab px-1 text-xs text-(--ui-text-secondary)",
            onDragStart: (event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", shot.key);
              onDragStart();
            },
            children: seq
          }
        ) }),
        /* @__PURE__ */ jsx22("td", { className: "px-1 py-1.5", children: /* @__PURE__ */ jsx22(
          "button",
          {
            type: "button",
            "aria-label": `\u7B2C ${seq} \u955C\u753B\u9762`,
            disabled: readOnly,
            className: "flex items-center justify-center overflow-hidden bg-(--ui-bg-secondary) disabled:cursor-default",
            style: { width: 48, aspectRatio: aspectRatio(aspect) },
            onClick: onChooseVisual,
            children: shot.media && isImage2(shot.media.mime) ? /* @__PURE__ */ jsx22("img", { src: mediaSrc(shot.media.url), alt: "", className: "h-full w-full object-cover" }) : shot.media && isVideo(shot.media.mime) ? /* @__PURE__ */ jsx22("video", { src: mediaSrc(shot.media.url), muted: true, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx22("span", { className: "text-[0.625rem] text-(--ui-text-tertiary)", children: "\u6362\u56FE" })
          }
        ) }),
        /* @__PURE__ */ jsx22("td", { className: "min-w-0 px-1 py-1.5", children: /* @__PURE__ */ jsx22(
          Textarea11,
          {
            className: "min-w-0",
            "aria-label": `\u7B2C ${seq} \u955C\u753B\u9762\u8BF4\u660E`,
            rows: 2,
            value: shot.visual,
            readOnly,
            onChange: (event) => onChange({ visual: event.target.value })
          }
        ) }),
        /* @__PURE__ */ jsxs21("td", { className: "min-w-0 px-1 py-1.5", children: [
          /* @__PURE__ */ jsx22(
            Textarea11,
            {
              className: "min-w-0",
              "aria-label": `\u7B2C ${seq} \u955C\u53E3\u64AD`,
              rows: 2,
              value: shot.voiceover,
              readOnly,
              onChange: (event) => onChange({ voiceover: event.target.value })
            }
          ),
          shot.voiceover ? /* @__PURE__ */ jsxs21("p", { className: "mt-0.5 text-[0.6875rem] text-(--ui-text-tertiary)", children: [
            "\u7EA6 ",
            formatSeconds(estimate)
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxs21("td", { className: "min-w-0 px-1 py-1.5", children: [
          /* @__PURE__ */ jsx22(
            Textarea11,
            {
              className: "min-w-0",
              "aria-label": `\u7B2C ${seq} \u955C\u5B57\u5E55`,
              rows: 2,
              value: shot.subtitle ?? "",
              placeholder: shot.subtitle === "" ? "\u4E0D\u8981\u5B57\u5E55" : "\u540C\u53E3\u64AD",
              readOnly: readOnly || shot.subtitle === "",
              onChange: (event) => onChange({ subtitle: event.target.value })
            }
          ),
          readOnly ? null : /* @__PURE__ */ jsx22("div", { className: "mt-0.5 flex gap-2", children: shot.subtitle === "" ? /* @__PURE__ */ jsx22("button", { type: "button", className: "text-[0.6875rem] text-(--ui-text-secondary)", onClick: () => onChange({ subtitle: null }), children: "\u6539\u56DE\u540C\u53E3\u64AD" }) : /* @__PURE__ */ jsxs21(Fragment9, { children: [
            shot.subtitle !== null ? /* @__PURE__ */ jsx22("button", { type: "button", className: "text-[0.6875rem] text-(--ui-text-secondary)", onClick: () => onChange({ subtitle: null }), children: "\u6539\u56DE\u540C\u53E3\u64AD" }) : null,
            /* @__PURE__ */ jsx22("button", { type: "button", className: "text-[0.6875rem] text-(--ui-text-secondary)", onClick: () => onChange({ subtitle: "" }), children: "\u4E0D\u8981\u5B57\u5E55" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs21("td", { className: "min-w-0 px-1 py-1.5", children: [
          /* @__PURE__ */ jsx22(
            Input12,
            {
              "aria-label": `\u7B2C ${seq} \u955C\u65F6\u957F`,
              type: "number",
              min: 0.1,
              max: 60,
              step: 0.1,
              value: shot.duration,
              readOnly,
              onChange: (event) => {
                const next = Number(event.target.value);
                if (Number.isFinite(next)) onChange({ duration: next });
              }
            }
          ),
          /* @__PURE__ */ jsxs21("p", { className: "mt-0.5 text-[0.6875rem] text-(--ui-text-tertiary)", children: [
            "\u5B9E\u9645 ",
            formatSeconds(actual)
          ] }),
          stretched ? /* @__PURE__ */ jsx22("p", { className: "text-[0.6875rem] text-(--ui-text-secondary)", children: "\u6309\u914D\u97F3\u62C9\u957F" }) : null
        ] }),
        /* @__PURE__ */ jsxs21("td", { className: "px-1 py-1.5", children: [
          /* @__PURE__ */ jsxs21("div", { className: "flex flex-wrap items-center gap-1", children: [
            /* @__PURE__ */ jsx22(
              Button18,
              {
                size: "xs",
                variant: "outline",
                disabled: !shot.voice,
                onClick: () => {
                  const node = audio.current;
                  if (!node) return;
                  if (playing) {
                    node.pause();
                    setPlaying(false);
                    return;
                  }
                  void node.play();
                  setPlaying(true);
                },
                children: playing ? "\u6682\u505C" : "\u64AD\u653E"
              }
            ),
            readOnly ? null : /* @__PURE__ */ jsx22(Button18, { size: "xs", variant: "outline", onClick: () => voiceInput.current?.click(), children: "\u4E0A\u4F20" })
          ] }),
          shot.voice ? /* @__PURE__ */ jsx22("p", { className: "mt-0.5 max-w-24 truncate text-[0.6875rem] text-(--ui-text-tertiary)", children: shot.voice.file_name }) : null,
          shot.voice ? /* @__PURE__ */ jsx22(
            "audio",
            {
              ref: audio,
              src: mediaSrc(shot.voice.url),
              onEnded: () => setPlaying(false),
              onPause: () => setPlaying(false)
            }
          ) : null,
          /* @__PURE__ */ jsx22(
            "input",
            {
              ref: voiceInput,
              type: "file",
              accept: "audio/*",
              "aria-label": `\u7B2C ${seq} \u955C\u914D\u97F3`,
              className: "absolute h-px w-px opacity-0",
              onChange: (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) onUploadVoice(file);
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsx22("td", { className: "min-w-0 px-1 py-1.5", children: /* @__PURE__ */ jsx22(
          Textarea11,
          {
            className: "min-w-0",
            "aria-label": `\u7B2C ${seq} \u955C\u5907\u6CE8`,
            rows: 2,
            value: shot.note,
            readOnly,
            onChange: (event) => onChange({ note: event.target.value })
          }
        ) }),
        /* @__PURE__ */ jsx22("td", { className: "px-1 py-1.5", children: readOnly ? null : /* @__PURE__ */ jsxs21("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx22(Button18, { size: "xs", variant: "ghost", onClick: onInsert, children: "\u63D2\u5165" }),
          /* @__PURE__ */ jsx22(Button18, { size: "xs", variant: "ghost", onClick: onDelete, children: "\u5220\u9664" })
        ] }) })
      ]
    }
  );
}

// src/pages/video/ScriptEditor.tsx
import { Fragment as Fragment10, jsx as jsx23, jsxs as jsxs22 } from "react/jsx-runtime";
function ScriptEditor({ id, onBack }) {
  const root = useRef8(null);
  const query = useQuery(() => getVideoProject(id), [id]);
  const [project, setProject] = useState20(null);
  const [drafts, setDrafts] = useState20([]);
  const [saved, setSaved] = useState20("");
  const [narrow, setNarrow] = useState20(false);
  const [railWidth, setRailWidth] = useState20(260);
  const [actor, setActor] = useState20(loadActor);
  const [busy, setBusy] = useState20(false);
  const [error, setError] = useState20(null);
  const [submitError, setSubmitError] = useState20(null);
  const [leaving, setLeaving] = useState20(false);
  const [rejecting, setRejecting] = useState20(false);
  const [rejectNote, setRejectNote] = useState20("");
  const [rejectError, setRejectError] = useState20(null);
  const [canceling, setCanceling] = useState20(false);
  const [previewing, setPreviewing] = useState20(false);
  const [visualKey, setVisualKey] = useState20(null);
  const loaded = useRef8(null);
  const visualInput = useRef8(null);
  const bgmInput = useRef8(null);
  const finalInput = useRef8(null);
  const take = (next) => {
    const rows = toDrafts(next.shots);
    setProject(next);
    setDrafts(rows);
    setSaved(JSON.stringify(toInputs(rows)));
  };
  useEffect17(() => {
    if (!query.data || loaded.current === id) return;
    loaded.current = id;
    take(query.data);
  }, [query.data, id]);
  useEffect17(() => {
    const el = root.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setNarrow((entries[0]?.contentRect.width ?? 0) < 900);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [project]);
  const dirty = JSON.stringify(toInputs(drafts)) !== saved;
  const readOnly = project != null && project.status !== "draft";
  const library = useQuery(() => visualKey && project ? listLibraryAssets({ brand: project.brand }) : Promise.resolve([]), [
    visualKey,
    project?.brand
  ]);
  const run = async (task) => {
    setBusy(true);
    setError(null);
    try {
      const next = await task();
      take(next);
      await refreshVideoNeedsActionCount();
      return next;
    } catch (reason) {
      setError(errorText2(reason, "\u64CD\u4F5C\u5931\u8D25"));
      return null;
    } finally {
      setBusy(false);
    }
  };
  const save = () => {
    for (const shot of drafts) {
      if (!(shot.duration > 0) || shot.duration > 60) {
        setError("\u6BCF\u955C\u65F6\u957F\u8981\u5728 0 \u5230 60 \u79D2\u4E4B\u95F4");
        return;
      }
    }
    void run(() => saveShots(id, toInputs(drafts)));
  };
  const uploadVoice = (key, file) => {
    if (dirty) {
      setError("\u5148\u4FDD\u5B58\u5206\u955C\uFF0C\u518D\u4E0A\u4F20\u914D\u97F3\u3002");
      return;
    }
    const seq = drafts.findIndex((item) => item.key === key) + 1;
    if (seq < 1) return;
    void run(() => uploadShotMedia(id, seq, "voice", file, actor.trim() || null));
  };
  const uploadVisual = (file) => {
    if (!visualKey) return;
    if (dirty) {
      setError("\u5148\u4FDD\u5B58\u5206\u955C\uFF0C\u518D\u4E0A\u4F20\u753B\u9762\u3002");
      return;
    }
    const seq = drafts.findIndex((item) => item.key === visualKey) + 1;
    setVisualKey(null);
    if (seq < 1) return;
    void run(() => uploadShotMedia(id, seq, "visual", file, actor.trim() || null));
  };
  const submit = async () => {
    setSubmitError(null);
    if (dirty) {
      setSubmitError("\u5148\u4FDD\u5B58\u5206\u955C");
      return;
    }
    if (drafts.length === 0) {
      setSubmitError("\u8FD8\u6CA1\u6709\u5206\u955C");
      return;
    }
    setBusy(true);
    try {
      const next = await submitVideo(id, actor.trim() || null);
      take(next);
      await refreshVideoNeedsActionCount();
    } catch (reason) {
      if (reason instanceof ApiError && reason.code === "compliance_failed") setSubmitError(reason.message);
      else setError(errorText2(reason, "\u6CA1\u6709\u9001\u5BA1"));
    } finally {
      setBusy(false);
    }
  };
  const requestBack = () => {
    if (dirty) setLeaving(true);
    else onBack();
  };
  if (query.error && !project) {
    return /* @__PURE__ */ jsx23("div", { className: "flex flex-1 items-center justify-center py-10", children: /* @__PURE__ */ jsxs22(
      ErrorState9,
      {
        title: isOfflineError(query.error) ? "\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1" : "\u89C6\u9891\u52A0\u8F7D\u5931\u8D25",
        description: errorText2(query.error, "\u8BF7\u91CD\u8BD5"),
        children: [
          /* @__PURE__ */ jsx23(Button19, { size: "sm", variant: "outline", onClick: onBack, children: "\u8FD4\u56DE" }),
          /* @__PURE__ */ jsx23(Button19, { size: "sm", variant: "outline", onClick: query.reload, children: "\u91CD\u8BD5" })
        ]
      }
    ) });
  }
  if (!project) {
    return /* @__PURE__ */ jsxs22("div", { className: "flex items-center gap-2 py-6 text-xs text-(--ui-text-tertiary)", children: [
      /* @__PURE__ */ jsx23(Loader9, {}),
      "\u6B63\u5728\u8BFB\u53D6\u89C6\u9891"
    ] });
  }
  const open = project.status === "draft" || project.status === "in_review" || project.status === "approved";
  return /* @__PURE__ */ jsxs22("div", { ref: root, className: "flex w-full min-w-0 max-w-full flex-1 flex-col gap-3 overflow-x-hidden", children: [
    /* @__PURE__ */ jsxs22("div", { className: "flex w-full min-w-0 flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx23(Button19, { size: "sm", variant: "ghost", onClick: requestBack, children: "\u8FD4\u56DE" }),
      /* @__PURE__ */ jsx23("h2", { className: "min-w-0 truncate text-sm font-medium", children: project.title }),
      /* @__PURE__ */ jsx23(Badge7, { variant: statusVariant2(project.status), children: statusLabel2(project.status) }),
      /* @__PURE__ */ jsxs22("span", { className: "text-xs text-(--ui-text-tertiary)", children: [
        "\u603B\u957F ",
        formatSeconds(project.duration)
      ] }),
      /* @__PURE__ */ jsxs22("div", { className: "ml-auto flex min-w-0 max-w-full flex-wrap items-center justify-end gap-2", children: [
        /* @__PURE__ */ jsx23(Button19, { size: "sm", variant: "outline", disabled: project.shots.length === 0, onClick: () => setPreviewing((value) => !value), children: previewing ? "\u5206\u955C" : "\u9884\u89C8" }),
        project.status === "draft" ? /* @__PURE__ */ jsx23(Button19, { size: "sm", disabled: busy, onClick: () => void submit(), children: "\u9001\u5BA1" }) : null,
        project.status === "in_review" ? /* @__PURE__ */ jsxs22(Fragment10, { children: [
          /* @__PURE__ */ jsx23(Button19, { size: "sm", disabled: busy, onClick: () => void run(() => approveVideo(id, actor.trim() || null)), children: "\u901A\u8FC7" }),
          /* @__PURE__ */ jsx23(Button19, { size: "sm", variant: "outline", disabled: busy, onClick: () => setRejecting(true), children: "\u9000\u56DE" }),
          /* @__PURE__ */ jsx23(Button19, { size: "sm", variant: "outline", disabled: busy, onClick: () => void run(() => withdrawVideo(id, actor.trim() || null)), children: "\u64A4\u56DE" })
        ] }) : null,
        project.status === "approved" || project.status === "done" ? /* @__PURE__ */ jsxs22(Fragment10, { children: [
          /* @__PURE__ */ jsx23(Button19, { size: "sm", variant: "outline", onClick: () => openDownload(packageUrl(id)), children: "\u4E0B\u8F7D\u521D\u526A\u5305" }),
          /* @__PURE__ */ jsx23(Button19, { size: "sm", variant: "outline", onClick: () => openDownload(subtitlesUrl(id)), children: "\u4E0B\u8F7D\u5B57\u5E55" })
        ] }) : null,
        project.status === "approved" ? /* @__PURE__ */ jsx23(Button19, { size: "sm", disabled: busy, onClick: () => finalInput.current?.click(), children: "\u4EA4\u6210\u7247" }) : null,
        open ? /* @__PURE__ */ jsx23(Button19, { size: "sm", variant: "outline", disabled: busy, onClick: () => setCanceling(true), children: "\u53D6\u6D88" }) : null
      ] })
    ] }),
    submitError ? /* @__PURE__ */ jsx23("p", { className: "text-xs text-destructive", children: submitError }) : null,
    error ? /* @__PURE__ */ jsx23("p", { className: "text-xs text-destructive", children: error }) : null,
    previewing ? /* @__PURE__ */ jsx23(Preview, { projectId: id, dirty, onBack: () => setPreviewing(false) }) : /* @__PURE__ */ jsxs22("div", { className: narrow ? "flex w-full min-w-0 flex-col gap-4" : "flex w-full min-w-0 items-start", children: [
      /* @__PURE__ */ jsxs22("div", { className: "flex min-w-0 flex-1 flex-col gap-2", children: [
        /* @__PURE__ */ jsx23("div", { className: "w-full min-w-0 overflow-x-auto", children: /* @__PURE__ */ jsxs22("table", { className: "w-full min-w-[42rem] table-fixed border-collapse text-xs", children: [
          /* @__PURE__ */ jsxs22("colgroup", { children: [
            /* @__PURE__ */ jsx23("col", { className: "w-10" }),
            /* @__PURE__ */ jsx23("col", { className: "w-14" }),
            /* @__PURE__ */ jsx23("col", {}),
            /* @__PURE__ */ jsx23("col", {}),
            /* @__PURE__ */ jsx23("col", {}),
            /* @__PURE__ */ jsx23("col", { className: "w-[4.5rem]" }),
            /* @__PURE__ */ jsx23("col", { className: "w-28" }),
            /* @__PURE__ */ jsx23("col", {}),
            /* @__PURE__ */ jsx23("col", { className: "w-14" })
          ] }),
          /* @__PURE__ */ jsx23("thead", { children: /* @__PURE__ */ jsxs22("tr", { className: "border-b border-(--ui-stroke-secondary) text-left text-(--ui-text-tertiary)", children: [
            /* @__PURE__ */ jsx23("th", { className: "px-1 py-1 font-medium", children: "\u955C\u53F7" }),
            /* @__PURE__ */ jsx23("th", { className: "px-1 py-1 font-medium", children: "\u753B\u9762" }),
            /* @__PURE__ */ jsx23("th", { className: "px-1 py-1 font-medium", children: "\u753B\u9762\u8BF4\u660E" }),
            /* @__PURE__ */ jsx23("th", { className: "px-1 py-1 font-medium", children: "\u53E3\u64AD" }),
            /* @__PURE__ */ jsx23("th", { className: "px-1 py-1 font-medium", children: "\u5B57\u5E55" }),
            /* @__PURE__ */ jsx23("th", { className: "px-1 py-1 font-medium", children: "\u65F6\u957F" }),
            /* @__PURE__ */ jsx23("th", { className: "px-1 py-1 font-medium", children: "\u914D\u97F3" }),
            /* @__PURE__ */ jsx23("th", { className: "px-1 py-1 font-medium", children: "\u5907\u6CE8" }),
            /* @__PURE__ */ jsx23("th", { className: "px-1 py-1 font-medium" })
          ] }) }),
          /* @__PURE__ */ jsx23("tbody", { children: drafts.map((shot, index) => /* @__PURE__ */ jsx23(
            ShotRow,
            {
              seq: index + 1,
              shot,
              aspect: project.aspect,
              readOnly,
              onChange: (patch) => setDrafts((rows) => rows.map((item) => item.key === shot.key ? { ...item, ...patch } : item)),
              onInsert: () => setDrafts((rows) => {
                if (rows.length >= 60) return rows;
                const next = rows.slice();
                next.splice(index + 1, 0, blankShot());
                return next;
              }),
              onDelete: () => setDrafts((rows) => rows.filter((item) => item.key !== shot.key)),
              onDragStart: () => void 0,
              onDrop: (fromKey) => {
                if (!fromKey || fromKey === shot.key) return;
                setDrafts((rows) => moveShot(rows, fromKey, shot.key));
              },
              onChooseVisual: () => setVisualKey(shot.key),
              onUploadVoice: (file) => uploadVoice(shot.key, file)
            },
            shot.key
          )) })
        ] }) }),
        drafts.length === 0 ? /* @__PURE__ */ jsx23("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD8\u6CA1\u6709\u5206\u955C\u3002" }) : null,
        readOnly ? null : /* @__PURE__ */ jsxs22("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx23(
            Button19,
            {
              size: "sm",
              variant: "outline",
              disabled: drafts.length >= 60,
              onClick: () => setDrafts((rows) => [...rows, blankShot()]),
              children: "\u52A0\u4E00\u955C"
            }
          ),
          /* @__PURE__ */ jsx23(Button19, { size: "sm", disabled: !dirty || busy, onClick: save, children: "\u4FDD\u5B58\u5206\u955C" }),
          dirty ? /* @__PURE__ */ jsx23("span", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD8\u6709\u6CA1\u4FDD\u5B58\u7684\u6539\u52A8" }) : null
        ] })
      ] }),
      narrow ? null : /* @__PURE__ */ jsx23(
        "div",
        {
          role: "separator",
          "aria-orientation": "vertical",
          "aria-label": "\u8C03\u6574\u4FA7\u680F\u5BBD\u5EA6",
          className: "mx-2 w-1 shrink-0 cursor-col-resize self-stretch hover:bg-(--ui-accent)",
          onPointerDown: (event) => {
            const startX = event.clientX;
            const startWidth = railWidth;
            const move = (ev) => {
              setRailWidth(Math.min(480, Math.max(220, startWidth - (ev.clientX - startX))));
            };
            const up = () => {
              window.removeEventListener("pointermove", move);
              window.removeEventListener("pointerup", up);
            };
            window.addEventListener("pointermove", move);
            window.addEventListener("pointerup", up);
          }
        }
      ),
      /* @__PURE__ */ jsxs22(
        "aside",
        {
          style: narrow ? void 0 : { width: railWidth },
          className: "flex w-full min-w-0 shrink-0 flex-col gap-3 break-words",
          children: [
            /* @__PURE__ */ jsxs22("section", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx23("h3", { className: "text-xs font-medium", children: "\u5BA1\u6838\u8BB0\u5F55" }),
              project.events.length === 0 ? /* @__PURE__ */ jsx23("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD8\u6CA1\u6709\u8BB0\u5F55\u3002" }) : /* @__PURE__ */ jsx23("ul", { children: project.events.map((event, index) => /* @__PURE__ */ jsxs22(
                "li",
                {
                  className: event.text.includes("\u9000\u56DE") ? "border-b border-(--ui-stroke-secondary) py-1.5 text-xs font-medium text-destructive" : "border-b border-(--ui-stroke-secondary) py-1.5 text-xs text-(--ui-text-tertiary)",
                  children: [
                    event.by || "\u6709\u4EBA",
                    " \xB7 ",
                    event.text
                  ]
                },
                `${event.at}-${index}`
              )) })
            ] }),
            /* @__PURE__ */ jsxs22("section", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx23("h3", { className: "text-xs font-medium", children: "\u8FDD\u7981\u8BCD" }),
              dirty ? /* @__PURE__ */ jsx23("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u4FDD\u5B58\u5206\u955C\u540E\u91CD\u65B0\u68C0\u67E5\u3002" }) : null,
              project.compliance.hits.length === 0 ? /* @__PURE__ */ jsx23("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u6CA1\u6709\u53D1\u73B0\u8FDD\u7981\u8BCD\u3002" }) : /* @__PURE__ */ jsx23("ul", { className: "flex flex-col gap-1", children: project.compliance.hits.map((hit) => /* @__PURE__ */ jsxs22("li", { className: hit.level === "must" ? "text-xs text-destructive" : "text-xs", children: [
                hit.word,
                " \xB7 ",
                hit.level === "must" ? "\u5FC5\u987B\u4FEE\u6539" : "\u63D0\u9192",
                hit.suggestion ? `\uFF0C\u53EF\u6539\u6210\u300C${hit.suggestion}\u300D` : ""
              ] }, `${hit.word}-${hit.level}`)) })
            ] }),
            /* @__PURE__ */ jsxs22("section", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx23("h3", { className: "text-xs font-medium", children: "\u80CC\u666F\u97F3\u4E50" }),
              project.bgm ? /* @__PURE__ */ jsxs22(Fragment10, { children: [
                /* @__PURE__ */ jsx23("p", { className: "truncate text-xs", children: project.bgm.file_name }),
                /* @__PURE__ */ jsx23("audio", { controls: true, src: assetSrc(project.bgm.url), className: "h-8 w-full" })
              ] }) : /* @__PURE__ */ jsx23("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD8\u6CA1\u6709\u80CC\u666F\u97F3\u4E50\u3002" }),
              readOnly ? null : /* @__PURE__ */ jsx23(Button19, { size: "xs", variant: "outline", disabled: busy, onClick: () => bgmInput.current?.click(), children: "\u4E0A\u4F20\u80CC\u666F\u97F3\u4E50" })
            ] }),
            /* @__PURE__ */ jsxs22("label", { className: "flex items-center gap-2 text-xs", children: [
              "\u7F72\u540D",
              /* @__PURE__ */ jsx23(
                Input13,
                {
                  "aria-label": "\u7F72\u540D",
                  value: actor,
                  style: { width: "7rem" },
                  onChange: (event) => {
                    setActor(event.target.value);
                    saveActor(event.target.value);
                  }
                }
              )
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx23(Dialog5, { open: visualKey !== null, onOpenChange: (open2) => {
      if (!open2) setVisualKey(null);
    }, children: /* @__PURE__ */ jsxs22(DialogContent5, { children: [
      /* @__PURE__ */ jsx23(DialogHeader5, { children: /* @__PURE__ */ jsx23(DialogTitle5, { children: "\u6362\u753B\u9762" }) }),
      /* @__PURE__ */ jsx23("div", { className: "flex gap-2", children: /* @__PURE__ */ jsx23(Button19, { size: "sm", variant: "outline", onClick: () => visualInput.current?.click(), children: "\u4E0A\u4F20" }) }),
      /* @__PURE__ */ jsx23("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u6216\u4ECE\u7D20\u6750\u5E93\u9009\u4E00\u5F20\u3002\u7D20\u6750\u5E93\u91CC\u662F\u5B9A\u7A3F\u548C\u76F4\u63A5\u4E0A\u4F20\u7684\u56FE\u3002" }),
      /* @__PURE__ */ jsx23("ul", { className: "grid max-h-64 grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2 overflow-y-auto", children: (library.data ?? []).map((asset) => /* @__PURE__ */ jsx23("li", { children: /* @__PURE__ */ jsxs22(
        "button",
        {
          type: "button",
          className: "flex w-full flex-col gap-1 text-left",
          onClick: () => {
            const media = toMedia(asset);
            setDrafts((rows) => rows.map((item) => item.key === visualKey ? { ...item, media } : item));
            setVisualKey(null);
          },
          children: [
            /* @__PURE__ */ jsx23("span", { className: "flex aspect-square items-center justify-center overflow-hidden bg-(--ui-bg-secondary)", children: isImage2(asset.mime) ? /* @__PURE__ */ jsx23("img", { src: assetSrc(asset.url), alt: "", className: "max-h-full max-w-full object-contain" }) : /* @__PURE__ */ jsx23("span", { className: "px-1 text-[0.625rem] text-(--ui-text-tertiary)", children: asset.file_name }) }),
            /* @__PURE__ */ jsx23("span", { className: "truncate text-[0.6875rem]", children: asset.file_name })
          ]
        }
      ) }, asset.id)) })
    ] }) }),
    rejecting ? /* @__PURE__ */ jsxs22("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
      /* @__PURE__ */ jsx23("button", { type: "button", "aria-label": "\u5173\u95ED\u6D6E\u5C42", className: "absolute inset-0 bg-black/22", onClick: () => setRejecting(false) }),
      /* @__PURE__ */ jsxs22(
        "form",
        {
          className: "relative z-10 flex w-full max-w-md flex-col gap-2 rounded-lg border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) p-4",
          onSubmit: (event) => {
            event.preventDefault();
            if (!rejectNote.trim()) {
              setRejectError("\u8BF7\u586B\u5199\u8981\u6539\u4EC0\u4E48");
              return;
            }
            setRejecting(false);
            void run(() => rejectVideo(id, actor.trim() || null, rejectNote.trim()));
          },
          children: [
            /* @__PURE__ */ jsx23("h2", { className: "text-sm font-medium", children: "\u9000\u56DE" }),
            /* @__PURE__ */ jsx23(Textarea12, { "aria-label": "\u9000\u56DE\u610F\u89C1", rows: 3, value: rejectNote, onChange: (event) => setRejectNote(event.target.value) }),
            rejectError ? /* @__PURE__ */ jsx23("p", { className: "text-xs text-destructive", children: rejectError }) : null,
            /* @__PURE__ */ jsxs22("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsx23(Button19, { type: "button", size: "sm", variant: "outline", onClick: () => setRejecting(false), children: "\u7559\u4E0B" }),
              /* @__PURE__ */ jsx23(Button19, { type: "submit", size: "sm", children: "\u9000\u56DE" })
            ] })
          ]
        }
      )
    ] }) : null,
    /* @__PURE__ */ jsx23(
      ConfirmDialog6,
      {
        open: leaving,
        title: "\u5206\u955C\u8FD8\u6CA1\u4FDD\u5B58",
        description: "\u79BB\u5F00\u540E\uFF0C\u8FD9\u6B21\u6CA1\u4FDD\u5B58\u7684\u6539\u52A8\u4F1A\u4E22\u6389\u3002",
        confirmLabel: "\u79BB\u5F00",
        cancelLabel: "\u7EE7\u7EED\u7F16\u8F91",
        onClose: () => setLeaving(false),
        onConfirm: () => onBack()
      }
    ),
    /* @__PURE__ */ jsx23(
      ConfirmDialog6,
      {
        open: canceling,
        title: "\u53D6\u6D88\u8FD9\u4E2A\u89C6\u9891\uFF1F",
        confirmLabel: "\u53D6\u6D88\u89C6\u9891",
        cancelLabel: "\u7559\u4E0B",
        onClose: () => setCanceling(false),
        onConfirm: async () => {
          await run(() => cancelVideo(id, actor.trim() || null));
        }
      }
    ),
    /* @__PURE__ */ jsx23(
      "input",
      {
        ref: visualInput,
        type: "file",
        accept: "image/*,video/*",
        "aria-label": "\u4E0A\u4F20\u753B\u9762",
        className: "absolute h-px w-px opacity-0",
        onChange: (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) uploadVisual(file);
        }
      }
    ),
    /* @__PURE__ */ jsx23(
      "input",
      {
        ref: bgmInput,
        type: "file",
        accept: "audio/*",
        "aria-label": "\u4E0A\u4F20\u80CC\u666F\u97F3\u4E50",
        className: "absolute h-px w-px opacity-0",
        onChange: (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          if (dirty) {
            setError("\u5148\u4FDD\u5B58\u5206\u955C\uFF0C\u518D\u4E0A\u4F20\u80CC\u666F\u97F3\u4E50\u3002");
            return;
          }
          void run(() => uploadBgm(id, file, actor.trim() || null));
        }
      }
    ),
    /* @__PURE__ */ jsx23(
      "input",
      {
        ref: finalInput,
        type: "file",
        accept: "video/mp4,video/quicktime",
        "aria-label": "\u4EA4\u6210\u7247",
        className: "absolute h-px w-px opacity-0",
        onChange: (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void run(() => uploadFinal(id, file, actor.trim() || null));
        }
      }
    )
  ] });
}
function openDownload(url) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
function blankShot() {
  return {
    key: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    duration: 3,
    visual: "",
    voiceover: "",
    subtitle: null,
    media: null,
    voice: null,
    note: "",
    voiceSeconds: null
  };
}
function toDrafts(shots) {
  return shots.map((shot) => ({
    key: `s-${shot.seq}-${shot.media?.id ?? 0}-${shot.voice?.id ?? 0}-${Math.random().toString(36).slice(2, 6)}`,
    duration: shot.duration,
    visual: shot.visual ?? "",
    voiceover: shot.voiceover ?? "",
    subtitle: shot.subtitle,
    media: shot.media,
    voice: shot.voice,
    note: shot.note ?? "",
    voiceSeconds: shot.voice && shot.length > shot.duration + 1e-3 ? shot.length : null
  }));
}
function toInputs(shots) {
  return shots.map((shot) => ({
    duration: shot.duration,
    visual: shot.visual.trim() || null,
    voiceover: shot.voiceover.trim() || null,
    subtitle: shot.subtitle,
    media_asset_id: shot.media?.id ?? null,
    voice_asset_id: shot.voice?.id ?? null,
    note: shot.note.trim() || null
  }));
}
function toMedia(asset) {
  return {
    id: asset.id,
    url: asset.url,
    mime: asset.mime,
    file_name: asset.file_name,
    width: asset.width,
    height: asset.height
  };
}
function moveShot(rows, fromKey, toKey) {
  const from = rows.findIndex((item2) => item2.key === fromKey);
  const to = rows.findIndex((item2) => item2.key === toKey);
  if (from < 0 || to < 0) return rows;
  const next = rows.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// src/pages/video/VideoPage.tsx
import { jsx as jsx24, jsxs as jsxs23 } from "react/jsx-runtime";
function VideoPage() {
  const [screen, setScreen] = useState21({ name: "list" });
  if (screen.name === "edit") {
    return /* @__PURE__ */ jsx24(ScriptEditor, { id: screen.id, onBack: () => setScreen({ name: "list" }) });
  }
  return /* @__PURE__ */ jsx24(VideoList, { onOpen: (id) => setScreen({ name: "edit", id }) });
}
function VideoList({ onOpen }) {
  const [segment, setSegment] = useState21("active");
  const [brand, setBrand] = useState21("all");
  const [campaignId, setCampaignId] = useState21("all");
  const [qInput, setQInput] = useState21("");
  const [q, setQ] = useState21("");
  const [creating, setCreating] = useState21(false);
  const guides = useQuery(() => listBrandGuides(), []);
  const campaigns = useQuery(() => listCampaigns(), []);
  useEffect18(() => {
    const timer9 = window.setTimeout(() => setQ(qInput.trim()), 300);
    return () => window.clearTimeout(timer9);
  }, [qInput]);
  const list = useQuery(
    () => listVideoProjects({
      status: segment === "all" ? void 0 : segment,
      brand: brand === "all" ? void 0 : brand,
      campaign_id: campaignId === "all" ? void 0 : Number(campaignId),
      q: q || void 0
    }),
    [segment, brand, campaignId, q]
  );
  const brands = (guides.data ?? []).map((item) => item.brand);
  return /* @__PURE__ */ jsxs23("div", { className: "flex min-w-0 flex-1 flex-col gap-3", children: [
    /* @__PURE__ */ jsx24(HeaderActions, { children: /* @__PURE__ */ jsx24(Button20, { size: "sm", onClick: () => setCreating(true), children: "\u65B0\u5EFA\u89C6\u9891" }) }),
    /* @__PURE__ */ jsxs23("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx24(
        SegmentedControl7,
        {
          className: "max-w-full flex-wrap",
          options: [
            { id: "active", label: "\u672A\u5B8C\u6210" },
            { id: "in_review", label: "\u5F85\u5BA1\u6838" },
            { id: "done", label: "\u5DF2\u5B8C\u6210" },
            { id: "all", label: "\u5168\u90E8" }
          ],
          value: segment,
          onChange: setSegment
        }
      ),
      /* @__PURE__ */ jsx24(FilterSelect3, { label: "\u54C1\u724C", value: brand, onChange: setBrand, options: brands.map((item) => ({ id: item, label: item })) }),
      /* @__PURE__ */ jsx24(
        FilterSelect3,
        {
          label: "\u6D3B\u52A8",
          value: campaignId,
          onChange: setCampaignId,
          options: (campaigns.data ?? []).map((item) => ({ id: String(item.id), label: item.name }))
        }
      ),
      /* @__PURE__ */ jsx24(
        Input14,
        {
          "aria-label": "\u641C\u7D22\u89C6\u9891",
          value: qInput,
          placeholder: "\u6807\u9898\u3001\u8BF4\u660E\u3001\u53E3\u64AD",
          className: "w-44 max-w-full",
          onChange: (event) => setQInput(event.target.value)
        }
      )
    ] }),
    list.error ? /* @__PURE__ */ jsx24(
      ErrorState10,
      {
        title: isOfflineError(list.error) ? "\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1" : "\u89C6\u9891\u52A0\u8F7D\u5931\u8D25",
        description: errorText2(list.error, "\u8BF7\u91CD\u8BD5"),
        children: /* @__PURE__ */ jsx24(Button20, { size: "sm", variant: "outline", onClick: list.reload, children: "\u91CD\u8BD5" })
      }
    ) : list.loading && !list.data ? /* @__PURE__ */ jsxs23("div", { className: "flex items-center gap-2 text-xs text-(--ui-text-tertiary)", children: [
      /* @__PURE__ */ jsx24(Loader10, {}),
      "\u6B63\u5728\u8BFB\u53D6\u89C6\u9891"
    ] }) : list.data && list.data.length === 0 ? /* @__PURE__ */ jsx24(EmptyState5, { title: "\u6CA1\u6709\u89C6\u9891", description: "\u5F53\u524D\u7B5B\u9009\u4E0B\u6CA1\u6709\u89C6\u9891\u9879\u76EE\u3002" }) : /* @__PURE__ */ jsx24("ul", { className: "grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-3", children: (list.data ?? []).map((item) => /* @__PURE__ */ jsx24("li", { children: /* @__PURE__ */ jsxs23(
      "button",
      {
        type: "button",
        className: "flex w-full gap-3 rounded-lg border border-(--ui-stroke-secondary) p-3 text-left hover:bg-(--ui-bg-quinary)",
        onClick: () => onOpen(item.id),
        children: [
          /* @__PURE__ */ jsx24(
            "span",
            {
              className: "flex shrink-0 items-center justify-center overflow-hidden bg-(--ui-bg-secondary)",
              style: { width: "4.5rem", aspectRatio: aspectRatio(item.aspect) },
              children: item.cover ? /* @__PURE__ */ jsx24("img", { src: mediaSrc(item.cover.url), alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx24("span", { className: "text-[0.625rem] text-(--ui-text-tertiary)", children: "\u65E0\u5C01\u9762" })
            }
          ),
          /* @__PURE__ */ jsxs23("span", { className: "flex min-w-0 flex-1 flex-col gap-1", children: [
            /* @__PURE__ */ jsx24("span", { className: "truncate text-sm font-medium", children: item.title }),
            /* @__PURE__ */ jsxs23("span", { className: "text-xs text-(--ui-text-secondary)", children: [
              platformLabel(item.platform),
              " \xB7 ",
              item.aspect,
              " \xB7 ",
              formatSeconds(item.duration),
              " \xB7 ",
              item.shot_count,
              " \u955C"
            ] }),
            /* @__PURE__ */ jsxs23("span", { className: "flex flex-wrap items-center gap-1", children: [
              /* @__PURE__ */ jsx24(Badge8, { variant: statusVariant2(item.status), children: statusLabel2(item.status) }),
              item.missing_media > 0 ? /* @__PURE__ */ jsxs23(Badge8, { variant: "warn", children: [
                "\u7F3A\u753B\u9762 ",
                item.missing_media
              ] }) : null,
              item.missing_voice > 0 ? /* @__PURE__ */ jsxs23(Badge8, { variant: "warn", children: [
                "\u7F3A\u914D\u97F3 ",
                item.missing_voice
              ] }) : null
            ] })
          ] })
        ]
      }
    ) }, item.id)) }),
    /* @__PURE__ */ jsx24(
      CreateVideoDialog,
      {
        open: creating,
        brands,
        campaigns: campaigns.data ?? [],
        onOpenChange: setCreating,
        onCreated: onOpen
      }
    )
  ] });
}
function CreateVideoDialog({
  open,
  brands,
  campaigns,
  onOpenChange,
  onCreated
}) {
  const [title, setTitle] = useState21("");
  const [brand, setBrand] = useState21(brands[0] ?? "");
  const [platform, setPlatform] = useState21("douyin");
  const [aspect, setAspect] = useState21("9:16");
  const [productCode, setProductCode] = useState21("");
  const [codeQuery, setCodeQuery] = useState21("");
  const [campaignId, setCampaignId] = useState21("none");
  const [brief, setBrief] = useState21("");
  const [actor, setActor] = useState21(loadActor);
  const [busy, setBusy] = useState21(false);
  const [error, setError] = useState21(null);
  useEffect18(() => {
    if (!brand && brands[0]) setBrand(brands[0]);
  }, [brand, brands]);
  useEffect18(() => {
    const timer9 = window.setTimeout(() => setCodeQuery(productCode.trim()), 300);
    return () => window.clearTimeout(timer9);
  }, [productCode]);
  const cards = useQuery(() => codeQuery ? listProductCards({ q: codeQuery }) : Promise.resolve([]), [codeQuery]);
  const submit = async () => {
    if (!title.trim() || !brand.trim()) {
      setError("\u6807\u9898\u548C\u54C1\u724C\u8981\u586B");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const created = await createVideoProject({
        title: title.trim(),
        brand: brand.trim(),
        campaign_id: campaignId === "none" ? null : Number(campaignId),
        product_code: productCode.trim() || null,
        platform: platform === "none" ? null : platform,
        aspect,
        brief: brief.trim() || null,
        author: actor.trim() || null,
        shots: []
      });
      saveActor(actor);
      onOpenChange(false);
      onCreated(created.id);
    } catch (reason) {
      setError(errorText2(reason, "\u6CA1\u6709\u5EFA\u6210"));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsx24(Dialog6, { open, onOpenChange, children: /* @__PURE__ */ jsxs23(DialogContent6, { children: [
    /* @__PURE__ */ jsx24(DialogHeader6, { children: /* @__PURE__ */ jsx24(DialogTitle6, { children: "\u65B0\u5EFA\u89C6\u9891" }) }),
    /* @__PURE__ */ jsxs23("label", { className: "flex flex-col gap-1 text-xs", children: [
      "\u6807\u9898",
      /* @__PURE__ */ jsx24(Input14, { "aria-label": "\u6807\u9898", value: title, onChange: (event) => setTitle(event.target.value) })
    ] }),
    /* @__PURE__ */ jsxs23("div", { className: "grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2", children: [
      /* @__PURE__ */ jsxs23("label", { className: "flex flex-col gap-1 text-xs", children: [
        "\u54C1\u724C",
        brands.length > 0 ? /* @__PURE__ */ jsxs23(Select10, { value: brand, onValueChange: setBrand, children: [
          /* @__PURE__ */ jsx24(SelectTrigger10, { "aria-label": "\u54C1\u724C", children: /* @__PURE__ */ jsx24(SelectValue10, { placeholder: "\u9009\u62E9\u54C1\u724C" }) }),
          /* @__PURE__ */ jsx24(SelectContent10, { children: brands.map((item) => /* @__PURE__ */ jsx24(SelectItem10, { value: item, children: item }, item)) })
        ] }) : /* @__PURE__ */ jsx24(Input14, { "aria-label": "\u54C1\u724C", value: brand, onChange: (event) => setBrand(event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs23("label", { className: "flex flex-col gap-1 text-xs", children: [
        "\u5E73\u53F0",
        /* @__PURE__ */ jsxs23(Select10, { value: platform, onValueChange: setPlatform, children: [
          /* @__PURE__ */ jsx24(SelectTrigger10, { "aria-label": "\u5E73\u53F0", children: /* @__PURE__ */ jsx24(SelectValue10, { placeholder: "\u5E73\u53F0" }) }),
          /* @__PURE__ */ jsxs23(SelectContent10, { children: [
            /* @__PURE__ */ jsx24(SelectItem10, { value: "none", children: "\u4E0D\u9009" }),
            PLATFORMS.map((item) => /* @__PURE__ */ jsx24(SelectItem10, { value: item.id, children: item.label }, item.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs23("label", { className: "flex flex-col gap-1 text-xs", children: [
        "\u753B\u5E45",
        /* @__PURE__ */ jsxs23(Select10, { value: aspect, onValueChange: (value) => setAspect(value), children: [
          /* @__PURE__ */ jsx24(SelectTrigger10, { "aria-label": "\u753B\u5E45", children: /* @__PURE__ */ jsx24(SelectValue10, { placeholder: "\u753B\u5E45" }) }),
          /* @__PURE__ */ jsx24(SelectContent10, { children: ASPECTS.map((item) => /* @__PURE__ */ jsx24(SelectItem10, { value: item.id, children: item.label }, item.id)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs23("label", { className: "flex flex-col gap-1 text-xs", children: [
      "\u5546\u54C1\u7F16\u7801",
      /* @__PURE__ */ jsx24(Input14, { "aria-label": "\u5546\u54C1\u7F16\u7801", value: productCode, onChange: (event) => setProductCode(event.target.value) })
    ] }),
    cards.data && cards.data.length > 0 ? /* @__PURE__ */ jsx24("ul", { className: "max-h-28 overflow-y-auto rounded-md border border-(--ui-stroke-secondary)", children: cards.data.slice(0, 6).map((card) => /* @__PURE__ */ jsx24("li", { children: /* @__PURE__ */ jsxs23(
      "button",
      {
        type: "button",
        className: "flex w-full gap-2 px-2 py-1 text-left text-xs hover:bg-(--ui-bg-quinary)",
        onClick: () => setProductCode(card.product_code),
        children: [
          /* @__PURE__ */ jsx24("span", { className: "text-(--ui-text-tertiary)", children: card.product_code }),
          /* @__PURE__ */ jsx24("span", { className: "min-w-0 truncate", children: card.name })
        ]
      }
    ) }, card.id)) }) : null,
    /* @__PURE__ */ jsxs23("label", { className: "flex flex-col gap-1 text-xs", children: [
      "\u6D3B\u52A8",
      /* @__PURE__ */ jsxs23(Select10, { value: campaignId, onValueChange: setCampaignId, children: [
        /* @__PURE__ */ jsx24(SelectTrigger10, { "aria-label": "\u6D3B\u52A8", children: /* @__PURE__ */ jsx24(SelectValue10, { placeholder: "\u4E0D\u5173\u8054\u6D3B\u52A8" }) }),
        /* @__PURE__ */ jsxs23(SelectContent10, { children: [
          /* @__PURE__ */ jsx24(SelectItem10, { value: "none", children: "\u4E0D\u5173\u8054\u6D3B\u52A8" }),
          campaigns.map((item) => /* @__PURE__ */ jsx24(SelectItem10, { value: String(item.id), children: item.name }, item.id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs23("label", { className: "flex flex-col gap-1 text-xs", children: [
      "\u8BF4\u660E",
      /* @__PURE__ */ jsx24(Textarea13, { "aria-label": "\u8BF4\u660E", rows: 3, value: brief, onChange: (event) => setBrief(event.target.value) })
    ] }),
    /* @__PURE__ */ jsxs23("label", { className: "flex flex-col gap-1 text-xs", children: [
      "\u7F72\u540D",
      /* @__PURE__ */ jsx24(
        Input14,
        {
          "aria-label": "\u7F72\u540D",
          value: actor,
          onChange: (event) => {
            setActor(event.target.value);
            saveActor(event.target.value);
          }
        }
      )
    ] }),
    error ? /* @__PURE__ */ jsx24("p", { className: "text-xs text-destructive", children: error }) : null,
    /* @__PURE__ */ jsxs23(DialogFooter4, { children: [
      /* @__PURE__ */ jsx24(Button20, { size: "sm", variant: "outline", onClick: () => onOpenChange(false), children: "\u5173\u95ED" }),
      /* @__PURE__ */ jsx24(Button20, { size: "sm", disabled: busy, onClick: () => void submit(), children: "\u521B\u5EFA" })
    ] })
  ] }) });
}
function FilterSelect3({
  label,
  value,
  onChange,
  options
}) {
  return /* @__PURE__ */ jsxs23(Select10, { value, onValueChange: onChange, children: [
    /* @__PURE__ */ jsx24(SelectTrigger10, { "aria-label": label, className: "w-36 max-w-full", children: /* @__PURE__ */ jsx24(SelectValue10, { placeholder: `\u5168\u90E8${label}` }) }),
    /* @__PURE__ */ jsxs23(SelectContent10, { children: [
      /* @__PURE__ */ jsxs23(SelectItem10, { value: "all", children: [
        "\u5168\u90E8",
        label
      ] }),
      options.map((item) => /* @__PURE__ */ jsx24(SelectItem10, { value: item.id, children: item.label }, item.id))
    ] })
  ] });
}

// src/modules/brand.tsx
import { jsx as jsx25 } from "react/jsx-runtime";
ensureRunningCampaignPolling();
ensureInReviewPolling();
ensureDesignNeedsActionPolling();
ensureVideoNeedsActionPolling();
var brandWorkbench = {
  id: "brand",
  name: "\u54C1\u724C\u6D3B\u52A8",
  codicon: "megaphone",
  pages: [
    {
      id: "campaigns",
      label: "\u6D3B\u52A8",
      codicon: "calendar",
      badge: () => getRunningCampaignCount(),
      render: () => /* @__PURE__ */ jsx25(CampaignsPage, {})
    },
    {
      id: "content",
      label: "\u5185\u5BB9",
      codicon: "edit",
      badge: () => getInReviewCount(),
      render: () => /* @__PURE__ */ jsx25(ContentsPage, {})
    },
    {
      id: "design",
      label: "\u8BBE\u8BA1",
      codicon: "symbol-color",
      badge: () => getDesignNeedsActionCount(),
      render: () => /* @__PURE__ */ jsx25(DesignPage, {})
    },
    {
      id: "video",
      label: "\u89C6\u9891",
      codicon: "device-camera-video",
      badge: () => getVideoNeedsActionCount(),
      render: () => /* @__PURE__ */ jsx25(VideoPage, {})
    },
    {
      id: "assets",
      label: "\u8D44\u6599",
      codicon: "library",
      render: () => /* @__PURE__ */ jsx25(AssetsPage, {})
    }
  ]
};

// src/pages/customers/CustomersPage.tsx
import { useEffect as useEffect23, useRef as useRef10, useState as useState26 } from "react";
import {
  Badge as Badge12,
  Button as Button25,
  Dialog as Dialog8,
  DialogContent as DialogContent8,
  DialogFooter as DialogFooter6,
  DialogHeader as DialogHeader8,
  DialogTitle as DialogTitle8,
  Checkbox as Checkbox3,
  EmptyState as EmptyState6,
  ErrorState as ErrorState14,
  Input as Input18,
  SearchField as SearchField3,
  SegmentedControl as SegmentedControl8,
  Select as Select11,
  SelectContent as SelectContent11,
  SelectItem as SelectItem11,
  SelectTrigger as SelectTrigger11,
  SelectValue as SelectValue11,
  Skeleton as Skeleton3,
  Textarea as Textarea18,
  Tip as Tip5
} from "@hermes/plugin-sdk";

// src/pages/customers/CustomerDrawer.tsx
import { useEffect as useEffect19, useState as useState22 } from "react";
import { Badge as Badge9, Button as Button21, Checkbox as Checkbox2, ErrorState as ErrorState11, Input as Input15, Loader as Loader11, Textarea as Textarea14 } from "@hermes/plugin-sdk";

// src/pages/customers/labels.ts
var ACTOR_KEY3 = "hermes-workbench:actor";
var SEGMENT_LABEL = {
  new: "\u65B0\u5BA2",
  repeat: "\u590D\u8D2D",
  dormant: "\u6C89\u7761",
  inquiry_open: "\u8BE2\u76D8\u672A\u6210\u4EA4"
};
var INQUIRY_STATUS_LABEL = {
  new: "\u65B0\u8BE2\u76D8",
  replied: "\u5DF2\u56DE\u590D",
  quoted: "\u5DF2\u62A5\u4EF7",
  won: "\u6210\u4EA4",
  lost: "\u4E22\u5355"
};
var INQUIRY_CHANNELS = [
  { id: "wecom", label: "\u4F01\u4E1A\u5FAE\u4FE1" },
  { id: "phone", label: "\u7535\u8BDD" },
  { id: "tmall", label: "\u5929\u732B" },
  { id: "jd", label: "\u4EAC\u4E1C" },
  { id: "pdd", label: "\u62FC\u591A\u591A" },
  { id: "douyin", label: "\u6296\u97F3" },
  { id: "email", label: "\u90AE\u4EF6" },
  { id: "other", label: "\u5176\u4ED6" }
];
var FOLLOWUP_CHANNELS = [
  { id: "wecom", label: "\u4F01\u4E1A\u5FAE\u4FE1" },
  { id: "platform", label: "\u5E73\u53F0\u5BA2\u670D" },
  { id: "sms", label: "\u77ED\u4FE1" },
  { id: "phone", label: "\u7535\u8BDD" }
];
var FOLLOWUP_STATUS_LABEL = {
  draft: "\u8349\u7A3F",
  approved: "\u5DF2\u5BA1\u6838",
  done: "\u5DF2\u5B8C\u6210",
  cancelled: "\u5DF2\u53D6\u6D88"
};
var PLACEHOLDERS = ["{\u79F0\u547C}", "{\u59D3\u540D}", "{\u6700\u8FD1\u5546\u54C1}", "{\u5E97\u94FA}", "{\u516C\u53F8}"];
var SEGMENTS = [
  { id: "new", label: "\u65B0\u5BA2" },
  { id: "repeat", label: "\u590D\u8D2D" },
  { id: "dormant", label: "\u6C89\u7761" },
  { id: "inquiry_open", label: "\u8BE2\u76D8\u672A\u6210\u4EA4" }
];
function segmentLabel(segment) {
  return SEGMENT_LABEL[segment] ?? segment;
}
function inquiryStatusLabel(status) {
  return INQUIRY_STATUS_LABEL[status] ?? status;
}
function inquiryStatusVariant(status) {
  if (status === "lost") return "destructive";
  if (status === "new") return "warn";
  if (status === "quoted" || status === "replied") return "default";
  return "outline";
}
function channelLabel(channel) {
  return INQUIRY_CHANNELS.find((item) => item.id === channel)?.label ?? FOLLOWUP_CHANNELS.find((item) => item.id === channel)?.label ?? channel;
}
function followupStatusLabel(status) {
  return FOLLOWUP_STATUS_LABEL[status] ?? status;
}
function followupStatusVariant(status) {
  if (status === "draft") return "warn";
  if (status === "approved") return "default";
  return "outline";
}
function loadActor3() {
  try {
    return window.localStorage.getItem(ACTOR_KEY3) ?? "";
  } catch {
    return "";
  }
}
function saveActor2(value) {
  try {
    window.localStorage.setItem(ACTOR_KEY3, value);
  } catch {
  }
}
function formatShanghai2(iso) {
  if (!iso) return "\u2014";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("zh-CN", { hour12: false, timeZone: "Asia/Shanghai" });
}
function formatShanghaiDate(iso) {
  if (!iso) return "\u2014";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "\u2014";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}
function shanghaiDate(offsetDays = 0) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(/* @__PURE__ */ new Date());
  if (offsetDays === 0) return today;
  const [year, month, day] = today.split("-").map(Number);
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, (day ?? 1) + offsetDays));
  return date.toISOString().slice(0, 10);
}
function formatMoney(value) {
  if (!Number.isFinite(value)) return "\u2014";
  return value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function errorText3(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    try {
      area.select();
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      area.remove();
    }
  }
}
function parseTags(value) {
  return value.split(/[,，]/).map((item) => item.trim()).filter(Boolean);
}

// src/pages/customers/CustomerDrawer.tsx
import { jsx as jsx26, jsxs as jsxs24 } from "react/jsx-runtime";
function CustomerDrawer({
  customerId,
  onClose,
  onSaved,
  onOpenInquiry
}) {
  const [detail, setDetail] = useState22(null);
  const [loadedFor, setLoadedFor] = useState22(null);
  const [error, setError] = useState22(null);
  const [revision, setRevision] = useState22(0);
  const [name, setName] = useState22("");
  const [company, setCompany] = useState22("");
  const [wecom, setWecom] = useState22(false);
  const [tags, setTags] = useState22("");
  const [note, setNote] = useState22("");
  const [saving, setSaving] = useState22(false);
  const [actionError, setActionError] = useState22(null);
  useEffect19(() => {
    if (customerId == null) return;
    let cancelled = false;
    setLoadedFor(null);
    setError(null);
    setActionError(null);
    getCustomer(customerId).then(
      (value) => {
        if (cancelled) return;
        setDetail(value);
        setName(value.name ?? "");
        setCompany(value.company ?? "");
        setWecom(value.wecom_added);
        setTags(value.tags.join("\uFF0C"));
        setNote(value.note ?? "");
        setLoadedFor(customerId);
      },
      (reason) => {
        if (cancelled) return;
        setError(reason);
        setLoadedFor(customerId);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [customerId, revision]);
  const ready = detail != null && loadedFor === customerId ? detail : null;
  const save = async () => {
    if (customerId == null || ready == null) return;
    if (ready.kind === "business" && !company.trim()) {
      setActionError("\u4F01\u4E1A\u5BA2\u6237\u8BF7\u586B\u5199\u516C\u53F8\u540D\u79F0");
      return;
    }
    setSaving(true);
    setActionError(null);
    try {
      const next = await patchCustomer(customerId, {
        name: name.trim() || null,
        company: company.trim() || null,
        wecom_added: wecom,
        tags: parseTags(tags),
        note: note.trim() || null
      });
      setDetail(next);
      onSaved();
    } catch (reason) {
      setActionError(errorText3(reason, "\u4FDD\u5B58\u5931\u8D25"));
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxs24(
    SideDrawer,
    {
      open: customerId != null,
      title: ready ? ready.name || ready.company || "\u5BA2\u6237" : "\u5BA2\u6237",
      description: ready ? `${ready.kind === "business" ? "\u4F01\u4E1A" : "\u4F1A\u5458"} \xB7 ${ready.phone || "\u65E0\u624B\u673A\u53F7"}` : void 0,
      onClose,
      widthClass: "max-w-lg",
      footer: ready ? /* @__PURE__ */ jsx26(Button21, { size: "sm", disabled: saving, onClick: () => void save(), children: saving ? "\u6B63\u5728\u4FDD\u5B58" : "\u4FDD\u5B58" }) : null,
      children: [
        customerId != null && loadedFor !== customerId && !error ? /* @__PURE__ */ jsxs24("div", { className: "flex items-center gap-2 text-xs text-(--ui-text-tertiary)", children: [
          /* @__PURE__ */ jsx26(Loader11, {}),
          "\u6B63\u5728\u8BFB\u53D6\u5BA2\u6237"
        ] }) : null,
        error ? /* @__PURE__ */ jsx26(
          ErrorState11,
          {
            title: isOfflineError(error) ? "\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1" : "\u5BA2\u6237\u52A0\u8F7D\u5931\u8D25",
            description: errorText3(error, "\u8BF7\u91CD\u8BD5"),
            children: /* @__PURE__ */ jsx26(Button21, { size: "sm", variant: "outline", onClick: () => setRevision((value) => value + 1), children: "\u91CD\u8BD5" })
          }
        ) : null,
        ready ? /* @__PURE__ */ jsxs24("div", { className: "flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxs24("section", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx26("h3", { className: "text-xs font-medium", children: "\u57FA\u672C\u4FE1\u606F" }),
            /* @__PURE__ */ jsxs24("label", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
              "\u540D\u79F0",
              /* @__PURE__ */ jsx26(Input15, { "aria-label": "\u540D\u79F0", value: name, onChange: (event) => setName(event.target.value) })
            ] }),
            /* @__PURE__ */ jsxs24("label", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
              "\u516C\u53F8",
              /* @__PURE__ */ jsx26(Input15, { "aria-label": "\u516C\u53F8", value: company, onChange: (event) => setCompany(event.target.value) })
            ] }),
            /* @__PURE__ */ jsxs24(FieldText, { label: "\u624B\u673A", children: [
              ready.phone || "\u2014",
              "\uFF08\u4E0D\u80FD\u6539\uFF09"
            ] }),
            /* @__PURE__ */ jsxs24("label", { className: "inline-flex items-center gap-2 text-xs text-(--ui-text-secondary)", children: [
              /* @__PURE__ */ jsx26(Checkbox2, { checked: wecom, onCheckedChange: setWecom, "aria-label": "\u5DF2\u52A0\u4F01\u4E1A\u5FAE\u4FE1" }),
              "\u5DF2\u52A0\u4F01\u4E1A\u5FAE\u4FE1"
            ] }),
            /* @__PURE__ */ jsxs24("label", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
              "\u6807\u7B7E",
              /* @__PURE__ */ jsx26(Input15, { "aria-label": "\u6807\u7B7E", value: tags, placeholder: "\u7528\u9017\u53F7\u5206\u5F00", onChange: (event) => setTags(event.target.value) })
            ] }),
            /* @__PURE__ */ jsxs24("label", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
              "\u5907\u6CE8",
              /* @__PURE__ */ jsx26(Textarea14, { "aria-label": "\u5907\u6CE8", value: note, onChange: (event) => setNote(event.target.value) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs24("section", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsx26(FieldText, { label: "\u7D2F\u8BA1\u5355\u6570", children: ready.order_count }),
            /* @__PURE__ */ jsxs24(FieldText, { label: "\u7D2F\u8BA1\u91D1\u989D", children: [
              formatMoney(ready.total),
              " \u5143"
            ] }),
            /* @__PURE__ */ jsx26(FieldText, { label: "\u9996\u5355", children: formatShanghaiDate(ready.first_paid_at) }),
            /* @__PURE__ */ jsx26(FieldText, { label: "\u6700\u8FD1\u4E00\u5355", children: formatShanghaiDate(ready.last_paid_at) }),
            /* @__PURE__ */ jsx26(FieldText, { label: "\u6700\u8FD1\u5546\u54C1", className: "col-span-2", children: ready.last_title || "\u2014" }),
            /* @__PURE__ */ jsx26(FieldText, { label: "\u5E97\u94FA", className: "col-span-2", children: ready.shops.join("\u3001") || "\u2014" }),
            /* @__PURE__ */ jsx26("div", { className: "col-span-2 flex flex-wrap gap-1", children: ready.segments.map((item) => /* @__PURE__ */ jsx26(Badge9, { variant: "outline", children: segmentLabel(item) }, item)) })
          ] }),
          /* @__PURE__ */ jsxs24("section", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsx26("h3", { className: "text-xs font-medium", children: "\u8BA2\u5355" }),
            ready.orders.length === 0 ? /* @__PURE__ */ jsx26("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD8\u6CA1\u6709\u8BA2\u5355\u3002" }) : /* @__PURE__ */ jsx26("ul", { children: ready.orders.map((order) => /* @__PURE__ */ jsxs24("li", { className: "border-b border-(--ui-stroke-secondary) py-1.5 text-xs text-(--ui-text-secondary)", children: [
              /* @__PURE__ */ jsx26("span", { className: "text-(--ui-text-primary)", children: order.title }),
              /* @__PURE__ */ jsxs24("span", { className: "mt-0.5 block text-(--ui-text-tertiary)", children: [
                order.shop_name,
                " \xB7 ",
                order.order_no,
                " \xB7 ",
                formatShanghaiDate(order.paid_at),
                " \xB7 ",
                order.quantity,
                " \u4EF6 \xB7",
                " ",
                formatMoney(order.amount),
                " \u5143",
                order.platform_status ? ` \xB7 ${order.platform_status}` : ""
              ] })
            ] }, order.id)) })
          ] }),
          /* @__PURE__ */ jsxs24("section", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsx26("h3", { className: "text-xs font-medium", children: "\u8BE2\u76D8" }),
            ready.inquiries.length === 0 ? /* @__PURE__ */ jsx26("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD8\u6CA1\u6709\u8BE2\u76D8\u3002" }) : /* @__PURE__ */ jsx26("ul", { children: ready.inquiries.map((item) => /* @__PURE__ */ jsx26("li", { className: "border-b border-(--ui-stroke-secondary)", children: /* @__PURE__ */ jsxs24(
              "button",
              {
                type: "button",
                className: "flex w-full flex-col gap-0.5 py-1.5 text-left text-xs hover:bg-(--ui-bg-quinary)",
                onClick: () => onOpenInquiry(item.id),
                children: [
                  /* @__PURE__ */ jsx26("span", { children: item.company || item.contact || "\u8BE2\u76D8" }),
                  /* @__PURE__ */ jsx26("span", { className: "text-(--ui-text-tertiary)", children: inquiryStatusLabel(item.status) })
                ]
              }
            ) }, item.id)) })
          ] }),
          actionError ? /* @__PURE__ */ jsx26("p", { className: "text-xs text-destructive", children: actionError }) : null
        ] }) : null
      ]
    }
  );
}

// src/pages/customers/FollowupView.tsx
import { useEffect as useEffect20, useState as useState23 } from "react";
import { Badge as Badge10, Button as Button22, ConfirmDialog as ConfirmDialog7, ErrorState as ErrorState12, Loader as Loader12, Textarea as Textarea15 } from "@hermes/plugin-sdk";
import { jsx as jsx27, jsxs as jsxs25 } from "react/jsx-runtime";
function FollowupView({ id, onBack }) {
  const [detail, setDetail] = useState23(null);
  const [error, setError] = useState23(null);
  const [template, setTemplate] = useState23("");
  const [actor, setActor] = useState23(loadActor3);
  const [busy, setBusy] = useState23(false);
  const [actionError, setActionError] = useState23(null);
  const [complianceError, setComplianceError] = useState23(null);
  const [copyHint, setCopyHint] = useState23(null);
  const [confirmDelete, setConfirmDelete] = useState23(false);
  const [confirmCancel, setConfirmCancel] = useState23(false);
  const [revision, setRevision] = useState23(0);
  useEffect20(() => {
    let cancelled = false;
    setError(null);
    getFollowup(id).then(
      (value) => {
        if (cancelled) return;
        setDetail(value);
        setTemplate(value.template);
      },
      (reason) => {
        if (!cancelled) setError(reason);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [id, revision]);
  const apply = async (task) => {
    setBusy(true);
    setActionError(null);
    setComplianceError(null);
    saveActor2(actor);
    try {
      const next = await task();
      setDetail(next);
      setTemplate(next.template);
    } catch (reason) {
      if (reason instanceof ApiError && reason.code === "compliance_failed") {
        setComplianceError(reason.message);
      } else {
        setActionError(errorText3(reason, "\u64CD\u4F5C\u5931\u8D25"));
      }
      throw reason;
    } finally {
      setBusy(false);
    }
  };
  const saveTemplate = () => {
    if (!detail || template.trim() === detail.template) return Promise.resolve(detail);
    return apply(() => patchFollowup(id, { template: template.trim() }));
  };
  const approve = async () => {
    if (detail && template.trim() !== detail.template) {
      await saveTemplate();
    }
    await apply(() => approveFollowup(id, actor.trim() || null));
  };
  const copyMessage = async (targetId, message) => {
    const ok = await copyText(message);
    setCopyHint(ok ? `\u5DF2\u590D\u5236 #${targetId}` : message);
    if (!ok) setActionError("\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u9009\u62E9\u4E0B\u9762\u7684\u6587\u5B57");
    else setActionError(null);
  };
  if (error) {
    return /* @__PURE__ */ jsx27("div", { className: "flex flex-1 items-center justify-center py-10", children: /* @__PURE__ */ jsxs25(
      ErrorState12,
      {
        title: isOfflineError(error) ? "\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1" : "\u8DDF\u8FDB\u4EFB\u52A1\u52A0\u8F7D\u5931\u8D25",
        description: errorText3(error, "\u8BF7\u91CD\u8BD5"),
        children: [
          /* @__PURE__ */ jsx27(Button22, { size: "sm", variant: "outline", onClick: onBack, children: "\u8FD4\u56DE" }),
          /* @__PURE__ */ jsx27(Button22, { size: "sm", variant: "outline", onClick: () => setRevision((value) => value + 1), children: "\u91CD\u8BD5" })
        ]
      }
    ) });
  }
  if (!detail) {
    return /* @__PURE__ */ jsxs25("div", { className: "flex items-center gap-2 py-6 text-xs text-(--ui-text-tertiary)", children: [
      /* @__PURE__ */ jsx27(Loader12, {}),
      "\u6B63\u5728\u8BFB\u53D6\u8DDF\u8FDB\u4EFB\u52A1"
    ] });
  }
  const draft = detail.status === "draft";
  const approved = detail.status === "approved";
  const counts = detail.counts;
  return /* @__PURE__ */ jsxs25("div", { className: "flex min-w-0 flex-1 flex-col gap-3", children: [
    /* @__PURE__ */ jsxs25("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx27(Button22, { size: "xs", variant: "outline", onClick: onBack, children: "\u8FD4\u56DE" }),
      /* @__PURE__ */ jsx27("h2", { className: "min-w-0 text-sm font-medium", children: detail.name }),
      /* @__PURE__ */ jsx27(Badge10, { variant: followupStatusVariant(detail.status), children: followupStatusLabel(detail.status) }),
      /* @__PURE__ */ jsxs25("span", { className: "text-xs text-(--ui-text-tertiary)", children: [
        segmentLabel(detail.segment),
        " \xB7 ",
        channelLabel(detail.channel),
        " \xB7 \u5F85\u53D1 ",
        counts.pending,
        " / \u5DF2\u53D1 ",
        counts.sent,
        " / \u8DF3\u8FC7",
        " ",
        counts.skipped
      ] })
    ] }),
    /* @__PURE__ */ jsx27("p", { className: "rounded-md border border-(--ui-stroke-secondary) bg-(--ui-bg-quinary) px-3 py-2 text-xs text-(--ui-text-secondary)", children: "\u7CFB\u7EDF\u4E0D\u4F1A\u81EA\u52A8\u53D1\u9001\uFF0C\u8BF7\u590D\u5236\u5230\u4F01\u4E1A\u5FAE\u4FE1 / \u5E73\u53F0\u5BA2\u670D\u91CC\u53D1\uFF0C\u53D1\u5B8C\u70B9\u5DF2\u53D1\u3002" }),
    draft ? /* @__PURE__ */ jsxs25("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx27(Textarea15, { "aria-label": "\u8BDD\u672F", value: template, onChange: (event) => setTemplate(event.target.value) }),
      complianceError ? /* @__PURE__ */ jsx27("p", { className: "text-xs text-destructive", children: complianceError }) : null,
      /* @__PURE__ */ jsxs25("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsx27(Button22, { size: "xs", variant: "outline", disabled: busy || !template.trim(), onClick: () => void saveTemplate().catch(() => void 0), children: "\u4FDD\u5B58\u8BDD\u672F" }),
        /* @__PURE__ */ jsx27(Button22, { size: "xs", disabled: busy || !template.trim(), onClick: () => void approve().catch(() => void 0), children: "\u5BA1\u6838\u901A\u8FC7" }),
        /* @__PURE__ */ jsx27(Button22, { size: "xs", variant: "outline", disabled: busy, onClick: () => setConfirmDelete(true), children: "\u5220\u9664" })
      ] })
    ] }) : null,
    approved || detail.status === "done" ? /* @__PURE__ */ jsxs25("div", { className: "flex flex-wrap gap-2", children: [
      approved ? /* @__PURE__ */ jsx27(
        Button22,
        {
          size: "xs",
          variant: "outline",
          disabled: busy,
          onClick: () => {
            setBusy(true);
            setActionError(null);
            void exportFollowup(id).catch((reason) => setActionError(errorText3(reason, "\u5BFC\u51FA\u5931\u8D25"))).finally(() => setBusy(false));
          },
          children: "\u5BFC\u51FA\u540D\u5355"
        }
      ) : null,
      approved ? /* @__PURE__ */ jsx27(Button22, { size: "xs", variant: "outline", disabled: busy, onClick: () => setConfirmCancel(true), children: "\u53D6\u6D88\u4EFB\u52A1" }) : null
    ] }) : null,
    /* @__PURE__ */ jsx27("ul", { className: "min-w-0", children: detail.targets.map((target) => /* @__PURE__ */ jsxs25(
      "li",
      {
        className: target.status === "skipped" ? "flex flex-col gap-1 border-b border-(--ui-stroke-secondary) px-2 py-2 text-xs opacity-60" : "flex flex-col gap-1 border-b border-(--ui-stroke-secondary) px-2 py-2 text-xs",
        children: [
          /* @__PURE__ */ jsxs25("span", { className: "flex flex-wrap items-center gap-x-2 gap-y-1", children: [
            /* @__PURE__ */ jsx27("span", { className: "font-medium text-(--ui-text-primary)", children: target.customer_name || "\u672A\u7559\u59D3\u540D" }),
            /* @__PURE__ */ jsx27("span", { className: "text-(--ui-text-secondary)", children: target.phone || "\u65E0\u624B\u673A\u53F7" }),
            target.status === "sent" ? /* @__PURE__ */ jsx27(Badge10, { variant: "outline", children: "\u5DF2\u53D1" }) : null,
            target.status === "skipped" ? /* @__PURE__ */ jsx27(Badge10, { variant: "outline", children: "\u8DF3\u8FC7" }) : null
          ] }),
          /* @__PURE__ */ jsx27("p", { className: "leading-relaxed text-(--ui-text-secondary)", children: target.message }),
          target.status === "skipped" && target.note ? /* @__PURE__ */ jsx27("p", { className: "text-(--ui-text-tertiary)", children: target.note }) : null,
          approved && target.status === "pending" ? /* @__PURE__ */ jsxs25("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsx27(Button22, { size: "xs", variant: "outline", disabled: busy, onClick: () => void copyMessage(target.id, target.message), children: "\u590D\u5236" }),
            /* @__PURE__ */ jsx27(
              Button22,
              {
                size: "xs",
                disabled: busy,
                onClick: () => void apply(() => markFollowupTarget(target.id, { status: "sent" })).catch(() => void 0),
                children: "\u5DF2\u53D1"
              }
            ),
            /* @__PURE__ */ jsx27(
              Button22,
              {
                size: "xs",
                variant: "outline",
                disabled: busy,
                onClick: () => void apply(() => markFollowupTarget(target.id, { status: "skipped" })).catch(() => void 0),
                children: "\u8DF3\u8FC7"
              }
            )
          ] }) : null,
          (approved || detail.status === "done") && target.status !== "pending" ? /* @__PURE__ */ jsx27("div", { children: /* @__PURE__ */ jsx27(Button22, { size: "xs", variant: "outline", onClick: () => void copyMessage(target.id, target.message), children: "\u590D\u5236" }) }) : null
        ]
      },
      target.id
    )) }),
    actionError ? /* @__PURE__ */ jsx27("p", { className: "text-xs text-destructive", children: actionError }) : null,
    copyHint ? /* @__PURE__ */ jsx27("p", { className: "text-xs leading-relaxed text-(--ui-text-secondary)", children: copyHint }) : null,
    /* @__PURE__ */ jsx27(
      ConfirmDialog7,
      {
        open: confirmDelete,
        title: "\u5220\u9664\u8FD9\u4E2A\u8349\u7A3F",
        description: "\u540D\u5355\u4F1A\u4E00\u8D77\u5220\u6389\u3002",
        confirmLabel: "\u5220\u9664",
        onClose: () => setConfirmDelete(false),
        onConfirm: async () => {
          await deleteFollowup(id);
          onBack();
        }
      }
    ),
    /* @__PURE__ */ jsx27(
      ConfirmDialog7,
      {
        open: confirmCancel,
        title: "\u53D6\u6D88\u8FD9\u4E2A\u8DDF\u8FDB\u4EFB\u52A1",
        description: "\u53D6\u6D88\u540E\u4E0D\u80FD\u518D\u6807\u8BB0\u5DF2\u53D1\u3002",
        confirmLabel: "\u53D6\u6D88\u4EFB\u52A1",
        onClose: () => setConfirmCancel(false),
        onConfirm: async () => {
          await apply(() => cancelFollowup(id));
          setConfirmCancel(false);
        }
      }
    )
  ] });
}

// src/pages/customers/InquiryView.tsx
import { useEffect as useEffect22, useRef as useRef9, useState as useState25 } from "react";
import { Badge as Badge11, Button as Button24, ErrorState as ErrorState13, Input as Input17, Loader as Loader13, Textarea as Textarea17 } from "@hermes/plugin-sdk";

// src/pages/customers/QuoteDialog.tsx
import { useEffect as useEffect21, useMemo as useMemo2, useState as useState24 } from "react";
import {
  Button as Button23,
  Dialog as Dialog7,
  DialogContent as DialogContent7,
  DialogFooter as DialogFooter5,
  DialogHeader as DialogHeader7,
  DialogTitle as DialogTitle7,
  Input as Input16,
  Streamdown,
  Textarea as Textarea16
} from "@hermes/plugin-sdk";
import { jsx as jsx28, jsxs as jsxs26 } from "react/jsx-runtime";
var MARKDOWN_CLASS = "min-w-0 overflow-x-auto text-sm leading-relaxed text-(--ui-text-primary) [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-sm [&_h2]:font-medium [&_li]:my-0.5 [&_p]:my-1 [&_strong]:font-semibold [&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-(--ui-stroke-secondary) [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-(--ui-stroke-secondary) [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4";
function tmallPrice(card) {
  const listing = card?.listings.find((item) => item.platform === "tmall");
  return listing ? listing.price : null;
}
function lineAmount(line) {
  const quantity = Number(line.quantity);
  const price = Number(line.unit_price);
  if (!Number.isFinite(quantity) || !Number.isFinite(price)) return 0;
  return Math.round(quantity * price * 100) / 100;
}
function QuoteDialog({
  open,
  inquiry,
  cards,
  quoteId,
  onClose,
  onCreated
}) {
  const [lines, setLines] = useState24([]);
  const [validUntil, setValidUntil] = useState24(shanghaiDate(15));
  const [terms, setTerms] = useState24("");
  const [actor, setActor] = useState24(loadActor3);
  const [busy, setBusy] = useState24(false);
  const [error, setError] = useState24(null);
  const [markdown, setMarkdown] = useState24(null);
  const [number, setNumber] = useState24(null);
  const [copyHint, setCopyHint] = useState24(null);
  useEffect21(() => {
    if (!open) return;
    setError(null);
    setCopyHint(null);
    setActor(loadActor3());
    setMarkdown(null);
    setNumber(null);
    setValidUntil(shanghaiDate(15));
    setTerms("");
    setLines([{ key: 1, product_code: "", name: "", quantity: "1", unit_price: "", note: "" }]);
    if (quoteId == null) return;
    let cancelled = false;
    setBusy(true);
    getQuoteDocument(quoteId).then(
      (doc) => {
        if (cancelled) return;
        setMarkdown(doc.markdown);
        setNumber(doc.number);
        setBusy(false);
      },
      (reason) => {
        if (cancelled) return;
        setError(errorText3(reason, "\u62A5\u4EF7\u5355\u52A0\u8F7D\u5931\u8D25"));
        setBusy(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [open, quoteId]);
  const total3 = useMemo2(() => lines.reduce((sum, line) => sum + lineAmount(line), 0), [lines]);
  const update = (key, patch) => {
    setLines((current) => current.map((line) => line.key === key ? { ...line, ...patch } : line));
  };
  const fillFromCard = (code) => {
    const card = cards.find((item) => item.product_code === code);
    const price = tmallPrice(card);
    setLines((current) => [
      ...current.filter((line) => line.name.trim() || line.product_code.trim()),
      {
        key: Date.now(),
        product_code: code,
        name: card?.name ?? "",
        quantity: "1",
        unit_price: price == null ? "" : String(price),
        note: ""
      }
    ]);
  };
  const submit = async () => {
    if (inquiry == null) return;
    const items = lines.map((line) => ({
      product_code: line.product_code.trim() || null,
      name: line.name.trim(),
      quantity: Number(line.quantity),
      unit_price: Number(line.unit_price),
      note: line.note.trim() || null
    })).filter((item) => item.name);
    if (items.length === 0) {
      setError("\u8BF7\u81F3\u5C11\u586B\u4E00\u884C\u5546\u54C1");
      return;
    }
    if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 || !Number.isFinite(item.unit_price) || item.unit_price < 0)) {
      setError("\u6570\u91CF\u8981\u662F\u6B63\u6574\u6570\uFF0C\u5355\u4EF7\u4E0D\u80FD\u4E3A\u8D1F");
      return;
    }
    setBusy(true);
    setError(null);
    saveActor2(actor);
    try {
      const quote = await createQuote(inquiry.id, {
        items,
        valid_until: validUntil || null,
        terms: terms.trim() || null,
        by: actor.trim() || null
      });
      const doc = await getQuoteDocument(quote.id);
      setMarkdown(doc.markdown);
      setNumber(doc.number);
      onCreated();
    } catch (reason) {
      setError(errorText3(reason, "\u62A5\u4EF7\u5931\u8D25"));
    } finally {
      setBusy(false);
    }
  };
  const copyDoc = async () => {
    if (!markdown) return;
    const ok = await copyText(markdown);
    setCopyHint(ok ? "\u62A5\u4EF7\u5355\u5DF2\u590D\u5236" : "\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u9009\u62E9\u4E0B\u9762\u7684\u6587\u5B57");
  };
  return /* @__PURE__ */ jsx28(Dialog7, { open, onOpenChange: (value) => {
    if (!value) onClose();
  }, children: /* @__PURE__ */ jsxs26(DialogContent7, { children: [
    /* @__PURE__ */ jsx28(DialogHeader7, { children: /* @__PURE__ */ jsx28(DialogTitle7, { children: number ? `\u62A5\u4EF7\u5355 ${number}` : "\u51FA\u62A5\u4EF7\u5355" }) }),
    /* @__PURE__ */ jsx28("style", { children: PRINT_STYLE }),
    markdown ? /* @__PURE__ */ jsxs26("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx28("div", { "data-quote-print": true, className: MARKDOWN_CLASS, children: /* @__PURE__ */ jsx28(Streamdown, { mode: "static", controls: false, parseIncompleteMarkdown: false, children: markdown }) }),
      /* @__PURE__ */ jsxs26("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsx28(Button23, { size: "xs", variant: "outline", onClick: () => void copyDoc(), children: "\u590D\u5236" }),
        /* @__PURE__ */ jsx28(Button23, { size: "xs", variant: "outline", onClick: () => window.print(), children: "\u6253\u5370" })
      ] }),
      copyHint ? /* @__PURE__ */ jsx28("p", { className: "text-xs text-(--ui-text-secondary)", children: copyHint }) : null
    ] }) : /* @__PURE__ */ jsxs26("div", { className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxs26("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx28("span", { className: "text-xs text-(--ui-text-secondary)", children: "\u7F72\u540D" }),
        /* @__PURE__ */ jsx28(Input16, { "aria-label": "\u7F72\u540D", value: actor, onChange: (event) => setActor(event.target.value), style: { width: "7rem" } })
      ] }),
      inquiry && inquiry.product_codes.length > 0 ? /* @__PURE__ */ jsxs26("div", { className: "flex flex-wrap items-center gap-1", children: [
        /* @__PURE__ */ jsx28("span", { className: "text-xs text-(--ui-text-tertiary)", children: "\u4ECE\u8BE2\u76D8\u5E26\u5165" }),
        inquiry.product_codes.map((code) => /* @__PURE__ */ jsx28(Button23, { size: "xs", variant: "outline", onClick: () => fillFromCard(code), children: code }, code))
      ] }) : null,
      /* @__PURE__ */ jsx28("ul", { className: "flex flex-col gap-2", children: lines.map((line) => /* @__PURE__ */ jsxs26("li", { className: "grid grid-cols-2 gap-2 rounded-md border border-(--ui-stroke-secondary) p-2", children: [
        /* @__PURE__ */ jsx28(Input16, { "aria-label": "\u5546\u54C1\u7F16\u7801", placeholder: "\u5546\u54C1\u7F16\u7801", value: line.product_code, onChange: (event) => update(line.key, { product_code: event.target.value }) }),
        /* @__PURE__ */ jsx28(Input16, { "aria-label": "\u5546\u54C1\u540D\u79F0", placeholder: "\u5546\u54C1\u540D\u79F0", value: line.name, onChange: (event) => update(line.key, { name: event.target.value }) }),
        /* @__PURE__ */ jsx28(Input16, { "aria-label": "\u6570\u91CF", placeholder: "\u6570\u91CF", value: line.quantity, onChange: (event) => update(line.key, { quantity: event.target.value }) }),
        /* @__PURE__ */ jsx28(Input16, { "aria-label": "\u5355\u4EF7", placeholder: "\u5355\u4EF7", value: line.unit_price, onChange: (event) => update(line.key, { unit_price: event.target.value }) }),
        /* @__PURE__ */ jsx28(Input16, { "aria-label": "\u884C\u5907\u6CE8", placeholder: "\u5907\u6CE8", value: line.note, onChange: (event) => update(line.key, { note: event.target.value }) }),
        /* @__PURE__ */ jsxs26("div", { className: "flex items-center justify-between gap-2 text-xs text-(--ui-text-secondary)", children: [
          /* @__PURE__ */ jsxs26("span", { children: [
            formatMoney(lineAmount(line)),
            " \u5143"
          ] }),
          /* @__PURE__ */ jsx28(Button23, { size: "xs", variant: "ghost", onClick: () => setLines((current) => current.filter((item) => item.key !== line.key)), children: "\u5220\u9664" })
        ] })
      ] }, line.key)) }),
      /* @__PURE__ */ jsx28("div", { children: /* @__PURE__ */ jsx28(
        Button23,
        {
          size: "xs",
          variant: "outline",
          onClick: () => setLines((current) => [
            ...current,
            { key: Date.now(), product_code: "", name: "", quantity: "1", unit_price: "", note: "" }
          ]),
          children: "\u52A0\u4E00\u884C"
        }
      ) }),
      /* @__PURE__ */ jsxs26("div", { className: "flex flex-wrap items-end gap-3", children: [
        /* @__PURE__ */ jsxs26("label", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
          "\u6709\u6548\u671F",
          /* @__PURE__ */ jsx28(Input16, { "aria-label": "\u6709\u6548\u671F", type: "date", value: validUntil, onChange: (event) => setValidUntil(event.target.value) })
        ] }),
        /* @__PURE__ */ jsxs26("span", { className: "text-sm font-medium", children: [
          "\u5408\u8BA1 ",
          formatMoney(total3),
          " \u5143"
        ] })
      ] }),
      /* @__PURE__ */ jsx28(Textarea16, { "aria-label": "\u8BF4\u660E", placeholder: "\u8BF4\u660E", value: terms, onChange: (event) => setTerms(event.target.value) })
    ] }),
    error ? /* @__PURE__ */ jsx28("p", { className: "text-xs text-destructive", children: error }) : null,
    /* @__PURE__ */ jsxs26(DialogFooter5, { children: [
      /* @__PURE__ */ jsx28(Button23, { size: "sm", variant: "outline", onClick: onClose, children: "\u5173\u95ED" }),
      markdown ? null : /* @__PURE__ */ jsx28(Button23, { size: "sm", disabled: busy, onClick: () => void submit(), children: busy ? "\u6B63\u5728\u63D0\u4EA4" : "\u751F\u6210\u62A5\u4EF7\u5355" })
    ] })
  ] }) });
}
var PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  [data-quote-print], [data-quote-print] * { visibility: visible !important; }
  [data-quote-print] { position: absolute; left: 0; top: 0; width: 100%; }
}
`;

// src/pages/customers/InquiryView.tsx
import { jsx as jsx29, jsxs as jsxs27 } from "react/jsx-runtime";
function InquiryView({ id, onBack }) {
  const root = useRef9(null);
  const [detail, setDetail] = useState25(null);
  const [products, setProducts] = useState25(null);
  const [error, setError] = useState25(null);
  const [revision, setRevision] = useState25(0);
  const [narrow, setNarrow] = useState25(false);
  const [sideWidth, setSideWidth] = useState25(300);
  const [actor, setActor] = useState25(loadActor3);
  const [note, setNote] = useState25("");
  const [lostReason, setLostReason] = useState25("");
  const [losing, setLosing] = useState25(false);
  const [busy, setBusy] = useState25(false);
  const [actionError, setActionError] = useState25(null);
  const [quoting, setQuoting] = useState25(false);
  const [viewQuoteId, setViewQuoteId] = useState25(null);
  useEffect22(() => {
    const el = root.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setNarrow(width < 640);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [detail]);
  useEffect22(() => {
    let cancelled = false;
    setError(null);
    setActionError(null);
    setLosing(false);
    Promise.all([getInquiry(id), getInquiryProducts(id)]).then(
      ([next, side]) => {
        if (cancelled) return;
        setDetail(next);
        setProducts(side);
      },
      (reason) => {
        if (!cancelled) setError(reason);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [id, revision]);
  const reload = () => setRevision((value) => value + 1);
  const runStatus = async (status2, reason) => {
    setBusy(true);
    setActionError(null);
    saveActor2(actor);
    try {
      const next = await setInquiryStatus(id, { status: status2, by: actor.trim() || null, reason: reason ?? null });
      setDetail(next);
      setLosing(false);
      setLostReason("");
      void refreshOpenInquiryCount();
    } catch (reasonError) {
      setActionError(errorText3(reasonError, "\u64CD\u4F5C\u5931\u8D25"));
    } finally {
      setBusy(false);
    }
  };
  const submitLost = () => {
    if (!lostReason.trim()) {
      setActionError("\u8BF7\u586B\u5199\u4E22\u5355\u539F\u56E0");
      return;
    }
    void runStatus("lost", lostReason.trim());
  };
  if (error) {
    return /* @__PURE__ */ jsx29("div", { className: "flex flex-1 items-center justify-center py-10", children: /* @__PURE__ */ jsxs27(
      ErrorState13,
      {
        title: isOfflineError(error) ? "\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1" : "\u8BE2\u76D8\u52A0\u8F7D\u5931\u8D25",
        description: errorText3(error, "\u8BF7\u91CD\u8BD5"),
        children: [
          /* @__PURE__ */ jsx29(Button24, { size: "sm", variant: "outline", onClick: onBack, children: "\u8FD4\u56DE" }),
          /* @__PURE__ */ jsx29(Button24, { size: "sm", variant: "outline", onClick: reload, children: "\u91CD\u8BD5" })
        ]
      }
    ) });
  }
  if (!detail) {
    return /* @__PURE__ */ jsxs27("div", { ref: root, className: "flex items-center gap-2 py-6 text-xs text-(--ui-text-tertiary)", children: [
      /* @__PURE__ */ jsx29(Loader13, {}),
      "\u6B63\u5728\u8BFB\u53D6\u8BE2\u76D8"
    ] });
  }
  const status = detail.status;
  const canReply = status === "new" || status === "quoted" || status === "lost";
  const canQuote = status === "new" || status === "replied" || status === "quoted";
  const canWin = status === "new" || status === "replied" || status === "quoted";
  const canLose = status === "new" || status === "replied" || status === "quoted";
  return /* @__PURE__ */ jsxs27("div", { ref: root, className: "flex min-w-0 flex-1 flex-col gap-3", children: [
    /* @__PURE__ */ jsxs27("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx29(Button24, { size: "xs", variant: "outline", onClick: onBack, children: "\u8FD4\u56DE" }),
      /* @__PURE__ */ jsx29("h2", { className: "min-w-0 text-sm font-medium", children: detail.company || detail.contact || "\u8BE2\u76D8" }),
      /* @__PURE__ */ jsx29(Badge11, { variant: inquiryStatusVariant(status), children: inquiryStatusLabel(status) }),
      detail.stale ? /* @__PURE__ */ jsx29(Badge11, { variant: "warn", children: "\u8D85\u8FC7 7 \u5929\u672A\u8DDF\u8FDB" }) : null,
      /* @__PURE__ */ jsxs27("span", { className: "text-xs text-(--ui-text-tertiary)", children: [
        channelLabel(detail.channel),
        " \xB7 ",
        detail.assignee || "\u672A\u6307\u5B9A\u8D1F\u8D23\u4EBA"
      ] })
    ] }),
    /* @__PURE__ */ jsxs27("div", { className: narrow ? "flex min-w-0 flex-col gap-3" : "flex min-w-0 items-start gap-0", children: [
      /* @__PURE__ */ jsxs27("div", { className: "flex min-w-0 flex-1 flex-col gap-4", children: [
        /* @__PURE__ */ jsxs27("section", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx29("h3", { className: "text-xs font-medium", children: "\u8BE2\u76D8\u539F\u6587" }),
          /* @__PURE__ */ jsx29("p", { className: "text-xs leading-relaxed whitespace-pre-wrap text-(--ui-text-secondary)", children: detail.content }),
          /* @__PURE__ */ jsxs27("p", { className: "text-xs text-(--ui-text-tertiary)", children: [
            detail.contact || "\u672A\u7559\u8054\u7CFB\u4EBA",
            detail.phone ? ` \xB7 ${detail.phone}` : "",
            detail.product_codes.length > 0 ? ` \xB7 ${detail.product_codes.join("\u3001")}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxs27("section", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx29("h3", { className: "text-xs font-medium", children: "\u5907\u6CE8" }),
          detail.note ? /* @__PURE__ */ jsx29("p", { className: "text-xs leading-relaxed whitespace-pre-wrap text-(--ui-text-secondary)", children: detail.note }) : null,
          detail.lost_reason ? /* @__PURE__ */ jsxs27("p", { className: "text-xs text-destructive", children: [
            "\u4E22\u5355\u539F\u56E0\uFF1A",
            detail.lost_reason
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxs27("section", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx29("h3", { className: "text-xs font-medium", children: "\u62A5\u4EF7\u5355" }),
          detail.quotes.length === 0 ? /* @__PURE__ */ jsx29("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD8\u6CA1\u6709\u62A5\u4EF7\u5355\u3002" }) : /* @__PURE__ */ jsx29("ul", { children: detail.quotes.map((quote) => /* @__PURE__ */ jsxs27("li", { className: "flex flex-wrap items-center gap-2 border-b border-(--ui-stroke-secondary) py-1.5 text-xs", children: [
            /* @__PURE__ */ jsx29("span", { children: quote.number }),
            /* @__PURE__ */ jsxs27("span", { className: "text-(--ui-text-secondary)", children: [
              formatMoney(quote.total),
              " \u5143"
            ] }),
            /* @__PURE__ */ jsxs27("span", { className: "text-(--ui-text-tertiary)", children: [
              "\u6709\u6548\u671F ",
              quote.valid_until || "\u2014"
            ] }),
            /* @__PURE__ */ jsx29(Button24, { size: "xs", variant: "outline", onClick: () => setViewQuoteId(quote.id), children: "\u67E5\u770B" })
          ] }, quote.id)) })
        ] }),
        /* @__PURE__ */ jsxs27("section", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx29("h3", { className: "text-xs font-medium", children: "\u5904\u7406\u8BB0\u5F55" }),
          detail.events.length === 0 ? /* @__PURE__ */ jsx29("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD8\u6CA1\u6709\u5904\u7406\u8BB0\u5F55\u3002" }) : /* @__PURE__ */ jsx29("ul", { children: detail.events.map((event, index) => /* @__PURE__ */ jsxs27("li", { className: "border-b border-(--ui-stroke-secondary) py-1.5 text-xs text-(--ui-text-tertiary)", children: [
            formatShanghai2(event.at),
            " \xB7 ",
            event.by || "\u6709\u4EBA",
            " \xB7 ",
            event.text
          ] }, `${event.at}-${index}`)) })
        ] })
      ] }),
      narrow ? null : /* @__PURE__ */ jsx29(
        "div",
        {
          role: "separator",
          "aria-orientation": "vertical",
          "aria-label": "\u62D6\u52A8\u8C03\u6574\u8D44\u6599\u680F\u5BBD\u5EA6",
          className: "mx-2 w-1 shrink-0 cursor-col-resize self-stretch bg-(--ui-stroke-secondary)",
          onPointerDown: (event) => {
            const startX = event.clientX;
            const startW = sideWidth;
            const move = (ev) => {
              setSideWidth(Math.min(480, Math.max(200, startW - (ev.clientX - startX))));
            };
            const up = () => {
              window.removeEventListener("pointermove", move);
              window.removeEventListener("pointerup", up);
            };
            window.addEventListener("pointermove", move);
            window.addEventListener("pointerup", up);
          }
        }
      ),
      /* @__PURE__ */ jsx29("aside", { className: "min-w-0", style: narrow ? void 0 : { width: sideWidth }, children: /* @__PURE__ */ jsx29(ProductSide, { products }) })
    ] }),
    /* @__PURE__ */ jsxs27("div", { className: "flex flex-col gap-2 border-t border-(--ui-stroke-secondary) pt-3", children: [
      /* @__PURE__ */ jsxs27("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx29("span", { className: "text-xs text-(--ui-text-secondary)", children: "\u7F72\u540D" }),
        /* @__PURE__ */ jsx29(Input17, { "aria-label": "\u7F72\u540D", value: actor, onChange: (event) => setActor(event.target.value), style: { width: "7rem" } })
      ] }),
      /* @__PURE__ */ jsxs27("div", { className: "flex flex-wrap gap-2", children: [
        canReply ? /* @__PURE__ */ jsx29(Button24, { size: "xs", disabled: busy, onClick: () => void runStatus("replied"), children: "\u5DF2\u56DE\u590D" }) : null,
        canQuote ? /* @__PURE__ */ jsx29(Button24, { size: "xs", variant: "outline", disabled: busy, onClick: () => setQuoting(true), children: "\u51FA\u62A5\u4EF7\u5355" }) : null,
        canWin ? /* @__PURE__ */ jsx29(Button24, { size: "xs", variant: "outline", disabled: busy, onClick: () => void runStatus("won"), children: "\u6210\u4EA4" }) : null,
        canLose ? /* @__PURE__ */ jsx29(Button24, { size: "xs", variant: "outline", disabled: busy, onClick: () => setLosing(true), children: "\u4E22\u5355" }) : null
      ] }),
      losing ? /* @__PURE__ */ jsxs27("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsx29(Textarea17, { "aria-label": "\u4E22\u5355\u539F\u56E0", placeholder: "\u4E22\u5355\u539F\u56E0", value: lostReason, onChange: (event) => setLostReason(event.target.value) }),
        /* @__PURE__ */ jsxs27("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx29(Button24, { size: "xs", disabled: busy, onClick: submitLost, children: "\u786E\u8BA4\u4E22\u5355" }),
          /* @__PURE__ */ jsx29(Button24, { size: "xs", variant: "outline", onClick: () => setLosing(false), children: "\u53D6\u6D88" })
        ] })
      ] }) : null,
      /* @__PURE__ */ jsx29(Textarea17, { "aria-label": "\u8FFD\u52A0\u5907\u6CE8", placeholder: "\u8FFD\u52A0\u4E00\u6761\u5907\u6CE8", value: note, onChange: (event) => setNote(event.target.value) }),
      /* @__PURE__ */ jsx29("div", { children: /* @__PURE__ */ jsx29(
        Button24,
        {
          size: "xs",
          variant: "outline",
          disabled: busy || !note.trim(),
          onClick: () => {
            setBusy(true);
            setActionError(null);
            saveActor2(actor);
            void addInquiryNote(id, note.trim(), actor.trim() || null).then((next) => {
              setDetail(next);
              setNote("");
            }).catch((reason) => setActionError(errorText3(reason, "\u5907\u6CE8\u5931\u8D25"))).finally(() => setBusy(false));
          },
          children: "\u52A0\u5907\u6CE8"
        }
      ) }),
      actionError ? /* @__PURE__ */ jsx29("p", { className: "text-xs text-destructive", children: actionError }) : null
    ] }),
    /* @__PURE__ */ jsx29(
      QuoteDialog,
      {
        open: quoting || viewQuoteId != null,
        inquiry: detail,
        cards: products?.cards ?? [],
        quoteId: viewQuoteId,
        onClose: () => {
          setQuoting(false);
          setViewQuoteId(null);
        },
        onCreated: reload
      }
    )
  ] });
}
function ProductSide({ products }) {
  if (!products) {
    return /* @__PURE__ */ jsx29("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u6B63\u5728\u8BFB\u53D6\u8D44\u6599\u5361" });
  }
  return /* @__PURE__ */ jsxs27("div", { className: "flex flex-col gap-3", children: [
    /* @__PURE__ */ jsx29("h3", { className: "text-xs font-medium", children: "\u8D44\u6599" }),
    products.missing.map((item) => /* @__PURE__ */ jsxs27("p", { className: "text-xs text-(--ui-text-secondary)", children: [
      item.product_code,
      "\uFF1A\u8FD8\u6CA1\u6709\u8D44\u6599\u5361",
      item.listed ? "\uFF08\u5E97\u94FA\u91CC\u6709\u8FD9\u4E2A\u5546\u54C1\uFF09" : ""
    ] }, item.product_code)),
    products.cards.length === 0 && products.missing.length === 0 ? /* @__PURE__ */ jsx29("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD9\u6761\u8BE2\u76D8\u6CA1\u6709\u5546\u54C1\u7F16\u7801\u3002" }) : null,
    products.cards.map((card) => /* @__PURE__ */ jsx29(ProductCardBlock, { card }, card.id))
  ] });
}
function ProductCardBlock({ card }) {
  return /* @__PURE__ */ jsxs27("section", { className: "flex flex-col gap-1 border-b border-(--ui-stroke-secondary) pb-2 text-xs", children: [
    /* @__PURE__ */ jsxs27("p", { className: "font-medium", children: [
      card.product_code,
      " \xB7 ",
      card.name
    ] }),
    card.selling_points.length > 0 ? /* @__PURE__ */ jsx29("ul", { className: "list-disc pl-4 text-(--ui-text-secondary)", children: card.selling_points.map((point) => /* @__PURE__ */ jsx29("li", { children: point }, point)) }) : null,
    card.specs ? /* @__PURE__ */ jsx29("p", { className: "whitespace-pre-wrap text-(--ui-text-secondary)", children: card.specs }) : null,
    card.faq.map((item) => /* @__PURE__ */ jsxs27("p", { className: "text-(--ui-text-secondary)", children: [
      /* @__PURE__ */ jsx29("span", { className: "text-(--ui-text-primary)", children: item.q }),
      " ",
      item.a
    ] }, item.q)),
    card.listings.map((listing) => /* @__PURE__ */ jsxs27("p", { className: "text-(--ui-text-tertiary)", children: [
      listing.shop_name,
      " \xB7 ",
      platformName(listing.platform),
      " \xB7 ",
      formatMoney(listing.price),
      " \u5143 \xB7 \u5E93\u5B58 ",
      listing.stock
    ] }, `${listing.shop_id}-${listing.sku}`))
  ] });
}

// src/pages/customers/CustomersPage.tsx
import { jsx as jsx30, jsxs as jsxs28 } from "react/jsx-runtime";
var TABS = [
  { id: "members", label: "\u4F1A\u5458" },
  { id: "inquiries", label: "\u8BE2\u76D8" },
  { id: "all", label: "\u5168\u90E8\u5BA2\u6237" }
];
var INQUIRY_FILTERS = [
  { id: "open", label: "\u672A\u5173\u95ED" },
  { id: "all", label: "\u5168\u90E8" },
  { id: "new", label: "\u65B0\u8BE2\u76D8" },
  { id: "replied", label: "\u5DF2\u56DE\u590D" },
  { id: "quoted", label: "\u5DF2\u62A5\u4EF7" },
  { id: "won", label: "\u6210\u4EA4" },
  { id: "lost", label: "\u4E22\u5355" }
];
var PAGE_SIZE = 50;
function CustomersPage() {
  const [screen, setScreen] = useState26({ name: "members" });
  if (screen.name === "followup") {
    return /* @__PURE__ */ jsx30(FollowupView, { id: screen.id, onBack: () => setScreen({ name: "members" }) });
  }
  if (screen.name === "inquiry") {
    return /* @__PURE__ */ jsx30(InquiryView, { id: screen.id, onBack: () => setScreen({ name: screen.from }) });
  }
  return /* @__PURE__ */ jsx30(
    CustomerHome,
    {
      tab: screen.name,
      onTab: (tab) => setScreen({ name: tab }),
      onOpenFollowup: (id) => setScreen({ name: "followup", id }),
      onOpenInquiry: (id, from) => setScreen({ name: "inquiry", id, from })
    }
  );
}
function CustomerHome({
  tab,
  onTab,
  onOpenFollowup,
  onOpenInquiry
}) {
  const apiBase = useApiBase();
  const [segment, setSegment] = useState26("new");
  const [kind, setKind] = useState26("all");
  const [qInput, setQInput] = useState26("");
  const [q, setQ] = useState26("");
  const [page, setPage] = useState26(1);
  const [inquiryStatus, setInquiryStatus2] = useState26("open");
  const [inquiryQInput, setInquiryQInput] = useState26("");
  const [inquiryQ, setInquiryQ] = useState26("");
  const [customerId, setCustomerId] = useState26(null);
  const [followupOpen, setFollowupOpen] = useState26(false);
  const [inquiryOpen, setInquiryOpen] = useState26(false);
  const [businessOpen, setBusinessOpen] = useState26(false);
  useEffect23(() => {
    const timer9 = window.setTimeout(() => setQ(qInput.trim()), 300);
    return () => window.clearTimeout(timer9);
  }, [qInput]);
  useEffect23(() => {
    const timer9 = window.setTimeout(() => setInquiryQ(inquiryQInput.trim()), 300);
    return () => window.clearTimeout(timer9);
  }, [inquiryQInput]);
  const summaryQuery = useQuery(() => getSegmentSummary(), [apiBase]);
  const customerQuery = useQuery(
    () => listCustomers({
      segment: tab === "members" && segment ? segment : void 0,
      kind: tab === "members" && !segment ? "member" : tab === "all" && kind !== "all" ? kind : void 0,
      q: q || void 0,
      page,
      page_size: PAGE_SIZE
    }),
    [apiBase, tab, segment, kind, q, page]
  );
  const followupQuery = useQuery(() => listFollowups(), [apiBase]);
  const inquiryQuery = useQuery(
    () => listInquiries({ status: inquiryStatus === "all" ? void 0 : inquiryStatus, q: inquiryQ || void 0 }),
    [apiBase, inquiryStatus, inquiryQ]
  );
  const reload = () => {
    summaryQuery.reload();
    customerQuery.reload();
    followupQuery.reload();
    inquiryQuery.reload();
    void refreshOpenInquiryCount();
  };
  const error = summaryQuery.error ?? (tab === "inquiries" ? inquiryQuery.error : customerQuery.error) ?? (tab === "members" ? followupQuery.error : null);
  const offline = isOfflineError(error);
  return /* @__PURE__ */ jsxs28("div", { className: "flex min-h-0 min-w-0 flex-1 flex-col gap-3", children: [
    /* @__PURE__ */ jsxs28(HeaderActions, { children: [
      tab === "members" ? /* @__PURE__ */ jsx30(Button25, { size: "sm", onClick: () => setFollowupOpen(true), children: "\u6279\u91CF\u8DDF\u8FDB" }) : null,
      tab === "inquiries" ? /* @__PURE__ */ jsx30(Button25, { size: "sm", onClick: () => setInquiryOpen(true), children: "\u65B0\u5EFA\u8BE2\u76D8" }) : null,
      tab === "all" ? /* @__PURE__ */ jsx30(Button25, { size: "sm", onClick: () => setBusinessOpen(true), children: "\u65B0\u5EFA\u4F01\u4E1A\u5BA2\u6237" }) : null
    ] }),
    /* @__PURE__ */ jsx30(
      SegmentedControl8,
      {
        options: TABS,
        value: tab,
        sizing: "content",
        onChange: (next) => {
          setPage(1);
          onTab(next);
        }
      }
    ),
    offline ? /* @__PURE__ */ jsx30(OfflineNotice, { detail: error instanceof Error ? error.message : void 0, onRetry: reload }) : null,
    !offline && error ? /* @__PURE__ */ jsx30("div", { className: "flex flex-1 items-center justify-center py-10", children: /* @__PURE__ */ jsx30(ErrorState14, { title: "\u5BA2\u6237\u52A0\u8F7D\u5931\u8D25", description: errorText3(error, "\u8BF7\u91CD\u8BD5"), children: /* @__PURE__ */ jsx30(Button25, { size: "sm", variant: "outline", onClick: reload, children: "\u91CD\u8BD5" }) }) }) : null,
    !offline && !error && tab === "members" ? /* @__PURE__ */ jsx30(
      MemberPane,
      {
        segments: summaryQuery.data?.segments,
        loadingSummary: summaryQuery.loading && !summaryQuery.data,
        selected: segment,
        onSelect: (value) => {
          setSegment(value);
          setPage(1);
        },
        customers: customerQuery.data?.items ?? [],
        total: customerQuery.data?.total ?? 0,
        page,
        loading: customerQuery.loading && !customerQuery.data,
        q: qInput,
        onQ: (value) => {
          setQInput(value);
          setPage(1);
        },
        onPage: setPage,
        onOpen: setCustomerId,
        followups: followupQuery.data ?? [],
        followupsLoading: followupQuery.loading && !followupQuery.data,
        onOpenFollowup
      }
    ) : null,
    !offline && !error && tab === "all" ? /* @__PURE__ */ jsxs28("div", { className: "flex min-w-0 flex-col gap-3", children: [
      /* @__PURE__ */ jsxs28("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx30(
          SegmentedControl8,
          {
            className: "max-w-full flex-wrap",
            options: [
              { id: "all", label: "\u5168\u90E8" },
              { id: "member", label: "\u4F1A\u5458" },
              { id: "business", label: "\u4F01\u4E1A" }
            ],
            value: kind,
            sizing: "content",
            onChange: (value) => {
              setKind(value);
              setPage(1);
            }
          }
        ),
        /* @__PURE__ */ jsx30(
          SearchField3,
          {
            "aria-label": "\u641C\u7D22\u5BA2\u6237",
            placeholder: "\u59D3\u540D\u3001\u516C\u53F8\u3001\u624B\u673A\u3001\u8BA2\u5355\u53F7\u3001\u5546\u54C1",
            value: qInput,
            onChange: (value) => {
              setQInput(value);
              setPage(1);
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsx30(
        CustomerList,
        {
          items: customerQuery.data?.items ?? [],
          total: customerQuery.data?.total ?? 0,
          page,
          loading: customerQuery.loading && !customerQuery.data,
          onPage: setPage,
          onOpen: setCustomerId,
          empty: "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u5BA2\u6237"
        }
      )
    ] }) : null,
    !offline && !error && tab === "inquiries" ? /* @__PURE__ */ jsx30(
      InquiryPane,
      {
        items: inquiryQuery.data ?? [],
        loading: inquiryQuery.loading && !inquiryQuery.data,
        status: inquiryStatus,
        onStatus: setInquiryStatus2,
        q: inquiryQInput,
        onQ: setInquiryQInput,
        onOpen: (id) => onOpenInquiry(id, "inquiries")
      }
    ) : null,
    /* @__PURE__ */ jsx30(
      CustomerDrawer,
      {
        customerId,
        onClose: () => setCustomerId(null),
        onSaved: () => customerQuery.reload(),
        onOpenInquiry: (id) => {
          setCustomerId(null);
          onOpenInquiry(id, tab);
        }
      }
    ),
    /* @__PURE__ */ jsx30(
      FollowupDialog,
      {
        open: followupOpen,
        defaultSegment: segment ?? "new",
        onClose: () => setFollowupOpen(false),
        onCreated: (id) => {
          setFollowupOpen(false);
          followupQuery.reload();
          onOpenFollowup(id);
        }
      }
    ),
    /* @__PURE__ */ jsx30(
      InquiryDialog,
      {
        open: inquiryOpen,
        onClose: () => setInquiryOpen(false),
        onCreated: (id) => {
          setInquiryOpen(false);
          inquiryQuery.reload();
          void refreshOpenInquiryCount();
          onOpenInquiry(id, "inquiries");
        }
      }
    ),
    /* @__PURE__ */ jsx30(
      BusinessDialog,
      {
        open: businessOpen,
        onClose: () => setBusinessOpen(false),
        onCreated: (id) => {
          setBusinessOpen(false);
          customerQuery.reload();
          summaryQuery.reload();
          setCustomerId(id);
        }
      }
    )
  ] });
}
function MemberPane({
  segments,
  loadingSummary,
  selected,
  onSelect,
  customers,
  total: total3,
  page,
  loading,
  q,
  onQ,
  onPage,
  onOpen,
  followups,
  followupsLoading,
  onOpenFollowup
}) {
  const cards = segments ?? SEGMENTS.map((item) => ({ segment: item.id, label: item.label, count: 0, rule: "" }));
  return /* @__PURE__ */ jsxs28("div", { className: "flex min-w-0 flex-col gap-3", children: [
    /* @__PURE__ */ jsx30("div", { className: "grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2", children: loadingSummary ? Array.from({ length: 4 }, (_, index) => /* @__PURE__ */ jsx30(Skeleton3, { className: "h-14 w-full" }, index)) : cards.map((card) => {
      const active = selected === card.segment;
      return /* @__PURE__ */ jsxs28(
        "button",
        {
          type: "button",
          "aria-pressed": active,
          onClick: () => onSelect(active ? null : card.segment),
          className: active ? "flex min-w-0 flex-col items-start gap-1 rounded-lg border border-(--ui-accent) bg-(--ui-bg-quinary) px-3 py-2 text-left" : "flex min-w-0 flex-col items-start gap-1 rounded-lg border border-(--ui-stroke-secondary) px-3 py-2 text-left hover:bg-(--ui-bg-quinary)",
          children: [
            /* @__PURE__ */ jsxs28("span", { className: "inline-flex items-center gap-1.5 text-xs text-(--ui-text-secondary)", children: [
              card.label,
              /* @__PURE__ */ jsx30(Badge12, { variant: "outline", children: card.count })
            ] }),
            /* @__PURE__ */ jsx30(Tip5, { label: card.rule || card.label, children: /* @__PURE__ */ jsx30("span", { className: "truncate text-[0.6875rem] text-(--ui-text-tertiary)", children: card.rule }) })
          ]
        },
        card.segment
      );
    }) }),
    /* @__PURE__ */ jsx30(SearchField3, { "aria-label": "\u641C\u7D22\u5BA2\u6237", placeholder: "\u59D3\u540D\u3001\u516C\u53F8\u3001\u624B\u673A\u3001\u8BA2\u5355\u53F7\u3001\u5546\u54C1", value: q, onChange: onQ }),
    /* @__PURE__ */ jsx30(
      CustomerList,
      {
        items: customers,
        total: total3,
        page,
        loading,
        onPage,
        onOpen,
        empty: "\u8FD9\u4E00\u5C42\u8FD8\u6CA1\u6709\u5BA2\u6237"
      }
    ),
    /* @__PURE__ */ jsxs28("section", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx30("h3", { className: "text-xs font-medium", children: "\u8DDF\u8FDB\u4EFB\u52A1" }),
      followupsLoading ? /* @__PURE__ */ jsx30(Skeleton3, { className: "h-10 w-full" }) : null,
      !followupsLoading && followups.length === 0 ? /* @__PURE__ */ jsx30("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD8\u6CA1\u6709\u8DDF\u8FDB\u4EFB\u52A1\u3002\u9009\u4E00\u4E2A\u5206\u5C42\uFF0C\u5199\u597D\u8BDD\u672F\u540E\u6279\u91CF\u751F\u6210\u3002" }) : null,
      /* @__PURE__ */ jsx30("ul", { children: followups.map((item) => /* @__PURE__ */ jsx30("li", { children: /* @__PURE__ */ jsxs28(
        "button",
        {
          type: "button",
          onClick: () => onOpenFollowup(item.id),
          className: "flex w-full flex-wrap items-center gap-x-2 gap-y-1 border-b border-(--ui-stroke-secondary) px-2 py-2 text-left text-xs hover:bg-(--ui-bg-quinary)",
          children: [
            /* @__PURE__ */ jsx30("span", { className: "font-medium", children: item.name }),
            /* @__PURE__ */ jsxs28("span", { className: "text-(--ui-text-tertiary)", children: [
              segmentLabel(item.segment),
              " \xB7 ",
              channelLabel(item.channel)
            ] }),
            /* @__PURE__ */ jsx30(Badge12, { variant: followupStatusVariant(item.status), children: followupStatusLabel(item.status) }),
            /* @__PURE__ */ jsxs28("span", { className: "text-(--ui-text-tertiary)", children: [
              "\u5F85\u53D1 ",
              item.counts.pending,
              " / \u5DF2\u53D1 ",
              item.counts.sent,
              " / \u8DF3\u8FC7 ",
              item.counts.skipped
            ] })
          ]
        }
      ) }, item.id)) })
    ] })
  ] });
}
function CustomerList({
  items,
  total: total3,
  page,
  loading,
  onPage,
  onOpen,
  empty
}) {
  if (loading) {
    return /* @__PURE__ */ jsx30("div", { className: "flex flex-col gap-2", children: Array.from({ length: 6 }, (_, index) => /* @__PURE__ */ jsx30(Skeleton3, { className: "h-12 w-full" }, index)) });
  }
  if (items.length === 0) {
    return /* @__PURE__ */ jsx30("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx30(EmptyState6, { title: empty, description: "\u6362\u4E2A\u7B5B\u9009\uFF0C\u6216\u5148\u5BFC\u5165\u8BA2\u5355\u3002" }) });
  }
  const pages = Math.max(1, Math.ceil(total3 / PAGE_SIZE));
  return /* @__PURE__ */ jsxs28("div", { className: "flex min-w-0 flex-col gap-2", children: [
    /* @__PURE__ */ jsx30("ul", { className: "min-w-0", children: items.map((item) => /* @__PURE__ */ jsx30("li", { children: /* @__PURE__ */ jsxs28(
      "button",
      {
        type: "button",
        onClick: () => onOpen(item.id),
        className: "flex w-full min-w-0 flex-col gap-1 border-b border-(--ui-stroke-secondary) px-2 py-2 text-left text-xs hover:bg-(--ui-bg-quinary)",
        children: [
          /* @__PURE__ */ jsxs28("span", { className: "flex flex-wrap items-center gap-x-2 gap-y-1", children: [
            /* @__PURE__ */ jsx30("span", { className: "font-medium", children: item.name || "\u672A\u7559\u59D3\u540D" }),
            /* @__PURE__ */ jsx30("span", { className: "text-(--ui-text-secondary)", children: item.phone || "\u65E0\u624B\u673A\u53F7" }),
            item.company ? /* @__PURE__ */ jsx30("span", { className: "text-(--ui-text-tertiary)", children: item.company }) : null,
            /* @__PURE__ */ jsx30("span", { className: "text-(--ui-text-tertiary)", children: item.wecom_added ? "\u4F01\u5FAE\u5DF2\u52A0" : "\u4F01\u5FAE\u672A\u52A0" }),
            item.segments.map((seg) => /* @__PURE__ */ jsx30(Badge12, { variant: "outline", children: segmentLabel(seg) }, seg))
          ] }),
          /* @__PURE__ */ jsxs28("span", { className: "flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-(--ui-text-secondary)", children: [
            /* @__PURE__ */ jsxs28("span", { children: [
              item.order_count,
              " \u5355"
            ] }),
            /* @__PURE__ */ jsxs28("span", { children: [
              formatMoney(item.total),
              " \u5143"
            ] }),
            /* @__PURE__ */ jsxs28("span", { className: "min-w-0 truncate", children: [
              formatShanghaiDate(item.last_paid_at),
              " ",
              item.last_title || ""
            ] })
          ] }),
          /* @__PURE__ */ jsx30("span", { className: "truncate text-(--ui-text-tertiary)", children: item.shops.join("\u3001") || "\u2014" })
        ]
      }
    ) }, item.id)) }),
    pages > 1 ? /* @__PURE__ */ jsxs28("div", { className: "flex flex-wrap items-center gap-2 text-xs text-(--ui-text-secondary)", children: [
      /* @__PURE__ */ jsx30(Button25, { size: "xs", variant: "outline", disabled: page <= 1, onClick: () => onPage(page - 1), children: "\u4E0A\u4E00\u9875" }),
      /* @__PURE__ */ jsxs28("span", { children: [
        page,
        " / ",
        pages
      ] }),
      /* @__PURE__ */ jsx30(Button25, { size: "xs", variant: "outline", disabled: page >= pages, onClick: () => onPage(page + 1), children: "\u4E0B\u4E00\u9875" })
    ] }) : null
  ] });
}
function InquiryPane({
  items,
  loading,
  status,
  onStatus,
  q,
  onQ,
  onOpen
}) {
  return /* @__PURE__ */ jsxs28("div", { className: "flex min-w-0 flex-col gap-3", children: [
    /* @__PURE__ */ jsxs28("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx30(
        SegmentedControl8,
        {
          className: "max-w-full flex-wrap",
          options: INQUIRY_FILTERS,
          value: status,
          sizing: "content",
          onChange: onStatus
        }
      ),
      /* @__PURE__ */ jsx30(SearchField3, { "aria-label": "\u641C\u7D22\u8BE2\u76D8", placeholder: "\u516C\u53F8\u3001\u8054\u7CFB\u4EBA\u3001\u5185\u5BB9", value: q, onChange: onQ })
    ] }),
    loading ? /* @__PURE__ */ jsx30("div", { className: "flex flex-col gap-2", children: Array.from({ length: 4 }, (_, index) => /* @__PURE__ */ jsx30(Skeleton3, { className: "h-12 w-full" }, index)) }) : null,
    !loading && items.length === 0 ? /* @__PURE__ */ jsx30("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx30(EmptyState6, { title: "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u8BE2\u76D8", description: "\u6362\u4E2A\u7B5B\u9009\uFF0C\u6216\u65B0\u5EFA\u4E00\u6761\u3002" }) }) : null,
    !loading && items.length > 0 ? /* @__PURE__ */ jsx30("ul", { className: "min-w-0", children: items.map((item) => /* @__PURE__ */ jsx30("li", { children: /* @__PURE__ */ jsxs28(
      "button",
      {
        type: "button",
        onClick: () => onOpen(item.id),
        className: "flex w-full min-w-0 flex-col gap-1 border-b border-(--ui-stroke-secondary) px-2 py-2 text-left text-xs hover:bg-(--ui-bg-quinary)",
        children: [
          /* @__PURE__ */ jsxs28("span", { className: "flex flex-wrap items-center gap-x-2 gap-y-1", children: [
            /* @__PURE__ */ jsx30("span", { className: "font-medium", children: item.company || "\u672A\u586B\u516C\u53F8" }),
            /* @__PURE__ */ jsx30("span", { className: "text-(--ui-text-secondary)", children: item.contact || "\u672A\u7559\u8054\u7CFB\u4EBA" }),
            /* @__PURE__ */ jsx30("span", { className: "text-(--ui-text-tertiary)", children: channelLabel(item.channel) }),
            /* @__PURE__ */ jsx30(Badge12, { variant: inquiryStatusVariant(item.status), children: inquiryStatusLabel(item.status) }),
            item.stale ? /* @__PURE__ */ jsx30(Badge12, { variant: "warn", children: "\u8D85\u8FC7 7 \u5929\u672A\u8DDF\u8FDB" }) : null
          ] }),
          /* @__PURE__ */ jsx30("span", { className: "line-clamp-2 text-(--ui-text-secondary)", children: item.content }),
          /* @__PURE__ */ jsxs28("span", { className: "text-(--ui-text-tertiary)", children: [
            item.assignee || "\u672A\u6307\u5B9A\u8D1F\u8D23\u4EBA",
            " \xB7 ",
            formatShanghai2(item.updated_at)
          ] })
        ]
      }
    ) }, item.id)) }) : null
  ] });
}
function FollowupDialog({
  open,
  defaultSegment,
  onClose,
  onCreated
}) {
  const area = useRef10(null);
  const [segment, setSegment] = useState26(defaultSegment);
  const [channel, setChannel] = useState26("wecom");
  const [name, setName] = useState26("");
  const [template, setTemplate] = useState26("");
  const [actor, setActor] = useState26(loadActor3);
  const [busy, setBusy] = useState26(false);
  const [error, setError] = useState26(null);
  useEffect23(() => {
    if (!open) return;
    setSegment(defaultSegment);
    setChannel("wecom");
    setName("");
    setTemplate("");
    setActor(loadActor3());
    setError(null);
  }, [open, defaultSegment]);
  const insert = (token) => {
    const el = area.current;
    const start = el?.selectionStart ?? template.length;
    const end = el?.selectionEnd ?? template.length;
    const next = template.slice(0, start) + token + template.slice(end);
    setTemplate(next);
    window.requestAnimationFrame(() => {
      el?.focus();
      const pos = start + token.length;
      el?.setSelectionRange(pos, pos);
    });
  };
  const submit = async () => {
    if (!name.trim() || !template.trim()) {
      setError("\u8BF7\u586B\u5199\u540D\u79F0\u548C\u8BDD\u672F");
      return;
    }
    setBusy(true);
    setError(null);
    saveActor2(actor);
    try {
      const created = await createFollowup({
        name: name.trim(),
        segment,
        channel,
        template: template.trim(),
        by: actor.trim() || null
      });
      onCreated(created.id);
    } catch (reason) {
      setError(errorText3(reason, "\u521B\u5EFA\u5931\u8D25"));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsx30(Dialog8, { open, onOpenChange: (value) => {
    if (!value) onClose();
  }, children: /* @__PURE__ */ jsxs28(DialogContent8, { children: [
    /* @__PURE__ */ jsx30(DialogHeader8, { children: /* @__PURE__ */ jsx30(DialogTitle8, { children: "\u6279\u91CF\u8DDF\u8FDB" }) }),
    /* @__PURE__ */ jsxs28("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxs28("label", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
        "\u5206\u5C42",
        /* @__PURE__ */ jsxs28(Select11, { value: segment, onValueChange: (value) => setSegment(value), children: [
          /* @__PURE__ */ jsx30(SelectTrigger11, { "aria-label": "\u5206\u5C42", children: /* @__PURE__ */ jsx30(SelectValue11, {}) }),
          /* @__PURE__ */ jsx30(SelectContent11, { children: SEGMENTS.map((item) => /* @__PURE__ */ jsx30(SelectItem11, { value: item.id, children: item.label }, item.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs28("label", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
        "\u6E20\u9053",
        /* @__PURE__ */ jsxs28(Select11, { value: channel, onValueChange: (value) => setChannel(value), children: [
          /* @__PURE__ */ jsx30(SelectTrigger11, { "aria-label": "\u6E20\u9053", children: /* @__PURE__ */ jsx30(SelectValue11, {}) }),
          /* @__PURE__ */ jsx30(SelectContent11, { children: FOLLOWUP_CHANNELS.map((item) => /* @__PURE__ */ jsx30(SelectItem11, { value: item.id, children: item.label }, item.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx30(Input18, { "aria-label": "\u540D\u79F0", placeholder: "\u540D\u79F0", value: name, onChange: (event) => setName(event.target.value) }),
      /* @__PURE__ */ jsx30(Textarea18, { ref: area, "aria-label": "\u8BDD\u672F", placeholder: "\u8BDD\u672F", value: template, onChange: (event) => setTemplate(event.target.value) }),
      /* @__PURE__ */ jsx30("div", { className: "flex flex-wrap gap-1", children: PLACEHOLDERS.map((token) => /* @__PURE__ */ jsx30(Button25, { size: "xs", variant: "outline", onMouseDown: (event) => event.preventDefault(), onClick: () => insert(token), children: token }, token)) }),
      /* @__PURE__ */ jsx30(Input18, { "aria-label": "\u7F72\u540D", placeholder: "\u7F72\u540D", value: actor, onChange: (event) => setActor(event.target.value), style: { width: "7rem" } }),
      error ? /* @__PURE__ */ jsx30("p", { className: "text-xs text-destructive", children: error }) : null
    ] }),
    /* @__PURE__ */ jsxs28(DialogFooter6, { children: [
      /* @__PURE__ */ jsx30(Button25, { size: "sm", variant: "outline", onClick: onClose, children: "\u53D6\u6D88" }),
      /* @__PURE__ */ jsx30(Button25, { size: "sm", disabled: busy, onClick: () => void submit(), children: busy ? "\u6B63\u5728\u751F\u6210" : "\u751F\u6210\u540D\u5355" })
    ] })
  ] }) });
}
function InquiryDialog({
  open,
  onClose,
  onCreated
}) {
  const apiBase = useApiBase();
  const [channel, setChannel] = useState26("wecom");
  const [company, setCompany] = useState26("");
  const [contact, setContact] = useState26("");
  const [phone, setPhone] = useState26("");
  const [content, setContent] = useState26("");
  const [assignee, setAssignee] = useState26("");
  const [actor, setActor] = useState26(loadActor3);
  const [codeInput, setCodeInput] = useState26("");
  const [codeQuery, setCodeQuery] = useState26("");
  const [codes, setCodes] = useState26([]);
  const [busy, setBusy] = useState26(false);
  const [error, setError] = useState26(null);
  useEffect23(() => {
    if (!open) return;
    setChannel("wecom");
    setCompany("");
    setContact("");
    setPhone("");
    setContent("");
    setAssignee("");
    setActor(loadActor3());
    setCodeInput("");
    setCodeQuery("");
    setCodes([]);
    setError(null);
  }, [open]);
  useEffect23(() => {
    const timer9 = window.setTimeout(() => setCodeQuery(codeInput.trim()), 300);
    return () => window.clearTimeout(timer9);
  }, [codeInput]);
  const cardsQuery = useQuery(
    () => codeQuery ? listProductCards({ q: codeQuery }) : Promise.resolve([]),
    [apiBase, codeQuery, open]
  );
  const addCode = (code) => {
    const next = code.trim();
    if (!next) return;
    setCodes((current) => current.includes(next) ? current : [...current, next]);
    setCodeInput("");
    setCodeQuery("");
  };
  const submit = async () => {
    if (!content.trim()) {
      setError("\u8BF7\u586B\u5199\u8BE2\u76D8\u5185\u5BB9");
      return;
    }
    setBusy(true);
    setError(null);
    saveActor2(actor);
    try {
      const created = await createInquiry({
        channel,
        content: content.trim(),
        company: company.trim() || null,
        contact: contact.trim() || null,
        phone: phone.trim() || null,
        product_codes: codes,
        assignee: assignee.trim() || null,
        by: actor.trim() || null
      });
      onCreated(created.id);
    } catch (reason) {
      setError(errorText3(reason, "\u521B\u5EFA\u5931\u8D25"));
    } finally {
      setBusy(false);
    }
  };
  const matches = codeQuery ? cardsQuery.data ?? [] : [];
  return /* @__PURE__ */ jsx30(Dialog8, { open, onOpenChange: (value) => {
    if (!value) onClose();
  }, children: /* @__PURE__ */ jsxs28(DialogContent8, { children: [
    /* @__PURE__ */ jsx30(DialogHeader8, { children: /* @__PURE__ */ jsx30(DialogTitle8, { children: "\u65B0\u5EFA\u8BE2\u76D8" }) }),
    /* @__PURE__ */ jsxs28("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxs28(Select11, { value: channel, onValueChange: (value) => setChannel(value), children: [
        /* @__PURE__ */ jsx30(SelectTrigger11, { "aria-label": "\u6E20\u9053", children: /* @__PURE__ */ jsx30(SelectValue11, {}) }),
        /* @__PURE__ */ jsx30(SelectContent11, { children: INQUIRY_CHANNELS.map((item) => /* @__PURE__ */ jsx30(SelectItem11, { value: item.id, children: item.label }, item.id)) })
      ] }),
      /* @__PURE__ */ jsx30(Input18, { "aria-label": "\u516C\u53F8", placeholder: "\u516C\u53F8", value: company, onChange: (event) => setCompany(event.target.value) }),
      /* @__PURE__ */ jsx30(Input18, { "aria-label": "\u8054\u7CFB\u4EBA", placeholder: "\u8054\u7CFB\u4EBA", value: contact, onChange: (event) => setContact(event.target.value) }),
      /* @__PURE__ */ jsx30(Input18, { "aria-label": "\u624B\u673A", placeholder: "\u624B\u673A", value: phone, onChange: (event) => setPhone(event.target.value) }),
      /* @__PURE__ */ jsx30(Textarea18, { "aria-label": "\u5185\u5BB9", placeholder: "\u5185\u5BB9", value: content, onChange: (event) => setContent(event.target.value) }),
      /* @__PURE__ */ jsxs28("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsx30(
          Input18,
          {
            "aria-label": "\u5546\u54C1\u7F16\u7801",
            placeholder: "\u5546\u54C1\u7F16\u7801\uFF0C\u4ECE\u8D44\u6599\u5361\u91CC\u641C",
            value: codeInput,
            onChange: (event) => setCodeInput(event.target.value),
            onKeyDown: (event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCode(codeInput);
              }
            }
          }
        ),
        matches.length > 0 ? /* @__PURE__ */ jsx30("ul", { className: "max-h-32 overflow-y-auto rounded-md border border-(--ui-stroke-secondary)", children: matches.map((card) => /* @__PURE__ */ jsx30("li", { children: /* @__PURE__ */ jsxs28(
          "button",
          {
            type: "button",
            className: "flex w-full px-2 py-1 text-left text-xs hover:bg-(--ui-bg-quinary)",
            onClick: () => addCode(card.product_code),
            children: [
              card.product_code,
              " \xB7 ",
              card.name
            ]
          }
        ) }, card.id)) }) : null,
        /* @__PURE__ */ jsx30("div", { className: "flex flex-wrap gap-1", children: codes.map((code) => /* @__PURE__ */ jsxs28(Button25, { size: "xs", variant: "outline", onClick: () => setCodes((current) => current.filter((item) => item !== code)), children: [
          code,
          " \xD7"
        ] }, code)) })
      ] }),
      /* @__PURE__ */ jsx30(Input18, { "aria-label": "\u8D1F\u8D23\u4EBA", placeholder: "\u8D1F\u8D23\u4EBA", value: assignee, onChange: (event) => setAssignee(event.target.value) }),
      error ? /* @__PURE__ */ jsx30("p", { className: "text-xs text-destructive", children: error }) : null
    ] }),
    /* @__PURE__ */ jsxs28(DialogFooter6, { children: [
      /* @__PURE__ */ jsx30(Button25, { size: "sm", variant: "outline", onClick: onClose, children: "\u53D6\u6D88" }),
      /* @__PURE__ */ jsx30(Button25, { size: "sm", disabled: busy, onClick: () => void submit(), children: busy ? "\u6B63\u5728\u4FDD\u5B58" : "\u4FDD\u5B58" })
    ] })
  ] }) });
}
function BusinessDialog({
  open,
  onClose,
  onCreated
}) {
  const [name, setName] = useState26("");
  const [phone, setPhone] = useState26("");
  const [company, setCompany] = useState26("");
  const [wecom, setWecom] = useState26(false);
  const [tags, setTags] = useState26("");
  const [note, setNote] = useState26("");
  const [busy, setBusy] = useState26(false);
  const [error, setError] = useState26(null);
  useEffect23(() => {
    if (!open) return;
    setName("");
    setPhone("");
    setCompany("");
    setWecom(false);
    setTags("");
    setNote("");
    setError(null);
  }, [open]);
  const submit = async () => {
    if (!company.trim()) {
      setError("\u4F01\u4E1A\u5BA2\u6237\u8BF7\u586B\u5199\u516C\u53F8\u540D\u79F0");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const created = await createBusinessCustomer({
        name: name.trim() || null,
        phone: phone.trim() || null,
        company: company.trim(),
        wecom_added: wecom,
        tags: parseTags(tags),
        note: note.trim() || null
      });
      onCreated(created.id);
    } catch (reason) {
      setError(errorText3(reason, "\u521B\u5EFA\u5931\u8D25"));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsx30(Dialog8, { open, onOpenChange: (value) => {
    if (!value) onClose();
  }, children: /* @__PURE__ */ jsxs28(DialogContent8, { children: [
    /* @__PURE__ */ jsx30(DialogHeader8, { children: /* @__PURE__ */ jsx30(DialogTitle8, { children: "\u65B0\u5EFA\u4F01\u4E1A\u5BA2\u6237" }) }),
    /* @__PURE__ */ jsxs28("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx30(Input18, { "aria-label": "\u540D\u79F0", placeholder: "\u540D\u79F0", value: name, onChange: (event) => setName(event.target.value) }),
      /* @__PURE__ */ jsx30(Input18, { "aria-label": "\u516C\u53F8", placeholder: "\u516C\u53F8", value: company, onChange: (event) => setCompany(event.target.value) }),
      /* @__PURE__ */ jsx30(Input18, { "aria-label": "\u624B\u673A", placeholder: "\u624B\u673A", value: phone, onChange: (event) => setPhone(event.target.value) }),
      /* @__PURE__ */ jsxs28("label", { className: "inline-flex items-center gap-2 text-xs text-(--ui-text-secondary)", children: [
        /* @__PURE__ */ jsx30(Checkbox3, { checked: wecom, onCheckedChange: setWecom, "aria-label": "\u5DF2\u52A0\u4F01\u4E1A\u5FAE\u4FE1" }),
        "\u5DF2\u52A0\u4F01\u4E1A\u5FAE\u4FE1"
      ] }),
      /* @__PURE__ */ jsx30(Input18, { "aria-label": "\u6807\u7B7E", placeholder: "\u6807\u7B7E\uFF0C\u7528\u9017\u53F7\u5206\u5F00", value: tags, onChange: (event) => setTags(event.target.value) }),
      /* @__PURE__ */ jsx30(Textarea18, { "aria-label": "\u5907\u6CE8", placeholder: "\u5907\u6CE8", value: note, onChange: (event) => setNote(event.target.value) }),
      error ? /* @__PURE__ */ jsx30("p", { className: "text-xs text-destructive", children: error }) : null
    ] }),
    /* @__PURE__ */ jsxs28(DialogFooter6, { children: [
      /* @__PURE__ */ jsx30(Button25, { size: "sm", variant: "outline", onClick: onClose, children: "\u53D6\u6D88" }),
      /* @__PURE__ */ jsx30(Button25, { size: "sm", disabled: busy, onClick: () => void submit(), children: busy ? "\u6B63\u5728\u4FDD\u5B58" : "\u4FDD\u5B58" })
    ] })
  ] }) });
}

// src/pages/installs/InstallsPage.tsx
import { useEffect as useEffect27, useState as useState30 } from "react";
import {
  Badge as Badge13,
  Button as Button29,
  Checkbox as Checkbox4,
  EmptyState as EmptyState7,
  ErrorState as ErrorState16,
  Loader as Loader15,
  SearchField as SearchField4,
  SegmentedControl as SegmentedControl10,
  Select as Select13,
  SelectContent as SelectContent13,
  SelectItem as SelectItem13,
  SelectTrigger as SelectTrigger13,
  SelectValue as SelectValue13,
  Skeleton as Skeleton4,
  Switch as Switch4,
  Tip as Tip6
} from "@hermes/plugin-sdk";

// src/pages/products/ImportDialog.tsx
import { useEffect as useEffect24, useState as useState27 } from "react";
import {
  Button as Button26,
  Dialog as Dialog9,
  DialogContent as DialogContent9,
  DialogDescription as DialogDescription2,
  DialogFooter as DialogFooter7,
  DialogHeader as DialogHeader9,
  DialogTitle as DialogTitle9,
  Input as Input19,
  SegmentedControl as SegmentedControl9,
  Select as Select12,
  SelectContent as SelectContent12,
  SelectItem as SelectItem12,
  SelectTrigger as SelectTrigger12,
  SelectValue as SelectValue12
} from "@hermes/plugin-sdk";
import { jsx as jsx31, jsxs as jsxs29 } from "react/jsx-runtime";
var PLATFORMS2 = ["tmall", "jd", "pdd", "douyin"];
var KIND_LABEL4 = {
  products: "\u5546\u54C1",
  orders: "\u8BA2\u5355",
  metrics: "\u7ECF\u8425",
  ad_spend: "\u6295\u653E"
};
var KIND_TITLE = {
  products: "\u5BFC\u5165\u62A5\u8868",
  orders: "\u5BFC\u5165\u8BA2\u5355",
  metrics: "\u5BFC\u5165\u7ECF\u8425\u8868",
  ad_spend: "\u5BFC\u5165\u6295\u653E\u8868"
};
var KIND_HINT = {
  products: "\u9009\u62E9\u5E97\u94FA\u548C xlsx / csv \u6587\u4EF6\u3002\u5BFC\u5165\u5B8C\u6210\u540E\u4F1A\u81EA\u52A8\u6309\u89C4\u5219\u68C0\u67E5\u3002",
  orders: "\u9009\u62E9\u5E97\u94FA\u548C\u8BA2\u5355\u8868\u3002\u4E70\u4E86\u9700\u5B89\u88C5\u5546\u54C1\u7684\u8BA2\u5355\u4F1A\u751F\u6210\u5DE5\u5355\u3002",
  metrics: "\u9009\u62E9\u5E97\u94FA\u548C\u540E\u53F0\u5BFC\u51FA\u7684\u7ECF\u8425\u65E5\u62A5\uFF08\u65E5\u671F\u3001\u8BBF\u5BA2\u3001\u8BA2\u5355\u3001\u9500\u552E\u989D\uFF09\u3002\u540C\u4E00\u5929\u518D\u5BFC\u4F1A\u8986\u76D6\u3002",
  ad_spend: "\u9009\u62E9\u5E97\u94FA\u548C\u6295\u653E\u62A5\u8868\uFF08\u65E5\u671F\u3001\u5DE5\u5177\u3001\u8BA1\u5212\u3001\u82B1\u8D39\u3001\u6210\u4EA4\uFF09\u3002\u5BFC\u5165\u540E\u81EA\u52A8\u68C0\u67E5\u6295\u653E\u89C4\u5219\u3002"
};
var UPLOAD = {
  products: importProducts,
  orders: importOrders,
  metrics: importMetrics,
  ad_spend: importAdSpend
};
function ImportDialog({
  open,
  shops,
  initialKind = "products",
  kinds = ["products", "orders"],
  onClose,
  onDone
}) {
  const [kind, setKind] = useState27(initialKind);
  const [shopId, setShopId] = useState27("");
  const [createdShops, setCreatedShops] = useState27([]);
  const [creating, setCreating] = useState27(false);
  const [platform, setPlatform] = useState27("tmall");
  const [shopName, setShopName] = useState27("");
  const [brand, setBrand] = useState27("");
  const [file, setFile] = useState27(null);
  const [busy, setBusy] = useState27(false);
  const [error, setError] = useState27(null);
  const [result, setResult] = useState27(null);
  useEffect24(() => {
    if (!open) return;
    setKind(initialKind);
    setError(null);
    setResult(null);
    setFile(null);
    setBusy(false);
    setCreating(shops.length === 0);
    setShopId(shops.length === 1 ? String(shops[0].id) : "");
    setCreatedShops([]);
  }, [open]);
  const createAndSelect = async () => {
    setBusy(true);
    setError(null);
    try {
      const shop = await createShop({
        platform,
        name: shopName.trim(),
        brand: brand.trim()
      });
      setShopId(String(shop.id));
      setCreatedShops((current) => [...current, shop]);
      setCreating(false);
      setShopName("");
      setBrand("");
      onDone();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "\u65B0\u5EFA\u5E97\u94FA\u5931\u8D25");
    } finally {
      setBusy(false);
    }
  };
  const upload2 = async () => {
    if (!file || !shopId) return;
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".xlsx") && !lower.endsWith(".csv")) {
      setError("\u53EA\u652F\u6301 xlsx \u6216 csv");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const imported = await UPLOAD[kind](Number(shopId), file);
      setResult(imported);
      onDone();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "\u5BFC\u5165\u5931\u8D25");
    } finally {
      setBusy(false);
    }
  };
  const knownShops = [
    ...shops,
    ...createdShops.filter((shop) => !shops.some((item) => item.id === shop.id))
  ];
  return /* @__PURE__ */ jsx31(Dialog9, { open, onOpenChange: (next) => {
    if (!next) onClose();
  }, children: /* @__PURE__ */ jsxs29(DialogContent9, { children: [
    /* @__PURE__ */ jsxs29(DialogHeader9, { children: [
      /* @__PURE__ */ jsx31(DialogTitle9, { children: KIND_TITLE[kind] }),
      /* @__PURE__ */ jsx31(DialogDescription2, { children: KIND_HINT[kind] })
    ] }),
    /* @__PURE__ */ jsx31(FolderImportRow, { open }),
    result ? /* @__PURE__ */ jsxs29("div", { className: "flex flex-col gap-3 text-xs", children: [
      /* @__PURE__ */ jsxs29("p", { className: "text-sm text-(--ui-text-primary)", children: [
        "\u6210\u529F ",
        result.rows_ok,
        " \u884C\uFF0C\u5931\u8D25 ",
        result.rows_failed,
        " \u884C",
        result.installs ? `\uFF0C\u65B0\u5EFA\u5DE5\u5355 ${result.installs.created} \u5F20` : "",
        kind === "ad_spend" && result.rules ? `\uFF0C\u65B0\u589E\u6295\u653E\u63D0\u9192 ${result.rules.opened} \u6761` : ""
      ] }),
      result.errors.length > 0 ? /* @__PURE__ */ jsx31("ul", { className: "max-h-48 overflow-y-auto border border-(--ui-stroke-secondary) text-(--ui-text-secondary)", children: result.errors.map((row) => /* @__PURE__ */ jsxs29("li", { className: "border-b border-(--ui-stroke-secondary) px-2 py-1.5", children: [
        "\u7B2C ",
        row.row,
        " \u884C\uFF1A",
        row.reason
      ] }, `${row.row}-${row.reason}`)) }) : null,
      /* @__PURE__ */ jsx31(DialogFooter7, { children: /* @__PURE__ */ jsx31(
        Button26,
        {
          onClick: () => {
            onDone();
            onClose();
          },
          children: kind === "products" ? "\u67E5\u770B\u5546\u54C1" : "\u5B8C\u6210"
        }
      ) })
    ] }) : /* @__PURE__ */ jsxs29("div", { className: "flex flex-col gap-3", children: [
      kinds.length > 1 ? /* @__PURE__ */ jsx31(
        SegmentedControl9,
        {
          options: kinds.map((id) => ({ id, label: KIND_LABEL4[id] })),
          value: kind,
          sizing: "content",
          onChange: (value) => setKind(value)
        }
      ) : null,
      knownShops.length > 0 && !creating ? /* @__PURE__ */ jsxs29("label", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
        "\u5E97\u94FA",
        /* @__PURE__ */ jsxs29(
          Select12,
          {
            value: shopId || "none",
            onValueChange: (value) => {
              if (value !== "none") setShopId(value);
            },
            children: [
              /* @__PURE__ */ jsx31(SelectTrigger12, { "aria-label": "\u9009\u62E9\u5E97\u94FA", children: /* @__PURE__ */ jsx31(SelectValue12, { placeholder: "\u9009\u62E9\u5E97\u94FA" }) }),
              /* @__PURE__ */ jsxs29(SelectContent12, { children: [
                /* @__PURE__ */ jsx31(SelectItem12, { value: "none", children: "\u9009\u62E9\u5E97\u94FA" }),
                knownShops.map((shop) => /* @__PURE__ */ jsxs29(SelectItem12, { value: String(shop.id), children: [
                  platformName(shop.platform),
                  " \xB7 ",
                  shop.name
                ] }, shop.id))
              ] })
            ]
          }
        )
      ] }) : null,
      knownShops.length > 0 && !creating ? /* @__PURE__ */ jsx31(Button26, { size: "xs", variant: "ghost", onClick: () => setCreating(true), children: "\u65B0\u5EFA\u5E97\u94FA" }) : null,
      creating ? /* @__PURE__ */ jsxs29("div", { className: "flex flex-col gap-2 rounded-md border border-(--ui-stroke-secondary) p-2", children: [
        /* @__PURE__ */ jsx31("p", { className: "text-xs text-(--ui-text-secondary)", children: "\u65B0\u5EFA\u5E97\u94FA" }),
        /* @__PURE__ */ jsxs29(Select12, { value: platform, onValueChange: setPlatform, children: [
          /* @__PURE__ */ jsx31(SelectTrigger12, { "aria-label": "\u5E73\u53F0", children: /* @__PURE__ */ jsx31(SelectValue12, { placeholder: "\u5E73\u53F0" }) }),
          /* @__PURE__ */ jsx31(SelectContent12, { children: PLATFORMS2.map((item) => /* @__PURE__ */ jsx31(SelectItem12, { value: item, children: PLATFORM_NAME[item] }, item)) })
        ] }),
        /* @__PURE__ */ jsx31(
          Input19,
          {
            "aria-label": "\u5E97\u540D",
            placeholder: "\u5E97\u540D",
            value: shopName,
            onChange: (event) => setShopName(event.target.value)
          }
        ),
        /* @__PURE__ */ jsx31(
          Input19,
          {
            "aria-label": "\u54C1\u724C",
            placeholder: "\u54C1\u724C",
            value: brand,
            onChange: (event) => setBrand(event.target.value)
          }
        ),
        /* @__PURE__ */ jsxs29("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx31(
            Button26,
            {
              size: "xs",
              disabled: busy || !shopName.trim() || !brand.trim(),
              onClick: () => void createAndSelect(),
              children: "\u4FDD\u5B58\u5E97\u94FA"
            }
          ),
          knownShops.length > 0 ? /* @__PURE__ */ jsx31(Button26, { size: "xs", variant: "outline", onClick: () => setCreating(false), children: "\u53D6\u6D88" }) : null
        ] })
      ] }) : null,
      /* @__PURE__ */ jsxs29("label", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
        "\u62A5\u8868\u6587\u4EF6",
        /* @__PURE__ */ jsx31(
          "input",
          {
            "aria-label": "\u62A5\u8868\u6587\u4EF6",
            type: "file",
            accept: ".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv",
            className: "text-xs text-(--ui-text-primary) file:mr-2 file:rounded-md file:border file:border-(--ui-stroke-secondary) file:bg-(--ui-bg-quinary) file:px-2 file:py-1 file:text-xs file:text-(--ui-text-primary)",
            onChange: (event) => setFile(event.target.files?.[0] ?? null)
          }
        )
      ] }),
      error ? /* @__PURE__ */ jsx31("p", { className: "text-xs text-destructive", children: error }) : null,
      /* @__PURE__ */ jsxs29(DialogFooter7, { children: [
        /* @__PURE__ */ jsx31(Button26, { variant: "outline", onClick: onClose, children: "\u5173\u95ED" }),
        /* @__PURE__ */ jsx31(Button26, { disabled: busy || !file || !shopId || creating, onClick: () => void upload2(), children: busy ? "\u6B63\u5728\u5BFC\u5165" : "\u4E0A\u4F20" })
      ] })
    ] })
  ] }) });
}
var FOLDER_KIND = {
  products: "\u5546\u54C1",
  metrics: "\u7ECF\u8425",
  ad_spend: "\u6295\u653E",
  orders: "\u8BA2\u5355"
};
function FolderImportRow({ open }) {
  const [status, setStatus] = useState27(null);
  const [scan, setScan] = useState27(null);
  const [statusError, setStatusError] = useState27(null);
  const [scanError, setScanError] = useState27(null);
  const [busy, setBusy] = useState27(false);
  useEffect24(() => {
    if (!open) return;
    let cancelled = false;
    setScan(null);
    setScanError(null);
    setStatusError(null);
    getFolderImport().then(
      (value) => {
        if (!cancelled) setStatus(value);
      },
      (reason) => {
        if (!cancelled) setStatusError(reason instanceof Error ? reason.message : "\u8BFB\u4E0D\u5230\u62A5\u8868\u6587\u4EF6\u5939");
      }
    );
    return () => {
      cancelled = true;
    };
  }, [open]);
  const runScan = async () => {
    setBusy(true);
    setScanError(null);
    try {
      setScan(await scanFolderImport());
    } catch (reason) {
      setScan(null);
      setScanError(reason instanceof Error ? reason.message : "\u5BFC\u5165\u5931\u8D25");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxs29("div", { className: "flex flex-col gap-2 rounded-md border border-(--ui-stroke-secondary) px-2 py-2 text-xs", children: [
    statusError ? /* @__PURE__ */ jsx31("p", { className: "text-destructive", children: statusError }) : null,
    !status && !statusError ? /* @__PURE__ */ jsx31("p", { className: "text-(--ui-text-tertiary)", children: "\u6B63\u5728\u67E5\u770B\u62A5\u8868\u6587\u4EF6\u5939\u2026" }) : null,
    status && !status.enabled ? /* @__PURE__ */ jsx31("p", { className: "text-(--ui-text-secondary)", children: "\u8FD8\u6CA1\u542F\u7528\u81EA\u52A8\u5BFC\u5165\u3002\u628A server\\scripts\\env.example.bat \u590D\u5236\u6210 env.bat\uFF0C\u586B\u4E0A WB_IMPORT_DIR\uFF08\u6BCF\u4E2A\u5E97\u94FA\u4E00\u4E2A\u540C\u540D\u5B50\u6587\u4EF6\u5939\uFF09\uFF0C\u4FDD\u5B58\u540E\u91CD\u542F\u540E\u7AEF\u3002" }) : null,
    status?.enabled ? /* @__PURE__ */ jsxs29("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxs29("p", { className: "text-(--ui-text-secondary)", children: [
        "\u62A5\u8868\u6587\u4EF6\u5939\uFF1A",
        status.path,
        status.exists ? "" : "\uFF08\u8FD9\u4E2A\u8DEF\u5F84\u73B0\u5728\u4E0D\u5B58\u5728\uFF09",
        "\uFF0C\u6BCF 10 \u5206\u949F\u81EA\u52A8\u5BFC\u5165"
      ] }),
      /* @__PURE__ */ jsx31(Button26, { size: "xs", variant: "outline", disabled: busy, onClick: () => void runScan(), children: busy ? "\u6B63\u5728\u5BFC\u5165" : "\u7ACB\u5373\u5BFC\u5165" })
    ] }) : null,
    scanError ? /* @__PURE__ */ jsx31("p", { className: "text-destructive", children: scanError }) : null,
    scan ? /* @__PURE__ */ jsxs29("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxs29("p", { className: "text-(--ui-text-primary)", children: [
        "\u6210\u529F ",
        scan.imported,
        " \u4E2A\u6587\u4EF6\uFF0C\u5931\u8D25 ",
        scan.failed,
        " \u4E2A"
      ] }),
      /* @__PURE__ */ jsxs29("ul", { className: "max-h-32 overflow-y-auto border border-(--ui-stroke-secondary)", children: [
        scan.files.length === 0 ? /* @__PURE__ */ jsx31("li", { className: "px-2 py-1.5 text-(--ui-text-tertiary)", children: "\u6587\u4EF6\u5939\u91CC\u6CA1\u6709\u5F85\u5BFC\u5165\u7684\u8868\u3002" }) : null,
        scan.files.map((file) => /* @__PURE__ */ jsxs29("li", { className: "border-b border-(--ui-stroke-secondary) px-2 py-1.5", children: [
          file.shop,
          " / ",
          file.file,
          file.kind ? `\uFF08${FOLDER_KIND[file.kind] ?? file.kind}\uFF09` : "",
          "\uFF1A",
          file.ok ? `\u6210\u529F ${file.rows_ok} \u884C${file.rows_failed ? `\uFF0C${file.rows_failed} \u884C\u6CA1\u5BFC\u8FDB\u53BB` : ""}` : `\u5931\u8D25\uFF0C${file.reason ?? "\u672A\u77E5\u539F\u56E0"}`
        ] }, `${file.shop}-${file.file}`))
      ] })
    ] }) : null
  ] });
}

// src/pages/installs/InstallDrawer.tsx
import { useEffect as useEffect26, useState as useState29 } from "react";
import { Button as Button28, ConfirmDialog as ConfirmDialog8, ErrorState as ErrorState15, Input as Input21, Loader as Loader14, Textarea as Textarea20 } from "@hermes/plugin-sdk";

// src/pages/installs/BookDialog.tsx
import { useEffect as useEffect25, useState as useState28 } from "react";
import {
  Button as Button27,
  Dialog as Dialog10,
  DialogContent as DialogContent10,
  DialogDescription as DialogDescription3,
  DialogFooter as DialogFooter8,
  DialogHeader as DialogHeader10,
  DialogTitle as DialogTitle10,
  Input as Input20,
  Textarea as Textarea19
} from "@hermes/plugin-sdk";
import { jsx as jsx32, jsxs as jsxs30 } from "react/jsx-runtime";
function BookDialog({
  open,
  mode,
  appointment,
  engineer,
  providerRef,
  onClose,
  onConfirm
}) {
  const [when, setWhen] = useState28(appointment);
  const [who, setWho] = useState28(engineer);
  const [refNo, setRefNo] = useState28(providerRef);
  const [reason, setReason] = useState28("");
  const [error, setError] = useState28(null);
  const [busy, setBusy] = useState28(false);
  useEffect25(() => {
    if (!open) return;
    setWhen(appointment);
    setWho(engineer);
    setRefNo(providerRef);
    setReason("");
    setError(null);
    setBusy(false);
  }, [open, appointment, engineer, providerRef]);
  const submit = async () => {
    if (mode === "book" && !when) {
      setError("\u8BF7\u586B\u5199\u9884\u7EA6\u65F6\u95F4");
      return;
    }
    if (mode === "exception" && !reason.trim()) {
      setError("\u8BF7\u586B\u5199\u5F02\u5E38\u539F\u56E0");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onConfirm({
        appointment: when,
        engineer: who.trim(),
        providerRef: refNo.trim(),
        reason: reason.trim()
      });
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "\u64CD\u4F5C\u5931\u8D25");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsx32(Dialog10, { open, onOpenChange: (next) => {
    if (!next) onClose();
  }, children: /* @__PURE__ */ jsxs30(DialogContent10, { children: [
    /* @__PURE__ */ jsxs30(DialogHeader10, { children: [
      /* @__PURE__ */ jsx32(DialogTitle10, { children: mode === "book" ? "\u586B\u9884\u7EA6" : "\u6807\u5F02\u5E38" }),
      /* @__PURE__ */ jsx32(DialogDescription3, { children: mode === "book" ? "\u65F6\u95F4\u6309\u5317\u4EAC\u65F6\u95F4\u63D0\u4EA4\u3002" : "\u5199\u660E\u8FD9\u6B21\u7EA6\u4E0D\u4E0A\u6216\u9700\u8981\u8DDF\u8FDB\u7684\u539F\u56E0\u3002" })
    ] }),
    mode === "book" ? /* @__PURE__ */ jsxs30("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxs30("label", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
        "\u9884\u7EA6\u65F6\u95F4",
        /* @__PURE__ */ jsx32(
          Input20,
          {
            "aria-label": "\u9884\u7EA6\u65F6\u95F4",
            type: "datetime-local",
            value: when,
            onChange: (event) => setWhen(event.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs30("label", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
        "\u5E08\u5085",
        /* @__PURE__ */ jsx32(Input20, { "aria-label": "\u5E08\u5085", value: who, placeholder: "\u5218\u5E08\u5085", onChange: (event) => setWho(event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs30("label", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
        "\u670D\u52A1\u5546\u5355\u53F7",
        /* @__PURE__ */ jsx32(
          Input20,
          {
            "aria-label": "\u670D\u52A1\u5546\u5355\u53F7",
            value: refNo,
            placeholder: "\u5544\u6728\u9E1F\u5355\u53F7\uFF0C\u53EF\u4EE5\u4E0D\u586B",
            onChange: (event) => setRefNo(event.target.value)
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsx32(
      Textarea19,
      {
        "aria-label": "\u5F02\u5E38\u539F\u56E0",
        value: reason,
        placeholder: "\u5F02\u5E38\u539F\u56E0",
        onChange: (event) => setReason(event.target.value)
      }
    ),
    error ? /* @__PURE__ */ jsx32("p", { className: "text-xs text-destructive", children: error }) : null,
    /* @__PURE__ */ jsxs30(DialogFooter8, { children: [
      /* @__PURE__ */ jsx32(Button27, { variant: "outline", onClick: onClose, children: "\u53D6\u6D88" }),
      /* @__PURE__ */ jsx32(Button27, { disabled: busy, onClick: () => void submit(), children: busy ? "\u6B63\u5728\u63D0\u4EA4" : mode === "book" ? "\u4FDD\u5B58\u9884\u7EA6" : "\u6807\u4E3A\u5F02\u5E38" })
    ] })
  ] }) });
}

// src/pages/installs/labels.ts
var STATUS_LABEL5 = {
  pending: "\u5F85\u9884\u7EA6",
  booked: "\u5DF2\u9884\u7EA6",
  done: "\u5DF2\u5B8C\u5DE5",
  exception: "\u5F02\u5E38",
  cancelled: "\u5DF2\u53D6\u6D88"
};
function statusLabel5(status) {
  return STATUS_LABEL5[status] ?? status;
}
function statusVariant4(status) {
  if (status === "exception") return "destructive";
  if (status === "booked") return "default";
  if (status === "pending") return "warn";
  return "outline";
}
function formatShanghai3(iso) {
  if (!iso) return "\u2014";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("zh-CN", { hour12: false, timeZone: "Asia/Shanghai" });
}
function formatAmount2(value) {
  if (!Number.isFinite(value)) return "\u2014";
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}
function appointmentPayload(value) {
  return `${value}:00+08:00`;
}
function appointmentInputValue(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);
  const pick = (type) => parts.find((part) => part.type === type)?.value ?? "";
  const hour = pick("hour") === "24" ? "00" : pick("hour");
  return `${pick("year")}-${pick("month")}-${pick("day")}T${hour}:${pick("minute")}`;
}
function isActionStatus(status) {
  return status === "pending" || status === "exception";
}
function segmentStatus(segment) {
  if (segment === "booked" || segment === "done") return segment;
  return void 0;
}

// src/pages/installs/InstallDrawer.tsx
import { Fragment as Fragment11, jsx as jsx33, jsxs as jsxs31 } from "react/jsx-runtime";
var ACTOR_KEY4 = "hermes-workbench:actor";
function readActor() {
  try {
    return window.localStorage.getItem(ACTOR_KEY4) ?? "";
  } catch {
    return "";
  }
}
async function copyText2(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "true");
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
function InstallDrawer({
  installId,
  onClose,
  onChanged
}) {
  const [detail, setDetail] = useState29(null);
  const [loadedFor, setLoadedFor] = useState29(null);
  const [error, setError] = useState29(null);
  const [revision, setRevision] = useState29(0);
  const [actor, setActor] = useState29(readActor);
  const [note, setNote] = useState29("");
  const [busy, setBusy] = useState29(false);
  const [actionError, setActionError] = useState29(null);
  const [booking, setBooking] = useState29(false);
  const [flagging, setFlagging] = useState29(false);
  const [cancelling, setCancelling] = useState29(false);
  const [notice, setNotice] = useState29(null);
  useEffect26(() => {
    try {
      window.localStorage.setItem(ACTOR_KEY4, actor);
    } catch {
    }
  }, [actor]);
  useEffect26(() => {
    if (installId == null) return;
    let cancelled = false;
    setLoadedFor(null);
    setError(null);
    setNotice(null);
    setActionError(null);
    setBooking(false);
    setFlagging(false);
    setCancelling(false);
    getInstall(installId).then((value) => {
      if (cancelled) return;
      setDetail(value);
      setLoadedFor(installId);
    }).catch((reason) => {
      if (cancelled) return;
      setError(reason);
      setLoadedFor(installId);
    });
    return () => {
      cancelled = true;
    };
  }, [installId, revision]);
  const by = actor.trim() || null;
  const apply = async (action2) => {
    setBusy(true);
    setActionError(null);
    try {
      const next = await action2();
      setDetail(next);
      setLoadedFor(next.id);
      onChanged();
    } catch (reason) {
      setActionError(reason instanceof ApiError ? reason.message : "\u64CD\u4F5C\u5931\u8D25");
      throw reason;
    } finally {
      setBusy(false);
    }
  };
  const runStatus = (status2, extra) => apply(() => {
    if (installId == null) throw new Error("\u5DE5\u5355\u8FD8\u6CA1\u52A0\u8F7D");
    return setInstallStatus(installId, { status: status2, by, ...extra });
  });
  const copyNotice = async () => {
    if (installId == null) return;
    setBusy(true);
    setActionError(null);
    setNotice(null);
    try {
      const payload = await getInstallNotice(installId);
      const ok = await copyText2(payload.text);
      setNotice(ok ? "\u5DF2\u590D\u5236\uFF0C\u8BF7\u7C98\u8D34\u5230\u65FA\u65FA/\u4EAC\u4E1C\u549A\u549A\u53D1\u7ED9\u987E\u5BA2" : payload.text);
      if (!ok) setActionError("\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u9009\u62E9\u4E0B\u9762\u7684\u6587\u5B57");
    } catch (reason) {
      setActionError(reason instanceof ApiError ? reason.message : "\u590D\u5236\u5931\u8D25");
    } finally {
      setBusy(false);
    }
  };
  const ready = detail != null && loadedFor === installId ? detail : null;
  const status = ready?.status;
  const footer = ready ? /* @__PURE__ */ jsxs31("div", { className: "flex w-full flex-wrap items-center justify-end gap-2", children: [
    status === "pending" ? /* @__PURE__ */ jsxs31(Fragment11, { children: [
      /* @__PURE__ */ jsx33(Button28, { size: "xs", disabled: busy, onClick: () => setBooking(true), children: "\u586B\u9884\u7EA6" }),
      /* @__PURE__ */ jsx33(Button28, { size: "xs", variant: "outline", disabled: busy, onClick: () => setFlagging(true), children: "\u6807\u5F02\u5E38" }),
      /* @__PURE__ */ jsx33(Button28, { size: "xs", variant: "outline", disabled: busy, onClick: () => setCancelling(true), children: "\u53D6\u6D88" })
    ] }) : null,
    status === "booked" ? /* @__PURE__ */ jsxs31(Fragment11, { children: [
      /* @__PURE__ */ jsx33(Button28, { size: "xs", disabled: busy, onClick: () => void runStatus("done").catch(() => void 0), children: "\u5DF2\u5B8C\u5DE5" }),
      /* @__PURE__ */ jsx33(Button28, { size: "xs", variant: "outline", disabled: busy, onClick: () => setBooking(true), children: "\u6539\u9884\u7EA6" }),
      /* @__PURE__ */ jsx33(Button28, { size: "xs", variant: "outline", disabled: busy, onClick: () => setFlagging(true), children: "\u6807\u5F02\u5E38" }),
      /* @__PURE__ */ jsx33(Button28, { size: "xs", variant: "outline", disabled: busy, onClick: () => void copyNotice(), children: "\u590D\u5236\u9884\u7EA6\u901A\u77E5" })
    ] }) : null,
    status === "exception" ? /* @__PURE__ */ jsxs31(Fragment11, { children: [
      /* @__PURE__ */ jsx33(Button28, { size: "xs", disabled: busy, onClick: () => setBooking(true), children: "\u91CD\u65B0\u9884\u7EA6" }),
      /* @__PURE__ */ jsx33(Button28, { size: "xs", variant: "outline", disabled: busy, onClick: () => void runStatus("pending").catch(() => void 0), children: "\u9000\u56DE\u5F85\u9884\u7EA6" }),
      /* @__PURE__ */ jsx33(Button28, { size: "xs", variant: "outline", disabled: busy, onClick: () => setCancelling(true), children: "\u53D6\u6D88" })
    ] }) : null
  ] }) : null;
  return /* @__PURE__ */ jsxs31(
    SideDrawer,
    {
      open: installId != null,
      title: ready ? `${ready.code} \xB7 ${ready.title}` : "\u5B89\u88C5\u5DE5\u5355",
      description: ready ? `${ready.shop_name} \xB7 ${statusLabel5(ready.status)}` : void 0,
      onClose,
      footer,
      widthClass: "max-w-lg",
      children: [
        installId != null && loadedFor !== installId && !error ? /* @__PURE__ */ jsxs31("div", { className: "flex items-center gap-2 text-xs text-(--ui-text-tertiary)", children: [
          /* @__PURE__ */ jsx33(Loader14, {}),
          "\u6B63\u5728\u8BFB\u53D6\u5DE5\u5355"
        ] }) : null,
        error ? /* @__PURE__ */ jsx33(
          ErrorState15,
          {
            title: isOfflineError(error) ? "\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1" : "\u5DE5\u5355\u52A0\u8F7D\u5931\u8D25",
            description: error instanceof Error ? error.message : "\u8BF7\u91CD\u8BD5",
            children: /* @__PURE__ */ jsx33(Button28, { size: "sm", variant: "outline", onClick: () => setRevision((value) => value + 1), children: "\u91CD\u8BD5" })
          }
        ) : null,
        detail && loadedFor === installId ? /* @__PURE__ */ jsxs31("div", { className: "flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxs31("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsx33("span", { className: "text-xs text-(--ui-text-secondary)", children: "\u7F72\u540D" }),
            /* @__PURE__ */ jsx33(
              Input21,
              {
                "aria-label": "\u7F72\u540D",
                value: actor,
                placeholder: "\u4F60\u7684\u540D\u5B57",
                onChange: (event) => setActor(event.target.value),
                style: { width: "7rem" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxs31("section", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx33("h3", { className: "text-xs font-medium", children: "\u8BA2\u5355" }),
            /* @__PURE__ */ jsxs31("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsx33(FieldText, { label: "\u5DE5\u5355\u53F7", children: detail.code }),
              /* @__PURE__ */ jsx33(FieldText, { label: "\u8BA2\u5355\u53F7", children: detail.order_no }),
              /* @__PURE__ */ jsx33(FieldText, { label: "\u5546\u54C1", className: "col-span-2", children: detail.title }),
              /* @__PURE__ */ jsxs31(FieldText, { label: "\u6570\u91CF / \u91D1\u989D", children: [
                detail.quantity,
                " / ",
                formatAmount2(detail.amount)
              ] }),
              /* @__PURE__ */ jsx33(FieldText, { label: "\u4ED8\u6B3E\u65F6\u95F4", children: formatShanghai3(detail.paid_at) }),
              /* @__PURE__ */ jsx33(FieldText, { label: "\u670D\u52A1\u5546", children: detail.provider }),
              /* @__PURE__ */ jsx33(FieldText, { label: "\u670D\u52A1\u5546\u5355\u53F7", children: detail.provider_ref || "\u2014" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs31("section", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx33("h3", { className: "text-xs font-medium", children: "\u6536\u8D27" }),
            /* @__PURE__ */ jsx33(FieldText, { label: "\u6536\u8D27\u4EBA", children: detail.buyer_name || "\u2014" }),
            /* @__PURE__ */ jsxs31("div", { className: "flex flex-wrap items-end gap-2", children: [
              /* @__PURE__ */ jsx33(FieldText, { label: "\u624B\u673A", children: detail.phone || "\u2014" }),
              detail.phone ? /* @__PURE__ */ jsx33(
                Button28,
                {
                  size: "xs",
                  variant: "outline",
                  onClick: () => {
                    void copyText2(detail.phone ?? "").then((ok) => {
                      setNotice(ok ? "\u624B\u673A\u53F7\u5DF2\u590D\u5236" : null);
                      if (!ok) setActionError("\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u9009\u62E9\u624B\u673A\u53F7");
                    });
                  },
                  children: "\u590D\u5236"
                }
              ) : null
            ] }),
            /* @__PURE__ */ jsx33(FieldText, { label: "\u5730\u5740", children: detail.address || "\u2014" })
          ] }),
          /* @__PURE__ */ jsxs31("section", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsx33("h3", { className: "text-xs font-medium", children: "\u4E70\u5BB6\u7559\u8A00" }),
            /* @__PURE__ */ jsx33("p", { className: "text-xs leading-relaxed text-(--ui-text-secondary)", children: detail.remark || "\u6CA1\u6709\u7559\u8A00" })
          ] }),
          detail.appointment_at ? /* @__PURE__ */ jsxs31(FieldText, { label: "\u9884\u7EA6", children: [
            formatShanghai3(detail.appointment_at),
            detail.engineer ? ` \xB7 ${detail.engineer}` : ""
          ] }) : null,
          detail.exception_reason ? /* @__PURE__ */ jsxs31("p", { className: "text-xs text-destructive", children: [
            "\u5F02\u5E38\uFF1A",
            detail.exception_reason
          ] }) : null,
          /* @__PURE__ */ jsxs31("section", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx33("h3", { className: "text-xs font-medium", children: "\u5907\u6CE8" }),
            detail.note ? /* @__PURE__ */ jsx33("p", { className: "text-xs leading-relaxed text-(--ui-text-secondary)", children: detail.note }) : null,
            /* @__PURE__ */ jsx33(
              Textarea20,
              {
                "aria-label": "\u5907\u6CE8",
                value: note,
                placeholder: "\u8FFD\u52A0\u4E00\u6761\u5907\u6CE8",
                onChange: (event) => setNote(event.target.value)
              }
            ),
            /* @__PURE__ */ jsx33("div", { children: /* @__PURE__ */ jsx33(
              Button28,
              {
                size: "xs",
                variant: "outline",
                disabled: busy || !note.trim(),
                onClick: () => {
                  if (installId == null) return;
                  void apply(() => addInstallNote(installId, note.trim(), by)).then(() => setNote("")).catch(() => void 0);
                },
                children: "\u6DFB\u52A0\u5907\u6CE8"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs31("section", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsx33("h3", { className: "text-xs font-medium", children: "\u5904\u7406\u8BB0\u5F55" }),
            detail.events.length === 0 ? /* @__PURE__ */ jsx33("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD8\u6CA1\u6709\u5904\u7406\u8BB0\u5F55\u3002" }) : /* @__PURE__ */ jsx33("ul", { className: "flex flex-col", children: detail.events.map((event, index) => /* @__PURE__ */ jsxs31("li", { className: "border-b border-(--ui-stroke-secondary) py-1.5 text-xs text-(--ui-text-tertiary)", children: [
              formatShanghai3(event.at),
              " \xB7 ",
              event.by || "\u6709\u4EBA",
              " \xB7 ",
              event.text
            ] }, `${event.at}-${index}`)) })
          ] }),
          actionError ? /* @__PURE__ */ jsx33("p", { className: "text-xs text-destructive", children: actionError }) : null,
          notice ? /* @__PURE__ */ jsx33("p", { className: "text-xs leading-relaxed text-(--ui-text-secondary)", children: notice }) : null
        ] }) : null,
        /* @__PURE__ */ jsx33(
          BookDialog,
          {
            open: booking,
            mode: "book",
            appointment: appointmentInputValue(detail?.appointment_at ?? null),
            engineer: detail?.engineer ?? "",
            providerRef: detail?.provider_ref ?? "",
            onClose: () => setBooking(false),
            onConfirm: async (value) => {
              await runStatus("booked", {
                appointment_at: appointmentPayload(value.appointment),
                engineer: value.engineer || void 0,
                provider_ref: value.providerRef || void 0
              });
            }
          }
        ),
        /* @__PURE__ */ jsx33(
          BookDialog,
          {
            open: flagging,
            mode: "exception",
            appointment: "",
            engineer: "",
            providerRef: "",
            onClose: () => setFlagging(false),
            onConfirm: async (value) => {
              await runStatus("exception", { reason: value.reason });
            }
          }
        ),
        /* @__PURE__ */ jsx33(
          ConfirmDialog8,
          {
            open: cancelling,
            title: "\u53D6\u6D88\u8FD9\u5F20\u5DE5\u5355",
            description: "\u53D6\u6D88\u540E\u4E0D\u518D\u5B89\u6392\u4E0A\u95E8\u3002",
            confirmLabel: "\u53D6\u6D88\u5DE5\u5355",
            onClose: () => setCancelling(false),
            onConfirm: async () => {
              await runStatus("cancelled");
            }
          }
        )
      ]
    }
  );
}

// src/pages/installs/InstallsPage.tsx
import { Fragment as Fragment12, jsx as jsx34, jsxs as jsxs32 } from "react/jsx-runtime";
var SEGMENTS2 = [
  { id: "action", label: "\u5F85\u5904\u7406" },
  { id: "booked", label: "\u5DF2\u9884\u7EA6" },
  { id: "done", label: "\u5DF2\u5B8C\u5DE5" },
  { id: "all", label: "\u5168\u90E8" }
];
function InstallsPage() {
  const apiBase = useApiBase();
  const [segment, setSegment] = useState30("action");
  const [shopId, setShopId] = useState30(void 0);
  const [overdueOnly, setOverdueOnly] = useState30(false);
  const [qInput, setQInput] = useState30("");
  const [q, setQ] = useState30("");
  const [selected, setSelected] = useState30([]);
  const [activeId, setActiveId] = useState30(null);
  const [importOpen, setImportOpen] = useState30(false);
  const [exporting, setExporting] = useState30(false);
  const [exportError, setExportError] = useState30(null);
  useEffect27(() => {
    const timer9 = window.setTimeout(() => setQ(qInput.trim()), 300);
    return () => window.clearTimeout(timer9);
  }, [qInput]);
  const shopsQuery = useQuery(() => listShops(), [apiBase]);
  const summaryQuery = useQuery(() => getInstallSummary(shopId), [apiBase, shopId]);
  const listQuery = useQuery(
    () => listInstalls({
      status: segmentStatus(segment),
      shop_id: shopId,
      q: q || void 0,
      overdue: overdueOnly ? true : void 0
    }),
    [apiBase, segment, shopId, q, overdueOnly]
  );
  const reload = () => {
    shopsQuery.reload();
    summaryQuery.reload();
    listQuery.reload();
    void refreshNeedsActionCount();
  };
  const error = listQuery.error ?? summaryQuery.error ?? shopsQuery.error;
  const offline = isOfflineError(error);
  const summary = summaryQuery.data;
  const rows = (listQuery.data ?? []).filter((item) => {
    if (segment === "action") return isActionStatus(item.status);
    if (segment === "booked" || segment === "done") return item.status === segment;
    return true;
  });
  const loading = !error && listQuery.loading && !listQuery.data;
  const toggle = (id, on) => {
    setSelected((current) => on ? [...current, id] : current.filter((item) => item !== id));
  };
  const exportCsv = async () => {
    setExporting(true);
    setExportError(null);
    try {
      if (selected.length > 0) await exportInstalls({ ids: selected });
      else await exportInstalls({ status: "pending" });
    } catch (reason) {
      setExportError(reason instanceof Error ? reason.message : "\u5BFC\u51FA\u5931\u8D25");
    } finally {
      setExporting(false);
    }
  };
  return /* @__PURE__ */ jsxs32("div", { className: "flex min-h-0 min-w-0 flex-1 flex-col gap-3", children: [
    /* @__PURE__ */ jsxs32(HeaderActions, { children: [
      /* @__PURE__ */ jsx34(Button29, { size: "sm", variant: "outline", disabled: exporting, onClick: () => void exportCsv(), children: exporting ? "\u6B63\u5728\u5BFC\u51FA" : selected.length > 0 ? `\u5BFC\u51FA\u52FE\u9009\u7684 ${selected.length} \u5F20` : "\u5BFC\u51FA\u5F85\u9884\u7EA6" }),
      /* @__PURE__ */ jsx34(Button29, { size: "sm", onClick: () => setImportOpen(true), children: "\u5BFC\u5165\u8BA2\u5355" })
    ] }),
    offline ? /* @__PURE__ */ jsx34(OfflineNotice, { detail: error instanceof Error ? error.message : void 0, onRetry: reload }) : null,
    !offline && error ? /* @__PURE__ */ jsx34("div", { className: "flex flex-1 items-center justify-center py-10", children: /* @__PURE__ */ jsx34(ErrorState16, { title: "\u5DE5\u5355\u52A0\u8F7D\u5931\u8D25", description: error instanceof Error ? error.message : "\u8BF7\u91CD\u8BD5", children: /* @__PURE__ */ jsx34(Button29, { size: "sm", variant: "outline", onClick: reload, children: "\u91CD\u8BD5" }) }) }) : null,
    !offline && !error ? /* @__PURE__ */ jsxs32(Fragment12, { children: [
      /* @__PURE__ */ jsxs32("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--ui-text-secondary)", children: [
        /* @__PURE__ */ jsxs32("span", { className: "inline-flex flex-wrap items-center gap-1.5", children: [
          "\u5F85\u9884\u7EA6",
          summaryQuery.loading && !summary ? /* @__PURE__ */ jsx34(Skeleton4, { className: "h-4 w-6" }) : /* @__PURE__ */ jsx34(Badge13, { variant: "outline", children: summary?.pending ?? 0 }),
          /* @__PURE__ */ jsx34("span", { className: "text-(--ui-text-tertiary)", children: "\uFF08\u5176\u4E2D\u8D85\u65F6" }),
          summaryQuery.loading && !summary ? /* @__PURE__ */ jsx34(Skeleton4, { className: "h-4 w-6" }) : /* @__PURE__ */ jsx34(Badge13, { variant: "warn", children: summary?.overdue ?? 0 }),
          /* @__PURE__ */ jsx34("span", { className: "text-(--ui-text-tertiary)", children: "\uFF09" })
        ] }),
        /* @__PURE__ */ jsxs32("span", { className: "inline-flex items-center gap-1.5", children: [
          "\u5DF2\u9884\u7EA6",
          summaryQuery.loading && !summary ? /* @__PURE__ */ jsx34(Skeleton4, { className: "h-4 w-6" }) : /* @__PURE__ */ jsx34(Badge13, { variant: "outline", children: summary?.booked ?? 0 })
        ] }),
        /* @__PURE__ */ jsxs32("span", { className: "inline-flex items-center gap-1.5", children: [
          "\u5F02\u5E38",
          summaryQuery.loading && !summary ? /* @__PURE__ */ jsx34(Skeleton4, { className: "h-4 w-6" }) : /* @__PURE__ */ jsx34(Badge13, { variant: "destructive", children: summary?.exception ?? 0 })
        ] }),
        /* @__PURE__ */ jsxs32("span", { className: "inline-flex items-center gap-1.5", children: [
          "\u4ECA\u65E5\u5B8C\u5DE5",
          summaryQuery.loading && !summary ? /* @__PURE__ */ jsx34(Skeleton4, { className: "h-4 w-6" }) : /* @__PURE__ */ jsx34(Badge13, { variant: "outline", children: summary?.done_today ?? 0 })
        ] }),
        listQuery.loading && listQuery.data ? /* @__PURE__ */ jsx34(Loader15, {}) : null
      ] }),
      /* @__PURE__ */ jsxs32("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx34(
          SegmentedControl10,
          {
            options: SEGMENTS2,
            value: segment,
            sizing: "content",
            onChange: (value) => {
              setSegment(value);
              setSelected([]);
            }
          }
        ),
        /* @__PURE__ */ jsxs32(
          Select13,
          {
            value: shopId == null ? "all" : String(shopId),
            onValueChange: (value) => {
              setShopId(value === "all" ? void 0 : Number(value));
              setSelected([]);
            },
            children: [
              /* @__PURE__ */ jsx34(SelectTrigger13, { "aria-label": "\u5E97\u94FA", className: "w-44 max-w-full", children: /* @__PURE__ */ jsx34(SelectValue13, { placeholder: "\u5168\u90E8\u5E97\u94FA" }) }),
              /* @__PURE__ */ jsxs32(SelectContent13, { children: [
                /* @__PURE__ */ jsx34(SelectItem13, { value: "all", children: "\u5168\u90E8\u5E97\u94FA" }),
                (shopsQuery.data ?? []).map((shop) => /* @__PURE__ */ jsx34(SelectItem13, { value: String(shop.id), children: shop.name }, shop.id))
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxs32("span", { className: "inline-flex items-center gap-1.5 text-xs text-(--ui-text-secondary)", children: [
          /* @__PURE__ */ jsx34(Switch4, { size: "xs", checked: overdueOnly, onCheckedChange: setOverdueOnly, "aria-label": "\u53EA\u770B\u8D85\u65F6" }),
          "\u53EA\u770B\u8D85\u65F6"
        ] }),
        /* @__PURE__ */ jsx34(SearchField4, { "aria-label": "\u641C\u7D22\u5DE5\u5355", placeholder: "\u8BA2\u5355\u53F7\u3001\u5546\u54C1\u3001\u6536\u8D27\u4EBA\u3001\u624B\u673A", value: qInput, onChange: setQInput })
      ] }),
      exportError ? /* @__PURE__ */ jsx34("p", { className: "text-xs text-destructive", children: exportError }) : null,
      loading ? /* @__PURE__ */ jsx34("div", { className: "flex flex-col gap-2 py-2", children: Array.from({ length: 6 }, (_, index) => /* @__PURE__ */ jsx34(Skeleton4, { className: "h-12 w-full" }, index)) }) : null,
      !loading && rows.length === 0 ? /* @__PURE__ */ jsx34("div", { className: "flex flex-1 items-center justify-center py-10", children: /* @__PURE__ */ jsx34(EmptyState7, { title: "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u5DE5\u5355", description: "\u6362\u4E2A\u7B5B\u9009\uFF0C\u6216\u5148\u5BFC\u5165\u4E00\u5F20\u8BA2\u5355\u8868\u3002" }) }) : null,
      !loading && rows.length > 0 ? /* @__PURE__ */ jsx34("ul", { className: "min-w-0", children: rows.map((item) => /* @__PURE__ */ jsx34(
        InstallRow,
        {
          item,
          checked: selected.includes(item.id),
          onToggle: (on) => toggle(item.id, on),
          onOpen: () => setActiveId(item.id)
        },
        item.id
      )) }) : null
    ] }) : null,
    /* @__PURE__ */ jsx34(InstallDrawer, { installId: activeId, onClose: () => setActiveId(null), onChanged: reload }),
    /* @__PURE__ */ jsx34(
      ImportDialog,
      {
        open: importOpen,
        shops: shopsQuery.data ?? [],
        initialKind: "orders",
        onClose: () => setImportOpen(false),
        onDone: reload
      }
    )
  ] });
}
function InstallRow({
  item,
  checked,
  onToggle,
  onOpen
}) {
  return /* @__PURE__ */ jsxs32("li", { className: "flex items-start gap-2 border-b border-(--ui-stroke-secondary) px-1 py-2", children: [
    /* @__PURE__ */ jsx34(Checkbox4, { checked, "aria-label": `\u9009\u62E9 ${item.code}`, onCheckedChange: onToggle }),
    /* @__PURE__ */ jsxs32("button", { type: "button", onClick: onOpen, className: "flex min-w-0 flex-1 flex-col gap-1 text-left hover:bg-(--ui-bg-quinary)", children: [
      /* @__PURE__ */ jsxs32("span", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx34("span", { className: "text-xs text-(--ui-text-tertiary)", children: item.code }),
        /* @__PURE__ */ jsx34("span", { className: "min-w-0 truncate text-sm font-medium", children: item.title }),
        /* @__PURE__ */ jsx34(Badge13, { variant: statusVariant4(item.status), children: statusLabel5(item.status) }),
        item.overdue ? /* @__PURE__ */ jsx34(Badge13, { variant: "warn", children: "\u8D85\u65F6" }) : null
      ] }),
      /* @__PURE__ */ jsxs32("span", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-(--ui-text-secondary)", children: [
        /* @__PURE__ */ jsxs32("span", { children: [
          item.buyer_name || "\u672A\u586B\u6536\u8D27\u4EBA",
          " ",
          item.phone || ""
        ] }),
        item.address ? /* @__PURE__ */ jsx34(Tip6, { label: item.address, children: /* @__PURE__ */ jsx34("span", { className: "max-w-48 truncate text-(--ui-text-tertiary)", children: item.address }) }) : null,
        item.remark ? /* @__PURE__ */ jsx34(Tip6, { label: item.remark, children: /* @__PURE__ */ jsx34("span", { className: "inline-flex h-4 items-center rounded-sm border border-(--ui-stroke-secondary) px-1 text-(--ui-text-tertiary)", children: "\u7559\u8A00" }) }) : null
      ] }),
      /* @__PURE__ */ jsxs32("span", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-(--ui-text-tertiary)", children: [
        /* @__PURE__ */ jsxs32("span", { children: [
          "\u4ED8\u6B3E ",
          formatShanghai3(item.paid_at)
        ] }),
        /* @__PURE__ */ jsxs32("span", { children: [
          "\u9884\u7EA6 ",
          formatShanghai3(item.appointment_at)
        ] })
      ] })
    ] })
  ] });
}

// src/pages/overview/OverviewPage.tsx
import { useMemo as useMemo3, useState as useState34 } from "react";
import {
  Button as Button32,
  ErrorState as ErrorState19,
  Input as Input23,
  Loader as Loader18,
  SegmentedControl as SegmentedControl12,
  Select as Select14,
  SelectContent as SelectContent14,
  SelectItem as SelectItem14,
  SelectTrigger as SelectTrigger14,
  SelectValue as SelectValue14,
  Skeleton as Skeleton5,
  cn as cn7
} from "@hermes/plugin-sdk";

// src/pages/overview/AlertDrawer.tsx
import { useEffect as useEffect28, useState as useState31 } from "react";
import {
  Badge as Badge14,
  Button as Button30,
  ConfirmDialog as ConfirmDialog9,
  ErrorState as ErrorState17,
  Input as Input22,
  Loader as Loader16,
  SegmentedControl as SegmentedControl11,
  Switch as Switch5,
  Textarea as Textarea21
} from "@hermes/plugin-sdk";
import { jsx as jsx35, jsxs as jsxs33 } from "react/jsx-runtime";
function AlertDrawer({
  open,
  shopId,
  onClose,
  onChanged
}) {
  const [tab, setTab] = useState31("alerts");
  useEffect28(() => {
    if (open) setTab("alerts");
  }, [open]);
  return /* @__PURE__ */ jsx35(
    SideDrawer,
    {
      open,
      title: "\u6295\u653E\u63D0\u9192",
      description: "\u53EA\u63D0\u9192\uFF0C\u4E0D\u4F1A\u53BB\u5E73\u53F0\u6539\u51FA\u4EF7\u6216\u6682\u505C\u8BA1\u5212\u3002\u5904\u7406\u5B8C\u5728\u8FD9\u91CC\u6807\u4E00\u4E0B\u3002",
      onClose,
      children: /* @__PURE__ */ jsxs33("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsx35(
          SegmentedControl11,
          {
            options: [
              { id: "alerts", label: "\u672A\u5904\u7406" },
              { id: "rules", label: "\u6295\u653E\u89C4\u5219" }
            ],
            value: tab,
            sizing: "content",
            onChange: (value) => setTab(value)
          }
        ),
        tab === "alerts" ? /* @__PURE__ */ jsx35(AlertList, { open, shopId, onChanged }) : /* @__PURE__ */ jsx35(AdRulesEditor, { open, onChanged })
      ] })
    }
  );
}
function AlertList({
  open,
  shopId,
  onChanged
}) {
  const [alerts, setAlerts] = useState31([]);
  const [loaded, setLoaded] = useState31(false);
  const [error, setError] = useState31(null);
  const [revision, setRevision] = useState31(0);
  const [notes, setNotes] = useState31({});
  const [pendingId, setPendingId] = useState31(null);
  const [ignoreTarget, setIgnoreTarget] = useState31(null);
  const [actionError, setActionError] = useState31(null);
  useEffect28(() => {
    if (!open) return;
    let cancelled = false;
    setLoaded(false);
    setError(null);
    listAlerts({ status: "open", shopId }).then((rows) => {
      if (cancelled) return;
      setAlerts(rows);
      setNotes((current) => ({ ...Object.fromEntries(rows.map((row) => [row.id, row.note ?? ""])), ...current }));
      setLoaded(true);
    }).catch((reason) => {
      if (cancelled) return;
      setError(reason);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [open, shopId, revision]);
  const resolve = async (alert) => {
    setPendingId(alert.id);
    setActionError(null);
    try {
      await patchAlert(alert.id, { status: "resolved", note: notes[alert.id] ?? "" });
      onChanged();
      setRevision((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "\u64CD\u4F5C\u5931\u8D25");
    } finally {
      setPendingId(null);
    }
  };
  return /* @__PURE__ */ jsxs33("div", { className: "flex flex-col gap-3", children: [
    !loaded && !error ? /* @__PURE__ */ jsxs33("div", { className: "flex items-center gap-2 text-xs text-(--ui-text-tertiary)", children: [
      /* @__PURE__ */ jsx35(Loader16, {}),
      "\u6B63\u5728\u8BFB\u53D6\u63D0\u9192"
    ] }) : null,
    error ? /* @__PURE__ */ jsx35(
      ErrorState17,
      {
        title: isOfflineError(error) ? "\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1" : "\u63D0\u9192\u52A0\u8F7D\u5931\u8D25",
        description: error instanceof Error ? error.message : "\u8BF7\u91CD\u8BD5",
        children: /* @__PURE__ */ jsx35(Button30, { size: "sm", variant: "outline", onClick: () => setRevision((value) => value + 1), children: "\u91CD\u8BD5" })
      }
    ) : null,
    loaded && !error && alerts.length === 0 ? /* @__PURE__ */ jsx35("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u6CA1\u6709\u672A\u5904\u7406\u7684\u6295\u653E\u63D0\u9192\u3002" }) : null,
    actionError ? /* @__PURE__ */ jsx35("p", { className: "text-xs text-destructive", children: actionError }) : null,
    /* @__PURE__ */ jsx35("ul", { className: "flex flex-col gap-3", children: (loaded && !error ? alerts : []).map((alert) => /* @__PURE__ */ jsxs33("li", { className: "flex flex-col gap-2 border-b border-(--ui-stroke-secondary) pb-3", children: [
      /* @__PURE__ */ jsxs33("div", { className: "flex flex-wrap items-center gap-1.5", children: [
        /* @__PURE__ */ jsxs33("span", { className: "text-xs font-medium", children: [
          alert.tool,
          " \xB7 ",
          alert.campaign
        ] }),
        /* @__PURE__ */ jsx35(Badge14, { variant: alert.level === "must" ? "destructive" : "warn", children: levelLabel(alert.level) })
      ] }),
      /* @__PURE__ */ jsx35("p", { className: "text-xs leading-relaxed text-(--ui-text-secondary)", children: alert.message }),
      /* @__PURE__ */ jsxs33("p", { className: "text-[0.6875rem] text-(--ui-text-tertiary)", children: [
        alert.shop_name,
        " \xB7 \u6570\u636E\u65E5 ",
        alert.date,
        " \xB7 \u53D1\u73B0\u4E8E ",
        formatTime(alert.found_at)
      ] }),
      /* @__PURE__ */ jsx35(
        Textarea21,
        {
          "aria-label": `${alert.campaign}\u7684\u5907\u6CE8`,
          value: notes[alert.id] ?? "",
          placeholder: "\u5907\u6CE8\uFF08\u53EF\u9009\uFF09\uFF0C\u4F8B\u5982\uFF1A\u5DF2\u5728\u540E\u53F0\u964D\u4E86\u51FA\u4EF7",
          onChange: (event) => setNotes((current) => ({ ...current, [alert.id]: event.target.value }))
        }
      ),
      /* @__PURE__ */ jsxs33("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx35(Button30, { size: "xs", disabled: pendingId === alert.id, onClick: () => void resolve(alert), children: "\u6807\u4E3A\u5DF2\u5904\u7406" }),
        /* @__PURE__ */ jsx35(
          Button30,
          {
            size: "xs",
            variant: "outline",
            disabled: pendingId === alert.id,
            onClick: () => setIgnoreTarget(alert),
            children: "\u5FFD\u7565"
          }
        )
      ] })
    ] }, alert.id)) }),
    /* @__PURE__ */ jsx35(
      ConfirmDialog9,
      {
        open: ignoreTarget != null,
        title: "\u5FFD\u7565\u8FD9\u6761\u63D0\u9192",
        description: "\u5FFD\u7565\u540E\uFF0C\u53EA\u8981\u60C5\u51B5\u6CA1\u53D8\uFF0C\u4E0B\u6B21\u68C0\u67E5\u4E0D\u4F1A\u518D\u628A\u5B83\u6253\u5F00\u3002",
        confirmLabel: "\u5FFD\u7565",
        onClose: () => setIgnoreTarget(null),
        onConfirm: async () => {
          if (!ignoreTarget) return;
          try {
            await patchAlert(ignoreTarget.id, { status: "ignored", note: notes[ignoreTarget.id] ?? "" });
          } catch (reason) {
            throw new Error(reason instanceof ApiError ? reason.message : "\u5FFD\u7565\u5931\u8D25");
          }
          setIgnoreTarget(null);
          onChanged();
          setRevision((value) => value + 1);
        }
      }
    )
  ] });
}
function AdRulesEditor({ open, onChanged }) {
  const [drafts, setDrafts] = useState31([]);
  const [loaded, setLoaded] = useState31(false);
  const [error, setError] = useState31(null);
  const [revision, setRevision] = useState31(0);
  const [saving, setSaving] = useState31(false);
  const [running2, setRunning2] = useState31(false);
  const [notice, setNotice] = useState31(null);
  const [actionError, setActionError] = useState31(null);
  useEffect28(() => {
    if (!open) return;
    let cancelled = false;
    setLoaded(false);
    setError(null);
    listAdRules().then((rules) => {
      if (cancelled) return;
      setDrafts(rules.map(toDraft2));
      setLoaded(true);
    }).catch((reason) => {
      if (cancelled) return;
      setError(reason);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [open, revision]);
  const update = (id, patch) => {
    setDrafts((current) => current.map((rule) => rule.id === id ? { ...rule, ...patch } : rule));
    setNotice(null);
  };
  const save = async () => {
    setActionError(null);
    setNotice(null);
    const payloads = [];
    for (const rule of drafts) {
      const parsed = paramsOf(rule);
      if (typeof parsed === "string") {
        setActionError(parsed);
        return;
      }
      payloads.push({ rule, params: parsed });
    }
    setSaving(true);
    try {
      const saved = [];
      for (const { rule, params } of payloads) {
        saved.push(toDraft2(await patchAdRule(rule.id, { enabled: rule.enabled, params })));
      }
      setDrafts(saved);
      setNotice("\u5DF2\u4FDD\u5B58");
      onChanged();
    } catch (reason) {
      setActionError(reason instanceof ApiError ? reason.message : "\u4FDD\u5B58\u5931\u8D25");
    } finally {
      setSaving(false);
    }
  };
  const run = async () => {
    setRunning2(true);
    setActionError(null);
    try {
      const result = await runAdRules();
      setNotice(`\u65B0\u589E ${result.opened} \u6761\uFF0C\u81EA\u52A8\u8F6C\u5DF2\u5904\u7406 ${result.resolved} \u6761\uFF0C\u8FD8\u5269 ${result.open_remaining} \u6761\u672A\u5904\u7406`);
      onChanged();
    } catch (reason) {
      setActionError(reason instanceof ApiError ? reason.message : "\u68C0\u67E5\u5931\u8D25");
    } finally {
      setRunning2(false);
    }
  };
  if (!loaded && !error) {
    return /* @__PURE__ */ jsxs33("div", { className: "flex items-center gap-2 text-xs text-(--ui-text-tertiary)", children: [
      /* @__PURE__ */ jsx35(Loader16, {}),
      "\u6B63\u5728\u8BFB\u53D6\u89C4\u5219"
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsx35(
      ErrorState17,
      {
        title: isOfflineError(error) ? "\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1" : "\u89C4\u5219\u52A0\u8F7D\u5931\u8D25",
        description: error instanceof Error ? error.message : "\u8BF7\u91CD\u8BD5",
        children: /* @__PURE__ */ jsx35(Button30, { size: "sm", variant: "outline", onClick: () => setRevision((value) => value + 1), children: "\u91CD\u8BD5" })
      }
    );
  }
  return /* @__PURE__ */ jsxs33("div", { className: "flex flex-col gap-1", children: [
    /* @__PURE__ */ jsx35("p", { className: "text-[0.6875rem] text-(--ui-text-tertiary)", children: "\u6539\u5B8C\u5148\u4FDD\u5B58\uFF0C\u518D\u7ACB\u5373\u68C0\u67E5\u3002\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\u4E0D\u53C2\u4E0E\u68C0\u67E5\u3002" }),
    /* @__PURE__ */ jsx35("ul", { className: "flex flex-col", children: drafts.map((rule) => /* @__PURE__ */ jsxs33("li", { className: "flex flex-col gap-2 border-b border-(--ui-stroke-secondary) py-3", children: [
      /* @__PURE__ */ jsxs33("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx35("span", { className: "min-w-0 flex-1 truncate text-xs font-medium", children: rule.name }),
        /* @__PURE__ */ jsx35(Badge14, { variant: rule.level === "must" ? "destructive" : "warn", children: levelLabel(rule.level) }),
        /* @__PURE__ */ jsx35(
          Switch5,
          {
            checked: rule.enabled,
            "aria-label": `${rule.name}\u5F00\u5173`,
            onCheckedChange: (checked) => update(rule.id, { enabled: checked })
          }
        )
      ] }),
      /* @__PURE__ */ jsx35(RuleParams, { rule, onChange: (patch) => update(rule.id, patch) })
    ] }, rule.id)) }),
    /* @__PURE__ */ jsxs33("div", { className: "flex flex-wrap items-center justify-end gap-2 pt-2", children: [
      /* @__PURE__ */ jsx35(Button30, { size: "sm", variant: "outline", disabled: saving || running2, onClick: () => void run(), children: running2 ? "\u6B63\u5728\u68C0\u67E5" : "\u7ACB\u5373\u68C0\u67E5" }),
      /* @__PURE__ */ jsx35(Button30, { size: "sm", disabled: saving || running2, onClick: () => void save(), children: saving ? "\u6B63\u5728\u4FDD\u5B58" : "\u4FDD\u5B58" })
    ] }),
    notice ? /* @__PURE__ */ jsx35("p", { className: "text-xs text-(--ui-text-secondary)", children: notice }) : null,
    actionError ? /* @__PURE__ */ jsx35("p", { className: "text-xs text-destructive", children: actionError }) : null
  ] });
}
function RuleParams({ rule, onChange }) {
  const setParam = (key, raw) => {
    const value = Number(raw);
    onChange({ params: { ...rule.params, [key]: raw === "" || !Number.isFinite(value) ? void 0 : value } });
  };
  if (rule.kind === "roi_below") {
    return /* @__PURE__ */ jsxs33("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsx35(NumberField, { label: "ROI \u4F4E\u4E8E", value: rule.params.min_roi, step: "0.1", onChange: (raw) => setParam("min_roi", raw) }),
      /* @__PURE__ */ jsx35(NumberField, { label: "\u4E14\u82B1\u8D39\u81F3\u5C11", value: rule.params.min_spend, onChange: (raw) => setParam("min_spend", raw) })
    ] });
  }
  if (rule.kind === "spend_spike") {
    return /* @__PURE__ */ jsx35(
      NumberField,
      {
        label: "\u9AD8\u4E8E\u524D 7 \u5929\u5E73\u5747\u7684 %",
        value: rule.params.spike_pct,
        onChange: (raw) => setParam("spike_pct", raw)
      }
    );
  }
  if (rule.kind === "spend_over_cap") {
    return /* @__PURE__ */ jsxs33("label", { className: "flex flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
      "\u6BCF\u5929\u82B1\u8D39\u4E0A\u9650\uFF0C\u4E00\u884C\u4E00\u4E2A\u8BA1\u5212\uFF1A\u8BA1\u5212\u540D \u7A7A\u683C \u91D1\u989D",
      /* @__PURE__ */ jsx35(
        Textarea21,
        {
          "aria-label": "\u8BA1\u5212\u65E5\u4E0A\u9650",
          placeholder: "\u53CC11\u9884\u70ED 600\n\u54C1\u724C\u8BCD 300",
          value: rule.capText,
          onChange: (event) => onChange({ capText: event.target.value })
        }
      ),
      /* @__PURE__ */ jsx35("span", { className: "text-[0.6875rem] text-(--ui-text-tertiary)", children: "\u6CA1\u5199\u7684\u8BA1\u5212\u4E0D\u67E5\u3002\u8BA1\u5212\u540D\u8981\u548C\u6295\u653E\u8868\u91CC\u4E00\u5B57\u4E0D\u5DEE\u3002" })
    ] });
  }
  return /* @__PURE__ */ jsx35("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD9\u6761\u89C4\u5219\u6CA1\u6709\u53C2\u6570\u3002" });
}
function NumberField({
  label,
  value,
  step,
  onChange
}) {
  return /* @__PURE__ */ jsxs33("label", { className: "flex min-w-0 flex-col gap-1 text-xs text-(--ui-text-secondary)", children: [
    label,
    /* @__PURE__ */ jsx35(
      Input22,
      {
        "aria-label": label,
        type: "number",
        min: 0,
        step,
        value: value ?? "",
        onChange: (event) => onChange(event.target.value)
      }
    )
  ] });
}
function toDraft2(rule) {
  const caps = rule.params.daily_cap ?? {};
  return {
    ...rule,
    capText: Object.entries(caps).map(([name, cap]) => `${name} ${cap}`).join("\n")
  };
}
function paramsOf(rule) {
  if (rule.kind === "roi_below") {
    return { min_roi: rule.params.min_roi ?? 2, min_spend: rule.params.min_spend ?? 200 };
  }
  if (rule.kind === "spend_spike") {
    return { spike_pct: rule.params.spike_pct ?? 150 };
  }
  if (rule.kind === "spend_over_cap") {
    const caps = {};
    for (const [index, line] of rule.capText.split("\n").entries()) {
      const text = line.trim();
      if (!text) continue;
      const match = /^(.+?)\s+([\d.]+)$/.exec(text);
      const cap = match ? Number(match[2]) : NaN;
      if (!match || !Number.isFinite(cap) || cap < 0) {
        return `\u65E5\u4E0A\u9650\u7B2C ${index + 1} \u884C\u770B\u4E0D\u61C2\uFF1A\u300C${text}\u300D\u3002\u683C\u5F0F\u662F \u8BA1\u5212\u540D \u7A7A\u683C \u91D1\u989D`;
      }
      caps[match[1].trim()] = cap;
    }
    return { daily_cap: caps };
  }
  return rule.params;
}

// src/pages/overview/ReportDialog.tsx
import { useEffect as useEffect29, useState as useState32 } from "react";
import {
  Button as Button31,
  Dialog as Dialog11,
  DialogContent as DialogContent11,
  DialogDescription as DialogDescription4,
  DialogFooter as DialogFooter9,
  DialogHeader as DialogHeader11,
  DialogTitle as DialogTitle11,
  ErrorState as ErrorState18,
  Loader as Loader17
} from "@hermes/plugin-sdk";
import { jsx as jsx36, jsxs as jsxs34 } from "react/jsx-runtime";
function ReportDialog({ open, date, onClose }) {
  const [report, setReport] = useState32(null);
  const [error, setError] = useState32(null);
  const [revision, setRevision] = useState32(0);
  const [copied, setCopied] = useState32(null);
  useEffect29(() => {
    if (!open) return;
    let cancelled = false;
    setReport(null);
    setError(null);
    setCopied(null);
    getDailyReport(date).then(
      (value) => {
        if (!cancelled) setReport(value);
      },
      (reason) => {
        if (!cancelled) setError(reason);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [open, date, revision]);
  const copy = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report.markdown);
      setCopied("\u5DF2\u590D\u5236\uFF0C\u53EF\u4EE5\u8D34\u5230\u7FA4\u91CC");
    } catch {
      setCopied("\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u9009\u4E2D\u6587\u5B57\u590D\u5236");
    }
  };
  return /* @__PURE__ */ jsx36(Dialog11, { open, onOpenChange: (next) => {
    if (!next) onClose();
  }, children: /* @__PURE__ */ jsxs34(DialogContent11, { children: [
    /* @__PURE__ */ jsxs34(DialogHeader11, { children: [
      /* @__PURE__ */ jsxs34(DialogTitle11, { children: [
        "\u7ECF\u8425\u65E5\u62A5",
        report ? ` ${report.date}` : ""
      ] }),
      /* @__PURE__ */ jsx36(DialogDescription4, { children: "\u548C\u6BCF\u5929\u65E9\u4E0A\u81EA\u52A8\u751F\u6210\u7684\u662F\u540C\u4E00\u4EFD\u3002\u590D\u5236\u540E\u7531\u4EBA\u53D1\u5230\u7FA4\u91CC\u3002" })
    ] }),
    !report && !error ? /* @__PURE__ */ jsxs34("div", { className: "flex items-center gap-2 py-6 text-xs text-(--ui-text-tertiary)", children: [
      /* @__PURE__ */ jsx36(Loader17, {}),
      "\u6B63\u5728\u751F\u6210"
    ] }) : null,
    error ? /* @__PURE__ */ jsx36(
      ErrorState18,
      {
        title: isOfflineError(error) ? "\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1" : "\u65E5\u62A5\u751F\u6210\u5931\u8D25",
        description: error instanceof Error ? error.message : "\u8BF7\u91CD\u8BD5",
        children: /* @__PURE__ */ jsx36(Button31, { size: "sm", variant: "outline", onClick: () => setRevision((value) => value + 1), children: "\u91CD\u8BD5" })
      }
    ) : null,
    report ? /* @__PURE__ */ jsx36("pre", { className: "max-h-[60vh] overflow-y-auto rounded-md border border-(--ui-stroke-secondary) bg-(--ui-bg-quinary) p-3 font-[inherit] text-xs leading-relaxed whitespace-pre-wrap text-(--ui-text-primary)", children: report.markdown }) : null,
    /* @__PURE__ */ jsxs34(DialogFooter9, { children: [
      copied ? /* @__PURE__ */ jsx36("span", { className: "mr-auto text-xs text-(--ui-text-secondary)", children: copied }) : null,
      /* @__PURE__ */ jsx36(Button31, { variant: "outline", onClick: onClose, children: "\u5173\u95ED" }),
      /* @__PURE__ */ jsx36(Button31, { disabled: !report, onClick: () => void copy(), children: "\u590D\u5236" })
    ] })
  ] }) });
}

// src/pages/overview/Sparkline.tsx
import { useState as useState33 } from "react";
import { cn as cn6 } from "@hermes/plugin-sdk";
import { Fragment as Fragment13, jsx as jsx37, jsxs as jsxs35 } from "react/jsx-runtime";
function Sparkline({
  points,
  height = "2rem",
  large = false,
  format = (value) => String(value),
  label
}) {
  const [hover, setHover] = useState33(null);
  const values = points.map((point) => point.value).filter((value) => value != null);
  if (points.length === 0 || values.length === 0) {
    return /* @__PURE__ */ jsx37(
      "div",
      {
        style: { height },
        className: "flex items-center justify-center text-[0.6875rem] text-(--ui-text-tertiary)",
        children: large ? "\u8FD9\u6BB5\u65F6\u95F4\u6CA1\u6709\u6570\u636E" : null
      }
    );
  }
  const max = Math.max(...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const pad = large ? 8 : 6;
  const x = (index) => points.length === 1 ? 50 : index / (points.length - 1) * 100;
  const y = (value) => pad + (1 - (value - min) / span) * (100 - pad * 2);
  const segments = [];
  let current = "";
  points.forEach((point, index) => {
    if (point.value == null) {
      if (current) segments.push(current);
      current = "";
      return;
    }
    current += `${current ? "L" : "M"}${x(index).toFixed(2)},${y(point.value).toFixed(2)}`;
  });
  if (current) segments.push(current);
  const last = [...points].reverse().find((point) => point.value != null);
  const lastIndex = last ? points.lastIndexOf(last) : -1;
  const peakIndex = points.findIndex((point) => point.value === max);
  const hovered = hover != null ? points[hover] : null;
  const onMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    setHover(Math.max(0, Math.min(points.length - 1, Math.round(ratio * (points.length - 1)))));
  };
  return /* @__PURE__ */ jsxs35("div", { className: "flex min-w-0 flex-col gap-1", children: [
    /* @__PURE__ */ jsxs35(
      "div",
      {
        role: "img",
        "aria-label": label,
        className: cn6("relative w-full", large && "cursor-crosshair"),
        style: { height },
        onPointerMove: large ? onMove : void 0,
        onPointerLeave: large ? () => setHover(null) : void 0,
        children: [
          /* @__PURE__ */ jsxs35("svg", { viewBox: "0 0 100 100", preserveAspectRatio: "none", className: "absolute inset-0 h-full w-full overflow-visible", children: [
            large ? /* @__PURE__ */ jsx37(
              "line",
              {
                x1: "0",
                x2: "100",
                y1: y(min),
                y2: y(min),
                stroke: "var(--ui-stroke-secondary)",
                strokeWidth: "1",
                vectorEffect: "non-scaling-stroke"
              }
            ) : null,
            segments.map((d) => /* @__PURE__ */ jsx37(
              "path",
              {
                d,
                fill: "none",
                stroke: "var(--ui-accent)",
                strokeWidth: large ? 1.75 : 1.5,
                strokeLinejoin: "round",
                strokeLinecap: "round",
                vectorEffect: "non-scaling-stroke"
              },
              d
            ))
          ] }),
          last && lastIndex >= 0 && hover == null ? /* @__PURE__ */ jsx37(Dot, { left: x(lastIndex), top: y(last.value) }) : null,
          large && peakIndex >= 0 && hover == null ? /* @__PURE__ */ jsxs35(
            "span",
            {
              className: "pointer-events-none absolute -translate-x-1/2 -translate-y-full pb-1 text-[0.6875rem] whitespace-nowrap text-(--ui-text-secondary) tabular-nums",
              style: { left: `${clamp(x(peakIndex), 6, 94)}%`, top: `${y(max)}%` },
              children: [
                "\u6700\u9AD8 ",
                format(max)
              ]
            }
          ) : null,
          large && hover != null && hovered ? /* @__PURE__ */ jsxs35(Fragment13, { children: [
            /* @__PURE__ */ jsx37(
              "span",
              {
                className: "pointer-events-none absolute inset-y-0 w-px bg-(--ui-stroke-secondary)",
                style: { left: `${x(hover)}%` }
              }
            ),
            hovered.value != null ? /* @__PURE__ */ jsx37(Dot, { left: x(hover), top: y(hovered.value) }) : null,
            /* @__PURE__ */ jsxs35(
              "span",
              {
                className: "pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) px-1.5 py-0.5 text-[0.6875rem] whitespace-nowrap text-(--ui-text-primary) tabular-nums",
                style: { left: `${clamp(x(hover), 8, 92)}%` },
                children: [
                  shortDate(hovered.date),
                  " \xB7 ",
                  hovered.value == null ? "\u2014" : format(hovered.value)
                ]
              }
            )
          ] }) : null
        ]
      }
    ),
    large ? /* @__PURE__ */ jsxs35("div", { className: "flex justify-between text-[0.6875rem] text-(--ui-text-tertiary) tabular-nums", children: [
      /* @__PURE__ */ jsx37("span", { children: shortDate(points[0].date) }),
      /* @__PURE__ */ jsx37("span", { children: shortDate(points[points.length - 1].date) })
    ] }) : null
  ] });
}
function Dot({ left, top }) {
  return /* @__PURE__ */ jsx37(
    "span",
    {
      className: "pointer-events-none absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--ui-accent)",
      style: { left: `${left}%`, top: `${top}%` }
    }
  );
}
function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}
function shortDate(iso) {
  const [, month, day] = iso.split("-");
  return month && day ? `${Number(month)}-${Number(day)}` : iso;
}

// src/pages/overview/OverviewPage.tsx
import { Fragment as Fragment14, jsx as jsx38, jsxs as jsxs36 } from "react/jsx-runtime";
var CARDS = [
  { key: "sales_amount", label: "\u9500\u552E\u989D", kind: "money" },
  { key: "orders", label: "\u8BA2\u5355", kind: "count" },
  { key: "visitors", label: "\u8BBF\u5BA2", kind: "count" },
  { key: "conversion_rate", label: "\u8F6C\u5316\u7387", kind: "ratio" },
  { key: "avg_order_value", label: "\u5BA2\u5355\u4EF7", kind: "money" },
  { key: "ad_spend", label: "\u6295\u653E\u82B1\u8D39", kind: "money" },
  { key: "ad_gmv", label: "\u6295\u653E GMV", kind: "money" },
  { key: "roi", label: "ROI", kind: "roi" }
];
var KIND_OF = Object.fromEntries(CARDS.map((card) => [card.key, card.kind]));
var LABEL_OF = Object.fromEntries(CARDS.map((card) => [card.key, card.label]));
var TREND_METRICS = [
  { id: "sales_amount", label: "\u9500\u552E\u989D" },
  { id: "orders", label: "\u8BA2\u5355" },
  { id: "visitors", label: "\u8BBF\u5BA2" },
  { id: "ad_spend", label: "\u6295\u653E\u82B1\u8D39" },
  { id: "roi", label: "ROI" }
];
var SENSITIVE = /* @__PURE__ */ new Set(["roi", "conversion_rate"]);
function OverviewPage() {
  const apiBase = useApiBase();
  const [shopId, setShopId] = useState34(void 0);
  const [date, setDate] = useState34("");
  const [trendMetric, setTrendMetric] = useState34("sales_amount");
  const [trendDays, setTrendDays] = useState34(30);
  const [alertsOpen, setAlertsOpen] = useState34(false);
  const [reportOpen, setReportOpen] = useState34(false);
  const [importOpen, setImportOpen] = useState34(false);
  const shopsQuery = useQuery(() => listShops(), [apiBase]);
  const overviewQuery = useQuery(
    () => getOverview({ date: date || void 0, shopId }),
    [apiBase, date, shopId]
  );
  const day = overviewQuery.data?.date ?? void 0;
  const sparkQuery = useQuery(
    async () => {
      if (!day) return null;
      const trends = await Promise.all(
        CARDS.map((card) => getTrend({ metric: card.key, days: 7, shopId, date: day }))
      );
      return Object.fromEntries(trends.map((trend) => [trend.metric, trend.points]));
    },
    [apiBase, day, shopId]
  );
  const trendQuery = useQuery(
    async () => day ? getTrend({ metric: trendMetric, days: trendDays, shopId, date: day }) : null,
    [apiBase, day, shopId, trendMetric, trendDays]
  );
  const adQuery = useQuery(
    async () => day ? listAdSpend({ dateFrom: day, dateTo: day, shopId }) : null,
    [apiBase, day, shopId]
  );
  const alertsQuery = useQuery(() => listAlerts({ status: "open", shopId }), [apiBase, shopId]);
  const reloadAll = () => {
    alertsQuery.reload();
    shopsQuery.reload();
    overviewQuery.reload();
    sparkQuery.reload();
    trendQuery.reload();
    adQuery.reload();
    void refreshOpenAlertCount();
  };
  const shops = shopsQuery.data ?? [];
  const openAlerts = alertsQuery.data?.length;
  const overview = overviewQuery.data;
  const error = overviewQuery.error ?? shopsQuery.error ?? sparkQuery.error ?? trendQuery.error ?? adQuery.error;
  const offline = isOfflineError(error);
  const empty = overview != null && !date && isEmpty(overview);
  const adRows = useMemo3(
    () => [...adQuery.data ?? []].sort((a, b) => b.spend - a.spend),
    [adQuery.data]
  );
  return /* @__PURE__ */ jsxs36("div", { className: "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto", children: [
    /* @__PURE__ */ jsxs36(HeaderActions, { children: [
      /* @__PURE__ */ jsx38(Button32, { size: "sm", variant: "outline", onClick: () => setImportOpen(true), children: "\u5BFC\u5165\u7ECF\u8425 / \u6295\u653E\u8868" }),
      /* @__PURE__ */ jsx38(Button32, { size: "sm", onClick: () => setReportOpen(true), children: "\u770B\u65E5\u62A5" })
    ] }),
    offline ? /* @__PURE__ */ jsx38(OfflineNotice, { detail: error instanceof Error ? error.message : void 0, onRetry: reloadAll }) : null,
    !offline && error ? /* @__PURE__ */ jsx38("div", { className: "flex flex-1 items-center justify-center py-10", children: /* @__PURE__ */ jsx38(ErrorState19, { title: "\u7ECF\u8425\u6570\u636E\u52A0\u8F7D\u5931\u8D25", description: error instanceof Error ? error.message : "\u8BF7\u91CD\u8BD5", children: /* @__PURE__ */ jsx38(Button32, { size: "sm", variant: "outline", onClick: reloadAll, children: "\u91CD\u8BD5" }) }) }) : null,
    !offline && !error && empty ? /* @__PURE__ */ jsx38("div", { className: "flex flex-1 items-center justify-center py-10", children: /* @__PURE__ */ jsx38(
      EmptyBlock,
      {
        title: "\u8FD8\u6CA1\u6709\u7ECF\u8425\u6570\u636E",
        description: "\u5BFC\u5165\u540E\u53F0\u5BFC\u51FA\u7684\u7ECF\u8425\u8868\u548C\u6295\u653E\u8868\u540E\u663E\u793A\u3002\u4E5F\u53EF\u4EE5\u5728\u8BBE\u7F6E\u91CC\u914D\u597D\u62A5\u8868\u6587\u4EF6\u5939\uFF0C\u6BCF 10 \u5206\u949F\u81EA\u52A8\u5BFC\u5165\u3002",
        children: /* @__PURE__ */ jsx38(Button32, { size: "sm", onClick: () => setImportOpen(true), children: "\u5BFC\u5165\u7ECF\u8425 / \u6295\u653E\u8868" })
      }
    ) }) : null,
    !offline && !error && !empty ? /* @__PURE__ */ jsxs36(Fragment14, { children: [
      /* @__PURE__ */ jsxs36("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxs36(
          Select14,
          {
            value: shopId == null ? "all" : String(shopId),
            onValueChange: (value) => setShopId(value === "all" ? void 0 : Number(value)),
            children: [
              /* @__PURE__ */ jsx38(SelectTrigger14, { "aria-label": "\u5E97\u94FA", className: "w-48", children: /* @__PURE__ */ jsx38(SelectValue14, { placeholder: "\u5168\u90E8\u5E97\u94FA" }) }),
              /* @__PURE__ */ jsxs36(SelectContent14, { children: [
                /* @__PURE__ */ jsx38(SelectItem14, { value: "all", children: "\u5168\u90E8\u5E97\u94FA" }),
                shops.map((shop) => /* @__PURE__ */ jsxs36(SelectItem14, { value: String(shop.id), children: [
                  platformName(shop.platform),
                  " \xB7 ",
                  shop.name
                ] }, shop.id))
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx38("div", { className: "w-40 shrink-0", children: /* @__PURE__ */ jsx38(
          Input23,
          {
            "aria-label": "\u65E5\u671F",
            type: "date",
            value: date || overview?.date || "",
            onChange: (event) => setDate(event.target.value)
          }
        ) }),
        date ? /* @__PURE__ */ jsx38(Button32, { size: "xs", variant: "ghost", onClick: () => setDate(""), children: "\u56DE\u5230\u6700\u65B0\u4E00\u5929" }) : null,
        /* @__PURE__ */ jsx38("span", { className: "text-xs text-(--ui-text-tertiary)", children: overview?.compare_date ? `\u548C ${shortDate(overview.compare_date)} \u6BD4` : null }),
        overviewQuery.loading && overview ? /* @__PURE__ */ jsx38(Loader18, {}) : null,
        /* @__PURE__ */ jsx38("span", { className: "flex-1" }),
        /* @__PURE__ */ jsxs36(
          Button32,
          {
            size: "sm",
            variant: "outline",
            onClick: () => setAlertsOpen(true),
            "aria-label": `\u6295\u653E\u63D0\u9192\uFF0C${openAlerts ?? 0} \u6761\u672A\u5904\u7406`,
            children: [
              openAlerts ? /* @__PURE__ */ jsx38("span", { className: "size-1.5 rounded-full bg-amber-500", "aria-hidden": true }) : null,
              "\u6295\u653E\u63D0\u9192 ",
              openAlerts ?? ""
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx38("div", { className: "grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-2", children: CARDS.map((card) => /* @__PURE__ */ jsx38(
        MetricCard,
        {
          metric: card.key,
          label: card.label,
          value: overview?.metrics[card.key],
          points: sparkQuery.data?.[card.key],
          active: trendMetric === card.key,
          onSelect: TREND_METRICS.some((item) => item.id === card.key) ? () => setTrendMetric(card.key) : void 0
        },
        card.key
      )) }),
      /* @__PURE__ */ jsxs36("section", { className: "flex flex-col gap-2 rounded-lg border border-(--ui-stroke-secondary) p-3", children: [
        /* @__PURE__ */ jsxs36("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx38("h3", { className: "text-xs font-medium text-(--ui-text-primary)", children: "\u8D8B\u52BF" }),
          /* @__PURE__ */ jsx38(
            SegmentedControl12,
            {
              options: TREND_METRICS,
              value: trendMetric,
              sizing: "content",
              onChange: (value) => setTrendMetric(value)
            }
          ),
          /* @__PURE__ */ jsx38("span", { className: "flex-1" }),
          /* @__PURE__ */ jsx38(
            SegmentedControl12,
            {
              options: [
                { id: "7", label: "7 \u5929" },
                { id: "30", label: "30 \u5929" }
              ],
              value: String(trendDays),
              sizing: "content",
              onChange: (value) => setTrendDays(value === "7" ? 7 : 30)
            }
          )
        ] }),
        trendQuery.data ? /* @__PURE__ */ jsx38(
          Sparkline,
          {
            large: true,
            height: "10rem",
            label: `${LABEL_OF[trendMetric]}\u8FD1 ${trendDays} \u5929`,
            points: trendQuery.data.points,
            format: (value) => formatMetric2(value, KIND_OF[trendMetric])
          }
        ) : /* @__PURE__ */ jsx38(Skeleton5, { className: "h-44 w-full" })
      ] }),
      /* @__PURE__ */ jsxs36("section", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsxs36("h3", { className: "px-1 text-xs font-medium text-(--ui-text-primary)", children: [
          "\u6295\u653E\u8BA1\u5212",
          /* @__PURE__ */ jsx38("span", { className: "ml-2 font-normal text-(--ui-text-tertiary)", children: day ? `${shortDate(day)} \u5F53\u5929\uFF0C\u6309\u82B1\u8D39\u6392\u5E8F` : "" })
        ] }),
        /* @__PURE__ */ jsx38(
          AdTable,
          {
            rows: adRows,
            platformOf: (id) => shops.find((shop) => shop.id === id)?.platform ?? "",
            loading: adQuery.loading && !adQuery.data
          }
        )
      ] })
    ] }) : null,
    !offline && !error && !overview ? /* @__PURE__ */ jsx38(OverviewSkeleton, {}) : null,
    /* @__PURE__ */ jsx38(
      AlertDrawer,
      {
        open: alertsOpen,
        shopId,
        onClose: () => setAlertsOpen(false),
        onChanged: reloadAll
      }
    ),
    /* @__PURE__ */ jsx38(ReportDialog, { open: reportOpen, date: day, onClose: () => setReportOpen(false) }),
    /* @__PURE__ */ jsx38(
      ImportDialog,
      {
        open: importOpen,
        shops,
        initialKind: "metrics",
        kinds: ["metrics", "ad_spend"],
        onClose: () => setImportOpen(false),
        onDone: reloadAll
      }
    )
  ] });
}
function MetricCard({
  metric,
  label,
  value,
  points,
  active,
  onSelect
}) {
  const kind = KIND_OF[metric];
  const body = /* @__PURE__ */ jsxs36(Fragment14, { children: [
    /* @__PURE__ */ jsx38("span", { className: "text-[0.6875rem] text-(--ui-text-tertiary)", children: label }),
    value ? /* @__PURE__ */ jsx38("span", { className: "text-lg leading-tight font-semibold text-(--ui-text-primary) tabular-nums", children: value.value == null ? "\u2014" : formatMetric2(value.value, kind) }) : /* @__PURE__ */ jsx38(Skeleton5, { className: "h-6 w-20" }),
    value ? /* @__PURE__ */ jsx38(Change2, { metric, value }) : /* @__PURE__ */ jsx38(Skeleton5, { className: "h-3.5 w-24" }),
    /* @__PURE__ */ jsx38("div", { className: "mt-1", children: points ? /* @__PURE__ */ jsx38(Sparkline, { points, height: "1.75rem", label: `${label}\u8FD1 7 \u5929` }) : /* @__PURE__ */ jsx38(Skeleton5, { className: "h-7 w-full" }) })
  ] });
  const className = cn7(
    "flex min-w-0 flex-col gap-0.5 rounded-lg border border-(--ui-stroke-secondary) p-3 text-left",
    active && onSelect && "border-(--ui-accent)"
  );
  if (!onSelect) return /* @__PURE__ */ jsx38("div", { className, children: body });
  return /* @__PURE__ */ jsx38(
    "button",
    {
      type: "button",
      onClick: onSelect,
      "aria-pressed": active,
      className: cn7(
        className,
        "cursor-pointer hover:bg-(--ui-bg-quinary) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ui-accent)"
      ),
      children: body
    }
  );
}
function Change2({ metric, value }) {
  const kind = KIND_OF[metric];
  const previous = value.previous == null ? "\u2014" : formatMetric2(value.previous, kind);
  if (value.change == null) {
    return /* @__PURE__ */ jsxs36("span", { className: "text-[0.6875rem] text-(--ui-text-tertiary)", children: [
      "\u524D\u4E00\u5929 ",
      previous
    ] });
  }
  const pct = Math.round(value.change * 1e3) / 10;
  const tone = value.change === 0 ? "text-(--ui-text-tertiary)" : value.change > 0 ? "text-(--ui-text-secondary)" : SENSITIVE.has(metric) && value.change < -0.2 ? "text-destructive" : "text-amber-600 dark:text-amber-300";
  const text = value.change === 0 ? "\u6301\u5E73" : `${value.change > 0 ? "\u2191" : "\u2193"} ${Math.abs(pct)}%`;
  return /* @__PURE__ */ jsxs36("span", { className: "text-[0.6875rem] text-(--ui-text-tertiary) tabular-nums", children: [
    /* @__PURE__ */ jsx38("span", { className: tone, children: text }),
    /* @__PURE__ */ jsxs36("span", { children: [
      " \xB7 \u524D\u4E00\u5929 ",
      previous
    ] })
  ] });
}
function AdTable({
  rows,
  platformOf,
  loading
}) {
  if (loading) {
    return /* @__PURE__ */ jsx38("div", { className: "flex flex-col gap-2 py-1", children: Array.from({ length: 4 }, (_, index) => /* @__PURE__ */ jsx38(Skeleton5, { className: "h-7 w-full" }, index)) });
  }
  if (rows.length === 0) {
    return /* @__PURE__ */ jsx38("p", { className: "px-1 py-3 text-xs text-(--ui-text-tertiary)", children: "\u8FD9\u4E00\u5929\u6CA1\u6709\u6295\u653E\u8BB0\u5F55\u3002" });
  }
  const columns = "grid-cols-[minmax(8rem,1.2fr)_5.5rem_minmax(7rem,1.4fr)_5.5rem_5.5rem_4rem]";
  return /* @__PURE__ */ jsx38("div", { className: "min-w-0 overflow-x-auto", children: /* @__PURE__ */ jsxs36("div", { className: "min-w-[38rem]", children: [
    /* @__PURE__ */ jsxs36(
      "div",
      {
        className: cn7(
          "grid gap-3 border-b border-(--ui-stroke-secondary) px-2 py-1.5 text-[0.6875rem] text-(--ui-text-tertiary)",
          columns
        ),
        children: [
          /* @__PURE__ */ jsx38("span", { children: "\u5E97\u94FA" }),
          /* @__PURE__ */ jsx38("span", { children: "\u5DE5\u5177" }),
          /* @__PURE__ */ jsx38("span", { children: "\u8BA1\u5212" }),
          /* @__PURE__ */ jsx38("span", { className: "text-right", children: "\u82B1\u8D39" }),
          /* @__PURE__ */ jsx38("span", { className: "text-right", children: "GMV" }),
          /* @__PURE__ */ jsx38("span", { className: "text-right", children: "ROI" })
        ]
      }
    ),
    /* @__PURE__ */ jsx38("ul", { children: rows.map((row) => /* @__PURE__ */ jsxs36(
      "li",
      {
        className: cn7("grid items-center gap-3 border-b border-(--ui-stroke-secondary) px-2 py-2 text-xs", columns),
        children: [
          /* @__PURE__ */ jsxs36("span", { className: "flex min-w-0 items-center gap-1.5 text-(--ui-text-secondary)", children: [
            platformOf(row.shop_id) ? /* @__PURE__ */ jsx38(
              "span",
              {
                title: platformName(platformOf(row.shop_id)),
                className: "inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-sm border border-(--ui-stroke-secondary) px-0.5 text-[0.625rem]",
                children: platformMark(platformOf(row.shop_id))
              }
            ) : null,
            /* @__PURE__ */ jsx38("span", { className: "truncate", children: row.shop_name })
          ] }),
          /* @__PURE__ */ jsx38("span", { className: "truncate text-(--ui-text-secondary)", children: row.tool }),
          /* @__PURE__ */ jsxs36("span", { className: "flex min-w-0 items-center gap-1.5", children: [
            row.has_alert ? /* @__PURE__ */ jsx38(
              "span",
              {
                role: "img",
                "aria-label": "\u6709\u672A\u5904\u7406\u7684\u6295\u653E\u63D0\u9192",
                title: "\u6709\u672A\u5904\u7406\u7684\u6295\u653E\u63D0\u9192",
                className: "size-1.5 shrink-0 rounded-full bg-amber-500"
              }
            ) : /* @__PURE__ */ jsx38("span", { className: "size-1.5 shrink-0" }),
            /* @__PURE__ */ jsx38("span", { className: "truncate", children: row.campaign })
          ] }),
          /* @__PURE__ */ jsx38("span", { className: "text-right tabular-nums", children: formatMoney2(row.spend) }),
          /* @__PURE__ */ jsx38("span", { className: "text-right tabular-nums", children: formatMoney2(row.gmv) }),
          /* @__PURE__ */ jsx38("span", { className: "text-right tabular-nums", children: row.roi == null ? "\u2014" : row.roi.toFixed(2) })
        ]
      },
      `${row.shop_id}-${row.tool}-${row.campaign}`
    )) })
  ] }) });
}
function OverviewSkeleton() {
  return /* @__PURE__ */ jsxs36("div", { className: "flex flex-col gap-2", children: [
    /* @__PURE__ */ jsx38("div", { className: "grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-2", children: Array.from({ length: 8 }, (_, index) => /* @__PURE__ */ jsx38(Skeleton5, { className: "h-28 w-full" }, index)) }),
    /* @__PURE__ */ jsx38(Skeleton5, { className: "h-52 w-full" })
  ] });
}
function isEmpty(overview) {
  const m = overview.metrics;
  return [m.visitors, m.orders, m.sales_amount, m.ad_spend, m.ad_gmv].every(
    (item) => !item.value && !item.previous
  );
}
function formatMoney2(value) {
  return value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatMetric2(value, kind) {
  if (!Number.isFinite(value)) return "\u2014";
  if (kind === "money") return formatMoney2(value);
  if (kind === "ratio") return `${(value * 100).toFixed(2)}%`;
  if (kind === "roi") return value.toFixed(2);
  return value.toLocaleString("zh-CN");
}

// src/pages/products/ProductsPage.tsx
import { useEffect as useEffect32, useMemo as useMemo4, useRef as useRef11, useState as useState37 } from "react";
import {
  Badge as Badge17,
  Button as Button35,
  EmptyState as EmptyState8,
  ErrorState as ErrorState22,
  Loader as Loader21,
  SearchField as SearchField5,
  SegmentedControl as SegmentedControl13,
  Select as Select15,
  SelectContent as SelectContent15,
  SelectItem as SelectItem15,
  SelectTrigger as SelectTrigger15,
  SelectValue as SelectValue15,
  Skeleton as Skeleton6,
  Tip as Tip7,
  cn as cn8
} from "@hermes/plugin-sdk";

// src/pages/products/IssueDrawer.tsx
import { useEffect as useEffect30, useState as useState35 } from "react";
import {
  Badge as Badge15,
  Button as Button33,
  ConfirmDialog as ConfirmDialog10,
  ErrorState as ErrorState20,
  Loader as Loader19,
  Textarea as Textarea22
} from "@hermes/plugin-sdk";
import { jsx as jsx39, jsxs as jsxs37 } from "react/jsx-runtime";
function IssueDrawer({
  product,
  onClose,
  onChanged
}) {
  const [issues, setIssues] = useState35([]);
  const [rules, setRules] = useState35([]);
  const [loadedFor, setLoadedFor] = useState35(null);
  const [error, setError] = useState35(null);
  const [revision, setRevision] = useState35(0);
  const [notes, setNotes] = useState35({});
  const [pendingId, setPendingId] = useState35(null);
  const [ignoreTarget, setIgnoreTarget] = useState35(null);
  const [actionError, setActionError] = useState35(null);
  useEffect30(() => {
    if (!product) return;
    let cancelled = false;
    setLoadedFor(null);
    setError(null);
    Promise.all([listIssues({ product_id: product.id }), listRules()]).then(([issueRows, ruleRows]) => {
      if (cancelled) return;
      const mine = issueRows;
      setIssues(mine);
      setRules(ruleRows);
      setNotes(Object.fromEntries(mine.map((issue) => [issue.id, issue.note ?? ""])));
      setLoadedFor(product.id);
    }).catch((reason) => {
      if (cancelled) return;
      setError(reason);
      setLoadedFor(product.id);
    });
    return () => {
      cancelled = true;
    };
  }, [product, revision]);
  const ruleName = (issue) => {
    return rules.find((rule) => rule.id === issue.rule_id)?.name ?? issue.rule_kind;
  };
  const reopen = async (issue) => {
    setPendingId(issue.id);
    setActionError(null);
    try {
      await patchIssue(issue.id, { status: "open", note: notes[issue.id] ?? "" });
      onChanged();
      setRevision((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "\u64CD\u4F5C\u5931\u8D25");
    } finally {
      setPendingId(null);
    }
  };
  const markResolved = async (issue) => {
    setPendingId(issue.id);
    setActionError(null);
    try {
      await patchIssue(issue.id, { status: "resolved", note: notes[issue.id] ?? "" });
      onChanged();
      setRevision((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "\u64CD\u4F5C\u5931\u8D25");
    } finally {
      setPendingId(null);
    }
  };
  return /* @__PURE__ */ jsxs37(
    SideDrawer,
    {
      open: product != null,
      title: product?.title ?? "\u5546\u54C1\u95EE\u9898",
      description: product ? `${platformName(product.platform)} \xB7 ${product.shop_name}` : void 0,
      onClose,
      children: [
        product ? /* @__PURE__ */ jsxs37("div", { className: "flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxs37("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsx39(FieldText, { label: "\u7F16\u7801", children: product.product_code || "\u2014" }),
            /* @__PURE__ */ jsx39(FieldText, { label: "\u8D27\u53F7", children: product.sku || "\u2014" }),
            /* @__PURE__ */ jsxs37(FieldText, { label: "\u4EF7\u683C / \u5E95\u4EF7", children: [
              /* @__PURE__ */ jsx39("span", { className: belowFloor(product) ? "text-destructive" : void 0, children: formatAmount(product.price) }),
              " / ",
              product.floor_price == null ? "\u2014" : formatAmount(product.floor_price)
            ] }),
            /* @__PURE__ */ jsx39(FieldText, { label: "\u5E93\u5B58", children: product.stock }),
            /* @__PURE__ */ jsx39(FieldText, { label: "\u6D3B\u52A8", className: "col-span-2", children: product.activity || "\u2014" })
          ] }),
          loadedFor !== product.id && !error ? /* @__PURE__ */ jsxs37("div", { className: "flex items-center gap-2 text-xs text-(--ui-text-tertiary)", children: [
            /* @__PURE__ */ jsx39(Loader19, {}),
            "\u6B63\u5728\u8BFB\u53D6\u95EE\u9898"
          ] }) : null,
          error ? /* @__PURE__ */ jsx39(
            ErrorState20,
            {
              title: isOfflineError(error) ? "\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1" : "\u95EE\u9898\u52A0\u8F7D\u5931\u8D25",
              description: error instanceof Error ? error.message : "\u8BF7\u91CD\u8BD5",
              children: /* @__PURE__ */ jsx39(Button33, { size: "sm", variant: "outline", onClick: () => setRevision((value) => value + 1), children: "\u91CD\u8BD5" })
            }
          ) : null,
          loadedFor === product.id && !error && issues.length === 0 ? /* @__PURE__ */ jsx39("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD9\u4E2A\u5546\u54C1\u6CA1\u6709\u95EE\u9898\u8BB0\u5F55\u3002" }) : null,
          actionError ? /* @__PURE__ */ jsx39("p", { className: "text-xs text-destructive", children: actionError }) : null,
          loadedFor === product.id && !error ? /* @__PURE__ */ jsx39("ul", { className: "flex flex-col gap-3", children: issues.map((issue) => /* @__PURE__ */ jsxs37(
            "li",
            {
              className: "flex flex-col gap-2 border-b border-(--ui-stroke-secondary) pb-3",
              children: [
                /* @__PURE__ */ jsxs37("div", { className: "flex flex-wrap items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx39("span", { className: "text-xs font-medium", children: ruleName(issue) }),
                  /* @__PURE__ */ jsx39(Badge15, { variant: issue.level === "must" ? "destructive" : "warn", children: levelLabel(issue.level) }),
                  /* @__PURE__ */ jsx39(Badge15, { variant: "outline", children: statusLabel3(issue.status) })
                ] }),
                /* @__PURE__ */ jsx39("p", { className: "text-xs leading-relaxed text-(--ui-text-secondary)", children: issue.message }),
                /* @__PURE__ */ jsxs37("p", { className: "text-[0.6875rem] text-(--ui-text-tertiary)", children: [
                  "\u53D1\u73B0\u4E8E ",
                  formatTime(issue.found_at)
                ] }),
                /* @__PURE__ */ jsx39(
                  Textarea22,
                  {
                    "aria-label": `${ruleName(issue)}\u7684\u5907\u6CE8`,
                    value: notes[issue.id] ?? "",
                    placeholder: "\u5907\u6CE8\uFF08\u53EF\u9009\uFF09",
                    onChange: (event) => setNotes((current) => ({ ...current, [issue.id]: event.target.value }))
                  }
                ),
                /* @__PURE__ */ jsxs37("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx39(
                    Button33,
                    {
                      size: "xs",
                      disabled: pendingId === issue.id || issue.status === "resolved",
                      onClick: () => void markResolved(issue),
                      children: "\u6807\u4E3A\u5DF2\u5904\u7406"
                    }
                  ),
                  /* @__PURE__ */ jsx39(
                    Button33,
                    {
                      size: "xs",
                      variant: "outline",
                      disabled: pendingId === issue.id || issue.status === "ignored",
                      onClick: () => setIgnoreTarget(issue),
                      children: "\u5FFD\u7565"
                    }
                  ),
                  issue.status !== "open" ? /* @__PURE__ */ jsx39(
                    Button33,
                    {
                      size: "xs",
                      variant: "outline",
                      disabled: pendingId === issue.id,
                      onClick: () => void reopen(issue),
                      children: "\u91CD\u65B0\u6253\u5F00"
                    }
                  ) : null
                ] })
              ]
            },
            issue.id
          )) }) : null
        ] }) : null,
        /* @__PURE__ */ jsx39(
          ConfirmDialog10,
          {
            open: ignoreTarget != null,
            title: "\u5FFD\u7565\u8FD9\u4E2A\u95EE\u9898",
            description: "\u5FFD\u7565\u540E\uFF0C\u53EA\u8981\u60C5\u51B5\u6CA1\u53D8\uFF0C\u4E0B\u6B21\u68C0\u67E5\u4E0D\u4F1A\u518D\u628A\u5B83\u6253\u5F00\u3002",
            confirmLabel: "\u5FFD\u7565",
            onClose: () => setIgnoreTarget(null),
            onConfirm: async () => {
              if (!ignoreTarget) return;
              try {
                await patchIssue(ignoreTarget.id, {
                  status: "ignored",
                  note: notes[ignoreTarget.id] ?? ""
                });
              } catch (reason) {
                const message = reason instanceof ApiError ? reason.message : "\u5FFD\u7565\u5931\u8D25";
                throw new Error(message);
              }
              onChanged();
              setRevision((value) => value + 1);
            }
          }
        )
      ]
    }
  );
}
function belowFloor(product) {
  return product.floor_price != null && product.price < product.floor_price;
}

// src/pages/products/RulesDrawer.tsx
import { useEffect as useEffect31, useState as useState36 } from "react";
import { Badge as Badge16, Button as Button34, ErrorState as ErrorState21, Input as Input24, Loader as Loader20, Switch as Switch6 } from "@hermes/plugin-sdk";
import { Fragment as Fragment15, jsx as jsx40, jsxs as jsxs38 } from "react/jsx-runtime";
function RulesDrawer({
  open,
  onClose,
  onChanged
}) {
  const [drafts, setDrafts] = useState36([]);
  const [loaded, setLoaded] = useState36(false);
  const [error, setError] = useState36(null);
  const [saving, setSaving] = useState36(false);
  const [running2, setRunning2] = useState36(false);
  const [notice, setNotice] = useState36(null);
  const [actionError, setActionError] = useState36(null);
  const [revision, setRevision] = useState36(0);
  useEffect31(() => {
    if (!open) return;
    let cancelled = false;
    setLoaded(false);
    setError(null);
    listRules().then((rules) => {
      if (cancelled) return;
      setDrafts(rules);
      setLoaded(true);
    }).catch((reason) => {
      if (cancelled) return;
      setError(reason);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [open, revision]);
  const update = (id, patch) => {
    setDrafts((current) => current.map((rule) => rule.id === id ? { ...rule, ...patch } : rule));
    setNotice(null);
  };
  const save = async () => {
    setSaving(true);
    setActionError(null);
    setNotice(null);
    try {
      const saved = [];
      for (const rule of drafts) {
        saved.push(await patchRule(rule.id, { enabled: rule.enabled, params: paramsOf2(rule) }));
      }
      setDrafts(saved);
      setNotice("\u5DF2\u4FDD\u5B58");
      onChanged();
    } catch (reason) {
      setActionError(reason instanceof ApiError ? reason.message : "\u4FDD\u5B58\u5931\u8D25");
    } finally {
      setSaving(false);
    }
  };
  const run = async () => {
    setRunning2(true);
    setActionError(null);
    try {
      const result = await runRules();
      setNotice(`\u65B0\u589E ${result.opened} \u6761\uFF0C\u5DF2\u5904\u7406 ${result.resolved} \u6761`);
      onChanged();
    } catch (reason) {
      setActionError(reason instanceof ApiError ? reason.message : "\u68C0\u67E5\u5931\u8D25");
    } finally {
      setRunning2(false);
    }
  };
  return /* @__PURE__ */ jsxs38(
    SideDrawer,
    {
      open,
      title: "\u89C4\u5219",
      description: "\u6539\u5B8C\u4FDD\u5B58\u540E\u518D\u7ACB\u5373\u68C0\u67E5\u3002\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\u4E0D\u4F1A\u53C2\u4E0E\u8FD9\u6B21\u68C0\u67E5\u3002",
      onClose,
      footer: /* @__PURE__ */ jsxs38(Fragment15, { children: [
        /* @__PURE__ */ jsx40(Button34, { variant: "outline", disabled: saving || running2 || !loaded || Boolean(error), onClick: () => void run(), children: running2 ? "\u6B63\u5728\u68C0\u67E5" : "\u7ACB\u5373\u68C0\u67E5" }),
        /* @__PURE__ */ jsx40(Button34, { disabled: saving || running2 || !loaded || Boolean(error), onClick: () => void save(), children: saving ? "\u6B63\u5728\u4FDD\u5B58" : "\u4FDD\u5B58" })
      ] }),
      children: [
        !loaded && !error ? /* @__PURE__ */ jsxs38("div", { className: "flex items-center gap-2 text-xs text-(--ui-text-tertiary)", children: [
          /* @__PURE__ */ jsx40(Loader20, {}),
          "\u6B63\u5728\u8BFB\u53D6\u89C4\u5219"
        ] }) : null,
        error ? /* @__PURE__ */ jsx40(
          ErrorState21,
          {
            title: isOfflineError(error) ? "\u6CA1\u6709\u8FDE\u4E0A\u5DE5\u4F5C\u53F0\u670D\u52A1" : "\u89C4\u5219\u52A0\u8F7D\u5931\u8D25",
            description: error instanceof Error ? error.message : "\u8BF7\u91CD\u8BD5",
            children: /* @__PURE__ */ jsx40(Button34, { size: "sm", variant: "outline", onClick: () => setRevision((value) => value + 1), children: "\u91CD\u8BD5" })
          }
        ) : null,
        loaded && !error ? /* @__PURE__ */ jsx40("ul", { className: "flex flex-col", children: drafts.map((rule) => /* @__PURE__ */ jsxs38("li", { className: "flex flex-col gap-2 border-b border-(--ui-stroke-secondary) py-3", children: [
          /* @__PURE__ */ jsxs38("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx40("span", { className: "min-w-0 flex-1 truncate text-xs font-medium", children: rule.name }),
            /* @__PURE__ */ jsx40(Badge16, { variant: rule.level === "must" ? "destructive" : "warn", children: levelLabel(rule.level) }),
            /* @__PURE__ */ jsx40(
              Switch6,
              {
                checked: rule.enabled,
                "aria-label": `${rule.name}\u5F00\u5173`,
                onCheckedChange: (checked) => update(rule.id, { enabled: checked })
              }
            )
          ] }),
          /* @__PURE__ */ jsx40(RuleParamsEditor, { rule, onChange: (params) => update(rule.id, { params }) })
        ] }, rule.id)) }) : null,
        notice ? /* @__PURE__ */ jsx40("p", { className: "mt-3 text-xs text-(--ui-text-secondary)", children: notice }) : null,
        actionError ? /* @__PURE__ */ jsx40("p", { className: "mt-3 text-xs text-destructive", children: actionError }) : null
      ]
    }
  );
}
function RuleParamsEditor({
  rule,
  onChange
}) {
  if (rule.kind === "cross_shop_gap") {
    return /* @__PURE__ */ jsxs38("label", { className: "flex items-center gap-2 text-xs text-(--ui-text-secondary)", children: [
      "\u4EF7\u5DEE %",
      /* @__PURE__ */ jsx40(
        Input24,
        {
          "aria-label": "\u4EF7\u5DEE\u767E\u5206\u6BD4",
          type: "number",
          min: 0,
          value: rule.params.max_gap_pct ?? 5,
          onChange: (event) => onChange({ max_gap_pct: numberOr(event.target.value, 5) })
        }
      )
    ] });
  }
  if (rule.kind === "low_stock") {
    return /* @__PURE__ */ jsxs38("label", { className: "flex items-center gap-2 text-xs text-(--ui-text-secondary)", children: [
      "\u6700\u4F4E\u5E93\u5B58",
      /* @__PURE__ */ jsx40(
        Input24,
        {
          "aria-label": "\u6700\u4F4E\u5E93\u5B58",
          type: "number",
          min: 0,
          value: rule.params.min_stock ?? 10,
          onChange: (event) => onChange({ min_stock: numberOr(event.target.value, 10) })
        }
      )
    ] });
  }
  if (rule.kind === "missing_activity") {
    return /* @__PURE__ */ jsxs38("label", { className: "flex items-center gap-2 text-xs text-(--ui-text-secondary)", children: [
      "\u6307\u5B9A\u6D3B\u52A8\u540D",
      /* @__PURE__ */ jsx40(
        Input24,
        {
          "aria-label": "\u6307\u5B9A\u6D3B\u52A8\u540D",
          placeholder: "\u7A7A\u7740\u5219\u4E0D\u68C0\u67E5",
          value: rule.params.required_activity ?? "",
          onChange: (event) => onChange({ required_activity: event.target.value.trim() ? event.target.value : null })
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsx40("p", { className: "text-xs text-(--ui-text-tertiary)", children: "\u8FD9\u6761\u89C4\u5219\u6CA1\u6709\u53C2\u6570\u3002" });
}
function paramsOf2(rule) {
  if (rule.kind === "cross_shop_gap") return { max_gap_pct: numberOr(rule.params.max_gap_pct, 5) };
  if (rule.kind === "low_stock") return { min_stock: numberOr(rule.params.min_stock, 10) };
  if (rule.kind === "missing_activity") {
    const name = rule.params.required_activity?.trim();
    return { required_activity: name ? name : null };
  }
  return {};
}
function numberOr(value, fallback) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

// src/pages/products/ProductsPage.tsx
import { Fragment as Fragment16, jsx as jsx41, jsxs as jsxs39 } from "react/jsx-runtime";
var PAGE_SIZE2 = 20;
var SEGMENTS3 = [
  { id: "all", label: "\u5168\u90E8" },
  { id: "issue", label: "\u6709\u95EE\u9898" },
  { id: "must", label: "\u5FC5\u987B\u5904\u7406" },
  { id: "warn", label: "\u63D0\u9192" }
];
function ProductsPage() {
  const apiBase = useApiBase();
  const [segment, setSegment] = useState37("all");
  const [shopId, setShopId] = useState37(void 0);
  const [qInput, setQInput] = useState37("");
  const [q, setQ] = useState37("");
  const [page, setPage] = useState37(1);
  const [importOpen, setImportOpen] = useState37(false);
  const [rulesOpen, setRulesOpen] = useState37(false);
  const [active, setActive] = useState37(null);
  useEffect32(() => {
    const timer9 = window.setTimeout(() => setQ(qInput.trim()), 300);
    return () => window.clearTimeout(timer9);
  }, [qInput]);
  const skipQReset = useRef11(true);
  useEffect32(() => {
    if (skipQReset.current) {
      skipQReset.current = false;
      return;
    }
    setPage(1);
  }, [q]);
  const shopsQuery = useQuery(() => listShops(), [apiBase]);
  const summaryQuery = useQuery(() => getIssueSummary(shopId), [apiBase, shopId]);
  const issuesQuery = useQuery(
    () => listIssues({ status: "open", shop_id: shopId }),
    [apiBase, shopId]
  );
  const productsQuery = useQuery(
    () => listProductsForView({ segment, shopId, q, page, pageSize: PAGE_SIZE2 }),
    [apiBase, segment, shopId, q, page]
  );
  useEffect32(() => {
    if (!active || !productsQuery.data) return;
    const next = productsQuery.data.items.find((item) => item.id === active.id);
    if (next && next !== active) setActive(next);
  }, [productsQuery.data, active]);
  const reloadAll = () => {
    shopsQuery.reload();
    summaryQuery.reload();
    issuesQuery.reload();
    productsQuery.reload();
    void refreshOpenIssueCount();
  };
  const shops = shopsQuery.data ?? [];
  const pageData = productsQuery.data;
  const flags = useMemo4(() => flagsByProduct(issuesQuery.data ?? []), [issuesQuery.data]);
  const summary = summaryQuery.data;
  const error = productsQuery.error ?? summaryQuery.error ?? issuesQuery.error ?? shopsQuery.error;
  const offline = isOfflineError(error);
  const loading = !error && (productsQuery.loading || issuesQuery.loading) && !pageData;
  const pageCount = Math.max(1, Math.ceil((pageData?.total ?? 0) / PAGE_SIZE2));
  useEffect32(() => {
    if (!pageData) return;
    const count = Math.max(1, Math.ceil(pageData.total / PAGE_SIZE2));
    if (page > count) setPage(count);
  }, [pageData, page]);
  return /* @__PURE__ */ jsxs39("div", { className: "flex min-h-0 flex-1 flex-col gap-3", children: [
    /* @__PURE__ */ jsxs39(HeaderActions, { children: [
      /* @__PURE__ */ jsx41(Button35, { size: "sm", variant: "outline", onClick: () => setRulesOpen(true), children: "\u89C4\u5219" }),
      /* @__PURE__ */ jsx41(Button35, { size: "sm", onClick: () => setImportOpen(true), children: "\u5BFC\u5165\u62A5\u8868" })
    ] }),
    offline ? /* @__PURE__ */ jsx41(OfflineNotice, { detail: error instanceof Error ? error.message : void 0, onRetry: reloadAll }) : null,
    !offline && error ? /* @__PURE__ */ jsx41("div", { className: "flex flex-1 items-center justify-center py-10", children: /* @__PURE__ */ jsx41(
      ErrorState22,
      {
        title: "\u5546\u54C1\u52A0\u8F7D\u5931\u8D25",
        description: error instanceof Error ? error.message : "\u8BF7\u91CD\u8BD5",
        children: /* @__PURE__ */ jsx41(Button35, { size: "sm", variant: "outline", onClick: reloadAll, children: "\u91CD\u8BD5" })
      }
    ) }) : null,
    !offline && !error ? /* @__PURE__ */ jsxs39(Fragment16, { children: [
      /* @__PURE__ */ jsxs39("div", { className: "flex flex-wrap items-center gap-2 text-xs text-(--ui-text-secondary)", children: [
        /* @__PURE__ */ jsx41(SummaryChip, { label: "\u5FC5\u987B\u5904\u7406", value: summaryQuery.loading && !summary ? void 0 : summary?.must_open, tone: "destructive" }),
        /* @__PURE__ */ jsx41(SummaryChip, { label: "\u63D0\u9192", value: summaryQuery.loading && !summary ? void 0 : summary?.warn_open, tone: "warn" }),
        /* @__PURE__ */ jsx41(SummaryChip, { label: "\u6D89\u53CA\u5546\u54C1", value: summaryQuery.loading && !summary ? void 0 : summary?.products_with_open, tone: "outline" }),
        productsQuery.loading && pageData ? /* @__PURE__ */ jsx41(Loader21, {}) : null
      ] }),
      /* @__PURE__ */ jsxs39("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx41(
          SegmentedControl13,
          {
            options: SEGMENTS3,
            value: segment,
            sizing: "content",
            onChange: (value) => {
              setSegment(value);
              setPage(1);
            }
          }
        ),
        /* @__PURE__ */ jsxs39(
          Select15,
          {
            value: shopId == null ? "all" : String(shopId),
            onValueChange: (value) => {
              setShopId(value === "all" ? void 0 : Number(value));
              setPage(1);
            },
            children: [
              /* @__PURE__ */ jsx41(SelectTrigger15, { "aria-label": "\u5E97\u94FA", className: "w-44", children: /* @__PURE__ */ jsx41(SelectValue15, { placeholder: "\u5168\u90E8\u5E97\u94FA" }) }),
              /* @__PURE__ */ jsxs39(SelectContent15, { children: [
                /* @__PURE__ */ jsx41(SelectItem15, { value: "all", children: "\u5168\u90E8\u5E97\u94FA" }),
                shops.map((shop) => /* @__PURE__ */ jsx41(SelectItem15, { value: String(shop.id), children: shop.name }, shop.id))
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx41(
          SearchField5,
          {
            "aria-label": "\u641C\u7D22\u5546\u54C1",
            placeholder: "\u6807\u9898\u3001\u7F16\u7801\u3001\u8D27\u53F7",
            value: qInput,
            onChange: setQInput
          }
        )
      ] }),
      loading ? /* @__PURE__ */ jsx41(ProductSkeleton, {}) : null,
      !loading && pageData && pageData.items.length === 0 ? /* @__PURE__ */ jsx41("div", { className: "flex flex-1 items-center justify-center py-10", children: /* @__PURE__ */ jsx41(EmptyState8, { title: "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u5546\u54C1", description: "\u6362\u4E2A\u7B5B\u9009\uFF0C\u6216\u5148\u5BFC\u5165\u4E00\u5F20\u62A5\u8868\u3002" }) }) : null,
      !loading && pageData && pageData.items.length > 0 ? /* @__PURE__ */ jsx41("div", { className: "min-h-0 min-w-0 flex-1 overflow-x-auto", children: /* @__PURE__ */ jsxs39("div", { className: "min-w-[42rem]", children: [
        /* @__PURE__ */ jsxs39("div", { className: "grid grid-cols-[minmax(0,1.8fr)_minmax(7rem,0.9fr)_7.5rem_3.5rem_5.5rem_auto] gap-3 border-b border-(--ui-stroke-secondary) px-2 py-1.5 text-[0.6875rem] text-(--ui-text-tertiary)", children: [
          /* @__PURE__ */ jsx41("span", { children: "\u5546\u54C1" }),
          /* @__PURE__ */ jsx41("span", { children: "\u5E97\u94FA" }),
          /* @__PURE__ */ jsx41("span", { children: "\u4EF7\u683C / \u5E95\u4EF7" }),
          /* @__PURE__ */ jsx41("span", { children: "\u5E93\u5B58" }),
          /* @__PURE__ */ jsx41("span", { children: "\u6D3B\u52A8" }),
          /* @__PURE__ */ jsx41("span", { children: "\u95EE\u9898" })
        ] }),
        /* @__PURE__ */ jsx41("ul", { children: pageData.items.map((product) => /* @__PURE__ */ jsx41("li", { children: /* @__PURE__ */ jsx41(
          ProductRow,
          {
            product,
            flags: flags.get(product.id),
            onOpen: () => setActive(product)
          }
        ) }, product.id)) })
      ] }) }) : null,
      pageData ? /* @__PURE__ */ jsxs39("div", { className: "flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-(--ui-text-secondary)", children: [
        /* @__PURE__ */ jsxs39("span", { className: "tabular-nums", children: [
          "\u5171 ",
          pageData.total,
          " \u4EF6\uFF0C\u7B2C ",
          pageData.total === 0 ? 1 : page,
          " / ",
          pageCount,
          " \u9875"
        ] }),
        /* @__PURE__ */ jsxs39("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx41(Button35, { size: "xs", variant: "outline", disabled: page <= 1, onClick: () => setPage((value) => value - 1), children: "\u4E0A\u4E00\u9875" }),
          /* @__PURE__ */ jsx41(
            Button35,
            {
              size: "xs",
              variant: "outline",
              disabled: page >= pageCount || pageData.total === 0,
              onClick: () => setPage((value) => value + 1),
              children: "\u4E0B\u4E00\u9875"
            }
          )
        ] })
      ] }) : null
    ] }) : null,
    /* @__PURE__ */ jsx41(IssueDrawer, { product: active, onClose: () => setActive(null), onChanged: reloadAll }),
    /* @__PURE__ */ jsx41(
      ImportDialog,
      {
        open: importOpen,
        shops,
        onClose: () => setImportOpen(false),
        onDone: reloadAll
      }
    ),
    /* @__PURE__ */ jsx41(RulesDrawer, { open: rulesOpen, onClose: () => setRulesOpen(false), onChanged: reloadAll })
  ] });
}
function SummaryChip({
  label,
  value,
  tone
}) {
  return /* @__PURE__ */ jsxs39("span", { className: "inline-flex items-center gap-1.5", children: [
    label,
    value === void 0 ? /* @__PURE__ */ jsx41(Skeleton6, { className: "h-4 w-6" }) : /* @__PURE__ */ jsx41(Badge17, { variant: tone, children: value })
  ] });
}
function ProductRow({
  product,
  flags,
  onOpen
}) {
  const low = product.floor_price != null && product.price < product.floor_price;
  return /* @__PURE__ */ jsxs39(
    "button",
    {
      type: "button",
      onClick: onOpen,
      className: cn8(
        "grid w-full grid-cols-[minmax(0,1.8fr)_minmax(7rem,0.9fr)_7.5rem_3.5rem_5.5rem_auto] items-center gap-3 border-b border-(--ui-stroke-secondary) px-2 py-2 text-left text-xs",
        "cursor-pointer hover:bg-(--ui-bg-quinary) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ui-accent)"
      ),
      children: [
        /* @__PURE__ */ jsx41(Tip7, { label: product.title, children: /* @__PURE__ */ jsx41("span", { className: "block min-w-0 truncate", children: product.title }) }),
        /* @__PURE__ */ jsxs39("span", { className: "flex min-w-0 items-center gap-1.5 text-(--ui-text-secondary)", children: [
          /* @__PURE__ */ jsx41(
            "span",
            {
              title: platformName(product.platform),
              className: "inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-sm border border-(--ui-stroke-secondary) px-0.5 text-[0.625rem]",
              children: platformMark(product.platform)
            }
          ),
          /* @__PURE__ */ jsx41("span", { className: "truncate", children: product.shop_name })
        ] }),
        /* @__PURE__ */ jsxs39("span", { className: "tabular-nums", children: [
          /* @__PURE__ */ jsx41("span", { className: low ? "text-destructive" : void 0, children: formatAmount(product.price) }),
          /* @__PURE__ */ jsxs39("span", { className: "text-(--ui-text-tertiary)", children: [
            " / ",
            product.floor_price == null ? "\u2014" : formatAmount(product.floor_price)
          ] })
        ] }),
        /* @__PURE__ */ jsx41("span", { className: "tabular-nums", children: product.stock }),
        /* @__PURE__ */ jsx41("span", { className: "truncate text-(--ui-text-secondary)", children: product.activity || "\u2014" }),
        /* @__PURE__ */ jsxs39("span", { className: "flex items-center gap-1", children: [
          flags?.must ? /* @__PURE__ */ jsx41(Badge17, { variant: "destructive", children: levelLabel("must") }) : null,
          flags?.warn ? /* @__PURE__ */ jsx41(Badge17, { variant: "warn", children: levelLabel("warn") }) : null,
          !flags && product.open_issue_count > 0 ? /* @__PURE__ */ jsx41(Badge17, { variant: "outline", children: product.open_issue_count }) : null
        ] })
      ]
    }
  );
}
function ProductSkeleton() {
  return /* @__PURE__ */ jsx41("div", { className: "flex flex-col gap-2 py-2", children: Array.from({ length: 6 }, (_, index) => /* @__PURE__ */ jsx41(Skeleton6, { className: "h-8 w-full" }, index)) });
}
function flagsByProduct(issues) {
  const map = /* @__PURE__ */ new Map();
  for (const issue of issues) {
    const current = map.get(issue.product_id) ?? { must: false, warn: false };
    if (issue.level === "must") current.must = true;
    if (issue.level === "warn") current.warn = true;
    map.set(issue.product_id, current);
  }
  return map;
}

// src/modules/ecommerce.tsx
import { jsx as jsx42 } from "react/jsx-runtime";
ensureOpenIssuePolling();
ensureNeedsActionPolling();
ensureOpenInquiryPolling();
ensureOpenAlertPolling();
var ecommerceWorkbench = {
  id: "ecommerce",
  name: "\u7535\u5546",
  codicon: "briefcase",
  pages: [
    {
      id: "overview",
      label: "\u7ECF\u8425",
      codicon: "graph",
      badge: () => getOpenAlertCount(),
      render: () => /* @__PURE__ */ jsx42(OverviewPage, {})
    },
    {
      id: "products",
      label: "\u5546\u54C1",
      codicon: "package",
      badge: () => getOpenIssueCount(),
      render: () => /* @__PURE__ */ jsx42(ProductsPage, {})
    },
    {
      id: "customers",
      label: "\u5BA2\u6237",
      codicon: "organization",
      badge: () => getOpenInquiryCount(),
      render: () => /* @__PURE__ */ jsx42(CustomersPage, {})
    },
    {
      id: "install",
      label: "\u5B89\u88C5",
      codicon: "tools",
      badge: () => getNeedsActionCount(),
      render: () => /* @__PURE__ */ jsx42(InstallsPage, {})
    }
  ]
};

// src/registry.ts
import { useSyncExternalStore as useSyncExternalStore10 } from "react";
var workbenchMap = /* @__PURE__ */ new Map();
var workbenchesSnapshot = [];
var workbenchListeners = /* @__PURE__ */ new Set();
function emitWorkbenches() {
  workbenchesSnapshot = Array.from(workbenchMap.values());
  for (const listener of workbenchListeners) {
    listener();
  }
}
function subscribeWorkbenches(listener) {
  workbenchListeners.add(listener);
  return () => {
    workbenchListeners.delete(listener);
  };
}
function registerWorkbench(def) {
  workbenchMap.set(def.id, def);
  emitWorkbenches();
  if (!locationSnapshot && def.pages.length > 0) {
    setLocationInternal({ workbench: def.id, page: def.pages[0].id });
  }
  return () => {
    const current = workbenchMap.get(def.id);
    if (current === def) {
      workbenchMap.delete(def.id);
      emitWorkbenches();
    }
  };
}
function listWorkbenches() {
  return workbenchesSnapshot;
}
function useWorkbenches() {
  return useSyncExternalStore10(subscribeWorkbenches, listWorkbenches, listWorkbenches);
}
function toPath(loc) {
  return `/wb-${encodeURIComponent(loc.workbench)}-${encodeURIComponent(loc.page)}`;
}
function parsePath(path) {
  if (!path) return void 0;
  const clean = path.replace(/^#/, "").split("?")[0].trim();
  const match = /^\/wb-([^/?#]+)-([^/?#]+)\/?$/.exec(clean);
  if (!match) return void 0;
  try {
    return {
      workbench: decodeURIComponent(match[1]),
      page: decodeURIComponent(match[2])
    };
  } catch {
    return {
      workbench: match[1],
      page: match[2]
    };
  }
}
function readInitialLocation() {
  if (typeof window === "undefined") return void 0;
  const fromHash = parsePath(window.location.hash);
  if (fromHash) return fromHash;
  return parsePath(window.location.pathname);
}
var locationSnapshot = readInitialLocation();
var locationListeners = /* @__PURE__ */ new Set();
var navigatorFn;
function setLocationInternal(next) {
  if (locationSnapshot?.workbench === next?.workbench && locationSnapshot?.page === next?.page) {
    return;
  }
  locationSnapshot = next ? { workbench: next.workbench, page: next.page } : void 0;
  for (const listener of locationListeners) {
    listener();
  }
}
function subscribeLocation(listener) {
  locationListeners.add(listener);
  return () => {
    locationListeners.delete(listener);
  };
}
function getLocationSnapshot() {
  return locationSnapshot;
}
function useLocation() {
  return useSyncExternalStore10(subscribeLocation, getLocationSnapshot, getLocationSnapshot);
}
function setNavigator(fn) {
  navigatorFn = fn;
}
function syncLocationFromPath(path) {
  const parsed = parsePath(path);
  setLocationInternal(parsed);
}
function openPage(loc) {
  const path = toPath(loc);
  setLocationInternal(loc);
  navigatorFn?.(path);
}

// src/restore.ts
import { host } from "@hermes/plugin-sdk";
var RESTORE_KEY = "hermes-workbench:restore";
var RESTORE_MS = 6e4;
var BOOT_MS = 2e3;
var bootUntil = 0;
function hashPath() {
  return window.location.hash.replace(/^#/, "");
}
function isNewChat() {
  const hash = window.location.hash;
  return hash === "" || hash === "#" || hash === "#/";
}
function isRegisteredPath(path) {
  const loc = parsePath(path);
  if (!loc) return void 0;
  const workbench = listWorkbenches().find((item) => item.id === loc.workbench);
  if (!workbench?.pages.some((page) => page.id === loc.page)) return void 0;
  return toPath(loc);
}
function readRecord() {
  try {
    const raw = sessionStorage.getItem(RESTORE_KEY);
    if (!raw) return void 0;
    const record = JSON.parse(raw);
    if (typeof record.at !== "number" || typeof record.path !== "string") return void 0;
    return record;
  } catch {
    return void 0;
  }
}
function writeRecord(path) {
  try {
    const record = { path, at: Date.now() };
    sessionStorage.setItem(RESTORE_KEY, JSON.stringify(record));
  } catch {
  }
}
function clearRecord() {
  try {
    sessionStorage.removeItem(RESTORE_KEY);
  } catch {
  }
}
function remember() {
  const path = isRegisteredPath(hashPath());
  if (path) writeRecord(path);
}
function tryRestore() {
  if (!isNewChat()) return;
  const record = readRecord();
  if (!record || Date.now() - record.at > RESTORE_MS) return;
  const path = isRegisteredPath(record.path);
  if (!path) return;
  host.navigate(path);
}
function installPathRestore() {
  bootUntil = Date.now() + BOOT_MS;
  const onHash = () => {
    const path = isRegisteredPath(hashPath());
    if (path) {
      writeRecord(path);
      return;
    }
    if (Date.now() < bootUntil) {
      tryRestore();
      return;
    }
    clearRecord();
  };
  const onHide = () => {
    if (isRegisteredPath(hashPath())) remember();
    else if (Date.now() >= bootUntil) clearRecord();
  };
  window.addEventListener("hashchange", onHash);
  window.addEventListener("pagehide", onHide);
  window.addEventListener("beforeunload", onHide);
  const interval = window.setInterval(remember, 5e3);
  remember();
  tryRestore();
  const timers = [0, 50, 300, 1e3].map((delay) => window.setTimeout(tryRestore, delay));
  return () => {
    window.removeEventListener("hashchange", onHash);
    window.removeEventListener("pagehide", onHide);
    window.removeEventListener("beforeunload", onHide);
    window.clearInterval(interval);
    for (const timer9 of timers) window.clearTimeout(timer9);
  };
}

// src/WorkbenchPage.tsx
import { Button as Button36, ErrorState as ErrorState23, cn as cn9 } from "@hermes/plugin-sdk";
import { Fragment as Fragment17, jsx as jsx43, jsxs as jsxs40 } from "react/jsx-runtime";
var PAGE_STYLE = `
.wb-page-inset {
  padding-inline: clamp(1.25rem, 4vw, 4rem);
}
.wb-page-header {
  min-height: 2.75rem;
}
.wb-breadcrumb-link {
  font-size: 0.8125rem;
  line-height: 1.35;
  cursor: pointer;
  color: var(--ui-text-secondary);
  transition: color 100ms ease-out;
}
.wb-breadcrumb-link:hover {
  transition: none;
  color: var(--ui-text-primary);
}
.wb-breadcrumb-current {
  font-size: 0.8125rem;
  line-height: 1.35;
  color: var(--ui-text-primary);
  font-weight: 500;
}
@media (prefers-reduced-motion: reduce) {
  .wb-breadcrumb-link {
    transition: none !important;
  }
}
`;
function WorkbenchPage() {
  const workbenches = useWorkbenches();
  const location = useLocation();
  const activeWorkbench = location ? workbenches.find((wb) => wb.id === location.workbench) : void 0;
  const activePage = activeWorkbench && location ? activeWorkbench.pages.find((page) => page.id === location.page) : void 0;
  const handleBackHome = () => {
    const targetWorkbench = activeWorkbench ?? workbenches[0];
    const firstPage = targetWorkbench?.pages[0];
    if (targetWorkbench && firstPage) {
      openPage({ workbench: targetWorkbench.id, page: firstPage.id });
    }
  };
  if (!activeWorkbench || !activePage) {
    return /* @__PURE__ */ jsxs40("div", { className: "flex h-full w-full flex-col bg-(--ui-bg-editor) text-(--ui-text-primary)", children: [
      /* @__PURE__ */ jsx43("style", { children: PAGE_STYLE }),
      /* @__PURE__ */ jsxs40("header", { className: "wb-page-inset wb-page-header flex shrink-0 items-center justify-between gap-3 border-b border-(--ui-stroke-secondary) py-2", children: [
        /* @__PURE__ */ jsxs40("nav", { "aria-label": "\u9762\u5305\u5C51", className: "flex min-w-0 items-center gap-1.5", children: [
          activeWorkbench ? /* @__PURE__ */ jsxs40(Fragment17, { children: [
            /* @__PURE__ */ jsx43(
              "button",
              {
                type: "button",
                onClick: handleBackHome,
                className: "wb-breadcrumb-link truncate rounded px-1 py-0.5 outline-none focus-visible:outline-2 focus-visible:outline-(--ui-accent)",
                children: activeWorkbench.name
              }
            ),
            /* @__PURE__ */ jsx43("span", { className: "text-xs text-(--ui-text-quaternary)", "aria-hidden": "true", children: "/" })
          ] }) : null,
          /* @__PURE__ */ jsx43("span", { className: "wb-breadcrumb-current truncate", children: "\u627E\u4E0D\u5230\u8FD9\u4E2A\u9875\u9762" })
        ] }),
        /* @__PURE__ */ jsx43("div", { "data-slot": "actions", className: "flex shrink-0 items-center gap-2" })
      ] }),
      /* @__PURE__ */ jsx43("main", { className: "wb-page-inset flex min-h-0 flex-1 flex-col items-center justify-center py-8", children: /* @__PURE__ */ jsx43(
        ErrorState23,
        {
          title: "\u627E\u4E0D\u5230\u8FD9\u4E2A\u9875\u9762",
          description: location ? `\u672A\u627E\u5230\u8DEF\u5F84 ${toPath(location)} \u5BF9\u5E94\u7684\u5DE5\u4F5C\u53F0\u5206\u9875\u3002` : "\u5F53\u524D\u8DEF\u5F84\u672A\u5339\u914D\u5230\u4EFB\u4F55\u5DF2\u6CE8\u518C\u7684\u5DE5\u4F5C\u53F0\u5206\u9875\u3002",
          children: workbenches.length > 0 && /* @__PURE__ */ jsx43(Button36, { onClick: handleBackHome, size: "sm", variant: "outline", children: "\u56DE\u5230\u5DE5\u4F5C\u53F0\u9996\u9875" })
        }
      ) })
    ] });
  }
  return /* @__PURE__ */ jsxs40("div", { className: "flex h-full w-full flex-col bg-(--ui-bg-editor) text-(--ui-text-primary)", children: [
    /* @__PURE__ */ jsx43("style", { children: PAGE_STYLE }),
    /* @__PURE__ */ jsxs40("header", { className: "wb-page-inset wb-page-header flex shrink-0 items-center justify-between gap-3 border-b border-(--ui-stroke-secondary) py-2", children: [
      /* @__PURE__ */ jsxs40("nav", { "aria-label": "\u9762\u5305\u5C51", className: "flex min-w-0 items-center gap-1.5", children: [
        /* @__PURE__ */ jsx43(
          "button",
          {
            type: "button",
            onClick: () => {
              const firstPage = activeWorkbench.pages[0];
              if (firstPage) {
                openPage({ workbench: activeWorkbench.id, page: firstPage.id });
              }
            },
            className: cn9(
              "wb-breadcrumb-link truncate rounded px-1 py-0.5 outline-none",
              "focus-visible:outline-2 focus-visible:outline-(--ui-accent)"
            ),
            children: activeWorkbench.name
          }
        ),
        /* @__PURE__ */ jsx43("span", { className: "text-xs text-(--ui-text-quaternary)", "aria-hidden": "true", children: "/" }),
        /* @__PURE__ */ jsx43("span", { className: "wb-breadcrumb-current truncate px-1 py-0.5", "aria-current": "page", children: activePage.label })
      ] }),
      /* @__PURE__ */ jsx43("div", { "data-slot": "actions", className: "flex shrink-0 items-center gap-2" })
    ] }),
    /* @__PURE__ */ jsx43("main", { className: "wb-page-inset flex min-h-0 flex-1 flex-col overflow-y-auto py-6", children: activePage.render() })
  ] });
}

// src/WorkbenchPane.tsx
import { useEffect as useEffect33, useRef as useRef12, useState as useState38 } from "react";
import { Badge as Badge18, Codicon as Codicon4, EmptyState as EmptyState9, Tip as Tip8, cn as cn10 } from "@hermes/plugin-sdk";
import { jsx as jsx44, jsxs as jsxs41 } from "react/jsx-runtime";
var STORAGE_KEY2 = "hermes-workbench:expanded-v1";
function loadExpandedMap() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY2);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
  }
  return {};
}
function saveExpandedMap(map) {
  try {
    window.localStorage.setItem(STORAGE_KEY2, JSON.stringify(map));
  } catch {
  }
}
var PANE_STYLE = `
.wb-pane-row {
  font-size: 0.8125rem;
  line-height: 1.35;
  min-height: 1.625rem;
  cursor: pointer;
  transition: background-color 100ms ease-out, color 100ms ease-out;
}
.wb-pane-row:hover {
  transition: none;
  background-color: var(--ui-bg-quinary);
  color: var(--ui-text-primary);
}
.wb-pane-row[data-active="true"] {
  background-color: var(--ui-bg-quinary);
  color: var(--ui-text-primary);
  font-weight: 500;
}
.wb-pane-lead {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.wb-caret-btn {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  cursor: pointer;
  color: var(--ui-text-tertiary);
}
.wb-caret-btn:hover {
  color: var(--ui-text-primary);
}
.wb-caret-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 150ms cubic-bezier(0.22, 1, 0.36, 1);
}
.wb-caret-icon[data-expanded="true"] {
  transform: rotate(90deg);
}
.wb-badge {
  font-size: 0.6875rem;
  line-height: 1;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  font-variant-numeric: tabular-nums;
}
@media (prefers-reduced-motion: reduce) {
  .wb-pane-row,
  .wb-caret-icon {
    transition: none !important;
  }
}
`;
function TruncatedLabel({
  text,
  className
}) {
  const ref = useRef12(null);
  const [truncated, setTruncated] = useState38(false);
  const checkTruncation = () => {
    const el = ref.current;
    if (!el) return;
    const next = el.scrollWidth > el.clientWidth + 1;
    setTruncated((prev) => prev === next ? prev : next);
  };
  useEffect33(() => {
    const el = ref.current;
    if (!el) return;
    checkTruncation();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      checkTruncation();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);
  const span = /* @__PURE__ */ jsx44(
    "span",
    {
      ref,
      onPointerEnter: checkTruncation,
      className: cn10("min-w-0 flex-1 truncate text-left", className),
      children: text
    }
  );
  if (!truncated) {
    return span;
  }
  return /* @__PURE__ */ jsx44(Tip8, { label: text, side: "right", children: span });
}
function WorkbenchPageRow({
  workbenchId,
  page,
  active
}) {
  const rawBadge = page.badge?.();
  const showBadge = typeof rawBadge === "number" && rawBadge > 0;
  return /* @__PURE__ */ jsxs41(
    "button",
    {
      type: "button",
      "data-active": active ? "true" : void 0,
      onClick: () => openPage({ workbench: workbenchId, page: page.id }),
      className: cn10(
        "wb-pane-row group flex w-full items-center gap-1.5 rounded-lg py-1 pr-2 pl-6 text-left outline-none select-none",
        active ? "text-(--ui-text-primary)" : "text-(--ui-text-secondary)",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ui-accent)"
      ),
      children: [
        /* @__PURE__ */ jsx44(
          "span",
          {
            className: cn10(
              "wb-pane-lead",
              active ? "text-(--ui-text-primary)" : "text-(--ui-text-tertiary) group-hover:text-(--ui-text-secondary)"
            ),
            children: /* @__PURE__ */ jsx44(Codicon4, { name: page.codicon, size: "0.875rem" })
          }
        ),
        /* @__PURE__ */ jsx44(TruncatedLabel, { text: page.label }),
        showBadge && /* @__PURE__ */ jsx44(
          Badge18,
          {
            variant: "outline",
            className: "wb-badge ml-auto shrink-0 border border-(--ui-stroke-secondary) bg-(--ui-bg-quinary) text-(--ui-text-secondary)",
            children: rawBadge
          }
        )
      ]
    }
  );
}
function WorkbenchGroup({
  workbench,
  expanded,
  onToggleExpand,
  activePageId
}) {
  const firstPage = workbench.pages[0];
  const hasActivePage = Boolean(activePageId);
  const collapsedBadgeTotal = !expanded ? workbench.pages.reduce((sum, p) => {
    const val = p.badge?.();
    return sum + (typeof val === "number" && val > 0 ? val : 0);
  }, 0) : 0;
  const handleOpenDefaultPage = () => {
    if (firstPage) {
      openPage({ workbench: workbench.id, page: firstPage.id });
    }
  };
  return /* @__PURE__ */ jsxs41("section", { className: "flex flex-col gap-0.5", "aria-label": workbench.name, children: [
    /* @__PURE__ */ jsxs41(
      "div",
      {
        "data-active": !expanded && hasActivePage ? "true" : void 0,
        className: cn10(
          "wb-pane-row group flex w-full items-center gap-1 rounded-lg px-2 py-1 select-none",
          "text-(--ui-text-primary)"
        ),
        children: [
          /* @__PURE__ */ jsxs41(
            "button",
            {
              type: "button",
              onClick: handleOpenDefaultPage,
              className: "flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-left outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ui-accent)",
              children: [
                /* @__PURE__ */ jsx44(
                  "span",
                  {
                    className: cn10(
                      "wb-pane-lead",
                      hasActivePage ? "text-(--ui-text-primary)" : "text-(--ui-text-secondary) group-hover:text-(--ui-text-primary)"
                    ),
                    children: /* @__PURE__ */ jsx44(Codicon4, { name: workbench.codicon, size: "0.875rem" })
                  }
                ),
                /* @__PURE__ */ jsx44(TruncatedLabel, { text: workbench.name, className: "font-medium" })
              ]
            }
          ),
          !expanded && collapsedBadgeTotal > 0 && /* @__PURE__ */ jsx44(
            Badge18,
            {
              variant: "outline",
              className: "wb-badge shrink-0 border border-(--ui-stroke-secondary) bg-(--ui-bg-quinary) text-(--ui-text-secondary)",
              children: collapsedBadgeTotal
            }
          ),
          /* @__PURE__ */ jsx44(
            "button",
            {
              type: "button",
              "aria-expanded": expanded,
              "aria-label": expanded ? `\u6536\u8D77${workbench.name}` : `\u5C55\u5F00${workbench.name}`,
              onClick: (e) => {
                e.stopPropagation();
                onToggleExpand();
              },
              className: "wb-caret-btn outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ui-accent)",
              children: /* @__PURE__ */ jsx44("span", { className: "wb-caret-icon", "data-expanded": expanded ? "true" : "false", children: /* @__PURE__ */ jsx44(Codicon4, { name: "chevron-right", size: "0.75rem" }) })
            }
          )
        ]
      }
    ),
    expanded && workbench.pages.length > 0 && /* @__PURE__ */ jsx44("div", { className: "flex flex-col gap-0.5", role: "group", children: workbench.pages.map((page) => /* @__PURE__ */ jsx44(
      WorkbenchPageRow,
      {
        workbenchId: workbench.id,
        page,
        active: activePageId === page.id
      },
      page.id
    )) })
  ] });
}
function WorkbenchPane() {
  const workbenches = useWorkbenches();
  const location = useLocation();
  useOpenIssueCount();
  useOpenAlertCount();
  useNeedsActionCount();
  useOpenInquiryCount();
  useRunningCampaignCount();
  useInReviewCount();
  useDesignNeedsActionCount();
  useVideoNeedsActionCount();
  const [expandedMap, setExpandedMap] = useState38(() => loadExpandedMap());
  const isExpanded = (id) => {
    return expandedMap[id] ?? true;
  };
  const toggleExpand = (id) => {
    setExpandedMap((prev) => {
      const current = prev[id] ?? true;
      const next = { ...prev, [id]: !current };
      saveExpandedMap(next);
      return next;
    });
  };
  if (workbenches.length === 0) {
    return /* @__PURE__ */ jsxs41("div", { className: "flex h-full w-full flex-col items-center justify-center p-4", children: [
      /* @__PURE__ */ jsx44("style", { children: PANE_STYLE }),
      /* @__PURE__ */ jsx44(
        EmptyState9,
        {
          title: "\u8FD8\u6CA1\u6709\u5B89\u88C5\u5DE5\u4F5C\u53F0",
          description: "\u542F\u7528\u5DE5\u4F5C\u53F0\u6A21\u5757\u540E\uFF0C\u5C06\u5728\u8FD9\u91CC\u5217\u51FA\u5BF9\u5E94\u7684\u4E1A\u52A1\u5206\u9875\u3002"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs41(
    "nav",
    {
      "aria-label": "\u5DE5\u4F5C\u53F0\u5BFC\u822A",
      className: "flex h-full w-full flex-col gap-3 overflow-y-auto px-2 py-2.5",
      children: [
        /* @__PURE__ */ jsx44("style", { children: PANE_STYLE }),
        workbenches.map((wb) => /* @__PURE__ */ jsx44(
          WorkbenchGroup,
          {
            workbench: wb,
            expanded: isExpanded(wb.id),
            onToggleExpand: () => toggleExpand(wb.id),
            activePageId: location?.workbench === wb.id ? location.page : void 0
          },
          wb.id
        )),
        /* @__PURE__ */ jsxs41("details", { className: "mt-auto border-t border-(--ui-stroke-secondary) pt-2", children: [
          /* @__PURE__ */ jsx44("summary", { className: "cursor-pointer px-2 py-1 text-xs text-(--ui-text-secondary)", children: "\u8BBE\u7F6E" }),
          /* @__PURE__ */ jsx44("div", { className: "px-2 py-2", children: /* @__PURE__ */ jsx44(WorkbenchSettings, {}) })
        ] })
      ]
    }
  );
}

// src/plugin.tsx
import { jsx as jsx45 } from "react/jsx-runtime";
var BUILTIN_WORKBENCHES = [ecommerceWorkbench, brandWorkbench];
function setupWorkbenchPlugin(ctx) {
  injectPluginCss(ctx);
  setPluginRest(ctx.rest);
  const disposeWorkbenches = BUILTIN_WORKBENCHES.map((wb) => registerWorkbench(wb));
  setNavigator((path) => {
    host2.navigate(path);
  });
  const syncFromWindowHash = () => {
    if (typeof window === "undefined") return;
    const hashPath2 = window.location.hash.replace(/^#/, "");
    syncLocationFromPath(hashPath2);
  };
  syncFromWindowHash();
  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", syncFromWindowHash);
    window.addEventListener("popstate", syncFromWindowHash);
  }
  ctx.register({
    id: "pane",
    area: "panes",
    title: "\u5DE5\u4F5C\u53F0",
    data: {
      placement: "left",
      width: "260px",
      collapsible: true,
      hideOnly: true,
      tabTitle: () => "\u5DE5\u4F5C\u53F0",
      tabTitleText: () => "\u5DE5\u4F5C\u53F0",
      dock: {
        pane: "sessions",
        pos: "center",
        enforce: true
      }
    },
    render: () => /* @__PURE__ */ jsx45(WorkbenchPane, {})
  });
  for (const wb of listWorkbenches()) {
    for (const page of wb.pages) {
      const path = toPath({ workbench: wb.id, page: page.id });
      ctx.register({
        id: `page:${wb.id}:${page.id}`,
        area: ROUTES_AREA,
        title: `${wb.name} \xB7 ${page.label}`,
        data: { path },
        render: () => /* @__PURE__ */ jsx45(WorkbenchPage, {})
      });
    }
  }
  const stopWatchingPath = installPathRestore();
  const cleanup = () => {
    stopWatchingPath();
    if (typeof window !== "undefined") {
      window.removeEventListener("hashchange", syncFromWindowHash);
      window.removeEventListener("popstate", syncFromWindowHash);
    }
    for (const dispose of disposeWorkbenches) {
      dispose();
    }
  };
  ctx.onDispose?.(cleanup);
  return cleanup;
}
var plugin_default = {
  id: "hermes-workbench",
  name: "\u5DE5\u4F5C\u53F0",
  description: "\u7535\u5546\u3001\u54C1\u724C\u6D3B\u52A8\u7B49\u90E8\u95E8\u5DE5\u4F5C\u53F0\uFF1A\u5DE6\u4E0A\u89D2\u201C\u5DE5\u4F5C\u53F0\u201D\u6807\u7B7E\u548C\u5404\u4E1A\u52A1\u9875\u9762\u3002",
  register: setupWorkbenchPlugin
};
export {
  plugin_default as default
};
