import { useMutation } from '@tanstack/react-query'
import { sendDataSse, sendStatusChange } from '../apis/callapi'

export function useNewSse() {
  return useMutation({
    mutationFn: async (data) => {
      return sendDataSse(data)
    },
  })
}

export function useStatusChange() {
  return useMutation({
    mutationFn: async (data) => {
      return sendStatusChange(data)
    },
  })
}
