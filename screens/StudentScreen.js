import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Image,
  Platform,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { Client, Databases, ID } from "appwrite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dimensions } from "react-native";

// Get screen dimensions
const { width } = Dimensions.get("window");

// Initialize Appwrite client
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1") // Replace with your Appwrite endpoint
  .setProject("670ed3a4003543fc2496"); // Replace with your project ID

const databases = new Databases(client);
const DATABASE_ID = "670ed992001991e51d97"; // Replace with your database ID
const COLLECTION_ID = "670ed9a60000deb26c2b"; // Replace with your collection ID

const Tab = createBottomTabNavigator();

const StudentHomeScreen = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [eventCategory, setEventCategory] = useState("School");
  const [otherCategory, setOtherCategory] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [pickupPlace, setPickupPlace] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [pickupTimeReturn, setPickupTimeReturn] = useState("");
  const [requests, setRequests] = useState([]);
  const [username, setUsername] = useState("");

  // New states for the date picker
  const [showModal, setShowModal] = useState(false);
  const [daysOfWeek, setDaysOfWeek] = useState([]);

  useEffect(() => {
    const fetchUsernameAndRequests = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        if (storedUsername) {
          setUsername(storedUsername);
          fetchRequests(storedUsername);
        }
      } catch (error) {
        alert(
          "Looks like you did not set or save your username, please set a username otherwise your requests wont be sent. Redirecting you to your profile",
        );
        openModal();
      }
    };

    fetchUsernameAndRequests();
  }, []);

  const fetchRequests = async (currentUsername) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
      );
      const userRequests = response.documents.filter(
        (request) => request.studentname === currentUsername,
      );
      setRequests(userRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  const showAlert = (title, message) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const validateInputs = () => {
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/; // Regular expression for dd/mm/yyyy
    const timePattern = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/; // Regular expression for hh:mm AM/PM

    if (
      !destination.trim() &&
      !date.trim() &&
      !pickupTime.trim() &&
      !pickupPlace.trim() &&
      !returnDate.trim() &&
      !pickupTimeReturn.trim() &&
      !eventCategory.trim()
    ) {
      showAlert("Oops cannot submit request", "All fields are required");
      return false;
    }

    if (!destination.trim()) {
      showAlert("Oops cannot submit request", "Destination is required");
      return false;
    }

    if (!date.trim()) {
      showAlert("Oops cannot submit request", "Date of Travel is required");
      return false;
    }

    if (!datePattern.test(date)) {
      showAlert(
        "Oops cannot submit request",
        "Date of Travel must be in the format dd/mm/yyyy",
      );
      return false;
    }

    if (!pickupTime.trim()) {
      showAlert("Oops cannot submit request", "Pickup Time is required");
      return false;
    }

    if (!eventCategory.trim()) {
      showAlert("Oops cannot submit request", "Category is required");
      return false;
    }

    if (!timePattern.test(pickupTime)) {
      showAlert(
        "Oops cannot submit request",
        "Pickup Time must be in the format hh:mm AM/PM",
      );
      return false;
    }

    if (!pickupPlace.trim()) {
      showAlert("Oops cannot submit request", "Drop Off location is required");
      return false;
    }

    if (!returnDate.trim()) {
      showAlert("Oops cannot submit request", "Return Date is required");
      return false;
    }

    if (!pickupTimeReturn.trim()) {
      showAlert(
        "Oops cannot submit request",
        "Pickup Time on Return is required",
      );
      return false;
    }

    if (!timePattern.test(pickupTimeReturn)) {
      showAlert(
        "Oops cannot submit request",
        "Pickup Time on Return must be in the format hh:mm AM/PM",
      );
      return false;
    }

    return true;
  };

  const TimePicker = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [hours, setHours] = useState("06"); // Default to 12
    const [minutes, setMinutes] = useState("00"); // Default to 00
    const [period, setPeriod] = useState("AM"); // Default to AM

    const handleOkPress = () => {
      setPickupTime(`${hours}:${minutes} ${period}`);
      setModalVisible(false);
    };

    return (
      <View style={{}}>
        <TextInput
          placeholder="Pickup Time"
          style={styles.input}
          placeholderTextColor="#999"
          value={pickupTime}
          onFocus={() => setModalVisible(true)} // Open modal on focus
        />

        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.timePicker}>
              <TextInput
                style={styles.timeInput}
                placeholder="HH"
                keyboardType="numeric"
                maxLength={2}
                value={hours}
                onChangeText={(text) => {
                  // Remove non-numeric characters
                  let cleanedText = text.replace(/[^0-9]/g, "");

                  // Ensure the first digit is valid (for 12-hour notation)
                  if (cleanedText.length === 1 && parseInt(cleanedText) > 1) {
                    cleanedText = "0" + cleanedText; // Prepend 0 if the first digit is greater than 1
                  }

                  // Ensure the value is between 01 and 12
                  if (cleanedText.length === 2) {
                    let numericValue = parseInt(cleanedText, 10);
                    if (numericValue > 12) {
                      cleanedText = "12";
                    } else if (numericValue === 0) {
                      cleanedText = "01"; // Convert '00' to '01' for 12-hour format
                    }
                  }

                  setHours(cleanedText);
                }}
              />

              <TextInput
                style={styles.timeInput}
                placeholder="MM"
                keyboardType="numeric"
                maxLength={2}
                value={minutes}
                onChangeText={(text) => {
                  // Remove non-numeric characters
                  let cleanedText = text.replace(/[^0-9]/g, "");

                  // Ensure the first digit is valid (0-5 for minutes)
                  if (cleanedText.length === 1 && parseInt(cleanedText) > 5) {
                    cleanedText = "0" + cleanedText; // Prepend 0 if the first digit is greater than 5
                  }

                  // Ensure the value is between 00 and 59
                  if (cleanedText.length === 2) {
                    let numericValue = parseInt(cleanedText, 10);
                    if (numericValue >= 60) {
                      cleanedText = "59"; // Cap the value at 59
                    } else if (numericValue < 0) {
                      cleanedText = "00"; // Ensure the minimum value is 00
                    }
                  }

                  setMinutes(cleanedText);
                }}
              />

              <TouchableOpacity
                style={{
                  padding: 3,
                  borderRadius: 5,
                  backgroundColor: "#075e54",
                }}
                onPress={() => setPeriod(period === "AM" ? "PM" : "AM")}
              >
                <Text style={styles.period}>{period}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.okButton} onPress={handleOkPress}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
  };

  const ReturnTimePicker = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [hoursReturn, setHoursReturn] = useState("05"); // Default to 12
    const [minutesReturn, setMinutesReturn] = useState("00"); // Default to 00
    const [periodReturn, setPeriodReturn] = useState("PM"); // Default to AM

    const handleOkPressReturn = () => {
      setPickupTimeReturn(`${hoursReturn}:${minutesReturn} ${periodReturn}`);
      setModalVisible(false);
    };

    return (
      <View style={{}}>
        <TextInput
          placeholder="Pickup Time on Return"
          style={styles.input}
          placeholderTextColor="#999"
          value={pickupTimeReturn}
          onFocus={() => setModalVisible(true)} // Open modal on focus
        />

        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.timePicker}>
              <TextInput
                style={styles.timeInput}
                placeholder="HH"
                keyboardType="numeric"
                maxLength={2}
                value={hoursReturn}
                onChangeText={(text) => {
                  // Remove any non-numeric characters
                  let cleanedText = text.replace(/[^0-9]/g, "");

                  // Ensure that the first digit is either 0 or 1 (to maintain valid hour ranges)
                  if (cleanedText.length === 1 && parseInt(cleanedText) > 1) {
                    cleanedText = "0" + cleanedText; // Prepend 0 if the first digit is greater than 1
                  }

                  // Ensure that the final value is between 1 and 12
                  if (cleanedText.length === 2) {
                    let numericValue = parseInt(cleanedText, 10);
                    if (numericValue > 12) {
                      cleanedText = "12";
                    } else if (numericValue === 0) {
                      cleanedText = "01"; // Convert '00' to '01' as there's no 00 in 12-hour format
                    }
                  }

                  setHoursReturn(cleanedText);
                }}
              />

              <TextInput
                style={styles.timeInput}
                placeholder="MM"
                keyboardType="numeric"
                maxLength={2}
                value={minutesReturn}
                onChangeText={(text) => {
                  // Remove non-numeric characters
                  let cleanedText = text.replace(/[^0-9]/g, "");

                  // Ensure that the first digit is valid (0-5 for minutes)
                  if (cleanedText.length === 1 && parseInt(cleanedText) > 5) {
                    cleanedText = "0" + cleanedText; // Prepend 0 if the first digit is greater than 5
                  }

                  // Ensure the value is between 00 and 59
                  if (cleanedText.length === 2) {
                    let numericValue = parseInt(cleanedText, 10);

                    if (numericValue >= 60) {
                      cleanedText = "59"; // Cap the value at 59
                    } else if (numericValue < 0) {
                      cleanedText = "00"; // Ensure the minimum value is 00
                    }
                  }

                  setMinutesReturn(cleanedText);
                }}
              />

              <TouchableOpacity
                style={{
                  padding: 3,
                  borderRadius: 5,
                  backgroundColor: "#075e54",
                }}
                onPress={() =>
                  setPeriodReturn(periodReturn === "AM" ? "PM" : "AM")
                }
              >
                <Text style={styles.period}>{periodReturn}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.okButton}
              onPress={handleOkPressReturn}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
  };

  const handleSubmitRequest = async () => {
    if (validateInputs()) {
      const newRequest = {
        studentname: username,
        destination,
        datetravel: date,
        pickuptime: pickupTime,
        pickupplace: pickupPlace,
        returndate: returnDate,
        pickuptimereturn: pickupTimeReturn,
        category: eventCategory,
        description: eventCategory === "Other" ? otherCategory : "",
      };

      try {
        const response = await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          newRequest,
        );
        setRequests([...requests, response]);
        clearForm();
        toggleFormVisibility();
      } catch (error) {
        console.error("Error creating request:", error);
      }
    }
  };

  const clearForm = () => {
    setDestination("");
    setDate("");
    setPickupTime("");
    setPickupPlace("");
    setReturnDate("");
    setPickupTimeReturn("");
    setOtherCategory("");
    setEventCategory("School");
  };

  const cancelRequest = async (id) => {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
      setRequests(requests.filter((request) => request.$id !== id));
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const showConfirmAlert = (onConfirm) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure?");
      if (confirmed) {
        onConfirm();
      }
    } else {
      Alert.alert("Confirm Deletion", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: onConfirm, style: "destructive" },
      ]);
    }
  };

  const getNextWeekDates = () => {
    const days = [];
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();

    // Calculate days until next Monday
    const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(currentDate);
      nextDay.setDate(currentDate.getDate() + daysUntilNextMonday + i);
      const dayString = nextDay.toLocaleDateString("en-US", {
        weekday: "long",
      });
      const dayNumber = nextDay.getDate();
      days.push({ dayString, dayNumber, date: nextDay });
    }

    setDaysOfWeek(days);
  };
  const formatDate = (dateObj) => {
    const day = `0${dateObj.getDate()}`.slice(-2);
    const month = `0${dateObj.getMonth() + 1}`.slice(-2);
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateFocus = () => {
    getNextWeekDates();
    setShowModal(true);
  };

  const handleDateSelect = (selectedDate) => {
    setDate(formatDate(selectedDate));
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      {requests.length === 0 && !isFormVisible ? (
        <View style={styles.iconContainer}>
          <Icon
            name="file-document-edit-outline"
            size={100}
            color={"#1f471f"}
          />
          <Text style={styles.noRequestText}>
            No request sent yet. Send one and they will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {requests.map((request) => (
            <View key={request.$id} style={styles.requestItem}>
              <Text style={styles.requestText}>
                Destination: {request.destination}
              </Text>
              <Text style={styles.requestText}>Date: {request.datetravel}</Text>
              <Text style={styles.requestText}>
                Pickup Time: {request.pickuptime}
              </Text>
              <Text style={styles.requestText}>
                Drop-off Location: {request.pickupplace}
              </Text>

              <Text style={styles.requestText}>
                Return Date: {request.returndate}
              </Text>
              <Text style={styles.requestText}>
                Pickup Time on Return: {request.pickuptimereturn}
              </Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() =>
                  showConfirmAlert(() => cancelRequest(request.$id))
                }
              >
                <Text style={styles.cancelButtonText}>Cancel Request</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.addRequestButton}
        onPress={toggleFormVisibility}
      >
        <Text style={styles.addRequestButtonText}>Add Request</Text>
      </TouchableOpacity>

      {isFormVisible && (
        <View style={styles.wrapper}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.formContainer}>
              <Text>Im am going to:</Text>
              <TextInput
                placeholder="Destination"
                style={styles.input}
                placeholderTextColor="#999"
                value={destination}
                onChangeText={setDestination}
              />
              <Text>
                The date will be:(Please select only fom the choices given
                otherwise your request will not be seen. Schedules are only
                availble for the next week)
              </Text>
              <TextInput
                placeholder="Date of Travel"
                style={styles.input}
                placeholderTextColor="#999"
                value={date}
                onFocus={handleDateFocus}
                onChangeText={setDate}
              />
              <Text>I need to be picked up at:(Make sure to select AM/PM)</Text>
              <TimePicker />
              <Text> In need to be dropped off at:</Text>
              <TextInput
                placeholder="Drop Off Location"
                style={styles.input}
                placeholderTextColor="#999"
                value={pickupPlace}
                onChangeText={setPickupPlace}
              />
              <View>
                <Text>
                  I will be back on campus:(Write NOT SURE if you are not sure)
                </Text>

                {/* Text Input for Return Date */}
                <TextInput
                  placeholder="Return Date"
                  style={styles.input}
                  placeholderTextColor="#999"
                  value={returnDate}
                  onChangeText={setReturnDate}
                />
              </View>

              <Text>
                {" "}
                On Return I need to be picked up at: (Make sure you select
                AM/PM)
              </Text>
              <ReturnTimePicker />
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 19,
                  textAlign: "center",
                  fontFamily: Platform.OS === "web" ? "Poppins" : "System",
                }}
              >
                Reason for travel
              </Text>
              <Picker
                selectedValue={eventCategory}
                style={styles.picker}
                onValueChange={(itemValue) => setEventCategory(itemValue)}
              >
                <Picker.Item label="School" value="School" />
                <Picker.Item label="Sports" value="Sports" />
                <Picker.Item label="Trip" value="Trip" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
              {eventCategory === "Other" && (
                <TextInput
                  placeholder="Short Description"
                  style={styles.input}
                  placeholderTextColor="#999"
                  value={otherCategory}
                  onChangeText={setOtherCategory}
                />
              )}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={toggleFormVisibility}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitRequest}
                >
                  <Text style={styles.submitButtonText}>Add Request</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Date Picker Modal */}
      <Modal visible={showModal} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.popup}>
            <Text
              style={{ fontSize: 25, fontWeight: "bold", textAlign: "center" }}
            >
              {" "}
              SELECT DATE
            </Text>
            {daysOfWeek.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDateSelect(item.date)}
              >
                <Text
                  style={styles.dateText}
                >{`${item.dayString} ${item.dayNumber}`}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={{
                backgroundColor: "#1f471f",
                padding: 5,
                marginTop: 15,
                borderRadius: 10,
                paddingVertical: 15,
              }}
              onPress={() => setShowModal(false)}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ProfileScreen />
    </View>
  );
};

