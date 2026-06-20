function ModelPage() {
  var config = window.productModel;
  var h = React.createElement;
  var imageState = React.useState(0);
  var currentImage = imageState[0];
  var setCurrentImage = imageState[1];
  var zoomState = React.useState(false);
  var isZoomOpen = zoomState[0];
  var setIsZoomOpen = zoomState[1];

  React.useEffect(function () {
    document.title = config.model + " Safe Locker | EAGLE SAFE";
    var description =
      config.model +
      " " +
      config.category +
      " safe locker for gold, jewellery, cash, documents, home security and business protection by EAGLE SAFE.";
    var metaDescription = document.querySelector('meta[name="description"]');

    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }

    metaDescription.setAttribute("content", description);
  }, []);

  function showPreviousImage() {
    setCurrentImage(function (image) {
      return image === 0 ? config.images.length - 1 : image - 1;
    });
  }

  function showNextImage() {
    setCurrentImage(function (image) {
      return (image + 1) % config.images.length;
    });
  }

  return h(
    React.Fragment,
    null,
    h(
      "header",
      { className: "page-header" },
      h("a", { className: "brand-link", href: "../../../index.html" }, "EAGLE SAFE"),
      h("a", { className: "back-link", href: "../../../product.html" }, "Back to Products")
    ),
    h(
      "main",
      { className: "model-page" },
      h("h1", { className: "model-title" }, config.model),
      h(
        "div",
        { className: "model-layout" },
        h(
          "section",
          {
            className: "gallery",
            "aria-label": config.model + " image gallery",
          },
          h(
            "div",
            { className: "gallery-frame" },
            h(
              "div",
              {
                className: "gallery-track",
                style: { transform: "translateX(-" + currentImage * 100 + "%)" },
              },
              config.images.map(function (image, index) {
                return h(
                  "div",
                  { className: "gallery-slide", key: image },
                  h("img", {
                    className: "gallery-image",
                    src: image,
                    alt: config.model + " product view " + (index + 1),
                    onError: function (event) {
                      event.currentTarget.style.display = "none";
                      event.currentTarget.parentElement.classList.add("image-missing");
                    },
                  })
                );
              })
            ),
            h(
              "button",
              {
                className: "zoom-button",
                type: "button",
                onClick: function () {
                  setIsZoomOpen(true);
                },
              },
              "Zoom"
            ),
            h(
              "button",
              {
                className: "gallery-button previous",
                type: "button",
                "aria-label": "Previous image",
                onClick: showPreviousImage,
              },
              "<"
            ),
            h(
              "button",
              {
                className: "gallery-button next",
                type: "button",
                "aria-label": "Next image",
                onClick: showNextImage,
              },
              ">"
            )
          ),
          h(
            "div",
            { className: "gallery-dots", "aria-label": "Choose image" },
            config.images.map(function (image, index) {
              return h("button", {
                className: "gallery-dot " + (currentImage === index ? "active" : ""),
                type: "button",
                key: image,
                "aria-label": "Show image " + (index + 1),
                onClick: function () {
                  setCurrentImage(index);
                },
              });
            })
          )
        ),
        h(
          "section",
          { className: "details-panel" },
          h("h2", { className: "details-title" }, "Specification"),
          h(
            "div",
            { className: "spec-list" },
            h(
              "div",
              { className: "spec-row" },
              h("span", { className: "spec-label" }, "Height"),
              h("span", { className: "spec-value" }, config.specs.height)
            ),
            h(
              "div",
              { className: "spec-row" },
              h("span", { className: "spec-label" }, "Width"),
              h("span", { className: "spec-value" }, config.specs.width)
            ),
            h(
              "div",
              { className: "spec-row" },
              h("span", { className: "spec-label" }, "Length"),
              h("span", { className: "spec-value" }, config.specs.length)
            ),
            h(
              "div",
              { className: "spec-row" },
              h("span", { className: "spec-label" }, "Weight"),
              h("span", { className: "spec-value" }, config.specs.weight || "1000 KG")
            ),
            h(
              "div",
              { className: "spec-row" },
              h("span", { className: "spec-label" }, "Model Type"),
              h("span", { className: "spec-value" }, config.modelType || "Defender Plus")
            )
          ),
          h("h3", { className: "lock-title" }, "Lock Types"),
          h(
            "ul",
            { className: "lock-list" },
            config.lockTypes.map(function (lockType) {
              return h("li", { key: lockType }, lockType);
            })
          ),
          h("h3", { className: "enquiry-title" }, "For Book or Enquiry"),
          h(
            "div",
            { className: "action-buttons" },
            h(
              "a",
              { className: "action-button call-button", href: "tel:+917431868611" },
              "Call +91 7431868611"
            ),
            h(
              "a",
              {
                className: "action-button whatsapp-button",
                href:
                  "https://wa.me/919382865054?text=" +
                  encodeURIComponent("I Want to Know More About Model " + config.model),
                target: "_blank",
                rel: "noreferrer",
              },
              "Whatsapp 9382865054"
            )
          )
        )
      )
    ),
    h(
      "div",
      { className: "zoom-overlay", hidden: !isZoomOpen },
      h(
        "button",
        {
          className: "zoom-close",
          type: "button",
          "aria-label": "Close image",
          onClick: function () {
            setIsZoomOpen(false);
          },
        },
        "x"
      ),
      h("img", {
        className: "zoom-image",
        src: config.images[currentImage],
        alt: "Large " + config.model + " product view " + (currentImage + 1),
      })
    )
  );
}

var root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(ModelPage));
