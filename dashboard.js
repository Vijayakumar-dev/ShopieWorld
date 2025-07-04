// Check authentication on page load
document.addEventListener("DOMContentLoaded", () => {
  checkAuth()
  initializeDashboard()
  setupEventListeners()
  loadDashboardData()
})

function checkAuth() {
  if (!localStorage.getItem("isLoggedIn")) {
    window.location.href = "login.html"
  }
}

function logout() {
  localStorage.removeItem("isLoggedIn")
  window.location.href = "index.html"
}

// Initialize dashboard
function initializeDashboard() {
  // Load default categories if not exists
  if (!localStorage.getItem("categories")) {
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
    localStorage.setItem("categories", JSON.stringify(defaultCategories))
  }

  // Load settings
  if (!localStorage.getItem("settings")) {
    localStorage.setItem("settings", JSON.stringify({ showUncategorized: false, adminWhatsApp: "+919876543210" }))
  }
}

// Data functions
function getProducts() {
  const products = localStorage.getItem("products")
  return products ? JSON.parse(products) : []
}

function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products))
}

function getCategories() {
  const categories = localStorage.getItem("categories")
  return categories ? JSON.parse(categories) : []
}

function saveCategories(categories) {
  localStorage.setItem("categories", JSON.stringify(categories))
}

function getBanners() {
  const banners = localStorage.getItem("banners")
  return banners ? JSON.parse(banners) : []
}

function saveBanners(banners) {
  localStorage.setItem("banners", JSON.stringify(banners))
}

function getSettings() {
  const settings = localStorage.getItem("settings")
  return settings ? JSON.parse(settings) : { showUncategorized: false, adminWhatsApp: "+919876543210" }
}

function updateSettings() {
  const settings = getSettings()
  settings.showUncategorized = document.getElementById("showUncategorized").checked
  localStorage.setItem("settings", JSON.stringify(settings))
  alert("Settings updated successfully!")
}

// Setup event listeners
function setupEventListeners() {
  // Sidebar navigation
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const section = link.dataset.section
      showSection(section)

      // Update active state
      document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"))
      link.classList.add("active")
    })
  })

  // Form submissions
  document.getElementById("addBannerForm").addEventListener("submit", (e) => {
    e.preventDefault()
    addBanner()
  })

  document.getElementById("addCategoryForm").addEventListener("submit", (e) => {
    e.preventDefault()
    addOrUpdateCategory()
  })

  document.getElementById("addProductForm").addEventListener("submit", (e) => {
    e.preventDefault()
    addProduct()
  })

  // Image uploads
  setupImageUploads()

  // Settings
  document.getElementById("showUncategorized").addEventListener("change", updateSettings)
}

function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.remove("active")
  })

  // Show selected section
  document.getElementById(`${sectionName}-section`).classList.add("active")

  // Update title
  const titles = {
    dashboard: "Dashboard",
    banners: "Banner Management",
    categories: "Category Management",
    products: "Product Management",
    settings: "Settings",
  }
  document.getElementById("sectionTitle").textContent = titles[sectionName]

  // Load section data
  switch (sectionName) {
    case "dashboard":
      loadDashboardStats()
      loadRecentActivity()
      break
    case "banners":
      loadBannersList()
      break
    case "categories":
      loadCategoriesList()
      break
    case "products":
      loadProductsList()
      loadProductCategories()
      break
    case "settings":
      loadSettings()
      break
  }
}

function loadDashboardData() {
  loadDashboardStats()
  loadRecentActivity()
}

function loadDashboardStats() {
  const products = getProducts()
  const categories = getCategories()
  const banners = getBanners()

  const total = products.length
  const available = products.filter((p) => p.status === "available").length
  const sold = products.filter((p) => p.status === "sold").length
  const reserved = products.filter((p) => p.status === "reserved").length

  document.getElementById("totalProducts").textContent = total
  document.getElementById("availableProducts").textContent = available
  document.getElementById("soldProducts").textContent = sold
  document.getElementById("reservedProducts").textContent = reserved
  document.getElementById("totalCategories").textContent = categories.length
  document.getElementById("totalBanners").textContent = banners.length
}

