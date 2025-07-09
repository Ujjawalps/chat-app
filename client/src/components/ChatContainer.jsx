import React from 'react'
import assets, { messagesDummyData } from '../assets/assets'

const ChatContainer = ({selectedUser, setselectedUser}) => {
  return selectedUser ?(
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>
        {/* Header */}
        <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
          <img src={assets.profile_martin} alt="Profile" className='w-8 rounded-full' />
          <p className='flex-1 text-lg text-white flex items-center gap-2'>
            Martin Johnson 
            <span className='w-2 h-2 rounded-full bg-green-500'></span>
          </p>
          <img onClick={() => {setselectedUser(null)}} src={assets.arrow_icon} alt="send" className='md:hidden max-w-7' />
          <img src={assets.help_icon} alt="help" className='max-md:hidden max-w-5' />
        </div>
        {/* Chat Area */}
        <div className='flex flex-col gap-3 p-4 pb-6h-[calc(100%-120px)] overflow-y-scroll'>
          {messagesDummyData.map((msg, index) =>(
            <div key={index} className={`flex items-end gap-2 justify-end ${msg.senderId !== '680f50e4f10f3cd28382ecf9' && 'flex-row-reverse'}`}>
                {msg.image ?(
                    <img src={msg.image} alt="Image" className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8' />
                ):(
                    <p className={`text-sm p-2 rounded-lg ${msg.senderId === '680f50e4f10f3cd28382ecf9' ? 'bg-violet-500/20 text-white' : 'bg-gray-200 text-gray-800'}`}>
                        {msg.text}
                    </p>
                )}

            </div>
          ))}
        </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bh-white/10 max-md:hidden'>
        <img src={assets.logo_icon} alt="Please select a chat" className='max-w-16' />
        <p className='text-white text-lg font-medium'>Chat Anytime, anywhere..!</p>
    </div>
  )
}

export default ChatContainer