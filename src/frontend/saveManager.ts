import type { GameState } from '../core/types/gameState'

const DB_NAME = 'amatric'
const DB_VERSION = 1
const STORE_NAME = 'save'
const SAVE_KEY = 'current'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveGame(state: GameState): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(state, SAVE_KEY)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function loadGame(): Promise<GameState | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(SAVE_KEY)
    req.onsuccess = () => { db.close(); resolve(req.result ?? null) }
    req.onerror = () => { db.close(); reject(req.error) }
  })
}

export async function clearSave(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(SAVE_KEY)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export function exportSave(state: GameState): string {
  return JSON.stringify(state, null, 2)
}

export function importSave(json: string): GameState {
  const parsed = JSON.parse(json)
  return migrateSave(parsed)
}

/** Migrate old saves to current schema. */
export function migrateSave(data: any): GameState {
  // v0 → v1: currentDay renamed to businessDay
  if ('currentDay' in data && !('businessDay' in data)) {
    data.businessDay = data.currentDay
    delete data.currentDay
  }

  // Add missing fields with defaults
  data.totalDaysElapsed = data.totalDaysElapsed ?? data.businessDay ?? 1
  data.dataVersion = data.dataVersion ?? 1
  data.prestigeTier = data.prestigeTier ?? 0
  data.prestigeHistory = data.prestigeHistory ?? []
  data.stats = data.stats ?? {
    highestDailyProfit: 0,
    highestDailyRevenue: 0,
    totalCupsSold: 0,
    fastestBreakEven: null,
  }
  data.activeMenus = (data.activeMenus ?? []).map((m: any) => ({
    ...m,
    popularityBoostEnd: m.popularityBoostEnd ?? 0,
  }))

  return data as GameState
}

/** Debounced auto-save. */
let saveTimeout: ReturnType<typeof setTimeout> | null = null
export function autoSave(state: GameState) {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => saveGame(state).catch(console.error), 500)
}

/** Trigger browser download of save file. */
export function downloadSave(state: GameState) {
  const json = exportSave(state)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `amatric-save-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Read a file and return migrated GameState. */
export function uploadSave(file: File): Promise<GameState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try { resolve(importSave(reader.result as string)) }
      catch (e) { reject(e) }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
