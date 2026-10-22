import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUserBookmarksEndpoint,
  getUserAppliedEndpoint,
  getUserStatsEndpoint,
  API_ENDPOINTS,
  safeFetchJson,
} from '../config/api.config';

/**
 * Check if an internship's application deadline has exceeded.
 * An end date is considered exceeded if current time is past 23:59:59.999 of that date.
 */
export function isDeadlineExceeded(endDate?: string | Date | null): boolean {
  if (!endDate) return false;
  const d = new Date(endDate);
  if (isNaN(d.getTime())) return false;
  const endOfDay = new Date(d);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime() < Date.now();
}

/**
 * Get human-readable deadline and remaining days.
 */
export function getDeadlineInfo(endDate?: string | Date | null) {
  if (!endDate) {
    return { isExpired: false, days: null, text: 'No deadline specified' };
  }
  const d = new Date(endDate);
  if (isNaN(d.getTime())) {
    return { isExpired: false, days: null, text: 'Invalid date' };
  }

  const endOfDay = new Date(d);
  endOfDay.setHours(23, 59, 59, 999);
  const diffMs = endOfDay.getTime() - Date.now();

  if (diffMs < 0) {
    return { isExpired: true, days: 0, text: 'Deadline Passed' };
  }

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    return { isExpired: false, days: 0, text: 'Closes Today' };
  }
  if (days === 1) {
    return { isExpired: false, days: 1, text: '1 day left' };
  }
  return { isExpired: false, days, text: `${days} days left` };
}

const getStorageKey = (prefix: string, userId?: string | null) =>
  `${prefix}_${userId || 'guest'}`;

/**
 * Helper to clean numeric/string opportunity ID across all 4 categories
 */
export const cleanOpportunityId = (id: string | number): number | string => {
  if (typeof id === 'number') return id;
  const cleanStr = String(id).replace(/^(internships|scholarships|schemes|training)_/, '');
  const num = Number(cleanStr);
  return isNaN(num) ? cleanStr : num;
};

export const cleanInternshipId = (id: string | number): number => {
  const res = cleanOpportunityId(id);
  return typeof res === 'number' ? res : 0;
};

// In-memory queue to serialize bookmark operations and avoid concurrent write races
let bookmarkOpQueue: Promise<any> = Promise.resolve();

function enqueueBookmarkOp<T>(fn: () => Promise<T>): Promise<T> {
  const next = bookmarkOpQueue.then(fn, fn);
  bookmarkOpQueue = next.catch(() => {});
  return next;
}

/**
 * Fetch local bookmarks immediately without waiting for network.
 */
async function getLocalBookmarks(userId?: string | null): Promise<any[]> {
  const key = getStorageKey('bookmarks', userId);
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => {
          const endDate = item.applicationDetails?.endDate || item.endDate;
          return !isDeadlineExceeded(endDate);
        });
      }
    }
  } catch (err) {
    console.log('Error reading local bookmarks:', err);
  }
  return [];
}

/**
 * Fetch bookmarks for the user.
 * AUTOMATICALLY DELETES ANY EXPIRED OPPORTUNITIES AND MERGES WITH SERVER.
 */