function loadRecentActivity() {
  const products = getProducts()
  const categories = getCategories()
  const banners = getBanners()

  // Combine all activities with timestamps
  const activities = []

  // Add product activities
  products.forEach((product) => {
    const category = categories.find((cat) => cat.id === product.category)
    const categoryName = category ? category.name : "Uncategorized"
    activities.push({
      type: "product",
      action: "added",
      title: `Product ${product.code} - ${product.name}`,
      details: `Added to ${categoryName} | Status: ${product.status} | Price: ₹${product.price}`,
      timestamp: new Date(product.dateAdded),
      icon: "📦",
    })
  })

  // Add category activities
  categories.forEach((category) => {
    const productCount = products.filter((p) => p.category === category.id).length
    activities.push({
      type: "category",
      action: "created",
      title: `Category "${category.name}" created`,
      details: `${productCount} products assigned`,
      timestamp: new Date(category.dateAdded),
      icon: "📂",
    })
  })

  // Add banner activities
  banners.forEach((banner) => {
    activities.push({
      type: "banner",
      action: "added",
      title: `Banner "${banner.title}" added`,
      details: banner.offer,
      timestamp: new Date(banner.dateAdded),
      icon: "🖼️",
    })
  })

  // Sort by most recent and take top 10
  const recentActivities = activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)

  const activityList = document.getElementById("recentActivity")
  if (activityList) {
    if (recentActivities.length === 0) {
      activityList.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No recent activity</div>'
    } else {
      activityList.innerHTML = recentActivities
        .map(
          (activity) => `
          <div style="padding: 15px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: flex-start; gap: 12px;">
            <span style="font-size: 1.2rem;">${activity.icon}</span>
            <div style="flex: 1;">
              <strong style="color: #333;">${activity.title}</strong>
              <br><small style="color: #666; line-height: 1.4;">${activity.details}</small>
              <br><small style="color: #8b5cf6; font-weight: 500;">${activity.timestamp.toLocaleDateString()} ${activity.timestamp.toLocaleTimeString()}</small>
            </div>
          </div>
        `,
        )
        .join("")
    }
  }
}

// Banner Management
function showAddBannerForm() {
  document.getElementById("bannerFormContainer").style.display = "block"
}

function hideBannerForm() {
  document.getElementById("bannerFormContainer").style.display = "none"
  document.getElementById("addBannerForm").reset()
  resetImageUpload("bannerImagePreview", "bannerUploadText")
}

function addBanner() {
  const title = document.getElementById("bannerTitle").value
  const offer = document.getElementById("bannerOffer").value
  const imageInput = document.getElementById("bannerImageInput")

  if (!imageInput.files[0]) {
    alert("Please select an image for the banner")
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const banners = getBanners()

    const newBanner = {
      id: Date.now().toString(),
      title: title,
      offer: offer,
      image: e.target.result,
      dateAdded: new Date().toISOString(),
    }

    banners.push(newBanner)
    saveBanners(banners)

    hideBannerForm()
    loadBannersList()
    loadDashboardStats()
    loadRecentActivity() // Refresh activity
    alert("Banner added successfully!")
  }
  reader.readAsDataURL(imageInput.files[0])
}

function loadBannersList() {
  const banners = getBanners()
  const bannerList = document.getElementById("bannerList")

  if (banners.length === 0) {
    bannerList.innerHTML = "<p>No banners added yet.</p>"
    return
  }

  bannerList.innerHTML = banners
    .map(
      (banner, index) => `
        <div class="banner-item">
            <img src="${banner.image}" alt="${banner.title}" class="banner-thumbnail">
            <div class="item-info">
                <strong>${banner.title}</strong>
                <p style="margin: 5px 0; color: #666; font-size: 0.9rem;">${banner.offer}</p>
            </div>
            <div class="item-actions">
                <button onclick="deleteBanner(${index})" class="btn btn-danger">Delete</button>
            </div>
        </div>
    `,
    )
    .join("")
}

function deleteBanner(index) {
  if (!confirm("Are you sure you want to delete this banner?")) return

  const banners = getBanners()
  banners.splice(index, 1)
  saveBanners(banners)

  loadBannersList()
  loadDashboardStats()
  alert("Banner deleted successfully!")
}

// Category Management
function showAddCategoryForm() {
  document.getElementById("categoryFormContainer").style.display = "block"
  document.getElementById("categoryFormTitle").textContent = "Add New Category"
  document.getElementById("categorySubmitBtn").textContent = "Add Category"
  document.getElementById("editCategoryId").value = ""
}

function hideCategoryForm() {
  document.getElementById("categoryFormContainer").style.display = "none"
  document.getElementById("addCategoryForm").reset()
  resetImageUpload("categoryImagePreview", "categoryUploadText")
}

