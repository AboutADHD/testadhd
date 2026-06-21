#!/bin/bash
# =============================================================================
# Isolated PM2 manager for testadhd.ro
#
# Every PM2 operation for this app MUST go through this wrapper so it uses a
# dedicated PM2_HOME (./.pm2-isolated) and never touches the daemons of the
# other apps that share this server. The process runs under the "testadhd"
# namespace as defined in ecosystem.config.cjs.
# =============================================================================
set -euo pipefail

APP_DIR="/home/runcloud/webapps/testadhd-ro"
export PM2_HOME="$APP_DIR/.pm2-isolated"
PM2="/usr/lib/node_modules/pm2/bin/pm2"   # global PM2 v7 (matches systemd unit)
APP_NAME="testadhd-prod"

mkdir -p "$PM2_HOME" "$APP_DIR/logs"
cd "$APP_DIR"

case "${1:-}" in
  start)
    "$PM2" start ecosystem.config.cjs
    "$PM2" save --force
    ;;
  stop)
    "$PM2" stop "$APP_NAME"
    "$PM2" save --force
    ;;
  restart)
    "$PM2" restart "$APP_NAME" --update-env
    "$PM2" save --force
    ;;
  reload)
    "$PM2" reload "$APP_NAME" --update-env
    "$PM2" save --force
    ;;
  delete)
    "$PM2" delete "$APP_NAME"
    "$PM2" save --force
    ;;
  save)
    "$PM2" save --force
    ;;
  status | list)
    "$PM2" list
    ;;
  logs)
    shift
    "$PM2" logs "$APP_NAME" "$@"
    ;;
  monit)
    "$PM2" monit
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|reload|delete|save|status|logs|monit}"
    echo "  PM2_HOME : $PM2_HOME"
    echo "  APP_NAME : $APP_NAME (namespace: testadhd)"
    exit 1
    ;;
esac
