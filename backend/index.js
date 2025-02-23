const API_KEY = "AIzaSyAWDcRqKHnYaj4l1_A7wfL8Cwv7nX5uDm0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

// Event listener untuk tombol kirim
window.onload = function () {
    setTimeout(() => {
        console.log("Checking elements after delay...");
        console.log("sendButton:", document.getElementById("sendButton"));
        console.log("userInput:", document.getElementById("userInput"));
        console.log("Script Loaded! Checking appendMessage:", typeof appendMessage);
    }, 2000);

        const sendButton = document.getElementById("sendButton");
        const userInput = document.getElementById("userInput");
        const chatBox = document.querySelector(".messages");

        if (!sendButton || !userInput) {
            console.error("❌ Element sendButton or userInput not found!");
            return;
        } else {
            console.log("✅ Elements found successfully!");
        }

        sendButton.addEventListener("click", async () => {
            let userMessage = userInput.value.trim();
            if (userMessage === "") return;
            
            appendMessage("You", userMessage); 
            userInput.value = "";

            let botReply = await chatWithGemini(userMessage);
            appendMessage("Lexa", botReply);
        });

        userInput.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                sendButton.click();
            }
        });

    async function chatWithGemini(message) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: message }] }]
                })
            });

            const data = await response.json();
            console.log("API Response:", data);

            return data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, aku tidak bisa menjawab.";
        } catch (error) {
            console.error("Error fetching AI response:", error);
            return "Terjadi kesalahan. Coba lagi nanti.";
        }
    }};
