const fs = require("fs");
const path = require("path");

function renderEmailTemplate(templateName, variables = {}) {
  const filePath = path.join(__dirname, "templates", templateName);

  let html = fs.readFileSync(filePath, "utf8");

  // substituir {{key}} pelo valor correto
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    html = html.replace(regex, variables[key]);
  });

  return html;
}

module.exports = { renderEmailTemplate };
