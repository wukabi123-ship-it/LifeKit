document.addEventListener("DOMContentLoaded", () => {

    const dropZone =
        document.getElementById("dropZone");

    const choosePdfButton =
        document.getElementById("choosePdfButton");

    const pdfInput =
        document.getElementById("pdfInput");


    const fileInfo =
        document.getElementById("fileInfo");

    const fileName =
        document.getElementById("fileName");

    const fileDetails =
        document.getElementById("fileDetails");


    const splitControls =
        document.getElementById("splitControls");

    const splitMode =
        document.getElementById("splitMode");

    const extractModeArea =
        document.getElementById("extractModeArea");

    const everyModeArea =
        document.getElementById("everyModeArea");


    const pageInput =
        document.getElementById("pageInput");

    const pageHint =
        document.getElementById("pageHint");


    const selectAllButton =
        document.getElementById("selectAllButton");

    const clearSelectionButton =
        document.getElementById("clearSelectionButton");


    const selectionSummary =
        document.getElementById("selectionSummary");


    const pagesPerFile =
        document.getElementById("pagesPerFile");

    const everyModeSummary =
        document.getElementById("everyModeSummary");


    const pagePreviewArea =
        document.getElementById("pagePreviewArea");


    const splitButton =
        document.getElementById("splitButton");


    const downloadArea =
        document.getElementById("downloadArea");


    let currentFile = null;

    let currentPdfBytes = null;

    let currentPdf = null;

    let totalPages = 0;

    let selectedPages = new Set();

    let pdfJsLoaded = false;

    let pdfJsLoading = false;



    // ==================================================
    // Utility
    // ==================================================

    function formatFileSize(bytes) {

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        if (bytes < 1024 * 1024 * 1024) {
            return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        }

        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;

    }


    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function getBaseFileName(name) {

        return name.replace(
            /\.pdf$/i,
            ""
        );

    }


    function clearDownloadArea() {

        downloadArea.innerHTML = "";

    }



    // ==================================================
    // PDF.js Loader
    // ==================================================

    function loadPdfJs() {

        if (pdfJsLoaded) {
            return Promise.resolve();
        }


        if (pdfJsLoading) {

            return new Promise(
                (resolve, reject) => {

                    const check =
                        setInterval(() => {

                            if (pdfJsLoaded) {

                                clearInterval(check);

                                resolve();

                            }

                        }, 100);


                    setTimeout(() => {

                        clearInterval(check);

                        if (!pdfJsLoaded) {

                            reject(
                                new Error(
                                    "PDF.js failed to load."
                                )
                            );

                        }

                    }, 15000);

                }
            );

        }


        pdfJsLoading = true;


        return new Promise(
            (resolve, reject) => {

                const script =
                    document.createElement(
                        "script"
                    );


                script.src =
                    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";


                script.onload = () => {

                    if (
                        window.pdfjsLib &&
                        window.pdfjsLib.GlobalWorkerOptions
                    ) {

                        window.pdfjsLib
                            .GlobalWorkerOptions
                            .workerSrc =
                            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


                        pdfJsLoaded = true;

                        pdfJsLoading = false;

                        resolve();

                    } else {

                        pdfJsLoading = false;

                        reject(
                            new Error(
                                "PDF.js loaded but was not available."
                            )
                        );

                    }

                };


                script.onerror = () => {

                    pdfJsLoading = false;

                    reject(
                        new Error(
                            "Could not load PDF.js."
                        )
                    );

                };


                document.head.appendChild(
                    script
                );

            }
        );

    }



    // ==================================================
    // PDF.js Safe Data Copy
    // ==================================================

    /*
        IMPORTANT:

        PDF.js may transfer/detach the ArrayBuffer
        passed to getDocument().

        Therefore we ALWAYS give PDF.js a COPY.

        Never pass currentPdfBytes directly.
    */

    function getPdfJsCopy() {

        if (!currentPdfBytes) {
            return null;
        }


        return new Uint8Array(
            currentPdfBytes
        );

    }



    // ==================================================
    // File Validation
    // ==================================================

    function isPdfFile(file) {

        if (!file) {
            return false;
        }


        return (
            file.type === "application/pdf" ||
            file.name
                .toLowerCase()
                .endsWith(".pdf")
        );

    }



    // ==================================================
    // Upload
    // ==================================================

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
                event.target.files[0];


            if (file) {

                loadPdfFile(file);

            }

        }
    );



    // ==================================================
    // Drag & Drop
    // ==================================================

    [
        "dragenter",
        "dragover"
    ].forEach(
        eventName => {

            dropZone.addEventListener(
                eventName,
                event => {

                    event.preventDefault();

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


            if (
                !files ||
                files.length === 0
            ) {
                return;
            }


            const file =
                files[0];


            if (!isPdfFile(file)) {

                alert(
                    "Please choose a PDF file."
                );

                return;

            }


            loadPdfFile(file);

        }
    );



    // ==================================================
    // Load PDF
    // ==================================================

    async function loadPdfFile(file) {

        if (!isPdfFile(file)) {

            alert(
                "Please choose a PDF file."
            );

            return;

        }


        currentFile = file;

        clearDownloadArea();


        fileInfo.style.display =
            "block";


        splitControls.style.display =
            "none";


        splitButton.disabled =
            true;


        fileName.textContent =
            file.name;


        fileDetails.textContent =
            "Loading PDF...";


        try {

            const arrayBuffer =
                await file.arrayBuffer();


            /*
                Make our own stable Uint8Array.

                This is the MASTER copy.
            */

            currentPdfBytes =
                new Uint8Array(
                    arrayBuffer
                );


            /*
                PDF-LIB gets its own copy too.
            */

            currentPdf =
                await PDFLib.PDFDocument.load(
                    new Uint8Array(
                        currentPdfBytes
                    )
                );


            totalPages =
                currentPdf.getPageCount();


            selectedPages =
                new Set();


            fileDetails.textContent =
                `${totalPages} pages • ${formatFileSize(file.size)}`;


            splitControls.style.display =
                "block";


            pageInput.value = "";

            pagesPerFile.value = "2";


            updateModeUI();

            updateSelectionSummary();

            updateEveryModeSummary();


            /*
                Thumbnail rendering happens
                AFTER PDF-LIB has finished loading.
            */

            await renderPageThumbnails();


            splitButton.disabled =
                false;


        } catch (error) {

            console.error(error);


            currentFile = null;

            currentPdfBytes = null;

            currentPdf = null;

            totalPages = 0;


            splitControls.style.display =
                "none";


            splitButton.disabled =
                true;


            fileDetails.textContent =
                "Could not read this PDF.";


            alert(
                "This PDF could not be opened. Please try another PDF file."
            );

        }

    }



    // ==================================================
    // Split Mode
    // ==================================================

    splitMode.addEventListener(
        "change",
        () => {

            updateModeUI();

        }
    );


    function updateModeUI() {

        if (
            splitMode.value ===
            "extract"
        ) {

            extractModeArea.style.display =
                "block";

            everyModeArea.style.display =
                "none";


            updateSelectionSummary();

        } else {

            extractModeArea.style.display =
                "none";

            everyModeArea.style.display =
                "block";


            updateEveryModeSummary();

        }


        updateSplitButtonText();

    }


    function updateSplitButtonText() {

        if (
            splitMode.value ===
            "extract"
        ) {

            splitButton.textContent =
                "Extract Selected Pages";

        } else {

            splitButton.textContent =
                "Split PDF";

        }

    }



    // ==================================================
    // Page Parser
    // ==================================================

    function parsePageInput(input) {

        if (!input.trim()) {
            return [];
        }


        const pages =
            new Set();


        const parts =
            input
                .split(",")
                .map(
                    part => part.trim()
                )
                .filter(Boolean);


        for (
            const part of parts
        ) {

            if (/^\d+$/.test(part)) {

                const page =
                    Number(part);


                if (
                    page < 1 ||
                    page > totalPages
                ) {

                    throw new Error(
                        `Page ${page} is outside the PDF range.`
                    );

                }


                pages.add(page);

                continue;

            }


            const rangeMatch =
                part.match(
                    /^(\d+)\s*-\s*(\d+)$/
                );


            if (!rangeMatch) {

                throw new Error(
                    `Invalid page range: ${part}`
                );

            }


            let start =
                Number(
                    rangeMatch[1]
                );


            let end =
                Number(
                    rangeMatch[2]
                );


            if (start > end) {

                [
                    start,
                    end
                ] = [
                    end,
                    start
                ];

            }


            if (
                start < 1 ||
                end > totalPages
            ) {

                throw new Error(
                    `Page range ${part} is outside the PDF range.`
                );

            }


            for (
                let page = start;
                page <= end;
                page++
            ) {

                pages.add(page);

            }

        }


        return Array.from(pages)
            .sort(
                (a, b) => a - b
            );

    }



    // ==================================================
    // Page Input
    // ==================================================

    pageInput.addEventListener(
        "input",
        () => {

            if (!totalPages) {
                return;
            }


            try {

                const pages =
                    parsePageInput(
                        pageInput.value
                    );


                selectedPages =
                    new Set(pages);


                pageHint.textContent =
                    pages.length
                        ? `${pages.length} page${pages.length === 1 ? "" : "s"} selected.`
                        : "Example: 1-3, 5, 8-10";


                pageHint.style.color =
                    pages.length
                        ? "#16a34a"
                        : "#6b7280";


            } catch (error) {

                pageHint.textContent =
                    error.message;


                pageHint.style.color =
                    "#dc2626";

            }


            updateSelectionSummary();

            refreshPageCards();

        }
    );



    // ==================================================
    // Select All
    // ==================================================

    selectAllButton.addEventListener(
        "click",
        () => {

            selectedPages =
                new Set();


            for (
                let page = 1;
                page <= totalPages;
                page++
            ) {

                selectedPages.add(page);

            }


            pageInput.value =
                buildPageRanges(
                    Array.from(
                        selectedPages
                    )
                );


            pageHint.textContent =
                `${totalPages} pages selected.`;


            pageHint.style.color =
                "#16a34a";


            updateSelectionSummary();

            refreshPageCards();

        }
    );



    // ==================================================
    // Clear Selection
    // ==================================================

    clearSelectionButton.addEventListener(
        "click",
        () => {

            selectedPages.clear();

            pageInput.value = "";


            pageHint.textContent =
                "Example: 1-3, 5, 8-10";


            pageHint.style.color =
                "#6b7280";


            updateSelectionSummary();

            refreshPageCards();

        }
    );



    // ==================================================
    // Build Page Ranges
    // ==================================================

    function buildPageRanges(pages) {

        if (!pages.length) {
            return "";
        }


        const sorted =
            [...pages]
                .sort(
                    (a, b) => a - b
                );


        const ranges = [];


        let start =
            sorted[0];


        let previous =
            sorted[0];


        for (
            let i = 1;
            i < sorted.length;
            i++
        ) {

            const current =
                sorted[i];


            if (
                current ===
                previous + 1
            ) {

                previous =
                    current;

                continue;

            }


            if (
                start ===
                previous
            ) {

                ranges.push(
                    String(start)
                );

            } else {

                ranges.push(
                    `${start}-${previous}`
                );

            }


            start =
                current;


            previous =
                current;

        }


        if (
            start ===
            previous
        ) {

            ranges.push(
                String(start)
            );

        } else {

            ranges.push(
                `${start}-${previous}`
            );

        }


        return ranges.join(", ");

    }



    // ==================================================
    // Selection Summary
    // ==================================================

    function updateSelectionSummary() {

        const count =
            selectedPages.size;


        if (count === 0) {

            selectionSummary.textContent =
                "No pages selected";

            return;

        }


        selectionSummary.innerHTML =
            `
            <strong>${count}</strong>
            page${count === 1 ? "" : "s"} selected:
            ${escapeHtml(
                buildPageRanges(
                    Array.from(
                        selectedPages
                    )
                )
            )}
            `;

    }



    // ==================================================
    // Every N Pages
    // ==================================================

    pagesPerFile.addEventListener(
        "input",
        () => {

            updateEveryModeSummary();

        }
    );


    function updateEveryModeSummary() {

        if (!totalPages) {

            everyModeSummary.textContent =
                "Enter a number of pages.";

            return;

        }


        let number =
            Number(
                pagesPerFile.value
            );


        if (
            !Number.isInteger(number) ||
            number < 1
        ) {

            everyModeSummary.textContent =
                "Please enter a valid number greater than 0.";


            everyModeSummary.style.color =
                "#dc2626";


            return;

        }


        if (
            number > totalPages
        ) {

            number =
                totalPages;


            pagesPerFile.value =
                String(
                    totalPages
                );

        }


        const fileCount =
            Math.ceil(
                totalPages /
                number
            );


        everyModeSummary.style.color =
            "#111827";


        everyModeSummary.innerHTML =
            `
            Your <strong>${totalPages}-page</strong>
            PDF will become
            <strong>${fileCount}</strong>
            PDF${fileCount === 1 ? "" : "s"},
            with up to
            <strong>${number}</strong>
            page${number === 1 ? "" : "s"} each.
            `;

    }



    // ==================================================
    // Render Page Thumbnails
    // ==================================================

    async function renderPageThumbnails() {

        pagePreviewArea.innerHTML = "";


        if (
            !currentPdfBytes ||
            !totalPages
        ) {
            return;
        }


        const title =
            document.createElement(
                "h3"
            );


        title.textContent =
            "Page Preview";


        pagePreviewArea.appendChild(
            title
        );


        const help =
            document.createElement(
                "p"
            );


        help.textContent =
            "Click a page to select it. Double-click to preview.";


        help.style.cssText =
            `
            color:#6b7280;
            font-size:14px;
            margin-top:-5px;
            margin-bottom:15px;
            `;


        pagePreviewArea.appendChild(
            help
        );


        const grid =
            document.createElement(
                "div"
            );


        grid.id =
            "pageThumbnailGrid";


        grid.style.cssText =
            `
            display:grid;
            grid-template-columns:
                repeat(
                    auto-fill,
                    minmax(130px,1fr)
                );
            gap:14px;
            `;


        pagePreviewArea.appendChild(
            grid
        );


        try {

            await loadPdfJs();


            /*
                VERY IMPORTANT:

                Give PDF.js a COPY.

                It may detach the ArrayBuffer
                internally.
            */

            const pdfJsData =
                getPdfJsCopy();


            const loadingTask =
                window.pdfjsLib.getDocument({
                    data:
                        pdfJsData
                });


            const pdf =
                await loadingTask.promise;


            for (
                let pageNumber = 1;
                pageNumber <= pdf.numPages;
                pageNumber++
            ) {

                const page =
                    await pdf.getPage(
                        pageNumber
                    );


                const viewport =
                    page.getViewport({
                        scale: 0.55
                    });


                const card =
                    document.createElement(
                        "div"
                    );


                card.dataset.page =
                    String(
                        pageNumber
                    );


                card.style.cssText =
                    `
                    position:relative;
                    padding:8px;
                    background:#ffffff;
                    border:2px solid #e5e7eb;
                    border-radius:12px;
                    cursor:pointer;
                    box-sizing:border-box;
                    transition:
                        border-color 0.15s ease,
                        transform 0.15s ease,
                        box-shadow 0.15s ease;
                    `;


                const canvas =
                    document.createElement(
                        "canvas"
                    );


                canvas.width =
                    viewport.width;


                canvas.height =
                    viewport.height;


                canvas.style.cssText =
                    `
                    display:block;
                    width:100%;
                    height:auto;
                    background:#ffffff;
                    border-radius:6px;
                    `;


                const context =
                    canvas.getContext(
                        "2d"
                    );


                await page.render({
                    canvasContext:
                        context,

                    viewport
                }).promise;


                const label =
                    document.createElement(
                        "div"
                    );


                label.textContent =
                    `Page ${pageNumber}`;


                label.style.cssText =
                    `
                    text-align:center;
                    font-size:13px;
                    font-weight:600;
                    margin-top:7px;
                    color:#374151;
                    `;


                const badge =
                    document.createElement(
                        "div"
                    );


                badge.className =
                    "page-selection-badge";


                badge.textContent =
                    "✓";


                badge.style.cssText =
                    `
                    position:absolute;
                    top:6px;
                    right:6px;
                    width:25px;
                    height:25px;
                    border-radius:50%;
                    background:#111827;
                    color:white;
                    display:none;
                    align-items:center;
                    justify-content:center;
                    font-weight:700;
                    font-size:14px;
                    box-shadow:
                        0 2px 6px
                        rgba(0,0,0,0.2);
                    `;


                card.appendChild(
                    canvas
                );


                card.appendChild(
                    label
                );


                card.appendChild(
                    badge
                );


                card.addEventListener(
                    "click",
                    () => {

                        togglePageSelection(
                            pageNumber
                        );

                    }
                );


                card.addEventListener(
                    "dblclick",
                    event => {

                        event.preventDefault();

                        showLargePreview(
                            pageNumber
                        );

                    }
                );


                grid.appendChild(
                    card
                );


                updatePageCard(
                    card,
                    pageNumber
                );

            }

        } catch (error) {

            console.error(error);


            pagePreviewArea.innerHTML =
                `
                <p style="
                    color:#dc2626;
                    font-size:14px;
                ">
                    Page previews could not be loaded.
                </p>
                `;

        }

    }



    // ==================================================
    // Toggle Page
    // ==================================================

    function togglePageSelection(
        pageNumber
    ) {

        if (
            selectedPages.has(
                pageNumber
            )
        ) {

            selectedPages.delete(
                pageNumber
            );

        } else {

            selectedPages.add(
                pageNumber
            );

        }


        const pages =
            Array.from(
                selectedPages
            ).sort(
                (a, b) => a - b
            );


        pageInput.value =
            buildPageRanges(
                pages
            );


        pageHint.textContent =
            pages.length
                ? `${pages.length} page${pages.length === 1 ? "" : "s"} selected.`
                : "Example: 1-3, 5, 8-10";


        pageHint.style.color =
            pages.length
                ? "#16a34a"
                : "#6b7280";


        updateSelectionSummary();

        refreshPageCards();

    }



    // ==================================================
    // Refresh Page Cards
    // ==================================================

    function refreshPageCards() {

        const cards =
            pagePreviewArea.querySelectorAll(
                "[data-page]"
            );


        cards.forEach(
            card => {

                const pageNumber =
                    Number(
                        card.dataset.page
                    );


                updatePageCard(
                    card,
                    pageNumber
                );

            }
        );

    }


    function updatePageCard(
        card,
        pageNumber
    ) {

        const badge =
            card.querySelector(
                ".page-selection-badge"
            );


        if (
            selectedPages.has(
                pageNumber
            )
        ) {

            card.style.border =
                "2px solid #111827";


            card.style.boxShadow =
                "0 4px 12px rgba(0,0,0,0.12)";


            if (badge) {

                badge.style.display =
                    "flex";

            }

        } else {

            card.style.border =
                "2px solid #e5e7eb";


            card.style.boxShadow =
                "none";


            if (badge) {

                badge.style.display =
                    "none";

            }

        }

    }



    // ==================================================
    // Large Preview
    // ==================================================

    async function showLargePreview(
        pageNumber
    ) {

        try {

            await loadPdfJs();


            /*
                Again:
                PDF.js receives a COPY.
            */

            const pdfJsData =
                getPdfJsCopy();


            const loadingTask =
                window.pdfjsLib.getDocument({
                    data:
                        pdfJsData
                });


            const pdf =
                await loadingTask.promise;


            const page =
                await pdf.getPage(
                    pageNumber
                );


            const viewport =
                page.getViewport({
                    scale: 1.5
                });


            const canvas =
                document.createElement(
                    "canvas"
                );


            canvas.width =
                viewport.width;


            canvas.height =
                viewport.height;


            canvas.style.cssText =
                `
                max-width:100%;
                max-height:80vh;
                display:block;
                margin:auto;
                background:white;
                `;


            const context =
                canvas.getContext(
                    "2d"
                );


            await page.render({
                canvasContext:
                    context,

                viewport
            }).promise;


            const overlay =
                document.createElement(
                    "div"
                );


            overlay.id =
                "pdfPagePreviewOverlay";


            overlay.style.cssText =
                `
                position:fixed;
                inset:0;
                z-index:9999;
                background:
                    rgba(0,0,0,0.78);
                display:flex;
                align-items:center;
                justify-content:center;
                padding:30px;
                box-sizing:border-box;
                `;


            const container =
                document.createElement(
                    "div"
                );


            container.style.cssText =
                `
                position:relative;
                max-width:95vw;
                max-height:90vh;
                background:white;
                border-radius:12px;
                padding:18px;
                box-sizing:border-box;
                overflow:auto;
                `;


            const title =
                document.createElement(
                    "div"
                );


            title.textContent =
                `Page ${pageNumber}`;


            title.style.cssText =
                `
                font-weight:700;
                margin-bottom:12px;
                text-align:center;
                `;


            const closeButton =
                document.createElement(
                    "button"
                );


            closeButton.type =
                "button";


            closeButton.textContent =
                "×";


            closeButton.style.cssText =
                `
                position:absolute;
                top:6px;
                right:8px;
                width:36px;
                height:36px;
                border:none;
                border-radius:50%;
                background:#111827;
                color:white;
                font-size:25px;
                line-height:1;
                cursor:pointer;
                `;


            closeButton.addEventListener(
                "click",
                closeLargePreview
            );


            container.appendChild(
                closeButton
            );


            container.appendChild(
                title
            );


            container.appendChild(
                canvas
            );


            overlay.appendChild(
                container
            );


            overlay.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        overlay
                    ) {

                        closeLargePreview();

                    }

                }
            );


            document.body.appendChild(
                overlay
            );


            document.addEventListener(
                "keydown",
                handlePreviewEscape
            );


        } catch (error) {

            console.error(error);


            alert(
                "Could not preview this page."
            );

        }

    }



    function handlePreviewEscape(
        event
    ) {

        if (
            event.key === "Escape"
        ) {

            closeLargePreview();

        }

    }


    function closeLargePreview() {

        const overlay =
            document.getElementById(
                "pdfPagePreviewOverlay"
            );


        if (overlay) {

            overlay.remove();

        }


        document.removeEventListener(
            "keydown",
            handlePreviewEscape
        );

    }



    // ==================================================
    // Split Button
    // ==================================================

    splitButton.addEventListener(
        "click",
        async () => {

            if (!currentPdfBytes) {

                alert(
                    "Please choose a PDF file first."
                );

                return;

            }


            if (
                splitMode.value ===
                "extract"
            ) {

                await extractSelectedPages();

            } else {

                await splitEveryNPages();

            }

        }
    );



    // ==================================================
    // Extract Selected Pages
    // ==================================================

    async function extractSelectedPages() {

        let pages;


        try {

            pages =
                parsePageInput(
                    pageInput.value
                );

        } catch (error) {

            alert(
                error.message
            );

            return;

        }


        if (!pages.length) {

            alert(
                "Please select at least one page."
            );

            return;

        }


        try {

            splitButton.disabled =
                true;


            splitButton.textContent =
                "Extracting...";


            clearDownloadArea();


            /*
                PDF-LIB receives its OWN copy.
            */

            const sourcePdf =
                await PDFLib.PDFDocument.load(
                    new Uint8Array(
                        currentPdfBytes
                    )
                );


            const outputPdf =
                await PDFLib.PDFDocument.create();


            const copiedPages =
                await outputPdf.copyPages(
                    sourcePdf,
                    pages.map(
                        page => page - 1
                    )
                );


            copiedPages.forEach(
                page => {

                    outputPdf.addPage(
                        page
                    );

                }
            );


            const outputBytes =
                await outputPdf.save();


            const blob =
                new Blob(
                    [outputBytes],
                    {
                        type:
                            "application/pdf"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const baseName =
                getBaseFileName(
                    currentFile.name
                );


            const outputName =
                `${baseName}-extracted.pdf`;


            showSingleDownload(
                blob,
                url,
                outputName,
                pages
            );


        } catch (error) {

            console.error(error);


            alert(
                "Something went wrong while creating the PDF."
            );

        } finally {

            splitButton.disabled =
                false;


            updateSplitButtonText();

        }

    }



    // ==================================================
    // Split Every N Pages
    // ==================================================

    async function splitEveryNPages() {

        let number =
            Number(
                pagesPerFile.value
            );


        if (
            !Number.isInteger(number) ||
            number < 1
        ) {

            alert(
                "Please enter a valid number of pages."
            );

            return;

        }


        if (
            number > totalPages
        ) {

            number =
                totalPages;


            pagesPerFile.value =
                String(
                    number
                );

        }


        try {

            splitButton.disabled =
                true;


            splitButton.textContent =
                "Splitting...";


            clearDownloadArea();


            /*
                IMPORTANT:

                Always create a fresh PDF-LIB
                source document from a fresh
                copy of the original bytes.
            */

            const sourcePdf =
                await PDFLib.PDFDocument.load(
                    new Uint8Array(
                        currentPdfBytes
                    )
                );


            const outputs = [];


            let fileNumber = 1;


            for (
                let start = 0;
                start < totalPages;
                start += number
            ) {

                const end =
                    Math.min(
                        start + number,
                        totalPages
                    );


                const pageIndexes = [];


                for (
                    let page = start;
                    page < end;
                    page++
                ) {

                    pageIndexes.push(
                        page
                    );

                }


                const outputPdf =
                    await PDFLib.PDFDocument.create();


                const copiedPages =
                    await outputPdf.copyPages(
                        sourcePdf,
                        pageIndexes
                    );


                copiedPages.forEach(
                    page => {

                        outputPdf.addPage(
                            page
                        );

                    }
                );


                const outputBytes =
                    await outputPdf.save();


                const blob =
                    new Blob(
                        [outputBytes],
                        {
                            type:
                                "application/pdf"
                        }
                    );


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const firstPage =
                    start + 1;


                const lastPage =
                    end;


                const baseName =
                    getBaseFileName(
                        currentFile.name
                    );


                const outputName =
                    `${baseName}-part-${fileNumber}.pdf`;


                outputs.push({

                    blob,

                    url,

                    name:
                        outputName,

                    firstPage,

                    lastPage,

                    size:
                        blob.size

                });


                fileNumber++;

            }


            showMultipleDownloads(
                outputs
            );


        } catch (error) {

            console.error(error);


            alert(
                "Something went wrong while splitting the PDF."
            );

        } finally {

            splitButton.disabled =
                false;


            updateSplitButtonText();

        }

    }



    // ==================================================
    // Single Result
    // ==================================================

    function showSingleDownload(
        blob,
        url,
        name,
        pages
    ) {

        downloadArea.innerHTML = "";


        const container =
            document.createElement(
                "div"
            );


        container.style.cssText =
            `
            padding:20px;
            background:#f8f9fa;
            border:1px solid #e5e7eb;
            border-radius:12px;
            text-align:left;
            `;


        container.innerHTML =
            `
            <h3 style="margin-top:0;">
                Split Complete
            </h3>

            <p style="color:#6b7280;">
                ${pages.length}
                page${pages.length === 1 ? "" : "s"}
                extracted •
                ${formatFileSize(blob.size)}
            </p>

            <p>
                <strong>Pages:</strong>
                ${escapeHtml(
                    buildPageRanges(pages)
                )}
            </p>
            `;


        const downloadButton =
            document.createElement(
                "a"
            );


        downloadButton.href =
            url;


        downloadButton.download =
            name;


        downloadButton.textContent =
            "Download PDF";


        downloadButton.style.cssText =
            `
            display:inline-flex;
            align-items:center;
            justify-content:center;
            padding:12px 20px;
            background:#202124;
            color:#ffffff;
            border-radius:10px;
            font-weight:700;
            text-decoration:none;
            cursor:pointer;
            `;


        container.appendChild(
            downloadButton
        );


        addSplitAgainButton(
            container
        );


        downloadArea.appendChild(
            container
        );

    }



    // ==================================================
    // Multiple Results
    // ==================================================

    function showMultipleDownloads(
        outputs
    ) {

        downloadArea.innerHTML = "";


        const container =
            document.createElement(
                "div"
            );


        container.style.cssText =
            `
            text-align:left;
            `;


        const heading =
            document.createElement(
                "h3"
            );


        heading.textContent =
            "Split Complete";


        container.appendChild(
            heading
        );


        const summary =
            document.createElement(
                "p"
            );


        summary.style.color =
            "#6b7280";


        summary.textContent =
            `Created ${outputs.length} PDF${outputs.length === 1 ? "" : "s"}.`;


        container.appendChild(
            summary
        );


        // ----------------------------------------------
        // Download All
        // ----------------------------------------------

        if (outputs.length > 1) {

            const downloadAllButton =
                document.createElement(
                    "button"
                );


            downloadAllButton.type =
                "button";


            downloadAllButton.textContent =
                "📦 Download All";


            downloadAllButton.style.cssText =
                `
                display:inline-flex;
                align-items:center;
                justify-content:center;
                padding:12px 20px;
                margin-bottom:10px;
                background:#202124;
                color:#ffffff;
                border:none;
                border-radius:10px;
                font-weight:700;
                font-size:14px;
                cursor:pointer;
                `;


            downloadAllButton.addEventListener(
                "click",
                async () => {

                    await downloadAllAsZip(
                        outputs,
                        downloadAllButton
                    );

                }
            );


            container.appendChild(
                downloadAllButton
            );


            const zipHint =
                document.createElement(
                    "p"
                );


            zipHint.textContent =
                "Download all generated PDFs as one ZIP file.";


            zipHint.style.cssText =
                `
                color:#6b7280;
                font-size:13px;
                margin-top:0;
                margin-bottom:15px;
                `;


            container.appendChild(
                zipHint
            );

        }



        // ----------------------------------------------
        // Individual PDF Cards
        // ----------------------------------------------

        outputs.forEach(
            (output, index) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.style.cssText =
                    `
                    padding:16px;
                    margin-top:12px;
                    background:#f8f9fa;
                    border:1px solid #e5e7eb;
                    border-radius:12px;
                    `;


                const title =
                    document.createElement(
                        "strong"
                    );


                title.textContent =
                    `${index + 1}. ${output.name}`;


                card.appendChild(
                    title
                );


                const info =
                    document.createElement(
                        "p"
                    );


                info.style.cssText =
                    `
                    margin:8px 0 12px;
                    color:#6b7280;
                    font-size:14px;
                    `;


                info.textContent =
                    `Pages ${output.firstPage}-${output.lastPage} • ${formatFileSize(output.size)}`;


                card.appendChild(
                    info
                );


                const downloadButton =
                    document.createElement(
                        "a"
                    );


                downloadButton.href =
                    output.url;


                downloadButton.download =
                    output.name;


                downloadButton.textContent =
                    "Download PDF";


                downloadButton.style.cssText =
                    `
                    display:inline-flex;
                    align-items:center;
                    justify-content:center;
                    padding:10px 16px;
                    background:#202124;
                    color:#ffffff;
                    border-radius:9px;
                    font-weight:700;
                    text-decoration:none;
                    cursor:pointer;
                    font-size:14px;
                    `;


                card.appendChild(
                    downloadButton
                );


                container.appendChild(
                    card
                );

            }
        );


        addSplitAgainButton(
            container
        );


        downloadArea.appendChild(
            container
        );

    }



    // ==================================================
    // Download All as ZIP
    // ==================================================

    async function downloadAllAsZip(
        outputs,
        button
    ) {

        if (!window.JSZip) {

            alert(
                "ZIP support could not be loaded. Please refresh the page and try again."
            );

            return;

        }


        try {

            button.disabled =
                true;


            button.textContent =
                "📦 Creating ZIP...";


            const zip =
                new JSZip();


            outputs.forEach(
                output => {

                    zip.file(
                        output.name,
                        output.blob
                    );

                }
            );


            const zipBlob =
                await zip.generateAsync(

                    {
                        type:
                            "blob",

                        compression:
                            "DEFLATE",

                        compressionOptions:
                            {
                                level: 6
                            }
                    },

                    metadata => {

                        const percent =
                            Math.round(
                                metadata.percent
                            );


                        button.textContent =
                            `📦 Creating ZIP... ${percent}%`;

                    }

                );


            const zipUrl =
                URL.createObjectURL(
                    zipBlob
                );


            const baseName =
                getBaseFileName(
                    currentFile.name
                );


            const zipName =
                `${baseName}-split-files.zip`;


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                zipUrl;


            link.download =
                zipName;


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            setTimeout(
                () => {

                    URL.revokeObjectURL(
                        zipUrl
                    );

                },
                1000
            );


            button.textContent =
                "✅ ZIP Downloaded";


            setTimeout(
                () => {

                    button.textContent =
                        "📦 Download All";


                    button.disabled =
                        false;

                },
                2000
            );


        } catch (error) {

            console.error(error);


            button.textContent =
                "📦 Download All";


            button.disabled =
                false;


            alert(
                "Could not create the ZIP file. Please try again."
            );

        }

    }



    // ==================================================
    // Split Again
    // ==================================================

    function addSplitAgainButton(
        container
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.style.marginTop =
            "15px";


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.textContent =
            "Split Again";


        button.addEventListener(
            "click",
            () => {

                clearDownloadArea();


                window.scrollTo({

                    top:
                        splitControls.offsetTop,

                    behavior:
                        "smooth"

                });

            }
        );


        wrapper.appendChild(
            button
        );


        container.appendChild(
            wrapper
        );

    }



    // ==================================================
    // Initial State
    // ==================================================

    updateModeUI();

});