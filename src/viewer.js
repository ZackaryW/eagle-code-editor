const fs = require("fs");

async function loadEditor(filePath) {
	let languageExtension;
	switch (filePath.split(".").pop()) {
		case "java":
			const java = require("@codemirror/lang-java");
			languageExtension = java.java();
			break;
		case "py":
			const python = require("@codemirror/lang-python");
			languageExtension = python.python();
			break;
		case "rs":
			const rust = require("@codemirror/lang-rust");
			languageExtension = rust.rust();
			break;
		case "js" || "ts":
			const javascript = require("@codemirror/lang-javascript");
			languageExtension = javascript.javascript();
			break;
		case "json":
			const json = require("@codemirror/lang-json");
			languageExtension = json.json();
			break;
		case "sql":
			const sql = require("@codemirror/lang-sql");
			languageExtension = sql.sql();
			break;
		case "xml":
			const xml = require("@codemirror/lang-xml");
			languageExtension = xml.xml();
			break;
		case "yaml":
		case "yml":
			const yaml = require("@codemirror/lang-yaml");
			languageExtension = yaml.yaml();
			break;
		case "css":
			const css = require("@codemirror/lang-css");
			languageExtension = css.css();
			break;
		case "c":
		case "cpp":
			const cpp = require("@codemirror/lang-cpp");
			languageExtension = cpp.cpp();
			break;
		default:
			console.error("Unsupported file extension");
			return;
	}

	let fileContent = await fetchFileContent(filePath); // Fetch the file content
	const { EditorView, basicSetup } = require("codemirror");
	const { EditorState } = require("@codemirror/state");

	// Initialize the editor with the file content
	const editor = new EditorView({
		state: EditorState.create({
			doc: fileContent, // Load the file content into the editor
			extensions: [
				basicSetup,
				languageExtension,
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						fs.writeFileSync(filePath, update.state.doc.toString());
						console.log("Auto-saved to file:", filePath);
					}
				}),
			],
		}),
		parent: document.getElementById("editor"),
	});
}

// Function to fetch file content (mock implementation)
async function fetchFileContent(filePath) {
	const fileContent = fs.readFileSync(filePath, "utf8");
	return fileContent;
}

eagle.onPluginCreate(async (plugin) => {
	console.log("eagle.onPluginCreate");
	updateTheme();
	
});

eagle.onThemeChanged(() => {
	console.log("eagle.onThemeChanged");
	updateTheme();
});

eagle.onPluginRun(() => {
	console.log("eagle.onPluginRun");
	const urlParams = new URLSearchParams(window.location.search);
	const filePath = urlParams.get("path");
	loadEditor(filePath);
});

eagle.onPluginShow(() => {
	console.log("eagle.onPluginShow");
});

eagle.onPluginHide(() => {
	console.log("eagle.onPluginHide");
});

eagle.onPluginBeforeExit((event) => {
	console.log("eagle.onPluginBeforeExit");
});
