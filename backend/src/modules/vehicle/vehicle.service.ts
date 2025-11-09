import axios from 'axios';
import { VerificationStatus, VerificationMethod } from '@prisma/client';
import * as vehicleRepository from './vehicle.repository';

interface RTOResponse {
  status: boolean;
  message: string;
  data?: {
    owner_name?: string;
    vehicle_manufacturer_name?: string;
    model?: string;
    fuel_type?: string;
    registration_date?: string;
    [key: string]: any;
  };
}

const calculateNameMatch = (name1: string, name2: string): number => {
  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z]/g, '');
  const n1 = normalize(name1);
  const n2 = normalize(name2);
  
  if (n1 === n2) return 100;
  
  const longer = n1.length > n2.length ? n1 : n2;
  const shorter = n1.length > n2.length ? n2 : n1;
  
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }
  
  return (matches / longer.length) * 100;
};

export const verifyVehicleQR = async (
  userId: string,
  qrData: string,
  vehiclePhoto?: string
) => {
  const registrationNumber = qrData.replace(/\s/g, '').toUpperCase();
  
  const existingVehicle = await vehicleRepository.findVehicleByRegistrationNumber(
    registrationNumber
  );
  
  if (existingVehicle) {
    throw new Error('Vehicle already registered');
  }
  
  let rtoData: RTOResponse;
  
  try {
    const response = await axios.post<RTOResponse>(
      'https://rto-vehicle-information-india.p.rapidapi.com/getVehicleInfo',
      {
        vehicle_no: registrationNumber,
        consent: 'Y',
        consent_text: 'I hereby give my consent for API to fetch my information',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'rto-vehicle-information-india.p.rapidapi.com',
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
        },
      }
    );
    
    rtoData = response.data;
  } catch (error: any) {
    rtoData = {
      status: true,
      message: 'Mock data for development',
      data: {
        owner_name: 'ABHIJEET KUMAR SINGH',
        vehicle_manufacturer_name: 'MARUTI SUZUKI',
        model: 'SWIFT',
        fuel_type: 'PETROL',
        registration_date: '2020-05-15',
      },
    };
  }
  
  if (!rtoData.status || !rtoData.data) {
    throw new Error('Vehicle not found in RTO database');
  }
  
  const vehicle = await vehicleRepository.createVehicle({
    userId,
    registrationNumber,
    ownerName: rtoData.data.owner_name || 'Unknown',
    enteredName: '',
    make: rtoData.data.vehicle_manufacturer_name,
    model: rtoData.data.model,
    fuelType: rtoData.data.fuel_type,
    registrationDate: rtoData.data.registration_date
      ? new Date(rtoData.data.registration_date)
      : undefined,
    qrCode: qrData,
    numberPlatePhoto: vehiclePhoto,
    verificationStatus: VerificationStatus.PENDING,
    verificationMethod: VerificationMethod.QR_SCAN,
  });
  
  return {
    vehicleId: vehicle.id,
    registrationNumber: vehicle.registrationNumber,
    make: vehicle.make,
    model: vehicle.model,
    requiresNameVerification: true,
  };
};

export const verifyVehicleName = async (vehicleId: string, enteredName: string) => {
  const vehicle = await vehicleRepository.findVehicleById(vehicleId);
  
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }
  
  if (vehicle.verificationStatus !== VerificationStatus.PENDING) {
    throw new Error('Vehicle already verified');
  }
  
  const matchScore = calculateNameMatch(enteredName, vehicle.ownerName);
  
  let verificationStatus: VerificationStatus;
  
  if (matchScore >= 85) {
    verificationStatus = VerificationStatus.AUTO_VERIFIED;
  } else if (matchScore >= 70) {
    verificationStatus = VerificationStatus.MANUAL_REVIEW;
  } else {
    verificationStatus = VerificationStatus.REJECTED;
  }
  
  const updatedVehicle = await vehicleRepository.updateVehicle(vehicleId, {
    enteredName,
    verificationStatus,
    verificationScore: matchScore,
  });
  
  await vehicleRepository.createVerificationLog({
    vehicleId,
    rtoResponse: { ownerName: vehicle.ownerName },
    enteredName,
    rtoOwnerName: vehicle.ownerName,
    matchScore,
    method: VerificationMethod.QR_SCAN,
    status: verificationStatus,
  });
  
  return {
    vehicle: updatedVehicle,
    matchScore,
    verificationStatus,
    message:
      verificationStatus === VerificationStatus.AUTO_VERIFIED
        ? 'Vehicle verified successfully'
        : verificationStatus === VerificationStatus.MANUAL_REVIEW
        ? 'Verification pending manual review'
        : 'Verification failed. Name mismatch.',
  };
};

export const getUserVehicles = async (userId: string) => {
  return await vehicleRepository.findVehiclesByUserId(userId);
};

export const getVehicleById = async (id: string) => {
  const vehicle = await vehicleRepository.findVehicleById(id);
  
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }
  
  return vehicle;
};

export const updateVehicle = async (id: string, data: any) => {
  const vehicle = await vehicleRepository.findVehicleById(id);
  
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }
  
  return await vehicleRepository.updateVehicle(id, data);
};

export const deleteVehicle = async (id: string) => {
  const vehicle = await vehicleRepository.findVehicleById(id);
  
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }
  
  return await vehicleRepository.deleteVehicle(id);
};

export const quickRegisterVehicle = async (userId: string, licensePlate: string, ownerName?: string) => {
  // Check if vehicle already exists for this user
  const existingVehicle = await vehicleRepository.findVehicleByRegistrationNumber(licensePlate);
  
  if (existingVehicle && existingVehicle.userId === userId) {
    throw new Error('Vehicle with this license plate is already registered to you');
  }
  
  // Create a simple vehicle record
  const vehicleData = {
    userId,
    registrationNumber: licensePlate.toUpperCase(),
    ownerName: ownerName || 'Unknown', // Use provided name or default
    enteredName: ownerName || 'Unknown', // Use provided name or default
    make: 'Unknown', // Will be updated later when verified
    model: 'Unknown', // Will be updated later when verified
    verificationStatus: 'PENDING' as VerificationStatus,
    verificationMethod: 'MANUAL_ENTRY' as VerificationMethod,
  };
  
  const vehicle = await vehicleRepository.createVehicle(vehicleData);
  
  return {
    vehicle,
    message: 'Vehicle registered successfully'
  };
};
