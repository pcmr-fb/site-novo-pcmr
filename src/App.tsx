import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  Menu,
  X,
  ShieldCheck,
  HeartHandshake,
  Check,
  Plus,
  Minus,
  MoveUpRight,
  MessagesSquare,
  Fingerprint,
  Compass,
  ChevronRight,
} from "lucide-react";
import { insuranceOptions, faqs, type InsuranceId } from "./data";
import { Modal } from "./Modal";
import QuoteForm from "./QuoteForm";
import { standalonePreview } from "./preview";

function Brand({ light = false }: { light?: boolean }) {
  return (
    <a
      className={`brand ${light ? "brand-light" : ""}`}
      href="#inicio"
      aria-label="PC&MR Corretora de Seguros — início"
    >
      <span className="brand-name">
        PC<span>&</span>MR<span className="brand-dot">.</span>
      </span>
      <span className="brand-caption">CORRETORA DE SEGUROS</span>
    </a>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [initialInsurance, setInitialInsurance] = useState<InsuranceId>("auto");
  const [detail, setDetail] = useState<
    (typeof insuranceOptions)[number] | null
  >(null);
  const [filter, setFilter] = useState("todos");
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [heroChoice, setHeroChoice] = useState<InsuranceId>("auto");

  function openQuote(insurance: InsuranceId = "orientacao") {
    setInitialInsurance(insurance);
    setQuoteOpen(true);
    setMenuOpen(false);
  }
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="announcement">
        <div className="container announcement-inner">
          <span>
            Desde 2007, perto de você.{" "}
            <span className="announcement-extra">E do que importa.</span>
          </span>
          <button onClick={() => openQuote()}>
            Um novo olhar para o seu seguro <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
      <header className="site-header">
        <div className="container nav-container">
          <Brand />
          <nav className="desktop-nav" aria-label="Navegação principal">
            <a href="#seguros">Nossos seguros</a>
            <a href="#essencia">A PC&MR</a>
            <a href="#como-funciona">Como funciona</a>
          </nav>
          <div className="nav-actions">
            <button
              className="button button-navy nav-cta"
              onClick={() => openQuote()}
            >
              Vamos conversar <ArrowUpRight size={17} />
            </button>
            <button
              className="icon-button menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            id="mobile-menu"
            className="mobile-nav"
            aria-label="Navegação mobile"
          >
            {[
              ["#seguros", "Nossos seguros"],
              ["#essencia", "A PC&MR"],
              ["#como-funciona", "Como funciona"],
              ["#duvidas", "Dúvidas frequentes"],
            ].map(([href, title]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>
                {title}
                <ArrowUpRight size={19} />
              </a>
            ))}
            <button className="button button-navy" onClick={() => openQuote()}>
              Solicitar cotação <ArrowRight size={17} />
            </button>
          </nav>
        )}
      </header>

      <main id="conteudo">
        <section
          id="inicio"
          className="hero container"
          aria-labelledby="hero-title"
        >
          <div className="hero-copy">
            <div className="eyebrow hero-eyebrow">
              <span className="small-line" /> PROTEÇÃO PARA A VIDA REAL
            </div>
            <h1 id="hero-title">
              Sua vida merece
              <br />
              seguir{" "}
              <span className="coral-text">
                em
                <br className="desktop-break" /> frente.
              </span>
              <span className="hero-period" aria-hidden="true">
                <ArrowUpRight />
              </span>
            </h1>
            <p className="hero-description">
              Os planos são seus.
              <br />O cuidado com cada passo é com a gente.
            </p>
            <p className="hero-support">
              Seguros para proteger suas conquistas e dar mais liberdade para
              viver o que vem pela frente.
            </p>
            <button
              className="button button-coral hero-cta"
              onClick={() => openQuote()}
            >
              Encontre sua proteção <ArrowUpRight size={21} />
            </button>
            <div className="hero-footnote">
              <span className="mini-shield">
                <ShieldCheck size={17} strokeWidth={1.5} />
              </span>{" "}
              Atendimento humano. Escolhas com confiança.
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-wrap">
              <img
                className="hero-image"
                src="/images/family-garden.webp"
                alt="Família compartilhando um momento de alegria no jardim de casa"
                width="1536"
                height="1024"
                fetchPriority="high"
              />
              <div className="image-grain" />
              <div className="photo-caption">
                <span className="photo-marker" />
                <span>
                  É sobre estar presente.
                  <br />
                  <strong>Hoje e no que vem depois.</strong>
                </span>
              </div>
            </div>
            <div className="hero-stamp">
              <ShieldCheck size={27} strokeWidth={1.4} />
              <span>
                Seu futuro.
                <br />
                <strong>Nosso cuidado.</strong>
              </span>
            </div>
            <span className="vertical-caption">
              MAIS VIDA. MENOS PREOCUPAÇÃO.
            </span>
            <div className="hero-orbit" aria-hidden="true" />
          </div>
        </section>

        <div className="container quick-quote" data-reveal>
          <div className="quick-quote-title">
            <span className="eyebrow">SEU PRÓXIMO PASSO</span>
            <h2>O que vamos proteger?</h2>
          </div>
          <div className="quick-select-wrap">
            <label htmlFor="quick-insurance">Escolha um seguro</label>
            <select
              id="quick-insurance"
              value={heroChoice}
              onChange={(event) =>
                setHeroChoice(event.target.value as InsuranceId)
              }
            >
              {insuranceOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
              <option value="orientacao">
                Ainda não sei. Quero orientação.
              </option>
            </select>
          </div>
          <button
            className="button button-navy"
            onClick={() => openQuote(heroChoice)}
          >
            Quero uma cotação <ArrowUpRight size={20} />
          </button>
          <span className="quick-caption">
            <Check size={14} /> Simples e sem compromisso
          </span>
        </div>

        <div className="trust-strip container">
          <span>
            <Fingerprint size={21} strokeWidth={1.5} /> Cada história é única.
          </span>
          <span>
            <MessagesSquare size={21} strokeWidth={1.5} /> Conversa de verdade.
          </span>
          <span>
            <Compass size={21} strokeWidth={1.5} /> Clareza para escolher.
          </span>
          <a href="#seguros" aria-label="Explorar os seguros">
            <ArrowDown size={19} />
          </a>
        </div>

        <section
          id="seguros"
          className="insurance-section section-space"
          aria-labelledby="insurance-title"
        >
          <div className="container">
            <div className="section-heading" data-reveal>
              <div>
                <span className="eyebrow">
                  <span className="section-number">01 /</span> NOSSOS SEGUROS
                </span>
                <h2 id="insurance-title">
                  Para cada parte da vida,
                  <br />
                  <span className="text-outline">um cuidado especial.</span>
                </h2>
              </div>
              <p>
                Seu mundo não cabe em uma única solução.
                <br />
                Sua proteção também não precisa caber.
              </p>
            </div>
            <div className="filter-row" data-reveal>
              <div
                className="filters"
                role="group"
                aria-label="Filtrar seguros"
              >
                {[
                  ["todos", "Todos os seguros"],
                  ["voce", "Para você"],
                  ["empresa", "Para sua empresa"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    className={filter === id ? "active" : ""}
                    aria-pressed={filter === id}
                    onClick={() => setFilter(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="filter-note">
                Cuidado que acompanha você <ArrowDown size={15} />
              </span>
            </div>
            <div className="insurance-grid">
              {insuranceOptions
                .filter(
                  (item) =>
                    filter === "todos" ||
                    item.audience === filter ||
                    item.audience === "ambos",
                )
                .map((item, index) => (
                  <article
                    className={`insurance-card ${item.id === "auto" ? "featured" : ""}`}
                    key={item.id}
                  >
                    <div className="card-top">
                      <span className="insurance-icon">
                        <item.icon size={35} strokeWidth={1.3} />
                      </span>
                      <span className="card-index">
                        0{insuranceOptions.indexOf(item) + 1}
                      </span>
                    </div>
                    <div className="card-copy">
                      <h3>{item.name}</h3>
                      <p>{item.short}</p>
                    </div>
                    <button
                      className="card-link"
                      onClick={() => setDetail(item)}
                      aria-label={`Conhecer ${item.name.toLowerCase()}`}
                    >
                      Conhecer proteção{" "}
                      <span>
                        <ArrowUpRight size={19} />
                      </span>
                    </button>
                    {index === 0 && filter === "todos" && (
                      <div className="card-orbits" aria-hidden="true" />
                    )}
                  </article>
                ))}
            </div>
            <p className="insurance-disclaimer">
              Coberturas e disponibilidade variam conforme o perfil e as
              condições de cada seguradora ou operadora.
            </p>
            <div className="guidance-row">
              <span>
                Não sabe por onde começar?{" "}
                <strong>A gente ajuda a encontrar o caminho.</strong>
              </span>
              <button className="text-button" onClick={() => openQuote()}>
                Quero uma orientação <ArrowUpRight size={19} />
              </button>
            </div>
          </div>
        </section>

        <section
          id="essencia"
          className="about-section section-space"
          aria-labelledby="about-title"
        >
          <div className="container about-grid">
            <div className="about-art" data-reveal>
              <div className="about-art-top">
                <span>PC&MR</span>
                <span>
                  ESSÊNCIA
                  <br />
                  HUMANA.
                </span>
              </div>
              <div className="ampersand" aria-hidden="true">
                &
              </div>
              <div className="about-art-bottom">
                <span>
                  Desde <strong>2007.</strong>
                </span>
                <p>
                  Entre você e o amanhã,
                  <br />
                  existe cuidado.
                </p>
              </div>
              <div className="art-rule" />
            </div>
            <div className="about-copy" data-reveal>
              <span className="eyebrow">
                <span className="section-number">02 /</span> MUITO ALÉM DE UMA
                APÓLICE
              </span>
              <h2 id="about-title">
                Antes de falar
                <br />
                de seguros,
                <br />
                <span className="coral-text">falamos de você.</span>
              </h2>
              <p>
                Um novo lar. Um negócio que cresce. A família que é tudo. Por
                trás de cada seguro, existe uma história que merece atenção.
              </p>
              <p>
                Na PC&MR, acreditamos que proteger começa por ouvir. É entender
                seu momento e traduzir possibilidades em escolhas que fazem
                sentido para a sua vida.
              </p>
              <div className="about-values">
                <div>
                  <HeartHandshake size={23} strokeWidth={1.5} />
                  <span>Proximidade para entender.</span>
                </div>
                <div>
                  <ShieldCheck size={23} strokeWidth={1.5} />
                  <span>Clareza para decidir.</span>
                </div>
              </div>
              <button className="text-button" onClick={() => openQuote()}>
                Vamos falar sobre o seu momento <ArrowUpRight size={19} />
              </button>
            </div>
          </div>
        </section>

        <section
          id="como-funciona"
          className="process-section section-space"
          aria-labelledby="process-title"
        >
          <div className="container">
            <div className="section-heading" data-reveal>
              <div>
                <span className="eyebrow">
                  <span className="section-number">03 /</span> UM PASSO DE CADA
                  VEZ
                </span>
                <h2 id="process-title">
                  Cuidar do amanhã
                  <br />
                  pode ser simples.
                </h2>
              </div>
              <button
                className="button button-outline"
                onClick={() => openQuote()}
              >
                Vamos começar <ArrowUpRight size={19} />
              </button>
            </div>
            <div className="process-grid" data-reveal>
              {[
                [
                  "01",
                  "Conte sua história.",
                  "O que você quer proteger? Começamos entendendo seu momento, suas prioridades e seus planos.",
                ],
                [
                  "02",
                  "Conheça os caminhos.",
                  "Entenda as opções, as coberturas e as condições. Clareza para comparar e escolher com confiança.",
                ],
                [
                  "03",
                  "Siga com tranquilidade.",
                  "Com a proposta aceita e a apólice vigente, você segue em frente com a proteção que escolheu.",
                ],
              ].map(([number, title, description]) => (
                <div className="process-step" key={number}>
                  <div className="step-top">
                    <span>{number}</span>
                    <ArrowRight size={23} strokeWidth={1.3} />
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="duvidas"
          className="faq-section section-space"
          aria-labelledby="faq-title"
        >
          <div className="container faq-grid">
            <div className="faq-intro" data-reveal>
              <span className="eyebrow">
                <span className="section-number">04 /</span> SEM COMPLICAÇÃO
              </span>
              <h2 id="faq-title">
                Boas escolhas
                <br />
                começam com
                <br />
                <span className="coral-text">boas respostas.</span>
              </h2>
              <p>
                Seguro pode ter seus detalhes.
                <br />A conversa sobre ele pode ser simples.
              </p>
              <button className="text-button" onClick={() => openQuote()}>
                Tenho outra dúvida <ArrowUpRight size={18} />
              </button>
            </div>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div
                  className={`faq-item ${faqOpen === index ? "open" : ""}`}
                  key={faq.question}
                >
                  <h3>
                    <button
                      aria-expanded={faqOpen === index}
                      aria-controls={`faq-answer-${index}`}
                      id={`faq-button-${index}`}
                      onClick={() =>
                        setFaqOpen(faqOpen === index ? null : index)
                      }
                    >
                      <span>{faq.question}</span>
                      {faqOpen === index ? (
                        <Minus size={19} />
                      ) : (
                        <Plus size={19} />
                      )}
                    </button>
                  </h3>
                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-button-${index}`}
                    hidden={faqOpen !== index}
                  >
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="closing-section" aria-labelledby="closing-title">
          <div className="container closing-content" data-reveal>
            <div>
              <span className="eyebrow">
                O MELHOR DA VIDA AINDA ESTÁ POR VIR.
              </span>
              <h2 id="closing-title">
                Viva seus planos.
                <br />
                <span>A gente cuida da proteção.</span>
              </h2>
              <button
                className="button button-coral"
                onClick={() => openQuote()}
              >
                Vamos dar o próximo passo? <ArrowUpRight size={20} />
              </button>
              <span className="closing-note">
                Uma conversa pode ser o começo de mais tranquilidade.
              </span>
            </div>
            <div className="closing-arrow" aria-hidden="true">
              <MoveUpRight size={230} strokeWidth={0.65} />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand-block">
              <Brand />
              <p>
                Proteção para viver.
                <br />
                Proximidade para seguir.
              </p>
              <span className="footer-since">DESDE 2007</span>
            </div>
            <div className="footer-links">
              <h2>Seu próximo passo</h2>
              <a href="#seguros">
                Encontre seu seguro <ArrowUpRight size={13} />
              </a>
              <a href="#essencia">
                Conheça a PC&MR <ArrowUpRight size={13} />
              </a>
              <a href="#como-funciona">
                Entenda como funciona <ArrowUpRight size={13} />
              </a>
              <a href="#duvidas">
                Tire suas dúvidas <ArrowUpRight size={13} />
              </a>
            </div>
            <div className="footer-contact">
              <h2>Vamos conversar?</h2>
              <p>
                Conte o que importa para você.
                <br />
                Vamos encontrar o próximo passo.
              </p>
              <button
                className="button button-outline"
                onClick={() => openQuote()}
              >
                Solicitar uma cotação <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} PC&MR Corretora de Seguros.
            </span>
            <button onClick={() => setPrivacyOpen(true)}>
              Privacidade e seus dados
            </button>
            <a href="#inicio">
              Voltar ao topo <ArrowUpRight size={14} />
            </a>
          </div>
          <p className="footer-legal">
            A contratação está sujeita à análise de risco e à aceitação da
            seguradora. Consulte as coberturas, exclusões, limites e condições
            do produto antes de contratar. Solicitar uma cotação não garante
            cobertura.
          </p>
        </div>
      </footer>

      <QuoteForm
        open={quoteOpen}
        initialInsurance={initialInsurance}
        onClose={() => setQuoteOpen(false)}
      />
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        label={detail?.name || "Detalhes do seguro"}
        className="product-modal"
      >
        {detail && (
          <>
            <span className="product-modal-icon">
              <detail.icon size={42} strokeWidth={1.3} />
            </span>
            <span className="eyebrow">PROTEÇÃO COM O SEU JEITO</span>
            <h2>{detail.name}</h2>
            <p className="modal-intro">{detail.description}</p>
            <h3>O que podemos explorar juntos</h3>
            <ul className="coverage-list">
              {detail.coverage.map((item) => (
                <li key={item}>
                  <Check size={18} />
                  {item}
                </li>
              ))}
            </ul>
            <p className="coverage-note">
              {detail.note} Os itens acima são possibilidades, não uma oferta ou
              garantia de cobertura.
            </p>
            <button
              className="button button-navy"
              onClick={() => {
                const id = detail.id;
                setDetail(null);
                openQuote(id);
              }}
            >
              Cotar {detail.name.toLowerCase()} <ArrowUpRight size={18} />
            </button>
          </>
        )}
      </Modal>
      <Modal
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        label="Privacidade e seus dados"
        className="privacy-modal"
      >
        <span className="eyebrow">CLAREZA TAMBÉM É CUIDADO</span>
        <h2>Privacidade e seus dados</h2>
        <p className="modal-intro">
          Aviso da prévia do novo site · atualizado em 5 de novembro de 2026.
        </p>
        <h3>Sobre esta prévia</h3>
        <p>
          Este ambiente demonstra o novo site da PC&MR. Use dados fictícios ao
          experimentar o formulário.{" "}
          {standalonePreview
            ? "Neste arquivo interativo, as cotações são simuladas e nenhum dado é enviado ou armazenado."
            : "Os pedidos são registrados neste ambiente, sem envio de e-mails, mensagens ou integração com o FluxBroker."}
        </p>
        <h3>O que o formulário registra</h3>
        <p>
          Nome, e-mail, telefone, cidade, interesse em seguro, observações
          opcionais, protocolo, data e registro da autorização. Não solicitamos
          CPF, documentos, informações financeiras ou dados de saúde.
        </p>
        <h3>Finalidade e armazenamento</h3>
        <p>
          {standalonePreview
            ? "Os dados servem apenas à demonstração e ficam na memória da página até que você a feche. Não há conexão com um servidor."
            : "Os dados são usados para demonstrar e validar o fluxo de cotação e ficam armazenados no servidor da prévia."}{" "}
          Não são compartilhados com seguradoras, anunciantes ou serviços de
          análise. Os registros de teste devem ser excluídos antes da publicação
          definitiva.
        </p>
        <h3>Cookies e navegação</h3>
        <p>
          O site não utiliza cookies de publicidade nem ferramentas de
          rastreamento. Os campos preenchidos permanecem apenas na memória da
          página até o envio ou o encerramento da navegação.
        </p>
        <h3>Seus direitos</h3>
        <p>
          Você pode solicitar acesso, correção ou exclusão dos dados ao
          responsável que disponibilizou esta prévia, informando seu protocolo.
          Antes da publicação definitiva, este aviso deverá incluir a
          identificação jurídica, o canal oficial de privacidade e os prazos de
          retenção confirmados pela PC&MR.
        </p>
        <button
          className="button button-navy"
          onClick={() => setPrivacyOpen(false)}
        >
          Entendi <ChevronRight size={17} />
        </button>
      </Modal>
    </>
  );
}
