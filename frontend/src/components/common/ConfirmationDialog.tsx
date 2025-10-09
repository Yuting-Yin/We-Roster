import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLOR } from '@/theme/colors';
import { sx, sy } from '@/theme/metrics';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmStyle = 'default',
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleCancel}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={styles.backdrop} onPress={handleCancel} />
        <Animated.View 
          style={[
            styles.dialog, 
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={confirmStyle === 'destructive' ? 'warning' : 'help-circle'} 
                  size={sx(22)} 
                  color={confirmStyle === 'destructive' ? COLOR.error : COLOR.brand} 
                />
              </View>
              <Text style={styles.title}>{title}</Text>
            </View>
            
            <Text style={styles.message}>{message}</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <Pressable 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </Pressable>
            
            <Pressable 
              style={[
                styles.button, 
                confirmStyle === 'destructive' ? styles.confirmButtonDestructive : styles.confirmButton
              ]} 
              onPress={handleConfirm}
            >
              <Text style={[
                styles.confirmButtonText,
                confirmStyle === 'destructive' && styles.confirmButtonTextDestructive
              ]}>
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: sx(20),
    minHeight: '100vh', // Ensure full height coverage
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: sx(12),
    padding: sx(16),
    width: '90%',
    maxWidth: sx(350),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sy(12),
  },
  iconContainer: {
    marginRight: sx(8),
  },
  title: {
    fontSize: sx(18),
    fontWeight: '600',
    color: COLOR.ink,
    flex: 1,
  },
  message: {
    fontSize: sx(15),
    color: COLOR.label,
    lineHeight: sy(20),
    marginBottom: sy(16),
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: sx(10),
    marginTop: sx(4), // Ensure buttons are always visible
  },
  button: {
    flex: 1,
    paddingVertical: sy(10),
    paddingHorizontal: sx(12),
    borderRadius: sx(8),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sy(44), // Ensure minimum touch target
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: COLOR.divider,
  },
  cancelButtonText: {
    fontSize: sx(16),
    fontWeight: '600',
    color: COLOR.label,
  },
  confirmButton: {
    backgroundColor: COLOR.brand,
  },
  confirmButtonText: {
    fontSize: sx(16),
    fontWeight: '600',
    color: '#fff',
  },
  confirmButtonDestructive: {
    backgroundColor: COLOR.error,
  },
  confirmButtonTextDestructive: {
    color: '#fff',
  },
});
