/* =========================================================
   LifeKit PDF Compress
   ========================================================= */

const dropZone = document.getElementById("dropZone");
const choosePdfButton = document.getElementById("choosePdfButton");
const pdfInput = document.getElementById("pdfInput");

const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const fileDetails = document.getElementById("fileDetails");

const compressionOptions =
    document.getElementById("compressionOptions");

const compressButton =
    document.getElementById("compressButton");

const progressArea =
    document.getElementById("progressArea");

const progressBar =
    document.getElementById("progressBar");

const progressText =
    document.getElementById("progressText");

const resultArea =
    document.getElementById("resultArea");

const originalSize =
    document.getElementById("originalSize");

const compressedSize =
    document.getElementById("compressedSize");

const sizeChange =
    document.getElementById("sizeChange");

const sizePercentage =
    document.getElementById("sizePercentage");

const sizeBar =
    document.getElementById("sizeBar");

const savings =
    document.getElementById("savings");

const compressionMethod =
    document.getElementById("compressionMethod");

const resultMessage =
    document.getElementById("resultMessage");

const downloadArea =
    document.getElementById("downloadArea");

const downloadButton =
    document.getElementById("downloadButton");

const compressAnotherButton =
    document.getElementById("compressAnotherButton");


let selectedFile = null;
let downloadUrl = null;


/* =========================================================
   Utility
   ========================================================= */

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


function wait(ms = 20) {

    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

}


function showElement(element) {

    if (!element) {
        return;
    }

    element.hidden = false;

    if (element === progressArea) {
        element.style.display = "block";
    }

    if (element === resultArea) {
        element.style.display = "block";
    }

    if (element === compressionOptions) {
        element.style.display = "block";
    }

}


function hideElement(element) {

    if (!element) {
        return;
    }

    element.hidden = true;
    element.style.display = "none";

}


function setProgress(percent, message) {

    if (progressBar) {
        progressBar.style.width =
            `${Math.max(0, Math.min(100, percent))}%`;
    }

    if (progressText && message) {
        progressText.textContent = message;
    }

}


function clearDownload() {

    if (downloadUrl) {

        URL.revokeObjectURL(downloadUrl);

        downloadUrl = null;
    }

    if (downloadButton) {

        downloadButton.removeAttribute("href");

        downloadButton.removeAttribute("download");
    }

}


/* =========================================================
   Compression settings
   ========================================================= */

function getCompressionSettings() {

    const selected =
        document.querySelector(
            'input[name="compressionLevel"]:checked'
        );

    const level =
        selected
            ? selected.value
            : "balanced";


    if (level === "smaller") {

        return {
            level: "smaller",
            scale: 1.25,
            quality: 0.68,
            maxDimension: 1800
        };

    }


    if (level === "maximum") {

        return {
            level: "maximum",
            scale: 0.85,
            quality: 0.45,
            maxDimension: 1400
        };

    }


    return {
        level: "balanced",
        scale: 1.45,
        quality: 0.76,
        maxDimension: 2000
    };

}


/* =========================================================
   Load PDF with PDF.js
   ========================================================= */

async function loadPdf(file) {

    if (typeof pdfjsLib === "undefined") {

        throw new Error(
            "PDF.js is not available."
        );

    }


    const bytes =
        new Uint8Array(
            await file.arrayBuffer()
        );


    const loadingTask =
        pdfjsLib.getDocument({
            data: bytes,
            disableWorker: true
        });


    return loadingTask.promise;

}


/* =========================================================
   Get PDF page count
   ========================================================= */

async function getPdfPageCount(file) {

    const pdf =
        await loadPdf(file);

    return pdf.numPages;

}


/* =========================================================
   Analyze PDF
   ========================================================= */

