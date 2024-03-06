//@ts-nocheck
const { Client, TextChannel, Guild, EmbedBuilder } = require('discord.js');
const WebSocket = require('ws');

// Tensor API Key
const API_KEY = process.env.API_KEY || "TENSOR_API_KEY";
// Secret token of your Bot
const BOT_TOKEN = process.env.BOT_TOKEN || "DISCORD_BOT_TOKEN";
// Guild ID (Discord Server ID)
const GUILD_ID = process.env.GUILD_ID || "GUILD_ID";
// Channel ID of the Server
const CHANNEL_ID = process.env.CHANNEL_ID || "CHANNEL_ID";
// Tensor WSS URL
const WSS_URL = process.env.WSS_URL || "wss://rest-gated.api.tensor-infra.com/ws";
// Collection slug you want to listen to (default: Tensorians)
const slug = process.env.SLUG || "05c52d84-2e49-4ed9-a473-b43cab41e777";

// Specific txType's you want the bot to send messages for (for extra txType's, you need to define wanted messages in sendEventToDiscord())
const TXTYPES_TO_LISTEN_TO = ["SWAP_SELL_NFT", "SALE_BUY_NOW"];

const client = new Client({
    intents: [],
});

// Login to the bot
client.login(BOT_TOKEN);

// Run WS setup after Bot is logged in
client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    runSetup();
});

async function runSetup() {
    try {
        const socket = new WebSocket(WSS_URL, {
            headers: {
                'x-tensor-api-key': API_KEY,
            },
        });
        // Connection opened
        socket.addEventListener('open', (event) => {
            console.log('WebSocket connection type:', event.type);
            // Send body for the event you want to get subscribed to
            socket.send(JSON.stringify({
                "event": "newTransaction",
                "payload": {
                    "slug": slug
                }
            }));
        });
        console.log("Connected to Tensor WebSocket Endpoint, waiting for incoming events...");

        // Fetch the Guild using Guild ID and Channel using Channel ID
        const guild = await client.guilds.fetch(GUILD_ID);
        const channel = await guild.channels.fetch(CHANNEL_ID);

        // Start listening to incoming messages
        socket.addEventListener('message', (event) => {
            // Check if the incoming event has data attached to it
            const event_stringified = event?.data?.toString();
            if (event_stringified !== '' && event_stringified !== null) {
                // Parse event
                const eventData = JSON.parse(event_stringified);
                // Send Discord message if txType is included in TXTYPES_TO_LISTEN_TO
                if (TXTYPES_TO_LISTEN_TO.includes(eventData.data.tx.tx.txType)) {
                    sendEventToDiscord(eventData, channel);
                }
            }
        });
    }
    catch (error) {
        console.error('Error during setup:', error);
    }
}

async function sendEventToDiscord(eventData, channel) {
    // Check if the channel exists
    if (channel) {
        const imageUri = eventData.data.tx.mint.imageUri;
        const name = eventData.data.tx.mint.name;
        const priceLamports = eventData.data.tx.tx.grossAmount;
        const txId = eventData.data.tx.tx.txId;
        const buyer = eventData.data.tx.tx.buyerId;
        const seller = eventData.data.tx.tx.sellerId;
        const txLink = "https://solscan.io/tx/" + txId;
        const buyerLink = "https://solscan.io/account/" + buyer;
        const sellerLink = "https://solscan.io/account/" + seller;
        const embed = new EmbedBuilder()
            .setTitle(`${name}`)
            .setThumbnail(imageUri)
            .setFooter({ text: `Provided to you by Tensor`, iconURL: 'https://pbs.twimg.com/profile_images/1570907127287259136/qujno7O4_400x400.jpg' })
            .addFields(
                { name: 'Transaction', value: formatAddressesAndTxIds(txId, txLink), inline: true },
                { name: 'Buyer', value: formatAddressesAndTxIds(buyer, buyerLink), inline: true },
                { name: 'Seller', value: formatAddressesAndTxIds(seller, sellerLink), inline: true }
            );
        // NFT got sold into pool
        if (eventData.data.tx.tx.txType == "SWAP_SELL_NFT") {
            embed.setDescription(`got sold into a Pool for ${Number((priceLamports / 1_000_000_000).toFixed(3))} S◎L. :zap:`);
        }
        // NFT got bought from the orderbook
        if (eventData.data.tx.tx.txType == "SALE_BUY_NOW") {
            embed.setDescription(`got bought for ${Number((priceLamports / 1_000_000_000).toFixed(3))} S◎L. :zap:`);
        }
        // Send the embed to the given channel
        channel.send({ embeds: [embed] });
    }
    else {
        console.error('Channel not found');
    }
}

// helper func that shortens addresses and tx ids and formats them to a markdown hyperlink  
function formatAddressesAndTxIds(address: string, link: string) {
    const firstFour = address.slice(0, 4);
    const lastFour = address.slice(-4);
    return `[${firstFour}...${lastFour}](${link})`;
}
