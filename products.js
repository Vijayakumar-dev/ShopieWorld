document.addEventListener("DOMContentLoaded", () => {
  loadProducts()
  setupFilters()
  addFilterResetButton()
})

// Get products from localStorage
function getProducts() {
  const products = localStorage.getItem("products")
  return products ? JSON.parse(products) : []
}

// Declare getCategories function
function getCategories() {
  const categories = localStorage.getItem("categories")
  return categories ? JSON.parse(categories) : []
}

// Declare getSettings function
function getSettings() {
  const settings = localStorage.getItem("settings")
  return settings ? JSON.parse(settings) : { showUncategorized: false }
}

// Create product card HTML
function createProductCard(product) {
  const statusClass = `status-${product.status}`
  const statusText = product.status.charAt(0).toUpperCase() + product.status.slice(1)

  const showActions = product.status === "available"

  return `
        <a href="product-details.html?code=${product.code}" class="product-card" style="text-decoration: none; color: inherit;">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x250?text=No+Image'">
                <div class="status-badge ${statusClass}">${statusText}</div>
            </div>
            <div class="product-info">
                <div class="product-code">${product.code}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">₹${product.price.toLocaleString()}</div>
                ${product.offer ? `<div class="product-offer" style="color: #f59e0b; font-size: 0.9rem; margin-bottom: 10px;">🎉 ${product.offer}</div>` : ""}
                ${
                  showActions
                    ? `
                    <div class="product-actions">
                        <button class="action-btn whatsapp-btn" onclick="openWhatsApp('${product.whatsapp}', '${product.code}')">
                            📱 WhatsApp
                        </button>
                        <button class="action-btn call-btn" onclick="makeCall('${product.contact}')">
                            📞 Call
                        </button>
                    </div>
                    ${
                      product.gpay
                        ? `
                        <div style="margin-top: 10px;">
                            <button class="action-btn" style="background: #4285f4; color: white; width: 100%;" onclick="openGPay('${product.gpay}', '${product.price}', '${product.code}')">
                                💳 Pay with GPay
                            </button>
                        </div>
                    `
                        : ""
                    }
                `
                    : `
                    <div class="product-actions">
                        <div style="text-align: center; color: #666; font-style: italic;">
                            ${product.status === "sold" ? "Sold Out" : "Reserved"}
                        </div>
                    </div>
                `
                }
            </div>
        </a>
    `
}

// Load and display products
function loadProducts() {
  const products = getProducts()
  const categories = getCategories()

  if (products.length === 0) {
    document.getElementById("productsByCategory").innerHTML =
      '<div style="text-align: center; padding: 50px;"><h3>No products available</h3><p>Please check back later.</p></div>'
    return
  }

  loadCategoryQuickLinks()
  loadCategoryFilter()
  displayProductsByCategory(products, categories)
}

function loadCategoryQuickLinks() {
  const categories = getCategories()
  const quickLinksContainer = document.getElementById("categoryQuickLinks")

  if (!quickLinksContainer) return

  quickLinksContainer.innerHTML = `
    <div class="quick-links">
      <span class="quick-links-label">Quick Browse:</span>
      <a href="#all" class="quick-link active" onclick="showAllProducts()">All Products</a>
      ${categories
        .map((category) => `<a href="category.html?category=${category.id}" class="quick-link">${category.name}</a>`)
        .join("")}
    </div>
  `
}

function loadCategoryFilter() {
  const categories = getCategories()
  const categoryFilter = document.getElementById("categoryFilter")

  if (!categoryFilter) return

  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>'

  // Add category options
  categories.forEach((category) => {
    const option = document.createElement("option")
    option.value = category.id
    option.textContent = category.name
    categoryFilter.appendChild(option)
  })
}

function displayProductsByCategory(products, categories) {
  const container = document.getElementById("productsByCategory")
  const settings = getSettings()

  if (!container) return

  let html = ""

  // Group products by category
  categories.forEach((category) => {
    const categoryProducts = products.filter((p) => p.category === category.id)

    if (categoryProducts.length > 0) {
      html += `
        <div class="category-section">
          <div class="category-section-header">
            <div>
              <h2>${category.name}</h2>
              <p>${category.description}</p>
            </div>
            <div class="category-section-actions">
              <span class="product-count">${categoryProducts.length} products</span>
              <a href="category.html?category=${category.id}" class="view-all-category-btn">View All ${category.name}</a>
            </div>
          </div>
          <div class="category-products-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px;">
            ${categoryProducts.slice(0, 6).map(createProductCard).join("")}
          </div>
          ${
            categoryProducts.length > 6
              ? `
            <div style="text-align: center; margin-top: 25px;">
              <a href="category.html?category=${category.id}" class="view-all-category-btn">View All ${categoryProducts.length} Products</a>
            </div>
          `
              : ""
          }
        </div>
      `
    }
  })

  // Show uncategorized products if enabled
  if (settings.showUncategorized) {
    const uncategorizedProducts = products.filter((p) => p.category === "uncategorized" || !p.category)

    if (uncategorizedProducts.length > 0) {
      html += `
        <div class="category-section">
          <div class="category-section-header">
            <div>
              <h2>Other Products</h2>
              <p>Miscellaneous products</p>
            </div>
            <div class="category-section-actions">
              <span class="product-count">${uncategorizedProducts.length} products</span>
            </div>
          </div>
          <div class="category-products-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px;">
            ${uncategorizedProducts.slice(0, 6).map(createProductCard).join("")}
          </div>
        </div>
      `
    }
  }

  if (html === "") {
    html = `
      <div style="text-align: center; padding: 80px 20px; background: white; border-radius: 15px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);">
        <div style="font-size: 4rem; margin-bottom: 20px; opacity: 0.5;">📦</div>
        <h3 style="color: #666; margin-bottom: 10px;">No products available</h3>
        <p style="color: #999;">Products will appear here once they are added.</p>
      </div>
    `
  }

  container.innerHTML = html
}

