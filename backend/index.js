const API_KEY = "AIzaSyAgqRH8TjiF75KE1zdzbv42kLX3_mykaVs"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
// Tambahan untuk Stable Diffusion via Hugging Face

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Document Loaded!");

    // Inisialisasi elemen DOM
    const sendButton = document.getElementById("sendButton");
    const userInput = document.getElementById("userInput");
    const chatBox = document.querySelector(".messages");
    const createImageButton = document.getElementById("createImageBtn");
    const suggestionsContainer = document.getElementById("suggestionsContainer");

    // Periksa apakah semua elemen ditemukan
    if (!sendButton || !userInput || !chatBox || !suggestionsContainer) {
        console.error("❌ Element not found!");
        return;
    }

    // Debug untuk memeriksa posisi container saran
    console.log("Suggestion container position:", suggestionsContainer.getBoundingClientRect());

    // Event listener untuk tombol "Create Image"
document.getElementById("createImageBtn").addEventListener("click", function () {
    console.log("Tombol Create Image diklik");
    userInput.value = "Create an image"; 
    userInput.focus();
    userInput.dispatchEvent(new Event('input')); // Picu event input manually
    
    // Test manual untuk menampilkan saran
    showPromptSuggestions([
        "Create an image for my presentation",
        "Create an image of my pet",
        "Create an image for my website",
        "Create an image made out of felt"
    ]);
});

    // Event listener untuk input user