async function analyzePdf(file) {

    const pdf =
        await loadPdf(file);

    const pageCount =
        pdf.numPages;

    let textPages = 0;
    let imagePages = 0;

    let totalTextItems = 0;
    let totalImages = 0;


    for (
        let pageNumber = 1;
        pageNumber <= pageCount;
        pageNumber++
    ) {

        setProgress(
            Math.round((pageNumber / pageCount) * 25),
            `Analyzing page ${pageNumber} of ${pageCount}...`
        );

        await wait(10);


        const page =
            await pdf.getPage(pageNumber);


        try {

            const textContent =
                await page.getTextContent();

            const textItems =
                textContent.items
                    ? textContent.items.length
                    : 0;


            totalTextItems +=
                textItems;


            const operatorList =
                await page.getOperatorList();


            let pageImages = 0;


            if (
                operatorList &&
                operatorList.fnArray
            ) {

                for (
                    const fn of operatorList.fnArray
                ) {

                    if (
                        fn ===
                        pdfjsLib.OPS.paintImageXObject
                    ) {

                        pageImages++;

                    }


                    if (
                        fn ===
                        pdfjsLib.OPS.paintImageXObjectRepeat
                    ) {

                        pageImages++;

                    }

                }

            }


            totalImages +=
                pageImages;


            if (
                pageImages > 0 &&
                textItems <= 8
            ) {

                imagePages++;

            } else if (
                textItems > 0
            ) {

                textPages++;

            }


        } catch (error) {

            console.warn(
                "PDF analysis warning:",
                error
            );

        } finally {

            page.cleanup();

        }

    }


    let type = "mixed";


    if (
        imagePages >=
        Math.max(1, pageCount * 0.6)
    ) {

        type = "image";

    } else if (
        textPages >=
        Math.max(1, pageCount * 0.6)
    ) {

        type = "text";

    }


    return {
        pageCount,
        textPages,
        imagePages,
        totalTextItems,
        totalImages,
        type
    };

}


/* =========================================================
   Render PDF page as JPEG
   ========================================================= */

async function renderPageToJpeg(page, settings) {

    const baseViewport =
        page.getViewport({
            scale: 1
        });


    let scale =
        settings.scale;


    const naturalWidth =
        baseViewport.width * scale;

    const naturalHeight =
        baseViewport.height * scale;


    const largest =
        Math.max(
            naturalWidth,
            naturalHeight
        );


    if (
        largest >
        settings.maxDimension
    ) {

        scale =
            settings.maxDimension /
            Math.max(
                baseViewport.width,
                baseViewport.height
            );

    }


    scale =
        Math.max(
            scale,
            0.5
        );


    const viewport =
        page.getViewport({
            scale
        });


    const canvas =
        document.createElement("canvas");


    canvas.width =
        Math.max(
            1,
            Math.round(viewport.width)
        );


    canvas.height =
        Math.max(
            1,
            Math.round(viewport.height)
        );


    const context =
        canvas.getContext(
            "2d",
            {
                alpha: false
            }
        );


    if (!context) {

        throw new Error(
            "Canvas is not supported."
        );

    }


    context.fillStyle =
        "#ffffff";


    context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    await page.render({
        canvasContext: context,
        viewport: viewport
    }).promise;


    const blob =
        await new Promise((resolve) => {

            canvas.toBlob(
                resolve,
                "image/jpeg",
                settings.quality
            );

        });


    if (!blob) {

        throw new Error(
            "JPEG encoding failed."
        );

    }


    return {
        blob,
        width: canvas.width,
        height: canvas.height
    };

}


/* =========================================================
   Create image-based PDF
   ========================================================= */

async function createImagePdf(file, settings) {

    if (
        typeof PDFLib === "undefined" ||
        !PDFLib.PDFDocument
    ) {

        throw new Error(
            "PDF-LIB is not available."
        );

    }


    const sourcePdf =
        await loadPdf(file);


    const outputPdf =
        await PDFLib.PDFDocument.create();


    for (
        let pageNumber = 1;
        pageNumber <= sourcePdf.numPages;
        pageNumber++
    ) {

        const percentage =
            25 +
            Math.round(
                (pageNumber / sourcePdf.numPages) * 65
            );


        setProgress(
            percentage,
            `Compressing page ${pageNumber} of ${sourcePdf.numPages}...`
        );


        await wait(20);


        const page =
            await sourcePdf.getPage(pageNumber);


        try {

            const image =
                await renderPageToJpeg(
                    page,
                    settings
                );


            const imageBytes =
                new Uint8Array(
                    await image.blob.arrayBuffer()
                );


            const embeddedImage =
                await outputPdf.embedJpg(
                    imageBytes
                );


            const outputPage =
                outputPdf.addPage([
                    image.width,
                    image.height
                ]);


            outputPage.drawImage(
                embeddedImage,
                {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height
                }
            );


        } finally {

            page.cleanup();

        }

    }


    return outputPdf.save({
        useObjectStreams: true,
        addDefaultPage: false
    });

}


