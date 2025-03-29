from typing import TypedDict, Annotated, List, Literal
from langchain_core.messages import AnyMessage
from langchain_core.pydantic_v1 import BaseModel, Field
import operator


class toolsReqd(BaseModel):
    # deployToken: Literal["Required", "Not Required"] = Field(
    #     """It is a tool that deploys a fungible token on the Solana blockchain using the SolanaAgentKit.
    
    # It requires the following parameters:
    # - decimals: Defines how many decimal places the token can have (like 9 for SOL, 6 for USDC).

    # Returns:
    # - A dictionary containing the mint address of the newly created token.
    #   Example:
    #   {
    #       "mint": <PublicKey>  # The public key of the token mint.
    #   }
    # """
    # )

    getBalance: Literal["Required", "Not Required"] = Field(
        """It retrieves the balance of either SOL or a specific token in a given Solana wallet.
    
    It dont require any parameter:
    
    Returns:
    - A number representing the balance of the requested asset (either SOL or a token).
    """
    )

    # getTokenDataByAddress: Literal["Required", "Not Required"] = Field(
    #     """Fetches token metadata (name, symbol, address) from the Jupiter API using a token's mint address.

    # It requires the following parameters:
    # - mint: The mint address (`PublicKey`) of the token whose metadata needs to be retrieved.

    # Returns:
    # - A `JupiterTokenData` object containing the token's metadata if found.
    # - `None` if the token is not found in the API response.
    # """
    # )

    getTickerInformation: Literal["Required", "Not Required"] = Field(
        """Get ticker information for a specific symbol.

    It requires the following parameter:
    - ticker: The token's symbol (e.g., "SOL", "USDC", "BONK").
    
    Returns:
    dict: Ticker information for the specified symbol.
    """
    )

    transfer: Literal["Required", "Not Required"] = Field(
        """Transfers SOL or SPL tokens to a recipient.

        It requires the following parameters:
        - `to`: The recipient's public key (required).
        - `amount`: The amount to transfer (required).

        Returns:
        - A transaction signature as a string upon success.
        - Raises an error if the transaction fails.
        """
    )


class FinalReport(BaseModel):
    actionAnalysis: str = Field(
        """
Analyze the actions and describe what was ultimately achieved. Please do proper analysis of the tools response and tell the user what happened if action is not completed please tell about that also. Analysis should be in points instead of a paragraph. It should be string datatype only.
"""
    )

    finalResponse: str = Field(
        """
Based on the final summary, provide a clear response that confirms the completion of the request. It should be string only.
"""
    )


class AppState(TypedDict):

    messages: Annotated[List[AnyMessage], operator.add]
    reqdTools: List
    user_message: str
    actions_summary: dict
    result: str
    final_report: FinalReport
    publicKey: str