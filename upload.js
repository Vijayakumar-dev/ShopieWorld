 const CLOUD_NAME = "dtrlqlgtx"; // your Cloudinary cloud name
const UPLOAD_PRESET = "my_unsigned_preset"; // your preset

function uploadImageToCloudinary(file, callback) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  })
    .then(res => res.json())
    .then(data => callback(data.secure_url))
    .catch(err => {
      alert("Upload failed");
      console.error(err);
    });
}

document.getElementById("imageInput").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;
  uploadImageToCloudinary(file, url => {
    const img = document.getElementById("previewImage");
    img.src = url;
    img.dataset.uploadedUrl = url;
  });
});

document.getElementById("productForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const product = {
    code: document.getElementById("code").value.trim(),
    name: document.getElementById("name").value.trim(),
    price: parseFloat(document.getElementById("price").value),
    category: document.getElementById("category").value,
    status: document.getElementById("status").value,
    image: document.getElementById("previewImage").dataset.uploadedUrl,
  };

  const list = JSON.parse(localStorage.getItem("products") || "[]");
  list.push(product);
  localStorage.setItem("products", JSON.stringify(list));
  alert("✅ Product Saved!");
  this.reset();
  document.getElementById("previewImage").src = "";
});
