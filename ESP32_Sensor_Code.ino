/*
 * ESP32 - AquaAlert Sensor Integration
 * 
 * This sketch reads from:
 * - Ultrasonic sensor (HC-SR04) for water level
 * - Turbidity sensor for water clarity
 * 
 * And sends data to Firebase Realtime Database
 */

#include <WiFi.h>
#include <FirebaseESP32.h>

// ===== WiFi Credentials =====
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// ===== Firebase Credentials =====
#define FIREBASE_HOST "aquaalert-ae2f7-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "YOUR_DATABASE_SECRET_OR_AUTH_TOKEN"

// ===== Pin Definitions =====
#define TRIG_PIN 5      // Ultrasonic sensor trigger pin
#define ECHO_PIN 18     // Ultrasonic sensor echo pin
#define TURBIDITY_PIN 34 // Turbidity sensor analog pin (ADC1)

// Firebase objects
FirebaseData firebaseData;
FirebaseConfig config;
FirebaseAuth auth;

// Variables
float distance = 0;
int turbidity = 0;
unsigned long lastUpdate = 0;
const unsigned long updateInterval = 2000; // Update every 2 seconds

void setup() {
  Serial.begin(115200);
  
  // Pin setup
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(TURBIDITY_PIN, INPUT);
  
  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("Connected! IP: ");
  Serial.println(WiFi.localIP());
  
  // Firebase configuration
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  
  // Initialize Firebase
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  Serial.println("Firebase connected!");
}

void loop() {
  if (millis() - lastUpdate >= updateInterval) {
    lastUpdate = millis();
    
    // Read sensors
    distance = readUltrasonicDistance();
    turbidity = readTurbidity();
    
    // Send to Firebase
    sendToFirebase();
    
    // Print to Serial Monitor
    Serial.println("===== Sensor Readings =====");
    Serial.print("Distance: ");
    Serial.print(distance);
    Serial.println(" cm");
    Serial.print("Turbidity: ");
    Serial.println(turbidity);
    Serial.println();
  }
}

// Read ultrasonic sensor (HC-SR04)
float readUltrasonicDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH);
  float distance = duration * 0.034 / 2; // Speed of sound: 340 m/s
  
  return distance;
}

// Read turbidity sensor
int readTurbidity() {
  int sensorValue = analogRead(TURBIDITY_PIN);

  // Reverse mapping: lower ADC (dirtier) -> higher NTU, higher ADC (cleaner) -> lower NTU
  int turbidity = map(sensorValue, 0, 4095, 1000, 0);
  turbidity = constrain(turbidity, 0, 1000);

  return turbidity;
}

// Send data to Firebase
void sendToFirebase() {
  // Update distance
  if (Firebase.setFloat(firebaseData, "/sensorData/distance", distance)) {
    Serial.println("✓ Distance updated");
  } else {
    Serial.println("✗ Distance update failed");
    Serial.println(firebaseData.errorReason());
  }
  
  // Update turbidity
  if (Firebase.setInt(firebaseData, "/sensorData/turbidity", turbidity)) {
    Serial.println("✓ Turbidity updated");
  } else {
    Serial.println("✗ Turbidity update failed");
    Serial.println(firebaseData.errorReason());
  }
  
  // Update timestamp
  if (Firebase.setInt(firebaseData, "/sensorData/timestamp", millis())) {
    Serial.println("✓ Timestamp updated");
  } else {
    Serial.println("✗ Timestamp update failed");
  }
}

/* 
 * ===== OPTIONAL: Additional Sensors =====
 * 
 * Temperature Sensor (DS18B20):
 * - Install OneWire and DallasTemperature libraries
 * - Connect to GPIO pin (e.g., GPIO 4)
 * 
 * pH Sensor:
 * - Connect to analog pin (ADC)
 * - Calibrate with standard pH solutions (4.0, 7.0, 10.0)
 * 
 * Add these readings to Firebase:
 * Firebase.setFloat(firebaseData, "/sensorData/temperature", temp);
 * Firebase.setFloat(firebaseData, "/sensorData/ph", phValue);
 */