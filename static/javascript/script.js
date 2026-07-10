"use strict";

/* =========================
   VELORA COMMON
========================= */

const Velora = {
  showAlert({ icon = "success", title = "", text = "", timer = 1800 }) {
    if (window.Swal) {
      Swal.fire({
        icon,
        title,
        text,
        timer,
        showConfirmButton: false,
      });
    } else {
      alert(title || text);
    }
  },

  confirmAction({
    title = "Are you sure?",
    text = "This action cannot be undone.",
    confirmButtonText = "Yes, continue",
    confirmButtonColor = "#2563eb",
    onConfirm,
  }) {
    if (!window.Swal) {
      if (confirm(text) && typeof onConfirm === "function") onConfirm();
      return;
    }

    Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor,
      cancelButtonColor: "#64748b",
      confirmButtonText,
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed && typeof onConfirm === "function") {
        onConfirm();
      }
    });
  },
};

const Toast = window.Swal
  ? Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: true,
    })
  : null;

function showToast(icon, title) {
  if (Toast) {
    Toast.fire({ icon, title });
  } else {
    alert(title);
  }
}

function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return document.querySelectorAll(selector);
}

function fetchJSON(url, options = {}) {
  const headers = {
    "X-Requested-With": "XMLHttpRequest",
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers: headers,
  }).then((res) => {
    if (!res.ok) {
      throw new Error("Network error");
    }

    return res.json();
  });
}

function getCSRFToken() {
  const token = document.querySelector("[name=csrfmiddlewaretoken]");
  if (token) return token.value;

  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "csrftoken") return value;
  }

  return "";
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value || "Not added";
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHTML(value)
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   MAIN INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  initWebsite();
  initProfileDropdown();
  initAccountPage();
  initAdmin();
  initAjaxCRUD();
  initCheckoutPage();
});

/* =========================
   WEBSITE
========================= */

function initWebsite() {
  initCountdown();
  initStickyNavbar();
  initSmoothScroll();
  initNewsletter();
  initBackToTop();
  initRevealAnimation();
  initContactForm();
  initCartButtons();
  initWishlistButtons();
}

function initCountdown() {
  const daysEl = qs("#days");
  const hoursEl = qs("#hours");
  const minutesEl = qs("#minutes");
  const secondsEl = qs("#seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const saleEndDate = new Date();
  saleEndDate.setDate(saleEndDate.getDate() + 5);

  const updateCountdown = () => {
    const distance = saleEndDate - new Date();

    if (distance <= 0) {
      [daysEl, hoursEl, minutesEl, secondsEl].forEach((el) => {
        el.textContent = "00";
      });
      return;
    }

    daysEl.textContent = String(
      Math.floor(distance / (1000 * 60 * 60 * 24))
    ).padStart(2, "0");

    hoursEl.textContent = String(
      Math.floor((distance / (1000 * 60 * 60)) % 24)
    ).padStart(2, "0");

    minutesEl.textContent = String(
      Math.floor((distance / (1000 * 60)) % 60)
    ).padStart(2, "0");

    secondsEl.textContent = String(
      Math.floor((distance / 1000) % 60)
    ).padStart(2, "0");
  };

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function initStickyNavbar() {
  const navbar = qs(".navbar");
  if (!navbar) return;

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("shadow", window.scrollY > 50);
  });
}

function initSmoothScroll() {
  qsa('a[href^="#"]').forEach((anchor) => {
    if (anchor.dataset.bound) return;
    anchor.dataset.bound = "true";

    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = qs(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

function initNewsletter() {
  const form = qs(".newsletter-form");
  if (!form || form.dataset.bound) return;

  form.dataset.bound = "true";

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const input = form.querySelector('input[type="email"]');

    if (!input || input.value.trim() === "") {
      showToast("warning", "Please enter email");
      return;
    }

    showToast("success", "Thanks for subscribing!");
    input.value = "";
  });
}

function initBackToTop() {
  let topButton = qs(".back-to-top-btn");

  if (!topButton) {
    topButton = document.createElement("button");
    topButton.innerHTML = "↑";
    topButton.className = "back-to-top-btn";
    document.body.appendChild(topButton);
  }

  window.addEventListener("scroll", () => {
    topButton.style.display = window.scrollY > 300 ? "block" : "none";
  });

  topButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initRevealAnimation() {
  const reveals = qsa(".reveal");
  if (!reveals.length) return;

  reveals.forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(40px)";
    item.style.transition = "0.6s";
  });

  const revealOnScroll = () => {
    reveals.forEach((item) => {
      if (item.getBoundingClientRect().top < window.innerHeight - 100) {
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      }
    });
  };

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll();
}

function initContactForm() {
  const contactForm = qs(".contact-form form");
  if (!contactForm || contactForm.dataset.bound) return;

  contactForm.dataset.bound = "true";

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    showToast("success", "Message sent successfully!");
    this.reset();
  });
}

