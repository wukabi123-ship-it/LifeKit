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

const compressButton =
    document.getElementById("compressButton");

const progressArea =
    document.getElementById("progressArea");

const progressText =
    document.getElementById("progressText");

const resultArea =
    document.getElementById("resultArea");

const savingsTitle =
    document.getElementById("savingsTitle");

const savingsSubtitle =
    document.getElementById("savingsSubtitle");

const originalSize =
    document.getElementById("originalSize");

const compressedSize =
    document.getElementById("compressedSize");

const savingsCard =
    document.getElementById("savingsCard");

const savingsAmount =
    document.getElementById("savingsAmount");

const sizeChange =
    document.getElementById("sizeChange");

const sizeBar =
    document.getElementById("sizeBar");

const compressionMethodText =
    document.getElementById(
        "compressionMethodText"
    );

const compressionMessageIcon =
    document.getElementById(
        "compressionMessageIcon"
    );

const compressionMessageTitle =
    document.getElementById(
        "compressionMessageTitle"
    );

const compressionMessageText =
    document.getElementById(
        "compressionMessageText"
    );

const downloadArea =
    document.getElementById("downloadArea");

const downloadButton =
    document.getElementById("downloadButton");

const compressAnotherButton =
    document.getElementById(
        "compressAnotherButton"
    );


let selectedFile = null;

let downloadUrl = null;


/* =========================================================
   Basic helpers
========================================================= */

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return `${bytes} B`;

    }


    if (
        bytes <
        1024 * 1024
    ) {

        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;

    }


    if (
        bytes <
        1024 * 1024 * 1024
    ) {

        return `${(
            bytes /
            (1024 * 1024)
        ).toFixed(2)} MB`;

    }


    return `${(
        bytes /
        (1024 * 1024 * 1024)
    ).toFixed(2)} GB`;
}


function wait(ms = 20) {

    return new Promise(
        (resolve) => {

            setTimeout(
                resolve,
                ms
            );

        }
    );
}


function clearDownload() {

    if (downloadUrl) {

        URL.revokeObjectURL(
            downloadUrl
        );

        downloadUrl = null;

    }


    downloadButton.removeAttribute(
        "href"
    );

    downloadButton.removeAttribute(
        "download"
    );
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


    if (
        level === "smaller"
    ) {

        return {

            level:
                "smaller",

            scale:
                1.25,

            quality:
                0.68,

            maxDimension:
                1800

        };

    }


    if (
        level === "maximum"
    ) {

        return {

            level:
                "maximum",

            scale:
                0.85,

            quality:
                0.45,

            maxDimension:
                1400

        };

    }


    return {

        level:
            "balanced",

        scale:
            1.45,

        quality:
            0.76,

        maxDimension:
            2000

    };
}


/* =========================================================
   Load PDF with PDF.js
========================================================= */

async function loadPdf(file) {

    if (
        typeof pdfjsLib ===
        "undefined"
    ) {

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

            data:
                bytes,

            disableWorker:
                true

        });


    return loadingTask.promise;
}


/* =========================================================
   Get page count
========================================================= */

async function getPdfPageCount(
    file
) {

    const pdf =
        await loadPdf(
            file
        );


    return pdf.numPages;
}


/* =========================================================
   Analyze PDF
========================================================= */

