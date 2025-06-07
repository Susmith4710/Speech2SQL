# Natural Language to SQL Converter

This application allows users to upload CSV datasets and query them using natural language. The application uses OpenAI's GPT-3.5 to convert natural language queries into SQL and executes them on the uploaded datasets.

## Features

- Upload CSV datasets
- Query datasets using natural language
- View generated SQL queries
- See query results in a formatted table
- Modern, responsive UI

## Setup

1. Clone this repository
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Run the Flask application:
   ```bash
   python app.py
   ```
5. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Upload a CSV dataset using the "Choose File" button
2. Select the uploaded dataset from the dropdown menu
3. Speak or type your question in natural language (e.g., "Show me all users who are older than 30")
4. Click "Convert to SQL" to see the generated SQL query and results

## Example Queries

- "Show me all records where age is greater than 25"
- "What is the average salary by department?"
- "List the top 5 highest paid employees"
- "How many customers are from each country?"

## Example: Why This App Is Better Than Direct ChatGPT SQL

Below are two screenshots showing the results of asking the same question in both this application and directly in ChatGPT.

### 1. Our Application (Correct Result)

<img width="1204" alt="image" src="https://github.com/user-attachments/assets/f6737728-9557-4ecf-b797-e6710d854d95" />


- **Question:** list the oldest person name and his birth date
- **Generated SQL:**  
  ```sql
  SELECT "First Name", "Last Name", "Date of birth"
  FROM df
  ORDER BY "Date of birth" ASC
  LIMIT 1;
  ```
- **Result:**  
  The app correctly finds the oldest person in the uploaded dataset (`people-100.csv`):  
  - **Date of birth:** 1908-08-22  
  - **First Name:** Dustin  
  - **Last Name:** Bailey

---

### 2. ChatGPT Direct SQL (Incorrect Result)

<img width="1180" alt="image" src="https://github.com/user-attachments/assets/1b41206f-88f0-4daf-8f05-358b92ad27a3" />

- **Question:** List the oldest person's name and birth date
- **Generated SQL:**  
  ```sql
  SELECT "First Name", "Last Name", "Date of birth" FROM people ORDER BY "Date of birth" ASC LIMIT 1;
  ```
- **Result:**  
  ChatGPT generates a SQL query for a table named `people`, which may not match your actual dataset/table name. The sample answer it provides is:
  - **First Name:** Phillip  
  - **Last Name:** Summers  
  - **Date of birth:** 1910-03-24

---

### **Why the Difference?**

- **Our Application** uses your actual uploaded data and dynamically adapts the SQL to the real table/column names, ensuring the answer is always correct for your dataset.
- **ChatGPT** generates a generic SQL query and a sample answer, but it does not have access to your real data, so its answer may be incorrect or based on assumptions.

---

**Conclusion:**  
This app bridges the gap between natural language and real, accurate SQL results on your own data—something ChatGPT alone cannot do!

## Notes
- The application currently supports CSV files only
- Make sure your CSV files have a header row
- The application stores datasets in memory, so they will be cleared when the server restarts
- For production use, consider implementing proper database storage and security measures 
