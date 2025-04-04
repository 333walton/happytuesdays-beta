#!/bin/bash

LAST_HASH_FILE=".last-changelog-hash"
OUTFILE="charles98-changelog.txt"

# Get the last saved hash, or use empty string if not found
LAST_HASH=$(cat $LAST_HASH_FILE 2>/dev/null)

# Get the latest commit hash
LATEST_HASH=$(git rev-parse HEAD)

# Skip if no new commits
if [ "$LAST_HASH" == "$LATEST_HASH" ]; then
  echo "No new commits to log."
  exit 0
fi

echo "============================================================" >> $OUTFILE
echo ">>CHARLES98 CHANGELOG.TXT - $(date +%Y-%m-%d)" >> $OUTFILE
echo "============================================================" >> $OUTFILE

# If first run, log everything; else, only new commits
if [ -z "$LAST_HASH" ]; then
  git log --pretty=format:"[%ad]  %h  - %s" --date=short >> $OUTFILE
else
  git log $LAST_HASH..HEAD --pretty=format:"[%ad]  %h  - %s" --date=short >> $OUTFILE
fi

echo "============================================================" >> $OUTFILE

# Save the new latest hash
echo $LATEST_HASH > $LAST_HASH_FILE

echo "✅ Changelog updated with commits since $LAST_HASH"


