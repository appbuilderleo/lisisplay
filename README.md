# Lisis Play (Lisis Jogos)

> *"A diversão é estar juntos."*

Plataforma web progressiva (**PWA**) *mobile-first* de jogos sociais presenciais concebida para transformar 1 único smartphone num catalisador de conversa, movimento e gargalhadas em grupo — com **baralhos culturais moçambicanos e lusófonos** e funcionamento **100% offline** no **Modo Roda**.

## Jogos Incluídos

1. **Kiyumi (Mímica Rápida — 30 Segundos)**
   - **Modo Mímica / Palco** (vertical, 1 atua em segredo com gestos) e **Modo Descreve** (vertical, 1 explica por voz sem dizer palavras do ecrã).
   - Cronómetro de 30s exatos: cada acerto soma +1 ponto, abre logo a palavra seguinte e reinicia os 30s; passar mantém a contagem a correr; terminar com 0 acertos penaliza -1 ponto. Alerta sonoro e háptico nos últimos 5 segundos.
2. **O Impostor (Dedução Social — Modo Clássico)**
   - 3 a 10 jogadores editáveis, 1 ou 2 impostores (6+ jogadores), toggle de categoria opcional.
   - Distribuição anti-espreitadela, sorteio da primeira pista, cronómetro de debate (2:00 + pausar +30s), votação e **Última Cartada** (4 palavras do mesmo baralho).
3. **Zoe ("Quem na Roda?")**
   - Baralhos temáticos (*Amigos & Festas*, *No Trabalho / Escola*, *Situações Improváveis* e *Todos os Temas*) com contagem animada **3 · 2 · 1 · APONTEM!**.
4. **Cubo Mágico Digital (3D Interativo — 2×2 & 3×3)**
   - Motor 3D **Three.js (WebGL)** a 60fps: desliza numa peça para girar a camada ou arrasta fora para rodar a câmara 360°.
   - **Modo Solo**: cronómetro automático no 1.º toque (`00:00.0`), recorde pessoal (**PB**), média **Ao5** e histórico offline em `localStorage`.
   - **Modo Duelo (Sala)**: código de 4 letras + **QR Code**, seed determinística idêntica para todos, contagem sincronizada **3-2-1**, pódio ao vivo P2P (WebRTC) e fallback 100% offline por Código de Scramble.

## Stack Tecnológica

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS v4**
- **vite-plugin-pwa** (Workbox Service Worker + Web App Manifest)
- **Web Audio API** (efeitos sonoros 100% sintetizados sem ficheiros `.mp3`) + **Vibration API** + **Screen Wake Lock API**

## Executar Localmente

```bash
npm install
npm run dev
```

Para abrir no telemóvel na mesma rede Wi-Fi:

```bash
npm run dev -- --host
```

## Build de Produção (PWA)

```bash
npm run build
npm run preview
```