export async function getBookmarks(userId?: string | null): Promise<any[]> {
  const key = getStorageKey('bookmarks', userId);
  const activeLocal = await getLocalBookmarks(userId);

  // If online, sync with backend, but NEVER overwrite items added locally!
  if (userId) {
    try {
      const serverBookmarks = await safeFetchJson(getUserBookmarksEndpoint(userId));
      if (Array.isArray(serverBookmarks)) {
        // Read fresh local state right now to preserve any bookmarks added while fetch was in flight
        const freshLocal = await getLocalBookmarks(userId);
        const bookmarkMap = new Map<string, any>();

        // 1. Add valid server bookmarks
        serverBookmarks.forEach((bm) => {
          const endDate = bm.applicationDetails?.endDate || bm.endDate;
          if (!isDeadlineExceeded(endDate)) {
            const bId = cleanOpportunityId(bm.opportunityId || bm.internshipId || bm._id || bm.id);
            const bCat = bm.category || 'internships';
            bookmarkMap.set(`${bCat}_${bId}`, bm);
          }
        });

        // 2. Preserve any local bookmarks that haven't appeared on server yet
        freshLocal.forEach((bm) => {
          const endDate = bm.applicationDetails?.endDate || bm.endDate;
          if (!isDeadlineExceeded(endDate)) {
            const bId = cleanOpportunityId(bm.opportunityId || bm.internshipId || bm._id || bm.id);
            const bCat = bm.category || 'internships';
            const mapKey = `${bCat}_${bId}`;
            if (!bookmarkMap.has(mapKey)) {
              bookmarkMap.set(mapKey, bm);
            }
          }
        });

        const merged = Array.from(bookmarkMap.values());
        await AsyncStorage.setItem(key, JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      // Offline fallback - use active local
    }
  }

  return activeLocal;
}

/**
 * Add an opportunity to bookmarks.
 * Supports all 4 categories (internships, scholarships, schemes, training).
 * Rejects with error if the deadline has already passed!
 * Uses sequential operation queue so multiple rapid clicks never drop a bookmark!
 */
export async function addBookmark(
  userId: string | null | undefined,
  item: any
): Promise<{ success: boolean; message?: string }> {
  return enqueueBookmarkOp(async () => {
    const endDate = item.applicationDetails?.endDate || item.endDate;

    if (isDeadlineExceeded(endDate)) {
      return {
        success: false,
        message: 'Cannot bookmark: The application deadline for this opportunity has already passed.',
      };
    }

    const rawId = item._id || item.id || item.opportunityId || item.internshipId;
    const cleanId = cleanOpportunityId(rawId);
    const category = item.category || 'internships';
    const key = getStorageKey('bookmarks', userId);

    const current = await getLocalBookmarks(userId);
    if (
      current.some((b) => {
        const bId = cleanOpportunityId(b.opportunityId || b.internshipId || b._id || b.id);
        const bCat = b.category || 'internships';
        return String(bId) === String(cleanId) && bCat === category;
      })
    ) {
      return { success: true, message: 'Already bookmarked' };
    }

    const stipendOrBenefit =
      item.internshipDetails?.stipend ||
      item.stipend ||
      item.benefits?.scholarshipAmount ||
      item.schemeDetails?.financialDetails?.amount ||
      item.trainingDetails?.fee ||
      '';

    const location =
      item.internshipDetails?.location ||
      item.trainingDetails?.location ||
      (item.location
        ? Array.isArray(item.location)
          ? item.location
          : [item.location]
        : ['India']);

    const duration =
      item.internshipDetails?.duration ||
      item.trainingDetails?.duration ||
      item.duration ||
      '';

    const newBookmark = {
      internshipId: typeof cleanId === 'number' ? cleanId : undefined,
      opportunityId: String(cleanId),
      _id: cleanId,
      category: category,
      title: item.basicInfo?.title || item.title || 'Government Opportunity',
      providerName: item.basicInfo?.providerName || item.providerName || '',
      location: location,
      stipend: stipendOrBenefit,
      duration: duration,
      mode: item.internshipDetails?.mode || item.trainingDetails?.mode || item.mode || '',
      applicationDetails: item.applicationDetails || { endDate },
      endDate: endDate,
      applicationLink: item.basicInfo?.applicationLink || item.applicationLink || '',
      officialWebsite: item.basicInfo?.officialWebsite || item.officialWebsite || '',
      bookmarkedAt: new Date().toISOString(),
    };

    // Update local storage immediately without waiting for server
    const updated = [newBookmark, ...current];
    await AsyncStorage.setItem(key, JSON.stringify(updated));

    // Sync to backend asynchronously
    if (userId) {
      try {
        await fetch(getUserBookmarksEndpoint(userId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            opportunityId: cleanId,
            internshipId: typeof cleanId === 'number' ? cleanId : undefined,
            category,
          }),
        });
      } catch (err) {
        console.log('Error syncing bookmark to backend:', err);
      }
    }

    return { success: true, message: 'Opportunity bookmarked successfully' };
  });
}

/**
 * Remove an opportunity from bookmarks.
 */
