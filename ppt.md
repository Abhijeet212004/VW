![i.mobilothon 5.0 Banner](image_34f5c6.jpg)

# TechWagon: A Predictive Parking Space Marketplace

[cite_start]This project was developed for the **Volkswagen Group i.mobilothon 5.0**[cite: 1, 2].

* [cite_start]**Team Name:** techwagon [cite: 5]
* [cite_start]**Team Leader:** Arpan Agrawal [cite: 6]
* [cite_start]**Problem Statement:** Predictive Parking Space Marketplace [cite: 7]

---

## 🚗 Our Solution

[cite_start]We developed **VolksPark**, a self-learning, in-car ecosystem designed to eliminate the friction of urban parking[cite: 12, 13, 14]. Our solution is built on three core principles:

1.  [cite_start]**Predict:** We give drivers foresight[cite: 16]. [cite_start]Our AI-powered forecasting generates a "Parking Confidence Score" for any parking lot at any future time[cite: 17, 18].
2.  [cite_start]**Detect:** We use a ground-truth feedback loop[cite: 22]. [cite_start]CV cameras provide a highly accurate, live feed of every parking slot's status [cite: 22][cite_start], constantly feeding and improving our AI[cite: 23].
3.  [cite_start]**Park:** We offer a native in-car experience [cite: 26] [cite_start]via CarPlay/Android Auto [cite: 26] [cite_start]with intelligent voice commands that understand user intent (e.g., "Get me parking at Jio World Drive in 30 minutes")[cite: 27].

## ✨ Core Features

Our platform is a comprehensive system designed for users, parking lot owners, and administrators.

* [cite_start]**Predictive Parking Availability:** Uses an ML prediction model (XGBoost) [cite: 194, 59] [cite_start]to forecast slot availability, helping users plan their arrival[cite: 59].
* [cite_start]**Real-Time Monitoring:** Employs a YOLO-based vision model to automatically detect if a parking slot is free or occupied[cite: 55].
* [cite_start]**Agentic AI Assistance:** An intelligent, context-aware assistant that learns user habits [cite: 58] [cite_start]and allows for quick slot booking via intuitive voice commands[cite: 58].
* [cite_start]**Mobile App & CarPlay/Android Auto:** A seamless, user-friendly interface on mobile [cite: 63] [cite_start]and natively integrated into the car's dashboard[cite: 26, 63].
* [cite_start]**Dynamic Pricing:** Parking prices are adjusted dynamically based on the user's distance from the lot and the current demand[cite: 60, 61].
* [cite_start]**Dual Payment Models:** Supports both **Pre-Paid** [cite: 68] (book and pay in advance) [cite_start]and **Post-Paid** [cite: 78] (automated ANPR detection and wallet deduction).
* [cite_start]**Scalable Backend:** Built on a foundation of Prisma, PostgreSQL, Redis caching, and Kubernetes for fast, reliable, and scalable deployment[cite: 66].
* [cite_start]**Admin Dashboard:** A web-based "command center" for administrators to track live slot status [cite: 382, 386][cite_start], manage vehicles [cite: 384][cite_start], and view ANPR logs[cite: 400].

---

## ⚙️ System Architecture

The platform is a set of interconnected microservices, models, and databases.

* [cite_start]**Backend Services:** A modular architecture including User & Vehicle Service, Parking Management, CV Service, Prepaid & Postpaid Billing, Logging & Analytics, and a Prediction Service (XGBoost Engine)[cite: 181, 188, 189, 190, 191, 192, 193, 194].
* **Database & Cache:**
    * [cite_start]**PostgreSQL:** The primary database for persistent data like user accounts and bookings[cite: 182, 224].
    * [cite_start]**Redis:** Used as a high-speed cache to store predicted results (with a 5-min TTL) [cite: 197][cite_start], temporary blocked slots [cite: 198][cite_start], and the live slot state for fast UI updates[cite: 209].
* **Data Ingestion:**
    * [cite_start]**Kafka:** Used to ingest slot status and number plate details from multiple parking lots simultaneously, ensuring no data loss[cite: 222].
