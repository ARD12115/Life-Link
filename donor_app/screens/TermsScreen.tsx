import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { Theme } from '../../theme';

const TermsScreen = () => {
  const openLink = (url) => Linking.openURL(url);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.subtitle}>Last updated: September 19, 2026</Text>
        
        <Text style={styles.sectionTitle}>Acceptance of Terms</Text>
        <Text style={styles.body}>
          By accessing or using the LifeLink mobile application, you agree to be bound by these Terms of Service.
        </Text>
        
        <Text style={styles.sectionTitle}>Description of Service</Text>
        <Text style={styles.body}>
          LifeLink is an emergency blood donor ecosystem that connects hospitals in need of blood with voluntary donors in real-time.
        </Text>
        
        <Text style={styles.sectionTitle}>User Accounts</Text>
        <Text style={styles.body}>
          To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account.
        </Text>
        
        <Text style={styles.sectionTitle}>User Conduct</Text>
        <Text style={styles.body}>
          You agree not to use the Service to transmit unlawful, harassing, or harmful content, impersonate others, or disrupt the Service.
        </Text>
        
        <Text style={styles.sectionTitle}>Intellectual Property</Text>
        <Text style={styles.body}>
          The Service and its original content are owned by LifeLink and protected by intellectual property laws.
        </Text>
        
        <Text style={styles.sectionTitle}>Disclaimer of Warranty</Text>
        <Text style={styles.body}>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTIES OF ANY KIND.
        </Text>
        
        <Text style={styles.sectionTitle}>Limitation of Liability</Text>
        <Text style={styles.body}>
          IN NO EVENT SHALL LIFELINK BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES.
        </Text>
        
        <Text style={styles.sectionTitle}>Governing Law</Text>
        <Text style={styles.body}>
          These Terms shall be governed by the laws of India.
        </Text>
        
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.body}>
          If you have any questions about these Terms, please contact us at terms@lifelink.example.
        </Text>
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
  body: {
    ...Theme.typography.body,
    marginBottom: Theme.spacing.sm,
  },
});

export default TermsScreen;