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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </LanguageProvider>
  );
}