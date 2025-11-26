import OneSignal from 'react-onesignal';

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || '';

// Prevent double initialization (React StrictMode calls effects twice)
let isInitialized = false;
let initPromise: Promise<boolean> | null = null;

export interface NotificationTags {
  player_id?: string;
  tournament_id?: string;
  role?: 'player' | 'spectator' | 'organizer';
}

/**
 * Initialize OneSignal SDK
 * @returns Promise<boolean> - true if initialized successfully
 */
export const initOneSignal = async (): Promise<boolean> => {
  // Return existing promise if already initializing
  if (initPromise) {
    return initPromise;
  }

  // Already initialized
  if (isInitialized) {
    return true;
  }

  if (!ONESIGNAL_APP_ID) {
    console.warn('[OneSignal] App ID not configured - notifications disabled');
    return false;
  }

  initPromise = (async () => {
    try {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: import.meta.env.DEV
      });
      isInitialized = true;
      console.log('[OneSignal] Initialized successfully');
      return true;
    } catch (error) {
      // Check if already initialized error
      if (error instanceof Error && error.message.includes('already initialized')) {
        isInitialized = true;
        console.log('[OneSignal] Already initialized');
        return true;
      }
      console.error('[OneSignal] Initialization failed:', error);
      initPromise = null;
      return false;
    }
  })();

  return initPromise;
};

/**
 * Request notification permission from user
 */
export const promptForNotifications = async (): Promise<boolean> => {
  try {
    await OneSignal.Slidedown.promptPush();
    const permission = await OneSignal.Notifications.permission;
    return permission;
  } catch (error) {
    console.error('[OneSignal] Permission request failed:', error);
    return false;
  }
};

/**
 * Set user tags for targeted notifications
 */
export const setUserTags = async (tags: NotificationTags): Promise<void> => {
  try {
    const tagsRecord: Record<string, string> = {};
    if (tags.player_id) tagsRecord.player_id = tags.player_id;
    if (tags.tournament_id) tagsRecord.tournament_id = tags.tournament_id;
    if (tags.role) tagsRecord.role = tags.role;

    await OneSignal.User.addTags(tagsRecord);
    console.log('[OneSignal] Tags set:', tagsRecord);
  } catch (error) {
    console.error('[OneSignal] Failed to set tags:', error);
  }
};

/**
 * Remove user tags
 */
export const removeUserTags = async (tagKeys: string[]): Promise<void> => {
  try {
    await OneSignal.User.removeTags(tagKeys);
    console.log('[OneSignal] Tags removed:', tagKeys);
  } catch (error) {
    console.error('[OneSignal] Failed to remove tags:', error);
  }
};

/**
 * Subscribe to a tournament's notifications
 */
export const subscribeTournament = async (
  tournamentId: string,
  role: 'player' | 'spectator' | 'organizer',
  playerId?: string
): Promise<void> => {
  const tags: NotificationTags = { tournament_id: tournamentId, role };
  if (playerId) tags.player_id = playerId;
  await setUserTags(tags);
};

/**
 * Unsubscribe from tournament notifications
 */
export const unsubscribeTournament = async (): Promise<void> => {
  await removeUserTags(['tournament_id', 'player_id', 'role']);
};

/**
 * Check if push notifications are supported
 */
export const isPushSupported = (): boolean => {
  try {
    return OneSignal.Notifications.isPushSupported();
  } catch {
    return false;
  }
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = async (): Promise<NotificationPermission> => {
  try {
    const permission = await OneSignal.Notifications.permission;
    return permission ? 'granted' : 'default';
  } catch {
    return 'default';
  }
};

/**
 * Set external user ID (for logged-in users)
 */
export const setExternalUserId = async (userId: string): Promise<void> => {
  // Wait for initialization first
  if (!isInitialized) {
    console.warn('[OneSignal] Not initialized yet, skipping login');
    return;
  }

  try {
    await OneSignal.login(userId);
    console.log('[OneSignal] User logged in:', userId);
  } catch (error) {
    console.error('[OneSignal] Failed to set external user ID:', error);
  }
};

/**
 * Logout from OneSignal
 */
export const logoutOneSignal = async (): Promise<void> => {
  try {
    await OneSignal.logout();
    console.log('[OneSignal] User logged out');
  } catch (error) {
    console.error('[OneSignal] Logout failed:', error);
  }
};

export { OneSignal };
