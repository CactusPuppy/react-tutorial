import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
  render() {
    return (
      <button
        className={"square " + (this.props.isWinningSquare ? "red" : "")}
        onClick={this.props.onClick}
      >
        {this.props.value}
      </button>
    );
  }
}

class Board extends React.Component {
  renderSquare(i) {
    return <Square
      value={this.props.squares[i]}
      onClick={() => this.props.onClick(i)}
      isWinningSquare={this.props.winningLine.includes(i)}
    />;
  }

  render() {
    const sideLength = Math.floor(Math.sqrt(this.props.squares.length));
    let boardRows = [];
    for (let row = 0; row < sideLength; row++) {
      let boardRow = [];
      for (let col = 0; col < sideLength; col++) {
        boardRow.push(this.renderSquare(row * 3 + col));
      }
      boardRows.push(<div className="board-row" key={row}>{boardRow}</div>);
    }

    return (
      <div>
        {boardRows}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        mark: '',
        clickedLocation: -1
      }],
      nextMark: 'X',
      turnNumber: 0,
      reverseMoveHistory: false,
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.turnNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (squares[i] || calculateWinner(squares)) return;
    squares[i] = this.state.nextMark;
    this.setState({
      history: [...history, {squares: squares, mark: this.state.nextMark, clickedLocation: i}],
      nextMark: this.state.nextMark === 'X' ? 'O' : 'X',
      turnNumber: history.length,
    });
  }

  jumpTo(turn) {
    this.setState({
      turnNumber: turn,
      nextMark: (turn % 2) === 0 ? 'X' : 'O',
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.turnNumber];
    const winnerResult = calculateWinner(current.squares);

    let moves = history.map((turnState, move) => {
      const description = move ?
      'Go to move #' + move + `: ${turnState.mark} on (${Math.floor(turnState.clickedLocation / 3)}, ${turnState.clickedLocation % 3})` :
      'Go to game start';

      return (
        <li key={move}>
          <button
            className={move === this.state.turnNumber ? "bold" : ""}
            onClick={() => this.jumpTo(move)}
          >
            {description}
          </button>
        </li>
      )
    });

    if (this.state.reverseMoveHistory) moves.reverse();

    let status;
    if (winnerResult) {
      status = 'Winner: ' + winnerResult.winner;
    } else if (current.squares.every((square) => square !== null)) {
      status = 'Draw'
    } else {
      status = 'Next player: ' + this.state.nextMark;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winningLine={winnerResult === null ? [] : winnerResult.line}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.setState({reverseMoveHistory: !this.state.reverseMoveHistory})}>Flip move history</button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {winner: squares[a], line: lines[i]};
    }
  }
  return null;
}
