(function () {
  const C = CONFIG, esc = U.esc;
  const $ = (s) => document.querySelector(s);

  document.querySelectorAll('[data-cfg]').forEach((el) => { el.textContent = C.assistente.nome; });

  const ic = {
    sun: '<path d="M5 17a7 7 0 0 1 14 0"/><path d="M12 4v3M4.500 8.500l2 2M19.500 8.500l-2 2M2 17h20M5 21h14"/>',
    flor: '<path d="M12 20c-4 0-7-2.500-8-6 2.500 0 4.500 1 6 2.500M12 20c4 0 7-2.500 8-6-2.500 0-4.500 1-6 2.500M12 20c-3-2-4-5-4-8 0-2 1-4 4-7 3 3 4 5 4 7 0 3-1 6-4 8z"/>',
    users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.300"/><path d="M3 20c0-3.500 2.500-6 6-6s6 2.500 6 6M15 14.500c3 0 6 1.500 6 5.500"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.500h8M8 12.500h5"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z"/><path d="M8.500 12l2.500 2.500 4.500-5"/>'
  };
  const svg = (k) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ic[k] || ic.sun) + '</svg>';

  $('#diferenciaisGrade').innerHTML = C.diferenciais.map((d) =>
    '<article class="cartao">' + svg(d.icone) + '<h3>' + esc(d.titulo) + '</h3><p>' + esc(d.texto) + '</p></article>').join('');
  $('#passos').innerHTML = C.passos.map((p) => '<li class="reveal"><h3>' + esc(p.titulo) + '</h3><p>' + esc(p.texto) + '</p></li>').join('');
  $('#equipeGrade').innerHTML = C.medicas.map((m) =>
    '<article class="medica reveal"><div class="medica-foto"><img src="' + esc(m.foto) + '" alt="' + esc(m.nome) + '" loading="lazy" width="700" height="985">' + (m.foto2 ? '<img class="alt" src="' + esc(m.foto2) + '" alt="" loading="lazy" width="700" height="985">' : '') + '</div>' +
    '<div class="medica-info"><h3>' + esc(m.nome) + '</h3><p class="cargo">' + esc(C.cargo) + '</p><p class="clinica">' + esc(m.clinica) + '</p>' +
    '<div class="medica-acoes"><button class="btn btn-terra btn-sm" data-abrir-chat="' + esc(m.id) + '">Quero ser atendida por ela</button>' +
    (m.instagram ? '<a class="btn btn-linha-escura btn-sm btn-ig" href="#" data-ig="@' + esc(m.instagram) + '" aria-label="Instagram de ' + esc(m.nome) + ' (perfil fictício)"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.300" cy="6.700" r=".8"/></svg>@' + esc(m.instagram) + '</a>' : '') +
    '</div></div></article>').join('');

  // um botão de Instagram por médica sob a foto do trio (ordem da foto: Helena, Luíza, Marina)
  const igTrio = document.getElementById('igTrio');
  if (igTrio) {
    igTrio.innerHTML = ['helena', 'luiza', 'marina'].map((id) => C.medicas.find((x) => x.id === id)).filter((m) => m && m.instagram).map((m) =>
      '<div class="ig-item"><span class="ig-nome">' + esc(m.curto) + '</span><a class="btn btn-linha-escura btn-sm btn-ig" href="#" data-ig="@' + esc(m.instagram) + '" aria-label="Instagram de ' + esc(m.nome) + ' (perfil fictício)"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.300" cy="6.700" r=".8"/></svg>@' + esc(m.instagram) + '</a></div>').join('');
  }

  // perfis fictícios: o botão mostra um aviso em vez de abrir o Instagram
  let aviso;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-ig]'); if (!a) return; e.preventDefault();
    if (!aviso) { aviso = document.createElement('div'); aviso.className = 'aviso-ig'; aviso.setAttribute('role', 'status'); document.body.appendChild(aviso); }
    aviso.textContent = a.dataset.ig + ' é um perfil fictício deste projeto de portfólio.'; aviso.classList.add('on');
    clearTimeout(aviso._t); aviso._t = setTimeout(() => aviso.classList.remove('on'), 3200);
  });
  $('#faq').innerHTML = C.faq.map((f, i) =>
    '<div><button aria-expanded="false" aria-controls="f' + i + '">' + esc(f.p) + '</button><p id="f' + i + '">' + esc(f.r) + '</p></div>').join('');

  $('#faq').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const aberto = b.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('#faq button').forEach((x) => x.setAttribute('aria-expanded', 'false'));
    b.setAttribute('aria-expanded', String(!aberto));
  });

  const burger = $('#burger'), menu = $('#menu');
  burger.addEventListener('click', () => { const a = menu.classList.toggle('aberto'); burger.setAttribute('aria-expanded', String(a)); });
  menu.addEventListener('click', (e) => { if (e.target.tagName === 'A') { menu.classList.remove('aberto'); burger.setAttribute('aria-expanded', 'false'); } });
  const topo = $('#topo');
  const onScroll = () => topo.classList.toggle('rolou', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  document.querySelectorAll('.hero .reveal').forEach((e, i) => setTimeout(() => e.classList.add('vis'), 80 + i * 160));
  const alvos = document.querySelectorAll('.reveal, .grade .cartao');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) {
        const irmaos = e.target.parentNode ? Array.from(e.target.parentNode.children) : [];
        setTimeout(() => e.target.classList.add('vis'), (e.target.closest('.grade,.equipe,.passos') ? irmaos.indexOf(e.target) * 110 : 0));
        io.unobserve(e.target);
      }
    }), { threshold: 0.12 });
    alvos.forEach((a) => io.observe(a));
  } else alvos.forEach((a) => a.classList.add('vis'));
})();
