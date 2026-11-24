import { RulesTab } from '../types';

export interface RuleSection {
  id: RulesTab;
  title: string;
  tagline: string;
  steps: string[];
  tip: string;
}

export const RULES_CONTENT: Record<RulesTab, RuleSection> = {
  geral: {
    id: 'geral',
    title: 'Lisis Play · Modo Roda',
    tagline: 'Um único celular no centro do grupo. Zero internet depois de abrir.',
    steps: [
      'Escolham um dos 3 jogos presenciais: Kiyumi, O Impostor ou Zoe.',
      'No Modo Roda, apenas 1 celular passa de mão em mão ou vai à testa — todos os olhos ficam uns nos outros.',
      'Os botões principais ficam na parte inferior do ecrã para usar com apenas uma mão.',
      'Mantém o som ligado para ouvir os sinais de contagem, acerto e fim de ronda sem precisar de olhar para o ecrã.',
    ],
    tip: 'Podes instalar a Lisis Play no ecrã inicial do teu celular (PWA) para jogar offline em viagens, churrascos e festas.',
  },
  kiyumi: {
    id: 'kiyumi',
    title: 'Kiyumi · Mímica 30s',
    tagline: 'Energia máxima e zero tempos mortos em rondas de 30 segundos exatos.',
    steps: [
      'Escolhe um baralho cultural moçambicano e o modo vertical: Mímica / Palco ou Modo Descreve.',
      'Modo Mímica / Palco: 1 jogador vê a palavra em segredo e representa em pé com gestos enquanto o grupo tenta adivinhar em 30s.',
      'Modo Descreve: 1 jogador explica a palavra por voz com frases descritivas, sem dizer nenhuma palavra escrita no ecrã.',
      'Cada acerto soma +1 ponto e abre logo a palavra seguinte na mão do mesmo jogador. Quando os 30s terminam, passa o celular; com 0 acertos, perde 1 ponto (-1).',
    ],
    tip: 'Mantém o som ligado: há tick nos últimos 5 segundos, som de acerto, som de passagem, alarme final e vibração háptica.',
  },
  impostor: {
    id: 'impostor',
    title: 'O Impostor · Dedução',
    tagline: 'Blefe, pistas de 1 palavra e debate cara a cara na roda.',
    steps: [
      'Adiciona de 3 a 10 jogadores, escolhe o baralho e o número de impostores (1 ou 2 com 6+ jogadores).',
      'O celular passa por cada pessoa em segredo. Todos recebem a mesma Palavra Secreta, exceto o Impostor.',
      'Começando pelo jogador sorteado, cada um diz em voz alta apenas 1 palavra-pista ligada ao tema, sem revelar o segredo.',
      'Debatam e votem no suspeito! Se acusarem um inocente, o Impostor ganha. Se apanharem o Impostor, ele tem a Última Cartada para adivinhar a palavra entre 4 opções.',
    ],
    tip: 'Ativa "Mostrar categoria ao Impostor" se o grupo quiser rondas mais equilibradas e tensas.',
  },
  zoe: {
    id: 'zoe',
    title: 'Zoe · Quem na Roda?',
    tagline: 'Quebra-gelo imediato com votações a apontar ao mesmo tempo.',
    steps: [
      'Escolhe o baralho que combina com o momento: Amigos & Festas, No Trabalho/Escola ou Situações Improváveis.',
      'Lê a pergunta em voz alta para toda a roda.',
      'Carrega em "Contagem 3 · 2 · 1" — ao sinal de APONTEM!, todos apontam ao mesmo tempo para quem melhor combina com a frase.',
      'O mais apontado explica-se (ou defende-se!) antes de avançarem para a próxima carta.',
    ],
    tip: 'Regra de ouro do Zoe: ninguém pode apontar depois de ver para onde os outros apontaram!',
  },
};
