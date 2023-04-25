import { Call } from 'ethcall'
import { CallbacksType } from './executeCallbacks'
export default function getEmptyCallAndCallbackList(): [Call[], CallbacksType] {
  const contractCalls: Call[] = []
  const callbacks: CallbacksType = []

  return [contractCalls, callbacks]
}
