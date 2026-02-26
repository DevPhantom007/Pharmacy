let slideIndex = 1;
let favoriteCount = parseInt(localStorage.getItem("favoriteCount")) || 0;
let cartCount = parseInt(localStorage.getItem("cartCount")) || 0;
let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
let favoriteItems = JSON.parse(localStorage.getItem("favoriteItems")) || [];
let allProducts = [];
let searchMode = false;

document.addEventListener("DOMContentLoaded", function () {
  initSlider();
  initCounters();
  initButtons();
  initModals();
  initSearch();
  loadFavoriteItems();
  loadCartItems();
  initForms();
  collectAllProducts();

  if (document.querySelector(".catalog-layout")) {
    initCatalogFilters();
  }

  setInterval(() => {
    changeSlide(1);
  }, 5000);
});

function collectAllProducts() {
  allProducts = [];
  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach((card) => {
    const title = card.querySelector(".product-title").textContent;
    const desc = card.querySelector(".product-desc").textContent;
    const price = card.querySelector(".current-price").textContent;
    const oldPrice = card.querySelector(".old-price")
      ? card.querySelector(".old-price").textContent
      : "";
    const image = card.querySelector(".product-image img").src;
    const category = card.closest(".products-category")
      ? card.closest(".products-category").querySelector(".category-title")
          .textContent
      : "Каталог";

    allProducts.push({
      title,
      desc,
      price,
      oldPrice,
      image,
      category,
      element: card,
    });
  });
}

function initSlider() {
  showSlides(slideIndex);
}

function changeSlide(n) {
  showSlides((slideIndex += n));
}

function currentSlide(n) {
  showSlides((slideIndex = n));
}

function showSlides(n) {
  let slides = document.getElementsByClassName("slide");
  let dots = document.getElementsByClassName("dot");

  if (n > slides.length) slideIndex = 1;
  if (n < 1) slideIndex = slides.length;

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  for (let i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }

  if (slides[slideIndex - 1]) {
    slides[slideIndex - 1].style.display = "block";
  }

  if (dots[slideIndex - 1]) {
    dots[slideIndex - 1].className += " active";
  }
}

function initSearch() {
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const searchResults = document.getElementById("search-results");

  if (!searchInput || !searchButton || !searchResults) return;

  let searchClearBtn = document.getElementById("search-clear-btn");
  if (!searchClearBtn) {
    searchClearBtn = document.createElement("button");
    searchClearBtn.id = "search-clear-btn";
    searchClearBtn.innerHTML = '<i class="fa fa-times"></i>';
    searchClearBtn.title = "Очистить поиск";
    searchInput.parentNode.insertBefore(searchClearBtn, searchButton);
  }

  searchButton.addEventListener("click", function () {
    performSearch(searchInput.value);
  });

  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      performSearch(searchInput.value);
    }
  });

  searchClearBtn.addEventListener("click", function () {
    searchInput.value = "";
    clearSearch();
    searchInput.focus();
  });

  document.addEventListener("click", function (e) {
    if (
      !searchResults.contains(e.target) &&
      e.target !== searchInput &&
      e.target !== searchButton &&
      e.target.id !== "search-clear-btn"
    ) {
      searchResults.style.display = "none";
    }
  });
}

