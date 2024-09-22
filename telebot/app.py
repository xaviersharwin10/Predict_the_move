import os
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from web3 import Web3
import json

# Replace with your own values
TELEGRAM_BOT_TOKEN = "7714222269:AAEjBaIhH-289kwHfMhwM78-DFH17Wmf_Xo"
AIRDAO_TESTNET_URL = "https://network.ambrosus-test.io"
CONTRACT_ADDRESS = "0x9EE515e111219D83E20DC4040994cC3043bA9b92"

# Connect to AirDAO testnet
w3 = Web3(Web3.HTTPProvider(AIRDAO_TESTNET_URL))

# Ensure we're connected to the right network
assert w3.eth.chain_id == 22040, "Not connected to AirDAO testnet"

# Load contract ABI
with open("PredictionMarket.json", "r") as f:
    contract_json = json.load(f)
contract_abi = contract_json["abi"]

# Create contract instance
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=contract_abi)

# Store user private keys (WARNING: This is not secure and should not be used in production)
user_private_keys = {}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("Welcome to the Prediction Market bot on AirDAO testnet! Please submit your private key using /setkey <your_private_key>. Note: Your privatekey is not stored anywhere in our systems")

async def set_private_key(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if len(context.args) != 1:
        await update.message.reply_text("Usage: /setkey <your_private_key>")
        return
    
    private_key = context.args[0]
    user_id = update.effective_user.id
    user_private_keys[user_id] = private_key
    await update.message.reply_text("Private key set. You can now use the bot. Remember, sharing your private key is extremely risky!")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    help_text = """
    Available commands:
    /setkey <your_private_key> - Set your private key
    /createmarket <question> <end_date> - Create a new market
    /placestake <market_id> <prediction> <amount> - Place a stake on a market
    /resolvemarket <market_id> <outcome> - Resolve a market (owner only)
    /claimwinnings <market_id> - Claim winnings from a resolved market
    /marketinfo <market_id> - Get information about a specific market
    /myinfo <market_id> - Get your stake information for a specific market
    /allmarkets - Get a list of all markets
    """
    await update.message.reply_text(help_text)

# Helper function to get user's private key
def get_user_private_key(user_id):
    return user_private_keys.get(user_id)

async def create_market(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.effective_user.id
    private_key = get_user_private_key(user_id)
    if not private_key:
        await update.message.reply_text("Please set your private key first using /setkey")
        return

    args = context.args
    if len(args) < 2:
        await update.message.reply_text("❌ Input validation failed. Usage: /createmarket <question> <end_date>")
        return

    await update.message.reply_text("✅ Input received. Processing your request to create a market...")

    question = " ".join(args[:-1])
    try:
        end_date = int(args[-1])
    except ValueError:
        await update.message.reply_text("❌ Invalid end date. Please provide a valid Unix timestamp.")
        return

    # Call the contract function
    try:
        tx = contract.functions.createMarket(question, end_date).build_transaction({
            'from': w3.eth.account.from_key(private_key).address,
            'nonce': w3.eth.get_transaction_count(w3.eth.account.from_key(private_key).address),
            'gasPrice': w3.eth.gas_price,
        })
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if receipt.status == 1:
            await update.message.reply_text(f"✅ Market created successfully! Transaction hash: {tx_hash.hex()}")
        else:
            await update.message.reply_text("❌ Failed to create market. Transaction was reverted.")
    except Exception as e:
        await update.message.reply_text(f"❌ An error occurred while creating the market: {str(e)}")

async def place_stake(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.effective_user.id
    private_key = get_user_private_key(user_id)
    if not private_key:
        await update.message.reply_text("Please set your private key first using /setkey")
        return

    args = context.args
    if len(args) != 3:
        await update.message.reply_text("❌ Input validation failed. Usage: /placestake <market_id> <prediction> <amount>")
        return

    await update.message.reply_text("✅ Input received. Processing your stake...")

    try:
        market_id = int(args[0])
        prediction = args[1].lower() == 'true'
        amount = int(args[2])
    except ValueError:
        await update.message.reply_text("❌ Invalid input. Please check your market ID, prediction, and amount.")
        return

    # Call the contract function
    try:
        tx = contract.functions.placeStake(market_id, prediction).build_transaction({
            'from': w3.eth.account.from_key(private_key).address,
            'nonce': w3.eth.get_transaction_count(w3.eth.account.from_key(private_key).address),
            'gasPrice': w3.eth.gas_price,
            'value': amount,
        })
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if receipt.status == 1:
            await update.message.reply_text(f"✅ Stake placed successfully! Transaction hash: {tx_hash.hex()}")
        else:
            await update.message.reply_text("❌ Failed to place stake. Transaction was reverted.")
    except Exception as e:
        await update.message.reply_text(f"❌ An error occurred while placing the stake: {str(e)}")

async def resolve_market(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.effective_user.id
    private_key = get_user_private_key(user_id)
    if not private_key:
        await update.message.reply_text("Please set your private key first using /setkey")
        return

    args = context.args
    if len(args) != 2:
        await update.message.reply_text("❌ Input validation failed. Usage: /resolvemarket <market_id> <outcome>")
        return

    await update.message.reply_text("✅ Input received. Processing market resolution...")

    try:
        market_id = int(args[0])
        outcome = args[1].lower() == 'true'
    except ValueError:
        await update.message.reply_text("❌ Invalid input. Please check your market ID and outcome.")
        return

    # Call the contract function
    try:
        tx = contract.functions.resolveMarket(market_id, outcome).build_transaction({
            'from': w3.eth.account.from_key(private_key).address,
            'nonce': w3.eth.get_transaction_count(w3.eth.account.from_key(private_key).address),
            'gasPrice': w3.eth.gas_price,
        })
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if receipt.status == 1:
            await update.message.reply_text(f"✅ Market resolved successfully! Transaction hash: {tx_hash.hex()}")
        else:
            await update.message.reply_text("❌ Failed to resolve market. Transaction was reverted.")
    except Exception as e:
        await update.message.reply_text(f"❌ An error occurred while resolving the market: {str(e)}")

async def claim_winnings(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.effective_user.id
    private_key = get_user_private_key(user_id)
    if not private_key:
        await update.message.reply_text("Please set your private key first using /setkey")
        return

    args = context.args
    if len(args) != 1:
        await update.message.reply_text("❌ Input validation failed. Usage: /claimwinnings <market_id>")
        return

    await update.message.reply_text("✅ Input received. Processing your claim for winnings...")

    try:
        market_id = int(args[0])
    except ValueError:
        await update.message.reply_text("❌ Invalid market ID. Please provide a valid integer.")
        return

    # Call the contract function
    try:
        tx = contract.functions.claimWinnings(market_id).build_transaction({
            'from': w3.eth.account.from_key(private_key).address,
            'nonce': w3.eth.get_transaction_count(w3.eth.account.from_key(private_key).address),
            'gasPrice': w3.eth.gas_price,
        })
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if receipt.status == 1:
            await update.message.reply_text(f"✅ Winnings claimed successfully! Transaction hash: {tx_hash.hex()}")
        else:
            await update.message.reply_text("❌ Failed to claim winnings. Transaction was reverted.")
    except Exception as e:
        await update.message.reply_text(f"❌ An error occurred while claiming winnings: {str(e)}")

async def market_info(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    args = context.args
    if len(args) != 1:
        await update.message.reply_text("❌ Input validation failed. Usage: /marketinfo <market_id>")
        return

    await update.message.reply_text("✅ Input received. Fetching market information...")

    try:
        market_id = int(args[0])
    except ValueError:
        await update.message.reply_text("❌ Invalid market ID. Please provide a valid integer.")
        return

    # Call the contract function
    try:
        market_info = contract.functions.getMarketDetails(market_id).call()
        
        info_text = f"""
        ✅ Market Information:
        Market ID: {market_id}
        Question: {market_info[1]}
        End Date: {market_info[4]}
        Resolved: {market_info[3]}
        Outcome: {market_info[5]}
        Total Stake: {market_info[4]} 
        """
        
        await update.message.reply_text(info_text)
    except Exception as e:
        await update.message.reply_text(f"❌ An error occurred while fetching market information: {str(e)}")

async def my_info(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.effective_user.id
    private_key = get_user_private_key(user_id)
    if not private_key:
        await update.message.reply_text("Please set your private key first using /setkey")
        return

    args = context.args
    if len(args) != 1:
        await update.message.reply_text("❌ Input validation failed. Usage: /myinfo <market_id>")
        return

    await update.message.reply_text("✅ Input received. Fetching your stake information...")

    try:
        market_id = int(args[0])
    except ValueError:
        await update.message.reply_text("❌ Invalid market ID. Please provide a valid integer.")
        return

    user_address = w3.eth.account.from_key(private_key).address

    # Call the contract function
    try:
        stake_info = contract.functions.getStakeInfo(market_id, user_address).call()
        
        info_text = f"""
        ✅ Your Stake Information:
        Market ID: {market_id}
        Your Address: {user_address}
        Stake Amount: {stake_info[0]}
        Prediction: {stake_info[1]}
        Claimed: {stake_info[2]}
        """
        
        await update.message.reply_text(info_text)
    except Exception as e:
        await update.message.reply_text(f"❌ An error occurred while fetching your stake information: {str(e)}")

async def get_all_markets(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("📊 Fetching all markets. This may take a moment...")

    try:
        # Get the total number of markets
        market_count = contract.functions.getMarketCount().call()
        
        if market_count == 0:
            await update.message.reply_text("No markets have been created yet.")
            return

        all_markets_info = []

        # Fetch details for each market
        for market_id in range(market_count):
            try:
                market_info = contract.functions.getMarketDetails(market_id).call()
                all_markets_info.append({
                    "id": market_id,
                    "question": market_info[1],
                    "end_date": market_info[4],
                    "resolved": market_info[2],
                    "outcome": market_info[5],
                    "total_stake": int(market_info[2] + market_info[3])
                })
            except Exception as e:
                print(f"Error fetching market {market_id}: {str(e)}")
                continue

        # Prepare the response message
        response = "📊 All Markets:\n\n"
        for market in all_markets_info:
            response += f"ID: {market['id']}\n"
            response += f"Question: {market['question']}\n"
            response += f"End Date: {market['end_date']}\n"
            response += f"Resolved: {'Yes' if market['resolved'] else 'No'}\n"
            response += f"Outcome: {market['outcome'] if market['resolved'] else 'N/A'}\n"
            response += f"Total Stake: {market['total_stake']}\n"
            response += "\n"

        # Split the response into chunks if it's too long
        max_message_length = 4096  # Telegram's max message length
        for i in range(0, len(response), max_message_length):
            await update.message.reply_text(response[i:i+max_message_length])

    except Exception as e:
        await update.message.reply_text(f"❌ An error occurred while fetching markets: {str(e)}")

def main() -> None:
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("setkey", set_private_key))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("createmarket", create_market))
    application.add_handler(CommandHandler("placestake", place_stake))
    application.add_handler(CommandHandler("resolvemarket", resolve_market))
    application.add_handler(CommandHandler("claimwinnings", claim_winnings))
    application.add_handler(CommandHandler("marketinfo", market_info))
    application.add_handler(CommandHandler("myinfo", my_info))
    application.add_handler(CommandHandler("allmarkets", get_all_markets))

    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()