/* =========================================================
   Optimize PDF structure
   ========================================================= */

async function optimizePdfStructure(file) {

    if (
        typeof PDFLib === "undefined" ||
        !PDFLib.PDFDocument
    ) {

        throw new Error(
            "PDF-LIB is not available."
        );

    }


    setProgress(
        35,
        "Optimizing PDF structure..."
    );


    await wait(50);


    const bytes =
        new Uint8Array(
            await file.arrayBuffer()
        );


    const sourcePdf =
        await PDFLib.PDFDocument.load(
            bytes,
            {
                ignoreEncryption: true,
                updateMetadata: false
            }
        );


    const outputPdf =
        await PDFLib.PDFDocument.create();


    const pages =
        await outputPdf.copyPages(
            sourcePdf,
            sourcePdf.getPageIndices()
        );


    pages.forEach((page) => {

        outputPdf.addPage(page);

    });


    return outputPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50
    });

}


/* =========================================================
   Smart compression
   ========================================================= */

async function smartCompress(file, settings) {

    const analysis =
        await analyzePdf(file);


    console.log(
        "LifeKit PDF analysis:",
        analysis
    );


    /* IMAGE PDF */

    if (analysis.type === "image") {

        setProgress(
            30,
            "Image-heavy PDF detected. Compressing images..."
        );


        await wait(250);


        const compressed =
            await createImagePdf(
                file,
                settings
            );


        return {
            bytes: compressed,
            method: "image"
        };

    }


    /* TEXT PDF */

    if (analysis.type === "text") {

        setProgress(
            35,
            "Text-based PDF detected. Optimizing structure..."
        );


        await wait(250);


        const optimized =
            await optimizePdfStructure(file);


        if (
            optimized.length <
            file.size
        ) {

            return {
                bytes: optimized,
                method: "structure"
            };

        }


        setProgress(
            40,
            "Trying stronger compression..."
        );


        await wait(250);


        const fallback =
            await createImagePdf(
                file,
                settings
            );


        if (
            fallback.length <
            file.size
        ) {

            return {
                bytes: fallback,
                method: "image-fallback"
            };

        }


        return {
            bytes:
                new Uint8Array(
                    await file.arrayBuffer()
                ),
            method: "original"
        };

    }


    /* MIXED PDF */

    setProgress(
        35,
        "Mixed PDF detected. Testing compression methods..."
    );


    await wait(250);


    const optimized =
        await optimizePdfStructure(file);


    if (
        optimized.length <
        file.size
    ) {

        return {
            bytes: optimized,
            method: "structure"
        };

    }


    setProgress(
        40,
        "Trying image compression..."
    );


    await wait(250);


    const imageCompressed =
        await createImagePdf(
            file,
            settings
        );


    if (
        imageCompressed.length <
        file.size
    ) {

        return {
            bytes: imageCompressed,
            method: "image"
        };

    }


    return {
        bytes:
            new Uint8Array(
                await file.arrayBuffer()
            ),
        method: "original"
    };

}


/* =========================================================
   Show result
   ========================================================= */

