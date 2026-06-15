# Muxara MCP Server

Connect AI agents to Muxara via the [Model Context Protocol](https://modelcontextprotocol.io/). Convert MKV, MP4, WebM, and other format pairs programmatically with the same limits as [muxara.com](https://muxara.com).

**Endpoint:** `https://api.muxara.com/mcp`  
**Transport:** Streamable HTTP  
**Marketing page:** https://muxara.com/mcp/

## Tools

Eight MCP tools mirror the website conversion flow. Agents call these over Streamable HTTP at the endpoint above.

| Tool | Description |
|------|-------------|
| `list_conversions` | List all conversion options with accepted input extensions and output format. |
| `get_conversion_defaults` | Get default and valid codec, quality, and trim parameters for a slug. |
| `create_conversion_job` | Create a job and receive a signed upload URL (max 500 MB input). |
| `confirm_upload` | Confirm the file was uploaded to the signed URL. |
| `update_conversion_job` | Change output format or conversion settings before processing. |
| `start_conversion` | Queue FFmpeg conversion on the worker. |
| `get_conversion_status` | Poll job status and progress when ready. |
| `get_media_info` | Probe uploaded file for duration, resolution, codecs, and bitrate. |

## Use cases

**AI chat assistants** - A user asks their assistant to convert an MKV to MP4. The agent lists formats, creates a job, guides the upload, and returns a download link when ready.

**Automation pipelines** - Scripts or CI jobs create conversion jobs, upload via signed URLs, and poll status without a browser - useful for media prep workflows.

**Format discovery** - Agents call `list_conversions` and `get_conversion_defaults` before choosing the right slug for a user's file extension and target device.

**Editor and CMS integrations** - Build custom tools that hand off transcoding to Muxara while keeping the same limits as the public website.

## Workflow

File bytes are **not** sent through MCP tool calls. Upload uses a signed URL, same as the website.

1. `create_conversion_job` - returns `jobId` and `uploadUrl`
2. `PUT` the file to `uploadUrl` (`Content-Type: application/octet-stream`)
3. `confirm_upload`
4. `start_conversion` (optionally `update_conversion_job` first)
5. `get_conversion_status` until status is `ready`
6. Download from the URL in the status response

## Connect

Use Streamable HTTP transport. The endpoint is `https://api.muxara.com/mcp`.

### Cursor

Add to your MCP config (`.cursor/mcp.json` or Cursor settings):

```json
{
  "mcpServers": {
    "muxara": {
      "url": "https://api.muxara.com/mcp"
    }
  }
}
```

### MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

In the inspector UI, choose **Streamable HTTP** and enter `https://api.muxara.com/mcp`.

Or open with the URL pre-filled:

```
http://localhost:6274/?transport=streamable-http&serverUrl=https://api.muxara.com/mcp
```

### Node.js client

See [`mcp-demo.mjs`](./mcp-demo.mjs) for a minimal script that connects and calls tools.

```bash
pnpm install
pnpm demo
```

## Authentication

The MCP server is public - no API keys, OAuth, or Muxara account required.

- No API key or sign-up
- Streamable HTTP at `api.muxara.com/mcp`
- Fair-use rate limits apply
- Free conversion and download

## Limits

MCP tools delegate to the same job API as muxara.com. These limits apply to every client.

| Limit | Value |
|-------|-------|
| Max upload | 500 MB per file |
| Job creation | 20 jobs per hour (fair-use limit) |
| API requests | 120 requests per minute (fair-use limit) |
| File retention | 24 hours |
| Cost | Free conversion and download |

## FAQ

**Do I need an API key?**  
No. The MCP server is public with fair-use limits, same as the website. No OAuth or account is required.

**Can I upload files through MCP tool calls?**  
No. `create_conversion_job` returns a signed `uploadUrl`. PUT the file directly to that URL (up to 500 MB), then call `confirm_upload`. This matches how the browser uploader works.

**Does MCP conversion cost anything?**  
No. Conversion and download are free, same as muxara.com.
