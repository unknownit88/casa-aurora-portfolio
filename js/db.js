/* Mini banco de dados no navegador (localStorage) com coleções: leads, agenda, lembretes.
   Para produção, trocar por Supabase mantendo esta mesma interface. */
(function () {
  const mem = {};
  const key = (c) => 'fm_' + c;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const STATUS = { leads: ['novo', 'contatado', 'agendado', 'descartado'], agenda: ['agendada', 'confirmada', 'realizada', 'faltou', 'cancelada'] };
  const MEDICAS = (window.CONFIG && CONFIG.medicas ? CONFIG.medicas : []).map((m) => m.id);
  const txt = (v, n) => String(v == null ? '' : v).slice(0, n || 400);
  // Tudo que vem do armazenamento (ou de um backup importado) é tratado como não confiável.
  function limpar(c, x) {
    if (!x || typeof x !== 'object' || Array.isArray(x)) return null;
    const o = {};
    Object.keys(x).slice(0, 30).forEach((k) => {
      if (!/^[A-Za-z_][A-Za-z0-9_]{0,29}$/.test(k)) return;
      const v = x[k];
      if (k === 'conversa') o.conversa = Array.isArray(v) ? v.slice(-80).map((m) => ({ de: m && m.de === 'eu' ? 'eu' : 'bot', t: txt(m && m.t, 600) })) : [];
      else if (typeof v === 'boolean' || (typeof v === 'number' && isFinite(v))) o[k] = v;
      else o[k] = txt(v, k === 'obs' || k === 'duvida' || k === 'texto' ? 600 : 160);
    });
    o.id = txt(o.id, 40).replace(/[^A-Za-z0-9_-]/g, '') || uid();
    if (STATUS[c] && STATUS[c].indexOf(o.status) < 0) o.status = STATUS[c][0];
    if (o.medica && MEDICAS.indexOf(o.medica) < 0) o.medica = '';
    return o;
  }
  function read(c) {
    let bruto;
    try { bruto = JSON.parse(localStorage.getItem(key(c))); } catch (e) { bruto = mem[c]; }
    return (Array.isArray(bruto) ? bruto : []).slice(0, 5000).map((x) => limpar(c, x)).filter(Boolean);
  }
  function write(c, v) {
    try { localStorage.setItem(key(c), JSON.stringify(v)); } catch (e) { mem[c] = v; }
    window.dispatchEvent(new CustomEvent('db:change', { detail: c }));
  }

  window.DB = {
    list: read,
    add(c, item) {
      const novo = Object.assign({ id: uid(), criado: new Date().toISOString() }, item);
      write(c, [novo].concat(read(c)));
      return novo;
    },
    update(c, id, patch) {
      write(c, read(c).map((x) => (x.id === id ? Object.assign({}, x, patch) : x)));
    },
    remove(c, id) { write(c, read(c).filter((x) => x.id !== id)); },
    exportar() {
      return JSON.stringify({ leads: read('leads'), agenda: read('agenda'), lembretes: read('lembretes') }, null, 2);
    },
    importar(texto) {
      if (typeof texto !== 'string' || texto.length > 2000000) throw new Error('arquivo grande demais');
      const d = JSON.parse(texto);
      if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('formato inválido');
      ['leads', 'agenda', 'lembretes'].forEach((c) => {
        if (Array.isArray(d[c])) write(c, d[c].slice(0, 5000).map((x) => limpar(c, x)).filter(Boolean));
      });
    },
    limpar() { ['leads', 'agenda', 'lembretes'].forEach((c) => write(c, [])); }
  };

  window.U = {
    esc: (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])),
    hojeISO() { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); },
    somaDias(iso, n) { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); },
    dataBR(iso) { return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }); },
    soDigitos: (s) => String(s || '').replace(/\D/g, ''),
    wa(tel, msg) {
      let n = U.soDigitos(tel); if (n.length <= 11) n = '55' + n;
      return 'https://wa.me/' + n + (msg ? '?text=' + encodeURIComponent(msg) : '');
    }
  };
})();
