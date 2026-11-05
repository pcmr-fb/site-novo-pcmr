import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCheck,
  ShieldCheck,
  LoaderCircle,
  Copy,
  CircleCheck,
  LockKeyhole,
} from "lucide-react";
import { allOptions, type InsuranceId } from "./data";
import { Modal } from "./Modal";
import { standalonePreview } from "./preview";

type Details = {
  name: string;
  email: string;
  phone: string;
  city: string;
  message: string;
  consent: boolean;
  website: string;
};
const emptyDetails: Details = {
  name: "",
  email: "",
  phone: "",
  city: "",
  message: "",
  consent: false,
  website: "",
};

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  const local = digits.slice(2);
  const split = digits.length > 10 ? 5 : 4;
  return `(${digits.slice(0, 2)}) ${local.slice(0, split)}${local.length > split ? "-" + local.slice(split) : ""}`;
}

export default function QuoteForm({
  open,
  initialInsurance,
  onClose,
}: {
  open: boolean;
  initialInsurance: InsuranceId;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [insurance, setInsurance] = useState<InsuranceId>(initialInsurance);
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [protocol, setProtocol] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const pending = useRef(false);
  useEffect(() => {
    if (open && !protocol) setInsurance(initialInsurance);
  }, [open, initialInsurance, protocol]);
  useEffect(() => {
    if (open) heading.current?.focus();
  }, [step, open]);
  const selected = allOptions.find((option) => option.id === insurance)!;
  const update = (key: keyof Details, value: string | boolean) =>
    setDetails((previous) => ({ ...previous, [key]: value }));

  function reset() {
    setStep(1);
    setInsurance(initialInsurance);
    setDetails(emptyDetails);
    setProtocol("");
    setRequestId(crypto.randomUUID());
    setError("");
    setCopied(false);
    setPrivacyOpen(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (step < 3) {
      setError("");
      setStep(step + 1);
      return;
    }
    if (pending.current) return;
    pending.current = true;
    setSending(true);
    setError("");
    try {
      if (standalonePreview) {
        setProtocol(`DEMO-${crypto.randomUUID()}`);
        setStep(4);
        return;
      }
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...details,
          name: details.name.trim(),
          city: details.city.trim(),
          email: details.email.trim(),
          phone: details.phone.replace(/\D/g, ""),
          insurance,
          requestId,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || "Não foi possível registrar. Tente novamente.",
        );
      setProtocol(data.protocol);
      setStep(4);
    } catch (err) {
      setError(
        err instanceof Error &&
          err.name !== "TimeoutError" &&
          err.name !== "TypeError"
          ? err.message
          : "A conexão não respondeu. Seus dados foram mantidos. Tente enviar novamente.",
      );
    } finally {
      setSending(false);
      pending.current = false;
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!sending) {
          onClose();
          if (protocol) reset();
        }
      }}
      label="Solicitar uma cotação"
      className="quote-modal"
    >
      {step < 4 ? (
        <>
          <span className="eyebrow coral-text">
            VAMOS CUIDAR DO QUE IMPORTA
          </span>
          <h2 ref={heading} tabIndex={-1}>
            {step === 1
              ? "O que você quer proteger?"
              : step === 2
                ? "Vamos nos conhecer?"
                : "Tudo certo por aqui?"}
          </h2>
          <p className="modal-intro">
            {step === 1
              ? "Sua próxima conquista começa com uma escolha tranquila."
              : step === 2
                ? "Conte um pouco sobre você para personalizar sua cotação."
                : "Confira seus dados antes de registrar a solicitação."}
          </p>
          <ol className="quote-progress" aria-label="Etapas da cotação">
            {["Sua proteção", "Seus dados", "Revisão"].map((label, index) => (
              <li
                key={label}
                className={step >= index + 1 ? "active" : ""}
                aria-current={step === index + 1 ? "step" : undefined}
              >
                <span>
                  {step > index + 1 ? <Check size={14} /> : `0${index + 1}`}
                </span>
                {label}
              </li>
            ))}
          </ol>
          <form onSubmit={submit}>
            {step === 1 && (
              <fieldset className="quote-options">
                <legend className="sr-only">Selecione o tipo de seguro</legend>
                {allOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`quote-option ${insurance === option.id ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="insurance"
                      value={option.id}
                      checked={insurance === option.id}
                      onChange={() => setInsurance(option.id)}
                      required
                    />
                    <option.icon size={25} strokeWidth={1.6} />
                    <span>{option.name}</span>
                    <span className="radio-indicator">
                      {insurance === option.id && <Check size={12} />}
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
            {step === 2 && (
              <div className="details-form">
                <div className="preview-notice">
                  <ShieldCheck size={18} />
                  <span>
                    {standalonePreview
                      ? "Prévia interativa: a cotação será apenas simulada, sem envio de dados. Use dados fictícios."
                      : "Você está na prévia do novo site. Use dados fictícios para testar."}
                  </span>
                </div>
                <label className="field full">
                  Nome completo
                  <input
                    name="name"
                    autoComplete="name"
                    placeholder="Como podemos chamar você?"
                    value={details.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                    minLength={3}
                    maxLength={100}
                    pattern=".*\S.*\S.*\S.*"
                  />
                </label>
                <label className="field">
                  Telefone com DDD
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel-national"
                    placeholder="(11) 99999-9999"
                    value={details.phone}
                    onChange={(e) =>
                      update("phone", formatPhone(e.target.value))
                    }
                    required
                    pattern="\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}"
                    title="Informe o DDD e um telefone com 8 ou 9 dígitos."
                  />
                </label>
                <label className="field">
                  Sua cidade / UF
                  <input
                    name="city"
                    autoComplete="address-level2"
                    placeholder="Ex.: São Paulo / SP"
                    value={details.city}
                    onChange={(e) => update("city", e.target.value)}
                    required
                    minLength={2}
                    maxLength={100}
                    pattern=".*\S.*\S.*"
                  />
                </label>
                <label className="field full">
                  E-mail
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@exemplo.com.br"
                    value={details.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                    maxLength={254}
                  />
                </label>
                <label className="field full">
                  Quer contar algo mais?{" "}
                  <span className="optional">Opcional</span>
                  <textarea
                    name="message"
                    rows={3}
                    placeholder="Uma renovação, uma nova conquista, uma dúvida…"
                    value={details.message}
                    onChange={(e) => update("message", e.target.value)}
                    maxLength={1000}
                  />
                </label>
                <div className="honeypot" aria-hidden="true">
                  <label>
                    Seu site
                    <input
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={details.website}
                      onChange={(e) => update("website", e.target.value)}
                    />
                  </label>
                </div>
                <label className="consent full">
                  <input
                    type="checkbox"
                    checked={details.consent}
                    onChange={(e) => update("consent", e.target.checked)}
                    required
                  />
                  <span>
                    Autorizo o uso dos dados informados para tratar esta
                    solicitação, conforme o aviso de privacidade.
                  </span>
                </label>
                <button
                  type="button"
                  className="text-button privacy-toggle"
                  onClick={() => setPrivacyOpen(!privacyOpen)}
                  aria-expanded={privacyOpen}
                >
                  Ler aviso de privacidade
                </button>
                {privacyOpen && (
                  <div className="inline-privacy full">
                    {standalonePreview
                      ? "Neste arquivo de demonstração, os dados ficam apenas na memória da página e não são enviados nem armazenados."
                      : "Nesta prévia, os dados e o registro da autorização são armazenados para testar o fluxo de cotação."}{" "}
                    Nenhuma mensagem é enviada e não há integração com sistemas
                    externos. Não inclua CPF, dados de saúde, documentos ou
                    informações financeiras. Use dados fictícios. Veja também o
                    aviso de privacidade no rodapé.
                  </div>
                )}
              </div>
            )}
            {step === 3 && (
              <div className="quote-review">
                <div className="review-product">
                  <selected.icon size={28} />
                  <div>
                    <span>Você escolheu</span>
                    <strong>{selected.name}</strong>
                  </div>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setStep(1)}
                  >
                    Alterar
                  </button>
                </div>
                <dl>
                  {[
                    ["Nome", details.name],
                    ["Telefone", details.phone],
                    ["E-mail", details.email],
                    ["Cidade", details.city],
                    ...(details.message
                      ? [["Observações", details.message]]
                      : []),
                  ].map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="review-note">
                  <LockKeyhole size={17} /> Esta solicitação não contrata um
                  seguro e não gera cobrança.
                </p>
              </div>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="quote-actions">
              {step > 1 ? (
                <button
                  type="button"
                  className="back-button"
                  disabled={sending}
                  onClick={() => setStep(step - 1)}
                >
                  <ArrowLeft size={17} /> Voltar
                </button>
              ) : (
                <span className="quote-assurance">
                  <ShieldCheck size={17} /> Sem compromisso
                </span>
              )}
              <button
                className="button button-navy"
                type="submit"
                disabled={sending}
              >
                {sending ? (
                  <>
                    Registrando <LoaderCircle size={19} className="spin" />
                  </>
                ) : step === 3 ? (
                  <>
                    {standalonePreview
                      ? "Simular cotação"
                      : "Solicitar cotação"}{" "}
                    <ArrowRight size={18} />
                  </>
                ) : (
                  <>
                    Continuar <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="quote-success">
          <div className="success-icon">
            <CheckCheck size={36} />
          </div>
          <span className="eyebrow">PRÓXIMO PASSO, MAIS TRANQUILO</span>
          <h2 ref={heading} tabIndex={-1}>
            {standalonePreview
              ? "Simulação concluída."
              : "Solicitação registrada."}
          </h2>
          <p>
            {standalonePreview ? (
              <>
                Você experimentou o pedido de{" "}
                <strong>{selected.name.toLowerCase()}</strong>.
              </>
            ) : (
              <>
                Seu pedido de <strong>{selected.name.toLowerCase()}</strong> foi
                salvo com sucesso.
              </>
            )}
          </p>
          <div className="protocol">
            <span>
              {standalonePreview ? "PROTOCOLO DEMONSTRATIVO" : "SEU PROTOCOLO"}
            </span>
            <code>{protocol}</code>
            <button
              className="text-button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(protocol);
                  setCopied(true);
                } catch {
                  setError("Selecione e copie o protocolo acima.");
                }
              }}
            >
              {copied ? <CircleCheck size={15} /> : <Copy size={15} />}
              {copied ? "Copiado" : "Copiar protocolo"}
            </button>
          </div>
          <p className="preview-success">
            {standalonePreview
              ? "Nenhuma solicitação foi enviada. Seus dados ficam apenas nesta página e são descartados ao fechá-la."
              : "Este é um teste da prévia. Nenhum contato será iniciado a partir deste pedido."}
          </p>
          {error && <p role="status">{error}</p>}
          <button
            className="button button-navy"
            onClick={() => {
              onClose();
              reset();
            }}
          >
            Voltar ao site <ArrowRight size={17} />
          </button>
          <button className="text-button new-quote" onClick={reset}>
            Fazer outra cotação
          </button>
        </div>
      )}
    </Modal>
  );
}
