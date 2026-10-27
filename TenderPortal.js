// tender-portal.js

// Check authentication status immediately on page load
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("authToken");
    const userEmail = localStorage.getItem("userEmail");

    if (!token) {
        // If not logged in, redirect directly back to the login page
        window.location.href = "/login.html"; 
        return;
    }

    // Display user email if stored
    if (userEmail) {
        const emailEl = document.getElementById("user-email");
        if (emailEl) emailEl.textContent = userEmail;
    }

    // Fetch the tenders right after successful auth verification
    fetchTenders();
});

async function fetchTenders() {
    const token = localStorage.getItem("authToken");
    const loadingEl = document.getElementById("loading");
    const containerEl = document.getElementById("tender-container");

    if (!loadingEl || !containerEl) return;

    loadingEl.style.display = "block";
    containerEl.classList.add("hidden");

    try {
        const response = await fetch("https://api.yourdomain.com/api/tenders", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) {
            logout();
            return;
        }

        const tenders = await response.json();
        renderTenders(tenders);

    } catch (error) {
        console.error("Failed to load tenders:", error);
        loadingEl.textContent = "Failed to load tenders. Please try refreshing.";
    }
}

function renderTenders(tenders) {
    const loadingEl = document.getElementById("loading");
    const containerEl = document.getElementById("tender-container");

    loadingEl.style.display = "none";
    containerEl.classList.remove("hidden");
    containerEl.innerHTML = "";

    if (!tenders || tenders.length === 0) {
        containerEl.innerHTML = `<p class="col-span-full text-center text-slate-500 py-8">No active tenders found at the moment.</p>`;
        return;
    }

    tenders.forEach(tender => {
        const card = document.createElement("div");
        card.className = "bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between";
        
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start gap-2 mb-2">
                    <span class="text-xs font-semibold px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded">${tender.category || 'General'}</span>
                    <span class="text-xs text-slate-400">Deadline: ${tender.deadline}</span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 mb-2">${tender.title}</h3>
                <p class="text-sm text-slate-600 mb-4 line-clamp-3">${tender.description}</p>
            </div>
            <div class="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span class="text-xs text-slate-500">Ref: ${tender.referenceNumber}</span>
                <a href="/tender-details.html?id=${tender.id}" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Read Details &rarr;</a>
            </div>
        `;
        containerEl.appendChild(card);
    });
}

function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    window.location.href = "/login.html";
}