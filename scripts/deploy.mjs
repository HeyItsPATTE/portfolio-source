// Uploads the static build (.output/public) to the VPS and swaps it in at once.
// Usage: npm run deploy   (builds first). DEPLOY_HOST and DEPLOY_KEY override the defaults.
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const host = process.env.DEPLOY_HOST ?? 'root@kraftpatrick.dev'
const key = process.env.DEPLOY_KEY ?? join(homedir(), '.ssh', 'kraftpatrick_vps')
const site = '/var/www/kraftpatrick.dev'
const dist = '.output/public'

if (!existsSync(join(dist, 'index.html'))) {
  console.error(`No build found in ${dist}. Run "npm run generate" first.`)
  process.exit(1)
}

// Unpack next to the live folder, make it readable for Caddy, then swap the folders.
const remote = [
  'set -e',
  `rm -rf ${site}.new ${site}.old`,
  `mkdir -p ${site}.new`,
  `tar --no-same-owner -xzf - -C ${site}.new`,
  `chmod -R a+rX ${site}.new`,
  `if [ -d ${site} ]; then mv ${site} ${site}.old; fi`,
  `mv ${site}.new ${site}`,
  `rm -rf ${site}.old`,
  `echo "deployed $(find ${site} -type f | wc -l) files to ${site}"`,
].join('; ')

const tar = spawn('tar', ['-czf', '-', '-C', dist, '.'], { stdio: ['ignore', 'pipe', 'inherit'] })
const ssh = spawn('ssh', ['-i', key, '-o', 'IdentitiesOnly=yes', '-o', 'BatchMode=yes', host, remote], {
  stdio: ['pipe', 'inherit', 'inherit'],
})
tar.stdout.pipe(ssh.stdin)

const exitCode = (child) => new Promise((resolve) => child.on('close', resolve))
const [tarCode, sshCode] = await Promise.all([exitCode(tar), exitCode(ssh)])
if (tarCode !== 0 || sshCode !== 0) {
  console.error(`Deploy failed (tar exit ${tarCode}, ssh exit ${sshCode}).`)
  process.exit(1)
}
