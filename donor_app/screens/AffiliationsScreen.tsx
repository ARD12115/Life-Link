import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { Theme } from '../../theme';

const AffiliationsScreen = () => {
  const openLink = (url) => Linking.openURL(url);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Affiliations & Partners</Text>
        <Text style={styles.subtitle}>Last updated: September 19, 2026</Text>
        
        <Text style={styles.sectionTitle}>Medical Institutions</Text>
        <View style={styles.affiliationBlock}>
          <Text style={styles.affiliationTitle}>Canara Engineering College Hospital</Text>
          <Text style={styles.affiliationBody}>
            Our founding medical partner, providing clinical guidance and emergency response coordination.
          </Text>
        </View>
        <View style={styles.affiliationBlock}>
          <Text style={styles.affiliationTitle}>Indian Red Cross Society</Text>
          <Text style={styles.affiliationBody}>
            Collaborating on blood donation drives and donor awareness programs.
          </Text>
        </View>
        <View style={styles.affiliationBlock}>
          <Text style={styles.affiliationTitle}>Karnataka State Blood Transfusion Council</Text>
          <Text style={styles.affiliationBody}>
            Working together to ensure safe and ethical blood transfusion practices across the state.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: Theme.spacing.lg,
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.md,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textMuted,
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.text,
    marginVertical: Theme.spacing.md,
  },
  affiliationBlock: {
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  affiliationTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  affiliationBody: {
    ...Theme.typography.body,
  },
});

export default AffiliationsScreen;