function addOrUpdateCategory() {
  const categoryId = document.getElementById("editCategoryId").value
  const name = document.getElementById("categoryName").value
  const description = document.getElementById("categoryDescription").value
  const imageInput = document.getElementById("categoryImageInput")

  if (!categoryId && !imageInput.files[0]) {
    alert("Please select an image for the category")
    return
  }

  const processCategory = (imageData) => {
    const categories = getCategories()

    if (categoryId) {
      // Update existing category
      const categoryIndex = categories.findIndex((cat) => cat.id === categoryId)
      if (categoryIndex !== -1) {
        categories[categoryIndex].name = name
        categories[categoryIndex].description = description
        if (imageData) categories[categoryIndex].image = imageData
      }
    } else {
      // Add new category
      const newCategory = {
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name: name,
        description: description,
        image: imageData,
        dateAdded: new Date().toISOString(),
      }

      // Check if category already exists
      if (categories.find((cat) => cat.id === newCategory.id)) {
        alert("Category with this name already exists!")
        return
      }

      categories.push(newCategory)
    }

    saveCategories(categories)
    hideCategoryForm()
    loadCategoriesList()
    loadDashboardStats()
    loadRecentActivity() // Refresh activity
    alert(categoryId ? "Category updated successfully!" : "Category added successfully!")
  }

  if (imageInput.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => processCategory(e.target.result)
    reader.readAsDataURL(imageInput.files[0])
  } else {
    processCategory(null)
  }
}

function loadCategoriesList() {
  const categories = getCategories()
  const categoriesList = document.getElementById("categoriesList")

  if (categories.length === 0) {
    categoriesList.innerHTML = "<p>No categories added yet.</p>"
    return
  }

  categoriesList.innerHTML = categories
    .map(
      (category) => `
        <div class="category-item">
            <img src="${category.image}" alt="${category.name}" class="category-thumbnail">
            <div class="item-info">
                <strong>${category.name}</strong>
                <p style="margin: 5px 0; color: #666; font-size: 0.9rem;">${category.description}</p>
            </div>
            <div class="item-actions">
                <button onclick="editCategory('${category.id}')" class="btn btn-primary">Edit</button>
                <button onclick="deleteCategory('${category.id}')" class="btn btn-danger">Delete</button>
            </div>
        </div>
    `,
    )
    .join("")
}

function editCategory(categoryId) {
  const categories = getCategories()
  const category = categories.find((cat) => cat.id === categoryId)

  if (!category) return

  document.getElementById("editCategoryId").value = category.id
  document.getElementById("categoryName").value = category.name
  document.getElementById("categoryDescription").value = category.description

  document.getElementById("categoryFormContainer").style.display = "block"
  document.getElementById("categoryFormTitle").textContent = "Edit Category"
  document.getElementById("categorySubmitBtn").textContent = "Update Category"
}

function deleteCategory(categoryId) {
  if (
    !confirm("Are you sure you want to delete this category? All products in this category will become uncategorized.")
  )
    return

  const categories = getCategories()
  const products = getProducts()

  // Update products in this category to uncategorized
  const updatedProducts = products.map((product) => {
    if (product.category === categoryId) {
      return { ...product, category: "uncategorized" }
    }
    return product
  })

  // Remove category
  const filteredCategories = categories.filter((cat) => cat.id !== categoryId)

  saveCategories(filteredCategories)
  saveProducts(updatedProducts)

  loadCategoriesList()
  loadDashboardStats()
  alert("Category deleted successfully!")
}

// Product Management - Category First Approach
let currentSelectedCategory = null

function refreshProductCategories() {
  loadCategorySelectionView()
}

