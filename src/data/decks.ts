import { WordDeck, ZoeDeck } from '../types';

/**
 * Baralhos Culturais Moçambicanos e Lusófonos
 * Utilizados em Kiyumi (Mímica 30s) e O Impostor (Dedução Social)
 */
export const WORD_DECKS: WordDeck[] = [
  {
    id: 'vida-em-maputo',
    name: 'Vida em Maputo',
    subtitle: 'Ruas, transportes e o dia a dia urbano',
    badge: 'Maputo',
    words: [
      'Chapa 100',
      'Txopela',
      'Mercado do Peixe',
      'Avenida Marginal',
      'Baixa de Maputo',
      'Ponte Maputo-Katembe',
      'M-Pesa',
      'Carregamento',
      'Engarrafamento',
      'Cobrador de Chapa',
      'Praça dos Trabalhadores',
      'Estação dos CFM',
      'Feira de Artesanato',
      'Xipamanine',
      'Semáforo Avariado',
      'Corte de Energia',
      'Recarga de Credelec',
      'Polícia de Trânsito',
      'My Love (Transporte)',
      'Costa do Sol',
    ],
  },
  {
    id: 'culinaria-nossa',
    name: 'Culinária Nossa',
    subtitle: 'Sabores da nossa mesa e petiscos de rua',
    badge: 'Sabores',
    words: [
      'Matapa',
      'Xima',
      'Frango à Zambeziana',
      'Badjia',
      'Mucapata',
      'Pão com Ovo',
      'Caril de Caranguejo',
      'Sumo de Malambe',
      'Camarão Grelhado',
      'Xiguinha',
      'Mandioca Cozida',
      'Amendoim Torrado',
      'Rissóis de Camarão',
      'Maçaroca Assada',
      'Chá de Capim-Limão',
      'Bolo Polana',
      'Piri-Piri',
      'Peixe Grelhado',
      'Sura',
      'Arroz de Coco',
    ],
  },
  {
    id: 'cultura-musica',
    name: 'Cultura & Música',
    subtitle: 'Ritmos, danças, artistas e identidade',
    badge: 'Ritmos',
    words: [
      'Marrabenta',
      'Pandza',
      'Timbila',
      'Capulana',
      'Azagaia',
      'Lizha James',
      'Mussiro',
      'Xigubo',
      'Stewart Sukuma',
      'Dama do Bling',
      'Tufo',
      'Makwayela',
      'Ilha de Moçambique',
      'Lobolo',
      'Xitique',
      'Mapiko',
      'Malangatana',
      'Mia Couto',
      'Trança Africana',
      'Tocar Batuque',
    ],
  },
  {
    id: 'desporto-lazer',
    name: 'Desporto & Lazer',
    subtitle: 'Estádios, praia, jogos e fins de semana',
    badge: 'Lazer',
    words: [
      'Mambas',
      'Estádio do Zimpeto',
      'Praia da Macaneta',
      'Penálti',
      'Churrasco no Quintal',
      'Praia do Tofo',
      'Ponta do Ouro',
      'Jogar Ntxuva',
      'Saltar à Corda',
      'Futebol de Rua',
      'Maria de Lurdes Mutola',
      'Bilene',
      'Bazaruto',
      'Cartão Vermelho',
      'Festa de Quintal',
      'Dançar na Piscina',
      'Jogar Damas',
      'Piquenique na Praia',
      'Correr na Marginal',
      'Golo no Último Minuto',
    ],
  },
];

export const MIXED_WORD_DECK_ID = 'mistura-total';

export function getDeckWords(deckId: string): { name: string; words: string[] } {
  if (deckId === MIXED_WORD_DECK_ID) {
    return {
      name: 'Mistura Total',
      words: WORD_DECKS.flatMap((d) => d.words),
    };
  }
  const found = WORD_DECKS.find((d) => d.id === deckId) ?? WORD_DECKS[0];
  return { name: found.name, words: [...found.words] };
}

/**
 * Baralhos de Perguntas do Zoe ("Quem na Roda?")
 */
