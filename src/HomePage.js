import React, { useState } from "react";
import { ref, get, update, push } from "firebase/database";
import { database } from "./firebase";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [gameCode, setGameCode] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const generateGameId = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let gameId = "";
    for (let i = 0; i < 4; i++) {
      gameId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return gameId;
  };

  const initializeBoard = () => {
    return [[1], [3], [5], [7]]; // Initialize the board array
  };

  const handleJoinGame = async () => {
    console.log("Joining game with code:", gameCode);

    try {
      const gamesRef = ref(database, "games");
      const snapshot = await get(gamesRef);

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const gameData = childSnapshot.val();
          if (gameData.gameId === gameCode) {
            const userId = "player2Id"; // Replace with actual player 2 ID
            const gameId = gameData.gameId;
            const gameRef = ref(database, `games/${childSnapshot.key}`);
            const updates = {
              player2Id: userId,
              board: initializeBoard() // Initialize the board array
            };

            update(gameRef, updates)
              .then(() => {
                console.log("Joined game successfully!");
                navigate(`/game/${gameId}`);
              })
              .catch((error) => {
                console.error("Error updating game:", error);
                setError("Error joining game. Please try again.");
              });
          }
        });
      } else {
        setError("No game found with the provided code");
      }
    } catch (error) {
      console.error("Error joining game:", error);
      setError("Error joining game. Please try again.");
    }
  };

  const handleCreateGame = () => {
    const gamesRef = ref(database, "games");

    const gameId = generateGameId();
    const userId = "player1Id";

    const gameData = {
      gameId: gameId,
      player1Id: userId,
      board: initializeBoard() // Initialize the board array
    };

    push(gamesRef, gameData)
      .then(() => {
        console.log("Game created successfully!");
        navigate(`/game/${gameId}`);
      })
      .catch((error) => {
        console.error("Error creating game:", error);
        setError(error.message);
      });
  };

  return (
    <div>
      <h1>Welcome to the Home Page!</h1>
      {error && <p>{error}</p>}
      <input
        type="text"
        placeholder="Enter Game Code"
        value={gameCode}
        onChange={(e) => setGameCode(e.target.value)}
      />
      <button onClick={handleJoinGame}>Join Game</button>
      <button onClick={handleCreateGame}>Create Game</button>
    </div>
  );
}

export default HomePage;
