import React from 'react';
import {
  View,
  Text,
  Platform,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StarLogo from './starlogo.png';

function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transport Schedule</Text>
      <Image source={StarLogo} style={styles.logo} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Student')}
          style={styles.button}>
          <Text style={styles.buttonText}>Student</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('DriverOSP')}
          style={styles.button}>
          <Text style={styles.buttonText}>Driver/OSP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: Platform.OS === 'web' ? 'Poppins' : 'System',
    fontWeight:'bold',
  },
  logo: {
    width: 220, // Set the width you want
    height: 220, // Set the height you want
    marginBottom: 20, // Space between title and logo
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    width: 150,
    backgroundColor: '#1f471f',
    padding: 20,
    marginHorizontal: 10,
    borderRadius: 5, // Optional: for rounded corners
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'Poppins' : 'System',
  },
});

export default HomeScreen;
