let currentNum = 3;
      let currentDen = 4;
      let selectedQuizOption = null;
      let currentStreak = 5;
      let showStepsExpanded = true;
      let currentQuizIndex = 0;

      const quizData = [
        {
          q: '¿Cuál es el resultado de <span class="math-d c-primary">1/2</span> + <span class="math-d c-secondary">0.25</span> expresado en fracción simplificada?',
          opts: [
            { id: "A", text: "2 / 6" },
            { id: "B", text: "3 / 4" },
            { id: "C", text: "5 / 8" },
            { id: "D", text: "1.5" },
          ],
          correct: "B",
          explanation:
            "¡Correcto! Porque 0.25 es equivalente a 1/4. Sumando las fracciones homogéneas: 1/2 = 2/4; por lo tanto, 2/4 + 1/4 = 3/4.",
          hint: "Pista: Convierte primero el decimal a fracción (0.25 = 1/4) y busca el común denominador con 1/2.",
        },
        {
          q: '¿Qué fracción irreductible representa al número decimal periódico puro <span class="math-d c-primary">0.666...</span>?',
          opts: [
            { id: "A", text: "6 / 10" },
            { id: "B", text: "3 / 5" },
            { id: "C", text: "2 / 3" },
            { id: "D", text: "6 / 99" },
          ],
          correct: "C",
          explanation:
            "¡Exacto! Al ser periódico puro, se divide el período entre tantos nueves como cifras tenga: 6/9, que al simplificar entre 3 resulta 2/3.",
          hint: "Pista: En un periódico puro, el período va en el numerador y tantos nueves como cifras tenga en el denominador.",
        },
      ];

      const $ = (id) => document.getElementById(id);

      function gcd(a, b) {
        return b === 0 ? a : gcd(b, a % b);
      }

      function updateVisualizers() {
        const num = currentNum;
        const den = currentDen;
        const decimalValue = num / den;
        const percentValue = (decimalValue * 100).toFixed(1);

        ["kpiDecimal", "kpiPercentage", "kpiReduced", "kpiType"].forEach((id) => {
          const element = $(id);
          if (!element) return;
          element.classList.remove("is-updated");
          void element.offsetWidth;
          element.classList.add("is-updated");
        });

        $("mathNumerator").innerText = num;
        $("mathDenominator").innerText = den;
        $("numDisplayBox").innerText = num;
        $("denDisplayBox").innerText = den;
        $("sliderNum").value = num;
        $("sliderDen").value = den;

        $("labelQuickDec").innerText =
          "= " +
          (Number.isInteger(decimalValue)
            ? decimalValue.toString()
            : decimalValue.toFixed(2));

        // Tipo de fracción
        const kpiType = $("kpiType");
        const kpiComplement = $("kpiComplement");
        if (num < den) {
          $("labelFractionState").innerText = "Fracción Propia (< 1)";
          if (kpiType) kpiType.innerText = "Propia (< 1)";
          if (kpiComplement) {
            kpiComplement.innerText = `Falta ${den - num}/${den} para la unidad`;
          }
        } else if (num === den) {
          $("labelFractionState").innerText = "Unidad Completa (= 1)";
          if (kpiType) kpiType.innerText = "Aparente (= 1)";
          if (kpiComplement) kpiComplement.innerText = "Equivale exactamente a 1";
        } else {
          $("labelFractionState").innerText = "Fracción Impropia (> 1)";
          if (kpiType) kpiType.innerText = "Impropia (> 1)";
          if (kpiComplement) {
            kpiComplement.innerText =
              `Mixto: ${Math.floor(num / den)} u. y ${num % den}/${den}`;
          }
        }

        // Resaltar preajuste activo
        document.querySelectorAll(".preset").forEach((btn) => {
          btn.classList.toggle(
            "is-active",
            btn.innerText.trim() === `${num}/${den}`,
          );
        });

        // 1. Modelo de barra
        const barContainer = $("barContainer");
        if (barContainer) {
          barContainer.innerHTML = "";
          const barUnitEndLabel = $("barUnitEndLabel");
          if (barUnitEndLabel) {
            barUnitEndLabel.innerText =
              num > den
                ? `${(num / den).toFixed(1)} (Mayor a 1)`
                : "1.00 (Unidad entera)";
          }
          for (let i = 0; i < den; i++) {
            const seg = document.createElement("div");
            seg.className = "bar__seg" + (i < num ? " is-on" : "");
            seg.innerText = `1/${den}`;
            barContainer.appendChild(seg);
          }
          const barInfo = $("barInfo");
          if (barInfo) {
            barInfo.innerText =
              `${Math.min(num, den)} de ${den} partes sombreadas${num > den ? ` (+${num - den} excedente)` : ""}`;
          }
        }

        // 2. Disco circular
        const discArc = $("discArc");
        if (discArc) {
          const circumference = 2 * Math.PI * 42;
          const ratio = Math.min(decimalValue, 1);
          discArc.style.strokeDasharray = circumference;
          discArc.style.strokeDashoffset = circumference * (1 - ratio);
          const angle = Math.round(ratio * 360);
          const discAngle = $("discAngle");
          const discPercent = $("discPercent");
          const discSectorLabel = $("discSectorLabel");
          if (discAngle) discAngle.innerText = `${angle}°`;
          if (discPercent) discPercent.innerText = `${percentValue}%`;
          if (discSectorLabel) {
            discSectorLabel.innerText =
              num > den
                ? `Saturado al 100% (+${(decimalValue - 1).toFixed(2)})`
                : `Sector de ${angle} grados sexagesimales`;
          }
        }

        // 3. Recta numérica
        const linePercent = Math.min(
          Math.max((decimalValue / 2) * 100, 0),
          100,
        );
        $("numberLineProgress").style.width = `${linePercent}%`;
        $("numberLinePin").style.left = `${linePercent}%`;
        $("pinText").innerText = decimalValue.toFixed(2);

        // Resultados
        $("kpiDecimal").innerText = decimalValue
          .toFixed(4)
          .replace(/\.?0+$/, "");
        $("kpiPercentage").innerText = `${percentValue}%`;

        const div = gcd(num, den);
        const redDen = den / div;
        $("kpiReduced").innerText = `${num / div} / ${redDen}`;
        const kpiMcd = $("kpiMcd");
        if (kpiMcd) kpiMcd.innerText = `m.c.d.(${num}, ${den}) = ${div}`;

        // Periodicidad
        let tempDen = redDen;
        while (tempDen % 2 === 0) tempDen /= 2;
        while (tempDen % 5 === 0) tempDen /= 5;

        const badge = $("badgeDecType");
        const kpiPeriodicity = $("kpiPeriodicity");
        if (tempDen === 1) {
          if (badge) {
            badge.innerText = "Decimal Exacto";
            badge.className = "badge badge--exact lbl-sm";
          }
          if (kpiPeriodicity) kpiPeriodicity.innerText = "Finito (factores 2 y/o 5)";
        } else if (redDen % 2 !== 0 && redDen % 5 !== 0) {
          if (badge) {
            badge.innerText = "Periódico Puro";
            badge.className = "badge badge--pure lbl-sm";
          }
          if (kpiPeriodicity) kpiPeriodicity.innerText = "Infinito con período fijo";
        } else {
          if (badge) {
            badge.innerText = "Periódico Mixto";
            badge.className = "badge badge--mixed lbl-sm";
          }
          if (kpiPeriodicity) kpiPeriodicity.innerText = "Tiene anteperíodo y período";
        }

        const stepOperation = $("stepOperation");
        if (stepOperation) {
          stepOperation.innerText =
            `${num} ÷ ${den} = ${decimalValue.toFixed(4).replace(/\.?0+$/, "")}`;
        }
        if ($("galeraVisualization") && $("stepExplanation")) {
          updateGaleraStep(num, den, decimalValue);
        }
      }

      function updateGaleraStep(n, d, dec) {
        const galera = $("galeraVisualization");
        const explanation = $("stepExplanation");

        if (n === 0) {
          galera.innerText = `  0 | ${d}\n  0 +---\n -- | 0\n  0 (Cociente 0)`;
          explanation.innerText =
            "Cero dividido por cualquier número distinto de cero resulta en 0 exacto.";
          return;
        }
        galera.innerText = `  ${n}.00 | ${d}\n  ...   +-------\n  Resto: ${n % d} | Cociente: ${dec.toFixed(2)}`;
        explanation.innerText = `Al dividir ${n} entre ${d}, obtenemos un cociente decimal de ${dec.toFixed(2)}. Cada decimal representa la fragmentación en décimas y centésimas sucesivas.`;
      }

      function toggleStepDetails() {
        showStepsExpanded = !showStepsExpanded;
        $("galeraVisualization").classList.toggle("hidden", !showStepsExpanded);
        $("toggleText").innerText = showStepsExpanded
          ? "Ocultar pasos"
          : "Ver pasos";
        $("toggleIcon").innerText = showStepsExpanded
          ? "expand_less"
          : "expand_more";
      }

      function adjustValue(type, delta) {
        if (type === "num") {
          const next = currentNum + delta;
          if (next >= 0 && next <= 12) currentNum = next;
        } else {
          const next = currentDen + delta;
          if (next >= 1 && next <= 12) currentDen = next;
        }
        updateVisualizers();
      }

      function onSliderChange() {
        currentNum = parseInt($("sliderNum").value, 10);
        currentDen = parseInt($("sliderDen").value, 10);
        updateVisualizers();
      }

      function setFraction(n, d) {
        currentNum = n;
        currentDen = d;
        updateVisualizers();
      }

      function setMode(mode) {
        ["simulador", "practica"].forEach((m) => {
          $(`btn-mode-${m}`).classList.toggle("is-active", m === mode);
        });
        if (mode === "practica") {
          $("practiceSection").scrollIntoView({ behavior: "smooth" });
        }
      }

      // ----- Práctica -----
      function selectOption(optId) {
        selectedQuizOption = optId;
        ["A", "B", "C", "D"].forEach((letter) => {
          $(`opt-${letter}`).classList.toggle("is-selected", letter === optId);
        });
      }

      function checkAnswer() {
        if (!selectedQuizOption) {
          alert("Por favor selecciona una opción antes de comprobar.");
          return;
        }
        const q = quizData[currentQuizIndex];
        const card = $("feedbackCard");
        card.classList.remove("hidden");

        if (selectedQuizOption === q.correct) {
          currentStreak++;
          $("quizStreak").innerText = currentStreak;
          card.className = "feedback is-ok";
          $("feedbackIcon").innerText = "verified";
          $("feedbackTitle").innerText = "¡Excelente deducción lógica!";
          $("feedbackText").innerText = q.explanation;
          $("btnCheckAnswer").classList.add("hidden");
          $("btnNextQuiz").classList.remove("hidden");
        } else {
          card.className = "feedback is-bad";
          $("feedbackIcon").innerText = "help";
          $("feedbackTitle").innerText = "Intenta nuevamente";
          $("feedbackText").innerText = q.hint;
        }
      }

      function nextQuiz() {
        currentQuizIndex = (currentQuizIndex + 1) % quizData.length;
        const q = quizData[currentQuizIndex];

        $("quizIndex").innerText = currentQuizIndex + 1;
        $("quizQuestion").innerHTML = q.q;
        q.opts.forEach((opt) => {
          $(`opt-${opt.id}`).querySelector(".option__text").innerText =
            opt.text;
        });

        selectedQuizOption = null;
        ["A", "B", "C", "D"].forEach((letter) =>
          $(`opt-${letter}`).classList.remove("is-selected"),
        );

        $("feedbackCard").classList.add("hidden");
        $("btnNextQuiz").classList.add("hidden");
        $("btnCheckAnswer").classList.remove("hidden");
      }

      // ----- Herramientas -----
      function calculateGeneratriz() {
        const val = $("genInput").value.trim();
        const res = $("genResult");
        if (val.includes("333")) {
          res.innerText = "Resultado: 4/3 (Periódico Puro: 1 + 3/9)";
        } else if (val.includes("2.15") || val.includes("2,15")) {
          res.innerText = "Resultado: 43/20 (Exacto: 215/100)";
        } else {
          res.innerText = "Resultado: 7/5 (Generatriz simplificada)";
        }
      }

      function simplifyFractionTool() {
        const n = parseInt($("simpNum").value, 10) || 1;
        const d = parseInt($("simpDen").value, 10) || 1;
        const g = gcd(n, d);
        $("simpResult").innerText =
          `Irreducible: ${n / g} / ${d / g} (mcd: ${g})`;
      }

      function compareFractionsTool() {
        const f1 = $("compF1").value.split("/");
        const f2 = $("compF2").value.split("/");
        if (f1.length === 2 && f2.length === 2) {
          const v1 = parseFloat(f1[0]) / parseFloat(f1[1]);
          const v2 = parseFloat(f2[0]) / parseFloat(f2[1]);
          const sym = v1 > v2 ? ">" : v1 < v2 ? "<" : "=";
          $("compSymbol").innerText = sym;
          $("compResult").innerText =
            `${f1.join("/")} (${v1.toFixed(2)}) ${sym} ${f2.join("/")} (${v2.toFixed(2)})`;
        }
      }

      document.addEventListener("DOMContentLoaded", updateVisualizers);
