import {useState} from "react";

export default function Home() {
  const [result, setResult] = useState("");
  const [problem, setProblem] = useState("");
  const [code, setCode] = useState("");
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

      <div className="max-w-4xl w-full mx-auto px-4">
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
          onClick={sendReq}
          className="w-20 border border-blue-600 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded p-2 font-medium"
        >
          Submit
        </button>
      </div>

      {result && (
        <div className="max-w-4xl w-full mx-auto p-4 flex flex-col">
          <label className="font-medium">Assessment</label>
          <div className="text-lg whitespace-pre-wrap ">{result}</div>
        </div>
      )}
    </div>
  );
}