userInput.addEventListener('input', function() {
    const inputValue = userInput.value.trim().toLowerCase();
    console.log("Input berubah:", inputValue);
    
    if (inputValue === "") {
        console.log("Input kosong, saran disembunyikan");
        suggestionsContainer.style.display = "none";
    } 
    else if (inputValue.startsWith("create an image")) {
        console.log("Terdeteksi 'create an image'");
        const additionalText = inputValue.substring("create an image".length).trim();
        if (additionalText) {
            console.log("Ada teks tambahan:", additionalText);
            const matchingSuggestions = getSuggestionsBasedOnInput(additionalText);
            console.log("Saran yang cocok:", matchingSuggestions);
            showPromptSuggestions(matchingSuggestions.length > 0 ? matchingSuggestions : []);
        } else {
            console.log("Menampilkan saran default");
            showPromptSuggestions([
                "Create an image for my presentation",
                "Create an image of my pet",
                "Create an image for my website",
                "Create an image made out of felt"
            ]);
        }
    } else {
        console.log("Input bukan 'create an image', saran disembunyikan");
        suggestionsContainer.style.display = "none";
    }
});
    // Fungsi untuk mendapatkan saran berdasarkan input
    function getSuggestionsBasedOnInput(text) {
        // Daftar semua kemungkinan saran yang ada
        const allSuggestions = [
            "Create an image for my presentation",
            "Create an image of my pet",
            "Create an image for my website",
            "Create an image made out of felt",
            "Create an image of a mountain landscape",
            "Create an image of a beach sunset",
            "Create an image for social media post",
            "Create an image with abstract design",
            "Create an image of a futuristic city",
            "Create an image of a fantasy character",
            "Create an image for my blog header",
            "Create an image of a tropical forest",
            "Create an image with minimalist style",
            "Create an image of a cozy cafe"
        ];
    
        // Filter saran yang mengandung teks yang diketikkan
        return allSuggestions.filter(suggestion => 
            suggestion.toLowerCase().includes(text.toLowerCase())
        );
    }

    // Event listener untuk klik di luar area saran
    document.addEventListener('click', function(event) {
        if (!event.target.closest('#suggestionsContainer') && 
            !event.target.closest('#userInput') &&
            !event.target.closest('#createImageBtn')) {
            suggestionsContainer.style.display = "none";
        }
    });

    sendButton.addEventListener("click", async () => {
        let userMessage = userInput.value.trim();
        if (!userMessage) return;
        
        appendMessage(userMessage, "user-message"); 
        userInput.value = "";
        suggestionsContainer.style.display = "none";

        if (userMessage.toLowerCase().startsWith("create an image")) {
            let imagePrompt = userMessage.substring("create an image".length).trim();
            if (!imagePrompt) {
                appendMessage("Please specify what kind of image to create!", "ai-message");
                return;
            }
            appendMessage("Generating image, please wait...", "ai-message");
            let imageUrl = await generateImageWithStableDiffusion(imagePrompt);
            if (imageUrl) {
                appendImageMessage(imageUrl);
            } else {
                appendMessage("Sorry, I couldn't generate the image. Try again later!", "ai-message");
            }
        } else {
            let botReply = await chatWithGemini(userMessage);
            appendMessage(botReply, "ai-message");
        }
    });

    document.getElementById("attach-file-btn").addEventListener("click", function () {
        document.getElementById("file-input").click();
    });

    document.getElementById("file-input").addEventListener("change", function (event) {
        const files = event.target.files;
        const container = document.getElementById("uploaded-files-container");
        
        if (files.length > 0) {
            container.classList.add("files-visible"); // Tampilkan container jika ada file
        }

        // Iterasi melalui semua file yang dipilih
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            addFileToPreview(file, container);
        }

        // Pastikan container disembunyikan jika tidak ada file setelah penghapusan
        setupRemoveFileListeners(); // Pastikan tombol hapus berfungsi
    });

    // Fungsi untuk menambahkan file ke preview (pastikan ini sudah diperbarui)
    function addFileToPreview(file, container) {
        const fileName = file.name;
        const existingFile = Array.from(container.querySelectorAll(".uploaded-file"))
                .find(element => element.dataset.fileName === fileName);

        if (existingFile) {
            console.log(`File "${fileName}" sudah ada, tidak ditambahkan kembali.`);
            return; // Hentikan jika file sudah ada
        }

        const fileDiv = document.createElement("div");
        fileDiv.classList.add("uploaded-file");
        fileDiv.dataset.fileName = fileName;

        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = function (e) {
                fileDiv.innerHTML = `
                    <img src="${e.target.result}" alt="${fileName}" class="uploaded-image">
                    <span class="file-name" title="${fileName}">${fileName}</span>
                    <button class="remove-file" title="Remove file"><i class="fas fa-times"></i></button>
                `;
                setupRemoveFileListeners();
            };
            reader.readAsDataURL(file);
        } else {
            let iconClass = "fas fa-file";
            if (file.type.includes("pdf")) iconClass = "fas fa-file-pdf";
            else if (file.type.includes("word") || file.name.endsWith(".doc") || file.name.endsWith(".docx")) iconClass = "fas fa-file-word";
            else if (file.type.includes("excel") || file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) iconClass = "fas fa-file-excel";
            else if (file.type.includes("text") || file.name.endsWith(".txt")) iconClass = "fas fa-file-alt";

            fileDiv.innerHTML = `
                <i class="${iconClass} file-icon"></i>
                <span class="file-name" title="${fileName}">${fileName}</span>
                <button class="remove-file" title="Remove file"><i class="fas fa-times"></i></button>
            `;
            setupRemoveFileListeners();
        }

        container.appendChild(fileDiv);
    }

    // Fungsi untuk mengatur event listeners pada tombol hapus
    function setupRemoveFileListeners() {
        document.querySelectorAll(".remove-file").forEach(button => {
            button.removeEventListener("click", handleRemoveFile); // Hapus listener sebelumnya untuk mencegah duplikasi
            button.addEventListener("click", handleRemoveFile);
        });
    }

    // Di dalam fungsi handleRemoveFile, perbarui status container
function handleRemoveFile(event) {
    event.stopPropagation(); // Hentikan propagasi ke parent
    const fileElement = event.target.closest(".uploaded-file");
    const container = document.getElementById("uploaded-files-container");
    const fileInput = document.getElementById("file-input");
    
    if (fileElement) {
        fileElement.remove();
        if (container.children.length === 0) {
            container.classList.remove("files-visible");
        }
        // Reset file-input agar bisa memilih file yang sama lagi
        fileInput.value = ""; // Mengosongkan nilai file-input
    }
}

    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            sendButton.click();
        }
    });

    // Fungsi untuk menampilkan saran
