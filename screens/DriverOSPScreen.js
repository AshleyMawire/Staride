import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { Client, Databases } from "appwrite";
import locationIcon from "./location.png";
import scheduleIcon from "./scheduling.png";
import tableIcon from "./table.png";
import ViewShot from "react-native-view-shot"; // For capturing screenshots
import * as Sharing from "expo-sharing"; // For sharing the image

// Initialize Appwrite client
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1") // Replace with your Appwrite endpoint
  .setProject("670ed3a4003543fc2496"); // Replace with your project ID

const databases = new Databases(client);
const DATABASE_ID = "670ed992001991e51d97"; // Replace with your database ID
const COLLECTION_ID = "670ed9a60000deb26c2b"; // Replace with your collection ID

const DriverOSPScreen = () => {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOption, setFilterOption] = useState("Today");
  const [tableModalVisible, setTableModalVisible] = useState(false);
  const viewShotRef = useRef(); // Reference for capturing table view

  useEffect(() => {
    fetchStudentData();
  }, [filterOption]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
      );
      const filteredData = filterSchedules(response.documents);
      const sortedData = filteredData.sort((a, b) => {
        const timeA = parseTime(a.pickuptime);
        const timeB = parseTime(b.pickuptime);
        return timeA - timeB;
      });
      setStudentsData(sortedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseTime = (timeString) => {
    const [time, modifier] = timeString.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date(`${year}-${month}-${day}`);
  };

  const formatDate = (dateString) => {
    const date = parseDate(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const filterSchedules = (schedules) => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const nextWeekStart = new Date(startOfWeek);
    nextWeekStart.setDate(startOfWeek.getDate() + 7);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

    switch (filterOption) {
      case "Today":
        return schedules.filter(
          (schedule) =>
            parseDate(schedule.datetravel).toDateString() ===
            today.toDateString(),
        );
      case "Tomorrow":
        return schedules.filter(
          (schedule) =>
            parseDate(schedule.datetravel).toDateString() ===
            tomorrow.toDateString(),
        );
      case "This Week":
        return schedules.filter((schedule) => {
          const travelDate = parseDate(schedule.datetravel);
          return travelDate >= startOfWeek && travelDate <= endOfWeek;
        });
      case "Next Week":
        return schedules.filter((schedule) => {
          const travelDate = parseDate(schedule.datetravel);
          return travelDate >= nextWeekStart && travelDate <= nextWeekEnd;
        });
      default:
        return schedules;
    }
  };

  const handleSelectSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setModalVisible(true);
  };

  const captureTableAsPng = async () => {
    const uri = await viewShotRef.current.capture(); // Capture the table view
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri); // Share the captured image
    } else {
      alert("Sharing is not available on this platform");
    }
  };

  const renderStudentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleSelectSchedule(item)}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.studentName}>{item.studentname}</Text>
        <Text style={styles.time}>{item.pickuptime}</Text>
      </View>
      <Text style={styles.studentText}>
        <Image source={locationIcon} style={styles.locationIcon} />
        Is Going: {item.destination}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => (
    <View style={styles.defaultContent}>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : studentsData.length === 0 ? (
        <View style={styles.noSchedulesContainer}>
          <Image source={scheduleIcon} style={styles.scheduleIcon} />
          <Text style={styles.noSchedulesText}>
            No schedules available for {filterOption}, check other categories.
          </Text>
        </View>
      ) : (
        <FlatList
          data={studentsData}
          renderItem={renderStudentItem}
          keyExtractor={(item) => item.$id}
        />
      )}
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {["Today", "Tomorrow", "This Week", "Next Week"].map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.tabButton,
            filterOption === option && styles.activeTabButton,
          ]}
          onPress={() => setFilterOption(option)}
        >
          <Text
            style={[
              styles.tabButtonText,
              filterOption === option && styles.activeTabButtonText,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTableModal = () => (
    <Modal
      transparent={true}
      animationType="slide"
      visible={tableModalVisible}
      onRequestClose={() => setTableModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.tableModalContent}>
          <Text style={styles.modalTitle}>Schedule Details</Text>
          <ScrollView horizontal>
            <ViewShot
              ref={viewShotRef}
              options={{ format: "png", quality: 0.9, backgroundColor: "#fff" }} // Added backgroundColor
            >
              <View style={styles.tableContainer}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeader}>Student Name</Text>
                  <Text style={styles.tableHeader}>Destination</Text>
                  <Text style={styles.tableHeader}>DropOff Point</Text>
                  <Text style={styles.tableHeader}>Pickup Time</Text>
                  <Text style={styles.tableHeader}>Travel Date</Text>
                </View>
                {studentsData.map((student, index) => (
                  <View style={styles.tableRow} key={index}>
                    <Text style={styles.tableCell}>{student.studentname}</Text>
                    <Text style={styles.tableCell}>{student.destination}</Text>
                    <Text style={styles.tableCell}>{student.pickupplace}</Text>
                    <Text style={styles.tableCell}>{student.pickuptime}</Text>
                    <Text style={styles.tableCell}>
                      {formatDate(student.datetravel)}
                    </Text>
                  </View>
                ))}
              </View>
            </ViewShot>
          </ScrollView>
          {Platform.OS !== "web" && (
            <TouchableOpacity
              style={styles.captureButton}
              onPress={captureTableAsPng}
            >
              <Text style={styles.captureButtonText}>Share as An Image</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setTableModalVisible(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderDetailsModal = () => (
    <Modal
      transparent={true}
      animationType="slide"
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Schedule Details</Text>
          {selectedSchedule && (
            <>
              {/* Table Header */}
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Field</Text>
                <Text style={styles.tableHeader}>Details</Text>
              </View>

              {/* Table Row for Name */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Student Name</Text>
                <Text style={styles.tableCell}>
                  {selectedSchedule.studentname}
                </Text>
              </View>

              {/* Table Row for Destination */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Destination</Text>
                <Text style={styles.tableCell}>
                  {selectedSchedule.destination}
                </Text>
              </View>

              {/* Table Row for Date of Travel */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Date Of Travel</Text>
                <Text style={styles.tableCell}>
                  {(() => {
                    const [day, month, year] =
                      selectedSchedule.datetravel.split("/");
                    const formattedDate = new Date(`${year}-${month}-${day}`);
                    const dayOfWeek = formattedDate.toLocaleDateString(
                      "en-US",
                      { weekday: "long" },
                    );
                    return `${dayOfWeek}, ${day}`;
                  })()}
                </Text>
              </View>

              {/* Table Row for Pick Up Time On Leaving */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Pick Up Time From Campus</Text>
                <Text style={styles.tableCell}>
                  {selectedSchedule.pickuptime}
                </Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Drop-off Location</Text>
                <Text style={styles.tableCell}>
                  {selectedSchedule.pickupplace}
                </Text>
              </View>

              {/* Table Row for Return Date */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Return Date</Text>
                <Text style={styles.tableCell}>
                  {(() => {
                    try {
                      const [day, month, year] =
                        selectedSchedule.returndate.split("/");
                      const formattedReturnDate = new Date(
                        `${year}-${month}-${day}`,
                      );

                      // Check if the date is valid
                      if (isNaN(formattedReturnDate.getTime())) {
                        throw new Error("Invalid date format");
                      }

                      const dayOfWeek = formattedReturnDate.toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                        },
                      );

                      return `${dayOfWeek}, ${day}`;
                    } catch (error) {
                      // Return the date as is if it's in an invalid format
                      return selectedSchedule.returndate;
                    }
                  })()}
                </Text>
              </View>

              {/* Table Row for Pick Up Time On Return */}
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Pick Up Time On Return</Text>
                <Text style={styles.tableCell}>
                  {selectedSchedule.pickuptimereturn}
                </Text>
              </View>

              {/* Table Row for Drop-off Location */}
            </>
          )}

          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderTabBar()}
      {renderContent()}
      {renderDetailsModal()}
      <TouchableOpacity
        style={styles.tableIconContainer}
        onPress={() => {
          if (studentsData.length === 0) {
            Alert.alert(
              "No Schedules",
              "No schedules available to display in the table.",
              [{ text: "OK" }],
            );
          } else {
            setTableModalVisible(true);
          }
        }}
      >
        <Image source={tableIcon} style={styles.tableIcon} />
      </TouchableOpacity>
      {renderTableModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end", // Fixes navbar position to the bottom
  },
  // Other styles...
  defaultContent: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  studentName: {
    fontSize: 23,
    fontWeight: "bold",
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },

  locationIcon: {
    width: 25, // Set the width you want
    height: 25,
  },

  scheduleIcon: {
    width: 100,
    height: 100,
  },
  loadingText: {
    fontSize: 18,
    color: "#075e54",
    textAlign: "center",
    marginTop: 20,
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  listItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#f9f9f9",
    marginVertical: 5,
    borderRadius: 5,
  },
  studentText: {
    fontSize: 16,
    color: "#333",
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  time: {
    fontSize: 18,
    color: "#075e54",
    fontWeight: "bold",
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: Platform.OS === "web" ? 5 : 20,
    backgroundColor: "#1f471f",
    borderBottomWidth: 0.2,
    borderBottomColor: "black",
    color: "white",
  },
  tabButton: {
    padding: 10,
  },
  tabButtonText: {
    color: "#f2f2f2",
    fontSize: 16,
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },

  noSchedulesContainer: {
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center", // Centers the text
    marginVertical: 20, // Adds space above and below the container
  },
  noSchedulesText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },

  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "orange",
  },
  activeTabButtonText: {
    fontWeight: "bold",
    fontSize: 15,
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },

  closeButton: {
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#5c0b06",
    borderRadius: 5,
    width: "100%", // Make it fill the width of the container
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  tableIconContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 10,
    elevation: 5,
  },
  tableIcon: {
    width: 35,
    height: 35,
  },

  tableModalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "90%",
    maxHeight: "80%",
  },
  tableContainer: {
    marginTop: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    backgroundColor: "#fff", // Ensures the table has a background
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1f471f",
  },
  tableHeader: {
    flex: 1,
    padding: 10,
    fontWeight: "bold",
    backgroundColor: "#1f471f",
    textAlign: "center",
    borderColor: "white", // Adding borders
    borderWidth: 0.5,
    color: "white",
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: "center",
    borderColor: "#1f471f", // Adding borders
    borderWidth: 0.5,
  },
  captureButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#133",
    borderRadius: 5,
  },
  captureButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
});

export default DriverOSPScreen;
