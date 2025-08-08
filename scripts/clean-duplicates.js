#!/usr/bin/env node

/*
  Clean duplicate/unconfirmed Supabase users by email.
  Requirements:
    - Set SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in environment or .env.local
  Behavior:
    - For each email, keep the latest confirmed user (email_confirmed_at not null) or most recent created
    - Delete other duplicates and any unconfirmed stale users for that email
    - Dry-run mode if DRY_RUN=true
*/

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const dryRun = String(process.env.DRY_RUN || 'false').toLowerCase() === 'true'

if (!url || !serviceRoleKey) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })

async function listAllUsers(pageSize = 1000) {
  let users = []
  let page = 1
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: pageSize })
    if (error) throw error
    users = users.concat(data.users)
    if (data.users.length < pageSize) break
    page += 1
  }
  return users
}

function pickUserToKeep(users) {
  // Prefer confirmed users; if multiple, pick latest created_at
  const confirmed = users.filter(u => u.email_confirmed_at)
  const pool = confirmed.length ? confirmed : users
  return pool.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
}

async function deleteUser(user) {
  if (dryRun) {
    console.log(`[DRY RUN] Would delete user ${user.id} ${user.email}`)
    return
  }
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) throw error
  console.log(`Deleted user ${user.id} ${user.email}`)
}

async function main() {
  console.log('Fetching users...')
  const users = await listAllUsers()
  console.log(`Total users: ${users.length}`)

  const byEmail = new Map()
  for (const u of users) {
    const key = (u.email || '').toLowerCase().trim()
    if (!key) continue
    if (!byEmail.has(key)) byEmail.set(key, [])
    byEmail.get(key).push(u)
  }

  let duplicatesFound = 0
  for (const [email, arr] of byEmail) {
    if (arr.length <= 1) continue
    duplicatesFound++
    console.log(`\nDuplicate email: ${email} (${arr.length})`)
    const keep = pickUserToKeep(arr)
    console.log(`Keeping: ${keep.id} confirmed=${!!keep.email_confirmed_at} created_at=${keep.created_at}`)
    const toDelete = arr.filter(u => u.id !== keep.id)
    for (const u of toDelete) {
      try {
        await deleteUser(u)
      } catch (err) {
        console.error(`Failed to delete ${u.id} ${u.email}:`, err.message || err)
      }
    }
  }

  if (!duplicatesFound) console.log('No duplicates found.')
  console.log('Done.')
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
}) 