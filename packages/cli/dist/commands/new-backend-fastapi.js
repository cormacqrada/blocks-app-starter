import * as fs from "fs";
import * as path from "path";
export async function newBackendFastapi(appName) {
    const cwd = process.cwd();
    const targetDir = path.join(cwd, appName);
    if (fs.existsSync(targetDir)) {
        throw new Error(`Target directory ${targetDir} already exists`);
    }
    const templateDir = path.resolve(cwd, "templates/backend/fastapi");
    if (!fs.existsSync(templateDir)) {
        throw new Error(`Template directory not found: ${templateDir}`);
    }
    copyDir(templateDir, targetDir);
    console.log(`Created backend FastAPI Blocks app at ${targetDir}`);
}
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        }
        else if (entry.isFile()) {
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
