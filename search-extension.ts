/**
 * Web Search tool extension
 * Registers the web_search tool for DuckDuckGo web searches
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerSearchTool } from "./tools";

export default function searchExtension(pi: ExtensionAPI) {
	registerSearchTool(pi);
}
