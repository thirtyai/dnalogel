const TAU = Math.PI * 2

/**
 * 将弧度转成 0 - 2PI 中的值
 * @param rad - 任意弧度值
 * @return 0 - 2PI 的数值
 */
function formatRad(rad: number) {
  if (rad >= 0 && rad < TAU) return rad
  return ((rad % TAU) + TAU) % TAU
}

export { formatRad }