export async function removeBookmark(
  userId: string | null | undefined,
  opportunityId: string | number,
  category?: string
): Promise<boolean> {
  return enqueueBookmarkOp(async () => {
    const cleanId = cleanOpportunityId(opportunityId);
    const key = getStorageKey('bookmarks', userId);

    const current = await getLocalBookmarks(userId);
    const updated = current.filter((b) => {
      const bId = cleanOpportunityId(b.opportunityId || b.internshipId || b._id || b.id);
      if (category && b.category) {
        return !(String(bId) === String(cleanId) && b.category === category);
      }
      return String(bId) !== String(cleanId);
    });
    await AsyncStorage.setItem(key, JSON.stringify(updated));

    if (userId) {
      try {
        const catQuery = category ? `?category=${encodeURIComponent(category)}` : '';
        await fetch(`${getUserBookmarksEndpoint(userId)}/${cleanId}${catQuery}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.log('Error deleting bookmark from backend:', err);
      }
    }

    return true;
  });
}

/**
 * Check if a specific opportunity is currently bookmarked.
 * Reads directly from local state for instant 0ms check.
 */
export async function isBookmarked(
  userId: string | null | undefined,
  opportunityId: string | number,
  category?: string
): Promise<boolean> {
  const cleanId = cleanOpportunityId(opportunityId);
  const current = await getLocalBookmarks(userId);
  return current.some((b) => {
    const bId = cleanOpportunityId(b.opportunityId || b.internshipId || b._id || b.id);
    if (category && b.category) {
      return String(bId) === String(cleanId) && b.category === category;
    }
    return String(bId) === String(cleanId);
  });
}

/**
 * Fetch applied opportunities for the user.
 */
export async function getApplied(userId?: string | null): Promise<any[]> {
  const key = getStorageKey('applied', userId);
  let localApplied: any[] = [];

  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      localApplied = JSON.parse(raw);
    }
  } catch (err) {
    console.log('Error reading local applied:', err);
  }

  if (userId) {
    try {
      const serverApplied = await safeFetchJson(getUserAppliedEndpoint(userId));
      if (Array.isArray(serverApplied)) {
        await AsyncStorage.setItem(key, JSON.stringify(serverApplied));
        return serverApplied;
      }
    } catch (err) {
      // Offline fallback
    }
  }

  return localApplied;
}

/**
 * Track an applied opportunity.
 */
export async function addApplied(
  userId: string | null | undefined,
  opportunity: {
    opportunityId: string | number;
    category?: string;
    title?: string;
    providerName?: string;
    location?: string;
  }
): Promise<boolean> {
  const key = getStorageKey('applied', userId);
  const oppId = String(opportunity.opportunityId);

  const current = await getApplied(userId);
  if (current.some((a) => String(a.opportunityId) === oppId)) {
    return true; // Already recorded
  }

  const newApplied = {
    opportunityId: oppId,
    category: opportunity.category || 'internships',
    title: opportunity.title || 'Government Opportunity',
    providerName: opportunity.providerName || '',
    location: opportunity.location || '',
    appliedAt: new Date().toISOString(),
  };

  const updated = [newApplied, ...current];
  await AsyncStorage.setItem(key, JSON.stringify(updated));

  if (userId) {
    try {
      await fetch(getUserAppliedEndpoint(userId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApplied),
      });
    } catch (err) {
      console.log('Error syncing applied to backend:', err);
    }
  }

  return true;
}

/**
 * Remove an opportunity from applied list.
 */
export async function removeApplied(
  userId: string | null | undefined,
  opportunityId: string | number
): Promise<boolean> {
  const oppId = String(opportunityId);
  const key = getStorageKey('applied', userId);

  const current = await getApplied(userId);
  const updated = current.filter((a) => String(a.opportunityId) !== oppId);
  await AsyncStorage.setItem(key, JSON.stringify(updated));

  if (userId) {
    try {
      await fetch(`${getUserAppliedEndpoint(userId)}/${oppId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.log('Error deleting applied from backend:', err);
    }
  }

  return true;
}

/**
 * Check if a specific opportunity is marked as applied.
 */
export async function isApplied(
  userId: string | null | undefined,
  opportunityId: string | number
): Promise<boolean> {
  const oppId = String(opportunityId);
  const current = await getApplied(userId);
  return current.some((a) => String(a.opportunityId) === oppId);
}

/**
 * Fetch home screen statistics dynamically (Recommended, Opportunity, Applied).
 */
export async function getHomeScreenStats(userId?: string | null): Promise<{
  recommended: number;
  opportunity: number;
  applied: number;
  bookmarks: number;
}> {
  let recommendedCount = 5;
  let opportunityCount = 400; // Total count across collections
  let appliedCount = 0;
  let bookmarksCount = 0;

  // 1. Check local applied & active bookmarks
  const localApplied = await getApplied(userId);
  appliedCount = localApplied.length;

  const localBookmarks = await getBookmarks(userId);
  bookmarksCount = localBookmarks.length;

  // Check local recommendations cache
  if (userId) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const recKey = keys.find((k) => k.startsWith(`recommendations:${userId}`));
      if (recKey) {
        const rawRec = await AsyncStorage.getItem(recKey);
        if (rawRec) {
          const parsed = JSON.parse(rawRec);
          if (Array.isArray(parsed) && parsed.length > 0) {
            recommendedCount = parsed.length;
          }
        }
      }
    } catch {}
  }

  // 2. Fetch server stats if online
  if (userId) {
    try {
      const serverStats = await safeFetchJson(getUserStatsEndpoint(userId));
      if (serverStats) {
        if (typeof serverStats.opportunities === 'number') {
          opportunityCount = serverStats.opportunities;
        }
        if (typeof serverStats.applied === 'number') {
          appliedCount = serverStats.applied;
        }
        if (typeof serverStats.bookmarks === 'number') {
          bookmarksCount = Math.max(localBookmarks.length, serverStats.bookmarks);
        }
        if (typeof serverStats.recommended === 'number' && serverStats.recommended > 0) {
          recommendedCount = serverStats.recommended;
        }
      }
    } catch {
      // Try fallback to public data stats
      try {
        const pubStats = await safeFetchJson(API_ENDPOINTS.STATS);
        if (pubStats && typeof pubStats.total === 'number') {
          opportunityCount = pubStats.total;
        }
      } catch {}
    }
  } else {
    try {
      const pubStats = await safeFetchJson(API_ENDPOINTS.STATS);
      if (pubStats && typeof pubStats.total === 'number') {
        opportunityCount = pubStats.total;
      }
    } catch {}
  }

  return {
    recommended: recommendedCount,
    opportunity: opportunityCount,
    applied: appliedCount,
    bookmarks: bookmarksCount,
  };
}
