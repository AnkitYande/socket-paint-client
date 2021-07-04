import React, { useState } from "react";
import './App.css';
import Board from './Board.js'
let randomWords = require('random-words');

function App() {

  const [color, setColor] = useState("#000000")
  const [size, setSize] = useState(5)
  const [room, setRoom] = useState("");
  const [finalRoom, setFinalRoom] = useState("");
  const [buttonToggle, setbuttonToggle] = useState(false);

  const changeColor = (param) => {
    setColor(param.target.value)
  }

  const changeSize = (param) => {
    setSize(param.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setFinalRoom(room)
    console.log("Changing to room", room);
  }

  const handleReset = () => {
    setbuttonToggle(!buttonToggle)
    console.log("App resetting");
  }

  const handleWord = () => {
    alert(`${randomWords()}`)
  }

  return (
    <div class="App">
      <div class="tool-picker">

        <div class="tool-cont">
          <h4>Enter Room</h4>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="room"
              onChange={e => setRoom(e.target.value)}
            />
            <input type="submit" value="Submit" />
          </form>
        </div>

        <div class="tool-cont">
          <h4>Select Color</h4>
          <input type="color" onChange={changeColor} />
        </div>

        <div class="tool-cont">
          <h4>Select Size</h4>
          <select onChange={changeSize}>
            <option>2</option>
            <option selected>5</option>
            <option>10</option>
            <option>15</option>
            <option>20</option>
            <option>30</option>
            <option>50</option>
            <option>100</option>
            <option>200</option>

          </select>
        </div>

        <button onClick={handleReset}>Reset</button>

      </div>

      <div class="board-container">
        <Board
          color={color}
          size={size}
          buttonToggle={buttonToggle}
          room={finalRoom}
        />
      </div>

      <div class="bottom-bar">
        <button onClick={handleWord}>Generate Word</button> 
      </div>

    </div>
  );
}

export default App;
