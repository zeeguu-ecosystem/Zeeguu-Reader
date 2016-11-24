from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_zeeguu():
    return 'Hello, Zeeguu core!'

