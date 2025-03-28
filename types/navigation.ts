import { NavigationProp, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Register: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined; // Add Profile to root stack if needed
};

export type TabParamList = {
  HomeTab: undefined;
  Report: undefined;
  LiveMap: undefined;
  Profile: undefined;
};

// Combined navigation prop type for nested navigators
export type CombinedNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type AppNavigationProp = NavigationProp<RootStackParamList>;
export type TabNavigationProp = BottomTabNavigationProp<TabParamList>;

// Add this to make navigation prop available globally
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}