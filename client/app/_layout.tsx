import { Stack } from "expo-router";
import './global.css';
import { LanguageProvider } from '../utils/i18n';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </LanguageProvider>
  );
}