import { useEffect, useRef } from "react";

/**
 * hook to know the previous value of props or state of a component
 * ref: https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
 * @param value
 */
export const usePrevious = <T>(value: T) => {
  const ref = useRef<T>(value);
  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref.current;
};
