import { DriverStore, LocationStore, MarkerData, ParkingMarkerData } from "@/types/type";
import { create } from "zustand";

export const useLocationStore = create<LocationStore>((set) => ({
    userAddress: null,
    userLatitude: null,
    userLongitude: null,
    destinationAddress: null,
    destinationLatitude: null,
    destinationLongitude: null,
    setUserLocation: ({ 
        latitude, longitude, address 
    }: { 
            latitude : number, longitude : number, address : string 
        }) => {
            set(() => ({
                userLatitude: latitude,
                userLongitude: longitude,
                userAddress: address,
            }));
    }, 
        setDestinationLocation: ({ 
            latitude, longitude, address 
        }: { 
                latitude : number, longitude : number, address : string 
            }) => {
                set(() => ({
                    destinationLatitude: latitude,
                    destinationLongitude: longitude,
                    destinationAddress: address,
                }));
        }, 
}));

export const useDriverStore = create<DriverStore>((set) => ({
    drivers: [] as MarkerData[],
    selectedDriver: null,
    setSelectedDriver: (driverId: number) => 
        set(() => ({ selectedDriver : driverId })),
    setDrivers: (drivers: MarkerData[]) => set(() => ({ drivers: drivers })),
    clearSelectedDriver: () => set (() => ({ selectedDriver: null }))
}));

interface ParkingStore {
    parkingSpots: ParkingMarkerData[];
    selectedParkingSpot: number | null;
    setSelectedParkingSpot: (spotId: number | null) => void;
    setParkingSpots: (spots: ParkingMarkerData[]) => void;
    clearSelectedParkingSpot: () => void;
}

export const useParkingStore = create<ParkingStore>((set) => ({
    parkingSpots: [] as ParkingMarkerData[],
    selectedParkingSpot: null,
    setSelectedParkingSpot: (spotId: number | null) => 
        set(() => ({ selectedParkingSpot: spotId })),
    setParkingSpots: (spots: ParkingMarkerData[]) => 
        set(() => ({ parkingSpots: spots })),
    clearSelectedParkingSpot: () => 
        set(() => ({ selectedParkingSpot: null }))
}));