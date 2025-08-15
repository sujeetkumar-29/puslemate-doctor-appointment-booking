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
  };import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const UserVideoChat = ({ appointmentId, isDoctor = false, onClose }) => {
  const { backendUrl, token } = useContext(AppContext);
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

  // WebRTC configuration
  const pcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Check video call access and status
 // In UserVideoChat.jsx - Fix the token usage
const checkVideoCallStatus = async () => {
    try {
        const response = await fetch(`${backendUrl}/api/user/video/status?appointmentId=${appointmentId}`, {
            headers: { 
                'token': token  // Use 'token' not just token
            }
        });
        const data = await response.json();
        
        if (data.success) {
            setCanAccessVideo(data.canAccessVideo);
            if (data.videoCall?.isActive) {
                setIsCallActive(true);
            }
            return data.canAccessVideo;
        } else {
            setError(data.message);
            return false;
        }
    } catch (error) {
        console.error('Error checking video call status:', error);
        setError('Failed to check video call status');
        return false;
    }
};

  // Generate video room
  const generateVideoRoom = async () => {
    try {
      const endpoint = isDoctor ? '/api/doctor/video/generate-room' : '/api/user/video/generate-room';
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          token 
        },
        body: JSON.stringify({ appointmentId })
      });
      const data = await response.json();
      
      if (data.success) {
        setRoomId(data.roomId);
        return data.roomId;
      } else {
        setError(data.message);
        return null;
      }
    } catch (error) {
      console.error('Error generating video room:', error);
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
      toast.error('Cannot access camera/microphone');
      setError('Camera/microphone access denied');
      return null;
    }
  };

  // Create peer connection
  const createPeerConnection = (stream) => {
    const pc = new RTCPeerConnection(pcConfig);

    // Add local stream to peer connection
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // Handle remote stream
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      setParticipantJoined(true);
    };

    // Handle ICE candidates (in a real implementation, you'd send these via websocket)
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send candidate to remote peer via signaling server
        console.log('ICE candidate:', event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setParticipantJoined(true);
      } else if (pc.connectionState === 'failed') {
        toast.error('Connection failed');
      }
    };

    setPeerConnection(pc);
    return pc;
  };

  // Start video call
  const startVideoCall = async () => {
    if (!canAccessVideo) {
      setError('Video call access not available');
      return;
    }

    setIsConnecting(true);
    try {
      // Generate room if not exists
      let currentRoomId = roomId;
      if (!currentRoomId) {
        currentRoomId = await generateVideoRoom();
        if (!currentRoomId) {
          setIsConnecting(false);
          return;
        }
      }

      // Initialize media
      const stream = await initializeMedia();
      if (!stream) {
        setIsConnecting(false);
        return;
      }

      // Create peer connection
      createPeerConnection(stream);

      // Mark call as started in backend
      const endpoint = isDoctor ? '/api/doctor/video/start-call' : '/api/user/video/start-call';
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          token 
        },
        body: JSON.stringify({ appointmentId })
      });
      const data = await response.json();
      
      if (data.success) {
        setIsCallActive(true);
        startCallTimer();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error starting video call:', error);
      setError('Failed to start video call');
    }
    setIsConnecting(false);
  };

  // End video call
  const endVideoCall = async () => {
    try {
      // Stop local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      // Close peer connection
      if (peerConnection) {
        peerConnection.close();
      }

      // Stop call timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Mark call as ended in backend
      const endpoint = isDoctor ? '/api/doctor//videoend-call' : '/api/user/video/end-call';
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          token 
        },
        body: JSON.stringify({ appointmentId })
      });
      const data = await response.json();

      // Reset state
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

  // Start call timer
  const startCallTimer = () => {
    intervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
    }
  };

  useEffect(() => {
    checkVideoCallStatus();
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
  }, []);

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

  if (!canAccessVideo) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Video Call Not Available</h3>
          <p className="text-gray-600 mb-4">
            Video call access requires completed payment and active appointment status.
          </p>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white py-2 px-6 rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
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

      {/* Video Content */}
      <div className="flex-1 relative">
        {!isCallActive ? (
          <div className="h-full flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <div className="text-6xl mb-6">📹</div>
              <h3 className="text-xl font-semibold mb-4">Ready to start video call?</h3>
              <p className="text-gray-300 mb-6">Room ID: {roomId || 'Generating...'}</p>
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
            {/* Remote video (main) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Local video (small) */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            {/* Waiting message */}
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

      {/* Controls */}
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

export default UserVideoChat;