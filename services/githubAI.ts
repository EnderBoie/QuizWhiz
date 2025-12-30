import { Question, QuestionType } from '../types';

interface AIResponse {
  title: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    timeLimit: number;
  }[];
}

export const generateQuizWithGitHub = async (
  token: string, 
  topic: string, 
  difficulty: string, 
  count: number,
  quizType: string = 'mixed'
): Promise<{ title: string, questions: Question[] }> => {
  const endpoint = "https://models.github.ai/inference/chat/completions";
  
  // Using "gpt-4o-mini"
  const model = "gpt-4o-mini"; 

  let typeConstraint = "";
  if (quizType === 'true-false') {
    typeConstraint = `Create ONLY True/False questions. 
    The "options" array must be exactly ["True", "False"]. 
    "correctAnswer" must be 0 (for True) or 1 (for False).`;
  } else if (quizType === 'multiple-choice') {
    typeConstraint = `Create ONLY Multiple Choice questions. 
    The "options" array must contain exactly 4 distinct strings.`;
  } else {
    typeConstraint = `Create a mix of Multiple Choice and True/False questions.
    For Multiple Choice: "options" must have 4 strings.
    For True/False: "options" must be ["True", "False"].`;
  }

  const systemPrompt = `You are a helpful quiz generator for a quiz app. 
  Generate a valid JSON object representing a quiz. 
  The JSON must follow this structure strictly:
  {
    "title": "A catchy title for the quiz",
    "questions": [
      {
        "question": "The question text",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": 0, // An integer 0-3 indicating the correct option index
        "timeLimit": 20 // Integer seconds
      }
    ]
  }
  ${typeConstraint}
  
  CRITICAL INSTRUCTION: You MUST randomize the position of the correct answer for Multiple Choice questions. 
  The "correctAnswer" index MUST vary between 0, 1, 2, and 3 across the questions. 
  Do NOT always set the correct answer to 0 (the first option).
  
  Ensure the JSON is valid and minified. Do not include markdown formatting (like \`\`\`json).`;

  const userPrompt = `Generate a ${difficulty} difficulty quiz about "${topic}" with ${count} questions.`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: model,
        temperature: 0.9 // Increased temperature for better randomization
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized (401). Please check that your token is valid, has the 'models' permission, and that your account has access to the GitHub Models Public Beta.");
      }

      const errorText = await response.text();
      // Try to extract a clean error message from the response
      try {
        const jsonError = JSON.parse(errorText);
        const msg = jsonError.error?.message || jsonError.message || errorText;
        throw new Error(`GitHub API Error: ${msg}`);
      } catch (e) {
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Clean up content if it contains markdown code blocks
    const cleanContent = content.replace(/```json\n?|```/g, '').trim();
    
    let parsedData: AIResponse;
    try {
        parsedData = JSON.parse(cleanContent);
    } catch (e) {
        console.error("Failed to parse JSON content:", cleanContent);
        throw new Error("AI returned invalid JSON. Please try again.");
    }

    if (!parsedData || !Array.isArray(parsedData.questions)) {
         throw new Error("AI response missing questions array.");
    }

    // Map to application Question type
    const questions: Question[] = parsedData.questions.map(q => {
      let type: QuestionType = 'multiple-choice';
      let options = q.options || [];

      // Detect True/False based on options
      const isTF = options.length === 2 && 
                   options.some(o => o.toLowerCase().includes('true')) && 
                   options.some(o => o.toLowerCase().includes('false'));
      
      if (isTF) {
        type = 'true-false';
        options = ['True', 'False']; // Normalize
      } else {
        // Ensure 4 options for MC if strictly MC, pad if necessary (though AI should handle it)
        options = options.slice(0, 4);
        while (options.length < 4) {
           options.push("-");
        }
      }

      return {
        question: q.question || "Untitled Question",
        image: '', 
        type: type,
        options: options,
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        timeLimit: q.timeLimit || 20
      };
    });

    return {
      title: parsedData.title || "Generated Quiz",
      questions
    };
    
  } catch (error) {
    console.error("AI Request Failed:", error);
    throw error;
  }
};