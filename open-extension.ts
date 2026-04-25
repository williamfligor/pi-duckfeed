/**
 * Open URL tool extension
 * Registers the open_url tool for fetching and extracting web page content
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { getSharedState } from "./shared";
import { registerOpenTool } from "./tools";

export default function openExtension(pi: ExtensionAPI) {
	const { cache, cloneManager, tempTracker } = getSharedState(pi);
	registerOpenTool(pi, { cache, cloneManager, tempTracker });
}
