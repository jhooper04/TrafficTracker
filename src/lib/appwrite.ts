import { Client, Account, Databases, Query, ID } from 'appwrite'
import type { Entry } from '../types/entry'

const client = new Client()
  .setEndpoint('https://appwrite.jakehooper.pro/v1')
  .setProject('traffic-tracker')

export const account = new Account(client)
export const databases = new Databases(client)

export const DB_ID = 'traffic-log'
export const COLLECTION_ID = 'entries'

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
