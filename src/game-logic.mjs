const boardSize = 8;
const directionCoord = {
  top: [0, -1],
  left: [-1, 0],
  bottom: [0, 1],
  right: [1, 0],
  topL: [-1, -1],
  botL: [-1, 1],
  botR: [1, 1],
  topR: [1, -1],
};

export const startingBoard = () => {
  const boardData = [...Array(boardSize)].map(() => Array(boardSize));
  boardData[3][3] = false;
  boardData[4][4] = false;
  boardData[3][4] = true;
  boardData[4][3] = true;
  return boardData;
};

export function checkError(error) {

}
const getCoordInDirection = (i, j, direction, distance = 1) => {
  const displacedI = i + direction[0] * distance;
  const displacedJ = j + direction[1] * distance;
  if (displacedI < 0 || displacedI >= boardSize || displacedJ < 0 || displacedJ >= boardSize) {
    return null;
  }
  return [displacedI, displacedJ];
};
export const findEmptyArndOpponent = (boardData, isBlackTurn) => {
  const emptyCoord = [];
  const opponent = !isBlackTurn;
  const directions = Object.values(directionCoord);

  for (let i = 0; i < boardData.length; i += 1) {
    const refRow = boardData[i];
    for (let j = 0; j < refRow.length; j += 1) {
      const refCell = refRow[j];
      if (refCell === opponent) {
        // check if adjacent is blank
        directions.forEach((dir) => {
          const adjacentIndices = getCoordInDirection(i, j, dir);
          if (adjacentIndices !== null) {
            const [adjI, adjJ] = adjacentIndices;
            const adjCell = boardData[adjI][adjJ];
            if (adjCell === null || adjCell === undefined) {
              emptyCoord.push(adjacentIndices);
            }
          }
        });
      }
    }
  }
  // make into a set of empty spaces
  return emptyCoord;
};
const findPlayerTokenInDir = (i, j, boardData, isBlackTurn, direction) => {
  let distance = 2;
  while (distance < 8)
  {
    const cellCoord = getCoordInDirection(i, j, direction, distance);
    if (cellCoord === null)
    {
      return null;
    }
    const [displacedI, displacedJ] = cellCoord;
    const refCell = boardData[displacedI][displacedJ];
    if (refCell === null) return null;
    if (refCell === isBlackTurn) {
      return cellCoord;
    }
    distance += 1;
  }
  return null;
};
export const findValidMovesFromEmpty = (boardData, isBlackTurn, emptySpaces) => {
  const validMoves = [];
  const opponent = !isBlackTurn;
  const directions = Object.entries(directionCoord);
  // from empty space, evaluate direction of adjacent seeds, create moves-direction obj
  for (let k = 0; k < emptySpaces.length; k += 1) {
    const moveObj = {
      coord: emptySpaces[k],
    };
    const [i, j] = emptySpaces[k];
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, coord] of directions)
    {
      const adjacentIndices = getCoordInDirection(i, j, coord);
      if (adjacentIndices !== null) {
        const adjCell = boardData[adjacentIndices[0]][adjacentIndices[1]];
        if (adjCell === opponent) {
          const foundTokenCoord = findPlayerTokenInDir(i, j, boardData, isBlackTurn, coord);
          if (foundTokenCoord !== null)
          {
            moveObj[key] = foundTokenCoord;
          }
        }
      }
    }
    if (Object.keys(moveObj).length > 1) {
      validMoves.push(moveObj);
    }
  }
  return validMoves;
};
export const getValidMoves = (boardData, isBlackTurn) => {
  const emptySpaceArdOpponent = findEmptyArndOpponent(boardData, isBlackTurn);
  return findValidMovesFromEmpty(boardData, isBlackTurn, emptySpaceArdOpponent);
};

export const moveIsValid = (rowI, colI, validMoves) => {
  const coord = validMoves.map((x) => x.coord);

  for (let i = 0; i < coord.length; i += 1) {
    const move = coord[i];
    if (rowI === move[0] && colI === move[1]) return validMoves[i];
  }
  return false;
};

const addCoord = (c1, c2) => [c1[0] + c2[0], c1[1] + c2[1]];

const coordsAreEqual = (c1, c2) => c1[0] === c2[0] && c1[1] === c2[1];

const flipSeedInDirection = (boardData, startCoord, endCoord, direction) => {
  let nextCoord = addCoord(startCoord, direction);
  while (!coordsAreEqual(nextCoord, endCoord))
  {
    boardData[nextCoord[0]][nextCoord[1]] = !boardData[nextCoord[0]][nextCoord[1]];
    nextCoord = addCoord(nextCoord, direction);
  }
  // return boardData;
};
export const flipSeeds = (boardData, moveObj) => {
  const { coord } = moveObj;
  delete moveObj.coord;

  const directions = Object.entries(moveObj);
  // eslint-disable-next-line no-restricted-syntax
  for (const [dirType, endCoord] of directions) {
    flipSeedInDirection(boardData, coord, endCoord, directionCoord[dirType]);
  }
  return boardData;
};

export const countSeeds = (boardData) => {
  let numBlackSeeds = 0;
  let numWhiteSeeds = 0;
  console.log('boardData :>> ', boardData);
  for (let i = 0; i < boardData.length; i += 1) {
    const refRow = boardData[i];
    for (let j = 0; j < refRow.length; j += 1) {
      const cell = refRow[j];
      if (cell === true) {
        numBlackSeeds += 1;
      }
      if (cell === false) {
        numWhiteSeeds += 1;
      }
    }
  }
  return [numBlackSeeds, numWhiteSeeds];
};
// export const
