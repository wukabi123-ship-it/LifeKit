document.addEventListener("DOMContentLoaded", () => {

    const dropZone = document.getElementById("dropZone");
    const choosePdfButton = document.getElementById("choosePdfButton");
    const pdfInput = document.getElementById("pdfInput");

    const fileInfo = document.getElementById("fileInfo");
    const fileName = document.getElementById("fileName");
    const fileDetails = document.getElementById("fileDetails");

    const errorMessage = document.getElementById("errorMessage");

    const settingsPanel = document.getElementById("settingsPanel");
    const previewPanel = document.getElementById("previewPanel");
    const resultPanel = document.getElementById("resultPanel");

    const resolution = document.getElementById("resolution");
    const pageMode = document.getElementById("pageMode");

    const selectionBar = document.getElementById("selectionBar");
    const selectionInfo = document.getElementById("selectionInfo");

    const selectAllButton = document.getElementById("selectAllButton");
    const clearSelectionButton = document.getElementById("clearSelectionButton");

    const previewGrid = document.getElementById("previewGrid");
    const previewLoading = document.getElementById("previewLoading");

    const convertButton = document.getElementById("convertButton");

    const progressArea = document.getElementById("progressArea");
    const progressText = document.getElementById("progressText");
    const progressBar = document.getElementById("progressBar");

    const statusMessage = document.getElementById("statusMessage");

    const results = document.getElementById("results");
    const downloadZipButton = document.getElementById("downloadZipButton");
    const convertAnotherButton = document.getElementById("convertAnotherButton");

    let selectedFile = null;
    let pdfDocument = null;

    let pageData = [];
    let selectedPages = new Set();

    let convertedFiles = [];

    let zipBlob = null;
    let zipUrl = null;

    /*
     * PDF.js worker
     *
     * We intentionally disable the worker later.
     * This makes the tool more reliable when the user opens
     * LifeKit directly using file://
     */
    if (typeof pdfjsLib !== "undefined") {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }


    /* =========================
       BASIC HELPERS
    ========================= */

    function formatFileSize(bytes) {

        if (!Number.isFinite(bytes) || bytes <= 0) {
            return "0 Bytes";
        }

        const units = [
            "Bytes",
            "KB",
            "MB",
            "GB"
        ];

        const index = Math.min(
            Math.floor(Math.log(bytes) / Math.log(1024)),
            units.length - 1
        );

        const value = bytes / Math.pow(1024, index);

        return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
    }


    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function showError(message) {

        errorMessage.textContent = message;
        errorMessage.classList.remove("pdf-jpg-hidden");
    }


    function hideError() {

        errorMessage.textContent = "";
        errorMessage.classList.add("pdf-jpg-hidden");
    }


    function showStatus(message) {

        statusMessage.textContent = message;
        statusMessage.classList.remove("pdf-jpg-hidden");
    }


    function hideStatus() {

        statusMessage.textContent = "";
        statusMessage.classList.add("pdf-jpg-hidden");
    }


    function clearZipUrl() {

        if (zipUrl) {
            URL.revokeObjectURL(zipUrl);
            zipUrl = null;
        }

        zipBlob = null;
    }


    function getBaseName(filename) {

        return filename
            .replace(/\.pdf$/i, "")
            .replace(/[\\/:*?"<>|]/g, "_");
    }


    function wait(ms) {

        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }


    /* =========================
       QUALITY SETTINGS
    ========================= */

    function getQualitySettings() {

        const selectedQuality =
            document.querySelector(
                'input[name="quality"]:checked'
            );

        const quality =
            selectedQuality
                ? selectedQuality.value
                : "high";

        if (quality === "small") {

            return {
                jpegQuality: 0.68
            };
        }

        if (quality === "balanced") {

            return {
                jpegQuality: 0.82
            };
        }

        return {
            jpegQuality: 0.94
        };
    }


    /* =========================
       QUALITY CARDS
    ========================= */

    document
        .querySelectorAll("[data-quality-card]")
        .forEach(card => {

            card.addEventListener("click", () => {

                document
                    .querySelectorAll("[data-quality-card]")
                    .forEach(item => {
                        item.classList.remove("selected");
                    });

                card.classList.add("selected");

                const radio =
                    card.querySelector("input[type='radio']");

                if (radio) {
                    radio.checked = true;
                }
            });

        });


    /* =========================
       PDF VALIDATION
    ========================= */

    function isPdfFile(file) {

        if (!file) {
            return false;
        }

        const nameIsPdf =
            /\.pdf$/i.test(file.name);

        const typeIsPdf =
            file.type === "application/pdf";

        return nameIsPdf || typeIsPdf;
    }


    /* =========================
       LOAD PDF
    ========================= */

    async function loadPdf(file) {

        if (typeof pdfjsLib === "undefined") {

            throw new Error(
                "PDF.js could not be loaded. Please check your internet connection."
            );
        }

        const arrayBuffer =
            await file.arrayBuffer();

        /*
         * Uint8Array is copied so PDF.js cannot
         * affect the original ArrayBuffer.
         */
        const bytes =
            new Uint8Array(arrayBuffer);

        const loadingTask =
            pdfjsLib.getDocument({
                data: bytes,
                disableWorker: true
            });

        return await loadingTask.promise;
    }


    /* =========================
       FILE HANDLING
    ========================= */

    async function handleFile(file) {

        hideError();
        hideStatus();

        if (!file) {
            return;
        }

        if (!isPdfFile(file)) {

            showError(
                "Please choose a valid PDF file."
            );

            return;
        }

        if (file.size === 0) {

            showError(
                "This PDF file appears to be empty."
            );

            return;
        }

        clearZipUrl();

        selectedFile = file;
        pdfDocument = null;

        pageData = [];
        selectedPages.clear();
        convertedFiles = [];

        previewGrid.innerHTML = "";
        results.innerHTML = "";

        fileInfo.classList.remove("pdf-jpg-hidden");
        settingsPanel.classList.remove("pdf-jpg-hidden");
        previewPanel.classList.remove("pdf-jpg-hidden");
        resultPanel.classList.add("pdf-jpg-hidden");

        fileName.textContent = file.name;

        fileDetails.textContent =
            `${formatFileSize(file.size)} • Loading pages...`;

        convertButton.disabled = true;

        previewLoading.classList.remove(
            "pdf-jpg-hidden"
        );

        previewGrid.classList.add(
            "pdf-jpg-hidden"
        );

        try {

            pdfDocument =
                await loadPdf(file);

            const pageCount =
                pdfDocument.numPages;

            fileDetails.textContent =
                `${formatFileSize(file.size)} • ${pageCount} page${pageCount === 1 ? "" : "s"}`;

            await createPagePreviews();

        } catch (error) {

            console.error(
                "LifeKit PDF to JPG:",
                error
            );

            showError(
                "This PDF could not be read. It may be damaged, password-protected, or unsupported."
            );

            settingsPanel.classList.add(
                "pdf-jpg-hidden"
            );

            previewPanel.classList.add(
                "pdf-jpg-hidden"
            );

        } finally {

            previewLoading.classList.add(
                "pdf-jpg-hidden"
            );

            previewGrid.classList.remove(
                "pdf-jpg-hidden"
            );
        }
    }


    /* =========================
       CREATE PREVIEWS
    ========================= */

    async function createPagePreviews() {

        if (!pdfDocument) {
            return;
        }

        previewGrid.innerHTML = "";

        pageData = [];

        for (
            let pageNumber = 1;
            pageNumber <= pdfDocument.numPages;
            pageNumber++
        ) {

            const page =
                await pdfDocument.getPage(pageNumber);

            const previewScale = 0.35;

            const viewport =
                page.getViewport({
                    scale: previewScale
                });

            const canvas =
                document.createElement("canvas");

            const context =
                canvas.getContext("2d");

            canvas.width =
                Math.max(
                    1,
                    Math.floor(viewport.width)
                );

            canvas.height =
                Math.max(
                    1,
                    Math.floor(viewport.height)
                );

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            const imageUrl =
                canvas.toDataURL(
                    "image/jpeg",
                    0.72
                );

            pageData.push({
                pageNumber,
                previewUrl: imageUrl
            });

            selectedPages.add(pageNumber);

            const card =
                createPageCard(
                    pageNumber,
                    imageUrl
                );

            previewGrid.appendChild(card);

            /*
             * Small pause keeps the browser responsive
             * when a PDF contains many pages.
             */
            if (pageNumber % 3 === 0) {
                await wait(10);
            }
        }

        updateSelectionUI();
    }


    /* =========================
       PAGE CARD
    ========================= */

    function createPageCard(
        pageNumber,
        imageUrl
    ) {

        const card =
            document.createElement("div");

        card.className =
            "pdf-jpg-page-card selected";

        card.dataset.page =
            String(pageNumber);

        card.innerHTML = `
            <img
                src="${imageUrl}"
                alt="PDF page ${pageNumber}"
            >

            <div class="pdf-jpg-page-number">

                <span>
                    Page ${pageNumber}
                </span>

                <span class="pdf-jpg-check">
                    ✓
                </span>

            </div>
        `;

        card.addEventListener(
            "click",
            () => {

                togglePage(pageNumber);
            }
        );

        return card;
    }


    /* =========================
       PAGE SELECTION
    ========================= */

    function togglePage(pageNumber) {

        if (selectedPages.has(pageNumber)) {

            selectedPages.delete(pageNumber);

        } else {

            selectedPages.add(pageNumber);
        }

        updatePageCard(
            pageNumber
        );

        updateSelectionUI();
    }


    function updatePageCard(pageNumber) {

        const card =
            previewGrid.querySelector(
                `[data-page="${pageNumber}"]`
            );

        if (!card) {
            return;
        }

        if (selectedPages.has(pageNumber)) {

            card.classList.add("selected");

        } else {

            card.classList.remove("selected");
        }
    }


    function selectAllPages() {

        if (!pdfDocument) {
            return;
        }

        selectedPages.clear();

        for (
            let i = 1;
            i <= pdfDocument.numPages;
            i++
        ) {
            selectedPages.add(i);
        }

        refreshAllPageCards();
        updateSelectionUI();
    }


    function clearAllPages() {

        selectedPages.clear();

        refreshAllPageCards();
        updateSelectionUI();
    }


    function refreshAllPageCards() {

        for (
            let i = 1;
            i <= pageData.length;
            i++
        ) {

            updatePageCard(i);
        }
    }


    function updateSelectionUI() {

        const count =
            selectedPages.size;

        const total =
            pdfDocument
                ? pdfDocument.numPages
                : 0;

        selectionInfo.textContent =
            `${count} page${count === 1 ? "" : "s"} selected`;

        if (pageMode.value === "all") {

            selectionBar.classList.add(
                "pdf-jpg-hidden"
            );

            convertButton.textContent =
                `Convert All ${total} Pages to JPG`;

        } else {

            selectionBar.classList.remove(
                "pdf-jpg-hidden"
            );

            convertButton.textContent =
                count > 0
                    ? `Convert ${count} Page${count === 1 ? "" : "s"} to JPG`
                    : "Select Pages to Convert";
        }

        convertButton.disabled =
            pageMode.value === "selected"
                ? count === 0
                : total === 0;
    }


    /* =========================
       PAGE MODE
    ========================= */

    pageMode.addEventListener(
        "change",
        () => {

            if (pageMode.value === "all") {

                selectAllPages();

            } else {

                updateSelectionUI();
            }
        }
    );


    /* =========================
       SELECT ALL / CLEAR
    ========================= */

    selectAllButton.addEventListener(
        "click",
        () => {

            selectAllPages();
        }
    );


    clearSelectionButton.addEventListener(
        "click",
        () => {

            clearAllPages();
        }
    );


    /* =========================
       RENDER FULL PAGE
    ========================= */

    async function renderPageToJpg(
        pageNumber,
        settings
    ) {

        const page =
            await pdfDocument.getPage(
                pageNumber
            );

        const scale =
            Number(resolution.value);

        const viewport =
            page.getViewport({
                scale
            });

        const canvas =
            document.createElement("canvas");

        canvas.width =
            Math.max(
                1,
                Math.ceil(viewport.width)
            );

        canvas.height =
            Math.max(
                1,
                Math.ceil(viewport.height)
            );

        const context =
            canvas.getContext("2d", {
                alpha: false
            });

        /*
         * White background prevents transparent
         * PDF areas from becoming black in JPG.
         */
        context.save();

        context.fillStyle =
            "#ffffff";

        context.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        context.restore();

        await page.render({
            canvasContext: context,
            viewport: viewport,
            background: "white"
        }).promise;

        const blob =
            await new Promise(
                resolve => {

                    canvas.toBlob(
                        resolve,
                        "image/jpeg",
                        settings.jpegQuality
                    );

                }
            );

        if (!blob) {

            throw new Error(
                `Could not create JPG for page ${pageNumber}.`
            );
        }

        return blob;
    }


    /* =========================
       CONVERT
    ========================= */

    async function convertToJpg() {

        if (!pdfDocument) {

            showError(
                "Please upload a PDF first."
            );

            return;
        }

        hideError();
        hideStatus();

        const settings =
            getQualitySettings();

        let pagesToConvert;

        if (pageMode.value === "all") {

            pagesToConvert =
                Array.from(
                    { length: pdfDocument.numPages },
                    (_, index) => index + 1
                );

        } else {

            pagesToConvert =
                Array.from(
                    selectedPages
                ).sort(
                    (a, b) => a - b
                );
        }

        if (pagesToConvert.length === 0) {

            showError(
                "Please select at least one page."
            );

            return;
        }

        convertButton.disabled = true;

        progressArea.classList.remove(
            "pdf-jpg-hidden"
        );

        progressBar.style.width = "0%";

        convertedFiles = [];

        const baseName =
            getBaseName(
                selectedFile.name
            );

        try {

            for (
                let index = 0;
                index < pagesToConvert.length;
                index++
            ) {

                const pageNumber =
                    pagesToConvert[index];

                progressText.textContent =
                    `Converting page ${index + 1} of ${pagesToConvert.length}...`;

                const blob =
                    await renderPageToJpg(
                        pageNumber,
                        settings
                    );

                convertedFiles.push({
                    pageNumber,
                    blob,
                    fileName:
                        `${baseName}-page-${pageNumber}.jpg`
                });

                const percent =
                    Math.round(
                        ((index + 1) /
                            pagesToConvert.length) *
                        100
                    );

                progressBar.style.width =
                    `${percent}%`;

                await wait(15);
            }

            progressText.textContent =
                `Completed ${convertedFiles.length} JPG file${convertedFiles.length === 1 ? "" : "s"}.`;

            showResults();

            showStatus(
                `Successfully converted ${convertedFiles.length} page${convertedFiles.length === 1 ? "" : "s"} to JPG.`
            );

        } catch (error) {

            console.error(
                "PDF to JPG conversion failed:",
                error
            );

            showError(
                "Conversion failed. Please try again with another PDF or a lower resolution."
            );

        } finally {

            convertButton.disabled = false;
        }
    }


    /* =========================
       RESULTS
    ========================= */

    function showResults() {

        results.innerHTML = "";

        resultPanel.classList.remove(
            "pdf-jpg-hidden"
        );

        convertedFiles.forEach(
            (file, index) => {

                const url =
                    URL.createObjectURL(
                        file.blob
                    );

                const card =
                    document.createElement("div");

                card.className =
                    "pdf-jpg-result-card";

                card.innerHTML = `
                    <div class="pdf-jpg-result-info">

                        <div class="pdf-jpg-result-name">
                            ${escapeHtml(file.fileName)}
                        </div>

                        <div class="pdf-jpg-result-size">
                            Page ${file.pageNumber}
                            • ${formatFileSize(file.blob.size)}
                        </div>

                    </div>

                    <a
                        class="pdf-jpg-download-button"
                        href="${url}"
                        download="${escapeHtml(file.fileName)}"
                    >
                        Download
                    </a>
                `;

                results.appendChild(card);

                /*
                 * Keep object URLs alive while the result
                 * page is visible.
                 */
            }
        );
    }


    /* =========================
       ZIP DOWNLOAD
    ========================= */

    async function createZip() {

        if (
            !convertedFiles.length
        ) {

            return;
        }

        if (typeof JSZip === "undefined") {

            showError(
                "ZIP library could not be loaded. You can still download each JPG individually."
            );

            return;
        }

        downloadZipButton.disabled = true;

        const originalText =
            downloadZipButton.textContent;

        downloadZipButton.textContent =
            "Creating ZIP...";

        try {

            clearZipUrl();

            const zip =
                new JSZip();

            convertedFiles.forEach(
                file => {

                    zip.file(
                        file.fileName,
                        file.blob
                    );
                }
            );

            zipBlob =
                await zip.generateAsync(
                    {
                        type: "blob",
                        compression: "DEFLATE",
                        compressionOptions: {
                            level: 6
                        }
                    },
                    metadata => {

                        const percent =
                            Math.round(
                                metadata.percent
                            );

                        downloadZipButton.textContent =
                            `Creating ZIP... ${percent}%`;
                    }
                );

            zipUrl =
                URL.createObjectURL(
                    zipBlob
                );

            const link =
                document.createElement("a");

            link.href =
                zipUrl;

            link.download =
                `${getBaseName(selectedFile.name)}-jpg.zip`;

            document.body.appendChild(link);

            link.click();

            link.remove();

        } catch (error) {

            console.error(
                "ZIP creation failed:",
                error
            );

            showError(
                "The ZIP file could not be created."
            );

        } finally {

            downloadZipButton.disabled = false;

            downloadZipButton.textContent =
                originalText;
        }
    }


    /* =========================
       RESET
    ========================= */

    function resetTool() {

        clearZipUrl();

        /*
         * Clean up individual JPG URLs.
         */
        document
            .querySelectorAll(
                ".pdf-jpg-download-button"
            )
            .forEach(link => {

                if (link.href.startsWith("blob:")) {

                    try {
                        URL.revokeObjectURL(
                            link.href
                        );
                    } catch (error) {
                        // Ignore cleanup errors.
                    }
                }
            });

        selectedFile = null;
        pdfDocument = null;

        pageData = [];
        selectedPages.clear();
        convertedFiles = [];

        pdfInput.value = "";

        fileInfo.classList.add(
            "pdf-jpg-hidden"
        );

        settingsPanel.classList.add(
            "pdf-jpg-hidden"
        );

        previewPanel.classList.add(
            "pdf-jpg-hidden"
        );

        resultPanel.classList.add(
            "pdf-jpg-hidden"
        );

        previewGrid.innerHTML = "";
        results.innerHTML = "";

        progressArea.classList.add(
            "pdf-jpg-hidden"
        );

        hideError();
        hideStatus();

        progressBar.style.width =
            "0%";

        progressText.textContent =
            "Preparing...";

        convertButton.disabled =
            true;

        /*
         * Reset default quality.
         */
        const highQuality =
            document.querySelector(
                'input[name="quality"][value="high"]'
            );

        if (highQuality) {

            highQuality.checked =
                true;
        }

        document
            .querySelectorAll(
                "[data-quality-card]"
            )
            .forEach((card, index) => {

                card.classList.toggle(
                    "selected",
                    index === 0
                );
            });

        resolution.value =
            "2";

        pageMode.value =
            "selected";
    }


    /* =========================
       UPLOAD BUTTON
    ========================= */

    choosePdfButton.addEventListener(
        "click",
        () => {

            pdfInput.click();
        }
    );


    pdfInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files &&
                event.target.files[0];

            if (file) {
                handleFile(file);
            }
        }
    );


    /* =========================
       DRAG & DROP
    ========================= */

    [
        "dragenter",
        "dragover"
    ].forEach(eventName => {

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

    });


    [
        "dragleave",
        "drop"
    ].forEach(eventName => {

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

    });


    dropZone.addEventListener(
        "drop",
        event => {

            const files =
                event.dataTransfer.files;

            if (
                files &&
                files.length > 0
            ) {

                handleFile(
                    files[0]
                );
            }
        }
    );


    /* =========================
       CONVERT BUTTON
    ========================= */

    convertButton.addEventListener(
        "click",
        convertToJpg
    );


    /* =========================
       ZIP BUTTON
    ========================= */

    downloadZipButton.addEventListener(
        "click",
        createZip
    );


    /* =========================
       CONVERT ANOTHER
    ========================= */

    convertAnotherButton.addEventListener(
        "click",
        resetTool
    );


    /* =========================
       LIBRARY CHECK
    ========================= */

    if (
        typeof pdfjsLib !== "undefined" &&
        typeof JSZip !== "undefined"
    ) {

        console.log(
            "LifeKit PDF to JPG: PDF.js and JSZip loaded successfully."
        );

    } else {

        console.warn(
            "LifeKit PDF to JPG: One or more libraries failed to load."
        );
    }

});