# Especificação de Propósito e Funcionalidades: Acervo Bar

Este documento serve como base técnica e de negócios para o desenvolvimento ou migração do site/aplicativo **Acervo Bar**. Ele detalha a proposta de valor, a precificação inovadora, os fluxos do usuário, as regras de negócios e a arquitetura técnica.

---

## 1. Visão Geral e Proposta de Valor

O **Acervo Bar** é uma plataforma digital exclusiva e de alto padrão (com estética voltada à coquetelaria premium) projetada para gerenciar e comercializar bebidas fracionadas de um bar pessoal.

O principal diferencial da plataforma é a **Precificação Dinâmica por Volumetria**, permitindo que garrafas abertas tenham seus valores reduzidos de forma proporcional ao volume de líquido restante, respeitando sempre um piso operacional de segurança.

### Diferenciais de Mercado:
*   **Volumetria Visual:** Mostrador gráfico interativo (estilo cápsula de mercúrio) indicando a porcentagem exata e os mililitros restantes em garrafas já abertas.
*   **Preços Justos e Dinâmicos:** Cálculo automatizado que repassa descontos para garrafas que já foram consumidas.
*   **Curadoria e Perfil Sensorial:** Busca e filtros avançados com base na origem geográfica, categoria e notas sensoriais (como amadeirado, cítrico, defumado, turfado, etc.).
*   **Experiência Exclusiva (Bar Secreto):** Design visual premium (glassmorphism, transições fluidas de fluidos, tipografia sofisticada e modo escuro/claro minimalista).

---

## 2. Regras de Negócio Core

### A. Verificação de Idade (Gatekeeper)
*   **Regra:** O acesso ao aplicativo é estritamente restrito a maiores de 18 anos.
*   **Funcionamento:** Na primeira visita, o usuário é bloqueado por uma tela de verificação onde deve inserir Dia, Mês e Ano de nascimento. Apenas se tiver $\ge 18$ anos, o token `age_verified` é gravado no `localStorage` e o acesso é liberado.

### B. O Modelo de Precificação Dinâmica (Garrafas Abertas)
Para evitar prejuízos na venda de frações de garrafas, o cálculo do preço final de um item aberto segue a seguinte fórmula:

1.  **Preço Proporcional:**
    $$\text{Preço Proporcional} = \text{Preço Garrafa Cheia} \times \left( \frac{\text{Volume Atual (ml)}}{\text{Volume Total (ml)}} \right)$$

2.  **Piso de Segurança:**
    $$\text{Piso de Segurança} = \frac{\text{Custo Operacional Fixo}}{1 - \text{Margem Mínima}}$$
    *   *Valores Padrão:* Custo Operacional = R$ 15,00 (manuseio, higienização, embalagem); Margem Mínima = 20% (0,20). Piso resultante padrão = R$ 18,75.

3.  **Preço Final:**
    $$\text{Preço Final} = \max(\text{Preço Proporcional}, \text{Piso de Segurança})$$

4.  **Viabilidade de Preço:**
    Se o preço cheio de uma garrafa for menor que o piso de segurança calculável, a garrafa não pode ser vendida aberta.

5.  **Status Crítico:**
    Se o volume atual restante for $\le 10\%$ da capacidade total, o produto é sinalizado como nível crítico (última dose).

---

## 3. Funcionalidades do Aplicativo (Escopo do Produto)

### 3.1. Landing Page (Entrada e Onboarding)
*   **Verificação de Idade:** Formulário minimalista de data de nascimento com foco automático entre os inputs (DD/MM/AAAA).
*   **Upload de Logotipo Customizado:** Opção para o administrador ou dono do bar carregar uma imagem localmente (salva no `localStorage` como Base64) para personalizar o branding do site.
*   **Onboarding Fluido:** Carousel de slides introduzindo o conceito de curadoria, sofisticação e a volumetria justa de preços.

### 3.2. Catálogo e Busca Inteligente
*   **Filtros de Categorias:** Navegação rápida por categorias ordenadas:
    *   *Licor, Whisky, Gin, Rum, Tequila, Vodka, Bitter/Aperitivo, Cachaça, Cognac/Brandy, Amaro, Vermouth, Mezcal, Pisco, etc.*
