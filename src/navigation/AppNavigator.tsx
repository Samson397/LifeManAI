import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import NavigationView from '../components/common/NavigationView';
import {
  DashboardScreen,
  AICompanionScreen,
  EmotionTrackerScreen,
  ProfileScreen
} from '../screens/main';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationView>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            switch (route.name) {
              case 'Dashboard':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'AI Companion':
                iconName = focused ? 'chatbubble' : 'chatbubble-outline';
                break;
              case 'Emotion':
                iconName = focused ? 'heart' : 'heart-outline';
                break;
              case 'Profile':
                iconName = focused ? 'person' : 'person-outline';
                break;
              default:
                iconName = 'help-outline';
            }

            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4A90E2',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E5E5',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
            ...Platform.select({
              ios: {
                boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)'
              },
              android: {
                elevation: 8
              },
              web: {
                boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)'
              }
            })
          },
          headerStyle: {
            backgroundColor: '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: '#E5E5E5',
            height: 60,
            ...Platform.select({
              ios: {
                boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)'
              },
              android: {
                elevation: 4
              },
              web: {
                boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)'
              }
            })
          },
          headerTitleStyle: {
            color: '#000000',
            fontSize: 20,
            fontWeight: '600',
          },
        })}
        initialRouteName="Dashboard"
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{
            title: 'LifeMate AI',
            headerShown: false,
          }}
        />
        <Tab.Screen 
          name="AI Companion" 
          component={AICompanionScreen}
          options={{
            title: 'Companion',
            headerShown: false,
          }}
        />
        <Tab.Screen 
          name="Emotion" 
          component={EmotionTrackerScreen}
          options={{
            title: 'Emotions',
            headerShown: false,
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            title: 'Profile',
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </NavigationView>
  );
};

export default AppNavigator;
