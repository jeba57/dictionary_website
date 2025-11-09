// app.js (module)

// Firebase (v9+ modular) – import straight from the CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getDatabase,
  ref,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

// ---- Your Firebase config (WITH databaseURL) ----
const firebaseConfig = {
  apiKey: "AIzaSyAftyX_ynICbUeOFjHCJPg-KIF7XO_cPnI",
  authDomain: "dictionary-web-application.firebaseapp.com",
  projectId: "dictionary-web-application",
  storageBucket: "dictionary-web-application.firebasestorage.app",
  messagingSenderId: "372959887057",
  appId: "1:372959887057:web:4c81c931a6e7f2558c4ff0",
  databaseURL: "https://dictionary-web-application-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM refs
const visitorDiv = document.getElementById("visitorCount");
const searchBtn = document.getElementById("searchBtn");
const wordInput = document.getElementById("wordInput");
const resultDiv = document.getElementById("result");
const loadingDiv = document.getElementById("loading");

// --- Visitor counter (atomic increment) ---
async function updateVisitorCount() {
  try {
    const counterRef = ref(db, "visitorCount");
    const result = await runTransaction(counterRef, (current) => {
      if (current === null || typeof current !== "number") return 1;
      return current + 1;
    });
    const count = result.snapshot.val();
    visitorDiv.textContent = `Total Visitors: ${count}`;
  } catch (err) {
    console.error("Visitor counter error:", err);
    visitorDiv.textContent = "Total Visitors: (error)";
  }
}

// --- Dictionary look-up ---
function searchWord() {
  const word = wordInput.value.trim().toLowerCase();
  if (!word) {
    resultDiv.innerHTML = "<p>Please enter a word.</p>";
    return;
  }

  loadingDiv.style.display = "block";
  resultDiv.innerHTML = "";

  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
    .then(r => r.json())
    .then(data => {
      loadingDiv.style.display = "none";
      if (!Array.isArray(data) || !data[0] || !data[0].meanings) {
        resultDiv.innerHTML = `<p>Word not found. Try another.</p>`;
        return;
      }

      const entry = data[0];
      const meaningsHTML = entry.meanings.map(m => {
        const def = m.definitions?.[0]?.definition || "No definition found.";
        const ex = m.definitions?.[0]?.example || "No example available.";
        return `<p><strong>${m.partOfSpeech}</strong>: ${def}<br><em>${ex}</em></p>`;
      }).join("");

      const phonetics = entry.phonetics?.[0]?.text || "No pronunciation found.";
      const audio = (entry.phonetics || []).find(p => p.audio)?.audio;

      resultDiv.innerHTML = `
        <h2>${word}</h2>
        ${meaningsHTML}
        <p><strong>Pronunciation:</strong> ${phonetics}</p>
        ${audio ? `<audio controls><source src="${audio}" type="audio/mpeg"></audio>` : ""}
      `;
    })
    .catch(err => {
      console.error("Dictionary API error:", err);
      loadingDiv.style.display = "none";
      resultDiv.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
    });
}

// Events
searchBtn?.addEventListener("click", searchWord);
wordInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchWord();
});

// Init
updateVisitorCount();
