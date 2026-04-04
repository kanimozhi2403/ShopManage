import { createContext, useContext, useState } from 'react';

const DateRangeContext = createContext();

// Default: last 30 days ending today
const getDefaultRange = () => ({
  start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0]
});

export function DateRangeProvider({ children }) {
  const [dateRange, setDateRange] = useState(getDefaultRange);

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  return useContext(DateRangeContext);
}
