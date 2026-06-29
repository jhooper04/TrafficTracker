import { Client, Account, Databases, Query, ID } from 'appwrite'
import type { Entry } from '../types/entry'
import type { TimeLog } from '../types/time-log'
import type { ParkingLog } from '../types/parking-log'

const client = new Client()
  .setEndpoint('https://appwrite.jakehooper.pro/v1')
  .setProject('traffic-tracker')

export const account = new Account(client)
export const databases = new Databases(client)

export const DB_ID = 'traffic-log'
export const COLLECTION_ID = 'entries'
export const TIME_LOGS_COLLECTION_ID = 'time_logs'
export const PARKING_LOGS_COLLECTION_ID = 'parking_logs'

export { Query, ID }

export async function fetchTodayEntries(): Promise<Entry[]> {
  const midnight = new Date()
  midnight.setHours(0, 0, 0, 0)

  const result = await databases.listDocuments(DB_ID, COLLECTION_ID, [
    Query.greaterThanEqual('$createdAt', midnight.toISOString()),
    Query.orderDesc('$createdAt'),
    Query.limit(100),
  ])

  return result.documents as unknown as Entry[]
}

export async function fetchLatestTimeLog(site: string): Promise<TimeLog | null> {
  const result = await databases.listDocuments(DB_ID, TIME_LOGS_COLLECTION_ID, [
    Query.equal('site', site),
    Query.orderDesc('$createdAt'),
    Query.limit(1),
  ])
  return result.documents.length > 0 ? (result.documents[0] as unknown as TimeLog) : null
}

export async function fetchTodayParkingLogs(site: string): Promise<ParkingLog[]> {
  const today = new Date().toISOString().slice(0, 10)
  const result = await databases.listDocuments(DB_ID, PARKING_LOGS_COLLECTION_ID, [
    Query.equal('site', site),
    Query.equal('date', today),
    Query.orderAsc('$createdAt'),
    Query.limit(1000),
  ])
  return result.documents as unknown as ParkingLog[]
}

export async function fetchEntriesByRange(start: Date, end: Date): Promise<Entry[]> {
  const all: Entry[] = []
  const BATCH = 1000
  let offset = 0

  while (true) {
    const result = await databases.listDocuments(DB_ID, COLLECTION_ID, [
      Query.greaterThanEqual('$createdAt', start.toISOString()),
      Query.lessThanEqual('$createdAt', end.toISOString()),
      Query.orderAsc('$createdAt'),
      Query.limit(BATCH),
      Query.offset(offset),
    ])
    all.push(...(result.documents as unknown as Entry[]))
    if (result.documents.length < BATCH) break
    offset += BATCH
  }

  return all
}

export async function fetchParkingLogsByRange(start: Date, end: Date): Promise<ParkingLog[]> {
  const all: ParkingLog[] = []
  const BATCH = 1000
  let offset = 0

  while (true) {
    const result = await databases.listDocuments(DB_ID, PARKING_LOGS_COLLECTION_ID, [
      Query.greaterThanEqual('$createdAt', start.toISOString()),
      Query.lessThanEqual('$createdAt', end.toISOString()),
      Query.orderAsc('$createdAt'),
      Query.limit(BATCH),
      Query.offset(offset),
    ])
    all.push(...(result.documents as unknown as ParkingLog[]))
    if (result.documents.length < BATCH) break
    offset += BATCH
  }

  return all
}

export async function fetchTimeLogsByRange(start: Date, end: Date): Promise<TimeLog[]> {
  const all: TimeLog[] = []
  const BATCH = 1000
  let offset = 0

  while (true) {
    const result = await databases.listDocuments(DB_ID, TIME_LOGS_COLLECTION_ID, [
      Query.greaterThanEqual('$createdAt', start.toISOString()),
      Query.lessThanEqual('$createdAt', end.toISOString()),
      Query.orderAsc('$createdAt'),
      Query.limit(BATCH),
      Query.offset(offset),
    ])
    all.push(...(result.documents as unknown as TimeLog[]))
    if (result.documents.length < BATCH) break
    offset += BATCH
  }

  return all
}

export async function deleteEntry(id: string): Promise<void> {
  await databases.deleteDocument(DB_ID, COLLECTION_ID, id)
}
