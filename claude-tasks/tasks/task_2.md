DO THESE MODIFICATIONS. GO TO THE FILES LISTED AND EXECUTE THE TASK(S) ASSIGNED.

We will update the login mutation to gracefully handle non-JSON error responses from the server.

*   **File to Edit:** `C:\Users\Administrator\Documents\SSDI\client\src\pages\login.tsx`

*   **Instructions:**
    Locate the `loginMutation` and modify its `mutationFn`. We will add a `try...catch` block to handle cases where the error response from the server is not valid JSON.

```typescript
// ...
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        let errorMessage = "An unknown error occurred during login.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || "Login failed.";
        } catch (e) {
          errorMessage = "The server returned an unexpected response. Please try again later.";
          console.error("Failed to parse login error response as JSON. Status:", response.status);
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    },
    onSuccess: () => {
// ...
```

*   **Summary of Change:**
    The updated `mutationFn` now attempts to parse an error response as JSON. If that fails (e.g., the response is HTML), it throws a generic, user-friendly error message instead of crashing or displaying a raw parsing error. This makes the login process more robust.
INSTRUCTIONS FOR CLAUDE (Non-Interactive Execution):
The task described above is a single, complete unit of work.
1.  Complete ALL parts of the task as described.
2.  If this task involves generating code or a specific file output as its primary result:
    a.  You MUST first read the current contents of 'output.txt' in the current working directory (if it exists). The content you read from it should not alter your primary task output unless explicitly stated in the task description.
    b.  Then, you MUST save your primary output to this 'output.txt' file, overwriting its previous content.
3.  Execute this task non-interactively. Do not ask for permissions or confirmation to execute any part of it, including shell commands or file modifications.
4.  Upon successful completion of all aspects of this task (including reading and then saving 'output.txt' if applicable), and only then, respond with the exact string "<task_completion_signal>Task Complete</task_completion_signal>" on a new line and nothing else. Do not add any other text, explanation, or formatting before or after "<task_completion_signal>Task Complete</task_completion_signal>".
5.  If you encounter an irrecoverable error that prevents you from completing the task as described, provide a concise error message explaining the failure instead of "<task_completion_signal>Task Complete</task_completion_signal>".

<critical_instructions>
- Ensure all todos are completed *before* writing to 'output.txt'.
- Reading 'output.txt' before writing to it is a mandatory step if file output is required.
- Always put the "<task_completion_signal>Task Complete</task_completion_signal>" on its own line in the terminal output. Never add any other text, explanation, grammar, or formatting before or after this signal.
- Under no circumstances modify any existing functionality, code, or behavior outside the scope of the task description unless explicitly instructed otherwise.
- Under no circumstances will you add any truncated "..." or "..", or any other truncation indicators, to your output, or any "Sample", "Example", "Simulated", or "Simulated Example" text - unless explicitly instructed within the task description.
</critical_instructions>


---
<task_completion_signal>Task Complete</task_completion_signal>
