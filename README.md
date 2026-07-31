# Briefing de Identidade Visual para Casamento

Projeto estático em HTML, CSS e JavaScript, pronto para publicar no GitHub Pages.

## Arquivos

- `index.html`: estrutura e perguntas do briefing
- `styles.css`: visual responsivo no tema claro
- `script.js`: etapas, validação, revisão, salvamento automático e envio

## Formspree

O formulário já está conectado ao endpoint:

```text
https://formspree.io/f/mbdnvrjj
```

Não é necessário backend próprio.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie os três arquivos para a raiz do repositório.
3. Abra **Settings → Pages**.
4. Em **Build and deployment**, selecione:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
5. Salve e aguarde o endereço do GitHub Pages aparecer.

## Teste recomendado

Após publicar:

1. Preencha o briefing com dados de teste.
2. Confirme se a resposta chegou ao painel/e-mail do Formspree.
3. Verifique o spam na primeira submissão.
4. Confirme o domínio no Formspree, caso o painel solicite.

## Personalização

No início de `styles.css`, edite as variáveis:

```css
:root {
  --paper: #f2f0eb;
  --ink: #0c0c0d;
  --muted: #77756e;
  --line: #d8d5cb;
}
```

O formulário usa:

- Bebas Neue
- Outfit
- DM Mono

As fontes são carregadas pelo Google Fonts.