async function analyzePdf(
    file
) {

    const pdf =
        await loadPdf(
            file
        );


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

        progressText.textContent =
            `Analyzing page ${pageNumber} of ${pageCount}...`;


        await wait(10);


        const page =
            await pdf.getPage(
                pageNumber
            );


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
                    const fn
                    of operatorList.fnArray
                ) {

                    if (
                        fn ===
                        pdfjsLib.OPS
                            .paintImageXObject
                    ) {

                        pageImages++;

                    }


                    if (
                        fn ===
                        pdfjsLib.OPS
                            .paintImageXObjectRepeat
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


    let type =
        "mixed";


    if (
        imagePages >=
        Math.max(
            1,
            pageCount * 0.6
        )
    ) {

        type =
            "image";

    } else if (
        textPages >=
        Math.max(
            1,
            pageCount * 0.6
        )
    ) {

        type =
            "text";

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
   Render page as JPEG
========================================================= */

async function renderPageToJpeg(
    page,
    settings
) {

    const baseViewport =
        page.getViewport({
            scale:
                1
        });


    let scale =
        settings.scale;


    const naturalWidth =
        baseViewport.width *
        scale;


    const naturalHeight =
        baseViewport.height *
        scale;


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
        document.createElement(
            "canvas"
        );


    canvas.width =
        Math.max(
            1,
            Math.round(
                viewport.width
            )
        );


    canvas.height =
        Math.max(
            1,
            Math.round(
                viewport.height
            )
        );


    const context =
        canvas.getContext(
            "2d",
            {
                alpha:
                    false
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

        canvasContext:
            context,

        viewport:
            viewport

    }).promise;


    const blob =
        await new Promise(
            (resolve) => {

                canvas.toBlob(
                    resolve,

                    "image/jpeg",

                    settings.quality
                );

            }
        );


    if (!blob) {

        throw new Error(
            "JPEG encoding failed."
        );

    }


    return {

        blob:

            blob,

        width:

            canvas.width,

        height:

            canvas.height

    };
}


/* =========================================================
   Create image PDF
========================================================= */

async function createImagePdf(
    file,
    settings
) {

    if (
        typeof PDFLib ===
            "undefined" ||
        !PDFLib.PDFDocument
    ) {

        throw new Error(
            "PDF-LIB is not available."
        );

    }


    const sourcePdf =
        await loadPdf(
            file
        );


    const outputPdf =
        await PDFLib.PDFDocument
            .create();


    for (
        let pageNumber = 1;
        pageNumber <=
            sourcePdf.numPages;
        pageNumber++
    ) {

        progressText.textContent =
            `Compressing page ${pageNumber} of ${sourcePdf.numPages}...`;


        await wait(20);


        const page =
            await sourcePdf.getPage(
                pageNumber
            );


        try {

            const image =
                await renderPageToJpeg(
                    page,
                    settings
                );


            const imageBytes =
                new Uint8Array(
                    await image.blob
                        .arrayBuffer()
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

                    x:
                        0,

                    y:
                        0,

                    width:
                        image.width,

                    height:
                        image.height

                }
            );

        } finally {

            page.cleanup();

        }

    }


    return outputPdf.save({

        useObjectStreams:
            true,

        addDefaultPage:
            false

    });
}


/* =========================================================
   Optimize PDF structure
========================================================= */

async function optimizePdfStructure(
    file
) {

    if (
        typeof PDFLib ===
            "undefined" ||
        !PDFLib.PDFDocument
    ) {

        throw new Error(
            "PDF-LIB is not available."
        );

    }


    progressText.textContent =
        "Optimizing PDF structure...";


    await wait(50);


    const bytes =
        new Uint8Array(
            await file.arrayBuffer()
        );


    const sourcePdf =
        await PDFLib.PDFDocument.load(
            bytes,
            {

                ignoreEncryption:
                    true,

                updateMetadata:
                    false

            }
        );


    const outputPdf =
        await PDFLib.PDFDocument
            .create();


    const pages =
        await outputPdf.copyPages(
            sourcePdf,
            sourcePdf.getPageIndices()
        );


    pages.forEach(
        (page) => {

            outputPdf.addPage(
                page
            );

        }
    );


    return outputPdf.save({

        useObjectStreams:
            true,

        addDefaultPage:
            false,

        objectsPerTick:
            50

    });
}


/* =========================================================
   Smart compression
========================================================= */

async function smartCompress(
    file,
    settings
) {

    const analysis =
        await analyzePdf(
            file
        );


    console.log(
        "LifeKit PDF analysis:",
        analysis
    );


    /*
     * IMAGE PDF
     */

    if (
        analysis.type ===
        "image"
    ) {

        progressText.textContent =
            "Image-heavy PDF detected. Compressing images...";


        await wait(250);


        const compressed =
            await createImagePdf(
                file,
                settings
            );


        return {

            bytes:
                compressed,

            method:
                "image"

        };

    }


    /*
     * TEXT PDF
     */

    if (
        analysis.type ===
        "text"
    ) {

        progressText.textContent =
            "Text-based PDF detected. Optimizing structure...";


        await wait(250);


        const optimized =
            await optimizePdfStructure(
                file
            );


        if (
            optimized.length <
            file.size
        ) {

            return {

                bytes:
                    optimized,

                method:
                    "structure"

            };

        }


        /*
         * Try stronger image
         * compression as fallback.
         */

        progressText.textContent =
            "Trying stronger compression...";


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

                bytes:
                    fallback,

                method:
                    "image-fallback"

            };

        }


        return {

            bytes:
                new Uint8Array(
                    await file.arrayBuffer()
                ),

            method:
                "original"

        };

    }


    /*
     * MIXED PDF
     */

    progressText.textContent =
        "Mixed PDF detected. Testing compression methods...";


    await wait(250);


    const optimized =
        await optimizePdfStructure(
            file
        );


    if (
        optimized.length <
        file.size
    ) {

        return {

            bytes:
                optimized,

            method:
                "structure"

        };

    }


    progressText.textContent =
        "Trying image compression...";


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

            bytes:
                imageCompressed,

            method:
                "image"

        };

    }


    return {

        bytes:
            new Uint8Array(
                await file.arrayBuffer()
            ),

        method:
            "original"

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
            original -
                compressed
        );


    const percentage =
        original > 0
            ? (
                saved /
                original
            ) * 100
            : 0;


    originalSize.textContent =
        formatFileSize(
            original
        );


    compressedSize.textContent =
        formatFileSize(
            compressed
        );


    savingsAmount.textContent =
        formatFileSize(
            saved
        );


    const remainingPercentage =
        original > 0
            ? (
                compressed /
                original
            ) * 100
            : 100;


    sizeBar.style.width =
        `${Math.max(
            0,
            Math.min(
                100,
                remainingPercentage
            )
        )}%`;


    if (
        saved > 0
    ) {

        savingsTitle.textContent =
            `${percentage.toFixed(
                1
            )}% smaller`;


        savingsSubtitle.textContent =
            `You saved ${formatFileSize(
                saved
            )} of storage.`;


        sizeChange.textContent =
            `${percentage.toFixed(
                1
            )}% smaller`;


        if (
            method ===
                "image" ||
            method ===
                "image-fallback"
        ) {

            compressionMethodText.textContent =
                "Smart image compression";

            compressionMessageIcon.textContent =
                "🖼️";

            compressionMessageTitle.textContent =
                "Image compression applied";

            compressionMessageText.textContent =
                "LifeKit detected an image-heavy PDF and reduced the page image quality to make the file smaller.";

        } else if (
            method ===
            "structure"
        ) {

            compressionMethodText.textContent =
                "PDF structure optimization";

            compressionMessageIcon.textContent =
                "🟢";

            compressionMessageTitle.textContent =
                "PDF optimized";

            compressionMessageText.textContent =
                "LifeKit reduced the PDF size while keeping its original PDF structure.";

        } else {

            compressionMethodText.textContent =
                "Smart PDF compression";

            compressionMessageIcon.textContent =
                "🟢";

            compressionMessageTitle.textContent =
                "Good compression";

            compressionMessageText.textContent =
                "LifeKit successfully reduced the PDF file size.";

        }


        if (
            percentage >=
            50
        ) {

            compressionMessageIcon.textContent =
                "🚀";

            compressionMessageTitle.textContent =
                "Excellent reduction";

        } else if (
            percentage >=
            20
        ) {

            compressionMessageIcon.textContent =
                "🟢";

            compressionMessageTitle.textContent =
                "Good compression";

        } else {

            compressionMessageIcon.textContent =
                "🟡";

            compressionMessageTitle.textContent =
                "Small reduction";

        }


    } else {

        savingsTitle.textContent =
            "Already optimized";


        savingsSubtitle.textContent =
            "LifeKit could not safely make this PDF smaller.";


        sizeChange.textContent =
            "0% smaller";


        savingsAmount.textContent =
            "0 B";


        sizeBar.style.width =
            "100%";


        compressionMethodText.textContent =
            "Original PDF retained";


        compressionMessageIcon.textContent =
            "ℹ️";


        compressionMessageTitle.textContent =
            "Original file kept";


        compressionMessageText.textContent =
            "The compressed version was not smaller, so LifeKit automatically kept the original PDF.";

    }
}


