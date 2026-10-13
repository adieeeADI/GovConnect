import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal, Dimensions, BackHandler } from 'react-native';
import { ArrowLeft, MapPin, Clock, Wallet, Check, Gift, X, ZoomIn, ZoomOut } from 'lucide-react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { getDataDetailsEndpoint } from '../../../config/api.config';
import { useTranslation, translateValue } from '../../../utils/i18n';
import { goBackWithinApp } from '../../../utils/navigation';
import TranslatedText from '../../../components/TranslatedText';

// In-memory cache for fast instant detail loads
const detailsCache = new Map<string, any>();

export default function Individual() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, language } = useTranslation();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const id = params?.id;
    const category = params?.category || 'internships';

    if (!id) return;

    let isMounted = true;

    const idString = Array.isArray(id) ? id[0] : id;
    const categoryString = Array.isArray(category) ? category[0] : category;
    const cleanId = idString.replace(/^(internships|scholarships|schemes|training)_/, "");
    const cacheKey = `${cleanId}_${categoryString}_${language}`;
    const englishCacheKey = `${cleanId}_${categoryString}_en`;

    // 1. Check exact language cache first (0ms Instant Load)
    if (detailsCache.has(cacheKey)) {
      const cached = detailsCache.get(cacheKey);
      const englishCached = detailsCache.get(englishCacheKey);
      const isUntranslated = language !== 'en' && englishCached?.basicInfo?.title && cached?.basicInfo?.title === englishCached?.basicInfo?.title;
      if (!isUntranslated) {
        setData(cached);
        setLoading(false);
        setTranslating(false);
        return;
      }
    }

    // 2. Optimistic Instant Render: If we have English cache or existing data, show it immediately without blocking
    const fallbackData = detailsCache.get(englishCacheKey) || data;
    if (fallbackData) {
      setData(fallbackData);
      setLoading(false);
      if (language !== 'en') {
        setTranslating(true);
      }
    } else {
      setLoading(true);
      setTranslating(false);
    }

    // 3. Fetch translated/latest data in background
    const endpoint = getDataDetailsEndpoint(categoryString, cleanId, language);

    fetch(endpoint)
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (isMounted) {
          if (resData && Object.keys(resData).length > 0 && !resData.error) {
            detailsCache.set(cacheKey, resData);
            if (language === 'en') {
              detailsCache.set(englishCacheKey, resData);
            }
            setData(resData);
          }
          setLoading(false);
          setTranslating(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
          setTranslating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [params?.id, params?.category, language]);

  // Prevent back navigation
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          goBackWithinApp(router);
          return true;
        }
      );
      return () => backHandler.remove();
    }, [router])
  );

  return (
    <View className="flex-1 bg-white">
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text className="text-gray-500 text-sm mt-3">{t('translating_details')}</Text>
        </View>
      ) : !data ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-600 text-center text-base">
            {t('error_loading_details')}
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="bg-blue-900 rounded-b-3xl px-6 pt-12 pb-8 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={() => goBackWithinApp(router)}
                activeOpacity={0.7}
              >
                <ArrowLeft color="#ffffff" size={24} strokeWidth={2} />
              </TouchableOpacity>

              {translating && (
                <View className="bg-blue-800/80 rounded-full px-3 py-1 flex-row items-center">
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="text-white text-xs ml-1.5 font-medium">
                    ✨ {t('translating_details')}
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1">
                <TranslatedText
                  text={data.basicInfo?.title || t('opportunity')}
                  className="text-white text-3xl font-bold mb-2"
                />
                <TranslatedText
                  text={data.basicInfo?.providerName || t('provider')}
                  className="text-white text-base opacity-90"
                />
                {data.basicInfo?.department && (
                  <View className="flex-row items-center mt-1">
                    <Text className="text-white text-sm opacity-75">{t('department')}: </Text>
                    <TranslatedText
                      text={data.basicInfo.department}
                      className="text-white text-sm opacity-75"
                    />
                  </View>
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
                <TranslatedText
                  text={data.internshipDetails?.location?.[0] || data.basicInfo?.location || t('location')}
                  className="text-white text-sm ml-1"
                />
              </View>

              <View className="bg-white/20 rounded-full px-4 py-2 flex-row items-center">
                <Clock color="#ffffff" size={16} strokeWidth={2} />
                <TranslatedText
                  text={data.internshipDetails?.duration || data.trainingDetails?.duration || t('duration')}
                  className="text-white text-sm ml-1"
                />
              </View>

              <View className="bg-white/20 rounded-full px-4 py-2 flex-row items-center">
                <Wallet color="#ffffff" size={16} strokeWidth={2} />
                <TranslatedText
                  text={data.internshipDetails?.stipend || data.benefits?.scholarshipAmount || t('amount')}
                  className="text-white text-sm ml-1"
                />
              </View>
            </View>
          </View>

          <View className="px-6 pb-6">
            {/* Type & Mode Section */}
            {(data.type || data.internshipDetails?.mode || data.applicationDetails?.applicationMode) && (
              <View className="bg-gray-100 rounded-2xl p-4 mb-6">
                <Text className="text-black text-lg font-bold mb-3">
                  {t('opportunity_details')}
                </Text>
                {data.type && (
                  <View className="flex-row items-center mb-2">
                    <Text className="text-gray-700 font-semibold flex-1">{t('type')}:</Text>
                    <TranslatedText text={data.type} className="text-gray-600" />
                  </View>
                )}
                {data.internshipDetails?.mode && (
                  <View className="flex-row items-center mb-2">
                    <Text className="text-gray-700 font-semibold flex-1">{t('mode')}:</Text>
                    <TranslatedText text={data.internshipDetails.mode} className="text-gray-600" />
                  </View>
                )}
                {data.applicationDetails?.applicationMode && (
                  <View className="flex-row items-center mb-2">
                    <Text className="text-gray-700 font-semibold flex-1">{t('application_mode')}:</Text>
                    <TranslatedText text={data.applicationDetails.applicationMode} className="text-gray-600" />
                  </View>
                )}
                {data.internshipDetails?.numberOfSeats && (
                  <View className="flex-row items-center">
                    <Text className="text-gray-700 font-semibold flex-1">{t('available_seats')}:</Text>
                    <Text className="text-gray-600">{data.internshipDetails.numberOfSeats}</Text>
                  </View>
                )}
              </View>
            )}

            {/* About This Opportunity */}
            <Text className="text-black text-xl font-bold mb-3">
              {t('about_opportunity')}
            </Text>
            <TranslatedText
              text={data.programDetails?.about || data.basicInfo?.shortDescription || t('no_description')}
              className="text-gray-600 text-base leading-6 mb-6"
            />

            {/* SCHEME-SPECIFIC SECTIONS */}
            {data.type === 'Scheme' && (
              <>
                {/* Scheme Benefits */}
                {data.schemeDetails?.benefits && (
                  <>
                    <Text className="text-black text-xl font-bold mb-3">
                      {t('scheme_benefits')}
                    </Text>
                    <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                      {data.schemeDetails.financialDetails?.amount && (
                        <View className="mb-4 pb-4 border-b border-green-200">
                          <Text className="text-gray-700 font-semibold text-base">{t('amount')}:</Text>
                          <Text className="text-green-700 text-lg font-bold">{data.schemeDetails.financialDetails.amount}</Text>
                        </View>
                      )}
                      {data.schemeDetails.benefits.map((benefit: string, index: number) => (
                        <View key={index} className="flex-row items-start mb-3">
                          <Gift color="#10b981" size={18} strokeWidth={2} />
                          <TranslatedText text={benefit} className="text-gray-700 text-base ml-2 flex-1" />
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {/* Benefit Type */}
                {data.schemeDetails?.benefitType && (
                  <View className="bg-blue-50 rounded-2xl p-4 mb-6">
                    <Text className="text-gray-700 font-semibold mb-2">{t('benefit_type')}:</Text>
                    <TranslatedText text={data.schemeDetails.benefitType} className="text-gray-600 text-base" />
                  </View>
                )}

                {/* Eligibility for Schemes */}
                {data.eligibility && (
                  <>
                    <Text className="text-black text-xl font-bold mb-3">
                      {t('eligibility_requirements')}
                    </Text>
                    <View className="bg-purple-50 rounded-2xl p-4 mb-6">
                      {data.eligibility.minimumEducation && (
                        <View className="mb-3 pb-3 border-b border-purple-200">
                          <Text className="text-gray-700 font-semibold">{t('minimum_education')}:</Text>
                          <Text className="text-gray-600 text-base">{translateValue(data.eligibility.minimumEducation, t)}</Text>
                        </View>
                      )}

                      {data.eligibility.incomeCriteria && (
                        <View className="mb-3 pb-3 border-b border-purple-200">
                          <Text className="text-gray-700 font-semibold mb-2">{t('income_criteria')}:</Text>
                          {data.eligibility.incomeCriteria.minIncome !== null && (
                            <Text className="text-gray-600 text-base">{t('min')}: ₹{data.eligibility.incomeCriteria.minIncome.toLocaleString()}</Text>
                          )}
                          {data.eligibility.incomeCriteria.maxIncome !== null && (
                            <Text className="text-gray-600 text-base">{t('max')}: ₹{data.eligibility.incomeCriteria.maxIncome.toLocaleString()}</Text>
                          )}
                        </View>
                      )}

                      {data.eligibility.gender && (
                        <View className="mb-3 pb-3 border-b border-purple-200">
                          <Text className="text-gray-700 font-semibold">{t('gender')}:</Text>
                          <Text className="text-gray-600 text-base">{translateValue(data.eligibility.gender, t)}</Text>
                        </View>
                      )}

                      {data.eligibility.categoryEligible && data.eligibility.categoryEligible.length > 0 && (
                        <View className="mb-3 pb-3 border-b border-purple-200">
                          <Text className="text-gray-700 font-semibold mb-2">{t('category')}:</Text>
                          {data.eligibility.categoryEligible.map((cat: string, index: number) => (
                            <View key={index} className="flex-row items-center mb-1">
                              <Check color="#a855f7" size={16} strokeWidth={2} />
                              <Text className="text-gray-600 text-base ml-2">{translateValue(cat, t)}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {data.eligibility.statesEligible && data.eligibility.statesEligible.length > 0 && (
                        <View className="mb-3 pb-3 border-b border-purple-200">
                          <Text className="text-gray-700 font-semibold mb-2">{t('states_eligible')}:</Text>
                          <Text className="text-gray-600 text-base">{translateValue(data.eligibility.statesEligible, t)}</Text>
                        </View>
                      )}

                      {data.eligibility.occupation && data.eligibility.occupation.length > 0 && (
                        <View className="mb-3 pb-3 border-b border-purple-200">
                          <Text className="text-gray-700 font-semibold mb-2">{t('occupation')}:</Text>
                          {data.eligibility.occupation.map((occ: string, index: number) => (
                            <View key={index} className="flex-row items-center mb-1">
                              <Check color="#a855f7" size={16} strokeWidth={2} />
                              <Text className="text-gray-600 text-base ml-2">{translateValue(occ, t)}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {data.eligibility.ageLimit && (data.eligibility.ageLimit.min !== null || data.eligibility.ageLimit.max !== null) && (
                        <View className="mb-3">
                          <Text className="text-gray-700 font-semibold">{t('age_limit')}:</Text>
                          <Text className="text-gray-600 text-base">
                            {data.eligibility.ageLimit.min ? `${data.eligibility.ageLimit.min} - ` : ''}
                            {data.eligibility.ageLimit.max || t('no_limit')}
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
                      {t('special_criteria')}
                    </Text>
                    <View className="mb-6">
                      {data.eligibility.specialCriteria.map((criteria: string, index: number) => (
                        <View key={index} className="flex-row items-start mb-2">
                          <Check color="#f59e0b" size={20} strokeWidth={2} />
                          <TranslatedText text={criteria} className="text-gray-700 text-base ml-3 flex-1" />
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {/* Application Process */}
                {data.applicationProcess?.steps && data.applicationProcess.steps.length > 0 && (
                  <>
                    <Text className="text-black text-xl font-bold mb-3">
                      {t('application_process')}
                    </Text>
                    <View className="bg-indigo-50 rounded-2xl p-4 mb-6">
                      {data.applicationProcess.applicationMode && (
                        <View className="mb-4 pb-4 border-b border-indigo-200">
                          <Text className="text-gray-700 font-semibold">{t('mode')}:</Text>
                          <Text className="text-gray-600 text-base">{translateValue(data.applicationProcess.applicationMode, t)}</Text>
                        </View>
                      )}
                      <Text className="text-gray-700 font-semibold mb-3">{t('steps')}:</Text>
                      {data.applicationProcess.steps.map((step: string, index: number) => (
                        <View key={index} className="flex-row items-start mb-3">
                          <View className="bg-indigo-600 rounded-full w-7 h-7 items-center justify-center mr-3 mt-1">
                            <Text className="text-white font-bold text-sm">{index + 1}</Text>
                          </View>
                          <TranslatedText text={step} className="text-gray-700 text-base ml-2 flex-1" />
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {/* Documents Required for Schemes */}
                {data.documentsRequired && data.documentsRequired.length > 0 && (
                  <>
                    <Text className="text-black text-xl font-bold mb-3">
                      {t('required_documents')}
                    </Text>
                    <View className="mb-6">
                      {data.documentsRequired.map((doc: string, index: number) => (
                        <View key={index} className="flex-row items-start mb-2">
                          <Check color="#10b981" size={20} strokeWidth={2} />
                          <TranslatedText text={doc} className="text-gray-700 text-base ml-3 flex-1" />
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {/* Important Dates */}
                {data.importantDates && (data.importantDates.applicationStart || data.importantDates.applicationEnd) && (
                  <View className="mb-6 bg-orange-50 rounded-2xl p-4">
                    <Text className="text-black text-lg font-bold mb-3">{t('important_dates')}</Text>
                    {data.importantDates.applicationStart && (
                      <Text className="text-gray-700 text-sm mb-2 font-semibold">
                        {t('application_start')}: {data.importantDates.applicationStart}
                      </Text>
                    )}
                    {data.importantDates.applicationEnd && (
                      <Text className="text-gray-700 text-sm font-semibold">
                        {t('application_end')}: {data.importantDates.applicationEnd}
                      </Text>
                    )}
                  </View>
                )}

                {/* Exclusions */}
                {data.additionalInfo?.exclusions && (
                  <>
                    <Text className="text-black text-xl font-bold mb-3">
                      {t('exclusions_notes')}
                    </Text>
                    <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                      <TranslatedText text={data.additionalInfo.exclusions} className="text-gray-700 text-base leading-6" />
                    </View>
                  </>
                )}

                {/* Ministry & Source */}
                {(data.additionalInfo?.ministry || data.additionalInfo?.sourceUrl) && (
                  <View className="bg-gray-100 rounded-2xl p-4 mb-6">
                    {data.additionalInfo.ministry && (
                      <View className="mb-3">
                        <Text className="text-gray-700 font-semibold">{t('ministry_dept')}:</Text>
                        <TranslatedText text={data.additionalInfo.ministry} className="text-gray-600 text-base" />
                      </View>
                    )}
                    {data.additionalInfo.sourceUrl && (
                      <View>
                        <Text className="text-gray-700 font-semibold">{t('source')}:</Text>
                        <Text className="text-blue-600 text-base">{data.additionalInfo.sourceUrl}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* FAQ Section for Schemes */}
                {data.faq?.questionsAndAnswers && data.faq.questionsAndAnswers.length > 0 && (
                  <>
                    <Text className="text-black text-xl font-bold mb-3">
                      {t('faq')}
                    </Text>
                    <View className="mb-6 bg-blue-50 rounded-2xl overflow-hidden">
                      {data.faq.questionsAndAnswers.map((item: any, index: number) => (
                        <View
                          key={index}
                          className={`border-b border-blue-200 ${index === data.faq.questionsAndAnswers.length - 1 ? 'border-b-0' : ''}`}
                        >
                          <View className="p-4">
                            <TranslatedText
                              text={item.question}
                              prefix={`${t('q_prefix')}: `}
                              className="text-gray-900 font-semibold text-base mb-2"
                            />
                            <TranslatedText
                              text={item.answer}
                              prefix={`${t('a_prefix')}: `}
                              className="text-gray-600 text-base leading-6"
                            />
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
                  {t('scholarship_benefits')}
                </Text>
                <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                  {data.benefits.scholarshipAmount && (
                    <View className="mb-3">
                      <Text className="text-gray-700 font-semibold">{t('amount')}:</Text>
                      <TranslatedText text={data.benefits.scholarshipAmount} className="text-gray-600 text-base" />
                    </View>
                  )}
                  {data.benefits.covers && data.benefits.covers.length > 0 && (
                    <View>
                      <Text className="text-gray-700 font-semibold mb-2">{t('covers')}:</Text>
                      {data.benefits.covers.map((cover: string, index: number) => (
                        <View key={index} className="flex-row items-start mb-2">
                          <Check color="#10b981" size={16} strokeWidth={2} />
                          <TranslatedText text={cover} className="text-gray-600 text-base ml-2 flex-1" />
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </>
            )}

            {/* TRAINING-SPECIFIC SECTIONS */}
            {(data.type === 'Training' || data.trainingDetails) && (
              <>
                {data.trainingDetails?.certificate && (
                  <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                    <Text className="text-gray-700 font-semibold mb-1">
                      {t('certificate') || 'Certificate'}:
                    </Text>
                    <TranslatedText text={data.trainingDetails.certificate} className="text-blue-900 text-base font-bold" />
                  </View>
                )}
                {data.programDetails?.curriculum && (
                  <>
                    <Text className="text-black text-xl font-bold mb-3">
                      {t('curriculum') || 'Curriculum / Syllabus'}
                    </Text>
                    <TranslatedText
                      text={data.programDetails.curriculum}
                      className="text-gray-600 text-base leading-6 mb-6"
                    />
                  </>
                )}
              </>
            )}

            {/* Key Highlights */}
            {data.programDetails?.perks && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  {t('key_highlights')}
                </Text>
                <TranslatedText
                  text={data.programDetails.perks}
                  className="text-gray-600 text-base leading-6 mb-6"
                />
              </>
            )}

            {/* Eligibility */}
            {(data.eligibility?.educationLevels || data.eligibility?.streamsAllowed || data.eligibility?.yearOfStudyAllowed || data.eligibility?.minimumCGPA || data.eligibility?.minimumPercentage || data.eligibility?.categoryEligible || data.eligibility?.genderEligible || data.eligibility?.incomeLimit || data.eligibility?.statesEligible || data.eligibility?.ageLimit || data.eligibility?.isPwDEligible || data.eligibility?.isMinorityEligible) && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  {t('eligibility_requirements')}
                </Text>
                <View className="mb-6">
                  {data.eligibility?.educationLevels?.length > 0 && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        {t('education')}: {translateValue(data.eligibility.educationLevels, t)}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.streamsAllowed?.length > 0 && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        {t('streams')}: {translateValue(data.eligibility.streamsAllowed, t)}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.yearOfStudyAllowed?.length > 0 && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        {t('year_of_study')}: {translateValue(data.eligibility.yearOfStudyAllowed, t)}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.minimumCGPA && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        {t('min_cgpa')}: {data.eligibility.minimumCGPA}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.minimumPercentage && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        {t('min_percentage')}: {data.eligibility.minimumPercentage}%
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.categoryEligible && data.eligibility.categoryEligible.length > 0 && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        {t('category')}: {translateValue(data.eligibility.categoryEligible, t)}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.genderEligible && data.eligibility.genderEligible.length > 0 && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        {t('gender')}: {translateValue(data.eligibility.genderEligible, t)}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.incomeLimit !== null && data.eligibility?.incomeLimit !== undefined && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        {t('income_limit')}: ₹{data.eligibility.incomeLimit}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.statesEligible?.length > 0 && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        {t('states_eligible')}: {translateValue(data.eligibility.statesEligible, t)}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.ageLimit && (data.eligibility.ageLimit.min !== null || data.eligibility.ageLimit.max !== null) && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        {t('age_limit')}: {data.eligibility.ageLimit.min ? `${data.eligibility.ageLimit.min} - ` : ''}{data.eligibility.ageLimit.max || t('no_limit')}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.isPwDEligible && (
                    <View className="flex-row items-start mb-3">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        {t('pwd_eligible')}: {t('yes')}
                      </Text>
                    </View>
                  )}
                  {data.eligibility?.isMinorityEligible && (
                    <View className="flex-row items-start">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <Text className="text-gray-700 text-base ml-3 flex-1">
                        {t('minority_eligible')}: {t('yes')}
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
                  {t('selection_process')}
                </Text>
                <TranslatedText
                  text={data.applicationDetails?.selectionProcess || data.additionalInfo?.selectionProcess}
                  className="text-gray-600 text-base leading-6 mb-6"
                />
              </>
            )}

            {/* Application Documents */}
            {data.applicationDetails?.documentsRequired && data.applicationDetails.documentsRequired.length > 0 && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  {t('required_documents')}
                </Text>
                <View className="mb-6">
                  {data.applicationDetails.documentsRequired.map((doc: string, index: number) => (
                    <View key={index} className="flex-row items-start mb-2">
                      <Check color="#10b981" size={20} strokeWidth={2} />
                      <TranslatedText text={doc} className="text-gray-700 text-base ml-3 flex-1" />
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Renewal Policy */}
            {data.additionalInfo?.renewalPolicy && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  {t('renewal_policy')}
                </Text>
                <TranslatedText
                  text={data.additionalInfo.renewalPolicy}
                  className="text-gray-600 text-base leading-6 mb-6"
                />
              </>
            )}

            {/* Who Can Apply */}
            {data.programDetails?.whoCanApply && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  {t('who_can_apply')}
                </Text>
                <TranslatedText
                  text={data.programDetails.whoCanApply}
                  className="text-gray-600 text-base leading-6 mb-6"
                />
              </>
            )}

            {/* Terms & Conditions */}
            {data.programDetails?.terms && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  {t('terms_conditions')}
                </Text>
                <TranslatedText
                  text={data.programDetails.terms}
                  className="text-gray-600 text-base leading-6 mb-6"
                />
              </>
            )}

            {/* FAQ Section */}
            {data.faq?.questionsAndAnswers && data.faq.questionsAndAnswers.length > 0 && (
              <>
                <Text className="text-black text-xl font-bold mb-3">
                  {t('faq')}
                </Text>
                <View className="mb-6 bg-blue-50 rounded-2xl overflow-hidden">
                  {data.faq.questionsAndAnswers.map((item: any, index: number) => (
                    <View
                      key={index}
                      className={`border-b border-blue-200 ${index === data.faq.questionsAndAnswers.length - 1 ? 'border-b-0' : ''}`}
                    >
                      <View className="p-4">
                        <TranslatedText
                          text={item.question}
                          prefix={`${t('q_prefix')}: `}
                          className="text-gray-900 font-semibold text-base mb-2"
                        />
                        <TranslatedText
                          text={item.answer}
                          prefix={`${t('a_prefix')}: `}
                          className="text-gray-600 text-base leading-6"
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Application Info */}
            {(data.applicationDetails?.startDate || data.applicationDetails?.endDate) && (
              <View className="mb-6 bg-orange-50 rounded-2xl p-4">
                <Text className="text-black text-lg font-bold mb-3">{t('application_timeline')}</Text>
                {data.applicationDetails?.startDate && (
                  <Text className="text-gray-700 text-sm mb-2 font-semibold">
                    {t('start_date')}: {new Date(data.applicationDetails.startDate).toLocaleDateString('en-IN')}
                  </Text>
                )}
                {data.applicationDetails?.endDate && (
                  <Text className="text-gray-700 text-sm font-semibold">
                    {t('end_date')}: {new Date(data.applicationDetails.endDate).toLocaleDateString('en-IN')}
                  </Text>
                )}
              </View>
            )}

            {/* Metadata Info */}
            {(data.metadata?.source || data.metadata?.viewCount !== undefined || data.metadata?.saveCount !== undefined) && (
              <View className="bg-gray-100 rounded-2xl p-4 mb-6">
                {data.metadata?.source && (
                  <View className="flex-row items-center mb-2">
                    <Text className="text-gray-700 font-semibold flex-1">{t('source')}:</Text>
                    <Text className="text-gray-600">{data.metadata.source}</Text>
                  </View>
                )}
                {data.metadata?.viewCount !== undefined && (
                  <View className="flex-row items-center mb-2">
                    <Text className="text-gray-700 font-semibold flex-1">{t('views')}:</Text>
                    <Text className="text-gray-600">{data.metadata.viewCount}</Text>
                  </View>
                )}
                {data.metadata?.saveCount !== undefined && (
                  <View className="flex-row items-center">
                    <Text className="text-gray-700 font-semibold flex-1">{t('saves')}:</Text>
                    <Text className="text-gray-600">{data.metadata.saveCount}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Status Badge */}
            {data.status && (
              <View className="mb-6 flex-row items-center">
                <Text className="text-gray-700 font-semibold mr-3">{t('status')}:</Text>
                <View className={`px-3 py-1 rounded-full ${data.status === 'Active' ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <Text className={`font-semibold ${data.status === 'Active' ? 'text-green-700' : 'text-gray-700'}`}>
                    {translateValue(data.status, t)}
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            {data.basicInfo?.applicationLink && (
              <TouchableOpacity
                className="bg-white border-2 border-blue-900 rounded-2xl py-4 items-center mb-8"
                activeOpacity={0.8}
              >
                <Text className="text-blue-900 text-lg font-semibold">
                  {t('official_portal')}
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