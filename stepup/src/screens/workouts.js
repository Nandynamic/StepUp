import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const BLUE = '#4C9FFF';
const CARD = '#ffffff';
const BACKGROUND = '#F7F9FC';
const TEXT_WHITE = '#000';
const TEXT_GRAY = '#555';

const isoToDate = (iso) => {
  return new Date(iso + 'T00:00:00');
};

const formatDisplayDate = (iso) => {
  const d = isoToDate(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function Workouts() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [workouts, setWorkouts] = useState([]);
  const [view, setView] = useState('History');
  const [dateRange, setDateRange] = useState('This Month');
  const [typeFilter, setTypeFilter] = useState('All Workouts');
  const [sortBy, setSortBy] = useState('Date (Newest)');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  useEffect(() => {
    if (isFocused) loadWorkouts();
  }, [isFocused]);

  const loadWorkouts = async () => {
    try {
      const json = await AsyncStorage.getItem('stepup_data');
      const data = json ? JSON.parse(json) : {};
      const arr = data.workouts || [];
      setWorkouts(arr.slice());
    } catch (e) {
      console.error('Failed to load workouts', e);
    }
  };

  const saveWorkoutsToStorage = async (newList) => {
    try {
      const json = await AsyncStorage.getItem('stepup_data');
      const data = json ? JSON.parse(json) : { workouts: [], weeklyGoals: [], customTypes: [] };
      data.workouts = newList;
      await AsyncStorage.setItem('stepup_data', JSON.stringify(data));
      setWorkouts(newList);
    } catch (e) {
      console.error('Failed to save workouts', e);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const newList = workouts.filter(w => w.id !== id);
            await saveWorkoutsToStorage(newList);
          }
        }
      ]
    );
  };

  const handleEdit = (workout) => {
    navigation.navigate('AddWorkout', { workout });
  };

  const workoutTypes = useMemo(() => {
    const set = new Set(['All Workouts']);
    workouts.forEach(w => {
      if (w.type) set.add(w.type);
    });
    return Array.from(set);
  }, [workouts]);

  const filterByDateRange = (list) => {
    if (dateRange === 'All Time') return list;

    const now = new Date();
    let startDate;

    if (dateRange === 'This Month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dateRange === 'This Week') {
      const day = now.getDay();
      const diff = now.getDate() - day;
      startDate = new Date(now.getFullYear(), now.getMonth(), Math.max(1, diff));
    } else {
      startDate = null;
    }

    if (!startDate) return list;

    return list.filter(w => {
      if (!w.date) return false;
      const d = isoToDate(w.date);
      return d >= startDate && d <= now;
    });
  };

  const filterByType = (list) => {
    if (!typeFilter || typeFilter === 'All Workouts') return list;
    return list.filter(w => w.type === typeFilter);
  };

  const sortList = (list) => {
    const copy = list.slice();
    if (sortBy === 'Date (Newest)') {
      copy.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    } else if (sortBy === 'Date (Oldest)') {
      copy.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    } else if (sortBy === 'Duration') {
      copy.sort((a, b) => (b.duration || 0) - (a.duration || 0));
    } else if (sortBy === 'Calories') {
      copy.sort((a, b) => (b.calories || 0) - (a.calories || 0));
    }
    return copy;
  };

  const displayed = useMemo(() => {
    const afterDate = filterByDateRange(workouts);
    const afterType = filterByType(afterDate);
    const sorted = sortList(afterType);
    return sorted;
  }, [workouts, dateRange, typeFilter, sortBy]);

  const markedDates = useMemo(() => {
    const marks = {};
    workouts.forEach(w => {
      if (!w.date) return;
      const k = w.date;
      if (!marks[k]) {
        marks[k] = { dots: [{ color: BLUE }], marked: true };
      } else {
        const existing = marks[k].dots || [];
        if (existing.length < 3) existing.push({ color: BLUE });
        marks[k] = { ...marks[k], dots: existing, marked: true };
      }
    });
    return marks;
  }, [workouts]);

  const onDayPress = (day) => {
    setDateRange('All Time');
    setTypeFilter(`__DAY__${day.dateString}`);
  };

  const finalDisplayed = useMemo(() => {
    if (typeFilter && typeFilter.startsWith('__DAY__')) {
      const target = typeFilter.replace('__DAY__', '');
      return sortList(workouts.filter(w => w.date === target));
    }
    return displayed;
  }, [typeFilter, displayed, workouts, sortBy]);

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
        <Ionicons name="arrow-back" size={22} color={TEXT_WHITE} />
      </TouchableOpacity>
      <Text style={[FONTS.h2, { color: TEXT_WHITE }]}>Workout History</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('AddWorkout')}
        style={styles.iconBtn}
      >
        <Ionicons name="add" size={26} color={TEXT_WHITE} />
      </TouchableOpacity>
    </View>
  );

  const TabSwitch = () => (
    <View style={styles.tabRow}>
      <TouchableOpacity
        style={[styles.tabBtn, view === 'History' && styles.tabActive]}
        onPress={() => setView('History')}
      >
        <Text style={[styles.tabText, view === 'History' && styles.tabTextActive]}>History</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabBtn, view === 'Calendar' && styles.tabActive]}
        onPress={() => setView('Calendar')}
      >
        <Text style={[styles.tabText, view === 'Calendar' && styles.tabTextActive]}>Calendar</Text>
      </TouchableOpacity>
    </View>
  );

  const FilterRow = () => (
    <View style={styles.filterRow}>
      <TouchableOpacity style={styles.filterBtn} onPress={() => {
        const order = ['This Month', 'This Week', 'All Time'];
        const next = order[(order.indexOf(dateRange) + 1) % order.length];
        setDateRange(next);
      }}>
        <Text style={styles.filterText}>Date Range: {dateRange}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterModalVisible(true)}>
        <Text style={styles.filterText}>
          {typeFilter.startsWith('__DAY__')
            ? `Day ${typeFilter.replace('__DAY__', '')}`
            : `Type: ${typeFilter}`}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.filterBtn} onPress={() => {
        const order = ['Date (Newest)', 'Date (Oldest)', 'Duration', 'Calories'];
        const next = order[(order.indexOf(sortBy) + 1) % order.length];
        setSortBy(next);
      }}>
        <Text style={styles.filterText}>Sort By: {sortBy}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={iconNameForType(item.type)} size={22} color={'#fff'} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle}>{item.type}</Text>
          <Text style={styles.cardSubtitle}>
            {item.isRestDay ? 'Rest Day' : `${item.duration} min · ${item.calories || 0} kcal`}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.cardDate}>{displayDateShort(item.date)}</Text>
          <TouchableOpacity onPress={() => openMoreMenu(item)} style={styles.moreBtn}>
            <Ionicons name="ellipsis-vertical" size={18} color={TEXT_GRAY} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  function iconNameForType(type) {
    if (!type) return 'run';
    const t = type.toLowerCase();
    if (t.includes('strength') || t.includes('weight')) return 'dumbbell';
    if (t.includes('run') || t.includes('cardio')) return 'run';
    if (t.includes('yoga')) return 'yoga';
    if (t.includes('hiit')) return 'fire';
    if (t.includes('rest')) return 'bed-empty';
    return 'run';
  }

  function displayDateShort(iso) {
    if (!iso) return '';
    const d = isoToDate(iso);
    const now = new Date();
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    if (diff < 1) return 'Today';
    if (diff < 2) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  const openMoreMenu = (item) => {
    Alert.alert(
      'Options',
      '',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => handleEdit(item) },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(item.id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <TabSwitch />
      <FilterRow />

      {view === 'Calendar' ? (
        <View style={{ paddingHorizontal: 15 }}>
          <Calendar
            markingType={'multi-dot'}
            markedDates={markedDates}
            onDayPress={onDayPress}
            theme={{
              backgroundColor: BACKGROUND,
              calendarBackground: BACKGROUND,
              monthTextColor: '#000',
              dayTextColor: '#000',
              selectedDayBackgroundColor: BLUE,
              textSectionTitleColor: TEXT_GRAY,
              arrowColor: '#000',
              todayTextColor: BLUE,
            }}
          />

          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Recent Activity</Text>

          <FlatList
            data={finalDisplayed}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 120 }}
            ListEmptyComponent={<Text style={styles.emptyText}>No workouts to show.</Text>}
          />
        </View>
      ) : (
        <FlatList
          data={finalDisplayed}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15, paddingBottom: 120 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No workouts yet. Log one now!</Text>}
        />
      )}

      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={[FONTS.h3, { color: TEXT_WHITE, marginBottom: 12 }]}>Filter by Type</Text>
            <View style={{ maxHeight: 300 }}>
              <FlatList
                data={workoutTypes}
                keyExtractor={(t) => t}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setTypeFilter(item);
                      setFilterModalVisible(false);
                    }}
                    style={[
                      styles.typeRow,
                      item === typeFilter && { backgroundColor: '#E6F2FF' }
                    ]}
                  >
                    <Text style={{ color: TEXT_WHITE }}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            <TouchableOpacity style={styles.modalClose} onPress={() => setFilterModalVisible(false)}>
              <Text style={{ color: BLUE, fontWeight: '700' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    margin: 15,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 26,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 6,
    borderRadius: 25,
  },
  tabActive: {
    backgroundColor: BLUE,
  },
  tabText: {
    color: '#555',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#fff',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  filterBtn: {
    backgroundColor: '#e5e5e5',
    padding: 10,
    borderRadius: 20,
    marginVertical: 8,
    flex: 1,
    marginHorizontal: 6,
  },
  filterText: {
    color: TEXT_WHITE,
    fontSize: 13,
    textAlign: 'center',
  },
  sectionTitle: {
    ...FONTS.h3,
    color: TEXT_WHITE,
    fontSize: 18,
    marginTop: 12,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: TEXT_GRAY,
    marginTop: 6,
  },
  cardDate: {
    color: TEXT_GRAY,
    fontSize: 13,
  },
  moreBtn: {
    marginTop: 8,
  },
  emptyText: {
    color: TEXT_GRAY,
    textAlign: 'center',
    marginTop: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '86%',
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 18,
    maxHeight: '80%',
  },
  typeRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  modalClose: {
    marginTop: 12,
    alignItems: 'center',
  },
});
