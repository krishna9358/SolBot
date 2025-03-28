from typing import Optional, Dict, Any

import inspect

# import asyncio
import requests

# from agentipy.types import JupiterTokenData


def getBalance(publicKey: str) -> float:
    """
    Simulates retrieving the balance of SOL.
    """
    try:
        response = requests.post(
            "http://localhost:3002/get-balance", json={"publicKey": publicKey}
        )
        return str(response.json())
    except Exception as error:
        raise Exception(f"Error getting balance: {str(error)}")


# print(getBalance("7PECnpWqhSF4UkYSGXG79sS1Tx32yVDWbwLc4ePU3Yuf"))


# def getTokenDataByAddress(publicKey: str, mint: str) -> Optional[Dict[str, str]]:
#     """
#     Simulates fetching token metadata from the Jupiter API using a mint address.
#     """
#     try:
#         if not mint:
#             raise ValueError("Mint address is required")
#         response = requests.get(
#             "https://tokens.jup.ag/tokens?tags=verified",
#             headers={"Content-Type": "application/json"},
#         )
#         response.raise_for_status()
#         data = response.json()
#         for token in data:
#             if token.get("address") == str(mint):
#                 return JupiterTokenData(
#                     address=token.get("address"),
#                     symbol=token.get("symbol"),
#                     name=token.get("name"),
#                 )
#         return None
#     except Exception as error:
#         raise Exception(f"Error fetching token data: {str(error)}")


async def getTickerInformation(publicKey: str, ticker: str) -> Optional[str]:
    """
    fetches the mint address of a token based on its ticker symbol.
    """
    from agentipy.tools.use_backpack import BackpackManager

    try:
        ticker = BackpackManager.public_client.get_ticker(ticker)
        return ticker
    except Exception as e:
        raise Exception(f"Error fetching ticker information: {str(e)}")


def transfer(publicKey: str, receiverPublicKey: str, amount: float) -> str:
    """
    Simulates transferring SOL or SPL tokens to a recipient.
    """
    try:
        response = requests.post(
            "http://localhost:3002/transfer", json={"publicKey": publicKey, "receiverPublicKey": receiverPublicKey, "amount": amount}
        )
        return str(response.json())
    except Exception as error:
        raise Exception(f"Error transferring SOL: {str(error)}")


tool_func_dict = {
    "getBalance": getBalance,
    "getTickerInformation": getTickerInformation,
    "transfer": transfer,
    # "getTokenDataByAddress": getTokenDataByAddress,
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