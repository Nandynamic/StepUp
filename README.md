# StepUp – Manual Fitness & Workout Logger

StepUp is a simple and clean mobile application designed for users who want to manually log their workouts, set weekly fitness goals, and track their progress—all without needing a backend.  
This app is built for a personal trainer who wants clients to stay accountable and consistent with daily and weekly fitness habits.

---

## Overview

StepUp focuses on helping users stay active by giving them:
- A **Today Card** showing whether today's workout is done.
- A visual **Weekly Progress** indicator.
- A clean interface to **log workouts**, **set goals**, and **track performance**.

All data is stored locally using **AsyncStorage**, making the app fast, offline-friendly, and perfect for personal use.

---

## Features

### 1. Workout Logging
Users can manually log workouts with:
- **Date**
- **Workout Type** (Cardio, Strength, Yoga, Other)
- **Duration (in minutes)**
- **Notes**

Additional features:
-  Add **custom workout types**
-  Edit existing logs
-  Delete logs
-  Data stored under key: `"workouts"`

---

###  2. Goals & Weekly Progress

Users can set weekly goals based on:
- Total workout minutes  
**or**
- Total number of workouts

The app provides:
- A **weekly summary** by workout type  
- A **progress bar** to visualize goal completion  
- **Best Week Tracking** – highest total weekly duration  
  - Stored under: `"bestWeek"`

---

###  3. Rest Days

Users can mark certain dates as **Rest Days**, which:
- Do **not** break workout streaks
- Help with recovery without affecting progress

Stored under: `"restDays"`

---

###  4. Overview Screen

The main dashboard includes:
- **Today Card** (Completed / Not Completed)
- **Weekly Progress**
- **Weekly Summary**
- **Best Week Card**
- **Recent Workout History**
- **Quick Add Workout Button**

---

##  Tech Stack

- **React Native (Expo)**
- **AsyncStorage** for local offline storage
- **Context API** for state management
- **React Navigation** for screen navigation
- Lightweight, minimal UI components

---

##  AsyncStorage Keys Used

| Purpose | Key |
|--------|------|
| Workout logs | `"workouts"` |
| Weekly goals | `"goals"` |
| Custom workout types | `"customWorkoutTypes"` |
| Best week data | `"bestWeek"` |
| Rest days | `"restDays"` |

---

##  Ideal For

- Personal trainer’s clients  
- People who prefer **manual workout logging**  
- Users who want an **offline-first** fitness tracker  
- Simple fitness habit building  

---

##  Conclusion

**StepUp** empowers users to maintain consistent fitness habits through manual logging, clear progress tracking, and flexible rest days.  
With an intuitive UI and offline-ready architecture, it provides everything a user needs to stay on top of their weekly goals—one day at a time.

---

