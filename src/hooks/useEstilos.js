import { useLayoutEffect } from "react";

export default function useEstilos(...hojas) {
  useLayoutEffect(() => {
    const nodos = hojas.map((css) => {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
      return style;
    });
    return () => nodos.forEach((n) => n.remove());
  }, []);
}
