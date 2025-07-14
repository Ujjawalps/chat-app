import React, { useState } from 'react'
import assets from '../assets/assets';
import { useContext } from 'react'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext';
import { useEffect } from 'react';

function RightSidebar() {
  const { selectedUser, messages } = useContext(ChatContext);
  const {logout, onlineUsers} = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  // get all the images from messages
  useEffect(() => {
    setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
  }, [messages]);

  return  selectedUser &&(
    <div className={`bg-[#8185B2]/10 w-full relative overflow-y-scroll text-white ${selectedUser ? "max-md:hidden" : ''}`}>
        <div className='pt-16 flex flex-col items-center justify-center gap-2 text-xs font-light ms-auto'>
            <img src={selectedUser?.profilePic || assets.avatar_icon} alt="Profile" className='w-20 aspect-[1/1] rounded-full'/>
            <h1 className='px-10 text-xl font-medium mx-auto flex items-center gap-2'>
                {onlineUsers.includes(selectedUser._id) && <p className='w-2 h-2 rounded-full bg-green-500'></p>}
                {!onlineUsers.includes(selectedUser._id) && <p className='w-2 h-2 rounded-full bg-red-500'></p>}
                {selectedUser?.fullName || 'Unknown User'}
            </h1>
            <p className='px-10 mx-auto'>{selectedUser.bio}</p>
        </div>
        <hr className='border-gray-500 my-4' />
        <div className='px-5 text-xs'>
            <p>Media</p>
            <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80'>
                {msgImages.map((image, index) => (
                    <div key={index} onClick={() => window.open(image)} className='cursor-pointer rounded'>
                        <img src={image} alt="" className='h-full rounded-md'/>

                    </div>
                ))}

            </div>
        </div>
        <div className='bg-[#dbdcd8]'></div>
        <button className='absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#e54b46] to-[#c31569] text-white border-none text-sm font-light px-10 py-2 rounded-full cursor-pointer'>
            logout
        </button>
    </div>
  ) 
}

export default RightSidebar