import { configureStore } from "@reduxjs/toolkit";
import { AppState } from "./AppState";
import { cryptoSlice } from "./CryptoSlice";



export const store = configureStore <AppState> ({
    reducer:{
        currencies: cryptoSlice.reducer,
    }
})


//export const store = configureStore <AppState>({
 //   reducer: {
   //     user: userSlice.reducer, // connect AppState to userSlice reducers 
     //   products: productSlice.reducer,// connect AppState to productSlice reducers
       // employees: employeeSlice.reducer,// connect AppState to employeeuserSlice reducers
        
    //}
 


//});