from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import openai
import pandas as pd
import os
from dotenv import load_dotenv
import json
import pandasql

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static')
CORS(app)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# Store uploaded datasets in memory (in production, use a proper database)
datasets = {}

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/upload', methods=['POST'])
def upload_dataset():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        # Try reading with utf-8, fallback to latin1 if it fails
        try:
            df = pd.read_csv(file)
        except UnicodeDecodeError:
            file.seek(0)
            df = pd.read_csv(file, encoding='latin1')
        dataset_name = file.filename
        datasets[dataset_name] = df
        
        # Get column information
        columns = df.columns.tolist()
        sample_data = df.head(5).to_dict('records')
        
        print(f"Dataset uploaded: {dataset_name}")
        print(f"Available datasets: {list(datasets.keys())}")
        
        return jsonify({
            'message': 'Dataset uploaded successfully',
            'dataset_name': dataset_name,
            'columns': columns,
            'sample_data': sample_data
        })
    except Exception as e:
        print(f"Error uploading dataset: {str(e)}")
        return jsonify({'error': f'Error reading CSV: {str(e)}'}), 400

@app.route('/query', methods=['POST'])
def process_query():
    data = request.json
    query = data.get('query')
    dataset_name = data.get('dataset_name')
    
    if not query or not dataset_name:
        return jsonify({'error': 'Missing query or dataset name'}), 400
    
    if dataset_name not in datasets:
        return jsonify({'error': 'Dataset not found'}), 404
    
    df = datasets[dataset_name]
    
    # Ensure DataFrame is properly formatted
    try:
        # Convert any non-string columns to string to avoid SQL issues
        for col in df.columns:
            if df[col].dtype == 'object':
                df[col] = df[col].astype(str)
        
        # Prepare context for OpenAI
        columns = df.columns.tolist()
        sample_data = df.head(5).to_dict('records')
        
        # Create prompt for OpenAI
        prompt = f"""You are an expert in translating natural language to SQL for SQLite databases. 
        Only use the table named 'df' and only the columns provided below. 
        Do NOT reference information_schema, system tables, or any tables other than 'df'.
        The SQL must be compatible with SQLite and pandasql.
        
        Columns: {columns}
        Sample data: {json.dumps(sample_data)}
        
        Convert this natural language query to a SQLite-compatible SQL query on the table 'df':
        {query}
        
        Return only the SQL query without any explanation, and do not wrap it in code blocks."""
        
        try:
            # Get SQL query from OpenAI (new API)
            client = openai.OpenAI()
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a SQL expert. Convert natural language queries to SQL."},
                    {"role": "user", "content": prompt}
                ]
            )
            sql_query = response.choices[0].message.content.strip()
            
            # Remove code block markers if present
            if sql_query.startswith('```'):
                sql_query = sql_query.strip('`').replace('sql', '', 1).strip()
                if sql_query.startswith('\n'):
                    sql_query = sql_query[1:]
                if sql_query.endswith('```'):
                    sql_query = sql_query[:-3].strip()
            
            # Execute the query on the pandas DataFrame using pandasql
            try:
                result = pandasql.sqldf(sql_query, {"df": df})
                return jsonify({
                    'sql_query': sql_query,
                    'result': result.to_dict('records')
                })
            except Exception as e:
                return jsonify({
                    'error': f'Error executing SQL query: {str(e)}',
                    'sql_query': sql_query
                }), 400
                
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': f'Error processing dataset: {str(e)}'}), 400

@app.route('/datasets', methods=['GET'])
def list_datasets():
    return jsonify({
        'datasets': list(datasets.keys())
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001) 