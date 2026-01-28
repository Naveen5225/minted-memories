import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}

export const CartProvider = ({ children }) => {
  // Initialise from localStorage so cart survives refresh
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = window.localStorage.getItem('mintedmemories_cart')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Persist cart to localStorage on every change
  useEffect(() => {
    try {
      window.localStorage.setItem('mintedmemories_cart', JSON.stringify(items))
    } catch {
      // ignore storage errors
    }
  }, [items])

  const addItem = (item) => {
    setItems((prev) => [...prev, item])
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    const safeQty = Math.max(1, Math.min(100, Number.isNaN(quantity) ? 1 : quantity))
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: safeQty } : item)),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

