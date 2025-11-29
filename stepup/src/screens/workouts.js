import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { getWorkouts } from '../utils/storage';

export default function Workouts() {
  const navigation = useNavigation();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const allWorkouts = await getWorkouts();
      // Sort by date (newest first)
      const sortedWorkouts = allWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
      setWorkouts(sortedWorkouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconName = (type) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('cardio') || lowerType.includes('run')) return 'walk';
    if (lowerType.includes('yoga')) return 'body';
    if (lowerType.includes('strength')) return 'barbell';
    return 'fitness';
  };

  const getIconColors = (type) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('cardio') || lowerType.includes('run')) {
      return { bg: 'rgba(255, 107, 157, 0.2)', color: '#FF6B9D' };
    }
    if (lowerType.includes('yoga')) {
      return { bg: 'rgba(138, 92, 246, 0.2)', color: '#8A5CF6' };
    }
    if (lowerType.includes('strength')) {
      return { bg: 'rgba(46, 107, 241, 0.2)', color: COLORS.primaryBlue };
    }
    return { bg: 'rgba(46, 107, 241, 0.2)', color: COLORS.primaryBlue };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderItem = ({ item }) => {
    const iconColors = getIconColors(item.type);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AddWorkout', { workout: item })}
      >
        <View style={styles.leftContent}>
          <View style={[styles.iconContainer, { backgroundColor: iconColors.bg }]}>
            <Ionicons
              name={getIconName(item.type)}
              size={20}
              color={iconColors.color}
            />
          </View>
          <View>
            <Text style={styles.cardTitle}>{item.type}</Text>
            <Text style={styles.cardStats}>
              {item.duration} min • {item.calories || 0} kcal
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.time}>{formatDate(item.date)}</Text>
          {item.isRestDay && <Text style={styles.restTag}>Rest Day</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Text style={FONTS.h2}>Your Workouts</Text>
      </View>

      <FlatList
        data={workouts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="barbell-outline" size={64} color={COLORS.textGray} />
              <Text style={styles.emptyText}>No workouts logged yet.</Text>
              <Text style={styles.emptySubText}>Tap the + button to add your first workout!</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
    marginTop: 10,
  },
  listContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardStats: {
    color: COLORS.textGray,
    fontSize: 14,
  },
  time: {
    color: COLORS.textGray,
    fontSize: 14,
  },
  restTag: {
    color: COLORS.primaryBlue,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubText: {
    color: COLORS.textGray,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});
