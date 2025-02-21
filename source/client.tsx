import { createRoot } from "react-dom/client";

function App() {
  return <div>Hello World</div>;
}

const root = createRoot(document.getElementById("root")!);

root.render(<App />);
