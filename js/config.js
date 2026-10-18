/* Casa Aurora: clínica FICTÍCIA criada para portfólio. Nomes, contatos, endereços e textos são inventados.
   Para um cliente real, troque só este arquivo (e as imagens em assets/). */
window.CONFIG = {
  marca: {
    nome: 'Casa Aurora',
    sub: 'Assistência ao Parto',
    equipe: 'Equipe Casa Aurora',
    // Vazio na demonstração: botões de contato abrem a assistente em vez de um WhatsApp real.
    whatsappGeral: ''
  },
  agenda: { inicio: '08:00', fim: '18:00' },
  assistente: { nome: 'Lina', inicial: 'L' },
  secretaria: { nome: 'a equipe' },
  // A ordem segue as fotos: 1ª no centro do grupo, 2ª à direita, 3ª à esquerda.
  medicas: [
    { id: 'luiza', cor: '#3f8f9a', nome: 'Dra. Luíza Valente', curto: 'Dra. Luíza', foto: 'assets/luiza.jpg', foto2: 'assets/luiza2.jpg', clinica: 'Centro Médico Orla', whatsapp: '', telefone: '', instagram: 'dra.luizavalente' },
    { id: 'marina', cor: '#c8336f', nome: 'Dra. Marina Castelo', curto: 'Dra. Marina', foto: 'assets/marina.jpg', foto2: 'assets/marina2.jpg', clinica: 'Clínica Vivere', whatsapp: '', telefone: '', instagram: 'dra.marinacastelo' },
    { id: 'helena', cor: '#8a6fb0', nome: 'Dra. Helena Brandão', curto: 'Dra. Helena', foto: 'assets/helena.jpg', foto2: 'assets/helena2.jpg', clinica: 'Espaço Serena', whatsapp: '', telefone: '', instagram: 'dra.helenabrandao' }
  ],

  cargo: 'Ginecologista e Obstetra',
  diferenciais: [
    { icone: 'sun', titulo: 'Parto respeitoso', texto: 'Valorizamos a fisiologia do parto e as escolhas de cada mulher, com segurança e evidência científica.' },
    { icone: 'users', titulo: 'Família no cuidado', texto: 'Você conhece a equipe desde o início, e o acompanhante e a família são bem-vindos em cada etapa.' },
    { icone: 'chat', titulo: 'Orientação na gestação', texto: 'Canal de orientação por mensagem ao longo da gestação, para tirar dúvidas sem esperar a próxima consulta.' },
    { icone: 'shield', titulo: 'Segurança na cirurgia', texto: 'Quando a cesárea é necessária, quem opera é uma das médicas que acompanhou você desde o pré-natal.' }
  ],
  passos: [
    { titulo: 'Pré-natal com uma de nós', texto: 'Atendemos gestantes que fazem o pré-natal com uma das três médicas. O vínculo é parte do cuidado.' },
    { titulo: 'Orientação durante a gestação', texto: 'Mensagens com a equipe para tirar dúvidas, entender os exames e decidir junto.' },
    { titulo: 'Encontro de preparação', texto: 'Perto do parto, uma conversa acolhedora com a enfermagem sobre as fases do parto e o que esperar.' },
    { titulo: 'O dia do nascimento', texto: 'Cada decisão é compartilhada, ao lado de quem você já conhece e em quem confia.' }
  ],
  faq: [
    { p: 'Quem pode ser atendida pela Casa Aurora?', r: 'Atendemos gestantes que fazem o pré-natal com uma das três médicas da equipe.', k: ['contratar', 'quem pode', 'pre natal', 'pré-natal', 'prenatal', 'pre-natal'] },
    { p: 'Como funciona a orientação na gestação?', r: 'Você conta com um canal de mensagens com a equipe durante toda a gestação, para tirar dúvidas entre as consultas.', k: ['orientacao', 'orientação', 'whatsapp', 'online', 'on-line', 'duvida', 'dúvida'] },
    { p: 'Vou conhecer a equipe antes do parto?', r: 'Sim. Você conhece as médicas desde o início e, perto do parto, há um encontro de preparação com a enfermagem.', k: ['conhecer', 'equipe', 'enfermagem', 'encontro'] },
    { p: 'Por que a mesma equipe faz o parto?', r: 'Porque o vínculo traz segurança. Quando a cesárea é necessária, quem opera é uma médica que já conhece a sua história.', k: ['mesma equipe', 'seguranca', 'segurança', 'cirurg', 'cesarea', 'cesárea'] },
    { p: 'Vocês fazem parto normal?', r: 'Sim. Valorizamos a fisiologia do parto e as suas escolhas, sempre com segurança e evidência científica.', k: ['humanizado', 'normal', 'fisiologia', 'plano de parto', 'respeitoso'] },
    { p: 'Qual o valor e quais convênios?', r: 'Valores e formas de atendimento são passados pela equipe no contato, conforme o seu caso.', k: ['valor', 'preço', 'preco', 'quanto', 'custa', 'convenio', 'convênio', 'plano de saude', 'plano de saúde'] }
  ]
};
