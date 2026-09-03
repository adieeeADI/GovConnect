import AsyncStorage from '@react-native-async-storage/async-storage';

const RECOMMENDATIONS_CACHE_PREFIX = 'recommendations:';

export const clearRecommendationsCache = async (userId: string) => {
  const keys = await AsyncStorage.getAllKeys();
  const userCachePrefix = `${RECOMMENDATIONS_CACHE_PREFIX}${userId}:`;
  const recommendationKeys = keys.filter(key => key.startsWith(userCachePrefix));

  if (recommendationKeys.length > 0) {
    await AsyncStorage.multiRemove(recommendationKeys);
  }
};