function showPromptSuggestions(suggestions) {
    console.log("Menampilkan saran:", suggestions);
    suggestionsContainer.innerHTML = "";
    
    if (suggestions.length === 0) {
        suggestionsContainer.style.display = "none";
        console.log("Tidak ada saran, container disembunyikan");
        return;
    }

    suggestions.slice(0, 4).forEach(suggestion => {
        let suggestionItem = document.createElement("div");
        suggestionItem.textContent = suggestion;
        suggestionItem.classList.add("suggestion-item");
        suggestionItem.addEventListener("click", function () {
            userInput.value = suggestion;
            userInput.focus();
            suggestionsContainer.style.display = "none";
        });
        suggestionsContainer.appendChild(suggestionItem);
        console.log("Saran ditambahkan:", suggestion);
    });

    suggestionsContainer.style.display = "block";
    console.log("Container saran posisi:", suggestionsContainer.getBoundingClientRect());
    console.log("Container saran style:", window.getComputedStyle(suggestionsContainer));
    console.log("Jumlah anak di container:", suggestionsContainer.children.length);
}

    // Event listener untuk mengklik file di kolom chat
    document.querySelector("#uploaded-files-container").addEventListener("click", function (event) {
        const fileElement = event.target.closest(".uploaded-file");
        if (fileElement) {
            const fileName = fileElement.dataset.fileName;
            const isImage = fileElement.querySelector(".uploaded-image") !== null;

            if (isImage) {
                const imgSrc = fileElement.querySelector(".uploaded-image").src;
                showFilePreview(imgSrc);
            } else {
            showNonImagePreview(fileName); // Pratinjau file non-gambar di sisi kanan            }
        }}
    });

    // Event listener untuk mengklik file non-gambar di container baru (opsional, jika ada)
    document.querySelector("#non-image-files-container").addEventListener("click", function (event) {
        const fileElement = event.target.closest(".non-image-file");
        if (fileElement) {
            const fileName = fileElement.dataset.fileName;
            showNonImagePreview(fileName);
        }
    });

    // Fungsi untuk menampilkan pratinjau file
    function showFilePreview(src) {
        const modal = document.getElementById("file-preview-modal");
        const previewImage = document.getElementById("preview-image");
        
        previewImage.src = src;
        modal.style.display = "flex";

        // Tambahkan event listener untuk menutup modal saat klik gambar atau di luar modal
        function closeModal(event) {
            // Jika klik di luar modal atau langsung pada gambar, tutup modal
            if (event.target === modal || event.target === previewImage) {
                modal.style.display = "none";
                modal.removeEventListener("click", closeModal); // Hapus listener untuk mencegah duplikat
            }
        }

        // Tambahkan event listener untuk klik pada modal
        modal.addEventListener("click", closeModal);
    }

    // Fungsi baru untuk menampilkan pratinjau file non-gambar di sisi kanan
    function showNonImagePreview(fileName) {
        const preview = document.getElementById("non-image-preview");
        const previewText = document.getElementById("preview-text");
        const previewPdf = document.getElementById("preview-pdf");
        const chatContainer = document.querySelector(".chat-container");

        // Tambahkan kelas untuk menggeser kolom chat
        chatContainer.classList.add("preview-active");

        // Sembunyikan semua konten pratinjau terlebih dahulu
        previewText.style.display = "none";
        previewPdf.style.display = "none";

        if (fileName.endsWith(".pdf")) {
                const fileInput = document.getElementById("file-input");
                const files = fileInput.files;
                for (let i = 0; i < files.length; i++) {
                    if (files[i].name === fileName) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            pdfjsLib.getDocument({ data: new Uint8Array(e.target.result) }).promise.then(function(pdf) {
                                pdf.getPage(1).then(function(page) {
                                    var canvas = document.createElement('canvas');
                                    var context = canvas.getContext('2d');
                                    var viewport = page.getViewport({ scale: 1.5 });
                                    canvas.width = viewport.width;
                                    canvas.height = viewport.height;
                                    page.render({ canvasContext: context, viewport: viewport });
                                    previewPdf.src = canvas.toDataURL();
                                    previewPdf.style.display = "block";
                                });});
                            }}}
        } else if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
            // Untuk DOC/DOCX, kamu bisa menggunakan library seperti `docx-preview` atau link ke viewer online
            previewText.textContent = `Preview for ${fileName} is not fully supported. You can download or view it in a separate application.`;
            previewText.style.display = "block";
        } else if (fileName.endsWith(".js") || fileName.endsWith(".txt") || fileName.endsWith(".html") || fileName.endsWith(".css") || fileName.endsWith(".py") || fileName.endsWith(".java") || fileName.endsWith(".php") || fileName.endsWith(".json") || fileName.endsWith(".xml") || fileName.endsWith(".csv")) {
            // Baca isi file teks/kode menggunakan FileReader
            const fileInput = document.getElementById("file-input");
            const files = fileInput.files;
            for (let i = 0; i < files.length; i++) {
                if (files[i].name === fileName) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        previewText.textContent = e.target.result;
                        previewText.style.display = "block";
                    };
                    reader.readAsText(files[i]);
                    break;
                }
            }
        } else {
            previewText.textContent = `Preview for ${fileName} is not supported.`;
            previewText.style.display = "block";
        }

        preview.style.display = "block";

        // Menutup pratinjau saat klik tombol close
        const closeButton = document.querySelector(".preview-close");
        closeButton.addEventListener("click", function () {
            preview.style.display = "none";
            previewText.textContent = ""; // Kosongkan teks
            previewPdf.src = ""; // Kosongkan PDF
            chatContainer.classList.remove("preview-active"); // Hapus kelas untuk mengembalikan posisi
        }, { once: true }); // Hapus listener setelah sekali klik untuk mencegah duplikat
    }
    
    // Fungsi untuk menambahkan pesan ke chat box
    function appendMessage(message, className) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", className);
    
        let formattedMessage = message
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n\d+\.\s(.*?)/g, "<li>$1</li>")
            .replace(/\n\* (.*?)/g, "<li>$1</li>");
    
        if (/<li>/.test(formattedMessage)) {
            formattedMessage = /^\d+\./.test(message.trim()) ? `<ol>${formattedMessage}</ol>` : `<ul>${formattedMessage}</ul>`;
        }
    
        messageElement.innerHTML = formattedMessage; 
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Fungsi baru untuk menampilkan gambar
    function appendImageMessage(imageUrl) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", "ai-message");
        const imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        imgElement.style.maxWidth = "100%";
        imgElement.style.borderRadius = "10px";
        messageElement.appendChild(imgElement);
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Fungsi untuk berkomunikasi dengan API Gemini
    async function chatWithGemini(message) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
            });

            const data = await response.json();
            console.log("API Response:", data);

            let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, aku tidak bisa menjawab.";
            return reply.replace(/\n/g, "<br>");

        } catch (error) {
            console.error("❌ Error fetching AI response:", error);
            return "Terjadi kesalahan. Coba lagi nanti.";
        }
    }

    // Fungsi baru untuk generate gambar dengan Stable Diffusion
    async function generateImageWithStableDiffusion(prompt) {
        try {
            const response = await fetch(HF_API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_API_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ inputs: prompt })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            console.log("Image generated successfully:", imageUrl);
            return imageUrl;
        } catch (error) {
            console.error("❌ Error generating image with Stable Diffusion:", error);
            return null;
        }
    }

    // Panggil ini sebagai debug awal untuk memeriksa posisi
    console.log("Initial position of suggestions container:", suggestionsContainer.getBoundingClientRect());
});

