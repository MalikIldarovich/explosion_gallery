const defaultOptions = {
    linkClass: ".card",
    linkImageClass: ".cardImage",
};

const explosionClassName = "explosion";
const explosionOpenedClassName = "explosion_Opened";
const explosionOpeningClassName = "explosion_Opening";

const explosionSummaryClassName = "explosionSummary";
const explosionControlsClassName = "explosionControls";
const explosionImagesClassName = "explosionImages";

const explosionSummaryContentClassName = "explosionSummaryContent";
const explosionTitleClassName = "explosionTitle";
const explosionDescriptionClassName = "explosionDescription";
const explosionImageClassName = "explosionImage";

const explosionCloseClassName = "explosionClose";
const explosionNavsClassName = "explosionNavs";

const explosionNavClassName = "explosionNav";
const explosionNavPrevClassName = "explosionNavPrev";
const explosionNavNextClassName = "explosionNavNext";
const explosionCouterClassName = "explosionCounter";
const explosionNavDisabledClassName = "explosionNavDisabled";

const explosionPrevHiddenImageClassName = "explosionImage_PrevHidden";
const explosionPrevShowingImageClassName = "explosionImage_PrevShowing";
const explosionActiveImageClassName = "explosionImage_Active";
const explosionNextShowingImageClassName = "explosionImage_NextShowing";
const explosionNextHiddenImageClassName = "explosionImage_NextHidden";

class ExplositionGallery {
    constructor(elementNode, newOptions) {
        this.containerNode = elementNode;
        this.options = {
            ...defaultOptions,
            ...newOptions,
        };
        this.linkNodes = this.containerNode.querySelectorAll(
            this.options.linkClass
        );
        this.minWidth = 1023;
        this.minHeight = 600;
        this.padding = 2 * 16;
        this.showingCount = 4;
        this.currentIndex = 0;
        this.size = this.linkNodes.length;

        this.initDialog();
        this.events();
    }

