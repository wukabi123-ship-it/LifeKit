// ===============================
// LifeKit - PDF Merge
// ===============================


// ===============================
// DOM Elements
// ===============================

const dropZone =
    document.getElementById("dropZone");

const choosePdfButton =
    document.getElementById("choosePdfButton");

const pdfInput =
    document.getElementById("pdfInput");

const fileSummary =
    document.getElementById("fileSummary");

const fileCount =
    document.getElementById("fileCount");

const totalSize =
    document.getElementById("totalSize");

const clearButton =
    document.getElementById("clearButton");

const fileList =
    document.getElementById("fileList");

const mergeButton =
    document.getElementById("mergeButton");

const downloadArea =
    document.getElementById("downloadArea");


// ===============================
// State
// ===============================

let selectedFiles = [];

let downloadUrl = null;


// ===============================
// Utility
// ===============================

function formatFileSize(bytes) {

    if (bytes === 0) {
        return "0 B";
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];

    const index = Math.floor(
        Math.log(bytes) / Math.log(1024)
    );

    const size =
        bytes / Math.pow(1024, index);

    return (
        size.toFixed(index === 0 ? 0 : 2)
        + " "
        + units[index]
    );
}


function escapeHtml(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ===============================
// Clear Download URL
// ===============================

function clearDownloadUrl() {

    if (downloadUrl) {

        URL.revokeObjectURL(
            downloadUrl
        );

        downloadUrl = null;
    }
}


// ===============================
// Update Summary
// ===============================

function updateSummary() {

    if (selectedFiles.length === 0) {

        fileSummary.style.display =
            "none";

        fileCount.textContent =
            "0 PDFs";

        totalSize.textContent =
            "• 0 B";

        mergeButton.disabled =
            true;

        return;
    }


    const size =
        selectedFiles.reduce(
            function (total, file) {

                return total + file.size;

            },
            0
        );


    fileSummary.style.display =
        "block";


    fileCount.textContent =
        `${selectedFiles.length} PDF${selectedFiles.length === 1 ? "" : "s"}`;


    totalSize.textContent =
        `• ${formatFileSize(size)}`;


    mergeButton.disabled =
        selectedFiles.length < 2;
}


// ===============================
// Render File List
// ===============================

async function renderFileList() {

    fileList.innerHTML = "";


    for (
        let index = 0;
        index < selectedFiles.length;
        index++
    ) {

        const file =
            selectedFiles[index];


        const item =
            document.createElement("div");


        item.className =
            "pdf-file-item";


        item.draggable =
            true;


        item.dataset.index =
            index;


        item.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px;
            margin-bottom: 10px;
            background: #f5f5f5;
            border-radius: 10px;
            cursor: grab;
            text-align: left;
        `;


        item.innerHTML = `

            <div
                style="
                    font-size: 24px;
                "
            >
                📄
            </div>


            <div
                style="
                    flex: 1;
                    min-width: 0;
                "
            >

                <div
                    style="
                        font-weight: 700;
                        word-break: break-word;
                    "
                >
                    ${escapeHtml(file.name)}
                </div>


                <div
                    style="
                        color: #6b7280;
                        font-size: 13px;
                        margin-top: 3px;
                    "
                >
                    ${formatFileSize(file.size)}
                </div>

            </div>


            <div
                style="
                    display: flex;
                    gap: 5px;
                    flex-wrap: wrap;
                "
            >

                <button
                    type="button"
                    class="preview-pdf-button"
                    data-index="${index}"
                >
                    Preview
                </button>


                <button
                    type="button"
                    class="move-up-button"
                    data-index="${index}"
                    ${index === 0 ? "disabled" : ""}
                >
                    ↑
                </button>


                <button
                    type="button"
                    class="move-down-button"
                    data-index="${index}"
                    ${index === selectedFiles.length - 1 ? "disabled" : ""}
                >
                    ↓
                </button>


                <button
                    type="button"
                    class="remove-pdf-button"
                    data-index="${index}"
                >
                    ✕
                </button>

            </div>

        `;


        fileList.appendChild(item);
    }


    addFileItemEvents();

    updateSummary();
}


// ===============================
// File Item Events
// ===============================

function addFileItemEvents() {

    document
        .querySelectorAll(".remove-pdf-button")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    const index =
                        Number(
                            button.dataset.index
                        );

                    selectedFiles.splice(
                        index,
                        1
                    );

                    renderFileList();

                }
            );

        });


    document
        .querySelectorAll(".move-up-button")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    const index =
                        Number(
                            button.dataset.index
                        );


                    if (index <= 0) {
                        return;
                    }


                    const temp =
                        selectedFiles[index - 1];


                    selectedFiles[index - 1] =
                        selectedFiles[index];


                    selectedFiles[index] =
                        temp;


                    renderFileList();

                }
            );

        });


    document
        .querySelectorAll(".move-down-button")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    const index =
                        Number(
                            button.dataset.index
                        );


                    if (
                        index >=
                        selectedFiles.length - 1
                    ) {

                        return;

                    }


                    const temp =
                        selectedFiles[index + 1];


                    selectedFiles[index + 1] =
                        selectedFiles[index];


                    selectedFiles[index] =
                        temp;


                    renderFileList();

                }
            );

        });


    document
        .querySelectorAll(".preview-pdf-button")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    const index =
                        Number(
                            button.dataset.index
                        );

                    previewPdf(
                        selectedFiles[index]
                    );

                }
            );

        });


    // Drag reorder

    document
        .querySelectorAll(".pdf-file-item")
        .forEach(function (item) {

            item.addEventListener(
                "dragstart",
                function () {

                    item.classList.add(
                        "dragging"
                    );

                }
            );


            item.addEventListener(
                "dragend",
                function () {

                    item.classList.remove(
                        "dragging"
                    );

                }
            );


            item.addEventListener(
                "dragover",
                function (event) {

                    event.preventDefault();

                }
            );


            item.addEventListener(
                "drop",
                function (event) {

                    event.preventDefault();


                    const fromIndex =
                        Number(
                            document
                                .querySelector(
                                    ".pdf-file-item.dragging"
                                )
                                ?.dataset.index
                        );


                    const toIndex =
                        Number(
                            item.dataset.index
                        );


                    if (
                        Number.isNaN(
                            fromIndex
                        ) ||
                        fromIndex === toIndex
                    ) {

                        return;

                    }


                    const movedFile =
                        selectedFiles[
                            fromIndex
                        ];


                    selectedFiles.splice(
                        fromIndex,
                        1
                    );


                    selectedFiles.splice(
                        toIndex,
                        0,
                        movedFile
                    );


                    renderFileList();

                }
            );

        });
}


// ===============================
// Add Files
// ===============================

function addFiles(files) {

    const incomingFiles =
        Array.from(files);


    const pdfFiles =
        incomingFiles.filter(
            function (file) {

                return (
                    file.type === "application/pdf" ||
                    file.name
                        .toLowerCase()
                        .endsWith(".pdf")
                );

            }
        );


    if (pdfFiles.length === 0) {

        alert(
            "Please choose PDF files only."
        );

        return;
    }


    pdfFiles.forEach(
        function (file) {

            const alreadyExists =
                selectedFiles.some(
                    function (existingFile) {

                        return (
                            existingFile.name === file.name &&
                            existingFile.size === file.size &&
                            existingFile.lastModified === file.lastModified
                        );

                    }
                );


            if (!alreadyExists) {

                selectedFiles.push(file);

            }

        }
    );


    renderFileList();
}


// ===============================
// Choose Files
// ===============================

choosePdfButton.addEventListener(
    "click",
    function () {

        pdfInput.click();

    }
);


// ===============================
// File Input
// ===============================

pdfInput.addEventListener(
    "change",
    function () {

        if (pdfInput.files.length > 0) {

            addFiles(
                pdfInput.files
            );

        }


        pdfInput.value = "";

    }
);


// ===============================
// Drag & Drop
// ===============================

dropZone.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        dropZone.classList.add(
            "drag-over"
        );

    }
);


dropZone.addEventListener(
    "dragleave",
    function () {

        dropZone.classList.remove(
            "drag-over"
        );

    }
);


dropZone.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        dropZone.classList.remove(
            "drag-over"
        );


        if (
            event.dataTransfer.files.length > 0
        ) {

            addFiles(
                event.dataTransfer.files
            );

        }

    }
);


// ===============================
// Clear All
// ===============================

clearButton.addEventListener(
    "click",
    function () {

        selectedFiles = [];

        clearDownloadUrl();

        downloadArea.innerHTML = "";

        renderFileList();

    }
);


// ===============================
// PDF Preview
// ===============================

function previewPdf(file) {

    const url =
        URL.createObjectURL(file);


    const overlay =
        document.createElement("div");


    overlay.id =
        "pdfPreviewOverlay";


    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;


    overlay.innerHTML = `

        <div
            style="
                position: relative;
                width: min(1000px, 95vw);
                height: min(850px, 90vh);
                background: white;
                border-radius: 12px;
                overflow: hidden;
            "
        >

            <button
                id="closePreviewButton"
                type="button"
                style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    z-index: 2;
                    width: 40px;
                    height: 40px;
                    border: none;
                    border-radius: 50%;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                "
            >
                ✕
            </button>


            <iframe
                src="${url}"
                title="PDF Preview"
                style="
                    width: 100%;
                    height: 100%;
                    border: none;
                "
            ></iframe>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    const closeButton =
        document.getElementById(
            "closePreviewButton"
        );


    function closePreview() {

        URL.revokeObjectURL(url);

        overlay.remove();

        document.removeEventListener(
            "keydown",
            escapeHandler
        );
    }


    function escapeHandler(event) {

        if (event.key === "Escape") {

            closePreview();

        }

    }


    closeButton.addEventListener(
        "click",
        closePreview
    );


    overlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target === overlay
            ) {

                closePreview();

            }

        }
    );


    document.addEventListener(
        "keydown",
        escapeHandler
    );
}


