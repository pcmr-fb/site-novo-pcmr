import {
  CarFront,
  House,
  HeartHandshake,
  Building2,
  HeartPulse,
  Plane,
  MessagesSquare,
} from "lucide-react";

export const insuranceOptions = [
  {
    id: "auto",
    name: "Seguro auto",
    short: "Seu caminho, mais tranquilo.",
    description:
      "Do trajeto de todos os dias à próxima viagem. Conheça opções de proteção para o seu veículo e para quem vai com você.",
    icon: CarFront,
    audience: "voce",
    coverage: [
      "Colisão, roubo e furto",
      "Danos a terceiros",
      "Assistência e serviços para o veículo",
    ],
    note: "As opções variam conforme o veículo, o perfil de utilização e o plano contratado.",
  },
  {
    id: "residencial",
    name: "Seguro residencial",
    short: "Seu lugar no mundo, protegido.",
    description:
      "Uma casa guarda muito mais que objetos. Encontre opções para cuidar do seu lar e da tranquilidade de quem vive nele.",
    icon: House,
    audience: "voce",
    coverage: [
      "Incêndio e danos elétricos",
      "Roubo de bens",
      "Assistência residencial",
    ],
    note: "Coberturas e assistências dependem das características do imóvel e do contrato.",
  },
  {
    id: "vida",
    name: "Seguro de vida",
    short: "Cuidado que vai além de você.",
    description:
      "Planejar também é uma forma de cuidar. Entenda as possibilidades de proteção financeira para você e para as pessoas que ama.",
    icon: HeartHandshake,
    audience: "voce",
    coverage: [
      "Proteção financeira para beneficiários",
      "Coberturas em caso de invalidez",
      "Opções de assistência familiar",
    ],
    note: "A contratação está sujeita à análise de risco, às condições e às carências do produto.",
  },
  {
    id: "empresarial",
    name: "Seguro empresarial",
    short: "Seu negócio merece ir mais longe.",
    description:
      "Cada negócio tem uma história e necessidades próprias. Explore soluções para proteger sua estrutura e apoiar a continuidade da sua operação.",
    icon: Building2,
    audience: "empresa",
    coverage: [
      "Proteção do imóvel e dos equipamentos",
      "Responsabilidade civil",
      "Coberturas para riscos da operação",
    ],
    note: "As condições dependem da atividade, da localização e dos riscos da empresa.",
  },
  {
    id: "saude",
    name: "Saúde e bem-estar",
    short: "Mais cuidado em cada fase.",
    description:
      "Conte o que você procura em um plano de saúde. Rede de atendimento, abrangência e necessidades da família ou da empresa entram nessa conversa.",
    icon: HeartPulse,
    audience: "ambos",
    coverage: [
      "Análise da rede de atendimento",
      "Opções para pessoas e empresas",
      "Orientação sobre abrangência e carências",
    ],
    note: "Disponibilidade sujeita à região, à elegibilidade e às regras da operadora.",
  },
  {
    id: "viagem",
    name: "Seguro viagem",
    short: "Novos destinos. Mais tranquilidade.",
    description:
      "Leve a proteção no roteiro. Entenda as opções de assistência para imprevistos durante sua viagem, no Brasil ou no exterior.",
    icon: Plane,
    audience: "voce",
    coverage: [
      "Despesas médicas durante a viagem",
      "Assistência em imprevistos",
      "Opções de proteção para bagagem",
    ],
    note: "Destinos, limites, exclusões e atividades cobertas variam conforme o plano.",
  },
] as const;

export const guidance = {
  id: "orientacao",
  name: "Quero uma orientação",
  icon: MessagesSquare,
} as const;
export type InsuranceId =
  (typeof insuranceOptions)[number]["id"] | "orientacao";
export const allOptions = [...insuranceOptions, guidance];

export const faqs = [
  {
    question: "Como funciona a cotação de um seguro?",
    answer:
      "Você conta o que deseja proteger e compartilha seus dados de contato. A partir dessas informações, é possível entender seu perfil e buscar opções adequadas. Preço, cobertura e condições são apresentados antes de qualquer contratação.",
  },
  {
    question: "Pedir uma cotação gera algum compromisso?",
    answer:
      "Não. Solicitar uma cotação não contrata um seguro nem gera cobrança. A decisão é sua, depois de conhecer a proposta, as coberturas, os limites e as condições.",
  },
  {
    question: "Já tenho seguro. Posso solicitar uma nova cotação?",
    answer:
      "Sim. Você pode pedir uma análise para a renovação ou conhecer outras opções. Informe no campo de observações que já possui um seguro e, se souber, a data de vencimento. Não cancele sua apólice antes de confirmar a vigência da nova cobertura.",
  },
  {
    question: "Qual é a diferença entre corretora e seguradora?",
    answer:
      "A corretora intermedeia a contratação e ajuda você a entender as alternativas. A seguradora é a empresa responsável por assumir os riscos previstos na apólice e analisar os eventos cobertos, conforme o contrato.",
  },
  {
    question: "Quando a proteção começa a valer?",
    answer:
      "A cobertura começa na data e no horário de vigência definidos na apólice, após a aceitação da proposta e o cumprimento das condições da seguradora. Enviar uma cotação não ativa uma cobertura.",
  },
];
