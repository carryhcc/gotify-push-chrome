# Gotify Push Tool - Chrome Extension

[View in Chinese (简体中文)](README_zh-CN.md)

A Chrome browser extension for sending push messages to a Gotify server.

## Features

- Configure your Gotify server URL and multiple Tokens
- Quickly send push messages with custom titles and content
- Support for selecting different Tokens for sending messages
- Multi-language support (English, Simplified Chinese) with a manual switcher in settings

## Installation

1. Visit `chrome://extensions/` in your Chrome browser
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the root directory of this project

## How to Use

1. Click the extension icon, then click the "Settings" button to configure your Gotify server URL and Token(s)
2. Return to the main popup, select the Token (Environment) you want to use
3. Enter the push title and content
4. Click the "Send" button to push the message

## Technical Details

- Uses Chrome Extension Manifest V3
- Uses Chrome Storage API to store configuration
- Uses Fetch API to send HTTP requests
- Implements a manual i18n system for UI language switching

## Development & Debugging

During development, you can use Chrome Developer Tools to view the extension's logs and errors. To debug the popup, right-click on the popup window and select "Inspect".

403 error handling
Check if the GOTIFY_SERVER_CORS_ALLOWORIGINS configuration item is set correctly.
docker GOTIFY_SERVER_CORS_ALLOWORIGINS = - ".\*"

chrome store 5$
