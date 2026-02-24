import { ScreenContainer } from '@/presentation/components/ScreenContainer';
import { TaskItem } from '@/presentation/components/TaskItem';
import { useAuthStore } from '@/presentation/store/useAuthStore';
import { useCategoryStore } from '@/presentation/store/useCategoryStore';
import { useTaskStore } from '@/presentation/store/useTaskStore';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function CalendarScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { tasks, fetchTasks } = useTaskStore();
    const { categories, fetchCategories } = useCategoryStore();
    
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        if (user) {
            fetchTasks(user.id);
            fetchCategories(user.id);
        }
    }, [user]);

    // Calendar Logic
    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const changeMonth = (increment: number) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
    };

    const isSameDate = (d1: Date, d2: Date) => 
        d1.getDate() === d2.getDate() && 
        d1.getMonth() === d2.getMonth() && 
        d1.getFullYear() === d2.getFullYear();

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];

        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-${i}`} className="w-[14.28%] h-10" />);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
            const isSelected = isSameDate(date, selectedDate);
            const isToday = isSameDate(date, new Date());
            
            // Check for tasks
            const hasTasks = tasks.some(t => t.deadline && isSameDate(new Date(t.deadline), date));

            days.push(
                <TouchableOpacity 
                    key={`day-${i}`} 
                    className="w-[14.28%] h-10 items-center justify-center"
                    onPress={() => setSelectedDate(date)}
                >
                    <View className={clsx(
                        "w-8 h-8 items-center justify-center rounded-full",
                        isSelected ? "bg-[#d98f7a]" : isToday ? "bg-[#f9e8e2]" : "bg-transparent"
                    )}>
                        <Text className={clsx("font-medium text-xs", isSelected ? "text-white" : isToday ? "text-[#d98f7a]" : "text-gray-900")}>
                            {i}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }

        return <View className="flex-row flex-wrap">{days}</View>;
    };

    // Task Filtering
    const doneTasks = tasks?.filter(t => t.completed && t.deadline && isSameDate(new Date(t.deadline), selectedDate));
    const dueTasks = tasks?.filter(t => !t.completed && t.deadline && isSameDate(new Date(t.deadline), selectedDate));

    if (!user) {
        return (
            <ScreenContainer center>
                <View className="items-center">
                    <Ionicons name="lock-closed-outline" size={64} color="#4f4538" />
                    <Text className="text-xl font-bold text-gray-800 mt-4 text-center">Please Log In</Text>
                    <Text className="text-gray-500 text-center mt-2 mb-6">You need to be logged in to view your calendar.</Text>
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

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
                <Text className="text-3xl font-bold text-gray-900 my-4">Calendar</Text>

                {/* Calendar View */}
                <View className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 mb-6">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-2">
                        <TouchableOpacity 
                            onPress={() => {
                                const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
                                setCurrentMonth(newDate);
                                setSelectedDate(newDate);
                            }} 
                            className="p-2"
                        >
                            <Ionicons name="chevron-back" size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-lg font-bold text-gray-800">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </Text>
                        <TouchableOpacity 
                            onPress={() => {
                                const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
                                setCurrentMonth(newDate);
                                setSelectedDate(newDate);
                            }} 
                            className="p-2">
                            <Ionicons name="chevron-forward" size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    {/* Weekdays */}
                    <View className="flex-row mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <Text key={day} className="w-[14.28%] text-center text-gray-400 font-bold text-xs uppercase">
                                {day}
                            </Text>
                        ))}
                    </View>

                    {/* Grid */}
                    {renderCalendar()}
                </View>

                {/* Selected Date Header */}
                <View className="mb-4">
                    <Text className="text-lg font-bold text-gray-800">
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>
                </View>

                {/* Done Tasks */}
                <View className="mb-6">
                    <View className="flex-row items-center mb-3">
                        <View className="w-3 h-3 rounded-full bg-[#007663] mr-2" />
                        <Text className="text-md font-semibold text-gray-700">Completed Tasks</Text>
                        <Text className="ml-2 bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-sm font-bold">
                            {doneTasks.length}
                        </Text>
                    </View>
                    
                    {doneTasks.length > 0 ? (
                        doneTasks.map(task => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                onPress={() => {}}
                                categoryName={categories.find(c => c.id === task.category_id)?.name}
                                categoryColor={categories.find(c => c.id === task.category_id)?.color}
                                hideDescription
                            />
                        ))
                    ) : (
                        <Text className="text-gray-500 italic ml-5">No completed tasks for this day.</Text>
                    )}
                </View>

                {/* Due Tasks */}
                <View className="mb-6">
                    <View className="flex-row items-center mb-3">
                        <View className="w-3 h-3 rounded-full bg-[#d98f7a] mr-2" />
                        <Text className="text-lg font-semibold text-gray-700">Due / Pending Tasks</Text>
                        <Text className="ml-2 bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs font-bold">
                            {dueTasks.length}
                        </Text>
                    </View>
                    
                    {dueTasks.length > 0 ? (
                        dueTasks.map(task => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                onPress={() => {}}
                                categoryName={categories.find(c => c.id === task.category_id)?.name}
                                categoryColor={categories.find(c => c.id === task.category_id)?.color}
                                hideDescription
                            />
                        ))
                    ) : (
                        <Text className="text-gray-500 italic ml-5">No pending tasks due this day.</Text>
                    )}
                </View>

            </ScrollView>
        </ScreenContainer>
    );
}
