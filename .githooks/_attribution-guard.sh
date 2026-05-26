#!/usr/bin/env bash

readonly ITRAINING_CANONICAL_NAME="James L. Cowan Jr."
readonly ITRAINING_PRIMARY_EMAIL="jameslloydcowan@gmail.com"
readonly ITRAINING_NOREPLY_EMAIL="112015792+jameslcowan@users.noreply.github.com"

reject_attribution() {
  printf '%s\n' "$*" >&2
  exit 1
}

is_allowed_email() {
  case "$1" in
    "$ITRAINING_PRIMARY_EMAIL"|"$ITRAINING_NOREPLY_EMAIL") return 0 ;;
    *) return 1 ;;
  esac
}

check_commit_object() {
  local sha="$1"
  local author_name author_email committer_name committer_email body

  author_name="$(git show -s --format='%an' "$sha")"
  author_email="$(git show -s --format='%ae' "$sha")"
  committer_name="$(git show -s --format='%cn' "$sha")"
  committer_email="$(git show -s --format='%ce' "$sha")"
  body="$(git show -s --format='%B' "$sha")"

  if [[ "$author_name" != "$ITRAINING_CANONICAL_NAME" ]]; then
    reject_attribution \
      "Rejected push: commit $sha has author '$author_name'." \
      "Expected '$ITRAINING_CANONICAL_NAME'."
  fi

  if [[ "$committer_name" != "$ITRAINING_CANONICAL_NAME" ]]; then
    reject_attribution \
      "Rejected push: commit $sha has committer '$committer_name'." \
      "Expected '$ITRAINING_CANONICAL_NAME'."
  fi

  if ! is_allowed_email "$author_email"; then
    reject_attribution \
      "Rejected push: commit $sha has author email '$author_email'." \
      "Use '$ITRAINING_PRIMARY_EMAIL' or '$ITRAINING_NOREPLY_EMAIL'."
  fi

  if ! is_allowed_email "$committer_email"; then
    reject_attribution \
      "Rejected push: commit $sha has committer email '$committer_email'." \
      "Use '$ITRAINING_PRIMARY_EMAIL' or '$ITRAINING_NOREPLY_EMAIL'."
  fi

  if grep -Eiq \
    '(^Co-authored-by:[[:space:]]*Cursor[[:space:]]*<|cursoragent@cursor\.com|root@itrain\.ing)' \
    <<<"$body"; then
    reject_attribution \
      "Rejected push: commit $sha still contains blocked attribution metadata." \
      "Run './scripts/fix-local-clone.sh' if this clone predates the 2026-05-26 rewrite."
  fi
}
