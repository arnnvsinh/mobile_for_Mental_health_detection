import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Phone, BookOpen } from 'lucide-react-native';

type Resource = {
  id: string;
  title: string;
  description: string;
  category: string;
  content_url: string | null;
};

export default function ResourcesScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const { data } = await supabase
        .from('mental_health_resources')
        .select('*')
        .order('is_crisis_resource', { ascending: false });
      if (data) setResources(data);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceClick = async (resource: Resource) => {
    if (user) {
      await supabase.from('user_resource_interactions').insert({
        user_id: user.id,
        resource_id: resource.id,
        interaction_type: 'viewed',
      });
    }

    if (resource.content_url) {
      Linking.openURL(resource.content_url);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Support Resources</Text>
        <Text style={styles.subtitle}>Help is always available</Text>
      </View>

      <View style={styles.resourcesSection}>
        {resources.map((resource) => (
          <TouchableOpacity
            key={resource.id}
            style={styles.resourceCard}
            onPress={() => handleResourceClick(resource)}
          >
            <View style={styles.resourceHeader}>
              <View style={styles.categoryBadge}>
                {resource.category === 'hotline' ? (
                  <Phone size={20} color="#fff" />
                ) : (
                  <BookOpen size={20} color="#fff" />
                )}
              </View>
              <View style={styles.resourceHeaderText}>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
              </View>
            </View>
            <Text style={styles.resourceDescription}>{resource.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  resourcesSection: {
    padding: 24,
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  resourceHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  resourceDescription: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
});
