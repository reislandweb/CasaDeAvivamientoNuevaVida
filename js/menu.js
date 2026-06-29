document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menuToggle');
  const navList = document.querySelector('.nav ul');

  if (!toggle || !navList) return;

  toggle.addEventListener('click', () => {
    navList.classList.toggle('open');
  });
});
