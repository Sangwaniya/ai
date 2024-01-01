import Head from "next/head";
import { useState} from "react";
import ReactMarkdown from "react-markdown"
import { createParser } from "eventsource-parser";

// const SYSTEM_MSG = "You are 100X AI created by Sangwan as an AI-powered study companion designed to help students reinforce their understanding of a subject by presenting them with multiple-choice questions. The subject and difficulty level will be provided to you, and you should respond with a single multiple-choice question. The student will then reply with their answer, which could be a single character indicating the selected option or the full answer. If the answer is incorrect, kindly inform the student that the answer is incorrect, and encourage them to try again. Do not reveal the correct answer or provide any explanation until the student has answered the question correctly. If the answer is correct, congratulate the student, provide a brief explanation to reinforce their understanding, and then present a new multiple-choice question on the same subject. Remember to keep the questions fresh and adjust the difficulty based on the provided level. Your goal is to make learning interactive, engaging, and fun while challenging the student’s knowledge.";
const SYSTEM_MSG = "You’re an AI study buddy. Generate multiple-choice question based on a given subject and difficulty. If a student answers incorrectly, prompt them to try again without revealing the answer. If they answer correctly, provide a brief explanation and ask a new question. The student can respond with either the letter of the correct option or the full answer. You then provide feedback based on their response. Remember to keep the questions fresh and adjust the difficulty as needed. Your goal is to make learning interactive and fun while challenging the student’s knowledge."
const API_URL = "https://api.openai.com/v1/chat/completions"

export default function Main() {
  const [key, setKey] = useState("");
  const [lang, setLang] = useState("")
  const [difficulty, setDifficulty] = useState('easy');
  const [userMsg, setUserMsg] = useState("");
  const [messages, setMessages] = useState([
    { role: "system", content: SYSTEM_MSG },
  ]);

  const firstcall = () => {
    setUserMsg(`Language: ${lang}, Difficulty level: ${difficulty}`);
    sendReq();
  };

  async function sendReq() {
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
    <>
      <Head>
        <title>100X ai</title></Head>
      <div className="flex flex-col h-screen ">
        {/* Nav bar */}
        <nav className="shadow px-4 py-2 flex flex-row justify-between items-center bg-white">
          <div className="text-2xl font-bold">100 X Devs</div>
          <div className="">
            <input type="password"
              className="border p-1 rounded"
              onChange={(e) => setKey(e.target.value)}
              value={key}
              placeholder="API Key here" />
          </div>
        </nav>

        {messages.length <= 1 && (
          <div className="w-full max-w-screen-md mx-auto flex flex-col items-center px-1 p-5 mt-10">
            <h1 className="text-2xl font-bold mb-4">Let's Test Your Knowledge</h1>
            <textarea
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="Border text-lg ronded-md p-1 flex-1 bg-gray-100 mt-8"
              rows={1}
              placeholder="Give me a topic to test your knowledge......"
            />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="mt-4 p-5"
            >
              <option value="easy">Easy</option>
              <option value="mid">Mid</option>
              <option value="hard">Hard</option>
            </select>

            <button
              onClick={firstcall}
              className="bg-blue-500 hover:bg-blue-600 border rounded-md text-white text-lg w-22 p-2 ml-5">
              Let's Start🚀
            </button>
          </div>
        )}
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
              placeholder="Heyy how you doin......"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  sendReq();
                }
              }}
            />

            {/* Send Button */}
            <button
              onClick={sendReq}
              className="bg-blue-500 hover:bg-blue-600 border rounded-md text-white text-lg w-22 p-2 ml-2">
              Send Ans🚀
            </button>
          </div>
        </div>
        </>)}
      </div>
    </>
  )
}