function initCartButtons() {
  qsa(".add-cart-btn").forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "true";

    btn.addEventListener("click", function (e) {
      e.preventDefault();

      fetchJSON(this.dataset.url, {
        method: "GET",
      })
        .then((data) => {
          showToast("success", data.message || "Product added to cart");
        })
        .catch(() => showToast("error", "Something went wrong."));
    });
  });
}

function initWishlistButtons() {
  qsa(".wishlist-btn").forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "true";

    btn.addEventListener("click", function (e) {
      e.preventDefault();

      fetchJSON(this.dataset.url, {
        method: "GET",
      })
        .then((data) => {
          if (data.status === "added") {
            this.innerHTML = '<i class="bi bi-heart-fill text-danger"></i>';
            showToast("success", data.message || "Added to wishlist");
          } else {
            this.innerHTML = '<i class="bi bi-heart"></i>';
            showToast("info", data.message || "Removed from wishlist");
          }
        })
        .catch(() => showToast("error", "Something went wrong."));
    });
  });
}

/* =========================
   PROFILE DROPDOWN
========================= */

function initProfileDropdown() {
  const profileMenu = qs("#profileMenu");

  window.toggleProfileMenu = function () {
    if (profileMenu) profileMenu.classList.toggle("show");
  };

  document.addEventListener("click", function (e) {
    const dropdown = qs(".profile-dropdown");

    if (dropdown && !dropdown.contains(e.target) && profileMenu) {
      profileMenu.classList.remove("show");
    }
  });
}

/* =========================
   ACCOUNT PAGE
========================= */

function initAccountPage() {
  initAccountTabs();
  initProfileModal();
  initAddressModal();
  initProfileImagePreview();
  initProfileUpdate();
  initAddressForm();
  initAddressActions();
}

function initAccountTabs() {
  qsa(".account-menu button").forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "true";

    btn.addEventListener("click", function () {
      qsa(".account-menu button").forEach((b) => b.classList.remove("active"));
      qsa(".account-tab").forEach((tab) => tab.classList.remove("active"));

      this.classList.add("active");

      const tab = document.getElementById(this.dataset.tab);
      if (tab) tab.classList.add("active");
    });
  });
}

function openModal(selector) {
  const modal = qs(selector);
  if (modal) modal.classList.add("show");
}

function closeModal(selector) {
  const modal = qs(selector);
  if (modal) modal.classList.remove("show");
}

function closeBootstrapModal(form) {
  const modal = form.closest(".modal");
  if (!modal || !window.bootstrap) return;

  const modalInstance =
    bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);

  modalInstance.hide();
}

function initProfileModal() {
  window.openProfileModal = () => openModal("#profileModal");
  window.closeProfileModal = () => closeModal("#profileModal");

  const modal = qs("#profileModal");
  if (!modal || modal.dataset.bound) return;

  modal.dataset.bound = "true";

  modal.addEventListener("click", function (e) {
    if (e.target === this) closeProfileModal();
  });
}

function initAddressModal() {
  window.openAddressModal = function () {
    resetAddressForm();
    openModal("#addressModal");
  };

  window.closeAddressModal = () => closeModal("#addressModal");

  const modal = qs("#addressModal");
  if (!modal || modal.dataset.bound) return;

  modal.dataset.bound = "true";

  modal.addEventListener("click", function (e) {
    if (e.target === this) closeAddressModal();
  });
}