const ProfileScreen = () => {
  const [isModalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem("username");
        if (savedUsername) {
          setUsername(savedUsername);
          closeModal(); // Automatically close the modal if the username is already available
        } else {
          openModal();
        }
      } catch (error) {
        console.error("Error fetching username from storage:", error);
      }
    };

    fetchUsername();
  }, []);

  const openModal = () => {
    setModalVisible(true); // Set modal visibility to true
  };

  const closeModal = () => {
    setModalVisible(false); // Set modal visibility to false
  };

  const handleSaveUsername = async () => {
    try {
      if (username.trim()) {
        await AsyncStorage.setItem("username", username);
        alert("Successfully Saved");
        closeModal(); // Close the modal after saving
      } else {
        alert("Please enter a valid username.");
      }
    } catch (error) {
      console.error("Error saving username to storage:", error);
    }
  };
  return (
    <>
      <TouchableOpacity style={styles.profileButton} onPress={openModal}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("./user.png")} // Replace with your icon path
            style={styles.icon}
          />
          <Text style={{ color: "#fff" }}></Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.welcomeText}>
              WELCOME {username || "Guest"}!
            </Text>
            <Image
              source={require("./user.png")} // Replace with your icon path
              style={{ width: 100, height: 100, marginBottom: 10 }}
            />
            <TextInput
              placeholder="Full Name & Surname"
              style={{
                width: "80%",
                borderWidth: 1,
                padding: 15,
                textAlign: "center",
                borderRadius: 10,
                borderColor: "#ccc",
                fontSize: 18,
                fontFamily: Platform.OS === "web" ? "Poppins" : "System",
              }}
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSaveUsername}
            >
              <Text style={styles.submitButtonText}>Save Username</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};
