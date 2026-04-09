/**
 * 搜索历史记录工具类
 */

const SEARCH_HISTORY_KEY = 'search_history'
const MAX_HISTORY_COUNT = 10

export interface SearchHistoryItem {
    keyword: string
    timestamp: number
}

/**
 * 获取搜索历史记录
 */
export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (!history) {
      return []
    }

    const items: SearchHistoryItem[] = JSON.parse(history)
    // 按时间倒序排列
    return items.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('获取搜索历史失败:', error)
    return []
  }
}

/**
 * 添加搜索历史记录
 */
export function addSearchHistory(keyword: string): void {
  if (typeof window === 'undefined') {
    return
  }

  if (!keyword || !keyword.trim()) {
    return
  }

  try {
    const history = getSearchHistory()
    const trimmedKeyword = keyword.trim()

    // 检查是否已存在
    const existingIndex = history.findIndex(item => item.keyword === trimmedKeyword)

    if (existingIndex !== -1) {
      // 如果已存在，更新时间戳并移到最前面
      history.splice(existingIndex, 1)
    }

    // 添加到最前面
    history.unshift({
      keyword: trimmedKeyword,
      timestamp: Date.now()
    })

    // 限制数量
    if (history.length > MAX_HISTORY_COUNT) {
      history.splice(MAX_HISTORY_COUNT)
    }

    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('添加搜索历史失败:', error)
  }
}

/**
 * 删除搜索历史记录
 */
export function removeSearchHistory(keyword: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const history = getSearchHistory()
    const newHistory = history.filter(item => item.keyword !== keyword)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
  } catch (error) {
    console.error('删除搜索历史失败:', error)
  }
}

/**
 * 清空搜索历史记录
 */
export function clearSearchHistory(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  } catch (error) {
    console.error('清空搜索历史失败:', error)
  }
}

/**
 * 获取搜索历史关键词列表（仅关键词）
 */
export function getSearchHistoryKeywords(): string[] {
  return getSearchHistory().map(item => item.keyword)
}
