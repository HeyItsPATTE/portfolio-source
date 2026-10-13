import { describe, expect, it } from 'vitest'
import { releaseName, remoteScript, sshArgs } from '../scripts/deploy-lib.mjs'

describe('deploy', () => {
  it('accepts the host key of a host name it has not seen, instead of failing in batch mode', () => {
    const args = sshArgs({ key: '/keys/deploy', host: 'root@kraftpatrick.dev' })
    expect(args).toEqual(
      expect.arrayContaining(['StrictHostKeyChecking=accept-new', 'BatchMode=yes', 'IdentitiesOnly=yes', '/keys/deploy']),
    )
    expect(args.at(-1)).toBe('root@kraftpatrick.dev')
  })

  it('switches the live site by renaming a symlink, never by removing the live folder', () => {
    const script = remoteScript({ site: '/var/www/site', release: '20261013-142501' })
    expect(script).toContain('tar --no-same-owner -xzf - -C /var/www/site-releases/20261013-142501')
    expect(script).toContain('ln -sfn /var/www/site-releases/20261013-142501 /var/www/site.next')
    expect(script).toContain('mv -T /var/www/site.next /var/www/site')
    expect(script).not.toMatch(/rm -rf \/var\/www\/site(?=[\s;]|$)/)
  })

  it('keeps only the newest three releases', () => {
    expect(remoteScript({ site: '/var/www/site', release: 'r' })).toContain('ls -1dt /var/www/site-releases/*/ | tail -n +4 | xargs -r rm -rf')
  })

  it('names releases by UTC time so they sort in order', () => {
    expect(releaseName(new Date('2026-10-13T14:25:01.123Z'))).toBe('20261013-142501')
  })
})
