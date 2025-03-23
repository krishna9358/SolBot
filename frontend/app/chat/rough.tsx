import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";



// 1. Define the Structured Output Parser
const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
    final_result: "The final conclusion or result derived from analyzing the logs.",
    action_analysis: "A list of actions or steps identified from the logs, indicating what happened.",
},
    // `
    // You will be given logs as input. Your task is to analyze these logs and identify:
    // - The final result or conclusion of the process described in the logs. This should be a concise string summarizing the outcome.
    // - A list of actions or steps that occurred according to the logs. Each item in the list should be a string describing a significant action taken.
    // Format your response as a JSON object with the following keys:
    // \`final_result\`: string, representing the final result.
    // \`action_analysis\`: list of strings, representing the list of actions.
    // `
);

const chain = RunnableSequence.from([
    PromptTemplate.fromTemplate(
      "Answer the users question as best as possible.\n{format_instructions}\n{question}"
    ),
    new OpenAI({ temperature: 0 }),
    outputParser,
  ]);

// 2. Create a Prompt Template
// const promptTemplate = new PromptTemplate({
//     template: `
// Analyze the following logs and provide a structured output containing the final result and a list of actions taken.

// Logs:
// \`\`\`
// {logs}
// \`\`\`

// {format_instructions}

// `,
//     inputVariables: ["logs"],
//     partialVariables: { format_instructions: outputParser.getFormatInstructions() },
// });

const response = await chain.invoke({
    question: "What is the capital of France?",
    format_instructions: outputParser.getFormatInstructions(),
  });

// // 5. Function to process logs and get structured output
// async function analyzeLogs(logs: string) {
//     try {
//         const structuredOutput = await chain.invoke({
//             logs: logs,
//         });
//         return structuredOutput;
//     } catch (error) {
//         console.error("Error processing logs:", error);
//         if (error.output) {
//             console.error("LLM Output causing error:", error.output);
//         }
//         if (error.llmOutput) {
//             console.error("Raw LLM Output:", error.llmOutput);
//         }
//         if (error.parsedOutput) {
//              console.error("Partially Parsed Output (if available):", error.parsedOutput);
//         }
//         return {
//             final_result: "Error during log analysis.",
//             action_analysis: ["Failed to extract actions due to error."],
//             error: error.message || "Unknown error" // Include error message for debugging
//         };
//     }
// }

// 6. Example Usage
// async function main() {
//     const exampleLogs = `
// [INFO] 2023-10-27 10:00:00 - User logged in successfully. User ID: user123
// [INFO] 2023-10-27 10:00:05 - Initiating data processing task. Task ID: task456
// [INFO] 2023-10-27 10:00:10 - Data loaded from database.
// [INFO] 2023-10-27 10:00:15 - Applying transformation logic.
// [INFO] 2023-10-27 10:00:25 - Data transformation completed successfully.
// [INFO] 2023-10-27 10:00:30 - Saving processed data to storage.
// [INFO] 2023-10-27 10:00:35 - Data saved successfully.
// [INFO] 2023-10-27 10:00:40 - Data processing task completed. Task ID: task456, Status: SUCCESS
//     `;

//     const structuredResult = await analyzeLogs(exampleLogs);
//     console.log("Structured Output:");
//     console.log(structuredResult);

//     const errorLogs = `
// [ERROR] 2023-10-27 11:00:00 - Database connection failed.
// [ERROR] 2023-10-27 11:00:05 - Data loading failed.
// [ERROR] 2023-10-27 11:00:10 - Data processing task failed. Task ID: task789, Status: FAILURE
//     `;

//     const errorResult = await analyzeLogs(errorLogs);
//     console.log("\nStructured Output for Error Logs:");
//     console.log(errorResult);
// }

main();