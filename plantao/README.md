# Passagem de plantão (app web)

App estático (PWA), sem backend. Mostra um cartão por leito para conferência médica na passagem de plantão.
Rascunho para conferência, não é registro clínico.

## Rodar localmente

    cd plantao && python3 -m http.server 8080   # abrir http://localhost:8080

Service worker e instalação como app exigem HTTPS ou `localhost`.

## Publicar (privado)

Cloudflare Pages servindo a pasta `plantao/`, protegido por Cloudflare Access (login por e-mail, só e-mails liberados):
- Build command: vazio. Output directory: `plantao`.
- Ativar a política de acesso do projeto (protege também os previews) e restringir aos e-mails da equipe.
- Não usar o GitHub Pages: fora do plano Enterprise o site é público.

## Privacidade

- Os arquivos importados (PDF/JSON) são lidos no navegador e não são enviados a nenhum servidor (CSP com `connect-src 'self'`).
- Só as observações digitadas ficam em `localStorage`, por origem dos dados e início da janela. Há botão para apagar.
- O pdf.js (3.11.174, Apache-2.0) está em `vendor/`, sem CDN.

## Estado

- Importação por JSON: pronta (formato na própria tela).
- Importação por PDF: extrai o texto. Montar os cartões a partir do PDF depende do layout do documento real.
- Ao mudar arquivos do app, aumentar `CACHE` em `sw.js`.
