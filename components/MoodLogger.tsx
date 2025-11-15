import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { X, Smile, Frown, Battery, Zap } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

type MoodLoggerProps = {
  onClose: () => void;
  onMoodLogged: () => void;
};

const MOOD_OPTIONS = [
  { score: 10, label: 'amazing', emoji: '🤩', color: '#10B981' },
  { score: 9, label: 'great', emoji: '😊', color: '#10B981' },
  { score: 8, label: 'good', emoji: '🙂', color: '#3B82F6' },
  { score: 7, label: 'okay', emoji: '😐', color: '#3B82F6' },
  { score: 6, label: 'neutral', emoji: '😶', color: '#6B7280' },
  { score: 5, label: 'meh', emoji: '😕', color: '#F59E0B' },
  { score: 4, label: 'low', emoji: '😟', color: '#F59E0B' },
  { score: 3, label: 'down', emoji: '😞', color: '#EF4444' },
  { score: 2, label: 'sad', emoji: '😢', color: '#EF4444' },
  { score: 1, label: 'distressed', emoji: '😭', color: '#DC2626' },
];

const TAGS = [
  'work', 'social', 'exercise', 'sleep', 'family', 'relaxation',
  'stress', 'anxiety', 'productivity', 'health', 'hobby', 'other'
];

export default function MoodLogger({ onClose, onMoodLogged }: MoodLoggerProps) {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<typeof MOOD_OPTIONS[0] | null>(null);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      setError('Please select a mood');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user?.id,
          mood_score: selectedMood.score,
          mood_label: selectedMood.label,
          energy_level: energyLevel,
          stress_level: stressLevel,
          anxiety_level: anxietyLevel,
          notes,
          tags: selectedTags,
        });

      if (insertError) {
        setError(insertError.message);
      } else {
        onMoodLogged();
      }
    } catch (err) {
      setError('Failed to log mood');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>How are you feeling?</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Your Mood</Text>
            <View style={styles.moodGrid}>
              {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.score}
                  style={[
                    styles.moodButton,
                    selectedMood?.score === mood.score && {
                      backgroundColor: mood.color + '20',
                      borderColor: mood.color,
                    },
                  ]}
                  onPress={() => setSelectedMood(mood)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Battery size={20} color="#4A90E2" />
              <Text style={styles.sectionTitle}>Energy Level: {energyLevel}/10</Text>
            </View>
            <View style={styles.sliderContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.sliderButton,
                    energyLevel >= value && styles.sliderButtonActive,
                  ]}
                  onPress={() => setEnergyLevel(value)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Zap size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Stress Level: {stressLevel}/10</Text>
            </View>
            <View style={styles.sliderContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.sliderButton,
                    stressLevel >= value && styles.sliderButtonActiveStress,
                  ]}
                  onPress={() => setStressLevel(value)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Frown size={20} color="#EF4444" />
              <Text style={styles.sectionTitle}>Anxiety Level: {anxietyLevel}/10</Text>
            </View>
            <View style={styles.sliderContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.sliderButton,
                    anxietyLevel >= value && styles.sliderButtonActiveAnxiety,
                  ]}
                  onPress={() => setAnxietyLevel(value)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Context (Optional)</Text>
            <View style={styles.tagsContainer}>
              {TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tag,
                    selectedTags.includes(tag) && styles.tagActive,
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      selectedTags.includes(tag) && styles.tagTextActive,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add any additional thoughts or context..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Log Mood</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodButton: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  sliderButton: {
    flex: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  sliderButtonActive: {
    backgroundColor: '#4A90E2',
  },
  sliderButtonActiveStress: {
    backgroundColor: '#F59E0B',
  },
  sliderButtonActiveAnxiety: {
    backgroundColor: '#EF4444',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  tagText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tagTextActive: {
    color: '#fff',
  },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 100,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
