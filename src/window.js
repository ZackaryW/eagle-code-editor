const fs = require('fs');
const path = require('path');
const os = require('os');

eagle.onPluginCreate(async (plugin) => {
	console.log("eagle.onPluginCreate");
	updateTheme();
	
});

eagle.onThemeChanged(() => {
	console.log("eagle.onThemeChanged");
	updateTheme();
});

// Function to create a new file
async function createFile(fileName) {
    const templateDir = path.join(eagle.plugin.path, "templates");
    console.log(templateDir);
    const templateFile = path.join(templateDir, fileName);
    const currFolder = await eagle.folder.getSelected();
    await eagle.item.addFromPath(templateFile, {
        name: fileName,
        folders :currFolder
    });
    console.log(`Created file: ${fileName}`);
}

// Event listeners for buttons
document.getElementById("create-js").addEventListener("click", async () => {
    await createFile("unnamed.js");
});

document.getElementById("create-py").addEventListener("click", async () => {
    await createFile("unnamed.py");
});

document.getElementById("create-java").addEventListener("click", async () => {
    await createFile("unnamed.java");
});

document.getElementById("create-rs").addEventListener("click", async () => {
    await createFile("unnamed.rs");
});

const codespaceFile = path.join(path.dirname(eagle.plugin.path), "templates", "template.code-workspace");

// Function to create a new codespace
async function createCodespace(name = "unnamed.code-workspace") {
    const currFolder = await eagle.folder.getSelected();
    console.log(currFolder);
    console.log(codespaceFile);
    const item = await eagle.item.addFromPath(codespaceFile, {
        name: name,
        folders: currFolder
    });
    console.log(`Created codespace: ${name}`);
    return item;
}

// Event listener for create codespace button
document.getElementById("create-codespace").addEventListener("click", async () => {
    await createCodespace();
});

// Function to import a codespace
async function importCodespace() {
    try {
        // Open a folder selection dialog using showOpenDialog
        let result = await eagle.dialog.showOpenDialog({
            properties: ['openDirectory'] // Allow selecting directories
        });

        if (result.canceled) {
            console.log('Dialog was canceled');
            return; // Exit if the dialog was canceled
        }

        const folderPath = result.filePaths[0]; // Get the selected folder path
        const folderName = path.basename(folderPath); // Get the folder name

        const itemID = await createCodespace(folderName);
        const item = await eagle.item.getByIds([itemID]);
        if (item.length === 0) {
            console.log("Item not found");
            return;
        }
        const itemPath = path.dirname(item[0].filePath);
        console.log(itemPath);

        for (const file of fs.readdirSync(folderPath)) {
            const origin = path.join(folderPath, file);
            console.log(`Copying ${file} from ${origin} to ${itemPath}`);
            // Assuming you have a method to copy files
            await fs.promises.copyFile(origin, path.join(itemPath, file));
        }
    } catch (error) {
        console.error('Error importing codespace:', error);
    }
}

// Event listener for import codespace button
document.getElementById("import-hard-codespace").addEventListener("click", async () => {
    await importCodespace();
});

const templateCodespace = `
{
    "folders": [
        {
            "path": "."
        },

    ]
}
`;

// Function to import a soft codespace
async function importSoftCodespace() {
    try {

        const tmpdir = eagle.os.tmpdir();
        const tempCodespacePath = path.join(tmpdir, "template.code-workspace");

        // get folder dialog
        let result = await eagle.dialog.showOpenDialog({
            properties: ['openDirectory'] // Allow selecting directories
        });

        if (result.canceled || result.filePaths.length != 1) {
            console.log('Dialog was canceled');
            return; // Exit if the dialog was canceled
        }

        const templateContent = {
            "folders": [
                {
                    "path": path.resolve(result.filePaths[0])
                },
            ]
        }

        const folderName = path.basename(result.filePaths[0]);
        // write to temp file
        await fs.promises.writeFile(tempCodespacePath, JSON.stringify(templateContent));

        // Add the modified codespace file
        const currFolder = await eagle.folder.getSelected();
        await eagle.item.addFromPath(tempCodespacePath, {
            name: `${folderName}.code-workspace`,
            folders: currFolder
        });

        console.log(`Imported soft codespace with updated path: ${folderName}`);
    } catch (error) {
        console.error('Error importing soft codespace:', error);
    }
}

// Event listener for import soft codespace button
document.getElementById("import-soft-codespace").addEventListener("click", async () => {
    await importSoftCodespace();
});
