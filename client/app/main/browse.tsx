import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  BackHandler,
  Modal,
  Platform,
  Dimensions,
  StyleSheet,
} from 'react-native';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ArrowRight,
  SlidersHorizontal,
  Check,
  X,
  Search,
  Globe,
  Building2,
  GraduationCap,
  ChevronDown,
  RotateCcw,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDataCategoryEndpoint } from '../../config/api.config';
import BottomNav from './bottom';
import { useTranslation } from '../../utils/i18n';
import { goBackWithinApp } from '../../utils/navigation';
import TranslatedText from '../../components/TranslatedText';

type Category = 'all' | 'internships' | 'scholarships' | 'schemes' | 'training';

type ModeFilter = 'All' | 'Online' | 'Offline';
type EducationFilter = 'All' | '10th' | '12th' | 'Diploma' | 'UG' | 'PG';

interface FilterState {
  mode: ModeFilter;
  education: EducationFilter;
  state: string;
  stipendOnly: boolean;
}

const POPULAR_STATES = [
  'All India',
  'Maharashtra',
  'Delhi',
  'Uttar Pradesh',
  'Karnataka',
  'Tamil Nadu',
  'Telangana',
  'Gujarat',
  'West Bengal',
  'Rajasthan',
  'Kerala',
  'Madhya Pradesh',
  'Bihar',
  'Andhra Pradesh',
  'Punjab',
];

