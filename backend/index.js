const API_KEY = "AIzaSyAWDcRqKHnYaj4l1_A7wfL8Cwv7nX5uDm0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Document Loaded!");

    const sendButton = document.getElementById("sendButton");
    const userInput = document.getElementById("userInput");
    const chatBox = document.querySelector(".messages");

    if (!sendButton || !userInput || !chatBox) {
        console.error("❌ Element sendButton, userInput, or chatBox not found!");
        return;
    }

    sendButton.addEventListener("click", async () => {
        let userMessage = userInput.value.trim();
        if (!userMessage) return;
        
        appendMessage(userMessage, "user-message"); 
        userInput.value = "";

        let botReply = await chatWithGemini(userMessage);
        appendMessage(botReply, "ai-message");
    });

    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            sendButton.click();
        }
    });

    function appendMessage(message, className) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", className);
    
        let formattedMessage = message
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // **bold** → <strong>
            .replace(/\n\d+\.\s(.*?)/g, "<li>$1</li>") // "1. item" → <li>item</li>
            .replace(/\n\* (.*?)/g, "<li>$1</li>"); // "* item" → <li>item</li>
    
        // Bungkus list dalam <ul> atau <ol>
        if (/<li>/.test(formattedMessage)) {
            if (/^\d+\./.test(message.trim())) {
                formattedMessage = `<ol>${formattedMessage}</ol>`; // Jika ada angka → ordered list
            } else {
                formattedMessage = `<ul>${formattedMessage}</ul>`; // Jika pakai * → unordered list
            }
        }
    
        messageElement.innerHTML = formattedMessage; 
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    

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

            let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, aku tidak bisa menjawab.";
            return reply.replace(/\n/g, "<br>"); // Ubah newline jadi <br>

        } catch (error) {
            console.error("❌ Error fetching AI response:", error);
            return "Terjadi kesalahan. Coba lagi nanti.";
        }
    }
});