const isLargeScreen = width > 768; // Adjust this threshold as per your needs
// Add your existing styles below and include styles for the modal
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: "#F7F8FA",
    position: "relative", // Add relative positioning
  },

  wrapper: {
    flex: 1,
    top: isLargeScreen ? 5 : 5, // Apply only on large screens
    right: Platform.OS == "web" ? "0" : 0, // Apply only on large screens
    borderRadius: isLargeScreen ? 30 : 0, // Apply rounded corners on large screens
    position: "absolute",
    left: 0,
    marginTop: 15,
    height: "100%",
    backgroundColor: "#f3f3f3",
    zIndex: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginTop: Platform.OS == "web" ? 150 : 200,
  },
  noRequestText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 5,
    color: "#888",
    paddingHorizontal: 30,
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },

  welcomeText: {
    fontSize: 23,
    textAlign: "center",
    marginBottom: 50,
    fontWeight: "bold",
    marginTop: 10,
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },

  modalContent: {
    width: "70%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },

  timePicker: {
    flexDirection: "row",
    backgroundColor: "#f3f3f3",
    padding: 20,
    borderRadius: 10,
  },
  timeInput: {
    width: 50,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    margin: 5,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  period: {
    margin: 10,
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center",
    color: "#f2f2f2",
  },
  okButton: {
    backgroundColor: "#1f471f",
    padding: 10,
    width: 90,
    borderRadius: 5,
    marginTop: 10,
  },
  okButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },

  profileButton: {
    position: "absolute",
    bottom: 30, // Adjust as needed
    right: 20, // Adjust as needed
    backgroundColor: "#1f471f",
    padding: 8,
    borderRadius: 60,
    alignItems: "center",
  },
  icon: {
    width: 30, // Adjust size to match your icon
    height: 30, // Adjust size to match your icon
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Add this line
  },
  cancelButton: {
    marginTop: 40,
    backgroundColor: "#111",
    paddingVertical: 10, // Add some vertical padding
    paddingHorizontal: 40,
    display: "flex",
    alignItems: "center",
    borderRadius: 10,
  },

  cancelButtonText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  submitButton: {
    backgroundColor: "#1f471f",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 40,
  },
  submitButtonText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  addRequestButton: {
    backgroundColor: "#1f471f",
    paddingVertical: 10,
    marginRight: 100,
    paddingHorizontal: 50,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 20,
    position: "absolute",
    bottom: 30, // Position it closer to the bottom of the screen
  },
  addRequestButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },

  requestItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  requestText: {
    fontSize: 14,
    color: "#333",
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },

  popup: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  dateText: {
    fontSize: 18,
    borderBottomColor: "#075e54",
    borderBottomWidth: 1,
    padding: 10,
    textAlign: "center",
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  formContainer: {
    padding: 20,
    margin: "auto", // Center the form horizontally
    maxWidth: 600, // Limit form width on larger screens
    width: width > 768 ? "80%" : "95%", // Adjust width based on screen size
    backgroundColor: "#fff", // Example for dark mode
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: width > 768 ? 18 : 14, // Dynamic font size for larger screens
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  picker: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    width: "100%",
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
});

export default StudentHomeScreen;
