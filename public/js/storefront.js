/* public/js/storefront.js */

/**
 * 1. NEW: Check URL on page load for Order Success
 * This runs automatically when the Home page loads.
 */
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if the URL contains ?message=OrderSuccess
    if (urlParams.get('message') === 'OrderSuccess') {
        showToast("Order Confirmed", "Thank you! Your package will be prepared shortly.");
        
        // Clean the URL so refreshing doesn't show the popup again
        window.history.replaceState(null, null, window.location.pathname);
    }
});

/**
 * Handle Add to Cart Logic
 * @param {string} id - The Product ID
 * @param {HTMLElement} btnElement - The button that was clicked
 */
function addToCart(id, btnElement) {
    const originalText = btnElement.innerText;
    btnElement.innerText = "Adding...";
    btnElement.disabled = true;

    fetch('/Cart/add/' + id, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => {
        if (!res.ok) throw new Error("Server response not ok");
        return res.json();
    })
    .then(data => {
        if (data.success) {
            // A. Update Navbar Badge
            const badge = document.getElementById('cart-badge');
            if (badge) badge.innerText = data.totalItems;

            // B. UPDATED: Show Toast with specific text
            showToast("Excellent Choice", "Item added to your panel successfully.");

            // C. Success Button State
            btnElement.innerText = "Added ✔️";
            btnElement.style.background = "#d4af37"; // Gold
            btnElement.style.color = "white";
            
            setTimeout(() => {
                btnElement.innerText = originalText;
                btnElement.disabled = false;
                btnElement.style.background = "";
                btnElement.style.color = "";
            }, 2000);
        } else {
            console.error("Add failed:", data);
            btnElement.innerText = originalText;
            btnElement.disabled = false;
        }
    })
    .catch(err => {
        console.error("Fetch error:", err);
        btnElement.innerText = originalText;
        btnElement.disabled = false;
        // Fallback alert if something goes wrong
        alert("Connection error.");
    });
}

/**
 * 2. UPDATED: Handle Toast Notification Animation
 * Now accepts Title and Message to be dynamic
 */
function showToast(title, message) {
    const toast = document.getElementById("toast-notification");
    
    if (toast) {
        // Dynamic Text Injection: Updates the HTML inside the notification
        if (title) toast.querySelector("h4").innerText = title;
        if (message) toast.querySelector("p").innerText = message;

        // Show Animation
        toast.classList.add("show");
        
        // Hide after 3 seconds
        setTimeout(() => { 
            toast.classList.remove("show"); 
        }, 3000);
    }
}