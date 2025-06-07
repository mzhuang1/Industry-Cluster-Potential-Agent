// Service for direct interaction with OpenAI API
// This is used when we want to bypass our backend and call OpenAI directly

// OpenAI API configuration
const OPENAI_API_KEY = "sk-None-CrxZrBTzpsTdBRiwHRxbT3BlbkFJOfpGRnEKRaujnsmOk5FO"; // This should be replaced with a proper API key
const OPENAI_ORG_ID = "org-7FByIq8yjdv2kNGXU6Sign2E";
const OPENAI_API_BASE = "https://api.openai.com/v1";

// Export service object with methods
export const OpenAIService = {
  // Send a message to OpenAI API
  sendMessage: async (message: string, model: string = "gpt-4"): Promise<string> => {
    try {
      // Create request body according to OpenAI API specs
      const requestBody = {
        model: model,
        messages: [
          { role: "system", content: "You are an assistant for industrial cluster analysis." },
          { role: "user", content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      };

      // Make API request
      const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Organization': OPENAI_ORG_ID
        },
        body: JSON.stringify(requestBody)
      });

      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("OpenAI API error:", errorData);
        throw new Error(`OpenAI API returned error: ${response.status} ${response.statusText}`);
      }

      // Parse response
      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error("Error communicating with OpenAI API:", error);
      
      // For network errors (like failed to fetch), provide a more specific error message
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error("网络连接失败，无法连接到OpenAI API服务器");
      }
      
      // Return a generic error message that can be displayed to the user
      throw new Error("与OpenAI API通信时出错，请稍后再试");
    }
  },

  // Check if the OpenAI API is accessible
  checkAvailability: async (): Promise<boolean> => {
    try {
      // Make a simple request to the OpenAI API to check if it's accessible
      const response = await fetch(`${OPENAI_API_BASE}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Organization': OPENAI_ORG_ID
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error("Error checking OpenAI API availability:", error);
      return false;
    }
  }
};