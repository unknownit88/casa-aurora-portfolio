/* Assistente da Casa Aurora (demonstração): tira dúvidas, coleta os dados da gestante e encaminha à médica escolhida.
   Não dá orientação médica; sinais de alerta na gestação levam à maternidade/SAMU. Funciona sem servidor. */
(function () {
  const C = CONFIG, A = C.assistente.nome, esc = U.esc;
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const ALERTA = /(sangramento|sangrando|perda de liquido|perdendo liquido|bolsa rompeu|bolsa estourou|contracoes (fortes|regulares|seguidas)|bebe (nao|parou de) (mexe|mexer)|nao (sinto|esta mexendo)|dor forte|falta de ar|desmai|convuls|visao turva|dor de cabeca forte|emergencia|urgencia)/;

  document.body.insertAdjacentHTML('beforeend',
    '<button class="fab" id="fab" aria-label="Abrir assistente"><span class="fab-av-wrap"><img class="fab-av" src="assets/lina.jpg" alt="" width="34" height="34"><span class="ponto"></span></span>Conversar com a ' + esc(A) + '</button>' +
    '<section class="chat" id="chat" role="dialog" aria-label="Assistente da Casa Aurora" aria-hidden="true">' +
      '<div class="chat-topo"><img class="chat-av" src="assets/lina.jpg" alt="Foto de ' + esc(A) + '" width="46" height="46"><div><strong>' + esc(A) + '</strong><small>Assistente virtual da Casa Aurora</small></div><button class="chat-fechar" id="chatFechar" aria-label="Fechar">×</button></div>' +
      '<div class="chat-msgs" id="msgs" aria-live="polite"></div>' +
      '<div class="chips" id="chips"></div>' +
      '<form class="chat-form" id="cform"><input id="cin" type="text" maxlength="500" placeholder="Escreva aqui..." autocomplete="off" aria-label="Sua mensagem"><button aria-label="Enviar">➤</button></form>' +
      '<p class="chat-lgpd">Sou uma assistente virtual e não dou orientação médica. Demonstração: nada é enviado a ninguém.</p>' +
    '</section>');

  const $ = (id) => document.getElementById(id);
  const chat = $('chat'), msgs = $('msgs'), chips = $('chips'), cin = $('cin'), fab = $('fab');
  let passo = null, dados = {}, iniciou = false, ocupado = false, pre = null;
  const log = [];
  const medica = (id) => C.medicas.find((m) => m.id === id);
  const NOMES = C.medicas.map((m) => m.curto);

  function rolar() { msgs.scrollTop = msgs.scrollHeight; }
  function balao(txt, cls, html) {
    const d = document.createElement('div'); d.className = 'msg ' + cls;
    if (html) d.innerHTML = html; else d.textContent = txt;
    msgs.appendChild(d); rolar();
    log.push({ de: cls.indexOf('eu') === 0 ? 'eu' : 'bot', t: d.textContent.replace(/\s+/g, ' ').trim() });
  }
  function falar(txt, o) {
    o = o || {}; ocupado = true; chips.innerHTML = '';
    const t = document.createElement('div'); t.className = 'msg bot digitando'; t.innerHTML = '<i></i><i></i><i></i>';
    msgs.appendChild(t); rolar();
    return new Promise((ok) => setTimeout(() => {
      t.remove(); balao(txt, 'bot' + (o.alerta ? ' alerta' : ''), o.html); ocupado = false;
      if (o.chips) mostrarChips(o.chips);
      ok();
    }, Math.min(300 + txt.length * 8, 1100)));
  }
  function mostrarChips(l) {
    chips.innerHTML = '';
    l.forEach((c) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = c; b.addEventListener('click', () => entrada(c)); chips.appendChild(b); });
  }

  const MENU = ['Quero conversar com a equipe', 'Deixar um recado', 'Como funciona o atendimento', 'Quem pode contratar', 'Conhecer as médicas'];

  function abrir(id) {
    chat.classList.add('aberto'); chat.setAttribute('aria-hidden', 'false'); fab.classList.add('oculto');
    if (id && medica(id)) pre = id;
    if (!iniciou) {
      iniciou = true;
      falar('Oi, tudo bem? Eu sou a ' + A + ', assistente virtual da Casa Aurora. Estou aqui para ouvir você e ajudar no que precisar. 🌅')
        .then(() => pre ? iniciarContato()
          : falar('Posso tirar suas dúvidas e deixar o seu recado para a equipe. Por onde quer começar?', { chips: MENU }));
    } else if (pre && !passo) iniciarContato();
    setTimeout(() => cin.focus(), 350);
  }
  function fechar() { chat.classList.remove('aberto'); chat.setAttribute('aria-hidden', 'true'); fab.classList.remove('oculto'); }
  fab.addEventListener('click', () => abrir());
  $('chatFechar').addEventListener('click', fechar);
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-abrir-chat]'); if (b) abrir(b.dataset.abrirChat || null);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fechar(); });
  $('cform').addEventListener('submit', (e) => { e.preventDefault(); const v = cin.value.trim(); if (!v || ocupado) return; cin.value = ''; entrada(v); });

  function iniciarContato() {
    dados = {}; passo = 'nome';
    if (pre) { dados.medica = pre; const m = medica(pre); const antes = 'Que ótimo! Vou deixar seu contato para a ' + m.curto + '. '; pre = null; return falar(antes + 'Qual é o seu nome?'); }
    return falar('Vamos lá! Qual é o seu nome?');
  }

  function entrada(texto) {
    if (ocupado) return;
    balao(texto, 'eu'); chips.innerHTML = '';
    const n = norm(texto);

    if (ALERTA.test(n)) {
      return falar('Pelo que você descreveu, isso pode precisar de avaliação imediata. Não espere: procure a maternidade ou o pronto-socorro mais próximo agora, ou ligue 192 (SAMU).', { alerta: true, chips: passo ? ['Continuar', 'Voltar ao menu'] : ['Voltar ao menu'] });
    }
    if (n === 'voltar ao menu') { passo = null; return falar('Claro. Como posso ajudar?', { chips: MENU }); }
    if (n === 'continuar') return falar('Certo, vamos continuar.');
    if (passo) return fluxo(texto, n);

    if (/conversar com a equipe|deixar um recado|recado|agendar|marcar|consulta|plano de parto|quero (ser atendida|conversar|contratar)|pre natal|prenatal/.test(n) && !/valor|preco|convenio/.test(n)) return iniciarContato();
    if (n === 'conhecer as medicas') return falar('A equipe é formada por ' + C.medicas.map((m) => m.nome + ' (' + m.clinica + ')').join(', ') + '. Todas são ginecologistas e obstetras. Com qual você faz ou gostaria de fazer o pré-natal?', { chips: NOMES.concat(['Quero conversar com a equipe']) });
    const med = C.medicas.find((m) => n.includes(norm(m.nome.split(' ')[1])));
    if (med) return falar(med.nome + ' é ginecologista e obstetra e atende na ' + med.clinica + '. Quer deixar seu contato para ela?', { chips: ['Sim, quero', 'Voltar ao menu'] , });
    if (n === 'sim, quero') return iniciarContato();
    if (n === 'como funciona o atendimento') return falar(C.passos.map((p, i) => (i + 1) + '. ' + p.titulo).join('\n') + '\n\nQuer saber mais de algum passo ou falar com a equipe?', { chips: ['Quero conversar com a equipe', 'Voltar ao menu'] });
    if (n === 'quem pode contratar') return falar(C.faq[0].r, { chips: ['Quero conversar com a equipe', 'Voltar ao menu'] });

    const f = C.faq.find((x) => x.k.some((k) => n.includes(norm(k))));
    if (f) return falar(f.r, { chips: ['Quero conversar com a equipe', 'Voltar ao menu'] });
    if (/\b(oi|ola|bom dia|boa tarde|boa noite)\b/.test(n)) return falar('Olá! Em que posso ajudar?', { chips: MENU });
    if (/obrigad/.test(n)) return falar('Por nada! Estou por aqui se precisar. 🌅', { chips: MENU });
    return falar('Essa eu prefiro deixar para a equipe responder com carinho. Posso deixar o seu contato para uma de nós falar com você?', { chips: ['Quero conversar com a equipe', 'Voltar ao menu'] });
  }

  function fluxo(texto, n) {
    if (passo === 'nome') {
      if (texto.length < 2 || /\d/.test(texto)) return falar('Pode me dizer seu nome, por favor?');
      dados.nome = texto; passo = 'tel';
      return falar('Prazer, ' + texto.split(' ')[0] + '! Qual o seu WhatsApp com DDD? A equipe vai falar com você por lá.');
    }
    if (passo === 'tel') {
      const d = U.soDigitos(texto);
      if (d.length < 10 || d.length > 13) return falar('Não consegui entender o número. Envie com DDD, por exemplo 35 91234-5678.');
      dados.telefone = d; passo = 'situacao';
      return falar('Em que momento você está?', { chips: ['Estou gestante', 'Estou planejando engravidar', 'Outro assunto'] });
    }
    if (passo === 'situacao') {
      dados.situacao = texto;
      if (/gestante|gravida|gravidez/.test(n)) { passo = 'semanas'; return falar('Que momento especial! De quantas semanas você está, aproximadamente? Se souber, pode dizer a data provável do parto.', { chips: ['Não sei ainda'] }); }
      dados.semanas = ''; return perguntarMedica();
    }
    if (passo === 'semanas') { dados.semanas = texto; return perguntarMedica(); }
    if (passo === 'medica') {
      const m = C.medicas.find((x) => n.includes(norm(x.nome.split(' ')[1])));
      dados.medica = m ? m.id : ''; passo = 'duvida';
      return falar('Qual é o seu recado para a equipe? Pode ser uma dúvida ou o que você deseja para o parto.', { chips: ['Pular'] });
    }
    if (passo === 'duvida') {
      dados.duvida = /^pular$/.test(n) ? '' : texto; passo = 'confirma';
      const m = medica(dados.medica);
      return falar('Confira:\n\n• Nome: ' + dados.nome + '\n• WhatsApp: ' + dados.telefone + '\n• Momento: ' + dados.situacao + (dados.semanas ? '\n• Gestação: ' + dados.semanas : '') +
        '\n• Médica: ' + (m ? m.nome : 'a equipe indica') + (dados.duvida ? '\n• Recado: ' + dados.duvida : '') +
        '\n\nAo enviar, você autoriza a equipe a entrar em contato por WhatsApp.', { chips: ['Confirmar e enviar', 'Corrigir'] });
    }
    if (passo === 'confirma') {
      if (/corrig|nao|errad/.test(n)) { pre = dados.medica || null; return iniciarContato(); }
      if (/confirm|enviar|sim|ok/.test(n)) return enviar();
      return falar('Posso enviar o seu contato para a equipe?', { chips: ['Confirmar e enviar', 'Corrigir'] });
    }
  }
  function perguntarMedica() {
    if (dados.medica) { passo = 'duvida'; return falar('Qual é o seu recado para a equipe? Pode ser uma dúvida ou o que você deseja para o parto.', { chips: ['Pular'] }); }
    passo = 'medica';
    return falar('Com qual médica você faz ou gostaria de fazer o pré-natal?', { chips: NOMES.concat(['Ainda não sei']) });
  }

  function enviar() {
    const m = medica(dados.medica);
    DB.add('leads', { status: 'novo', origem: 'Assistente do site', nome: dados.nome, telefone: dados.telefone, situacao: dados.situacao, semanas: dados.semanas, medica: dados.medica, duvida: dados.duvida || '', conversa: log.slice(-60) });
    const msg = 'Olá! Sou ' + dados.nome + '. Deixei meu contato pelo site da Casa Aurora.\nMomento: ' + dados.situacao + (dados.semanas ? '\nGestação: ' + dados.semanas : '') + (dados.duvida ? '\nDúvida: ' + dados.duvida : '');
    const botao = (num, rot) => !num ? '<span class="btn btn-ouro btn-sm" style="opacity:.65;cursor:default">' + esc(rot) + ' (demonstração)</span>' : '<a class="btn btn-ouro btn-sm" target="_blank" rel="noopener" href="https://wa.me/' + esc(num) + '?text=' + encodeURIComponent(msg) + '">' + esc(rot) + '</a>';
    const alvo = m ? botao(m.whatsapp, 'WhatsApp da ' + m.curto)
      : C.marca.whatsappGeral ? botao(C.marca.whatsappGeral, 'WhatsApp da equipe')
      : botao('', 'WhatsApp da equipe');
    passo = null;
    return falar('Contato enviado, ' + dados.nome.split(' ')[0] + '! A equipe vai falar com você em breve.', {
      html: 'Contato enviado, <b>' + esc(dados.nome.split(' ')[0]) + '</b>! 🌅 A equipe vai falar com você em breve. Se quiser adiantar, chame pelo WhatsApp:' + alvo,
      chips: ['Voltar ao menu']
    });
  }
})();
