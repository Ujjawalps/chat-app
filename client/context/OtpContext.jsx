import { createContext, useContext, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRef } from 'react';

export const OtpContext = createContext();

export const OtpProvider = ({ children }) => {
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerId = useRef(null);

  const sendOtp = async (email) => {
    if (!email) {
      toast.error("Email is required to send OTP");
      return;
    }

    setOtpLoading(true);
    try {
      const { data } = await axios.post('/api/otp/send', { email });

      if (data.success) {
        toast.success(data.message || "OTP sent!");
        startTimer();
      } else {
        toast.error(data.message || "OTP sending failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async (email, otp) => {
    if (!email || !otp) {
      toast.error("Email and OTP are required");
      return false;
    }

    setOtpLoading(true);
    try {
      const { data } = await axios.post('/api/otp/verify', { email, otp });

      if (data.success) {
        setIsEmailVerified(true);
        toast.success(data.message || "OTP verified successfully");
        return true;
      } else {
        toast.error(data.message || "OTP verification failed");
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
      return false;
    } finally {
      setOtpLoading(false);
    }
  };

  const startTimer = () => {
    setTimer(59);
    if (timerId.current) clearInterval(timerId.current);
    timerId.current = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(timerId.current);
          timerId.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetOtpState = () => {
    setIsEmailVerified(false);
    setTimer(0);
  };

  return (
    <OtpContext.Provider value={{ sendOtp, verifyOtp, isEmailVerified, timer, otpLoading, resetOtpState }}>
      {children}
    </OtpContext.Provider>
  );
};

export const useOtp = () => useContext(OtpContext);