function showResult(
    originalBytes,
    finalBytes,
    method
) {

    const original =
        originalBytes.length;

    const compressed =
        finalBytes.length;


    const saved =
        Math.max(
            0,
            original - compressed
        );


    const percentage =
        original > 0
            ? (saved / original) * 100
            : 0;


    const remainingPercentage =
        original > 0
            ? (compressed / original) * 100
            : 100;


    if (originalSize) {

        originalSize.textContent =
            formatFileSize(original);

    }


    if (compressedSize) {

        compressedSize.textContent =
            formatFileSize(compressed);

    }


    if (sizeChange) {

        sizeChange.textContent =
            `${percentage.toFixed(1)}% smaller`;

    }


    if (sizePercentage) {

        sizePercentage.textContent =
            `${remainingPercentage.toFixed(1)}% of original`;

    }


    if (sizeBar) {

        sizeBar.style.width =
            `${Math.max(
                0,
                Math.min(
                    100,
                    remainingPercentage
                )
            )}%`;

    }


    if (savings) {

        savings.textContent =
            `${formatFileSize(saved)} (${percentage.toFixed(1)}%)`;

    }


    /* Method */

    if (compressionMethod) {

        if (
            method === "image" ||
            method === "image-fallback"
        ) {

            compressionMethod.textContent =
                "Smart image compression";

        } else if (
            method === "structure"
        ) {

            compressionMethod.textContent =
                "PDF structure optimization";

        } else {

            compressionMethod.textContent =
                "Original PDF retained";

        }

    }


    /* Message */

    if (resultMessage) {

        if (saved > 0) {

            if (percentage >= 50) {

                resultMessage.textContent =
                    "Excellent reduction. The PDF was significantly reduced in size.";

            } else if (percentage >= 20) {

                resultMessage.textContent =
                    "Good compression. The PDF was successfully reduced.";

            } else {

                resultMessage.textContent =
                    "The PDF was reduced, although the size difference is relatively small.";

            }

        } else {

            resultMessage.textContent =
                "The compressed version was not smaller, so LifeKit kept the original PDF.";

        }

    }

}


/* =========================================================
   Handle PDF file
   ========================================================= */

async function handleFile(file) {

    if (!file) {
        return;
    }


    const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");


    if (!isPdf) {

        alert(
            "Please select a PDF file."
        );

        return;

    }


    selectedFile =
        file;


    if (fileName) {

        fileName.textContent =
            file.name;

    }


    if (fileDetails) {

        fileDetails.textContent =
            `${formatFileSize(file.size)} • Reading PDF...`;

    }


    showElement(fileInfo);

    hideElement(resultArea);

    hideElement(downloadArea);

    clearDownload();


    compressButton.disabled =
        true;


    showElement(progressArea);


    setProgress(
        5,
        "Reading PDF information..."
    );


    try {

        const pageCount =
            await getPdfPageCount(file);


        if (fileDetails) {

            fileDetails.textContent =
                `${formatFileSize(file.size)} • ${pageCount} ${
                    pageCount === 1
                        ? "page"
                        : "pages"
                }`;

        }


        hideElement(progressArea);

        showElement(compressionOptions);


        compressButton.disabled =
            false;


        setProgress(100, "PDF ready.");


    } catch (error) {

        console.error(
            "PDF reading failed:",
            error
        );


        selectedFile =
            null;


        hideElement(progressArea);

        hideElement(compressionOptions);


        compressButton.disabled =
            true;


        alert(
            "This PDF could not be read.\n\n" +
            (
                error.message ||
                "Please try another PDF."
            )
        );

    }

}


/* =========================================================
   Choose PDF
   ========================================================= */

if (choosePdfButton && pdfInput) {

    choosePdfButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            pdfInput.click();

        }
    );

}


/* =========================================================
   File input
   ========================================================= */

if (pdfInput) {

    pdfInput.addEventListener(
        "change",
        () => {

            if (
                pdfInput.files &&
                pdfInput.files.length > 0
            ) {

                handleFile(
                    pdfInput.files[0]
                );

            }

        }
    );

}


/* =========================================================
   Drag & Drop
   ========================================================= */