function showAllProducts() {
  const products = getProducts()
  document.getElementById("productsByCategory").style.display = "none"
  document.getElementById("productsGrid").style.display = "grid"
  displayProducts(products)
}

// Display products with filtering
function displayProducts(products) {
  const productsGrid = document.getElementById("productsGrid")

  if (products.length === 0) {
    const searchTerm = document.getElementById("searchInput").value
    const feedbackMessage = searchTerm
      ? `<div class="search-feedback">
           <div class="search-feedback-icon">🔍</div>
           <h3>No products found for "${searchTerm}"</h3>
           <p>Try adjusting your search terms or filters</p>
         </div>`
      : `<div class="search-feedback">
           <div class="search-feedback-icon">📦</div>
           <h3>No products available</h3>
           <p>Please check back later or browse other categories</p>
         </div>`

    productsGrid.innerHTML = feedbackMessage
    return
  }

  productsGrid.innerHTML = products.map(createProductCard).join("")
}

// Setup filter event listeners
function setupFilters() {
  document.getElementById("searchInput").addEventListener("input", filterProducts)
  document.getElementById("sortFilter").addEventListener("change", filterProducts)
  document.getElementById("statusFilter").addEventListener("change", filterProducts)
  document.getElementById("categoryFilter").addEventListener("change", filterProducts)
}

// Add this after setupFilters function
function addFilterResetButton() {
  const filtersContainer = document.querySelector(".filters")
  if (filtersContainer && !document.getElementById("resetFilters")) {
    const resetBtn = document.createElement("button")
    resetBtn.id = "resetFilters"
    resetBtn.className = "filter-reset-btn"
    resetBtn.textContent = "Clear All Filters"
    resetBtn.onclick = resetAllFilters
    filtersContainer.appendChild(resetBtn)
  }
}

function resetAllFilters() {
  document.getElementById("searchInput").value = ""
  document.getElementById("sortFilter").value = "latest"
  document.getElementById("statusFilter").value = "all"
  document.getElementById("categoryFilter").value = "all"

  // Show category view
  document.getElementById("productsByCategory").style.display = "block"
  document.getElementById("productsGrid").style.display = "none"

  const products = getProducts()
  const categories = getCategories()
  displayProductsByCategory(products, categories)
}

// Update the filterProducts function to handle category-based filtering
function filterProducts() {
  let products = getProducts()
  let isFiltering = false

  // Search filter
  const searchTerm = document.getElementById("searchInput").value.toLowerCase()
  if (searchTerm) {
    products = products.filter(
      (product) => product.code.toLowerCase().includes(searchTerm) || product.name.toLowerCase().includes(searchTerm),
    )
    isFiltering = true
  }

  // Status filter
  const statusFilter = document.getElementById("statusFilter").value
  if (statusFilter !== "all") {
    products = products.filter((product) => product.status === statusFilter)
    isFiltering = true
  }

  // Category filter
  const categoryFilter = document.getElementById("categoryFilter").value
  if (categoryFilter !== "all") {
    products = products.filter((product) => product.category === categoryFilter)
    isFiltering = true
  }

  // Sort filter - FIXED SORTING
  const sortFilter = document.getElementById("sortFilter").value
  switch (sortFilter) {
    case "price-low":
      products.sort((a, b) => a.price - b.price)
      break
    case "price-high":
      products.sort((a, b) => b.price - a.price)
      break
    case "name":
      products.sort((a, b) => a.name.localeCompare(b.name))
      break
    case "latest":
    default:
      products.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      break
  }

  // Show filtered results or category view
  if (isFiltering) {
    document.getElementById("productsByCategory").style.display = "none"
    document.getElementById("productsGrid").style.display = "grid"
    document.getElementById("productsGrid").style.gridTemplateColumns = "repeat(3, 1fr)"
    document.getElementById("productsGrid").style.gap = "25px"
    displayProducts(products)
  } else {
    document.getElementById("productsByCategory").style.display = "block"
    document.getElementById("productsGrid").style.display = "none"
    const categories = getCategories()
    displayProductsByCategory(products, categories)
  }
}

// WhatsApp function
function openWhatsApp(number, productCode) {
  const message = `Hi! I'm interested in saree ${productCode}. Is it still available?`
  const url = `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`
  window.open(url, "_blank")
}

// Call function
function makeCall(number) {
  window.location.href = `tel:${number}`
}

// Add GPay function
function openGPay(gpayLink, price, productCode) {
  if (gpayLink.startsWith("upi://")) {
    // If it's a UPI link, open directly
    window.location.href = gpayLink
  } else {
    // If it's a UPI ID, create the payment link
    const amount = price
    const note = `Payment for saree ${productCode}`
    const upiLink = `upi://pay?pa=${gpayLink}&am=${amount}&tn=${encodeURIComponent(note)}`
    window.location.href = upiLink
  }
}