/* =========================================================
   Handle PDF
========================================================= */

async function handleFile(
    file
) {

    if (!file) {
        return;
    }


    const isPdf =
        file.type ===
            "application/pdf" ||
        file.name
            .toLowerCase()
            .endsWith(".pdf");


    if (!isPdf) {

        alert(
            "Please select a PDF file."
        );

        return;
    }


    selectedFile =
        file;


    fileName.textContent =
        file.name;


    fileDetails.textContent =
        `${formatFileSize(
            file.size
        )} • Reading PDF...`;


    fileInfo.hidden =
        false;


    resultArea.hidden =
        true;


    downloadArea.hidden =
        true;


    compressButton.disabled =
        true;


    clearDownload();


    try {

        progressArea.hidden =
            false;


        progressText.textContent =
            "Reading PDF information...";


        const pageCount =
            await getPdfPageCount(
                file
            );


        fileDetails.textContent =
            `${formatFileSize(
                file.size
            )} • ${pageCount} ${
                pageCount === 1
                    ? "page"
                    : "pages"
            }`;


        progressArea.hidden =
            true;


        compressButton.disabled =
            false;


    } catch (error) {

        console.error(
            "PDF reading failed:",
            error
        );


        selectedFile =
            null;


        progressArea.hidden =
            true;


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

choosePdfButton.addEventListener(
    "click",
    () => {

        pdfInput.click();

    }
);


/* =========================================================
   File input
========================================================= */

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


/* =========================================================
   Drag and drop
========================================================= */

dropZone.addEventListener(
    "dragover",
    (event) => {

        event.preventDefault();

        dropZone.classList.add(
            "drag-over"
        );

    }
);


dropZone.addEventListener(
    "dragleave",
    () => {

        dropZone.classList.remove(
            "drag-over"
        );

    }
);


dropZone.addEventListener(
    "drop",
    (event) => {

        event.preventDefault();

        dropZone.classList.remove(
            "drag-over"
        );


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


/* =========================================================
   Compress
========================================================= */

compressButton.addEventListener(
    "click",
    async () => {

        if (!selectedFile) {
            return;
        }


        compressButton.disabled =
            true;


        resultArea.hidden =
            true;


        downloadArea.hidden =
            true;


        progressArea.hidden =
            false;


        progressText.textContent =
            "Smart compression is analyzing your PDF...";


        try {

            const settings =
                getCompressionSettings();


            const originalBytes =
                new Uint8Array(
                    await selectedFile
                        .arrayBuffer()
                );


            const result =
                await smartCompress(
                    selectedFile,
                    settings
                );


            progressText.textContent =
                "Checking final file size...";


            await wait(200);


            let finalBytes =
                result.bytes;


            /*
             * Never return a larger file.
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
                    [
                        finalBytes
                    ],
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


            downloadButton.href =
                downloadUrl;


            downloadButton.download =
                `${baseName}-compressed.pdf`;


            downloadArea.hidden =
                false;


            progressArea.hidden =
                true;


            resultArea.hidden =
                false;


            resultArea.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "start"
            });


        } catch (error) {

            console.error(
                "PDF compression failed:",
                error
            );


            progressArea.hidden =
                true;


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


/* =========================================================
   Compress another
========================================================= */

compressAnotherButton.addEventListener(
    "click",
    () => {

        selectedFile =
            null;


        pdfInput.value =
            "";


        fileInfo.hidden =
            true;


        progressArea.hidden =
            true;


        resultArea.hidden =
            true;


        downloadArea.hidden =
            true;


        compressButton.disabled =
            true;


        clearDownload();


        window.scrollTo({

            top:
                0,

            behavior:
                "smooth"

        });

    }
);


/* =========================================================
   Compression option styling
========================================================= */

const compressionRadios =
    document.querySelectorAll(
        'input[name="compressionLevel"]'
    );


compressionRadios.forEach(
    (radio) => {

        radio.addEventListener(
            "change",
            () => {

                compressionRadios.forEach(
                    (item) => {

                        const label =
                            item.closest(
                                "label"
                            );


                        if (!label) {
                            return;
                        }


                        const option =
                            label.querySelector(
                                ".compression-option"
                            );


                        if (!option) {
                            return;
                        }


                        if (
                            item.checked
                        ) {

                            option.style.border =
                                "2px solid #202124";

                            option.style.background =
                                "#f8f9fa";

                        } else {

                            option.style.border =
                                "2px solid #e5e7eb";

                            option.style.background =
                                "#ffffff";

                        }

                    }
                );

            }
        );

    }
);


/* =========================================================
   Initial library check
========================================================= */

if (
    typeof PDFLib !==
        "undefined" &&
    typeof pdfjsLib !==
        "undefined"
) {

    console.log(
        "LifeKit PDF Compress: PDF-LIB and PDF.js loaded successfully."
    );

} else {

    console.warn(
        "LifeKit PDF Compress: PDF library is missing."
    );

}