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

## Notes

- The application currently supports CSV files only
- Make sure your CSV files have a header row
- The application stores datasets in memory, so they will be cleared when the server restarts
- For production use, consider implementing proper database storage and security measures 
