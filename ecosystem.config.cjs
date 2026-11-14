/**
 * PM2 process definition — testadhd.ro (Next.js 16, production).
 *
 * Runs behind nginx (reverse proxy 127.0.0.1:9460). Managed through an ISOLATED
 * PM2 instance so it never collides with the other apps on this server — see
 * pm2-isolated.sh, which pins PM2_HOME to ./.pm2-isolated and namespaces the
 * process under "testadhd".
 *
 * Fork mode, single instance: Next.js' server is already async/non-blocking and
 * this is a low-traffic screening tool. Horizontal scaling, if ever needed,
 * would mean extra PM2 instances on distinct ports behind an nginx upstream.
 * Resilience comes from autorestart + memory ceiling + nightly cron restart, and
 * boot persistence from the pm2-testadhd.service systemd unit (pm2 resurrect).
 */
module.exports = {
  apps: [
    {
      name: "testadhd-prod",
      namespace: "testadhd",
      cwd: "/home/runcloud/webapps/testadhd-ro",
      // Invoke the Next.js CLI directly so PM2 owns the Node process.
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 9460 -H 127.0.0.1",
      // RUNTIME = Node 24 LTS, pinned by absolute path (2026-11). The box's shared
      // system /usr/bin/node is 22 and serves ~20 other tenants, so it is NOT
      // upgraded in place — this app opts in on its own (same pattern as the
      // donatie-despreadhd.ro sibling). The PM2 God Daemon (global PM2 v7, started
      // by pm2-testadhd.service) stays on the system node; only this child runs on
      // 24. Native deps (@next/swc, sharp) are N-API → no rebuild across majors.
      // Changing this line needs `./pm2-isolated.sh delete` + `start` (a plain
      // reload keeps the old interpreter); `start` re-saves the dump so boot-time
      // `pm2 resurrect` comes back on 24. Keep in step with scripts/check-node.mjs.
      // Rollback: point it back at /usr/bin/node, revert package.json engines +
      // the prebuild guard + .nvmrc, `npm ci && npm run build`, delete + start.
      interpreter: "/home/runcloud/.nvm/versions/node/v24.22.3/bin/node",

      exec_mode: "fork",
      instances: 1,

      // Restart strategy
      autorestart: true,
      max_restarts: 10,
      min_uptime: "20s",
      restart_delay: 4000,
      exp_backoff_restart_delay: 200,
      kill_timeout: 5000,

      // Resource ceiling + nightly recycle
      max_memory_restart: "500M",
      cron_restart: "0 4 * * *",
      watch: false,

      env: {
        NODE_ENV: "production",
        PORT: 9460,
        HOSTNAME: "127.0.0.1",
        TZ: "Europe/Bucharest",
      },

      // Logging
      merge_logs: true,
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
    },
  ],
};