export const ZOE_DECKS: ZoeDeck[] = [
  {
    id: 'amigos-festas',
    name: 'Amigos & Festas',
    subtitle: 'Risos garantidos em churrascos, salas e encontros',
    badge: 'Festa',
    questions: [
      'Quem na roda demoraria 2 horas para se arrumar só para ir à esquina?',
      'Quem na roda chegaria atrasado ao próprio casamento?',
      'Quem na roda diz "já estou a sair" quando ainda está de toalha?',
      'Quem na roda é o primeiro a puxar Marrabenta quando a música começa?',
      'Quem na roda desaparece da festa sem se despedir de ninguém?',
      'Quem na roda come sempre mais no churrasco do quintal e ainda leva marmita?',
      'Quem na roda gasta o saldo de dados todo em vídeos antes do meio-dia?',
      'Quem na roda nunca divide a conta sem sacar primeiro a calculadora?',
      'Quem na roda adormece no sofá enquanto toda a gente ainda está a conversar?',
      'Quem na roda manda áudios de 5 minutos para dizer algo de 5 segundos?',
      'Quem na roda tira 40 fotos até gostar de uma única selfie?',
      'Quem na roda sabe sempre das fofocas do bairro antes de chegarem ao grupo?',
      'Quem na roda promete pagar a próxima rodada e "esquece" o PIN do M-Pesa?',
      'Quem na roda chora a ver telenovela ou filme romântico?',
      'Quem na roda canta mais alto no carro mesmo errando a letra toda?',
      'Quem na roda seria capaz de ir à Praia da Macaneta só para comer peixe?',
      'Quem na roda fica 3 dias sem responder no WhatsApp mas está sempre online?',
      'Quem na roda faz drama quando acaba a bateria do celular?',
      'Quem na roda inventa uma desculpa criativa para não ir ao ginásio?',
      'Quem na roda acaba sempre por organizar o xitique do grupo?',
    ],
  },
  {
    id: 'trabalho-escola',
    name: 'No Trabalho / Escola',
    subtitle: 'Prazos, reuniões, intervalos e clássicos do dia a dia',
    badge: 'Rotina',
    questions: [
      'Quem na roda entrega o trabalho exatamente 1 minuto antes do prazo?',
      'Quem na roda finge que está a tomar notas na reunião mas está a pensar no almoço?',
      'Quem na roda chega sempre com o cabelo molhado na primeira aula ou reunião?',
      'Quem na roda pergunta "isso vai sair no teste?" antes mesmo de a aula começar?',
      'Quem na roda organiza um grupo de estudo que acaba em conversa e badjia?',
      'Quem na roda tem sempre 57 separadores abertos no navegador?',
      'Quem na roda acena com a cabeça na reunião sem ter percebido nada?',
      'Quem na roda nunca tem uma caneta mas pede sempre emprestada e não devolve?',
      'Quem na roda fica famoso por responder "recebido, obrigado" em 2 segundos?',
      'Quem na roda já culpou o engarrafamento da Marginal sem sequer ter saído de casa?',
      'Quem na roda transforma qualquer pausa de café numa conversa de 45 minutos?',
      'Quem na roda se oferece para apresentar o trabalho sem ter lido os slides?',
      'Quem na roda tem o despertador a tocar de 5 em 5 minutos desde as 5h30?',
      'Quem na roda resolve qualquer problema no computador reiniciando tudo?',
      'Quem na roda esquece o carregador em casa no dia mais longo da semana?',
      'Quem na roda vira chefe do grupo assim que começa um projeto em equipa?',
      'Quem na roda faz amizade até com o segurança e a senhora da cantina?',
      'Quem na roda conta os minutos para sexta-feira logo na terça de manhã?',
      'Quem na roda manda mensagem no grupo errado e apaga em pânico?',
      'Quem na roda sobrevive à semana inteira à base de pão com ovo e café?',
    ],
  },
  {
    id: 'situacoes-improvaveis',
    name: 'Situações Improváveis',
    subtitle: 'Cenários malucos, sobrevivência e dilemas divertidos',
    badge: 'Caos',
    questions: [
      'Quem na roda sobreviveria menos tempo sem internet nem rede móvel?',
      'Quem na roda ficaria amigo de um extraterrestre em menos de 10 minutos?',
      'Quem na roda perder-se-ia mesmo com o GPS ligado em voz alta?',
      'Quem na roda negociaria o preço até num supermercado de preços fixos?',
      'Quem na roda ganharia a lotaria e ainda assim reclamaria do preço do chapa?',
      'Quem na roda seria o primeiro a entrar num reality show e sair na primeira semana?',
      'Quem na roda tentaria cozinhar matapa num concurso internacional sem receita?',
      'Quem na roda sobreviveria melhor numa ilha deserta só com uma capulana e fósforos?',
      'Quem na roda ficaria viral na internet sem querer por causa de uma queda engraçada?',
      'Quem na roda compraria uma passagem para o destino errado sem reparar?',
      'Quem na roda aceitaria comer um prato cheio de piri-piri por 500 meticais?',
      'Quem na roda falaria sozinho em voz alta se ficasse preso num elevador?',
      'Quem na roda viraria presidente do bairro em menos de um mês?',
      'Quem na roda adotaria 7 gatos e ainda daria nome de jogadores dos Mambas a todos?',
      'Quem na roda tentaria consertar uma avaria elétrica vendo um vídeo de 30 segundos?',
      'Quem na roda esqueceria o passaporte já na fila do aeroporto?',
      'Quem na roda convenceria um polícia de trânsito a sorrir no meio de uma multa?',
      'Quem na roda gastaria um milhão em 24 horas comprando coisas desnecessárias?',
      'Quem na roda riria no momento mais sério possível sem conseguir parar?',
      'Quem na roda criaria uma teoria da conspiração quando falha a luz no bairro?',
    ],
  },
];

export const ALL_ZOE_DECK_ID = 'zoe-todos';

export function getZoeQuestions(deckId: string): { name: string; questions: string[] } {
  if (deckId === ALL_ZOE_DECK_ID) {
    return {
      name: 'Todos os Temas',
      questions: ZOE_DECKS.flatMap((d) => d.questions),
    };
  }
  const found = ZOE_DECKS.find((d) => d.id === deckId) ?? ZOE_DECKS[0];
  return { name: found.name, questions: [...found.questions] };
}
