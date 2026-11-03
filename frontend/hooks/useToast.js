import { useCallback, useEffect, useRef, useState } from "react";

export default function useToast(duration = 3500) {
  const [toast, setToast] = useState({ msg: "", type: "success", show: false });
  const timer = useRef(null);

  const showToast = useCallback(
    (msg, type = "success") => {
      clearTimeout(timer.current);
      setToast({ msg, type, show: true });
      timer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), duration);
    },
    [duration]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, showToast };
}
