import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDonorAuth } from '../../hooks/useDonorAuth';
import { Theme } from '../../theme';
import PrivacyScreen from './PrivacyScreen';
import TermsScreen from './TermsScreen';
import AffiliationsScreen from './AffiliationsScreen';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const { role } = useDonorAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.item}
          activeOpacity={0.7}
          onPress={() => {
            // Navigate to PrivacyScreen
          }}
        >
          <AntDesign name="privacy" size={24} color={Theme.colors.primary} style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={styles.textTitle}>Privacy Policy</Text>
            <Text style={styles.textSubtitle}>How we protect your data</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={Theme.colors.textMuted} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          activeOpacity={0.7}
          onPress={() => {
            // Navigate to TermsScreen
          }}
        >
          <AntDesign name="apie" size={24} color={Theme.colors.primary} style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={styles.textTitle}>Terms of Service</Text>
            <Text style={styles.textSubtitle}>Rules for using the app</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={Theme.colors.textMuted} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          activeOpacity={0.7}
          onPress={() => {
            // Navigate to AffiliationsScreen
          }}
        >
          <AntDesign name="team" size={24} color={Theme.colors.primary} style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={styles.textTitle}>Affiliations</Text>
            <Text style={styles.textSubtitle}>Our partners and collaborators</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={Theme.colors.textMuted} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.text,
  },
  section: {
    marginTop: Theme.spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  icon: {
    marginRight: Theme.spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  textTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.text,
  },
  textSubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
});

export default SettingsScreen;