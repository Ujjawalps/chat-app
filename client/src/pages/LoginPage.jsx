import React, { useContext, useState } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [currState, setCurrentState] = useState('sign up');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (currState === 'sign up' && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    const success = await login(currState === 'sign up' ? 'signup' : 'login', {
      fullName,
      email,
      password,
      bio,
    });

    if (success) navigate('/');
  };

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/* Logo */}
      <img src={assets.logo_big} alt="Logo" className='w-[min(300vm,250px)]' />

      {/* Form */}
      <form onSubmit={onSubmitHandler} className='w-[min(90vw,_350px)] border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}
          {isDataSubmitted && (
            <img src={assets.arrow_icon} alt="Back" onClick={() => setIsDataSubmitted(false)} className='w-4 cursor-pointer' />
          )}
        </h2>

        {currState === 'sign up' && !isDataSubmitted && (
          <input type="text" name="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder='Full Name' required className='input-style' />
        )}

        {!isDataSubmitted && (
          <>
            <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' required className='input-style' />
            <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' required className='input-style' />
          </>
        )}

        {currState === 'sign up' && isDataSubmitted && (
          <textarea name="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder='Provide a short Bio' required className='input-style'></textarea>
        )}

        <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white font-semibold rounded-md hover:opacity-90 transition-opacity duration-200'>
          {currState === 'sign up' ? 'Create Account' : 'Login Now'}
        </button>

        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <input type="checkbox" />
          <p>Agree to terms and conditions.</p>
        </div>

        <div className='flex flex-col gap-2'>
          {currState === 'sign up' ? (
            <p>Already have an Account? <span className='text-blue-500 cursor-pointer' onClick={() => setCurrentState('login')}>Login here</span></p>
          ) : (
            <p>Don't have an Account? <span className='text-blue-500 cursor-pointer' onClick={() => setCurrentState('sign up')}>Create Account</span></p>
          )}
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
