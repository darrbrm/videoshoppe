import React, { createContext, useContext, useState } from "react";

// Step 1: Create a Context
const MyContext = createContext();

// Step 2: Create a Provider Component
export function NavigationManager({ children }) {
    
  const [state, setState] = useState("Logged out");

  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
}

// Step 3: Create a Custom Hook to Use Context
export function useMyContext() {
  return useContext(MyContext);
}