    initDialog() {
        this.dialogContainerNode = document.createElement("div");
        this.dialogContainerNode.className = explosionClassName;
        this.dialogContainerNode.innerHTML = `
            <div class="${explosionSummaryClassName}">
                <div class="${explosionSummaryContentClassName}">
                    <h2 class="${explosionTitleClassName}"></h2>
                    <p class="${explosionDescriptionClassName}"></p>
                </div>
            </div>
            <div class="${explosionControlsClassName}">
                <button class="${explosionCloseClassName}"></button>
                <div class="${explosionNavsClassName}">
                    <button class="${explosionNavClassName} ${explosionNavPrevClassName}"></button>
                    <div class="${explosionCouterClassName}">
                        1/${this.size}
                    </div>
                    <button class="${explosionNavClassName} ${explosionNavNextClassName}"></button>
                </div>
            </div>
            <div class="${explosionImagesClassName}">
                ${Array.from(this.linkNodes)
                    .map(
                        (linkNode) =>
                            `<img
                            src="${linkNode.getAttribute("href")}"
                            alt="${linkNode.dataset.title}"
                            class="${explosionImageClassName}"
                            data-title="${linkNode.dataset.title}"
                            data-description="${linkNode.dataset.description}"
                        >`
                    )
                    .join("")}
                </div>
            </div>
        `;

        document.body.appendChild(this.dialogContainerNode);
        this.explosionImageNodes = this.dialogContainerNode.querySelectorAll(
            `.${explosionImageClassName}`
        );
        this.explosionControls = this.dialogContainerNode.querySelector(
            `.${explosionControlsClassName}`
        );
        this.explosionNavPrevNode = this.dialogContainerNode.querySelector(
            `.${explosionNavPrevClassName}`
        );
        this.explosionNavNextNode = this.dialogContainerNode.querySelector(
            `.${explosionNavNextClassName}`
        );
        this.explosionCouterNode = this.dialogContainerNode.querySelector(
            `.${explosionCouterClassName}`
        );
        this.explosionTitleNode = this.dialogContainerNode.querySelector(
            `.${explosionTitleClassName}`
        );
        this.explosionDescriptionNode = this.dialogContainerNode.querySelector(
            `.${explosionDescriptionClassName}`
        );
        this.explosionSummaryNode = this.dialogContainerNode.querySelector(
            `.${explosionSummaryClassName}`
        );
        this.explosionNavsNode = this.dialogContainerNode.querySelector(
            `.${explosionNavsClassName}`
        );
        this.explosionSummaryContentNode =
            this.dialogContainerNode.querySelector(
                `.${explosionSummaryContentClassName}`
            );
        this.explosionCloseNode = this.dialogContainerNode.querySelector(
            `.${explosionCloseClassName}`
        );
    }
    actviateGallery = (event) => {
        event.preventDefault();
        const linkNode = event.target.closest("a");
        if (
            !linkNode ||
            this.dialogContainerNode.classList.contains(
                explosionOpeningClassName
            ) ||
            this.dialogContainerNode.classList.contains(
                explosionOpenedClassName
            )
        )
            return;
        this.currentIndex = Array.from(this.linkNodes).findIndex(
            (item) => linkNode === item
        );
        this.dialogContainerNode.classList.add(explosionOpeningClassName);
        fadeIn(this.dialogContainerNode, () => {
            this.dialogContainerNode.classList.remove(
                explosionOpeningClassName
            );
            this.dialogContainerNode.classList.add(explosionOpenedClassName);
            this.switchChanges();
        });

        this.setInitSizesToImages();
        this.setInitPositionsToImages();
    };
    setInitSizesToImages() {
        this.linkNodes.forEach((linkNode, index) => {
            const data = linkNode.getBoundingClientRect();
            this.explosionImageNodes[index].style.width = data.width + "px";
            this.explosionImageNodes[index].style.height = data.height + "px";
        });
    }
    setInitPositionsToImages() {
        this.linkNodes.forEach((linkNode, index) => {
            const data = linkNode.getBoundingClientRect();
            this.setPositionStyles(
                this.explosionImageNodes[index],
                data.left,
                data.top
            );
        });
    }
    setPositionStyles(element, x, y) {
        element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(
            1
        )}px, 0)`;
    }
    switchChanges(hasAmination) {
        this.setCurrentState();
        this.switchDisabledNav();
        this.changeCounter();
        this.changeSummary(hasAmination);
    }
    setCurrentState() {
        this.explosionPrevHiddenImages = [];
        this.explosionNextHiddenImages = [];
        this.explosionPrevShowingImages = [];
        this.explosionNextShowingImages = [];
        this.explosionActiveImages = [];

        this.explosionImageNodes.forEach((imageNode, index) => {
            if (index + this.showingCount < this.currentIndex) {
                this.explosionPrevHiddenImages.unshift(imageNode);
            } else if (index < this.currentIndex) {
                this.explosionPrevShowingImages.unshift(imageNode);
            } else if (index === this.currentIndex) {
                this.explosionActiveImages.push(imageNode);
            } else if (index <= this.currentIndex + this.showingCount) {
                this.explosionNextShowingImages.push(imageNode);
            } else {
                this.explosionNextHiddenImages.push(imageNode);
                imageNode.style.opacity = 0;
            }
        });

        this.setGalleryStyles();
    }
    setGalleryStyles() {
        const imageWidth = this.linkNodes[0].offsetWidth;
        const imageHeight = this.linkNodes[0].offsetHeight;
        const dialogWidth = Math.max(this.minWidth, window.innerWidth);
        const dialogHeight = Math.max(this.minHeight, window.innerHeight);
        this.explosionPrevHiddenImages.forEach((node) => {
            this.setImageStyles(node, {
                top: -dialogHeight,
                left: 0.31 * dialogWidth,
                opacity: 0.1,
                zIndex: 1,
                scale: 0.4,
            });
        });
        this.setImageStyles(this.explosionPrevShowingImages[0], {
            top: 1.5 * (dialogHeight - imageHeight),
            left: 0.26 * dialogWidth,
            opacity: 0.4,
            zIndex: 4,
            scale: 0.75,
        });
        this.setImageStyles(this.explosionPrevShowingImages[1], {
            top: 0.405 * dialogHeight,
            left: 0.08 * dialogWidth,
            opacity: 0.3,
            zIndex: 3,
            scale: 0.6,
        });
        this.setImageStyles(this.explosionPrevShowingImages[2], {
            top: 0.05 * dialogHeight,
            left: 0.15 * dialogWidth,
            opacity: 0.2,
            zIndex: 2,
            scale: 0.5,
        });
        this.setImageStyles(this.explosionPrevShowingImages[3], {
            top: -0.245 * dialogHeight,
            left: 0.26 * dialogWidth,
            opacity: 0.1,
            zIndex: 1,
            scale: 0.4,
        });
        this.explosionActiveImages.forEach((node) => {
            this.setImageStyles(node, {
                top: (dialogHeight - imageHeight) / 2,
                left: (dialogWidth - imageWidth) / 2,
                opacity: 1,
                zIndex: 5,
                scale: 1.2,
            });
        });
        this.setImageStyles(this.explosionNextShowingImages[0], {
            top: -0.2 * dialogHeight,
            left: 0.5 * dialogWidth,
            opacity: 0.4,
            zIndex: 4,
            scale: 0.75,
        });
        this.setImageStyles(this.explosionNextShowingImages[1], {
            top: 0.12 * dialogHeight,
            left: 0.68 * dialogWidth,
            opacity: 0.3,
            zIndex: 3,
            scale: 0.6,
        });
        this.setImageStyles(this.explosionNextShowingImages[2], {
            top: 0.47 * dialogHeight,
            left: 0.61 * dialogWidth,
            opacity: 0.2,
            zIndex: 2,
            scale: 0.5,
        });
        this.setImageStyles(this.explosionNextShowingImages[3], {
            top: 0.72 * dialogHeight,
            left: 0.485 * dialogWidth,
            opacity: 0.1,
            zIndex: 1,
            scale: 0.4,
        });
        this.setControlStyles(this.explosionControls, {
            marginTop: (dialogHeight - imageHeight * 1.2 + this.padding) / 2,
            height: imageHeight * 1.2,
        });
        this.explosionSummaryNode.style.width = "50%";
    }
    setImageStyles(element, { top, left, opacity, zIndex, scale }) {
        if (!element) return;
        element.style.opacity = opacity;
        element.style.transform = `translate3d(${left.toFixed(
            1
        )}px, ${top.toFixed(1)}px, 0) scale(${scale})`;
        element.style.zIndex = zIndex;
    }
    setControlStyles(element, { height, marginTop }) {
        if (!element) return;
        element.style.height = height + "px";
        element.style.marginTop = marginTop + "px";
    }
    switchDisabledNav() {
        if (this.currentIndex === 0 && !this.explosionNavPrevNode.disabled) {
            this.explosionNavPrevNode.disabled = true;
        }
        if (this.currentIndex > 0 && this.explosionNavPrevNode.disabled) {
            this.explosionNavPrevNode.disabled = false;
        }
        if (
            this.currentIndex === this.size - 1 &&
            !this.explosionNavNextNode.disabled
        ) {
            this.explosionNavNextNode.disabled = true;
        }
        if (
            this.currentIndex < this.size - 1 &&
            this.explosionNavNextNode.disabled
        ) {
            this.explosionNavNextNode.disabled = false;
        }
    }
    changeCounter() {
        this.explosionCouterNode.innerHTML = `${this.currentIndex + 1}/${
            this.size
        }`;
    }
    changeSummary(hasAmination) {
        const content = this.explosionImageNodes[this.currentIndex].dataset;

        if (hasAmination) {
            this.explosionSummaryContentNode.style.opacity = 0;
            setTimeout(() => {
                this.explosionTitleNode.innerHTML = content.title;
                this.explosionDescriptionNode.innerHTML = content.description;
                this.explosionSummaryContentNode.style.opacity = 1;
            }, 300);
        } else {
            this.explosionTitleNode.innerHTML = content.title;
            this.explosionDescriptionNode.innerHTML = content.description;
        }
    }
    switchImage = (event) => {
        event.preventDefault();

        const buttonNode = event.target.closest("button");
        console.log(event.target);
        if (!buttonNode) return;
        if (
            buttonNode.classList.contains(explosionNavPrevClassName) &&
            this.currentIndex > 0
        ) {
            this.currentIndex -= 1;
        }
        if (
            buttonNode.classList.contains(explosionNavNextClassName) &&
            this.currentIndex < this.size - 1
        ) {
            this.currentIndex += 1;
        }

        this.switchChanges(true);
    };
    closeGallery = () => {
        this.setInitPositionsToImages();
        this.explosionImageNodes.forEach((image) => (image.style.opacity = 1));
        this.explosionSummaryNode.style.width = "0%";
        this.explosionControls.style.marginTop = "1500px";

        setTimeout(() => {
            fadeOut(this.dialogContainerNode, () => {
                this.dialogContainerNode.classList.remove(
                    explosionOpenedClassName
                );
            });
        }, 400);
    };
    resize = () => {
        if (
            this.dialogContainerNode.classList.contains(
                explosionOpenedClassName
            )
        ) {
            this.setInitSizesToImages();
            this.setGalleryStyles();
        }
    };
    keyDown = (event) => {
        if (
            this.dialogContainerNode.classList.contains(
                explosionOpenedClassName
            )
        ) {
            if (
                event.key === "Escape" ||
                event.key === "Esc" ||
                event.keyCode === 27
            ) {
                this.closeGallery();
            }
        }
    };
    events() {
        this.trottleResize = throttle(this.resize, 200);
        window.addEventListener("resize", this.trottleResize);
        this.containerNode.addEventListener("click", this.actviateGallery);
        this.explosionNavsNode.addEventListener("click", this.switchImage);
        this.explosionCloseNode.addEventListener("click", this.closeGallery);
        window.addEventListener("keyup", this.keyDown);
    }
}

/**
 * Helpers
 */
function fadeIn(element, callback) {
    animation();

    function animation() {
        let opacity = Number(element.style.opacity);
        if (opacity < 1) {
            opacity = opacity + 0.1;
            element.style.opacity = opacity;
            window.requestAnimationFrame(animation);
            return;
        }

        if (callback) {
            callback();
        }
    }
}

function fadeOut(element, callback) {
    animation();

    function animation() {
        let opacity = Number(element.style.opacity);

        if (opacity > 0) {
            opacity = opacity - 0.04;
            element.style.opacity = opacity;
            window.requestAnimationFrame(animation);
            return;
        }

        if (callback) {
            callback();
        }
    }
}

function throttle(callback, delay = 200) {
    let isWaiting = false;
    let savedArgs = null;
    let savedThis = null;
    return function wrapper(...args) {
        if (isWaiting) {
            savedArgs = args;
            savedThis = this;
            return;
        }

        callback.apply(this, args);

        isWaiting = true;
        setTimeout(() => {
            isWaiting = false;
            if (savedThis) {
                wrapper.apply(savedThis, savedArgs);
                savedThis = null;
                savedArgs = null;
            }
        }, delay);
    };
}
