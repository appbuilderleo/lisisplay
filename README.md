# Lisis Play (Lisis Jogos)

> *"A diversão é estar juntos."*

Plataforma web progressiva (**PWA**) *mobile-first* de jogos sociais presenciais concebida para transformar 1 único smartphone num catalisador de conversa, movimento e gargalhadas em grupo — com **baralhos culturais moçambicanos e lusófonos** e funcionamento **100% offline** no **Modo Roda**.

## Jogos Incluídos

1. **Kiyumi (Mímica Rápida — 60 Segundos)**
   - **Modo Testa** (inclinação via `DeviceOrientationEvent` + botões táteis grandes de fallback) e **Modo Palco**.
   - Cronómetro de 60s que reinicia a cada resposta certa (e continua a contar ao passar), com alerta visual e sonoro nos últimos 5 segundos.
2. **O Impostor (Dedução Social — Modo Clássico)**
   - 3 a 10 jogadores editáveis, 1 ou 2 impostores (6+ jogadores), toggle de categoria opcional.
   - Distribuição anti-espreitadela, sorteio da primeira pista, cronómetro de debate (2:00 + pausar +30s), votação e **Última Cartada** (4 palavras do mesmo baralho).
3. **Zoe ("Quem na Roda?")**
   - Baralhos temáticos (*Amigos & Festas*, *No Trabalho / Escola*, *Situações Improváveis* e *Todos os Temas*) com contagem animada **3 · 2 · 1 · APONTEM!**.

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
