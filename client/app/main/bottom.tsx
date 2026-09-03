import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Home, Search, Star, User } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../utils/i18n';
import { HOME_ROUTE } from '../../utils/navigation';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const isActive = (path: string) => {
    if (path === '/main/home') {
      return pathname === '/main/home' || pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    if (isActive(path)) {
      return;
    }
    if (path === HOME_ROUTE) {
      router.replace(HOME_ROUTE);
    } else {
      router.push(path as any);
    }
  };

  return (
    <SafeAreaView 
      edges={['bottom']} 
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200"
    >
      <View className="flex-row items-center justify-around py-3 px-6">
        
        {/* Home */}
        <TouchableOpacity 
          className="items-center"
          activeOpacity={0.7}
          onPress={() => handleNavigation('/main/home')}
        >
          <Home 
            color={isActive('/main/home') ? '#ef4444' : '#9ca3af'} 
            size={24}
          />
          <Text className={`text-xs mt-1 font-semibold ${
            isActive('/main/home') ? 'text-red-600' : 'text-gray-400'
          }`}>
            {t('nav_home')}
          </Text>
        </TouchableOpacity>

        {/* Search / Browse */}
        <TouchableOpacity 
          className="items-center"
          activeOpacity={0.7}
          onPress={() => handleNavigation('/main/browse')}
        >
          <Search 
            color={isActive('/main/browse') ? '#ef4444' : '#9ca3af'} 
            size={24}
          />
          <Text className={`text-xs mt-1 font-semibold ${
            isActive('/main/browse') ? 'text-red-600' : 'text-gray-400'
          }`}>
            {t('nav_browse')}
          </Text>
        </TouchableOpacity>

        {/* For You */}
        <TouchableOpacity 
          className="items-center" 
          activeOpacity={0.7}
          onPress={() => handleNavigation('/main/recommendation')}
        >
          <Star 
            color={isActive('/main/recommendation') ? '#ef4444' : '#9ca3af'} 
            size={24}
          />
          <Text className={`text-xs mt-1 font-semibold ${
            isActive('/main/recommendation') ? 'text-red-600' : 'text-gray-400'
          }`}>
            {t('nav_for_you')}
          </Text>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity 
          className="items-center" 
          activeOpacity={0.7}
          onPress={() => handleNavigation('/profile/profile')}
        >
          <User 
            color={isActive('/profile') ? '#ef4444' : '#9ca3af'} 
            size={24}
          />
          <Text className={`text-xs mt-1 font-semibold ${
            isActive('/profile') ? 'text-red-600' : 'text-gray-400'
          }`}>
            {t('nav_profile')}
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
