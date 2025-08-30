import { useState } from 'react'
import type { Result } from '~/types/result'

interface UseApiParams<T, P = undefined, G = undefined> {
  apiFunction: (params: P, contextParams?: G) => Promise<T>
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  params?: G
}

export const useApi = <T, P = undefined, G = undefined>({
  apiFunction,
  params: contextParams,
  onSuccess,
  onError
}: UseApiParams<T, P, G>) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const call = async (params: P): Promise<Result<T, Error>> => {
    setIsLoading(true)
    try {
      const data = await apiFunction(params, contextParams)
      onSuccess?.(data)
      return { success: true, data }
    } catch (error) {
      setError(error as Error)
      onError?.(error as Error)
      return { success: false, error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }

  return { call, isLoading, error }
}
