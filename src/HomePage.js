import React, { useState, useEffect } from "react";
import { ref, get, update, set } from "firebase/database";
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
    if (!currentUser) {
      setError("You need to be authenticated to join a game.");
      return;
    }
    
    console.log("Joining game with code:", gameCode);
  
    try {
      const gamesRef = ref(database, `games/${gameCode}`);
      const snapshot = await get(gamesRef);
  
      if (snapshot.exists()) {
        const gameData = snapshot.val();
        if (!gameData.player2Id) { // Check if player 2 is not already assigned
          const userId = currentUser.uid;
  
          // Generate a random turn (1 or 2)
          const turn = Math.floor(Math.random() * 2) + 1;
  
          const updates = {
            player2Id: userId,
            board: initializeBoard(), // Initialize the board array
            turn: turn // Assign the random turn
          };
  
          update(gamesRef, updates)
            .then(() => {
              console.log("Joined game successfully!");
              navigate(`/game/${gameCode}`, { state: { userId: currentUser.uid } }); // Pass userId as state
            })
            .catch((error) => {
              console.error("Error updating game:", error);
              setError("Error joining game. Please try again.");
            });
        } else {
          setError("Game is already full.");
        }
      } else {
        setError("No game found with the provided code");
      }
    } catch (error) {
      console.error("Error joining game:", error);
      setError("Error joining game. Please try again.");
    }
  };
  

  const handleCreateGame = async () => {
    if (!currentUser) {
      setError("You need to be authenticated to create a game.");
      return;
    }
    
    try {
      const gameId = generateGameId();
      const userId = currentUser.uid;
      const gamesRef = ref(database, `games/${gameId}`);
  
      const gameData = {
        gameId: gameId,
        player1Id: userId,
        player2Id: "", // Initially set to empty for player 2
        board: initializeBoard() // Initialize the board array
      };
  
      await set(gamesRef, gameData);
      console.log("Game created successfully!");
      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error("Error creating game:", error);
      setError(error.message);
    }
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
