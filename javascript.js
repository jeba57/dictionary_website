document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded...");

    // Firebase Setup
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // Visitor Count Function
    const visitorDiv = document.getElementById("visitorCount");
    
    function updateVisitorCount() {
        const visitorRef = database.ref("visitorCount");

        visitorRef.once("value")
            .then(snapshot => {
                let count = snapshot.val() || 0;
                count++;
                visitorRef.set(count);
                console.log("Visitor count updated to:", count);
                visitorDiv.innerHTML = `<p><strong>Total Visitors:</strong> ${count}</p>`;
            })
            .catch(error => console.error("Firebase error:", error));
    }

    updateVisitorCount(); // Call visitor count update function

    // Dictionary API Search Setup
    const searchBtn = document.getElementById("searchBtn");
    const wordInput = document.getElementById("wordInput");
    const resultDiv = document.getElementById("result");
    const loadingDiv = document.getElementById("loading");

    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            console.log("Search button clicked!");
            searchWord();
        });
    }

    wordInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            searchWord();
        }
    });

    function searchWord() {
        let word = wordInput.value.trim().toLowerCase();

        if (word === "") {
            resultDiv.innerHTML = "<p>Please enter a word.</p>";
            return;
        }

        loadingDiv.style.display = "block";
        resultDiv.innerHTML = "";

        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
            .then(response => response.json())
            .then(data => {
                loadingDiv.style.display = "none";
                console.log("API response received:", data);

                if (!data[0] || !data[0].meanings) {
                    resultDiv.innerHTML = `<p>Word not found. Try another.</p>`;
                    return;
                }

                let meaningsHTML = data[0].meanings.map(meaning => {
                    let definition = meaning.definitions[0]?.definition || "No definition found.";
                    let example = meaning.definitions[0]?.example || "No example available.";
                    return `<p><strong>${meaning.partOfSpeech}</strong>: ${definition}<br><em>${example}</em></p>`;
                }).join("");

                let phonetics = data[0].phonetics[0]?.text || "No pronunciation found.";
                let audio = data[0].phonetics.find(p => p.audio)?.audio;

                resultDiv.innerHTML = `
                    <h2>${word}</h2>
                    ${meaningsHTML}
                    <p><strong>Pronunciation:</strong> ${phonetics}</p>
                    ${audio ? `<audio controls><source src="${audio}" type="audio/mpeg"></audio>` : ""}
                `;
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                loadingDiv.style.display = "none";
                resultDiv.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
            });
    }

    wordInput.placeholder = "Type a word...";
});
