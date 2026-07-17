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
  initProductDetailsPage();
  initAdminDeals();
  initDynamicBlogPage();
  initContactPage();
  initFooterNewsletter();
  initProductReviewSystem();
  initUnifiedProductCards();
  initShopPage();
  initHeaderProductSearch();
  initBlogCategoryManager();
  initAdminBlogManager();
  initPublicBlogPopup();
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

/* =========================================================
   PUBLIC BLOG DETAILS POPUP
========================================================= */



function initPublicBlogPopup() {
  const modalElement =
    document.getElementById(
      "publicBlogPopupModal"
    );

  if (
    !modalElement ||
    modalElement.dataset.bound ===
      "true"
  ) {
    return;
  }

  modalElement.dataset.bound =
    "true";

  let requestController = null;


  function getPopupModal() {
    if (!window.bootstrap) {
      return null;
    }

    return bootstrap.Modal
      .getOrCreateInstance(
        modalElement
      );
  }


  document.addEventListener(
    "click",
    function (event) {
      const trigger =
        event.target.closest(
          "[data-blog-popup]"
        );

      if (!trigger) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const url =
        trigger.dataset.detailsUrl;

      if (!url) {
        showToast(
          "error",
          "Blog details URL is missing."
        );

        return;
      }

      openPublicBlogPopup(url);
    }
  );


  document.addEventListener(
    "keydown",
    function (event) {
      const trigger =
        event.target.closest(
          "[data-blog-popup]"
        );

      if (!trigger) {
        return;
      }

      if (
        event.key !== "Enter" &&
        event.key !== " "
      ) {
        return;
      }

      event.preventDefault();

      openPublicBlogPopup(
        trigger.dataset.detailsUrl
      );
    }
  );


  async function openPublicBlogPopup(
    url
  ) {
    resetPublicBlogPopup();

    getPopupModal()?.show();

    if (requestController) {
      requestController.abort();
    }

    requestController =
      new AbortController();

    try {
      const response =
        await fetch(url, {
          method: "GET",

          headers: {
            "X-Requested-With":
              "XMLHttpRequest",
          },

          signal:
            requestController.signal,
        });

      const data =
        await response.json();

      if (
        !response.ok ||
        data.success === false ||
        !data.post
      ) {
        throw new Error(
          data.message ||
          "Unable to load this blog."
        );
      }

      renderPublicBlogPopup(
        data.post,
        data.related_posts || []
      );

    } catch (error) {
      if (
        error.name ===
        "AbortError"
      ) {
        return;
      }

      showPublicBlogPopupError(
        error.message
      );
    }
  }


  function resetPublicBlogPopup() {
    document
      .getElementById(
        "publicBlogPopupLoading"
      )
      ?.classList.remove(
        "d-none"
      );

    document
      .getElementById(
        "publicBlogPopupError"
      )
      ?.classList.add(
        "d-none"
      );

    document
      .getElementById(
        "publicBlogPopupContent"
      )
      ?.classList.add(
        "d-none"
      );

    const relatedContainer =
      document.getElementById(
        "popupRelatedBlogs"
      );

    if (relatedContainer) {
      relatedContainer.innerHTML =
        "";
    }

    document
      .getElementById(
        "popupRelatedSection"
      )
      ?.classList.add(
        "d-none"
      );
  }


  function showPublicBlogPopupError(
    message
  ) {
    document
      .getElementById(
        "publicBlogPopupLoading"
      )
      ?.classList.add(
        "d-none"
      );

    const errorBox =
      document.getElementById(
        "publicBlogPopupError"
      );

    if (!errorBox) {
      return;
    }

    const paragraph =
      errorBox.querySelector("p");

    if (paragraph) {
      paragraph.textContent =
        message ||
        "Please try again.";
    }

    errorBox.classList.remove(
      "d-none"
    );
  }


  function renderPublicBlogPopup(
    post,
    relatedPosts
  ) {
    setBlogPopupText(
      "popupBlogTitle",
      post.title ||
      "Untitled Story"
    );

    setBlogPopupText(
      "publicBlogPopupTitle",
      post.title ||
      "Blog Details"
    );

    setBlogPopupText(
      "popupBlogDescription",
      post.short_description ||
      "Discover this Velora story."
    );

    setBlogPopupText(
      "popupBlogCategory",
      post.category_name ||
      "Uncategorized"
    );

    setBlogPopupText(
      "popupBlogAuthor",
      post.author_name ||
      "Velora Team"
    );

    setBlogPopupText(
      "popupBlogDate",
      post.published_display ||
      "Not published"
    );

    setBlogPopupText(
      "popupBlogViews",
      `${Number(
        post.views_count || 0
      )} views`
    );

    const content =
      document.getElementById(
        "popupBlogContent"
      );

    if (content) {
      content.innerHTML =
        post.content ||
        "<p>No content available.</p>";
    }


    const featuredBadge =
      document.getElementById(
        "popupBlogFeatured"
      );

    featuredBadge?.classList.toggle(
      "d-none",
      !post.is_featured
    );


    const image =
      document.getElementById(
        "popupBlogImage"
      );

    const placeholder =
      document.getElementById(
        "popupBlogImagePlaceholder"
      );

    if (post.image) {
      image.src =
        post.image;

      image.alt =
        post.title || "Blog image";

      image.classList.remove(
        "d-none"
      );

      placeholder?.classList.add(
        "d-none"
      );

    } else {
      image.src = "";
      image.alt = "";

      image.classList.add(
        "d-none"
      );

      placeholder?.classList.remove(
        "d-none"
      );
    }


    const publicLink =
      document.getElementById(
        "popupBlogPublicLink"
      );

    if (
      publicLink &&
      post.public_url
    ) {
      publicLink.href =
        post.public_url;

      publicLink.classList.remove(
        "d-none"
      );

    } else {
      publicLink?.classList.add(
        "d-none"
      );
    }


    renderRelatedBlogs(
      relatedPosts
    );


    document
      .getElementById(
        "publicBlogPopupLoading"
      )
      ?.classList.add(
        "d-none"
      );

    document
      .getElementById(
        "publicBlogPopupContent"
      )
      ?.classList.remove(
        "d-none"
      );
  }


  function renderRelatedBlogs(
    posts
  ) {
    const section =
      document.getElementById(
        "popupRelatedSection"
      );

    const container =
      document.getElementById(
        "popupRelatedBlogs"
      );

    if (
      !section ||
      !container
    ) {
      return;
    }

    if (!posts.length) {
      section.classList.add(
        "d-none"
      );

      return;
    }

    container.innerHTML =
      posts
        .map((post) => {
          const imageMarkup =
            post.image
              ? `
                <img
                  src="${escapePopupHTML(
                    post.image
                  )}"
                  alt="${escapePopupHTML(
                    post.title
                  )}"
                >
              `
              : `
                <div class="popup-related-placeholder">
                  <i class="bi bi-image"></i>
                </div>
              `;

          return `
            <div class="col-lg-4 col-md-6">

              <button
                type="button"
                class="popup-related-card"
                data-blog-popup
                data-details-url="${escapePopupHTML(
                  post.details_url
                )}"
              >

                <div class="popup-related-image">
                  ${imageMarkup}
                </div>

                <div class="popup-related-content">

                  <span>
                    ${escapePopupHTML(
                      post.category_name ||
                      "Uncategorized"
                    )}
                  </span>

                  <h4>
                    ${escapePopupHTML(
                      post.title
                    )}
                  </h4>

                  <small>
                    Read Story

                    <i class="bi bi-arrow-right"></i>
                  </small>

                </div>

              </button>

            </div>
          `;
        })
        .join("");

    section.classList.remove(
      "d-none"
    );
  }


  function setBlogPopupText(
    id,
    value
  ) {
    const element =
      document.getElementById(id);

    if (element) {
      element.textContent =
        value || "";
    }
  }


  function escapePopupHTML(
    value
  ) {
    const element =
      document.createElement(
        "div"
      );

    element.textContent =
      String(value ?? "");

    return element.innerHTML;
  }


  modalElement.addEventListener(
    "hidden.bs.modal",
    function () {
      if (requestController) {
        requestController.abort();
      }

      resetPublicBlogPopup();
    }
  );
}

/* =========================================================
   ADMIN BLOG POST MANAGER
========================================================= */

function initAdminBlogManager() {
  const page =
    document.getElementById("adminBlogPage");

  if (
    !page ||
    page.dataset.blogActionsBound === "true"
  ) {
    return;
  }

  page.dataset.blogActionsBound = "true";

  const blogForm =
    document.getElementById("blogPostForm");

  const blogPostId =
    document.getElementById("blogPostId");

  const blogModalTitle =
    document.getElementById("blogPostModalTitle");

  const blogSaveText =
    document.getElementById("blogPostSaveText");


  function getBootstrapModal(id) {
    const element =
      document.getElementById(id);

    if (
      !element ||
      !window.bootstrap
    ) {
      return null;
    }

    return bootstrap.Modal.getOrCreateInstance(
      element
    );
  }


  function getBlogCSRFToken() {
    const input =
      document.querySelector(
        "[name=csrfmiddlewaretoken]"
      );

    if (input) {
      return input.value;
    }

    const cookie =
      document.cookie
        .split(";")
        .map((item) => item.trim())
        .find((item) =>
          item.startsWith("csrftoken=")
        );

    return cookie
      ? decodeURIComponent(
          cookie.split("=")[1]
        )
      : "";
  }


  async function blogFetchJSON(
    url,
    options = {}
  ) {
    const response =
      await fetch(url, {
        ...options,

        headers: {
          "X-Requested-With":
            "XMLHttpRequest",

          ...(options.headers || {}),
        },
      });

    let data;

    try {
      data = await response.json();
    } catch (error) {
      throw new Error(
        "The server returned an invalid response."
      );
    }

    if (
      !response.ok ||
      data.success === false ||
      data.status === "error"
    ) {
      throw new Error(
        data.message ||
        "Unable to complete this action."
      );
    }

    return data;
  }


  function blogToast(
    icon,
    message
  ) {
    if (window.Swal) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon,
        title: message,
        showConfirmButton: false,
        timer: 1900,
        timerProgressBar: true,
      });

      return;
    }

    window.alert(message);
  }


  async function blogConfirm({
    title,
    text,
    confirmText = "Yes, continue",
    color = "#2563eb",
  }) {
    if (!window.Swal) {
      return window.confirm(text);
    }

    const result =
      await Swal.fire({
        icon: "warning",
        title,
        text,
        showCancelButton: true,
        confirmButtonText:
          confirmText,
        cancelButtonText:
          "Cancel",
        confirmButtonColor:
          color,
        cancelButtonColor:
          "#64748b",
        reverseButtons: true,
      });

    return result.isConfirmed;
  }


  function resetBlogPostForm() {
    if (!blogForm) {
      return;
    }

    blogForm.reset();

    if (blogPostId) {
      blogPostId.value = "";
    }

    if (blogModalTitle) {
      blogModalTitle.textContent =
        "Add Blog Post";
    }

    if (blogSaveText) {
      blogSaveText.textContent =
        "Save Blog Post";
    }

    clearBlogFormErrors();
  }


  function clearBlogFormErrors() {
    if (!blogForm) {
      return;
    }

    blogForm
      .querySelectorAll(".is-invalid")
      .forEach((field) => {
        field.classList.remove(
          "is-invalid"
        );
      });

    blogForm
      .querySelectorAll(
        ".ajax-field-error"
      )
      .forEach((error) => {
        error.remove();
      });

    const errorBox =
      blogForm.querySelector(
        ".ajax-form-errors"
      );

    if (errorBox) {
      errorBox.innerHTML = "";
      errorBox.classList.add(
        "d-none"
      );
    }
  }


  function showBlogFormErrors(
    errors
  ) {
    const messages = [];

    Object.entries(
      errors || {}
    ).forEach(
      ([fieldName, fieldErrors]) => {
        const field =
          blogForm?.querySelector(
            `[name="${fieldName}"]`
          );

        const normalized =
          Array.isArray(fieldErrors)
            ? fieldErrors
            : [fieldErrors];

        normalized.forEach(
          (message) => {
            messages.push(
              String(message)
            );
          }
        );

        if (field) {
          field.classList.add(
            "is-invalid"
          );

          const feedback =
            document.createElement(
              "div"
            );

          feedback.className =
            "invalid-feedback ajax-field-error";

          feedback.textContent =
            normalized.join(" ");

          field.insertAdjacentElement(
            "afterend",
            feedback
          );
        }
      }
    );

    const errorBox =
      blogForm?.querySelector(
        ".ajax-form-errors"
      );

    if (
      errorBox &&
      messages.length
    ) {
      errorBox.innerHTML = `
        <strong>
          Please correct the following:
        </strong>

        <ul class="mb-0 mt-2">
          ${messages
            .map(
              (message) =>
                `<li>${escapeBlogHTML(message)}</li>`
            )
            .join("")}
        </ul>
      `;

      errorBox.classList.remove(
        "d-none"
      );
    }
  }


  function setBlogField(
    name,
    value
  ) {
    const field =
      blogForm?.querySelector(
        `[name="${name}"]`
      );

    if (field) {
      field.value =
        value ?? "";
    }
  }


  function setBlogCheckbox(
    name,
    value
  ) {
    const field =
      blogForm?.querySelector(
        `[name="${name}"]`
      );

    if (field) {
      field.checked =
        Boolean(value);
    }
  }


  function escapeBlogHTML(value) {
    const element =
      document.createElement(
        "div"
      );

    element.textContent =
      String(value ?? "");

    return element.innerHTML;
  }


  document
    .getElementById("openAddBlogBtn")
    ?.addEventListener(
      "click",
      resetBlogPostForm
    );


  document
    .getElementById("blogPostModal")
    ?.addEventListener(
      "hidden.bs.modal",
      resetBlogPostForm
    );


  /* =====================================================
     VIEW POST
  ===================================================== */

  async function viewBlogPost(
    url
  ) {
    if (!url) {
      blogToast(
        "error",
        "Blog details URL is missing."
      );

      return;
    }

    try {
      const data =
        await blogFetchJSON(url);

      const post =
        data.post;

      if (!post) {
        throw new Error(
          "Blog post details were not found."
        );
      }

      document.getElementById(
        "viewBlogPostTitle"
      ).textContent =
        post.title ||
        "Untitled Blog";

      document.getElementById(
        "viewBlogPostDescription"
      ).textContent =
        post.short_description ||
        "No description added.";

      document.getElementById(
        "viewBlogPostContent"
      ).innerHTML =
        post.content ||
        "No content added.";

      document.getElementById(
        "viewBlogPostCategory"
      ).textContent =
        post.category_name ||
        "Uncategorized";

      document.getElementById(
        "viewBlogPostAuthor"
      ).textContent =
        post.author_name ||
        "Velora Team";

      document.getElementById(
        "viewBlogPostPublished"
      ).textContent =
        post.published_display ||
        post.published_at ||
        "Not published";

      document.getElementById(
        "viewBlogPostViews"
      ).textContent =
        post.views_count ?? 0;

      const status =
        document.getElementById(
          "viewBlogPostStatus"
        );

      if (status) {
        status.textContent =
          post.status_text ||
          (
            post.is_published
              ? "Published"
              : "Draft"
          );

        status.className =
          post.is_published
            ? "status active"
            : "role-pill gray";
      }

      const featured =
        document.getElementById(
          "viewBlogPostFeatured"
        );

      featured?.classList.toggle(
        "d-none",
        !post.is_featured
      );

      const image =
        document.getElementById(
          "viewBlogPostImage"
        );

      const placeholder =
        document.getElementById(
          "viewBlogImagePlaceholder"
        );

      if (post.image) {
        image.src = post.image;

        image.classList.remove(
          "d-none"
        );

        placeholder?.classList.add(
          "d-none"
        );
      } else {
        image.src = "";

        image.classList.add(
          "d-none"
        );

        placeholder?.classList.remove(
          "d-none"
        );
      }

      const publicButton =
        document.getElementById(
          "viewPublicBlogBtn"
        );

      if (
        publicButton &&
        post.public_url
      ) {
        publicButton.href =
          post.public_url;

        publicButton.classList.remove(
          "d-none"
        );
      } else {
        publicButton?.classList.add(
          "d-none"
        );
      }

      getBootstrapModal(
        "viewBlogPostModal"
      )?.show();
    } catch (error) {
      blogToast(
        "error",
        error.message
      );
    }
  }


  /* =====================================================
     EDIT POST
  ===================================================== */

  async function editBlogPost(
    url
  ) {
    if (!url) {
      blogToast(
        "error",
        "Blog details URL is missing."
      );

      return;
    }

    try {
      const data =
        await blogFetchJSON(url);

      const post =
        data.post;

      if (!post) {
        throw new Error(
          "Blog post details were not found."
        );
      }

      resetBlogPostForm();

      if (blogPostId) {
        blogPostId.value =
          post.id || "";
      }

      setBlogField(
        "title",
        post.title
      );

      setBlogField(
        "category",
        post.category_id
      );

      setBlogField(
        "short_description",
        post.short_description
      );

      setBlogField(
        "content",
        post.content
      );

      setBlogField(
        "published_at",
        post.published_at
      );

      setBlogCheckbox(
        "is_published",
        post.is_published
      );

      setBlogCheckbox(
        "is_featured",
        post.is_featured
      );

      if (blogModalTitle) {
        blogModalTitle.textContent =
          "Edit Blog Post";
      }

      if (blogSaveText) {
        blogSaveText.textContent =
          "Update Blog Post";
      }

      getBootstrapModal(
        "blogPostModal"
      )?.show();
    } catch (error) {
      blogToast(
        "error",
        error.message
      );
    }
  }


  /* =====================================================
     SAVE POST
  ===================================================== */

  blogForm?.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      if (
        blogForm.dataset.submitting ===
        "true"
      ) {
        return;
      }

      blogForm.dataset.submitting =
        "true";

      clearBlogFormErrors();

      const button =
        blogForm.querySelector(
          '[type="submit"]'
        );

      const originalHTML =
        button?.innerHTML;

      if (button) {
        button.disabled = true;

        button.innerHTML = `
          <span
            class="spinner-border spinner-border-sm me-2"
          ></span>
          Saving...
        `;
      }

      try {
        const response =
          await fetch(
            blogForm.action,
            {
              method: "POST",

              headers: {
                "X-CSRFToken":
                  getBlogCSRFToken(),

                "X-Requested-With":
                  "XMLHttpRequest",
              },

              body:
                new FormData(
                  blogForm
                ),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success === false
        ) {
          showBlogFormErrors(
            data.errors || {}
          );

          throw new Error(
            data.message ||
            "Unable to save blog post."
          );
        }

        getBootstrapModal(
          "blogPostModal"
        )?.hide();

        blogToast(
          "success",
          data.message ||
          "Blog post saved successfully."
        );

        window.setTimeout(
          () => {
            window.location.reload();
          },
          450
        );
      } catch (error) {
        blogToast(
          "error",
          error.message
        );
      } finally {
        blogForm.dataset.submitting =
          "false";

        if (button) {
          button.disabled = false;

          button.innerHTML =
            originalHTML;
        }
      }
    }
  );


  /* =====================================================
     STATUS / FEATURE / DELETE
  ===================================================== */

  page.addEventListener(
    "click",
    async function (event) {
      const viewButton =
        event.target.closest(
          ".view-blog-post-btn"
        );

      const editButton =
        event.target.closest(
          ".edit-blog-btn"
        );

      const toggleButton =
        event.target.closest(
          ".blog-toggle-action"
        );

      const deleteButton =
        event.target.closest(
          ".blog-delete-btn"
        );


      if (viewButton) {
        event.preventDefault();

        viewBlogPost(
          viewButton.dataset
            .detailsUrl
        );

        return;
      }


      if (editButton) {
        event.preventDefault();

        editBlogPost(
          editButton.dataset
            .detailsUrl
        );

        return;
      }


      if (toggleButton) {
        event.preventDefault();

        const actionType =
          toggleButton.dataset
            .actionType;

        const postTitle =
          toggleButton.dataset
            .postTitle ||
          "this blog post";

        const configurations = {
          publish: {
            title:
              "Publish blog post?",

            text:
              `${postTitle} will become visible on the website.`,

            confirmText:
              "Yes, publish",

            color:
              "#16a34a",
          },

          draft: {
            title:
              "Move post to draft?",

            text:
              `${postTitle} will no longer be visible publicly.`,

            confirmText:
              "Yes, move to draft",

            color:
              "#f97316",
          },

          feature: {
            title:
              "Mark as featured?",

            text:
              `${postTitle} will appear in the featured section.`,

            confirmText:
              "Yes, feature",

            color:
              "#2563eb",
          },

          unfeature: {
            title:
              "Remove featured status?",

            text:
              `${postTitle} will be removed from the featured section.`,

            confirmText:
              "Yes, remove",

            color:
              "#64748b",
          },
        };

        const config =
          configurations[
            actionType
          ] || {
            title:
              "Update blog post?",

            text:
              `Update ${postTitle}?`,

            confirmText:
              "Yes, update",

            color:
              "#2563eb",
          };

        const confirmed =
          await blogConfirm(
            config
          );

        if (!confirmed) {
          return;
        }

        toggleButton.disabled =
          true;

        try {
          const data =
            await blogFetchJSON(
              toggleButton.dataset.url,
              {
                method: "POST",

                headers: {
                  "X-CSRFToken":
                    getBlogCSRFToken(),
                },
              }
            );

          blogToast(
            "success",
            data.message ||
            "Blog post updated."
          );

          window.setTimeout(
            () => {
              window.location.reload();
            },
            450
          );
        } catch (error) {
          toggleButton.disabled =
            false;

          blogToast(
            "error",
            error.message
          );
        }

        return;
      }


      if (deleteButton) {
        event.preventDefault();

        const postTitle =
          deleteButton.dataset
            .postTitle ||
          "This blog post";

        const confirmed =
          await blogConfirm({
            title:
              "Delete blog post?",

            text:
              `${postTitle} will be permanently deleted.`,

            confirmText:
              "Yes, delete",

            color:
              "#dc2626",
          });

        if (!confirmed) {
          return;
        }

        deleteButton.disabled =
          true;

        try {
          const data =
            await blogFetchJSON(
              deleteButton.dataset.url,
              {
                method: "POST",

                headers: {
                  "X-CSRFToken":
                    getBlogCSRFToken(),
                },
              }
            );

          const selector =
            deleteButton.dataset.row;

          const row =
            selector
              ? document.querySelector(
                  selector
                )
              : deleteButton.closest(
                  "tr"
                );

          if (row) {
            row.style.transition =
              "0.25s ease";

            row.style.opacity =
              "0";

            row.style.transform =
              "translateX(20px)";

            window.setTimeout(
              () => {
                row.remove();
              },
              250
            );
          }

          blogToast(
            "success",
            data.message ||
            "Blog post deleted."
          );
        } catch (error) {
          deleteButton.disabled =
            false;

          blogToast(
            "error",
            error.message
          );
        }
      }
    }
  );
}



/* =========================================================
   HEADER LIVE PRODUCT SEARCH
========================================================= */

function initHeaderProductSearch() {
  const openButton =
    document.getElementById("openHeaderSearch");

  const overlay =
    document.getElementById("headerSearchOverlay");

  const modal =
    overlay?.querySelector(".header-search-modal");

  const closeButton =
    document.getElementById("closeHeaderSearch");

  const form =
    document.getElementById("headerSearchForm");

  const input =
    document.getElementById("headerSearchInput");

  const clearButton =
    document.getElementById("clearHeaderSearch");

  const resultsContainer =
    document.getElementById("headerSearchResults");

  const loading =
    document.getElementById("headerSearchLoading");

  if (
    !openButton ||
    !overlay ||
    !modal ||
    !closeButton ||
    !form ||
    !input ||
    !resultsContainer
  ) {
    return;
  }

  if (overlay.dataset.bound === "true") {
    return;
  }

  overlay.dataset.bound = "true";

  const searchUrl =
    overlay.dataset.searchUrl;

  let debounceTimer = null;
  let activeController = null;
  let selectedIndex = -1;


  function openSearch() {
    overlay.hidden = false;

    requestAnimationFrame(() => {
      overlay.classList.add("show");
      document.body.classList.add("search-modal-open");
      input.focus();
    });
  }


  function closeSearch() {
    overlay.classList.remove("show");
    document.body.classList.remove("search-modal-open");

    window.setTimeout(() => {
      overlay.hidden = true;
    }, 220);
  }


  function showStartState() {
    selectedIndex = -1;

    resultsContainer.innerHTML = `
      <div class="header-search-start-state">
        <span>
          <i class="bi bi-bag-heart"></i>
        </span>

        <h3>Find Your Next Favourite</h3>

        <p>
          Start typing to discover Velora products.
        </p>
      </div>
    `;
  }


  function showMinimumState() {
    selectedIndex = -1;

    resultsContainer.innerHTML = `
      <div class="header-search-message-state">
        <span>
          <i class="bi bi-keyboard"></i>
        </span>

        <h3>Keep Typing</h3>

        <p>
          Enter at least 2 characters to search.
        </p>
      </div>
    `;
  }


  function showEmptyState(query) {
    selectedIndex = -1;

    resultsContainer.innerHTML = `
      <div class="header-search-message-state">
        <span>
          <i class="bi bi-search"></i>
        </span>

        <h3>No Products Found</h3>

        <p>
          No results found for
          <strong>${escapeHeaderSearchHtml(query)}</strong>.
        </p>

        <a
          href="${form.action}?q=${encodeURIComponent(query)}"
          class="header-search-view-all"
        >
          Search Entire Shop
          <i class="bi bi-arrow-right"></i>
        </a>
      </div>
    `;
  }


  function renderProducts(products, query) {
    selectedIndex = -1;

    const cards = products
      .map((product, index) => {
        const imageMarkup = product.image
          ? `
            <img
              src="${escapeHeaderSearchHtml(product.image)}"
              alt="${escapeHeaderSearchHtml(product.name)}"
            >
          `
          : `
            <div class="header-result-placeholder">
              <i class="bi bi-image"></i>
            </div>
          `;

        const priceMarkup = product.has_deal
          ? `
            <strong>
              ₹${Number(product.current_price).toFixed(2)}
            </strong>

            <del>
              ₹${Number(product.price).toFixed(2)}
            </del>
          `
          : `
            <strong>
              ₹${Number(product.price).toFixed(2)}
            </strong>
          `;

        return `
          <a
            href="${escapeHeaderSearchHtml(product.url)}"
            class="header-search-result-item"
            data-search-result
            data-result-index="${index}"
          >
            <div class="header-result-image">
              ${imageMarkup}
            </div>

            <div class="header-result-content">
              <span>
                ${escapeHeaderSearchHtml(product.category)}
              </span>

              <h3>
                ${escapeHeaderSearchHtml(product.name)}
              </h3>

              <p>
                ${escapeHeaderSearchHtml(
                  product.description || "Premium Velora product"
                )}
              </p>

              <div class="header-result-bottom">
                <div class="header-result-price">
                  ${priceMarkup}
                </div>

                <div class="header-result-rating">
                  <i class="bi bi-star-fill"></i>

                  ${Number(product.rating).toFixed(1)}

                  <small>
                    (${Number(product.review_count)})
                  </small>
                </div>
              </div>
            </div>

            <span class="header-result-arrow">
              <i class="bi bi-arrow-up-right"></i>
            </span>
          </a>
        `;
      })
      .join("");

    resultsContainer.innerHTML = `
      <div class="header-results-heading">
        <span>
          Products matching
          <strong>"${escapeHeaderSearchHtml(query)}"</strong>
        </span>

        <small>
          ${products.length} result${products.length === 1 ? "" : "s"}
        </small>
      </div>

      <div class="header-result-list">
        ${cards}
      </div>

      <a
        href="${form.action}?q=${encodeURIComponent(query)}"
        class="header-search-all-results"
      >
        View All Search Results

        <i class="bi bi-arrow-right"></i>
      </a>
    `;
  }


  async function searchProducts(query) {
    if (!searchUrl) {
      return;
    }

    if (activeController) {
      activeController.abort();
    }

    activeController =
      new AbortController();

    loading?.classList.remove("d-none");

    try {
      const response = await fetch(
        `${searchUrl}?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
          signal: activeController.signal,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to search products."
        );
      }

      if (!data.products.length) {
        showEmptyState(query);
        return;
      }

      renderProducts(
        data.products,
        query
      );
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      resultsContainer.innerHTML = `
        <div class="header-search-message-state">
          <span>
            <i class="bi bi-exclamation-triangle"></i>
          </span>

          <h3>Search Unavailable</h3>

          <p>
            ${escapeHeaderSearchHtml(error.message)}
          </p>
        </div>
      `;
    } finally {
      loading?.classList.add("d-none");
    }
  }


  function runSearch() {
    const query =
      input.value.trim();

    clearButton?.classList.toggle(
      "d-none",
      !query
    );

    if (!query) {
      showStartState();
      return;
    }

    if (query.length < 2) {
      showMinimumState();
      return;
    }

    window.clearTimeout(
      debounceTimer
    );

    debounceTimer =
      window.setTimeout(() => {
        searchProducts(query);
      }, 300);
  }


  function updateKeyboardSelection(direction) {
    const items =
      Array.from(
        resultsContainer.querySelectorAll(
          "[data-search-result]"
        )
      );

    if (!items.length) {
      return;
    }

    selectedIndex += direction;

    if (selectedIndex < 0) {
      selectedIndex =
        items.length - 1;
    }

    if (
      selectedIndex >= items.length
    ) {
      selectedIndex = 0;
    }

    items.forEach((item, index) => {
      item.classList.toggle(
        "active",
        index === selectedIndex
      );
    });

    items[selectedIndex].scrollIntoView({
      block: "nearest",
    });
  }


  openButton.addEventListener(
    "click",
    openSearch
  );

  closeButton.addEventListener(
    "click",
    closeSearch
  );

  overlay.addEventListener(
    "click",
    function (event) {
      if (event.target === overlay) {
        closeSearch();
      }
    }
  );

  modal.addEventListener(
    "click",
    function (event) {
      event.stopPropagation();
    }
  );

  input.addEventListener(
    "input",
    runSearch
  );

  clearButton?.addEventListener(
    "click",
    function () {
      input.value = "";
      showStartState();

      clearButton.classList.add(
        "d-none"
      );

      input.focus();
    }
  );

  input.addEventListener(
    "keydown",
    function (event) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        updateKeyboardSelection(1);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        updateKeyboardSelection(-1);
      }

      if (event.key === "Enter") {
        const selectedItem =
          resultsContainer.querySelector(
            "[data-search-result].active"
          );

        if (selectedItem) {
          event.preventDefault();
          window.location.href =
            selectedItem.href;
        }
      }
    }
  );

  document.addEventListener(
    "keydown",
    function (event) {
      if (
        event.key === "Escape" &&
        !overlay.hidden
      ) {
        closeSearch();
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        openSearch();
      }
    }
  );
}


function escapeHeaderSearchHtml(value) {
  const element =
    document.createElement("div");

  element.textContent =
    String(value ?? "");

  return element.innerHTML;
}
// ==========================================
// Login Required SweetAlert
// ==========================================

function requireLogin(loginUrl) {
    Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "You need to login first to access this feature.",
        confirmButtonText: "Login",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonColor: "#2f66f3",
        cancelButtonColor: "#6c757d"
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = loginUrl;
        }
    });

    return false;
}
/* =========================================================
   REUSABLE PRODUCT CARD COUNTDOWN
========================================================= */

function initUnifiedProductCards() {
  const timers = document.querySelectorAll(
    "[data-product-deal-timer]"
  );

  timers.forEach((timer) => {
    if (timer.dataset.countdownBound === "true") {
      return;
    }

    timer.dataset.countdownBound = "true";

    startUnifiedProductCountdown(timer);
  });
}


function startUnifiedProductCountdown(timer) {
  const countdown =
    timer.querySelector(
      "[data-deal-countdown]"
    );

  const endDateValue =
    timer.dataset.dealEnd;

  if (!countdown || !endDateValue) {
    timer.remove();
    return;
  }

  const endDate =
    new Date(endDateValue);

  if (Number.isNaN(endDate.getTime())) {
    timer.remove();
    return;
  }


  function updateCountdown() {
    const distance =
      endDate.getTime() -
      Date.now();

    if (distance <= 0) {
      timer.remove();
      return false;
    }

    const days =
      Math.floor(
        distance /
        (1000 * 60 * 60 * 24)
      );

    const hours =
      Math.floor(
        (
          distance %
          (1000 * 60 * 60 * 24)
        ) /
        (1000 * 60 * 60)
      );

    const minutes =
      Math.floor(
        (
          distance %
          (1000 * 60 * 60)
        ) /
        (1000 * 60)
      );

    const seconds =
      Math.floor(
        (
          distance %
          (1000 * 60)
        ) /
        1000
      );

    let result = "";

    if (days > 0) {
      result +=
        `${days}d `;
    }

    result +=
      `${String(hours).padStart(2, "0")}:` +
      `${String(minutes).padStart(2, "0")}:` +
      `${String(seconds).padStart(2, "0")}`;

    countdown.textContent =
      result;

    return true;
  }


  if (!updateCountdown()) {
    return;
  }

  const interval =
    window.setInterval(
      function () {
        if (!updateCountdown()) {
          window.clearInterval(
            interval
          );
        }
      },
      1000
    );
}
/* =========================================================
   SHOP PAGE SEARCH, FILTER AND SORT
========================================================= */

function initShopPage() {
  const shopPage =
    document.getElementById(
      "shopPage"
    );

  if (
    !shopPage ||
    shopPage.dataset.bound === "true"
  ) {
    return;
  }

  shopPage.dataset.bound = "true";

  const productGrid =
    document.getElementById(
      "shopProductGrid"
    );

  const searchInput =
    document.getElementById(
      "shopSearchInput"
    );

  const categoryFilter =
    document.getElementById(
      "shopCategoryFilter"
    );

  const priceFilter =
    document.getElementById(
      "shopPriceFilter"
    );

  const sortFilter =
    document.getElementById(
      "shopSortFilter"
    );

  const resetButton =
    document.getElementById(
      "resetShopFilters"
    );

  const clearSearchButton =
    document.getElementById(
      "clearShopSearch"
    );

  const clearAllButton =
    document.getElementById(
      "clearAllShopFilters"
    );

  const emptyResetButton =
    document.getElementById(
      "emptyResetShopFilters"
    );

  const visibleCount =
    document.getElementById(
      "visibleShopProductCount"
    );

  const filterStatus =
    document.getElementById(
      "shopFilterStatus"
    );

  const filterStatusText =
    document.getElementById(
      "shopFilterStatusText"
    );

  const emptyState =
    document.getElementById(
      "shopSearchEmptyState"
    );


  if (
    !productGrid ||
    !searchInput ||
    !categoryFilter ||
    !priceFilter ||
    !sortFilter
  ) {
    return;
  }


  const productItems =
    Array.from(
      productGrid.querySelectorAll(
        "[data-shop-product]"
      )
    );


  function productMatchesPrice(
    price,
    selectedPrice
  ) {
    if (selectedPrice === "all") {
      return true;
    }

    if (selectedPrice === "0-500") {
      return price < 500;
    }

    if (selectedPrice === "500-1000") {
      return (
        price >= 500 &&
        price <= 1000
      );
    }

    if (selectedPrice === "1000-2000") {
      return (
        price > 1000 &&
        price <= 2000
      );
    }

    if (selectedPrice === "2000-plus") {
      return price > 2000;
    }

    return true;
  }


  function sortProducts(
    visibleProducts
  ) {
    const selectedSort =
      sortFilter.value;

    const sortedProducts =
      [...visibleProducts];

    sortedProducts.sort(
      (first, second) => {
        const firstPrice =
          Number(
            first.dataset.price || 0
          );

        const secondPrice =
          Number(
            second.dataset.price || 0
          );

        const firstName =
          first.dataset.name || "";

        const secondName =
          second.dataset.name || "";

        const firstCreated =
          Number(
            first.dataset.created || 0
          );

        const secondCreated =
          Number(
            second.dataset.created || 0
          );

        const firstRating =
          Number(
            first.dataset.rating || 0
          );

        const secondRating =
          Number(
            second.dataset.rating || 0
          );

        const firstIndex =
          Number(
            first.dataset.originalIndex || 0
          );

        const secondIndex =
          Number(
            second.dataset.originalIndex || 0
          );


        switch (selectedSort) {
          case "newest":
            return (
              secondCreated -
              firstCreated
            );

          case "price-low":
            return (
              firstPrice -
              secondPrice
            );

          case "price-high":
            return (
              secondPrice -
              firstPrice
            );

          case "name-asc":
            return firstName.localeCompare(
              secondName
            );

          case "name-desc":
            return secondName.localeCompare(
              firstName
            );

          case "rating-high":
            return (
              secondRating -
              firstRating
            );

          default:
            return (
              firstIndex -
              secondIndex
            );
        }
      }
    );

    sortedProducts.forEach(
      (product) => {
        productGrid.appendChild(
          product
        );
      }
    );
  }


  function applyShopFilters() {
    const searchTerm =
      searchInput.value
        .trim()
        .toLowerCase();

    const selectedCategory =
      categoryFilter.value;

    const selectedPrice =
      priceFilter.value;

    const visibleProducts = [];


    productItems.forEach(
      (product) => {
        const productName =
          product.dataset.name || "";

        const description =
          product.dataset.description || "";

        const categoryName =
          product.dataset.categoryName || "";

        const categoryId =
          product.dataset.category || "";

        const price =
          Number(
            product.dataset.price || 0
          );


        const matchesSearch =
          !searchTerm ||
          productName.includes(
            searchTerm
          ) ||
          description.includes(
            searchTerm
          ) ||
          categoryName.includes(
            searchTerm
          );


        const matchesCategory =
          selectedCategory === "all" ||
          categoryId === selectedCategory;


        const matchesPrice =
          productMatchesPrice(
            price,
            selectedPrice
          );


        const isVisible =
          matchesSearch &&
          matchesCategory &&
          matchesPrice;


        product.classList.toggle(
          "d-none",
          !isVisible
        );


        if (isVisible) {
          visibleProducts.push(
            product
          );
        }
      }
    );


    sortProducts(
      visibleProducts
    );


    if (visibleCount) {
      visibleCount.textContent =
        visibleProducts.length;
    }


    const hasFilters =
      Boolean(searchTerm) ||
      selectedCategory !== "all" ||
      selectedPrice !== "all" ||
      sortFilter.value !== "featured";


    filterStatus?.classList.toggle(
      "d-none",
      !hasFilters
    );


    clearSearchButton?.classList.toggle(
      "d-none",
      !searchTerm
    );


    emptyState?.classList.toggle(
      "d-none",
      visibleProducts.length !== 0
    );


    productGrid.classList.toggle(
      "d-none",
      visibleProducts.length === 0
    );


    if (
      hasFilters &&
      filterStatusText
    ) {
      const statusParts = [];

      if (searchTerm) {
        statusParts.push(
          `Search: "${searchInput.value.trim()}"`
        );
      }

      if (
        selectedCategory !== "all"
      ) {
        const categoryText =
          categoryFilter.options[
            categoryFilter.selectedIndex
          ].text;

        statusParts.push(
          `Category: ${categoryText}`
        );
      }

      if (
        selectedPrice !== "all"
      ) {
        const priceText =
          priceFilter.options[
            priceFilter.selectedIndex
          ].text;

        statusParts.push(
          `Price: ${priceText}`
        );
      }

      filterStatusText.textContent =
        statusParts.length
          ? statusParts.join(" • ")
          : "Products sorted";
    }
  }


  function resetShopFilters() {
    searchInput.value = "";
    categoryFilter.value = "all";
    priceFilter.value = "all";
    sortFilter.value = "featured";

    applyShopFilters();
  }


  searchInput.addEventListener(
    "input",
    applyShopFilters
  );

  categoryFilter.addEventListener(
    "change",
    applyShopFilters
  );

  priceFilter.addEventListener(
    "change",
    applyShopFilters
  );

  sortFilter.addEventListener(
    "change",
    applyShopFilters
  );


  resetButton?.addEventListener(
    "click",
    resetShopFilters
  );


  clearAllButton?.addEventListener(
    "click",
    resetShopFilters
  );


  emptyResetButton?.addEventListener(
    "click",
    resetShopFilters
  );


  clearSearchButton?.addEventListener(
    "click",
    function () {
      searchInput.value = "";

      applyShopFilters();

      searchInput.focus();
    }
  );


  applyShopFilters();
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
   GENERIC AJAX CRUD ENGINE
========================= */

/* =========================================================
   REUSABLE AJAX FORM ENGINE
========================================================= */

function initAjaxCRUD() {
  document.addEventListener(
    "submit",
    async function (event) {
      const form =
        event.target.closest(
          ".ajax-form"
        );

      if (!form) {
        return;
      }

      event.preventDefault();

      if (
        form.dataset.submitting ===
        "true"
      ) {
        return;
      }

      form.dataset.submitting =
        "true";

      const submitButton =
        form.querySelector(
          '[type="submit"]'
        );

      const originalButtonHTML =
        submitButton?.innerHTML;

      clearAjaxFormErrors(form);

      if (submitButton) {
        submitButton.disabled = true;

        submitButton.innerHTML = `
          <span
            class="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
          ></span>
          Saving...
        `;
      }

      try {
        const response =
          await fetch(
            form.action,
            {
              method:
                form.method || "POST",

              headers: {
                "X-CSRFToken":
                  getCSRFToken(),

                "X-Requested-With":
                  "XMLHttpRequest",
              },

              body:
                new FormData(form),
            }
          );

        let data;

        try {
          data =
            await response.json();
        } catch (error) {
          throw new Error(
            "The server returned an invalid response."
          );
        }

        if (
          !response.ok ||
          data.success === false ||
          data.status === "error"
        ) {
          showAjaxFormErrors(
            form,
            data.errors || {}
          );

          throw new Error(
            data.message ||
            "Please correct the form errors."
          );
        }

        showToast(
          "success",
          data.message ||
          "Saved successfully."
        );

        const modalElement =
          form.closest(".modal");

        if (
          modalElement &&
          window.bootstrap
        ) {
          bootstrap.Modal
            .getOrCreateInstance(
              modalElement
            )
            .hide();
        }

        form.reset();

        const hiddenId =
          form.querySelector(
            'input[name$="_id"]'
          );

        if (hiddenId) {
          hiddenId.value = "";
        }

        if (data.redirect_url) {
          window.location.href =
            data.redirect_url;

          return;
        }

        if (data.redirect) {
          window.location.href =
            data.redirect;

          return;
        }

        if (data.reload_required) {
          window.location.reload();

          return;
        }

        if (
          data.html &&
          data.target
        ) {
          const target =
            document.querySelector(
              data.target
            );

          if (target) {
            target.innerHTML =
              data.html;
          }
        }
      } catch (error) {
        showToast(
          "error",
          error.message ||
          "Something went wrong."
        );
      } finally {
        form.dataset.submitting =
          "false";

        if (submitButton) {
          submitButton.disabled =
            false;

          submitButton.innerHTML =
            originalButtonHTML;
        }
      }
    }
  );
}


/* =========================================================
   AJAX FORM ERRORS
========================================================= */

function clearAjaxFormErrors(form) {
  form
    .querySelectorAll(
      ".is-invalid"
    )
    .forEach((field) => {
      field.classList.remove(
        "is-invalid"
      );
    });

  form
    .querySelectorAll(
      ".ajax-field-error"
    )
    .forEach((error) => {
      error.remove();
    });

  const errorBox =
    form.querySelector(
      "#blogCategoryFormErrors, .ajax-form-errors"
    );

  if (errorBox) {
    errorBox.innerHTML = "";
    errorBox.classList.add(
      "d-none"
    );
  }
}


function showAjaxFormErrors(
  form,
  errors
) {
  const errorBox =
    form.querySelector(
      "#blogCategoryFormErrors, .ajax-form-errors"
    );

  const messages = [];

  Object.entries(
    errors || {}
  ).forEach(
    ([fieldName, fieldErrors]) => {
      const field =
        form.querySelector(
          `[name="${fieldName}"]`
        );

      const normalizedErrors =
        Array.isArray(fieldErrors)
          ? fieldErrors
          : [fieldErrors];

      normalizedErrors.forEach(
        (message) => {
          messages.push(
            String(message)
          );
        }
      );

      if (field) {
        field.classList.add(
          "is-invalid"
        );

        const feedback =
          document.createElement(
            "div"
          );

        feedback.className =
          "invalid-feedback ajax-field-error";

        feedback.textContent =
          normalizedErrors.join(" ");

        field.insertAdjacentElement(
          "afterend",
          feedback
        );
      }
    }
  );

  if (
    errorBox &&
    messages.length
  ) {
    errorBox.innerHTML = `
      <strong>
        Please correct the following:
      </strong>

      <ul class="mb-0 mt-2">
        ${messages
          .map(
            (message) =>
              `<li>${escapeHTML(message)}</li>`
          )
          .join("")}
      </ul>
    `;

    errorBox.classList.remove(
      "d-none"
    );
  }
}

function handleAjaxResponse(data, element) {
  if (data.redirect_url) {
    window.location.href = data.redirect_url;
    return;
  }

  if (data.reload === true) {
    window.location.reload();
    return;
  }

  if (data.append_target && data.html) {
    const target = document.querySelector(data.append_target);
    if (target) target.insertAdjacentHTML("afterbegin", data.html);
  }

  if (data.replace_target && data.html) {
    const target = document.querySelector(data.replace_target);
    if (target) target.outerHTML = data.html;
  }

  if (data.update_target && data.html) {
    const target = document.querySelector(data.update_target);
    if (target) target.innerHTML = data.html;
  }

  if (data.remove_target) {
    const target = document.querySelector(data.remove_target);
    if (target) target.remove();
  }

  if (data.entity) {
    updateEntityRow(data.entity);
  }
}

function updateEntityRow(entity) {
  const row = document.querySelector(`#${entity.type}-row-${entity.id}`);
  if (!row || !entity.fields) return;

  Object.keys(entity.fields).forEach((key) => {
    const el = row.querySelector(`.${entity.type}-${key}`);

    if (el) {
      el.innerText = entity.fields[key];
    }
  });

  if (entity.fields.status) {
    const statusEl = row.querySelector(`.${entity.type}-status`);

    if (statusEl) {
      const status = String(entity.fields.status).toLowerCase();

      statusEl.classList.remove("active", "inactive", "pending");

      if (
        status === "active" ||
        status === "completed" ||
        status === "delivered"
      ) {
        statusEl.classList.add("active");
      } else if (
        status === "inactive" ||
        status === "cancelled" ||
        status === "canceled"
      ) {
        statusEl.classList.add("inactive");
      } else {
        statusEl.classList.add("pending");
      }
    }
  }
}

function closeModalFromElement(element) {
  const modal = element.closest(".modal");
  if (!modal || !window.bootstrap) return;

  const instance =
    bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);

  instance.hide();
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

/* =========================================================
   PRODUCT DETAILS PAGE
========================================================= */

function initProductDetailsPage() {
  const productPage = document.querySelector(".product-details-page");

  if (!productPage || productPage.dataset.bound === "true") {
    return;
  }

  productPage.dataset.bound = "true";

  initProductGallery();
  initProductQuantity();
}


function initProductGallery() {
  const mainImage = document.getElementById("mainProductImage");

  document
    .querySelectorAll(".product-thumbnail")
    .forEach((thumbnail) => {
      thumbnail.addEventListener("click", function () {
        if (mainImage && this.dataset.image) {
          mainImage.src = this.dataset.image;
        }

        document
          .querySelectorAll(".product-thumbnail")
          .forEach((item) => {
            item.classList.remove("active");
          });

        this.classList.add("active");
      });
    });
}


function initProductQuantity() {
  const quantityInput =
    document.getElementById("productQuantity");

  if (!quantityInput) {
    return;
  }

  document
    .querySelectorAll(".quantity-control")
    .forEach((button) => {
      button.addEventListener("click", function () {
        let quantity =
          Number(quantityInput.value) || 1;

        const maximum =
          Number(quantityInput.dataset.max) || 1;

        if (
          this.dataset.action === "plus" &&
          quantity < maximum
        ) {
          quantity += 1;
        }

        if (
          this.dataset.action === "minus" &&
          quantity > 1
        ) {
          quantity -= 1;
        }

        quantityInput.value = quantity;
      });
    });
}


/* =========================================================
   ADMIN DEALS
========================================================= */

function initAdminDeals() {
  const dealsPage =
    document.getElementById("adminDealsPage");

  if (
    !dealsPage ||
    dealsPage.dataset.bound === "true"
  ) {
    return;
  }

  dealsPage.dataset.bound = "true";

  initDealCreateButtons();
  initDealDiscountSymbol();
  initDealBannerPreview();
  initDealForm();
  initDealActions();
  initDealSearch();
}


/* =========================================================
   DEAL MODAL HELPERS
========================================================= */

function getDealModal() {
  const modalElement =
    document.getElementById("dealModal");

  if (!modalElement || !window.bootstrap) {
    return null;
  }

  return bootstrap.Modal.getOrCreateInstance(
    modalElement
  );
}


function resetDealForm() {
  const form =
    document.getElementById("dealForm");

  if (!form) {
    return;
  }

  form.reset();

  const dealId =
    document.getElementById("dealId");

  const modalTitle =
    document.getElementById("dealModalTitle");

  const saveButtonText =
    document.getElementById("saveDealBtnText");

  const errorBox =
    document.getElementById("dealFormErrors");

  const previewBox =
    document.getElementById(
      "dealBannerPreviewBox"
    );

  const previewImage =
    document.getElementById(
      "dealBannerPreview"
    );

  if (dealId) {
    dealId.value = "";
  }

  if (modalTitle) {
    modalTitle.textContent =
      "Create New Deal";
  }

  if (saveButtonText) {
    saveButtonText.textContent =
      "Save Deal";
  }

  if (errorBox) {
    errorBox.innerHTML = "";
    errorBox.classList.add("d-none");
  }

  if (previewImage) {
    previewImage.src = "";
  }

  if (previewBox) {
    previewBox.classList.add("d-none");
  }

  form
    .querySelectorAll(".is-invalid")
    .forEach((field) => {
      field.classList.remove("is-invalid");
    });

  updateDealDiscountSymbol();
}


function initDealCreateButtons() {
  const createButtons = [
    document.getElementById(
      "openCreateDealBtn"
    ),

    document.getElementById(
      "emptyCreateDealBtn"
    ),
  ];

  createButtons.forEach((button) => {
    if (!button) {
      return;
    }

    button.addEventListener(
      "click",
      resetDealForm
    );
  });

  const modalElement =
    document.getElementById("dealModal");

  modalElement?.addEventListener(
    "hidden.bs.modal",
    resetDealForm
  );
}


/* =========================================================
   DISCOUNT SYMBOL
========================================================= */

function updateDealDiscountSymbol() {
  const discountType =
    document.getElementById(
      "id_discount_type"
    );

  const symbol =
    document.getElementById(
      "dealValueSymbol"
    );

  if (!discountType || !symbol) {
    return;
  }

  symbol.textContent =
    discountType.value === "fixed"
      ? "₹"
      : "%";
}


function initDealDiscountSymbol() {
  const discountType =
    document.getElementById(
      "id_discount_type"
    );

  if (!discountType) {
    return;
  }

  discountType.addEventListener(
    "change",
    updateDealDiscountSymbol
  );

  updateDealDiscountSymbol();
}


/* =========================================================
   BANNER PREVIEW
========================================================= */

function initDealBannerPreview() {
  const bannerInput =
    document.getElementById(
      "id_banner_image"
    );

  if (!bannerInput) {
    return;
  }

  bannerInput.addEventListener(
    "change",
    function () {
      const file = this.files[0];

      const previewBox =
        document.getElementById(
          "dealBannerPreviewBox"
        );

      const previewImage =
        document.getElementById(
          "dealBannerPreview"
        );

      if (
        !previewBox ||
        !previewImage
      ) {
        return;
      }

      if (!file) {
        previewImage.src = "";

        previewBox.classList.add(
          "d-none"
        );

        return;
      }

      if (
        !file.type.startsWith("image/")
      ) {
        this.value = "";

        showToast(
          "warning",
          "Please select a valid image"
        );

        return;
      }

      const reader =
        new FileReader();

      reader.onload = function (event) {
        previewImage.src =
          event.target.result;

        previewBox.classList.remove(
          "d-none"
        );
      };

      reader.readAsDataURL(file);
    }
  );
}


/* =========================================================
   DEAL FORM VALIDATION
========================================================= */

function clearDealFormErrors() {
  const form =
    document.getElementById("dealForm");

  const errorBox =
    document.getElementById(
      "dealFormErrors"
    );

  if (errorBox) {
    errorBox.innerHTML = "";
    errorBox.classList.add("d-none");
  }

  form
    ?.querySelectorAll(".is-invalid")
    .forEach((field) => {
      field.classList.remove("is-invalid");
    });
}


function normalizeDealErrors(errors) {
  const normalized = {};

  Object.entries(errors || {}).forEach(
    ([field, messages]) => {
      if (Array.isArray(messages)) {
        normalized[field] = messages;
        return;
      }

      if (
        messages &&
        typeof messages === "object"
      ) {
        normalized[field] =
          messages.map
            ? messages.map(String)
            : [String(messages)];
        return;
      }

      normalized[field] = [
        String(messages),
      ];
    }
  );

  return normalized;
}


function showDealFormErrors(errors) {
  const errorBox =
    document.getElementById(
      "dealFormErrors"
    );

  if (!errorBox) {
    showToast(
      "error",
      "Please correct the form errors"
    );

    return;
  }

  const normalizedErrors =
    normalizeDealErrors(errors);

  let html = `
    <strong>
      Please correct the following:
    </strong>

    <ul class="mb-0 mt-2">
  `;

  Object.entries(normalizedErrors).forEach(
    ([field, messages]) => {
      messages.forEach((message) => {
        html += `
          <li>${escapeHTML(message)}</li>
        `;
      });

      const fieldElement =
        document.getElementById(
          `id_${field}`
        );

      fieldElement?.classList.add(
        "is-invalid"
      );
    }
  );

  html += "</ul>";

  errorBox.innerHTML = html;
  errorBox.classList.remove("d-none");

  errorBox.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}


/* =========================================================
   CREATE / UPDATE DEAL
========================================================= */

function initDealForm() {
  const form =
    document.getElementById("dealForm");

  if (
    !form ||
    form.dataset.bound === "true"
  ) {
    return;
  }

  form.dataset.bound = "true";

  form.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      clearDealFormErrors();

      const saveButton =
        document.getElementById(
          "saveDealBtn"
        );

      const saveButtonText =
        document.getElementById(
          "saveDealBtnText"
        );

      const originalText =
        saveButtonText?.textContent ||
        "Save Deal";

      if (saveButton) {
        saveButton.disabled = true;
      }

      if (saveButtonText) {
        saveButtonText.textContent =
          "Saving...";
      }

      try {
        const response = await fetch(
          form.action,
          {
            method: "POST",

            body: new FormData(form),

            headers: {
              "X-CSRFToken":
                getCSRFToken(),

              "X-Requested-With":
                "XMLHttpRequest",
            },
          }
        );

        let data;

        try {
          data = await response.json();
        } catch (error) {
          throw new Error(
            "The server returned an invalid response."
          );
        }

        if (
          !response.ok ||
          data.success === false ||
          data.status === "error"
        ) {
          showDealFormErrors(
            data.errors || {
              form: [
                data.message ||
                  "Unable to save deal.",
              ],
            }
          );

          return;
        }

        getDealModal()?.hide();

        showToast(
          "success",
          data.message ||
            "Deal saved successfully"
        );

        await refreshAdminDealsContent();

      } catch (error) {
        console.error(
          "Deal save error:",
          error
        );

        showToast(
          "error",
          error.message ||
            "Unable to save deal"
        );

      } finally {
        if (saveButton) {
          saveButton.disabled = false;
        }

        if (saveButtonText) {
          saveButtonText.textContent =
            originalText;
        }
      }
    }
  );
}


/* =========================================================
   DEAL ACTIONS
========================================================= */

function initDealActions() {
  const page =
    document.getElementById(
      "adminDealsPage"
    );

  if (
    !page ||
    page.dataset.actionsBound === "true"
  ) {
    return;
  }

  page.dataset.actionsBound = "true";

  page.addEventListener(
    "click",
    function (event) {
      const editButton =
        event.target.closest(
          ".edit-deal-btn"
        );

      const toggleButton =
        event.target.closest(
          ".toggle-deal-btn"
        );

      const deleteButton =
        event.target.closest(
          ".delete-deal-btn"
        );

      if (editButton) {
        event.preventDefault();

        loadDealForEditing(
          editButton.dataset.detailsUrl
        );

        return;
      }

      if (toggleButton) {
        event.preventDefault();

        confirmToggleDeal(toggleButton);

        return;
      }

      if (deleteButton) {
        event.preventDefault();

        confirmDeleteDeal(deleteButton);
      }
    }
  );
}


/* =========================================================
   LOAD DEAL FOR EDIT
========================================================= */

async function loadDealForEditing(url) {
  if (!url) {
    showToast(
      "error",
      "Deal details URL is missing"
    );

    return;
  }

  resetDealForm();

  try {
    const data = await fetchJSON(url);

    if (
      data.success === false ||
      !data.deal
    ) {
      throw new Error(
        data.message ||
          "Unable to load deal"
      );
    }

    populateDealForm(data.deal);

    getDealModal()?.show();

  } catch (error) {
    console.error(
      "Deal details error:",
      error
    );

    showToast(
      "error",
      error.message ||
        "Unable to load deal"
    );
  }
}


function setDealFieldValue(id, value) {
  const field =
    document.getElementById(id);

  if (!field) {
    return;
  }

  field.value =
    value === null ||
    value === undefined
      ? ""
      : value;
}


function selectDealOptions(
  selectId,
  selectedValues
) {
  const select =
    document.getElementById(selectId);

  if (!select) {
    return;
  }

  const values = (
    selectedValues || []
  ).map(String);

  Array.from(select.options).forEach(
    (option) => {
      option.selected =
        values.includes(
          String(option.value)
        );
    }
  );
}


function populateDealForm(deal) {
  setDealFieldValue(
    "dealId",
    deal.id
  );

  setDealFieldValue(
    "id_title",
    deal.title
  );

  setDealFieldValue(
    "id_description",
    deal.description
  );

  setDealFieldValue(
    "id_discount_type",
    deal.discount_type
  );

  setDealFieldValue(
    "id_discount_value",
    deal.discount_value
  );

  setDealFieldValue(
    "id_start_date",
    deal.start_date
  );

  setDealFieldValue(
    "id_end_date",
    deal.end_date
  );

  setDealFieldValue(
    "id_priority",
    deal.priority
  );

  const activeField =
    document.getElementById(
      "id_is_active"
    );

  if (activeField) {
    activeField.checked =
      Boolean(deal.is_active);
  }

  selectDealOptions(
    "id_products",
    deal.products
  );

  selectDealOptions(
    "id_categories",
    deal.categories
  );

  const title =
    document.getElementById(
      "dealModalTitle"
    );

  const buttonText =
    document.getElementById(
      "saveDealBtnText"
    );

  if (title) {
    title.textContent = "Edit Deal";
  }

  if (buttonText) {
    buttonText.textContent =
      "Update Deal";
  }

  const previewBox =
    document.getElementById(
      "dealBannerPreviewBox"
    );

  const previewImage =
    document.getElementById(
      "dealBannerPreview"
    );

  if (
    deal.banner_image &&
    previewBox &&
    previewImage
  ) {
    previewImage.src =
      deal.banner_image;

    previewBox.classList.remove(
      "d-none"
    );
  }

  updateDealDiscountSymbol();
}


/* =========================================================
   TOGGLE DEAL
========================================================= */

function confirmToggleDeal(button) {
  const isActive =
    button.dataset.active === "true";

  const dealTitle =
    button.dataset.title || "this deal";

  const actionText =
    isActive
      ? "deactivate"
      : "activate";

  Velora.confirmAction({
    title: `${
      isActive
        ? "Deactivate"
        : "Activate"
    } deal?`,

    text:
      `Are you sure you want to ${actionText} ${dealTitle}?`,

    confirmButtonText:
      isActive
        ? "Yes, deactivate"
        : "Yes, activate",

    confirmButtonColor:
      isActive
        ? "#f97316"
        : "#2563eb",

    onConfirm: () => {
      toggleDealStatus(button);
    },
  });
}


async function toggleDealStatus(button) {
  const url = button.dataset.url;

  if (!url) {
    showToast(
      "error",
      "Deal action URL is missing"
    );

    return;
  }

  button.disabled = true;

  try {
    const data = await fetchJSON(url, {
      method: "POST",

      headers: {
        "X-CSRFToken":
          getCSRFToken(),
      },
    });

    if (
      data.success === false ||
      data.status === "error"
    ) {
      throw new Error(
        data.message ||
          "Unable to update deal"
      );
    }

    showToast(
      "success",
      data.message ||
        "Deal status updated"
    );

    await refreshAdminDealsContent();

  } catch (error) {
    console.error(
      "Deal toggle error:",
      error
    );

    button.disabled = false;

    showToast(
      "error",
      error.message ||
        "Unable to update deal"
    );
  }
}


/* =========================================================
   DELETE DEAL
========================================================= */

function confirmDeleteDeal(button) {
  const dealTitle =
    button.dataset.title || "this deal";

  Velora.confirmAction({
    title: "Delete deal?",

    text:
      `${dealTitle} will be permanently deleted.`,

    confirmButtonText:
      "Yes, delete",

    confirmButtonColor:
      "#ef4444",

    onConfirm: () => {
      deleteDeal(button);
    },
  });
}


async function deleteDeal(button) {
  const url = button.dataset.url;

  if (!url) {
    showToast(
      "error",
      "Deal delete URL is missing"
    );

    return;
  }

  button.disabled = true;

  try {
    const data = await fetchJSON(url, {
      method: "POST",

      headers: {
        "X-CSRFToken":
          getCSRFToken(),
      },
    });

    if (
      data.success === false ||
      data.status === "error"
    ) {
      throw new Error(
        data.message ||
          "Unable to delete deal"
      );
    }

    const row =
      button.closest("tr");

    if (row) {
      row.style.opacity = "0";

      row.style.transform =
        "translateX(20px)";

      setTimeout(() => {
        row.remove();
      }, 200);
    }

    showToast(
      "success",
      data.message ||
        "Deal deleted successfully"
    );

    await refreshAdminDealsContent();

  } catch (error) {
    console.error(
      "Deal delete error:",
      error
    );

    button.disabled = false;

    showToast(
      "error",
      error.message ||
        "Unable to delete deal"
    );
  }
}


/* =========================================================
   DEAL SEARCH
========================================================= */

function initDealSearch() {
  const searchInput =
    document.getElementById(
      "dealSearchInput"
    );

  const searchButton =
    document.getElementById(
      "dealSearchBtn"
    );

  const clearButton =
    document.getElementById(
      "clearDealSearchBtn"
    );

  if (!searchInput) {
    return;
  }

  let searchTimer = null;

  const runSearch = () => {
    const query =
      searchInput.value.trim();

    filterDealRows(query);

    if (clearButton) {
      clearButton.classList.toggle(
        "d-none",
        query.length === 0
      );
    }
  };

  searchInput.addEventListener(
    "input",
    function () {
      clearTimeout(searchTimer);

      searchTimer = setTimeout(
        runSearch,
        180
      );
    }
  );

  searchInput.addEventListener(
    "keydown",
    function (event) {
      if (event.key === "Enter") {
        event.preventDefault();

        clearTimeout(searchTimer);

        runSearch();
      }
    }
  );

  searchButton?.addEventListener(
    "click",
    runSearch
  );

  clearButton?.addEventListener(
    "click",
    function () {
      searchInput.value = "";

      filterDealRows("");

      this.classList.add("d-none");

      searchInput.focus();
    }
  );
}


function filterDealRows(query) {
  const normalizedQuery =
    String(query || "")
      .trim()
      .toLowerCase();

  const rows =
    document.querySelectorAll(
      "#dealTableBody tr[id^='deal-row-']"
    );

  let visibleRows = 0;

  rows.forEach((row) => {
    const searchableText =
      row.textContent
        .toLowerCase()
        .replace(/\s+/g, " ");

    const visible =
      !normalizedQuery ||
      searchableText.includes(
        normalizedQuery
      );

    row.classList.toggle(
      "d-none",
      !visible
    );

    if (visible) {
      visibleRows += 1;
    }
  });

  showDealSearchEmptyState(
    visibleRows === 0,
    normalizedQuery
  );
}


function showDealSearchEmptyState(
  shouldShow,
  query
) {
  const tableBody =
    document.getElementById(
      "dealTableBody"
    );

  if (!tableBody) {
    return;
  }

  let emptyRow =
    document.getElementById(
      "dealSearchEmptyRow"
    );

  if (!shouldShow) {
    emptyRow?.remove();
    return;
  }

  if (!emptyRow) {
    emptyRow =
      document.createElement("tr");

    emptyRow.id =
      "dealSearchEmptyRow";

    emptyRow.innerHTML = `
      <td colspan="6">
        <div class="empty-deal-box">
          <div class="empty-deal-icon">
            <i class="bi bi-search"></i>
          </div>

          <h4>No matching deals</h4>

          <p>
            No deals matched
            “${escapeHTML(query)}”.
          </p>
        </div>
      </td>
    `;

    tableBody.appendChild(emptyRow);
  }
}


/* =========================================================
   REFRESH DEAL CONTENT WITHOUT PAGE RELOAD
========================================================= */

async function refreshAdminDealsContent() {
  const currentPage =
    document.getElementById(
      "adminDealsPage"
    );

  if (!currentPage) {
    return;
  }

  const listUrl =
    currentPage.dataset.listUrl ||
    window.location.pathname;

  try {
    const response = await fetch(listUrl, {
      headers: {
        "X-Requested-With":
          "XMLHttpRequest",
      },
    });

    if (!response.ok) {
      throw new Error(
        "Unable to refresh deals"
      );
    }

    const html =
      await response.text();

    const parser =
      new DOMParser();

    const documentResult =
      parser.parseFromString(
        html,
        "text/html"
      );

    const newPage =
      documentResult.getElementById(
        "adminDealsPage"
      );

    const newModal =
      documentResult.getElementById(
        "dealModal"
      );

    if (!newPage) {
      throw new Error(
        "Deals page content was not found"
      );
    }

    currentPage.replaceWith(newPage);

    const currentModal =
      document.getElementById(
        "dealModal"
      );

    if (currentModal && newModal) {
      currentModal.replaceWith(newModal);
    }

    initAdminDeals();

  } catch (error) {
    console.error(
      "Deal refresh error:",
      error
    );

    showToast(
      "warning",
      "Deal saved, but the list could not refresh automatically"
    );
  }
}

/* =========================================================
   CUSTOMER DEAL COUNTDOWNS
========================================================= */

let dealsPageRefreshRunning = false;
let dealsPageRefreshTimer = null;


/* ---------------------------------------------------------
   Initialize all hero and product-card countdowns
--------------------------------------------------------- */

function initVeloraDealCountdowns() {
  const dealsPage =
    document.getElementById("dealsPage");

  if (!dealsPage) {
    return;
  }

  const countdowns =
    dealsPage.querySelectorAll(
      "[data-deal-countdown]"
    );

  countdowns.forEach((countdown) => {
    if (
      countdown.dataset.countdownBound ===
      "true"
    ) {
      return;
    }

    countdown.dataset.countdownBound =
      "true";

    startVeloraDealCountdown(countdown);
  });
}


/* ---------------------------------------------------------
   Start one countdown
--------------------------------------------------------- */

function startVeloraDealCountdown(countdown) {
  const endDateValue =
    countdown.dataset.endDate;

  if (!endDateValue) {
    hideExpiredDealCountdown(countdown);
    return;
  }

  const endTime =
    new Date(endDateValue).getTime();

  if (Number.isNaN(endTime)) {
    hideExpiredDealCountdown(countdown);
    return;
  }

  let intervalId = null;


  const updateCountdown = () => {
    const currentTime = Date.now();
    const distance = endTime - currentTime;

    /*
      The offer has ended.

      Do not show:
      00 days
      00 hours
      00:00:00

      Instead, update the Deals section from Django
      without performing a complete browser refresh.
    */

    if (distance <= 0) {
      if (intervalId) {
        window.clearInterval(intervalId);
      }

      hideExpiredDealCountdown(countdown);
      scheduleDealsPageRefresh();

      return;
    }

    const totalSeconds =
      Math.floor(distance / 1000);

    const days =
      Math.floor(
        totalSeconds / 86400
      );

    const hours =
      Math.floor(
        (totalSeconds % 86400) / 3600
      );

    const minutes =
      Math.floor(
        (totalSeconds % 3600) / 60
      );

    const seconds =
      totalSeconds % 60;


    updateFullDealCountdown(
      countdown,
      days,
      hours,
      minutes,
      seconds
    );

    updateCompactDealCountdown(
      countdown,
      days,
      hours,
      minutes,
      seconds
    );
  };


  // Update immediately so placeholders do not remain visible.
  updateCountdown();

  intervalId = window.setInterval(
    updateCountdown,
    1000
  );
}


/* ---------------------------------------------------------
   Update the large hero countdown
--------------------------------------------------------- */

function updateFullDealCountdown(
  countdown,
  days,
  hours,
  minutes,
  seconds
) {
  const daysElement =
    countdown.querySelector(
      "[data-countdown-days]"
    );

  const hoursElement =
    countdown.querySelector(
      "[data-countdown-hours]"
    );

  const minutesElement =
    countdown.querySelector(
      "[data-countdown-minutes]"
    );

  const secondsElement =
    countdown.querySelector(
      "[data-countdown-seconds]"
    );


  if (daysElement) {
    daysElement.textContent =
      padDealTime(days);
  }

  if (hoursElement) {
    hoursElement.textContent =
      padDealTime(hours);
  }

  if (minutesElement) {
    minutesElement.textContent =
      padDealTime(minutes);
  }

  if (secondsElement) {
    secondsElement.textContent =
      padDealTime(seconds);
  }
}


/* ---------------------------------------------------------
   Update product-card countdown
--------------------------------------------------------- */

function updateCompactDealCountdown(
  countdown,
  days,
  hours,
  minutes,
  seconds
) {
  const compactElement =
    countdown.querySelector(
      "[data-compact-countdown]"
    );

  if (!compactElement) {
    return;
  }

  if (days > 0) {
    compactElement.textContent =
      `${days}d ${padDealTime(hours)}:${padDealTime(minutes)}:${padDealTime(seconds)}`;

    return;
  }

  compactElement.textContent =
    `${padDealTime(hours)}:${padDealTime(minutes)}:${padDealTime(seconds)}`;
}


/* ---------------------------------------------------------
   Add leading zero
--------------------------------------------------------- */

function padDealTime(value) {
  return String(value).padStart(2, "0");
}


/* ---------------------------------------------------------
   Immediately hide expired timer/card content
--------------------------------------------------------- */

function hideExpiredDealCountdown(countdown) {
  const productColumn =
    countdown.closest(
      "[data-deal-product]"
    );

  /*
    If this is a product-card countdown,
    hide the complete expired product card immediately.
  */

  if (productColumn) {
    productColumn.classList.add("d-none");
  }


  const hero =
    countdown.closest(".deals-hero");

  /*
    If this is the featured hero,
    hide it until the AJAX refresh replaces it with:
    - the next active deal, or
    - the decorative no-offer banner.
  */

  if (hero) {
    hero.style.opacity = "0";
    hero.style.pointerEvents = "none";
  }


  /*
    Never leave an expired 00:00:00 element visible.
  */

  countdown.classList.add("d-none");
}


/* ---------------------------------------------------------
   Prevent multiple cards from causing multiple fetches
--------------------------------------------------------- */

function scheduleDealsPageRefresh() {
  window.clearTimeout(
    dealsPageRefreshTimer
  );

  dealsPageRefreshTimer =
    window.setTimeout(() => {
      refreshDealsPageWithoutReload();
    }, 250);
}


/* ---------------------------------------------------------
   AJAX refresh only the Deals page section
--------------------------------------------------------- */

async function refreshDealsPageWithoutReload() {
  if (dealsPageRefreshRunning) {
    return;
  }

  const currentDealsPage =
    document.getElementById("dealsPage");

  if (!currentDealsPage) {
    return;
  }

  dealsPageRefreshRunning = true;

  try {
    const response = await fetch(
      window.location.href,
      {
        method: "GET",

        headers: {
          "X-Requested-With":
            "XMLHttpRequest",

          "Cache-Control":
            "no-cache",
        },

        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        "Unable to refresh deal information."
      );
    }

    const responseHTML =
      await response.text();

    const parser =
      new DOMParser();

    const responseDocument =
      parser.parseFromString(
        responseHTML,
        "text/html"
      );

    const updatedDealsPage =
      responseDocument.getElementById(
        "dealsPage"
      );

    if (!updatedDealsPage) {
      throw new Error(
        "Updated Deals section was not found."
      );
    }

    currentDealsPage.replaceWith(
      updatedDealsPage
    );

    /*
      Bind countdowns to the newly inserted content.
    */

    initVeloraDealCountdowns();


    /*
      Reinitialize your Deals search/filter module
      if you already created it under this name.
    */

    if (
      typeof initDealsFilters ===
      "function"
    ) {
      initDealsFilters();
    }


    /*
      Support an existing complete Deals initializer
      if your current script uses this function name.
    */

    if (
      typeof initCustomerDealsPage ===
      "function"
    ) {
      initCustomerDealsPage();
    }

  } catch (error) {
    console.error(
      "Deals refresh error:",
      error
    );

    /*
      Keep the expired banner/countdown hidden.
      Do not restore 00:00:00.
    */

    showToast(
      "warning",
      "The offer has ended."
    );

  } finally {
    dealsPageRefreshRunning = false;
  }
}

/* =========================================================
   ADMIN BLOG POST MANAGER
========================================================= */

function initAdminBlogManager() {
  const adminBlogPage =
    document.getElementById("adminBlogPage");

  if (
    !adminBlogPage ||
    adminBlogPage.dataset.blogManagerBound === "true"
  ) {
    return;
  }

  adminBlogPage.dataset.blogManagerBound = "true";

  const blogModalElement =
    document.getElementById("blogPostModal");

  const blogForm =
    document.getElementById("blogPostForm");

  const blogPostId =
    document.getElementById("blogPostId");

  const blogModalTitle =
    document.getElementById("blogPostModalTitle");

  const blogSaveText =
    document.getElementById("blogPostSaveText");

  const openAddButton =
    document.getElementById("openAddBlogBtn");


  function getBlogModal() {
    if (
      !window.bootstrap ||
      !blogModalElement
    ) {
      return null;
    }

    return bootstrap.Modal.getOrCreateInstance(
      blogModalElement
    );
  }


  function resetBlogForm() {
    if (!blogForm) {
      return;
    }

    blogForm.reset();

    if (blogPostId) {
      blogPostId.value = "";
    }

    if (blogModalTitle) {
      blogModalTitle.textContent =
        "Add Blog Post";
    }

    if (blogSaveText) {
      blogSaveText.textContent =
        "Save Blog Post";
    }

    blogForm
      .querySelectorAll(".is-invalid")
      .forEach((field) => {
        field.classList.remove(
          "is-invalid"
        );
      });

    blogForm
      .querySelectorAll(".ajax-field-error")
      .forEach((error) => {
        error.remove();
      });

    const errorBox =
      blogForm.querySelector(
        ".ajax-form-errors"
      );

    if (errorBox) {
      errorBox.innerHTML = "";
      errorBox.classList.add(
        "d-none"
      );
    }
  }


  openAddButton?.addEventListener(
    "click",
    resetBlogForm
  );


  blogModalElement?.addEventListener(
    "hidden.bs.modal",
    resetBlogForm
  );


  adminBlogPage.addEventListener(
    "click",
    function (event) {
      const editButton =
        event.target.closest(
          ".edit-blog-btn"
        );

      const toggleButton =
        event.target.closest(
          ".blog-toggle-action"
        );

      const deleteButton =
        event.target.closest(
          ".blog-delete-btn"
        );


      if (editButton) {
        event.preventDefault();

        loadBlogPostForEditing(
          editButton.dataset.detailsUrl
        );

        return;
      }


      if (toggleButton) {
        event.preventDefault();

        confirmBlogPostToggle(
          toggleButton
        );

        return;
      }


      if (deleteButton) {
        event.preventDefault();

        confirmBlogPostDelete(
          deleteButton
        );
      }
    }
  );


  async function loadBlogPostForEditing(url) {
    if (!url) {
      showToast(
        "error",
        "Blog details URL is missing."
      );

      return;
    }

    try {
      const data =
        await fetchJSON(url);

      if (
        data.success === false ||
        !data.post
      ) {
        throw new Error(
          data.message ||
          "Unable to load blog post."
        );
      }

      populateBlogForm(
        data.post
      );

      getBlogModal()?.show();
    } catch (error) {
      showToast(
        "error",
        error.message ||
        "Unable to load blog post."
      );
    }
  }


  function populateBlogForm(post) {
    resetBlogForm();

    if (blogPostId) {
      blogPostId.value =
        post.id || "";
    }

    setBlogFormValue(
      "title",
      post.title
    );

    setBlogFormValue(
      "category",
      post.category_id
    );

    setBlogFormValue(
      "short_description",
      post.short_description
    );

    setBlogFormValue(
      "content",
      post.content
    );

    setBlogFormValue(
      "published_at",
      post.published_at
    );

    setBlogCheckboxValue(
      "is_published",
      post.is_published
    );

    setBlogCheckboxValue(
      "is_featured",
      post.is_featured
    );

    if (blogModalTitle) {
      blogModalTitle.textContent =
        "Edit Blog Post";
    }

    if (blogSaveText) {
      blogSaveText.textContent =
        "Update Blog Post";
    }
  }


  function setBlogFormValue(
    fieldName,
    value
  ) {
    const field =
      blogForm?.querySelector(
        `[name="${fieldName}"]`
      );

    if (!field) {
      return;
    }

    field.value =
      value ?? "";
  }


  function setBlogCheckboxValue(
    fieldName,
    checked
  ) {
    const field =
      blogForm?.querySelector(
        `[name="${fieldName}"]`
      );

    if (!field) {
      return;
    }

    field.checked =
      Boolean(checked);
  }


  function confirmBlogPostToggle(button) {
    const actionType =
      button.dataset.actionType || "";

    const title =
      button.dataset.postTitle ||
      "this blog post";

    let alertTitle =
      "Update blog post?";

    let alertText =
      `Are you sure you want to update ${title}?`;

    let confirmText =
      "Yes, update";

    if (
      actionType === "publish"
    ) {
      alertTitle =
        "Publish blog post?";

      alertText =
        `${title} will become visible on the website.`;

      confirmText =
        "Yes, publish";
    }

    if (
      actionType === "draft"
    ) {
      alertTitle =
        "Move blog post to draft?";

      alertText =
        `${title} will no longer be visible on the website.`;

      confirmText =
        "Yes, move to draft";
    }

    if (
      actionType === "feature"
    ) {
      alertTitle =
        "Mark as featured?";

      alertText =
        `${title} will appear in the featured blog section.`;

      confirmText =
        "Yes, feature";
    }

    if (
      actionType === "unfeature"
    ) {
      alertTitle =
        "Remove featured status?";

      alertText =
        `${title} will be removed from the featured section.`;

      confirmText =
        "Yes, remove";
    }

    Velora.confirmAction({
      title: alertTitle,
      text: alertText,
      confirmButtonText:
        confirmText,
      confirmButtonColor:
        "#2563eb",

      onConfirm: () => {
        toggleBlogPost(button);
      },
    });
  }


  async function toggleBlogPost(button) {
    const url =
      button.dataset.url;

    if (!url) {
      showToast(
        "error",
        "Blog action URL is missing."
      );

      return;
    }

    button.disabled = true;

    try {
      const data =
        await fetchJSON(url, {
          method: "POST",

          headers: {
            "X-CSRFToken":
              getCSRFToken(),
          },
        });

      if (
        data.success === false ||
        data.status === "error"
      ) {
        throw new Error(
          data.message ||
          "Unable to update blog post."
        );
      }

      showToast(
        "success",
        data.message ||
        "Blog post updated successfully."
      );

      window.setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      button.disabled = false;

      showToast(
        "error",
        error.message ||
        "Unable to update blog post."
      );
    }
  }


  function confirmBlogPostDelete(button) {
    const postTitle =
      button.dataset.postTitle ||
      "This blog post";

    Velora.confirmAction({
      title: "Delete blog post?",

      text:
        `${postTitle} will be permanently deleted.`,

      confirmButtonText:
        "Yes, delete",

      confirmButtonColor:
        "#dc2626",

      onConfirm: () => {
        deleteBlogPost(button);
      },
    });
  }


  async function deleteBlogPost(button) {
    const url =
      button.dataset.url;

    if (!url) {
      showToast(
        "error",
        "Blog delete URL is missing."
      );

      return;
    }

    button.disabled = true;

    try {
      const data =
        await fetchJSON(url, {
          method: "POST",

          headers: {
            "X-CSRFToken":
              getCSRFToken(),
          },
        });

      if (
        data.success === false ||
        data.status === "error"
      ) {
        throw new Error(
          data.message ||
          "Unable to delete blog post."
        );
      }

      const rowSelector =
        button.dataset.row;

      const row =
        rowSelector
          ? document.querySelector(
              rowSelector
            )
          : button.closest("tr");

      if (row) {
        row.style.transition =
          "0.25s ease";

        row.style.opacity = "0";
        row.style.transform =
          "translateX(20px)";

        window.setTimeout(() => {
          row.remove();

          updateBlogEmptyState();
        }, 250);
      }

      showToast(
        "success",
        data.message ||
        "Blog post deleted successfully."
      );
    } catch (error) {
      button.disabled = false;

      showToast(
        "error",
        error.message ||
        "Unable to delete blog post."
      );
    }
  }


  function updateBlogEmptyState() {
    const tableBody =
      adminBlogPage.querySelector(
        "tbody"
      );

    if (!tableBody) {
      return;
    }

    const remainingRows =
      tableBody.querySelectorAll(
        'tr[id^="blog-row-"]'
      );

    if (remainingRows.length) {
      return;
    }

    tableBody.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="text-center py-5"
        >
          <div class="empty-admin-state">

            <div class="empty-admin-icon">
              <i class="bi bi-journal-x"></i>
            </div>

            <h5>
              No blog posts found
            </h5>

            <p class="text-muted">
              Create your first Velora blog post.
            </p>

            <button
              type="button"
              class="add-admin-btn border-0"
              data-bs-toggle="modal"
              data-bs-target="#blogPostModal"
            >
              Add Blog Post
            </button>

          </div>
        </td>
      </tr>
    `;
  }
}

/* =========================================================
   DYNAMIC BLOG PAGE
========================================================= */

function initDynamicBlogPage() {
  const blogPage =
    document.getElementById("blogPage");

  if (
    !blogPage ||
    blogPage.dataset.bound === "true"
  ) {
    return;
  }

  blogPage.dataset.bound = "true";

  const searchInput =
    document.getElementById(
      "blogSearchInput"
    );

  const clearSearch =
    document.getElementById(
      "clearBlogSearch"
    );

  const resetButton =
    document.getElementById(
      "resetBlogFilters"
    );

  const resultCount =
    document.getElementById(
      "visibleBlogCount"
    );

  const emptyState =
    document.getElementById(
      "blogSearchEmpty"
    );

  const filterButtons =
    Array.from(
      blogPage.querySelectorAll(
        "[data-blog-category]"
      )
    );

  const sidebarButtons =
    Array.from(
      blogPage.querySelectorAll(
        "[data-sidebar-blog-category]"
      )
    );

  let selectedCategory = "all";


  function applyBlogFilters() {
    const query =
      searchInput?.value
        .trim()
        .toLowerCase() || "";

    let visiblePosts = 0;

    blogPage
      .querySelectorAll(
        "[data-blog-post]"
      )
      .forEach((post) => {
        const title =
          post.dataset.title || "";

        const description =
          post.dataset.description || "";

        const category =
          post.dataset.category || "";

        const matchesSearch =
          !query ||
          title.includes(query) ||
          description.includes(query) ||
          category.includes(query);

        const matchesCategory =
          selectedCategory === "all" ||
          category === selectedCategory;

        const visible =
          matchesSearch &&
          matchesCategory;

        post.classList.toggle(
          "d-none",
          !visible
        );

        if (visible) {
          visiblePosts += 1;
        }
      });


    if (resultCount) {
      resultCount.textContent =
        visiblePosts;
    }


    emptyState?.classList.toggle(
      "d-none",
      visiblePosts !== 0
    );


    clearSearch?.classList.toggle(
      "d-none",
      query.length === 0
    );


    sidebarButtons.forEach(
      (button) => {
        button.classList.toggle(
          "active",
          button.dataset
            .sidebarBlogCategory ===
            selectedCategory
        );
      }
    );
  }


  function selectBlogCategory(category) {
    selectedCategory =
      category || "all";

    filterButtons.forEach(
      (button) => {
        button.classList.toggle(
          "active",
          button.dataset.blogCategory ===
            selectedCategory
        );
      }
    );

    applyBlogFilters();

    document
      .getElementById("blogPostGrid")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }


  searchInput?.addEventListener(
    "input",
    applyBlogFilters
  );


  clearSearch?.addEventListener(
    "click",
    function () {
      searchInput.value = "";
      searchInput.focus();

      applyBlogFilters();
    }
  );


  filterButtons.forEach((button) => {
    button.addEventListener(
      "click",
      function () {
        selectBlogCategory(
          this.dataset.blogCategory
        );
      }
    );
  });


  sidebarButtons.forEach((button) => {
    button.addEventListener(
      "click",
      function () {
        selectBlogCategory(
          this.dataset
            .sidebarBlogCategory
        );
      }
    );
  });


  resetButton?.addEventListener(
    "click",
    function () {
      if (searchInput) {
        searchInput.value = "";
      }

      selectBlogCategory("all");
    }
  );


  applyBlogFilters();
}

/* =========================================================
   BLOG CATEGORY MANAGER
========================================================= */

function initBlogCategoryManager() {
  const categoriesModalElement =
    document.getElementById(
      "blogCategoriesModal"
    );

  if (
    !categoriesModalElement ||
    categoriesModalElement.dataset.bound === "true"
  ) {
    return;
  }

  categoriesModalElement.dataset.bound = "true";

  const categoryFormModalElement =
    document.getElementById(
      "blogCategoryModal"
    );

  const viewModalElement =
    document.getElementById(
      "viewBlogCategoryModal"
    );

  const categoryForm =
    document.getElementById(
      "blogCategoryForm"
    );

  const categoryIdInput =
    document.getElementById(
      "blogCategoryId"
    );

  const categoryModalTitle =
    document.getElementById(
      "blogCategoryModalTitle"
    );

  const categorySaveText =
    document.getElementById(
      "blogCategorySaveText"
    );

  const searchInput =
    document.getElementById(
      "blogCategorySearchInput"
    );

  const clearSearchButton =
    document.getElementById(
      "clearBlogCategorySearch"
    );

  const searchEmptyState =
    document.getElementById(
      "blogCategorySearchEmpty"
    );

  const tableWrapper =
    document.getElementById(
      "blogCategoryTableWrapper"
    );


  function getCategoriesModal() {
    if (!window.bootstrap) {
      return null;
    }

    return bootstrap.Modal.getOrCreateInstance(
      categoriesModalElement
    );
  }


  function getCategoryFormModal() {
    if (
      !window.bootstrap ||
      !categoryFormModalElement
    ) {
      return null;
    }

    return bootstrap.Modal.getOrCreateInstance(
      categoryFormModalElement
    );
  }


  function getViewModal() {
    if (
      !window.bootstrap ||
      !viewModalElement
    ) {
      return null;
    }

    return bootstrap.Modal.getOrCreateInstance(
      viewModalElement
    );
  }


  function resetCategoryForm() {
    categoryForm?.reset();

    if (categoryIdInput) {
      categoryIdInput.value = "";
    }

    if (categoryModalTitle) {
      categoryModalTitle.textContent =
        "Add Blog Category";
    }

    if (categorySaveText) {
      categorySaveText.textContent =
        "Save Category";
    }

    categoryForm
      ?.querySelectorAll(".is-invalid")
      .forEach((field) => {
        field.classList.remove(
          "is-invalid"
        );
      });

    categoryForm
      ?.querySelectorAll(".ajax-field-error")
      .forEach((error) => {
        error.remove();
      });
  }


  function openAddCategoryModal() {
    resetCategoryForm();

    getCategoriesModal()?.hide();

    window.setTimeout(() => {
      getCategoryFormModal()?.show();
    }, 250);
  }


  document
    .getElementById("openAddBlogCategoryBtn")
    ?.addEventListener(
      "click",
      openAddCategoryModal
    );

  document
    .getElementById("openAddBlogCategoryFromList")
    ?.addEventListener(
      "click",
      openAddCategoryModal
    );

  document
    .getElementById("emptyAddBlogCategoryBtn")
    ?.addEventListener(
      "click",
      openAddCategoryModal
    );


  categoriesModalElement.addEventListener(
    "click",
    function (event) {
      const viewButton =
        event.target.closest(
          ".view-blog-category-btn"
        );

      const editButton =
        event.target.closest(
          ".edit-blog-category-btn"
        );

      const toggleButton =
        event.target.closest(
          ".toggle-blog-category-btn"
        );

      const deleteButton =
        event.target.closest(
          ".delete-blog-category-btn"
        );


      if (viewButton) {
        event.preventDefault();

        document.getElementById(
          "viewBlogCategoryName"
        ).textContent =
          viewButton.dataset.categoryName || "Category";

        document.getElementById(
          "viewBlogCategoryDescription"
        ).textContent =
          viewButton.dataset.categoryDescription ||
          "No description added.";

        document.getElementById(
          "viewBlogCategoryStatus"
        ).textContent =
          viewButton.dataset.categoryStatus || "Inactive";

        document.getElementById(
          "viewBlogCategoryPosts"
        ).textContent =
          viewButton.dataset.categoryPosts || "0";

        getCategoriesModal()?.hide();

        window.setTimeout(() => {
          getViewModal()?.show();
        }, 250);

        return;
      }


      if (editButton) {
        event.preventDefault();

        loadBlogCategoryForEditing(
          editButton.dataset.detailsUrl
        );

        return;
      }


      if (toggleButton) {
        event.preventDefault();

        confirmBlogCategoryToggle(
          toggleButton
        );

        return;
      }


      if (deleteButton) {
        event.preventDefault();

        confirmBlogCategoryDelete(
          deleteButton
        );
      }
    }
  );


  async function loadBlogCategoryForEditing(url) {
    if (!url) {
      showToast(
        "error",
        "Category details URL is missing."
      );

      return;
    }

    try {
      const data =
        await fetchJSON(url);

      if (
        data.success === false ||
        !data.category
      ) {
        throw new Error(
          data.message ||
          "Unable to load category."
        );
      }

      const category =
        data.category;

      resetCategoryForm();

      if (categoryIdInput) {
        categoryIdInput.value =
          category.id;
      }

      const nameField =
        categoryForm?.querySelector(
          '[name="category_name"]'
        );

      const descriptionField =
        categoryForm?.querySelector(
          '[name="description"]'
        );

      const activeField =
        categoryForm?.querySelector(
          '[name="is_active"]'
        );

      if (nameField) {
        nameField.value =
          category.category_name || "";
      }

      if (descriptionField) {
        descriptionField.value =
          category.description || "";
      }

      if (activeField) {
        activeField.checked =
          Boolean(category.is_active);
      }

      if (categoryModalTitle) {
        categoryModalTitle.textContent =
          "Edit Blog Category";
      }

      if (categorySaveText) {
        categorySaveText.textContent =
          "Update Category";
      }

      getCategoriesModal()?.hide();

      window.setTimeout(() => {
        getCategoryFormModal()?.show();
      }, 250);
    } catch (error) {
      showToast(
        "error",
        error.message ||
        "Unable to load category."
      );
    }
  }


  function confirmBlogCategoryToggle(button) {
    const isActive =
      button.dataset.active === "true";

    const categoryName =
      button.dataset.categoryName ||
      "this category";

    Velora.confirmAction({
      title: isActive
        ? "Deactivate category?"
        : "Activate category?",

      text: isActive
        ? `${categoryName} will no longer appear on the public blog page.`
        : `${categoryName} will become available on the public blog page.`,

      confirmButtonText: isActive
        ? "Yes, deactivate"
        : "Yes, activate",

      confirmButtonColor: isActive
        ? "#f97316"
        : "#16a34a",

      onConfirm: () => {
        toggleBlogCategory(button);
      },
    });
  }


  async function toggleBlogCategory(button) {
    const url =
      button.dataset.url;

    if (!url) {
      showToast(
        "error",
        "Category status URL is missing."
      );

      return;
    }

    button.disabled = true;

    try {
      const data =
        await fetchJSON(url, {
          method: "POST",

          headers: {
            "X-CSRFToken":
              getCSRFToken(),
          },
        });

      if (
        data.success === false ||
        data.status === "error"
      ) {
        throw new Error(
          data.message ||
          "Unable to update category."
        );
      }

      showToast(
        "success",
        data.message ||
        "Category status updated."
      );

      window.location.reload();
    } catch (error) {
      button.disabled = false;

      showToast(
        "error",
        error.message ||
        "Unable to update category."
      );
    }
  }


  function confirmBlogCategoryDelete(button) {
    const categoryName =
      button.dataset.categoryName ||
      "This category";

    const postCount =
      Number(
        button.dataset.postCount || 0
      );

    if (postCount > 0) {
      Swal.fire({
        icon: "warning",
        title: "Category Contains Posts",
        text:
          `${categoryName} contains ${postCount} blog post${postCount === 1 ? "" : "s"}. Move or delete those posts first.`,
        confirmButtonText: "Understood",
        confirmButtonColor: "#2563eb",
      });

      return;
    }

    Velora.confirmAction({
      title: "Delete category?",

      text:
        `${categoryName} will be permanently deleted.`,

      confirmButtonText:
        "Yes, delete",

      confirmButtonColor:
        "#dc2626",

      onConfirm: () => {
        deleteBlogCategory(button);
      },
    });
  }


  async function deleteBlogCategory(button) {
    const url =
      button.dataset.url;

    if (!url) {
      showToast(
        "error",
        "Category delete URL is missing."
      );

      return;
    }

    button.disabled = true;

    try {
      const data =
        await fetchJSON(url, {
          method: "POST",

          headers: {
            "X-CSRFToken":
              getCSRFToken(),
          },
        });

      if (
        data.success === false ||
        data.status === "error"
      ) {
        throw new Error(
          data.message ||
          "Unable to delete category."
        );
      }

      const row =
        button.closest(
          "[data-blog-category-row]"
        );

      row?.remove();

      const countElement =
        document.getElementById(
          "blogCategoryTotalCount"
        );

      if (countElement) {
        countElement.textContent =
          Math.max(
            0,
            Number(countElement.textContent || 0) - 1
          );
      }

      showToast(
        "success",
        data.message ||
        "Category deleted successfully."
      );

      const remainingRows =
        document.querySelectorAll(
          "[data-blog-category-row]"
        );

      if (!remainingRows.length) {
        window.location.reload();
      }
    } catch (error) {
      button.disabled = false;

      showToast(
        "error",
        error.message ||
        "Unable to delete category."
      );
    }
  }


  function filterBlogCategories() {
    const query =
      searchInput?.value
        .trim()
        .toLowerCase() || "";

    let visibleRows = 0;

    document
      .querySelectorAll(
        "[data-blog-category-row]"
      )
      .forEach((row) => {
        const name =
          row.dataset.categoryName || "";

        const description =
          row.dataset.categoryDescription || "";

        const visible =
          !query ||
          name.includes(query) ||
          description.includes(query);

        row.classList.toggle(
          "d-none",
          !visible
        );

        if (visible) {
          visibleRows += 1;
        }
      });

    clearSearchButton?.classList.toggle(
      "d-none",
      !query
    );

    searchEmptyState?.classList.toggle(
      "d-none",
      visibleRows !== 0
    );

    tableWrapper?.classList.toggle(
      "d-none",
      visibleRows === 0
    );
  }


  searchInput?.addEventListener(
    "input",
    filterBlogCategories
  );


  clearSearchButton?.addEventListener(
    "click",
    function () {
      searchInput.value = "";

      filterBlogCategories();

      searchInput.focus();
    }
  );
}

/* =========================================================
   CONTACT PAGE
========================================================= */

function initContactPage() {
  const contactPage =
    document.getElementById("contactPage");

  const contactForm =
    document.getElementById("contactForm");

  if (
    !contactPage ||
    !contactForm ||
    contactForm.dataset.bound === "true"
  ) {
    return;
  }

  contactForm.dataset.bound = "true";

  const submitButton =
    document.getElementById(
      "contactSubmitBtn"
    );

  const submitText =
    submitButton?.querySelector(
      ".contact-submit-text"
    );

  const submitLoading =
    submitButton?.querySelector(
      ".contact-submit-loading"
    );


  function clearContactErrors() {
    contactForm
      .querySelectorAll(
        ".contact-field-error"
      )
      .forEach((errorElement) => {
        errorElement.textContent = "";
      });

    contactForm
      .querySelectorAll(
        ".is-invalid"
      )
      .forEach((field) => {
        field.classList.remove(
          "is-invalid"
        );
      });
  }


  function showContactErrors(errors) {
    Object.entries(
      errors || {}
    ).forEach(
      ([fieldName, messages]) => {
        const input =
          contactForm.elements[
            fieldName
          ];

        const errorElement =
          contactForm.querySelector(
            `[data-error-for="${fieldName}"]`
          );

        input?.classList.add(
          "is-invalid"
        );

        if (errorElement) {
          errorElement.textContent =
            Array.isArray(messages)
              ? messages[0]
              : messages;
        }
      }
    );
  }


  function setContactLoading(loading) {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = loading;

    submitText?.classList.toggle(
      "d-none",
      loading
    );

    submitLoading?.classList.toggle(
      "d-none",
      !loading
    );
  }


  contactForm.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      clearContactErrors();
      setContactLoading(true);

      const formData =
        new FormData(contactForm);

      try {
        const response = await fetch(
          contactForm.action,
          {
            method: "POST",

            headers: {
              "X-Requested-With":
                "XMLHttpRequest",
            },

            body: formData,
          }
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success === false
        ) {
          showContactErrors(
            data.errors
          );

          throw new Error(
            data.message ||
              "Unable to send your message."
          );
        }

        contactForm.reset();

        showContactNotification(
          "success",
          data.message ||
            "Your message has been sent successfully."
        );

      } catch (error) {
        showContactNotification(
          "error",
          error.message ||
            "Unable to send your message."
        );

      } finally {
        setContactLoading(false);
      }
    }
  );
}


/* =========================================================
   CONTACT SWEETALERT / TOAST REUSABILITY
========================================================= */

function showContactNotification(
  type,
  message
) {
  if (
    typeof showToast ===
    "function"
  ) {
    showToast(
      type,
      message
    );

    return;
  }

  if (
    typeof Swal !==
    "undefined"
  ) {
    Swal.fire({
      icon: type,
      title:
        type === "success"
          ? "Message Sent"
          : "Unable To Send",
      text: message,
      confirmButtonColor: "#2563eb",
    });

    return;
  }

  alert(message);
}
/* =========================================================
   FOOTER NEWSLETTER
========================================================= */

function initFooterNewsletter() {
  const form =
    document.getElementById(
      "footerNewsletterForm"
    );

  if (
    !form ||
    form.dataset.bound === "true"
  ) {
    return;
  }

  form.dataset.bound = "true";

  form.addEventListener(
    "submit",
    function (event) {
      event.preventDefault();

      const input =
        form.querySelector(
          'input[type="email"]'
        );

      const email =
        input?.value.trim();

      if (!email) {
        showFooterNotification(
          "error",
          "Please enter your email address."
        );

        return;
      }

      showFooterNotification(
        "success",
        "You have subscribed to Velora updates."
      );

      form.reset();
    }
  );
}


function showFooterNotification(
  type,
  message
) {
  if (
    typeof showToast ===
    "function"
  ) {
    showToast(
      type,
      message
    );

    return;
  }

  if (
    typeof Swal !==
    "undefined"
  ) {
    Swal.fire({
      icon: type,
      text: message,
      confirmButtonColor: "#2563eb",
    });

    return;
  }

  alert(message);
}

/* =========================================================
   PRODUCT REVIEW AND RATING SYSTEM
========================================================= */

function initProductReviewSystem() {
  const section =
    document.getElementById(
      "productReviewSection"
    );

  if (
    !section ||
    section.dataset.bound === "true"
  ) {
    return;
  }

  section.dataset.bound = "true";

  initInteractiveReviewStars(section);
  initProductReviewForm(section);
  initReviewDelete(section);
  initReviewSorting(section);
}


/* =========================================================
   INTERACTIVE STAR SELECTION
========================================================= */

function initInteractiveReviewStars(section) {
  const starContainer =
    section.querySelector(
      "#interactiveReviewStars"
    );

  const ratingInput =
    section.querySelector(
      'input[name="rating"]'
    );

  if (
    !starContainer ||
    !ratingInput
  ) {
    return;
  }

  const starButtons =
    Array.from(
      starContainer.querySelectorAll(
        "[data-rating]"
      )
    );


  function paintStars(rating) {
    starButtons.forEach((button) => {
      const buttonRating =
        Number(
          button.dataset.rating
        );

      button.classList.toggle(
        "active",
        buttonRating <= rating
      );
    });
  }


  starButtons.forEach((button) => {

    button.addEventListener(
      "mouseenter",
      function () {
        paintStars(
          Number(
            this.dataset.rating
          )
        );
      }
    );


    button.addEventListener(
      "click",
      function () {
        const selectedRating =
          Number(
            this.dataset.rating
          );

        ratingInput.value =
          selectedRating;

        paintStars(
          selectedRating
        );
      }
    );

  });


  starContainer.addEventListener(
    "mouseleave",
    function () {
      paintStars(
        Number(
          ratingInput.value || 0
        )
      );
    }
  );


  paintStars(
    Number(
      ratingInput.value || 0
    )
  );
}


/* =========================================================
   SAVE OR UPDATE REVIEW
========================================================= */

function initProductReviewForm(section) {
  const form =
    section.querySelector(
      "#productReviewForm"
    );

  if (!form) {
    return;
  }

  const submitButton =
    form.querySelector(
      "#reviewSubmitBtn"
    );

  const submitText =
    form.querySelector(
      ".review-submit-text"
    );

  const submitLoading =
    form.querySelector(
      ".review-submit-loading"
    );


  function clearErrors() {
    form
      .querySelectorAll(
        ".review-field-error"
      )
      .forEach((element) => {
        element.textContent = "";
      });

    form
      .querySelectorAll(
        ".is-invalid"
      )
      .forEach((element) => {
        element.classList.remove(
          "is-invalid"
        );
      });
  }


  function showErrors(errors) {
    Object.entries(
      errors || {}
    ).forEach(
      ([field, messages]) => {

        const input =
          form.elements[field];

        const errorElement =
          form.querySelector(
            `[data-review-error="${field}"]`
          );

        input?.classList.add(
          "is-invalid"
        );

        if (errorElement) {
          errorElement.textContent =
            Array.isArray(messages)
              ? messages[0]
              : messages;
        }
      }
    );
  }


  function setLoading(loading) {
    if (!submitButton) {
      return;
    }

    submitButton.disabled =
      loading;

    submitText?.classList.toggle(
      "d-none",
      loading
    );

    submitLoading?.classList.toggle(
      "d-none",
      !loading
    );
  }


  form.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      clearErrors();

      const ratingInput =
        form.elements.rating;

      if (!ratingInput?.value) {
        showErrors({
          rating: [
            "Please select your rating."
          ],
        });

        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          form.action,
          {
            method: "POST",

            headers: {
              "X-Requested-With":
                "XMLHttpRequest",
            },

            body: new FormData(form),
          }
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success === false
        ) {
          showErrors(
            data.errors
          );

          throw new Error(
            data.message ||
              "Unable to save review."
          );
        }

        renderSavedReview(
          section,
          data.review
        );

        updateReviewSummary(
          section,
          data.summary
        );

        showReviewNotification(
          "success",
          data.message
        );

      } catch (error) {
        showReviewNotification(
          "error",
          error.message
        );

      } finally {
        setLoading(false);
      }
    }
  );
}


/* =========================================================
   RENDER SAVED REVIEW
========================================================= */

function renderSavedReview(
  section,
  review
) {
  const reviewList =
    section.querySelector(
      "#customerReviewList"
    );

  if (
    !reviewList ||
    !review
  ) {
    return;
  }

  section
    .querySelector(
      "#reviewEmptyState"
    )
    ?.remove();

  const existingReview =
    section.querySelector(
      `#review-item-${review.id}`
    );

  const stars = Array.from({
    length: 5,
  })
    .map(
      (_, index) =>
        `<i class="bi ${
          index < review.rating
            ? "bi-star-fill"
            : "bi-star"
        }"></i>`
    )
    .join("");


  const avatar = review.profile_image
    ? `
      <img
        src="${escapeHTML(
          review.profile_image
        )}"
        alt="${escapeHTML(
          review.username
        )}"
      >
    `
    : `
      <span>
        ${escapeHTML(
          review.username
            .charAt(0)
            .toUpperCase()
        )}
      </span>
    `;


  const verified = (
    review.is_verified_purchase
  )
    ? `
      <span class="verified-review-text">
        <i class="bi bi-patch-check-fill"></i>
        Verified Purchase
      </span>
    `
    : "";


  const reviewHTML = `
    <article
      class="customer-review-item"
      id="review-item-${review.id}"
      data-review-rating="${review.rating}"
      data-review-date="${Date.now()}"
    >

      <div class="customer-review-avatar">
        ${avatar}
      </div>

      <div class="customer-review-content">

        <div class="customer-review-top">

          <div>

            <strong>
              ${escapeHTML(
                review.username
              )}
            </strong>

            <div class="customer-review-meta">

              <div class="review-static-stars">
                ${stars}
              </div>

              <span>
                ${escapeHTML(
                  review.created_at
                )}
              </span>

              ${verified}

            </div>

          </div>

        </div>

        ${
          review.title
            ? `
              <h4>
                ${escapeHTML(
                  review.title
                )}
              </h4>
            `
            : ""
        }

        <p>
          ${escapeHTML(
            review.comment
          )}
        </p>

      </div>

    </article>
  `;


  if (existingReview) {
    existingReview.outerHTML =
      reviewHTML;

  } else {
    reviewList.insertAdjacentHTML(
      "afterbegin",
      reviewHTML
    );
  }
}


/* =========================================================
   UPDATE REVIEW SUMMARY
========================================================= */

function updateReviewSummary(
  section,
  summary
) {
  if (!summary) {
    return;
  }

  const averageElements = [
    section.querySelector(
      "#productAverageRating"
    ),

    section.querySelector(
      "#ratingSummaryAverage"
    ),
  ];

  averageElements.forEach(
    (element) => {
      if (element) {
        element.textContent =
          Number(
            summary.average_rating
          ).toFixed(1);
      }
    }
  );


  const countElements = [
    section.querySelector(
      "#productTotalReviews"
    ),

    section.querySelector(
      "#ratingSummaryCount"
    ),
  ];

  countElements.forEach(
    (element) => {
      if (element) {
        element.textContent =
          summary.total_reviews;
      }
    }
  );


  for (
    let rating = 1;
    rating <= 5;
    rating += 1
  ) {
    const bar =
      section.querySelector(
        `[data-rating-bar="${rating}"]`
      );

    const count =
      section.querySelector(
        `[data-rating-count="${rating}"]`
      );

    if (bar) {
      bar.style.width =
        `${
          summary
            .rating_percentages[
              rating
            ] || 0
        }%`;
    }

    if (count) {
      count.textContent =
        summary.rating_counts[
          rating
        ] || 0;
    }
  }
}


/* =========================================================
   DELETE OWN REVIEW
========================================================= */

function initReviewDelete(section) {
  const deleteButton =
    section.querySelector(
      "#deleteOwnReviewBtn"
    );

  if (!deleteButton) {
    return;
  }

  deleteButton.addEventListener(
    "click",
    async function () {
      const confirmed =
        await confirmReviewDeletion();

      if (!confirmed) {
        return;
      }

      try {
        const response = await fetch(
          deleteButton.dataset.url,
          {
            method: "POST",

            headers: {
              "X-Requested-With":
                "XMLHttpRequest",

              "X-CSRFToken":
                getCSRFToken(),
            },
          }
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success === false
        ) {
          throw new Error(
            data.message ||
              "Unable to delete review."
          );
        }

        section
          .querySelector(
            `#review-item-${data.deleted_id}`
          )
          ?.remove();

        updateReviewSummary(
          section,
          data.summary
        );

        document
          .getElementById(
            "productReviewForm"
          )
          ?.reset();

        deleteButton.remove();

        showReviewNotification(
          "success",
          data.message
        );

      } catch (error) {
        showReviewNotification(
          "error",
          error.message
        );
      }
    }
  );
}


async function confirmReviewDeletion() {
  if (
    typeof Swal !==
    "undefined"
  ) {
    const result =
      await Swal.fire({
        title: "Delete your review?",
        text: (
          "This review will be removed permanently."
        ),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc2626",
      });

    return result.isConfirmed;
  }

  return window.confirm(
    "Delete your review?"
  );
}


/* =========================================================
   REVIEW SORTING
========================================================= */

function initReviewSorting(section) {
  const select =
    section.querySelector(
      "#reviewSortSelect"
    );

  const list =
    section.querySelector(
      "#customerReviewList"
    );

  if (
    !select ||
    !list
  ) {
    return;
  }

  select.addEventListener(
    "change",
    function () {
      const reviews =
        Array.from(
          list.querySelectorAll(
            ".customer-review-item"
          )
        );

      reviews.sort(
        (first, second) => {
          const firstRating =
            Number(
              first.dataset
                .reviewRating
            );

          const secondRating =
            Number(
              second.dataset
                .reviewRating
            );

          const firstDate =
            Number(
              first.dataset.reviewDate
            );

          const secondDate =
            Number(
              second.dataset.reviewDate
            );

          if (
            select.value ===
            "highest"
          ) {
            return (
              secondRating -
              firstRating
            );
          }

          if (
            select.value ===
            "lowest"
          ) {
            return (
              firstRating -
              secondRating
            );
          }

          return (
            secondDate -
            firstDate
          );
        }
      );

      reviews.forEach(
        (review) => {
          list.appendChild(review);
        }
      );
    }
  );
}


/* =========================================================
   REVIEW NOTIFICATION
========================================================= */

function showReviewNotification(
  type,
  message
) {
  if (
    typeof showToast ===
    "function"
  ) {
    showToast(
      type,
      message
    );

    return;
  }

  if (
    typeof Swal !==
    "undefined"
  ) {
    Swal.fire({
      icon: type,
      text: message,
      confirmButtonColor: "#2563eb",
    });

    return;
  }

  alert(message);
}

/* =========================================================
   REUSABLE VELORA PRODUCT CARDS
========================================================= */

function initUnifiedProductCards() {
  const cards = document.querySelectorAll(
    "[data-product-card]"
  );

  if (!cards.length) {
    return;
  }

  cards.forEach((card) => {
    if (card.dataset.bound === "true") {
      return;
    }

    card.dataset.bound = "true";

    const timer =
      card.querySelector(
        "[data-product-deal-timer]"
      );

    if (timer) {
      initUnifiedCardCountdown(
        timer
      );
    }
  });
}


/* =========================================================
   PRODUCT CARD COUNTDOWN
========================================================= */

function initUnifiedCardCountdown(timer) {
  const endDateValue =
    timer.dataset.dealEnd;

  const countdown =
    timer.querySelector(
      "[data-deal-countdown]"
    );

  if (
    !endDateValue ||
    !countdown
  ) {
    timer.remove();
    return;
  }

  const endDate =
    new Date(endDateValue);

  if (
    Number.isNaN(
      endDate.getTime()
    )
  ) {
    timer.remove();
    return;
  }


  function updateCountdown() {
    const distance =
      endDate.getTime() -
      Date.now();

    if (distance <= 0) {
      timer.remove();
      return false;
    }

    const days =
      Math.floor(
        distance /
        (1000 * 60 * 60 * 24)
      );

    const hours =
      Math.floor(
        (
          distance %
          (1000 * 60 * 60 * 24)
        ) /
        (1000 * 60 * 60)
      );

    const minutes =
      Math.floor(
        (
          distance %
          (1000 * 60 * 60)
        ) /
        (1000 * 60)
      );

    const seconds =
      Math.floor(
        (
          distance %
          (1000 * 60)
        ) /
        1000
      );

    countdown.textContent =
      `${String(days).padStart(2, "0")}:` +
      `${String(hours).padStart(2, "0")}:` +
      `${String(minutes).padStart(2, "0")}:` +
      `${String(seconds).padStart(2, "0")}`;

    return true;
  }


  if (!updateCountdown()) {
    return;
  }

  const countdownInterval =
    window.setInterval(
      function () {
        const active =
          updateCountdown();

        if (!active) {
          window.clearInterval(
            countdownInterval
          );
        }
      },
      1000
    );
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("form[data-ajax-form]").forEach((form) => {
    if (form.dataset.ajaxInitialized === "true") {
      return;
    }

    form.dataset.ajaxInitialized = "true";

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const submitButton = form.querySelector(
        'button[type="submit"]'
      );

      const originalButtonHtml = submitButton
        ? submitButton.innerHTML
        : "";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = `
          <span class="spinner-border spinner-border-sm me-2"></span>
          Processing...
        `;
      }

      try {
        const response = await fetch(form.action, {
          method: form.method || "POST",
          body: new FormData(form),
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Something went wrong."
          );
        }

        const modalElement = form.closest(".modal");

        if (
          modalElement &&
          form.dataset.closeModal === "true"
        ) {
          const modalInstance =
            bootstrap.Modal.getInstance(modalElement) ||
            bootstrap.Modal.getOrCreateInstance(modalElement);

          modalInstance.hide();
        }

        if (form.dataset.reset === "true") {
          form.reset();

          form.querySelectorAll(".image-preview").forEach(
            (preview) => {
              preview.removeAttribute("src");
              preview.style.display = "none";
            }
          );
        }

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message || "Saved successfully.",
          timer: 1600,
          showConfirmButton: false,
        });

        if (data.reload_required) {
          window.location.reload();
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Request failed.",
        });
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonHtml;
        }
      }
    });
  });
});