function loadCategorySelectionView() {
  const categories = getCategories()
  const categoriesGrid = document.getElementById("categoriesGridManagement")
  const noCategoriesMessage = document.getElementById("noCategoriesMessage")

  if (categories.length === 0) {
    categoriesGrid.style.display = "none"
    noCategoriesMessage.style.display = "block"
    return
  }

  categoriesGrid.style.display = "grid"
  noCategoriesMessage.style.display = "none"

  const products = getProducts()

  categoriesGrid.innerHTML = categories
    .map((category) => {
      const categoryProducts = products.filter((p) => p.category === category.id)
      const productCount = categoryProducts.length
      const availableCount = categoryProducts.filter((p) => p.status === "available").length
      const soldCount = categoryProducts.filter((p) => p.status === "sold").length
      const reservedCount = categoryProducts.filter((p) => p.status === "reserved").length

      return `
      <div class="category-management-card" onclick="selectCategoryForProducts('${category.id}')">
        <div class="category-image-small">
          <img src="${category.image}" alt="${category.name}" onerror="this.src='https://via.placeholder.com/100x80?text=${category.name}'">
        </div>
        <div class="category-details">
          <h4>${category.name}</h4>
          <p>${category.description}</p>
          <div class="category-stats">
            <div class="stat-item">
              <span class="stat-number">${productCount}</span>
              <span class="stat-label">Total Products</span>
            </div>
            <div class="stat-item">
              <span class="stat-number available">${availableCount}</span>
              <span class="stat-label">Available</span>
            </div>
            <div class="stat-item">
              <span class="stat-number sold">${soldCount}</span>
              <span class="stat-label">Sold</span>
            </div>
            <div class="stat-item">
              <span class="stat-number reserved">${reservedCount}</span>
              <span class="stat-label">Reserved</span>
            </div>
          </div>
        </div>
        <div class="category-action">
          <span class="manage-btn">Manage Products →</span>
        </div>
      </div>
    `
    })
    .join("")
}

function selectCategoryForProducts(categoryId) {
  const categories = getCategories()
  const category = categories.find((cat) => cat.id === categoryId)

  if (!category) return

  currentSelectedCategory = category

  // Hide category selection view
  document.getElementById("categorySelectionView").style.display = "none"

  // Show product management view
  document.getElementById("productManagementView").style.display = "block"

  // Update header
  document.getElementById("currentCategoryName").textContent = category.name

  // Set selected category in form
  document.getElementById("selectedCategoryId").value = category.id

  // Load category info and products
  loadCategoryInfo(category)
  loadCategoryProducts(category.id)
}

function backToCategorySelection() {
  currentSelectedCategory = null

  // Hide product management view
  document.getElementById("productManagementView").style.display = "none"

  // Show category selection view
  document.getElementById("categorySelectionView").style.display = "block"

  // Hide any open forms
  hideProductForm()

  // Refresh category view
  loadCategorySelectionView()
}

function loadCategoryInfo(category) {
  const products = getProducts()
  const categoryProducts = products.filter((p) => p.category === category.id)

  const availableCount = categoryProducts.filter((p) => p.status === "available").length
  const soldCount = categoryProducts.filter((p) => p.status === "sold").length
  const reservedCount = categoryProducts.filter((p) => p.status === "reserved").length

  const totalValue = categoryProducts.reduce((sum, product) => sum + product.price, 0)
  const avgPrice = categoryProducts.length > 0 ? Math.round(totalValue / categoryProducts.length) : 0

  document.getElementById("categoryInfoCard").innerHTML = `
    <div class="category-info-header">
      <div class="category-info-image">
        <img src="${category.image}" alt="${category.name}">
      </div>
      <div class="category-info-details">
        <h3>${category.name}</h3>
        <p>${category.description}</p>
        <div class="category-meta">
          <span>Created: ${new Date(category.dateAdded).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
    <div class="category-stats-detailed">
      <div class="stat-card-small">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <div class="stat-number">${categoryProducts.length}</div>
          <div class="stat-label">Total Products</div>
        </div>
      </div>
      <div class="stat-card-small">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-number">${availableCount}</div>
          <div class="stat-label">Available</div>
        </div>
      </div>
      <div class="stat-card-small">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <div class="stat-number">${soldCount}</div>
          <div class="stat-label">Sold</div>
        </div>
      </div>
      <div class="stat-card-small">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-number">${reservedCount}</div>
          <div class="stat-label">Reserved</div>
        </div>
      </div>
      <div class="stat-card-small">
        <div class="stat-icon">💵</div>
        <div class="stat-info">
          <div class="stat-number">₹${avgPrice.toLocaleString()}</div>
          <div class="stat-label">Avg Price</div>
        </div>
      </div>
    </div>
  `
}