function performSearch(query) {
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const clearBtn = document.getElementById("search-clear-btn");

  if (!searchResults || !query || query.trim() === "") {
    if (searchResults) searchResults.style.display = "none";
    if (clearBtn) clearBtn.style.display = "none";
    clearSearch();
    return;
  }

  const searchTerm = query.toLowerCase().trim();
  const filteredProducts = allProducts.filter((product) => {
    return (
      product.title.toLowerCase().includes(searchTerm) ||
      product.desc.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  });

  if (clearBtn) clearBtn.style.display = "flex";

  if (filteredProducts.length > 0) {
    enableSearchMode();

    const productCategories = document.querySelectorAll(".products-category");
    productCategories.forEach((cat) => {
      cat.style.display = "none";
    });

    let resultsHeader = document.querySelector(".search-results-header");
    if (!resultsHeader) {
      resultsHeader = document.createElement("h2");
      resultsHeader.className = "search-results-header";
      document
        .querySelector(".products-section")
        .insertBefore(
          resultsHeader,
          document.querySelector(".products-section").firstChild,
        );
    }
    resultsHeader.innerHTML = `Результаты поиска: "${query}" (${filteredProducts.length})`;
    resultsHeader.style.display = "block";

    const productsSection = document.querySelector(".products-section");
    let searchResultsGrid = document.getElementById("search-results-grid");

    if (!searchResultsGrid) {
      searchResultsGrid = document.createElement("div");
      searchResultsGrid.id = "search-results-grid";
      searchResultsGrid.className = "products-grid";
      productsSection.appendChild(searchResultsGrid);
    }

    searchResultsGrid.innerHTML = "";

    filteredProducts.forEach((product) => {
      const productCard = product.element.cloneNode(true);
      productCard.style.display = "block";
      searchResultsGrid.appendChild(productCard);
    });

    setTimeout(() => {
      initButtons();
    }, 100);

    let dropdownHTML = "";
    filteredProducts.forEach((product, index) => {
      dropdownHTML += `
        <div class="search-result-item" data-index="${index}">
          <img src="${product.image}" alt="${product.title}">
          <div class="search-result-info">
            <div class="search-result-title">${product.title}</div>
            <div class="search-result-price">${product.price}</div>
          </div>
        </div>
      `;
    });
    searchResults.innerHTML = dropdownHTML;
    searchResults.style.display = "block";

    document.querySelectorAll(".search-result-item").forEach((item, index) => {
      item.addEventListener("click", function () {
        const product = filteredProducts[index];
        if (product) {
          product.element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          product.element.style.boxShadow = "0 0 0 3px #30b856";

          setTimeout(() => {
            product.element.style.boxShadow = "";
          }, 2000);

          searchResults.style.display = "none";
          searchInput.value = product.title;
        }
      });
    });
  } else {
    enableSearchMode();

    const productCategories = document.querySelectorAll(".products-category");
    productCategories.forEach((cat) => {
      cat.style.display = "none";
    });

    let resultsHeader = document.querySelector(".search-results-header");
    if (!resultsHeader) {
      resultsHeader = document.createElement("h2");
      resultsHeader.className = "search-results-header";
      document
        .querySelector(".products-section")
        .insertBefore(
          resultsHeader,
          document.querySelector(".products-section").firstChild,
        );
    } else {
      resultsHeader.innerHTML = `Результаты поиска: "${query}" (0)`;
      resultsHeader.style.display = "block";
    }

    let searchResultsGrid = document.getElementById("search-results-grid");
    if (searchResultsGrid) {
      searchResultsGrid.innerHTML = `
        <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #666;">
          <i class="fa fa-search" style="font-size: 48px; margin-bottom: 20px; color: #ccc;"></i>
          <h3 style="margin-bottom: 10px;">Ничего не найдено</h3>
          <p>Попробуйте изменить поисковый запрос</p>
        </div>
      `;
    }

    searchResults.innerHTML =
      '<div class="search-result-item">Ничего не найдено</div>';
    searchResults.style.display = "block";
  }

  searchMode = true;
}

function clearSearch() {
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const clearBtn = document.getElementById("search-clear-btn");
  const resultsHeader = document.querySelector(".search-results-header");
  const searchResultsGrid = document.getElementById("search-results-grid");
  const productCategories = document.querySelectorAll(".products-category");

  if (clearBtn) clearBtn.style.display = "none";
  if (searchResults) searchResults.style.display = "none";
  if (resultsHeader) resultsHeader.style.display = "none";
  if (searchResultsGrid) searchResultsGrid.remove();

  productCategories.forEach((cat) => {
    cat.style.display = "block";
  });

  const sectionsToShow = [
    ".contact-hero",
    ".news-section",
    ".reviews",
    ".gallery",
    ".subscribe",
  ];
  sectionsToShow.forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) element.style.display = "block";
  });

  document.body.classList.remove("search-filter-mode");
  searchMode = false;
}

