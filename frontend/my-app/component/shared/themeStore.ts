export function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}

export function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

export function getServerThemeSnapshot() {
  return false;
}
