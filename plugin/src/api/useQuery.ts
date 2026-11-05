import { useEffect, useRef, useState } from 'react'

export interface QueryResult<T> {
  data: T | undefined
  error: unknown
  loading: boolean
  reload: () => void
}

/**
 * 最小请求 Hook：加载中、出错、数据和重新加载。
 * 筛选条件变化时清掉旧数据；手动 reload 保留当前数据，避免整页闪空。
 */
export function useQuery<T>(queryFn: () => Promise<T>, deps: readonly unknown[]): QueryResult<T> {
  const fnRef = useRef(queryFn)
  fnRef.current = queryFn
  const depsKey = JSON.stringify(deps)
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const depsKeyRef = useRef(depsKey)

  useEffect(() => {
    const depsChanged = depsKeyRef.current !== depsKey
    depsKeyRef.current = depsKey
    let cancelled = false
    if (depsChanged) setData(undefined)
    setLoading(true)
    setError(null)
    fnRef.current().then(
      value => {
        if (cancelled) return
        setData(value)
        setLoading(false)
      },
      (reason: unknown) => {
        if (cancelled) return
        setError(reason)
        setLoading(false)
      }
    )
    return () => {
      cancelled = true
    }
  }, [depsKey, tick])

  return {
    data,
    error,
    loading,
    reload: () => setTick(value => value + 1)
  }
}