*   **Filtros Avançados (Sensoriais e Especiais):**
    *   Filtro por Rótulos Especiais (`is_special`).
    *   Filtro por Garrafas Lacradas (`is_closed`).
    *   Filtro por Notas Sensoriais: *Amadeirado, Cítrico, Mel, Defumado, Floral, Frutado, Herbáceo, Especiarias, Chocolate, Caramelo, Baunilha, Marítimo, Terroso, Tropical, Turfado, Nozes, Mentolado, Picante*.
*   **Busca por Voz integrada:** Permite que o usuário fale o nome da bebida ou notas desejadas, convertendo voz em texto em tempo real (utilizando Web Speech API).

### 3.3. Página de Detalhe do Produto
*   **Visualização 3D e Anel de Órbita:** Exibição da garrafa flutuando com efeito de sombra e anel brilhante na cor correspondente ao líquido da bebida.
*   **Indicador de Nível Física Dinâmica (Gauge):** Mostrador vertical interativo para garrafas abertas que exibe a porcentagem exata restante e calcula os mililitros disponíveis em tempo real.
*   **Destaque do Desconto:** Se o produto tiver desconto devido ao consumo parcial, o percentual é destacado em um selo holográfico premium.
*   **Menu de Ações Flutuantes (Share):** Integração para compartilhamento rápido do link do produto via WhatsApp, E-mail ou cópia direta do link para a área de transferência.

### 3.4. Sacola (Bag) e Checkout
*   **Lista de Rótulos Selecionados:** Itens adicionados para compra ou consumo.
*   **Cálculo Somatório Inteligente:** Soma os preços dinâmicos recalculados individualmente de cada garrafa selecionada.
*   **Finalização via WhatsApp:** Envia um resumo formatado com os produtos e valores diretamente para o WhatsApp do administrador do bar para fechar o pedido.

### 3.5. Painel Administrativo (Gerenciador do Acervo)
*   **Cadastro e Edição de Bebidas:**
    *   Nome, Categoria, País de Origem, Preço de Garrafa Cheia (R$), Volume Total (ml).
    *   Seletor de Notas Sensoriais (Múltipla Escolha).
    *   Interruptor "Garrafa Aberta" com controle deslizante do nível de abertura (0-100%).
    *   Seletor de cor do líquido (para renderização visual do anel e do gauge no front-end).
*   **Editor Visual "Draggable":** Acesso administrativo para reposicionar as coordenadas $(x, y)$ da categoria ou do gauge de volumetria arrastando os elementos diretamente na tela, persistindo os valores no backend.

---

## 4. Arquitetura de Dados Conceitual

Abaixo está a representação conceitual do modelo `Product` que sustenta o ecossistema do aplicativo:

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | String | Identificador único da bebida |
| `name` | String | Nome do rótulo (ex: *Woodford Reserve Kentucky Bourbon*) |
| `category` | String | Categoria (ex: *Whisky*, *Gin*, *Amaro*) |
| `price` | Number | Preço cheio para garrafa lacrada / 100% cheia |
| `volume` | String | Volume nominal da garrafa (ex: *750ml*, *1000ml*) |
| `country` | String | País de origem da bebida (ex: *Estados Unidos*, *Escócia*) |
| `image_url` | String | URL ou caminho da imagem com fundo transparente |
| `color` | String | Cor hexadecimal do líquido (ex: *#B45309* para Âmbar) |
| `sensory_profile` | Array[String] | Notas sensoriais associadas ao sabor e aroma |
| `is_opened` | Boolean | Sinaliza se a garrafa está aberta e sujeita a preço volumétrico |
| `opening_level` | Number | Porcentagem de líquido restante de 0 a 100 |
| `is_special` | Boolean | Se é um rótulo premium ou de edição limitada |
| `cost_operating` | Number (Opt) | Custo fixo operacional específico do produto |
| `margin_min` | Number (Opt) | Margem mínima específica do produto |
| `category_x` / `category_y` | Number | Posição horizontal/vertical salva para o título no detalhe |
| `drop_x` / `drop_y` | Number | Posição horizontal/vertical salva para o indicador de líquido |

---

## 5. Próximos Passos recomendados para o Novo Site

1.  **Refatoração Visual:** Expandir o design system atual implementando microinterações fluidas na transição de categorias.
2.  **Persistência Offline:** Habilitar suporte a PWA (Progressive Web App) para que o dono do bar possa consultar o catálogo e a volumetria das garrafas sem sinal de internet.
3.  **Módulo de Drinks:** Permitir a criação de receitas associando quais garrafas do acervo são utilizadas para a produção de cada coquetel, reduzindo a volumetria automaticamente conforme o drink é servido.
