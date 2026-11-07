#!/bin/zsh
# Kullanım: zsh parola_degistir.sh <yeni 6 haneli parola>
set -e; cd "$(dirname "$0")"; NEW=$1; [[ $NEW =~ ^[0-9]{6}$ ]] || { echo "6 rakam gir"; exit 1; }
SLUG=$(python3 -c "import hashlib,sys;print(hashlib.sha256(('kilavuz-'+sys.argv[1]).encode()).hexdigest()[:10])" $NEW)
OLD=$(ls s | head -1); [ "$OLD" = "$SLUG" ] && { echo "aynı parola"; exit 0; }
git mv "s/$OLD" "s/$SLUG"; echo "içerik s/$SLUG altına taşındı; şimdi: git commit -am parola && git push"
