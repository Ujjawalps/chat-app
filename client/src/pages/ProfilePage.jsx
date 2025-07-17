import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import Loader from "../components/Loader";

function ProfilePage() {
    const { authUser, updateProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    const [selectedImg, setSelectedImg] = useState(null);
    const [name, setName] = useState(authUser?.fullName || "Unknown User");
    const [bio, setBio] = useState(authUser?.bio || "Hi there! I am a software engineer with a passion for building web applications.");
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!selectedImg) {
                await updateProfile({ fullName: name, bio });
                navigate('/');
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(selectedImg);

            await new Promise((resolve, reject) => {
                reader.onloadend = async () => {
                    await updateProfile({ fullName: name, bio, profilePic: reader.result });
                    resolve();
                };
                reader.onerror = reject;
            });

            navigate('/');
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setLoading(false);
        }
    };

    return loading ? (
        <Loader />
    ) : (
        <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
            <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
                {/* Form */}
                <form onSubmit={onSubmitHandler} className='flex flex-col gap-4 p-6 w-full flex-1'>
                    <h3 className='text-lg'>Profile Information</h3>
                    <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
                        <input onChange={(e) => setSelectedImg(e.target.files[0])} type="file" id="avatar" hidden accept='.png,.jpg,.jpeg' />
                        <img src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatar_icon} alt="Avatar" className='w-12 h-12 rounded-full' />
                        Upload avatar
                    </label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name..." className='input-style' />
                    <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} required placeholder="Your bio..." className='input-style'></textarea>
                    <button type="submit" className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer">Save</button>
                </form>

                {/* Preview */}
                <img src={authUser?.profilePic || assets.logo_icon} alt="Preview" className='max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10' />
            </div>
        </div>
    );
}

export default ProfilePage;
