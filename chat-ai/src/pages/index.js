import Head from "next/head";
import { useState } from "react";
import ReactMarkdown from "react-markdown"

const SYSTEM_MSG = "You are a helpful and versatile 100X AI created by Sangwan";
const API_URL = "https://api.openai.com/v1/chat/completions"

export default function Main() {
  const [key, setKey] = useState("");
  const [userMsg, setUserMsg] = useState("");
  const [messages, setMessages] = useState([
    { role: "system", content: SYSTEM_MSG },
  ]);

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
        }),
      });
      const respJson = await response.json();
      // console.log(respJson);

      setMessages([...updatedMsg, respJson.choices[0].message]);
    } catch (error) {
      console.error("error");
      window.alert("Error: " + error.meassage)
    }
  }

  return (
    <>
      <Head>
        <title>100X ai</title></Head>
      <div className="flex flex-col h-screen ">
        {/* Nav bar */}
        <nav className="shadow px-4 py-2 flex flex-row justify-between items-center bg-white">
          <div className="text-2xl font-bold">Title</div>
          <div className="">
            <input type="password"
              className="border p-1 rounded"
              onChange={(e) => setKey(e.target.value)}
              value={key}
              placeholder="API Key here" />
          </div>
        </nav>

        {/* Messages History Box*/}
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

        {/* Input Box */}
        <div className="">
          <div className="w-full max-w-screen-md mx-auto flex px-4 pb-4 p-3">
            <textarea
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              className="Border text-lg ronded-md p-1 flex-1 bg-gray-100" 
              rows={1} 
              placeholder="Heyy how you doin......"/>

            {/* Send Button */}
            <button
              onClick={sendReq}
              className="bg-blue-500 hover:bg-blue-600 border rounded-md text-white text-lg w-22 p-2 ml-2">
              Send🚀
            </button>
          </div>
        </div>
      </div>
    </>
  )
}