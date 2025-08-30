export type Position = {
  x: number
  y: number
}

export type MutationOptions = {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}
