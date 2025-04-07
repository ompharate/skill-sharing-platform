import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LiveKitRoom,
  VideoConference,
  ControlBar,
  useTracks,
  RoomAudioRenderer,
  GridLayout,
  ParticipantTile,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';
import '@livekit/components-styles';

const VideoCall = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callTime, setCallTime] = useState(0);
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Timer for call duration
  useEffect(() => {
    let timer;
    if (token) {
      timer = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [token]);

  // Format call time
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/video/token/${userId}`, {
          withCredentials: true
        });
        setToken(response.data.token);
      } catch (error) {
        console.error('Error fetching token:', error);
        setError('Failed to get video token. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchToken();
    }
  }, [userId, user]);

  const handleDisconnect = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 rounded-lg bg-white shadow-lg">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-medium">Setting up your call...</div>
          <p className="text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 rounded-lg bg-white shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div className="text-xl font-medium text-red-500 mb-4">{error}</div>
          <p className="text-gray-600 mb-6">Please try again or contact support if the issue persists.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Video Call</h1>
          <div className="bg-gray-700 px-3 py-1 rounded-full text-sm">
            {formatTime(callTime)}
          </div>
        </div>
        <button 
          onClick={handleDisconnect}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          End Call
        </button>
      </div>
      
      <div className="flex-grow relative">
        <LiveKitRoom
          token={token}
          serverUrl={import.meta.env.VITE_LIVEKIT_URL || "wss://your-livekit-server.livekit.cloud"}
          connect={true}
          video={true}
          audio={true}
          onDisconnected={handleDisconnect}
          className="h-full"
          
        >
          <RoomAudioRenderer />
          <VideoConference />
          <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4">
            <ControlBar 
              controls={{ 
                microphone: true, 
                camera: true, 
                screenShare: true, 
                leave: true 
              }} 
            />
          </div>
        </LiveKitRoom>
      </div>
    </div>
  );
};

export default VideoCall;