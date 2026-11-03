import { useLayoutEffect } from "react";

// Cada página tiene su propio CSS global (se pisan entre sí: body, :root, .hotel, etc.),
// así que se inyecta al entrar a la página y se quita al salir.
export default function usePageStyles(...cssTexts) {
  useLayoutEffect(() => {
    const nodes = cssTexts.map((css) => {
      const el = document.createElement("style");
      el.textContent = css;
      document.head.appendChild(el);
      return el;
    });
    return () => nodes.forEach((el) => el.remove());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
