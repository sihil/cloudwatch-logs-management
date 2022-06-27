#!/bin/bash

set -e

setupNodeVersion() {
  # source NVM on teamcity
  if [ -e "${NVM_DIR}/nvm.sh" ]; then
      . ${NVM_DIR}/nvm.sh
  else
      . $(brew --prefix nvm)/nvm.sh
  fi
  nvm install
  nvm use
}

injectBuildInfo() {
  COMMIT=$(git rev-parse HEAD)
  BUILD="${BUILD_NUMBER:-DEV}"
  echo "// prettier-ignore" > src/build-info.ts
  echo "export const BUILD_INFO = { 'ShippedBy-revision': '${COMMIT}', 'ShippedBy-buildNumber': '${BUILD}' };" >> src/build-info.ts
}

setupNodeVersion
injectBuildInfo

(
  cd cdk
  npm ci
  npm run test
  npm run lint
  npm run synth
)

npm ci
npm run test
npm run lint
npm run build
npm run riffRaffUpload
