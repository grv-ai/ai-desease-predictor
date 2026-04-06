const BASE_URL = "http://localhost:5000";
let riskChart = null;
let historyChart = null;

function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("bg-rose-500", "bg-emerald-500", "bg-slate-900");
  toast.classList.add(type === "error" ? "bg-rose-500" : type === "success" ? "bg-emerald-500" : "bg-slate-900");
  toast.classList.remove("hidden");
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => toast.classList.add("hidden"), 3700);
}

function setLoading(isLoading) {
  const btn = document.getElementById("predictBtn");
  const loader = document.getElementById("loading");
  btn.disabled = isLoading;
  loader.classList.toggle("hidden", !isLoading);
}

function getFormData() {
  const age = Number(document.getElementById("age").value);
  const weight = Number(document.getElementById("weight").value);
  const height = Number(document.getElementById("height").value);
  const glucose = Number(document.getElementById("glucose").value);
  const blood_pressure = Number(document.getElementById("blood_pressure").value);
  const cholesterol = Number(document.getElementById("cholesterol").value);
  const smoking = document.getElementById("smoking").value === "Yes" ? 1 : 0;
  const activityValue = document.getElementById("activity").value;
  const activity = activityValue === "High" ? 2 : activityValue === "Moderate" ? 1 : 0;

  return { age, weight, height, glucose, blood_pressure, cholesterol, smoking, activity };
}

function buildPayload() {
  const values = getFormData();

  if (!values.age || !values.weight || !values.height || !values.glucose || !values.blood_pressure || !values.cholesterol) {
    showToast("Please fill in all numeric fields before predicting.", "error");
    return null;
  }

  return {
    age: values.age,
    weight: values.weight,
    height: values.height,
    glucose: values.glucose,
    blood_pressure: values.blood_pressure,
    cholesterol: values.cholesterol,
    smoking: values.smoking,
    activity: values.activity,
  };
}

async function predictRisk() {
  const payload = buildPayload();
  if (!payload) return;

  setLoading(true);

  try {
    const response = await fetch(`${BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Prediction failed");
    }

    const result = await response.json();
    renderResult(result);
    showToast("Prediction completed successfully.", "success");
    await loadHistory();
  } catch (error) {
    console.error(error);
    showToast(error.message || "Unable to connect to backend.", "error");
  } finally {
    setLoading(false);
  }
}

function renderResult(data) {
  document.getElementById("riskLevel").textContent = data.prediction;
  document.getElementById("riskScore").textContent = `${Math.round(data.probability * 100)}%`;
  document.getElementById("riskAdvice").textContent = data.suggestion;
  document.getElementById("suggestion").textContent = data.suggestion;
  updateRiskChart(data.probability);
}

function initializeRiskChart() {
  const ctx = document.getElementById("riskChart").getContext("2d");
  riskChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Risk", "Remaining"],
      datasets: [{ data: [0, 100], backgroundColor: ["#06b6d4", "#334155"], borderWidth: 0 }],
    },
    options: { cutout: "70%", plugins: { legend: { display: false } } },
  });
}

function updateRiskChart(probability) {
  if (!riskChart) initializeRiskChart();
  const percent = Math.min(Math.max(Math.round(probability * 100), 0), 100);
  riskChart.data.datasets[0].data = [percent, 100 - percent];
  riskChart.update();
}

function createHistoryCard(record) {
  const date = new Date(record.createdAt).toLocaleString();
  return `
    <div class="rounded-3xl border border-slate-800 bg-slate-950/90 p-4 shadow-inner">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm text-slate-400">${record.prediction}</p>
          <p class="mt-1 text-lg font-semibold text-white">${Math.round(record.probability * 100)}% risk</p>
        </div>
        <span class="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">${date}</span>
      </div>
      <p class="mt-4 text-slate-300">Age: ${record.age}, BMI: ${record.bmi.toFixed(1)}, Glucose: ${record.glucose}</p>
      <p class="mt-2 text-slate-300">BP: ${record.blood_pressure}, Cholesterol: ${record.cholesterol}, Activity: ${record.activityLabel}</p>
      <p class="mt-4 text-slate-200">${record.suggestion}</p>
    </div>
  `;
}

function renderHistory(records) {
  const historyArea = document.getElementById("historyList");
  if (!records.length) {
    historyArea.innerHTML = "<p class='text-slate-400'>No saved predictions yet. Run the model once.</p>";
    return;
  }

  historyArea.innerHTML = records.map(createHistoryCard).join("");
}

function getHistoryCounts(records) {
  const counts = { Low: 0, Medium: 0, High: 0 };
  records.forEach((item) => {
    counts[item.prediction] = (counts[item.prediction] || 0) + 1;
  });
  return [counts.Low, counts.Medium, counts.High];
}

function updateHistoryChart(records) {
  const ctx = document.getElementById("historyChart").getContext("2d");
  const values = getHistoryCounts(records);

  if (historyChart) {
    historyChart.data.datasets[0].data = values;
    historyChart.update();
    return;
  }

  historyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Low", "Medium", "High"],
      datasets: [{ label: "Saved Predictions", data: values, backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"] }],
    },
    options: { responsive: true, plugins: { legend: { display: false } } },
  });
}

function normalizeActivityLabel(value) {
  if (value === 2) return "High";
  if (value === 1) return "Moderate";
  return "Low";
}

async function loadHistory() {
  try {
    const response = await fetch(`${BASE_URL}/history`);
    const records = await response.json();

    const normalized = records.map((record) => ({
      ...record,
      activityLabel: normalizeActivityLabel(record.activity),
    }));

    renderHistory(normalized);
    updateHistoryChart(normalized);
  } catch (error) {
    console.error(error);
    showToast("Unable to load history.", "error");
  }
}

window.addEventListener("load", () => {
  initializeRiskChart();
  loadHistory();
});
