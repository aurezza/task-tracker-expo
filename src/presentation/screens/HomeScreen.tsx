import { CalendarService } from '@/core/calendar';
import { NotificationService } from '@/core/notifications';
import { ScreenContainer } from '@/presentation/components/ScreenContainer';
import { TaskItem } from '@/presentation/components/TaskItem';
import { useAuthStore } from '@/presentation/store/useAuthStore';
import { useCategoryStore } from '@/presentation/store/useCategoryStore';
import { useTaskStore } from '@/presentation/store/useTaskStore';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';




export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { tasks, fetchTasks, addTask, updateTask, toggleTaskCompletion, deleteTask, isLoading } = useTaskStore();
  const { categories, fetchCategories } = useCategoryStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // New state for Task Options Modal
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [activeTask, setActiveTask] = useState<any | null>(null);

  // New state for Delete Confirmation Modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [explodingTaskId, setExplodingTaskId] = useState<string | null>(null);

  // New state for Lion Alert
  const [lionModalVisible, setLionModalVisible] = useState(false);
  const [lionTask, setLionTask] = useState<any | null>(null);


  useEffect(() => {
    NotificationService.setup();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTasks(user.id);
      fetchCategories(user.id);
    }
  }, [user]);

  // Check for upcoming deadlines
  useEffect(() => {
    if (lionModalVisible) return;

    const interval = setInterval(() => {
        const now = new Date();
        const incomingTask = tasks.find(t => {
            if (!t.deadline || t.completed) return false;
            const due = new Date(t.deadline);
            const diffInSeconds = (due.getTime() - now.getTime()) / 1000;
            return diffInSeconds > 0 && diffInSeconds <= 30;
        });

        if (incomingTask) {
            setLionTask(incomingTask);
            setLionModalVisible(true);
            NotificationService.scheduleNotification(
                "Task Deadline Approaching! 🦁",
                `"${incomingTask.title}" needs doing immediately!`
            );
        }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [tasks, lionModalVisible]);

  if (!user) {
     return (
        <ScreenContainer center>
           <View className="items-center">
              <Ionicons name="lock-closed-outline" size={64} color="#4f4538" />
              <Text className="text-xl font-bold text-gray-800 mt-4 text-center">Please Log In</Text>
              <Text className="text-gray-500 text-center mt-2 mb-6">You need to be logged in to manage your tasks.</Text>
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/profile')}
                className="bg-[#d98f7a] px-6 py-3 rounded-lg"
              >
                  <Text className="text-white font-bold">Go to Profile</Text>
              </TouchableOpacity>
           </View>
        </ScreenContainer>
     );
  }

  const handleCreateOrUpdateTask = async () => {
    if (!newTaskTitle.trim() || !user) return;
    
    const deadlineISO = deadline ? deadline.toISOString() : undefined;

    if (editingTask) {
        await updateTask(editingTask.id, user.id, {
            title: newTaskTitle,
            description: newTaskDesc,
            category_id: selectedCategoryId,
            deadline: deadlineISO
        });
    } else {
        await addTask(user.id, newTaskTitle, newTaskDesc, selectedCategoryId, deadlineISO);
        
        if (deadline) {
          const reminderDate = new Date(deadline.getTime() - 60 * 1000);
          if (reminderDate > new Date()) {
            await NotificationService.scheduleNotificationAt(
              "Task Deadline Approaching! ⏳", 
              `"${newTaskTitle}" is due in 1 minute!`, 
              reminderDate
            );
          }
          
          // Auto-sync to calendar
          await CalendarService.addEvent(newTaskTitle, deadline, newTaskDesc);
        }
    }

    setNewTaskTitle('');
    setNewTaskDesc('');
    setSelectedCategoryId(undefined);
    setDeadline(undefined);
    setEditingTask(null);
    setModalVisible(false);
  };

  const openEditModal = (task: any) => {
      setEditingTask(task);
      setNewTaskTitle(task.title);
      setNewTaskDesc(task.description || '');
      setSelectedCategoryId(task.category_id);
      setDeadline(task.deadline ? new Date(task.deadline) : undefined);
      setModalVisible(true);
  };

  const getSortedTasks = () => {
      return [...tasks].sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          if (a.deadline) return -1;
          if (b.deadline) return 1;
          return 0;
      });
  };

  const sortedTasks = getSortedTasks();
  const priorityTask = sortedTasks.length > 0 ? sortedTasks[0] : null;
  const otherTasks = sortedTasks.length > 1 ? sortedTasks.slice(1) : [];

  const handleLogout = async () => {
    await logout();
    // After logout, user becomes null, so HomeScreen will render "Please Log In" view automatically.
    // Or we can redirect to Profile tab where login form is shown.
    router.replace('/(tabs)/profile');
  };

  const confirmDelete = (taskId: string) => {
      setTaskToDelete(taskId);
      setDeleteModalVisible(true);
  };

  const executeDelete = async () => {
      if (taskToDelete && user) {
          const taskId = taskToDelete;
          setDeleteModalVisible(false);
          setTaskToDelete(null);
          setExplodingTaskId(taskId);
          
          setTimeout(async () => {
              setExplodingTaskId(null);
              await deleteTask(taskId, user.id);
          }, 1800);
      }
  };

  return (
    <ScreenContainer>
      <View className="flex-row justify-between items-center mb-6 mt-4">
        <Text className="text-3xl font-bold text-gray-900">My Tasks</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {isLoading && tasks.length === 0 ? (
        <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
      ) : (
        <FlatList
          className="flex-1"
          data={otherTasks}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          ListHeaderComponent={
              priorityTask ? (
                <View className="mb-6 w-full bg-transparent" style={{ zIndex: 10 }}>
                    {(() => {
                        const item = priorityTask;
                        const category = categories.find(c => c.id === item.category_id);
                        return (
                          <View>
                            <TaskItem 
                              task={item} 
                              onPress={() => {
                                  setActiveTask(item);
                                  setOptionsModalVisible(true);
                              }}
                              categoryName={category?.name}
                              categoryColor={category?.color}
                              isDeleting={item.id === explodingTaskId}
                              style={{ height: 140 }}
                            />
                          </View>
                        );
                    })()}
                </View>
              ) : null
          }
          renderItem={({ item }) => {
            const category = categories.find(c => c.id === item.category_id);
            return (
              <View className="w-[48%] mb-2">
                <TaskItem  
                  task={item} 
                  onPress={() => {
                      setActiveTask(item);
                      setOptionsModalVisible(true);
                  }}
                  categoryName={category?.name}
                  categoryColor={category?.color}
                  style={{ height: 180 }}
                  isDeleting={item.id === explodingTaskId}
                />
              </View>
            );
          }}
          ListEmptyComponent={
            !priorityTask ? (
                <View className="items-center mt-20">
                  <Ionicons name="clipboard-outline" size={64} color="#4f4538" />
                  <Text className="text-gray-600 mt-4 text-lg">No tasks yet</Text>
                </View>
            ) : null
          }
          contentContainerClassName="pb-24 px-1"
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-8 right-6 bg-[#d98f7a] w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => {
            setEditingTask(null);
            setNewTaskTitle('');
            setNewTaskDesc('');
            setSelectedCategoryId(undefined);
            setDeadline(undefined);
            setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Basic Create Task Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          className="flex-1 justify-center bg-black/50"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-white rounded-3xl p-6 mx-4" onStartShouldSetResponder={() => true}>
            <Text className="text-xl font-bold mb-4">{editingTask ? 'Edit Task' : 'New Task'}</Text>
            <TextInput  
              placeholder="Task Title"
              className="border-b border-gray-300 p-3 mb-4 text-lg"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />
            <TextInput 
              placeholder="Description (optional)"
              className="border border-gray-300 rounded-lg p-3 mb-6 text-base h-24"
              value={newTaskDesc}
              onChangeText={setNewTaskDesc}
              multiline
              textAlignVertical="top"
            />

            {/* Category Selector */}
            {categories.length > 0 && (
                <View className="mb-4">
                    <Text className="text-gray-600 mb-2 font-medium">Category</Text>
                    <FlatList 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        data={categories}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                onPress={() => setSelectedCategoryId(selectedCategoryId === item.id ? undefined : item.id)}
                                className={`mr-2 px-3 py-2 rounded-full border ${selectedCategoryId === item.id ? 'bg-[#f9e8e2] border-[#d98f7a]' : 'bg-gray-50 border-gray-200'}`}
                            >
                                <Text className={selectedCategoryId === item.id ? 'text-[#d98f7a] font-bold' : 'text-gray-600'}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            {/* Deadline Selector */}
            <View className="mb-6">
                <View className="mb-2">
                    <View className="flex-row items-center">
                        <TouchableOpacity 
                            onPress={() => {
                                const newCheckedState = !deadline;
                                if (newCheckedState) {
                                    setDeadline(new Date());
                                    setShowDatePicker(true);
                                } else {
                                    setDeadline(undefined);
                                    setShowDatePicker(false);
                                }
                            }}
                        >
                           <Ionicons 
                                name={deadline ? "checkbox" : "square-outline"} 
                                size={24} 
                                color={deadline ? "#d98f7a" : "#9CA3AF"} 
                           />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={() => {
                                if (deadline) {
                                  // Edit existing
                                  if (Platform.OS === 'android') setShowDatePicker(true);
                                  // iOS inline picker is already visible
                                } else {
                                  // Set new
                                  setDeadline(new Date());
                                  setShowDatePicker(true);
                                }
                            }}
                            className="ml-2"
                        >
                           <Text className="text-gray-700 text-lg">
                               {deadline ? deadline.toLocaleString() : 'Set Deadline'}
                           </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* iOS: Compact Picker (Always visible if deadline exists) */}
                {Platform.OS === 'ios' && deadline && (
                     <DateTimePicker
                        value={deadline}
                        mode="datetime"
                        display="compact"
                        themeVariant="light"
                        accentColor="#d98f7a"
                        onChange={(event, selectedDate) => {
                            if (selectedDate) setDeadline(selectedDate);
                        }}
                        style={{ alignSelf: 'flex-start', marginTop: 8 }}
                    />
                )}

                {/* Android: Modal Picker (Only visible when showDatePicker is true) */}
                {Platform.OS === 'android' && showDatePicker && (
                    <DateTimePicker
                        value={deadline || new Date()}
                        mode="datetime"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setDeadline(selectedDate);
                        }}
                    />
                )}
            </View>
            
            <View className="flex-row justify-end gap-4">
              <TouchableOpacity onPress={() => setModalVisible(false)} className="px-4 py-2">
                <Text className="text-gray-500 font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleCreateOrUpdateTask} 
                className="bg-[#d98f7a] px-6 py-2 rounded-lg"
                disabled={!newTaskTitle.trim()}
              >
                <Text className="text-white font-bold">{editingTask ? 'Save' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Task Options Custom Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={optionsModalVisible}
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <TouchableOpacity 
            className="flex-1 justify-center items-center bg-black/50"
            activeOpacity={1}
            onPress={() => setOptionsModalVisible(false)}
        >
          <View className="bg-white p-6 rounded-2xl items-center justify-center w-4/5" onStartShouldSetResponder={() => true}>
             {activeTask && (
                 <Text className="text-xl font-bold text-center mb-6 text-gray-900" numberOfLines={2}>
                     {activeTask.title}
                 </Text>
             )}
             
             <View className="flex-row gap-8 justify-center">
                 {/* Edit Button */}
                 <TouchableOpacity 
                    onPress={() => {
                        setOptionsModalVisible(false);
                        if (activeTask) openEditModal(activeTask);
                    }}
                    className="items-center"
                 >
                    <View className="w-16 h-16 rounded-full bg-[#ffc35e] items-center justify-center shadow-sm mb-2">
                        <Ionicons name="create" size={32} color="white" />
                    </View>
                    <Text className="font-medium text-gray-700">Edit</Text>
                 </TouchableOpacity>

                 {/* Complete Button */}
                 <TouchableOpacity 
                    onPress={async () => {
                        setOptionsModalVisible(false);
                        if (activeTask && user) {
                             await toggleTaskCompletion(activeTask.id, user.id, activeTask.completed);
                             if (!activeTask.completed) {
                               await NotificationService.scheduleNotification("Task Completed!", `Great job completing "${activeTask.title}"!`);
                             }
                        }
                    }}
                    className="items-center"
                 >
                    <View className="w-16 h-16 rounded-full bg-[#007663] items-center justify-center shadow-sm mb-2">
                        <Ionicons name={activeTask?.completed ? "arrow-undo" : "checkmark"} size={32} color="white" />
                    </View>
                     <Text className="font-medium text-gray-700">{activeTask?.completed ? 'Undo' : 'Complete'}</Text>
                 </TouchableOpacity>

                 {/* Delete Button */}
                 <TouchableOpacity 
                    onPress={() => {
                        setOptionsModalVisible(false);
                        if (activeTask) confirmDelete(activeTask.id);
                    }}
                    className="items-center"
                 >
                    <View className="w-16 h-16 rounded-full bg-[#c1554e] items-center justify-center shadow-sm mb-2">
                        <Ionicons name="trash" size={32} color="white" />
                    </View>
                    <Text className="font-medium text-gray-700">Delete</Text>
                 </TouchableOpacity>
             </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <TouchableOpacity 
            className="flex-1 justify-center items-center bg-black/50"
            activeOpacity={1}
            onPress={() => setDeleteModalVisible(false)}
        >
          <View className="bg-white p-6 rounded-2xl items-center justify-center w-4/5" onStartShouldSetResponder={() => true}>
             <Text className="text-xl font-semibold text-center mb-2 text-gray-900">Delete <Text className="italic">{activeTask?.title || ""}</Text></Text>
             <Text className="text-gray-500 text-center mb-6">Are you sure you want to delete this task? This action cannot be undone.</Text>
             
             <View className="flex-row gap-4 w-full">
                 <TouchableOpacity 
                    onPress={() => setDeleteModalVisible(false)}
                    className="flex-1 bg-gray-100 py-3 rounded-xl items-center"
                 >
                    <Text className="font-bold text-gray-700">Cancel</Text>
                 </TouchableOpacity>

                 <TouchableOpacity 
                    onPress={executeDelete}
                    className="flex-1 bg-red-500 py-3 rounded-xl items-center"
                 >
                    <Text className="font-bold text-white">Delete</Text>
                 </TouchableOpacity>
             </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Lion Alert Modal */}
      <Modal
         animationType="slide"
         transparent={false}
         visible={lionModalVisible}
         onRequestClose={() => setLionModalVisible(false)}
      >
         <View className="flex-1 bg-white items-center justify-center p-6">
            <Text className="text-3xl font-bold text-center mb-8 text-gray-900">
               {lionTask ? `${lionTask.title} task needs doing!` : 'Task Incoming'}
            </Text>
            
            <View className="w-full h-72 mb-10 items-center justify-center overflow-hidden rounded-xl bg-white">
                 {/*  Using default source or uri if local file loading is tricky with require in Expo depending on config, but standard require should work */}
                 <Image 
                    source={require('@/assets/images/lion.gif')} 
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                 />
            </View>

            <TouchableOpacity 
               onPress={() => setLionModalVisible(false)}
               className="bg-[#d98f7a] px-10 py-4 rounded-full shadow-lg"
            >
               <Text className="text-white text-xl font-bold">I Got It!</Text>
            </TouchableOpacity>
         </View>
      </Modal>
    </ScreenContainer>
  );
}
