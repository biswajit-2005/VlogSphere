import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import VlogCard from "../components/VlogCard";

//const API_BASE_URL = "https://vlogsphere.onrender.com/api";
const API_BASE_URL = "http://localhost:3000/api";

const Home = () => {
  const [allVlogs, setAllVlogs] = useState([]);
  const [filteredVlogs, setFilteredVlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userInteractions, setUserInteractions] = useState({});

  useEffect(() => {
    loadUserInteractions();
    fetchVlogs();
  }, []);

  useEffect(() => {
    filterVlogs();
  }, [searchTerm, category, allVlogs]);

  const loadUserInteractions = () => {
    const saved = localStorage.getItem("vlogSphereInteractions");
    if (saved) {
      try {
        setUserInteractions(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading user interactions:", error);
        setUserInteractions({});
      }
    }
  };

  const saveUserInteractions = (interactions) => {
    try {
      localStorage.setItem(
        "vlogSphereInteractions",
        JSON.stringify(interactions),
      );
    } catch (error) {
      console.error("Error saving user interactions:", error);
    }
  };

  const fetchVlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/vlogs`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllVlogs(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vlogs:", error);
      setError(true);
      setLoading(false);
    }
  };

  const filterVlogs = () => {
    const term = searchTerm.toLowerCase().trim();
    const filtered = allVlogs.filter((vlog) => {
      const matchesSearch = vlog.title.toLowerCase().includes(term);
      const matchesCategory = category === "all" || vlog.category === category;
      return matchesSearch && matchesCategory;
    });
    setFilteredVlogs(filtered);
  };

  const handleLike = async (vlogId) => {
    const currentInteraction = userInteractions[vlogId];
    let newInteraction = null;
    let type = "like";
    let isActive = true;

    if (currentInteraction === "like") {
      newInteraction = null;
      isActive = false;
    } else {
      newInteraction = "like";
      isActive = true;
    }

    // Optimistic UI update for interaction state
    const updatedInteractions = {
      ...userInteractions,
      [vlogId]: newInteraction,
    };
    setUserInteractions(updatedInteractions);
    saveUserInteractions(updatedInteractions);

    // Update local vlog state for counts
    setAllVlogs((prevVlogs) =>
      prevVlogs.map((vlog) => {
        if ((vlog._id || vlog.id) === vlogId) {
          let likes = vlog.likes || 0;
          let dislikes = vlog.dislikes || 0;

          if (currentInteraction === "like") {
            likes--;
          } else if (currentInteraction === "dislike") {
            dislikes--;
            likes++;
          } else {
            likes++;
          }

          if (!isActive && currentInteraction === "like") {
            // Already handled: likes--
          }

          // Logic check:
          // If unclicking like: likes--
          // If switching from dislike to like: dislikes--, likes++
          // If clicking like from null: likes++

          // Re-implementing logic to match exactly:
          if (currentInteraction === "like") {
            // removing like
            likes = Math.max(0, likes - 1);
          } else {
            // adding like
            if (currentInteraction === "dislike") {
              dislikes = Math.max(0, dislikes - 1);
            }
            likes++;
          }

          return { ...vlog, likes, dislikes };
        }
        return vlog;
      }),
    );

    // API call
    try {
      await fetch(`${API_BASE_URL}/vlogs/${vlogId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: isActive }),
      });
    } catch (error) {
      console.error("Error updating interaction:", error);
    }
  };

  const handleDislike = async (vlogId) => {
    const currentInteraction = userInteractions[vlogId];
    let newInteraction = null;
    let type = "dislike";
    let isActive = true;

    if (currentInteraction === "dislike") {
      newInteraction = null;
      isActive = false;
    } else {
      newInteraction = "dislike";
      isActive = true;
    }

    // Optimistic UI update
    const updatedInteractions = {
      ...userInteractions,
      [vlogId]: newInteraction,
    };
    setUserInteractions(updatedInteractions);
    saveUserInteractions(updatedInteractions);

    setAllVlogs((prevVlogs) =>
      prevVlogs.map((vlog) => {
        if ((vlog._id || vlog.id) === vlogId) {
          let likes = vlog.likes || 0;
          let dislikes = vlog.dislikes || 0;

          if (currentInteraction === "dislike") {
            dislikes = Math.max(0, dislikes - 1);
          } else {
            if (currentInteraction === "like") {
              likes = Math.max(0, likes - 1);
            }
            dislikes++;
          }
          return { ...vlog, likes, dislikes };
        }
        return vlog;
      }),
    );

    // API call
    try {
      await fetch(`${API_BASE_URL}/vlogs/${vlogId}/dislike`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: isActive }),
      });
    } catch (error) {
      console.error("Error updating interaction:", error);
    }
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h2 className="hero-title">Share Your Story With The World</h2>
            <p className="hero-subtitle">
              Upload and explore vlogs from creators around the globe
            </p>
            <Link to="/add-vlog" className="btn btn-primary btn-large">
              Add Your Vlog
            </Link>
          </div>
        </div>
      </section>

      <section className="search-section">
        <div className="container">
          <div className="search-filter-wrapper">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search vlogs by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-box">
              <select
                className="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Travel">Travel</option>
                <option value="Tech">Tech</option>
                <option value="Food">Food</option>
                <option value="Daily">Daily</option>
                <option value="Gaming">Gaming</option>
                <option value="Fitness">Fitness</option>
                <option value="Music">Music</option>
                <option value="Education">Education</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="vlogs-section">
        <div className="container">
          {loading && <div className="message">Loading vlogs...</div>}

          {error && (
            <div className="message error">
              Unable to load vlogs. Please try again later.
            </div>
          )}

          {!loading && !error && filteredVlogs.length === 0 && (
            <div className="message">
              No vlogs found. Be the first to add one!
            </div>
          )}

          {!loading && !error && filteredVlogs.length > 0 && (
            <div className="vlogs-grid">
              {filteredVlogs.map((vlog) => (
                <VlogCard
                  key={vlog._id || vlog.id}
                  vlog={vlog}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  userInteraction={userInteractions[vlog._id || vlog.id]}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
