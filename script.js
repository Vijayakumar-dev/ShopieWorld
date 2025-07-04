// Default categories
const defaultCategories = [
  {
    id: "sarees",
    name: "Sarees",
    description: "Traditional and modern sarees",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400",
    dateAdded: new Date().toISOString(),
  },
  {
    id: "jewels",
    name: "Jewels",
    description: "Beautiful jewelry collection",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
    dateAdded: new Date().toISOString(),
  },
  {
    id: "makeup",
    name: "Makeup",
    description: "Premium makeup products",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
    dateAdded: new Date().toISOString(),
  },
  {
    id: "gifts",
    name: "Gifts",
    description: "Special gifts for every occasion",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400",
    dateAdded: new Date().toISOString(),
  },
]

// Sample products with categories - Start with empty array
const sampleProducts = []

// Initialize data
// function initializeData() {
//   if (!localStorage.getItem("categories")) {
//     localStorage.setItem("categories", JSON.stringify(defaultCategories))
//   }
//   if (!localStorage.getItem("products")) {
//     localStorage.setItem("products", JSON.stringify(sampleProducts))
//   }
//   if (!localStorage.getItem("settings")) {
//     localStorage.setItem("settings", JSON.stringify({ showUncategorized: false }))
//   }
// }
function initializeData() {
  if (!localStorage.getItem("initialized")) {
    localStorage.setItem("categories", JSON.stringify(defaultCategories));
    localStorage.setItem("products", JSON.stringify(sampleProducts));
    localStorage.setItem("settings", JSON.stringify({ showUncategorized: false }));
    localStorage.setItem("initialized", "true");
  }
}


// Get data functions
function getCategories() {
  const categories = localStorage.getItem("categories")
  return categories ? JSON.parse(categories) : []
}

function getProducts() {
  const products = localStorage.getItem("products")
  return products ? JSON.parse(products) : []
}

function getBanners() {
  const banners = localStorage.getItem("banners")
  return banners ? JSON.parse(banners) : []
}

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

// Load categories on homepage
function loadCategories() {
  const categories = getCategories()
  const categoriesGrid = document.getElementById("categoriesGrid")

  if (!categoriesGrid) return

  if (categories.length === 0) {
    categoriesGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No categories available yet.</p>'
    return
  }

  categoriesGrid.innerHTML = categories
    .map((category) => {
      const products = getProducts()
      const categoryProductCount = products.filter((p) => p.category === category.id).length

      return `
        <div class="category-card">
            <div class="category-image">
                <img src="${category.image}" alt="${category.name}" onerror="this.src='https://via.placeholder.com/400x300?text=${category.name}'">
            </div>
            <div class="category-info">
                <div class="category-name">${category.name}</div>
                <div class="category-description">${category.description}</div>
                <div class="category-product-count">${categoryProductCount} products available</div>
                <a href="category.html?category=${category.id}" class="category-btn">View More</a>
            </div>
        </div>
    `
    })
    .join("")
}

// Load navigation categories
function loadNavCategories() {
  const categories = getCategories()
  const categoryDropdown = document.getElementById("categoryDropdown")
  const footerCategories = document.getElementById("footerCategories")

  if (categoryDropdown) {
    if (categories.length === 0) {
      categoryDropdown.innerHTML = '<li><a href="products.html">All Products</a></li>'
    } else {
      categoryDropdown.innerHTML = categories
        .map(
          (category) => `
              <li><a href="category.html?category=${category.id}">${category.name}</a></li>
          `,
        )
        .join("")
    }
  }

  if (footerCategories) {
    if (categories.length === 0) {
      footerCategories.innerHTML = '<li><a href="products.html">All Products</a></li>'
    } else {
      footerCategories.innerHTML = categories
        .map(
          (category) => `
              <li><a href="category.html?category=${category.id}">${category.name}</a></li>
          `,
        )
        .join("")
    }
  }
}

