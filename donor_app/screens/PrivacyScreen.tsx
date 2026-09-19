import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { Theme } from '../../theme';

const PrivacyScreen = () => {
  const openLink = (url) => Linking.openURL(url);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.subtitle}>Last updated: September 19, 2026</Text>
        
        <Text style={styles.sectionTitle}>Introduction</Text>
        <Text style={styles.body}>
          LifeLink ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
        </Text>
        
        <Text style={styles.sectionTitle}>Information We Collect</Text>
        <Text style={styles.body}>
          <Text style={styles.bold}>Personal Data:</Text> Name, email, phone number, blood group, city, location (if permitted).
        </Text>
        <Text style={styles.body}>
          <Text style={styles.bold}>Health Data:</Text> Blood donation history, medical facility information.
        </Text>
        <Text style={styles.body}>
          <Text style={styles.bold}>Usage Data:</Text> App usage, feature interactions, device information.
        </Text>
        
        <Text style={styles.sectionTitle}>How We Use Your Information</Text>
        <Text style={styles.body}>
          To provide and maintain our service, match blood donors with hospitals in emergencies, send emergency alerts, improve our platform, and comply with legal obligations.
        </Text>
        
        <Text style={styles.sectionTitle}>Sharing Your Information</Text>
        <Text style={styles.body}>
          We may share your information with hospitals for emergency matching (limited to necessary data), service providers hosting our platform, and legal authorities if required by law. We do not sell your personal data.
        </Text>
        
        <Text style={styles.sectionTitle}>Data Security</Text>
        <Text style={styles.body}>
          We use industry-standard encryption (TLS, AES-256) and follow best practices to protect your data.
        </Text>
        
        <Text style={styles.sectionTitle}>Your Rights</Text>
        <Text style={styles.body}>
          Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data, restrict processing, withdraw consent, and data portability.
          To exercise these rights, please contact us at privacy@lifelink.example.
        </Text>
        
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.body}>
          If you have questions about this Privacy Policy, please contact us:
        </Text>
        <Text style={styles.body}>Email: privacy@lifelink.example</Text>
        <Text style={styles.body}>Address: LifeLink Emergency Network, Canara Engineering College, Karnataka, India</Text>
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
  bold: {
    fontWeight: '600',
  },
});

export default PrivacyScreen;