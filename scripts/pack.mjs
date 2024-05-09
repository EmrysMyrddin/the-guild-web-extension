import { $, cd, fs } from 'zx'

const root = import.meta.resolve('..').slice(7)
cd(root)

const {
  background: { scripts, service_worker },
  ...manifest
} = await JSON.parse(await fs.readFile('manifest.json'))
const commitHash = await $`git rev-parse --short HEAD`

await $`mkdir -p dist`
await $`rm -rf dist/*`

// Chrome build
await $`mkdir -p dist/chrome`
await $`cp -r src dist/chrome/`
await fs.writeFile(
  'dist/chrome/manifest.json',
  JSON.stringify({ ...manifest, background: { service_worker } }, null, 2),
)
cd('dist/chrome')
await $`zip -r ../chrome-${commitHash}-${manifest.version}.zip * -x "*.DS_Store"`
cd(root)

// Firefox build
await $`mkdir -p dist/firefox`
await $`cp -r src dist/firefox/`
await fs.writeFile(
  'dist/firefox/manifest.json',
  JSON.stringify({ ...manifest, background: { scripts } }, null, 2),
)
cd('dist/firefox')
await $`zip -r ../firefox-${commitHash}-${manifest.version}.zip * -x "*.DS_Store"`
cd(root)
