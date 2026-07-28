import { createContext, useContext } from 'react'

// 1. Create the Context
export const NthParentContext = createContext(null)

// Custom hook for easier consumption by the child
export const useNthParent = () => useContext(NthParentContext)
