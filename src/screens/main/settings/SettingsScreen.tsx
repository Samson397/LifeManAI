import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import DynamicBackground from '../../components/DynamicBackground';
import { useTheme } from '../../contexts/ThemeContext';

interface SettingItem {
  title: string;
  description: string;
  type: 'switch' | 'select';
  value: boolean | string;
  options?: string[];
}

const SettingsScreen = () => {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<{
    [key: string]: SettingItem;
  }>({
    notifications: {
      title: 'Push Notifications',
      description: 'Receive notifications about emotional insights and AI suggestions',
      type: 'switch',
      value: true,
    },
    emotionTracking: {
      title: 'Automatic Emotion Tracking',
      description: 'Periodically analyze emotions using camera and microphone',
      type: 'switch',
      value: true,
    },
    healthSync: {
      title: 'Health Data Sync',
      description: 'Sync with Apple Health or Fitbit data',
      type: 'switch',
      value: true,
    },
    privacyMode: {
      title: 'Privacy Mode',
      description: 'Enhanced privacy for emotion and health data',
      type: 'switch',
      value: false,
    },
    theme: {
      title: 'Theme',
      description: 'Choose background theme for the app',
      type: 'select',
      value: 'nature',
      options: ['nature', 'urban', 'abstract', 'cosmic'],
    },
    dataRetention: {
      title: 'Data Retention',
      description: 'How long to keep your emotional and interaction data',
      type: 'select',
      value: '30days',
      options: ['7days', '30days', '90days', '1year'],
    },
  });

  const updateSetting = (key: string, value: boolean | string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
      },
    }));
  };

  const renderSettingItem = (key: string, item: SettingItem) => {
    return (
      <View
        key={key}
        style={[
          styles.settingItem,
          { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
        ]}
      >
        <View style={styles.settingHeader}>
          <Text style={[styles.settingTitle, { color: theme.textColor }]}>
            {item.title}
          </Text>
          {item.type === 'switch' ? (
            <Switch
              value={item.value as boolean}
              onValueChange={(value) => updateSetting(key, value)}
              trackColor={{ false: '#767577', true: theme.accentColor }}
            />
          ) : (
            <View style={styles.selectContainer}>
              {item.options?.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor:
                        item.value === option
                          ? theme.accentColor
                          : 'transparent',
                      borderColor: theme.accentColor,
                    },
                  ]}
                  onPress={() => updateSetting(key, option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          item.value === option
                            ? '#FFFFFF'
                            : theme.textColor,
                      },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <Text style={[styles.settingDescription, { color: theme.textColor }]}>
          {item.description}
        </Text>
      </View>
    );
  };

  return (
    <DynamicBackground>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textColor }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.textColor }]}>
            Customize your experience
          </Text>
        </View>

        <View style={styles.settingsContainer}>
          {Object.entries(settings).map(([key, item]) =>
            renderSettingItem(key, item)
          )}
        </View>
      </ScrollView>
    </DynamicBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.8,
  },
  settingsContainer: {
    padding: 20,
  },
  settingItem: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
  },
});

export default SettingsScreen;