if (dropZone) {

    dropZone.addEventListener(
        "dragenter",
        (event) => {

            event.preventDefault();

            event.stopPropagation();

            dropZone.classList.add(
                "drag-over"
            );

        }
    );


    dropZone.addEventListener(
        "dragover",
        (event) => {

            event.preventDefault();

            event.stopPropagation();

            if (
                event.dataTransfer
            ) {

                event.dataTransfer.dropEffect =
                    "copy";

            }

            dropZone.classList.add(
                "drag-over"
            );

        }
    );


    dropZone.addEventListener(
        "dragleave",
        (event) => {

            event.preventDefault();

            event.stopPropagation();

            if (
                event.relatedTarget &&
                dropZone.contains(
                    event.relatedTarget
                )
            ) {

                return;

            }

            dropZone.classList.remove(
                "drag-over"
            );

        }
    );


    dropZone.addEventListener(
        "drop",
        (event) => {

            event.preventDefault();

            event.stopPropagation();


            dropZone.classList.remove(
                "drag-over"
            );


            const files =
                event.dataTransfer
                    ? event.dataTransfer.files
                    : null;


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

}


/* =========================================================
   Compress PDF
   ========================================================= */

if (compressButton) {

    compressButton.addEventListener(
        "click",
        async () => {

            if (!selectedFile) {

                alert(
                    "Please choose a PDF file first."
                );

                return;

            }


            compressButton.disabled =
                true;


            hideElement(resultArea);

            hideElement(downloadArea);

            showElement(progressArea);


            setProgress(
                5,
                "Smart compression is analyzing your PDF..."
            );


            try {

                const settings =
                    getCompressionSettings();


                const originalBytes =
                    new Uint8Array(
                        await selectedFile.arrayBuffer()
                    );


                const result =
                    await smartCompress(
                        selectedFile,
                        settings
                    );


                setProgress(
                    95,
                    "Checking final file size..."
                );


                await wait(200);


                let finalBytes =
                    result.bytes;


                /*
                 * Never return a file larger
                 * than the original.
                 */

                if (
                    finalBytes.length >=
                    originalBytes.length
                ) {

                    finalBytes =
                        originalBytes;


                    result.method =
                        "original";

                }


                showResult(
                    originalBytes,
                    finalBytes,
                    result.method
                );


                clearDownload();


                const blob =
                    new Blob(
                        [finalBytes],
                        {
                            type:
                                "application/pdf"
                        }
                    );


                downloadUrl =
                    URL.createObjectURL(
                        blob
                    );


                const baseName =
                    selectedFile.name.replace(
                        /\.pdf$/i,
                        ""
                    );


                if (downloadButton) {

                    downloadButton.href =
                        downloadUrl;

                    downloadButton.download =
                        `${baseName}-compressed.pdf`;

                }


                hideElement(progressArea);

                showElement(downloadArea);

                showElement(resultArea);


                setProgress(
                    100,
                    "Compression complete."
                );


                resultArea.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });


            } catch (error) {

                console.error(
                    "PDF compression failed:",
                    error
                );


                hideElement(progressArea);


                alert(
                    "PDF compression failed.\n\n" +
                    (
                        error.message ||
                        "Unknown error."
                    )
                );


            } finally {

                compressButton.disabled =
                    false;

            }

        }
    );

}


/* =========================================================
   Compress Another PDF
   ========================================================= */

if (compressAnotherButton) {

    compressAnotherButton.addEventListener(
        "click",
        () => {

            selectedFile =
                null;


            if (pdfInput) {

                pdfInput.value =
                    "";

            }


            hideElement(fileInfo);

            hideElement(compressionOptions);

            hideElement(progressArea);

            hideElement(resultArea);

            hideElement(downloadArea);


            clearDownload();


            compressButton.disabled =
                true;


            if (fileName) {

                fileName.textContent =
                    "No file selected";

            }


            if (fileDetails) {

                fileDetails.textContent =
                    "0 B";

            }


            if (dropZone) {

                dropZone.classList.remove(
                    "drag-over"
                );

            }


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


/* =========================================================
   Compression option styling
   ========================================================= */

const compressionRadios =
    document.querySelectorAll(
        'input[name="compressionLevel"]'
    );


function updateCompressionOptionStyles() {

    compressionRadios.forEach(
        (radio) => {

            const label =
                radio.closest("label");


            if (!label) {
                return;
            }


            if (radio.checked) {

                label.style.border =
                    "2px solid #202124";

                label.style.background =
                    "#f8f9fa";

            } else {

                label.style.border =
                    "1px solid #e5e7eb";

                label.style.background =
                    "#ffffff";

            }

        }
    );

}


compressionRadios.forEach(
    (radio) => {

        radio.addEventListener(
            "change",
            updateCompressionOptionStyles
        );

    }
);


updateCompressionOptionStyles();


/* =========================================================
   Initial state
   ========================================================= */

hideElement(progressArea);

hideElement(resultArea);

hideElement(downloadArea);

hideElement(compressionOptions);


compressButton.disabled =
    true;


console.log(
    "LifeKit PDF Compress loaded successfully."
);