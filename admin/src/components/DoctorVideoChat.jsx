import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { DoctorContext } from '../context/DoctorContext';

const DoctorVideoChat = ({ appointmentId, isDoctor = false, onClose }) => {
  const { backendUrl } = useContext(AppContext); // Use AppContext for backendUrl
  const { dToken } = useContext(DoctorContext); // Use DoctorContext for token
  const [roomId, setRoomId] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [participantJoined, setParticipantJoined] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [canAccessVideo, setCanAccessVideo] = useState(false);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const intervalRef = useRef();

  const pcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // FIXED: Check video call status with proper query parameters
  const checkVideoCallStatus = async () => {
    try {
      console.log('Checking video status for appointment:', appointmentId);
      console.log('Using token:', dToken);
      console.log('Backend URL:', backendUrl);

      const response = await axios.get(
        `${backendUrl}/api/doctor/video/status?appointmentId=${appointmentId}`, // FIXED: Query parameter
        {
          headers: { 
            'Content-Type': 'application/json', 
            'dtoken': dToken // FIXED: Use lowercase 'dtoken'
          }
        }
      );

      const data = response.data;
      console.log('Video call status response:', data);

      if (data.success) {
        const videoAccess = data.videoStatus?.canAccessVideo || false;
        setCanAccessVideo(videoAccess);

        console.log('Can access video:', videoAccess);
        console.log('Payment status:', data.appointmentData?.payment);
        console.log('Cancelled:', data.appointmentData?.cancelled);
        console.log('Completed:', data.appointmentData?.isCompleted);

        if (data.videoStatus?.roomId) {
          setRoomId(data.videoStatus.roomId);
        }

        if (data.videoStatus?.isActive) {
          setIsCallActive(true);
        }

        return videoAccess;
      } else {
        console.error('Video status check failed:', data.message);
        setError(data.message || 'Failed to check video call status');
        return false;
      }
    } catch (error) {
      console.error('Error checking video call status:', error.response?.data || error.message);
      setError('Failed to check video call status: ' + (error.response?.data?.message || error.message));
      return false;
    }
  };

  // FIXED: Generate video room with proper headers
  const generateVideoRoom = async () => {
    try {
      console.log('Generating video room for appointment:', appointmentId);

      const response = await axios.post(
        `${backendUrl}/api/doctor/video/generate-room`,
        { appointmentId },
        { 
          headers: { 
            'Content-Type': 'application/json', 
            'dtoken': dToken // FIXED: Use lowercase 'dtoken'
          } 
        }
      );

      const data = response.data;
      console.log('Generate room response:', data);

      if (data.success) {
        setRoomId(data.roomId);
        return data.roomId;
      } else {
        setError(data.message);
        return null;
      }
    } catch (error) {
      console.error('Error generating video room:', error.response?.data || error.message);
      setError('Failed to generate video room: ' + (error.response?.data?.message || error.message));
      return null;
    }
  };

  // Initialize media devices
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setError('Camera/microphone access denied');
      return null;
    }
  };

  // Create peer connection
  const createPeerConnection = (stream) => {
    const pc = new RTCPeerConnection(pcConfig);

    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      setParticipantJoined(true);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate:', event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setParticipantJoined(true);
      } else if (pc.connectionState === 'failed') {
        setError('Connection failed');
      }
    };

    setPeerConnection(pc);
    return pc;
  };

  // Start video call
  const startVideoCall = async () => {
    // REMOVED: Check for canAccessVideo here, let backend handle it
    console.log('Starting video call...');

    setIsConnecting(true);
    try {
      let currentRoomId = roomId;
      if (!currentRoomId) {
        currentRoomId = await generateVideoRoom();
        if (!currentRoomId) {
          setIsConnecting(false);
          return;
        }
      }

      const stream = await initializeMedia();
      if (!stream) {
        setIsConnecting(false);
        return;
      }

      createPeerConnection(stream);

      const response = await axios.post(
        `${backendUrl}/api/doctor/video/start-call`,
        { appointmentId },
        { 
          headers: { 
            'Content-Type': 'application/json', 
            'dtoken': dToken 
          } 
        }
      );

      const data = response.data;

      if (data.success) {
        setIsCallActive(true);
        startCallTimer();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error starting video call:', error.response?.data || error.message);
      setError('Failed to start video call: ' + (error.response?.data?.message || error.message));
    }
    setIsConnecting(false);
  };

  // End video call
  const endVideoCall = async () => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection) {
        peerConnection.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      await axios.post(
        `${backendUrl}/api/doctor/video/end-call`,
        { appointmentId },
        { 
          headers: { 
            'Content-Type': 'application/json', 
            'dtoken': dToken 
          } 
        }
      );

      setIsCallActive(false);
      setLocalStream(null);
      setRemoteStream(null);
      setPeerConnection(null);
      setParticipantJoined(false);
      setCallDuration(0);
    } catch (error) {
      console.error('Error ending video call:', error);
      setError('Failed to end video call properly');
    }
  };

  const startCallTimer = () => {
    intervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  useEffect(() => {
    console.log('Component mounted with:', { appointmentId, dToken, backendUrl });
    
    if (dToken && appointmentId) {
      checkVideoCallStatus();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, [dToken, appointmentId]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Video Call Error</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // MODIFIED: Always allow trying to start call, let backend handle validation
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            {isDoctor ? 'Patient Consultation' : 'Doctor Consultation'}
          </h3>
          {isCallActive && (
            <p className="text-sm text-gray-300">Duration: {formatDuration(callDuration)}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 text-2xl"
        >
          ×
        </button>
      </div>

      <div className="flex-1 relative">
        {!isCallActive ? (
          <div className="h-full flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <div className="text-6xl mb-6">📹</div>
              <h3 className="text-xl font-semibold mb-4">Ready to start video call?</h3>
              <p className="text-gray-300 mb-6">Room ID: {roomId || 'Generating...'}</p>
              {!canAccessVideo && (
                <p className="text-yellow-300 mb-4 text-sm">
                  ⚠️ Video access may be restricted. Trying to start call...
                </p>
              )}
              <button
                onClick={startVideoCall}
                disabled={isConnecting}
                className={`px-8 py-3 rounded-lg font-semibold ${
                  isConnecting
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isConnecting ? 'Connecting...' : 'Start Call'}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
            {!participantJoined && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Waiting for {isDoctor ? 'patient' : 'doctor'} to join...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isCallActive && (
        <div className="bg-gray-900 p-4 flex justify-center space-x-4">
          <button
            onClick={toggleVideo}
            className="bg-gray-700 text-white p-3 rounded-full hover:bg-gray-600"
          >
            📹
          </button>
          <button
            onClick={toggleAudio}
            className="bg-gray-700 text-white p-3 rounded-full hover:bg-gray-600"
          >
            🎤
          </button>
          <button
            onClick={endVideoCall}
            className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 font-semibold"
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorVideoChat;