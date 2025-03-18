from typing import Optional, Dict, Any
import inspect
from agentipy import SolanaAgentKit
import asyncio


async def deployToken(
    solana_agent: SolanaAgentKit,
    decimal: int,
) -> Dict[str, str]:
    """
    Simulates deploying a fungible token on the Solana blockchain.
    """
    coroutine = solana_agent.deploy_token(decimal)
    output = await asyncio.gather(coroutine)
    return output


async def getBalance(
    solana_agent: SolanaAgentKit, token_address: Optional[str] = None
) -> float:
    """
    Simulates retrieving the balance of SOL or a specific token in a wallet.
    """

    coroutine = solana_agent.get_balance(token_address=token_address)
    output = await asyncio.gather(coroutine)
    return output


async def getTokenDataByAddress(
    solana_agent: SolanaAgentKit, mint: str
) -> Optional[Dict[str, str]]:
    """
    Simulates fetching token metadata from the Jupiter API using a mint address.
    """
    coroutine = solana_agent.get_token_data_by_address(mint)
    output = await asyncio.gather(coroutine)
    return output


async def getTickerInformation(
    solana_agent: SolanaAgentKit, ticker: str
) -> Optional[str]:
    """
    Simulates fetching the mint address of a token based on its ticker symbol.
    """
    coroutine = solana_agent.get_ticker_information(ticker)
    output = await asyncio.gather(coroutine)
    return output


async def transfer(
    solana_agent: SolanaAgentKit, to: str, amount: float, mint: Optional[str] = None
) -> str:
    """
    Simulates transferring SOL or SPL tokens to a recipient.
    """
    coroutine = solana_agent.transfer(to=to, amount=amount, mint=mint)
    output = await asyncio.gather(coroutine)
    return output


async def lend_asset(solana_agent: SolanaAgentKit, amount: float) -> str:
    """
    Simulates lending USDC tokens for yield.
    """
    coroutine = solana_agent.lend_assets(amount=amount)
    output = await asyncio.gather(coroutine)
    return output


async def flash_open_trade(
    solana_agent: SolanaAgentKit,
    token: str,
    side: str,
    collateral_usd: float,
    leverage: float,
) -> Dict[str, Any]:
    """
    Simulates opening a flash trade.
    """
    coroutine = solana_agent.flash_open_trade(
        token=token, side=side, collateral_usd=collateral_usd, leverage=leverage
    )
    output = await asyncio.gather(coroutine)
    return output


async def trade(
    solana_agent: SolanaAgentKit,
    output_mint: str,
    input_amount: float,
    input_mint: str = "USDC",
    slippage_bps: int = 300,
) -> str:
    """
    Simulates swapping tokens using Jupiter Exchange.
    """
    coroutine = solana_agent.trade(
        output_mint=output_mint,
        input_amount=input_amount,
        input_mint=input_mint,
        slippage_bps=slippage_bps,
    )
    output = await asyncio.gather(coroutine)
    return output


async def flash_close_trade(
    solana_agent: SolanaAgentKit, token: str, side: str
) -> Dict[str, Any]:
    """
    Simulates closing a flash trade.
    """
    coroutine = solana_agent.flash_close_trade(token=token, side=side)
    output = await asyncio.gather(coroutine)
    return output


tool_func_dict = {
    "getBalance": getBalance,
    "deployToken": deployToken,
    "getTickerInformation": getTickerInformation,
    "transfer": transfer,
    "lend_asset": lend_asset,
    "flash_open_trade": flash_open_trade,
    "trade": trade,
    "flash_close_trade": flash_close_trade,
}


def check_missing(data, func):
    missing_params = []
    for param, value in data.items():
        func_params = inspect.signature(tool_func_dict[func]).parameters
        if value is None or value == "None" or value == "nill":
            if "optional" in str(func_params[param].annotation).lower():
                pass
            else:
                missing_params.append(param)
    return missing_params
