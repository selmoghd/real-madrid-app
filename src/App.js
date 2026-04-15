import React, { useEffect, useState } from "react";

function App() {
  // ===============================
  // STATE MANAGEMENT
  // ===============================
  const [matches, setMatches] = useState([]); // Stores all matches
  const [selectedDate, setSelectedDate] = useState(""); // Date filter
  const [competitionFilter, setCompetitionFilter] = useState("ALL"); // Competition filter

  // UI states
  const [loading, setLoading] = useState(true); // Loading indicator
  const [error, setError] = useState(null); // Error handling

  // ===============================
  // FETCH DATA FROM BACKEND
  // ===============================
  useEffect(() => {
    // Use environment variable OR fallback URL
    const API_URL =
      process.env.REACT_APP_API_URL ||
      "https://real-madrid-app.onrender.com";

    fetch(`${API_URL}/matches`)
      .then((res) => {
        // If response fails, trigger error
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        // Map API competition names to cleaner labels
        const competitionMap = {
          "Primera Division": "LaLiga",
          "La Liga": "LaLiga",
          "UEFA Champions League": "UCL",
          "Champions League": "UCL",
          "Copa del Rey": "Copa del Rey",
        };

        // Format incoming data into simpler structure
        const formatted = data.matches.map((match) => ({
          homeTeam: { name: match.homeTeam.name },
          awayTeam: { name: match.awayTeam.name },
          score: {
            fullTime: {
              home: match.score.fullTime.home,
              away: match.score.fullTime.away,
            },
          },
          date: match.utcDate.slice(0, 10), // Keep only YYYY-MM-DD
          competition:
            competitionMap[match.competition.name] || "Other",
        }));

        setMatches(formatted); // Save matches
        setLoading(false); // Stop loading
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load matches"); // Show error
        setLoading(false);
      });
  }, []);

  // ===============================
  // HELPER: RESULT COLOR
  // ===============================
  // Returns color based on match result
  const getResultColor = (result) => {
    if (result.includes("WIN")) return "#4CAF50";
    if (result.includes("LOSS")) return "#F44336";
    if (result.includes("DRAW")) return "#FFC107";
    return "#ccc";
  };

  // ===============================
  // FILTERING LOGIC
  // ===============================
  const today = new Date();

  const isDateFiltering = selectedDate !== "";
  const isCompetitionFiltering = competitionFilter !== "ALL";

  // Filter matches based on selected date + competition
  let baseMatches = matches.filter((match) => {
    const matchesDate =
      !selectedDate || match.date === selectedDate;

    const matchesCompetition =
      competitionFilter === "ALL" ||
      match.competition === competitionFilter;

    return matchesDate && matchesCompetition;
  });

  // ===============================
  // SORTING & LIMITING MATCHES
  // ===============================
  if (isDateFiltering) {
    // If filtering by date → show all results sorted
    baseMatches = baseMatches.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  } else {
    // Split into past & future matches
    const past = baseMatches
      .filter((m) => new Date(m.date) < today)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const future = baseMatches
      .filter((m) => new Date(m.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Default limits
    let pastLimit = 3;
    let futureLimit = 3;

    // If filtering competition → show more
    if (isCompetitionFiltering) {
      pastLimit = 5;
      futureLimit = 5;
    }

    baseMatches = [
      ...past.slice(0, pastLimit),
      ...future.slice(0, futureLimit),
    ];
  }

  // Separate past and future matches for display
  const pastMatches = baseMatches.filter(
    (m) => new Date(m.date) < new Date()
  );

  const futureMatches = baseMatches.filter(
    (m) => new Date(m.date) >= new Date()
  );

  // ===============================
  // LOADING UI
  // ===============================
  if (loading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
        Loading matches...
      </div>
    );
  }

  // ===============================
  // ERROR UI
  // ===============================
  if (error) {
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: "100px" }}>
        {error}
      </div>
    );
  }

  // ===============================
  // MAIN UI
  // ===============================
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
      {/* HEADER */}
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
        <h1>Real Madrid Match Tracker</h1>
      </div>

      {/* DATE FILTER */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button onClick={() => setSelectedDate("")}>
          Clear Date
        </button>
      </div>

      {/* COMPETITION FILTER */}
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        {["ALL", "LaLiga", "UCL", "Copa del Rey", "Other"].map((comp) => (
          <button key={comp} onClick={() => setCompetitionFilter(comp)}>
            {comp === "Copa del Rey" ? "Copa" : comp}
          </button>
        ))}
      </div>

      {/* PAST MATCHES */}
      <h2 style={{ textAlign: "center" }}>⬅️ Last Matches</h2>

      {pastMatches.map((match, index) => {
        const home = match.score.fullTime.home;
        const away = match.score.fullTime.away;

        const isRealMadridHome =
          match.homeTeam.name.includes("Real Madrid");

        const isPlayed = home !== null && away !== null;

        // Determine match result
        let result = "";

        if (!isPlayed) result = "UPCOMING ⏳";
        else if (home === away) result = "DRAW ⚪";
        else if (
          (isRealMadridHome && home > away) ||
          (!isRealMadridHome && away > home)
        ) result = "WIN 🟢";
        else result = "LOSS 🔴";

        return (
          <div key={index} style={cardStyle}>
            <h3>
              {match.homeTeam.name} vs {match.awayTeam.name}
            </h3>

            {home !== null && away !== null && (
              <p>Score: {home} - {away}</p>
            )}

            <p style={{
              color: getResultColor(result),
              fontWeight: "bold"
            }}>
              {result}
            </p>

            <p>📅 {match.date}</p>
            <p>🏆 {match.competition}</p>
          </div>
        );
      })}

      {/* UPCOMING MATCHES */}
      <h2 style={{ textAlign: "center" }}>➡️ Upcoming Matches</h2>

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

// ===============================
// CARD STYLE
// ===============================
const cardStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  padding: "20px",
  margin: "15px auto",
  borderRadius: "16px",
  maxWidth: "500px",
};

export default App;