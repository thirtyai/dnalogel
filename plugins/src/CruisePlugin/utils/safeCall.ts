export const safeCall = async (fn: () => Promise<any>) => {
  try {
    // eslint-disable-next-line prettier/prettier
      fn().then(() => {},() => {}).catch(() => {})
  } catch (e) {}
}
