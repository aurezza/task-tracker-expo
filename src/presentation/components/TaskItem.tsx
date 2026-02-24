import { Task } from '@/domain/entities/Task';
import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  categoryName?: string;
  categoryColor?: string;
  style?: StyleProp<ViewStyle>;
  hideDescription?: boolean;
  isDeleting?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onPress, categoryName, categoryColor, style, hideDescription, isDeleting }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const wiggleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const squigglyValue = useRef(new Animated.Value(0)).current;
  const isWigglingRef = useRef(false);

  useEffect(() => {
    if (isDeleting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(squigglyValue, { toValue: 1, duration: 75, useNativeDriver: false }),
          Animated.timing(squigglyValue, { toValue: -1, duration: 150, useNativeDriver: false }),
          Animated.timing(squigglyValue, { toValue: 0, duration: 75, useNativeDriver: false }),
        ])
      ).start();

      Animated.sequence([
        Animated.delay(1500),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        squigglyValue.stopAnimation();
      });
    }
  }, [isDeleting, opacityValue, squigglyValue]);

  const squigglyBorderColor = squigglyValue.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['#ef4444', '#f97316', '#ef4444']
  });

  const squigglyBorderRadius1 = squigglyValue.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [4, 16, 30]
  });

  const squigglyBorderRadius2 = squigglyValue.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [30, 16, 4]
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkDeadline = () => {
      if (task.deadline && !task.completed) {
        const now = new Date().getTime();
        const deadline = new Date(task.deadline).getTime();
        const diff = deadline - now;

        if (diff > 0 && diff <= 30000) {
          if (!isWigglingRef.current) {
            isWigglingRef.current = true;
            Animated.loop(
              Animated.sequence([
                Animated.timing(wiggleValue, { toValue: 1, duration: 50, useNativeDriver: true }),
                Animated.timing(wiggleValue, { toValue: -1, duration: 50, useNativeDriver: true }),
                Animated.timing(wiggleValue, { toValue: 1, duration: 50, useNativeDriver: true }),
                Animated.timing(wiggleValue, { toValue: 0, duration: 50, useNativeDriver: true }),
                Animated.delay(1000)
              ])
            ).start();
          }
        } else {
          if (isWigglingRef.current) {
            isWigglingRef.current = false;
            wiggleValue.stopAnimation();
            wiggleValue.setValue(0);
          }
        }
      } else {
        if (isWigglingRef.current) {
          isWigglingRef.current = false;
          wiggleValue.stopAnimation();
          wiggleValue.setValue(0);
        }
      }
    };

    checkDeadline();
    interval = setInterval(checkDeadline, 1000);

    return () => {
      clearInterval(interval);
      wiggleValue.stopAnimation();
    };
  }, [task.deadline, task.completed, wiggleValue]);

  const wiggleInterpolation = wiggleValue.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-3deg', '3deg']
  });

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    setTimeout(() => {
      onPress();
    }, 250);
  };

  return (
    <AnimatedPressable 
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="mb-3 shadow-sm"
      style={[
        { 
          transform: [
            { scale: scaleValue },
            { rotate: wiggleInterpolation }
          ] 
        }, 
        style
      ]}
    >
      <Animated.View style={{ opacity: opacityValue, flex: 1 }}>
        <Animated.View
          className={clsx(
            "flex-1 relative flex-col bg-white",
            !isDeleting && "rounded-lg border border-gray-100"
          )}
          style={[
            { padding: 16 },
            isDeleting && {
              borderWidth: 3,
              borderStyle: 'dashed',
              borderColor: squigglyBorderColor,
              borderTopLeftRadius: squigglyBorderRadius1,
              borderBottomRightRadius: squigglyBorderRadius1,
              borderTopRightRadius: squigglyBorderRadius2,
              borderBottomLeftRadius: squigglyBorderRadius2,
              overflow: 'hidden',
            }
          ]}
        >
          {isDeleting ? (
            <View className="flex-1 h-20 items-center justify-center">
              <Image 
                source={require('@/assets/images/explosion.gif')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View className="flex-1 h-20">
              <View className="h-6 justify-center mb-1">
                 {task.deadline ? (
                     <View className={clsx("rounded-full px-2 py-0.5 self-start", new Date(task.deadline) < new Date() ? "bg-[#ffc35e]" : "bg-red-500")}>
                       <Text className="text-white text-[10px] font-bold">
                           {new Date(task.deadline) < new Date() ? "Past Due" : "Incoming"}
                       </Text>
                     </View>
                 ) : (
                     <View /> 
                 )}
              </View>
              <Text className={`text-lg font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`} numberOfLines={1}>
                {task.title}
              </Text>
              {(!hideDescription && task.description) && (
                <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
                  {task.description}
                </Text>
              )}
              {categoryName && (
                 <View className="mt-2 self-start rounded-full px-2 py-1 bg-gray-200" style={categoryColor ? { backgroundColor: categoryColor + '40' } : {}}>
                    <Text className="text-xs font-bold text-gray-700" style={categoryColor ? { color: categoryColor } : {}}>
                       {categoryName}
                    </Text>
                 </View>
              )}
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </AnimatedPressable>
  );
};
