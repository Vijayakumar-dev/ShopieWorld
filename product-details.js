document.addEventListener("DOMContentLoaded", () => {
  loadProductDetails()
  loadNavCategories()
  setupMobileNav()
  setupImageZoom()
})

function loadProductDetails() {
  const urlParams = new URLSearchParams(window.location.search)
  const productCode = urlParams.get("code")

  if (!productCode) {
    showErrorState()
    return
  }

  // Show loading state
  document.getElementById("loadingState").style.display = "block"
  document.getElementById("productDetailsContainer").style.display = "none"

  // Simulate loading delay for better UX
  setTimeout(() => {
    const products = getProducts()
    const product = products.find((p) => p.code === productCode)

    if (!product) {
      showErrorState()
      return
    }

    displayProductDetails(product)
  }, 500)
}

function showErrorState() {
  document.getElementById("loadingState").style.display = "none"
  document.getElementById("errorState").style.display = "block"
  document.getElementById("productDetailsContainer").style.display = "none"
}

function displayProductDetails(product) {
  document.getElementById("loadingState").style.display = "none"
  document.getElementById("errorState").style.display = "none"
  document.getElementById("productDetailsContainer").style.display = "block"

  // Update page title and breadcrumb
  document.title = `${product.name} - ShopieWorld`
  document.getElementById("productBreadcrumb").textContent = product.name

  const categories = getCategories()
  const category = categories.find((cat) => cat.id === product.category)
  const categoryName = category ? category.name : "Uncategorized"

  const statusClass = `status-${product.status}`
  const statusText = product.status.charAt(0).toUpperCase() + product.status.slice(1)
  const showActions = product.status === "available"

  const productDetailsHTML = `
        <div class="product-details-grid">
            <div class="product-image-section">
                <div class="main-image-container">
                    <img src="${product.image}" alt="${product.name}" class="main-product-image" onclick="openImageZoom('${product.image}')" onerror="this.src='https://via.placeholder.com/500x500?text=No+Image'">
                    <div class="zoom-hint">🔍 Click to zoom</div>
                    <div class="status-badge ${statusClass}">${statusText}</div>
                </div>
            </div>

            <div class="product-info-section">
                <div class="product-header">
                    <div class="product-code">Product Code: ${product.code}</div>
                    <h1 class="product-title">${product.name}</h1>
                    <div class="product-category">
                        <span class="category-label">Category:</span>
                        <a href="category.html?category=${product.category}" class="category-link">${categoryName}</a>
                    </div>
                </div>

                <div class="product-pricing">
                    <div class="price-main">₹${product.price.toLocaleString()}</div>
                    ${product.offer ? `<div class="offer-badge">🎉 ${product.offer}</div>` : ""}
                </div>

                <div class="product-details-info">
                    <div class="detail-item">
                        <span class="detail-label">Color:</span>
                        <span class="detail-value">${product.color}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value status-text ${statusClass}">${statusText}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Added:</span>
                        <span class="detail-value">${new Date(product.dateAdded).toLocaleDateString()}</span>
                    </div>
                </div>

                ${
                  showActions
                    ? `
                    <div class="product-actions-section">
                        <div class="primary-actions">
                            <button class="action-btn whatsapp-btn" onclick="openWhatsApp('${product.whatsapp}', '${product.code}')">
                                📱 Contact via WhatsApp
                            </button>
                            <button class="action-btn call-btn" onclick="makeCall('${product.contact}')">
                                📞 Call Now
                            </button>
                        </div>
                        ${
                          product.gpay
                            ? `
                            <div class="payment-section">
                                <button class="action-btn gpay-btn" onclick="openGPay('${product.gpay}', '${product.price}', '${product.code}')">
                                    💳 Pay with GPay/UPI
                                </button>
                                <div class="payment-info">
                                    <small>💡 Secure payment via UPI</small>
                                </div>
                            </div>
                        `
                            : ""
                        }
                    </div>
                `
                    : `
                    <div class="unavailable-section">
                        <div class="unavailable-message">
                            <span class="unavailable-icon">${product.status === "sold" ? "❌" : "⏳"}</span>
                            <span class="unavailable-text">
                                ${product.status === "sold" ? "This item has been sold" : "This item is currently reserved"}
                            </span>
                        </div>
                        <div class="alternative-actions">
                            <button class="action-btn secondary-btn" onclick="openWhatsApp('${product.whatsapp}', '${product.code}')">
                                📱 Ask about similar items
                            </button>
                        </div>
                    </div>
                `
                }

                <div class="seller-info">
                    <h3>Seller Information</h3>
                    <div class="seller-details">
                        <div class="seller-contact">
                            <span class="contact-label">📞 Phone:</span>
                            <span class="contact-value">${product.contact}</span>
                        </div>
                        <div class="seller-contact">
                            <span class="contact-label">📱 WhatsApp:</span>
                            <span class="contact-value">${product.whatsapp}</span>
                        </div>
                        ${
                          product.gpay
                            ? `
                            <div class="seller-contact">
                                <span class="contact-label">💳 UPI:</span>
                                <span class="contact-value">${product.gpay}</span>
                            </div>
                        `
                            : ""
                        }
                    </div>
                </div>
            </div>
        </div>

        <!-- Related Products Section -->
        <div class="related-products-section">
            <h3>Related Products</h3>
            <div class="related-products-grid" id="relatedProductsGrid">
                <!-- Related products will be loaded here -->
            </div>
        </div>
    `

  document.getElementById("productDetailsContainer").innerHTML = productDetailsHTML

  // Load related products
  loadRelatedProducts(product)
}

function loadRelatedProducts(currentProduct) {
  const products = getProducts()
  const relatedProducts = products
    .filter((p) => p.category === currentProduct.category && p.code !== currentProduct.code)
    .slice(0, 4)

  const relatedGrid = document.getElementById("relatedProductsGrid")

  if (relatedProducts.length === 0) {
    relatedGrid.innerHTML = '<p class="no-related">No related products found.</p>'
    return
  }

  relatedGrid.innerHTML = relatedProducts.map(createRelatedProductCard).join("")
}

function createRelatedProductCard(product) {
  const statusClass = `status-${product.status}`
  const statusText = product.status.charAt(0).toUpperCase() + product.status.slice(1)

  return `
        <a href="product-details.html?code=${product.code}" class="related-product-card">
            <div class="related-product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'">
                <div class="status-badge ${statusClass}">${statusText}</div>
            </div>
            <div class="related-product-info">
                <div class="related-product-code">${product.code}</div>
                <div class="related-product-name">${product.name}</div>
                <div class="related-product-price">₹${product.price.toLocaleString()}</div>
            </div>
        </a>
    `
}

function setupImageZoom() {
  const modal = document.getElementById("imageZoomModal")
  const closeBtn = document.getElementById("closeZoom")

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none"
  })

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none"
    }
  })
}

function openImageZoom(imageSrc) {
  const modal = document.getElementById("imageZoomModal")
  const zoomedImage = document.getElementById("zoomedImage")

  zoomedImage.src = imageSrc
  modal.style.display = "block"
}

// Utility functions
function getProducts() {
  const products = localStorage.getItem("products")
  return products ? JSON.parse(products) : []
}

function getCategories() {
  const categories = localStorage.getItem("categories")
  return categories ? JSON.parse(categories) : []
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
