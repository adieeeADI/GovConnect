import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal, Dimensions, BackHandler } from 'react-native';
import { ArrowLeft, MapPin, Clock, Wallet, Check, Gift, X, ZoomIn, ZoomOut } from 'lucide-react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';

export default function Individual() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const id = params?.id;
    const category = params?.category || 'internships';
    
    if (id) {
      const idString = Array.isArray(id) ? id[0] : id;
      const categoryString = Array.isArray(category) ? category[0] : category;
      fetchDetailedData(idString, categoryString);
    }
  }, [params?.id, params?.category]);

  // Prevent back navigation
  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          router.replace('/main/browse');
          return true;
        }
      );
      return () => backHandler.remove();
    }, [])
  );

  const fetchDetailedData = async (id: string, category: string) => {
    try {
      setLoading(true);
      
      // Fetch from the specific category endpoint
      const { getDataDetailsEndpoint } = require('../../../config/api.config');
      const endpoint = getDataDetailsEndpoint(category, id);
      
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0 && !data.error) {
          setData(data);
        }
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
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
          <View className="bg-blue-900 rounded-b-3xl px-6 pt-12 pb-8 mb-6">
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
                <TouchableOpacity 
                  className="w-16 h-16 bg-white rounded-lg ml-2 overflow-hidden"
                  onPress={() => setImageModalVisible(true)}
                >
                  <Image
                    source={{ uri: data.basicInfo.logo }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
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
            {(data.type || data.internshipDetails?.mode || data.applicationDetails?.applicationMode) && (
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
                {data.applicationDetails?.applicationMode && (
                  <View className="flex-row items-center mb-2">
                    <Text className="text-gray-700 font-semibold flex-1">Application Mode:</Text>
                    <Text className="text-gray-600">{data.applicationDetails.applicationMode}</Text>
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

            {/* SCHEME-SPECIFIC SECTIONS */}
            {data.type === 'Scheme' && (
              <>
                {/* Scheme Benefits */}
                {data.schemeDetails?.benefits && (
                  <>
                    <Text className="text-black text-xl font-bold mb-3">
                      Scheme Benefits
                    </Text>
                    <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                      {data.schemeDetails.financialDetails?.amount && (
                        <View className="mb-4 pb-4 border-b border-green-200">
                          <Text className="text-gray-700 font-semibold text-base">Amount:</Text>
                          <Text className="text-green-700 text-lg font-bold">{data.schemeDetails.financialDetails.amount}</Text>
                        </View>
                      )}
                      {data.schemeDetails.benefits.map((benefit: string, index: number) => (
                        <View key={index} className="flex-row items-start mb-3">
                          <Gift color="#10b981" size={18} strokeWidth={2} />
                          <Text className="text-gray-700 text-base ml-2 flex-1">{benefit}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {/* Benefit Type */}
                {data.schemeDetails?.benefitType && (
                  <View className="bg-blue-50 rounded-2xl p-4 mb-6">
                    <Text className="text-gray-700 font-semibold mb-2">Benefit Type:</Text>
                    <Text className="text-gray-600 text-base">{data.schemeDetails.benefitType}</Text>
                  </View>
                )}

                {/* Eligibility for Schemes */}
                {data.eligibility && (
                  <>
                    <Text className="text-black text-xl font-bold mb-3">
                      Eligibility Requirements
                    </Text>
                    <View className="bg-purple-50 rounded-2xl p-4 mb-6">
                      {data.eligibility.minimumEducation && (
                        <View className="mb-3 pb-3 border-b border-purple-200">
                          <Text className="text-gray-700 font-semibold">Minimum Education:</Text>
                          <Text className="text-gray-600 text-base">{data.eligibility.minimumEducation}</Text>
                        </View>
                      )}

                      {data.eligibility.incomeCriteria && (
                        <View className="mb-3 pb-3 border-b border-purple-200">
                          <Text className="text-gray-700 font-semibold mb-2">Income Criteria:</Text>
                          {data.eligibility.incomeCriteria.minIncome !== null && (
                            <Text className="text-gray-600 text-base">Min: ₹{data.eligibility.incomeCriteria.minIncome.toLocaleString()}</Text>
                          )}
                          {data.eligibility.incomeCriteria.maxIncome !== null && (
                            <Text className="text-gray-600 text-base">Max: ₹{data.eligibility.incomeCriteria.maxIncome.toLocaleString()}</Text>
                          )}
                        </View>
                      )}

                      {data.eligibility.gender && (
                        <View className="mb-3 pb-3 border-b border-purple-200">
                          <Text className="text-gray-700 font-semibold">Gender:</Text>
                          <Text className="text-gray-600 text-base">{data.eligibility.gender}</Text>
                        </View>
                      )}

                      {data.eligibility.categoryEligible && data.eligibility.categoryEligible.length > 0 && (
                        <View className="mb-3 pb-3 border-b border-purple-200">
                          <Text className="text-gray-700 font-semibold mb-2">Categories:</Text>
                          {data.eligibility.categoryEligible.map((cat: string, index: number) => (
                            <View key={index} className="flex-row items-center mb-1">
                              <Check color="#a855f7" size={16} strokeWidth={2} />
                              <Text className="text-gray-600 text-base ml-2">{cat}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {data.eligibility.statesEligible && data.eligibility.statesEligible.length > 0 && (
                        <View className="mb-3 pb-3 border-b border-purple-200">
                          <Text className="text-gray-700 font-semibold mb-2">States Eligible:</Text>
                          <Text className="text-gray-600 text-base">{data.eligibility.statesEligible.join(', ')}</Text>
                        </View>
                      )}

                      {data.eligibility.occupation && data.eligibility.occupation.length > 0 && (
                        <View className="mb-3 pb-3 border-b border-purple-200">
                          <Text className="text-gray-700 font-semibold mb-2">Occupation:</Text>
                          {data.eligibility.occupation.map((occ: string, index: number) => (
                            <View key={index} className="flex-row items-center mb-1">
                              <Check color="#a855f7" size={16} strokeWidth={2} />
                              <Text className="text-gray-600 text-base ml-2">{occ}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {data.eligibility.ageLimit && (data.eligibility.ageLimit.min !== null || data.eligibility.ageLimit.max !== null) && (
                        <View className="mb-3">
                          <Text className="text-gray-700 font-semibold">Age Limit:</Text>
                          <Text className="text-gray-600 text-base">
                            {data.eligibility.ageLimit.min ? `${data.eligibility.ageLimit.min} - ` : ''}
                            {data.eligibility.ageLimit.max || 'No limit'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </>
                )}

                {/* Special Criteria */}
                {data.eligibility?.specialCriteria && data.eligibility.specialCriteria.length > 0 && (
                  <>
                    <Text className="text-black text-xl font-bold mb-3">
                      Special Criteria
                    </Text>
                    <View className="mb-6">
                      {data.eligibility.specialCriteria.map((criteria: string, index: number) => (
                        <View key={index} className="flex-row items-start mb-2">
                          <Check color="#f59e0b" size={20} strokeWidth={2} />
                          <Text className="text-gray-700 text-base ml-3 flex-1">{criteria}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {/* Application Process */}
                {data.applicationProcess?.steps && data.applicationProcess.steps.length > 0 && (
                  <>
                    <Text className="text-black text-xl font-bold mb-3">
                      Application Process
                    </Text>
                    <View className="bg-indigo-50 rounded-2xl p-4 mb-6">
                      {data.applicationProcess.applicationMode && (
                        <View className="mb-4 pb-4 border-b border-indigo-200">
                          <Text className="text-gray-700 font-semibold">Mode:</Text>
                          <Text className="text-gray-600 text-base">{data.applicationProcess.applicationMode}</Text>
                        </View>
                      )}
                      <Text className="text-gray-700 font-semibold mb-3">Steps:</Text>
                      {data.applicationProcess.steps.map((step: string, index: number) => (
                        <View key={index} className="flex-row items-start mb-3">
                          <View className="bg-indigo-600 rounded-full w-7 h-7 items-center justify-center mr-3 mt-1">
                            <Text className="text-white font-bold text-sm">{index + 1}</Text>
                          </View>
                          <Text className="text-gray-700 text-base ml-2 flex-1">{step}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {/* Documents Required for Schemes */}
                {data.documentsRequired && data.documentsRequired.length > 0 && (
                  <>
                    <Text className="text-black text-xl font-bold mb-3">
                      Documents Required
                    </Text>
                    <View className="mb-6">
                      {data.documentsRequired.map((doc: string, index: number) => (
                        <View key={index} className="flex-row items-start mb-2">
                          <Check color="#10b981" size={20} strokeWidth={2} />
                          <Text className="text-gray-700 text-base ml-3 flex-1">{doc}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {/* Important Dates */}
                {data.importantDates && (data.importantDates.applicationStart || data.importantDates.applicationEnd) && (
                  <View className="mb-6 bg-orange-50 rounded-2xl p-4">
                    <Text className="text-black text-lg font-bold mb-3">Important Dates</Text>
                    {data.importantDates.applicationStart && (
                      <Text className="text-gray-700 text-sm mb-2 font-semibold">
                        Application Start: {data.importantDates.applicationStart}
                      </Text>
                    )}
                    {data.importantDates.applicationEnd && (
                      <Text className="text-gray-700 text-sm font-semibold">
                        Application End: {data.importantDates.applicationEnd}
                      </Text>
                    )}
                  </View>
                )}

                {/* Exclusions */}
                {data.additionalInfo?.exclusions && (
                  <>
                    <Text className="text-black text-xl font-bold mb-3">
                      Exclusions & Important Notes
                    </Text>
                    <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                      <Text className="text-gray-700 text-base leading-6">{data.additionalInfo.exclusions}</Text>
                    </View>
                  </>
                )}

                {/* Ministry & Source */}
                {(data.additionalInfo?.ministry || data.additionalInfo?.sourceUrl) && (
                  <View className="bg-gray-100 rounded-2xl p-4 mb-6">
                    {data.additionalInfo.ministry && (
                      <View className="mb-3">
                        <Text className="text-gray-700 font-semibold">Ministry/Department:</Text>
                        <Text className="text-gray-600 text-base">{data.additionalInfo.ministry}</Text>
                      </View>
                    )}
                    {data.additionalInfo.sourceUrl && (
                      <View>
                        <Text className="text-gray-700 font-semibold">Source:</Text>
                        <Text className="text-blue-600 text-base">{data.additionalInfo.sourceUrl}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* FAQ Section for Schemes */}
                {data.faq?.questionsAndAnswers && data.faq.questionsAndAnswers.length > 0 && (
                  <>
                    <Text className="text-black text-xl font-bold mb-3">
                      Frequently Asked Questions
                    </Text>
                    <View className="mb-6 bg-blue-50 rounded-2xl overflow-hidden">
                      {data.faq.questionsAndAnswers.map((item: any, index: number) => (
                        <View 
                          key={index} 
                          className={`border-b border-blue-200 ${index === data.faq.questionsAndAnswers.length - 1 ? 'border-b-0' : ''}`}
                        >
                          <View className="p-4">
                            <Text className="text-gray-900 font-semibold text-base mb-2">
                              Q: {item.question}
                            </Text>
                            <Text className="text-gray-600 text-base leading-6">
                              A: {item.answer}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </>
            )}

            {/* SCHOLARSHIP-SPECIFIC SECTIONS */}
            {data.type === 'Scholarship' && data.benefits && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  Scholarship Benefits
                </Text>
                <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                  {data.benefits.scholarshipAmount && (
                    <View className="mb-3">
                      <Text className="text-gray-700 font-semibold">Amount:</Text>
                      <Text className="text-gray-600 text-base">{data.benefits.scholarshipAmount}</Text>
                    </View>
                  )}
                  {data.benefits.covers && data.benefits.covers.length > 0 && (
                    <View>
                      <Text className="text-gray-700 font-semibold mb-2">Covers:</Text>
                      {data.benefits.covers.map((cover: string, index: number) => (
                        <View key={index} className="flex-row items-start mb-2">
                          <Check color="#10b981" size={16} strokeWidth={2} />
                          <Text className="text-gray-600 text-base ml-2 flex-1">{cover}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </>
            )}

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
            {(data.eligibility?.educationLevels || data.eligibility?.streamsAllowed || data.eligibility?.yearOfStudyAllowed || data.eligibility?.minimumCGPA || data.eligibility?.minimumPercentage || data.eligibility?.categoryEligible || data.eligibility?.genderEligible || data.eligibility?.incomeLimit || data.eligibility?.statesEligible || data.eligibility?.ageLimit || data.eligibility?.isPwDEligible || data.eligibility?.isMinorityEligible) && (
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
                  {data.eligibility?.minimumPercentage && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        Minimum Percentage: {data.eligibility.minimumPercentage}%
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.categoryEligible && data.eligibility.categoryEligible.length > 0 && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        Categories: {data.eligibility.categoryEligible.join(', ')}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.genderEligible && data.eligibility.genderEligible.length > 0 && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        Gender: {data.eligibility.genderEligible.join(', ')}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.incomeLimit !== null && data.eligibility?.incomeLimit !== undefined && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        Income Limit: ₹{data.eligibility.incomeLimit}
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
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        Age Limit: {data.eligibility.ageLimit.min ? `${data.eligibility.ageLimit.min} - ` : ''}{data.eligibility.ageLimit.max || 'No limit'}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.isPwDEligible && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        PwD Eligible: Yes
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.isMinorityEligible && (
                    <View className="flex-row items-start">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        Minority Eligible: Yes
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Selection Process */}
            {(data.applicationDetails?.selectionProcess || data.additionalInfo?.selectionProcess) && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  Selection Process
                </Text>
                <Text className="text-gray-600 text-base leading-6 mb-6">
                  {data.applicationDetails?.selectionProcess || data.additionalInfo?.selectionProcess}
                </Text>
              </>
            )}

            {/* Application Documents */}
            {data.applicationDetails?.documentsRequired && data.applicationDetails.documentsRequired.length > 0 && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  Required Documents
                </Text>
                <View className="mb-6">
                  {data.applicationDetails.documentsRequired.map((doc: string, index: number) => (
                    <View key={index} className="flex-row items-start mb-2">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">{doc}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Renewal Policy */}
            {data.additionalInfo?.renewalPolicy && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  Renewal Policy
                </Text>
                <Text className="text-gray-600 text-base leading-6 mb-6">
                  {data.additionalInfo.renewalPolicy}
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

            {/* FAQ Section */}
            {data.faq?.questionsAndAnswers && data.faq.questionsAndAnswers.length > 0 && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  Frequently Asked Questions
                </Text>
                <View className="mb-6 bg-blue-50 rounded-2xl overflow-hidden">
                  {data.faq.questionsAndAnswers.map((item: any, index: number) => (
                    <View 
                      key={index} 
                      className={`border-b border-blue-200 ${index === data.faq.questionsAndAnswers.length - 1 ? 'border-b-0' : ''}`}
                    >
                      <View className="p-4">
                        <Text className="text-gray-900 font-semibold text-base mb-2">
                          Q: {item.question}
                        </Text>
                        <Text className="text-gray-600 text-base leading-6">
                          A: {item.answer}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Application Info */}
            {(data.applicationDetails?.startDate || data.applicationDetails?.endDate) && (
              <View className="mb-6 bg-orange-50 rounded-2xl p-4">
                <Text className="text-black text-lg font-bold mb-3">Application Timeline</Text>
                {data.applicationDetails?.startDate && (
                  <Text className="text-gray-700 text-sm mb-2 font-semibold">
                    Start Date: {new Date(data.applicationDetails.startDate).toLocaleDateString('en-IN')}
                  </Text>
                )}
                {data.applicationDetails?.endDate && (
                  <Text className="text-gray-700 text-sm font-semibold">
                    End Date: {new Date(data.applicationDetails.endDate).toLocaleDateString('en-IN')}
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

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 bg-black/90 justify-center items-center">
          {/* Close Button */}
          <TouchableOpacity 
            className="absolute top-12 right-6 z-10"
            onPress={() => {
              setImageModalVisible(false);
              setImageZoom(1);
            }}
          >
            <X color="#ffffff" size={28} strokeWidth={2} />
          </TouchableOpacity>

          {/* Image Viewer */}
          <View className="flex-1 justify-center items-center px-4">
            {data?.basicInfo?.logo && (
              <Image
                source={{ uri: data.basicInfo.logo }}
                style={{
                  width: screenWidth - 32,
                  height: screenWidth - 32,
                  transform: [{ scale: imageZoom }],
                }}
                resizeMode="contain"
              />
            )}
          </View>

          {/* Zoom Controls */}
          <View className="flex-row justify-center gap-6 pb-12">
            <TouchableOpacity 
              className="bg-white/20 rounded-full p-4"
              onPress={() => setImageZoom(Math.max(1, imageZoom - 0.2))}
              disabled={imageZoom <= 1}
            >
              <ZoomOut color="#ffffff" size={24} strokeWidth={2} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-white/20 rounded-full p-4"
              onPress={() => setImageZoom(Math.min(3, imageZoom + 0.2))}
              disabled={imageZoom >= 3}
            >
              <ZoomIn color="#ffffff" size={24} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}