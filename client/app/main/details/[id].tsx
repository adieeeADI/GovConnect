import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Clock, Wallet, Check, Gift } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Individual() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { id } = params;

  useEffect(() => {
    if (id) {
      fetchDetailedData(id as string);
    }
  }, [id]);

  const fetchDetailedData = async (itemId: string) => {
    try {
      setLoading(true);
      // Try fetching from internships first, then scholarships
      const endpoints = [
        `https://govconnect-ad4s.onrender.com/api/data/internships/${itemId}`,
        `https://govconnect-ad4s.onrender.com/api/data/scholarships/${itemId}`,
        `https://govconnect-ad4s.onrender.com/api/data/schemes/${itemId}`,
        `https://govconnect-ad4s.onrender.com/api/data/training/${itemId}`,
      ];

      let response = null;
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint);
          if (res.ok) {
            response = await res.json();
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (response) {
        setData(response);
      }
      setLoading(false);
    } catch (err) {
      console.log('Error fetching details:', err);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <StatusBar style="light" />
      
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1e3a8a" />
        </View>
      ) : !data ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-600 text-center text-base">
            Sorry, we couldn't load the details for this opportunity.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="bg-blue-900 rounded-b-3xl px-6 py-6 mb-6">
            <TouchableOpacity 
              className="mb-4"
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft color="#ffffff" size={24} strokeWidth={2} />
            </TouchableOpacity>

            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1">
                <Text className="text-white text-3xl font-bold mb-2">
                  {data.basicInfo?.title || 'Opportunity'}
                </Text>
                <Text className="text-white text-base opacity-90">
                  {data.basicInfo?.providerName || 'Provider'}
                </Text>
              </View>
            </View>

            {/* Info Pills */}
            <View className="flex-row flex-wrap gap-2">
              <View className="bg-white/20 rounded-full px-4 py-2 flex-row items-center">
                <MapPin color="#ffffff" size={16} strokeWidth={2} />
                <Text className="text-white text-sm ml-1">
                  {data.internshipDetails?.location?.[0] || data.basicInfo?.location || 'Location'}
                </Text>
              </View>

              <View className="bg-white/20 rounded-full px-4 py-2 flex-row items-center">
                <Clock color="#ffffff" size={16} strokeWidth={2} />
                <Text className="text-white text-sm ml-1">
                  {data.internshipDetails?.duration || 'Duration'}
                </Text>
              </View>

              <View className="bg-white/20 rounded-full px-4 py-2 flex-row items-center">
                <Wallet color="#ffffff" size={16} strokeWidth={2} />
                <Text className="text-white text-sm ml-1">
                  {data.internshipDetails?.stipend || 'Amount'}
                </Text>
              </View>
            </View>
          </View>

          <View className="px-6 pb-6">
            {/* About This Opportunity */}
            <Text className="text-black text-xl font-bold mb-3">
              About This Opportunity
            </Text>
            <Text className="text-gray-600 text-base leading-6 mb-6">
              {data.programDetails?.about || data.basicInfo?.shortDescription || 'No description available'}
            </Text>

            {/* Key Highlights */}
            {data.programDetails?.perks && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  Key Highlights & Perks
                </Text>
                <Text className="text-gray-600 text-base leading-6 mb-6">
                  {data.programDetails.perks}
                </Text>
              </>
            )}

            {/* Eligibility */}
            {(data.eligibility?.educationLevels || data.eligibility?.minimumCGPA) && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  Eligibility Requirements
                </Text>
                <View className="mb-6">
                  {data.eligibility?.educationLevels && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        Education: {data.eligibility.educationLevels.join(', ')}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.minimumCGPA && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        Minimum CGPA: {data.eligibility.minimumCGPA}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.statesEligible && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        States: {data.eligibility.statesEligible.join(', ')}
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Application Info */}
            {(data.applicationDetails?.startDate || data.applicationDetails?.endDate) && (
              <View className="mb-6">
                {data.applicationDetails?.startDate && (
                  <Text className="text-gray-600 text-sm mb-1">
                    Start Date: {new Date(data.applicationDetails.startDate).toLocaleDateString()}
                  </Text>
                )}
                {data.applicationDetails?.endDate && (
                  <Text className="text-gray-600 text-sm">
                    End Date: {new Date(data.applicationDetails.endDate).toLocaleDateString()}
                  </Text>
                )}
              </View>
            )}

            {/* Action Buttons */}
            <TouchableOpacity 
              className="bg-blue-900 rounded-2xl py-4 items-center mb-3"
              activeOpacity={0.8}
            >
              <Text className="text-white text-lg font-bold">
                Apply Now
              </Text>
            </TouchableOpacity>

            {data.basicInfo?.applicationLink && (
              <TouchableOpacity 
                className="bg-white border-2 border-blue-900 rounded-2xl py-4 items-center mb-8"
                activeOpacity={0.8}
              >
                <Text className="text-blue-900 text-lg font-semibold">
                  Official Portal
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}