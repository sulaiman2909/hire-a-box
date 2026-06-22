'use client';

import React, { createContext, useContext, useState, useEffect, useTransition } from 'react';
import { CartState, CartLineItem, saveCartState } from '@/app/actions/cart';

interface CartContextType {
  state: CartState;
  isDrawerOpen: boolean;
  activeMode: 'hire' | 'buy';
  setActiveMode: (mode: 'hire' | 'buy') => void;
  openCart: (mode?: 'hire' | 'buy') => void;
  closeCart: () => void;
  updateQuantity: (mode: 'hire' | 'buy', item: Omit<CartLineItem, 'quantity'>, quantity: number) => void;
  clearCart: (mode: 'hire' | 'buy') => void;
  setDeliveryPostcode: (postcode: string) => void;
  setPickupPostcode: (postcode: string) => void;
  setPromoCode: (code: string) => void;
  resetCart: () => void;
  isPending: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ 
  initialState, 
  children 
}: { 
  initialState: CartState; 
  children: React.ReactNode 
}) {
  const [state, setState] = useState<CartState>(initialState);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'hire' | 'buy'>('hire');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      saveCartState(state);
    });
  }, [state]);

  const updateQuantity = (mode: 'hire' | 'buy', item: Omit<CartLineItem, 'quantity'>, quantity: number) => {
    setState(prev => {
      const targetList = mode === 'hire' ? prev.hireItems : prev.buyItems;
      const existingItemIndex = targetList.findIndex(i => i.productId === item.productId && i.isUsed === item.isUsed);
      
      let newList = [...targetList];
      
      if (quantity === 0) {
        if (existingItemIndex !== -1) newList.splice(existingItemIndex, 1);
      } else {
        if (existingItemIndex !== -1) {
          newList[existingItemIndex] = { ...newList[existingItemIndex], quantity };
        } else {
          newList.push({ ...item, quantity });
        }
      }

      return mode === 'hire' 
        ? { ...prev, hireItems: newList } 
        : { ...prev, buyItems: newList };
    });
  };

  const clearCart = (mode: 'hire' | 'buy') => {
    setState(prev => mode === 'hire' 
      ? { ...prev, hireItems: [], promoCode: '' } 
      : { ...prev, buyItems: [], promoCode: '' }
    );
  };

  const resetCart = () => {
    setState({
      hireItems: [],
      buyItems: [],
      deliveryPostcode: '',
      pickupPostcode: '',
      promoCode: ''
    });
  };

  const setDeliveryPostcode = (postcode: string) => {
    setState(prev => ({ ...prev, deliveryPostcode: postcode }));
  };

  const setPickupPostcode = (postcode: string) => {
    setState(prev => ({ ...prev, pickupPostcode: postcode }));
  };

  const setPromoCode = (code: string) => {
    setState(prev => ({ ...prev, promoCode: code }));
  };

  const openCart = (mode?: 'hire' | 'buy') => {
    if (mode) {
      setActiveMode(mode);
    }
    setIsDrawerOpen(true);
  };

  const closeCart = () => {
    setIsDrawerOpen(false);
  };

  return (
    <CartContext.Provider value={{ 
      state, isDrawerOpen, activeMode, setActiveMode, openCart, closeCart, 
      updateQuantity, clearCart, resetCart,
      setDeliveryPostcode, setPickupPostcode, setPromoCode,
      isPending 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
