import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { io } from "socket.io-client";
import "../index.css";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [socket, setSocket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Clean up on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Register user with socket when user data is available
    if (socket && user) {
      socket.emit("register", user._id);

      // Listen for incoming calls
      socket.on("incoming-call", (data) => {
        setIncomingCall(data);
        // Play notification sound
        const audio = new Audio("/notification.mp3");
        audio.play().catch(err => console.error("Error playing sound:", err));
      });

      // Handle call accepted event
      socket.on("call-accepted", (data) => {
        navigate(`/video-call/${data.to}`);
      });

      // Handle call rejected
      socket.on("call-rejected", (data) => {
        alert(`Call was rejected: ${data.reason}`);
      });
    }
  }, [socket, user, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users", {
          credentials: "include",
        });
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const startVideoCall = (userId, userEmail) => {
    if (socket && user) {
      socket.emit("call-request", {
        from: user._id,
        to: userId,
        fromEmail: user.email,
      });
      
      // Show calling modal instead of alert
      setCallingUser({ email: userEmail });
    }
  };

  const [callingUser, setCallingUser] = useState(null);

  const cancelCall = () => {
    setCallingUser(null);
    // You could also emit a call-cancelled event to the socket
  };

  const acceptCall = () => {
    if (socket && incomingCall) {
      socket.emit("call-accepted", {
        from: incomingCall.from,
        to: user._id,
      });
      setIncomingCall(null);
      navigate(`/video-call/${incomingCall.from}`);
    }
  };

  const rejectCall = () => {
    if (socket && incomingCall) {
      socket.emit("call-rejected", {
        from: incomingCall.from,
        to: user._id,
        reason: "Call rejected by user",
      });
      setIncomingCall(null);
    }
  };

  // Get unique skills from all users for the filter dropdown
  const allSkills = [...new Set(users.flatMap(user => user.skills))].sort();

  // Filter users based on search term and selected skill
  const filteredUsers = users.filter(userItem => {
    const matchesSearch = userItem.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = selectedSkill === "" || userItem.skills.includes(selectedSkill);
    return matchesSearch && matchesSkill;
  });

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold">SkillShare Platform</h1>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline">Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Find Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search by Email</label>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Skill</label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Skills</option>
                {allSkills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* User list */}
        <h2 className="text-2xl font-bold mb-4">Available Skills</h2>
        
        {filteredUsers.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">No users found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((userItem) => (
              <div key={userItem._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-xl mr-4">
                      {userItem.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{userItem.email}</h3>
                      <p className="text-gray-500 text-sm">
                        {new Date(userItem.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {userItem.skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  {user && userItem._id !== user._id && (
                    <button
                      onClick={() => startVideoCall(userItem._id, userItem.email)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                      Start Video Call
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calling modal */}
      {callingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Calling {callingUser.email}</h2>
            <p className="text-gray-600 mb-6">Waiting for them to answer...</p>
            <button 
              onClick={cancelCall} 
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Incoming call notification */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-green-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Incoming Call</h2>
              <p className="text-gray-600 mt-1 mb-6">{incomingCall.fromEmail} is calling you...</p>
            </div>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={rejectCall} 
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center justify-center transition duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Decline
              </button>
              <button 
                onClick={acceptCall} 
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center transition duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
