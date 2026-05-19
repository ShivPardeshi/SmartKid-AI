import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View, StyleSheet, Pressable, Animated, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { COLORS, SHADOWS } from '../utils/theme';

import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { NLPInsightsScreen } from '../screens/NLPInsightsScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ProfileSetup: undefined;
  MainApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TAB_CONFIG: Record<
  string,
  { label: string; focused: keyof typeof Ionicons.glyphMap; outline: keyof typeof Ionicons.glyphMap; color: string }
> = {
  Home: { label: 'Home', focused: 'home', outline: 'home-outline', color: COLORS.primary },
  Chat: { label: 'Chat', focused: 'chatbubbles', outline: 'chatbubbles-outline', color: COLORS.purple },
  'NLP Pipeline': { label: 'Insights', focused: 'analytics', outline: 'analytics-outline', color: COLORS.green },
};

interface ElasticTabButtonProps {
  isFocused: boolean;
  color: string;
  focusedIcon: keyof typeof Ionicons.glyphMap;
  outlineIcon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

/** Playful and premium elastic spring tab button */
const ElasticTabButton: React.FC<ElasticTabButtonProps> = ({
  isFocused,
  color,
  focusedIcon,
  outlineIcon,
  label,
  onPress,
}) => {
  const scaleValue = React.useRef(new Animated.Value(isFocused ? 1.15 : 1.0)).current;
  const pillScale = React.useRef(new Animated.Value(isFocused ? 1.0 : 0.5)).current;
  const pillOpacity = React.useRef(new Animated.Value(isFocused ? 1.0 : 0.0)).current;
  const dotScale = React.useRef(new Animated.Value(isFocused ? 1.0 : 0.0)).current;
  const labelOpacity = React.useRef(new Animated.Value(isFocused ? 1.0 : 0.6)).current;

  React.useEffect(() => {
    const springConfig = {
      friction: 5,
      tension: 45,
      useNativeDriver: true,
    };

    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: isFocused ? 1.15 : 1.0,
        ...springConfig,
      }),
      Animated.spring(pillScale, {
        toValue: isFocused ? 1.0 : 0.5,
        ...springConfig,
      }),
      Animated.timing(pillOpacity, {
        toValue: isFocused ? 1.0 : 0.0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(dotScale, {
        toValue: isFocused ? 1.0 : 0.0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(labelOpacity, {
        toValue: isFocused ? 1.0 : 0.6,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.90,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: isFocused ? 1.15 : 1.0,
      friction: 5,
      tension: 45,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessible
    >
      {/* Background pill growing behind the icon */}
      <Animated.View
        style={[
          styles.pill,
          {
            backgroundColor: color + '1C', // ~11% opacity color for vibrant child feel
            transform: [{ scale: pillScale }],
            opacity: pillOpacity,
          },
        ]}
      />

      {/* Main icon container with interactive spring scaling */}
      <Animated.View style={{ transform: [{ scale: scaleValue }], alignItems: 'center' }}>
        <Ionicons
          name={isFocused ? focusedIcon : outlineIcon}
          size={23}
          color={isFocused ? color : COLORS.textMuted}
        />
      </Animated.View>

      {/* Micro-label fading in nicely below */}
      <Animated.Text
        style={[
          styles.labelText,
          {
            opacity: labelOpacity,
            color: isFocused ? color : COLORS.textMuted,
            fontWeight: isFocused ? '700' : '600',
          },
        ]}
      >
        {label}
      </Animated.Text>

      {/* Active Glowing Dot (Aura Indicator) */}
      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor: color,
            transform: [{ scale: dotScale }],
            opacity: dotScale,
            ...SHADOWS.colored(color),
          },
        ]}
      />
    </Pressable>
  );
};

/** Liquid-glass background capsule for the tab bar */
const LiquidGlassTabBar = (props: any) => {
  if (Platform.OS !== 'ios') {
    // Beautiful clean white card for Android
    return (
      <View style={styles.androidBar}>
        {props.children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={85}
      tint="systemChromeMaterialLight"
      style={styles.glassBar}
    >
      {/* Subtle frosted highlight */}
      <View style={styles.glassHighlight} />
      {props.children}
    </BlurView>
  );
};

const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => {
      const { state, descriptors, navigation } = props;
      return (
        <LiquidGlassTabBar>
          <View style={styles.tabRow}>
            {state.routes.map((route: any, index: number) => {
              const isFocused = state.index === index;
              const cfg = TAB_CONFIG[route.name];

              return (
                <ElasticTabButton
                  key={route.key}
                  isFocused={isFocused}
                  color={cfg.color}
                  focusedIcon={cfg.focused}
                  outlineIcon={cfg.outline}
                  label={cfg.label}
                  onPress={() => {
                    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                    if (!isFocused && !event.defaultPrevented) {
                      navigation.navigate(route.name);
                    }
                  }}
                />
              );
            })}
          </View>
        </LiquidGlassTabBar>
      );
    }}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Chat" component={ChatScreen} />
    <Tab.Screen name="NLP Pipeline" component={NLPInsightsScreen} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainApp" component={TabNavigator} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  /** iOS liquid-glass tab bar */
  glassBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    height: 74,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    ...SHADOWS.strong,
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  /** Android fallback */
  androidBar: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    height: 74,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...SHADOWS.medium,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 74,
    paddingTop: 8,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    width: 54,
    height: 36,
    borderRadius: 18,
    top: 10,
  },
  labelText: {
    fontSize: 10.5,
    marginTop: 3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
  },
});
