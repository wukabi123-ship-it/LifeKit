document.addEventListener("DOMContentLoaded", () => {

    const dropZone =
        document.getElementById("dropZone");

    const chooseImagesButton =
        document.getElementById("chooseImagesButton");

    const imageInput =
        document.getElementById("imageInput");

    const errorMessage =
        document.getElementById("errorMessage");

    const successMessage =
        document.getElementById("successMessage");

    const filePanel =
        document.getElementById("filePanel");

    const previewPanel =
        document.getElementById("previewPanel");

    const settingsPanel =
        document.getElementById("settingsPanel");

    const resultPanel =
        document.getElementById("resultPanel");

    const imageCount =
        document.getElementById("imageCount");

    const totalSize =
        document.getElementById("totalSize");

    const pdfPageCount =
        document.getElementById("pdfPageCount");

    const addMoreButton =
        document.getElementById("addMoreButton");

    const clearAllButton =
        document.getElementById("clearAllButton");

    const previewGrid =
        document.getElementById("previewGrid");

    const pageSize =
        document.getElementById("pageSize");

    const orientation =
        document.getElementById("orientation");

    const imageFit =
        document.getElementById("imageFit");

    const margin =
        document.getElementById("margin");

    const createPdfButton =
        document.getElementById("createPdfButton");

    const progressArea =
        document.getElementById("progressArea");

    const progressText =
        document.getElementById("progressText");

    const progressBar =
        document.getElementById("progressBar");

    const resultDetails =
        document.getElementById("resultDetails");

    const downloadButton =
        document.getElementById("downloadButton");

    const convertAnotherButton =
        document.getElementById("convertAnotherButton");


    let imageFiles = [];
    let pdfBlob = null;
    let pdfUrl = null;


    /* =========================
       BASIC HELPERS
    ========================= */

    function formatFileSize(bytes) {

        if (
            !Number.isFinite(bytes) ||
            bytes <= 0
        ) {
            return "0 Bytes";
        }

        const units = [
            "Bytes",
            "KB",
            "MB",
            "GB"
        ];

        const index = Math.min(
            Math.floor(
                Math.log(bytes) /
                Math.log(1024)
            ),
            units.length - 1
        );

        const value =
            bytes /
            Math.pow(1024, index);

        return `${value.toFixed(
            index === 0 ? 0 : 2
        )} ${units[index]}`;
    }


    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function wait(ms) {

        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }


    function showError(message) {

        errorMessage.textContent =
            message;

        errorMessage.classList.remove(
            "jpg-pdf-hidden"
        );

        successMessage.classList.add(
            "jpg-pdf-hidden"
        );
    }


    function hideError() {

        errorMessage.textContent = "";

        errorMessage.classList.add(
            "jpg-pdf-hidden"
        );
    }


    function showSuccess(message) {

        successMessage.textContent =
            message;

        successMessage.classList.remove(
            "jpg-pdf-hidden"
        );

        errorMessage.classList.add(
            "jpg-pdf-hidden"
        );
    }


    function hideSuccess() {

        successMessage.textContent = "";

        successMessage.classList.add(
            "jpg-pdf-hidden"
        );
    }


    function clearPdfUrl() {

        if (pdfUrl) {

            URL.revokeObjectURL(
                pdfUrl
            );

            pdfUrl = null;
        }

        pdfBlob = null;
    }


    function getBaseName(filename) {

        return filename
            .replace(/\.[^/.]+$/, "")
            .replace(/[\\/:*?"<>|]/g, "_");
    }


    /* =========================
       IMAGE VALIDATION
    ========================= */

    function isJpg(file) {

        if (!file) {
            return false;
        }

        const extension =
            /\.(jpg|jpeg)$/i.test(
                file.name
            );

        const mime =
            file.type === "image/jpeg";

        return extension || mime;
    }


    /* =========================
       IMAGE LIST
    ========================= */

    function addImages(files) {

        hideError();
        hideSuccess();

        if (!files || !files.length) {
            return;
        }

        const incoming =
            Array.from(files);

        const validFiles = [];
        const invalidFiles = [];

        incoming.forEach(file => {

            if (isJpg(file)) {

                validFiles.push(file);

            } else {

                invalidFiles.push(file);
            }
        });


        if (invalidFiles.length) {

            showError(
                `${invalidFiles.length} file${invalidFiles.length === 1 ? "" : "s"} skipped. Only JPG and JPEG images are supported.`
            );
        }


        if (!validFiles.length) {
            return;
        }


        /*
         * Prevent accidental duplicate files
         * based on name + size + lastModified.
         */
        validFiles.forEach(file => {

            const duplicate =
                imageFiles.some(
                    existing =>
                        existing.name === file.name &&
                        existing.size === file.size &&
                        existing.lastModified === file.lastModified
                );

            if (!duplicate) {

                imageFiles.push(file);
            }
        });


        updateUI();
    }


    /* =========================
       REMOVE IMAGE
    ========================= */

    function removeImage(index) {

        if (
            index < 0 ||
            index >= imageFiles.length
        ) {
            return;
        }

        imageFiles.splice(
            index,
            1
        );

        updateUI();
    }


    /* =========================
       CLEAR ALL
    ========================= */

    function clearAll() {

        clearPdfUrl();

        imageFiles = [];

        imageInput.value = "";

        updateUI();

        resultPanel.classList.add(
            "jpg-pdf-hidden"
        );

        progressArea.classList.add(
            "jpg-pdf-hidden"
        );

        hideError();
        hideSuccess();
    }


    /* =========================
       UPDATE UI
    ========================= */

    function updateUI() {

        const count =
            imageFiles.length;

        const size =
            imageFiles.reduce(
                (sum, file) =>
                    sum + file.size,
                0
            );

        imageCount.textContent =
            count;

        totalSize.textContent =
            formatFileSize(size);

        pdfPageCount.textContent =
            count;


        if (count === 0) {

            filePanel.classList.add(
                "jpg-pdf-hidden"
            );

            previewPanel.classList.add(
                "jpg-pdf-hidden"
            );

            settingsPanel.classList.add(
                "jpg-pdf-hidden"
            );

            resultPanel.classList.add(
                "jpg-pdf-hidden"
            );

            previewGrid.innerHTML = "";

            return;
        }


        filePanel.classList.remove(
            "jpg-pdf-hidden"
        );

        previewPanel.classList.remove(
            "jpg-pdf-hidden"
        );

        settingsPanel.classList.remove(
            "jpg-pdf-hidden"
        );

        renderPreview();
    }


    /* =========================
       RENDER PREVIEW
    ========================= */

    function renderPreview() {

        previewGrid.innerHTML = "";

        imageFiles.forEach(
            (file, index) => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "jpg-pdf-image-card";

                card.draggable = true;

                card.dataset.index =
                    String(index);


                const imageUrl =
                    URL.createObjectURL(
                        file
                    );


                card.innerHTML = `
                    <img
                        src="${imageUrl}"
                        alt="Image ${index + 1}"
                    >

                    <div class="jpg-pdf-card-info">

                        <div class="jpg-pdf-card-top">

                            <span class="jpg-pdf-card-number">
                                ${index + 1}
                            </span>

                            <button
                                type="button"
                                class="jpg-pdf-remove"
                                data-remove="${index}"
                                aria-label="Remove image"
                            >
                                ×
                            </button>

                        </div>

                        <div class="jpg-pdf-file-name">
                            ${escapeHtml(file.name)}
                        </div>

                        <div class="jpg-pdf-file-size">
                            ${formatFileSize(file.size)}
                        </div>

                    </div>
                `;


                const removeButton =
                    card.querySelector(
                        "[data-remove]"
                    );


                removeButton.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        removeImage(
                            index
                        );
                    }
                );


                setupDragEvents(
                    card
                );


                previewGrid.appendChild(
                    card
                );


                /*
                 * We create temporary object URLs
                 * for preview images. They are released
                 * after the image has loaded.
                 */
                const img =
                    card.querySelector(
                        "img"
                    );

                img.addEventListener(
                    "load",
                    () => {

                        URL.revokeObjectURL(
                            imageUrl
                        );
                    },
                    {
                        once: true
                    }
                );
            }
        );
    }


    /* =========================
       DRAG & DROP REORDER
    ========================= */

    let draggedIndex = null;


    function setupDragEvents(card) {

        card.addEventListener(
            "dragstart",
            event => {

                draggedIndex =
                    Number(
                        card.dataset.index
                    );

                card.classList.add(
                    "dragging"
                );

                event.dataTransfer.effectAllowed =
                    "move";

                event.dataTransfer.setData(
                    "text/plain",
                    String(draggedIndex)
                );
            }
        );


        card.addEventListener(
            "dragend",
            () => {

                draggedIndex = null;

                document
                    .querySelectorAll(
                        ".jpg-pdf-image-card"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "dragging"
                        );

                        item.classList.remove(
                            "drag-over"
                        );
                    });
            }
        );


        card.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

                if (
                    draggedIndex === null
                ) {
                    return;
                }

                const currentIndex =
                    Number(
                        card.dataset.index
                    );

                if (
                    currentIndex !==
                    draggedIndex
                ) {

                    card.classList.add(
                        "drag-over"
                    );
                }

                event.dataTransfer.dropEffect =
                    "move";
            }
        );


        card.addEventListener(
            "dragleave",
            () => {

                card.classList.remove(
                    "drag-over"
                );
            }
        );


        card.addEventListener(
            "drop",
            event => {

                event.preventDefault();

                card.classList.remove(
                    "drag-over"
                );

                if (
                    draggedIndex === null
                ) {
                    return;
                }

                const targetIndex =
                    Number(
                        card.dataset.index
                    );

                if (
                    draggedIndex ===
                    targetIndex
                ) {
                    return;
                }


                const moved =
                    imageFiles.splice(
                        draggedIndex,
                        1
                    )[0];


                imageFiles.splice(
                    targetIndex,
                    0,
                    moved
                );


                draggedIndex = null;

                renderPreview();

                updateUIWithoutPreview();
            }
        );
    }


    function updateUIWithoutPreview() {

        const count =
            imageFiles.length;

        const size =
            imageFiles.reduce(
                (sum, file) =>
                    sum + file.size,
                0
            );

        imageCount.textContent =
            count;

        totalSize.textContent =
            formatFileSize(size);

        pdfPageCount.textContent =
            count;
    }


    /* =========================
       LOAD IMAGE
    ========================= */

    function loadImage(file) {

        return new Promise(
            (resolve, reject) => {

                const url =
                    URL.createObjectURL(
                        file
                    );

                const img =
                    new Image();

                img.onload = () => {

                    URL.revokeObjectURL(
                        url
                    );

                    resolve(img);
                };

                img.onerror = () => {

                    URL.revokeObjectURL(
                        url
                    );

                    reject(
                        new Error(
                            `Could not read image: ${file.name}`
                        )
                    );
                };

                img.src = url;
            }
        );
    }


    /* =========================
       PAGE SIZE
    ========================= */

    function getPageDimensions(
        imageWidth,
        imageHeight
    ) {

        const selectedSize =
            pageSize.value;

        let width;
        let height;


        if (
            selectedSize ===
            "original"
        ) {

            /*
             * PDF points.
             * 72 points = 1 inch.
             *
             * We use a practical 96 DPI
             * conversion for the original image.
             */
            width =
                imageWidth *
                72 /
                96;

            height =
                imageHeight *
                72 /
                96;

        } else if (
            selectedSize ===
            "letter"
        ) {

            width = 612;
            height = 792;

        } else {

            /*
             * A4:
             * 210 × 297 mm
             * ≈ 595.28 × 841.89 points
             */
            width =
                595.28;

            height =
                841.89;
        }


        if (
            selectedSize !==
            "original"
        ) {

            if (
                orientation.value ===
                "landscape"
            ) {

                [width, height] =
                    [height, width];

            } else if (
                orientation.value ===
                "portrait"
            ) {

                if (
                    width >
                    height
                ) {

                    [width, height] =
                        [height, width];
                }

            } else {

                /*
                 * Auto orientation:
                 * match the image shape.
                 */
                if (
                    imageWidth >
                    imageHeight
                ) {

                    if (
                        height >
                        width
                    ) {

                        [width, height] =
                            [height, width];
                    }

                } else {

                    if (
                        width >
                        height
                    ) {

                        [width, height] =
                            [height, width];
                    }
                }
            }
        }


        return {
            width,
            height
        };
    }


    /* =========================
       CALCULATE IMAGE RECT
    ========================= */

    function calculateImageRect(
        imageWidth,
        imageHeight,
        pageWidth,
        pageHeight,
        marginPoints
    ) {

        const availableWidth =
            Math.max(
                1,
                pageWidth -
                marginPoints * 2
            );

        const availableHeight =
            Math.max(
                1,
                pageHeight -
                marginPoints * 2
            );


        const imageRatio =
            imageWidth /
            imageHeight;

        const areaRatio =
            availableWidth /
            availableHeight;


        let drawWidth;
        let drawHeight;


        if (
            imageFit.value ===
            "fill"
        ) {

            /*
             * Fill = cover the available area.
             * Some edges may be cropped.
             */
            if (
                imageRatio >
                areaRatio
            ) {

                drawHeight =
                    availableHeight;

                drawWidth =
                    drawHeight *
                    imageRatio;

            } else {

                drawWidth =
                    availableWidth;

                drawHeight =
                    drawWidth /
                    imageRatio;
            }

        } else {

            /*
             * Fit = show entire image.
             */
            if (
                imageRatio >
                areaRatio
            ) {

                drawWidth =
                    availableWidth;

                drawHeight =
                    drawWidth /
                    imageRatio;

            } else {

                drawHeight =
                    availableHeight;

                drawWidth =
                    drawHeight *
                    imageRatio;
            }
        }


        return {
            x:
                (pageWidth -
                    drawWidth) /
                2,

            y:
                (pageHeight -
                    drawHeight) /
                2,

            width:
                drawWidth,

            height:
                drawHeight
        };
    }


    /* =========================
       CREATE PDF
    ========================= */

    async function createPdf() {

        if (
            imageFiles.length === 0
        ) {

            showError(
                "Please add at least one JPG image."
            );

            return;
        }


        if (
            typeof PDFLib ===
            "undefined"
        ) {

            showError(
                "PDF-LIB could not be loaded. Please check your internet connection."
            );

            return;
        }


        hideError();
        hideSuccess();

        createPdfButton.disabled =
            true;

        progressArea.classList.remove(
            "jpg-pdf-hidden"
        );

        progressBar.style.width =
            "0%";


        try {

            const {
                PDFDocument,
                rgb
            } = PDFLib;


            const pdfDoc =
                await PDFDocument.create();


            for (
                let index = 0;
                index < imageFiles.length;
                index++
            ) {

                const file =
                    imageFiles[index];


                progressText.textContent =
                    `Processing image ${index + 1} of ${imageFiles.length}...`;


                const image =
                    await loadImage(
                        file
                    );


                const dimensions =
                    getPageDimensions(
                        image.naturalWidth ||
                            image.width,

                        image.naturalHeight ||
                            image.height
                    );


                const page =
                    pdfDoc.addPage([
                        dimensions.width,
                        dimensions.height
                    ]);


                /*
                 * Embed original JPG bytes.
                 *
                 * This keeps the image quality high
                 * and avoids unnecessary re-encoding.
                 */
                const imageBytes =
                    await file.arrayBuffer();


                const embeddedImage =
                    await pdfDoc.embedJpg(
                        imageBytes
                    );


                const marginPoints =
                    Math.max(
                        0,
                        Number(
                            margin.value
                        ) || 0
                    );


                const rect =
                    calculateImageRect(
                        image.naturalWidth ||
                            image.width,

                        image.naturalHeight ||
                            image.height,

                        dimensions.width,

                        dimensions.height,

                        marginPoints
                    );


                /*
                 * White page background.
                 */
                page.drawRectangle({
                    x: 0,
                    y: 0,
                    width:
                        dimensions.width,
                    height:
                        dimensions.height,
                    color:
                        rgb(
                            1,
                            1,
                            1
                        )
                });


                page.drawImage(
                    embeddedImage,
                    {
                        x: rect.x,
                        y: rect.y,
                        width: rect.width,
                        height: rect.height
                    }
                );


                const percent =
                    Math.round(
                        (
                            (index + 1) /
                            imageFiles.length
                        ) * 100
                    );


                progressBar.style.width =
                    `${percent}%`;


                await wait(10);
            }


            progressText.textContent =
                "Generating final PDF...";


            const pdfBytes =
                await pdfDoc.save({
                    useObjectStreams: true
                });


            pdfBlob =
                new Blob(
                    [pdfBytes],
                    {
                        type:
                            "application/pdf"
                    }
                );


            clearPdfUrl();


            /*
             * clearPdfUrl() also clears pdfBlob,
             * so recreate it after cleanup.
             */
            pdfBlob =
                new Blob(
                    [pdfBytes],
                    {
                        type:
                            "application/pdf"
                    }
                );


            pdfUrl =
                URL.createObjectURL(
                    pdfBlob
                );


            const originalSize =
                imageFiles.reduce(
                    (sum, file) =>
                        sum + file.size,
                    0
                );


            resultDetails.innerHTML =
                `
                    ${imageFiles.length}
                    page${imageFiles.length === 1 ? "" : "s"}
                    •
                    ${formatFileSize(pdfBlob.size)}
                    <br>
                    Original images:
                    ${formatFileSize(originalSize)}
                `;


            const baseNames =
                imageFiles.length === 1
                    ? getBaseName(
                        imageFiles[0].name
                    )
                    : "lifekit-images";


            downloadButton.href =
                pdfUrl;

            downloadButton.download =
                `${baseNames}.pdf`;


            progressText.textContent =
                "PDF created successfully.";


            progressBar.style.width =
                "100%";


            resultPanel.classList.remove(
                "jpg-pdf-hidden"
            );


            showSuccess(
                "Your PDF has been created successfully."
            );


        } catch (error) {

            console.error(
                "LifeKit JPG to PDF:",
                error
            );

            showError(
                "PDF creation failed. Please make sure your JPG files are valid and try again."
            );

        } finally {

            createPdfButton.disabled =
                false;
        }
    }


    /* =========================
       RESET
    ========================= */

    function resetTool() {

        clearPdfUrl();

        imageFiles = [];

        imageInput.value = "";

        previewGrid.innerHTML = "";

        filePanel.classList.add(
            "jpg-pdf-hidden"
        );

        previewPanel.classList.add(
            "jpg-pdf-hidden"
        );

        settingsPanel.classList.add(
            "jpg-pdf-hidden"
        );

        resultPanel.classList.add(
            "jpg-pdf-hidden"
        );

        progressArea.classList.add(
            "jpg-pdf-hidden"
        );

        progressBar.style.width =
            "0%";

        progressText.textContent =
            "Preparing...";

        hideError();
        hideSuccess();
    }


    /* =========================
       CHOOSE IMAGES
    ========================= */

    chooseImagesButton.addEventListener(
        "click",
        () => {

            imageInput.click();
        }
    );


    imageInput.addEventListener(
        "change",
        event => {

            addImages(
                event.target.files
            );

            /*
             * Reset input so the same file
             * can be selected again later.
             */
            imageInput.value = "";
        }
    );


    /* =========================
       ADD MORE
    ========================= */

    addMoreButton.addEventListener(
        "click",
        () => {

            imageInput.click();
        }
    );


    /* =========================
       CLEAR
    ========================= */

    clearAllButton.addEventListener(
        "click",
        clearAll
    );


    /* =========================
       CREATE PDF
    ========================= */

    createPdfButton.addEventListener(
        "click",
        createPdf
    );


    /* =========================
       CONVERT ANOTHER
    ========================= */

    convertAnotherButton.addEventListener(
        "click",
        resetTool
    );


    /* =========================
       DRAG & DROP UPLOAD
    ========================= */

    [
        "dragenter",
        "dragover"
    ].forEach(
        eventName => {

            dropZone.addEventListener(
                eventName,
                event => {

                    event.preventDefault();
                    event.stopPropagation();

                    dropZone.classList.add(
                        "drag-over"
                    );
                }
            );
        }
    );


    [
        "dragleave",
        "drop"
    ].forEach(
        eventName => {

            dropZone.addEventListener(
                eventName,
                event => {

                    event.preventDefault();
                    event.stopPropagation();

                    dropZone.classList.remove(
                        "drag-over"
                    );
                }
            );
        }
    );


    dropZone.addEventListener(
        "drop",
        event => {

            const files =
                event.dataTransfer.files;

            addImages(files);
        }
    );


    /* =========================
       LIBRARY CHECK
    ========================= */

    if (
        typeof PDFLib !==
        "undefined"
    ) {

        console.log(
            "LifeKit JPG to PDF: PDF-LIB loaded successfully."
        );

    } else {

        console.warn(
            "LifeKit JPG to PDF: PDF-LIB is missing."
        );
    }

});