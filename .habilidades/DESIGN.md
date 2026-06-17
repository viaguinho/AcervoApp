# Acervo Bar App — Guia de Estilo e Design (Style Reference)
> Curadoria de Bebidas Finas e Coquetelaria Sob Medida. Um ecossistema estético limpo, minimalista e futurista (Estilo Líquido/Ferrofluido com base "White Ice"), projetado para destacar a sofisticação física e sensorial de cada garrafa.

**Tema:** Claro (Light / White Ice com detalhes em Mercúrio Metálico e Ferrofluido)

Este sistema estético projeta uma atmosfera de precisão silenciosa, requinte de boutique e serenidade tecnológica. O contraste elegante entre o fundo "gelo límpido" (White Ice) e o texto escuro, enriquecido com degradês metálicos que emulam mercúrio e ferrofluido, confere ao aplicativo uma sensação luxuosa de materialidade digital. As fontes clássicas e contemporâneas se unem em uma estrutura tipográfica limpa e equilibrada.

---

## 1. Tokens de Design — Cores

| Nome da Cor | Valor | Token CSS | Papel / Função |
| :--- | :--- | :--- | :--- |
| **White Ice** | `hsl(210, 20%, 98%)` | `---background` / `---white-ice` | Cor de fundo global e dominante. Cria um palco luminoso e limpo. |
| **Deep Charcoal** | `hsl(222, 47%, 11%)` | `---foreground` | Texto principal e elementos mais escuros da interface. Oferece alta legibilidade. |
| **Metallic Silver** | `hsl(210, 10%, 82%)` | `---primary` | Prata metálico suave usado para bordas selecionadas, anéis de foco e elementos secundários de marcação. |
| **Mercury Gradient** | `linear-gradient(90deg, #27272a, #52525b, #d4d4d8, #52525b, #27272a)` | `---mercury-gradient` | Degradê metálico animado que evoca o metal mercúrio. Destina-se a grandes tipografias, logotipos e títulos importantes. |
| **Sun Gradient** | `linear-gradient(90deg, #3B1F0A, #7C4A1E, #C8813A, #7C4A1E, #3B1F0A)` | `---sun-gradient` | Degradê solar/âmbar rico usado para itens especiais e categorias quentes (como whiskys e conhaques). |
| **Glass Background** | `rgba(255, 255, 255, 0.72)` | `---glass-bg` | Fundo de painéis e botões translúcidos (efeito vidro). |

---

## 2. Tokens de Design — Tipografia

A tipografia do Acervo Bar foi planejada para transmitir sofisticação, leveza e precisão. A combinação utiliza uma fonte grotesca geométrica de alta costura com um fallback universal extremamente legível.

### Famílias de Fontes (Font Families)
*   **Fonte Principal / Editorial:** `PP Neue Montreal` (Token: `--font-primary`). Alternativa comercial/editorial brutalista e geométrica suíça.
*   **Fonte Secundária / Fallback / Leitura:** `Inter` (Token: `--font-inter` / `--font-sans`). Fonte otimizada para telas e interfaces de alta performance, garantindo legibilidade excelente em tamanhos pequenos, perfis sensoriais e listas de ingredientes.

### Importação da Fonte (Google Fonts)
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
```

### Escala Tipográfica (Type Scale)
*   **Títulos Principais (Hero / Heading):** Tamanho `27px` (`--text-heading`), com peso extremamente leve (`350` / `light`) e espaçamento refinado para um visual contemporâneo.
*   **Destaques e Valores dinâmicos (Body LG):** Tamanho `18px` (`--text-body-lg`) com peso leve.
*   **Destaques de Modal / Preço (Body MD):** Tamanho `16px` (`--text-body-md`) com peso leve (`350` / `light`).
*   **Corpo de Texto (Body):** Tamanho `14px` (`--text-body`) com peso regular (`400`).
*   **Subtítulos de Seções / Tags / Legendas (Caption):** Tamanho `10px` (`--text-caption`) em caixa alta (uppercase), com peso médio (`500`) e espaçamento entre letras expandido (`letter-spacing: 0.4em`).

---

## 3. Componentes de Assinatura Visual (Signature Components)

### A. Botão Holográfico (Holographic Button)
*   **Aparência:** Botão com bordas luminosas e efeito de refração de luz dinâmico ao mover o mouse ou tocar.
*   **Papel:** Botão de chamada principal (CTA) de navegação para engajar o usuário logo no primeiro contato.

### B. Efeito Vidro Líquido (Apple Tahoe Liquid Glass Button)
*   **Aparência:** Botão arredondado com efeito de brilho vítreo e animação shimmer interna suave sobre o degradê Mercúrio.
*   **Papel:** Ação principal da tela de boas-vindas ("Entrar no Acervo" e "Confirmar idade").

### C. Carrossel 3D em Perspectiva (Perspective 3D Carousel)
*   **Aparência:** Apresentação tridimensional de garrafas especiais com rotação suave e profundidade interativa baseada em gestos ou toque.
*   **Papel:** Exibir a "Seleção Especial" (ex: uísques raros, conhaques) com o devido peso visual.

### D. Pilhas de Cartas Mutantes (Morphing Card Stack)
*   **Aparência:** Cartões interativos que se movem de forma fluida para categorizar os produtos, com suporte a cores e imagens dinâmicas e transições orgânicas de layout.
*   **Papel:** Apresentar as Categorias de forma lúdica, refinada e compacta.

### E. Efeito de Ferrofluido Vivo (Living Ferrofluid)
*   **Aparência:** Simulação biológica de fluidos magnéticos escuros e orgânicos que se movem de forma suave em segundo plano.
*   **Papel:** Fundo conceitual líquido opcional para reforçar o requinte tecnológico do aplicativo.

---

## 4. Diretrizes Estéticas (Do's & Don'ts)

### O que Fazer (Do)
*   **Manter o Fundo Límpido:** Priorizar fundos claros e translúcidos para valorizar a cor física de cada garrafa e o rótulo do produto.
*   **Preservar o Espaço Negativo:** Criar layouts respiráveis, com amplos espaçamentos verticais e margens limpas.
*   **Usar Itálicos Elegantes:** Utilizar o itálico da fonte `Bodoni Moda` para destacar a palavra "Acervo" e títulos de maior impacto visual.
*   **Aplicar Micro-Animações:** Manter transições suaves de brilho (shimmer), gradientes em movimento (`shine`) e rotações tridimensionais sutis.

### O que Evitar (Don't)
*   **Evitar Sombras Pesadas:** Não utilize sombras escuras ou opacas; prefira bordas finas e efeito de desfoque de fundo (backdrop-filter/glass).
*   **Evitar Cores Saturadas em excesso no Layout:** A interface deve ser monocromática/neutra (`White Ice`, `Charcoal` e `Silver`). As cores vibrantes devem vir exclusivamente das próprias garrafas e de seus líquidos.
*   **Evitar Fontes Comuns em Títulos:** Nunca utilize fontes básicas sem serifa para títulos principais; a sofisticação do Acervo depende do uso equilibrado da `Bodoni Moda`.
