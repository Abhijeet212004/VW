import arrowDown from "@/assets/icons/arrow-down.png";
import arrowUp from "@/assets/icons/arrow-up.png";
import backArrow from "@/assets/icons/back-arrow.png";
import chat from "@/assets/icons/chat.png";
import checkmark from "@/assets/icons/check.png";
import close from "@/assets/icons/close.png";
import dollar from "@/assets/icons/dollar.png";
import email from "@/assets/icons/email.png";
import eyecross from "@/assets/icons/eyecross.png";
import google from "@/assets/icons/google.png";
import home from "@/assets/icons/home.png";
import list from "@/assets/icons/list.png";
import lock from "@/assets/icons/lock.png";
import map from "@/assets/icons/map.png";
import marker from "@/assets/icons/marker.png";
import out from "@/assets/icons/out.png";
import person from "@/assets/icons/person.png";
import pin from "@/assets/icons/pin.png";
import point from "@/assets/icons/point.png";
import profile from "@/assets/icons/profile.png";
import search from "@/assets/icons/search.png";
import selectedMarker from "@/assets/icons/selected-marker.png";
import star from "@/assets/icons/star.png";
import target from "@/assets/icons/target.png";
import to from "@/assets/icons/to.png";
import check from "@/assets/images/check.png";
import getStarted from "@/assets/images/get-started.png";
import message from "@/assets/images/message.png";
import noResult from "@/assets/images/no-result.png";
import onboarding1 from "@/assets/images/onboarding1.png";
import onboarding2 from "@/assets/images/onboarding2.png";
import onboarding3 from "@/assets/images/onboarding3.png";
import signUpCar from "@/assets/images/signup-car.png";
import car from "@/assets/images/car.png";

export const images = {
    onboarding1,
    onboarding2,
    onboarding3,
    getStarted,
    signUpCar,
    check,
    noResult,
    message,
    car,
};

export const icons = {
    arrowDown,
    arrowUp,
    backArrow,
    chat,
    checkmark,
    close,
    dollar,
    email,
    eyecross,
    google,
    home,
    list,
    lock,
    map,
    marker,
    out,
    person,
    pin,
    point,
    profile,
    search,
    selectedMarker,
    star,
    target,
    to,
};

export const onboarding = [
    {
        id: 1,
        title: "The perfect ride is just a tap away!",
        description:
            "Your journey begins with Ryde. Find your ideal ride effortlessly.",
        image: images.onboarding1,
    },
    {
        id: 2,
        title: "Best car in your hands with Ryde",
        description:
            "Discover the convenience of finding your perfect ride with Ryde",
        image: images.onboarding2,
    },
    {
        id: 3,
        title: "Your ride, your way. Let's go!",
        description:
            "Enter your destination, sit back, and let us take care of the rest.",
        image: images.onboarding3,
    },
];

export const data = {
    onboarding,
};

export const predefinedParkingSpots = [
    {
        id: 1,
        ml_area: "pict_campus",
        title: "PICT Campus Parking",
        name: "Pune Institute of Computer Technology",
        address: "Near Dhankawadi, Pune, Maharashtra 411043",
        latitude: 18.5204,
        longitude: 73.8567,
        price_per_hour: 20,
        total_spots: 55,
        is_covered: false,
        has_security: true,
        rating: 4.2,
        image_url: "https://example.com/pict-parking.jpg"
    },
    {
        id: 2,
        ml_area: "phoenix_mall",
        title: "Phoenix Mall Parking",
        name: "Phoenix MarketCity Pune",
        address: "Viman Nagar, Pune, Maharashtra 411014",
        latitude: 18.5679,
        longitude: 73.9143,
        price_per_hour: 30,
        total_spots: 120,
        is_covered: true,
        has_security: true,
        rating: 4.5,
        image_url: "https://example.com/phoenix-parking.jpg"
    },
    {
        id: 3,
        ml_area: "amanora_mall",
        title: "Amanora Mall Parking",
        name: "Amanora Town Centre",
        address: "Hadapsar, Pune, Maharashtra 411028",
        latitude: 18.5018,
        longitude: 73.9346,
        price_per_hour: 25,
        total_spots: 85,
        is_covered: true,
        has_security: true,
        rating: 4.3,
        image_url: "https://example.com/amanora-parking.jpg"
    },
    {
        id: 4,
        ml_area: "seasons_mall",
        title: "Seasons Mall Parking",
        name: "Seasons Mall Magarpatta",
        address: "Magarpatta City, Hadapsar, Pune, Maharashtra 411013",
        latitude: 18.5089,
        longitude: 73.9260,
        price_per_hour: 35,
        total_spots: 95,
        is_covered: true,
        has_security: true,
        rating: 4.4,
        image_url: "https://example.com/seasons-parking.jpg"
    },
    {
        id: 5,
        ml_area: "kharadi_it_park",
        title: "Kharadi IT Park",
        name: "EON IT Park Kharadi",
        address: "Kharadi, Pune, Maharashtra 411014",
        latitude: 18.5593,
        longitude: 73.9787,
        price_per_hour: 15,
        total_spots: 200,
        is_covered: false,
        has_security: true,
        rating: 4.1,
        image_url: "https://example.com/eon-parking.jpg"
    }
];