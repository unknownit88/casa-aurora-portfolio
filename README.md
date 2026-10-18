# Casa Aurora (projeto de portfólio)

Landing page e área da equipe para uma clínica **fictícia** de obstetrícia, criada como projeto de portfólio.
Clínica, médicas, contatos, perfis de Instagram e textos são inventados.

**Site no ar:** https://casa-aurora-portfolio.vercel.app

## O que tem
- **Landing responsiva** (HTML, CSS e JavaScript puros, sem build): topo, quem somos, diferenciais, como trabalhamos, equipe, bastidores, dúvidas e chamada final, com animações de entrada.
- **Assistente virtual "Lina"** (`js/assistant.js`): responde dúvidas, avisa sobre sinais de alerta (SAMU/maternidade), coleta o contato da gestante e salva como recado. Funciona sem servidor.
- **Área da equipe** (`painel.html`): agenda por semana e por mês (cores por médica), recados com a conversa completa e lembretes.
- **Banco de dados no navegador** (`js/db.js`, localStorage), com higienização de tudo que é lido ou importado. Para produção, trocar por um banco real mantendo a mesma interface.

## Segurança
- Política de segurança de conteúdo (CSP) estrita, `X-Frame-Options`, `Permissions-Policy` e demais cabeçalhos em `vercel.json`.
- Sem scripts inline, sem bibliotecas de terceiros e fontes hospedadas no próprio site.
- Todo conteúdo dinâmico é escapado antes de ir para a página.
- A área da equipe **não tem login**, porque é uma demonstração. Num uso real, ela precisa de autenticação e de um banco no servidor.

## Como rodar
```bash
python3 -m http.server 5193
```
Abra http://localhost:5193. Por ser um site estático, qualquer hospedagem de arquivos serve.

## Personalizar
Troque `js/config.js` (dados da clínica, médicas, textos e perguntas frequentes) e as imagens em `assets/`.

## Créditos e direitos
- O **código** está sob licença MIT (arquivo `LICENSE`).
- As **fotos das médicas** são de modelos e servem apenas para ilustrar. **Não estão cobertas pela licença MIT.** Antes de reutilizar o projeto, troque-as por imagens com direito de uso.
- A foto da assistente Lina foi gerada por IA.
- Fontes Fraunces e Nunito Sans: licença SIL OFL.
