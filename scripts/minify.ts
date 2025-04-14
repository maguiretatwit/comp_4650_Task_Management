import esbuild from "esbuild";
import { minify } from "html-minifier";
import { readdirSync, lstatSync, readFileSync, writeFileSync } from "fs";

async function buildFile(path: string) {
    const slashIndex = path.lastIndexOf('/');
    const directory = path.slice(0, slashIndex);
    const file = path.slice(slashIndex + 1);
    const dotIndex = file.lastIndexOf('.');
    const name = file.slice(0, dotIndex);
    const extension = file.slice(dotIndex + 1);
    if (!name.endsWith('.min')) {
        const outfile = `${directory}/${name}.min.${extension}`;
        if (['js', 'css'].includes(extension)) {
            await esbuild.build({
                entryPoints: [path],
                outfile,
                minify: true,
                sourcemap: true,
                bundle: false,
                loader: {
                    '.js': 'js',
                    '.css': 'css'
                },
            });
        } else if (extension === 'html') {
            const html = readFileSync(path).toString();
            const minified = minify(html, {
                collapseWhitespace: true,
                removeComments: true,
                removeOptionalTags: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeTagWhitespace: true,
                useShortDoctype: true,
                minifyCSS: true,
                minifyJS: true
            });
            writeFileSync(outfile, minified);
        }
    }
}

async function buildDirectory(path: string) {
    const dir = readdirSync(path);
    for (const file of dir) {
        await build(`${path}/${file}`);
    }
}

async function build(path: string) {
    const stat = lstatSync(path);
    if (stat.isDirectory()) {
        await buildDirectory(path);
    } else if (stat.isFile()) {
        await buildFile(path);
    }
}

build("./frontend");