* **Computer Vision (CV) Pipeline:**
    * [cite_start]**Slot Status (Top-Down Cam):** A `YOLO` model detects slot boundaries [cite: 199][cite_start], and a self-trained `CNN` model classifies the slot as "free" or "occupied"[cite: 215, 218, 220]. [cite_start]Snapshots are taken every 5 seconds[cite: 187, 195].
    * [cite_start]**ANPR (Entry/Exit Cams):** An `FCOS` model performs object detection to find the vehicle [cite: 203, 204][cite_start], and an `LPRNet` model performs character recognition on the license plate[cite: 216, 217].

---

## 🔄 Process Flow

We support two distinct user journeys:

### [cite_start]1. Pre-Paid Flow [cite: 68]
1.  [cite_start]User signs up and registers their vehicle[cite: 70].
2.  [cite_start]User discovers nearby parking lots on the map[cite: 73].
3.  [cite_start]User selects a lot, and the app fetches the *predicted* availability from the ML model/Redis cache[cite: 74].
4.  [cite_start]User selects a specific slot, which is *real-time* updated via the CV system[cite: 75].
5.  [cite_start]User pays the fee through the built-in wallet or payment gateway[cite: 80].
6.  [cite_start]User navigates to the slot using provided GMaps[cite: 79].
7.  [cite_start]The user can extend their parking time via the app if needed[cite: 57, 77].

### [cite_start]2. Post-Paid Flow [cite: 78]
1.  [cite_start]User signs up and registers their vehicle[cite: 81]. (This feature is only for registered users) [cite_start][cite: 179].
2.  [cite_start]The entry gate camera uses a `CNN` model to extract the number plate upon entry[cite: 82].
3.  [cite_start]The exit gate camera uses a `CNN` model to extract the number plate upon exit[cite: 83].
4.  [cite_start]The system sends the entry time, exit time, and number plate to the server[cite: 84].
5.  [cite_start]The server calculates the total time and automatically deducts the fee from the user's wallet[cite: 85, 177].

---

## 🛠️ Tech Stack

[cite_start]Our platform is built with modern, scalable technologies. [cite: 246]

| Category | Technology |
| :--- | :--- |
| **Frontend** | [cite_start]React [cite: 251][cite_start], React Native [cite: 258][cite_start], Expo [cite: 257][cite_start], CarPlay [cite: 252][cite_start], TailwindCSS [cite: 253] |
| **Backend** | [cite_start]Node.js [cite: 254][cite_start], Prisma ORM [cite: 255][cite_start], PostgreSQL [cite: 261][cite_start], Redis (Cache) [cite: 256][cite_start], Kubernetes [cite: 262] |
| **ML & CV** | [cite_start]YOLOv8 [cite: 260][cite_start], XGBoost [cite: 264][cite_start], Python [cite: 268][cite_start], TensorFlow [cite: 270][cite_start], OpenCV [cite: 271] |
| **Cloud & DevOps** | [cite_start]AWS [cite: 265][cite_start], Docker [cite: 269][cite_start], Gmaps API [cite: 272][cite_start], google adk [cite: 273] |

---

## 📊 Model Performance

* [cite_start]**YOLOv8 (Slot Detection):** Achieved 90% - 95% detection accuracy after hyperparameter tuning[cite: 558].
* [cite_start]**CNN (Occupancy Classifier):** Reliably determines "Empty" or "Occupied" status with 95% - 98% accuracy[cite: 560, 561].
* [cite_start]**XGBoost (Predictive Model):** Trained on a synthesis dataset, achieving 93% accuracy in predicting future availability[cite: 563, 564].

---

## 🚀 Future Development

We have a clear roadmap for enhancing the platform:

* [cite_start]**IoT Integration:** Integrate ESP32 modules with weight sensors to provide hardware-level validation of slot occupancy, complementing the OpenCV system[cite: 568].
* [cite_start]**Hybrid Detection:** Implement a sensor-vision fusion model that blends image data and sensor feedback for unmatched accuracy, even in poor lighting[cite: 569].
* [cite_start]**Agentic AI Upgrade:** Enhance the AI to deliver proactive recommendations and adaptive pricing insights[cite: 570].
* [cite_start]**Scalable Architecture:** Continue to refine the Kubernetes-powered microservice architecture for seamless expansion to new parking sites[cite: 571].
