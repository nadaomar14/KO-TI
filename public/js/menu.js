document.addEventListener("DOMContentLoaded", function () {
  const menuIcon = document.getElementById("menu-icon");
  const navMenu = document.getElementById("nav-menu");

  menuIcon.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });
});
