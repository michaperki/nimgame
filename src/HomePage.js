import React, { useState, useEffect } from "react";
import { ref, get, update, push } from "firebase/database";
import { auth } from "./firebase";
import { database } from "./firebase";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [gameCode, setGameCode] = useState("");
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // State to store the current user
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return unsubscribe;
  }, []);
  
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
            const userId = currentUser ? currentUser.uid : generateRandomUserId(); // Use current user's ID if authenticated, or generate a random ID
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

  const handleCreateGame = async () => {
    try {
      const gamesRef = ref(database, "games");
      const gameId = generateGameId();
      const userId = currentUser ? currentUser.uid : generateRandomUserId(); // Use current user's ID if authenticated, or generate a random ID

      const gameData = {
        gameId: gameId,
        player1Id: userId,
        board: initializeBoard() // Initialize the board array
      };

      await push(gamesRef, gameData);
      console.log("Game created successfully!");
      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error("Error creating game:", error);
      setError(error.message);
    }
  };

  const generateRandomUserId = () => {
    return Math.random().toString(36).substring(2, 15);
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