function initProfileImagePreview() {
  const input = qs("#id_profile_image");
  if (!input || input.dataset.bound) return;

  input.dataset.bound = "true";

  input.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    setText("fileName", file.name);

    const reader = new FileReader();

    reader.onload = function (e) {
      const previewImage = qs("#previewImage");
      const previewIcon = qs("#previewIcon");

      if (previewImage) {
        previewImage.src = e.target.result;
        previewImage.classList.remove("d-none");
      }

      if (previewIcon) {
        previewIcon.classList.add("d-none");
      }
    };

    reader.readAsDataURL(file);
  });
}

function initProfileUpdate() {
  const form = qs("#profileForm");
  if (!form || form.dataset.bound) return;

  form.dataset.bound = "true";

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const formData = new FormData(form);

    fetchJSON(form.dataset.url, {
      method: "POST",
      body: formData,
      headers: {
        "X-CSRFToken": getCSRFToken(),
      },
    })
      .then((data) => {
        if (submitBtn) submitBtn.disabled = false;

        if (data.status !== "success") {
          showToast("error", data.message || "Update failed");
          return;
        }

        closeProfileModal();
        showToast("success", data.message || "Profile updated");
        updateProfileUI(data.user);
      })
      .catch(() => {
        if (submitBtn) submitBtn.disabled = false;
        showToast("error", "Something went wrong.");
      });
  });
}

function updateProfileUI(user) {
  if (!user) return;

  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();

  setText("profileName", fullName);
  setText("showFirstName", user.first_name);
  setText("showLastName", user.last_name);
  setText("showUsername", user.username);
  setText("showEmail", user.email);
  setText("showMobile", user.mobile_no);

  if (user.profile_image) {
    const img = qs("#profileCardImage");
    const avatar = qs("#profileAvatarBox");

    if (img) {
      img.src = user.profile_image;
      img.classList.remove("d-none");
    }

    if (avatar) avatar.classList.add("d-none");
  }
}

/* =========================
   ADDRESS
========================= */

function addressHTML(address) {
  const isDefault = address.is_default === true;

  return `
    <div class="address-box ${isDefault ? "default-address" : ""}" data-id="${address.id}">
      <div>
        <h5>${escapeHTML(address.full_name)}</h5>
        <p><i class="bi bi-telephone"></i> ${escapeHTML(address.mobile_no)}</p>
        <p>
          ${escapeHTML(address.address_line1)}
          ${address.address_line2 ? ", " + escapeHTML(address.address_line2) : ""},
          ${escapeHTML(address.city)},
          ${escapeHTML(address.state_name)},
          ${escapeHTML(address.country_name)} - ${escapeHTML(address.pincode)}
        </p>
      </div>

      <div class="address-actions">
        <button type="button"
                class="edit-btn edit-address-ajax"
                data-id="${address.id}"
                data-full-name="${escapeAttr(address.full_name)}"
                data-mobile-no="${escapeAttr(address.mobile_no)}"
                data-line1="${escapeAttr(address.address_line1)}"
                data-line2="${escapeAttr(address.address_line2)}"
                data-city="${escapeAttr(address.city)}"
                data-state="${escapeAttr(address.state_name)}"
                data-country="${escapeAttr(address.country_name)}"
                data-pincode="${escapeAttr(address.pincode)}"
                data-default="${isDefault}">
          Edit
        </button>

        ${
          isDefault
            ? `
              <span class="default-badge">Default</span>
              <button type="button"
                      class="delete-btn delete-address-ajax"
                      data-url="/address/delete/${address.id}/">
                Remove
              </button>
            `
            : `
              <button type="button"
                      class="set-btn set-default-ajax"
                      data-url="/address/default/${address.id}/">
                Set Default
              </button>
              <button type="button"
                      class="delete-btn delete-address-ajax"
                      data-url="/address/delete/${address.id}/">
                Delete
              </button>
            `
        }
      </div>
    </div>
  `;
}

