# ESP32 Setup Guide for AquaAlert

## 🎯 What You'll Need

### Hardware:
- ESP32 Development Board
- HC-SR04 Ultrasonic Sensor (for water level)
- Turbidity Sensor Module
- Jumper wires
- Breadboard
- USB cable for ESP32

### Software:
- Arduino IDE with ESP32 board support
- Required libraries (see below)

---

## 📚 Step 1: Install Arduino Libraries

Open Arduino IDE and install these libraries via **Tools > Manage Libraries**:

1. **FirebaseESP32** by Mobizt
2. **WiFi** (built-in with ESP32)

---

## 🔌 Step 2: Hardware Connections

### HC-SR04 Ultrasonic Sensor:
```
VCC  → 5V (or 3.3V)
GND  → GND
TRIG → GPIO 5
ECHO → GPIO 18
```

### Turbidity Sensor:
```
VCC  → 3.3V
GND  → GND
OUT  → GPIO 34 (ADC1_CH6)
```

### Optional - DS18B20 Temperature Sensor:
```
VCC  → 3.3V
GND  → GND
DATA → GPIO 4 (with 4.7kΩ pull-up resistor)
```

---

## 🔑 Step 3: Get Firebase Credentials

### Option A: Using Firebase Database Secret (Recommended for ESP32)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **aquaalert-ae2f7**
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to **Service accounts** tab
5. Click **Database secrets** at the bottom
6. Copy the secret key

### Option B: Using Service Account (Advanced)

1. Go to **Service accounts** tab
2. Click **Generate new private key**
3. Save the JSON file (you'll need to convert this for ESP32)

---

## 💻 Step 4: Configure ESP32 Code

1. Open `ESP32_Sensor_Code.ino` in Arduino IDE
2. Update these lines:

```cpp
// WiFi credentials
#define WIFI_SSID "YOUR_WIFI_NAME"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Firebase credentials
#define FIREBASE_HOST "aquaalert-ae2f7-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "YOUR_DATABASE_SECRET"  // Paste your Firebase secret here
```

---

## 📤 Step 5: Upload to ESP32

1. Connect ESP32 to your computer via USB
2. In Arduino IDE:
   - Select **Tools > Board > ESP32 Dev Module**
   - Select correct **Port**
   - Click **Upload** button

---

## 🔍 Step 6: Monitor Serial Output

1. Open **Tools > Serial Monitor**
2. Set baud rate to **115200**
3. You should see:
   ```
   Connecting to WiFi....
   Connected! IP: 192.168.x.x
   Firebase connected!
   ===== Sensor Readings =====
   Distance: 25.5 cm
   Turbidity: 342
   ✓ Distance updated
   ✓ Turbidity updated
   ```

---

## 🌐 Step 7: View Live Data

1. Open your browser to: **http://localhost:5175/**
2. Login or register an account
3. Navigate to **IoT Dashboard** from the menu
4. You should see real-time sensor data updating every 2 seconds! 🎉

---

## 🔧 Troubleshooting

### ESP32 won't connect to WiFi:
- Check WiFi credentials are correct
- Ensure your WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
- Move ESP32 closer to router

### Firebase connection failed:
- Verify Firebase database URL is correct
- Check if database secret is valid
- Ensure Firebase Realtime Database Rules allow writes:
  ```json
  {
    "rules": {
      "sensorData": {
        ".read": true,
        ".write": true
      }
    }
  }
  ```

### No data showing on dashboard:
- Check Firebase Console → Realtime Database
- Verify data is being written to `/sensorData/` path
- Open browser console (F12) to check for errors
- Ensure you're logged in to the website

### Sensor readings incorrect:
- **Ultrasonic sensor**: Ensure there's an object within 2cm-400cm range
- **Turbidity sensor**: Calibrate sensor in clear water first
- Check wiring connections are secure

---

## 📊 Adding More Sensors (Optional)

### Temperature Sensor (DS18B20):

```cpp
#include <OneWire.h>
#include <DallasTemperature.h>

#define TEMP_PIN 4
OneWire oneWire(TEMP_PIN);
DallasTemperature sensors(&oneWire);

void setup() {
  sensors.begin();
}

float readTemperature() {
  sensors.requestTemperatures();
  return sensors.getTempCByIndex(0);
}
```

### pH Sensor:

```cpp
#define PH_PIN 35

float readPH() {
  int sensorValue = analogRead(PH_PIN);
  float voltage = sensorValue * (3.3 / 4095.0);
  float ph = 7.0 + ((2.5 - voltage) / 0.18); // Calibrate these values
  return ph;
}
```

Then add to Firebase:
```cpp
Firebase.setFloat(firebaseData, "/sensorData/temperature", temp);
Firebase.setFloat(firebaseData, "/sensorData/ph", phValue);
```

---

## 🎨 Dashboard Features

Your IoT Dashboard includes:
- ✅ Real-time sensor value updates
- ✅ Visual status indicators (Normal/Warning/Critical)
- ✅ Connection status monitoring
- ✅ Last update timestamp
- ✅ Color-coded alert levels
- ✅ Beautiful cards for each sensor
- ✅ Automatic support for temperature and pH (when available)

---

## 📝 Firebase Data Structure

```json
{
  "sensorData": {
    "distance": 25.5,      // cm (water level)
    "turbidity": 342,      // NTU (water clarity)
    "temperature": 24.3,   // °C (optional)
    "ph": 7.2,            // pH level (optional)
    "timestamp": 1234567890 // milliseconds
  }
}
```

---

## 🚀 Next Steps

1. ✅ Get ESP32 connected and sending data
2. ✅ Monitor real-time values on the dashboard
3. ⭐ Add alert thresholds (coming soon)
4. ⭐ Set up SMS/email notifications
5. ⭐ Add data logging and historical charts
6. ⭐ Deploy to production

---

## 🆘 Need Help?

- Check Firebase Console for data
- Use Serial Monitor to debug ESP32
- Check browser console (F12) for web errors
- Verify all credentials are correct

---

**Good luck with your IoT setup! 🌊📡**
