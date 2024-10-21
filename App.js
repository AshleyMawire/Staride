import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import StudentScreen from './screens/StudentScreen';
import DriverOSPScreen from './screens/DriverOSPScreen';

const Stack = createStackNavigator();

// Linking configuration
const linking = {
  prefixes: ['http://yourapp.com', 'https://yourapp.com'],
  config: {
    screens: {
      Home: 'home',
      Student: 'student',
      DriverOSP: 'driverosp',
    },
  },
};

// Custom header component
const CustomHeader = ({ navigation, title, canGoBack, onAboutPress }) => {
  const titleStyle = {
    marginLeft: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: Platform.OS === 'web' ? 'Poppins' : 'System',
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#1f471f',
      }}>
      {canGoBack && (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 25, color: '#fff' }}> ⪪ </Text>
        </TouchableOpacity>
      )}
      <Text style={titleStyle}>{title}</Text>
      <TouchableOpacity
        style={{ right: 15, position: 'absolute' }}
        onPress={onAboutPress}>
        <Text style={{ color: '#fff' }}>About</Text>
      </TouchableOpacity>
    </View>
  );
};

function App() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          header:
            Platform.OS === 'web'
              ? () => (
                  <CustomHeader
                    navigation={navigation}
                    title={route.name}
                    canGoBack={route.name !== 'Home'} // Show back button if not on home screen
                    onAboutPress={() => setModalVisible(true)} // Show modal on About press
                  />
                )
              : undefined, // No header for mobile platforms
        })}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Student" component={StudentScreen} />
        <Stack.Screen name="DriverOSP" component={DriverOSPScreen} />
      </Stack.Navigator>

      {/* Modal for About StarRide */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <Text style={styles.modalText}>
        Designed for the STAR Leadership Academy, this initiative is crafted by students, for the benefit of both students and management. Heartfelt gratitude to Calvin Dube and Ashley Mawire for their instrumental role in bringing this vision to fruition. Our commitment to enhancing user experience remains paramount. This platform ensures that requests are meticulously organized and presented with clarity. While the spreadsheet method has proven functional, this application represents a superior approach to managing requests, offering an intuitive interface and easy accessibility. We welcome any ideas you have on how we can improve our Academy's operations, and we will be willing to find a way to make it happen.
    </Text>

    <Text style={styles.sectionHeader}>How To Use</Text>

    <Text style={styles.subHeader}>FOR DRIVERS AND OSPs or Management</Text>
    <Text style={styles.bodyText}>
        Just click the <Text style={styles.boldText}>Driver/OSP</Text> button. A dashboard with tabs such as <Text style={styles.boldText}>Today, Tomorrow, This Week, Next Week</Text> will appear. These tabs will show all the student requests neatly arranged in their order of pickup time for the respective period. On clicking each request, full details about the request will be displayed neatly in a table. A table icon at the bottom will show a table for all the requests for that period, which you can share with others.
    </Text>

    <Text style={styles.subHeader}>FOR STUDENTS</Text>
    <Text style={styles.bodyText}>
        Just click the <Text style={styles.boldText}>Student</Text> button. A page where your requests will be shown will appear. For the first time, it will ask for your username, which is saved for future use. Head to the <Text style={styles.boldText}>Add Request</Text> button, and on clicking it, a form appears. Please enter the details as indicated by the placeholders, especially for date and time. For time, ensure it's in the format <Text style={styles.boldText}>hh:mm AM/PM</Text> (e.g., 8:00 AM). For dates, enter them in the format <Text style={styles.boldText}>dd/mm/yyyy</Text> (e.g., 12/12/2024). Otherwise, the form won't allow you to submit your request. This is done for accuracy, though improvements are coming where you can enter dates more intuitively (e.g., "Monday 24 June"). Upon submission, your record is stored, and you can view or cancel it if any amendments are needed.
    </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '50%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    fontSize: 16,
    fontFamily: Platform.OS === 'web' ? 'Poppins' : 'System',
  },
  closeButton: {
    backgroundColor: '#1f471f',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Poppins' : 'System',
  },

  modalContent: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
},
modalText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 10,
    fontFamily: Platform.OS === 'web' ? 'Poppins' : 'System',
},
sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 10,
},
subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'web' ? 'Poppins' : 'System',
    color: '#333',
    marginVertical: 8,
},
bodyText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    marginBottom: 10,
    fontFamily: Platform.OS === 'web' ? 'Poppins' : 'System',
},
boldText: {
    fontWeight: 'bold',
    backgroundColor:'#075e54',
    color:'white',
    borderRadius:10,
    paddingHorizontal:10,
    fontFamily: Platform.OS === 'web' ? 'Poppins' : 'System',
}
});

export default App;
