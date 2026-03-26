# 💎 Crystal Depths

**Crystal Depths** is a high-octane 2D Metroidvania built from the ground up using **Vanilla JavaScript** and **HTML5 Canvas**. The project emphasizes fluid combat, precise platforming, and a unique procedural audio system.

![Crystal Depths Preview](file:///C:/Users/User/.gemini/antigravity/brain/ac7e28cd-26de-42a3-abdd-bd093f03d702/media__1774457355933.webp)

## 🌌 Visão Geral

Assuma o controle do **Hooded Crystal Wanderer** enquanto explora cavernas perigosas, coleta runas ancestrais e enfrenta guardiões imponentes. O jogo combina estética retrô com mecânicas modernas de combate.

## 🛠️ Arquitetura Técnica

O jogo foi construído sem dependências externas (Zero Frameworks), utilizando as APIs nativas do navegador para máxima performance.

### 📜 Estrutura do Código
*   **`index.html`**: Estrutura base, menus e elementos do HUD.
*   **`style.css`**: Estilização visual inspirada em cristais e filtros de profundidade.
*   **`engine.js`**: O "coração" técnico do jogo.
    *   **Sistema de Partículas**: Gerenciamento eficiente de fumaça, faíscas e explosões.
    *   **Câmera Dinâmica**: Interpolação (Lerp) suave e efeitos de *Screen Shake*.
    *   **Sintetizador Web Audio**: Geração de SFX procedural (8-bit) em tempo real, sem arquivos externos de áudio.
*   **`entities.js`**: Lógica de todos os atores.
    *   **AI de Inimigos**: Máquinas de estado para morcegos, golens e chefões.
    *   **Física do Jogador**: Coyote time, Jump buffering, Wall-slide e Dash com frames de invulnerabilidade.
*   **`maps.js`**: Definições geográficas e configurador de fases (tilesets, armadilhas e posicionamento).
*   **`game.js`**: Loop principal de jogo, gerenciamento de colisões, sistema de progressão e *Save/Load* (LocalStorage).

## 🔥 Principais Mecânicas

*   **Combate Responsivo**: O jogo utiliza *Hit-Stop* (pequenos congelamentos de quadro no impacto) para dar peso aos golpes.
*   **Lâmina de Cristal**: Um ataque de arco crescente com núcleo de luz e energia azul, perfeitamente espelhado.
*   **Modo Especial (Super)**: Acumule energia ao atacar para liberar um disparo massivo de luz.
*   **Progressão**: Sistema de coleta de runas mandatórias para abrir portais de saída em cada setor.

## 🚀 Como Executar

Não é necessário compilar ou instalar nada. Basta abrir o arquivo `index.html` em qualquer navegador moderno.

---

*Desenvolvido com foco em performance e precisão de controles.* 🎮✨
