document.addEventListener('DOMContentLoaded', () => {
  const posts = document.querySelectorAll('.post');
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modal-content');
  const closeBtn = document.getElementById('close');

  posts.forEach(p => {
    p.addEventListener('click', () => {
      fetch(`/posts/${p.dataset.id}`)
        .then(res => res.text())
        .then(html => {
          modalContent.innerHTML = html;
          modal.style.display = 'flex';
        });
    });
  });

  posts.forEach(p => {
    p.style.position = "relative";
    p.onmousedown = function(e) {
      const offsetX = e.clientX - p.offsetLeft;
      const offsetY = e.clientY - p.offsetTop;
      function move(ev) {
        p.style.left = ev.clientX - offsetX + "px";
        p.style.top = ev.clientY - offsetY + "px";
      }
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", move);
      }, { once: true });
    };
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    modalContent.innerHTML = '';
  });
});
