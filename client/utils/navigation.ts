import { useRouter, type Href } from 'expo-router';

export const HOME_ROUTE = '/main/home' as Href;

export function goBackWithinApp(router: ReturnType<typeof useRouter>) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(HOME_ROUTE);
  }
}