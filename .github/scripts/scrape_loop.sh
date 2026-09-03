#!/usr/bin/env bash
#
# Scrape-Schleife fuer ein Zeitfenster.
#
# Warum eine Schleife statt eines Cron-Slots pro Scrape: GitHubs Scheduler hat
# unsere Slots ab dem 26.08.2026 reihenweise verworfen — 9/9 Runs am 25.08.,
# 4/9 am 26.08., 2/9 am 27.08., 1/9 am 28.08., 0/12 am 31.08., mit Verzug bis
# zu 8h51. Ein einziger Run, der selbst schlaeft, haengt nur noch an EINEM
# Cron-Slot pro Tag statt an 18 — und trifft seine Slots danach auf die Sekunde,
# weil nicht mehr GitHubs Dispatcher taktet, sondern unser eigenes `sleep`.
#
# Erwartete Umgebung:
#   LOOP_UNTIL   HH:MM UTC — spaetester Zeitpunkt, zu dem ein Scrape noch startet
#   MAX_MINUTES  hartes Laufzeitlimit gegen GitHubs 6-Stunden-Job-Timeout
#
# Exit 1 nur, wenn KEIN einziger Durchlauf Daten geschrieben hat. Ein einzelner
# kaputter Slot darf den Rest des Handelstags nicht abwuergen.

set -uo pipefail

LOOP_UNTIL="${LOOP_UNTIL:?LOOP_UNTIL (HH:MM UTC) fehlt}"
MAX_MINUTES="${MAX_MINUTES:-315}"
SLOT_SECONDS="${SLOT_SECONDS:-1800}"   # alle 30 Minuten
EARLIEST_UTC="${EARLIEST_UTC:-12:30}"  # davor laeuft nie eine Schleife

DATA_PATHS=(
  docs/data.json
  docs/etf_data.json
  docs/etf_perf.json
  docs/history.json
  docs/regime.json
  docs/setups.json
  docs/position_thesis.json
  docs/snapshots
)

today="$(date -u +%F)"
start_epoch="$(date -u +%s)"
hard_stop=$(( start_epoch + MAX_MINUTES * 60 ))
window_start="$(date -u -d "${today} ${EARLIEST_UTC}" +%s)"
window_end="$(date -u -d "${today} ${LOOP_UNTIL}" +%s)"
deadline=$(( window_end < hard_stop ? window_end : hard_stop ))

git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"

# actions/checkout holt github.sha — den Stand vom RUN-Start. Der `close`-Job
# startet aber erst Stunden spaeter und ist damit um alle Commits hinterher,
# die `session` inzwischen gepusht hat. Ohne diesen Sync ist sein erster Push
# zwangslaeufig "behind" (31.08./01.09./02.09.2026: dadurch je 0 erfolgreiche
# Durchlaeufe am ganzen Nachmittag).
if git fetch -q origin "${GITHUB_REF_NAME}"; then
  git reset -q --hard "origin/${GITHUB_REF_NAME}"
  echo "Auf origin/${GITHUB_REF_NAME} synchronisiert: $(git rev-parse --short HEAD)"
else
  echo "fetch fehlgeschlagen — arbeite auf dem ausgecheckten Stand weiter." >&2
fi

commit_and_push() {
  local msg
  msg="data: update $(TZ='America/New_York' date '+%Y-%m-%d %H:%M %Z')"

  for attempt in 1 2 3; do
    git add "${DATA_PATHS[@]}"
    if git diff --staged --quiet; then
      echo "Keine Datenaenderung — nichts zu committen."
      return 0
    fi
    git commit -q -m "${msg}"
    if git push -q; then
      return 0
    fi

    # Kein Rebase mehr: die Datendateien werden bei jedem Scrape vollstaendig
    # neu geschrieben, ein Merge gegen den Remote-Stand endet deshalb IMMER im
    # Konflikt — und der abgebrochene Rebase liess den Commit lokal liegen, was
    # jeden weiteren Slot des Jobs mit derselben Kollision hat scheitern lassen.
    # Stattdessen HEAD und Index auf den Remote-Stand setzen (Working Tree mit
    # den frischen Daten bleibt unangetastet) und neu committen: unsere Zahlen
    # sind per Definition die aktuelleren, fremde Aenderungen an anderen Dateien
    # bleiben erhalten, weil nur DATA_PATHS gestaged wird.
    echo "Push abgelehnt (Versuch ${attempt}) — setze auf origin/${GITHUB_REF_NAME} neu auf."
    git fetch -q origin "${GITHUB_REF_NAME}" || continue
    git reset -q --mixed "origin/${GITHUB_REF_NAME}"
  done

  echo "Push nach 3 Versuchen fehlgeschlagen." >&2
  return 1
}

run_once() {
  local rc=0
  echo "::group::Scrape $(date -u '+%F %T UTC')"
  python scrape.py || rc=$?
  if [ "${rc}" -ne 0 ]; then
    echo "Scraper fehlgeschlagen (exit ${rc}) — Slot wird uebersprungen." >&2
    git checkout -- "${DATA_PATHS[@]}" 2>/dev/null || true
  else
    commit_and_push || rc=$?
  fi
  echo "::endgroup::"
  return "${rc}"
}

now="$(date -u +%s)"
if [ "${now}" -lt "${window_start}" ] || [ "${now}" -gt "${window_end}" ]; then
  # Nachzuegler: GitHub hat den Run Stunden zu spaet gestartet (Rekord bisher:
  # 03:22 UTC statt 22:39 UTC). Dann einmal frische Daten holen und Schluss —
  # nicht mitten in der Nacht eine 5-Stunden-Schleife aufziehen.
  echo "Ausserhalb des Fensters ${EARLIEST_UTC}-${LOOP_UNTIL} UTC — einmaliger Scrape statt Schleife."
  run_once
  exit $?
fi

echo "Fenster bis $(date -u -d "@${deadline}" '+%F %T UTC') · Slot alle $(( SLOT_SECONDS / 60 )) min"

ok=0
fail=0
while :; do
  if run_once; then
    ok=$(( ok + 1 ))
  else
    fail=$(( fail + 1 ))
  fi

  now="$(date -u +%s)"
  next=$(( now - now % SLOT_SECONDS + SLOT_SECONDS ))
  if [ "${next}" -gt "${deadline}" ]; then
    break
  fi
  echo "Naechster Slot $(date -u -d "@${next}" '+%H:%M UTC') — schlafe $(( (next - now) / 60 )) min."
  sleep $(( next - now ))
done

echo "Fenster beendet: ${ok} erfolgreiche, ${fail} fehlgeschlagene Durchlaeufe."
[ "${ok}" -gt 0 ] || exit 1