function renderAddresses(defaultAddress, otherAddresses = []) {
  const defaultBox = qs("#defaultAddressBox");
  const otherSection = qs("#otherAddressSection");
  const otherList = qs("#otherAddressList");

  if (!defaultBox || !otherSection || !otherList) return;

  if (defaultAddress) {
    defaultBox.innerHTML = `
      <h5 class="mini-title">Default Address</h5>
      ${addressHTML(defaultAddress)}
    `;
  } else {
    defaultBox.innerHTML = `
      <p class="empty-text" id="noDefaultText">
        No default address added yet.
      </p>
    `;
  }

  otherList.innerHTML = otherAddresses.map(addressHTML).join("");
  otherSection.style.display = otherAddresses.length ? "block" : "none";
}

function collectDefaultAddress() {
  const card = qs("#defaultAddressBox .address-box");
  return card ? cardToAddressObject(card, true) : null;
}

function collectOtherAddresses() {
  return [...qsa("#otherAddressList .address-box")]
    .map((card) => cardToAddressObject(card, false))
    .filter(Boolean);
}

function cardToAddressObject(card, isDefault) {
  const editBtn = card.querySelector(".edit-address-ajax");
  if (!editBtn) return null;

  return {
    id: card.dataset.id,
    full_name: editBtn.dataset.fullName || "",
    mobile_no: editBtn.dataset.mobileNo || "",
    address_line1: editBtn.dataset.line1 || "",
    address_line2: editBtn.dataset.line2 || "",
    city: editBtn.dataset.city || "",
    state_name: editBtn.dataset.state || "",
    country_name: editBtn.dataset.country || "",
    pincode: editBtn.dataset.pincode || "",
    is_default: isDefault,
  };
}

function initAddressForm() {
  const form = qs("#addressForm");
  if (!form || form.dataset.bound) return;

  form.dataset.bound = "true";

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const submitBtn = qs("#addressSubmitBtn");
    if (submitBtn) submitBtn.disabled = true;

    const formData = new FormData(form);
    const formType = qs("#addressFormType")?.value;
    const addressId = qs("#addressId")?.value;

    let url = form.dataset.addUrl;

    if (formType === "edit_address") {
      url = `/address/edit/${addressId}/`;
    }

    fetchJSON(url, {
      method: "POST",
      body: formData,
      headers: {
        "X-CSRFToken": getCSRFToken(),
      },
    })
      .then((data) => {
        if (submitBtn) submitBtn.disabled = false;

        if (data.status !== "success") {
          showToast("error", data.message || "Address action failed");
          return;
        }

        closeAddressModal();
        showToast("success", data.message || "Address saved");
        form.reset();

        if (formType === "edit_address") {
          updateAddressInDOM(data.address);
        } else {
          addAddressToDOM(data.address);
        }
      })
      .catch(() => {
        if (submitBtn) submitBtn.disabled = false;
        showToast("error", "Something went wrong.");
      });
  });
}

function addAddressToDOM(address) {
  const defaultCard = qs("#defaultAddressBox .address-box");
  const otherList = qs("#otherAddressList");
  const otherSection = qs("#otherAddressSection");

  qs("#noDefaultText")?.remove();

  if (address.is_default) {
    const oldDefault = defaultCard ? cardToAddressObject(defaultCard, false) : null;
    const others = collectOtherAddresses();

    if (oldDefault) others.unshift(oldDefault);

    renderAddresses(address, others);
  } else {
    if (otherSection) otherSection.style.display = "block";
    if (otherList) otherList.insertAdjacentHTML("beforeend", addressHTML(address));
  }
}

function updateAddressInDOM(address) {
  let others = collectOtherAddresses().filter((a) => a.id !== address.id);
  let currentDefault = collectDefaultAddress();

  if (address.is_default) {
    if (currentDefault && currentDefault.id !== address.id) {
      currentDefault.is_default = false;
      others.unshift(currentDefault);
    }

    address.is_default = true;
    renderAddresses(address, others);
  } else {
    if (currentDefault && currentDefault.id === address.id) {
      currentDefault = null;
    }

    others.push(address);
    renderAddresses(currentDefault, others);
  }
}

