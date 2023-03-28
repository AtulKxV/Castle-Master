function toggleMode(mode) {
    if (mode == 1) {
      document.documentElement.setAttribute("data-theme", "default");
    } else if (mode == 2) {
      document.documentElement.setAttribute("data-theme", "colourful");
    } else if (mode == 3) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }
  