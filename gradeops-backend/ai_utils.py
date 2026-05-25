import os
import re
from pypdf import PdfReader
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None

def extract_text_from_pdf(pdf_path: str) -> str:
    try:
        if not os.path.exists(pdf_path):
            return "Error: File path not found."
        reader = PdfReader(pdf_path)
        extracted_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"
        return extracted_text.strip() if extracted_text.strip() else "Empty PDF text nodes."
    except Exception as e:
        return f"Error extracting text: {str(e)}"

def generate_ai_grading(student_text: str):
    global client
    if not client or not GEMINI_API_KEY:
        return {"score": 0, "ai_feedback": "Configuration Error: GEMINI_API_KEY is missing."}
        
    try:
        system_instruction = (
            "You are an expert university professor grading engineering papers out of 100 maximum marks."
        )
        
        prompt = f"""
        Evaluate the following student submission out of 100 marks strictly using this breakdown:
        1. Conceptual Accuracy (Max 40 Marks)
        2. Technical Depth & Analysis (Max 40 Marks)
        3. Presentation & Academic Structure (Max 20 Marks)
        
        Student Submission Text:
        \"\"\"{student_text}\"\"\"
        
        Format your response precisely like this:
        Total Score: [number]
        
        Detailed Rubric Breakdown:
        - Conceptual Accuracy: [number]/40
        - Technical Depth: [number]/40
        - Presentation: [number]/20
        
        Constructive Feedback:
        [Write feedback here]
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.15
            )
        )
        
        output = response.text
        
        # Regex Parser: Total Score ke aage se number nikalne ke liye
        score = 0
        match = re.search(r"Total Score:\s*(\d+)", output)
        if match:
            score = int(match.group(1))
        else:
            # Fallback check agar text mein kahin bhi digit ho
            digit_match = re.search(r"\d+", output)
            if digit_match:
                score = int(digit_match.group(0))
                
        return {"score": score, "ai_feedback": output.strip()}
        
    except Exception as e:
        return {"score": 0, "ai_feedback": f"Gemini Runtime Error: {str(e)}"}