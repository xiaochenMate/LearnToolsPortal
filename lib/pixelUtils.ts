
/**
 * 像素画工具函数集
 */

/**
 * 泛洪填充算法 (BFS 实现)
 */
export function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColor: string,
  gridSize: number
) {
  const canvas = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 获取点击位置的颜色
  const startPos = (startY * canvas.width + startX) * 4;
  const startR = data[startPos];
  const startG = data[startPos + 1];
  const startB = data[startPos + 2];
  const startA = data[startPos + 3];

  // 转换填充颜色 (HEX to RGBA)
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 1;
  tempCanvas.height = 1;
  const tCtx = tempCanvas.getContext('2d')!;
  tCtx.fillStyle = fillColor;
  tCtx.fillRect(0, 0, 1, 1);
  const fillData = tCtx.getImageData(0, 0, 1, 1).data;

  if (
    startR === fillData[0] &&
    startG === fillData[1] &&
    startB === fillData[2] &&
    startA === fillData[3]
  ) return;

  const queue: [number, number][] = [[startX, startY]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    const key = `${x},${y}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const pos = (y * canvas.width + x) * 4;
    if (
      data[pos] === startR &&
      data[pos + 1] === startG &&
      data[pos + 2] === startB &&
      data[pos + 3] === startA
    ) {
      // 填充颜色
      data[pos] = fillData[0];
      data[pos + 1] = fillData[1];
      data[pos + 2] = fillData[2];
      data[pos + 3] = fillData[3];

      // 检查邻居 (上下左右)
      if (x > 0) queue.push([x - 1, y]);
      if (x < canvas.width - 1) queue.push([x + 1, y]);
      if (y > 0) queue.push([x, y - 1]);
      if (y < canvas.height - 1) queue.push([x, y + 1]);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * 无损缩放导出图片
 */
export function exportCanvas(
  sourceCanvas: HTMLCanvasElement,
  scale: number,
  fileName: string
) {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = sourceCanvas.width * scale;
  exportCanvas.height = sourceCanvas.height * scale;
  const ctx = exportCanvas.getContext('2d')!;

  // 关键：禁用平滑以保持像素锐利
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    sourceCanvas,
    0, 0, sourceCanvas.width, sourceCanvas.height,
    0, 0, exportCanvas.width, exportCanvas.height
  );

  const link = document.createElement('a');
  link.download = `${fileName}.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
}
