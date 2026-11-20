#!/usr/bin/env bash
sed -i 's/^COPILOTKIT_LICENSE_TOKEN=.*/COPILOTKIT_LICENSE_TOKEN=/' apps/openbot/.env
sed -i 's|^INTELLIGENCE_API_URL=.*|INTELLIGENCE_API_URL=https://api.intelligence.copilotkit.ai|' apps/openbot/.env
sed -i 's|^INTELLIGENCE_GATEWAY_WS_URL=.*|INTELLIGENCE_GATEWAY_WS_URL=wss://realtime.intelligence.copilotkit.ai|' apps/openbot/.env
sed -i 's/^CPK_INTELLIGENCE_API_KEY=.*/CPK_INTELLIGENCE_API_KEY=ck_pub_c90cc0fa19eeb25116adf6205c010493/' apps/openbot/.env
