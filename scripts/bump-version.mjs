import { $, argv, cd, fs } from 'zx'

cd(import.meta.resolve('..').slice(7))

const {
  _: [strategy],
} = argv

if (!strategy) {
  throw new Error(
    'Invalid strategy. Usage: bump-version.mjs <major|minor|patch>',
  )
}

await $`yarn version ${strategy}`

const manifest = JSON.parse(fs.readFileSync('manifest.json'))
manifest.version = JSON.parse(fs.readFileSync('package.json')).version
fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2))

await $`yarn run pack`
