import { useEffect, useState, useRef } from 'react';
import image from "./assets/image.png"
import birdImg from './assets/died_bird.png';
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
  let interval1;
  let gameover1=false
  let obsInterval;
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

  const obstacleMovement = () => {
    obsInterval = setInterval(() => {
      if (gameOver) {
        clearInterval(obsInterval); // Stop obstacle movement if the game is over
        return;
      }
  
      setObstaclePosition((prevObstaclePosition) => {
        const newObstaclePosition = prevObstaclePosition + 0.1; // Continue obstacle movement to the right
        if (newObstaclePosition > 100) {
          generateRandomHeights();
          setShowScoreAnimation(true);
  
          setTimeout(() => {
            setShowScoreAnimation(false);
          }, 1000);
  
          return 0;
        }
  
        // Score update logic - check when obstacle passes the bird
        if (lastObstaclePosition.current < 50 && newObstaclePosition >= 50) {
          setScore((prevScore) => prevScore + 1); // Increment score when the obstacle fully passes
        }
  
        lastObstaclePosition.current = newObstaclePosition;
        return newObstaclePosition;
      });
    }, 0);
  };
  
  
  
  const birdMovement =()=>{
    interval1= setInterval(()=>{
      setGravity((prev) => {
        if (birdPosition + prev + 1 > 93) {
          clearInterval(interval1);
          setGameOver(true);
          setIsFalling(true);
          return prev;
        }
        return prev + 2;
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
          clearInterval(interval1);
          setGameOver(true);
          gameover1=true
          setIsFalling(true);
          clearInterval(obsInterval)
        }
      }
    },100)
    
  }
let innterval=50
  useEffect(() => {
    if (gameStart && !gameOver) {
      // Determine the interval speed based on screen size
      const isMobile = window.innerWidth <= 768;

      birdMovement()
      obstacleMovement()
      return () => clearInterval(interval1);
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
    const isMobile = window.innerWidth <= 768;
    
    if (gameStart && birdPosition + gravity > 6 && !gameOver) {
      // if(isMobile){
      //   setGravity(gravity - 18);
      //   return
      // }
      setGravity(gravity - 10);

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
    <div className="game-container ">
      {gameOver && (
        <div className="game-over-overlay">
          <h1>Game Over</h1>
          <p>Score: {score}</p>
          <p>Best Score: {bestScore}</p>
          <div className='hover:bg-slate-500 w-full rounded-lg mt-3' onClick={restartGame}>Restart</div>
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
      <div
  className="md:w-[40vw] h-[40rem] m-auto relative top-[50px] overflow-hidden rounded-lg"
  style={{
    backgroundImage: gameOver
      ? `url(${image})` // The image to show after game over
      : "url('https://miro.medium.com/v2/resize:fit:1280/1*3w_84yghkeRKvg_JkMdX5g.gif')", // The gif while game is running
    backgroundSize: "cover",
  }}
>
          {!gameStart && !gameOver && <button onClick={clickHandler} >Start Flying</button>}

          <div
            
            className=" ms-[2vw] absolute w-[120px] transform -translate-x-1/2 -translate-y-1/2 left-[35%] rounded-3xl h-fit  transition-all ease-in-out duration-150  m-0 p-0 "
            style={{ top: `${birdPosition + gravity}%` }}
          >
            <div ref={birdRef} className='w-[65px] h-2  absolute top-8 left-6 m-0 p-0'></div>
            <img
            src={gameOver ? birdImg: "https://img.clipart-library.com/2/clip-transparent-bird-gif/clip-transparent-bird-gif-2.gif"} // Use bird image if game is over, otherwise use GIF
              className="rounded-3xl"
              alt="Bird"
            />
          </div>

          <div
            ref={bottomObstacleRef}
            className="obs absolute bottom-0 rotate-180 h-fit w-[12vw] md:w-[5vw]"
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
            className=" obs absolute top-0  w-[12vw] md:w-[5vw]"
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
