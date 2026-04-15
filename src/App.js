import React, { useEffect, useState } from "react";

function App() {
  const [matches, setMatches] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [competitionFilter, setCompetitionFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const API_URL =
      process.env.REACT_APP_API_URL ||
      "https://real-madrid-app.onrender.com";

    fetch(`${API_URL}/matches`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        const competitionMap = {
          "Primera Division": "LaLiga",
          "La Liga": "LaLiga",
          "UEFA Champions League": "UCL",
          "Champions League": "UCL",
          "Copa del Rey": "Copa del Rey",
        };

        const formatted = data.matches.map((match) => ({
          homeTeam: { name: match.homeTeam.name },
          awayTeam: { name: match.awayTeam.name },
          score: {
            fullTime: {
              home: match.score.fullTime.home,
              away: match.score.fullTime.away,
            },
          },
          date: match.utcDate.slice(0, 10),
          competition:
            competitionMap[match.competition.name] || "Other",
        }));

        setMatches(formatted);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load matches");
        setLoading(false);
      });
  }, []);

  const getResultColor = (result) => {
    if (result.includes("WIN")) return "#4CAF50";
    if (result.includes("LOSS")) return "#F44336";
    if (result.includes("DRAW")) return "#FFC107";
    return "#ccc";
  };

  const today = new Date();
  const isDateFiltering = selectedDate !== "";
  const isCompetitionFiltering = competitionFilter !== "ALL";

  let baseMatches = matches.filter((match) => {
    const matchesDate =
      !selectedDate || match.date === selectedDate;

    const matchesCompetition =
      competitionFilter === "ALL" ||
      match.competition === competitionFilter;

    return matchesDate && matchesCompetition;
  });

  if (isDateFiltering) {
    baseMatches = baseMatches.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  } else {
    const past = baseMatches
      .filter((m) => new Date(m.date) < today)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const future = baseMatches
      .filter((m) => new Date(m.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    let pastLimit = 3;
    let futureLimit = 3;

    if (isCompetitionFiltering) {
      pastLimit = 5;
      futureLimit = 5;
    }

    baseMatches = [
      ...past.slice(0, pastLimit),
      ...future.slice(0, futureLimit),
    ];
  }

  const pastMatches = baseMatches.filter(
    (m) => new Date(m.date) < new Date()
  );

  const futureMatches = baseMatches.filter(
    (m) => new Date(m.date) >= new Date()
  );

  if (loading) {
    return (
      <div style={centerStyle}>
        <h2>Loading matches...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={centerStyle}>
        <h2 style={{ color: "red" }}>{error}</h2>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <img
          src="https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg"
          alt="logo"
          style={{ width: "45px" }}
        />
        <h1 style={titleStyle}>
          Real Madrid Match Tracker
        </h1>
      </div>

      {/* DATE FILTER */}
      <div style={center}>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={inputStyle}
        />

        <button onClick={() => setSelectedDate("")} style={buttonStyle}>
          Clear Date
        </button>
      </div>

      {/* FILTER BUTTONS */}
      <div style={center}>
        {["ALL", "LaLiga", "UCL", "Copa del Rey", "Other"].map((comp) => (
          <button
            key={comp}
            onClick={() => setCompetitionFilter(comp)}
            style={{
              ...filterButton,
              backgroundColor:
                competitionFilter === comp
                  ? "#ffd700"
                  : "rgba(255,255,255,0.1)",
              color:
                competitionFilter === comp ? "#000" : "#fff",
            }}
          >
            {comp === "Copa del Rey" ? "Copa" : comp}
          </button>
        ))}
      </div>

      {/* LAST MATCHES */}
      <h2 style={sectionTitle}>⬅️ Last Matches</h2>

      {pastMatches.map((match, index) => {
        const home = match.score.fullTime.home;
        const away = match.score.fullTime.away;

        const isRealMadridHome =
          match.homeTeam.name.includes("Real Madrid");

        let result = "";
        if (home === away) result = "DRAW ⚪";
        else if (
          (isRealMadridHome && home > away) ||
          (!isRealMadridHome && away > home)
        ) result = "WIN 🟢";
        else result = "LOSS 🔴";

        return (
          <div
            key={index}
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 15px 40px rgba(0,0,0,0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 10px 30px rgba(0,0,0,0.5)";
            }}
          >
            <h3>{match.homeTeam.name} vs {match.awayTeam.name}</h3>
            <p>Score: {home} - {away}</p>

            <p style={{
              color: getResultColor(result),
              fontWeight: "bold",
              fontSize: "18px"
            }}>
              {result}
            </p>

            <p>📅 {match.date}</p>
            <p>🏆 {match.competition}</p>
          </div>
        );
      })}

      {/* UPCOMING */}
      <h2 style={sectionTitle}>➡️ Upcoming Matches</h2>

      {futureMatches.map((match, index) => (
        <div key={index} style={cardStyle}>
          <h3>{match.homeTeam.name} vs {match.awayTeam.name}</h3>
          <p>UPCOMING ⏳</p>
          <p>📅 {match.date}</p>
          <p>🏆 {match.competition}</p>
        </div>
      ))}
    </div>
  );
}

/* STYLES */

const containerStyle = {
  padding: "30px",
  fontFamily: "Arial",
  background: "linear-gradient(135deg, #0a1f44, #000814)",
  minHeight: "100vh",
  color: "white",
};

const center = { textAlign: "center", marginBottom: "20px" };

const headerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "12px",
  marginBottom: "25px",
};

const titleStyle = {
  fontWeight: "800",
  letterSpacing: "2px",
  fontSize: "28px",
};

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  marginRight: "10px",
};

const buttonStyle = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#ffd700",
  cursor: "pointer",
  fontWeight: "600",
};

const filterButton = {
  margin: "6px",
  padding: "10px 18px",
  borderRadius: "25px",
  border: "none",
  cursor: "pointer",
  transition: "0.3s",
};

const sectionTitle = {
  textAlign: "center",
  marginTop: "20px",
  opacity: 0.8,
};

const cardStyle = {
  background: "rgba(255, 255, 255, 0.07)",
  backdropFilter: "blur(12px)",
  padding: "20px",
  margin: "15px auto",
  borderRadius: "18px",
  maxWidth: "520px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  border: "1px solid rgba(255,255,255,0.15)",
  transition: "all 0.3s ease",
};

const centerStyle = {
  color: "white",
  textAlign: "center",
  marginTop: "100px",
};

export default App;