function enableSearchMode() {
  document.body.classList.add("search-filter-mode");

  const sectionsToHide = [
    ".contact-hero",
    ".news-section",
    ".reviews",
    ".gallery",
    ".subscribe",
  ];
  sectionsToHide.forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) element.style.display = "none";
  });
}

function initCounters() {
  updateFavoriteCounter();
  updateCartCounter();
}

function updateFavoriteCounter() {
  const favoriteCounter = document.querySelector(".favorite-counter");
  if (favoriteCounter) {
    if (favoriteCount > 0) {
      favoriteCounter.textContent = favoriteCount;
      favoriteCounter.style.display = "flex";
    } else {
      favoriteCounter.style.display = "none";
    }
  }
}

function updateCartCounter() {
  const cartCounter = document.querySelector(".cart-counter");
  if (cartCounter) {
    if (cartCount > 0) {
      cartCounter.textContent = cartCount;
      cartCounter.style.display = "flex";
    } else {
      cartCounter.style.display = "none";
    }
  }
}

function initButtons() {
  initFavoriteButtons();
  initBuyButtons();
}

function initFavoriteButtons() {
  const favoriteButtons = document.querySelectorAll(".favorite-btn");

  favoriteButtons.forEach((button) => {
    const productCard = button.closest(".product-card");
    if (!productCard) return;

    const productTitle =
      productCard.querySelector(".product-title").textContent;
    const isFavorite = favoriteItems.some((item) => item.id === productTitle);

    if (isFavorite) {
      button.classList.add("active");
      button.innerHTML = '<i class="fa fa-heart"></i>';
    }

    button.removeEventListener("click", toggleFavoriteHandler);
    button.addEventListener("click", toggleFavoriteHandler);
  });
}

function toggleFavoriteHandler(e) {
  e.stopPropagation();
  const button = e.currentTarget;
  const productCard = button.closest(".product-card");
  toggleFavorite(productCard, button);
}

function initBuyButtons() {
  const buyButtons = document.querySelectorAll(".buy-btn");

  buyButtons.forEach((button) => {
    button.removeEventListener("click", buyHandler);
    button.addEventListener("click", buyHandler);
  });
}

function buyHandler(e) {
  e.stopPropagation();
  const button = e.currentTarget;
  addToCart(button.closest(".product-card"));
}

function initModals() {
  const cartModal = document.getElementById("cart-modal");
  const favoriteModal = document.getElementById("favorite-modal");
  const loginModal = document.getElementById("login-modal");
  const registerModal = document.getElementById("register-modal");

  const cartIcon = document.getElementById("cart-icon");
  const favoriteIcon = document.getElementById("favorite-icon");
  const userIcon = document.getElementById("user-icon");

  const closeButtons = document.querySelectorAll(".close-modal");
  const continueButtons = document.querySelectorAll(".btn-continue");

  if (cartIcon) cartIcon.addEventListener("click", () => openModal(cartModal));
  if (favoriteIcon)
    favoriteIcon.addEventListener("click", () => openModal(favoriteModal));
  if (userIcon) userIcon.addEventListener("click", () => openModal(loginModal));

  const openRegisterBtn = document.getElementById("open-register-modal");
  if (openRegisterBtn) {
    openRegisterBtn.addEventListener("click", function (e) {
      e.preventDefault();
      closeModal(loginModal);
      openModal(registerModal);
    });
  }

  const backToLoginBtn = document.querySelector(".btn-back-to-login");
  if (backToLoginBtn) {
    backToLoginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      closeModal(registerModal);
      openModal(loginModal);
    });
  }

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const modal = this.closest(".modal");
      closeModal(modal);
    });
  });

  continueButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const modal = this.closest(".modal");
      closeModal(modal);
    });
  });

  window.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal")) {
      closeModal(e.target);
    }
  });

  const checkoutBtn = document.querySelector(".btn-checkout");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      if (cartItems.length > 0) {
        alert(
          `Заказ оформлен!\n\nТоваров: ${cartCount}\nСумма: ${calculateCartTotal()} ₽\n\nСпасибо за покупку!`,
        );
        clearCart();
        closeModal(cartModal);
      }
    });
  }
}