function initAddressActions() {
  document.addEventListener("click", function (e) {
    const editBtn = e.target.closest(".edit-address-ajax");
    const setBtn = e.target.closest(".set-default-ajax");
    const deleteBtn = e.target.closest(".delete-address-ajax");

    if (editBtn) {
      openEditAddressModal(editBtn);
      return;
    }

    if (setBtn) {
      e.preventDefault();
      setDefaultAddress(setBtn);
      return;
    }

    if (deleteBtn) {
      e.preventDefault();
      deleteAddress(deleteBtn);
    }
  });
}

function openEditAddressModal(btn) {
  const form = qs("#addressForm");
  if (!form) return;

  form.reset();

  qs("#addressModalTitle").innerText = "Edit Address";
  qs("#addressSubmitBtn").innerText = "Update Address";
  qs("#addressFormType").value = "edit_address";
  qs("#addressId").value = btn.dataset.id;

  qs("#id_full_name").value = btn.dataset.fullName || "";
  qs("#id_mobile_no").value = btn.dataset.mobileNo || "";
  qs("#id_address_line1").value = btn.dataset.line1 || "";
  qs("#id_address_line2").value = btn.dataset.line2 || "";
  qs("#id_city").value = btn.dataset.city || "";
  qs("#id_state_name").value = btn.dataset.state || "";
  qs("#id_country_name").value = btn.dataset.country || "";
  qs("#id_pincode").value = btn.dataset.pincode || "";
  qs("#id_is_default").checked = btn.dataset.default === "true";

  openModal("#addressModal");
}

function resetAddressForm() {
  const form = qs("#addressForm");
  if (!form) return;

  form.reset();

  qs("#addressModalTitle").innerText = "Add New Address";
  qs("#addressSubmitBtn").innerText = "Add Address";
  qs("#addressFormType").value = "add_address";
  qs("#addressId").value = "";
}

function setDefaultAddress(btn) {
  fetchJSON(btn.dataset.url, {
    method: "POST",
    headers: {
      "X-CSRFToken": getCSRFToken(),
    },
  })
    .then((data) => {
      if (data.status !== "success") {
        showToast("error", data.message || "Failed");
        return;
      }

      showToast("success", data.message || "Default address updated");

      const selected = data.address;
      const oldDefault = collectDefaultAddress();

      let others = collectOtherAddresses().filter((a) => a.id !== selected.id);

      if (oldDefault) {
        oldDefault.is_default = false;
        others.unshift(oldDefault);
      }

      selected.is_default = true;
      renderAddresses(selected, others);
    })
    .catch(() => showToast("error", "Something went wrong."));
}

function deleteAddress(btn) {
  Velora.confirmAction({
    title: "Delete address?",
    text: "This address will be removed.",
    confirmButtonText: "Yes, delete",
    confirmButtonColor: "#ef4444",
    onConfirm: () => {
      fetchJSON(btn.dataset.url, {
        method: "POST",
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
      })
        .then((data) => {
          if (data.status !== "success") {
            showToast("error", data.message || "Failed");
            return;
          }

          showToast("success", data.message || "Address deleted");

          const deletedId = data.deleted_id;
          let defaultAddress = collectDefaultAddress();
          let others = collectOtherAddresses();

          if (defaultAddress && defaultAddress.id === deletedId) {
            defaultAddress = data.new_default;

            if (defaultAddress) {
              defaultAddress.is_default = true;
              others = others.filter((a) => a.id !== defaultAddress.id);
            }
          } else {
            others = others.filter((a) => a.id !== deletedId);
          }

          renderAddresses(defaultAddress, others);
        })
        .catch(() => showToast("error", "Something went wrong."));
    },
  });
}

/* =========================
   ADMIN
========================= */

function initAdmin() {
  initAdminConfirmForms();
  initDeleteConfirmations();
  initLiveDateTime();
  initAdminTheme();
}

function initAdminConfirmForms() {
  qsa(".confirm-form").forEach((form) => {
    if (form.dataset.bound) return;
    form.dataset.bound = "true";

    form.addEventListener("submit", function (e) {
      if (form.hasAttribute("data-ajax-form")) return;

      e.preventDefault();

      Velora.confirmAction({
        text: "This action will update the details.",
        confirmButtonText: "Yes, update it",
        onConfirm: () => form.submit(),
      });
    });
  });
}

function initDeleteConfirmations() {
  const deleteSelectors = [
    ".delete-user-btn",
    ".delete-role-btn",
    ".delete-product-btn",
    ".delete-category-btn",
  ];

  deleteSelectors.forEach((selector) => {
    qsa(selector).forEach((btn) => {
      if (btn.dataset.ajaxAction) return;

      btn.dataset.ajaxAction = "delete";
      btn.dataset.method = btn.dataset.method || "POST";
      btn.dataset.removeTarget = btn.dataset.removeTarget || "tr";
      btn.dataset.confirm =
        btn.dataset.confirm || "This item will be deleted permanently!";
    });
  });
}

function initLiveDateTime() {
  const element = qs("#liveDateTime");
  if (!element) return;

  const updateHeaderDateTime = () => {
    element.textContent = new Date().toLocaleString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  updateHeaderDateTime();
  setInterval(updateHeaderDateTime, 1000);
}

function initAdminTheme() {
  const themeBtn = qs("#themeToggleBtn");
  const themeText = qs("#themeToggleText");
  const savedTheme = localStorage.getItem("adminTheme");

  const setThemeText = () => {
    if (!themeText) return;

    themeText.textContent = document.body.classList.contains("admin-dark")
      ? "Light Mode"
      : "Dark Mode";
  };

  if (savedTheme === "dark") {
    document.body.classList.add("admin-dark");
  }

  setThemeText();

  if (!themeBtn || themeBtn.dataset.bound) return;

  themeBtn.dataset.bound = "true";

  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("admin-dark");

    localStorage.setItem(
      "adminTheme",
      document.body.classList.contains("admin-dark") ? "dark" : "light"
    );

    setThemeText();
  });
}

/* =========================
   COMMON AJAX CRUD
========================= */

function initAjaxCRUD() {
  initAjaxForms();
  initAjaxActions();
}

function initAjaxForms() {
  document.addEventListener("submit", function (e) {
    const form = e.target.closest("[data-ajax-form]");
    if (!form) return;

    e.preventDefault();

    const url = form.dataset.url || form.getAttribute("action");
    const method = form.dataset.method || form.getAttribute("method") || "POST";
    const confirmText = form.dataset.confirm || "";
    const submitBtn = form.querySelector('[type="submit"]');

    const runSubmit = () => {
      if (submitBtn) submitBtn.disabled = true;

      const formData = new FormData(form);

      fetchJSON(url, {
        method: method.toUpperCase(),
        body: formData,
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
      })
        .then((data) => {
          if (submitBtn) submitBtn.disabled = false;

          if (data.status !== "success") {
              showToast("error", data.message || "Update failed");
              return;
          }
          
          showToast("success", data.message || "Updated successfully");

          if (data.product) {
  const row = document.querySelector(`#product-row-${data.product.id}`);

  if (row) {
    row.querySelector(".product-name").innerText = data.product.name;
    row.querySelector(".product-category").innerText = data.product.category;
    row.querySelector(".product-price").innerText = "₹" + data.product.price;
    row.querySelector(".product-stock").innerText = data.product.stock;

    const statusEl = row.querySelector(".product-status");
    if (statusEl) {
      statusEl.innerText = data.product.status;
      statusEl.classList.remove("active", "inactive");
      statusEl.classList.add(data.product.status === "Active" ? "active" : "inactive");
    }
  }
}
          
          // Close Bootstrap modal
          const modal = form.closest(".modal");
          
          if (modal) {
              const instance = bootstrap.Modal.getInstance(modal);
              if (instance) instance.hide();
          }
          
          if (data.reset_form !== false) {
            form.reset();
          }

          if (form.dataset.closeModal !== "false") {
            closeBootstrapModal(form);
          }

          if (data.redirect_url) {
            window.location.href = data.redirect_url;
            return;
          }

          if (data.reload === true || form.dataset.reload === "true") {
            window.location.reload();
            return;
          }

          if (data.target && data.html) {
            const target = qs(data.target);
            if (target) target.innerHTML = data.html;
          }

          if (form.dataset.removeTarget) {
            const item = form.closest(form.dataset.removeTarget);
            if (item) item.remove();
          }
        })
        .catch(() => {
          if (submitBtn) submitBtn.disabled = false;
          showToast("error", "Something went wrong.");
        });
    };

    if (confirmText) {
      Velora.confirmAction({
        text: confirmText,
        confirmButtonText: form.dataset.confirmButton || "Yes, continue",
        onConfirm: runSubmit,
      });
    } else {
      runSubmit();
    }
  });
}

