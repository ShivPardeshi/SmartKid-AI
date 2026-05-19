import { Platform } from 'react-native';

/** Height of the custom Liquid Glass bottom tab bar, accounting for floating capsule margins */
export const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 100 : 88;
