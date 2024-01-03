import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { createParser } from "eventsource-parser";

const SYS_MSG = "You are a virtual evaluator coding questions. Given a question, some code written by a student, and the programming language, your job is to determine whether the code correctly solves the question. If it's correct, simply reply \"CORRECT\". If it is incorrect, reply \"INCORRECT\" and in the next few lines, explain why the code is incorrect using bullet points without giving away the answer. Keep your explanations short.";
const API_URL = "https://api.openai.com/v1/chat/completions"
export default function Home() {
  const [userMsg, setUserMsg] = useState("");
  const [problem, setProblem] = useState("");
  const [code, setCode] = useState("");
  const [key, setKey] = useState("");
  const [messages, setMessages] = useState([
    { role: "system", content: SYS_MSG },
  ]);

  const firstcall = () => {
    const newMsg = `QUESTION: ${problem}
    CODE: ${code}`;
    sendReq(newMsg);
  };

  async function sendReq(userMsg) {
    const updatedMsg = [
      ...messages,
      { role: "user", content: userMsg },
    ];

    setMessages(updatedMsg)
    setUserMsg("")
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + key,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: updatedMsg,
          stream: true,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message);
      }
      const reader = response.body.getReader();

      let newMsg = "";
      const parser = createParser((event) => {
        if (event.type === "event") {
          const data = event.data;
          if (data === "[DONE]") {
            return;
          }
          const json = JSON.parse(event.data);
          const content = json.choices[0].delta.content;

          if (!content) {
            return;
          }
          newMsg += content;

          setMessages([
            ...updatedMsg,
            { role: 'assistant', content: newMsg },
          ]);
        } else {
          return "";
        }
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        parser.feed(text);
      }
    } catch (error) {
      console.error(error);
      window.alert("Error: Invalid API key");
    }
  }

  return (
    <div>
      <div className="max-w-3xl mx-auto w-full text-center py-6">
        <h1 className="text-4xl text-gray-800 font-semibold">
          LeetCode Assistant
        </h1>
        <div className="text-xl text-gray-400 mt-2">
          Your personal programming coach powered by ChatGPT. Just share your
          solution and get instant feedback on what is going wrong.
        </div>
        <div className="">
          <input type="password"
            className="border p-1 rounded mt-5"
            onChange={(e) => setKey(e.target.value)}
            value={key}
            placeholder="API Key here" />
        </div>
      </div>

      {/* Message History */}
      {messages.length > 1 && (<>
        <div className="flex-1 overflow-y-scroll">
          <div className="w-full max-w-screen-md mx-auto p-4">
            {messages
              .filter((msg) => msg.role !== "system")
              .map((msg, idx) => (
                <div key={idx} className="mt-3">
                  <div className="font-bold">
                    {msg.role === "user" ? "You 🤔" : "AI 😏"}
                  </div>
                  <div className="text-lg prose"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                </div>
              ))}
          </div>
        </div>

        <div className="">
          <div className="w-full max-w-screen-md mx-auto flex px-4 pb-4 p-3">
            <textarea
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              className="Border text-lg ronded-md p-1 flex-1 bg-gray-100"
              rows={1}
              placeholder="Still any doubts......"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  sendReq(userMsg);
                }
              }}
            />

            {/* Send Button */}
            <button
              onClick={() => sendReq(userMsg)}
              className="bg-blue-500 hover:bg-blue-600 border rounded-md text-white text-lg w-22 p-2 ml-2">
              Ask 🚀
            </button>
          </div>
        </div>
      </>)}

      {messages.length <= 1 && (<><div className="max-w-4xl w-full mx-auto px-4">
        <div className="flex flex-col mb-4">
          <label className="font-medium">Problem Statement</label>
          <textarea
            placeholder="Paste the problem statement here"
            className="border rounded p-2 mt-1"
            rows={5}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
          ></textarea>
        </div>

        <div className="flex flex-col mb-4">
          <label className="font-medium">Your Code</label>
          <textarea
            placeholder="Paste your code here"
            className="border rounded p-2 mt-1 font-mono"
            rows={5}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          ></textarea>
        </div>

        <button
          onClick={firstcall}
          className="w-20 border border-blue-600 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded p-2 font-medium"
        >Find Error</button>
      </div>
      </>)}
    </div>
  );
}