function initForms() {
  const loginSubmit = document.getElementById("login-submit");
  if (loginSubmit) {
    loginSubmit.addEventListener("click", function (e) {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      if (email && password) {
        alert(
          `Вход выполнен!\nEmail: ${email}\n\nДобро пожаловать в личный кабинет!`,
        );
        closeModal(document.getElementById("login-modal"));
        document.getElementById("login-form").reset();
      } else {
        alert("Пожалуйста, заполните все поля!");
      }
    });
  }

  // business form
  const businessForm = document.getElementById("business-form");
  if (businessForm) {
    businessForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const company = document.getElementById("business-company").value;
      const contact = document.getElementById("business-contact").value;
      const phone = document.getElementById("business-phone").value;
      const email = document.getElementById("business-email").value;

      alert(
        `Спасибо за заявку!\n\nОрганизация: ${company}\nКонтактное лицо: ${contact}\nТелефон: ${phone}\nEmail: ${email}\n\nНаш менеджер свяжется с вами в ближайшее время.`,
      );
      businessForm.reset();
    });
  }

  const registerSubmit = document.getElementById("register-submit");
  if (registerSubmit) {
    registerSubmit.addEventListener("click", function (e) {
      e.preventDefault();
      const name = document.getElementById("reg-name").value;
      const email = document.getElementById("reg-email").value;
      const phone = document.getElementById("reg-phone").value;
      const password = document.getElementById("reg-password").value;
      const confirmPassword = document.getElementById(
        "reg-confirm-password",
      ).value;

      if (!name || !email || !phone || !password || !confirmPassword) {
        alert("Пожалуйста, заполните все поля!");
        return;
      }

      if (password !== confirmPassword) {
        alert("Пароли не совпадают!");
        return;
      }

      if (!validateEmail(email)) {
        alert("Пожалуйста, введите корректный email адрес!");
        return;
      }

      alert(
        `Регистрация успешна!\n\nИмя: ${name}\nEmail: ${email}\nТелефон: ${phone}\n\nТеперь вы можете войти в личный кабинет.`,
      );
      closeModal(document.getElementById("register-modal"));
      document.getElementById("register-form").reset();
    });
  }

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("cf-name").value;
      const phone = document.getElementById("cf-phone").value;
      const email = document.getElementById("cf-email").value;
      const department = document.getElementById("cf-dept").value;

      if (!name || !phone || !email || !department) {
        alert("Пожалуйста, заполните все поля!");
        return;
      }

      alert(
        `Спасибо за обращение, ${name}!\n\nМы получили вашу заявку и перезвоним вам в течение 15 минут.\n\nТелефон: ${phone}\nEmail: ${email}\nОтдел: ${department}`,
      );
      contactForm.reset();
    });
  }

  const subscribeBtn = document.getElementById("subscribe-btn");
  if (subscribeBtn) {
    subscribeBtn.addEventListener("click", function () {
      const emailInput = document.getElementById("subscribe-email");
      const email = emailInput.value;

      if (email && validateEmail(email)) {
        alert(
          `Спасибо за подписку!\n\nНа адрес ${email} будут приходить лучшие предложения.`,
        );
        emailInput.value = "";
      } else {
        alert("Пожалуйста, введите корректный email адрес.");
      }
    });
  }

  const callbackLinks = document.querySelectorAll(
    ".callback-link, .callback-link-top",
  );
  callbackLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const phone = prompt("Пожалуйста, введите ваш номер телефона:");
      if (phone && phone.trim() !== "") {
        alert(
          `Спасибо! Мы перезвоним вам на номер ${phone} в ближайшее время.`,
        );
      }
    });
  });

  const readMoreLinks = document.querySelectorAll(".read-more");
  readMoreLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const newsItem = this.closest(".news-item");
      if (newsItem) {
        const newsTitle = newsItem.querySelector(".news-title").textContent;
        alert(
          `Вы переходите к статье: "${newsTitle}"\n\nВ реальном приложении здесь будет открыта полная статья.`,
        );
      }
    });
  });

  const fullReviewLinks = document.querySelectorAll(".full-review-link");
  fullReviewLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const reviewCard = this.closest(".review-card");
      if (reviewCard) {
        const reviewerName =
          reviewCard.querySelector(".reviewer-name").textContent;
        alert(
          `Вы переходите к полному отзыву от ${reviewerName}\n\nВ реальном приложении здесь будет открыт полный текст отзыва.`,
        );
      }
    });
  });

  const allNewsLink = document.querySelector(".all-news-link");
  if (allNewsLink) {
    allNewsLink.addEventListener("click", function (e) {
      e.preventDefault();
      alert(
        "Вы переходите ко всем новостям\n\nВ реальном приложении здесь будет открыта страница со всеми новостями.",
      );
    });
  }

  // FAQ ակորդեոն
  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", function (e) {
      const faqItem = this.closest(".faq-item");
      faqItem.classList.toggle("active");

      const icon = this.querySelector(".fa-chevron-down");
      if (faqItem.classList.contains("active")) {
        icon.style.transform = "rotate(180deg)";
      } else {
        icon.style.transform = "rotate(0)";
      }
    });
  });
}

