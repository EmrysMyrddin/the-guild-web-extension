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

const firefoxUpdates = JSON.parse(
  fs.readFileSync('hosting/firefox/updates.json'),
)
firefoxUpdates['web-extension@the-guild.dev'].updates.unshift({
  version: manifest.version,
  update_link: `https://github.com/EmrysMyrddin/the-guild-web-extension/releases/download/${manifest.version}/firefox.xpi`,
})
fs.writeFileSync(
  'hosting/firefox/updates.json',
  JSON.stringify(firefoxUpdates, null, 2),
)

await $`yarn run pack`
