import React, { useEffect, useState } from "react";

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [matches, setMatches] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [competitionFilter, setCompetitionFilter] = useState("ALL");

 useEffect(() => {
  const API_URL =
    process.env.REACT_APP_API_URL ||
    "https://real-madrid-app.onrender.com";

  fetch(`${API_URL}/matches`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch data");
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
    .catch((err) => {
      console.error(err);
      setError("Failed to load matches");
      setLoading(false);
    });
}, []);

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
    <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
      Loading matches...
    </div>
  );
}

if (error) {
  return (
    <div style={{ color: "red", textAlign: "center", marginTop: "100px" }}>
      {error}
    </div>
  );
}

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Arial",
        background: "linear-gradient(135deg, #0b1d3a, #091428)",
        minHeight: "100vh",
        color: "white",
      }}
    >
      {/* 🔥 PREMIUM HEADER */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        marginBottom: "25px"
      }}>
        <img
          src="https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg"
          alt="logo"
          style={{ width: "45px" }}
        />
        <h1 style={{ fontWeight: "700", letterSpacing: "1px" }}>
          Real Madrid Match Tracker
        </h1>
      </div>

      {/* DATE FILTER */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: "10px",
            marginRight: "10px",
            borderRadius: "8px",
            border: "none",
          }}
        />

        <button
          onClick={() => setSelectedDate("")}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#ffd700",
            fontWeight: "600",
          }}
        >
          Clear Date
        </button>
      </div>

      {/* 🔥 PREMIUM BUTTONS */}
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        {["ALL", "LaLiga", "UCL", "Copa del Rey", "Other"].map((comp) => (
          <button
            key={comp}
            onClick={() => setCompetitionFilter(comp)}
            onMouseEnter={(e) => {
              if (competitionFilter !== comp)
                e.target.style.backgroundColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              if (competitionFilter !== comp)
                e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
            }}
            style={{
              margin: "6px",
              padding: "10px 18px",
              borderRadius: "25px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              backgroundColor:
                competitionFilter === comp
                  ? "#ffd700"
                  : "rgba(255,255,255,0.1)",
              color:
                competitionFilter === comp ? "#000" : "#fff",
              transition: "all 0.3s ease",
              boxShadow:
                competitionFilter === comp
                  ? "0 0 10px rgba(255,215,0,0.6)"
                  : "none",
            }}
          >
            {comp === "Copa del Rey" ? "Copa" : comp}
          </button>
        ))}
      </div>

      {/* LAST MATCHES */}
      <h2 style={{ textAlign: "center" }}>Last Matches</h2>

      {pastMatches.map((match, index) => {
        const home = match.score.fullTime.home;
        const away = match.score.fullTime.away;

        const isRealMadridHome =
          match.homeTeam.name.includes("Real Madrid");

        const isPlayed = home !== null && away !== null;

        let result = "";

        if (!isPlayed) {
          result = "UPCOMING ⏳";
        } else if (home === away) {
          result = "DRAW ⚪";
        } else if (
          (isRealMadridHome && home > away) ||
          (!isRealMadridHome && away > home)
        ) {
          result = "WIN 🟢";
        } else {
          result = "LOSS 🔴";
        }

        return (
          <div key={index} style={cardStyle}>
            <h3>
              {match.homeTeam.name} vs {match.awayTeam.name}
            </h3>

            {home !== null && away !== null && (
              <p>Score: {home} - {away}</p>
            )}

            <p>{result}</p>
            <p>📅 {match.date}</p>
            <p>🏆 {match.competition}</p>
          </div>
        );
      })}

      {/* UPCOMING */}
      <h2 style={{ textAlign: "center", marginTop: "30px" }}>
        Upcoming Matches
      </h2>

      {futureMatches.map((match, index) => (
        <div key={index} style={cardStyle}>
          <h3>
            {match.homeTeam.name} vs {match.awayTeam.name}
          </h3>

          <p>UPCOMING ⏳</p>
          <p>📅 {match.date}</p>
          <p>🏆 {match.competition}</p>
        </div>
      ))}
    </div>
  );
}

// 🔥 PREMIUM CARD
const cardStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  padding: "20px",
  margin: "15px auto",
  borderRadius: "16px",
  maxWidth: "500px",
  boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
  border: "1px solid rgba(255,255,255,0.1)",
};

export default App;