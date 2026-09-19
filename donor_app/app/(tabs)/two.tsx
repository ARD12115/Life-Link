import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import { useHospitals } from '../../hooks/useDonors';
import { Theme } from '../../theme';
import { Hospital, Droplets, MapPin, Navigation } from 'lucide-react-native';

// Custom Map Style (Dark Mode) - removed as we use default provider
// const mapStyle = [ ... ];

export default function MapScreen() {
  const { hospitals, loading: hospitalsLoading } = useHospitals();
  // Filter for hospitals that actually have active requests (Optional: would need useRequests hook here)

  if (hospitalsLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: 19.0760,
          longitude: 72.8777,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Hospital Mission Points */}
        {hospitals.map(h => (
          <Marker
            key={h.id}
            coordinate={{ latitude: h.latitude || 19.0760, longitude: h.longitude || 72.8777 }}
            tracksViewChanges={false}
          >
            <View style={[styles.markerContainer, { backgroundColor: Theme.colors.primary }]}>
               <Hospital size={16} color="white" />
            </View>
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{h.name}</Text>
                <Text style={styles.calloutSub}>Emergency Receiving Point</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

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