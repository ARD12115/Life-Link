import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDonors, useHospitals } from '../../hooks/useDonors';
import { Theme } from '../../theme';
import { Hospital, Droplets, MapPin, Navigation } from 'lucide-react-native';

// Custom Map Style (Dark Mode)
const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{"color": "#212121"}]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{"visibility": "off"}]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#757575"}]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#212121"}]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [{"color": "#757575"}]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{"color": "#181818"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{"color": "#2c2c2c"}]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{"color": "#000000"}]
  }
];

export default function MapScreen() {
  const { donors, loading: donorsLoading } = useDonors();
  const { hospitals, loading: hospitalsLoading } = useHospitals();
  
  // Apply jitter to donor locations for privacy
  const processedDonors = useMemo(() => {
    return donors.map(d => ({
      ...d,
      latitude: (d.latitude || 19.0760) + (Math.random() - 0.5) * 0.005,
      longitude: (d.longitude || 72.8777) + (Math.random() - 0.5) * 0.005,
    }));
  }, [donors]);

  if (donorsLoading || hospitalsLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapStyle}
        initialRegion={{
          latitude: 19.0760,
          longitude: 72.8777,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Hospital Markers */}
        {hospitals.map(h => (
          <Marker
            key={h.id}
            coordinate={{ latitude: h.latitude || 19.0760, longitude: h.longitude || 72.8777 }}
            tracksViewChanges={false}
          >
            <View style={[styles.markerContainer, { backgroundColor: Theme.colors.secondary }]}>
              <Hospital size={16} color="white" />
            </View>
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{h.name}</Text>
                <Text style={styles.calloutSub}>{h.city}</Text>
              </View>
            </Callout>
          </Marker>
        ))}

        {/* Donor Markers */}
        {processedDonors.map(d => (
          <Marker
            key={d.id}
            coordinate={{ latitude: d.latitude, longitude: d.longitude }}
            tracksViewChanges={false}
          >
            <View style={[styles.markerContainer, { backgroundColor: Theme.colors.accent }]}>
              <Droplets size={14} color="white" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Floating Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Theme.colors.secondary }]} />
          <Text style={styles.legendText}>Hospitals</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Theme.colors.accent }]} />
          <Text style={styles.legendText}>Nearby Donors</Text>
        </View>
      </View>

      {/* Recenter Button */}
      <TouchableOpacity style={styles.recenterBtn}>
        <Navigation size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  callout: {
    backgroundColor: Theme.colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minWidth: 150,
  },
  calloutTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  calloutSub: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  legend: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: 'white',
    fontSize: 12,
  },
  recenterBtn: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: Theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  }
});
