import React, { useEffect, useState } from "react";
import { ref, get, update } from "firebase/database";
import { database } from "./firebase";
import { useNavigate, useParams } from "react-router-dom";

function GamePage() {
  const [gameData, setGameData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [board, setBoard] = useState([]);
  const [selectedSticks, setSelectedSticks] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(""); // State to track current player

  useEffect(() => {
    const gamesRef = ref(database, "games");
    const getGameData = async () => {
      try {
        const snapshot = await get(gamesRef);
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const gameData = childSnapshot.val();
            if (gameData.gameId === gameId) {
              setGameData(gameData);
              setBoard(gameData.board);
            }
          });
        } else {
          setError("No game found with the provided code");
        }
      } catch (error) {
        console.error("Error getting game data:", error);
        setError("Error getting game data. Please try again.");
      }
    };
    getGameData();
  }, [gameId]);

  useEffect(() => {
    // Fetch game data and set current player
    if (gameData) {
      setCurrentPlayer(
        gameData.turn === 1 ? gameData.player1Id : gameData.player2Id
      );
    }
  }, [gameData]);

  const getGameData = async () => {
    const gamesRef = ref(database, "games");
    try {
      const snapshot = await get(gamesRef);
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const gameData = childSnapshot.val();
          if (gameData.gameId === gameId) {
            setGameData(gameData);
            setBoard(gameData.board);
          }
        });
      } else {
        setError("No game found with the provided code");
      }
    } catch (error) {
      console.error("Error getting game data:", error);
      setError("Error getting game data. Please try again.");
    }
  };
  
  const handleStickClick = (rowIndex, stickIndex) => {
    // If the stick is already selected, remove it from the selected sticks
    if (selectedSticks.find(stick => stick.row === rowIndex && stick.stick === stickIndex)) {
      setSelectedSticks(selectedSticks.filter(stick => !(stick.row === rowIndex && stick.stick === stickIndex)));
      return;
    }
    // If the stick is not already selected, check if it's in the same row as the last selected stick
    if (selectedSticks.length > 0 && selectedSticks[0].row !== rowIndex) {
      // if not, clear the selected sticks and select the new stick
      setSelectedSticks([{ row: rowIndex, stick: stickIndex }]);
      return;
    }
    // If it is, add the stick to the selected sticks
    setSelectedSticks([...selectedSticks, { row: rowIndex, stick: stickIndex }]);

  };

  const handleSubmitMove = () => {
    const gameRef = ref(database, `games/${gameId}`);

    // Check if it's the current player's turn
    if ((currentPlayer === gameData.player1Id && gameData.turn === 1) ||
      (currentPlayer === gameData.player2Id && gameData.turn === 2)) {

      // Remove selected sticks from the board
      const updatedBoard = board.map((row, rowIndex) => {
        if (rowIndex === selectedSticks[0].row) {
          return row - selectedSticks.length;
        }
        return row;
      });

      console.log("Updated board:", updatedBoard);

      // Calculate the number of sticks removed
      const sticksRemoved = selectedSticks.length;

      const updates = {
        board: updatedBoard,
        // Switch turn after move
        turn: gameData.turn === 1 ? 2 : 1
      };

      update(gameRef, updates)
        .then(() => {
          console.log("Move submitted successfully!");
          // Clear selected sticks after submitting move
          setSelectedSticks([]);

          // Fetch updated game data
          getGameData();

          // Optionally, you can update other game state here
        })
        .catch((error) => {
          console.error("Error submitting move:", error);
          setError("Error submitting move. Please try again.");
        });
    } else {
      // It's not the current player's turn, show error or take appropriate action
      setError("It's not your turn to make a move.");
    }
  };

  return (
    <div>
      <h1>Game Page</h1>
      {error && <p>{error}</p>}
      {gameData && (
        <div>
          <p>Game ID: {gameData.gameId}</p>
          <p>Player 1: {gameData.player1Id}</p>
          <p>Player 2: {gameData.player2Id}</p>
        
          <p>{gameData.turn === 1 ? "It is player 1's turn" : "It is player 2's turn"}</p>
        </div>
      )}
      <div>
        {board.map((row, rowIndex) => (
          <div key={rowIndex}>
            {/* for each remaining stick, generate a stick */}
            {Array.from({ length: row }).map((_, stickIndex) => (
              <button
                key={stickIndex}
                onClick={() => handleStickClick(rowIndex, stickIndex + 1)}
                style={{ background: selectedSticks.find(stick => stick.row === rowIndex && stick.stick === stickIndex + 1) ? "yellow" : "none" }}
              >
                X
              </button>
            ))}
          </div>
        ))}

        <button onClick={handleSubmitMove}>Submit Move</button>
        <button onClick={() => navigate("/home")}>Back to Home</button>
      </div>
    </div>
  );
}

export default GamePage;
