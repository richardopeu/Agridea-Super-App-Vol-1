import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || null,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Database operation failed for user profile.', { cause: error });
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users from database.', { cause: error });
  }
}