function loadCategoryProducts(categoryId) {
  const products = getProducts()
  const categoryProducts = products.filter((p) => p.category === categoryId)
  const productsList = document.getElementById("categoryProductsList")

  if (categoryProducts.length === 0) {
    productsList.innerHTML = `
      <div class="empty-products-state">
        <div class="empty-icon">📦</div>
        <h3>No Products in This Category</h3>
        <p>Start by adding your first product to this category.</p>
        <button class="btn btn-primary" onclick="showAddProductForm()">Add First Product</button>
      </div>
    `
    return
  }

  productsList.innerHTML = `
    <div class="products-header">
      <h4>Products in ${currentSelectedCategory.name} (${categoryProducts.length})</h4>
    </div>
    <div class="products-grid-admin">
      ${categoryProducts.map((product) => createProductManagementCard(product)).join("")}
    </div>
  `
}

function createProductManagementCard(product) {
  const statusClass = `status-${product.status}`
  const statusText = product.status.charAt(0).toUpperCase() + product.status.slice(1)

  return `
    <div class="product-management-card">
      <div class="product-image-admin">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/150x150?text=No+Image'">
        <div class="status-badge ${statusClass}">${statusText}</div>
      </div>
      <div class="product-info-admin">
        <div class="product-code-admin">${product.code}</div>
        <div class="product-name-admin">${product.name}</div>
        <div class="product-price-admin">₹${product.price.toLocaleString()}</div>
        <div class="product-details-admin">
          <span>Color: ${product.color}</span>
          ${product.offer ? `<span class="offer-text">🎉 ${product.offer}</span>` : ""}
        </div>
        <div class="product-meta-admin">
          <small>Added: ${new Date(product.dateAdded).toLocaleDateString()}</small>
        </div>
      </div>
      <div class="product-actions-admin">
        <button onclick="editProduct('${product.id}')" class="btn btn-primary btn-sm">Edit</button>
        <button onclick="deleteProduct('${product.id}')" class="btn btn-danger btn-sm">Delete</button>
      </div>
    </div>
  `
}

// Update the existing showAddProductForm function
function showAddProductForm() {
  if (!currentSelectedCategory) {
    alert("Please select a category first")
    return
  }

  document.getElementById("productFormContainer").style.display = "block"
  document.getElementById("productFormTitle").textContent = "Add New Product"
  document.getElementById("productSubmitBtn").textContent = "Add Product"
  document.getElementById("editProductId").value = ""
  document.getElementById("selectedCategoryId").value = currentSelectedCategory.id
}

// Update the existing hideProductForm function
function hideProductForm() {
  document.getElementById("productFormContainer").style.display = "none"
  document.getElementById("addProductForm").reset()
  resetImageUpload("productImagePreview", "productUploadText")
}

// Update the existing addProduct function
function addProduct() {
  const editProductId = document.getElementById("editProductId").value
  const imageInput = document.getElementById("productImageInput")

  if (!editProductId && !imageInput.files[0]) {
    alert("Please select an image for the product")
    return
  }

  const processProduct = (imageData) => {
    const products = getProducts()
    const categoryId = document.getElementById("selectedCategoryId").value

    if (editProductId) {
      // Update existing product
      const productIndex = products.findIndex((p) => p.id === editProductId)
      if (productIndex !== -1) {
        products[productIndex] = {
          ...products[productIndex],
          code: document.getElementById("productCode").value,
          name: document.getElementById("productName").value,
          color: document.getElementById("productColor").value,
          price: Number.parseInt(document.getElementById("productPrice").value),
          contact: document.getElementById("contactNumber").value,
          whatsapp: document.getElementById("whatsappNumber").value,
          gpay: document.getElementById("gpayLink").value,
          offer: document.getElementById("offerDetails").value,
          status: document.getElementById("productStatus").value,
          ...(imageData && { image: imageData }),
        }
      }
    } else {
      // Add new product
      const newProduct = {
        id: document.getElementById("productCode").value,
        code: document.getElementById("productCode").value,
        name: document.getElementById("productName").value,
        category: categoryId,
        color: document.getElementById("productColor").value,
        price: Number.parseInt(document.getElementById("productPrice").value),
        image: imageData,
        contact: document.getElementById("contactNumber").value,
        whatsapp: document.getElementById("whatsappNumber").value,
        gpay: document.getElementById("gpayLink").value,
        offer: document.getElementById("offerDetails").value,
        status: document.getElementById("productStatus").value,
        dateAdded: new Date().toISOString(),
      }

      // Check if product code already exists
      if (products.find((p) => p.code === newProduct.code)) {
        alert("Product code already exists!")
        return
      }

      products.push(newProduct)
    }

    saveProducts(products)
    hideProductForm()
    loadCategoryProducts(categoryId)
    loadDashboardStats()
    loadRecentActivity()
    alert(editProductId ? "Product updated successfully!" : "Product added successfully!")
  }

  if (imageInput.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => processProduct(e.target.result)
    reader.readAsDataURL(imageInput.files[0])
  } else {
    processProduct(null)
  }
}

