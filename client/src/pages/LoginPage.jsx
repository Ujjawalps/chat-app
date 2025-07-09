import React, { useState } from 'react'
import assets from '../assets/assets'

function LoginPage() {
  const [currState, setCurrentState] = useState('sign up')
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isDataSubmitted, setIsDataSubmitted] = useState(false)

  const onSubmitHandler = (e) => {
    e.preventDefault()

    if(currState === 'sign up' && !isDataSubmitted) {
      setIsDataSubmitted(true)
      return;
    }
  }
  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/* left side */}
      <img src={assets.logo_big} alt="img" className='w-[min(300vm, 250px)]'/>
      {/* right side */}
      <form onSubmit={onSubmitHandler} className='w-[min(90vw,_350px)] border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}
          {isDataSubmitted && <img src={assets.arrow_icon} alt="->" onClick={()=>setIsDataSubmitted(false)} className='w-4 cursor-pointer'/>}
        </h2>
        {
          currState === 'sign up' && !isDataSubmitted && (
            <input name="fullName" type="text" onChange={(e)=> setFullName(e.target.value)} value={fullName} className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Full Name' required/>
          )}
          {!isDataSubmitted && (
            <>
              <input name="email" onChange={(e) => setEmail(e.target.value)} value={email} type="email" className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Email' required/>
              <input name="password" onChange={(e) => setPassword(e.target.value)} value={password} type="password" className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Password' required/>
             </>
          )}
          { currState === 'sign up' && isDataSubmitted && (
            <textarea name="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Provide a short Bio' required></textarea>
          )}
          <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white font-semibold rounded-md hover:opacity-90 transition-opacity duration-200 cursor-pointer'>
            {currState === 'sign up' ? 'Create Account' : 'Login Now'}
          </button>
          <div className='flex items-center gap-2 text-sm text-gray-500'>
            <input type="checkbox"  />
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
  )
}

export default LoginPage