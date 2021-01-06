const JSZip = require("jszip")

const inputElement = document.getElementById("inputElement")
const previewList = document.getElementById("previewList")
const downloadAsZipElement = document.getElementById("downloadAsZip")
const deleteAllFilesElement = document.getElementById("deleteAllFiles")

downloadAsZipElement.addEventListener("click", () => {
    downloadAsZip()
})

deleteAllFilesElement.addEventListener("click", () => {
    removeAllProcessedFiles()
})

// Global Store
let processedFiles = []

inputElement.onchange = (e) => {
const files = Array.from(e.target.files) // transform FileList into an Array

files.forEach((file) => {
    if (!file) return // if you use a regular 'for' loop, use continue instead

    // if the file isn't an xml, we skip it
    if (file.type !== "text/xml") return

    // create a separate reader for every file to avoid conflicts
    const reader = new FileReader()

    reader.onload = (e) => {
        const polarFileContent = e.target.result
        // Remove Creator and Author
        const garminFileContentAsXml = polarFileContent.replace(/(\<Creator).*?(\<\/Creator\>)/, '').replace(/(\<Author).*?(\<\/Author\>)/, '')

        // Convert File to downloadable Data URL
        const fileName = file.name.replace('.xml', '') + ".tcx"      // Convert to Garmin File Type

        // Add download links and save file
        addProcessedFile(garminFileContentAsXml, fileName)
    }

    reader.readAsText(file)
})

}

function addProcessedFile(file, fileName) {
    const listItem = document.createElement("li")
    const polarFilePreview = document.createElement("a")
    polarFilePreview.innerHTML = fileName
    polarFilePreview.onclick = function() {download(file, fileName, "text/tcx")}
    polarFilePreview.href = "#"
    listItem.appendChild(polarFilePreview)
    previewList.appendChild(listItem)
    processedFiles.push({file, fileName})
}

function removeAllProcessedFiles() {
    processedFiles = []
    previewList.innerHTML = ''
}

function downloadAsZip() {
    if (processedFiles.length === 0) return
    const zip = new JSZip();
 
    processedFiles.forEach(({file, fileName}) => {
        zip.file(fileName, file)
    })
    
    zip.generateAsync({type:"blob"}).then(function(content) {
        download(content, "garminFiles-"+new Date().toISOString() + ".zip");
    });
}