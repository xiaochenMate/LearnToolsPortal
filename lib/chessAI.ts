
import { ChessBoard, ChessColor, isLegalMove, isFacingKing, Piece } from './chessRules';

const PIECE_VAL: Record<string, number> = {
  king: 10000,
  rook: 900,
  cannon: 450,
  horse: 400,
  elephant: 200,
  advisor: 200,
  soldier: 100
};

// 简单的位置权重 (简化版)
const getPosValue = (piece: Piece, index: number): number => {
  const x = index % 9, y = Math.floor(index / 9);
  if (piece.type === 'soldier') {
    const crossed = piece.color === 'red' ? y <= 4 : y >= 5;
    return crossed ? 50 : 0; // 卒过河加分
  }
  if (piece.type === 'horse' || piece.type === 'cannon') {
    return (x >= 2 && x <= 6) ? 10 : 0; // 居中加分
  }
  return 0;
};

export function evaluate(board: ChessBoard, color: ChessColor): number {
  let score = 0;
  for (let i = 0; i < 90; i++) {
    const p = board[i];
    if (p) {
      const val = PIECE_VAL[p.type] + getPosValue(p, i);
      score += p.color === color ? val : -val;
    }
  }
  return score;
}

export function getBestMove(board: ChessBoard, color: ChessColor, depth: number = 3): [number, number] {
  let bestScore = -Infinity;
  let move: [number, number] = [-1, -1];

  const moves = getAllLegalMoves(board, color);
  for (const [from, to] of moves) {
    const nextBoard = [...board];
    const captured = nextBoard[to];
    nextBoard[to] = nextBoard[from];
    nextBoard[from] = null;

    if (isFacingKing(nextBoard)) continue;

    const score = -minimax(nextBoard, depth - 1, color === 'red' ? 'black' : 'red', -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      move = [from, to];
    }
  }
  return move;
}

function minimax(board: ChessBoard, depth: number, color: ChessColor, alpha: number, beta: number): number {
  if (depth === 0) return evaluate(board, color);

  const moves = getAllLegalMoves(board, color);
  let maxScore = -Infinity;

  for (const [from, to] of moves) {
    const nextBoard = [...board];
    nextBoard[to] = nextBoard[from];
    nextBoard[from] = null;

    if (isFacingKing(nextBoard)) continue;

    const score = -minimax(nextBoard, depth - 1, color === 'red' ? 'black' : 'red', -beta, -alpha);
    maxScore = Math.max(maxScore, score);
    alpha = Math.max(alpha, score);
    if (alpha >= beta) break;
  }
  return maxScore === -Infinity ? -PIECE_VAL.king : maxScore;
}

function getAllLegalMoves(board: ChessBoard, color: ChessColor): [number, number][] {
  const moves: [number, number][] = [];
  for (let i = 0; i < 90; i++) {
    if (board[i]?.color === color) {
      for (let j = 0; j < 90; j++) {
        if (isLegalMove(board, i, j)) moves.push([i, j]);
      }
    }
  }
  return moves;
}