// ===============================
// Merge PDFs
// ===============================

mergeButton.addEventListener(
    "click",
    async function () {

        if (selectedFiles.length < 2) {

            alert(
                "Please choose at least two PDF files."
            );

            return;
        }


        if (
            !window.PDFLib ||
            !window.PDFLib.PDFDocument
        ) {

            alert(
                "PDF library is not available. Please refresh the page."
            );

            return;
        }


        mergeButton.disabled =
            true;


        mergeButton.textContent =
            "Preparing...";


        clearDownloadUrl();

        downloadArea.innerHTML = "";


        try {

            const {
                PDFDocument
            } = window.PDFLib;


            const mergedPdf =
                await PDFDocument.create();


            for (
                let index = 0;
                index < selectedFiles.length;
                index++
            ) {

                const file =
                    selectedFiles[index];


                mergeButton.textContent =
                    `Merging ${index + 1} / ${selectedFiles.length}...`;


                const arrayBuffer =
                    await file.arrayBuffer();


                const sourcePdf =
                    await PDFDocument.load(
                        new Uint8Array(
                            arrayBuffer
                        )
                    );


                const pages =
                    await mergedPdf.copyPages(
                        sourcePdf,
                        sourcePdf
                            .getPageIndices()
                    );


                pages.forEach(
                    function (page) {

                        mergedPdf.addPage(
                            page
                        );

                    }
                );

            }


            mergeButton.textContent =
                "Creating PDF...";


            const mergedBytes =
                await mergedPdf.save({
                    useObjectStreams: true
                });


            const blob =
                new Blob(
                    [mergedBytes],
                    {
                        type:
                            "application/pdf"
                    }
                );


            downloadUrl =
                URL.createObjectURL(
                    blob
                );


            const originalName =
                selectedFiles[0].name
                    .replace(
                        /\.pdf$/i,
                        ""
                    );


            const downloadName =
                `${originalName}-merged.pdf`;


            const totalPages =
                mergedPdf.getPageCount();


            downloadArea.innerHTML = `

                <div
                    style="
                        padding: 16px;
                        margin-bottom: 15px;
                        background: #f5f5f5;
                        border-radius: 12px;
                        text-align: left;
                    "
                >

                    <strong>
                        ✅ Merge Complete
                    </strong>

                    <p
                        style="
                            margin: 6px 0 0;
                            color: #6b7280;
                            font-size: 14px;
                        "
                    >
                        ${selectedFiles.length} PDFs
                        • ${totalPages} pages
                        • ${formatFileSize(mergedBytes.length)}
                    </p>

                </div>


                <a
                    class="upload-button"
                    href="${downloadUrl}"
                    download="${escapeHtml(downloadName)}"
                >
                    Download Merged PDF
                </a>


                <br><br>


                <button
                    id="mergeAgainButton"
                    type="button"
                >
                    Merge Again
                </button>

            `;


            const mergeAgainButton =
                document.getElementById(
                    "mergeAgainButton"
                );


            mergeAgainButton.addEventListener(
                "click",
                function () {

                    selectedFiles = [];

                    clearDownloadUrl();

                    downloadArea.innerHTML = "";

                    mergeButton.textContent =
                        "Merge PDFs";

                    renderFileList();

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }
            );


            mergeButton.textContent =
                "Merge PDFs";


        }

        catch (error) {

            console.error(
                "PDF merge failed:",
                error
            );


            alert(
                `PDF merge failed: ${error.message}`
            );


            mergeButton.textContent =
                "Merge PDFs";

        }


        finally {

            mergeButton.disabled =
                selectedFiles.length < 2;

        }

    }
);


// ===============================
// Cleanup
// ===============================

window.addEventListener(
    "beforeunload",
    function () {

        clearDownloadUrl();

    }
);


// ===============================
// Initial State
// ===============================

updateSummary();