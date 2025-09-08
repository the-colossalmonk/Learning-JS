# Phase 5, Project 2: Secure Browser-Based File Organizer

This is a secure, modern, and interactive file organization tool that runs entirely in the browser. It allows users to select a local folder and organize its contents based on customizable rules. The application uses modern browser APIs to move files into categorized subdirectories, offers a "dry run" preview, and can even undo the last organization action. **No files are ever uploaded to a server**, ensuring complete user privacy.

### Key Features

-   **Enhanced Visual Interface:** Files are displayed in a clean, interactive grid of cards, each with a file-type icon and size information.
-   **File Preview Panel:** Clicking on a file card opens a sidebar panel that displays a preview of the content for common file types (images, text) or provides file information for others.
-   **Secure, Local File Handling:** Uses the modern **File System Access API** to securely interact with the user's local files directly in the browser.
-   **Customizable Rules Engine:** Users can define their own rules for how to organize files (e.g., `.jpg, .png -> Images`). These rules are saved to `localStorage`.
-   **"Dry Run" Preview:** The application first shows a plan of which files will be moved where, allowing the user to review all changes before committing.
-   **Undo Last Action:** A powerful undo feature allows the user to immediately revert the last organization action, moving all files back to their original locations.
-   **Recursive Mode:** An option to scan and organize files in all subfolders within the selected directory.
-   **Conflict Resolution:** If a file already exists at the destination, the user is prompted to choose whether to **Overwrite**, **Keep Both** (by renaming), or **Skip**.
-   **Drag and Drop:** Users can drag a folder from their desktop and drop it onto the application to start.

---

### Core JavaScript Concepts Showcased

This project is a deep dive into modern, secure browser APIs and demonstrates how to build a powerful, safe utility application for the web with a focus on a great user experience.

#### 1. The File System Access API

The core of the application. It uses this modern set of browser APIs to handle files in a secure, user-consented way.
-   `window.showDirectoryPicker()`: To let the user securely select a folder.
-   `FileSystemDirectoryHandle`: The object representing a directory, which provides methods to read its contents and get handles for sub-items.
-   `async for...of`: The specific syntax required to iterate over a directory's contents.

#### 2. Asynchronous File Previews

The preview panel demonstrates handling different file types and using asynchronous APIs to read their content.
-   For images, `URL.createObjectURL(file)` is used to generate a temporary, performant URL that can be used as the `src` for an `<img>` tag.
-   For text files, the `file.text()` method (which returns a Promise) is used to read the content.

**Example: The `showPreview` function (`script.js`)**
```javascript
async function showPreview(fileIndex) {
    const fileData = fileHandles[fileIndex];
    if (!fileData) return;

    // Get the File object from the handle
    const file = await fileData.handle.getFile();
    const type = file.type;
    
    if (type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        filePreviewContent.innerHTML = `<img src="${url}" alt="File preview">`;
    } else if (type.startsWith('text/')) {
        const text = await file.text();
        filePreviewContent.innerHTML = `<pre>${text.substring(0, 2000)}</pre>`;
    } else {
        // ... show generic preview ...
    }
}
```

#### 3. Complex State Management for Undo

The "Undo" feature requires careful state management. Before executing the organization plan, the application stores a "snapshot" of the original locations of all files that are about to be moved. If the user clicks "Undo," this snapshot is used to run the `move()` command in reverse.

### How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  **Important:** The File System Access API is a modern browser feature and requires a secure context. You must serve the files from a local web server (**HTTPS** is required for some features, though `http://localhost` often works). The "Live Server" extension in VS Code is a perfect tool for this.
3.  Open the local server address in a compatible browser (like Chrome, Edge, or Opera).
```