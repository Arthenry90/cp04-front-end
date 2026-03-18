document.addEventListener("DOMContentLoaded", function () {
	var CART_STORAGE_KEY = "eco_cart_items";
	var cartItems = loadCart();
	var cartButtons = Array.from(document.querySelectorAll(".cart-button"));
	var cartCountNodes = Array.from(document.querySelectorAll(".cart-count"));
	var sidebar = createCartSidebar();
	var cartListNode = document.getElementById("cartList");
	var clearCartBtn = document.getElementById("clearCartBtn");

	function loadCart() {
		try {
			return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
		} catch (_error) {
			return [];
		}
	}

	function saveCart() {
		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
	}

	function createCartSidebar() {
		var existing = document.getElementById("cartSidebar");
		if (existing) return existing;

		var box = document.createElement("aside");
		box.id = "cartSidebar";
		box.setAttribute("aria-label", "Carrinho");
		box.style.position = "fixed";
		box.style.top = "0";
		box.style.right = "0";
		box.style.width = "320px";
		box.style.maxWidth = "85vw";
		box.style.height = "100vh";
		box.style.padding = "16px";
		box.style.background = "#0b2516";
		box.style.color = "#e8f7ee";
		box.style.boxShadow = "-10px 0 24px rgba(0,0,0,0.35)";
		box.style.transform = "translateX(100%)";
		box.style.transition = "transform 0.2s ease";
		box.style.zIndex = "1000";

		box.innerHTML =
			"<h3 style='margin:0 0 12px'>Carrinho</h3>" +
			"<ul id='cartList' style='list-style:none;padding:0;margin:0 0 12px;display:flex;flex-direction:column;gap:8px;max-height:70vh;overflow:auto'></ul>" +
			"<button id='clearCartBtn' style='width:100%;border:1px solid rgba(182,229,200,.35);background:transparent;color:#e8f7ee;padding:8px;border-radius:8px;cursor:pointer'>Limpar carrinho</button>";

		document.body.appendChild(box);
		return box;
	}

	function renderCart() {
		cartCountNodes.forEach(function (node) {
			node.textContent = String(cartItems.length);
		});

		if (!cartListNode) return;

		if (!cartItems.length) {
			cartListNode.innerHTML = "<li style='opacity:.8'>Carrinho vazio</li>";
			return;
		}

		cartListNode.innerHTML = "";
		cartItems.forEach(function (itemName) {
			var li = document.createElement("li");
			li.style.padding = "8px";
			li.style.border = "1px solid rgba(182,229,200,.2)";
			li.style.borderRadius = "8px";
			li.textContent = itemName;
			cartListNode.appendChild(li);
		});
	}

	function openCart() {
		sidebar.style.transform = "translateX(0%)";
	}

	function toggleCart() {
		var isOpen = sidebar.style.transform === "translateX(0%)";
		sidebar.style.transform = isOpen ? "translateX(100%)" : "translateX(0%)";
	}

	function addToCart(productName) {
		cartItems.push(productName || "Produto");
		saveCart();
		renderCart();
		openCart();
	}

	cartButtons.forEach(function (button) {
		button.addEventListener("click", function (event) {
			event.preventDefault();
			toggleCart();
		});
	});

	if (clearCartBtn) {
		clearCartBtn.addEventListener("click", function () {
			cartItems = [];
			saveCart();
			renderCart();
		});
	}

	document.addEventListener("click", function (event) {
		var button = event.target.closest(".js-add-cart");
		if (!button) return;

		event.preventDefault();
		addToCart(button.dataset.name || "Produto");
	});

	function formatPrice(value) {
		return String(value.toFixed(2)).replace(".", ",");
	}

	function getProductsJsonPath() {
		return window.location.pathname.indexOf("/pages/") > -1 ? "../data/products.json" : "data/products.json";
	}

	function renderProducts(products) {
		var grid = document.querySelector(".col-12.col-lg-9 .row.g-4");
		if (!grid) return;

		grid.innerHTML = products
			.map(function (product) {
				return (
					"<div class='col-12 col-md-6 col-xl-4 product-item' data-price='" +
					product.price +
					"' data-category='" +
					product.category +
					"' data-brand='" +
					product.brandId +
					"'>" +
					"<article class='card product-card catalog-card h-100'>" +
					"<img src='" +
					product.image +
					"' class='card-img-top' alt='" +
					product.alt +
					"'>" +
					"<div class='card-body'>" +
					"<h3 class='card-title'>" +
					product.name +
					"</h3>" +
					"<p class='card-text'>" +
					product.brand +
					"</p>" +
					"<p class='price'>R$ " +
					formatPrice(product.price) +
					"</p>" +
					"<a href='#' class='btn btn-outline-eco w-100 js-add-cart' data-name='" +
					product.name +
					"'>Adicionar ao carrinho</a>" +
					"</div>" +
					"</article>" +
					"</div>"
				);
			})
			.join("");
	}

	function setupFilters() {
		var items = Array.from(document.querySelectorAll(".product-item"));
		if (!items.length) return;

		var countNode = document.querySelector(".catalog-meta .mb-0");
		var priceRadios = ["p1", "p2", "p3", "p4"]
			.map(function (id) {
				return document.getElementById(id);
			})
			.filter(Boolean);

		var categoryChecks = ["t1", "t2", "t3", "t4"]
			.map(function (id) {
				return document.getElementById(id);
			})
			.filter(Boolean);

		var brandChecks = ["m1", "m2", "m3", "m4"]
			.map(function (id) {
				return document.getElementById(id);
			})
			.filter(Boolean);

		var categoryById = {
			t1: "performance",
			t2: "casual",
			t3: "kit",
			t4: "acessorio"
		};

		var brandById = {
			m1: "ecoshirts",
			m2: "insider-style",
			m3: "move-green",
			m4: "urban-leaf"
		};

		function inPriceRange(price, selectedId) {
			if (selectedId === "p1") return price <= 99;
			if (selectedId === "p2") return price >= 100 && price <= 149.99;
			if (selectedId === "p3") return price >= 150 && price <= 199.99;
			if (selectedId === "p4") return price >= 200;
			return true;
		}

		function applyFilters() {
			var selectedPrice = priceRadios.find(function (radio) {
				return radio.checked;
			});
			var selectedPriceId = selectedPrice ? selectedPrice.id : "";

			var selectedCategories = categoryChecks
				.filter(function (input) {
					return input.checked;
				})
				.map(function (input) {
					return categoryById[input.id];
				});

			var selectedBrands = brandChecks
				.filter(function (input) {
					return input.checked;
				})
				.map(function (input) {
					return brandById[input.id];
				});

			var visibleCount = 0;

			items.forEach(function (item) {
				var price = Number(item.dataset.price || 0);
				var category = item.dataset.category || "";
				var brand = item.dataset.brand || "";

				var byPrice = inPriceRange(price, selectedPriceId);
				var byCategory = selectedCategories.length ? selectedCategories.includes(category) : true;
				var byBrand = selectedBrands.length ? selectedBrands.includes(brand) : true;
				var visible = byPrice && byCategory && byBrand;

				item.style.display = visible ? "" : "none";
				if (visible) visibleCount += 1;
			});

			if (countNode) {
				countNode.textContent = "Mostrando " + visibleCount + " produtos";
			}
		}

		priceRadios.forEach(function (input) {
			input.addEventListener("change", applyFilters);
		});
		categoryChecks.forEach(function (input) {
			input.addEventListener("change", applyFilters);
		});
		brandChecks.forEach(function (input) {
			input.addEventListener("change", applyFilters);
		});

		var applyBtn = document.querySelector(".filter-panel .btn-eco");
		if (applyBtn) {
			applyBtn.addEventListener("click", applyFilters);
		}

		applyFilters();
	}

	function loadProductsFromJson() {
		if (!document.querySelector(".catalog-page")) return;

		renderProducts(PRODUCTS_DATA);
		setupFilters();
	}

	renderCart();
	loadProductsFromJson();
});

