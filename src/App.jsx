import { useEffect, useState, useRef } from 'react';
import birdImg from './assets/birdImg.png';
import obstacle from './assets/obstacle.png';
import './App.css';

function App() {
  let [birdPosition, setBirdPosition] = useState(50);
  let [gameStart, setGameStart] = useState(false);
  let [gameOver, setGameOver] = useState(false);
  let [gravity, setGravity] = useState(0);
  let [obstaclePosition, setObstaclePosition] = useState(-20);
  let [topObstacleHeight, setTopObstacleHeight] = useState(20);
  let [bottomObstacleHeight, setBottomObstacleHeight] = useState(30);
  let [score, setScore] = useState(0);
  let [bestScore, setBestScore] = useState(0);
  let [isFalling, setIsFalling] = useState(false);
  let [showScoreAnimation, setShowScoreAnimation] = useState(false);

  const birdRef = useRef(null);
  const topObstacleRef = useRef(null);
  const bottomObstacleRef = useRef(null);
  const lastObstaclePosition = useRef(-20);  // Track the previous obstacle position for score logic

  const generateRandomHeights = () => {
    const minGap = 20;
    const maxGap = 25;
    const gameHeight = 100;

    const maxHeightChange = 20;
    const baseTopHeight = Math.floor(Math.random() * gameHeight / 2);
    const gapSize = Math.floor(Math.random() * (maxGap - minGap + 1)) + minGap;

    let newTopHeight = baseTopHeight + Math.floor(Math.random() * maxHeightChange) - maxHeightChange / 2;
    newTopHeight = Math.max(5, Math.min(newTopHeight, 80));

    const newBottomHeight = gameHeight - newTopHeight - gapSize;
    if (newBottomHeight < 5) {
      newTopHeight = gameHeight - gapSize - 5;
      setBottomObstacleHeight(5);
    } else {
      setBottomObstacleHeight(newBottomHeight);
    }

    setTopObstacleHeight(newTopHeight);
  };

  useEffect(() => {
    if (gameStart && !gameOver) {
      let interval = setInterval(() => {
        setGravity((prev) => {
          if (birdPosition + prev + 1 > 93) {
            clearInterval(interval);
            setGameOver(true);
            setIsFalling(true);
            return prev;
          }

          setObstaclePosition((prevObstaclePosition) => {
            const newObstaclePosition = prevObstaclePosition + 1; // Continue obstacle movement to the right
            if (newObstaclePosition > 100) {
              generateRandomHeights();
              setShowScoreAnimation(true);

              setTimeout(() => {
                setShowScoreAnimation(false);
              }, 1000);

              return -20;
            }

            // Score update logic - check when obstacle passes the bird
            if (lastObstaclePosition.current < 50 && newObstaclePosition >= 50) {
              setScore((prevScore) => prevScore + 1); // Increment score when the obstacle fully passes
            }

            lastObstaclePosition.current = newObstaclePosition;
            return newObstaclePosition;
          });

          return prev + 1.5;
        });

        if (birdRef.current && topObstacleRef.current && bottomObstacleRef.current) {
          const birdRect = birdRef.current.getBoundingClientRect();
          const topObstacleRect = topObstacleRef.current.getBoundingClientRect();
          const bottomObstacleRect = bottomObstacleRef.current.getBoundingClientRect();

          const collisionWithTopObstacle =
            birdRect.left < topObstacleRect.right &&
            birdRect.right > topObstacleRect.left &&
            birdRect.top < topObstacleRect.bottom &&
            birdRect.bottom > topObstacleRect.top;

          const collisionWithBottomObstacle =
            birdRect.left < bottomObstacleRect.right &&
            birdRect.right > bottomObstacleRect.left &&
            birdRect.top < bottomObstacleRect.bottom &&
            birdRect.bottom > bottomObstacleRect.top;

          if (collisionWithTopObstacle || collisionWithBottomObstacle) {
            clearInterval(interval);
            setGameOver(true);
            setIsFalling(true);
          }
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [gameStart, gameOver, birdPosition]);

  useEffect(() => {
    if (isFalling) {
      const fallInterval = setInterval(() => {
        setGravity((prevGravity) => {
          if (birdPosition + prevGravity + 1 < 93) {
            return prevGravity + 1.5;
          } else {
            clearInterval(fallInterval);
            setGravity(0);
            setIsFalling(false);
            return prevGravity;
          }
        });
      }, 50);

      return () => clearInterval(fallInterval);
    }
  }, [isFalling, birdPosition]);

  const clickHandler = () => {
    if (gameOver || isFalling) return;
    setGameStart(true);
    setGameOver(false);
    setScore(0);
    setGravity(0);
    setObstaclePosition(-20);
    generateRandomHeights();
  };

  const playClick = () => {
    if (gameStart && birdPosition + gravity > 6 && !gameOver) {
      setGravity(gravity - 8);
    }
  };

  const restartGame = () => {
    setBestScore(Math.max(bestScore, score));
    setGameStart(false);
    setGameOver(false);
    setIsFalling(false);
    setGravity(0);
    setBirdPosition(50);
    setScore(0);
    setObstaclePosition(-20);
    generateRandomHeights();
  };

  return (
    <div className="game-container">
      {gameOver && (
        <div className="game-over-overlay">
          <h1>Game Over</h1>
          <p>Score: {score}</p>
          <p>Best Score: {bestScore}</p>
          <button onClick={restartGame}>Restart</button>
        </div>
      )}

      {gameStart && !gameOver && (
        <div className="score-display z-20">
          <p>Score: {score}</p>
        </div>
      )}

      {showScoreAnimation && (
        <div className="score-animation">
          <p>+1</p>
        </div>
      )}

      <div onClick={playClick}>
        <div className="md:w-[40vw]  h-[40rem] m-auto relative top-[50px] bg-[url('https://user-images.githubusercontent.com/18351809/46888871-624a3900-ce7f-11e8-808e-99fd90c8a3f4.png')] bg-cover overflow-hidden">
          {!gameStart && !gameOver && <button onClick={clickHandler}>Start Game</button>}

          <div
            ref={birdRef}
            className="ms-[2vw] absolute w-[60px] rounded-3xl h-fit  transition-all ease-in-out duration-150"
            style={{ top: `${birdPosition + gravity}%` }}
          >
            <img
              src={birdImg}
              className="rounded-3xl"
              alt="Bird"
            />
          </div>

          <div
            ref={bottomObstacleRef}
            className="absolute bottom-0 rotate-180 h-fit w-[12vw] md:w-[8vw]"
            style={{
              right: `${obstaclePosition}%`,
              height: `${bottomObstacleHeight}%`,
            }}
          >
            <img
              src="https://lh3.googleusercontent.com/proxy/BN-eWAKGRerB_Irk5LM-fH21T4lBfULQh4d2xbQVwf4olklxxzjKIcSTsy17Rf_4CH-U0ViQ2NJB9upJ0O39fYM"
              className="w-[100%] h-[100%] m-0"
              alt="Bottom Obstacle"
            />
          </div>

          <div
            ref={topObstacleRef}
            className="absolute top-0  w-[12vw] md:w-[8vw]"
            style={{
              right: `${obstaclePosition}%`,
             
              height: `${topObstacleHeight}%`,
            }}
          >
            <img
              src="https://lh3.googleusercontent.com/proxy/BN-eWAKGRerB_Irk5LM-fH21T4lBfULQh4d2xbQVwf4olklxxzjKIcSTsy17Rf_4CH-U0ViQ2NJB9upJ0O39fYM"
              className="w-full h-full"
              alt="Top Obstacle"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
