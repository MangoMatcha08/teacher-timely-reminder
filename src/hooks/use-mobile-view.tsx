
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useMobileView() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);
  const [isiOS, setIsiOS] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Check if device is iOS
    const checkIsiOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    setIsiOS(checkIsiOS());
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return {
    isMobile: !!isMobile,
    isiOS
  };
}
