document.addEventListener("DOMContentLoaded", () => {
  loadCategoryFromURL()
  setupFilters()
  loadNavCategories()
  setupMobileNav()
})

function loadCategoryFromURL() {
  const urlParams = new URLSearchParams(window.location.search)
  const categoryId = urlParams.get("category")

  if (!categoryId) {
    window.location.href = "products.html"
    return
  }

  const categories = getCategories()
  const category = categories.find((cat) => cat.id === categoryId)

  if (!category) {
    window.location.href = "products.html"
    return
  }

  // Update page title and breadcrumb
  document.title = `${category.name} - ShopieWorld`
  document.getElementById("categoryTitle").textContent = category.name
  document.getElementById("categoryBreadcrumb").textContent = category.name
  document.getElementById("categoryDescription").textContent = category.description

  loadCategoryProducts(categoryId, category)
}

function getCategories() {
  const categories = localStorage.getItem("categories")
  return categories ? JSON.parse(categories) : []
}

function getProducts() {
  const products = localStorage.getItem("products")
  return products ? JSON.parse(products) : []
}

function loadCategoryProducts(categoryId, category) {
  const products = getProducts()
  const categoryProducts = products.filter((product) => product.category === categoryId)

  // Update product count
  document.getElementById("categoryProductCount").textContent = `${categoryProducts.length} products`

  displayProducts(categoryProducts)
}

function displayProducts(products) {
  const productsGrid = document.getElementById("productsGrid")

  if (products.length === 0) {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase()
    let noProductsMessage = ""

    if (searchTerm) {
      noProductsMessage = `<div style="text-align: center; grid-column: 1/-1; padding: 50px;">
                                  <div style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;">🔍</div>
                                  <h3>No products found matching your search</h3>
                                  <p>Please try a different search term or clear the filters.</p>
                              </div>`
    } else {
      noProductsMessage = `<div style="text-align: center; grid-column: 1/-1; padding: 50px;">
                                  <div style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;">📦</div>
                                  <h3>No products found in this category</h3>
                                  <p>Please check back later or browse other categories.</p>
                              </div>`
    }

    productsGrid.innerHTML = noProductsMessage
    return
  }

  // Ensure proper grid layout
  productsGrid.style.display = "grid"
  productsGrid.style.gridTemplateColumns = "repeat(3, 1fr)"
  productsGrid.style.gap = "25px"

  productsGrid.innerHTML = products.map(createProductCard).join("")
}

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
                ${product.offer ? `<div class="product-offer">🎉 ${product.offer}</div>` : ""}
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

function setupFilters() {
  document.getElementById("searchInput").addEventListener("input", filterProducts)
  document.getElementById("sortFilter").addEventListener("change", filterProducts)
  document.getElementById("statusFilter").addEventListener("change", filterProducts)
  document.getElementById("priceFilter").addEventListener("change", filterProducts)
  addFilterResetButton()
}

function filterProducts() {
  const urlParams = new URLSearchParams(window.location.search)
  const categoryId = urlParams.get("category")
  let products = getProducts().filter((product) => product.category === categoryId)

  // Search filter
  const searchTerm = document.getElementById("searchInput").value.toLowerCase()
  if (searchTerm) {
    products = products.filter(
      (product) => product.code.toLowerCase().includes(searchTerm) || product.name.toLowerCase().includes(searchTerm),
    )
  }

  // Status filter
  const statusFilter = document.getElementById("statusFilter").value
  if (statusFilter !== "all") {
    products = products.filter((product) => product.status === statusFilter)
  }

  // Price filter
  const priceFilter = document.getElementById("priceFilter").value
  if (priceFilter !== "all") {
    const [min, max] = priceFilter.split("-").map((p) => (p === "+" ? Number.POSITIVE_INFINITY : Number.parseInt(p)))
    products = products.filter((product) => {
      if (max === undefined) return product.price >= min
      return product.price >= min && product.price <= max
    })
  }

  // Sort filter
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

  displayProducts(products)
}

function loadNavCategories() {
  const categories = getCategories()
  const categoryDropdown = document.getElementById("categoryDropdown")

  if (categoryDropdown) {
    categoryDropdown.innerHTML = categories
      .map(
        (category) => `
            <li><a href="category.html?category=${category.id}">${category.name}</a></li>
        `,
      )
      .join("")
  }
}

function setupMobileNav() {
  const navToggle = document.getElementById("navToggle")
  const navMenu = document.getElementById("navMenu")

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")
      navToggle.classList.toggle("active")
    })
  }
}

// Utility functions
function openWhatsApp(number, productCode) {
  const message = `Hi! I'm interested in ${productCode}. Is it still available?`
  const url = `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`
  window.open(url, "_blank")
}

function makeCall(number) {
  window.location.href = `tel:${number}`
}

function openGPay(gpayLink, price, productCode) {
  if (gpayLink.startsWith("upi://")) {
    window.location.href = gpayLink
  } else {
    const amount = price
    const note = `Payment for ${productCode}`
    const upiLink = `upi://pay?pa=${gpayLink}&am=${amount}&tn=${encodeURIComponent(note)}`
    window.location.href = upiLink
  }
}

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
  document.getElementById("priceFilter").value = "all"
  filterProducts()
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.placeholder = "Search by name or product code..."
  }
})
