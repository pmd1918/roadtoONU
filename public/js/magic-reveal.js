document.addEventListener("DOMContentLoaded", () => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const scene = document.querySelector(".scene");
    const magic = scene?.querySelector(".magic");
    if (!scene || !magic) return;
  
    let half = magic.offsetWidth / 2;
  
    scene.addEventListener("mousemove", (e) => {
      const rect = scene.getBoundingClientRect();
      magic.style.left = `${e.clientX - rect.left - half}px`;
      magic.style.top  = `${e.clientY - rect.top - half}px`;
    });
  });

  