function toggleFavorite(productCard, button) {
  if (!productCard) return;

  const productTitle = productCard.querySelector(".product-title").textContent;
  const productPrice = productCard.querySelector(".current-price").textContent;
  const productImage = productCard.querySelector(".product-image img").src;

  const product = {
    id: productTitle,
    title: productTitle,
    price: productPrice,
    image: productImage,
  };

  const isActive = button.classList.contains("active");

  if (!isActive) {
    button.classList.add("active");
    button.innerHTML = '<i class="fa fa-heart"></i>';
    favoriteCount++;
    favoriteItems.push(product);

    const favoriteIcon = document.querySelector("#favorite-icon");
    if (favoriteIcon) {
      favoriteIcon.style.animation = "bounce 0.5s";
      setTimeout(() => {
        favoriteIcon.style.animation = "";
      }, 500);
    }
  } else {
    button.classList.remove("active");
    button.innerHTML = '<i class="fa fa-heart-o"></i>';
    favoriteCount--;
    favoriteItems = favoriteItems.filter((item) => item.id !== product.id);
  }

  updateLocalStorage();
  updateFavoriteCounter();
  updateFavoriteModal();
}

function addToCart(productCard) {
  if (!productCard) return;

  const productTitle = productCard.querySelector(".product-title").textContent;
  const productPrice = productCard.querySelector(".current-price").textContent;
  const productImage = productCard.querySelector(".product-image img").src;
  const button = productCard.querySelector(".buy-btn");

  const existingItemIndex = cartItems.findIndex(
    (item) => item.id === productTitle,
  );

  if (existingItemIndex !== -1) {
    cartItems[existingItemIndex].quantity += 1;
  } else {
    cartItems.push({
      id: productTitle,
      title: productTitle,
      price: productPrice,
      image: productImage,
      quantity: 1,
    });
  }

  cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fa fa-check"></i> Добавлено';
    button.style.background = "#4CAF50";
    button.disabled = true;

    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = "";
      button.disabled = false;
    }, 1500);
  }

  const cartIcon = document.querySelector("#cart-icon");
  if (cartIcon) {
    cartIcon.style.animation = "bounce 0.5s";
    setTimeout(() => {
      cartIcon.style.animation = "";
    }, 500);
  }

  updateLocalStorage();
  updateCartCounter();
  updateCartModal();
}

