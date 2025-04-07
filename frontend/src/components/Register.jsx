import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [skills, setSkills] = useState([]);
  const [skill, setSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const addSkill = () => {
    if (skill.trim() !== '' && !skills.includes(skill.trim())) {
      setSkills([...skills, skill.trim()]);
      setSkill('');
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, skills })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        navigate('/dashboard');
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  // Common skills suggestions
  const skillSuggestions = [
    "JavaScript", "React", "Node.js", "Python", "CSS", "HTML", 
    "UI/UX Design", "Data Science", "Machine Learning", "Cooking", 
    "Photography", "Guitar", "Singing", "Yoga", "Gardening"
  ];

  const addSuggestion = (suggestion) => {
    if (!skills.includes(suggestion)) {
      setSkills([...skills, suggestion]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">SkillShare Platform</h1>
          <p className="mt-2 text-gray-600">Create an account to share your skills</p>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Sign up</h2>
        
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills you want to share
            </label>
            <div className="flex">
              <input
                type="text"
                placeholder="Add a skill"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow border border-gray-300 rounded-l-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button 
                type="button" 
                onClick={addSkill}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-r-lg transition duration-200"
              >
                Add
              </button>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Common skills:</p>
              <div className="flex flex-wrap gap-2">
                {skillSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addSuggestion(suggestion)}
                    disabled={skills.includes(suggestion)}
                    className={`text-xs px-3 py-1 rounded-full transition duration-200 ${
                      skills.includes(suggestion)
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700"
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {skills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Your skills:</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, index) => (
                  <div key={index} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center">
                    {s}
                    <button 
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="ml-2 text-indigo-500 hover:text-indigo-700 focus:outline-none"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition duration-200"
            disabled={loading || email === '' || password === '' || skills.length === 0}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;