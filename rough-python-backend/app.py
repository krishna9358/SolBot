from flask import Flask, request, jsonify
import asyncio
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain_core.messages import ToolMessage, HumanMessage, SystemMessage, AIMessage
from dotenv import load_dotenv
import os
from classes import AppState, FinalReport, toolsReqd
from langgraph.graph import StateGraph
from prompts import *
from tools import *
import inspect
from pydantic.v1 import Field
from flask_cors import CORS

load_dotenv(override=True)

app = Flask(__name__)

CORS(app)

# Initialize loop and global context
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)


llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY2"),
)

chat_histories = {}
x = 0


def get_required_tools(state: AppState):

    prompt_template = PromptTemplate(
        input_variables=["user_request"], template=reqdToolsPromptTemplate
    )
    if "messages" not in state.keys():
        state["messages"] = []
    user_message = state["user_message"]

    prompt = prompt_template.format(user_request=user_message)
    state["messages"].append(HumanMessage(prompt))

    structured_llm = llm.with_structured_output(toolsReqd)

    parsed_data = dict(structured_llm.invoke(state["messages"]))

    reqdTools = []

    for tool in (parsed_data).keys():
        if parsed_data[tool] == "Required":
            reqdTools.append(tool)

    print(f"\nRequired tools are: {reqdTools}\n")
    return {"reqdTools": reqdTools}


def call_tool_node(state: AppState):
    global x
    actions_dict = {}

    for tool in state["reqdTools"]:
        func_params = inspect.signature(tool_func_dict[tool]).parameters
        param_list = ""
        toolargs = {}
        for param in func_params.keys():
            if param == "publicKey":
                continue
            toolargs[param] = Field(
                f"It is a parameter of function {tool}. Name of parameter is {param} and its datatype is {func_params[param].annotation}. Please return None if that required value of that parameter is missing in user query or context."
            )
            param_list += f"{param}: {func_params[param].annotation}"

        class ToolArgs:
            toolArgs = toolargs
        print(ToolArgs)
        if (len(toolargs) != 0):
            structured_llm = llm.with_structured_output(ToolArgs)
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
                user_request=state["user_message"],
            )
            state["messages"].append(HumanMessage(prompt))
            output = structured_llm.invoke(state["messages"])
            print(f"\nExtracted tool args for tool {tool}: {output}\n")
            toolargs = {}
            for key, val in output.items():
                if val != "None":
                    print("obj: ", key, val)
                    toolargs[key] = val
            missing_params = check_missing(output, tool)
        else:
            missing_params = []
        print(toolargs)
        

        if len(missing_params):
            output_content = f"We cannot call this {tool} tool. Since some of the parameters were missing and cannot be parsed. list of mission params={missing_params}. Please re enter them in next message."
        else:
            toolargs["publicKey"] = state["publicKey"]
            print(toolargs)
            try:
                output = tool_func_dict[tool](**toolargs)  # Run until the task completes
                output_content = f"Output for call of {tool} tool: {output}"

            except Exception as e:
                output_content = (
                    f"Some error occured while calling {tool} tool. Error message: {e}"
                )

        print(output_content)

        state["messages"].append(
            ToolMessage(
                content=output_content,
                tool_call_id=x,
            )
        )
        actions_dict[tool] = output_content

        x += 1
    return {"actions_summary": actions_dict}


def final_response_node(state: AppState):
    sys_message = SystemMessage(content=final_system_template)
    final_prompt_template = PromptTemplate(
        input_variables=["user_query", "actions_summary"], template=final_template
    )

    prompt = final_prompt_template.format(
        user_query=state["user_message"], actions_summary=str(state["actions_summary"])
    )

    structured_llm = llm.with_structured_output(FinalReport)

    output = structured_llm.invoke(
        state["messages"] + [sys_message] + [HumanMessage(prompt)]
    )
    state["messages"].append(AIMessage(str(dict(output))))

    return {"result": output, "final_report": output}


graph = StateGraph(AppState)

graph.add_node("required_tools_extractor", get_required_tools)

graph.add_node("tool_caller", call_tool_node)

graph.add_node("final_response_node", final_response_node)

graph.set_entry_point("required_tools_extractor")

graph.add_edge("required_tools_extractor", "tool_caller")

graph.add_edge("tool_caller", "final_response_node")

graph.set_finish_point("final_response_node")


graph_app = graph.compile()
png_graph = graph_app.get_graph().draw_mermaid_png()


@app.route("/chat", methods=["POST"])
def chat_response():
    data = request.json
    chat_id = data["chat_id"]
    user_message = data["user_message"]
    print(chat_id, user_message)
    publicKey = data["publicKey"]
    state = AppState()
    if chat_id not in chat_histories.keys():
        state["user_message"] = user_message
        chat_histories[chat_id] = state

    state = chat_histories[chat_id]
    state["user_message"] = user_message
    state["publicKey"] = publicKey
    try:
        state = graph_app.invoke(state)

        return jsonify(
            {
                "response": state["final_report"].finalResponse,
                "action_analysis": state["final_report"].actionAnalysis,
            }
        )
    except Exception as e:
        template = PromptTemplate(
            input_variables=["ERROR_MESSAGE"], template=error_handler_template
        )
        prompt = template.format(ERROR_MESSAGE=repr(e))

        output = llm.invoke(prompt)
        final_response = output.content
        return jsonify({"response": final_response, "action_analysis": ""})


if __name__ == "__main__":
    app.run(debug=True, port=3003)