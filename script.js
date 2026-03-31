/* State Management */
const state = {
    cart: [],
    currentUser: null, // null means not logged in
    currentPage: 'home',
    stream: null, // webcam stream
    pendingAction: null,
    pendingRedirect: null
};

/* Mock Product Data */
const products = [
    { id: 1, name: "Aero Aviator", price: 129.99, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400", category: "Men" },
    { id: 2, name: "Classic Wayfarer", price: 149.99, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=400", category: "Unisex" },
    { id: 3, name: "BlueLight Shield", price: 89.99, image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=400", category: "Computer Glasses" },
    { id: 4, name: "Vintage Round", price: 159.99, image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&q=80&w=400", category: "Women" },
    { id: 5, name: "Titanium Rimless", price: 199.99, image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=400", category: "Men" },
    { id: 6, name: "Cat Eye Onyx", price: 139.99, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400", category: "Women" },
    { id: 7, name: "Bold Square", price: 119.99, image: "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&q=80&w=400", category: "Men" },
    { id: 8, name: "Sleek Rectangular", price: 109.99, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400", category: "Unisex" },
    { id: 9, name: "Classic Oval", price: 99.99, image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=400", category: "Women" },
    { id: 10, name: "Modern Geometric", price: 139.99, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=400", category: "Unisex" },
    { id: 11, name: "Urban Semi-rimless", price: 129.99, image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=400", category: "Men" },
];

/* --- SPA Navigation & Rendering --- */
function navigateTo(page) {
    if ((page === 'profile' || page === 'checkout') && !state.currentUser) {
        showToast("Please login to continue");
        state.pendingRedirect = page;
        page = 'login';
    }
    
    state.currentPage = page;
    renderPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderPage(pageId) {
    const appContent = document.getElementById('app-content');
    const template = document.getElementById(`view-${pageId}`);
    
    if (template) {
        appContent.innerHTML = template.innerHTML;
        initPageLogic(pageId);
    } else {
        appContent.innerHTML = '<h2>Page not found</h2>';
    }
}

function initPageLogic(pageId) {
    if (pageId === 'home') {
        renderProducts();
    } else if (pageId === 'profile') {
        populateProfileForm();
    } else if (pageId === 'checkout') {
        renderCheckout();
    }
}

/* --- Cart Functionality --- */
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    sidebar.classList.toggle('closed');
    overlay.classList.toggle('hidden');
    
    renderCart();
}

function addToCart(productId) {
    if (!state.currentUser) {
        showToast("Please login to continue");
        state.pendingAction = () => addToCart(productId);
        navigateTo('login');
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    state.cart.push(product);
    updateCartCount();
    showToast(`${product.name} added to cart!`);
}

function removeFromCart(index) {
    state.cart.splice(index, 1);
    updateCartCount();
    renderCart();
    
    // If currently on checkout page, re-render it too
    if (state.currentPage === 'checkout') {
        renderCheckout();
    }
}

function updateCartCount() {
    const countEl = document.getElementById('cartCount');
    countEl.textContent = state.cart.length;
    
    if (state.cart.length === 0) {
        countEl.classList.add('hidden');
    } else {
        countEl.classList.remove('hidden');
    }
}

function renderCart() {
    const cartItemsEl = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotalAmt');
    
    if (state.cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
        totalEl.textContent = '$0.00';
        return;
    }
    
    let html = '';
    let total = 0;
    
    state.cart.forEach((item, index) => {
        total += item.price;
        html += `
            <div class="cart-item">
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${index})" title="Remove">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
    });
    
    cartItemsEl.innerHTML = html;
    totalEl.textContent = `$${total.toFixed(2)}`;
}

/* --- Checkout Logic --- */
function renderCheckout() {
    const checkoutItemsEl = document.getElementById('checkoutItems');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const totalEl = document.getElementById('checkoutTotal');
    const checkoutForm = document.querySelector('.checkout-form');
    
    if (state.cart.length === 0) {
        checkoutItemsEl.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
        subtotalEl.textContent = '$0.00';
        totalEl.textContent = '$0.00';
        return;
    }
    
    if(state.currentUser) {
        document.getElementById('checkoutName').value = state.currentUser.name;
        document.getElementById('checkoutAddress').value = state.currentUser.address;
    }

    let html = '';
    let total = 0;
    
    state.cart.forEach((item) => {
        total += item.price;
        html += `
            <div class="summary-row">
                <span>${item.name}</span>
                <span>$${item.price.toFixed(2)}</span>
            </div>
        `;
    });
    
    checkoutItemsEl.innerHTML = html;
    subtotalEl.textContent = `$${total.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
    
    document.getElementById('checkoutSuccess').classList.add('hidden');
    checkoutForm.style.display = 'block';
}

function handleCheckout(e) {
    e.preventDefault();
    if(state.cart.length === 0) {
        showToast("Add items to your cart first!");
        return;
    }

    // Mock API call delay
    const btn = document.getElementById('checkoutBtnText');
    const ogText = btn.textContent;
    btn.textContent = 'Processing...';
    btn.disabled = true;

    setTimeout(() => {
        // Success
        state.cart = [];
        updateCartCount();
        
        document.querySelector('.checkout-grid').style.display = 'none';
        document.getElementById('checkoutSuccess').classList.remove('hidden');
        document.getElementById('checkoutSuccess').classList.add('show');
    }, 1500);
}

/* --- Authentication & Profile --- */
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pwd = document.getElementById('password').value;
    
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === pwd);
    
    if (!user) {
        showToast("Invalid email or password!");
        return;
    }
    
    state.currentUser = {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || ''
    };
    localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    
    showToast("Logged in successfully!");
    
    // Clear pending actions and redirect to home
    state.pendingAction = null;
    state.pendingRedirect = null;
    navigateTo('home');
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const pwd = document.getElementById('signupPassword').value;
    const confirmPwd = document.getElementById('signupConfirmPassword').value;
    
    if (pwd !== confirmPwd) {
        showToast("Passwords do not match!");
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        showToast("Email already registered!");
        return;
    }
    
    const newUser = {
        name: name,
        email: email,
        password: pwd,
        phone: '',
        address: ''
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    state.currentUser = {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address
    };
    localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    
    showToast("Account created successfully!");
    
    state.pendingAction = null;
    state.pendingRedirect = null;
    navigateTo('home');
}

function handleLogout() {
    state.currentUser = null;
    localStorage.removeItem('currentUser');
    showToast("Logged out.", false);
    navigateTo('login');
}

function populateProfileForm() {
    if (!state.currentUser) return;
    
    document.getElementById('profName').value = state.currentUser.name;
    document.getElementById('profEmail').value = state.currentUser.email;
    document.getElementById('profPhone').value = state.currentUser.phone || '';
    document.getElementById('profAddress').value = state.currentUser.address || '';
    
    // Set initials avatar
    const initial = state.currentUser.name.charAt(0).toUpperCase();
    document.getElementById('profileInitials').textContent = initial;
}

function handleProfileUpdate(e) {
    e.preventDefault();
    
    state.currentUser.name = document.getElementById('profName').value;
    state.currentUser.phone = document.getElementById('profPhone').value;
    state.currentUser.address = document.getElementById('profAddress').value;
    
    localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    let userIndex = users.findIndex(u => u.email === state.currentUser.email);
    if (userIndex !== -1) {
        users[userIndex].name = state.currentUser.name;
        users[userIndex].phone = state.currentUser.phone;
        users[userIndex].address = state.currentUser.address;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    const initial = state.currentUser.name.charAt(0).toUpperCase();
    document.getElementById('profileInitials').textContent = initial;
    
    showToast("Profile details updated successfully!");
}

/* --- WebRTC Camera Try-On Feature --- */
async function startVirtualTryOn() {
    if (!state.currentUser) {
        showToast("Please login to continue");
        state.pendingAction = () => startVirtualTryOn();
        navigateTo('login');
        return;
    }

    const section = document.getElementById('tryon-section');
    section.classList.remove('hidden');
    section.scrollIntoView({behavior: 'smooth'});
    
    // Ensure container and elements are in initial state
    const container = document.querySelector('.tryon-container');
    if (container) container.style.display = 'block';
    
    const faceResult = document.getElementById('face-shape-result');
    if (faceResult) faceResult.classList.add('hidden');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoEl = document.getElementById('webcam');
        if (videoEl) videoEl.srcObject = stream;
        state.stream = stream;
        
        document.getElementById('captureBtn').disabled = false;
        document.getElementById('captureBtn').textContent = 'Analyze My Face';
        document.getElementById('scanning-overlay').classList.add('hidden');
        document.getElementById('recommendation-results').classList.add('hidden');
        
    } catch (err) {
        console.error("Camera access denied", err);
        showToast("Camera access denied. Cannot use Virtual Try-On.");
    }
}

function stopVirtualTryOn() {
    document.getElementById('tryon-section').classList.add('hidden');
    if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
        state.stream = null;
    }
}

function captureFace() {
    // Show scanning animation
    document.getElementById('scanning-overlay').classList.remove('hidden');
    document.getElementById('captureBtn').disabled = true;
    document.getElementById('captureBtn').textContent = 'Analyzing...';
    
    // Mock processing timeout
    setTimeout(() => {
        stopVirtualTryOn(); // Stop cam
        document.getElementById('tryon-section').classList.remove('hidden'); // keep section visible
        
        // Hide video parts
        document.querySelector('.tryon-container').style.display = 'none';
        
        // Show face shape result
        const faceResult = document.getElementById('face-shape-result');
        if (faceResult) {
            faceResult.classList.remove('hidden');
            document.getElementById('detected-shape').textContent = 'Round'; // Mock detection
            document.getElementById('face-confirm-actions').classList.remove('hidden');
            document.getElementById('face-change-options').classList.add('hidden');
        }
        
    }, 2500);
}

function showFaceShapeOptions() {
    document.getElementById('face-confirm-actions').classList.add('hidden');
    document.getElementById('face-change-options').classList.remove('hidden');
}

function confirmFaceShape(shape) {
    document.getElementById('face-shape-result').classList.add('hidden');
    
    const resultsEl = document.getElementById('recommendation-results');
    resultsEl.classList.remove('hidden');
    
    let recommended = [];
    if (shape === 'Round') {
        recommended = products.filter(p => p.name.match(/Square|Rectangular|Wayfarer/i));
    } else if (shape === 'Square') {
        recommended = products.filter(p => p.name.match(/Round|Oval|Aviator/i));
    } else if (shape === 'Oval') {
        recommended = [...products]; // all frames
    }
    
    // Fallback if empty (should not happen with our mock data, but good practice)
    if (recommended.length === 0) recommended = products.slice(0, 3);
    
    const grid = document.getElementById('recommendedProductsGrid');
    grid.innerHTML = recommended.map(product => generateProductHTML(product)).join('');
    
    showToast(`Showing recommendations for ${shape} face shape.`);
}


/* --- Product UI Generators --- */
function renderProducts() {
    const grid = document.getElementById('productGrid');
    if(grid) {
        grid.innerHTML = products.map(product => generateProductHTML(product)).join('');
    }
}

function filterCategory(category, element) {
    const pills = document.querySelectorAll('.filter-pills .pill');
    if (pills) {
        pills.forEach(pill => pill.classList.remove('active'));
    }
    if (element) {
        element.classList.add('active');
    }
    
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
    let filtered = products;
    if (category !== 'All') {
        filtered = products.filter(p => {
            if (category === 'Men' || category === 'Women') {
                return p.category === category || p.category === 'Unisex';
            }
            return p.category === category;
        });
    }
    
    if (filtered.length === 0) {
         grid.innerHTML = '<p class="empty-cart-msg" style="grid-column: 1/-1;">No products found.</p>';
    } else {
         grid.innerHTML = filtered.map(p => generateProductHTML(p)).join('');
    }
}

function generateProductHTML(product) {
    return `
        <div class="product-card">
            <div class="product-image-wrap">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <div>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})" title="Add to Cart">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg>
                </button>
            </div>
        </div>
    `;
}

/* --- Utilities --- */
function showToast(message) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-message');
    
    msgEl.textContent = message;
    
    toast.classList.remove('hidden');
    // Force reflow
    void toast.offsetWidth;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
    }
    updateCartCount();
    navigateTo('home'); // Load default view
});

function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    if (state.currentPage !== 'home') navigateTo('home');
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    const filtered = products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
    if (filtered.length === 0) {
        grid.innerHTML = '<p class="empty-cart-msg" style="grid-column: 1/-1;">No products found.</p>';
    } else {
        grid.innerHTML = filtered.map(p => generateProductHTML(p)).join('');
    }
}
const searchInput = document.getElementById('searchInput');
if (searchInput) searchInput.addEventListener('input', handleSearch);
