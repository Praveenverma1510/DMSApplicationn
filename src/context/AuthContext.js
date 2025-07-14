import React, { createContext, useState, useContext } from 'react';
import { API } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');

  const generateOTP = async (phoneNumber) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.auth.generateOTP(phoneNumber);
      if (response.data.success) {
        setMobileNumber(phoneNumber);
        setIsLoading(false);
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(handleApiError(err));
      setIsLoading(false);
      return false;
    }
  };

  const validateOTP = async (otp) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.auth.validateOTP(mobileNumber, otp);
      if (response.data.success) {
        const token = response.data.token; // Assuming the token is returned in response
        await AsyncStorage.setItem('authToken', token);
        setUserToken(token);
        setIsLoading(false);
        return true;
      } else {
        throw new Error(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(handleApiError(err));
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    setUserToken(null);
    setMobileNumber('');
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        isLoading,
        error,
        mobileNumber,
        generateOTP,
        validateOTP,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);