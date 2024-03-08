# Tensor Market Boilerplate

**Welcome to the Tensor Discord Template!**

This demo provides a simple foundation for working with the Tensor API, use it to get started building NOW!

![Sample Screenshot]()

### Prerequisites

- Node v18.18.0 or higher
- Tensor API Key [Request Page](https://tensor.readme.io/page/tensor-api-form)
- Discord API Key [Discord Developers](https://discord.com/developers/applications)

### Installation

#### Clone the repo

```shell
git clone tensor-hq/discord-salesbot-template 
cd discord-salesbot-template 
```

#### Install Dependencies

```shell
npm install
```

#### Set environment variables in .env
```
// Tensor API Key
API_KEY=
// Secret token of your Bot
BOT_TOKEN=
// Guild ID (Discord Server ID)
GUILD_ID=
// Channel ID of the Server
CHANNEL_ID=
// Tensor WSS URL
WSS_URL=
// Collection slug you want to listen to
SLUG=
```

#### Start the bot

```
npx ts-node main.ts
```

#### Join the bot to your Discord
Review the [Discord documentation](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links) to see how to join your bot to a discord
