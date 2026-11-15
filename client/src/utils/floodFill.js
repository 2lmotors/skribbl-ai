// Algorithme de remplissage (Pot de peinture / Flood Fill) optimisé pour Canvas HTML5

function hexToRgba(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  return [
    (num >> 16) & 255,
    (num >> 8) & 255,
    num & 255,
    255
  ];
}

function colorMatch(c1, c2, tolerance = 32) {
  return (
    Math.abs(c1[0] - c2[0]) <= tolerance &&
    Math.abs(c1[1] - c2[1]) <= tolerance &&
    Math.abs(c1[2] - c2[2]) <= tolerance &&
    Math.abs(c1[3] - c2[3]) <= tolerance
  );
}

export function performFloodFill(ctx, startX, startY, fillColorHex) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  const startPixelX = Math.floor(startX);
  const startPixelY = Math.floor(startY);

  if (startPixelX < 0 || startPixelX >= width || startPixelY < 0 || startPixelY >= height) {
    return;
  }

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const startIndex = (startPixelY * width + startPixelX) * 4;
  const startColor = [
    data[startIndex],
    data[startIndex + 1],
    data[startIndex + 2],
    data[startIndex + 3]
  ];

  const fillColor = hexToRgba(fillColorHex);

  // Si la couleur cible est déjà identique, ne rien faire
  if (colorMatch(startColor, fillColor, 5)) {
    return;
  }

  const stack = [[startPixelX, startPixelY]];
  const visited = new Uint8Array(width * height);

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const idx = y * width + x;

    if (visited[idx]) continue;
    visited[idx] = 1;

    const pixelIdx = idx * 4;
    const currentColor = [
      data[pixelIdx],
      data[pixelIdx + 1],
      data[pixelIdx + 2],
      data[pixelIdx + 3]
    ];

    if (colorMatch(currentColor, startColor, 35)) {
      data[pixelIdx] = fillColor[0];
      data[pixelIdx + 1] = fillColor[1];
      data[pixelIdx + 2] = fillColor[2];
      data[pixelIdx + 3] = fillColor[3];

      if (x > 0 && !visited[idx - 1]) stack.push([x - 1, y]);
      if (x < width - 1 && !visited[idx + 1]) stack.push([x + 1, y]);
      if (y > 0 && !visited[idx - width]) stack.push([x, y - 1]);
      if (y < height - 1 && !visited[idx + width]) stack.push([x, y + 1]);
    }
  }

  ctx.putImageData(imgData, 0, 0);
}
