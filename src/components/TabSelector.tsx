import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {UserRole} from '../types';

interface TabSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const tabs: {role: UserRole; label: string}[] = [
  {role: 'All', label: 'All'},
  {role: 'Admin', label: 'Admin'},
  {role: 'Manager', label: 'Manager'},
];

export const TabSelector: React.FC<TabSelectorProps> = ({
  selectedRole,
  onRoleChange,
}) => {
  const [containerWidth, setContainerWidth] = React.useState(0);
  const translateX = useSharedValue(0);

  const tabWidth = containerWidth / tabs.length || 0;

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const {width} = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  React.useEffect(() => {
    if (!tabWidth) {
      return;
    }

    const activeIndex = tabs.findIndex(tab => tab.role === selectedRole);
    if (activeIndex === -1) {
      return;
    }

    translateX.value = withTiming(activeIndex * tabWidth, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
  }, [selectedRole, tabWidth, translateX]);

  const animatedThumbStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{translateX: translateX.value}],
      width: tabWidth - 8, 
    };
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabContainer} onLayout={handleContainerLayout}>
        {tabWidth > 0 && (
          <Animated.View style={[styles.thumb, animatedThumbStyle]} />
        )}
        {tabs.map(tab => {
          const isActive = selectedRole === tab.role;

          return (
            <TouchableOpacity
              key={tab.role}
              style={[styles.tab, isActive ? styles.activeTab : styles.inactiveTab]}
              onPress={() => onRoleChange(tab.role)}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.tabText,
                  isActive ? styles.activeTabText : styles.inactiveTabText,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F5FB',
    borderRadius: 999,
    padding: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: 'transparent',
  },
  thumb: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 999,
    backgroundColor: '#E7EFFC',
    borderWidth: 1,
    borderColor: '#1B6FF9',
    shadowColor: '#1B6FF9',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  inactiveTabText: {
    color: '#6B778C',
  },
  activeTabText: {
    color: '#1B6FF9',
  },
});
