import { Stack } from "expo-router";
import { LogBox } from 'react-native';
import './global.css';
import { LanguageProvider } from '../utils/i18n';

LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
]);

export default function RootLayout() {
  return (
    <LanguageProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }}
      >
        {/* Root screens: Gesture back is disabled because there is no previous screen */}
        <Stack.Screen name="index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="auth/landing" options={{ gestureEnabled: false }} />
        <Stack.Screen name="main/home" options={{ gestureEnabled: false }} />

        {/* All other screens (details, edit, privacy, auth sub-screens) inherit gestureEnabled: true */}
      </Stack>
    </LanguageProvider>
  );
}