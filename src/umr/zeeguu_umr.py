import os
from flask import Flask, send_from_directory
from umr.login import endpoints_login
from umr import umrblue

app = Flask(__name__)
app.register_blueprint(endpoints_login)
app.register_blueprint(umrblue)
