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
  console.log('[displacedI, displacedJ] :>> ', [displacedI, displacedJ]);
  return [displacedI, displacedJ];
};
// const getCell = (i, j, boardData) => {
//   return boardData[i][j];
// }
export const findEmptyArndOpponent = (boardData, isBlackTurn) => {
  console.log('boardData, isBlackTurn :>> ', boardData, isBlackTurn);
  const emptyCoord = [];
  const opponent = !isBlackTurn;
  const directions = Object.keys(directionCoord).map((key) => directionCoord[key]);

  for (let i = 0; i < boardData.length; i += 1) {
    const refRow = boardData[i];
    for (let j = 0; j < refRow.length; j += 1) {
      const refCell = refRow[j];
      console.log('refCell :>> ', refCell);
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
  return emptyCoord;
};
