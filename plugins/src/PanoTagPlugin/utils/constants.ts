export function random() {
  return Math.random().toString(36).slice(-6)
}

const RANDON_STRING = random()

export { RANDON_STRING }
