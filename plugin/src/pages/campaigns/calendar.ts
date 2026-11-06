import type { Campaign } from '../../api/brand'

export interface CalendarDay {
  iso: string
  day: number
  inMonth: boolean
}

export interface WeekBar {
  id: number
  lane: number
  startCol: number
  endCol: number
}

export function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function parseIso(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year || 1970, (month || 1) - 1, day || 1)
}

export function monthBounds(anchor: Date): { from: string; to: string } {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)
  return { from: isoDate(start), to: isoDate(end) }
}

/** 周一为一周的第一天，铺满当月所在的各周。 */
export function monthWeeks(anchor: Date): CalendarDay[][] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const cursor = new Date(first)
  const weekday = cursor.getDay()
  cursor.setDate(cursor.getDate() - (weekday === 0 ? 6 : weekday - 1))
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)
  const weeks: CalendarDay[][] = []
  while (cursor <= last || weeks.length === 0) {
    const week: CalendarDay[] = []
    for (let index = 0; index < 7; index += 1) {
      week.push({
        iso: isoDate(cursor),
        day: cursor.getDate(),
        inMonth: cursor.getMonth() === anchor.getMonth()
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
    if (weeks.length > 6) break
  }
  return weeks
}

/**
 * 同一周里的活动色条按开始日、再按跨度从长到短排，放进第一条不重叠的行。
 * 思路和月视图里多日事件分行相同，这里按这个页面自己写。
 */
export function placeWeekBars(week: CalendarDay[], campaigns: Campaign[]): WeekBar[] {
  const weekStart = week[0]?.iso ?? ''
  const weekEnd = week[6]?.iso ?? ''
  const segments = campaigns
    .filter(item => item.end_date >= weekStart && item.start_date <= weekEnd)
    .map(item => {
      const startCol = item.start_date < weekStart ? 0 : week.findIndex(day => day.iso === item.start_date)
      const endCol = item.end_date > weekEnd ? 6 : week.findIndex(day => day.iso === item.end_date)
      return { id: item.id, startCol: Math.max(0, startCol), endCol: endCol < 0 ? 6 : endCol }
    })
    .sort((a, b) => a.startCol - b.startCol || b.endCol - b.startCol - (a.endCol - a.startCol) || a.id - b.id)

  const laneEnds: number[] = []
  return segments.map(segment => {
    let lane = laneEnds.findIndex(end => end < segment.startCol)
    if (lane < 0) {
      lane = laneEnds.length
      laneEnds.push(segment.endCol)
    } else {
      laneEnds[lane] = segment.endCol
    }
    return { ...segment, lane }
  })
}
