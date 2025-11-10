<img src="imobilothon.png" alt="Imobilothon Logo" width="100%">

### The Challenge & Our Solution

The modern urban commute is fragmented and stressful. Drivers waste fuel hunting for parking, juggling multiple apps for ride-hailing, parking, and payments.

**TechWagon is our answer.**

Born from the **Volkswagen Imobilothon 5.0**, TechWagon is a single, cohesive ecosystem that integrates **AI-powered parking prediction**, seamless booking, and on-demand ride-sharing into one intuitive platform.

### Strategic Alignment with Volkswagen Group

TechWagon is a direct answer to Volkswagen's core strategic goals:

* **Sustainability & Smart City:** Our AI prediction model reduces "circling the block," directly cutting fuel consumption, vehicle emissions, and urban congestion.
* **Digital Ecosystems:** We built a scalable ecosystem that integrates the vehicle (**CarPlay**), the driver (**mobile app**), and urban infrastructure (**parking garages**).
* **Scalable Solutions:** The microservice architecture is a "plug-and-play" solution ready for any city, mall, or corporate campus.

-----

### Our Vision in Action

We invite you to see our fully functional prototype. Watch our demo video for a complete user walkthrough and review our technical presentation for a deep dive into the architecture.

<p align="center">
  <video src="https://github.com/user-attachments/assets/664b8eda-e61f-47a8-bec4-0f898ae77401" width="100%" controls>
    Your browser does not support the video tag.
  </video>
</p>

> (In case the video fails to load, you can also [watch the demo on YouTube](https://youtu.be/Dyze56q51fk).)

> ### [View Our Technical Presentation (PDF)](TechWagon.pdf)
>
> **Click above for a detailed breakdown of our system architecture, business model, and the core technology that powers TechWagon.**

-----

### Our Core Components

> **For a complete technical breakdown, including API specs and database schema, see our [ARCHITECTURE.md](ARCHITECTURE.md) file.**

TechWagon is a system of interconnected services:

* **1. The User Experience (React Native & CarPlay)**
    * **One App, Two Services:** A single mobile app (iOS/Android) for both **ride-sharing** and **smart parking**.
    * **AI-Powered Parking:** Users can see real-time availability, **predict future availability** (via our ML model), and book a spot.
    * **Seamless Access:** The user's license plate is their "ticket." Our **OpenCV** service performs ANPR, automatically validating the plate and opening the garage barrier.
    * **Integrated Payments:** A single **Stripe**-powered wallet handles all payments for both rides and parking.

* **2. The Backend & Services**
    * **Central API (Node.js):** A core **TypeScript** API, built with **Prisma ORM** and **PostgreSQL**, acts as the "central nervous system" to manage all state, users, and logic.
    * **AI Core (Python):** A **Scikit-learn** model (`parking_model_v2.joblib`) trained on synthetic data, exposed as a microservice API to predict parking availability.
    * **CV Service (Python):** A standalone **OpenCV** service (designed for a Raspberry Pi) that performs ANPR to grant garage access by validating plates against the central API.
    * **Admin Dashboard:** A separate web app giving administrators a "god-mode" view to manage users, track revenue, and manually control parking barriers.

### Repository Structure

Here is a high-level overview of how our project is organized:

```text
TechWagon/
|--- CV_VW/                  # Standalone Python CV service for ANPR
|--- packages/
|    |--- admin-dashboard/    # The React Admin Dashboard
|    |--- backend/            # The core Node.js, TypeScript, Prisma API
|    |--- mobile-app/         # The React Native (Expo) mobile app
|    |--- ml-service/         # Python API for the parking prediction model
|         |--- Syn-Dataset.ipynb # Notebook for creating synthetic data
|         |--- parking_model_v2.joblib # The trained Scikit-learn model
|--- .env.example            # Example environment variables
|--- ARCHITECTURE.md         # Full technical deep-dive and API specs
|--- README.md               # You are here
|--- TechWagon.pdf           # Project presentation slides
```

<img src="Mobilothonbanner1.webp" alt="Alt text for the banner" width="100%">
