#!/usr/bin/env node
/**
 * Minimal Muxara MCP client demo.
 *
 * Connects over Streamable HTTP, lists tools, calls list_conversions,
 * and fetches defaults for mkv-to-mp4.
 *
 * Usage: pnpm demo
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_URL = process.env.MUXARA_MCP_URL || "https://api.muxara.com/mcp";

function textFromToolResult(result) {
  const block = result?.content?.find((item) => item.type === "text");
  if (!block?.text) {
    return result;
  }
  try {
    return JSON.parse(block.text);
  } catch {
    return block.text;
  }
}

async function main() {
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));
  const client = new Client({ name: "muxara-docs-demo", version: "1.0.0" });

  console.log(`Connecting to ${MCP_URL}…`);
  await client.connect(transport);

  try {
    const { tools } = await client.listTools();
    console.log(`\nTools (${tools.length}):`);
    for (const tool of tools) {
      console.log(`  - ${tool.name}`);
    }

    console.log("\nCalling list_conversions…");
    const conversions = textFromToolResult(
      await client.callTool({ name: "list_conversions", arguments: {} }),
    );
    console.log(`  count: ${conversions.count}`);
    console.log("  sample:", conversions.conversions.slice(0, 3));

    console.log("\nCalling get_conversion_defaults for mkv-to-mp4…");
    const defaults = textFromToolResult(
      await client.callTool({
        name: "get_conversion_defaults",
        arguments: { slug: "mkv-to-mp4" },
      }),
    );
    console.log("  slug:", defaults.slug);
    console.log("  inputExtensions:", defaults.inputExtensions);
    console.log("  outputExtension:", defaults.outputExtension);
    console.log("  defaultParams:", defaults.defaultParams);
  } finally {
    await client.close();
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("MCP demo failed:", err);
  process.exit(1);
});
