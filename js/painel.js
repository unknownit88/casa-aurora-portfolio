(function () {
  const C = CONFIG, esc = U.esc;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const med = (id) => C.medicas.find((m) => m.id === id);
  const medNome = (id) => (med(id) ? med(id).curto : 'Equipe');
  const medCor = (id) => (med(id) ? med(id).cor : '#8a8a8a');
  const hhmm = (s) => (s || '').slice(0, 5);
  const agoraISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
  const dt = (iso) => new Date(iso + 'T12:00:00');
  const iso = (d) => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10); };
  const iniSemana = (i) => U.somaDias(i, -((dt(i).getDay() + 6) % 7)); // segunda-feira
  function somaMeses(i, n) {
    const d = dt(i), dia = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n);
    const ult = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); d.setDate(Math.min(dia, ult)); return iso(d);
  }

  let dia = U.hojeISO(), visao = 'semana', fMedica = '', filtro = 'novo';

  const opcoes = (vazio) => (vazio ? '<option value="">' + vazio + '</option>' : '') + C.medicas.map((m) => '<option value="' + m.id + '">' + esc(m.nome) + '</option>').join('');
  $('#filtroMedica').innerHTML = opcoes('Todas as médicas');
  $('#selMedica').innerHTML = opcoes();
  $('#legenda').innerHTML = C.medicas.map((m) => '<span><i style="background:' + m.cor + '"></i>' + esc(m.curto) + '</span>').join('');
  $('#filtroMedica').addEventListener('change', (e) => { fMedica = e.target.value; agenda(); });

  /* ---------- abas ---------- */
  function aba(nome) {
    $$('.abas button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.aba === nome)));
    $$('.aba').forEach((s) => { s.hidden = s.id !== 'aba-' + nome; });
  }
  $$('.abas button').forEach((b) => b.addEventListener('click', () => aba(b.dataset.aba)));

  /* ---------- resumo ---------- */
  function resumo() {
    const hoje = U.hojeISO();
    const ag = DB.list('agenda').filter((a) => a.data === hoje && a.status !== 'cancelada');
    const recs = DB.list('leads').filter((l) => l.status === 'novo');
    const lembs = DB.list('lembretes').filter((l) => !l.feito);
    const atras = lembs.filter((l) => l.data + 'T' + l.hora <= agoraISO());
    $('#resumo').innerHTML =
      '<div><strong>' + ag.length + '</strong><span>consultas hoje</span></div>' +
      '<div><strong>' + recs.length + '</strong><span>recados novos</span></div>' +
      '<div><strong>' + lembs.length + '</strong><span>lembretes abertos</span></div>' +
      '<div><strong>' + atras.length + '</strong><span>lembretes vencidos</span></div>';
    const nr = $('#nRec'), nb = $('#nLemb');
    nr.hidden = !recs.length; nr.textContent = recs.length;
    nb.hidden = !atras.length; nb.textContent = atras.length;
  }

  /* ---------- agenda: visões ---------- */
  const doAgenda = () => DB.list('agenda').filter((a) => a.status !== 'cancelada' && (!fMedica || a.medica === fMedica));
  const chip = (a) => '<span class="chip" role="button" tabindex="0" data-id=\"' + esc(a.id) + '\" style="--c:' + medCor(a.medica) + '" title="' + esc(a.paciente + ' · ' + medNome(a.medica)) + '">' + esc(hhmm(a.hora)) + ' ' + esc(String(a.paciente).split(' ')[0]) + '</span>';
  const NOMES_DIA = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

  function visaoSemana() {
    const ini = iniSemana(dia), fim = U.somaDias(ini, 6), hoje = U.hojeISO();
    $('#rotulo').textContent = dt(ini).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) + ' – ' + dt(fim).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
    const dias = [0, 1, 2, 3, 4, 5, 6].map((i) => U.somaDias(ini, i));
    const todos = doAgenda().filter((a) => a.data >= ini && a.data <= fim);
    let h0 = parseInt(C.agenda.inicio, 10), h1 = parseInt(C.agenda.fim, 10) - 1;
    todos.forEach((a) => { const h = parseInt(a.hora, 10); if (h < h0) h0 = h; if (h > h1) h1 = h; });
    let html = '<div class="sem"><div class="sem-cab"></div>' + dias.map((d, i) =>
      '<button class="sem-cab dia ' + (d === hoje ? 'hoje ' : '') + (d === dia ? 'sel' : '') + '" data-d="' + d + '">' + NOMES_DIA[i] + '<strong>' + d.slice(8) + '</strong></button>').join('');
    for (let h = h0; h <= h1; h++) {
      html += '<div class="sem-hora">' + String(h).padStart(2, '0') + ':00</div>' + dias.map((d) =>
        '<div class="sem-cel ' + (d === dia ? 'sel' : '') + '" data-d="' + d + '" data-h="' + h + '">' +
        todos.filter((a) => a.data === d && parseInt(a.hora, 10) === h).sort((a, b) => a.hora.localeCompare(b.hora)).map(chip).join('') + '</div>').join('');
    }
    $('#visao').innerHTML = html + '</div>';
  }

  function visaoMes() {
    const primeiro = dia.slice(0, 8) + '01', hoje = U.hojeISO(), mes = dia.slice(0, 7);
    $('#rotulo').textContent = dt(primeiro).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const ini = iniSemana(primeiro), todos = doAgenda();
    const ult = new Date(dt(primeiro).getFullYear(), dt(primeiro).getMonth() + 1, 0).getDate();
    const semanas = Math.ceil((((dt(primeiro).getDay() + 6) % 7) + ult) / 7);
    let html = '<div class="mes">' + NOMES_DIA.map((n) => '<div class="mes-cab">' + n + '</div>').join('');
    for (let i = 0; i < semanas * 7; i++) {
      const d = U.somaDias(ini, i), lista = todos.filter((a) => a.data === d).sort((a, b) => a.hora.localeCompare(b.hora));
      html += '<div class="mes-cel ' + (d.slice(0, 7) !== mes ? 'fora ' : '') + (d === hoje ? 'hoje ' : '') + (d === dia ? 'sel' : '') + '" data-d="' + d + '"><b>' + Number(d.slice(8)) + '</b>' +
        lista.slice(0, 2).map(chip).join('') + (lista.length > 2 ? '<small>+' + (lista.length - 2) + ' mais</small>' : '') + '</div>';
    }
    $('#visao').innerHTML = html + '</div>';
  }

  function agenda() {
    $$('.visoes button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === visao)));
    visao === 'semana' ? visaoSemana() : visaoMes();
    $('#titDia').textContent = dt(dia).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    const lista = doAgenda().concat(DB.list('agenda').filter((a) => a.status === 'cancelada' && a.data === dia && (!fMedica || a.medica === fMedica)))
      .filter((a) => a.data === dia).sort((a, b) => a.hora.localeCompare(b.hora));
    $('#listaAgenda').innerHTML = lista.length ? lista.map((a) =>
      '<article class="item ' + (a.status === 'realizada' || a.status === 'cancelada' ? 'feito' : '') + '" style="border-left:5px solid ' + medCor(a.medica) + '"><div class="hora">' + esc(hhmm(a.hora)) + '</div>' +
      '<div><h4>' + esc(a.paciente) + '<span class="tag ' + esc(a.status) + '">' + esc(a.status) + '</span></h4><p>' + esc(medNome(a.medica)) + ' · ' + esc(a.tipo) + (a.obs ? ' · ' + esc(a.obs) : '') + '</p></div>' +
      '<div class="acoes">' +
        (a.telefone ? '<a target="_blank" rel="noopener" href="' + esc(U.wa(a.telefone, 'Olá, ' + a.paciente.split(' ')[0] + '! Confirmando sua consulta com a ' + medNome(a.medica) + ' em ' + U.dataBR(a.data) + ' às ' + hhmm(a.hora) + '. Pode confirmar?')) + '">Confirmar no WhatsApp</a>' : '') +
        (a.status === 'agendada' ? '<button data-ac="confirmar" data-id=\"' + esc(a.id) + '\">Marcar confirmada</button>' : '') +
        '<button data-ac="editar" data-id=\"' + esc(a.id) + '\">Editar</button><button data-ac="excluir" data-id=\"' + esc(a.id) + '\">Excluir</button></div></article>').join('')
      : '<div class="vazio">Nenhuma consulta neste dia.</div>';
  }

  $$('.visoes button').forEach((b) => b.addEventListener('click', () => { visao = b.dataset.v; agenda(); }));
  $('#navAnt').onclick = () => { dia = visao === 'semana' ? U.somaDias(dia, -7) : somaMeses(dia, -1); agenda(); };
  $('#navProx').onclick = () => { dia = visao === 'semana' ? U.somaDias(dia, 7) : somaMeses(dia, 1); agenda(); };
  $('#navHoje').onclick = () => { dia = U.hojeISO(); agenda(); };

  $('#visao').addEventListener('click', (e) => {
    const c = e.target.closest('.chip');
    if (c) { const a = DB.list('agenda').find((x) => x.id === c.dataset.id); if (a) abrirCons(a); return; }
    const cab = e.target.closest('.sem-cab.dia'); if (cab) { dia = cab.dataset.d; agenda(); return; }
    const cel = e.target.closest('[data-d]'); if (!cel) return;
    dia = cel.dataset.d;
    if (cel.dataset.h) { agenda(); abrirCons({ data: dia, hora: String(cel.dataset.h).padStart(2, '0') + ':00' }); } else agenda();
  });
  $('#visao').addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('chip')) { e.preventDefault(); e.target.click(); } });

  $('#listaAgenda').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-ac]'); if (!b) return;
    const a = DB.list('agenda').find((x) => x.id === b.dataset.id); if (!a) return;
    if (b.dataset.ac === 'editar') abrirCons(a);
    if (b.dataset.ac === 'confirmar') DB.update('agenda', a.id, { status: 'confirmada' });
    if (b.dataset.ac === 'excluir' && confirm('Excluir a consulta de ' + a.paciente + '?')) DB.remove('agenda', a.id);
  });

  /* ---------- modal de consulta ---------- */
  const modal = $('#modal'), form = $('#formCons');
  function abrirCons(a) {
    a = a || {};
    form.reset(); $('#erroCons').hidden = true;
    $('#modalTit').textContent = a.id ? 'Editar consulta' : 'Nova consulta';
    ['id', 'leadId', 'paciente', 'telefone', 'data', 'hora', 'medica', 'tipo', 'status', 'obs'].forEach((k) => {
      if (form.elements[k]) form.elements[k].value = a[k] != null ? a[k] : (k === 'data' ? dia : k === 'status' ? 'agendada' : k === 'medica' ? (fMedica || C.medicas[0].id) : '');
    });
    form.elements.lembrar.checked = !a.id;
    modal.hidden = false; form.elements.paciente.focus();
  }
  $('#novaConsulta').onclick = () => abrirCons();
  $('#cancelaCons').onclick = () => { modal.hidden = true; };
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.hidden = true; });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form).entries());
    const conflito = DB.list('agenda').find((a) => a.id !== f.id && a.medica === f.medica && a.data === f.data && a.hora === f.hora && a.status !== 'cancelada');
    if (conflito && f.status !== 'cancelada') { const er = $('#erroCons'); er.textContent = 'Já existe consulta às ' + f.hora + ' neste dia (' + conflito.paciente + ') para ' + medNome(f.medica) + '.'; er.hidden = false; return; }
    const dados = { paciente: f.paciente.trim(), telefone: f.telefone.trim(), data: f.data, hora: f.hora, medica: f.medica, tipo: f.tipo, status: f.status, obs: f.obs.trim() };
    if (f.id) DB.update('agenda', f.id, dados);
    else {
      DB.add('agenda', dados);
      if (f.leadId) DB.update('leads', f.leadId, { status: 'agendado' });
      if (f.lembrar) DB.add('lembretes', { texto: 'Confirmar consulta de ' + dados.paciente + ' (' + U.dataBR(dados.data) + ' às ' + dados.hora + ')', data: U.somaDias(dados.data, -1), hora: '09:00', telefone: dados.telefone, feito: false });
    }
    dia = f.data; modal.hidden = true; toast('Consulta salva.');
  });

  /* ---------- recados (vindos da assistente) ---------- */
  const ST = { novo: 'Novo', contatado: 'Respondido', agendado: 'Agendado', descartado: 'Arquivado' };
  const FILTROS = [['novo', 'Novos'], ['contatado', 'Respondidos'], ['agendado', 'Agendados'], ['descartado', 'Arquivados'], ['todos', 'Todos']];
  function recados() {
    const todos = DB.list('leads');
    $('#filtroRec').innerHTML = FILTROS.map((s) => '<button data-f="' + s[0] + '" class="' + (filtro === s[0] ? 'sel' : '') + '">' + s[1] + ' (' + (s[0] === 'todos' ? todos.length : todos.filter((l) => l.status === s[0]).length) + ')</button>').join('');
    const l = todos.filter((x) => filtro === 'todos' || x.status === filtro);
    $('#listaRec').innerHTML = l.length ? l.map((x) => {
      const conv = (x.conversa || []).map((m) => '<div class="bolha ' + (m.de === 'eu' ? 'eu' : 'bot') + '">' + esc(m.t) + '</div>').join('');
      return '<article class="recado" style="border-left:5px solid ' + medCor(x.medica) + '"><div class="recado-topo"><h4>' + esc(x.nome) + '<span class="tag ' + esc(x.status) + '">' + ST[x.status] + '</span></h4>' +
        '<time>' + new Date(x.criado).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) + '</time></div>' +
        '<p class="meta">' + esc(x.situacao || '') + (x.semanas ? ' · ' + esc(x.semanas) : '') + ' · Preferência: ' + esc(medNome(x.medica)) + ' · ' + esc(x.telefone) + '</p>' +
        '<blockquote>' + (x.duvida ? esc(x.duvida) : '<em>Sem recado escrito.</em>') + '</blockquote>' +
        (conv ? '<details><summary>Ver conversa com a assistente (' + x.conversa.length + ' mensagens)</summary><div class="conversa">' + conv + '</div></details>' : '') +
        '<div class="acoes"><a target="_blank" rel="noopener" data-ac="contatar" data-id=\"' + esc(x.id) + '\" href="' + esc(U.wa(x.telefone, 'Olá, ' + x.nome.split(' ')[0] + '! Aqui é da Casa Aurora. Recebemos o seu recado pelo site e vamos cuidar de você. Podemos conversar?')) + '">Responder no WhatsApp</a>' +
        '<button data-ac="agendar" data-id=\"' + esc(x.id) + '\">Agendar consulta</button><button data-ac="descartar" data-id=\"' + esc(x.id) + '\">Arquivar</button><button data-ac="excluir" data-id=\"' + esc(x.id) + '\">Excluir</button></div></article>';
    }).join('') : '<div class="vazio">Nenhum recado aqui. Os recados deixados na conversa com a assistente do site aparecem nesta lista.</div>';
  }
  $('#filtroRec').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { filtro = b.dataset.f; recados(); } });
  $('#listaRec').addEventListener('click', (e) => {
    const el = e.target.closest('[data-ac]'); if (!el) return;
    const x = DB.list('leads').find((l) => l.id === el.dataset.id); if (!x) return;
    if (el.dataset.ac === 'contatar' && x.status === 'novo') DB.update('leads', x.id, { status: 'contatado' });
    if (el.dataset.ac === 'agendar') { aba('agenda'); abrirCons({ paciente: x.nome, telefone: x.telefone, medica: x.medica || '', tipo: 'Pré-natal', obs: [x.situacao, x.semanas].filter(Boolean).join(' · '), leadId: x.id }); }
    if (el.dataset.ac === 'descartar') DB.update('leads', x.id, { status: 'descartado' });
    if (el.dataset.ac === 'excluir' && confirm('Excluir o recado de ' + x.nome + '?')) DB.remove('leads', x.id);
  });

  /* ---------- lembretes ---------- */
  function lembretes() {
    const l = DB.list('lembretes').sort((a, b) => (a.feito - b.feito) || (a.data + a.hora).localeCompare(b.data + b.hora));
    const agora = agoraISO();
    $('#listaLemb').innerHTML = l.length ? l.map((x) => {
      const atraso = !x.feito && x.data + 'T' + x.hora <= agora;
      return '<article class="item ' + (x.feito ? 'feito' : atraso ? 'atraso' : '') + '"><input type="checkbox" data-ac="feito" data-id=\"' + esc(x.id) + '\" ' + (x.feito ? 'checked' : '') + ' aria-label="Concluir" style="width:22px;height:22px">' +
        '<div><h4 style="' + (x.feito ? 'text-decoration:line-through' : '') + '">' + esc(x.texto) + (atraso ? '<span class="tag faltou">vencido</span>' : '') + '</h4><p>' + esc(U.dataBR(x.data)) + ' às ' + esc(x.hora) + '</p></div>' +
        '<div class="acoes">' + (x.telefone ? '<a target="_blank" rel="noopener" href="' + esc(U.wa(x.telefone)) + '">WhatsApp</a>' : '') + '<button data-ac="excluir" data-id=\"' + esc(x.id) + '\">Excluir</button></div></article>';
    }).join('') : '<div class="vazio">Nenhum lembrete. Ao agendar uma consulta, um lembrete de confirmação é criado sozinho.</div>';
    $('#notifInfo').innerHTML = ('Notification' in window && Notification.permission === 'default')
      ? 'Quer ser avisada com o painel aberto? <a href="#" id="pedeNotif">Ativar avisos</a>.' : 'Os lembretes avisam na tela quando vencem, com o painel aberto.';
  }
  $('#formLemb').addEventListener('submit', (e) => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target).entries());
    DB.add('lembretes', { texto: f.texto.trim(), data: f.data, hora: f.hora, feito: false }); e.target.reset(); $('#formLemb').elements.data.value = U.hojeISO();
  });
  $('#listaLemb').addEventListener('click', (e) => {
    const el = e.target.closest('[data-ac]'); if (!el) return;
    if (el.dataset.ac === 'feito') DB.update('lembretes', el.dataset.id, { feito: el.checked });
    if (el.dataset.ac === 'excluir') DB.remove('lembretes', el.dataset.id);
  });
  document.addEventListener('click', (e) => { if (e.target.id === 'pedeNotif') { e.preventDefault(); Notification.requestPermission().then(lembretes); } });

  function verificarVencidos() {
    const agora = agoraISO();
    DB.list('lembretes').forEach((x) => {
      if (!x.feito && !x.avisado && x.data + 'T' + x.hora <= agora) {
        DB.update('lembretes', x.id, { avisado: true });
        toast('Lembrete: ' + x.texto, 'lemb');
        if ('Notification' in window && Notification.permission === 'granted') new Notification('Lembrete', { body: x.texto });
      }
    });
  }

  /* ---------- dados ---------- */
  function toast(t, cls) {
    const d = document.createElement('div'); d.className = 'toast ' + (cls || ''); d.textContent = t;
    $('#toasts').appendChild(d); setTimeout(() => d.remove(), 6000);
  }
  const dlg = $('#modalDados');
  $('#btnDados').onclick = () => { dlg.hidden = false; };
  $('#fechaDados').onclick = () => { dlg.hidden = true; };
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.hidden = true; });
  $('#btnExp').onclick = () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([DB.exportar()], { type: 'application/json' }));
    a.download = 'backup-casa-aurora-' + U.hojeISO() + '.json'; a.click(); URL.revokeObjectURL(a.href);
  };
  $('#fileImp').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((t) => { if (confirm('Isso substitui os dados atuais. Continuar?')) { DB.importar(t); toast('Backup restaurado.'); dlg.hidden = true; } })
      .catch(() => toast('Arquivo inválido.')); e.target.value = '';
  });
  $('#btnLimpa').onclick = () => { if (confirm('Apagar todas as consultas, recados e lembretes deste navegador?')) { DB.limpar(); dlg.hidden = true; } };
  $('#btnDemo').onclick = () => {
    const h = U.hojeISO(), seg = iniSemana(h);
    [['Maria Souza', '35 98888-1111', h, '09:00', 'marina', 'Pré-natal', 'confirmada'], ['Joana Pereira', '35 97777-2222', h, '10:30', 'luiza', 'Encontro pré-parto', 'agendada'],
      ['Ana Lima', '35 96666-3333', U.somaDias(h, 1), '14:00', 'helena', 'Retorno', 'agendada'], ['Bruna Alves', '35 95555-4444', U.somaDias(seg, 2), '11:00', 'marina', 'Pré-natal', 'agendada'],
      ['Camila Rocha', '35 94444-5555', U.somaDias(seg, 3), '15:00', 'luiza', 'Consultoria', 'confirmada'], ['Fernanda Dias', '35 93333-6666', U.somaDias(h, 9), '09:00', 'helena', 'Pré-natal', 'agendada']]
      .forEach((a) => DB.add('agenda', { paciente: a[0], telefone: a[1], data: a[2], hora: a[3], medica: a[4], tipo: a[5], status: a[6], obs: '' }));
    DB.add('leads', { nome: 'Carla Mendes', telefone: '35955554444', situacao: 'Estou gestante', semanas: '28 semanas', medica: 'helena', duvida: 'Quero um parto respeitoso e entender como funciona a consultoria pelo WhatsApp.', status: 'novo', origem: 'Assistente do site',
      conversa: [{ de: 'bot', t: 'Oi, tudo bem? Eu sou a Lina, assistente virtual da Casa Aurora.' }, { de: 'eu', t: 'Quero conversar com a equipe' }, { de: 'bot', t: 'Vamos lá! Qual é o seu nome?' }, { de: 'eu', t: 'Carla Mendes' }, { de: 'bot', t: 'Em que momento você está?' }, { de: 'eu', t: 'Estou gestante' }] });
    DB.add('lembretes', { texto: 'Enviar orientações do encontro pré-parto para Joana Pereira', data: h, hora: '08:00', feito: false });
    dlg.hidden = true; toast('Dados de exemplo carregados.');
  };

  function tudo() { resumo(); agenda(); recados(); lembretes(); }
  window.addEventListener('db:change', tudo);
  window.addEventListener('storage', tudo);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { modal.hidden = true; dlg.hidden = true; } });
  $('#formLemb').elements.data.value = U.hojeISO();
  try { if (!localStorage.getItem('fm_demo_done') && !DB.list('agenda').length && !DB.list('leads').length) { localStorage.setItem('fm_demo_done', '1'); $('#btnDemo').onclick(); $('#toasts').innerHTML = ''; } } catch (e) {}
  tudo(); verificarVencidos(); setInterval(() => { verificarVencidos(); resumo(); }, 30000);
})();
