import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Modal,
  Platform,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  saveWorkout,
  updateWorkout,
  deleteWorkout,
  getCustomTypes,
  addCustomType
} from '../utils/storage';

export default function AddWorkout() {
  const navigation = useNavigation();
  const route = useRoute();
  const editingWorkout = route.params?.workout;

  const [workoutType, setWorkoutType] = useState('Strength');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [isRestDay, setIsRestDay] = useState(false);

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calories, setCalories] = useState('');
  const [intensity, setIntensity] = useState('Moderate');

  const [customTypes, setCustomTypes] = useState([]);
  const [defaultTypes] = useState(['Strength', 'Cardio', 'Yoga', 'HIIT', 'Pilates', 'Other']);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const intensityLevels = ['Low', 'Moderate', 'High', 'Extreme'];

  useEffect(() => {
    loadTypes();
    if (editingWorkout) {
      setWorkoutType(editingWorkout.type);
      setDuration(editingWorkout.duration.toString());
      setNotes(editingWorkout.notes);
      setIsRestDay(editingWorkout.isRestDay);
      setDate(new Date(editingWorkout.date));
      if (editingWorkout.calories) setCalories(editingWorkout.calories.toString());
      if (editingWorkout.intensity) setIntensity(editingWorkout.intensity);
    } else if (route.params?.initialDate) {
      setDate(new Date(route.params.initialDate));
    }
  }, [editingWorkout, route.params]);

  const loadTypes = async () => {
    try {
      const types = await getCustomTypes();
      const uniqueCustom = types.filter(t => !defaultTypes.includes(t));
      setCustomTypes(uniqueCustom);
    } catch (error) {}
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleAddCustomType = async () => {
    if (!newTypeName.trim()) return;
    const trimmedName = newTypeName.trim();
    if (defaultTypes.includes(trimmedName) || customTypes.includes(trimmedName)) {
      Alert.alert('Error', 'This workout type already exists.');
      return;
    }
    try {
      await addCustomType(trimmedName);
      setCustomTypes([...customTypes, trimmedName]);
      setWorkoutType(trimmedName);
      setNewTypeName('');
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save custom type');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWorkout(editingWorkout.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete workout');
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!isRestDay && !duration) {
      Alert.alert('Missing Field', 'Please enter a duration for your workout.');
      return;
    }

    try {
      const workoutData = {
        id: editingWorkout ? editingWorkout.id : `uuid-${Date.now()}`,
        date: date.toISOString().split('T')[0],
        type: isRestDay ? 'Rest' : workoutType,
        duration: isRestDay ? 0 : parseInt(duration),
        calories: isRestDay ? 0 : parseInt(calories) || 0,
        intensity: isRestDay ? 'Rest' : intensity,
        notes,
        isRestDay
      };

      const json = await AsyncStorage.getItem("stepup_data");
      const data = json ? JSON.parse(json) : { workouts: [] };

      if (editingWorkout) {
        const updated = data.workouts.map(w =>
          w.id === workoutData.id ? workoutData : w
        );
        data.workouts = updated;
      } else {
        data.workouts.push(workoutData);
      }

      await AsyncStorage.setItem("stepup_data", JSON.stringify(data));
      Alert.alert('Success', 'Workout saved successfully!');
      navigation.goBack();

    } catch (error) {
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  const allTypes = [...defaultTypes, ...customTypes];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={[FONTS.h2, { color: "#000" }]}>{editingWorkout ? 'Edit Workout' : 'Log Workout'}</Text>
        {editingWorkout ? (
          <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
        <TouchableOpacity style={styles.dateCard} onPress={() => setShowDatePicker(true)}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={24} color="#000" style={{ marginRight: 10 }} />
            <Text style={styles.dateText}>{date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="gray" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            themeVariant="light"
          />
        )}

        <View style={styles.card}>
          <View style={styles.rowCenter}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="bed-outline" size={24} color="#000" style={{ marginRight: 10 }} />
              <Text style={styles.label}>Rest Day</Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#4C9FFF" }}
              thumbColor={isRestDay ? "#fff" : "#f4f3f4"}
              onValueChange={setIsRestDay}
              value={isRestDay}
            />
          </View>
          <Text style={styles.subtext}>Mark this day as a rest day to keep your streak.</Text>
        </View>

        {!isRestDay && (
          <>
            <Text style={styles.sectionTitle}>Workout Type</Text>
            <View style={styles.typeContainer}>
              {allTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    workoutType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setWorkoutType(type)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      workoutType === type && styles.typeTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.typeButton, styles.addTypeButton]}
                onPress={() => setIsModalVisible(true)}
              >
                <Ionicons name="add" size={20} color="#000" />
                <Text style={[styles.typeText, { marginLeft: 5 }]}>Custom</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rowContainer}>
              <View style={[styles.inputCard, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Duration</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' }}>
                  <TextInput
                    style={styles.durationInput}
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="gray"
                  />
                  <Text style={styles.unitText}>min</Text>
                </View>
              </View>

              <View style={[styles.inputCard, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Calories</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' }}>
                  <TextInput
                    style={styles.durationInput}
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="gray"
                  />
                  <Text style={styles.unitText}>kcal</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Intensity</Text>
            <View style={styles.typeContainer}>
              {intensityLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.typeButton,
                    intensity === level && styles.typeButtonActive,
                    { paddingHorizontal: 20 }
                  ]}
                  onPress={() => setIntensity(level)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      intensity === level && styles.typeTextActive
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="How did it feel?..."
          placeholderTextColor="gray"
          multiline
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>Save Workout</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Workout Type</Text>
            <TextInput
              style={styles.modalInput}
              value={newTypeName}
              onChangeText={setNewTypeName}
              placeholder="e.g. Pilates"
              placeholderTextColor="gray"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddCustomType}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  iconButton: {
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 20,
  },
  scrollView: {
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: "#000",
    marginBottom: 15,
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 18,
  },
  card: {
    backgroundColor: "#f2f2f2",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  dateCard: {
    backgroundColor: "#f2f2f2",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: "#000",
    fontSize: 16,
    fontWeight: '600',
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    color: "#000",
    fontSize: 16,
    fontWeight: '600',
  },
  subtext: {
    color: "gray",
    fontSize: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: "#e6e6e6",
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  typeButtonActive: {
    backgroundColor: "#4C9FFF",
    borderColor: "#4C9FFF",
  },
  typeText: {
    color: "#333",
    fontWeight: '600',
    fontSize: 14,
  },
  typeTextActive: {
    color: "#fff",
  },
  addTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#e6e6e6",
    borderColor: "#ccc",
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputCard: {
    backgroundColor: "#f2f2f2",
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    color: "gray",
    fontSize: 14,
    marginBottom: 5,
  },
  durationInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: "#000",
    minWidth: 40,
    textAlign: 'center',
  },
  unitText: {
    color: "gray",
    fontSize: 14,
    marginLeft: 5,
  },
  notesInput: {
    backgroundColor: "#f2f2f2",
    borderRadius: 15,
    padding: 15,
    color: "#000",
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#4C9FFF",
    padding: 15,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    color: "#000",
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: "#f2f2f2",
    color: "#000",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: "#e6e6e6",
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: "#4C9FFF",
    marginLeft: 10,
  },
  modalButtonText: {
    color: "#000",
    fontWeight: '600',
  },
});
