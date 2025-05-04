"use client"

import { useState, useEffect } from "react"
import "./App.css"
import { Heart, X, User, Users, Search, LogOut, Upload, ChevronRight, Check, Rocket } from 'lucide-react'

function App() {
  const [view, setView] = useState("login") // login, register, profile, dashboard, swiping
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userId, setUserId] = useState(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [profiles, setProfiles] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [potentialMatches, setPotentialMatches] = useState([])
  const [matches, setMatches] = useState([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [pendingMatches, setPendingMatches] = useState([])
  const [showMatches, setShowMatches] = useState(false)
  const [activeTab, setActiveTab] = useState("swipe") // New state for tab management

  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    skills: "",
    experience: "",
    tags: "",
    background: "",
    school: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [passwordError, setPasswordError] = useState("");

  // Add this near the other state declarations at the top of the component
  const [matchesTab, setMatchesTab] = useState("all"); // all, pending, liked

  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState(null);

  // Fetch user's profile
  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:8001/profile/${userId}`)
      const data = await response.json()
      console.log("User Profile Data:", data) // Debug log
      if (response.ok) {
        setUserProfile(data)
        // Pre-fill the edit form
        setProfile({
          name: data.name || "",
          skills: Array.isArray(data.skills) ? data.skills.join(", ") : "",
          experience: Array.isArray(data.experience) ? data.experience.join("\n") : "",
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
          background: data.background || "",
          school: data.school || "",
        })
      } else {
        console.error("Failed to fetch user profile:", data)
      }
    } catch (err) {
      console.error("Error fetching user profile:", err)
    }
  }

  // Fetch all profiles
  const fetchProfiles = async () => {
    try {
      const response = await fetch("http://localhost:8001/profiles")
      const data = await response.json()
      console.log("All Profiles Data:", data) // Debug log
      setProfiles(data)
    } catch (err) {
      console.error("Error fetching profiles:", err)
    }
  }

  // Fetch potential matches
  const fetchPotentialMatches = async () => {
    if (!userId || userId === "null") return;
    
    try {
      const response = await fetch(`http://localhost:8001/profiles?user_id=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch potential matches');
      }
      const data = await response.json();
      setProfiles(data);
      if (currentMatchIndex >= data.length) {
        setCurrentMatchIndex(0);
      }
    } catch (error) {
      console.error("Error fetching potential matches:", error);
      setError("Failed to fetch potential matches");
    }
  };

  // Fetch matches
  const fetchMatches = async () => {
    if (!userId || userId === "null") return;
    
    try {
      const response = await fetch(`http://localhost:8001/matches/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setError("Failed to fetch matches");
    }
  };

  const fetchPendingMatches = async () => {
    if (!userId || userId === "null") return;
    
    try {
      const response = await fetch(`http://localhost:8001/pending-matches/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pending matches');
      }
      const data = await response.json();
      setPendingMatches(data);
    } catch (error) {
      console.error("Error fetching pending matches:", error);
      setError("Failed to fetch pending matches");
    }
  }

  useEffect(() => {
    if (userId && userId !== "null") {
      // Only fetch data if we have a valid userId
      if (view === "dashboard") {
        fetchUserProfile();
        if (activeTab === "swipe") {
          fetchPotentialMatches();
        } else if (activeTab === "matches") {
          fetchMatches();
          fetchPendingMatches();
        }
      }
    }
  }, [userId, view, activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    if (view === "register") {
      if (formData.password !== formData.confirmPassword) {
        setPasswordError("Passwords do not match");
        return;
      }
      if (formData.password.length < 6) {
        setPasswordError("Password must be at least 6 characters long");
        return;
      }
      setPasswordError("");
    }

    const endpoint = view === "register" ? "register" : "login";

    try {
      console.log("Making request to:", `http://localhost:8001/${endpoint}`);
      
      const response = await fetch(`http://localhost:8001/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      console.log("Response status:", response.status);
      
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        setUserId(data.user_id);
        setMessage(view === "register" ? "Registration successful!" : "Login successful!");
        
        // Clear the success message after 2 seconds
        setTimeout(() => {
          setMessage("");
        }, 2000);

        setError("");
        
        // Check if user has a profile after successful login/register
        const profileResponse = await fetch(`http://localhost:8001/profile/${data.user_id}`);
        const profileData = await profileResponse.json();
        
        if (view === "register" || !profileData.profile_completed) {
          // Only show profile upload for new registrations or incomplete profiles
          setView("profile");
        } else {
          // For existing users with complete profiles, go to dashboard and show profile tab
          setView("dashboard");
          setActiveTab("profile");  // Always show profile tab first
          // Fetch all necessary data
          await fetchUserProfile();
          await fetchPotentialMatches();
          await fetchMatches();
          await fetchPendingMatches();
        }
      } else {
        setError(data.detail || "An error occurred");
        setMessage("");
      }
    } catch (error) {
      console.error("Connection error:", error);
      setError("Failed to connect to server. Please make sure the server is running on port 8001.");
      setMessage("");
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    try {
      const profileData = {
        name: profile.name,
        skills: profile.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill),
        experience: profile.experience
          .split("\n")
          .map((exp) => exp.trim())
          .filter((exp) => exp),
        tags: profile.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        background: profile.background,
        school: profile.school,
      }

      console.log("Submitting profile data:", profileData) // Debug log

      const response = await fetch(`http://localhost:8001/profile/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })

      const data = await response.json()
      console.log("Profile submission response:", data) // Debug log

      if (response.ok) {
        setMessage("Profile updated successfully!")
        setIsEditing(false)
        await fetchUserProfile() // Immediately fetch updated profile
        await fetchPotentialMatches() // Refresh potential matches
        setView("dashboard")
      } else {
        setError(data.detail || "Failed to update profile")
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile. Please try again.")
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle file upload for AI profile generation
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsLoading(true)
    setError(null)
    setMessage(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`http://localhost:8001/analyze-resume/${userId}`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to analyze resume")
      }

      setMessage("Profile created successfully!")
      setView("dashboard")
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle swiping
  const handleSwipe = async (liked, specificUserId = null) => {
    const swipedId = specificUserId || profiles[currentMatchIndex]?._id;
    if (!swipedId) return;

    setSwipeDirection(liked ? 'right' : 'left');
    
    if (!specificUserId) {
      setCurrentMatchIndex(prev => prev + 1);
      setTimeout(() => {
        setSwipeDirection(null);
      }, 150);
    }

    try {
      const response = await fetch(`http://localhost:8001/swipe/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          swiped_id: swipedId,
          liked: liked,
        }),
      });

      if (response.ok) {
        // Update matches and potential matches in the background
        Promise.all([
          fetchMatches(),
          fetchPendingMatches(),
          fetchPotentialMatches() // Refresh potential matches after a swipe
        ]).then(() => {
          response.json().then(data => {
            if (data.match_created) {
              setMessage("It's a match! 🎉");
              // Clear the message after 2 seconds
              setTimeout(() => {
                setMessage("");
              }, 2000);
            }
          });
        });
      } else {
        console.error("Swipe error:", await response.json());
      }
    } catch (err) {
      console.error("Swipe error:", err);
    }
  };

  const handleDragStart = (e) => {
    const point = e.touches ? e.touches[0] : e;
    setDragStart({ x: point.clientX, y: point.clientY });
    setIsDragging(true);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    const point = e.touches ? e.touches[0] : e;
    const offset = {
      x: point.clientX - dragStart.x,
      y: point.clientY - dragStart.y
    };
    
    setDragOffset(offset);
    
    // Calculate rotation and opacity based on drag distance
    const rotate = offset.x * 0.1;
    const opacity = Math.max(1 - Math.abs(offset.x) / 1000, 0.5);
    
    const card = e.target.closest('.match-card');
    if (card) {
      card.style.setProperty('--rotate', `${rotate}deg`);
      card.style.setProperty('--translate-x', `${offset.x}px`);
      card.style.setProperty('--opacity', opacity);
      
      // Add dragging direction classes
      card.classList.toggle('dragging-right', offset.x > 50);
      card.classList.toggle('dragging-left', offset.x < -50);
    }
  };

  const handleDragEnd = (e) => {
    if (!isDragging) return;
    
    const card = e.target.closest('.match-card');
    if (card) {
      const threshold = 100;
      if (dragOffset.x > threshold) {
        handleSwipe(true);
      } else if (dragOffset.x < -threshold) {
        handleSwipe(false);
      } else {
        // Reset card position if not swiped far enough
        card.style.setProperty('--rotate', '0deg');
        card.style.setProperty('--translate-x', '0px');
        card.style.setProperty('--opacity', '1');
        card.style.removeProperty('transform');
      }
      
      card.classList.remove('dragging-right', 'dragging-left');
    }
    
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const renderMatchCard = () => {
    if (!profiles || profiles.length === 0 || currentMatchIndex >= profiles.length) {
      return (
        <div className="no-matches">
          <h3>No more potential matches available!</h3>
          <p>Check back later for new profiles.</p>
        </div>
      );
    }

    const currentProfile = profiles[currentMatchIndex];
    const cardClassName = `match-card ${isDragging ? 'dragging' : ''} ${
      swipeDirection === 'left' ? 'swipe-left' : swipeDirection === 'right' ? 'swipe-right' : ''
    }`;

  return (
      <div
        className={cardClassName}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onAnimationEnd={() => setSwipeDirection(null)}
      >
        <div className="swipe-overlay like">LIKE</div>
        <div className="swipe-overlay nope">NOPE</div>
        <h2>{currentProfile.name}</h2>
        <p className="school">{currentProfile.school}</p>
        <p className="background">{currentProfile.background}</p>

        <div className="skills-section">
          <h3>Skills</h3>
          <div className="tags-list">
            {currentProfile.skills.map((skill, index) => (
              <span key={index} className="tag skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="tags-section">
          <h3>Interests</h3>
          <div className="tags-list">
            {currentProfile.tags.map((tag, index) => (
              <span key={index} className="tag interest-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="experience-section">
          <h3>Experience</h3>
          <ul>
            {currentProfile.experience.map((exp, index) => (
              <li key={index}>{exp}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderMatchesView = () => {
    return (
      <div className="matches-view">
        <div className="matches-navigation">
          <button 
            className={matchesTab === "all" ? "active" : ""} 
            onClick={() => setMatchesTab("all")}
          >
            All Matches
          </button>
          <button 
            className={matchesTab === "liked" ? "active" : ""} 
            onClick={() => setMatchesTab("liked")}
          >
            Pending Matches
          </button>
        </div>

        {matchesTab === "all" && (
          <div className="matches-content">
            <div className="matches-column">
              <h3>Your Matches</h3>
              {matches && matches.length > 0 ? (
                matches.map((match, index) => (
                  <div key={index} className="match-item">
                    <h4>{match.user.name}</h4>
                    <p className="school">{match.user.school}</p>
                    <p className="background">{match.user.background}</p>
                    {(match.user.contact_email || match.user.email) && (
                      <div className="contact-info">
                        <h4>Contact Information</h4>
                        <p className="email">
                          <a href={`mailto:${match.user.contact_email || match.user.email}`}>
                            {match.user.contact_email || match.user.email}
                          </a>
                        </p>
                      </div>
                    )}
                    <div className="tags-section">
                      <h4>Skills</h4>
                      <div className="tags-list">
                        {match.user.skills.map((skill, i) => (
                          <span key={i} className="tag skill-tag">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="tags-section">
                      <h4>Interests</h4>
                      <div className="tags-list">
                        {match.user.tags.map((tag, i) => (
                          <span key={i} className="tag interest-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="timestamp">
                      Matched on {new Date(match.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="no-matches">
                  <p>No matches yet. Keep swiping!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {matchesTab === "liked" && (
          <div className="matches-content">
            <div className="matches-column">
              <h3>Pending Matches</h3>
              {pendingMatches && pendingMatches.length > 0 ? (
                pendingMatches.map((match, index) => (
                  <div key={index} className={`pending-item outgoing pending-${match.status}`}>
                    <h4>{match.user.name}</h4>
                    <p className="school">{match.user.school}</p>
                    <p className="background">{match.user.background}</p>
                    <div className="tags-section">
                      <h4>Skills</h4>
                      <div className="tags-list">
                        {match.user.skills.map((skill, i) => (
                          <span key={i} className="tag skill-tag">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="tags-section">
                      <h4>Interests</h4>
                      <div className="tags-list">
                        {match.user.tags.map((tag, i) => (
                          <span key={i} className="tag interest-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="timestamp">
                      Sent request on {new Date(match.timestamp).toLocaleDateString()}
                    </p>
                    <p className="status-text">
                      {match.status === "pending" && "Waiting for response..."}
                      {match.status === "rejected" && "They passed on the match"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="no-matches">
                  <p>You haven't sent any match requests yet. Start swiping!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAuthView = () => (
    <div className="auth-section">
      <div className="auth-description">
        <h2>Welcome to Findr <Rocket className="inline-icon" /></h2>
        <p>
          Find your perfect hackathon teammate based on skills, interests, and experience.
          Connect with like-minded developers and build something amazing together!
        </p>
      </div>

      <div className="feature-list">
        <div className="feature-item">
          <div className="icon">🎯</div>
          <h3>Smart Matching</h3>
          <p>AI-powered matching based on your skills and interests</p>
        </div>
        <div className="feature-item">
          <div className="icon">📄</div>
          <h3>Easy Setup</h3>
          <p>Upload your resume and let AI create your profile</p>
        </div>
        <div className="feature-item">
          <div className="icon">🤝</div>
          <h3>Quick Connect</h3>
          <p>Match and start collaborating instantly</p>
        </div>
      </div>

      <div className="auth-form">
        <h3>{view === "register" ? "Create Account" : "Welcome Back!"}</h3>
        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          {view === "register" && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          )}
          {passwordError && <p className="password-error">{passwordError}</p>}
        </div>
        <div className="auth-buttons">
          <button className="primary-button" onClick={handleSubmit}>
            {view === "register" ? "Create Account" : "Login"}
          </button>
          <button className="secondary-button" onClick={() => setView(view === "login" ? "register" : "login")}>
            {view === "login" ? "Register" : "Back to Login"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderProfileSection = () => (
    <div className="profile-section">
      <h2>{isEditing ? "Edit Profile" : "Your Profile"}</h2>
      {isEditing ? (
        <div className="profile-edit-form">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={profile.name}
            onChange={handleProfileChange}
          />
          <input
            type="text"
            name="school"
            placeholder="School"
            value={profile.school}
            onChange={handleProfileChange}
          />
          <textarea
            name="background"
            placeholder="Background"
            value={profile.background}
            onChange={handleProfileChange}
          />
          <input
            type="text"
            name="skills"
            placeholder="Skills (comma separated)"
            value={profile.skills}
            onChange={handleProfileChange}
          />
          <textarea
            name="experience"
            placeholder="Experience (one per line)"
            value={profile.experience}
            onChange={handleProfileChange}
          />
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma separated)"
            value={profile.tags}
            onChange={handleProfileChange}
          />
          <div className="auth-buttons">
            <button onClick={handleProfileSubmit}>Save Changes</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="profile-info">
            <h3>{userProfile?.name}</h3>
            <p>{userProfile?.school}</p>
            <p>{userProfile?.background}</p>
            <div className="tags-list">
              {userProfile?.skills?.map((skill, index) => (
                <span key={index} className="tag">{skill}</span>
              ))}
            </div>
            <div className="tags-list">
              {userProfile?.tags?.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
          <div className="profile-stats">
            <div className="stat-item">
              <span>Total Matches:</span>
              <span>{matches.length}</span>
            </div>
            <div className="stat-item">
              <span>Pending Matches:</span>
              <span>{pendingMatches.length}</span>
            </div>
          </div>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </>
      )}
    </div>
  );

  const renderDashboard = () => {
    return (
      <div className="dashboard">
        {renderProfileSection()}
        <div className="matches-section">
          {activeTab === "swipe" ? (
            <div className="swiping-container">
              {renderMatchCard()}
              <div className="swipe-buttons">
                <button
                  className="swipe-button reject"
                  onClick={() => handleSwipe(false)}
                  disabled={!profiles || profiles.length === 0 || currentMatchIndex >= profiles.length}
                >
                  ✗
                </button>
                <button
                  className="swipe-button accept"
                  onClick={() => handleSwipe(true)}
                  disabled={!profiles || profiles.length === 0 || currentMatchIndex >= profiles.length}
                >
                  ✓
                </button>
              </div>
            </div>
          ) : (
            renderMatchesView()
          )}
        </div>
      </div>
    );
  };

  const renderPendingMatches = () => {
    if (!pendingMatches || pendingMatches.length === 0) {
      return (
        <div className="no-matches">
          <h3>No pending matches</h3>
          <p>When you like someone, they'll appear here until they respond</p>
        </div>
      );
    }

    return (
      <div className="matches-list">
        {pendingMatches.map((pending, index) => (
          <div key={index} className={`match-info pending-${pending.status}`}>
            <div className="match-details">
              <h3>{pending.user.name}</h3>
              <p className="school">{pending.user.school}</p>
              <p className="status-text">
                {pending.status === "pending" && "Waiting for response..."}
                {pending.status === "rejected" && "They passed on the match"}
                {pending.status === "accepted" && "They liked you back! Check your matches!"}
              </p>
              <p className="timestamp">
                Sent request on {new Date(pending.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="app-content">
        <div className="header-section">
          <div className="logo-container">
            <h1>Findr <Rocket className="logo-icon" /></h1>
            <p className="subtitle">Find Your Perfect Hackathon Match!</p>
          </div>
          {userId && (
            <div className="nav-buttons">
              <button
                className={activeTab === "profile" ? "nav-button active" : "nav-button"}
                onClick={() => setActiveTab("profile")}
              >
                <User className="button-icon" />
                <span>Profile</span>
              </button>
              <button
                className={activeTab === "swipe" ? "nav-button active" : "nav-button"}
                onClick={() => setActiveTab("swipe")}
              >
                <Search className="button-icon" />
                <span>Find Matches</span>
              </button>
              <button
                className={activeTab === "matches" ? "nav-button active" : "nav-button"}
                onClick={() => {
                  setActiveTab("matches");
                  fetchMatches();
                  fetchPendingMatches();
                }}
              >
                <Users className="button-icon" />
                <span>Your Matches</span>
              </button>
            </div>
          )}
        </div>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {!userId ? (
          renderAuthView()
        ) : view === "profile" ? (
          <div className="profile-form">
            <h2>Upload Your Resume</h2>
            <div className="upload-section">
              <h3>AI-Powered Profile Generation</h3>
              <p>Upload your resume or CV (PDF or Image format)</p>
              <div className="file-upload-container">
                <input 
                  type="file" 
                  id="resume-upload"
                  accept=".pdf,image/*" 
                  onChange={handleFileUpload} 
                  className="file-input" 
                />
                <label htmlFor="resume-upload" className="file-upload-label">
                  <Upload className="upload-icon" />
                  <span>Choose a file</span>
                </label>
              </div>
              {isLoading && (
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  <p>Analyzing your resume...</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="main-content">
            {activeTab === "profile" && (
              <div className="detailed-profile-section">
                <h2>{isEditing ? "Edit Profile" : "Your Profile"}</h2>
                {isEditing ? (
                  <div className="profile-edit-form">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={profile.name}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>School</label>
                      <input
                        type="text"
                        name="school"
                        placeholder="School"
                        value={profile.school}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Background</label>
                      <textarea
                        name="background"
                        placeholder="Background"
                        value={profile.background}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Skills (comma separated)</label>
                      <input
                        type="text"
                        name="skills"
                        placeholder="Skills"
                        value={profile.skills}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Experience (one per line)</label>
                      <textarea
                        name="experience"
                        placeholder="Experience"
                        value={profile.experience}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Tags (comma separated)</label>
                      <input
                        type="text"
                        name="tags"
                        placeholder="Tags"
                        value={profile.tags}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="profile-actions">
                      <button className="primary-button" onClick={handleProfileSubmit}>Save Changes</button>
                      <button className="secondary-button" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="profile-display">
                    <div className="profile-header">
                      <h3>{userProfile?.name}</h3>
                      <button className="edit-button" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </button>
                    </div>
                    <div className="profile-body">
                      <div className="profile-section">
                        <h4>School</h4>
                        <p>{userProfile?.school}</p>
                      </div>
                      <div className="profile-section">
                        <h4>Background</h4>
                        <p>{userProfile?.background}</p>
                      </div>
                      <div className="profile-section">
                        <h4>Skills</h4>
                        <div className="tags-list">
                          {userProfile?.skills?.map((skill, index) => (
                            <span key={index} className="tag skill-tag">{skill}</span>
                          ))}
                        </div>
                      </div>
                      <div className="profile-section">
                        <h4>Experience</h4>
                        <ul className="experience-list">
                          {userProfile?.experience?.map((exp, index) => (
                            <li key={index}>{exp}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="profile-section">
                        <h4>Interests</h4>
                        <div className="tags-list">
                          {userProfile?.tags?.map((tag, index) => (
                            <span key={index} className="tag interest-tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="profile-stats">
                        <div className="stat-item">
                          <span>Total Matches</span>
                          <span className="stat-value">{matches.length}</span>
                        </div>
                        <div className="stat-item">
                          <span>Pending Matches</span>
                          <span className="stat-value">{pendingMatches.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "swipe" && (
              <div className="horizontal-swiping-container">
                {renderMatchCard()}
                <div className="horizontal-swipe-buttons">
                  <button
                    className="swipe-button reject"
                    onClick={() => handleSwipe(false)}
                    disabled={!profiles || profiles.length === 0 || currentMatchIndex >= profiles.length}
                  >
                    <X />
                  </button>
                  <button
                    className="swipe-button accept"
                    onClick={() => handleSwipe(true)}
                    disabled={!profiles || profiles.length === 0 || currentMatchIndex >= profiles.length}
                  >
                    <Check />
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === "matches" && renderMatchesView()}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
