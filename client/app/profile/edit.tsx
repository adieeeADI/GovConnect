import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, X, Plus, Calendar, IndianRupee } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const INCOME_RANGES = [
  { label: 'Below ₹1L', value: 50000 },
  { label: '₹1L–3L', value: 200000 },
  { label: '₹3L–6L', value: 450000 },
  { label: '₹6L–10L', value: 800000 },
  { label: 'Above ₹10L', value: 1200000 },
];

const GENDERS = ['Male', 'Female', 'Other'];
const CATEGORIES = ['Student', 'Job Seeker', 'Farmer'];

// Reusable styled input
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-5">
      <Text className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wide">{label}</Text>
      {children}
    </View>
  );
}

function StyledInput(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      className="bg-gray-100 rounded-xl px-4 py-3 text-black text-sm"
      placeholderTextColor="#9ca3af"
      {...props}
    />
  );
}

// Chip selector
function ChipSelector({
  options, value, onChange, color = 'blue'
}: { options: string[]; value: string; onChange: (v: string) => void; color?: string }) {
  const active = color === 'blue'
    ? 'bg-blue-700' : color === 'green' ? 'bg-green-600' : 'bg-purple-600';
  return (
    <View className="flex-row flex-wrap">
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          className={`px-4 py-2 rounded-full mr-2 mb-2 ${value === opt ? active : 'bg-gray-200'}`}
          onPress={() => onChange(opt)}
          activeOpacity={0.7}
        >
          <Text className={`text-sm font-semibold ${value === opt ? 'text-white' : 'text-gray-700'}`}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Tag input (skills / interests)
function TagInput({ tags, onChange, placeholder, color = 'blue' }: {
  tags: string[]; onChange: (t: string[]) => void;
  placeholder: string; color?: string;
}) {
  const [text, setText] = useState('');
  const add = () => {
    const v = text.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setText('');
  };
  const remove = (t: string) => onChange(tags.filter(x => x !== t));
  const bg = color === 'blue' ? 'bg-blue-100' : 'bg-orange-100';
  const textColor = color === 'blue' ? 'text-blue-900' : 'text-orange-700';

  return (
    <View>
      <View className="flex-row flex-wrap mb-2">
        {tags.map(t => (
          <View key={t} className={`${bg} flex-row items-center rounded-full px-3 py-1 mr-2 mb-2`}>
            <Text className={`${textColor} text-sm font-semibold mr-1`}>{t}</Text>
            <TouchableOpacity onPress={() => remove(t)}>
              <X size={12} color={color === 'blue' ? '#1e3a8a' : '#c2410c'} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
        <TextInput
          className="flex-1 text-sm text-black"
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={text}
          onChangeText={setText}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={add}>
          <Plus size={18} color="#1e3a8a" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function EditProfile() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [state, setState] = useState('');
  const [caste, setCaste] = useState('');
  const [religion, setReligion] = useState('');
  const [familyIncome, setFamilyIncome] = useState(0);
  const [category, setCategory] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const userId = await AsyncStorage.getItem('userId');
      const res = await fetch(`https://govconnect-ad4s.onrender.com/api/auth/user/${userId}`);
      const data = await res.json();

      setFullName(data.fullName || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setLocation(data.location || '');
      setEducation(data.education || '');
      setSkills(data.skills || []);
      setInterests(data.interests || []);
      setGender(data.gender || '');
      setState(data.state || '');
      setCaste(data.caste || '');
      setReligion(data.religion || '');
      setFamilyIncome(data.familyIncome || 0);
      setCategory(data.category || '');
      if (data.dateOfBirth) setDateOfBirth(new Date(data.dateOfBirth));
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await fetch('https://govconnect-ad4s.onrender.com/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          fullName,
          phone,
          location,
          education,
          skills,
          interests,
          gender,
          state,
          caste,
          religion,
          familyIncome,
          category,
          dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      Alert.alert('Saved', 'Profile updated successfully');
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formattedDOB = dateOfBirth
    ? dateOfBirth.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Select date';

  const selectedIncomeLabel = INCOME_RANGES.find(r => r.value === familyIncome)?.label || 'Not set';

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>

      {/* Header */}
      <View className="bg-blue-900 rounded-b-3xl px-6 py-6 mb-4">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft color="#fff" size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold mt-4">Edit Profile</Text>
        <Text className="text-blue-200 text-sm mt-1">Fill any fields you want to update</Text>
      </View>

      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>

        {/* ── Basic Info ── */}
        <Text className="text-black text-lg font-bold mb-4">Basic Info</Text>

        <Field label="Full Name">
          <StyledInput value={fullName} onChangeText={setFullName} placeholder="Your full name" />
        </Field>

        <Field label="Email">
          <StyledInput value={email} editable={false}
            className="bg-gray-200 rounded-xl px-4 py-3 text-gray-400 text-sm" />
        </Field>

        <Field label="Phone">
          <StyledInput value={phone} onChangeText={setPhone}
            placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" />
        </Field>

        <Field label="Location">
          <StyledInput value={location} onChangeText={setLocation} placeholder="City, State" />
        </Field>

        <Field label="Education">
          <StyledInput value={education} onChangeText={setEducation}
            placeholder="e.g. B.Tech Computer Science" />
        </Field>

        <Field label="Skills">
          <TagInput tags={skills} onChange={setSkills}
            placeholder="Type a skill and press enter" color="blue" />
        </Field>

        <Field label="Interests">
          <TagInput tags={interests} onChange={setInterests}
            placeholder="Type an interest and press enter" color="orange" />
        </Field>

        {/* ── Govt / Eligibility ── */}
        <Text className="text-black text-lg font-bold mb-4 mt-2">Eligibility Info</Text>

        {/* Date of Birth — Calendar */}
        <Field label="Date of Birth">
          <TouchableOpacity
            className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center justify-between"
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text className={dateOfBirth ? 'text-black text-sm' : 'text-gray-400 text-sm'}>
              {formattedDOB}
            </Text>
            <Calendar size={18} color="#6b7280" />
          </TouchableOpacity>
        </Field>

        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth || new Date(2000, 0, 1)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={(_, date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (date) setDateOfBirth(date);
            }}
          />
        )}

        <Field label="Gender">
          <ChipSelector options={GENDERS} value={gender} onChange={setGender} color="blue" />
        </Field>

        <Field label="State">
          <StyledInput value={state} onChangeText={setState} placeholder="e.g. Maharashtra" />
        </Field>

        <Field label="Caste">
          <StyledInput value={caste} onChangeText={setCaste} placeholder="e.g. OBC" />
        </Field>

        <Field label="Religion">
          <StyledInput value={religion} onChangeText={setReligion} placeholder="e.g. Hindu" />
        </Field>

        {/* Family Income — Range Chips */}
        <Field label="Annual Family Income">
          <View className="flex-row flex-wrap">
            {INCOME_RANGES.map(range => (
              <TouchableOpacity
                key={range.value}
                className={`px-4 py-2 rounded-full mr-2 mb-2 flex-row items-center
                  ${familyIncome === range.value ? 'bg-green-600' : 'bg-gray-200'}`}
                onPress={() => setFamilyIncome(range.value)}
                activeOpacity={0.7}
              >
                <Text className={`text-sm font-semibold
                  ${familyIncome === range.value ? 'text-white' : 'text-gray-700'}`}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {familyIncome > 0 && (
            <Text className="text-green-700 text-xs mt-1">Selected: {selectedIncomeLabel}</Text>
          )}
        </Field>

        <Field label="Category">
          <ChipSelector options={CATEGORIES} value={category} onChange={setCategory} color="green" />
        </Field>

        {/* Save */}
        <TouchableOpacity
          className={`rounded-2xl p-4 mt-4 mb-10 ${saving ? 'bg-blue-400' : 'bg-blue-700'}`}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-bold text-base">
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}