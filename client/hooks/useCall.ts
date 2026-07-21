import { useMutation } from '@tanstack/react-query'
import { sendDataSse } from '../apis/callapi'

export function useNewSse() {
  return useMutation({
    mutationFn: async (data) => {
      return sendDataSse(data)
    },
  })
}
