import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export const useApi = () => {
  const { token } = useAuth();

  const apiCall = async (
    endpoint: string,
    method: string = 'GET',
    body?: any
  ) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const config: RequestInit = {
        method,
        headers,
      };

      if (body && (method === 'POST' || method === 'PATCH')) {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  };

  return {
    auth: {
      register: (userData: {
        clerkId: string;
        email: string;
        name: string;
        phone?: string;
      }) => apiCall('/api/auth/register', 'POST', userData),
      
      getProfile: () => apiCall('/api/auth/profile'),
      
      updateProfile: (data: any) => apiCall('/api/auth/profile', 'PATCH', data),
    },

    vehicle: {
      verifyQR: (qrData: string, vehiclePhoto?: string) =>
        apiCall('/api/vehicle/verify-qr', 'POST', { qrData, vehiclePhoto }),
      
      verifyName: (vehicleId: string, enteredName: string) =>
        apiCall('/api/vehicle/verify-name', 'POST', { vehicleId, enteredName }),
      
      getMyVehicles: () => apiCall('/api/vehicle/my-vehicles'),
      
      getVehicleById: (id: string) => apiCall(`/api/vehicle/${id}`),
      
      updateVehicle: (id: string, data: any) =>
        apiCall(`/api/vehicle/${id}`, 'PATCH', data),
      
      deleteVehicle: (id: string) => apiCall(`/api/vehicle/${id}`, 'DELETE'),
    },
  };
};
