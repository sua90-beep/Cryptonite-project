import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { CryptoModel } from "../Models/CryptoModel"



function initCurrencies(_currentState: CryptoModel[],action:PayloadAction<CryptoModel[]>): CryptoModel[]{
    const currenciesToInit = action.payload;// get  currencies to initiate
    const newState = currenciesToInit;// newState is the currencies to init 
      return newState;// return the newState
}

export const cryptoSlice = createSlice({
 name: "crypto-slice",
 initialState:[] as CryptoModel[],
 reducers:{initCurrencies}   
})

