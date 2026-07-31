(() => {
  "use strict";

  const form = document.getElementById("weddingBriefing");
  const steps = [...document.querySelectorAll(".form-step")];
  const navigation = document.getElementById("formNavigation");
  const previousButton = document.querySelector("[data-prev]");
  const nextButtons = [...document.querySelectorAll("[data-next]")];
  const submitButton = document.querySelector("[data-submit]");
  const progressBar = document.getElementById("progressBar");
  const progressLabel = document.getElementById("progressLabel");
  const progressPercent = document.getElementById("progressPercent");
  const reviewContent = document.getElementById("reviewContent");
  const formStatus = document.getElementById("formStatus");
  const restartButton = document.getElementById("restartForm");
  const currentYear = document.getElementById("currentYear");

  const STORAGE_KEY = "briefing-casamento-form-v1";
  const FIRST_FORM_STEP = 1;
  const REVIEW_STEP = 8;
  const SUCCESS_STEP = 9;
  const TOTAL_FORM_STEPS = 8;

  let currentStep = 0;
  let isSubmitting = false;

  const labels = {
    nome_pessoa_1: "Nome de uma das pessoas",
    nome_pessoa_2: "Nome da outra pessoa",
    email: "E-mail",
    telefone: "Telefone / WhatsApp",
    data_casamento: "Data do casamento",
    horario_casamento: "Horário",
    local_cerimonia: "Local da cerimônia",
    local_recepcao: "Local da recepção",
    tipo_cerimonia: "Tipo de cerimônia",

    como_se_conheceram: "Como se conheceram",
    momentos_marcantes: "Momentos marcantes",
    como_se_descrevem: "Como se descrevem",
    interesses_compartilhados: "Interesses compartilhados",
    referencias_afetivas: "Referências afetivas, culturais ou religiosas",

    numero_convidados: "Número aproximado de convidados",
    formalidade: "Nível de formalidade",
    ambiente: "Ambiente principal",
    periodo_evento: "Período do evento",
    descricao_decoracao: "Descrição da decoração",
    "sensacoes[]": "Sensações desejadas",

    "estilos[]": "Estilos escolhidos",
    escala_classico_contemporaneo: "Escala: clássico → contemporâneo",
    escala_delicado_marcante: "Escala: delicado → marcante",
    escala_minimalista_ornamentado: "Escala: minimalista → ornamentado",
    escala_romantico_editorial: "Escala: romântico → editorial",

    identidade_deve_comunicar: "O que deve comunicar",
    identidade_nao_deve_comunicar: "O que não deve comunicar",
    elemento_principal: "Elemento principal",
    cores_desejadas: "Cores desejadas",
    cores_evitar: "Cores a evitar",
    simbolos_casal: "Símbolos do casal",
    elementos_evitar: "Elementos a evitar",
    "tipografia[]": "Preferências tipográficas",

    "aplicacoes[]": "Aplicações",
    aplicacoes_prioritarias: "Aplicações prioritárias",
    outras_aplicacoes: "Outras aplicações",

    links_referencias_positivas: "Referências positivas",
    motivos_referencias_positivas: "O que chama atenção",
    links_referencias_negativas: "Referências negativas",
    motivos_referencias_negativas: "O que deve ser evitado",
    fornecedores_decisoes: "Fornecedores e decisões já definidas",
    observacoes_finais: "Observações finais"
  };

  const ignoredFields = new Set([
    "_subject",
    "_gotcha",
    "confirmacao_informacoes"
  ]);

  function setStep(stepIndex) {
    currentStep = Math.max(0, Math.min(stepIndex, SUCCESS_STEP));

    steps.forEach((step) => {
      step.classList.toggle(
        "is-active",
        Number(step.dataset.step) === currentStep
      );
    });

    const showNavigation =
      currentStep >= FIRST_FORM_STEP && currentStep <= REVIEW_STEP;

    navigation.classList.toggle("is-visible", showNavigation);

    if (showNavigation) {
      previousButton.hidden = currentStep === FIRST_FORM_STEP;
      submitButton.hidden = currentStep !== REVIEW_STEP;

      const navigationNext = navigation.querySelector("[data-next]");
      navigationNext.hidden = currentStep === REVIEW_STEP;

      updateProgress();

      if (currentStep === REVIEW_STEP) {
        buildReview();
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateProgress() {
    const normalizedStep = Math.max(FIRST_FORM_STEP, currentStep);
    const percent = Math.round((normalizedStep / TOTAL_FORM_STEPS) * 100);

    progressLabel.textContent = `Etapa ${normalizedStep} de ${TOTAL_FORM_STEPS}`;
    progressPercent.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;
  }

  function getCurrentStepElement() {
    return steps.find(
      (step) => Number(step.dataset.step) === currentStep
    );
  }

  function validateCurrentStep() {
    const activeStep = getCurrentStepElement();
    if (!activeStep) return true;

    let isValid = true;
    const requiredFields = [
      ...activeStep.querySelectorAll(
        "input[required], textarea[required], select[required]"
      )
    ];

    requiredFields.forEach((field) => {
      field.classList.remove("is-invalid");

      if (!field.checkValidity()) {
        field.classList.add("is-invalid");
        isValid = false;
      }
    });

    const requiredGroups = [
      ...activeStep.querySelectorAll("[data-required-group]")
    ];

    requiredGroups.forEach((group) => {
      const checked = group.querySelector(
        'input[type="checkbox"]:checked, input[type="radio"]:checked'
      );

      group.classList.toggle("has-error", !checked);

      if (!checked) {
        isValid = false;
      }
    });

    if (!isValid) {
      const firstInvalid =
        activeStep.querySelector(".is-invalid") ||
        activeStep.querySelector(".has-error");

      firstInvalid?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      if (firstInvalid instanceof HTMLInputElement ||
          firstInvalid instanceof HTMLTextAreaElement ||
          firstInvalid instanceof HTMLSelectElement) {
        firstInvalid.focus({ preventScroll: true });
        firstInvalid.reportValidity();
      }
    }

    return isValid;
  }

  function goNext() {
    if (currentStep === 0) {
      setStep(FIRST_FORM_STEP);
      return;
    }

    if (!validateCurrentStep()) return;

    saveForm();
    setStep(currentStep + 1);
  }

  function goPrevious() {
    saveForm();
    setStep(currentStep - 1);
  }

  function formToObject() {
    const data = {};

    [...form.elements].forEach((element) => {
      if (!element.name || ignoredFields.has(element.name)) return;

      if (element.type === "checkbox") {
        if (!data[element.name]) data[element.name] = [];
        if (element.checked) data[element.name].push(element.value);
        return;
      }

      if (element.type === "radio") {
        if (element.checked) data[element.name] = element.value;
        return;
      }

      data[element.name] = element.value;
    });

    return data;
  }

  function saveForm() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          values: formToObject(),
          savedAt: new Date().toISOString()
        })
      );
    } catch (error) {
      console.warn("Não foi possível salvar o formulário localmente.", error);
    }
  }

  function restoreForm() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved);
      const values = parsed.values || {};

      Object.entries(values).forEach(([name, value]) => {
        const elements = [...form.querySelectorAll(`[name="${CSS.escape(name)}"]`)];

        elements.forEach((element) => {
          if (element.type === "checkbox") {
            element.checked = Array.isArray(value) && value.includes(element.value);
          } else if (element.type === "radio") {
            element.checked = element.value === value;
          } else {
            element.value = value ?? "";
          }
        });
      });
    } catch (error) {
      console.warn("Não foi possível restaurar o formulário.", error);
    }
  }

  function clearSavedForm() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Não foi possível limpar o salvamento local.", error);
    }
  }

  function humanizeValue(name, value) {
    if (Array.isArray(value)) {
      return value.length ? value.join(", ") : "";
    }

    if (name === "data_casamento" && value) {
      const [year, month, day] = value.split("-");
      return `${day}/${month}/${year}`;
    }

    const scaleNames = new Set([
      "escala_classico_contemporaneo",
      "escala_delicado_marcante",
      "escala_minimalista_ornamentado",
      "escala_romantico_editorial"
    ]);

    if (scaleNames.has(name) && value) {
      const scaleLabels = {
        "1": "1 — totalmente à esquerda",
        "2": "2 — mais à esquerda",
        "3": "3 — equilibrado",
        "4": "4 — mais à direita",
        "5": "5 — totalmente à direita"
      };

      return scaleLabels[value] || value;
    }

    return value;
  }

  function buildReview() {
    const values = formToObject();
    const sections = [...document.querySelectorAll(
      '.form-step[data-section-title]:not([data-step="8"])'
    )];

    reviewContent.innerHTML = "";

    sections.forEach((section) => {
      const names = [
        ...new Set(
          [...section.querySelectorAll("[name]")]
            .map((element) => element.name)
            .filter((name) => labels[name])
        )
      ];

      const items = names
        .map((name) => ({
          label: labels[name],
          value: humanizeValue(name, values[name])
        }))
        .filter((item) => {
          if (Array.isArray(item.value)) return item.value.length > 0;
          return String(item.value ?? "").trim() !== "";
        });

      if (!items.length) return;

      const sectionCard = document.createElement("section");
      sectionCard.className = "review-section";

      const heading = document.createElement("h3");
      heading.textContent = section.dataset.sectionTitle;

      const list = document.createElement("dl");
      list.className = "review-grid";

      items.forEach((item) => {
        const wrapper = document.createElement("div");
        wrapper.className = "review-item";

        const term = document.createElement("dt");
        term.textContent = item.label;

        const definition = document.createElement("dd");
        definition.textContent = item.value;

        wrapper.append(term, definition);
        list.appendChild(wrapper);
      });

      sectionCard.append(heading, list);
      reviewContent.appendChild(sectionCard);
    });
  }

  async function submitForm(event) {
    event.preventDefault();

    if (isSubmitting || !validateCurrentStep()) return;

    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.firstChild.textContent = "Enviando ";
    formStatus.textContent = "";
    formStatus.className = "form-status";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Não foi possível enviar o briefing.");
      }

      clearSavedForm();
      form.reset();
      setStep(SUCCESS_STEP);
    } catch (error) {
      console.error(error);
      formStatus.textContent =
        "Não foi possível enviar agora. Verifique sua conexão e tente novamente.";
      formStatus.className = "form-status is-error";
    } finally {
      isSubmitting = false;
      submitButton.disabled = false;
      submitButton.firstChild.textContent = "Enviar briefing ";
    }
  }

  function resetInvalidState(event) {
    const target = event.target;

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      target.classList.remove("is-invalid");
      target.closest("[data-required-group]")?.classList.remove("has-error");
    }
  }

  function restartForm() {
    form.reset();
    clearSavedForm();
    setStep(0);
  }

  nextButtons.forEach((button) => {
    button.addEventListener("click", goNext);
  });

  previousButton.addEventListener("click", goPrevious);
  form.addEventListener("submit", submitForm);
  form.addEventListener("input", (event) => {
    resetInvalidState(event);
    saveForm();
  });
  form.addEventListener("change", (event) => {
    resetInvalidState(event);
    saveForm();
  });

  restartButton.addEventListener("click", restartForm);

  currentYear.textContent = new Date().getFullYear();
  restoreForm();
  setStep(0);
})();
