# Passagem de plantão (app web)

App estático (PWA), sem backend. Mostra um cartão por leito para conferência médica na passagem de plantão.
Rascunho para conferência, não é registro clínico.

## Rodar localmente

    cd plantao && python3 -m http.server 8080   # abrir http://localhost:8080

Service worker e instalação como app exigem HTTPS ou `localhost`.

## Publicar (privado)

Cloudflare Pages servindo a pasta `plantao/`, protegido por Cloudflare Access (login por e-mail, só e-mails liberados):
- Fluxo de Workers: build command vazio, deploy command `npx wrangler deploy`, raiz `/`. O `wrangler.jsonc` na raiz do repo aponta para a pasta `plantao/` (há outro dentro de `plantao/`, para o caso de a raiz do build ser essa pasta).
- Ativar a política de acesso do projeto (protege também os previews) e restringir aos e-mails da equipe.
- Não usar o GitHub Pages: fora do plano Enterprise o site é público.

## Privacidade

- Os arquivos importados (PDF/JSON) são lidos no navegador e não são enviados a nenhum servidor (CSP com `connect-src 'self'`).
- Só as observações digitadas ficam em `localStorage`, por origem dos dados e início da janela. Há botão para apagar.
- O pdf.js (3.11.174, Apache-2.0) está em `vendor/`, sem CDN.

## Estado

- Importação do PDF "Balanço Hídrico" (um ou vários leitos, uma página por leito): pronta. Lê o texto embutido e atribui cada valor à coluna de hora pela posição. A janela é ajustada para 07:00 a 07:00 da data do PDF.
- O PDF não traz peso, data de internação nem resumo do caso. O peso é digitado em cada cartão (guardado só neste navegador).
- Conferências automáticas: soma de cada linha contra o total do PDF, ganhos menos perdas contra o balanço, e PAD maior que PAS.
- Medicações: o PDF traz só volumes de infusão, não dose nem antibiótico administrado. As linhas ficam como "volume registrado".
- Evacuação: o significado de "-" e "0" não consta no PDF; só "+", "++" e "+++" são tratados como evacuação.
- Importação por JSON: pronta (formato na própria tela).
- Ao mudar arquivos do app, aumentar `CACHE` em `sw.js`.
- Não colocar PDFs de pacientes neste repositório.
