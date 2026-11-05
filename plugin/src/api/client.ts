import { getApiBase } from '../settings'

export type ApiErrorKind = 'http' | 'network'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number
  readonly code?: string

  constructor(message: string, kind: ApiErrorKind, status?: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
    this.code = code
  }
}

export function isOfflineError(error: unknown): boolean {
  return error instanceof ApiError && error.kind === 'network'
}

interface ApiFetchInit extends Omit<RequestInit, 'signal'> {
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 20_000

export async function apiFetch<T>(path: string, init: ApiFetchInit = {}): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers: initHeaders, ...rest } = init
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const headers = new Headers(initHeaders)
  const isForm = typeof FormData !== 'undefined' && rest.body instanceof FormData
  if (rest.body != null && !isForm && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  try {
    const base = getApiBase().replace(/\/$/, '')
    const response = await fetch(`${base}${path}`, {
      ...rest,
      headers,
      signal: controller.signal
    })
    const text = await response.text()
    const body = text ? parseJson(text) : null
    if (!response.ok) {
      const record = asRecord(body)
      const errorRecord = asRecord(record?.error)
      const message =
        typeof errorRecord?.message === 'string'
          ? errorRecord.message
          : `请求失败（${response.status}）`
      const code = typeof errorRecord?.code === 'string' ? errorRecord.code : undefined
      throw new ApiError(message, 'http', response.status, code)
    }
    return body as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (isAbort(error)) {
      throw new ApiError('请求超时', 'network')
    }
    throw new ApiError('没有连上工作台服务', 'network')
  } finally {
    clearTimeout(timer)
  }
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object') return value as Record<string, unknown>
  return null
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
