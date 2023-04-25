// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CallbacksType = ((value: any) => void)[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function executeCallBacks(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: any[],
  callbacks: CallbacksType,
): void {
  if (!values) return
  if (values.length == 0) return
  if (values.length !== callbacks.length) {
    console.error('Callbacks and values length is not equal')
    return
  }
  for (let i = 0; i < callbacks.length; i++) {
    const value = values[i]
    if (value === null) {
      console.error('This callback makes error:', callbacks[i])
    }
    const callback = callbacks[i]
    if (value !== null) {
      callback(value)
    }
  }
}
