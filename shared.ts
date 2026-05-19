/**
 * Shared state for browser tools
 * Imported by all tool extension files so they share the same cache/cloneManager/tempTracker
 *
 * Session event handlers are registered here (once) regardless of which individual
 * tool extensions are enabled in pi config.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { CloneManager } from "./github";
import { createPageCache, TempDirTracker } from "./utils";

let _cache: ReturnType<typeof createPageCache> | undefined;
let _cloneManager: CloneManager | undefined;
let _tempTracker: TempDirTracker | undefined;
let _handlersRegistered = false;

export function getSharedState(pi: ExtensionAPI) {
    if (!_cache) {
        _cache = createPageCache();
        _cloneManager = new CloneManager();
        _tempTracker = new TempDirTracker();

        // Register session handlers once (shared across all tool extensions)
        if (!_handlersRegistered) {
            _handlersRegistered = true;

            // Clear clone cache on session change
            pi.on("session_start", async () => {
                if (_cloneManager) await _cloneManager.clear();
            });

            // Clear temp dirs on session change
            pi.on("session_end", async () => {
                if (_tempTracker) await _tempTracker.clear();
            });
        }
    }
    /* biome-ignore lint/style/noNonNullAssertion: lazy init guarantees values are set */
    return { cache: _cache!, cloneManager: _cloneManager!, tempTracker: _tempTracker! };
}
