import React, { useEffect, useState } from "react";
import { ref, get, update } from "firebase/database";
import { database } from "./firebase";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "./firebase";

function GamePage() {
  const [gameData, setGameData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [board, setBoard] = useState([]);
  const [selectedSticks, setSelectedSticks] = useState([]);
  const [currentPlayerId, setCurrentPlayerId] = useState(""); // State to track current player ID

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
      setCurrentPlayerId(gameData.turn === 1 ? gameData.player1Id : gameData.player2Id);
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

    // Get the current user's ID
    const currentUserId = getCurrentUserId();

    // Check if it's the current player's turn
    if (currentUserId === currentPlayerId) {
      // get the row
      const selectedRow = selectedSticks[0].row;
      // get the number of sticks
      const selectedSticksCount = selectedSticks.length;

      // Make a copy of the board
      const updatedBoard = [...board];
      // Update the board by removing the selected sticks from the selected row
      updatedBoard[selectedRow] -= selectedSticksCount;

      // Log the updated board   
      console.log("Updated board:", updatedBoard);

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
          getGameData()
            .then(() => {
              // Update local state with the new board data
              setBoard(updatedBoard);
              // Update current player ID based on the turn in the updates object
              setCurrentPlayerId(updates.turn === 1 ? gameData.player1Id : gameData.player2Id);
            })
            .catch((error) => {
              console.error("Error fetching updated game data:", error);
              setError("Error fetching updated game data. Please try again.");
            });
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

  const getCurrentUserId = () => {
    // Check if there is a current user
    if (auth.currentUser) {
      // Return the current user's ID
      return auth.currentUser.uid;
    } else {
      // No user signed in, handle this case accordingly
      return null;
    }
  };

  return (
    <div>
      <h1>Game Page</h1>
      {error && <p>{error}</p>}
      {gameData && (
        <div>
          <p>{currentPlayerId === getCurrentUserId() ? "It's your turn" : "It's not your turn"}</p>
        </div>
      )}
      <div>
        {board.map((row, rowIndex) => (
          <div key={rowIndex}>
            {/* for each remaining stick, generate a stick */}
            {Array.from({ length: row }).map((_, stickIndex) => (
              <button
                key={stickIndex}
                onClick={() => handleStickClick(rowIndex, stickIndex)}
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: selectedSticks.find(stick => stick.row === rowIndex && stick.stick === stickIndex) ? "red" : "black"
                }}
              ></button>
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