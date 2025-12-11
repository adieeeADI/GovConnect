import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Home, Search, Star, User } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/main/home') {
      return pathname === '/main/home' || pathname === '/';
    }
    return pathname.startsWith(path);
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
          onPress={() => router.push('/main/home')}
        >
          <Home 
            color={isActive('/main/home') ? '#ef4444' : '#9ca3af'} 
            size={24}
          />
          <Text className={`text-xs mt-1 font-semibold ${
            isActive('/main/home') ? 'text-red-600' : 'text-gray-400'
          }`}>
            Home
          </Text>
        </TouchableOpacity>

        {/* Search */}
        <TouchableOpacity 
          className="items-center"
          activeOpacity={0.7}
          onPress={() => router.push('/main/browse?category=internships')}
        >
          <Search 
            color={isActive('/main/browse') ? '#ef4444' : '#9ca3af'} 
            size={24}
          />
          <Text className={`text-xs mt-1 font-semibold ${
            isActive('/main/browse') ? 'text-red-600' : 'text-gray-400'
          }`}>
            Search
          </Text>
        </TouchableOpacity>

        {/* For You */}
        <TouchableOpacity className="items-center" activeOpacity={0.7}>
          <Star 
            color={isActive('/main/recommendation') ? '#ef4444' : '#9ca3af'} 
            size={24}
          />
          <Text className={`text-xs mt-1 font-semibold ${
            isActive('/main/recommendation') ? 'text-red-600' : 'text-gray-400'
          }`}>
            For You
          </Text>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity className="items-center" activeOpacity={0.7}>
          <User 
            color={isActive('/main/profile') ? '#ef4444' : '#9ca3af'} 
            size={24}
          />
          <Text className={`text-xs mt-1 font-semibold ${
            isActive('/main/profile') ? 'text-red-600' : 'text-gray-400'
          }`}>
            Profile
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
