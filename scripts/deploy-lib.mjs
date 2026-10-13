// The parts of the deploy that decide what runs, kept free of I/O so they can be tested.

/** ssh options: the deploy key only, never a prompt, and accept the host key on first contact with a new name. */
export function sshArgs({ key, host }) {
  return ['-i', key, '-o', 'IdentitiesOnly=yes', '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=accept-new', host]
}

/**
 * Shell script run on the server. Each deploy unpacks into its own release folder; the live path is a
 * symlink switched with a single rename, so there is no moment without a site. Keeps the newest three releases.
 */
export function remoteScript({ site, release }) {
  const releases = `${site}-releases`
  const dir = `${releases}/${release}`
  return [
    'set -e',
    `mkdir -p ${dir}`,
    `tar --no-same-owner -xzf - -C ${dir}`,
    `chmod -R a+rX ${dir}`,
    // One-time move from the old layout, where the live path was a plain folder.
    `if [ -d ${site} ] && [ ! -L ${site} ]; then mv ${site} ${releases}/legacy; fi`,
    `ln -sfn ${dir} ${site}.next`,
    `mv -T ${site}.next ${site}`,
    `ls -1dt ${releases}/*/ | tail -n +4 | xargs -r rm -rf`,
    `echo "deployed $(find ${dir} -type f | wc -l) files to ${dir}"`,
  ].join('; ')
}

/** Release folder name from a date, in UTC: 20261013-142501. */
export function releaseName(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15)
}
