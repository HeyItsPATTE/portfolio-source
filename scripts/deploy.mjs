// Uploads the static build (.output/public) to the VPS and switches the live site to it.
// Usage: npm run deploy   (builds first). DEPLOY_HOST and DEPLOY_KEY override the defaults.
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { releaseName, remoteScript, sshArgs } from './deploy-lib.mjs'

const host = process.env.DEPLOY_HOST ?? 'root@kraftpatrick.dev'
const key = process.env.DEPLOY_KEY ?? join(homedir(), '.ssh', 'kraftpatrick_vps')
const site = '/var/www/kraftpatrick.dev'
const dist = '.output/public'

if (!existsSync(join(dist, 'index.html'))) {
  console.error(`No build found in ${dist}. Run "npm run generate" first.`)
  process.exit(1)
}

const tar = spawn('tar', ['-czf', '-', '-C', dist, '.'], { stdio: ['ignore', 'pipe', 'inherit'] })
const ssh = spawn('ssh', [...sshArgs({ key, host }), remoteScript({ site, release: releaseName() })], {
  stdio: ['pipe', 'inherit', 'inherit'],
})
// If ssh fails early it closes its stdin: report that through the exit codes below instead of
// crashing on EPIPE, and stop tar, which would otherwise block forever on the unread pipe.
ssh.stdin.on('error', () => {})
ssh.on('close', (code) => {
  if (code !== 0) tar.kill()
})
tar.stdout.pipe(ssh.stdin)

const exitCode = (child) => new Promise((resolve) => child.on('close', resolve))
const [tarCode, sshCode] = await Promise.all([exitCode(tar), exitCode(ssh)])
if (tarCode !== 0 || sshCode !== 0) {
  console.error(`Deploy failed (tar exit ${tarCode}, ssh exit ${sshCode}).`)
  process.exit(1)
}