document.getElementById("sendButton").addEventListener("click", function () {
    let userInput = document.getElementById("userInput");
    let messages = document.querySelector(".messages");
    let chatSection = document.getElementById("chat-section");
    let chatHeader = document.querySelector(".chat-header");
    let quickActions = document.querySelector(".quick-actions");

    // Cek apakah input tidak kosong dan belum ada pesan user sebelumnya
    if (userInput.value.trim() !== "" && messages.querySelector(".user-message") === null) {
        // Tambahkan class untuk mengubah layout setelah chat pertama
        chatSection.classList.add("chat-started");

        // Hapus elemen yang tidak diperlukan setelah pesan pertama (tanpa delay)
        if (chatHeader) chatHeader.remove(); // Hapus header "Chat With Your AI"
        if (quickActions) quickActions.remove(); // Hapus quick actions
        // Hapus pesan awal AI jika ada
        const initialMessage = messages.querySelector("p");
        if (initialMessage && initialMessage.textContent === "Hi! How can I help you today?") {
            initialMessage.remove();
        }

        // Tambahkan pesan user ke dalam chat
        let userMessage = document.createElement("div");
        aiMessage.classList.add("ai-message");
        userMessage.classList.add("user-message");
        userMessage.textContent = userInput.value;
        messages.appendChild(userMessage);

        // Kosongkan input setelah mengirim
        userInput.value = "";

        // Scroll otomatis ke bawah
        messages.scrollTop = messages.scrollHeight;
    }
});
document.getElementById("userInput").addEventListener("keydown", function (event) {
    if (event.key === "Enter" && this.value.trim() !== "") {
        document.querySelector(".input-container").classList.add("active");
    }
});

