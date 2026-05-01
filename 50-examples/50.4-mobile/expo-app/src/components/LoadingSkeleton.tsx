import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@hooks/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function LoadingSkeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonProps): JSX.Element {
  const { colors } = useTheme();
  const shimmerValue = useSharedValue(0);

  React.useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );
  }, [shimmerValue]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-SCREEN_WIDTH, SCREEN_WIDTH]
    );
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            width: SCREEN_WIDTH,
            height: '100%',
            backgroundColor: colors.surface,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

export function PostCardSkeleton(): JSX.Element {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.header}>
        <LoadingSkeleton width={40} height={40} borderRadius={20} />
        <View style={styles.headerText}>
          <LoadingSkeleton width={120} height={16} />
          <LoadingSkeleton width={80} height={13} style={{ marginTop: 6 }} />
        </View>
      </View>
      <LoadingSkeleton width="90%" height={20} style={{ marginTop: 12 }} />
      <LoadingSkeleton width="100%" height={14} style={{ marginTop: 8 }} />
      <LoadingSkeleton width="85%" height={14} style={{ marginTop: 6 }} />
      <LoadingSkeleton width="60%" height={14} style={{ marginTop: 6 }} />
      <View style={styles.footer}>
        <LoadingSkeleton width={60} height={20} />
        <LoadingSkeleton width={60} height={20} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    opacity: 0.3,
  },
  cardContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f2f2f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
});
