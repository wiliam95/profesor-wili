// scripts/mockServer.ts - Mock SSE Server for Development

const MOCK_RESPONSES = [
    "I can help you with that! Let me think about the best approach...",
    "Here's a solution that should work for your use case:",
    "That's a great question! Based on my analysis...",
];

const MOCK_CODE = `
\`\`\`typescript
function greet(name: string): string {
  return "Hello, " + name + "! Welcome to Claude AI.";
}
console.log(greet("User"));
\`\`\`
`;

interface MockMessage {
    role: string;
    content: string;
}

function generateMockResponse(messages: MockMessage[]): string {
    const lastMessage = messages[messages.length - 1]?.content || "";
    const baseResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];

    if (lastMessage.toLowerCase().includes("code")) {
        return baseResponse + "\n\n" + MOCK_CODE;
    }

    return baseResponse + "\n\nThis is a mock response for development.";
}

function streamResponse(
    response: string,
    callback: (chunk: string) => void,
    onComplete: () => void
): void {
    const words = response.split(" ");
    let index = 0;

    const interval = setInterval(() => {
        if (index < words.length) {
            callback(words[index] + " ");
            index++;
        } else {
            clearInterval(interval);
            onComplete();
        }
    }, 50);
}

async function createMockServer(port: number = 3001): Promise<void> {
    console.log("WILI AI Mock Server");
    console.log("This is a development mock server for testing SSE streaming");
    console.log("API Endpoint: http://localhost:" + port + "/api/chat");
    console.log("Mock server would start on port " + port);
}

export { generateMockResponse, streamResponse, createMockServer };
