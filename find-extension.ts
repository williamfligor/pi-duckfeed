/**
 * Find in URL tool extension
 * Registers the find_in_url tool for searching within web pages
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { getSharedState } from "./shared";
import { registerFindTool } from "./tools";

export default function findExtension(pi: ExtensionAPI) {
	const { cache, cloneManager } = getSharedState(pi);
	registerFindTool(pi, { cache, cloneManager });
}