// Update the existing editProduct function
function editProduct(productId) {
  const products = getProducts()
  const product = products.find((p) => p.id === productId)

  if (!product) return

  // Fill form with product data
  document.getElementById("editProductId").value = product.id
  document.getElementById("productCode").value = product.code
  document.getElementById("productName").value = product.name
  document.getElementById("productColor").value = product.color
  document.getElementById("productPrice").value = product.price
  document.getElementById("contactNumber").value = product.contact
  document.getElementById("whatsappNumber").value = product.whatsapp
  document.getElementById("gpayLink").value = product.gpay || ""
  document.getElementById("offerDetails").value = product.offer || ""
  document.getElementById("productStatus").value = product.status

  // Show form
  document.getElementById("productFormContainer").style.display = "block"
  document.getElementById("productFormTitle").textContent = "Edit Product"
  document.getElementById("productSubmitBtn").textContent = "Update Product"
}

// Update the existing deleteProduct function
function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product?")) return

  const products = getProducts()
  const filteredProducts = products.filter((p) => p.id !== productId)

  saveProducts(filteredProducts)
  loadCategoryProducts(currentSelectedCategory.id)
  loadDashboardStats()
  loadRecentActivity()
  alert("Product deleted successfully!")
}

// Update the existing loadProductsList function to use the new approach
function loadProductsList() {
  loadCategorySelectionView()
}

// Remove the old loadProductCategories function and replace with:
function loadProductCategories() {
  // This function is no longer needed as we use category-first approach
  // Categories are loaded in the category selection view
}

// Settings
function loadSettings() {
  const settings = getSettings()
  document.getElementById("showUncategorized").checked = settings.showUncategorized
  document.getElementById("adminWhatsApp").value = settings.adminWhatsApp || "+919876543210"
}

function saveSettings() {
  const settings = getSettings()
  settings.showUncategorized = document.getElementById("showUncategorized").checked
  settings.adminWhatsApp = document.getElementById("adminWhatsApp").value
  localStorage.setItem("settings", JSON.stringify(settings))
  alert("Settings updated successfully!")
}

// Image upload handling
function setupImageUploads() {
  // Banner image upload
  document.getElementById("bannerImageInput").addEventListener("change", (e) => {
    handleImageUpload(e, "bannerImagePreview", "bannerUploadText")
  })

  // Category image upload
  document.getElementById("categoryImageInput").addEventListener("change", (e) => {
    handleImageUpload(e, "categoryImagePreview", "categoryUploadText")
  })

  // Product image upload
  document.getElementById("productImageInput").addEventListener("change", (e) => {
    handleImageUpload(e, "productImagePreview", "productUploadText")
  })
}

function handleImageUpload(event, previewId, textId) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const preview = document.getElementById(previewId)
    const text = document.getElementById(textId)
    const container = preview.parentElement

    preview.src = e.target.result
    preview.style.display = "block"
    text.style.display = "none"
    container.classList.add("has-image")
  }
  reader.readAsDataURL(file)
}

function resetImageUpload(previewId, textId) {
  const preview = document.getElementById(previewId)
  const text = document.getElementById(textId)
  const container = preview.parentElement

  preview.style.display = "none"
  text.style.display = "block"
  container.classList.remove("has-image")
}

function sendLoginNotification(success, username) {
  const settings = getSettings()
  const adminWhatsApp = settings.adminWhatsApp || "+919876543210" // Default number

  const status = success ? "successful" : "failed"
  const message = `🔐 ShopieWorld Admin Login ${status}%0A%0AUsername: ${username}%0ATime: ${new Date().toLocaleString()}%0AIP: ${getClientIP()}`

  // Open WhatsApp with pre-filled message (optional - for demo)
  if (success) {
    setTimeout(() => {
      const whatsappUrl = `https://wa.me/${adminWhatsApp.replace(/[^0-9]/g, "")}?text=${message}`
      // Uncomment the next line if you want to auto-open WhatsApp
      // window.open(whatsappUrl, '_blank')
      console.log("Login notification would be sent to:", adminWhatsApp)
    }, 1000)
  }
}

function getClientIP() {
  // This is a simplified version - in real apps, you'd get this from server
  return "Client IP (Demo)"
}
