import { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string | null;
  type: ToastType;
  show: (message: string, type?: ToastType) => void;
  hide: () => void;
}

export const useToast = create<ToastState>()((set) => ({
  message: null,
  type: 'info',
  show: (message, type = 'info') => set({ message, type }),
  hide: () => set({ message: null }),
}));

const ICONS: Record<ToastType, string> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

const COLORS: Record<ToastType, { bg: string; text: string; icon: string }> = {
  success: { bg: '#064e3b', text: '#d1fae5', icon: '#10b981' },
  error: { bg: '#4c0519', text: '#fee2e2', icon: '#f43f5e' },
  info: { bg: '#042f2e', text: '#ccfbf1', icon: '#14b8a6' },
};

export function ToastProvider() {
  const { message, type, hide } = useToast();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => hide());
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!message) return null;

  const c = COLORS[type];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: c.bg, transform: [{ translateY }], opacity },
      ]}
      pointerEvents="none"
    >
      <Ionicons name={ICONS[type] as any} size={20} color={c.icon} />
      <Text style={[styles.text, { color: c.text }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
});
