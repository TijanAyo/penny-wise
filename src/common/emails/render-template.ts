import fs from "fs";
import path from "path";
import handlebars from "handlebars";

const renderTemplate = (templateName: string, data: any): string => {
  const filePath = path.join(__dirname, "templates", `${templateName}.hbs`);
  const source = fs.readFileSync(filePath, "utf-8").toString();
  const template = handlebars.compile(source);
  return template(data);
};

export default renderTemplate;