function initAjaxForms() {
  document.querySelectorAll("form[data-ajax-form]").forEach((form) => {
    if (form.dataset.ajaxBound === "true") {
      return;
    }

    form.dataset.ajaxBound = "true";

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const submitButton = form.querySelector(
        'button[type="submit"]'
      );

      const originalButtonContent = submitButton
        ? submitButton.innerHTML
        : "";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = `
          <span
            class="spinner-border spinner-border-sm me-2"
            role="status"
          ></span>
          Processing...
        `;
      }

      try {
        const response = await fetch(form.action, {
          method: form.method || "POST",
          body: new FormData(form),
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
          credentials: "same-origin",
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
          throw new Error(
            data.message || "Unable to process the request."
          );
        }

        const modalElement = form.closest(".modal");

        if (
          modalElement &&
          form.dataset.closeModal === "true"
        ) {
          const modal =
            bootstrap.Modal.getInstance(modalElement) ||
            bootstrap.Modal.getOrCreateInstance(modalElement);

          modal.hide();
        }

        if (form.dataset.reset === "true") {
          form.reset();
        }

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message || "Saved successfully.",
          timer: 1500,
          showConfirmButton: false,
        });

        if (data.reload_required) {
          window.location.href = window.location.href;
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Something went wrong.",
        });
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonContent;
        }
      }
    });
  });
}

document.addEventListener(
  "DOMContentLoaded",
  initAjaxForms
);