function initAjaxActions() {
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-ajax-action]");
    if (!btn) return;

    e.preventDefault();

    const action = btn.dataset.ajaxAction;
    const url = btn.dataset.url || btn.getAttribute("href");
    const method = btn.dataset.method || "POST";
    const removeTarget = btn.dataset.removeTarget || "tr";
    const confirmText = btn.dataset.confirm || "Are you sure?";
    const confirmBtn = btn.dataset.confirmButton || "Yes, continue";

    if (!url) return;

    const runAction = () => {
      btn.disabled = true;

      fetchJSON(url, {
        method: method.toUpperCase(),
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
      })
        .then((data) => {
          btn.disabled = false;

          if (data.status !== "success") {
            showToast("error", data.message || "Action failed");
            return;
          }

          showToast("success", data.message || "Action completed");

          if (action === "delete") {
            const item = btn.closest(removeTarget);
            if (item) item.remove();
          }

          if (action === "toggle") {
            btn.classList.toggle("active");

            if (data.text) {
              btn.innerHTML = data.text;
            }
          }

          if (data.redirect_url) {
            window.location.href = data.redirect_url;
            return;
          }

          if (data.reload === true || action === "reload") {
            window.location.reload();
            return;
          }

          if (data.target && data.html) {
            const target = qs(data.target);
            if (target) target.innerHTML = data.html;
          }

          if (data.count_target && data.count !== undefined) {
            const countTarget = qs(data.count_target);
            if (countTarget) countTarget.innerText = data.count;
          }
        })
        .catch(() => {
          btn.disabled = false;
          showToast("error", "Something went wrong.");
        });
    };

    Velora.confirmAction({
      text: confirmText,
      confirmButtonText: confirmBtn,
      confirmButtonColor: action === "delete" ? "#ef4444" : "#2563eb",
      onConfirm: runAction,
    });
  });
}

/* =========================
   AUTH PASSWORD
========================= */

function togglePassword() {
  const password = qs("#password");
  if (password) {
    password.type = password.type === "password" ? "text" : "password";
  }
}

function toggleConfirmPassword() {
  const confirmPassword = qs("#confirmPassword");
  if (confirmPassword) {
    confirmPassword.type =
      confirmPassword.type === "password" ? "text" : "password";
  }
}

/* =========================
   CHECKOUT PAGE
========================= */

function initCheckoutPage() {
  document.addEventListener("change", function (e) {
    if (e.target.name === "selected_address") {
      qsa(".checkout-address").forEach((card) => {
        card.classList.remove("selected");
      });

      e.target.closest(".checkout-address")?.classList.add("selected");
    }
  });

  document.addEventListener("click", function (e) {
    const btn = e.target.closest("#placeOrderBtn");
    if (!btn) return;

    const checkedPayment = qs('input[name="payment_method"]:checked');
    if (!checkedPayment) {
      showToast("warning", "Please select payment method");
      return;
    }

    const paymentMethod = checkedPayment.value;

    if (paymentMethod === "cod") {
      Swal.fire({
        icon: "success",
        title: "COD Selected",
        text: "Next step will create your order.",
        timer: 1500,
        showConfirmButton: false,
      });
    }

    if (paymentMethod === "razorpay") {
      const options = {
        key: btn.dataset.razorpayKey || "YOUR_RAZORPAY_KEY_ID",
        amount: btn.dataset.amount || "0",
        currency: "INR",
        name: "Velora",
        description: "Order Payment",

        handler: function (response) {
          Swal.fire({
            icon: "success",
            title: "Payment Successful",
            text: "Payment ID: " + response.razorpay_payment_id,
          });
        },

        prefill: {
          name: btn.dataset.name || "",
          email: btn.dataset.email || "",
          contact: btn.dataset.contact || "",
        },

        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    }
  });
}