var PRODUCTS_DATA = [
	{
		"id": 0,
		"name": "Prime Tech Tee Black",
		"brand": "EcoShirts",
		"brandId": "ecoshirts",
		"category": "performance",
		"price": 149.9,
		"image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
		"alt": "Camiseta tech preta de performance"
	},
	{
		"id": 1,
		"name": "Air Flex Olive",
		"brand": "Insider Style",
		"brandId": "insider-style",
		"category": "performance",
		"price": 169.9,
		"image": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
		"alt": "Camiseta tech verde militar"
	},
	{
		"id": 2,
		"name": "Urban Dry Graphite",
		"brand": "Move Green",
		"brandId": "move-green",
		"category": "casual",
		"price": 139.9,
		"image": "https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=900&q=80",
		"alt": "Camiseta tech cinza chumbo"
	},
	{
		"id": 3,
		"name": "Cloud Touch White",
		"brand": "EcoShirts",
		"brandId": "ecoshirts",
		"category": "casual",
		"price": 129.9,
		"image": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
		"alt": "Camiseta branca sustentavel"
	},
	{
		"id": 4,
		"name": "Kit Essential 3x",
		"brand": "Urban Leaf",
		"brandId": "urban-leaf",
		"category": "kit",
		"price": 299.9,
		"image": "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
		"alt": "Kit com tres camisetas tech"
	},
	{
		"id": 5,
		"name": "All Day AntiOdor",
		"brand": "Insider Style",
		"brandId": "insider-style",
		"category": "performance",
		"price": 179.9,
		"image": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80",
		"alt": "Camiseta preta antiodor premium"
	},
	{
		"id": 6,
		"name": "Slim Move Forest",
		"brand": "Move Green",
		"brandId": "move-green",
		"category": "casual",
		"price": 159.9,
		"image": "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80",
		"alt": "Camiseta tech slim verde escuro"
	},
	{
		"id": 7,
		"name": "Laundry Care Set",
		"brand": "EcoShirts",
		"brandId": "ecoshirts",
		"category": "acessorio",
		"price": 69.9,
		"image": "https://images.unsplash.com/photo-1618354691438-25bc04584c23?auto=format&fit=crop&w=900&q=80",
		"alt": "Acessorio para lavagem de camisetas tecnicas"
	},
	{
		"id": 8,
		"name": "Minimal Sand Tech",
		"brand": "Urban Leaf",
		"brandId": "urban-leaf",
		"category": "casual",
		"price": 134.9,
		"image": "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?auto=format&fit=crop&w=900&q=80",
		"alt": "Camiseta minimalista bege de tecnologia textil"
	}
];
