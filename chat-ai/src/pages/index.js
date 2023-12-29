import { useState } from "react";

const SYSTEM_MSG = "You are a helpful and versatile 100X AI created by Sangwan";

export default function Main() {
  const [key, setKey] = useState("");
  const API_URL = "https://api.openai.com/v1/chat/completions"
  const [aiMessage, setAiMessage] = useState("");
  const [userMsg, setUserMsg] = useState("");

  async function sendReq() {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + key,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {role : "system", content : SYSTEM_MSG},
          { role: "user", content: "Hello!" }, 
        ],
      }),
    });
    const respJson = await response.json();
    console.log(respJson);

    setAiMessage(respJson.choices[0].message.content);
  }

  return <div className="flex flex-col h-screen ">
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

    {/* Message History */}
    <div className="flex-1">
      <div className="w-full max-w-screen-md mx-auto">
        Message History
      </div>
    </div>

    {/* Input Box */}
    <div className="">
      <div className="w-full max-w-screen-md mx-auto flex px-4 pb-4">
        <textarea 
        value = {userMsg}
        onChange={(e) => setUserMsg(e.target.value)}
        className="Border text-lg ronded-md p-1 flex-1 rows={1}"/>
        <button className="bg-blue-500 hover:bg-blue-600 border rounded-md text-white text-lg w-20 p-2 ml-2">
          Send
        </button>
      </div>
    </div>
  </div>
}