function removeFromCart(itemId) {
  const itemIndex = cartItems.findIndex((item) => item.id === itemId);

  if (itemIndex !== -1) {
    cartCount -= cartItems[itemIndex].quantity;
    cartItems.splice(itemIndex, 1);

    updateLocalStorage();
    updateCartCounter();
    updateCartModal();
  }
}

function updateQuantity(itemId, change) {
  const itemIndex = cartItems.findIndex((item) => item.id === itemId);

  if (itemIndex !== -1) {
    const item = cartItems[itemIndex];

    if (change === 1) {
      item.quantity += 1;
      cartCount += 1;
    } else if (change === -1 && item.quantity > 1) {
      item.quantity -= 1;
      cartCount -= 1;
    } else if (change === -1 && item.quantity === 1) {
      removeFromCart(itemId);
      return;
    }

    updateLocalStorage();
    updateCartCounter();
    updateCartModal();
  }
}

function clearCart() {
  cartItems = [];
  cartCount = 0;

  updateLocalStorage();
  updateCartCounter();
  updateCartModal();
}

function updateCartModal() {
  const container = document.getElementById("cart-items-container");
  const totalItemsCount = document.getElementById("total-items-count");
  const totalPrice = document.getElementById("total-price");

  if (!container || !totalItemsCount || !totalPrice) return;

  if (cartItems.length === 0) {
    container.innerHTML =
      '<p class="empty-cart-message">Ваша корзина пуста</p>';
    totalItemsCount.textContent = "0";
    totalPrice.textContent = "0 ₽";
    return;
  }

  let itemsHTML = "";
  let total = 0;

  cartItems.forEach((item) => {
    const price = parseInt(item.price.replace(/\D/g, ""));
    const itemTotal = price * item.quantity;
    total += itemTotal;

    itemsHTML += `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">${item.price}</div>
          <div class="cart-item-quantity">
            <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
            <span class="quantity">${item.quantity} шт.</span>
            <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
            <button class="remove-item" onclick="removeFromCart('${item.id}')">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = itemsHTML;
  totalItemsCount.textContent = cartCount;
  totalPrice.textContent = total.toLocaleString("ru-RU") + " ₽";
}

function updateFavoriteModal() {
  const container = document.getElementById("favorite-items-container");
  if (!container) return;

  if (favoriteItems.length === 0) {
    container.innerHTML =
      '<p class="empty-favorite-message">У вас пока нет избранных товаров</p>';
    return;
  }

  let itemsHTML = "";

  favoriteItems.forEach((item) => {
    itemsHTML += `
      <div class="favorite-item">
        <div class="favorite-item-image">
          <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="favorite-item-info">
          <div class="favorite-item-title">${item.title}</div>
          <div class="favorite-item-price">${item.price}</div>
        </div>
        <button class="remove-item" onclick="removeFromFavorites('${item.id}')">
          <i class="fa fa-trash"></i>
        </button>
      </div>
    `;
  });

  container.innerHTML = itemsHTML;
}

function removeFromFavorites(itemId) {
  const buttons = document.querySelectorAll(".favorite-btn");
  buttons.forEach((button) => {
    const productCard = button.closest(".product-card");
    if (productCard) {
      const productTitle =
        productCard.querySelector(".product-title").textContent;
      if (productTitle === itemId) {
        button.classList.remove("active");
        button.innerHTML = '<i class="fa fa-heart-o"></i>';
      }
    }
  });

  favoriteItems = favoriteItems.filter((item) => item.id !== itemId);
  favoriteCount = favoriteItems.length;

  updateLocalStorage();
  updateFavoriteCounter();
  updateFavoriteModal();
}

function loadFavoriteItems() {
  favoriteItems.forEach((item) => {
    const buttons = document.querySelectorAll(".favorite-btn");
    buttons.forEach((button) => {
      const productCard = button.closest(".product-card");
      if (productCard) {
        const productTitle =
          productCard.querySelector(".product-title").textContent;
        if (productTitle === item.id) {
          button.classList.add("active");
          button.innerHTML = '<i class="fa fa-heart"></i>';
        }
      }
    });
  });
}

function loadCartItems() {
  cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  updateCartCounter();
}

function updateLocalStorage() {
  localStorage.setItem("favoriteCount", favoriteCount);
  localStorage.setItem("cartCount", cartCount);
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  localStorage.setItem("favoriteItems", JSON.stringify(favoriteItems));
}

function calculateCartTotal() {
  let total = 0;
  cartItems.forEach((item) => {
    const price = parseInt(item.price.replace(/\D/g, ""));
    total += price * item.quantity;
  });
  return total.toLocaleString("ru-RU");
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function openModal(modal) {
  if (!modal) return;

  modal.classList.add("show");
  document.body.style.overflow = "hidden";

  if (modal.id === "cart-modal") {
    updateCartModal();
  } else if (modal.id === "favorite-modal") {
    updateFavoriteModal();
  }
}

function closeModal(modal) {
  if (!modal) return;

  modal.classList.remove("show");
  document.body.style.overflow = "auto";
}

function initCatalogFilters() {
  const minPrice = document.getElementById("min-price");
  const maxPrice = document.getElementById("max-price");
  const priceApply = document.querySelector(".price-apply");
  const resetFilters = document.querySelector(".reset-filters");
  const sortSelect = document.getElementById("sort-select");
  const filterCheckboxes = document.querySelectorAll(
    ".filter-checkboxes input",
  );

  if (priceApply) {
    priceApply.addEventListener("click", function () {
      applyPriceFilter();
    });
  }

  if (resetFilters) {
    resetFilters.addEventListener("click", function () {
      resetAllFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      sortProducts(this.value);
    });
  }

  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      applyCategoryFilters();
    });
  });
}

function applyPriceFilter() {
  const minPrice = document.getElementById("min-price")?.value || 0;
  const maxPrice = document.getElementById("max-price")?.value || 10000;
  alert(
    `Фильтр по цене: от ${minPrice} до ${maxPrice} руб.\n\nВ реальном приложении здесь будет фильтрация товаров.`,
  );
}

function resetAllFilters() {
  const minPrice = document.getElementById("min-price");
  const maxPrice = document.getElementById("max-price");
  const filterCheckboxes = document.querySelectorAll(
    ".filter-checkboxes input",
  );
  const sortSelect = document.getElementById("sort-select");

  if (minPrice) minPrice.value = 0;
  if (maxPrice) maxPrice.value = 10000;
  if (sortSelect) sortSelect.value = "popular";

  filterCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  alert("Все фильтры сброшены!");
}

function sortProducts(sortBy) {
  let sortText = "";
  switch (sortBy) {
    case "price-asc":
      sortText = "цене (возрастание)";
      break;
    case "price-desc":
      sortText = "цене (убывание)";
      break;
    case "name":
      sortText = "названию";
      break;
    default:
      sortText = "популярности";
  }
  alert(
    `Сортировка по ${sortText}\n\nВ реальном приложении здесь будет сортировка товаров.`,
  );
}

function applyCategoryFilters() {
  alert(
    "Фильтр по категориям применен!\n\nВ реальном приложении здесь будет фильтрация товаров.",
  );
}

window.changeSlide = changeSlide;
window.currentSlide = currentSlide;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.removeFromFavorites = removeFromFavorites;
window.clearSearch = clearSearch;
