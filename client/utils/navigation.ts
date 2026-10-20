import { useRouter, type Href } from 'expo-router';

export const HOME_ROUTE = '/main/home' as Href;
export const LANDING_ROUTE = '/auth/landing' as Href;

export function goBackWithinApp(router: ReturnType<typeof useRouter>) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(HOME_ROUTE);
  }
}

/**
 * Safely reset the navigation state to the Auth/Landing screen,
 * clearing the entire stack history to prevent accidental back-navigation to pre-logout screens.
 */
export function resetToAuth(navigation?: any, router?: ReturnType<typeof useRouter>) {
  try {
    if (navigation && typeof navigation.reset === 'function') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'auth/landing' }],
      });
      return;
    }
  } catch (e) {
    console.log('Navigation reset to auth error:', e);
  }

  if (router) {
    if (typeof router.dismissAll === 'function' && router.canDismiss?.()) {
      router.dismissAll();
    }
    router.replace('/auth/landing');
  }
}

/**
 * Safely reset the navigation state to the Home screen,
 * clearing auth screens from the stack history to prevent back-navigation to login.
 */
export function resetToHome(navigation?: any, router?: ReturnType<typeof useRouter>) {
  try {
    if (navigation && typeof navigation.reset === 'function') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'main/home' }],
      });
      return;
    }
  } catch (e) {
    console.log('Navigation reset to home error:', e);
  }

  if (router) {
    if (typeof router.dismissAll === 'function' && router.canDismiss?.()) {
      router.dismissAll();
    }
    router.replace('/main/home');
  }
}