// Load preview products on homepage
function loadPreviewProducts() {
  const previewGrid = document.getElementById("previewGrid")
  if (!previewGrid) return

  const products = getProducts()

  if (products.length === 0) {
    previewGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 50px; background: white; border-radius: 15px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);">
        <div style="font-size: 4rem; margin-bottom: 20px; opacity: 0.5;">🛍️</div>
        <h3 style="color: #666; margin-bottom: 10px;">No products available yet</h3>
        <p style="color: #999; margin-bottom: 25px;">Products will appear here once they are added by the admin.</p>
        <a href="login.html" class="btn btn-primary">Admin Login</a>
      </div>
    `
    return
  }

  const featuredProducts = products.slice(0, 8) // Show first 8 products
  previewGrid.innerHTML = featuredProducts.map(createProductCard).join("")
}

// Banner carousel functions
function initBannerCarousel() {
  const banners = getBanners()
  const carouselSlides = document.getElementById("carouselSlides")
  const carouselDots = document.getElementById("carouselDots")

  if (!carouselSlides) return

  if (banners.length === 0) {
    // Show default banner
    carouselSlides.innerHTML = `
            <div class="carousel-slide active default-banner">
                <div class="carousel-slide-content">
                    <h3>Welcome to ShopieWorld</h3>
                    <p>Discover our exquisite collection of products across multiple categories</p>
                    <a href="products.html" class="carousel-offer-btn">Shop Now</a>
                </div>
            </div>
        `
    carouselDots.innerHTML = '<div class="carousel-dot active"></div>'
    return
  }

  // Create slides
  carouselSlides.innerHTML = banners
    .map(
      (banner, index) => `
        <div class="carousel-slide ${index === 0 ? "active" : ""}" style="background-image: url('${banner.image}')">
            <div class="carousel-slide-content">
                <h3>${banner.title}</h3>
                <p>${banner.offer}</p>
                <a href="products.html" class="carousel-offer-btn">Shop Now</a>
            </div>
        </div>
    `,
    )
    .join("")

  // Create dots
  carouselDots.innerHTML = banners
    .map((_, index) => `<div class="carousel-dot ${index === 0 ? "active" : ""}" onclick="goToSlide(${index})"></div>`)
    .join("")

  // Start auto-slide
  if (banners.length > 1) {
    startCarouselAutoSlide()
  }
}

let carouselInterval
let currentSlide = 0

function startCarouselAutoSlide() {
  carouselInterval = setInterval(() => {
    const banners = getBanners()
    if (banners.length <= 1) return

    currentSlide = (currentSlide + 1) % banners.length
    goToSlide(currentSlide)
  }, 3000)
}

function goToSlide(slideIndex) {
  const slides = document.querySelectorAll(".carousel-slide")
  const dots = document.querySelectorAll(".carousel-dot")

  slides.forEach((slide, index) => {
    slide.classList.toggle("active", index === slideIndex)
  })

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === slideIndex)
  })

  currentSlide = slideIndex
}

// Mobile navigation
function setupMobileNav() {
  const navToggle = document.getElementById("navToggle")
  const navMenu = document.getElementById("navMenu")

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")
      navToggle.classList.toggle("active")
    })
  }

  // Close mobile menu when clicking on links
  document.querySelectorAll(".nav-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active")
      navToggle.classList.remove("active")
    })
  })
}

// Add this function
function setupStickyNav() {
  const navbar = document.querySelector(".navbar")
  const sticky = navbar.offsetTop

  function handleScroll() {
    if (window.pageYOffset > sticky) {
      navbar.classList.add("sticky")
    } else {
      navbar.classList.remove("sticky")
    }
  }

  window.addEventListener("scroll", handleScroll)
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

function logout() {
  localStorage.removeItem("isLoggedIn")
  window.location.href = "index.html"
}

function checkAuth() {
  if (!localStorage.getItem("isLoggedIn")) {
    window.location.href = "login.html"
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeData()
  loadCategories()
  loadNavCategories()
  loadPreviewProducts()
  initBannerCarousel()
  setupMobileNav()
  setupStickyNav()
})
