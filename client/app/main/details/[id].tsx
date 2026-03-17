import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../../components/CustomStatusBar';
import { ArrowLeft, MapPin, Clock, Wallet, Check, Gift } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Individual() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params?.id;
    console.log('Params received:', params);
    console.log('ID extracted:', id);
    
    if (id) {
      const idString = Array.isArray(id) ? id[0] : id;
      console.log('Fetching with ID:', idString);
      fetchDetailedData(idString);
    }
  }, [params?.id]);

  const fetchDetailedData = async (title: string) => {
    try {
      setLoading(true);
      const decodedTitle = decodeURIComponent(title);
      console.log('Fetching details for title:', decodedTitle);
      
      // Try fetching from all endpoints to find the matching item by title
      const endpoints = [
        'https://govconnect-ad4s.onrender.com/api/data/internships',
        'https://govconnect-ad4s.onrender.com/api/data/scholarships',
        'https://govconnect-ad4s.onrender.com/api/data/schemes',
        'https://govconnect-ad4s.onrender.com/api/data/training',
      ];

      let response = null;
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint);
          console.log(`Fetching from ${endpoint}: Status ${res.status}`);
          if (res.ok) {
            const data = await res.json();
            // Find item by title
            const item = Array.isArray(data) 
              ? data.find(i => i.basicInfo?.title === decodedTitle) 
              : data;
            
            if (item) {
              response = item;
              console.log('Data found:', response);
              break;
            }
          }
        } catch (err) {
          console.log(`Error fetching from ${endpoint}:`, err);
          continue;
        }
      }

      if (response) {
        setData(response);
      } else {
        console.log('No data found for title:', decodedTitle);
      }
      setLoading(false);
    } catch (err) {
      console.log('Error fetching details:', err);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <CustomStatusBar />
      
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
                {data.basicInfo?.department && (
                  <Text className="text-white text-sm opacity-75 mt-1">
                    Department: {data.basicInfo.department}
                  </Text>
                )}
              </View>
              {data.basicInfo?.logo && (
                <View className="w-16 h-16 bg-white rounded-lg ml-2 overflow-hidden">
                  {/* Logo display - you can update this to use Image component if needed */}
                </View>
              )}
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
            {/* Type & Mode Section */}
            {(data.type || data.internshipDetails?.mode) && (
              <View className="bg-gray-100 rounded-2xl p-4 mb-6">
                <Text className="text-black text-lg font-bold mb-3">
                  Opportunity Details
                </Text>
                {data.type && (
                  <View className="flex-row items-center mb-2">
                    <Text className="text-gray-700 font-semibold flex-1">Type:</Text>
                    <Text className="text-gray-600">{data.type}</Text>
                  </View>
                )}
                {data.internshipDetails?.mode && (
                  <View className="flex-row items-center mb-2">
                    <Text className="text-gray-700 font-semibold flex-1">Mode:</Text>
                    <Text className="text-gray-600">{data.internshipDetails.mode}</Text>
                  </View>
                )}
                {data.internshipDetails?.numberOfSeats && (
                  <View className="flex-row items-center">
                    <Text className="text-gray-700 font-semibold flex-1">Available Seats:</Text>
                    <Text className="text-gray-600">{data.internshipDetails.numberOfSeats}</Text>
                  </View>
                )}
              </View>
            )}

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
            {(data.eligibility?.educationLevels || data.eligibility?.streamsAllowed || data.eligibility?.yearOfStudyAllowed || data.eligibility?.minimumCGPA || data.eligibility?.statesEligible || data.eligibility?.ageLimit) && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  Eligibility Requirements
                </Text>
                <View className="mb-6">
                  {data.eligibility?.educationLevels?.length > 0 && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        Education: {data.eligibility.educationLevels.join(', ')}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.streamsAllowed?.length > 0 && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        Streams: {data.eligibility.streamsAllowed.join(', ')}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.yearOfStudyAllowed?.length > 0 && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        Year of Study: {data.eligibility.yearOfStudyAllowed.join(', ')}
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
                  {data.eligibility?.statesEligible?.length > 0 && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        States: {data.eligibility.statesEligible.join(', ')}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.ageLimit && (data.eligibility.ageLimit.min !== null || data.eligibility.ageLimit.max !== null) && (
                    <View className="flex-row items-start">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        Age Limit: {data.eligibility.ageLimit.min ? `${data.eligibility.ageLimit.min} - ` : ''}{data.eligibility.ageLimit.max || 'No limit'}
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Selection Process */}
            {data.applicationDetails?.selectionProcess && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  Selection Process
                </Text>
                <Text className="text-gray-600 text-base leading-6 mb-6">
                  {data.applicationDetails.selectionProcess}
                </Text>
              </>
            )}

            {/* Who Can Apply */}
            {data.programDetails?.whoCanApply && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  Who Can Apply
                </Text>
                <Text className="text-gray-600 text-base leading-6 mb-6">
                  {data.programDetails.whoCanApply}
                </Text>
              </>
            )}

            {/* Terms & Conditions */}
            {data.programDetails?.terms && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  Terms & Conditions
                </Text>
                <Text className="text-gray-600 text-base leading-6 mb-6">
                  {data.programDetails.terms}
                </Text>
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

            {/* Metadata Info */}
            {(data.metadata?.source || data.metadata?.viewCount !== undefined || data.metadata?.saveCount !== undefined) && (
              <View className="bg-gray-100 rounded-2xl p-4 mb-6">
                {data.metadata?.source && (
                  <View className="flex-row items-center mb-2">
                    <Text className="text-gray-700 font-semibold flex-1">Source:</Text>
                    <Text className="text-gray-600">{data.metadata.source}</Text>
                  </View>
                )}
                {data.metadata?.viewCount !== undefined && (
                  <View className="flex-row items-center mb-2">
                    <Text className="text-gray-700 font-semibold flex-1">Views:</Text>
                    <Text className="text-gray-600">{data.metadata.viewCount}</Text>
                  </View>
                )}
                {data.metadata?.saveCount !== undefined && (
                  <View className="flex-row items-center">
                    <Text className="text-gray-700 font-semibold flex-1">Saves:</Text>
                    <Text className="text-gray-600">{data.metadata.saveCount}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Status Badge */}
            {data.status && (
              <View className="mb-6 flex-row items-center">
                <Text className="text-gray-700 font-semibold mr-3">Status:</Text>
                <View className={`px-3 py-1 rounded-full ${data.status === 'Active' ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <Text className={`font-semibold ${data.status === 'Active' ? 'text-green-700' : 'text-gray-700'}`}>
                    {data.status}
                  </Text>
                </View>
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