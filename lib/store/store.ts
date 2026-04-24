import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '@/lib/store/slices/cart-slice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