const ALL_INDIAN_STATES = [
  'All India',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const STATE_CITY_MAP: Record<string, string[]> = {
  'Maharashtra': ['nashik', 'mumbai', 'pune', 'nagpur', 'aurangabad', 'thane', 'navi mumbai'],
  'Karnataka': ['bangalore', 'bengaluru', 'mysore', 'hubli', 'mangalore'],
  'Telangana': ['hyderabad', 'secunderabad', 'warangal'],
  'Andhra Pradesh': ['guntur', 'visakapatanam', 'visakhapatnam', 'vijayawada', 'tirupati'],
  'Delhi': ['delhi', 'new delhi', 'ncr'],
  'Uttar Pradesh': ['lucknow', 'kanpur', 'noida', 'varanasi', 'agra', 'ghaziabad', 'prayagraj'],
  'Tamil Nadu': ['chennai', 'coimbatore', 'madurai', 'trichy', 'salem'],
  'Gujarat': ['ahmedabad', 'surat', 'vadodara', 'gandhinagar', 'rajkot'],
  'West Bengal': ['kolkata', 'howrah', 'durgapur', 'siliguri'],
  'Rajasthan': ['jaipur', 'jodhpur', 'udaipur', 'kota'],
  'Kerala': ['kochi', 'thiruvananthapuram', 'kozhikode'],
  'Madhya Pradesh': ['bhopal', 'indore', 'gwalior', 'jabalpur'],
  'Punjab': ['chandigarh', 'ludhiana', 'amritsar', 'jalandhar'],
  'Haryana': ['gurugram', 'gurgaon', 'faridabad', 'panipat'],
  'Bihar': ['patna', 'gaya', 'muzaffarpur'],
  'Odisha': ['bhubaneswar', 'cuttack'],
  'Assam': ['guwahati', 'silchar'],
  'Manipur': ['imphal'],
  'Nagaland': ['kohima', 'dimapur'],
  'Jammu & Kashmir': ['srinagar', 'jammu'],
  'Uttarakhand': ['dehradun', 'haridwar'],
  'Goa': ['panaji', 'margao', 'goa'],
  'Jharkhand': ['ranchi', 'jamshedpur', 'dhanbad'],
  'Chhattisgarh': ['raipur', 'bilaspur'],
  'Himachal Pradesh': ['shimla', 'dharamshala'],
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type ModalTab = 'all' | 'education' | 'state' | 'mode';

const EDUCATION_OPTIONS: { id: EducationFilter; label: string; short: string; desc: string }[] = [
  { id: 'All', label: 'All Education', short: 'All Edu', desc: 'All qualifications eligible' },
  { id: '10th', label: '10th Pass / Secondary', short: '10th Pass', desc: 'Class 9-10 pass, Matriculation, Secondary' },
  { id: '12th', label: '12th Pass / Higher Secondary', short: '12th Pass', desc: 'Class 11-12 pass, Intermediate, HSC' },
  { id: 'Diploma', label: 'Diploma / ITI / Polytechnic', short: 'Diploma / ITI', desc: 'Polytechnic, ITI certification, Diploma' },
  { id: 'UG', label: 'Undergraduate / Degree (UG)', short: 'UG / Degree', desc: 'B.Tech, B.Sc, B.Com, B.A, MBBS, Degree' },
  { id: 'PG', label: 'Postgraduate / Master\'s (PG)', short: 'PG / Masters', desc: 'M.Tech, M.Sc, MBA, Ph.D, Post-graduate' },
];

export default function Browse() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, language } = useTranslation();

  const [activeCategory, setActiveCategory] = useState<Category>(
    (params.category as Category) || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [filters, setFilters] = useState<FilterState>({
    mode: (params.mode as ModeFilter) || 'All',
    education: (params.education as EducationFilter) || 'All',
    state: (params.state as string) || 'All',
    stipendOnly: false,
  });

  // Modal State
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<ModalTab>('all');
  const [tempFilters, setTempFilters] = useState<FilterState>({ ...filters });
  const [stateSearch, setStateSearch] = useState('');
  const [showAllStates, setShowAllStates] = useState(false);

  // Sync category when navigating from external routes (e.g., Home page category buttons)
  const lastParamsCategoryRef = useRef(params.category);
  useEffect(() => {
    if (params.category && params.category !== lastParamsCategoryRef.current) {
      lastParamsCategoryRef.current = params.category;
      setActiveCategory(params.category as Category);
    }
  }, [params.category]);

  const getCategoryTitle = (cat: Category) => {
    switch (cat) {
      case 'all': return t('all_opportunities') || 'All Opportunities';
      case 'internships': return t('internships');
      case 'scholarships': return t('scholarships');
      case 'schemes': return t('schemes');
      case 'training': return t('training');
      default: return t('all_opportunities') || 'All Opportunities';
    }
  };

  // Fetch opportunities whenever category or language changes
  useEffect(() => {
    let isMounted = true;

    if (activeCategory === 'all') {
      Promise.all([
        fetch(getDataCategoryEndpoint('internships', language)).then((r) => r.json()).catch(() => []),
        fetch(getDataCategoryEndpoint('scholarships', language)).then((r) => r.json()).catch(() => []),
        fetch(getDataCategoryEndpoint('schemes', language)).then((r) => r.json()).catch(() => []),
        fetch(getDataCategoryEndpoint('training', language)).then((r) => r.json()).catch(() => []),
      ])
        .then(([ints, schs, scs, trs]) => {
          if (isMounted) {
            const taggedInts = Array.isArray(ints)
              ? ints.map((i) => ({ ...i, itemCategory: 'internships' }))
              : [];
            const taggedSchs = Array.isArray(schs)
              ? schs.map((s) => ({ ...s, itemCategory: 'scholarships' }))
              : [];
            const taggedScs = Array.isArray(scs)
              ? scs.map((s) => ({ ...s, itemCategory: 'schemes' }))
              : [];
            const taggedTrs = Array.isArray(trs)
              ? trs.map((t) => ({ ...t, itemCategory: 'training' }))
              : [];

            setData([...taggedInts, ...taggedSchs, ...taggedScs, ...taggedTrs]);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setData([]);
            setLoading(false);
          }
        });
    } else {
      fetch(getDataCategoryEndpoint(activeCategory, language))
        .then((res) => res.json())
        .then((json) => {
          if (isMounted) {
            const list = Array.isArray(json)
              ? json.map((item) => ({ ...item, itemCategory: activeCategory }))
              : [];
            setData(list);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setData([]);
            setLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [activeCategory, language]);

  // Standard BackHandler effect - completely avoids useFocusEffect navigation context crashes
  useEffect(() => {
    const backAction = () => {
      if (filterModalVisible) {
        setFilterModalVisible(false);
        return true;
      }
      goBackWithinApp(router);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [filterModalVisible, router]);

  // Helper: Detect if an item is Online
  const isOnlineItem = useCallback((item: any): boolean => {
    const modeStr = (
      item.internshipDetails?.mode ||
      item.programDetails?.mode ||
      item.schemeDetails?.mode ||
      item.trainingDetails?.mode ||
      item.applicationDetails?.applicationMode ||
      item.applicationProcess?.applicationMode ||
      ''
    ).toLowerCase();

    const locStr = (
      item.internshipDetails?.location ||
      item.trainingDetails?.location ||
      []
    ).join(' ').toLowerCase();

    const titleAndDesc = (
      (item.basicInfo?.title || '') + ' ' +
      (item.basicInfo?.shortDescription || '') + ' ' +
      (item.programDetails?.about || '')
    ).toLowerCase();

    return (
      modeStr.includes('online') ||
      modeStr.includes('virtual') ||
      modeStr.includes('remote') ||
      modeStr.includes('form-only') ||
      locStr.includes('pan india') ||
      locStr.includes('remote') ||
      locStr.includes('virtual') ||
      titleAndDesc.includes('virtual internship') ||
      titleAndDesc.includes('online course')
    );
  }, []);

  // Helper: Detect if an item is Offline
  const isOfflineItem = useCallback((item: any): boolean => {
    const modeStr = (
      item.internshipDetails?.mode ||
      item.programDetails?.mode ||
      item.schemeDetails?.mode ||
      item.trainingDetails?.mode ||
      item.applicationDetails?.applicationMode ||
      item.applicationProcess?.applicationMode ||
      ''
    ).toLowerCase();

    const locStr = (
      item.internshipDetails?.location ||
      item.trainingDetails?.location ||
      []
    ).join(' ').toLowerCase();

    if (
      modeStr.includes('offline') ||
      modeStr.includes('in-office') ||
      modeStr.includes('classroom') ||
      modeStr.includes('full time') ||
      modeStr.includes('on-site')
    ) {
      return true;
    }

    if (
      locStr &&
      !locStr.includes('remote') &&
      !locStr.includes('pan india') &&
      !locStr.includes('virtual') &&
      locStr.trim().length > 0
    ) {
      return true;
    }

    return false;
  }, []);

  // Helper: Check Education Level
  const matchesEducation = useCallback((item: any, edu: EducationFilter): boolean => {
    if (!edu || edu === 'All') return true;

    const levels = (item.eligibility?.educationLevels || []).map((l: any) => String(l).toLowerCase());
    const minEdu = String(item.eligibility?.minimumEducation || '').toLowerCase();
    const streams = (item.eligibility?.streamsAllowed || []).map((s: any) => String(s).toLowerCase());
    const allEduStr = [...levels, minEdu, ...streams].join(' ');

    if (!allEduStr.trim()) {
      return true;
    }

    switch (edu) {
      case '10th':
        return /class\s*(9|10|1-12|9-12|9 to 12)|10th|matric|secondary|school/.test(allEduStr);
      case '12th':
        return /class\s*(11|12|11-12|1-12)|12th|intermediate|senior\s*secondary|higher\s*secondary/.test(allEduStr);
      case 'Diploma':
        return /diploma|polytechnic|iti/.test(allEduStr);
      case 'UG':
        return /\bug\b|undergrad|bachelor|b\.tech|graduate|degree|medical|engineering/.test(allEduStr);
      case 'PG':
        return /\bpg\b|postgrad|post-grad|master|ph\.?d/.test(allEduStr);
      default:
        return true;
    }
  }, []);

  // Helper: Check State / Location
  const matchesState = useCallback((item: any, targetState: string): boolean => {
    if (!targetState || targetState === 'All') return true;

    const statesEligible = (item.eligibility?.statesEligible || []).map((s: any) => String(s).toLowerCase());
    const locList = (item.internshipDetails?.location || item.trainingDetails?.location || []).map((l: any) => String(l).toLowerCase());
    const provider = String(item.basicInfo?.providerName || '').toLowerCase();
    const department = String(item.basicInfo?.department || '').toLowerCase();
    const title = String(item.basicInfo?.title || '').toLowerCase();

    const targetLower = targetState.toLowerCase();

    if (targetState === 'All India') {
      return (
        statesEligible.includes('all india') ||
        statesEligible.includes('all') ||
        locList.includes('pan india') ||
        locList.includes('remote') ||
        statesEligible.length === 0
      );
    }

    if (statesEligible.some((s: string) => s === targetLower || s.includes(targetLower))) {
      return true;
    }

    if (provider.includes(targetLower) || department.includes(targetLower) || title.includes(targetLower)) {
      return true;
    }

    const cities = STATE_CITY_MAP[targetState] || [];
    if (locList.some((loc: string) => cities.some((city) => loc.includes(city)))) {
      return true;
    }
    if (locList.some((loc: string) => loc.includes(targetLower))) {
      return true;
    }

    if (statesEligible.includes('all india') || statesEligible.includes('all') || locList.includes('pan india')) {
      return true;
    }

    return false;
  }, []);

  // Helper: Check Stipend / Paid
  const matchesStipend = useCallback((item: any, stipendOnly: boolean): boolean => {
    if (!stipendOnly) return true;
    const stipend = (
      item.internshipDetails?.stipend ||
      item.benefits?.scholarshipAmount ||
      item.schemeDetails?.financialDetails?.amount ||
      ''
    ).toLowerCase();

    if (!stipend) return false;
    if (stipend.includes('₹0') || stipend.includes('unpaid') || stipend === '0') return false;
    return true;
  }, []);

  // Compute filtered items for any given filter configuration
  const applyFiltersToItems = useCallback(
    (itemList: any[], filterConfig: FilterState, query: string) => {
      let filtered = [...itemList];

      // 1. Search Query
      if (query.trim()) {
        const q = query.toLowerCase();
        filtered = filtered.filter((item) => {
          const title = (item.basicInfo?.title || '').toLowerCase();
          const provider = (item.basicInfo?.providerName || '').toLowerCase();
          const dept = (item.basicInfo?.department || '').toLowerCase();
          const loc = (
            item.internshipDetails?.location ||
            item.trainingDetails?.location ||
            []
          ).join(' ').toLowerCase();
          return title.includes(q) || provider.includes(q) || dept.includes(q) || loc.includes(q);
        });
      }

      // 2. Mode Filter
      if (filterConfig.mode === 'Online') {
        filtered = filtered.filter(isOnlineItem);
      } else if (filterConfig.mode === 'Offline') {
        filtered = filtered.filter(isOfflineItem);
      }

      // 3. Education Filter
      if (filterConfig.education !== 'All') {
        filtered = filtered.filter((item) => matchesEducation(item, filterConfig.education));
      }

      // 4. State Filter
      if (filterConfig.state !== 'All') {
        filtered = filtered.filter((item) => matchesState(item, filterConfig.state));
      }

      // 5. Stipend Only Filter
      if (filterConfig.stipendOnly) {
        filtered = filtered.filter((item) => matchesStipend(item, true));
      }

      return filtered;
    },
    [isOnlineItem, isOfflineItem, matchesEducation, matchesState, matchesStipend]
  );

  // Main displayed data
  const displayData = useMemo(() => {
    return applyFiltersToItems(data, filters, searchQuery);
  }, [data, filters, searchQuery, applyFiltersToItems]);

  // Dynamic preview count inside the modal
  const modalPreviewCount = useMemo(() => {
    return applyFiltersToItems(data, tempFilters, searchQuery).length;
  }, [data, tempFilters, searchQuery, applyFiltersToItems]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.mode !== 'All') count++;
    if (filters.education !== 'All') count++;
    if (filters.state !== 'All') count++;
    if (filters.stipendOnly) count++;
    return count;
  }, [filters]);

  const handleCategoryChange = (cat: Category) => {
    if (activeCategory !== cat) {
      setLoading(true);
      setActiveCategory(cat);
    }
  };

  const openFilterModal = (tab: ModalTab = 'all') => {
    setTempFilters({ ...filters });
    setActiveModalTab(tab);
    setStateSearch('');
    setShowAllStates(false);
    setFilterModalVisible(true);
  };

  const applyModalFilters = () => {
    setFilters({ ...tempFilters });
    setFilterModalVisible(false);
  };

  const resetAllFilters = () => {
    const clean: FilterState = {
      mode: 'All',
      education: 'All',
      state: 'All',
      stipendOnly: false,
    };
    setFilters(clean);
    setTempFilters(clean);
  };

  const resetActiveTabFilter = () => {
    if (activeModalTab === 'education') {
      setTempFilters((prev) => ({ ...prev, education: 'All' }));
    } else if (activeModalTab === 'state') {
      setTempFilters((prev) => ({ ...prev, state: 'All' }));
      setStateSearch('');
    } else if (activeModalTab === 'mode') {
      setTempFilters((prev) => ({ ...prev, mode: 'All' }));
    } else {
      resetAllFilters();
    }
  };

  const filteredStatesList = useMemo(() => {
    if (stateSearch.trim()) {
      return ALL_INDIAN_STATES.filter((s) =>
        s.toLowerCase().includes(stateSearch.toLowerCase())
      );
    }
    return showAllStates ? ALL_INDIAN_STATES : POPULAR_STATES;
  }, [stateSearch, showAllStates]);

  const categoryList: { id: Category; label: string }[] = [
    { id: 'all', label: t('all') || 'All' },
    { id: 'internships', label: t('internships') },
    { id: 'scholarships', label: t('scholarships') },
    { id: 'schemes', label: t('schemes') },
    { id: 'training', label: t('training') },
  ];

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'internships':
        return { label: t('internships'), bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
      case 'scholarships':
        return { label: t('scholarships'), bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' };
      case 'schemes':
        return { label: t('schemes'), bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' };
      case 'training':
        return { label: t('training'), bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' };
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-blue-900 rounded-b-3xl px-6 pt-12 pb-7 mb-4">
          <TouchableOpacity
            className="mb-3 w-10 h-10 rounded-full bg-blue-800 items-center justify-center border border-blue-700"
            onPress={() => goBackWithinApp(router)}
            activeOpacity={0.7}
          >
            <ArrowLeft color="#ffffff" size={20} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text className="text-blue-200 text-sm font-medium mb-1 tracking-wide uppercase">
            {t('nav_browse')}
          </Text>
          <Text className="text-white text-2xl font-bold tracking-tight">
            {getCategoryTitle(activeCategory)}
          </Text>
        </View>

        {/* Category Tabs: "All" first, then Internships, Scholarships, Schemes, Training */}
        <View className="mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {categoryList.map((item) => {
              const active = activeCategory === item.id;
              return (
                <TouchableOpacity
                  key={`tab_${item.id}`}
                  className={`px-4 py-2.5 rounded-full mr-2.5 ${
                    active ? 'bg-blue-900' : 'bg-white border border-gray-200'
                  }`}
                  onPress={() => handleCategoryChange(item.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      active ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View className="px-5 mb-3">
          <View className="flex-row items-center bg-white border border-gray-300 rounded-2xl px-4 py-3">
            <Search color="#6b7280" size={18} strokeWidth={2} />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder={t('search_placeholder')}
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.trim().length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X color="#9ca3af" size={18} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Bar (Horizontal Quick Bar) */}
        <View className="mb-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center' }}
          >
            {/* Filter Trigger Button */}
            <TouchableOpacity
              className={`flex-row items-center px-4 py-2 rounded-full mr-2.5 border ${
                activeFilterCount > 0
                  ? 'bg-blue-900 border-blue-900'
                  : 'bg-white border-gray-300'
              }`}
              onPress={() => openFilterModal('all')}
              activeOpacity={0.75}
            >
              <SlidersHorizontal
                color={activeFilterCount > 0 ? '#ffffff' : '#1e3a8a'}
                size={16}
                strokeWidth={2.2}
              />
              <Text
                className={`ml-1.5 text-xs font-bold ${
                  activeFilterCount > 0 ? 'text-white' : 'text-blue-900'
                }`}
              >
                {t('filters')}
              </Text>
              {activeFilterCount > 0 && (
                <View className="ml-1.5 bg-blue-500 rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-extrabold">{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Quick Mode: All */}
            <TouchableOpacity
              className={`px-3.5 py-2 rounded-full mr-2 border ${
                filters.mode === 'All'
                  ? 'bg-blue-100 border-blue-400'
                  : 'bg-white border-gray-200'
              }`}
              onPress={() => setFilters((prev) => ({ ...prev, mode: 'All' }))}
              activeOpacity={0.7}
            >
              <Text
                className={`text-xs font-semibold ${
                  filters.mode === 'All' ? 'text-blue-900' : 'text-gray-700'
                }`}
              >
                {t('all_modes')}
              </Text>
            </TouchableOpacity>

            {/* Quick Mode: Online */}
            <TouchableOpacity
              className={`flex-row items-center px-3.5 py-2 rounded-full mr-2 border ${
                filters.mode === 'Online'
                  ? 'bg-blue-900 border-blue-900'
                  : 'bg-white border-gray-200'
              }`}
              onPress={() =>
                setFilters((prev) => ({
                  ...prev,
                  mode: prev.mode === 'Online' ? 'All' : 'Online',
                }))
              }
              activeOpacity={0.7}
            >
              <Globe
                color={filters.mode === 'Online' ? '#ffffff' : '#2563eb'}
                size={14}
                strokeWidth={2.2}
              />
              <Text
                className={`ml-1 text-xs font-semibold ${
                  filters.mode === 'Online' ? 'text-white' : 'text-gray-700'
                }`}
              >
                {t('online')}
              </Text>
            </TouchableOpacity>

            {/* Quick Mode: Offline */}
            <TouchableOpacity
              className={`flex-row items-center px-3.5 py-2 rounded-full mr-2 border ${
                filters.mode === 'Offline'
                  ? 'bg-blue-900 border-blue-900'
                  : 'bg-white border-gray-200'
              }`}
              onPress={() =>
                setFilters((prev) => ({
                  ...prev,
                  mode: prev.mode === 'Offline' ? 'All' : 'Offline',
                }))
              }
              activeOpacity={0.7}
            >
              <Building2
                color={filters.mode === 'Offline' ? '#ffffff' : '#d97706'}
                size={14}
                strokeWidth={2.2}
              />
              <Text
                className={`ml-1 text-xs font-semibold ${
                  filters.mode === 'Offline' ? 'text-white' : 'text-gray-700'
                }`}
              >
                {t('offline')}
              </Text>
            </TouchableOpacity>

            {/* Quick Education Pill */}
            <TouchableOpacity
              className={`flex-row items-center px-3.5 py-2 rounded-full mr-2 border ${
                filters.education !== 'All'
                  ? 'bg-purple-100 border-purple-400'
                  : 'bg-white border-gray-200'
              }`}
              onPress={() => openFilterModal('education')}
              activeOpacity={0.7}
            >
              <GraduationCap
                color={filters.education !== 'All' ? '#7e22ce' : '#6b7280'}
                size={14}
                strokeWidth={2}
              />
              <Text
                className={`ml-1.5 text-xs font-semibold ${
                  filters.education !== 'All' ? 'text-purple-900' : 'text-gray-700'
                }`}
              >
                {filters.education === 'All'
                  ? t('education')
                  : EDUCATION_OPTIONS.find((e) => e.id === filters.education)?.short}
              </Text>
              <ChevronDown
                color={filters.education !== 'All' ? '#7e22ce' : '#9ca3af'}
                size={14}
                strokeWidth={2}
              />
            </TouchableOpacity>

            {/* Quick State Pill */}
            <TouchableOpacity
              className={`flex-row items-center px-3.5 py-2 rounded-full mr-2 border ${
                filters.state !== 'All'
                  ? 'bg-green-100 border-green-400'
                  : 'bg-white border-gray-200'
              }`}
              onPress={() => openFilterModal('state')}
              activeOpacity={0.7}
            >
              <MapPin
                color={filters.state !== 'All' ? '#15803d' : '#6b7280'}
                size={14}
                strokeWidth={2}
              />
              <Text
                className={`ml-1.5 text-xs font-semibold ${
                  filters.state !== 'All' ? 'text-green-900' : 'text-gray-700'
                }`}
              >
                {filters.state === 'All' ? t('state') : filters.state}
              </Text>
              <ChevronDown
                color={filters.state !== 'All' ? '#15803d' : '#9ca3af'}
                size={14}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Active Filter Tags Bar (Removable Chips) */}
        {activeFilterCount > 0 && (
          <View className="px-5 mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-500 text-xs font-semibold">
                {t('showing')} {displayData.length} {t('opportunities_found')}
              </Text>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={resetAllFilters}
                activeOpacity={0.7}
              >
                <RotateCcw color="#ef4444" size={12} strokeWidth={2} />
                <Text className="text-red-600 text-xs font-semibold ml-1">
                  {t('clear_all')}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filters.mode !== 'All' && (
                <TouchableOpacity
                  className="flex-row items-center bg-blue-100 border border-blue-300 rounded-full px-3 py-1 mr-2"
                  onPress={() => setFilters((p) => ({ ...p, mode: 'All' }))}
                >
                  <Text className="text-blue-900 text-xs font-medium mr-1.5">
                    {t('mode')}: {filters.mode}
                  </Text>
                  <X color="#1e3a8a" size={14} strokeWidth={2.5} />
                </TouchableOpacity>
              )}

              {filters.education !== 'All' && (
                <TouchableOpacity
                  className="flex-row items-center bg-purple-100 border border-purple-300 rounded-full px-3 py-1 mr-2"
                  onPress={() => setFilters((p) => ({ ...p, education: 'All' }))}
                >
                  <Text className="text-purple-900 text-xs font-medium mr-1.5">
                    {t('education')}: {EDUCATION_OPTIONS.find((e) => e.id === filters.education)?.short}
                  </Text>
                  <X color="#581c87" size={14} strokeWidth={2.5} />
                </TouchableOpacity>
              )}

              {filters.state !== 'All' && (
                <TouchableOpacity
                  className="flex-row items-center bg-green-100 border border-green-300 rounded-full px-3 py-1 mr-2"
                  onPress={() => setFilters((p) => ({ ...p, state: 'All' }))}
                >
                  <Text className="text-green-900 text-xs font-medium mr-1.5">
                    {t('state')}: {filters.state}
                  </Text>
                  <X color="#14532d" size={14} strokeWidth={2.5} />
                </TouchableOpacity>
              )}

              {filters.stipendOnly && (
                <TouchableOpacity
                  className="flex-row items-center bg-amber-100 border border-amber-300 rounded-full px-3 py-1 mr-2"
                  onPress={() => setFilters((p) => ({ ...p, stipendOnly: false }))}
                >
                  <Text className="text-amber-900 text-xs font-medium mr-1.5">
                    {t('paid_stipend')}
                  </Text>
                  <X color="#78350f" size={14} strokeWidth={2.5} />
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}

        {/* Opportunity Cards List */}
        <View className="px-5 mb-20">
          {loading ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#1e3a8a" />
            </View>
          ) : displayData.length > 0 ? (
            displayData.map((item, index) => {
              const targetCategory = item.itemCategory || (activeCategory === 'all' ? 'internships' : activeCategory);
              const rawId = item._id ? item._id.toString() : `temp_${index}`;
              const uniqueKey = `${targetCategory}_${rawId}`;
              const isOnline = isOnlineItem(item);
              const isOffline = isOfflineItem(item);
              const categoryBadge = activeCategory === 'all' ? getCategoryBadge(item.itemCategory) : null;

              // Location preview
              const locationText = String(
                item.internshipDetails?.location?.[0] ||
                item.trainingDetails?.location?.[0] ||
                item.eligibility?.statesEligible?.[0] ||
                (isOnline ? 'Pan India / Remote' : t('location'))
              );

              // Duration preview
              const durationText = String(
                item.internshipDetails?.duration ||
                item.programDetails?.duration ||
                item.applicationDetails?.endDate ||
                t('duration')
              );

              // Amount / Stipend preview
              const stipendText = String(
                item.internshipDetails?.stipend ||
                item.benefits?.scholarshipAmount ||
                item.schemeDetails?.financialDetails?.amount ||
                item.programDetails?.fees ||
                (item.itemCategory === 'training' ? 'Free Course' : t('amount'))
              );

              // Education tag preview
              const eduTag =
                item.eligibility?.educationLevels?.[0] ||
                item.eligibility?.minimumEducation ||
                null;

              return (
                <TouchableOpacity
                  key={uniqueKey}
                  className="bg-white rounded-2xl p-4 mb-3.5 border border-gray-200"
                  style={{ elevation: 1 }}
                  activeOpacity={0.8}
                  onPress={() => {
                    router.push({
                      pathname: '/main/details/[id]',
                      params: { id: uniqueKey, category: targetCategory },
                    });
                  }}
                >
                  {/* Category & Status Badges Row */}
                  <View className="flex-row items-center flex-wrap mb-2.5">
                    {categoryBadge && (
                      <View className={`rounded-md px-2 py-0.5 mr-2 mb-1 border ${categoryBadge.bg} ${categoryBadge.border}`}>
                        <Text className={`text-[11px] font-bold ${categoryBadge.text}`}>
                          {categoryBadge.label}
                        </Text>
                      </View>
                    )}

                    {isOnline && (
                      <View className="flex-row items-center bg-blue-50 border border-blue-200 rounded-md px-2 py-0.5 mr-2 mb-1">
                        <Globe color="#1d4ed8" size={11} strokeWidth={2} />
                        <Text className="text-blue-800 text-[11px] font-semibold ml-1">
                          {t('online')}
                        </Text>
                      </View>
                    )}

                    {isOffline && !isOnline && (
                      <View className="flex-row items-center bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5 mr-2 mb-1">
                        <Building2 color="#b45309" size={11} strokeWidth={2} />
                        <Text className="text-amber-800 text-[11px] font-semibold ml-1">
                          {t('offline')}
                        </Text>
                      </View>
                    )}

                    {eduTag && (
                      <View className="flex-row items-center bg-purple-50 border border-purple-200 rounded-md px-2 py-0.5 mr-2 mb-1">
                        <GraduationCap color="#6b21a8" size={11} strokeWidth={2} />
                        <Text className="text-purple-800 text-[11px] font-semibold ml-1" numberOfLines={1}>
                          {eduTag}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Title & Arrow */}
                  <View className="flex-row items-start justify-between mb-1.5">
                    <TranslatedText
                      text={item.basicInfo?.title || t('opportunity')}
                      className="text-gray-900 text-base font-bold flex-1 mr-2 leading-snug"
                    />
                    <ArrowRight color="#1e3a8a" size={20} strokeWidth={2.2} />
                  </View>

                  {/* Provider */}
                  <TranslatedText
                    text={item.basicInfo?.providerName || t('provider')}
                    className="text-gray-500 text-xs font-medium mb-3"
                  />

                  {/* Location & Duration Row */}
                  <View className="flex-row items-center mb-3">
                    <MapPin color="#6b7280" size={14} strokeWidth={2} />
                    <TranslatedText
                      text={locationText}
                      className="text-gray-600 text-xs ml-1 flex-shrink"
                    />
                    <View className="mx-2.5 w-1 h-1 bg-gray-300 rounded-full" />
                    <Clock color="#6b7280" size={14} strokeWidth={2} />
                    <TranslatedText
                      text={durationText}
                      className="text-gray-600 text-xs ml-1 flex-shrink"
                    />
                  </View>

                  {/* Bottom Strip: Stipend / Amount */}
                  <View className="self-start px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                    <TranslatedText
                      text={stipendText}
                      className="text-xs font-bold text-emerald-800"
                    />
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="items-center justify-center py-16 px-6 bg-white rounded-3xl border border-gray-200">
              <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-3 border border-blue-100">
                <SlidersHorizontal color="#1e3a8a" size={28} strokeWidth={2} />
              </View>
              <Text className="text-gray-900 text-lg font-bold text-center mb-1">
                {t('no_opportunities_match')}
              </Text>
              <Text className="text-gray-500 text-xs text-center mb-5 px-4">
                Try loosening your filters or resetting to see all available opportunities in this category.
              </Text>
              <TouchableOpacity
                className="bg-blue-900 px-6 py-2.5 rounded-full"
                onPress={resetAllFilters}
                activeOpacity={0.8}
              >
                <Text className="text-white text-sm font-semibold">
                  {t('reset_filters')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom Nav Spacer */}
        <View className="h-20" />
      </ScrollView>

      {/* Slide-Up Bottom Sheet Filter Modal - Clean flex layout with zero overlapping */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          {/* Backdrop Tap to close */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setFilterModalVisible(false)}
          />

          <View
            style={{
              backgroundColor: '#ffffff',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              height: Math.min(SCREEN_HEIGHT * 0.85, 700),
              maxHeight: SCREEN_HEIGHT * 0.9,
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Pull Handle */}
            <View style={{ width: 44, height: 5, backgroundColor: '#d1d5db', borderRadius: 999, alignSelf: 'center', marginTop: 12, marginBottom: 8 }} />

            {/* Modal Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 10, borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                {activeModalTab === 'education' && <GraduationCap color="#7e22ce" size={22} strokeWidth={2.5} />}
                {activeModalTab === 'state' && <MapPin color="#15803d" size={22} strokeWidth={2.5} />}
                {activeModalTab === 'mode' && <Globe color="#2563eb" size={22} strokeWidth={2.5} />}
                {activeModalTab === 'all' && <SlidersHorizontal color="#1e3a8a" size={22} strokeWidth={2.5} />}
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: '#111827' }} numberOfLines={1}>
                    {activeModalTab === 'education'
                      ? (t('education_level') || 'Education Qualification')
                      : activeModalTab === 'state'
                      ? (t('state_region') || 'State / Location')
                      : activeModalTab === 'mode'
                      ? (t('mode') || 'Mode')
                      : (t('all_filters') || 'Filter By')}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#6b7280' }} numberOfLines={1}>
                    {activeModalTab === 'education'
                      ? 'Select qualification to match opportunities'
                      : activeModalTab === 'state'
                      ? 'Find opportunities in your state or all of India'
                      : activeModalTab === 'mode'
                      ? 'Choose online, remote or offline opportunities'
                      : 'Customize all opportunity filters'}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={resetActiveTabFilter}
                  style={{ marginRight: 12, paddingHorizontal: 8, paddingVertical: 4 }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#1e3a8a', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    {activeModalTab === 'all' ? (t('reset_all') || 'Reset All') : (t('reset') || 'Reset')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFilterModalVisible(false)}
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}
                  activeOpacity={0.7}
                >
                  <X color="#4b5563" size={18} strokeWidth={2.2} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Filter Tab Switcher inside Modal */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                  { id: 'all' as ModalTab, label: t('all_filters') || 'All Filters' },
                  { id: 'education' as ModalTab, label: t('education') || 'Education', active: tempFilters.education !== 'All' },
                  { id: 'state' as ModalTab, label: t('state') || 'State', active: tempFilters.state !== 'All' },
                  { id: 'mode' as ModalTab, label: t('mode') || 'Mode', active: tempFilters.mode !== 'All' },
                ].map((tab) => {
                  const isTabActive = activeModalTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setActiveModalTab(tab.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        borderRadius: 20,
                        marginRight: 8,
                        backgroundColor: isTabActive ? '#1e3a8a' : '#f3f4f6',
                        borderWidth: 1,
                        borderColor: isTabActive ? '#1e3a8a' : '#e5e7eb',
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: isTabActive ? '700' : '600',
                          color: isTabActive ? '#ffffff' : '#4b5563',
                        }}
                      >
                        {tab.label}
                      </Text>
                      {tab.active && !isTabActive && (
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#2563eb', marginLeft: 5 }} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Modal Filter ScrollBody - flex: 1 fills the remaining height reliably */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {/* Tab 1: Dedicated Education Filter View */}
              {activeModalTab === 'education' && (
                <View>
                  <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Choose Education Level
                    </Text>
                    {tempFilters.education !== 'All' && (
                      <TouchableOpacity onPress={() => setTempFilters((p) => ({ ...p, education: 'All' }))}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#7e22ce' }}>Reset</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {EDUCATION_OPTIONS.map((opt) => {
                    const isSelected = tempFilters.education === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() => setTempFilters((prev) => ({ ...prev, education: opt.id }))}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 14,
                          borderRadius: 16,
                          marginBottom: 10,
                          borderWidth: 1.5,
                          borderColor: isSelected ? '#7e22ce' : '#e5e7eb',
                          backgroundColor: isSelected ? '#faf5ff' : '#ffffff',
                        }}
                        activeOpacity={0.75}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: isSelected ? '#f3e8ff' : '#f3f4f6',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                          }}
                        >
                          <GraduationCap color={isSelected ? '#7e22ce' : '#6b7280'} size={20} strokeWidth={2.2} />
                        </View>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: isSelected ? '#581c87' : '#111827' }}>
                            {opt.label}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                            {opt.desc}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            borderWidth: 2,
                            borderColor: isSelected ? '#7e22ce' : '#d1d5db',
                            backgroundColor: isSelected ? '#7e22ce' : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isSelected && <Check color="#ffffff" size={13} strokeWidth={3} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Tab 2: Dedicated State / Location Filter View */}
              {activeModalTab === 'state' && (
                <View>
                  {/* State search input */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
                    <Search color="#9ca3af" size={16} />
                    <TextInput
                      style={{ flex: 1, marginLeft: 8, fontSize: 13, color: '#111827', padding: 0 }}
                      placeholder={t('search_state') || 'Search state or city...'}
                      placeholderTextColor="#9ca3af"
                      value={stateSearch}
                      onChangeText={setStateSearch}
                      autoCorrect={false}
                    />
                    {stateSearch.length > 0 && (
                      <TouchableOpacity onPress={() => setStateSearch('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <X color="#9ca3af" size={16} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Active state banner if filtered */}
                  {tempFilters.state !== 'All' && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#f0fdf4',
                        borderWidth: 1,
                        borderColor: '#bbf7d0',
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 12,
                        marginBottom: 12,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MapPin color="#16a34a" size={14} />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#166534', marginLeft: 6 }}>
                          Selected: {tempFilters.state}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => setTempFilters((p) => ({ ...p, state: 'All' }))}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#dc2626' }}>Clear</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* All India Option */}
                  <TouchableOpacity
                    onPress={() => setTempFilters((prev) => ({ ...prev, state: 'All India' }))}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      borderRadius: 14,
                      marginBottom: 14,
                      borderWidth: 1.5,
                      borderColor: tempFilters.state === 'All India' || tempFilters.state === 'All' ? '#15803d' : '#e5e7eb',
                      backgroundColor: tempFilters.state === 'All India' || tempFilters.state === 'All' ? '#f0fdf4' : '#ffffff',
                    }}
                    activeOpacity={0.75}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: tempFilters.state === 'All India' || tempFilters.state === 'All' ? '#dcfce7' : '#f3f4f6',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Globe color={tempFilters.state === 'All India' || tempFilters.state === 'All' ? '#15803d' : '#6b7280'} size={20} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: tempFilters.state === 'All India' || tempFilters.state === 'All' ? '#14532d' : '#111827' }}>
                        All India / Remote
                      </Text>
                      <Text style={{ fontSize: 11, color: '#6b7280' }}>
                        Opportunities available nationwide or remotely
                      </Text>
                    </View>
                    {(tempFilters.state === 'All India' || tempFilters.state === 'All') && (
                      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#15803d', alignItems: 'center', justifyContent: 'center' }}>
                        <Check color="#ffffff" size={13} strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* State List / Chips */}
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                    {stateSearch.trim() ? `Search Results (${filteredStatesList.length})` : (showAllStates ? 'All Indian States & UTs' : 'Popular States')}
                  </Text>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    {filteredStatesList.map((st) => {
                      if (st === 'All India') return null;
                      const isSelected = tempFilters.state === st;
                      return (
                        <TouchableOpacity
                          key={st}
                          onPress={() =>
                            setTempFilters((prev) => ({
                              ...prev,
                              state: prev.state === st ? 'All' : st,
                            }))
                          }
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: isSelected ? '#15803d' : '#e5e7eb',
                            backgroundColor: isSelected ? '#15803d' : '#ffffff',
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: isSelected ? '700' : '500',
                              color: isSelected ? '#ffffff' : '#374151',
                            }}
                          >
                            {st}
                          </Text>
                          {isSelected && (
                            <Check color="#ffffff" size={12} strokeWidth={3} style={{ marginLeft: 5 }} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {!stateSearch.trim() && (
                    <TouchableOpacity
                      style={{
                        paddingVertical: 10,
                        borderTopWidth: 1,
                        borderColor: '#f3f4f6',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 10,
                      }}
                      onPress={() => setShowAllStates((p) => !p)}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#1e3a8a' }}>
                        {showAllStates
                          ? 'Show Fewer States ▴'
                          : `Show All Indian States (▾ ${ALL_INDIAN_STATES.length - POPULAR_STATES.length} more)`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Tab 3: Dedicated Mode Filter View */}
              {activeModalTab === 'mode' && (
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                    Select Mode
                  </Text>
                  {[
                    { id: 'All', label: t('all_modes') || 'All Modes', desc: 'Show all online, remote, and in-person opportunities', icon: Globe },
                    { id: 'Online', label: t('online') || 'Online / Remote', desc: 'Work from home, virtual internships, and online training', icon: Globe },
                    { id: 'Offline', label: t('offline') || 'Offline / In-Person', desc: 'On-site training, classroom, and in-office programs', icon: Building2 },
                  ].map((opt) => {
                    const isSelected = tempFilters.mode === opt.id;
                    const IconComp = opt.icon;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() => setTempFilters((prev) => ({ ...prev, mode: opt.id as ModeFilter }))}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 14,
                          borderRadius: 16,
                          marginBottom: 10,
                          borderWidth: 1.5,
                          borderColor: isSelected ? '#1e3a8a' : '#e5e7eb',
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                        }}
                        activeOpacity={0.75}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: isSelected ? '#dbeafe' : '#f3f4f6',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                          }}
                        >
                          <IconComp color={isSelected ? '#1e3a8a' : '#6b7280'} size={20} strokeWidth={2.2} />
                        </View>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: isSelected ? '#1e3a8a' : '#111827' }}>
                            {opt.label}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                            {opt.desc}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            borderWidth: 2,
                            borderColor: isSelected ? '#1e3a8a' : '#d1d5db',
                            backgroundColor: isSelected ? '#1e3a8a' : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isSelected && <Check color="#ffffff" size={13} strokeWidth={3} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Tab 4: All Filters View (Comprehensive) */}
              {activeModalTab === 'all' && (
                <View>
                  {/* Section 1: Mode */}
                  <View className="mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <Text className="text-gray-900 text-xs font-bold uppercase tracking-wider mb-3">
                      {t('mode')}
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {[
                        { id: 'All', label: t('all_modes'), icon: null },
                        { id: 'Online', label: t('online'), icon: Globe },
                        { id: 'Offline', label: t('offline'), icon: Building2 },
                      ].map((opt) => {
                        const isSelected = tempFilters.mode === opt.id;
                        const IconComp = opt.icon;
                        return (
                          <TouchableOpacity
                            key={opt.id}
                            className={`flex-row items-center px-4 py-2.5 rounded-xl border ${
                              isSelected
                                ? 'bg-blue-900 border-blue-900'
                                : 'bg-white border-gray-200'
                            }`}
                            onPress={() =>
                              setTempFilters((prev) => ({
                                ...prev,
                                mode: opt.id as ModeFilter,
                              }))
                            }
                            activeOpacity={0.75}
                          >
                            {IconComp && (
                              <IconComp
                                color={isSelected ? '#ffffff' : '#4b5563'}
                                size={16}
                                strokeWidth={2}
                              />
                            )}
                            <Text
                              className={`text-xs font-semibold ${IconComp ? 'ml-1.5' : ''} ${
                                isSelected ? 'text-white' : 'text-gray-800'
                              }`}
                            >
                              {opt.label}
                            </Text>
                            {isSelected && (
                              <Check color="#ffffff" size={14} strokeWidth={2.5} className="ml-1.5" />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Section 2: Education Level */}
                  <View className="mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-gray-900 text-xs font-bold uppercase tracking-wider">
                        {t('education_level')}
                      </Text>
                      {tempFilters.education !== 'All' && (
                        <TouchableOpacity onPress={() => setTempFilters((p) => ({ ...p, education: 'All' }))}>
                          <Text className="text-blue-700 text-xs font-bold">
                            Clear ({tempFilters.education})
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View className="flex-row flex-wrap gap-2">
                      {EDUCATION_OPTIONS.map((opt) => {
                        const isSelected = tempFilters.education === opt.id;
                        return (
                          <TouchableOpacity
                            key={opt.id}
                            className={`px-3.5 py-2.5 rounded-xl border ${
                              isSelected
                                ? 'bg-purple-900 border-purple-900'
                                : 'bg-white border-gray-200'
                            }`}
                            onPress={() =>
                              setTempFilters((prev) => ({
                                ...prev,
                                education: opt.id,
                              }))
                            }
                            activeOpacity={0.75}
                          >
                            <Text
                              className={`text-xs font-semibold ${
                                isSelected ? 'text-white' : 'text-gray-800'
                              }`}
                            >
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Section 3: State / Location */}
                  <View className="mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-900 text-xs font-bold uppercase tracking-wider">
                        {t('state_region')}
                      </Text>
                      {tempFilters.state !== 'All' && (
                        <TouchableOpacity
                          onPress={() => setTempFilters((p) => ({ ...p, state: 'All' }))}
                        >
                          <Text className="text-blue-700 text-xs font-bold">
                            Clear ({tempFilters.state})
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* State search input */}
                    <View className="flex-row items-center bg-white rounded-xl px-3 py-2.5 mb-3 border border-gray-200">
                      <Search color="#9ca3af" size={15} />
                      <TextInput
                        className="flex-1 ml-2 text-xs text-gray-900"
                        placeholder={t('search_state')}
                        placeholderTextColor="#9ca3af"
                        value={stateSearch}
                        onChangeText={setStateSearch}
                      />
                      {stateSearch.length > 0 && (
                        <TouchableOpacity onPress={() => setStateSearch('')}>
                          <X color="#9ca3af" size={15} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* State chips */}
                    <View className="flex-row flex-wrap gap-2">
                      {filteredStatesList.map((st) => {
                        const isSelected = tempFilters.state === st;
                        return (
                          <TouchableOpacity
                            key={st}
                            className={`px-3 py-1.5 rounded-lg border ${
                              isSelected
                                ? 'bg-blue-900 border-blue-900'
                                : 'bg-white border-gray-200'
                            }`}
                            onPress={() =>
                              setTempFilters((prev) => ({
                                ...prev,
                                state: prev.state === st ? 'All' : st,
                              }))
                            }
                            activeOpacity={0.7}
                          >
                            <Text
                              className={`text-xs font-medium ${
                                isSelected ? 'text-white font-bold' : 'text-gray-700'
                              }`}
                            >
                              {st}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {!stateSearch.trim() && (
                      <TouchableOpacity
                        className="mt-3 pt-2 border-t border-gray-200 flex-row items-center justify-center"
                        onPress={() => setShowAllStates((prev) => !prev)}
                        activeOpacity={0.7}
                      >
                        <Text className="text-blue-900 text-xs font-bold">
                          {showAllStates ? 'Show Fewer States ▴' : `Show All States (▾ ${ALL_INDIAN_STATES.length - POPULAR_STATES.length} more)`}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Section 4: Benefits & Stipend Filter */}
                  <View className="mb-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <Text className="text-gray-900 text-xs font-bold uppercase tracking-wider mb-2.5">
                      Benefits & Compensation
                    </Text>
                    <TouchableOpacity
                      className={`flex-row items-center justify-between p-3.5 rounded-2xl border ${
                        tempFilters.stipendOnly
                          ? 'bg-emerald-50 border-emerald-300'
                          : 'bg-white border-gray-200'
                      }`}
                      onPress={() =>
                        setTempFilters((prev) => ({
                          ...prev,
                          stipendOnly: !prev.stipendOnly,
                        }))
                      }
                      activeOpacity={0.8}
                    >
                      <View className="flex-1 mr-3">
                        <Text className="text-gray-900 text-xs font-bold">
                          {t('paid_stipend')}
                        </Text>
                        <Text className="text-gray-500 text-[11px] mt-0.5 leading-tight">
                          Show opportunities offering stipend, grants, or financial support
                        </Text>
                      </View>
                      <View
                        className={`w-6 h-6 rounded-full items-center justify-center border ${
                          tempFilters.stipendOnly
                            ? 'bg-emerald-600 border-emerald-600'
                            : 'bg-gray-100 border-gray-300'
                        }`}
                      >
                        {tempFilters.stipendOnly && <Check color="#ffffff" size={14} strokeWidth={3} />}
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Modal Bottom Sticky Actions */}
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: Platform.OS === 'ios' ? 28 : 16,
                borderTopWidth: 1,
                borderColor: '#f3f4f6',
                backgroundColor: '#ffffff',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                style={{ flex: 1, marginRight: 8, paddingVertical: 14, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}
                onPress={resetActiveTabFilter}
                activeOpacity={0.7}
              >
                <Text style={{ color: '#374151', fontWeight: '700', fontSize: 14 }}>
                  {activeModalTab === 'all' ? (t('reset_all') || 'Reset All') : (t('reset') || 'Reset')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 2, marginLeft: 8, paddingVertical: 14, borderRadius: 16, backgroundColor: '#1e3a8a', alignItems: 'center', justifyContent: 'center' }}
                onPress={applyModalFilters}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>
                  {t('apply_filters')} ({modalPreviewCount})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNav />
    </View>
  );
}