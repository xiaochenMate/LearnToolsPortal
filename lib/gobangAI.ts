
/**
 * 五子棋 AI 引擎 PRO
 * 核心：极大极小值算法 (Minimax) + Alpha-Beta 剪枝 + 启发式局势分析
 */

export type Player = 1 | 2; // 1: 黑子(玩家), 2: 白子(AI)
export type Board = (Player | 0)[][];

const BOARD_SIZE = 15;

// 评分表 (深度优化版)
const SCORE = {
  FIVE: 1000000,
  LIVE_FOUR: 100000,
  SLEEP_FOUR: 10000,
  LIVE_THREE: 10000,
  SLEEP_THREE: 1000,
  LIVE_TWO: 1000,
  SLEEP_TWO: 100,
  ANY_ONE: 10
};

/**
 * 局势评估函数
 */
export function evaluateBoard(board: Board, player: Player): number {
  let totalScore = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = board[r][c];
      if (cell !== 0) {
        const score = getPosScore(board, r, c, cell);
        totalScore += cell === player ? score : -score;
      }
    }
  }
  return totalScore;
}

/**
 * 获取棋盘所有空位的评估分（用于热力图分析）
 */
export function getScoreMap(board: Board, player: Player): number[][] {
  const scoreMap = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) {
        // 计算如果在该位置落子，对当前玩家的价值
        scoreMap[r][c] = getPosScore(board, r, c, player) + getPosScore(board, r, c, (player === 1 ? 2 : 1) as Player) * 0.8;
      }
    }
  }
  return scoreMap;
}

function getPosScore(board: Board, r: number, c: number, p: Player): number {
  let score = 0;
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  
  for (const [dr, dc] of directions) {
    let count = 1;
    let block = 0;
    
    // 正向探测
    let currR = r + dr, currC = c + dc;
    while (currR >= 0 && currR < BOARD_SIZE && currC >= 0 && currC < BOARD_SIZE && board[currR][currC] === p) {
      count++; currR += dr; currC += dc;
    }
    if (!(currR >= 0 && currR < BOARD_SIZE && currC >= 0 && currC < BOARD_SIZE && board[currR][currC] === 0)) block++;

    // 反向探测
    currR = r - dr; currC = c - dc;
    while (currR >= 0 && currR < BOARD_SIZE && currC >= 0 && currC < BOARD_SIZE && board[currR][currC] === p) {
      count++; currR -= dr; currC -= dc;
    }
    if (!(currR >= 0 && currR < BOARD_SIZE && currC >= 0 && currC < BOARD_SIZE && board[currR][currC] === 0)) block++;

    if (count >= 5) score += SCORE.FIVE;
    else if (count === 4) score += block === 0 ? SCORE.LIVE_FOUR : (block === 1 ? SCORE.SLEEP_FOUR : 0);
    else if (count === 3) score += block === 0 ? SCORE.LIVE_THREE : (block === 1 ? SCORE.SLEEP_THREE : 0);
    else if (count === 2) score += block === 0 ? SCORE.LIVE_TWO : (block === 1 ? SCORE.SLEEP_TWO : 0);
    else score += SCORE.ANY_ONE;
  }
  return score;
}

export function checkWin(board: Board, r: number, c: number): boolean {
  const p = board[r][c];
  if (p === 0) return false;
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of directions) {
    let count = 1;
    let nr = r + dr, nc = c + dc;
    while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === p) {
      count++; nr += dr; nc += dc;
    }
    nr = r - dr; nc = c - dc;
    while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === p) {
      count++; nr -= dr; nc -= dc;
    }
    if (count >= 5) return true;
  }
  return false;
}

export function getBestMove(board: Board, depth: number = 2): [number, number] {
  let bestVal = -Infinity;
  let bestMove: [number, number] = [-1, -1];

  const candidates: [number, number][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0 && hasNeighbor(board, r, c)) {
        // 给候选点简单打分，优先搜索分高的
        const priority = getPosScore(board, r, c, 2) + getPosScore(board, r, c, 1);
        candidates.push([r, c, priority] as any);
      }
    }
  }

  // 按优先级排序，极大提高 Alpha-Beta 剪枝效率
  candidates.sort((a: any, b: any) => b[2] - a[2]);

  if (candidates.length === 0) return [7, 7];

  for (const [r, c] of candidates.slice(0, 20)) { // 仅搜索前20个高价值点
    board[r][c] = 2;
    const val = minimax(board, depth - 1, false, -Infinity, Infinity);
    board[r][c] = 0;
    if (val > bestVal) {
      bestVal = val;
      bestMove = [r, c];
    }
  }
  return bestMove;
}

function hasNeighbor(board: Board, r: number, c: number): boolean {
  for (let dr = -2; dr <= 2; dr++) { // 扩展到2格范围
    for (let dc = -2; dc <= 2; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] !== 0) return true;
    }
  }
  return false;
}

function minimax(board: Board, depth: number, isMaximizing: boolean, alpha: number, beta: number): number {
  if (depth === 0) return evaluateBoard(board, 2);

  const candidates: [number, number][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0 && hasNeighbor(board, r, c)) {
        candidates.push([r, c]);
      }
    }
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const [r, c] of candidates) {
      board[r][c] = 2;
      const ev = minimax(board, depth - 1, false, alpha, beta);
      board[r][c] = 0;
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const [r, c] of candidates) {
      board[r][c] = 1;
      const ev = minimax(board, depth - 1, true, alpha, beta);
      board[r][c] = 0;
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}
