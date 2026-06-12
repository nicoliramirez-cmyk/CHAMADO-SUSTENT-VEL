# 🌿 Chamado Sustentável — Agrinho 2026
 Visão Geral do Projeto:
"Chamado Sustentável" é um jogo educativo 2D desenvolvido em p5.js que aborda o tema do Agrinho 2026: "Agro forte, futuro sustentável",
O jogo foi criado com uma estética de pixel art, utilizando exclusivamente formas geométricas básicas (rect(), line(), ellipse(), text()) para construir todos os elementos visuais, sem o uso de imagens externas ou geradas por IA.
O objetivo principal é engajar o jogador em uma narrativa interativa que destaca a importância das práticas sustentáveis no agronegócio, mostrando como o cuidado com os recursos naturais impacta diretamente a produção e o bem-estar da comunidade.

---
### Como Jogar
Inicie o jogo: Na tela inicial, o celular tocará. Clique em "ATENDER" para iniciar a jornada ou "IGNORAR" para ver as consequências de não agir.
Siga os tutoriais: Cada fase é precedida por um tutorial detalhado que explica os objetivos e controles específicos.
Interaja: Utilize o mouse e o teclado (setas e teclas E/ESPAÇO) para realizar as ações em cada fase.

---
### Estrutura do Jogo
O jogo é dividido em uma sequência de telas e fases, controladas por uma variável de estado (gameState):

phone: Tela inicial com o celular tocando, convidando o jogador a atender o "chamado".

ignore: Tela de aviso que mostra as consequências de ignorar o chamado da sustentabilidade.

tutorialX: Telas explicativas que introduzem cada fase, detalhando a temática, objetivos e controles.

fase1_agua: Foco na conservação da água. O jogador deve consertar vazamentos para garantir o uso eficiente da água na produção.

fase2_solo: Foco na saúde do solo. O jogador deve gerenciar tiles de solo (degradado, lavoura, nativo) para manter a fertilidade e a biodiversidade.

fase3_floresta: Foco na preservação da floresta e fauna. O jogador realiza missões como plantar árvores e proteger nascentes para manter o equilíbrio ecológico.

fase4campocidade: Foco na conexão campo-cidade e consumo consciente. O jogador deve entregar alimentos do campo para a cidade, evitando o desperdício.

final: Tela de encerramento com uma mensagem de celebração e os créditos do projeto.

---
### Características Principais

Pixel Art Puro: Todos os gráficos são desenhados programaticamente usando funções básicas do p5.js, reforçando o estilo retrô e a criatividade na construção visual.

Narrativa Engajadora: O jogo segue uma linha narrativa clara, conectando as ações do jogador aos princípios do agronegócio sustentável.

Mecânicas Diversificadas: Cada fase apresenta um desafio único com mecânicas de jogo distintas (movimentação de personagem, gerenciamento de tiles, arrastar e soltar, etc.).

Sons Interativos: Utiliza a Web Audio API para adicionar efeitos sonoros que enriquecem a experiência do usuário, como o toque do celular, sons de ações (consertar, plantar, entregar) e feedback de sucesso/falha.

Tutoriais Detalhados: Antes de cada fase, tutoriais explicam de forma clara o contexto, os objetivos e os controles, tornando o jogo acessível a todos.

Feedback Visual e Sonoro: Barras de progresso, mensagens na tela e efeitos sonoros fornecem feedback constante ao jogador sobre seu desempenho.

---
### Tecnologias Utilizadas
p5.js: Biblioteca JavaScript para programação criativa, utilizada para o desenvolvimento gráfico e interativo.

JavaScript (ES6+): Linguagem de programação principal.

Web Audio API: Para a geração e controle de todos os efeitos sonoros do jogo.

---
### Controles
Fase / Tela	Ação	Controle
Geral	Interagir com botões	CLIQUE do mouse
Fase 1	Mover personagem	Setas do teclado (↑ ↓ ← →)
Fase 1	Consertar vazamento	E ou ESPAÇO
Fase 2	Mudar tipo de solo	CLIQUE do mouse em um tile
Fase 3	Plantar árvore / Colocar cerca	CLIQUE do mouse na área indicada
Fase 4	Arrastar caixa de alimento	CLIQUE e ARRASTE com o mouse
