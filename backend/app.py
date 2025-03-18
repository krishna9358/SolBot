from flask import Flask, request, jsonify
import asyncio
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain_core.messages import ToolMessage, HumanMessage, SystemMessage, AIMessage
from dotenv import load_dotenv
from langgraph.graph import StateGraph
import os
from classes import AppState, FinalReport, toolsReqd
from prompts import *
from tools import *
import inspect
from agentipy import SolanaAgentKit
from flask_cors import CORS

load_dotenv(override=True)

app = Flask(__name__)
CORS(app)
# Initialize loop and global context
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

solana_agent = SolanaAgentKit(
    private_key=os.getenv("SOL_PRIVATE_KEY"),
    rpc_url="https://api.devnet.solana.com",
)

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY5"),
)

chat_histories = {}
x = 0


@app.route("/chat", methods=["POST"])
def chat_response():
    global x

    data = request.json
    chat_id = data["chat_id"]
    user_message = data["user_message"]

    if chat_id not in chat_histories:
        chat_histories[chat_id] = AppState(messages=[])

    state = chat_histories[chat_id]
    state["user_message"] = user_message

    # Required tools extraction
    prompt_template = PromptTemplate(
        input_variables=["user_request"], template=reqdToolsPromptTemplate
    )
    prompt = prompt_template.format(user_request=user_message)
    state["messages"].append(HumanMessage(prompt))
    structured_llm = llm.with_structured_output(toolsReqd)
    parsed_data = dict(structured_llm.invoke(state["messages"]))

    reqdTools = [tool for tool, status in parsed_data.items() if status == "Required"]

    # Tool calling
    actions_summary = {}
    for tool in reqdTools:
        func_params = inspect.signature(tool_func_dict[tool]).parameters
        toolargs = {}
        param_list = ""

        for param in func_params.keys():
            if param == "solana_agent":
                continue
            param_list += f"{param}: {func_params[param].annotation}, "

        prompt_template = PromptTemplate(
            input_variables=[
                "function_name",
                "function_use",
                "parameter_list",
                "user_request",
            ],
            template=toolCallPrompt,
        )
        prompt = prompt_template.format(
            function_name=tool,
            function_use=tool_func_dict[tool].__doc__,
            parameter_list=param_list,
            user_request=user_message,
        )
        state["messages"].append(HumanMessage(prompt))

        ToolArgs = type("ToolArgs", (), {param: None for param in func_params})
        structured_llm = llm.with_structured_output(ToolArgs)
        output = structured_llm.invoke(state["messages"])

        toolargs = {key: val for key, val in output.items() if val != "None"}
        toolargs["solana_agent"] = solana_agent

        try:
            task = loop.create_task(tool_func_dict[tool](**toolargs))
            tool_output = loop.run_until_complete(task)
            output_content = f"Output for {tool}: {tool_output}"
        except Exception as e:
            output_content = f"Error calling {tool}: {e}"

        state["messages"].append(ToolMessage(content=output_content, tool_call_id=x))
        actions_summary[tool] = output_content
        x += 1

    # Final response generation
    sys_message = SystemMessage(content=final_system_template)
    final_prompt_template = PromptTemplate(
        input_variables=["user_query", "actions_summary"], template=final_template
    )
    prompt = final_prompt_template.format(
        user_query=user_message, actions_summary=str(actions_summary)
    )

    structured_llm = llm.with_structured_output(FinalReport)
    output = structured_llm.invoke(
        state["messages"] + [sys_message] + [HumanMessage(prompt)]
    )

    state["messages"].append(AIMessage(str(dict(output))))

    return jsonify(
        {"response": output.finalResponse, "action_analysis": output.actionAnalysis}
    )


if __name__ == "__main__":
    app.run(debug=True, port=5002)