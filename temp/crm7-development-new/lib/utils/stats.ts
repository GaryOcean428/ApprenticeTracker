export function calculateStats(data: any[]): { total: number; average: number } {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const average = total / data.length;
  return { total, average };
}
