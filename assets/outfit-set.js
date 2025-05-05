document.addEventListener("DOMContentLoaded", function () {
  // state management for all products
  const productState = {};

  // calculate total price for a single product
  function calculateProductTotal(productId) {
    const product = productState[productId];
    if (!product) return 0;

    const variantSelect = document.querySelector(
      `.outfit-product-select[data-product-id="${productId}"]`
    );
    const selectedOption = variantSelect.options[variantSelect.selectedIndex];
    const price = parseInt(selectedOption.dataset.price);

    return price * product.quantity;
  }

  // update total price display for a product
  function updateProductTotal(productId) {
    // Update outfit view
    const outfitTotalElement = document.querySelector(
      `.outfit-product-total-price[data-product-id="${productId}"]`
    );
    if (outfitTotalElement) {
      const total = calculateProductTotal(productId);
      const formattedTotal = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(total / 100);
      outfitTotalElement.textContent = formattedTotal;
    }

    // update product view
    const productIndex = productState[productId]?.index;
    if (productIndex) {
      const productTotalElement = document.querySelector(
        `#product-${productIndex} .outfit-product-total-price[data-product-id="${productId}"]`
      );
      if (productTotalElement) {
        const total = calculateProductTotal(productId);
        const formattedTotal = new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
        }).format(total / 100);
        productTotalElement.textContent = formattedTotal;
      }
    }
  }

  // handle UI changes and update product state
  function handleProductChange(productId, changes) {
    if (productState[productId]) {
      // update price when variant changes
      if (changes.variantId) {
        const variantSelect = document.querySelector(
          `.outfit-product-select[data-product-id="${productId}"]`
        );
        const selectedOption =
          variantSelect.options[variantSelect.selectedIndex];
        changes.price = parseInt(selectedOption.dataset.price);
      }

      productState[productId] = {
        ...productState[productId],
        ...changes,
      };
      updateUIFromState(productId);
    }
  }

  // Initialize state for each product
  function initializeProductState() {
    const checkboxes = document.querySelectorAll(
      ".outfit-product-checkbox input"
    );
    checkboxes.forEach((checkbox) => {
      const productId = checkbox.dataset.productId;
      const productIndex = checkbox.dataset.productIndex;
      const variantSelect = document.querySelector(
        `.outfit-product-select[data-product-id="${productId}"]`
      );
      const selectedOption = variantSelect.options[variantSelect.selectedIndex];

      productState[productId] = {
        id: productId,
        index: productIndex,
        selected: checkbox.checked,
        variantId: variantSelect.value,
        quantity: parseInt(
          document.querySelector(
            `.quantity-input[data-product-id="${productId}"]`
          ).value
        ),
        price: parseInt(selectedOption.dataset.price),
      };

      // update pro
      updateUIFromState(productId);
    });

    updateCartTotal();
    updateCartButton();
  }

  // calculate total price for all selected products
  function calculateTotal() {
    let total = 0;

    Object.values(productState).forEach((product) => {
      if (product.selected) {
        total += product.price * product.quantity;
      }
    });

    return total;
  }

  // update cart button state and text
  function updateCartButton() {
    const addToCartButton = document.querySelector(".outfit-add-to-cart");
    const cartTextElement = addToCartButton.querySelector(".outfit-cart-text");
    const hasActiveProducts = Object.values(productState).some(
      (product) => product.selected
    );
    const translations = JSON.parse(addToCartButton.dataset.translations);

    addToCartButton.disabled = !hasActiveProducts;

    if (hasActiveProducts) {
      cartTextElement.textContent = translations.add_selection_to_cart;
    } else {
      cartTextElement.textContent = translations.no_products_selected;
    }
  }

  // update total price display in cart button
  function updateCartTotal() {
    const cartTotalElement = document.querySelector(".outfit-cart-total");
    const total = calculateTotal();
    const formattedTotal = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(total / 100);
    cartTotalElement.textContent = formattedTotal;
  }

  // update UI elements based on current state
  function updateUIFromState(productId = null) {
    // if a productId is passed, update only that product
    const productsToUpdate = productId
      ? [productState[productId]]
      : Object.values(productState);

    productsToUpdate.forEach((product) => {
      if (!product) return;

      // outfit view elements
      const outfitCheckbox = document.querySelector(
        `.outfit-product-checkbox input[data-product-id="${product.id}"][data-product-index="${product.index}"]`
      );
      const outfitVariantSelect = document.querySelector(
        `.outfit-product-select[data-product-id="${product.id}"]`
      );
      const outfitQuantityInput = document.querySelector(
        `.quantity-input[data-product-id="${product.id}"]`
      );
      const outfitProductItem = outfitCheckbox?.closest(".outfit-product-item");

      // Product view elements
      const productCheckbox = document.querySelector(
        `#product-${product.index} .outfit-product-checkbox input[data-product-id="${product.id}"]`
      );
      const productVariantSelect = document.querySelector(
        `#product-${product.index} .outfit-product-select[data-product-id="${product.id}"]`
      );
      const productQuantityInput = document.querySelector(
        `#product-${product.index} .quantity-input[data-product-id="${product.id}"]`
      );
      const productItem = productCheckbox?.closest(".outfit-product-item");

      // update checkboxes
      if (outfitCheckbox) outfitCheckbox.checked = product.selected;
      if (productCheckbox) productCheckbox.checked = product.selected;

      // update variant selection
      if (outfitVariantSelect) {
        outfitVariantSelect.value = product.variantId;
        outfitVariantSelect.disabled = !product.selected;
      }
      if (productVariantSelect) {
        productVariantSelect.value = product.variantId;
        productVariantSelect.disabled = !product.selected;
      }

      // update quantities
      if (outfitQuantityInput) {
        outfitQuantityInput.value = product.quantity;
        outfitQuantityInput.disabled = !product.selected;
      }
      if (productQuantityInput) {
        productQuantityInput.value = product.quantity;
        productQuantityInput.disabled = !product.selected;
      }

      // update disabled state
      if (outfitProductItem)
        outfitProductItem.classList.toggle("disabled", !product.selected);
      if (productItem)
        productItem.classList.toggle("disabled", !product.selected);

      // update total price for product
      updateProductTotal(product.id);
    });

    // only update cart total and button if all products are updated
    if (!productId) {
      updateCartTotal();
      updateCartButton();
    }
  }

  // setup checkbox event listeners
  function setupCheckboxListeners() {
    document
      .querySelectorAll(".outfit-product-checkbox input")
      .forEach((checkbox) => {
        checkbox.addEventListener("change", function () {
          handleProductChange(this.dataset.productId, {
            selected: this.checked,
          });
        });
      });
  }

  // setup select event listeners
  function setupSelectListeners() {
    document.querySelectorAll(".outfit-product-select").forEach((select) => {
      select.addEventListener("change", function () {
        handleProductChange(this.dataset.productId, {
          variantId: this.value,
        });
      });
    });
  }

  // setup quantity input event listeners
  function setupQuantityListeners() {
    document.querySelectorAll(".quantity-input").forEach((input) => {
      input.addEventListener("change", function () {
        handleProductChange(this.dataset.productId, {
          quantity: parseInt(this.value),
        });
      });
      input.addEventListener("input", function () {
        handleProductChange(this.dataset.productId, {
          quantity: parseInt(this.value),
        });
      });
    });
  }

  // setup product view event listeners
  function setupProductViewListeners() {
    document.querySelectorAll(".product-tab-content").forEach((tab) => {
      const productId = tab.querySelector(".outfit-product-checkbox input")
        ?.dataset.productId;
      if (productId) {
        const checkbox = tab.querySelector(".outfit-product-checkbox input");
        const select = tab.querySelector(".outfit-product-select");
        const quantityInput = tab.querySelector(".quantity-input");

        if (checkbox) {
          checkbox.addEventListener("change", function () {
            handleProductChange(productId, {
              selected: this.checked,
            });
          });
        }

        if (select) {
          select.addEventListener("change", function () {
            handleProductChange(productId, {
              variantId: this.value,
            });
          });
        }

        if (quantityInput) {
          quantityInput.addEventListener("change", function () {
            handleProductChange(productId, {
              quantity: parseInt(this.value),
            });
          });
          quantityInput.addEventListener("input", function () {
            handleProductChange(productId, {
              quantity: parseInt(this.value),
            });
          });
        }
      }
    });
  }

  // setup cart button event listener
  function setupCartButtonListener() {
    const addToCartButton = document.querySelector(".outfit-add-to-cart");
    if (addToCartButton) {
      const translations = JSON.parse(addToCartButton.dataset.translations);

      addToCartButton.addEventListener("click", async function () {
        const items = [];

        Object.values(productState).forEach((product) => {
          if (product.selected) {
            items.push({
              id: product.variantId,
              quantity: product.quantity,
            });
          }
        });

        // if there are any items to add, add them to the cart
        if (items.length > 0) {
          try {
            // apply loading state to button
            addToCartButton.classList.add("loading");
            addToCartButton.disabled = true;
            addToCartButton.querySelector(".outfit-cart-text").textContent =
              translations.adding_to_cart;

            const response = await fetch("/cart/add.js", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ items: items }),
            });

            const data = await response.json();

            if (response.ok) {
              // remove loading state and apply success state
              addToCartButton.classList.remove("loading");
              addToCartButton.classList.add("success");
              addToCartButton.querySelector(".outfit-cart-text").textContent =
                translations.successfully_added;

              // reset state
              Object.keys(productState).forEach((productId) => {
                if (productState[productId].selected) {
                  productState[productId] = {
                    ...productState[productId],
                    quantity: 1,
                  };
                }
              });

              // update UI
              updateUIFromState();

              // update button to redirect state
              addToCartButton.classList.remove("success");
              addToCartButton.classList.add("loading");
              addToCartButton.querySelector(".outfit-cart-text").textContent =
                translations.redirecting_to_cart;

              // redirect to cart after 1 second
              setTimeout(() => {
                window.location.href = "/cart";
              }, 1000);
            } else {
              throw new Error(translations.error_occurred);
            }
          } catch (error) {
            console.error("Error:", error);
            addToCartButton.classList.remove("loading");
            addToCartButton.classList.add("error");
            addToCartButton.querySelector(".outfit-cart-text").textContent =
              translations.error_occurred;

            // set error state after 5 seconds
            setTimeout(() => {
              addToCartButton.classList.remove("error");
              addToCartButton.querySelector(".outfit-cart-text").textContent =
                translations.add_selection_to_cart;
              addToCartButton.disabled = false;
            }, 5000);
          }
        }
      });
    }
  }

  // set up event listeners for all UI elements
  function setupEventListeners() {
    setupCheckboxListeners();
    setupSelectListeners();
    setupQuantityListeners();
    setupProductViewListeners();
    setupCartButtonListener();
  }

  // initialize
  initializeProductState();
  setupEventListeners();
  updateUIFromState();
});
