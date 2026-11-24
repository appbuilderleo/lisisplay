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
    title: 'Kiyumi · Mímica 60s',
    tagline: 'Adrenalina pura: cada acerto reinicia o tempo para 60 segundos!',
    steps: [
      'Escolhe um baralho cultural moçambicano e o modo: Modo Testa (horizontal) ou Modo Palco (vertical).',
      'Modo Testa: segura o celular na testa virado para o grupo. O grupo faz mímica; inclina para baixo para marcar +1 ou para cima para passar (ou usa os botões táteis).',
      'Modo Palco: lê a palavra secreta e representa em pé para o grupo adivinhar antes dos 60 segundos acabarem.',
      'Cada vez que acertarem, o cronómetro reinicia imediatamente para 60s! Se passarem uma palavra, o tempo continua a contar.',
    ],
    tip: 'Nos últimos 5 segundos o cronómetro fica laranja e toca um tick acelerado para avisar a reta final.',
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
