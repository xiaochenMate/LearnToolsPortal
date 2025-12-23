
/**
 * 中国象棋核心规则引擎 - 增强版
 */

export type ChessColor = 'red' | 'black';
export type PieceType = 'king' | 'advisor' | 'elephant' | 'horse' | 'rook' | 'cannon' | 'soldier';

export interface Piece {
  type: PieceType;
  color: ChessColor;
}

export type ChessBoard = (Piece | null)[];

export const INITIAL_BOARD: ChessBoard = new Array(90).fill(null);
const layout = (color: ChessColor, row: number) => {
  const startRow = color === 'red' ? 9 : 0;
  INITIAL_BOARD[startRow * 9 + 0] = INITIAL_BOARD[startRow * 9 + 8] = { type: 'rook', color };
  INITIAL_BOARD[startRow * 9 + 1] = INITIAL_BOARD[startRow * 9 + 7] = { type: 'horse', color };
  INITIAL_BOARD[startRow * 9 + 2] = INITIAL_BOARD[startRow * 9 + 6] = { type: 'elephant', color };
  INITIAL_BOARD[startRow * 9 + 3] = INITIAL_BOARD[startRow * 9 + 5] = { type: 'advisor', color };
  INITIAL_BOARD[startRow * 9 + 4] = { type: 'king', color };
  const cannonRow = color === 'red' ? 7 : 2;
  INITIAL_BOARD[cannonRow * 9 + 1] = INITIAL_BOARD[cannonRow * 9 + 7] = { type: 'cannon', color };
  const soldierRow = color === 'red' ? 6 : 3;
  for (let i = 0; i < 9; i += 2) INITIAL_BOARD[soldierRow * 9 + i] = { type: 'soldier', color };
};
layout('black', 0);
layout('red', 9);

export function isLegalMove(board: ChessBoard, from: number, to: number): boolean {
  const piece = board[from];
  const target = board[to];
  if (!piece) return false;
  if (target && target.color === piece.color) return false;

  const x1 = from % 9, y1 = Math.floor(from / 9);
  const x2 = to % 9, y2 = Math.floor(to / 9);
  const dx = Math.abs(x1 - x2);
  const dy = Math.abs(y1 - y2);

  switch (piece.type) {
    case 'king':
      if (x2 < 3 || x2 > 5) return false;
      if (piece.color === 'red' && y2 < 7) return false;
      if (piece.color === 'black' && y2 > 2) return false;
      return dx + dy === 1;
    case 'advisor':
      if (x2 < 3 || x2 > 5) return false;
      if (piece.color === 'red' && y2 < 7) return false;
      if (piece.color === 'black' && y2 > 2) return false;
      return dx === 1 && dy === 1;
    case 'elephant':
      if (dx !== 2 || dy !== 2) return false;
      if (piece.color === 'red' && y2 < 5) return false;
      if (piece.color === 'black' && y2 > 4) return false;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      if (board[my * 9 + mx]) return false;
      return true;
    case 'horse':
      if (!((dx === 1 && dy === 2) || (dx === 2 && dy === 1))) return false;
      const bx = dx === 2 ? (x1 + x2) / 2 : x1;
      const by = dy === 2 ? (y1 + y2) / 2 : y1;
      if (board[by * 9 + bx]) return false;
      return true;
    case 'rook':
      if (x1 !== x2 && y1 !== y2) return false;
      return countPiecesBetween(board, from, to) === 0;
    case 'cannon':
      const count = countPiecesBetween(board, from, to);
      if (x1 !== x2 && y1 !== y2) return false;
      if (!target) return count === 0;
      return count === 1;
    case 'soldier':
      if (piece.color === 'red' && y2 > y1) return false;
      if (piece.color === 'black' && y2 < y1) return false;
      const hasCrossed = piece.color === 'red' ? y1 <= 4 : y1 >= 5;
      if (!hasCrossed) return dx === 0 && dy === 1;
      return dx + dy === 1;
  }
  return false;
}

function countPiecesBetween(board: ChessBoard, from: number, to: number): number {
  const x1 = from % 9, y1 = Math.floor(from / 9);
  const x2 = to % 9, y2 = Math.floor(to / 9);
  let count = 0;
  if (x1 === x2) {
    const min = Math.min(y1, y2), max = Math.max(y1, y2);
    for (let i = min + 1; i < max; i++) if (board[i * 9 + x1]) count++;
  } else {
    const min = Math.min(x1, x2), max = Math.max(x1, x2);
    for (let i = min + 1; i < max; i++) if (board[y1 * 9 + i]) count++;
  }
  return count;
}

export function isFacingKing(board: ChessBoard): boolean {
  let rk = -1, bk = -1;
  for (let i = 0; i < 90; i++) {
    if (board[i]?.type === 'king') {
      if (board[i]?.color === 'red') rk = i;
      else bk = i;
    }
  }
  if (rk === -1 || bk === -1) return false;
  if (rk % 9 !== bk % 9) return false;
  return countPiecesBetween(board, rk, bk) === 0;
}

/**
 * 将坐标移动转化为中国象棋标准记谱 (例如: 炮二平五)
 */
export function getMoveNotation(board: ChessBoard, from: number, to: number): string {
  const piece = board[from];
  if (!piece) return "";
  
  const x1 = from % 9, y1 = Math.floor(from / 9);
  const x2 = to % 9, y2 = Math.floor(to / 9);
  
  const names: Record<string, string> = {
    king: piece.color === 'red' ? '帅' : '将',
    advisor: piece.color === 'red' ? '仕' : '士',
    elephant: piece.color === 'red' ? '相' : '象',
    horse: '马', rook: '车', cannon: '炮', soldier: piece.color === 'red' ? '兵' : '卒'
  };

  const numMapRed = ['九', '八', '七', '六', '五', '四', '三', '二', '一'];
  const numMapBlack = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const getXName = (x: number) => piece.color === 'red' ? numMapRed[8-x] : numMapBlack[x];
  
  let action = "";
  if (y1 === y2) action = "平";
  else if (piece.color === 'red' ? y2 < y1 : y2 > y1) action = "进";
  else action = "退";

  const target = (piece.type === 'horse' || piece.type === 'elephant' || piece.type === 'advisor') 
    ? getXName(x2) 
    : (y1 === y2 ? getXName(x2) : (piece.color === 'red' ? numMapRed[8-(Math.abs(y1-y2)-1)] : numMapBlack[Math.abs(y1-y2)-1]));

  return `${names[piece.type]}${getXName(x1)}${action}${target}`;
}
