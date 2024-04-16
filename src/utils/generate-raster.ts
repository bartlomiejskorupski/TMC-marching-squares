export function generateRandomRaster(
  width: number = 10,
  height: number = 10
): number[][] {
  return Array(height)
    .fill(null)
    .map(() =>
      Array(width)
        .fill(null)
        .map(() => Math.round(Math.random() * 100) / 10)
    );
}

export function generateGaussianRaster(
  width: number = 10,
  height: number = 10
): number[][] {
  const u = 4.5;
  const o = 2;
  return Array(height)
    .fill(null)
    .map((_, y) =>
      Array(width)
        .fill(null)
        .map(
          (_, x) =>
            normalDistribution(x, u, o) * normalDistribution(y, u, o) * 300
        )
    );
}

function normalDistribution(x: number, u: number, o: number) {
  return (
    (1 / (o * Math.sqrt(2 * Math.PI))) *
    Math.pow(Math.E, -(0.5 * ((x - u) / o) ** 2))
  );
}
