from flask import Blueprint

reader_blueprint = Blueprint('reader_blueprint', __name__,
                             template_folder='templates',
                             static_folder='static')

print (" == created reader_blueprint...")

