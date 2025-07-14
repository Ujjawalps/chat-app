import React, { useRef, useEffect, useState, useContext } from 'react';
import assets from '../assets/assets';
import { formatMessageTime } from '../lib/utils';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();
  const [input, setInput] = useState('');

  const handleSendMessage = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (input.trim() === '') return;

    await sendMessage({ text: input.trim() });
    setInput('');
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }

    // 👁️ Mark unseen messages from selectedUser as seen
    const markMessagesAsSeen = async () => {
      const unseenMessages = messages.filter(
        (msg) => msg.senderId === selectedUser?._id && !msg.seen
      );

      unseenMessages.forEach((msg) => {
        fetch(`http://localhost:5000/api/messages/mark/${msg._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authUser.token}`,
          },
        }).catch((err) => console.error("Failed to mark seen:", err));
      });
    };

    if (selectedUser && messages?.length > 0) {
      markMessagesAsSeen();
    }
  }, [messages, selectedUser, authUser.token]);

  return selectedUser ? (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>
      {/* Header */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={selectedUser?.profilePic || assets.profile_martin} alt="Profile" className='w-8 rounded-full' />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {selectedUser?.fullName || 'Unknown User'}
          {onlineUsers.includes(selectedUser?._id) ? (
            <span className='w-2 h-2 rounded-full bg-green-500'></span>
          ) : (
            <span className='w-2 h-2 rounded-full bg-red-500'></span>
          )}
        </p>
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="back" className='md:hidden max-w-7' />
        <img src={assets.help_icon} alt="help" className='max-md:hidden max-w-5' />
      </div>

      {/* Chat Area */}
      <div className='flex flex-col p-4 pb-6 h-[calc(100%-120px)] overflow-y-scroll'>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 justify-end ${
              msg.senderId !== authUser._id && 'flex-row-reverse'
            }`}
          >
            {msg.image ? (
              <img
                src={msg.image}
                alt="Image"
                className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8'
              />
            ) : (
              <div className='relative'>
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                    msg.senderId === authUser._id ? 'rounded-br-none' : 'rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </p>
                {/* 👁️ Seen indicator for last message by me */}
                {msg.senderId === authUser._id && index === messages.length - 1 && (
                  <span className='absolute bottom-2 right-2 text-[10px] text-green-400'>
                    {msg.seen ? '👁️' : '🕓'}
                  </span>
                )}
              </div>
            )}
            <div className='text-center text-xs'>
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt=""
                className='w-7 rounded-full'
              />
              <p className='text-gray-500'>{formatMessageTime(msg.createdAt)}</p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>

      {/* bottom Area */}
      <div className='absolute bottom-0 left-0 right-0 p-3 flex items-center gap-3'>
        <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
            type="text"
            placeholder='send a message...'
            className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400'
          />
          <input onChange={handleSendImage} type="file" id='image' accept='image/png, image/jpeg, image/jpg' hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="F" className='w-5 mr-2 cursor-pointer' />
          </label>
        </div>
        <img onClick={() => handleSendMessage()} src={assets.send_button} alt="Send" className='w-7 cursor-pointer' />
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bh-white/10 max-md:hidden'>
      <img src={assets.logo_icon} alt="Please select a chat" className='max-w-16' />
      <p className='text-white text-lg font-medium'>Chat Anytime, anywhere..!</p>
    </div>
  );
};

export default ChatContainer;
