import fs from 'node:fs'
import path from 'node:path'

const manifestPath = path.resolve('android/app/src/main/AndroidManifest.xml')

if (!fs.existsSync(manifestPath)) {
  throw new Error(`Android manifest not found at ${manifestPath}`)
}

let manifest = fs.readFileSync(manifestPath, 'utf8')
const addedPermissions = []
const addedFeatures = []

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function ensureDeclaration(tagName, attributeName, attributeValue, extraAttributes = '', additions = []) {
  const attributePattern = `${escapeRegExp(attributeName)}=["']${escapeRegExp(attributeValue)}["']`
  const declarationPattern = new RegExp(`<${tagName}\\b[^>]*${attributePattern}[^>]*/?>`)
  const match = manifest.match(declarationPattern)

  if (match) {
    let declaration = match[0]
    for (const attribute of extraAttributes.trim().split(/\s+/).filter(Boolean)) {
      const [name, value] = attribute.split('=')
      const valuePattern = new RegExp(`${escapeRegExp(name)}=["'][^"']*["']`)
      if (valuePattern.test(declaration)) {
        declaration = declaration.replace(valuePattern, attribute)
      } else {
        declaration = declaration.replace(/\s*\/?\>$/, ` ${attribute} />`)
      }
    }
    manifest = manifest.replace(match[0], declaration)
    return
  }

  const declaration = `    <${tagName} ${attributeName}="${attributeValue}"${extraAttributes ? ` ${extraAttributes}` : ''} />`
  const insertionPoint = manifest.indexOf('<application')
  if (insertionPoint === -1) {
    throw new Error(`Could not find application element in ${manifestPath}`)
  }
  manifest = `${manifest.slice(0, insertionPoint)}${declaration}\n\n${manifest.slice(insertionPoint)}`
  additions.push(`${attributeName}=${attributeValue}`)
}

for (const permission of [
  ['android.permission.INTERNET', ''],
  ['android.permission.CAMERA', ''],
  ['android.permission.READ_MEDIA_IMAGES', ''],
  ['android.permission.READ_EXTERNAL_STORAGE', 'android:maxSdkVersion="32"'],
  ['android.permission.WRITE_EXTERNAL_STORAGE', 'android:maxSdkVersion="28"'],
]) {
  ensureDeclaration('uses-permission', 'android:name', permission[0], permission[1], addedPermissions)
}

for (const feature of [
  'android.hardware.camera',
  'android.hardware.camera.autofocus',
  'android.hardware.camera.flash',
]) {
  ensureDeclaration('uses-feature', 'android:name', feature, 'android:required="false"', addedFeatures)
}

fs.writeFileSync(manifestPath, manifest)
console.log(`Prepared ${manifestPath}`)
console.log(`Permissions added: ${addedPermissions.length ? addedPermissions.join(', ') : 'none'}`)
console.log(`Features added: ${addedFeatures.length ? addedFeatures.join(', ') : 'none'}`)
