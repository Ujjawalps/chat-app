import React, { useContext, useState, useEffect } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import { OtpContext } from '../../context/OtpContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';


function LoginPage() {
  const [currState, setCurrentState] = useState('sign up');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const { loading: otpLoading } = useContext(OtpContext);
  const { loadingAuth } = useContext(AuthContext);

  const { sendOtp, verifyOtp, isEmailVerified, timer, resetOtpState } = useContext(OtpContext);

  // Reset on mode switch
  useEffect(() => {
    setFullName('');
    setBio('');
    setEmail('');
    setPassword('');
    setOtp('');
    setAgreeTerms(false);
    setIsDataSubmitted(false);
    resetOtpState();
  }, [currState]);

  const handleSendOtp = async () => {
    if (!email) return toast.error('Email is required');
    await sendOtp(email);
  };

  const handleVerifyOtp = async () => {
    if (!email || !otp) return toast.error('Email and OTP are required');
    await verifyOtp(email, otp);
  };

 const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (currState === 'sign up') {
      if (!agreeTerms) return toast.error('Please agree to the terms');
      if (!isDataSubmitted) {
        if (!isEmailVerified) return toast.error("Verify your email first");
        return setIsDataSubmitted(true);
      }
    }

    setLoginInProgress(true);
    const success = await login(currState === 'sign up' ? 'signup' : 'login', {
      fullName, email, password, bio,
    });
    setLoginInProgress(false);

    if (success) navigate('/');
  };

  if (otpLoading || loadingAuth) return <Loader />;
  return (
    <div className='min-h-screen flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl bg-cover bg-center'>
      <img src={assets.logo_big} alt="img" className='w-[min(300vm,250px)]' />
      <form
        onSubmit={onSubmitHandler}
        className='w-[min(90vw,_350px)] border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'
      >
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}
          {isDataSubmitted && (
            <img
              src={assets.arrow_icon}
              alt="->"
              onClick={() => setIsDataSubmitted(false)}
              className='w-4 cursor-pointer'
            />
          )}
        </h2>

        {currState === 'sign up' && !isDataSubmitted && (
          <input
            name="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder='Full Name'
            className='p-2 border border-gray-300 rounded-md'
            required
          />
        )}

        {!isDataSubmitted && (
          <>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Email'
              className='p-2 border border-gray-300 rounded-md'
              required
            />

            {currState === 'sign up' && (
              <>
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || timer > 0}
                    className='py-1 px-3 bg-blue-500 text-white rounded-md text-sm'
                  >
                    {timer > 0 ? `Resend OTP in ${timer}s` : 'Send OTP'}
                  </button>
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    name="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder='Enter OTP'
                    className='p-2 border border-gray-300 rounded-md flex-1'
                    required
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isEmailVerified || !otp}
                    className='py-1 px-3 bg-green-600 text-white rounded-md text-sm'
                  >
                    {isEmailVerified ? 'Verified ✅' : 'Verify'}
                  </button>
                </div>
              </>
            )}

            <input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Password'
              className='p-2 border border-gray-300 rounded-md'
              required
            />
          </>
        )}

        {currState === 'sign up' && isDataSubmitted && (
          <textarea
            name="bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className='p-2 border border-gray-300 rounded-md'
            placeholder='Provide a short Bio'
            required
          />
        )}

        <button
          type='submit'
          className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white font-semibold rounded-md flex items-center justify-center'
        >
          {loginInProgress ? <span className='loader-small'></span> : (currState === 'sign up' ? 'Create Account' : 'Login Now')}
        </button>


        {currState === 'sign up' && (
          <label className='flex items-center gap-2 text-sm text-gray-500 cursor-pointer'>
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            <span>I agree to terms and conditions.</span>
          </label>
        )}

        <div className='flex flex-col gap-2'>
          {currState === 'sign up' ? (
            <p>
              Already have an Account?{' '}
              <span
                className='text-blue-500 cursor-pointer'
                onClick={() => setCurrentState('login')}
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              Don't have an Account?{' '}
              <span
                className='text-blue-500 cursor-pointer'
                onClick={() => setCurrentState('sign up')}
              >
                Create Account
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
