'use server';

import { cookies } from 'next/headers';

export interface CartLineItem {
  productId: string;
  name: string;
  price: number;
  depositAmount: number;
  quantity: number;
  isUsed: boolean;
}

export interface CartState {
  hireItems: CartLineItem[];
  buyItems: CartLineItem[];
  deliveryPostcode?: string;
  pickupPostcode?: string;
  promoCode?: string;
}

const CART_COOKIE_NAME = 'hab_cart_state';

export async function getCartState(): Promise<CartState> {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get(CART_COOKIE_NAME);
  
  if (!cartCookie?.value) {
    return { hireItems: [], buyItems: [] };
  }

  try {
    const parsed = JSON.parse(cartCookie.value) as Partial<CartState>;
    return {
      hireItems: parsed.hireItems || [],
      buyItems: parsed.buyItems || [],
      deliveryPostcode: parsed.deliveryPostcode,
      pickupPostcode: parsed.pickupPostcode,
      promoCode: parsed.promoCode,
    };
  } catch (e) {
    return { hireItems: [], buyItems: [] };
  }
}

export async function saveCartState(state: CartState) {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(state), {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    httpOnly: true, // Only readable by the server, but we will pass it down via Context so UI has it. Wait, if it's httpOnly, JS can't read it natively via document.cookie, which is fine since we hydrate from server component.
  });
}
