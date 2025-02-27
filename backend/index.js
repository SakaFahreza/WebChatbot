const API_KEY = "AIzaSyAgqRH8TjiF75KE1zdzbv42kLX3_mykaVs";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

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

document.getElementById("sendButton").addEventListener("click", function () {
    let userInput = document.getElementById("userInput");
    let chatBox = document.getElementById("chat-box");
    let messages = document.querySelector(".messages");
    let chatSection = document.getElementById("chat-section");

    // Cek apakah input tidak kosong
    if (userInput.value.trim() !== "") {
        // Tambahkan class untuk mengubah layout setelah chat pertama
        chatSection.classList.add("chat-started");

        // Hapus elemen yang tidak diperlukan setelah pesan pertama
        setTimeout(() => {
            document.querySelector(".chat-header").remove();
            document.querySelector(".quick-actions").remove();
        }, 500);

        // Tambahkan pesan user ke dalam chat
        let userMessage = document.createElement("div");
        userMessage.classList.add("user-message");
        aiMessage.classList.add("ai-message");
        userMessage.textContent = userInput.value;
        messages.appendChild(userMessage);

        // Kosongkan input setelah mengirim
        userInput.value = "";

        // Scroll otomatis ke bawah
        messages.scrollTop = messages.scrollHeight;
    }
});

