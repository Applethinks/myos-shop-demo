document.addEventListener("DOMContentLoaded", () => {
    // ========================================
    // ELEMENTS
    // ========================================

    const productGrid = document.getElementById("product-grid");
    const productCount = document.getElementById("product-count");
    const emptyProducts = document.getElementById("empty-products");

    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("product-search");
    const sortSelect = document.getElementById("sort-products");

    const filterButtons = document.querySelectorAll(".filter-button");
    const collectionLinks = document.querySelectorAll("[data-category-link]");

    const cartToggle = document.getElementById("cart-toggle");
    const cartClose = document.getElementById("cart-close");
    const cartPanel = document.getElementById("cart-panel");
    const cartBackdrop = document.getElementById("cart-backdrop");

    const cartCount = document.getElementById("cart-count");
    const cartHeadingCount = document.getElementById("cart-heading-count");
    const cartItems = document.getElementById("cart-items");
    const cartSubtotal = document.getElementById("cart-subtotal");
    const checkoutButton = document.getElementById("checkout-button");

    const newsletterForm = document.getElementById("newsletter-form");
    const newsletterMessage = document.getElementById("newsletter-message");

    const liveMessage = document.getElementById("live-message");
    const currentYear = document.getElementById("current-year");

    if (!productGrid) {
        console.error("NESTORA: Product grid not found.");
        return;
    }

    // ========================================
    // PRODUCT DATA
    // ========================================

    const originalProducts = Array.from(
        productGrid.querySelectorAll(".product-card")
    );

    let activeCategory = "All";
    let searchTerm = "";

    const cart = new Map();
    const wishlist = new Set();

    const money = amount =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(amount);

    // ========================================
    // PRODUCT SEARCH, FILTER AND SORT
    // ========================================

    function updateProducts() {
        const matchingProducts = originalProducts.filter(product => {
            const name = product.dataset.name || "";
            const category = product.dataset.category || "";
            const description =
                product.querySelector(".product-info p")?.textContent || "";

            const searchableText =
                `${name} ${category} ${description}`.toLowerCase();

            const matchesSearch = searchableText.includes(searchTerm);

            const matchesCategory =
                activeCategory === "All" ||
                category === activeCategory;

            return matchesSearch && matchesCategory;
        });

        const sortMode = sortSelect?.value || "featured";

        matchingProducts.sort((a, b) => {
            const nameA = a.dataset.name || "";
            const nameB = b.dataset.name || "";

            const priceA = Number(a.dataset.price) || 0;
            const priceB = Number(b.dataset.price) || 0;

            switch (sortMode) {
                case "price-low":
                    return priceA - priceB;

                case "price-high":
                    return priceB - priceA;

                case "name":
                    return nameA.localeCompare(nameB);

                default:
                    return (
                        originalProducts.indexOf(a) -
                        originalProducts.indexOf(b)
                    );
            }
        });

        // Remove the current order and insert matching products
        // in their newly sorted order.
        originalProducts.forEach(product => {
            product.hidden = true;
        });

        matchingProducts.forEach(product => {
            product.hidden = false;
            productGrid.appendChild(product);
        });

        if (productCount) {
            productCount.textContent =
                `${matchingProducts.length} ` +
                `${matchingProducts.length === 1 ? "piece" : "pieces"}`;
        }

        if (emptyProducts) {
            emptyProducts.hidden = matchingProducts.length !== 0;
        }
    }

    // Search while typing
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            searchTerm = searchInput.value.trim().toLowerCase();
            updateProducts();
        });
    }

    // Prevent the search form from reloading the page
    if (searchForm) {
        searchForm.addEventListener("submit", event => {
            event.preventDefault();

            searchTerm = searchInput?.value.trim().toLowerCase() || "";
            updateProducts();

            document.getElementById("products")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    }

    // Sorting
    if (sortSelect) {
        sortSelect.addEventListener("change", updateProducts);
    }

    // Category buttons
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            activeCategory = button.dataset.category || "All";

            filterButtons.forEach(filter => {
                const selected =
                    filter.dataset.category === activeCategory;

                filter.classList.toggle("active", selected);
                filter.setAttribute("aria-pressed", String(selected));
            });

            updateProducts();
        });
    });

    // Collection cards select their matching category
    collectionLinks.forEach(link => {
        link.addEventListener("click", () => {
            const category = link.dataset.categoryLink;

            const matchingButton = Array.from(filterButtons).find(
                button => button.dataset.category === category
            );

            if (matchingButton) {
                matchingButton.click();
            }
        });
    });

    // ========================================
    // LIVE MESSAGE
    // ========================================

    let messageTimer;

    function showMessage(message) {
        if (!liveMessage) return;

        liveMessage.textContent = message;
        liveMessage.classList.add("is-visible");

        clearTimeout(messageTimer);

        messageTimer = setTimeout(() => {
            liveMessage.classList.remove("is-visible");
        }, 2400);
    }

    // ========================================
    // WISHLIST
    // ========================================

    document.querySelectorAll(".wishlist-button").forEach(button => {
        button.addEventListener("click", () => {
            const product = button.closest(".product-card");

            if (!product) return;

            const id = product.dataset.id;
            const name = product.dataset.name || "Product";

            if (wishlist.has(id)) {
                wishlist.delete(id);
                button.classList.remove("is-active");
                button.textContent = "♡";
                button.setAttribute(
                    "aria-label",
                    `Add ${name} to wishlist`
                );

                showMessage(`${name} removed from wishlist.`);
            } else {
                wishlist.add(id);
                button.classList.add("is-active");
                button.textContent = "♥";
                button.setAttribute(
                    "aria-label",
                    `Remove ${name} from wishlist`
                );

                showMessage(`${name} added to wishlist.`);
            }
        });
    });

    // ========================================
    // SHOPPING CART
    // ========================================

    function openCart() {
        if (!cartPanel) return;

        cartPanel.classList.add("is-open");
        cartPanel.setAttribute("aria-hidden", "false");
        cartPanel.removeAttribute("inert");

        cartToggle?.setAttribute("aria-expanded", "true");

        if (cartBackdrop) {
            cartBackdrop.hidden = false;
        }

        document.body.style.overflow = "hidden";
        cartClose?.focus();
    }

    function closeCart() {
        if (!cartPanel) return;

        cartPanel.classList.remove("is-open");
        cartPanel.setAttribute("aria-hidden", "true");
        cartPanel.setAttribute("inert", "");

        cartToggle?.setAttribute("aria-expanded", "false");

        if (cartBackdrop) {
            cartBackdrop.hidden = true;
        }

        document.body.style.overflow = "";
        cartToggle?.focus();
    }

    cartToggle?.addEventListener("click", openCart);
    cartClose?.addEventListener("click", closeCart);
    cartBackdrop?.addEventListener("click", closeCart);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && cartPanel?.classList.contains("is-open")) {
            closeCart();
        }
    });

    // Add products to the cart
    document.querySelectorAll("[data-add-to-cart]").forEach(button => {
        button.addEventListener("click", () => {
            const product = button.closest(".product-card");

            if (!product) return;

            const id = product.dataset.id;
            const name = product.dataset.name || "Product";
            const price = Number(product.dataset.price) || 0;

            if (cart.has(id)) {
                cart.get(id).quantity += 1;
            } else {
                cart.set(id, {
                    id,
                    name,
                    price,
                    quantity: 1
                });
            }

            renderCart();
            showMessage(`${name} added to your bag.`);
        });
    });

    function renderCart() {
        const products = Array.from(cart.values());

        const totalQuantity = products.reduce(
            (total, product) => total + product.quantity,
            0
        );

        const subtotal = products.reduce(
            (total, product) =>
                total + product.price * product.quantity,
            0
        );

        if (cartCount) {
            cartCount.textContent = totalQuantity;
        }

        if (cartHeadingCount) {
            cartHeadingCount.textContent = `(${totalQuantity})`;
        }

        if (cartSubtotal) {
            cartSubtotal.textContent = money(subtotal);
        }

        if (!cartItems) return;

        if (products.length === 0) {
            cartItems.innerHTML = `
                <p class="cart-empty">
                    Your bag is waiting for something lovely.
                </p>
            `;
            return;
        }

        cartItems.innerHTML = products.map(product => `
            <div class="cart-item" data-cart-item="${product.id}">
                <div class="cart-item-info">
                    <h3>${escapeHTML(product.name)}</h3>
                    <p>${money(product.price)} each</p>

                    <div class="cart-quantity">
                        <button
                            type="button"
                            data-cart-action="decrease"
                            data-id="${product.id}"
                            aria-label="Decrease quantity of ${escapeHTML(product.name)}"
                        >−</button>

                        <span>${product.quantity}</span>

                        <button
                            type="button"
                            data-cart-action="increase"
                            data-id="${product.id}"
                            aria-label="Increase quantity of ${escapeHTML(product.name)}"
                        >+</button>
                    </div>
                </div>

                <div class="cart-item-side">
                    <strong>${money(product.price * product.quantity)}</strong>

                    <button
                        type="button"
                        class="remove-cart-item"
                        data-cart-action="remove"
                        data-id="${product.id}"
                    >
                        Remove
                    </button>
                </div>
            </div>
        `).join("");
    }

    // Escape product names before inserting them into HTML
    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    // Change quantities or remove items
    cartItems?.addEventListener("click", event => {
        const button = event.target.closest("[data-cart-action]");

        if (!button) return;

        const id = button.dataset.id;
        const action = button.dataset.cartAction;
        const product = cart.get(id);

        if (!product) return;

        if (action === "increase") {
            product.quantity += 1;
        }

        if (action === "decrease") {
            product.quantity -= 1;

            if (product.quantity <= 0) {
                cart.delete(id);
            }
        }

        if (action === "remove") {
            cart.delete(id);
        }

        renderCart();
    });

    // Checkout is a demonstration only
    checkoutButton?.addEventListener("click", () => {
        if (cart.size === 0) {
            showMessage("Your bag is empty.");
            return;
        }

        showMessage("Demo store: real checkout isn't available.");
    });

    // ========================================
    // NEWSLETTER DEMO
    // ========================================

    newsletterForm?.addEventListener("submit", event => {
        event.preventDefault();

        if (newsletterMessage) {
            newsletterMessage.textContent =
                "Thanks for your interest! This is a demo form.";
        }

        newsletterForm.reset();
    });

    // ========================================
    // FOOTER YEAR
    // ========================================

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Initial product and cart display
    updateProducts();
    renderCart();
});